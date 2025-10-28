const TelegramBot = require('node-telegram-bot-api');
const IMessagingAdapter = require('../../interfaces/IMessagingAdapter');
const UnifiedMessage = require('../../interfaces/UnifiedMessage');
const config = require('../../config/config');
const logger = require('../../utils/logger');

/**
 * TelegramAdapter - Implementación de IMessagingAdapter para Telegram
 *
 * Este adapter convierte mensajes de Telegram a UnifiedMessage
 * y permite que el core trabaje sin saber nada específico de Telegram
 */
class TelegramAdapter extends IMessagingAdapter {
  constructor() {
    super();
    this.bot = null;
    this.platform = 'telegram';
  }

  async initialize() {
    try {
      // Crear bot en modo polling (desarrollo)
      this.bot = new TelegramBot(config.telegram.botToken, {
        polling: true
      });

      logger.bot.started('telegram');
      logger.info(`🤖 Telegram bot initialized: @${(await this.bot.getMe()).username}`);

      return this.bot;
    } catch (error) {
      logger.bot.error('TelegramAdapter.initialize', error);
      throw error;
    }
  }

  async sendTextMessage(chatId, text, options = {}) {
    try {
      const message = await this.bot.sendMessage(chatId, text, {
        parse_mode: options.parseMode || 'Markdown',
        disable_web_page_preview: options.disablePreview || false,
        ...options
      });

      logger.bot.messageSent('telegram', chatId, 'text');

      return message;
    } catch (error) {
      logger.bot.error('TelegramAdapter.sendTextMessage', error, { chatId, text });
      throw error;
    }
  }

  async sendInteractiveMessage(chatId, text, buttons, options = {}) {
    try {
      // Convertir buttons a formato Telegram inline keyboard
      const inlineKeyboard = this._convertButtonsToInlineKeyboard(buttons);

      const message = await this.bot.sendMessage(chatId, text, {
        parse_mode: options.parseMode || 'Markdown',
        reply_markup: {
          inline_keyboard: inlineKeyboard
        },
        ...options
      });

      logger.bot.messageSent('telegram', chatId, 'interactive');

      return message;
    } catch (error) {
      logger.bot.error('TelegramAdapter.sendInteractiveMessage', error, { chatId });
      throw error;
    }
  }

  async sendImage(chatId, imageUrl, caption = '', options = {}) {
    try {
      const message = await this.bot.sendPhoto(chatId, imageUrl, {
        caption,
        parse_mode: options.parseMode || 'Markdown',
        ...options
      });

      logger.bot.messageSent('telegram', chatId, 'image');

      return message;
    } catch (error) {
      logger.bot.error('TelegramAdapter.sendImage', error, { chatId });
      throw error;
    }
  }

  async sendDocument(chatId, documentUrl, filename, options = {}) {
    try {
      const message = await this.bot.sendDocument(chatId, documentUrl, {
        caption: filename,
        ...options
      });

      logger.bot.messageSent('telegram', chatId, 'document');

      return message;
    } catch (error) {
      logger.bot.error('TelegramAdapter.sendDocument', error, { chatId });
      throw error;
    }
  }

  async sendLocation(chatId, latitude, longitude, options = {}) {
    try {
      const message = await this.bot.sendLocation(chatId, latitude, longitude, options);

      logger.bot.messageSent('telegram', chatId, 'location');

      return message;
    } catch (error) {
      logger.bot.error('TelegramAdapter.sendLocation', error, { chatId });
      throw error;
    }
  }

  async markAsRead(messageId) {
    // Telegram no tiene API para marcar como leído
    // Esto es un placeholder para mantener la interfaz
    return Promise.resolve();
  }

  async sendTypingIndicator(chatId) {
    try {
      await this.bot.sendChatAction(chatId, 'typing');
    } catch (error) {
      logger.bot.error('TelegramAdapter.sendTypingIndicator', error, { chatId });
    }
  }

  async getUserInfo(userId) {
    try {
      const chat = await this.bot.getChat(userId);

      return {
        id: chat.id.toString(),
        username: chat.username || null,
        firstName: chat.first_name || 'Usuario',
        lastName: chat.last_name || '',
        phoneNumber: null, // Telegram no expone el teléfono
        profilePhoto: null
      };
    } catch (error) {
      logger.bot.error('TelegramAdapter.getUserInfo', error, { userId });
      return {
        id: userId.toString(),
        username: null,
        firstName: 'Usuario',
        lastName: '',
        phoneNumber: null,
        profilePhoto: null
      };
    }
  }

  /**
   * MÉTODO CRÍTICO: Normaliza mensaje de Telegram a UnifiedMessage
   * @param {object} telegramMessage - Mensaje de Telegram
   * @returns {UnifiedMessage}
   */
  normalizeIncomingMessage(telegramMessage) {
    try {
      const messageId = telegramMessage.message_id.toString();
      const chatId = telegramMessage.chat.id.toString();
      const userId = telegramMessage.from.id.toString();

      // User info
      const userInfo = {
        username: telegramMessage.from.username || null,
        firstName: telegramMessage.from.first_name || 'Usuario',
        lastName: telegramMessage.from.last_name || '',
        phoneNumber: null, // No disponible en Telegram
        profilePhoto: null
      };

      // Determinar tipo de mensaje
      let type = 'text';
      let content = {
        text: null,
        mediaUrl: null,
        caption: null,
        location: null,
        callbackData: null
      };

      if (telegramMessage.text) {
        type = 'text';
        content.text = telegramMessage.text;
      } else if (telegramMessage.photo) {
        type = 'image';
        content.mediaUrl = telegramMessage.photo[telegramMessage.photo.length - 1].file_id;
        content.caption = telegramMessage.caption || '';
      } else if (telegramMessage.document) {
        type = 'document';
        content.mediaUrl = telegramMessage.document.file_id;
        content.caption = telegramMessage.caption || '';
      } else if (telegramMessage.location) {
        type = 'location';
        content.location = {
          latitude: telegramMessage.location.latitude,
          longitude: telegramMessage.location.longitude
        };
      }

      const unifiedMessage = new UnifiedMessage({
        messageId,
        chatId,
        userId,
        userInfo,
        type,
        content,
        platform: 'telegram',
        direction: 'inbound',
        timestamp: new Date(telegramMessage.date * 1000).toISOString(),
        metadata: {
          raw: telegramMessage
        }
      });

      logger.bot.messageReceived('telegram', userId, type, content.text || '');

      return unifiedMessage;

    } catch (error) {
      logger.bot.error('TelegramAdapter.normalizeIncomingMessage', error);
      throw error;
    }
  }

  /**
   * Normaliza callback query (botón presionado) a UnifiedMessage
   * @param {object} callbackQuery
   * @returns {UnifiedMessage}
   */
  normalizeCallbackQuery(callbackQuery) {
    try {
      const messageId = callbackQuery.id.toString();
      const chatId = callbackQuery.message.chat.id.toString();
      const userId = callbackQuery.from.id.toString();

      const userInfo = {
        username: callbackQuery.from.username || null,
        firstName: callbackQuery.from.first_name || 'Usuario',
        lastName: callbackQuery.from.last_name || '',
        phoneNumber: null,
        profilePhoto: null
      };

      const unifiedMessage = new UnifiedMessage({
        messageId,
        chatId,
        userId,
        userInfo,
        type: 'callback',
        content: {
          text: callbackQuery.data,
          callbackData: callbackQuery.data
        },
        platform: 'telegram',
        direction: 'inbound',
        timestamp: new Date().toISOString(),
        metadata: {
          raw: callbackQuery
        }
      });

      logger.bot.messageReceived('telegram', userId, 'callback', callbackQuery.data);

      return unifiedMessage;

    } catch (error) {
      logger.bot.error('TelegramAdapter.normalizeCallbackQuery', error);
      throw error;
    }
  }

  getPlatformName() {
    return 'telegram';
  }

  /**
   * Helper: Convierte buttons genéricos a inline keyboard de Telegram
   * @private
   * @param {Array<object>} buttons - [{text, callbackData}]
   * @returns {Array<Array<object>>}
   */
  _convertButtonsToInlineKeyboard(buttons) {
    if (!buttons || buttons.length === 0) return [];

    // Convertir a formato Telegram
    // Los botones ya vienen en filas (array de arrays)
    return buttons.map(row => {
      if (Array.isArray(row)) {
        // Es una fila de botones
        return row.map(btn => {
          const button = { text: btn.text };

          // Soportar tanto URL como callback_data
          if (btn.url) {
            button.url = btn.url;
          } else if (btn.callbackData || btn.callback_data) {
            button.callback_data = btn.callbackData || btn.callback_data;
          }

          return button;
        });
      } else {
        // Es un botón individual, convertirlo en fila
        const button = { text: row.text };

        if (row.url) {
          button.url = row.url;
        } else if (row.callbackData || row.callback_data) {
          button.callback_data = row.callbackData || row.callback_data;
        }

        return [button];
      }
    });
  }

  /**
   * Setup event handlers
   * @param {Function} onMessage - Callback para mensajes
   * @param {Function} onCallback - Callback para callbacks
   */
  setupHandlers(onMessage, onCallback) {
    if (!this.bot) {
      throw new Error('Bot not initialized. Call initialize() first.');
    }

    // Handler para mensajes
    this.bot.on('message', async (msg) => {
      try {
        const unifiedMessage = this.normalizeIncomingMessage(msg);
        await onMessage(unifiedMessage);
      } catch (error) {
        logger.bot.error('TelegramAdapter message handler', error);
      }
    });

    // Handler para callback queries (botones)
    this.bot.on('callback_query', async (query) => {
      try {
        // Answer callback query para quitar el "loading"
        await this.bot.answerCallbackQuery(query.id);

        const unifiedMessage = this.normalizeCallbackQuery(query);
        await onCallback(unifiedMessage);
      } catch (error) {
        logger.bot.error('TelegramAdapter callback handler', error);
      }
    });

    logger.info('📡 Telegram handlers configured');
  }

  /**
   * Stop the bot
   */
  async stop() {
    if (this.bot) {
      await this.bot.stopPolling();
      logger.bot.stopped('telegram');
    }
  }
}

module.exports = TelegramAdapter;
