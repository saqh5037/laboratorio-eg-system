const { query } = require('../../db/pool');
const logger = require('../../utils/logger');

/**
 * NotificationPreferencesService - Gestión de preferencias de notificación por paciente
 *
 * Permite a los pacientes configurar qué tipos de notificaciones desean recibir
 * y en qué horarios.
 */
class NotificationPreferencesService {
  /**
   * Obtener preferencias de un paciente (o crear con valores por defecto)
   * @param {number} pacienteId - ID del paciente
   * @returns {Promise<object>} Preferencias del paciente
   */
  async getPreferences(pacienteId) {
    try {
      let result = await query(
        `SELECT * FROM notification_preferences WHERE paciente_id = $1`,
        [pacienteId]
      );

      // Si no existen preferencias, crear con valores por defecto
      if (result.rows.length === 0) {
        await this.createDefaultPreferences(pacienteId);
        result = await query(
          `SELECT * FROM notification_preferences WHERE paciente_id = $1`,
          [pacienteId]
        );
      }

      return result.rows[0];

    } catch (error) {
      logger.error('Error obteniendo preferencias de notificación:', error);
      throw error;
    }
  }

  /**
   * Crear preferencias por defecto para un paciente
   * @param {number} pacienteId - ID del paciente
   * @returns {Promise<object>} Preferencias creadas
   */
  async createDefaultPreferences(pacienteId) {
    try {
      const result = await query(
        `INSERT INTO notification_preferences
         (paciente_id, orden_pagada, resultados_listos, orden_en_proceso,
          recordatorio_retiro, resultados_criticos)
         VALUES ($1, true, true, true, true, true)
         RETURNING *`,
        [pacienteId]
      );

      logger.info(`✓ Preferencias por defecto creadas para paciente ${pacienteId}`);
      return result.rows[0];

    } catch (error) {
      logger.error('Error creando preferencias por defecto:', error);
      throw error;
    }
  }

  /**
   * Actualizar preferencias de un paciente
   * @param {number} pacienteId - ID del paciente
   * @param {object} preferences - Nuevas preferencias
   * @returns {Promise<object>} Preferencias actualizadas
   */
  async updatePreferences(pacienteId, preferences) {
    try {
      const {
        orden_pagada,
        resultados_listos,
        orden_en_proceso,
        recordatorio_retiro,
        horario_desde,
        horario_hasta,
        notificar_fines_semana
      } = preferences;

      // resultados_criticos siempre permanece en true por seguridad
      const result = await query(
        `UPDATE notification_preferences
         SET orden_pagada = COALESCE($2, orden_pagada),
             resultados_listos = COALESCE($3, resultados_listos),
             orden_en_proceso = COALESCE($4, orden_en_proceso),
             recordatorio_retiro = COALESCE($5, recordatorio_retiro),
             horario_desde = COALESCE($6, horario_desde),
             horario_hasta = COALESCE($7, horario_hasta),
             notificar_fines_semana = COALESCE($8, notificar_fines_semana),
             updated_at = CURRENT_TIMESTAMP
         WHERE paciente_id = $1
         RETURNING *`,
        [
          pacienteId,
          orden_pagada,
          resultados_listos,
          orden_en_proceso,
          recordatorio_retiro,
          horario_desde,
          horario_hasta,
          notificar_fines_semana
        ]
      );

      if (result.rows.length === 0) {
        // Si no existe, crear con los valores proporcionados
        return await this.createDefaultPreferences(pacienteId);
      }

      logger.info(`✓ Preferencias actualizadas para paciente ${pacienteId}`);
      return result.rows[0];

    } catch (error) {
      logger.error('Error actualizando preferencias:', error);
      throw error;
    }
  }

  /**
   * Verificar si un paciente debe recibir una notificación según sus preferencias
   * @param {number} pacienteId - ID del paciente
   * @param {string} notificationType - Tipo de notificación
   * @returns {Promise<boolean>} True si debe recibir la notificación
   */
  async shouldNotify(pacienteId, notificationType) {
    try {
      const preferences = await this.getPreferences(pacienteId);

      // Verificar si el tipo de notificación está habilitado
      if (!preferences[notificationType]) {
        logger.info(`❌ Notificación ${notificationType} deshabilitada para paciente ${pacienteId}`);
        return false;
      }

      // Resultados críticos siempre se envían
      if (notificationType === 'resultados_criticos') {
        return true;
      }

      // Verificar horario (opcional)
      if (preferences.horario_desde && preferences.horario_hasta) {
        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 8); // HH:MM:SS

        if (currentTime < preferences.horario_desde || currentTime > preferences.horario_hasta) {
          logger.info(`⏰ Fuera del horario de notificaciones para paciente ${pacienteId}`);
          return false;
        }
      }

      // Verificar fines de semana
      if (!preferences.notificar_fines_semana) {
        const now = new Date();
        const dayOfWeek = now.getDay(); // 0 = Domingo, 6 = Sábado

        if (dayOfWeek === 0 || dayOfWeek === 6) {
          logger.info(`📅 Notificaciones de fin de semana deshabilitadas para paciente ${pacienteId}`);
          return false;
        }
      }

      return true;

    } catch (error) {
      logger.error('Error verificando si debe notificar:', error);
      // En caso de error, permitir la notificación por seguridad
      return true;
    }
  }

  /**
   * Deshabilitar todas las notificaciones para un paciente
   * @param {number} pacienteId - ID del paciente
   * @returns {Promise<object>} Preferencias actualizadas
   */
  async disableAllNotifications(pacienteId) {
    try {
      const result = await query(
        `UPDATE notification_preferences
         SET orden_pagada = false,
             resultados_listos = false,
             orden_en_proceso = false,
             recordatorio_retiro = false,
             updated_at = CURRENT_TIMESTAMP
         WHERE paciente_id = $1
         RETURNING *`,
        [pacienteId]
      );

      logger.info(`🔕 Todas las notificaciones deshabilitadas para paciente ${pacienteId}`);
      return result.rows[0];

    } catch (error) {
      logger.error('Error deshabilitando notificaciones:', error);
      throw error;
    }
  }

  /**
   * Habilitar todas las notificaciones para un paciente
   * @param {number} pacienteId - ID del paciente
   * @returns {Promise<object>} Preferencias actualizadas
   */
  async enableAllNotifications(pacienteId) {
    try {
      const result = await query(
        `UPDATE notification_preferences
         SET orden_pagada = true,
             resultados_listos = true,
             orden_en_proceso = true,
             recordatorio_retiro = true,
             resultados_criticos = true,
             updated_at = CURRENT_TIMESTAMP
         WHERE paciente_id = $1
         RETURNING *`,
        [pacienteId]
      );

      logger.info(`🔔 Todas las notificaciones habilitadas para paciente ${pacienteId}`);
      return result.rows[0];

    } catch (error) {
      logger.error('Error habilitando notificaciones:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de preferencias de todos los pacientes
   * @returns {Promise<object>} Estadísticas
   */
  async getPreferencesStats() {
    try {
      const result = await query(`
        SELECT
          COUNT(*) as total_patients,
          COUNT(*) FILTER (WHERE orden_pagada = true) as orden_pagada_enabled,
          COUNT(*) FILTER (WHERE resultados_listos = true) as resultados_listos_enabled,
          COUNT(*) FILTER (WHERE orden_en_proceso = true) as orden_en_proceso_enabled,
          COUNT(*) FILTER (WHERE recordatorio_retiro = true) as recordatorio_retiro_enabled,
          COUNT(*) FILTER (WHERE resultados_criticos = true) as resultados_criticos_enabled,
          COUNT(*) FILTER (WHERE notificar_fines_semana = true) as weekend_notifications_enabled
        FROM notification_preferences
      `);

      return result.rows[0];

    } catch (error) {
      logger.error('Error obteniendo estadísticas de preferencias:', error);
      throw error;
    }
  }

  /**
   * Eliminar preferencias de un paciente
   * @param {number} pacienteId - ID del paciente
   * @returns {Promise<boolean>} True si se eliminó correctamente
   */
  async deletePreferences(pacienteId) {
    try {
      await query(
        `DELETE FROM notification_preferences WHERE paciente_id = $1`,
        [pacienteId]
      );

      logger.info(`🗑️ Preferencias eliminadas para paciente ${pacienteId}`);
      return true;

    } catch (error) {
      logger.error('Error eliminando preferencias:', error);
      throw error;
    }
  }
}

// Exportar singleton
module.exports = new NotificationPreferencesService();
