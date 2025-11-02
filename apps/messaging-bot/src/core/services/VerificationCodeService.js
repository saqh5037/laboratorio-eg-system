const botPool = require('../../db/botPool');
const logger = require('../../utils/logger');
const crypto = require('crypto');

/**
 * VerificationCodeService
 * Gestiona la generación, almacenamiento y validación de códigos de verificación
 * Soporta múltiples canales: SMS, WhatsApp, Telegram
 */
class VerificationCodeService {
  constructor() {
    this.CODE_LENGTH = 6;
    this.CODE_EXPIRY_MINUTES = 10;
    this.MAX_ATTEMPTS = 5;
  }

  /**
   * Generar código de verificación de 6 dígitos
   * @returns {string} Código de 6 dígitos
   */
  generateCode() {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Guardar código en base de datos
   * @param {string} phone - Número de teléfono
   * @param {string} code - Código generado
   * @param {string} channel - Canal: 'sms', 'whatsapp', 'telegram'
   * @param {object} metadata - Metadata adicional
   * @returns {Promise<object>} Código guardado
   */
  async saveCode(phone, code, channel = 'whatsapp', metadata = {}) {
    try {
      // Invalidar códigos anteriores del mismo número
      await botPool.query(
        `UPDATE verification_codes
         SET is_used = TRUE, updated_at = NOW()
         WHERE phone_number = $1 AND is_used = FALSE`,
        [phone]
      );

      // Insertar nuevo código
      const expiresAt = new Date(Date.now() + this.CODE_EXPIRY_MINUTES * 60 * 1000);

      const result = await botPool.query(
        `INSERT INTO verification_codes
         (phone_number, code, channel, expires_at, metadata)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [phone, code, channel, expiresAt, JSON.stringify(metadata)]
      );

      logger.info(`✅ Código guardado: ${phone} (${channel}) - Expira en ${this.CODE_EXPIRY_MINUTES} min`);

      return result.rows[0];

    } catch (error) {
      logger.error(`❌ Error guardando código: ${error.message}`);
      throw error;
    }
  }

  /**
   * Validar código de verificación
   * @param {string} phone - Número de teléfono
   * @param {string} code - Código a validar
   * @param {string} channel - Canal esperado
   * @returns {Promise<{valid: boolean, reason?: string, metadata?: object}>}
   */
  async validateCode(phone, code, channel = 'whatsapp') {
    try {
      // Buscar código
      const result = await botPool.query(
        `SELECT * FROM verification_codes
         WHERE phone_number = $1
           AND code = $2
           AND channel = $3
           AND is_used = FALSE
         ORDER BY created_at DESC
         LIMIT 1`,
        [phone, code, channel]
      );

      if (result.rows.length === 0) {
        logger.warn(`❌ Código inválido: ${phone} - ${code}`);
        return { valid: false, reason: 'INVALID_CODE' };
      }

      const verification = result.rows[0];

      // Verificar expiración
      const now = new Date();
      const expiresAt = new Date(verification.expires_at);

      if (now > expiresAt) {
        logger.warn(`❌ Código expirado: ${phone}`);
        return { valid: false, reason: 'EXPIRED_CODE' };
      }

      // Verificar intentos
      if (verification.attempts >= this.MAX_ATTEMPTS) {
        logger.warn(`❌ Demasiados intentos: ${phone}`);
        return { valid: false, reason: 'TOO_MANY_ATTEMPTS' };
      }

      // Incrementar contador de intentos
      await botPool.query(
        `UPDATE verification_codes
         SET attempts = attempts + 1, updated_at = NOW()
         WHERE id = $1`,
        [verification.id]
      );

      // Marcar como usado
      await botPool.query(
        `UPDATE verification_codes
         SET is_used = TRUE, verified_at = NOW(), updated_at = NOW()
         WHERE id = $1`,
        [verification.id]
      );

      logger.info(`✅ Código validado: ${phone}`);

      return {
        valid: true,
        metadata: verification.metadata
      };

    } catch (error) {
      logger.error(`❌ Error validando código: ${error.message}`);
      return { valid: false, reason: 'DATABASE_ERROR' };
    }
  }

  /**
   * Verificar si un código está vigente
   * @param {string} phone - Número de teléfono
   * @param {string} channel - Canal
   * @returns {Promise<{exists: boolean, expiresIn?: number}>}
   */
  async hasActiveCode(phone, channel = 'whatsapp') {
    try {
      const result = await botPool.query(
        `SELECT * FROM verification_codes
         WHERE phone_number = $1
           AND channel = $2
           AND is_used = FALSE
           AND expires_at > NOW()
         ORDER BY created_at DESC
         LIMIT 1`,
        [phone, channel]
      );

      if (result.rows.length === 0) {
        return { exists: false };
      }

      const verification = result.rows[0];
      const expiresAt = new Date(verification.expires_at);
      const now = new Date();
      const expiresInMs = expiresAt - now;
      const expiresInMinutes = Math.floor(expiresInMs / 1000 / 60);

      return {
        exists: true,
        expiresIn: expiresInMinutes,
        createdAt: verification.created_at
      };

    } catch (error) {
      logger.error(`❌ Error verificando código activo: ${error.message}`);
      return { exists: false };
    }
  }

  /**
   * Limpiar códigos expirados (mantenimiento)
   * @returns {Promise<number>} Número de códigos eliminados
   */
  async cleanupExpiredCodes() {
    try {
      const result = await botPool.query(
        `DELETE FROM verification_codes
         WHERE expires_at < NOW() - INTERVAL '24 hours'`
      );

      logger.info(`🧹 Códigos expirados limpiados: ${result.rowCount}`);
      return result.rowCount;

    } catch (error) {
      logger.error(`❌ Error limpiando códigos: ${error.message}`);
      return 0;
    }
  }

  /**
   * Obtener estadísticas de códigos
   * @returns {Promise<object>} Estadísticas
   */
  async getStats() {
    try {
      const result = await botPool.query(`
        SELECT
          channel,
          COUNT(*) as total,
          SUM(CASE WHEN is_used THEN 1 ELSE 0 END) as used,
          SUM(CASE WHEN expires_at > NOW() AND NOT is_used THEN 1 ELSE 0 END) as active
        FROM verification_codes
        WHERE created_at > NOW() - INTERVAL '7 days'
        GROUP BY channel
      `);

      return result.rows;

    } catch (error) {
      logger.error(`❌ Error obteniendo estadísticas: ${error.message}`);
      return [];
    }
  }
}

// Exportar instancia singleton
module.exports = new VerificationCodeService();
