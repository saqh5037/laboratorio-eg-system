const DatabaseRouter = require('./DatabaseRouter');
const { parseValue, sanitizeForLogging } = require('../utils/validation');
const logger = require('../utils/logger');

class ConfigService {
  /**
   * Obtener todas las configuraciones
   * @param {string} category - Filtrar por categoría (opcional)
   * @returns {Promise<Array>}
   */
  async getAll(category = null) {
    try {
      const pool = await DatabaseRouter.getControlPool();

      let query = 'SELECT * FROM system_config';
      const params = [];

      if (category) {
        query += ' WHERE category = $1';
        params.push(category);
      }

      query += ' ORDER BY category, key';

      const result = await pool.query(query, params);

      // Convertir valores según su tipo
      return result.rows.map(row => ({
        ...row,
        value: parseValue(row.value, row.data_type),
        // Sanitizar secretos en logs
        _sanitized: sanitizeForLogging(row.key, row.value, row.is_secret)
      }));
    } catch (error) {
      logger.error('Error al obtener configuraciones:', error);
      throw error;
    }
  }

  /**
   * Obtener configuración por key
   * @param {string} key
   * @returns {Promise<Object|null>}
   */
  async getByKey(key) {
    try {
      const pool = await DatabaseRouter.getControlPool();

      const query = 'SELECT * FROM system_config WHERE key = $1';
      const result = await pool.query(query, [key]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        ...row,
        value: parseValue(row.value, row.data_type)
      };
    } catch (error) {
      logger.error(`Error al obtener configuración ${key}:`, error);
      throw error;
    }
  }

  /**
   * Obtener solo el valor de una configuración
   * @param {string} key
   * @param {*} defaultValue - Valor por defecto si no existe
   * @returns {Promise<*>}
   */
  async getValue(key, defaultValue = null) {
    try {
      const config = await this.getByKey(key);
      return config ? config.value : defaultValue;
    } catch (error) {
      logger.error(`Error al obtener valor de ${key}:`, error);
      return defaultValue;
    }
  }

  /**
   * Crear nueva configuración
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async create(data) {
    const {
      key,
      value,
      data_type = 'string',
      category = 'general',
      description = null,
      is_secret = false,
      is_editable = true,
      created_by = 'system'
    } = data;

    try {
      const pool = await DatabaseRouter.getControlPool();

      const query = `
        INSERT INTO system_config
        (key, value, data_type, category, description, is_secret, is_editable, created_by, updated_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
        RETURNING *
      `;

      const params = [
        key,
        String(value),
        data_type,
        category,
        description,
        is_secret,
        is_editable,
        created_by
      ];

      const result = await pool.query(query, params);

      logger.info(`Configuración creada: ${key}`, {
        key,
        category,
        created_by: sanitizeForLogging(key, created_by, is_secret)
      });

      return result.rows[0];
    } catch (error) {
      logger.error(`Error al crear configuración ${key}:`, error);
      throw error;
    }
  }

  /**
   * Actualizar configuración existente
   * @param {string} key
   * @param {Object} data
   * @returns {Promise<Object|null>}
   */
  async update(key, data) {
    const {
      value,
      description,
      updated_by = 'system'
    } = data;

    try {
      // Primero verificar si es editable
      const existing = await this.getByKey(key);

      if (!existing) {
        logger.warn(`Intento de actualizar configuración inexistente: ${key}`);
        return null;
      }

      if (!existing.is_editable) {
        throw new Error(`La configuración ${key} no es editable`);
      }

      const updates = [];
      const params = [];
      let paramCount = 1;

      if (value !== undefined) {
        updates.push(`value = $${paramCount++}`);
        params.push(String(value));
      }

      if (description !== undefined) {
        updates.push(`description = $${paramCount++}`);
        params.push(description);
      }

      updates.push(`updated_by = $${paramCount++}`);
      params.push(updated_by);

      params.push(key);

      const pool = await DatabaseRouter.getControlPool();

      const query = `
        UPDATE system_config
        SET ${updates.join(', ')}
        WHERE key = $${paramCount}
        RETURNING *
      `;

      const result = await pool.query(query, params);

      logger.info(`Configuración actualizada: ${key}`, {
        key,
        updated_by,
        old_value: sanitizeForLogging(key, existing.value, existing.is_secret),
        new_value: sanitizeForLogging(key, value, existing.is_secret)
      });

      return result.rows[0];
    } catch (error) {
      logger.error(`Error al actualizar configuración ${key}:`, error);
      throw error;
    }
  }

  /**
   * Eliminar configuración (soft delete - marca como no editable)
   * @param {string} key
   * @returns {Promise<boolean>}
   */
  async delete(key) {
    try {
      const pool = await DatabaseRouter.getControlPool();

      const query = 'DELETE FROM system_config WHERE key = $1 AND is_editable = TRUE RETURNING *';
      const result = await pool.query(query, [key]);

      if (result.rows.length === 0) {
        logger.warn(`Intento de eliminar configuración inexistente o no editable: ${key}`);
        return false;
      }

      logger.info(`Configuración eliminada: ${key}`);
      return true;
    } catch (error) {
      logger.error(`Error al eliminar configuración ${key}:`, error);
      throw error;
    }
  }

  /**
   * Obtener configuraciones agrupadas por categoría
   * @returns {Promise<Object>}
   */
  async getGroupedByCategory() {
    try {
      const all = await this.getAll();

      return all.reduce((acc, config) => {
        if (!acc[config.category]) {
          acc[config.category] = [];
        }
        acc[config.category].push(config);
        return acc;
      }, {});
    } catch (error) {
      logger.error('Error al obtener configuraciones agrupadas:', error);
      throw error;
    }
  }

  /**
   * Obtener configuración de métodos de autenticación ordenada por prioridad
   * @returns {Promise<Array>}
   */
  async getAuthMethods() {
    try {
      const pool = await DatabaseRouter.getControlPool();

      const query = `
        SELECT * FROM system_config
        WHERE key LIKE 'auth.methods.%.enabled' OR key LIKE 'auth.methods.%.priority'
        ORDER BY key
      `;

      const result = await pool.query(query);

      // Agrupar por método
      const methods = {};
      result.rows.forEach(row => {
        const parts = row.key.split('.');
        const method = parts[2]; // telegram, whatsapp, cedula, sms
        const property = parts[3]; // enabled, priority

        if (!methods[method]) {
          methods[method] = { method };
        }

        methods[method][property] = parseValue(row.value, row.data_type);
      });

      // Convertir a array y ordenar por prioridad
      return Object.values(methods)
        .filter(m => m.enabled !== undefined)
        .sort((a, b) => (a.priority || 999) - (b.priority || 999));
    } catch (error) {
      logger.error('Error al obtener métodos de autenticación:', error);
      throw error;
    }
  }

  /**
   * Verificar si una página está habilitada
   * @param {string} pageName - Nombre de la página (resultados, estudios, etc.)
   * @returns {Promise<boolean>}
   */
  async isPageEnabled(pageName) {
    const key = `ui.pages.${pageName}.enabled`;
    const value = await this.getValue(key, true);
    return value === true;
  }

  /**
   * Verificar si el modo mantenimiento está activo
   * @returns {Promise<boolean>}
   */
  async isMaintenanceMode() {
    return await this.getValue('system.maintenance_mode.enabled', false);
  }
}

module.exports = new ConfigService();
