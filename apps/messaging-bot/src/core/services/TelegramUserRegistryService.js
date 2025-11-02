const { botPool } = require('../../db/botPool');
const logger = require('../../utils/logger');

/**
 * TelegramUserRegistryService
 * Gestiona el registro y actualización de usuarios de Telegram
 */
class TelegramUserRegistryService {
  /**
   * Registrar o actualizar un usuario de Telegram
   * @param {object} userData - Datos del usuario
   * @param {string} userData.telegramChatId - Chat ID de Telegram
   * @param {string} userData.username - Username de Telegram
   * @param {string} userData.firstName - Nombre
   * @param {string} userData.lastName - Apellido
   * @param {string} userData.phone - Teléfono
   * @param {number} userData.pacienteId - ID del paciente en LABSIS
   * @returns {Promise<object>} Usuario registrado
   */
  async registerUser(userData) {
    try {
      const {
        telegramChatId,
        username,
        firstName,
        lastName,
        phone,
        pacienteId
      } = userData;

      // Verificar si el usuario ya existe
      const existing = await botPool.query(
        'SELECT * FROM telegram_user_registry WHERE telegram_chat_id = $1',
        [telegramChatId]
      );

      if (existing.rows.length > 0) {
        // Actualizar usuario existente
        const result = await botPool.query(
          `UPDATE telegram_user_registry
           SET username = $2,
               first_name = $3,
               last_name = $4,
               phone = COALESCE($5, phone),
               paciente_id = COALESCE($6, paciente_id),
               last_interaction = NOW(),
               is_active = TRUE
           WHERE telegram_chat_id = $1
           RETURNING *`,
          [telegramChatId, username, firstName, lastName, phone, pacienteId]
        );

        logger.info(`✅ Usuario actualizado: @${username} (chat_id: ${telegramChatId})`);
        return result.rows[0];
      } else {
        // Insertar nuevo usuario
        const result = await botPool.query(
          `INSERT INTO telegram_user_registry
           (telegram_chat_id, username, first_name, last_name, phone, paciente_id, is_active, last_interaction)
           VALUES ($1, $2, $3, $4, $5, $6, TRUE, NOW())
           RETURNING *`,
          [telegramChatId, username, firstName, lastName, phone, pacienteId]
        );

        logger.info(`✅ Nuevo usuario registrado: @${username} (chat_id: ${telegramChatId})`);
        return result.rows[0];
      }
    } catch (error) {
      logger.error(`❌ Error registrando usuario de Telegram: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtener usuario por chat_id
   * @param {string} telegramChatId - Chat ID de Telegram
   * @returns {Promise<object|null>} Usuario o null
   */
  async getUserByChatId(telegramChatId) {
    try {
      const result = await botPool.query(
        'SELECT * FROM telegram_user_registry WHERE telegram_chat_id = $1',
        [telegramChatId]
      );

      return result.rows[0] || null;
    } catch (error) {
      logger.error(`❌ Error obteniendo usuario: ${error.message}`);
      return null;
    }
  }

  /**
   * Obtener usuario por paciente_id
   * @param {number} pacienteId - ID del paciente
   * @returns {Promise<object|null>} Usuario o null
   */
  async getUserByPacienteId(pacienteId) {
    try {
      const result = await botPool.query(
        'SELECT * FROM telegram_user_registry WHERE paciente_id = $1 AND is_active = TRUE ORDER BY last_interaction DESC LIMIT 1',
        [pacienteId]
      );

      return result.rows[0] || null;
    } catch (error) {
      logger.error(`❌ Error obteniendo usuario por paciente_id: ${error.message}`);
      return null;
    }
  }

  /**
   * Actualizar paciente_id de un usuario
   * @param {string} telegramChatId - Chat ID
   * @param {number} pacienteId - ID del paciente
   * @returns {Promise<boolean>} true si se actualizó
   */
  async updatePacienteId(telegramChatId, pacienteId) {
    try {
      await botPool.query(
        'UPDATE telegram_user_registry SET paciente_id = $2 WHERE telegram_chat_id = $1',
        [telegramChatId, pacienteId]
      );

      logger.info(`✅ Paciente ID actualizado: chat_id=${telegramChatId}, paciente_id=${pacienteId}`);
      return true;
    } catch (error) {
      logger.error(`❌ Error actualizando paciente_id: ${error.message}`);
      return false;
    }
  }

  /**
   * Desactivar usuario
   * @param {string} telegramChatId - Chat ID
   * @returns {Promise<boolean>} true si se desactivó
   */
  async deactivateUser(telegramChatId) {
    try {
      await botPool.query(
        'UPDATE telegram_user_registry SET is_active = FALSE WHERE telegram_chat_id = $1',
        [telegramChatId]
      );

      logger.info(`✅ Usuario desactivado: chat_id=${telegramChatId}`);
      return true;
    } catch (error) {
      logger.error(`❌ Error desactivando usuario: ${error.message}`);
      return false;
    }
  }
}

// Exportar instancia singleton
module.exports = new TelegramUserRegistryService();
