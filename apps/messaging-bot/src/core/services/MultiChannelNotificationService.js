const { botPool, labsisPool } = require('../../db/pool');
const logger = require('../../utils/logger');
const SessionService = require('./SessionService');
const MessageTemplateService = require('./MessageTemplateService');
const NotificationPreferencesService = require('./NotificationPreferencesService');
const TwilioService = require('./TwilioService');

/**
 * MultiChannelNotificationService - Envío de notificaciones multi-canal
 *
 * Soporta:
 * - Telegram (vía TelegramAdapter)
 * - WhatsApp (vía WhatsAppAdapter)
 * - SMS (vía TwilioService)
 *
 * Maneja el envío de notificaciones cuando:
 * 1. Una orden de trabajo es creada
 * 2. Una orden de trabajo es pagada (factura_id asignado)
 * 3. Los resultados están listos (status_id = 4 - Validado)
 */
class MultiChannelNotificationService {
  constructor() {
    this.adapters = {
      telegram: null,
      whatsapp: null
    };
    this.enabledChannels = ['telegram']; // Por defecto solo Telegram
  }

  /**
   * Inicializar con los adaptadores
   * @param {object} telegramAdapter - TelegramAdapter instance
   * @param {object} whatsappAdapter - WhatsAppAdapter instance
   */
  initialize(telegramAdapter, whatsappAdapter = null) {
    this.adapters.telegram = telegramAdapter;

    if (whatsappAdapter && whatsappAdapter.enabled) {
      this.adapters.whatsapp = whatsappAdapter;
      this.enabledChannels.push('whatsapp');
    }

    logger.info(`📬 MultiChannelNotificationService inicializado`);
    logger.info(`   Canales activos: ${this.enabledChannels.join(', ')}`);
  }

  /**
   * Obtener todos los canales de notificación de un paciente
   * @param {number} pacienteId - ID del paciente
   * @returns {Promise<Array>} Array de canales disponibles
   */
  async getPatientNotificationChannels(pacienteId) {
    try {
      const channels = [];

      // Buscar en Telegram
      const telegramResult = await botPool.query(
        `SELECT telegram_chat_id::text as chat_id
         FROM telegram_user_registry
         WHERE paciente_id = $1 AND is_active = TRUE
         ORDER BY last_interaction DESC
         LIMIT 1`,
        [pacienteId]
      );

      if (telegramResult.rows.length > 0 && telegramResult.rows[0].chat_id) {
        channels.push({
          type: 'telegram',
          chatId: telegramResult.rows[0].chat_id,
          enabled: this.enabledChannels.includes('telegram')
        });
      }

      // Buscar en WhatsApp
      const whatsappResult = await botPool.query(
        `SELECT phone_number
         FROM twilio_user_registry
         WHERE paciente_id = $1
           AND whatsapp_enabled = TRUE
           AND is_active = TRUE
         ORDER BY last_interaction DESC
         LIMIT 1`,
        [pacienteId]
      );

      if (whatsappResult.rows.length > 0 && whatsappResult.rows[0].phone_number) {
        channels.push({
          type: 'whatsapp',
          phoneNumber: whatsappResult.rows[0].phone_number,
          enabled: this.enabledChannels.includes('whatsapp')
        });
      }

      // Buscar número para SMS (mismo que WhatsApp pero con sms_enabled)
      const smsResult = await botPool.query(
        `SELECT phone_number
         FROM twilio_user_registry
         WHERE paciente_id = $1
           AND sms_enabled = TRUE
           AND is_active = TRUE
         ORDER BY last_interaction DESC
         LIMIT 1`,
        [pacienteId]
      );

      if (smsResult.rows.length > 0 && smsResult.rows[0].phone_number) {
        channels.push({
          type: 'sms',
          phoneNumber: smsResult.rows[0].phone_number,
          enabled: this.enabledChannels.includes('sms')
        });
      }

      logger.info(`📡 Canales para paciente ${pacienteId}: ${channels.map(c => c.type).join(', ')}`);

      return channels;

    } catch (error) {
      logger.error('Error obteniendo canales del paciente:', error);
      return [];
    }
  }

  /**
   * Enviar notificación por un canal específico
   * @param {object} channel - Canal de notificación
   * @param {string} message - Mensaje a enviar
   * @param {object} metadata - Metadatos adicionales (buttons, templateData, notificationType)
   * @returns {Promise<object>} Resultado del envío
   */
  async sendNotificationToChannel(channel, message, metadata = {}) {
    try {
      if (!channel.enabled) {
        logger.warn(`Canal ${channel.type} está deshabilitado`);
        return { success: false, reason: 'channel_disabled' };
      }

      const adapter = this.adapters[channel.type];
      if (!adapter) {
        logger.warn(`No hay adapter configurado para ${channel.type}`);
        return { success: false, reason: 'adapter_not_found' };
      }

      let result;

      switch (channel.type) {
        case 'telegram':
          // Enviar por Telegram (con botones si están disponibles)
          if (metadata.buttons && metadata.buttons.length > 0) {
            result = await adapter.sendInteractiveMessage(channel.chatId, message, metadata.buttons);
          } else {
            result = await adapter.sendTextMessage(channel.chatId, message);
          }
          break;

        case 'whatsapp':
          // Enviar por WhatsApp usando plantillas (post-abril 2025)
          result = await this.sendWhatsAppNotification(
            channel.phoneNumber,
            message,
            metadata
          );
          break;

        case 'sms':
          // TODO: Implementar envío por SMS
          logger.warn('SMS adapter no implementado todavía');
          return { success: false, reason: 'sms_not_implemented' };

        default:
          logger.warn(`Tipo de canal desconocido: ${channel.type}`);
          return { success: false, reason: 'unknown_channel' };
      }

      return result;

    } catch (error) {
      logger.error(`Error enviando notificación por ${channel.type}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Enviar notificación por WhatsApp usando templates
   * @param {string} phoneNumber - Número de teléfono
   * @param {string} fallbackMessage - Mensaje de fallback (si template no disponible)
   * @param {object} metadata - Metadatos (notificationType, templateData)
   * @returns {Promise<object>} Resultado del envío
   */
  async sendWhatsAppNotification(phoneNumber, fallbackMessage, metadata = {}) {
    try {
      const { notificationType, templateData } = metadata;

      // Mapeo de tipos de notificación a Content SIDs
      const templateMap = {
        'orden_creada': process.env.TWILIO_WHATSAPP_ORDER_CREATED_TEMPLATE_SID,
        'resultados_listos': process.env.TWILIO_WHATSAPP_RESULTS_READY_TEMPLATE_SID,
        'cita_cancelada': process.env.TWILIO_WHATSAPP_APPOINTMENT_CANCELLED_TEMPLATE_SID
      };

      const templateSid = templateMap[notificationType];

      // Si hay template configurado y templateData, usar template
      if (templateSid && templateSid !== 'HX...' && templateData) {
        logger.info(`📱 Usando WhatsApp template para ${notificationType}`);

        const result = await TwilioService.sendWhatsAppTemplate(
          phoneNumber,
          templateSid,
          templateData
        );

        // Si template falla por error 63016, intentar con mensaje directo
        if (!result.success && result.code === 63016) {
          logger.warn(`⚠️ Template falló, intentando mensaje directo`);
          return await TwilioService.sendWhatsApp(phoneNumber, fallbackMessage);
        }

        return result;
      }

      // Fallback: usar mensaje directo (solo funciona dentro de ventana de 24h)
      logger.info(`📱 Usando WhatsApp mensaje directo (template no configurado)`);
      const result = await TwilioService.sendWhatsApp(phoneNumber, fallbackMessage);

      // Si falla con 63016, advertir que se necesita template
      if (!result.success && result.code === 63016) {
        logger.error(`❌ Error 63016: Se requiere template para ${notificationType}`);
        logger.error(`   Configura ${templateMap[notificationType]} en .env`);
      }

      return result;

    } catch (error) {
      logger.error('Error enviando WhatsApp notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Enviar notificación de orden creada (multi-canal)
   * @param {object} ordenTrabajo - Datos de la orden de trabajo
   * @returns {Promise<object>} Resultados del envío
   */
  async notifyOrdenCreada(ordenTrabajo) {
    try {
      const { id, numero, paciente_id, fecha } = ordenTrabajo;

      logger.info(`📋 Preparando notificación de orden creada: ${numero}`);

      // Verificar preferencias del paciente
      const shouldNotify = await NotificationPreferencesService.shouldNotify(paciente_id, 'orden_creada');
      if (!shouldNotify) {
        logger.info(`⏭️ Notificación orden_creada deshabilitada para paciente ${paciente_id}`);
        return { success: false, reason: 'notifications_disabled' };
      }

      // Obtener datos del paciente
      const paciente = await this.getPatientData(paciente_id);
      if (!paciente) {
        logger.warn(`Paciente ${paciente_id} no encontrado`);
        return { success: false, reason: 'patient_not_found' };
      }

      // Obtener estudios de la orden
      const estudios = await this.getOrdenEstudios(id);

      // Obtener canales disponibles
      const channels = await this.getPatientNotificationChannels(paciente_id);
      if (channels.length === 0) {
        logger.warn(`No hay canales de notificación para paciente ${paciente_id}`);
        return { success: false, reason: 'no_channels_available' };
      }

      // Generar mensaje
      const { message, buttons } = MessageTemplateService.format('orden_creada', {
        numero,
        paciente: `${paciente.nombre} ${paciente.apellido}`,
        estudios,
        fecha: new Date(fecha).toLocaleDateString('es-VE')
      });

      // Preparar datos para template de WhatsApp
      const templateData = {
        '1': `${paciente.nombre} ${paciente.apellido}`,  // Nombre completo
        '2': numero                                        // Número de orden
      };

      // Enviar por todos los canales disponibles
      const results = [];
      for (const channel of channels) {
        if (!channel.enabled) continue;

        const result = await this.sendNotificationToChannel(channel, message, {
          buttons,
          notificationType: 'orden_creada',
          templateData
        });

        results.push({
          channel: channel.type,
          success: result.success || false,
          messageId: result.messageId || result.message_id || null,
          error: result.error || null
        });

        // Registrar en BD
        await this.logNotification({
          ordenTrabajoId: id,
          pacienteId: paciente_id,
          notificationType: 'orden_creada',
          channel: channel.type,
          identifier: channel.chatId || channel.phoneNumber,
          messageText: message,
          status: result.success ? 'sent' : 'failed',
          errorMessage: result.error || null,
          twilioMessageSid: result.messageId || null
        });
      }

      const successCount = results.filter(r => r.success).length;
      logger.info(`✅ Notificación de orden creada enviada a ${successCount}/${results.length} canales`);

      return {
        success: successCount > 0,
        results
      };

    } catch (error) {
      logger.error('Error enviando notificación de orden creada:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Enviar notificación de orden pagada (multi-canal)
   * @param {object} ordenTrabajo - Datos de la orden de trabajo
   * @returns {Promise<object>} Resultados del envío
   */
  async notifyOrdenPagada(ordenTrabajo) {
    try {
      const { id, numero, paciente_id, fecha } = ordenTrabajo;

      logger.info(`💳 Preparando notificación de orden pagada: ${numero}`);

      // Verificar preferencias
      const shouldNotify = await NotificationPreferencesService.shouldNotify(paciente_id, 'orden_pagada');
      if (!shouldNotify) {
        logger.info(`⏭️ Notificación orden_pagada deshabilitada para paciente ${paciente_id}`);
        return { success: false, reason: 'notifications_disabled' };
      }

      // Obtener datos del paciente
      const paciente = await this.getPatientData(paciente_id);
      if (!paciente) {
        logger.warn(`Paciente ${paciente_id} no encontrado`);
        return { success: false, reason: 'patient_not_found' };
      }

      // Obtener estudios
      const estudios = await this.getOrdenEstudios(id);

      // Calcular fecha estimada
      const fechaEstimada = this.calculateEstimatedDate(fecha, 3);

      // Obtener canales
      const channels = await this.getPatientNotificationChannels(paciente_id);
      if (channels.length === 0) {
        logger.warn(`No hay canales de notificación para paciente ${paciente_id}`);
        return { success: false, reason: 'no_channels_available' };
      }

      // Generar mensaje
      const { message, buttons } = MessageTemplateService.format('orden_pagada', {
        numero,
        paciente: `${paciente.nombre} ${paciente.apellido}`,
        estudios,
        fechaEstimada
      });

      // Enviar por todos los canales
      const results = [];
      for (const channel of channels) {
        if (!channel.enabled) continue;

        const result = await this.sendNotificationToChannel(channel, message, { buttons });

        results.push({
          channel: channel.type,
          success: result.success || false,
          messageId: result.messageId || result.message_id || null
        });

        // Registrar
        await this.logNotification({
          ordenTrabajoId: id,
          pacienteId: paciente_id,
          notificationType: 'orden_pagada',
          channel: channel.type,
          identifier: channel.chatId || channel.phoneNumber,
          messageText: message,
          status: result.success ? 'sent' : 'failed',
          twilioMessageSid: result.messageId || null
        });
      }

      const successCount = results.filter(r => r.success).length;
      logger.info(`✅ Notificación de orden pagada enviada a ${successCount}/${results.length} canales`);

      return { success: successCount > 0, results };

    } catch (error) {
      logger.error('Error enviando notificación de orden pagada:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Enviar notificación de resultados listos (multi-canal)
   * @param {object} ordenTrabajo - Datos de la orden de trabajo
   * @returns {Promise<object>} Resultados del envío
   */
  async notifyResultadosListos(ordenTrabajo) {
    try {
      const { id, numero, paciente_id, fecha_validado } = ordenTrabajo;

      logger.info(`🎉 Preparando notificación de resultados listos: ${numero}`);

      // Verificar preferencias
      const shouldNotify = await NotificationPreferencesService.shouldNotify(paciente_id, 'resultados_listos');
      if (!shouldNotify) {
        logger.info(`⏭️ Notificación resultados_listos deshabilitada para paciente ${paciente_id}`);
        return { success: false, reason: 'notifications_disabled' };
      }

      // Obtener datos del paciente
      const paciente = await this.getPatientData(paciente_id);
      if (!paciente) {
        logger.warn(`Paciente ${paciente_id} no encontrado`);
        return { success: false, reason: 'patient_not_found' };
      }

      // Crear sesión temporal para acceso directo
      const session = await SessionService.createSession({
        pacienteId: paciente_id,
        telegramChatId: null,
        deviceInfo: { reason: 'resultados_listos_notification', ordenTrabajoId: id }
      });
      const token = session.token;

      const accessUrl = `${process.env.FRONTEND_URL}/resultados?token=${token}`;

      // Obtener canales
      const channels = await this.getPatientNotificationChannels(paciente_id);
      if (channels.length === 0) {
        logger.warn(`No hay canales de notificación para paciente ${paciente_id}`);
        return { success: false, reason: 'no_channels_available' };
      }

      // Generar mensaje
      const { message, buttons } = MessageTemplateService.format('resultados_listos', {
        numero,
        paciente: `${paciente.nombre} ${paciente.apellido}`,
        fechaValidado: new Date(fecha_validado).toLocaleString('es-VE'),
        accessUrl
      });

      // Preparar datos para template de WhatsApp
      const portalUrl = process.env.FRONTEND_URL || 'https://resultados.laboratoriog.com';
      const templateData = {
        '1': `${paciente.nombre} ${paciente.apellido}`,  // Nombre completo
        '2': numero,                                       // Número de orden
        '3': `${portalUrl}/resultados?token=${token}`,   // URL con token
        '4': paciente.ci_paciente                         // Cédula
      };

      // Enviar por todos los canales
      const results = [];
      for (const channel of channels) {
        if (!channel.enabled) continue;

        const result = await this.sendNotificationToChannel(channel, message, {
          buttons,
          notificationType: 'resultados_listos',
          templateData
        });

        results.push({
          channel: channel.type,
          success: result.success || false,
          messageId: result.messageId || result.message_id || null
        });

        // Registrar
        await this.logNotification({
          ordenTrabajoId: id,
          pacienteId: paciente_id,
          notificationType: 'resultados_listos',
          channel: channel.type,
          identifier: channel.chatId || channel.phoneNumber,
          messageText: message,
          status: result.success ? 'sent' : 'failed',
          twilioMessageSid: result.messageId || null
        });
      }

      const successCount = results.filter(r => r.success).length;
      logger.info(`✅ Notificación de resultados listos enviada a ${successCount}/${results.length} canales`);

      return { success: successCount > 0, results };

    } catch (error) {
      logger.error('Error enviando notificación de resultados listos:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Enviar notificación de cancelación de cita (multi-canal)
   * @param {object} cita - Datos de la cita
   * @returns {Promise<object>} Resultados del envío
   */
  async notifyCitaCancelada(cita) {
    try {
      const { id, paciente_id, fecha, hora, motivo } = cita;

      logger.info(`❌ Preparando notificación de cita cancelada para paciente ${paciente_id}`);

      // Verificar preferencias
      const shouldNotify = await NotificationPreferencesService.shouldNotify(paciente_id, 'cita_cancelada');
      if (!shouldNotify) {
        logger.info(`⏭️ Notificación cita_cancelada deshabilitada para paciente ${paciente_id}`);
        return { success: false, reason: 'notifications_disabled' };
      }

      // Obtener datos del paciente
      const paciente = await this.getPatientData(paciente_id);
      if (!paciente) {
        logger.warn(`Paciente ${paciente_id} no encontrado`);
        return { success: false, reason: 'patient_not_found' };
      }

      // Obtener canales
      const channels = await this.getPatientNotificationChannels(paciente_id);
      if (channels.length === 0) {
        logger.warn(`No hay canales de notificación para paciente ${paciente_id}`);
        return { success: false, reason: 'no_channels_available' };
      }

      // Formatear fecha y hora
      const fechaFormatted = new Date(fecha).toLocaleDateString('es-VE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });

      const horaFormatted = hora || 'No especificada';
      const motivoCancelacion = motivo || 'No especificado';

      // Generar mensaje
      const message = `🔬 *Laboratorio Elizabeth Gutiérrez*\n\nEstimado(a) *${paciente.nombre} ${paciente.apellido}*,\n\nLamentamos informarle que su cita programada para el *${fechaFormatted}* a las *${horaFormatted}* ha sido cancelada.\n\n❌ *Motivo:* ${motivoCancelacion}\n\n📞 *¿Desea reprogramar?*\nPor favor contáctenos:\n• WhatsApp: Responda este mensaje\n\nDisculpe las molestias ocasionadas.\n\n_Laboratorio EG - A su servicio_`;

      // Preparar datos para template de WhatsApp
      const templateData = {
        '1': `${paciente.nombre} ${paciente.apellido}`,  // Nombre completo
        '2': fechaFormatted,                              // Fecha de la cita
        '3': horaFormatted,                               // Hora de la cita
        '4': motivoCancelacion                            // Motivo de cancelación
      };

      // Enviar por todos los canales
      const results = [];
      for (const channel of channels) {
        if (!channel.enabled) continue;

        const result = await this.sendNotificationToChannel(channel, message, {
          notificationType: 'cita_cancelada',
          templateData
        });

        results.push({
          channel: channel.type,
          success: result.success || false,
          messageId: result.messageId || result.message_id || null
        });

        // Registrar
        await this.logNotification({
          citaId: id,
          pacienteId: paciente_id,
          notificationType: 'cita_cancelada',
          channel: channel.type,
          identifier: channel.chatId || channel.phoneNumber,
          messageText: message,
          status: result.success ? 'sent' : 'failed',
          twilioMessageSid: result.messageId || null
        });
      }

      const successCount = results.filter(r => r.success).length;
      logger.info(`✅ Notificación de cita cancelada enviada a ${successCount}/${results.length} canales`);

      return { success: successCount > 0, results };

    } catch (error) {
      logger.error('Error enviando notificación de cita cancelada:', error);
      return { success: false, error: error.message };
    }
  }

  // ========================================
  // MÉTODOS AUXILIARES
  // ========================================

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
   * Obtener estudios de una orden de trabajo
   * @param {number} ordenTrabajoId - ID de la orden
   * @returns {Promise<Array>}
   */
  async getOrdenEstudios(ordenTrabajoId) {
    try {
      const result = await labsisPool.query(
        `SELECT p.nombre as estudio
         FROM prueba_orden po
         JOIN prueba p ON po.prueba_id = p.id
         WHERE po.orden_id = $1
         ORDER BY p.nombre`,
        [ordenTrabajoId]
      );

      return result.rows.map(r => r.estudio);

    } catch (error) {
      logger.error('Error obteniendo estudios de la orden:', error);
      return [];
    }
  }

  /**
   * Calcular fecha estimada (días hábiles)
   * @param {Date} startDate - Fecha inicial
   * @param {number} businessDays - Días hábiles
   * @returns {string}
   */
  calculateEstimatedDate(startDate, businessDays) {
    const date = new Date(startDate);
    let daysAdded = 0;

    while (daysAdded < businessDays) {
      date.setDate(date.getDate() + 1);
      // Saltar fines de semana
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        daysAdded++;
      }
    }

    return date.toLocaleDateString('es-VE');
  }

  /**
   * Registrar notificación en BD
   * @param {object} data - Datos de la notificación
   * @returns {Promise<void>}
   */
  async logNotification(data) {
    try {
      await botPool.query(
        `INSERT INTO system_notifications
         (orden_trabajo_id, paciente_id, notification_type, channel,
          telegram_chat_id, phone_number, message_text, status,
          error_message, twilio_message_sid, sent_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())`,
        [
          data.ordenTrabajoId || null,
          data.pacienteId || null,
          data.notificationType || null,
          data.channel || 'telegram',
          data.channel === 'telegram' ? data.identifier : null,
          data.channel === 'whatsapp' || data.channel === 'sms' ? data.identifier : null,
          data.messageText || '',
          data.status || 'sent',
          data.errorMessage || null,
          data.twilioMessageSid || null
        ]
      );

    } catch (error) {
      logger.error('Error registrando notificación:', error);
    }
  }
}

module.exports = new MultiChannelNotificationService();
