const botPool = require('../../db/botPool');
const logger = require('../../utils/logger');
const crypto = require('crypto');
const config = require('../../config/config');

/**
 * WhatsAppAuthorizationService
 * Gestiona la autorización de usuarios para el sandbox de Twilio WhatsApp
 * Similar a AuthorizationTokenService pero específico para WhatsApp
 */
class WhatsAppAuthorizationService {
  constructor() {
    this.TOKEN_EXPIRY_MINUTES = 10;
    this.WHATSAPP_SANDBOX_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';
    this.SANDBOX_CODE = process.env.TWILIO_WHATSAPP_SANDBOX_CODE || 'join upper-favorite';
  }

  /**
   * Generar token de autorización para WhatsApp
   * @param {string} phone - Número de teléfono en formato E.164
   * @param {number} pacienteId - ID del paciente (opcional)
   * @returns {Promise<{token: string, whatsappLink: string, expiresIn: number, expiresAt: Date}>}
   */
  async generateAuthorizationToken(phone, pacienteId = null) {
    try {
      // Generar token único
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + this.TOKEN_EXPIRY_MINUTES * 60 * 1000);

      // Guardar en base de datos
      await botPool.query(
        `INSERT INTO whatsapp_auth_tokens
         (token, phone_number, paciente_id, expires_at)
         VALUES ($1, $2, $3, $4)`,
        [token, phone, pacienteId, expiresAt]
      );

      // Generar link de WhatsApp
      // Formato: https://wa.me/14155238886?text=join%20upper-favorite
      const sandboxNumber = this.WHATSAPP_SANDBOX_NUMBER.replace('whatsapp:', '');
      const encodedMessage = encodeURIComponent(this.SANDBOX_CODE);
      const whatsappLink = `https://wa.me/${sandboxNumber}?text=${encodedMessage}`;

      logger.info(`✅ Token de autorización WhatsApp generado para ${phone}`);

      return {
        token,
        whatsappLink,
        expiresIn: this.TOKEN_EXPIRY_MINUTES,
        expiresAt,
        sandboxCode: this.SANDBOX_CODE
      };

    } catch (error) {
      logger.error(`❌ Error generando token de autorización WhatsApp: ${error.message}`);
      throw error;
    }
  }

  /**
   * Validar token de autorización
   * @param {string} token - Token a validar
   * @returns {Promise<{valid: boolean, phone?: string, pacienteId?: number, reason?: string}>}
   */
  async validateToken(token) {
    try {
      const result = await botPool.query(
        `SELECT * FROM whatsapp_auth_tokens
         WHERE token = $1
           AND is_used = FALSE
           AND expires_at > NOW()`,
        [token]
      );

      if (result.rows.length === 0) {
        // Verificar si existe pero está usado o expirado
        const usedResult = await botPool.query(
          `SELECT * FROM whatsapp_auth_tokens WHERE token = $1`,
          [token]
        );

        if (usedResult.rows.length > 0) {
          const authToken = usedResult.rows[0];
          if (authToken.is_used) {
            return { valid: false, reason: 'TOKEN_ALREADY_USED' };
          }
          if (new Date() > new Date(authToken.expires_at)) {
            return { valid: false, reason: 'TOKEN_EXPIRED' };
          }
        }

        return { valid: false, reason: 'INVALID_TOKEN' };
      }

      const authToken = result.rows[0];

      return {
        valid: true,
        phone: authToken.phone_number,
        pacienteId: authToken.paciente_id
      };

    } catch (error) {
      logger.error(`❌ Error validando token: ${error.message}`);
      return { valid: false, reason: 'DATABASE_ERROR' };
    }
  }

  /**
   * Marcar token como usado después de autorización exitosa
   * @param {string} token - Token a marcar
   * @returns {Promise<boolean>}
   */
  async markTokenAsUsed(token) {
    try {
      const result = await botPool.query(
        `UPDATE whatsapp_auth_tokens
         SET is_used = TRUE, used_at = NOW()
         WHERE token = $1`,
        [token]
      );

      return result.rowCount > 0;

    } catch (error) {
      logger.error(`❌ Error marcando token como usado: ${error.message}`);
      return false;
    }
  }

  /**
   * Verificar si un usuario ya está autorizado en WhatsApp
   * @param {string} phone - Número de teléfono
   * @returns {Promise<{isAuthorized: boolean, phoneNumber?: string}>}
   */
  async checkAuthorization(phone) {
    try {
      // Verificar en twilio_user_registry si el usuario está activo
      const result = await botPool.query(
        `SELECT phone_number, whatsapp_enabled, is_active, verification_status
         FROM twilio_user_registry
         WHERE phone_number = $1
           AND is_active = TRUE
           AND whatsapp_enabled = TRUE`,
        [phone]
      );

      if (result.rows.length > 0) {
        const user = result.rows[0];

        logger.info(`✅ Usuario autorizado en WhatsApp: ${phone}`);

        return {
          isAuthorized: true,
          phoneNumber: user.phone_number,
          verificationStatus: user.verification_status
        };
      }

      logger.info(`⚠️ Usuario NO autorizado en WhatsApp: ${phone}`);

      return {
        isAuthorized: false
      };

    } catch (error) {
      logger.error(`❌ Error verificando autorización: ${error.message}`);
      return { isAuthorized: false };
    }
  }

  /**
   * Registrar usuario autorizado en WhatsApp
   * @param {string} phone - Número de teléfono
   * @param {number} pacienteId - ID del paciente
   * @param {object} metadata - Metadata adicional
   * @returns {Promise<object>}
   */
  async registerAuthorizedUser(phone, pacienteId = null, metadata = {}) {
    try {
      // Verificar si el usuario ya existe
      const existing = await botPool.query(
        `SELECT * FROM twilio_user_registry WHERE phone_number = $1`,
        [phone]
      );

      if (existing.rows.length > 0) {
        // Actualizar usuario existente
        const result = await botPool.query(
          `UPDATE twilio_user_registry
           SET whatsapp_enabled = TRUE,
               is_active = TRUE,
               verification_status = 'verified',
               verified_at = NOW(),
               paciente_id = COALESCE($2, paciente_id),
               last_interaction = NOW()
           WHERE phone_number = $1
           RETURNING *`,
          [phone, pacienteId]
        );

        logger.info(`✅ Usuario WhatsApp actualizado: ${phone}`);
        return result.rows[0];

      } else {
        // Insertar nuevo usuario
        const result = await botPool.query(
          `INSERT INTO twilio_user_registry
           (phone_number, paciente_id, whatsapp_enabled, sms_enabled, is_active, verification_status, verified_at, last_interaction)
           VALUES ($1, $2, TRUE, FALSE, TRUE, 'verified', NOW(), NOW())
           RETURNING *`,
          [phone, pacienteId]
        );

        logger.info(`✅ Nuevo usuario WhatsApp registrado: ${phone}`);
        return result.rows[0];
      }

    } catch (error) {
      logger.error(`❌ Error registrando usuario autorizado: ${error.message}`);
      throw error;
    }
  }

  /**
   * Limpiar tokens expirados (mantenimiento)
   * @returns {Promise<number>}
   */
  async cleanupExpiredTokens() {
    try {
      const result = await botPool.query(
        `DELETE FROM whatsapp_auth_tokens
         WHERE expires_at < NOW() - INTERVAL '24 hours'`
      );

      logger.info(`🧹 Tokens WhatsApp expirados limpiados: ${result.rowCount}`);
      return result.rowCount;

    } catch (error) {
      logger.error(`❌ Error limpiando tokens: ${error.message}`);
      return 0;
    }
  }
}

// Exportar instancia singleton
module.exports = new WhatsAppAuthorizationService();
