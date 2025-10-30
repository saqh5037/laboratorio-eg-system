/**
 * AuthorizationTokenService
 *
 * Servicio para gestionar tokens temporales de autorización de Telegram.
 * Los tokens permiten a los pacientes autorizar la comunicación mediante deep links.
 *
 * Características:
 * - Tokens únicos generados con crypto
 * - Expiración automática en 10 minutos
 * - Validación de uso único
 * - Limpieza automática de tokens expirados
 */

const crypto = require('crypto');
const { botPool } = require('../../db/pool');
const logger = require('../../utils/logger');

class AuthorizationTokenService {
  /**
   * Generar token único de autorización
   * @param {number} pacienteId - ID del paciente
   * @param {string} phone - Teléfono del paciente
   * @returns {Promise<{token: string, expiresAt: Date, deepLink: string}>}
   */
  async generateToken(pacienteId, phone) {
    try {
      // Generar token único usando crypto
      const token = crypto.randomBytes(32).toString('hex').toUpperCase();

      // Calcular fecha de expiración (10 minutos)
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      // Insertar token en la base de datos
      await botPool.query(
        `INSERT INTO telegram_auth_tokens
         (token, paciente_id, phone, expires_at)
         VALUES ($1, $2, $3, $4)`,
        [token, pacienteId, phone, expiresAt]
      );

      // Generar deep link de Telegram
      const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'LaboratorioEG_bot';
      const deepLink = `https://t.me/${botUsername}?start=${token}`;

      logger.info(`🔑 Token de autorización generado para paciente ${pacienteId} (expira en 10 min)`);

      return {
        token,
        expiresAt,
        deepLink,
        expiresIn: 600 // segundos
      };

    } catch (error) {
      logger.error('Error generando token de autorización:', error);
      throw error;
    }
  }

  /**
   * Validar token de autorización
   * @param {string} token - Token a validar
   * @returns {Promise<{valid: boolean, pacienteId?: number, phone?: string, reason?: string}>}
   */
  async validateToken(token) {
    try {
      const result = await botPool.query(
        `SELECT id, paciente_id, phone, expires_at, used
         FROM telegram_auth_tokens
         WHERE token = $1`,
        [token]
      );

      // Token no existe
      if (result.rows.length === 0) {
        logger.warn(`⚠️  Token inválido: ${token.substring(0, 10)}...`);
        return {
          valid: false,
          reason: 'TOKEN_NOT_FOUND'
        };
      }

      const tokenData = result.rows[0];

      // Token ya fue usado
      if (tokenData.used) {
        logger.warn(`⚠️  Token ya usado: ${token.substring(0, 10)}...`);
        return {
          valid: false,
          reason: 'TOKEN_ALREADY_USED',
          pacienteId: tokenData.paciente_id,
          phone: tokenData.phone
        };
      }

      // Token expirado
      const now = new Date();
      const expiresAt = new Date(tokenData.expires_at);
      if (now > expiresAt) {
        logger.warn(`⚠️  Token expirado: ${token.substring(0, 10)}... (expiró: ${expiresAt.toISOString()})`);
        return {
          valid: false,
          reason: 'TOKEN_EXPIRED',
          expiredAt: expiresAt
        };
      }

      // Token válido
      logger.info(`✅ Token válido para paciente ${tokenData.paciente_id}`);
      return {
        valid: true,
        tokenId: tokenData.id,
        pacienteId: tokenData.paciente_id,
        phone: tokenData.phone
      };

    } catch (error) {
      logger.error('Error validando token:', error);
      throw error;
    }
  }

  /**
   * Marcar token como usado
   * @param {string} token - Token a marcar
   * @returns {Promise<boolean>}
   */
  async markTokenAsUsed(token) {
    try {
      const result = await botPool.query(
        `UPDATE telegram_auth_tokens
         SET used = TRUE, used_at = NOW()
         WHERE token = $1 AND used = FALSE
         RETURNING id`,
        [token]
      );

      if (result.rows.length > 0) {
        logger.info(`✅ Token marcado como usado: ${token.substring(0, 10)}...`);
        return true;
      }

      return false;

    } catch (error) {
      logger.error('Error marcando token como usado:', error);
      throw error;
    }
  }

  /**
   * Limpiar tokens expirados
   * Elimina tokens que expiraron hace más de 1 hora
   * @returns {Promise<number>} Cantidad de tokens eliminados
   */
  async cleanupExpiredTokens() {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      const result = await botPool.query(
        `DELETE FROM telegram_auth_tokens
         WHERE expires_at < $1
         RETURNING id`,
        [oneHourAgo]
      );

      const deletedCount = result.rows.length;

      if (deletedCount > 0) {
        logger.info(`🧹 Limpieza de tokens: ${deletedCount} tokens expirados eliminados`);
      }

      return deletedCount;

    } catch (error) {
      logger.error('Error limpiando tokens expirados:', error);
      throw error;
    }
  }

  /**
   * Verificar si un paciente ya tiene un token válido pendiente
   * @param {number} pacienteId - ID del paciente
   * @returns {Promise<{hasToken: boolean, token?: string, deepLink?: string, expiresAt?: Date}>}
   */
  async checkPendingToken(pacienteId) {
    try {
      const result = await botPool.query(
        `SELECT token, expires_at
         FROM telegram_auth_tokens
         WHERE paciente_id = $1
           AND used = FALSE
           AND expires_at > NOW()
         ORDER BY created_at DESC
         LIMIT 1`,
        [pacienteId]
      );

      if (result.rows.length > 0) {
        const tokenData = result.rows[0];
        const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'LaboratorioEG_bot';
        const deepLink = `https://t.me/${botUsername}?start=${tokenData.token}`;

        return {
          hasToken: true,
          token: tokenData.token,
          deepLink,
          expiresAt: new Date(tokenData.expires_at)
        };
      }

      return { hasToken: false };

    } catch (error) {
      logger.error('Error verificando token pendiente:', error);
      throw error;
    }
  }

  /**
   * Iniciar limpieza automática de tokens cada hora
   */
  startAutomaticCleanup() {
    // Ejecutar limpieza inmediatamente
    this.cleanupExpiredTokens().catch(err => {
      logger.error('Error en limpieza automática inicial:', err);
    });

    // Programar limpieza cada hora
    setInterval(() => {
      this.cleanupExpiredTokens().catch(err => {
        logger.error('Error en limpieza automática:', err);
      });
    }, 60 * 60 * 1000); // 1 hora

    logger.info('🧹 Limpieza automática de tokens programada cada 1 hora');
  }
}

module.exports = new AuthorizationTokenService();
