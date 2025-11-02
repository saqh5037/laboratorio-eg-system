const { botPool, labsisPool } = require('../../db/pool');
const logger = require('../../utils/logger');
const SessionService = require('./SessionService');
const MessageTemplateService = require('./MessageTemplateService');
const NotificationPreferencesService = require('./NotificationPreferencesService');

/**
 * NotificationService - Envío de notificaciones automáticas vía Telegram
 *
 * Maneja el envío de notificaciones cuando:
 * 1. Una orden de trabajo es pagada (factura_id asignado)
 * 2. Los resultados están listos (status_id = 4 - Validado)
 * 3. Orden en proceso (estados intermedios)
 * 4. Resultados críticos (valores urgentes)
 * 5. Recordatorio de retiro (resultados físicos disponibles)
 */
class NotificationService {
  constructor() {
    this.telegramAdapter = null;
  }

  /**
   * Inicializar con el adaptador de Telegram
   * @param {object} adapter - TelegramAdapter instance
   */
  initialize(adapter) {
    this.telegramAdapter = adapter;
    logger.info('📬 NotificationService inicializado con Telegram adapter');
  }

  /**
   * Enviar notificación de orden pagada
   * @param {object} ordenTrabajo - Datos de la orden de trabajo
   * @returns {Promise<boolean>} Success
   */
  async notifyOrdenPagada(ordenTrabajo) {
    try {
      const { id, numero, paciente_id, fecha } = ordenTrabajo;

      logger.info(`📋 Preparando notificación de orden pagada: ${numero}`);

      // Verificar preferencias del paciente
      const shouldNotify = await NotificationPreferencesService.shouldNotify(paciente_id, 'orden_pagada');
      if (!shouldNotify) {
        logger.info(`⏭️ Notificación orden_pagada deshabilitada para paciente ${paciente_id}`);
        return false;
      }

      // Obtener datos del paciente
      const paciente = await this.getPatientData(paciente_id);
      if (!paciente) {
        logger.warn(`Paciente ${paciente_id} no encontrado`);
        return false;
      }

      // Buscar chat_id de Telegram del paciente
      const chatId = await this.findPatientChatId(paciente_id, paciente.telefono);
      if (!chatId) {
        logger.warn(`No se encontró chat_id de Telegram para paciente ${paciente_id}`);
        return false;
      }

      // Obtener estudios de la orden
      const estudios = await this.getOrdenEstudios(id);

      // Calcular fecha estimada de resultados (2-3 días hábiles)
      const fechaEstimada = this.calculateEstimatedDate(fecha, 3);

      // Generar mensaje con template
      const { message, buttons } = MessageTemplateService.format('orden_pagada', {
        numero,
        paciente: `${paciente.nombre} ${paciente.apellido}`,
        estudios,
        fechaEstimada
      });

      // Enviar mensaje
      if (!this.telegramAdapter) {
        logger.error('TelegramAdapter no está inicializado');
        return false;
      }

      // Enviar con botones inline
      await this.telegramAdapter.sendInteractiveMessage(chatId, message, buttons);

      // Registrar notificación
      await this.logNotification({
        ordenTrabajoId: id,
        pacienteId: paciente_id,
        notificationType: 'orden_pagada',
        telegramChatId: chatId,
        messageText: message,
        status: 'sent'
      });

      logger.info(`✅ Notificación de orden pagada enviada a ${paciente.nombre}`);
      return true;

    } catch (error) {
      logger.error('Error enviando notificación de orden pagada:', error);

      // Registrar fallo
      if (ordenTrabajo) {
        await this.logNotification({
          ordenTrabajoId: ordenTrabajo.id,
          pacienteId: ordenTrabajo.paciente_id,
          notificationType: 'orden_pagada',
          messageText: 'Error al enviar',
          status: 'failed',
          errorMessage: error.message
        });
      }

      return false;
    }
  }

  /**
   * Enviar notificación de resultados listos
   * @param {object} ordenTrabajo - Datos de la orden de trabajo
   * @returns {Promise<boolean>} Success
   */
  async notifyResultadosListos(ordenTrabajo) {
    try {
      const { id, numero, paciente_id, fecha_validado } = ordenTrabajo;

      logger.info(`🎉 Preparando notificación de resultados listos: ${numero}`);

      // Verificar preferencias del paciente
      const shouldNotify = await NotificationPreferencesService.shouldNotify(paciente_id, 'resultados_listos');
      if (!shouldNotify) {
        logger.info(`⏭️ Notificación resultados_listos deshabilitada para paciente ${paciente_id}`);
        return false;
      }

      // Obtener datos del paciente
      const paciente = await this.getPatientData(paciente_id);
      if (!paciente) {
        logger.warn(`Paciente ${paciente_id} no encontrado`);
        return false;
      }

      // Buscar chat_id de Telegram
      const chatId = await this.findPatientChatId(paciente_id, paciente.telefono);
      if (!chatId) {
        logger.warn(`No se encontró chat_id de Telegram para paciente ${paciente_id}`);
        return false;
      }

      // Crear sesión temporal con token para acceso directo
      const session = await SessionService.createSession({
        pacienteId: paciente_id,
        telegramChatId: chatId,
        deviceInfo: { source: 'telegram_notification', ordenTrabajoId: id },
        ipAddress: null,
        userAgent: 'Telegram Bot Notification'
      });

      // Generar URL con token
      const resultsUrl = SessionService.generateResultsUrl(session.token, id);

      // Generar mensaje con template
      const { message, buttons } = MessageTemplateService.format('resultados_listos', {
        numero,
        paciente: `${paciente.nombre} ${paciente.apellido}`,
        fechaValidado: fecha_validado,
        resultsUrl,
        expiresAt: session.expiresAt
      });

      // Enviar mensaje con botones inline
      await this.telegramAdapter.sendInteractiveMessage(chatId, message, buttons);

      // Registrar notificación
      await this.logNotification({
        ordenTrabajoId: id,
        pacienteId: paciente_id,
        notificationType: 'resultados_listos',
        telegramChatId: chatId,
        messageText: message,
        status: 'sent'
      });

      logger.info(`✅ Notificación de resultados enviada a ${paciente.nombre}`);
      return true;

    } catch (error) {
      logger.error('Error enviando notificación de resultados:', error);

      if (ordenTrabajo) {
        await this.logNotification({
          ordenTrabajoId: ordenTrabajo.id,
          pacienteId: ordenTrabajo.paciente_id,
          notificationType: 'resultados_listos',
          messageText: 'Error al enviar',
          status: 'failed',
          errorMessage: error.message
        });
      }

      return false;
    }
  }

  /**
   * Obtener datos del paciente
   * @param {number} pacienteId - ID del paciente
   * @returns {Promise<object|null>}
   */
  async getPatientData(pacienteId) {
    try {
      const result = await labsisPool.query(
        `SELECT id, nombre, apellido, ci_paciente, telefono, email
         FROM paciente
         WHERE id = $1`,
        [pacienteId]
      );

      return result.rows.length > 0 ? result.rows[0] : null;

    } catch (error) {
      logger.error('Error obteniendo datos del paciente:', error);
      return null;
    }
  }

  /**
   * Buscar chat_id de Telegram del paciente
   * @param {number} pacienteId - ID del paciente
   * @param {string} telefono - Teléfono del paciente
   * @returns {Promise<string|null>}
   */
  async findPatientChatId(pacienteId, telefono) {
    try {
      // PRIORIDAD 1: Buscar en telegram_user_registry (nuevo sistema)
      let result = await botPool.query(
        `SELECT telegram_chat_id::text
         FROM telegram_user_registry
         WHERE paciente_id = $1 AND is_active = TRUE
         ORDER BY last_interaction DESC
         LIMIT 1`,
        [pacienteId]
      );

      if (result.rows.length > 0 && result.rows[0].telegram_chat_id) {
        logger.info(`✅ Chat ID encontrado en telegram_user_registry: ${result.rows[0].telegram_chat_id}`);
        return result.rows[0].telegram_chat_id;
      }

      // PRIORIDAD 2: Buscar por teléfono si no se encontró por paciente_id
      if (telefono) {
        result = await botPool.query(
          `SELECT telegram_chat_id::text
           FROM telegram_user_registry
           WHERE phone = $1 AND is_active = TRUE
           ORDER BY last_interaction DESC
           LIMIT 1`,
          [telefono]
        );

        if (result.rows.length > 0 && result.rows[0].telegram_chat_id) {
          logger.info(`✅ Chat ID encontrado por teléfono en telegram_user_registry: ${result.rows[0].telegram_chat_id}`);
          return result.rows[0].telegram_chat_id;
        }
      }

      // PRIORIDAD 2.5: Buscar en bot_conversations (sistema viejo en labsisEG)
      // Esta tabla está en la base de datos vieja, entonces necesitamos usar labsisPool
      try {
        const { labsisPool } = require('../../db/pool');
        result = await labsisPool.query(
          `SELECT chat_id
           FROM bot_conversations
           WHERE platform = 'telegram'
             AND state = 'active'
             AND user_info->>'phone' = $1
           ORDER BY last_message_at DESC
           LIMIT 1`,
          [telefono]
        );

        if (result.rows.length > 0 && result.rows[0].chat_id) {
          logger.info(`✅ Chat ID encontrado en bot_conversations (labsisEG): ${result.rows[0].chat_id}`);
          return result.rows[0].chat_id;
        }
      } catch (convError) {
        // Si falla (por ejemplo, tabla no migrada aún), continuar con siguientes prioridades
        logger.warn(`⚠️  Error buscando en bot_conversations: ${convError.message}`);
      }

      // PRIORIDAD 3: Buscar en sesiones activas (sistema legacy)
      result = await botPool.query(
        `SELECT telegram_chat_id
         FROM patient_sessions
         WHERE paciente_id = $1
           AND telegram_chat_id IS NOT NULL
         ORDER BY last_used_at DESC
         LIMIT 1`,
        [pacienteId]
      );

      if (result.rows.length > 0 && result.rows[0].telegram_chat_id) {
        logger.info(`✅ Chat ID encontrado en patient_sessions (legacy): ${result.rows[0].telegram_chat_id}`);
        return result.rows[0].telegram_chat_id;
      }

      // PRIORIDAD 4: Buscar en códigos de autenticación (sistema legacy)
      result = await botPool.query(
        `SELECT telegram_chat_id
         FROM telegram_auth_codes
         WHERE paciente_id = $1
           AND telegram_chat_id IS NOT NULL
         ORDER BY created_at DESC
         LIMIT 1`,
        [pacienteId]
      );

      if (result.rows.length > 0 && result.rows[0].telegram_chat_id) {
        logger.info(`✅ Chat ID encontrado en telegram_auth_codes (legacy): ${result.rows[0].telegram_chat_id}`);
        return result.rows[0].telegram_chat_id;
      }

      // PRIORIDAD 5: Buscar en presupuestos del bot (sistema legacy en labsisEG)
      // Y migrar automáticamente a telegram_user_registry
      try {
        const { labsisPool } = require('../../db/pool');
        result = await labsisPool.query(
          `SELECT conversation_id, patient_phone
           FROM bot_presupuestos
           WHERE labsis_patient_id = $1
             AND platform = 'telegram'
           ORDER BY created_at DESC
           LIMIT 1`,
          [pacienteId]
        );

        if (result.rows.length > 0) {
          // Extraer el chat_id del conversation_id (formato: telegram_CHATID)
          const conversationId = result.rows[0].conversation_id;
          const chatId = conversationId.replace('telegram_', '');
          const phone = result.rows[0].patient_phone || telefono;

          logger.info(`✅ Chat ID encontrado en bot_presupuestos (labsisEG): ${chatId}`);

          // MIGRACIÓN AUTOMÁTICA: Guardar en telegram_user_registry para próximas veces
          try {
            await botPool.query(
              `INSERT INTO telegram_user_registry
               (telegram_chat_id, phone, paciente_id, is_active, registered_at, last_interaction)
               VALUES ($1, $2, $3, TRUE, NOW(), NOW())
               ON CONFLICT (telegram_chat_id) DO UPDATE
               SET paciente_id = EXCLUDED.paciente_id,
                   phone = EXCLUDED.phone,
                   is_active = TRUE,
                   last_interaction = NOW()`,
              [chatId, phone, pacienteId]
            );
            logger.info(`🔄 Chat ID migrado automáticamente a telegram_user_registry: ${chatId}`);
          } catch (migrationError) {
            logger.warn(`⚠️  Error migrando chat_id automáticamente: ${migrationError.message}`);
            // Continuar incluso si falla la migración
          }

          return chatId;
        }
      } catch (presError) {
        logger.warn(`⚠️  Error buscando en bot_presupuestos: ${presError.message}`);
      }

      logger.warn(`⚠️  No se encontró chat_id para paciente ${pacienteId} (teléfono: ${telefono})`);
      return null;

    } catch (error) {
      logger.error('Error buscando chat_id:', error);
      return null;
    }
  }

  /**
   * Obtener estudios de la orden de trabajo
   * @param {number} ordenTrabajoId - ID de la orden
   * @returns {Promise<Array>}
   */
  async getOrdenEstudios(ordenTrabajoId) {
    try {
      const result = await botPool.query(
        `SELECT p.nombre
         FROM prueba_orden po
         JOIN prueba p ON po.prueba_id = p.id
         WHERE po.orden_id = $1
         ORDER BY p.nombre`,
        [ordenTrabajoId]
      );

      return result.rows;

    } catch (error) {
      logger.error('Error obteniendo estudios de la orden:', error);
      return [];
    }
  }

  /**
   * Calcular fecha estimada de resultados
   * @param {Date} fechaOrden - Fecha de la orden
   * @param {number} diasHabiles - Días hábiles a sumar
   * @returns {string} Fecha formateada
   */
  calculateEstimatedDate(fechaOrden, diasHabiles) {
    const fecha = new Date(fechaOrden);
    let diasSumados = 0;

    while (diasSumados < diasHabiles) {
      fecha.setDate(fecha.getDate() + 1);

      // Saltar sábados (6) y domingos (0)
      const diaSemana = fecha.getDay();
      if (diaSemana !== 0 && diaSemana !== 6) {
        diasSumados++;
      }
    }

    // Formatear como "Lunes 28 de Octubre"
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    return `${dias[fecha.getDay()]} ${fecha.getDate()} de ${meses[fecha.getMonth()]}`;
  }

  // Los métodos buildOrdenPagadaMessage() y buildResultadosListosMessage()
  // han sido reemplazados por MessageTemplateService para mejor mantenibilidad

  /**
   * Registrar notificación enviada
   * @param {object} data - Datos de la notificación
   * @returns {Promise<void>}
   */
  async logNotification(data) {
    try {
      const {
        ordenTrabajoId,
        pacienteId,
        notificationType,
        telegramChatId,
        messageText,
        status,
        errorMessage
      } = data;

      await botPool.query(
        `INSERT INTO telegram_notifications
         (orden_trabajo_id, paciente_id, notification_type, telegram_chat_id, message_text, status, error_message)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [ordenTrabajoId, pacienteId, notificationType, telegramChatId, messageText, status, errorMessage || null]
      );

    } catch (error) {
      logger.error('Error registrando notificación:', error);
    }
  }

  /**
   * Obtener historial de notificaciones de un paciente
   * @param {number} pacienteId - ID del paciente
   * @param {number} limit - Límite de resultados
   * @returns {Promise<Array>}
   */
  async getPatientNotifications(pacienteId, limit = 10) {
    try {
      const result = await botPool.query(
        `SELECT tn.*, ot.numero as orden_numero
         FROM telegram_notifications tn
         LEFT JOIN orden_trabajo ot ON tn.orden_trabajo_id = ot.id
         WHERE tn.paciente_id = $1
         ORDER BY tn.sent_at DESC
         LIMIT $2`,
        [pacienteId, limit]
      );

      return result.rows;

    } catch (error) {
      logger.error('Error obteniendo notificaciones:', error);
      return [];
    }
  }

  /**
   * Enviar código de autenticación por Telegram
   * @param {number} pacienteId - ID del paciente
   * @param {string} code - Código de 6 dígitos
   * @param {string} phone - Teléfono del paciente
   * @returns {Promise<boolean>} Success
   */
  async sendAuthCode(pacienteId, code, phone) {
    try {
      logger.info(`🔐 Intentando enviar código de autenticación al paciente ${pacienteId}`);

      // Obtener datos del paciente
      const paciente = await this.getPatientData(pacienteId);
      if (!paciente) {
        logger.warn(`Paciente ${pacienteId} no encontrado`);
        return false;
      }

      // Buscar chat_id de Telegram del paciente
      const chatId = await this.findPatientChatId(pacienteId, phone);
      if (!chatId) {
        logger.warn(`⚠️  No se encontró chat_id de Telegram para ${paciente.nombre} ${paciente.apellido}`);
        logger.info(`💡 El paciente debe iniciar una conversación con el bot @LaboratorioEG_bot primero`);
        return false;
      }

      // Crear mensaje de autenticación simple y limpio
      const message = `🔐 *Código de Autenticación*\n\n` +
        `Hola *${paciente.nombre} ${paciente.apellido}*,\n\n` +
        `Tu código de acceso es:\n\n` +
        `\`${code}\`\n\n` +
        `💡 Mantén presionado sobre el código para copiarlo\n` +
        `⏰ Expira en *10 minutos*\n` +
        `⚠️ No lo compartas con nadie`;

      // Enviar mensaje
      if (!this.telegramAdapter) {
        logger.error('TelegramAdapter no está inicializado');
        return false;
      }

      await this.telegramAdapter.sendTextMessage(chatId, message);

      logger.info(`✅ Código de autenticación enviado a ${paciente.nombre} por Telegram`);
      return true;

    } catch (error) {
      logger.error('Error enviando código de autenticación:', error);
      return false;
    }
  }

  /**
   * Obtener estadísticas de notificaciones
   * @returns {Promise<object>}
   */
  async getNotificationStats() {
    try {
      const result = await botPool.query(`
        SELECT
          COUNT(*) as total_notifications,
          COUNT(*) FILTER (WHERE status = 'sent') as sent_count,
          COUNT(*) FILTER (WHERE status = 'failed') as failed_count,
          COUNT(*) FILTER (WHERE notification_type = 'orden_pagada') as orden_pagada_count,
          COUNT(*) FILTER (WHERE notification_type = 'resultados_listos') as resultados_listos_count,
          COUNT(DISTINCT paciente_id) as unique_patients
        FROM telegram_notifications
      `);

      return result.rows[0];

    } catch (error) {
      logger.error('Error obteniendo estadísticas:', error);
      return null;
    }
  }

  /**
   * Reintentar notificaciones fallidas
   * @param {number} maxRetries - Máximo de reintentos
   * @returns {Promise<number>} Cantidad de notificaciones reintentadas
   */
  async retryFailedNotifications(maxRetries = 3) {
    try {
      const result = await botPool.query(
        `SELECT * FROM telegram_notifications
         WHERE status = 'failed' AND retry_count < $1
         ORDER BY sent_at DESC
         LIMIT 10`,
        [maxRetries]
      );

      let retriedCount = 0;

      for (const notification of result.rows) {
        // Obtener datos de la orden
        const ordenResult = await botPool.query(
          'SELECT * FROM orden_trabajo WHERE id = $1',
          [notification.orden_trabajo_id]
        );

        if (ordenResult.rows.length === 0) continue;

        const orden = ordenResult.rows[0];

        // Reintentar según el tipo
        let success = false;
        if (notification.notification_type === 'orden_pagada') {
          success = await this.notifyOrdenPagada(orden);
        } else if (notification.notification_type === 'resultados_listos') {
          success = await this.notifyResultadosListos(orden);
        }

        if (success) {
          retriedCount++;
        } else {
          // Incrementar contador de reintentos
          await botPool.query(
            'UPDATE telegram_notifications SET retry_count = retry_count + 1 WHERE id = $1',
            [notification.id]
          );
        }
      }

      logger.info(`🔄 Reintentadas ${retriedCount} notificaciones fallidas`);
      return retriedCount;

    } catch (error) {
      logger.error('Error reintentando notificaciones:', error);
      return 0;
    }
  }
}

// Exportar singleton
module.exports = new NotificationService();
