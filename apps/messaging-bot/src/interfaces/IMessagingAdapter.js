/**
 * IMessagingAdapter - Interface abstracta para adapters de plataformas de mensajería
 *
 * Todos los adaptadores (Telegram, WhatsApp, Discord, etc.) DEBEN implementar esta interface.
 * Esto permite que el núcleo de la aplicación sea completamente agnóstico a la plataforma.
 *
 * Patrón: Adapter Pattern
 * Propósito: 85% código compartido, 15% específico de plataforma
 *
 * @abstract
 */
class IMessagingAdapter {
  /**
   * Inicializa el bot/conexión con la plataforma
   * @abstract
   * @returns {Promise<void>}
   */
  async initialize() {
    throw new Error('initialize() must be implemented by subclass');
  }

  /**
   * Envía un mensaje de texto simple
   * @abstract
   * @param {string} chatId - ID del chat/conversación
   * @param {string} text - Texto del mensaje
   * @param {object} [options={}] - Opciones adicionales (parseMode, disablePreview, etc.)
   * @returns {Promise<object>} - Mensaje enviado
   */
  async sendTextMessage(chatId, text, options = {}) {
    throw new Error('sendTextMessage() must be implemented by subclass');
  }

  /**
   * Envía un mensaje interactivo con botones
   * @abstract
   * @param {string} chatId - ID del chat/conversación
   * @param {string} text - Texto del mensaje
   * @param {Array<object>} buttons - Botones interactivos
   * @param {object} [options={}] - Opciones adicionales
   * @returns {Promise<object>} - Mensaje enviado
   *
   * Formato de buttons:
   * [
   *   { text: 'Opción 1', callbackData: 'option_1' },
   *   { text: 'Opción 2', callbackData: 'option_2' }
   * ]
   */
  async sendInteractiveMessage(chatId, text, buttons, options = {}) {
    throw new Error('sendInteractiveMessage() must be implemented by subclass');
  }

  /**
   * Envía una imagen con caption
   * @abstract
   * @param {string} chatId - ID del chat/conversación
   * @param {string} imageUrl - URL o path de la imagen
   * @param {string} [caption=''] - Caption de la imagen
   * @param {object} [options={}] - Opciones adicionales
   * @returns {Promise<object>} - Mensaje enviado
   */
  async sendImage(chatId, imageUrl, caption = '', options = {}) {
    throw new Error('sendImage() must be implemented by subclass');
  }

  /**
   * Envía un documento/archivo
   * @abstract
   * @param {string} chatId - ID del chat/conversación
   * @param {string} documentUrl - URL o path del documento
   * @param {string} filename - Nombre del archivo
   * @param {object} [options={}] - Opciones adicionales
   * @returns {Promise<object>} - Mensaje enviado
   */
  async sendDocument(chatId, documentUrl, filename, options = {}) {
    throw new Error('sendDocument() must be implemented by subclass');
  }

  /**
   * Envía una ubicación (coordenadas GPS)
   * @abstract
   * @param {string} chatId - ID del chat/conversación
   * @param {number} latitude - Latitud
   * @param {number} longitude - Longitud
   * @param {object} [options={}] - Opciones adicionales
   * @returns {Promise<object>} - Mensaje enviado
   */
  async sendLocation(chatId, latitude, longitude, options = {}) {
    throw new Error('sendLocation() must be implemented by subclass');
  }

  /**
   * Marca un mensaje como leído
   * @abstract
   * @param {string} messageId - ID del mensaje
   * @returns {Promise<void>}
   */
  async markAsRead(messageId) {
    throw new Error('markAsRead() must be implemented by subclass');
  }

  /**
   * Muestra indicador de "escribiendo..." al usuario
   * @abstract
   * @param {string} chatId - ID del chat/conversación
   * @returns {Promise<void>}
   */
  async sendTypingIndicator(chatId) {
    throw new Error('sendTypingIndicator() must be implemented by subclass');
  }

  /**
   * Obtiene información del usuario
   * @abstract
   * @param {string} userId - ID del usuario
   * @returns {Promise<object>} - Información del usuario
   *
   * Formato de respuesta:
   * {
   *   id: 'user123',
   *   username: 'juan',
   *   firstName: 'Juan',
   *   lastName: 'Pérez',
   *   phoneNumber: '+50612345678',
   *   profilePhoto: 'https://...'
   * }
   */
  async getUserInfo(userId) {
    throw new Error('getUserInfo() must be implemented by subclass');
  }

  /**
   * MÉTODO CRÍTICO: Normaliza un mensaje de la plataforma a UnifiedMessage
   *
   * Este método es la CLAVE del patrón Adapter.
   * Convierte mensajes específicos de plataforma (Telegram Message, WhatsApp Webhook, etc.)
   * a un formato unificado que el núcleo puede procesar.
   *
   * @abstract
   * @param {object} platformMessage - Mensaje en formato de la plataforma
   * @returns {UnifiedMessage} - Mensaje en formato unificado
   */
  normalizeIncomingMessage(platformMessage) {
    throw new Error('normalizeIncomingMessage() must be implemented by subclass');
  }

  /**
   * Retorna el nombre de la plataforma
   * @abstract
   * @returns {string} - Nombre de la plataforma ('telegram', 'whatsapp', 'discord', etc.)
   */
  getPlatformName() {
    throw new Error('getPlatformName() must be implemented by subclass');
  }

  /**
   * Valida que la implementación tiene todos los métodos requeridos
   * @returns {boolean}
   */
  validate() {
    const requiredMethods = [
      'initialize',
      'sendTextMessage',
      'sendInteractiveMessage',
      'sendImage',
      'sendDocument',
      'sendLocation',
      'markAsRead',
      'sendTypingIndicator',
      'getUserInfo',
      'normalizeIncomingMessage',
      'getPlatformName'
    ];

    for (const method of requiredMethods) {
      if (typeof this[method] !== 'function') {
        throw new Error(`${this.constructor.name} must implement ${method}()`);
      }

      // Verificar que no es el método base (que lanza error)
      const methodStr = this[method].toString();
      if (methodStr.includes('must be implemented by subclass')) {
        throw new Error(`${this.constructor.name} has not implemented ${method}()`);
      }
    }

    return true;
  }
}

module.exports = IMessagingAdapter;
