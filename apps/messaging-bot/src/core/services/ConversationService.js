const { query } = require('../../db/pool');
const logger = require('../../utils/logger');

/**
 * ConversationService - CRUD operations for conversations
 * Platform-agnostic service
 */
class ConversationService {
  /**
   * Create or update conversation
   * @param {object} data - Conversation data
   * @returns {Promise<object>}
   */
  async upsertConversation(data) {
    try {
      const { conversationId, platform, chatId, userId, userInfo, state, context } = data;

      const result = await query(`
        INSERT INTO bot_conversations (
          conversation_id, platform, chat_id, user_id, user_info, state, context
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (conversation_id)
        DO UPDATE SET
          user_info = EXCLUDED.user_info,
          state = EXCLUDED.state,
          context = EXCLUDED.context,
          last_message_at = NOW(),
          updated_at = NOW()
        RETURNING *
      `, [conversationId, platform, chatId, userId, JSON.stringify(userInfo || {}), state || 'active', JSON.stringify(context || {})]);

      return result.rows[0];
    } catch (error) {
      logger.bot.error('ConversationService.upsertConversation', error);
      throw error;
    }
  }

  /**
   * Get conversation by ID
   * @param {string} conversationId
   * @returns {Promise<object|null>}
   */
  async getConversation(conversationId) {
    try {
      const result = await query(
        'SELECT * FROM bot_conversations WHERE conversation_id = $1',
        [conversationId]
      );

      return result.rows[0] || null;
    } catch (error) {
      logger.bot.error('ConversationService.getConversation', error);
      return null;
    }
  }

  /**
   * Update conversation state
   * @param {string} conversationId
   * @param {string} state
   * @returns {Promise<object>}
   */
  async updateState(conversationId, state) {
    try {
      const result = await query(
        'UPDATE bot_conversations SET state = $1, updated_at = NOW() WHERE conversation_id = $2 RETURNING *',
        [state, conversationId]
      );

      return result.rows[0];
    } catch (error) {
      logger.bot.error('ConversationService.updateState', error);
      throw error;
    }
  }

  /**
   * Update conversation context
   * @param {string} conversationId
   * @param {object} context
   * @returns {Promise<object>}
   */
  async updateContext(conversationId, context) {
    try {
      const result = await query(
        'UPDATE bot_conversations SET context = $1, updated_at = NOW() WHERE conversation_id = $2 RETURNING *',
        [JSON.stringify(context), conversationId]
      );

      return result.rows[0];
    } catch (error) {
      logger.bot.error('ConversationService.updateContext', error);
      throw error;
    }
  }

  /**
   * Save message
   * @param {object} message - UnifiedMessage data
   * @returns {Promise<object>}
   */
  async saveMessage(message) {
    try {
      const result = await query(`
        INSERT INTO bot_messages (
          message_id, conversation_id, platform, direction, type, content, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [
        message.messageId,
        message.conversationId,
        message.platform,
        message.direction,
        message.type,
        JSON.stringify(message.content),
        JSON.stringify(message.metadata || {})
      ]);

      return result.rows[0];
    } catch (error) {
      logger.bot.error('ConversationService.saveMessage', error);
      throw error;
    }
  }

  /**
   * Get conversation history
   * @param {string} conversationId
   * @param {number} limit
   * @returns {Promise<Array>}
   */
  async getHistory(conversationId, limit = 10) {
    try {
      const result = await query(`
        SELECT * FROM bot_messages
        WHERE conversation_id = $1
        ORDER BY created_at DESC
        LIMIT $2
      `, [conversationId, limit]);

      return result.rows.reverse(); // Orden cronológico
    } catch (error) {
      logger.bot.error('ConversationService.getHistory', error);
      return [];
    }
  }
}

module.exports = new ConversationService();
