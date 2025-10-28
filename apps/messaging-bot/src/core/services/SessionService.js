const { query } = require('../../db/pool');
const logger = require('../../utils/logger');
const jwt = require('jsonwebtoken');
const config = require('../../config/config');

/**
 * SessionService - Gestión de sesiones de pacientes
 *
 * Maneja la creación, validación y revocación de tokens JWT
 * para autenticación de pacientes en el portal web
 */
class SessionService {
  constructor() {
    this.SESSION_EXPIRATION_DAYS = 30;
    this.JWT_SECRET = config.security.jwtSecret;
  }

  /**
   * Crear sesión para paciente
   * @param {object} params - { pacienteId, telegramChatId, deviceInfo, ipAddress, userAgent }
   * @returns {Promise<object>} { token, expiresAt }
   */
  async createSession(params) {
    try {
      const { pacienteId, telegramChatId, deviceInfo, ipAddress, userAgent } = params;

      // Obtener ci_paciente de la base de datos
      const pacienteResult = await query(
        'SELECT ci_paciente, nombre, apellido FROM paciente WHERE id = $1',
        [pacienteId]
      );

      if (pacienteResult.rows.length === 0) {
        throw new Error(`Paciente ${pacienteId} no encontrado`);
      }

      const paciente = pacienteResult.rows[0];

      // Generar token JWT con ci_paciente para compatibilidad con results-service
      const payload = {
        paciente_id: pacienteId,  // Cambiar de pacienteId a paciente_id para consistencia
        ci_paciente: paciente.ci_paciente,  // ← AGREGAR ESTO
        nombre: `${paciente.nombre} ${paciente.apellido}`,  // ← AGREGAR ESTO
        type: 'patient_session',
        telegramChatId
      };

      const token = jwt.sign(payload, this.JWT_SECRET, {
        expiresIn: `${this.SESSION_EXPIRATION_DAYS}d`,
        issuer: 'laboratorio-eg',
        audience: 'patient-portal'
      });

      // Calcular fecha de expiración
      const expiresAt = new Date(Date.now() + this.SESSION_EXPIRATION_DAYS * 24 * 60 * 60 * 1000);

      // Guardar sesión en base de datos
      const result = await query(
        `INSERT INTO patient_sessions
         (paciente_id, token, telegram_chat_id, device_info, expires_at, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, token, expires_at`,
        [
          pacienteId,
          token,
          telegramChatId,
          JSON.stringify(deviceInfo || {}),
          expiresAt,
          ipAddress,
          userAgent
        ]
      );

      logger.info(`🔑 Sesión creada para paciente ${pacienteId} (expira: ${expiresAt.toISOString()})`);

      return {
        sessionId: result.rows[0].id,
        token: result.rows[0].token,
        expiresAt: result.rows[0].expires_at
      };

    } catch (error) {
      logger.error('Error creando sesión:', error);
      throw error;
    }
  }

  /**
   * Validar token JWT y sesión
   * @param {string} token - Token JWT
   * @returns {Promise<object>} { valid, pacienteId, sessionId, error }
   */
  async validateToken(token) {
    try {
      // Verificar firma del JWT
      let decoded;
      try {
        decoded = jwt.verify(token, this.JWT_SECRET, {
          issuer: 'laboratorio-eg',
          audience: 'patient-portal'
        });
      } catch (jwtError) {
        logger.warn('Token JWT inválido:', jwtError.message);
        return {
          valid: false,
          pacienteId: null,
          sessionId: null,
          error: 'Token inválido o expirado'
        };
      }

      // Verificar sesión en base de datos
      const result = await query(
        `SELECT id, paciente_id, expires_at, is_active, revoked_at
         FROM patient_sessions
         WHERE token = $1`,
        [token]
      );

      if (result.rows.length === 0) {
        logger.warn('Sesión no encontrada en BD');
        return {
          valid: false,
          pacienteId: null,
          sessionId: null,
          error: 'Sesión no encontrada'
        };
      }

      const session = result.rows[0];

      // Verificar si está activa
      if (!session.is_active) {
        logger.warn(`Sesión ${session.id} revocada el ${session.revoked_at}`);
        return {
          valid: false,
          pacienteId: null,
          sessionId: null,
          error: 'Sesión revocada'
        };
      }

      // Verificar si expiró
      if (new Date(session.expires_at) < new Date()) {
        logger.warn(`Sesión ${session.id} expirada`);

        // Marcar como inactiva
        await this.revokeSession(session.id, 'Expiración automática');

        return {
          valid: false,
          pacienteId: null,
          sessionId: null,
          error: 'Sesión expirada'
        };
      }

      // Actualizar last_activity
      await query(
        'UPDATE patient_sessions SET last_activity = NOW() WHERE id = $1',
        [session.id]
      );

      logger.info(`✅ Token válido para paciente ${session.paciente_id}`);

      return {
        valid: true,
        pacienteId: session.paciente_id,
        sessionId: session.id,
        error: null
      };

    } catch (error) {
      logger.error('Error validando token:', error);
      return {
        valid: false,
        pacienteId: null,
        sessionId: null,
        error: 'Error interno al validar token'
      };
    }
  }

  /**
   * Revocar sesión
   * @param {number} sessionId - ID de la sesión
   * @param {string} reason - Razón de revocación
   * @returns {Promise<boolean>}
   */
  async revokeSession(sessionId, reason = 'Logout manual') {
    try {
      await query(
        `UPDATE patient_sessions
         SET is_active = FALSE, revoked_at = NOW(), revoke_reason = $1
         WHERE id = $2`,
        [reason, sessionId]
      );

      logger.info(`🔒 Sesión ${sessionId} revocada: ${reason}`);
      return true;

    } catch (error) {
      logger.error('Error revocando sesión:', error);
      return false;
    }
  }

  /**
   * Revocar todas las sesiones de un paciente
   * @param {number} pacienteId - ID del paciente
   * @param {string} reason - Razón
   * @returns {Promise<number>} Cantidad de sesiones revocadas
   */
  async revokeAllPatientSessions(pacienteId, reason = 'Revocación masiva') {
    try {
      const result = await query(
        `UPDATE patient_sessions
         SET is_active = FALSE, revoked_at = NOW(), revoke_reason = $1
         WHERE paciente_id = $2 AND is_active = TRUE`,
        [reason, pacienteId]
      );

      const revokedCount = result.rowCount;

      logger.info(`🔒 ${revokedCount} sesiones revocadas para paciente ${pacienteId}`);

      return revokedCount;

    } catch (error) {
      logger.error('Error revocando sesiones del paciente:', error);
      return 0;
    }
  }

  /**
   * Obtener sesiones activas de un paciente
   * @param {number} pacienteId - ID del paciente
   * @returns {Promise<Array>} Lista de sesiones activas
   */
  async getActiveSessions(pacienteId) {
    try {
      const result = await query(
        `SELECT id, token, telegram_chat_id, device_info, created_at, last_activity, expires_at, ip_address
         FROM patient_sessions
         WHERE paciente_id = $1 AND is_active = TRUE AND expires_at > NOW()
         ORDER BY last_activity DESC`,
        [pacienteId]
      );

      return result.rows;

    } catch (error) {
      logger.error('Error obteniendo sesiones activas:', error);
      return [];
    }
  }

  /**
   * Limpiar sesiones expiradas (ejecutar periódicamente)
   * @returns {Promise<number>} Cantidad de sesiones limpiadas
   */
  async cleanupExpiredSessions() {
    try {
      const result = await query('SELECT cleanup_expired_sessions() as cleaned_count');
      const cleanedCount = result.rows[0].cleaned_count;

      if (cleanedCount > 0) {
        logger.info(`🧹 Limpiadas ${cleanedCount} sesiones expiradas`);
      }

      return cleanedCount;

    } catch (error) {
      logger.error('Error limpiando sesiones expiradas:', error);
      return 0;
    }
  }

  /**
   * Renovar sesión (extender expiración)
   * @param {number} sessionId - ID de la sesión
   * @returns {Promise<object>} { success, newExpiresAt }
   */
  async renewSession(sessionId) {
    try {
      const newExpiresAt = new Date(Date.now() + this.SESSION_EXPIRATION_DAYS * 24 * 60 * 60 * 1000);

      await query(
        `UPDATE patient_sessions
         SET expires_at = $1, last_activity = NOW()
         WHERE id = $2 AND is_active = TRUE`,
        [newExpiresAt, sessionId]
      );

      logger.info(`🔄 Sesión ${sessionId} renovada hasta ${newExpiresAt.toISOString()}`);

      return {
        success: true,
        newExpiresAt
      };

    } catch (error) {
      logger.error('Error renovando sesión:', error);
      return {
        success: false,
        newExpiresAt: null
      };
    }
  }

  /**
   * Obtener estadísticas de sesiones
   * @returns {Promise<object>} Estadísticas
   */
  async getSessionStats() {
    try {
      const result = await query(`
        SELECT
          COUNT(*) as total_sessions,
          COUNT(*) FILTER (WHERE is_active = TRUE AND expires_at > NOW()) as active_sessions,
          COUNT(*) FILTER (WHERE expires_at < NOW()) as expired_sessions,
          COUNT(*) FILTER (WHERE is_active = FALSE AND revoked_at IS NOT NULL) as revoked_sessions,
          COUNT(DISTINCT paciente_id) as unique_patients
        FROM patient_sessions
      `);

      return result.rows[0];

    } catch (error) {
      logger.error('Error obteniendo estadísticas de sesiones:', error);
      return null;
    }
  }

  /**
   * Verificar si el paciente ya tiene una sesión activa
   * @param {number} pacienteId - ID del paciente
   * @returns {Promise<boolean>}
   */
  async hasActiveSession(pacienteId) {
    try {
      const result = await query(
        `SELECT COUNT(*) as count
         FROM patient_sessions
         WHERE paciente_id = $1 AND is_active = TRUE AND expires_at > NOW()`,
        [pacienteId]
      );

      return parseInt(result.rows[0].count) > 0;

    } catch (error) {
      logger.error('Error verificando sesión activa:', error);
      return false;
    }
  }

  /**
   * Generar URL con token para acceso directo a resultados
   * @param {string} token - Token de sesión
   * @param {string} ordenTrabajoId - ID opcional de orden de trabajo
   * @returns {string} URL completa
   */
  generateResultsUrl(token, ordenTrabajoId = null) {
    const baseUrl = config.frontend.url;
    const path = ordenTrabajoId ? `/results/${ordenTrabajoId}` : '/results';

    return `${baseUrl}${path}?token=${token}`;
  }
}

// Exportar singleton
module.exports = new SessionService();
