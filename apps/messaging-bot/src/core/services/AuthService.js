const { query } = require('../../db/pool');
const logger = require('../../utils/logger');
const crypto = require('crypto');
const { parsePhoneNumber } = require('libphonenumber-js');

/**
 * AuthService - Servicio de Autenticación vía Telegram
 *
 * Maneja la generación de códigos de 6 dígitos, verificación,
 * y validación de teléfonos venezolanos
 */
class AuthService {
  constructor() {
    this.CODE_EXPIRATION_MINUTES = 10;
    this.MAX_ATTEMPTS = 3;
    this.CODE_LENGTH = 6;
  }

  /**
   * Generar código de 6 dígitos aleatorio
   * @returns {string} Código de 6 dígitos
   */
  generateCode() {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Validar formato de teléfono internacional
   * Acepta números de cualquier país en formato E.164 o local
   * Ejemplos:
   *   Venezuela: 0412-1234567, +584121234567
   *   México: 5512345678, +525512345678
   *   USA: +1-555-123-4567
   *
   * @param {string} phone - Teléfono a validar
   * @returns {{ valid: boolean, formatted: string, error: string }}
   */
  validateVenezuelanPhone(phone) {
    try {
      // Limpiar el teléfono
      let cleanPhone = phone.replace(/[\s\-()]/g, '');

      // Si NO comienza con +, intentar detectar el país
      if (!cleanPhone.startsWith('+')) {
        // Si comienza con 0 (Venezuela)
        if (cleanPhone.startsWith('0')) {
          cleanPhone = '+58' + cleanPhone.substring(1);
        }
        // Si comienza con dígitos, intentar parsear sin país específico
        else {
          // Para México puede venir como 5512345678 o 525512345678
          // Para otros países, intentar parsear directamente
          cleanPhone = '+' + cleanPhone;
        }
      }

      // Parsear con libphonenumber-js SIN especificar país por defecto
      // Esto permite que la librería detecte automáticamente el país
      let phoneNumber;

      try {
        phoneNumber = parsePhoneNumber(cleanPhone);
      } catch (e) {
        // Si falla, intentar con Venezuela como fallback (para compatibilidad)
        try {
          const cleanPhoneVE = phone.replace(/[\s\-()]/g, '');
          const withVE = cleanPhoneVE.startsWith('0') ? '+58' + cleanPhoneVE.substring(1) : '+58' + cleanPhoneVE;
          phoneNumber = parsePhoneNumber(withVE, 'VE');
        } catch (e2) {
          return {
            valid: false,
            formatted: null,
            error: 'Formato de teléfono inválido. Use formato internacional: +[código país][número]'
          };
        }
      }

      if (!phoneNumber) {
        return {
          valid: false,
          formatted: null,
          error: 'No se pudo procesar el número de teléfono'
        };
      }

      if (!phoneNumber.isValid()) {
        return {
          valid: false,
          formatted: null,
          error: 'Número de teléfono no válido'
        };
      }

      // Validación exitosa para CUALQUIER país
      return {
        valid: true,
        formatted: phoneNumber.format('E.164'), // Formato internacional estándar
        national: phoneNumber.formatNational ? phoneNumber.formatNational() : phoneNumber.nationalNumber,
        country: phoneNumber.country, // Código del país detectado (VE, MX, US, etc.)
        error: null
      };

    } catch (error) {
      logger.error('Error validando teléfono:', error);
      return {
        valid: false,
        formatted: null,
        error: 'Error procesando el número de teléfono. Verifique el formato e intente nuevamente.'
      };
    }
  }

  /**
   * Buscar paciente por ID
   * @param {number} pacienteId - ID del paciente
   * @returns {Promise<object|null>} Paciente encontrado o null
   */
  async findPatientById(pacienteId) {
    try {
      const result = await query(
        `SELECT id, nombre, apellido, ci_paciente, telefono, email
         FROM paciente
         WHERE id = $1
         LIMIT 1`,
        [pacienteId]
      );

      if (result.rows.length === 0) {
        logger.warn(`No se encontró paciente con ID: ${pacienteId}`);
        return null;
      }

      return result.rows[0];

    } catch (error) {
      logger.error('Error buscando paciente por ID:', error);
      throw error;
    }
  }

  /**
   * Buscar paciente por teléfono
   * @param {string} phone - Teléfono formateado
   * @returns {Promise<object|null>} Paciente encontrado o null
   */
  async findPatientByPhone(phone) {
    try {
      // Buscar con diferentes formatos
      const cleanPhone = phone.replace(/[^0-9]/g, '');

      const result = await query(
        `SELECT id, nombre, apellido, ci_paciente, telefono, email
         FROM paciente
         WHERE REPLACE(REPLACE(REPLACE(telefono, '-', ''), ' ', ''), '+', '') LIKE $1
            OR telefono LIKE $2
            OR telefono LIKE $3
         LIMIT 1`,
        [`%${cleanPhone}%`, `%${phone}%`, `%${cleanPhone.substring(cleanPhone.length - 10)}%`]
      );

      if (result.rows.length === 0) {
        logger.warn(`No se encontró paciente con teléfono: ${phone}`);
        return null;
      }

      return result.rows[0];

    } catch (error) {
      logger.error('Error buscando paciente por teléfono:', error);
      throw error;
    }
  }

  /**
   * Crear código de autenticación
   * @param {object} params - { pacienteId, phone, telegramChatId, ipAddress, userAgent }
   * @returns {Promise<object>} { code, expiresAt }
   */
  async createAuthCode(params) {
    try {
      const { pacienteId, phone, telegramChatId, ipAddress, userAgent } = params;

      const code = this.generateCode();
      const expiresAt = new Date(Date.now() + this.CODE_EXPIRATION_MINUTES * 60 * 1000);

      const result = await query(
        `INSERT INTO telegram_auth_codes
         (paciente_id, phone, code, telegram_chat_id, expires_at, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, code, expires_at`,
        [pacienteId, phone, code, telegramChatId, expiresAt, ipAddress, userAgent]
      );

      logger.info(`🔐 Código generado para paciente ${pacienteId}: ${code} (expira en ${this.CODE_EXPIRATION_MINUTES} min)`);

      return {
        id: result.rows[0].id,
        code: result.rows[0].code,
        expiresAt: result.rows[0].expires_at
      };

    } catch (error) {
      logger.error('Error creando código de autenticación:', error);
      throw error;
    }
  }

  /**
   * Verificar código de autenticación
   * @param {string} phone - Teléfono del usuario
   * @param {string} code - Código ingresado (6 dígitos)
   * @returns {Promise<object>} { valid, pacienteId, error }
   */
  async verifyCode(phone, code) {
    try {
      // Buscar código no verificado y no expirado
      const result = await query(
        `SELECT id, paciente_id, attempts, expires_at
         FROM telegram_auth_codes
         WHERE phone = $1
           AND code = $2
           AND verified = FALSE
           AND expires_at > NOW()
         ORDER BY created_at DESC
         LIMIT 1`,
        [phone, code]
      );

      if (result.rows.length === 0) {
        logger.warn(`Código inválido o expirado: ${code} para ${phone}`);
        return {
          valid: false,
          pacienteId: null,
          error: 'Código inválido o expirado'
        };
      }

      const authCode = result.rows[0];

      // Verificar intentos
      if (authCode.attempts >= this.MAX_ATTEMPTS) {
        logger.warn(`Máximo de intentos alcanzado para código ${code}`);
        return {
          valid: false,
          pacienteId: null,
          error: 'Código bloqueado por exceso de intentos'
        };
      }

      // Marcar como verificado
      await query(
        `UPDATE telegram_auth_codes
         SET verified = TRUE, verified_at = NOW()
         WHERE id = $1`,
        [authCode.id]
      );

      logger.info(`✅ Código verificado exitosamente para paciente ${authCode.paciente_id}`);

      return {
        valid: true,
        pacienteId: authCode.paciente_id,
        error: null
      };

    } catch (error) {
      logger.error('Error verificando código:', error);
      throw error;
    }
  }

  /**
   * Incrementar intento fallido de código
   * @param {string} phone - Teléfono
   * @param {string} code - Código
   */
  async incrementAttempt(phone, code) {
    try {
      await query(
        `UPDATE telegram_auth_codes
         SET attempts = attempts + 1
         WHERE phone = $1 AND code = $2 AND verified = FALSE`,
        [phone, code]
      );

      logger.info(`⚠️  Intento fallido incrementado para ${phone}`);

    } catch (error) {
      logger.error('Error incrementando intento:', error);
    }
  }

  /**
   * Limpiar códigos expirados (ejecutar periódicamente)
   * @returns {Promise<number>} Cantidad de códigos eliminados
   */
  async cleanupExpiredCodes() {
    try {
      const result = await query('SELECT cleanup_expired_auth_codes() as deleted_count');
      const deletedCount = result.rows[0].deleted_count;

      if (deletedCount > 0) {
        logger.info(`🧹 Limpiados ${deletedCount} códigos expirados`);
      }

      return deletedCount;

    } catch (error) {
      logger.error('Error limpiando códigos expirados:', error);
      return 0;
    }
  }

  /**
   * Obtener estadísticas de códigos
   * @param {number} pacienteId - ID del paciente
   * @returns {Promise<object>} Estadísticas
   */
  async getCodeStats(pacienteId) {
    try {
      const result = await query(
        `SELECT
           COUNT(*) as total_codes,
           COUNT(*) FILTER (WHERE verified = TRUE) as verified_codes,
           COUNT(*) FILTER (WHERE expires_at < NOW()) as expired_codes,
           MAX(created_at) as last_code_at
         FROM telegram_auth_codes
         WHERE paciente_id = $1`,
        [pacienteId]
      );

      return result.rows[0];

    } catch (error) {
      logger.error('Error obteniendo estadísticas de códigos:', error);
      return null;
    }
  }
}

// Exportar singleton
module.exports = new AuthService();
