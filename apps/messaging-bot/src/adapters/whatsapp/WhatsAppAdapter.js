const IMessagingAdapter = require('../../interfaces/IMessagingAdapter');
const UnifiedMessage = require('../../interfaces/UnifiedMessage');
const TwilioService = require('../../core/services/TwilioService');
const config = require('../../config/config');
const logger = require('../../utils/logger');

/**
 * WhatsAppAdapter - Implementación de IMessagingAdapter para WhatsApp vía Twilio
 *
 * Este adapter convierte mensajes de WhatsApp a UnifiedMessage
 * y permite que el core trabaje sin saber nada específico de WhatsApp/Twilio
 *
 * @extends IMessagingAdapter
 */
class WhatsAppAdapter extends IMessagingAdapter {
  constructor() {
    super();
    this.platform = 'whatsapp';
    this.enabled = config.whatsapp?.enabled || false;
    this.webhookPath = '/api/webhooks/whatsapp'; // Para recibir mensajes entrantes
  }

  /**
   * Inicializa el adapter de WhatsApp
   * @returns {Promise<void>}
   */
  async initialize() {
    try {
      if (!this.enabled) {
        logger.info('📱 WhatsApp adapter está deshabilitado en config');
        return;
      }

      // Verificar que TwilioService esté configurado
      if (!TwilioService.enabled) {
        throw new Error('TwilioService no está habilitado - requerido para WhatsApp');
      }

      logger.bot.started('whatsapp');
      logger.info(`📱 WhatsApp adapter inicializado vía Twilio`);
      logger.info(`   - Sandbox: ${TwilioService.whatsappSandbox ? 'Activo' : 'Desactivado'}`);
      logger.info(`   - Número: ${TwilioService.whatsappNumber}`);

      return true;
    } catch (error) {
      logger.bot.error('WhatsAppAdapter.initialize', error);
      throw error;
    }
  }

  /**
   * Envía un mensaje de texto simple por WhatsApp
   * @param {string} phoneNumber - Número de teléfono en formato E.164 o local
   * @param {string} text - Texto del mensaje
   * @param {object} [options={}] - Opciones adicionales
   * @returns {Promise<object>} - Resultado del envío
   */
  async sendTextMessage(phoneNumber, text, options = {}) {
    try {
      if (!this.enabled) {
        logger.warn('WhatsApp adapter deshabilitado - mensaje no enviado');
        return { success: false, error: 'WhatsApp adapter disabled' };
      }

      // Formatear mensaje para WhatsApp
      const formattedText = this._formatMessageForWhatsApp(text, options);

      // Enviar vía Twilio
      const result = await TwilioService.sendWhatsApp(phoneNumber, formattedText);

      if (result.success) {
        logger.bot.messageSent('whatsapp', phoneNumber, 'text');
      }

      return result;
    } catch (error) {
      logger.bot.error('WhatsAppAdapter.sendTextMessage', error, { phoneNumber, text });
      throw error;
    }
  }

  /**
   * Envía un mensaje interactivo con botones
   * NOTA: WhatsApp vía Twilio no soporta botones nativos en Sandbox
   * Los botones se convierten en texto numerado
   *
   * @param {string} phoneNumber - Número de teléfono
   * @param {string} text - Texto del mensaje
   * @param {Array<object>} buttons - Botones (serán convertidos a texto)
   * @param {object} [options={}] - Opciones adicionales
   * @returns {Promise<object>} - Resultado del envío
   */
  async sendInteractiveMessage(phoneNumber, text, buttons, options = {}) {
    try {
      if (!this.enabled) {
        logger.warn('WhatsApp adapter deshabilitado - mensaje no enviado');
        return { success: false, error: 'WhatsApp adapter disabled' };
      }

      // Convertir botones a texto numerado
      const buttonText = this._convertButtonsToText(buttons);
      const fullMessage = `${text}\n\n${buttonText}`;

      // Enviar como mensaje de texto
      const result = await this.sendTextMessage(phoneNumber, fullMessage, options);

      if (result.success) {
        logger.bot.messageSent('whatsapp', phoneNumber, 'interactive');
      }

      return result;
    } catch (error) {
      logger.bot.error('WhatsAppAdapter.sendInteractiveMessage', error, { phoneNumber });
      throw error;
    }
  }

  /**
   * Envía una imagen con caption
   * WhatsApp Sandbox tiene limitaciones para envío de media
   *
   * @param {string} phoneNumber - Número de teléfono
   * @param {string} imageUrl - URL de la imagen
   * @param {string} [caption=''] - Caption de la imagen
   * @param {object} [options={}] - Opciones adicionales
   * @returns {Promise<object>} - Resultado del envío
   */
  async sendImage(phoneNumber, imageUrl, caption = '', options = {}) {
    try {
      if (!this.enabled) {
        logger.warn('WhatsApp adapter deshabilitado - imagen no enviada');
        return { success: false, error: 'WhatsApp adapter disabled' };
      }

      // Por ahora, enviar solo el caption con la URL
      // TODO: Implementar envío de media con Twilio API cuando salga del sandbox
      const message = caption
        ? `${caption}\n\n📷 Imagen: ${imageUrl}`
        : `📷 ${imageUrl}`;

      const result = await this.sendTextMessage(phoneNumber, message, options);

      if (result.success) {
        logger.bot.messageSent('whatsapp', phoneNumber, 'image');
      }

      return result;
    } catch (error) {
      logger.bot.error('WhatsAppAdapter.sendImage', error, { phoneNumber });
      throw error;
    }
  }

  /**
   * Envía un documento/archivo
   * WhatsApp Sandbox tiene limitaciones para envío de documentos
   *
   * @param {string} phoneNumber - Número de teléfono
   * @param {string} documentUrl - URL del documento
   * @param {string} filename - Nombre del archivo
   * @param {object} [options={}] - Opciones adicionales
   * @returns {Promise<object>} - Resultado del envío
   */
  async sendDocument(phoneNumber, documentUrl, filename, options = {}) {
    try {
      if (!this.enabled) {
        logger.warn('WhatsApp adapter deshabilitado - documento no enviado');
        return { success: false, error: 'WhatsApp adapter disabled' };
      }

      // Enviar URL del documento
      const message = `📄 *${filename}*\n\n${documentUrl}`;

      const result = await this.sendTextMessage(phoneNumber, message, options);

      if (result.success) {
        logger.bot.messageSent('whatsapp', phoneNumber, 'document');
      }

      return result;
    } catch (error) {
      logger.bot.error('WhatsAppAdapter.sendDocument', error, { phoneNumber });
      throw error;
    }
  }

  /**
   * Envía una ubicación (coordenadas GPS)
   * WhatsApp soporta envío de ubicaciones
   *
   * @param {string} phoneNumber - Número de teléfono
   * @param {number} latitude - Latitud
   * @param {number} longitude - Longitud
   * @param {object} [options={}] - Opciones adicionales
   * @returns {Promise<object>} - Resultado del envío
   */
  async sendLocation(phoneNumber, latitude, longitude, options = {}) {
    try {
      if (!this.enabled) {
        logger.warn('WhatsApp adapter deshabilitado - ubicación no enviada');
        return { success: false, error: 'WhatsApp adapter disabled' };
      }

      // Enviar ubicación como mensaje de texto con Google Maps link
      const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
      const message = `📍 *Ubicación*\n\n${mapsUrl}\n\nCoordenadas:\nLat: ${latitude}\nLon: ${longitude}`;

      const result = await this.sendTextMessage(phoneNumber, message, options);

      if (result.success) {
        logger.bot.messageSent('whatsapp', phoneNumber, 'location');
      }

      return result;
    } catch (error) {
      logger.bot.error('WhatsAppAdapter.sendLocation', error, { phoneNumber });
      throw error;
    }
  }

  /**
   * Marca un mensaje como leído
   * WhatsApp vía Twilio no soporta marcado de lectura en Sandbox
   *
   * @param {string} messageId - ID del mensaje
   * @returns {Promise<void>}
   */
  async markAsRead(messageId) {
    // No soportado en WhatsApp Sandbox
    logger.debug(`markAsRead no soportado en WhatsApp Sandbox: ${messageId}`);
    return;
  }

  /**
   * Muestra indicador de "escribiendo..."
   * WhatsApp vía Twilio no soporta indicadores de escritura
   *
   * @param {string} phoneNumber - Número de teléfono
   * @returns {Promise<void>}
   */
  async sendTypingIndicator(phoneNumber) {
    // No soportado en WhatsApp vía Twilio
    logger.debug(`sendTypingIndicator no soportado en WhatsApp: ${phoneNumber}`);
    return;
  }

  /**
   * Obtiene información del usuario
   * WhatsApp vía Twilio tiene acceso limitado a info del usuario
   *
   * @param {string} phoneNumber - Número de teléfono
   * @returns {Promise<object>} - Información del usuario
   */
  async getUserInfo(phoneNumber) {
    try {
      // WhatsApp API de Twilio no proporciona info detallada del usuario
      // Solo retornamos lo básico
      return {
        id: phoneNumber,
        phoneNumber: phoneNumber,
        platform: 'whatsapp',
        username: null,
        firstName: null,
        lastName: null,
        profilePhoto: null
      };
    } catch (error) {
      logger.bot.error('WhatsAppAdapter.getUserInfo', error, { phoneNumber });
      throw error;
    }
  }

  /**
   * MÉTODO CRÍTICO: Normaliza un mensaje de WhatsApp a UnifiedMessage
   *
   * Este método convierte webhooks de Twilio WhatsApp a formato unificado
   *
   * @param {object} twilioWebhook - Webhook de Twilio WhatsApp
   * @returns {UnifiedMessage} - Mensaje en formato unificado
   */
  normalizeIncomingMessage(twilioWebhook) {
    try {
      // Formato del webhook de Twilio WhatsApp:
      // {
      //   From: 'whatsapp:+5215512345678',
      //   To: 'whatsapp:+14155238886',
      //   Body: 'Texto del mensaje',
      //   MessageSid: 'SM...',
      //   NumMedia: '0',
      //   ProfileName: 'Juan Pérez'
      // }

      const phoneNumber = twilioWebhook.From?.replace('whatsapp:', '') || '';
      const messageText = twilioWebhook.Body || '';
      const profileName = twilioWebhook.ProfileName || '';

      return new UnifiedMessage({
        messageId: twilioWebhook.MessageSid,
        chatId: phoneNumber,
        userId: phoneNumber,
        text: messageText,
        platform: 'whatsapp',
        timestamp: new Date(),
        from: {
          id: phoneNumber,
          username: null,
          firstName: profileName.split(' ')[0] || null,
          lastName: profileName.split(' ').slice(1).join(' ') || null,
          phoneNumber: phoneNumber
        },
        isCommand: messageText.startsWith('/'),
        command: messageText.startsWith('/') ? messageText.split(' ')[0].slice(1) : null,
        commandArgs: messageText.startsWith('/') ? messageText.split(' ').slice(1) : [],
        raw: twilioWebhook
      });
    } catch (error) {
      logger.bot.error('WhatsAppAdapter.normalizeIncomingMessage', error, { twilioWebhook });
      throw error;
    }
  }

  /**
   * Retorna el nombre de la plataforma
   * @returns {string} - 'whatsapp'
   */
  getPlatformName() {
    return this.platform;
  }

  /**
   * Configura los handlers para mensajes entrantes
   * @param {Function} messageHandler - Handler para procesar mensajes
   * @returns {void}
   */
  setupHandlers(messageHandler) {
    this.messageHandler = messageHandler;
    logger.info(`📱 WhatsApp handlers configurados - Webhook: ${this.webhookPath}`);
  }

  /**
   * Procesa webhook de Twilio WhatsApp
   * Este método debe ser llamado desde la ruta del webhook
   *
   * @param {object} req - Request de Express con el webhook de Twilio
   * @returns {Promise<void>}
   */
  async processWebhook(req) {
    try {
      const twilioWebhook = req.body;

      // Normalizar a UnifiedMessage
      const unifiedMessage = this.normalizeIncomingMessage(twilioWebhook);

      // Pasar al handler del core
      if (this.messageHandler) {
        await this.messageHandler(unifiedMessage);
      }

      logger.bot.messageReceived('whatsapp', unifiedMessage.chatId, unifiedMessage.text);
    } catch (error) {
      logger.bot.error('WhatsAppAdapter.processWebhook', error);
      throw error;
    }
  }

  // ========================================
  // MÉTODOS PRIVADOS / HELPERS
  // ========================================

  /**
   * Formatea mensaje para WhatsApp (preserva markdown y emojis)
   * @private
   * @param {string} text - Texto original
   * @param {object} options - Opciones
   * @returns {string} - Texto formateado
   */
  _formatMessageForWhatsApp(text, options = {}) {
    let formatted = text;

    // WhatsApp soporta markdown básico
    // *negrita* _cursiva_ ~tachado~ ```código```

    // Reemplazar placeholders de emojis
    formatted = formatted.replace(/\[CHECKMARK\]/gi, '✅');
    formatted = formatted.replace(/\[LAB\]/gi, '🔬');
    formatted = formatted.replace(/\[CLOCK\]/gi, '⏰');
    formatted = formatted.replace(/\[PHONE\]/gi, '📱');
    formatted = formatted.replace(/\[EMAIL\]/gi, '📧');
    formatted = formatted.replace(/\[LOCATION\]/gi, '📍');

    return formatted.trim();
  }

  /**
   * Convierte botones a texto numerado
   * @private
   * @param {Array<object>} buttons - Botones
   * @returns {string} - Texto con opciones numeradas
   */
  _convertButtonsToText(buttons) {
    if (!buttons || buttons.length === 0) {
      return '';
    }

    const options = buttons.map((btn, index) => {
      return `${index + 1}. ${btn.text}`;
    }).join('\n');

    return `📋 *Opciones:*\n${options}\n\n_Responde con el número de la opción_`;
  }

  /**
   * Detiene el adapter
   * @returns {void}
   */
  stop() {
    logger.info('📱 WhatsApp adapter detenido');
  }
}

module.exports = WhatsAppAdapter;
