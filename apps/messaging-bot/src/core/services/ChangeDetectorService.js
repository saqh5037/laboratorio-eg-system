const { botPool, labsisPool } = require('../../db/pool');
const logger = require('../../utils/logger');
const NotificationService = require('./NotificationService');
const MultiChannelNotificationService = require('./MultiChannelNotificationService');

/**
 * ChangeDetectorService - Detector de cambios en Órdenes de Trabajo
 *
 * Detecta automáticamente cuando:
 * 1. Una orden es pagada (factura_id se asigna)
 * 2. Los resultados están validados (status_id = 4)
 *
 * Y envía notificaciones automáticas a los pacientes
 */
class ChangeDetectorService {
  constructor() {
    this.isRunning = false;
    this.lastCheckTime = null;
    this.lastPollingTime = null;
    this.intervalId = null;
    this.CHECK_INTERVAL_MS = 5000; // 5 segundos (para procesar cola)
    this.POLLING_INTERVAL_MS = 60000; // 60 segundos (backup polling)
    this.BATCH_SIZE = 20; // Procesar hasta 20 notificaciones por ciclo
  }

  /**
   * Iniciar detector de cambios
   */
  start() {
    if (this.isRunning) {
      logger.warn('⚠️  ChangeDetector ya está en ejecución');
      return;
    }

    this.isRunning = true;
    this.lastCheckTime = new Date();
    this.lastPollingTime = new Date();

    logger.info('🔍 ChangeDetector iniciado - Cola: 5s, Polling backup: 60s');

    // Ejecutar inmediatamente
    this.checkChanges();

    // Configurar intervalo
    this.intervalId = setInterval(() => {
      this.checkChanges();
    }, this.CHECK_INTERVAL_MS);
  }

  /**
   * Detener detector de cambios
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isRunning = false;
    logger.info('🛑 ChangeDetector detenido');
  }

  /**
   * Verificar cambios en órdenes de trabajo
   */
  async checkChanges() {
    try {
      const startTime = new Date();

      // 1. PRIORIDAD: Procesar cola de notificaciones (cada 5 segundos)
      await this.processNotificationQueue();

      // 2. BACKUP: Polling directo cada 60 segundos
      const timeSinceLastPolling = startTime - this.lastPollingTime;
      if (timeSinceLastPolling >= this.POLLING_INTERVAL_MS) {
        // Detectar órdenes recién creadas
        const ordenesCreadas = await this.detectOrdenesCreadas();

        // Detectar órdenes recién pagadas
        const ordenesPagadas = await this.detectOrdenesPagadas();

        // Detectar resultados recién validados
        const resultadosValidados = await this.detectResultadosValidados();

        if (ordenesCreadas.length > 0 || ordenesPagadas.length > 0 || resultadosValidados.length > 0) {
          logger.info(`🔄 Polling backup - Órdenes creadas: ${ordenesCreadas.length}, Pagadas: ${ordenesPagadas.length}, Resultados: ${resultadosValidados.length}`);
        }

        this.lastPollingTime = startTime;
      }

      this.lastCheckTime = startTime;

    } catch (error) {
      logger.error('❌ Error en checkChanges:', error);
    }
  }

  /**
   * Procesar cola de notificaciones desde notifications_queue
   * Este es el método PRINCIPAL que procesa notificaciones disparadas por triggers
   */
  async processNotificationQueue() {
    try {
      // Obtener items pendientes de la cola (máximo BATCH_SIZE)
      const result = await botPool.query(
        `SELECT * FROM notifications_queue
         WHERE status = 'pending'
           AND attempts < max_attempts
         ORDER BY created_at ASC
         LIMIT $1
         FOR UPDATE SKIP LOCKED`,
        [this.BATCH_SIZE]
      );

      if (result.rows.length === 0) {
        return; // No hay notificaciones pendientes
      }

      logger.info(`📬 Procesando ${result.rows.length} notificaciones de la cola`);

      // Procesar cada item de la cola
      for (const item of result.rows) {
        await this.processQueueItem(item);
      }

    } catch (error) {
      logger.error('❌ Error procesando cola de notificaciones:', error);
    }
  }

  /**
   * Procesar un item individual de la cola
   * @param {object} item - Item de notifications_queue
   */
  async processQueueItem(item) {
    const { id, orden_trabajo_id, paciente_id, notification_type, attempts } = item;

    try {
      // Marcar como 'processing'
      await botPool.query(
        `UPDATE notifications_queue
         SET status = 'processing',
             attempts = attempts + 1
         WHERE id = $1`,
        [id]
      );

      // Obtener datos completos de la orden desde labsisEG
      const ordenResult = await labsisPool.query(
        `SELECT id, numero, paciente_id, fecha, factura_id, status_id, fecha_validado
         FROM orden_trabajo
         WHERE id = $1`,
        [orden_trabajo_id]
      );

      if (ordenResult.rows.length === 0) {
        throw new Error(`Orden ${orden_trabajo_id} no encontrada en labsisEG`);
      }

      const orden = ordenResult.rows[0];

      // Usar MultiChannelNotificationService según el tipo
      const MultiChannelNotificationService = require('./MultiChannelNotificationService');
      let success = false;

      switch (notification_type) {
        case 'orden_creada':
          success = await MultiChannelNotificationService.notifyOrdenCreada(orden);
          break;

        case 'orden_pagada':
          success = await MultiChannelNotificationService.notifyOrdenPagada(orden);
          break;

        case 'resultados_listos':
          success = await MultiChannelNotificationService.notifyResultadosListos(orden);
          break;

        default:
          throw new Error(`Tipo de notificación desconocido: ${notification_type}`);
      }

      if (success) {
        // Marcar como completado
        await botPool.query(
          `UPDATE notifications_queue
           SET status = 'completed',
               processed_at = NOW(),
               last_error = NULL
           WHERE id = $1`,
          [id]
        );

        logger.info(`✅ Notificación procesada: ${notification_type} para orden ${orden.numero}`);
      } else {
        throw new Error('El servicio de notificación retornó false');
      }

    } catch (error) {
      logger.error(`❌ Error procesando notificación ${id}:`, error);

      // Marcar como fallido o reintentar
      const newAttempts = attempts + 1;
      const newStatus = newAttempts >= item.max_attempts ? 'failed' : 'pending';

      await botPool.query(
        `UPDATE notifications_queue
         SET status = $1,
             last_error = $2,
             processed_at = CASE WHEN $1 = 'failed' THEN NOW() ELSE processed_at END
         WHERE id = $3`,
        [newStatus, error.message, id]
      );

      if (newStatus === 'failed') {
        logger.error(`💀 Notificación ${id} marcada como fallida después de ${newAttempts} intentos`);
      } else {
        logger.warn(`🔄 Notificación ${id} será reintentada (intento ${newAttempts}/${item.max_attempts})`);
      }
    }
  }

  /**
   * Detectar órdenes recién creadas
   * @returns {Promise<Array>} Lista de órdenes detectadas
   */
  async detectOrdenesCreadas() {
    try {
      // Buscar órdenes que:
      // 1. Fueron creadas recientemente (últimas 24 horas)
      // 2. NO tienen factura_id (aún no están pagadas)

      const ordenesResult = await labsisPool.query(
        `SELECT DISTINCT ot.id, ot.numero, ot.paciente_id, ot.fecha
         FROM orden_trabajo ot
         WHERE ot.fecha >= NOW() - INTERVAL '24 hours'
           AND ot.factura_id IS NULL
         ORDER BY ot.fecha DESC
         LIMIT 50`
      );

      if (ordenesResult.rows.length === 0) {
        return [];
      }

      // 3. Filtrar las que NO tienen notificación enviada (query a lis_bot_comunicacion)
      const ordenesIds = ordenesResult.rows.map(o => o.id);

      const notificadasResult = await botPool.query(
        `SELECT DISTINCT orden_trabajo_id
         FROM system_notifications
         WHERE orden_trabajo_id = ANY($1::int[])
           AND notification_type = 'orden_creada'
           AND status = 'sent'`,
        [ordenesIds]
      );

      const notificadasIds = new Set(notificadasResult.rows.map(r => r.orden_trabajo_id));
      const result = {
        rows: ordenesResult.rows.filter(orden => !notificadasIds.has(orden.id)).slice(0, 10)
      };

      if (result.rows.length === 0) {
        return [];
      }

      logger.info(`📋 Detectadas ${result.rows.length} órdenes recién creadas`);

      // Enviar notificaciones
      for (const orden of result.rows) {
        try {
          await MultiChannelNotificationService.notifyOrdenCreada(orden);
        } catch (error) {
          logger.error(`Error notificando creación de orden ${orden.numero}:`, error);
        }
      }

      return result.rows;

    } catch (error) {
      logger.error('Error detectando órdenes creadas:', error);
      return [];
    }
  }

  /**
   * Detectar órdenes recién pagadas (factura_id asignado)
   * @returns {Promise<Array>} Lista de órdenes detectadas
   */
  async detectOrdenesPagadas() {
    try {
      // Buscar órdenes que:
      // 1. Tienen factura_id asignado (están pagadas)
      // 2. Fueron creadas/actualizadas recientemente

      const ordenesResult = await labsisPool.query(
        `SELECT DISTINCT ot.id, ot.numero, ot.paciente_id, ot.fecha, ot.factura_id
         FROM orden_trabajo ot
         WHERE ot.factura_id IS NOT NULL
           AND ot.fecha >= NOW() - INTERVAL '7 days'
         ORDER BY ot.fecha DESC
         LIMIT 50`
      );

      if (ordenesResult.rows.length === 0) {
        return [];
      }

      // 3. Filtrar las que NO tienen notificación enviada (query a lis_bot_comunicacion)
      const ordenesIds = ordenesResult.rows.map(o => o.id);

      const notificadasResult = await botPool.query(
        `SELECT DISTINCT orden_trabajo_id
         FROM system_notifications
         WHERE orden_trabajo_id = ANY($1::int[])
           AND notification_type = 'orden_pagada'
           AND status = 'sent'`,
        [ordenesIds]
      );

      const notificadasIds = new Set(notificadasResult.rows.map(r => r.orden_trabajo_id));
      const result = {
        rows: ordenesResult.rows.filter(orden => !notificadasIds.has(orden.id)).slice(0, 10)
      };

      if (result.rows.length === 0) {
        return [];
      }

      logger.info(`🆕 Detectadas ${result.rows.length} órdenes recién pagadas`);

      // Enviar notificaciones
      for (const orden of result.rows) {
        try {
          await MultiChannelNotificationService.notifyOrdenPagada(orden);
        } catch (error) {
          logger.error(`Error notificando orden ${orden.numero}:`, error);
        }
      }

      return result.rows;

    } catch (error) {
      logger.error('Error detectando órdenes pagadas:', error);
      return [];
    }
  }

  /**
   * Detectar resultados recién validados (status_id = 4)
   * @returns {Promise<Array>} Lista de órdenes detectadas
   */
  async detectResultadosValidados() {
    try {
      // Buscar órdenes que:
      // 1. Tienen status_id = 4 (Validado)
      // 2. Fueron validadas recientemente (fecha_validado)

      const ordenesResult = await labsisPool.query(
        `SELECT DISTINCT ot.id, ot.numero, ot.paciente_id, ot.fecha_validado, ot.factura_id
         FROM orden_trabajo ot
         WHERE ot.status_id = 4
           AND ot.fecha_validado IS NOT NULL
           AND ot.fecha_validado >= NOW() - INTERVAL '7 days'
         ORDER BY ot.fecha_validado DESC
         LIMIT 50`
      );

      if (ordenesResult.rows.length === 0) {
        return [];
      }

      // 3. Filtrar las que NO tienen notificación enviada (query a lis_bot_comunicacion)
      const ordenesIds = ordenesResult.rows.map(o => o.id);

      const notificadasResult = await botPool.query(
        `SELECT DISTINCT orden_trabajo_id
         FROM system_notifications
         WHERE orden_trabajo_id = ANY($1::int[])
           AND notification_type = 'resultados_listos'
           AND status = 'sent'`,
        [ordenesIds]
      );

      const notificadasIds = new Set(notificadasResult.rows.map(r => r.orden_trabajo_id));
      const result = {
        rows: ordenesResult.rows.filter(orden => !notificadasIds.has(orden.id)).slice(0, 10)
      };

      if (result.rows.length === 0) {
        return [];
      }

      logger.info(`🎉 Detectados ${result.rows.length} resultados recién validados`);

      // Enviar notificaciones
      for (const orden of result.rows) {
        try {
          await MultiChannelNotificationService.notifyResultadosListos(orden);
        } catch (error) {
          logger.error(`Error notificando resultados de orden ${orden.numero}:`, error);
        }
      }

      return result.rows;

    } catch (error) {
      logger.error('Error detectando resultados validados:', error);
      return [];
    }
  }

  /**
   * Obtener estadísticas del detector
   * @returns {object} Estadísticas
   */
  getStats() {
    return {
      isRunning: this.isRunning,
      lastCheckTime: this.lastCheckTime,
      checkIntervalSeconds: this.CHECK_INTERVAL_MS / 1000,
      uptime: this.lastCheckTime ? Math.floor((new Date() - this.lastCheckTime) / 1000) : 0
    };
  }

  /**
   * Forzar chequeo manual (para testing)
   * @returns {Promise<object>} Resultados del chequeo
   */
  async forceCheck() {
    logger.info('🔍 Forzando chequeo manual de cambios...');

    const ordenesPagadas = await this.detectOrdenesPagadas();
    const resultadosValidados = await this.detectResultadosValidados();

    return {
      ordenesPagadas: ordenesPagadas.length,
      resultadosValidados: resultadosValidados.length,
      timestamp: new Date()
    };
  }
}

// Exportar singleton
module.exports = new ChangeDetectorService();
