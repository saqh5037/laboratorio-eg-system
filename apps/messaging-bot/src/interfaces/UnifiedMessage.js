/**
 * UnifiedMessage - Formato estandarizado para todos los mensajes
 *
 * Esta clase representa el "idioma común" que todas las plataformas usan internamente.
 * Los adaptadores convierten mensajes específicos de plataforma a UnifiedMessage,
 * y el núcleo trabaja ÚNICAMENTE con este formato.
 *
 * Patrón: Data Transfer Object (DTO)
 * Propósito: Desacoplar el núcleo de las especificidades de cada plataforma
 *
 * @class
 */
class UnifiedMessage {
  /**
   * Constructor
   * @param {object} data - Datos del mensaje
   * @param {string} data.messageId - ID único del mensaje en la plataforma
   * @param {string} data.conversationId - ID único de la conversación
   * @param {string} data.chatId - ID del chat/canal donde ocurrió el mensaje
   * @param {string} data.userId - ID del usuario que envió el mensaje
   * @param {object} data.userInfo - Información del usuario
   * @param {string} data.userInfo.username - Username del usuario
   * @param {string} data.userInfo.firstName - Nombre del usuario
   * @param {string} data.userInfo.lastName - Apellido del usuario
   * @param {string} [data.userInfo.phoneNumber] - Teléfono del usuario (si disponible)
   * @param {string} [data.userInfo.profilePhoto] - URL de foto de perfil
   * @param {string} data.type - Tipo de mensaje: 'text', 'image', 'document', 'location', 'callback'
   * @param {object} data.content - Contenido del mensaje
   * @param {string} [data.content.text] - Texto del mensaje (si type='text' o 'callback')
   * @param {string} [data.content.mediaUrl] - URL del media (si type='image' o 'document')
   * @param {string} [data.content.caption] - Caption del media
   * @param {object} [data.content.location] - {latitude, longitude} si type='location'
   * @param {string} [data.content.callbackData] - Datos del callback (si type='callback')
   * @param {string} data.platform - Plataforma de origen: 'telegram', 'whatsapp', 'discord', etc.
   * @param {string} data.direction - Dirección: 'inbound' o 'outbound'
   * @param {string} [data.timestamp] - Timestamp ISO del mensaje
   * @param {object} [data.metadata={}] - Metadata adicional específica de plataforma
   */
  constructor(data) {
    // Validaciones básicas
    if (!data.messageId) throw new Error('messageId is required');
    if (!data.chatId) throw new Error('chatId is required');
    if (!data.userId) throw new Error('userId is required');
    if (!data.platform) throw new Error('platform is required');
    if (!data.type) throw new Error('type is required');

    // IDs
    this.messageId = data.messageId;
    this.conversationId = data.conversationId || `${data.platform}_${data.chatId}`;
    this.chatId = data.chatId;
    this.userId = data.userId;

    // Información del usuario
    this.userInfo = {
      username: data.userInfo?.username || null,
      firstName: data.userInfo?.firstName || 'Usuario',
      lastName: data.userInfo?.lastName || '',
      phoneNumber: data.userInfo?.phoneNumber || null,
      profilePhoto: data.userInfo?.profilePhoto || null
    };

    // Tipo de mensaje
    this.type = this._validateType(data.type);

    // Contenido del mensaje
    this.content = {
      text: data.content?.text || null,
      mediaUrl: data.content?.mediaUrl || null,
      caption: data.content?.caption || null,
      location: data.content?.location || null,
      callbackData: data.content?.callbackData || null
    };

    // Metadata
    this.platform = this._validatePlatform(data.platform);
    this.direction = this._validateDirection(data.direction || 'inbound');
    this.timestamp = data.timestamp || new Date().toISOString();
    this.metadata = data.metadata || {};
  }

  /**
   * Valida que el tipo de mensaje sea válido
   * @private
   * @param {string} type - Tipo de mensaje
   * @returns {string} - Tipo validado
   */
  _validateType(type) {
    const validTypes = ['text', 'image', 'document', 'location', 'callback'];
    if (!validTypes.includes(type)) {
      throw new Error(`Invalid message type: ${type}. Must be one of: ${validTypes.join(', ')}`);
    }
    return type;
  }

  /**
   * Valida que la plataforma sea conocida
   * @private
   * @param {string} platform - Nombre de la plataforma
   * @returns {string} - Plataforma validada
   */
  _validatePlatform(platform) {
    const validPlatforms = ['telegram', 'whatsapp', 'discord', 'slack', 'mock'];
    if (!validPlatforms.includes(platform)) {
      console.warn(`Unknown platform: ${platform}. Proceeding anyway.`);
    }
    return platform;
  }

  /**
   * Valida la dirección del mensaje
   * @private
   * @param {string} direction - Dirección del mensaje
   * @returns {string} - Dirección validada
   */
  _validateDirection(direction) {
    const validDirections = ['inbound', 'outbound'];
    if (!validDirections.includes(direction)) {
      throw new Error(`Invalid direction: ${direction}. Must be 'inbound' or 'outbound'`);
    }
    return direction;
  }

  /**
   * Verifica si el mensaje es de tipo texto
   * @returns {boolean}
   */
  isText() {
    return this.type === 'text';
  }

  /**
   * Verifica si el mensaje es de tipo callback (botón presionado)
   * @returns {boolean}
   */
  isCallback() {
    return this.type === 'callback';
  }

  /**
   * Verifica si el mensaje es de tipo imagen
   * @returns {boolean}
   */
  isImage() {
    return this.type === 'image';
  }

  /**
   * Verifica si el mensaje es de tipo documento
   * @returns {boolean}
   */
  isDocument() {
    return this.type === 'document';
  }

  /**
   * Verifica si el mensaje es de tipo ubicación
   * @returns {boolean}
   */
  isLocation() {
    return this.type === 'location';
  }

  /**
   * Obtiene el texto del mensaje (funciona para type='text' y type='callback')
   * @returns {string|null}
   */
  getText() {
    return this.content.text;
  }

  /**
   * Obtiene los datos del callback si es type='callback'
   * @returns {string|null}
   */
  getCallbackData() {
    return this.content.callbackData;
  }

  /**
   * Obtiene el nombre completo del usuario
   * @returns {string}
   */
  getFullName() {
    const firstName = this.userInfo.firstName || '';
    const lastName = this.userInfo.lastName || '';
    return `${firstName} ${lastName}`.trim() || 'Usuario';
  }

  /**
   * Convierte el mensaje a formato JSON para guardar en base de datos
   * @returns {object}
   */
  toJSON() {
    return {
      messageId: this.messageId,
      conversationId: this.conversationId,
      chatId: this.chatId,
      userId: this.userId,
      userInfo: this.userInfo,
      type: this.type,
      content: this.content,
      platform: this.platform,
      direction: this.direction,
      timestamp: this.timestamp,
      metadata: this.metadata
    };
  }

  /**
   * Crea una instancia desde datos de base de datos
   * @static
   * @param {object} dbData - Datos desde la base de datos
   * @returns {UnifiedMessage}
   */
  static fromDatabase(dbData) {
    return new UnifiedMessage({
      messageId: dbData.message_id,
      conversationId: dbData.conversation_id,
      chatId: dbData.chat_id || dbData.conversationId?.split('_')[1], // Extraer del conversationId si es necesario
      userId: dbData.user_id || 'unknown',
      userInfo: dbData.user_info || {},
      type: dbData.type,
      content: dbData.content,
      platform: dbData.platform,
      direction: dbData.direction,
      timestamp: dbData.created_at || dbData.timestamp,
      metadata: dbData.metadata || {}
    });
  }

  /**
   * Crea un mensaje de respuesta basado en este mensaje
   * Útil para mantener el contexto de conversación
   * @param {string} text - Texto de la respuesta
   * @param {string} [type='text'] - Tipo de mensaje
   * @returns {UnifiedMessage}
   */
  createReply(text, type = 'text') {
    return new UnifiedMessage({
      messageId: `reply_${Date.now()}`,
      conversationId: this.conversationId,
      chatId: this.chatId,
      userId: 'bot',
      userInfo: {
        username: 'laboratorio_eg_bot',
        firstName: 'Laboratorio',
        lastName: 'EG',
        phoneNumber: null,
        profilePhoto: null
      },
      type: type,
      content: {
        text: text
      },
      platform: this.platform,
      direction: 'outbound',
      timestamp: new Date().toISOString(),
      metadata: {
        replyTo: this.messageId
      }
    });
  }

  /**
   * Representación en string para debugging
   * @returns {string}
   */
  toString() {
    return `[UnifiedMessage] ${this.platform}/${this.type} from ${this.getFullName()}: ${this.getText() || this.getCallbackData() || '(no text)'}`;
  }
}

module.exports = UnifiedMessage;
