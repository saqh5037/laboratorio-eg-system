const { query } = require('../../db/pool');
const logger = require('../../utils/logger');
const NotificationService = require('./NotificationService');

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
    this.intervalId = null;
    this.CHECK_INTERVAL_MS = 30000; // 30 segundos
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

    logger.info('🔍 ChangeDetector iniciado - Detectando cambios cada 30 segundos');

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

      // Detectar órdenes recién pagadas
      const ordenesPagadas = await this.detectOrdenesPagadas();

      // Detectar resultados recién validados
      const resultadosValidados = await this.detectResultadosValidados();

      const endTime = new Date();
      const duration = endTime - startTime;

      if (ordenesPagadas.length > 0 || resultadosValidados.length > 0) {
        logger.info(`✅ Cambios detectados en ${duration}ms - Órdenes pagadas: ${ordenesPagadas.length}, Resultados validados: ${resultadosValidados.length}`);
      }

      this.lastCheckTime = startTime;

    } catch (error) {
      logger.error('❌ Error en checkChanges:', error);
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
      // 2. Fueron creadas/actualizadas desde el último chequeo
      // 3. NO tienen notificación de "orden_pagada" enviada

      const result = await query(
        `SELECT DISTINCT ot.id, ot.numero, ot.paciente_id, ot.fecha, ot.factura_id
         FROM orden_trabajo ot
         WHERE ot.factura_id IS NOT NULL
           AND ot.fecha >= NOW() - INTERVAL '7 days'
           AND NOT EXISTS (
             SELECT 1 FROM telegram_notifications tn
             WHERE tn.orden_trabajo_id = ot.id
               AND tn.notification_type = 'orden_pagada'
               AND tn.status = 'sent'
           )
         ORDER BY ot.fecha DESC
         LIMIT 10`
      );

      if (result.rows.length === 0) {
        return [];
      }

      logger.info(`🆕 Detectadas ${result.rows.length} órdenes recién pagadas`);

      // Enviar notificaciones
      for (const orden of result.rows) {
        try {
          await NotificationService.notifyOrdenPagada(orden);
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
      // 3. NO tienen notificación de "resultados_listos" enviada

      const result = await query(
        `SELECT DISTINCT ot.id, ot.numero, ot.paciente_id, ot.fecha_validado, ot.factura_id
         FROM orden_trabajo ot
         WHERE ot.status_id = 4
           AND ot.fecha_validado IS NOT NULL
           AND ot.fecha_validado >= NOW() - INTERVAL '7 days'
           AND NOT EXISTS (
             SELECT 1 FROM telegram_notifications tn
             WHERE tn.orden_trabajo_id = ot.id
               AND tn.notification_type = 'resultados_listos'
               AND tn.status = 'sent'
           )
         ORDER BY ot.fecha_validado DESC
         LIMIT 10`
      );

      if (result.rows.length === 0) {
        return [];
      }

      logger.info(`🎉 Detectados ${result.rows.length} resultados recién validados`);

      // Enviar notificaciones
      for (const orden of result.rows) {
        try {
          await NotificationService.notifyResultadosListos(orden);
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
