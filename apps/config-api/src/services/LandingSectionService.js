const DatabaseRouter = require('./DatabaseRouter');
const logger = require('../utils/logger');
const CacheService = require('./CacheService');

const CACHE_KEY_PREFIX = 'landing:sections:';
const CACHE_TTL = 5 * 60; // 5 minutos

/**
 * LandingSectionService
 * Servicio para gestionar la estructura dinámica de la landing page
 * Maneja la tabla landing_sections para configuración de secciones
 */
class LandingSectionService {
  // ============================================================================
  // PUBLIC METHODS (para frontend landing page)
  // ============================================================================

  /**
   * Obtener todas las secciones visibles (público)
   * @returns {Promise<Array>} Array de secciones visibles ordenadas
   */
  async getVisibleSections() {
    const cacheKey = `${CACHE_KEY_PREFIX}visible`;
    const cached = CacheService.get(cacheKey);

    if (cached) {
      logger.info('Landing sections obtenidas desde cache');
      return cached;
    }

    try {
      const pool = await DatabaseRouter.getConfigPool();

      const query = `
        SELECT
          id, section_key, section_type, title, subtitle,
          description, layout_config, order_index
        FROM landing_sections
        WHERE is_visible = true
        ORDER BY order_index ASC
      `;

      const result = await pool.query(query);
      logger.info(`${result.rows.length} secciones visibles cargadas desde BD`);

      CacheService.set(cacheKey, result.rows, CACHE_TTL);
      return result.rows;
    } catch (error) {
      logger.error('Error obteniendo secciones visibles:', error);
      throw error;
    }
  }

  /**
   * Obtener una sección por su section_key (público)
   * @param {string} sectionKey - Clave de la sección
   * @returns {Promise<Object|null>} Sección encontrada o null
   */
  async getSectionByKey(sectionKey) {
    try {
      const pool = await DatabaseRouter.getConfigPool();

      const query = `
        SELECT *
        FROM landing_sections
        WHERE section_key = $1 AND is_visible = true
      `;

      const result = await pool.query(query, [sectionKey]);

      if (result.rows.length === 0) {
        logger.warn(`Sección con key '${sectionKey}' no encontrada`);
        return null;
      }

      logger.info(`Sección '${sectionKey}' cargada`);
      return result.rows[0];
    } catch (error) {
      logger.error(`Error obteniendo sección '${sectionKey}':`, error);
      throw error;
    }
  }

  // ============================================================================
  // ADMIN METHODS (requieren autenticación)
  // ============================================================================

  /**
   * Obtener todas las secciones (admin)
   * @param {Object} filters - Filtros opcionales
   * @param {boolean} filters.include_hidden - Incluir secciones ocultas
   * @param {string} filters.section_type - Filtrar por tipo de sección
   * @returns {Promise<Array>} Array de todas las secciones
   */
  async getAllSections(filters = {}) {
    try {
      const pool = await DatabaseRouter.getConfigPool();

      let query = `
        SELECT *
        FROM landing_sections
      `;

      const conditions = [];
      const values = [];

      // Filtro por visibilidad
      if (!filters.include_hidden) {
        conditions.push('is_visible = true');
      }

      // Filtro por tipo de sección
      if (filters.section_type) {
        values.push(filters.section_type);
        conditions.push(`section_type = $${values.length}`);
      }

      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
      }

      query += ` ORDER BY order_index ASC, created_at DESC`;

      const result = await pool.query(query, values);
      logger.info(`${result.rows.length} secciones totales obtenidas (admin view)`);

      return result.rows;
    } catch (error) {
      logger.error('Error obteniendo todas las secciones:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de secciones (admin)
   * @returns {Promise<Object>} Objeto con stats
   */
  async getSectionStats() {
    try {
      const pool = await DatabaseRouter.getConfigPool();

      const query = `
        SELECT
          COUNT(*) as total,
          SUM(CASE WHEN is_visible THEN 1 ELSE 0 END) as visible,
          SUM(CASE WHEN NOT is_visible THEN 1 ELSE 0 END) as hidden,
          COUNT(DISTINCT section_type) as unique_types
        FROM landing_sections
      `;

      const result = await pool.query(query);
      return result.rows[0];
    } catch (error) {
      logger.error('Error obteniendo stats de secciones:', error);
      throw error;
    }
  }

  /**
   * Crear nueva sección (admin)
   * @param {Object} sectionData - Datos de la sección
   * @param {string} created_by - Usuario que crea la sección
   * @returns {Promise<Object>} Sección creada
   */
  async createSection(sectionData, created_by = 'admin') {
    try {
      const {
        section_key,
        section_type,
        title,
        subtitle,
        description,
        layout_config,
        is_visible = true,
        order_index = 0
      } = sectionData;

      // Validar campos requeridos
      if (!section_key || !section_type) {
        throw new Error('section_key y section_type son requeridos');
      }

      // Validar que layout_config sea un objeto
      if (layout_config && typeof layout_config !== 'object') {
        throw new Error('layout_config debe ser un objeto JSON');
      }

      const pool = await DatabaseRouter.getConfigPool();

      const query = `
        INSERT INTO landing_sections (
          section_key, section_type, title, subtitle, description,
          layout_config, is_visible, order_index, created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;

      const result = await pool.query(query, [
        section_key,
        section_type,
        title || null,
        subtitle || null,
        description || null,
        JSON.stringify(layout_config || {}),
        is_visible,
        order_index,
        created_by
      ]);

      logger.info(`Sección creada con ID: ${result.rows[0].id} (${section_key})`);

      // Invalidar cache
      this.invalidateCache();

      return result.rows[0];
    } catch (error) {
      logger.error('Error creando sección:', error);
      throw error;
    }
  }

  /**
   * Actualizar sección existente (admin)
   * @param {number} id - ID de la sección
   * @param {Object} sectionData - Datos a actualizar
   * @param {string} updated_by - Usuario que actualiza
   * @returns {Promise<Object>} Sección actualizada
   */
  async updateSection(id, sectionData, updated_by = 'admin') {
    try {
      const pool = await DatabaseRouter.getConfigPool();

      // Construir query dinámicamente según campos presentes
      const updates = [];
      const values = [];
      let paramIndex = 1;

      // Campos actualizables
      const updatableFields = [
        'section_key',
        'section_type',
        'title',
        'subtitle',
        'description',
        'layout_config',
        'is_visible',
        'order_index'
      ];

      for (const field of updatableFields) {
        if (sectionData[field] !== undefined) {
          if (field === 'layout_config') {
            // Convertir layout_config a JSON
            updates.push(`${field} = $${paramIndex}::jsonb`);
            values.push(JSON.stringify(sectionData[field]));
          } else {
            updates.push(`${field} = $${paramIndex}`);
            values.push(sectionData[field]);
          }
          paramIndex++;
        }
      }

      if (updates.length === 0) {
        throw new Error('No hay campos para actualizar');
      }

      // Agregar updated_by
      updates.push(`updated_by = $${paramIndex}`);
      values.push(updated_by);
      paramIndex++;

      // Agregar ID al final
      values.push(id);

      const query = `
        UPDATE landing_sections
        SET ${updates.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;

      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        throw new Error(`Sección con ID ${id} no encontrada`);
      }

      logger.info(`Sección actualizada: ID ${id} (${result.rows[0].section_key})`);

      // Invalidar cache
      this.invalidateCache();

      return result.rows[0];
    } catch (error) {
      logger.error(`Error actualizando sección ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Eliminar sección (admin)
   * @param {number} id - ID de la sección
   * @returns {Promise<Object>} Sección eliminada
   */
  async deleteSection(id) {
    try {
      const pool = await DatabaseRouter.getConfigPool();

      const query = `
        DELETE FROM landing_sections
        WHERE id = $1
        RETURNING *
      `;

      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        throw new Error(`Sección con ID ${id} no encontrada`);
      }

      logger.info(`Sección eliminada: ID ${id} (${result.rows[0].section_key})`);

      // Invalidar cache
      this.invalidateCache();

      return result.rows[0];
    } catch (error) {
      logger.error(`Error eliminando sección ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Toggle visibilidad de una sección (admin)
   * @param {number} id - ID de la sección
   * @returns {Promise<Object>} Sección actualizada
   */
  async toggleVisibility(id) {
    try {
      const pool = await DatabaseRouter.getConfigPool();

      const query = `
        UPDATE landing_sections
        SET is_visible = NOT is_visible
        WHERE id = $1
        RETURNING *
      `;

      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        throw new Error(`Sección con ID ${id} no encontrada`);
      }

      const newStatus = result.rows[0].is_visible ? 'visible' : 'oculta';
      logger.info(`Visibilidad de sección ID ${id} cambiada a: ${newStatus}`);

      // Invalidar cache
      this.invalidateCache();

      return result.rows[0];
    } catch (error) {
      logger.error(`Error toggling visibilidad de sección ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Reordenar múltiples secciones (admin)
   * @param {Array<Object>} sections - Array de {id, order_index}
   * @returns {Promise<number>} Número de secciones actualizadas
   */
  async reorderSections(sections) {
    try {
      const pool = await DatabaseRouter.getConfigPool();

      // Usar transacción para asegurar atomicidad
      await pool.query('BEGIN');

      let updated = 0;
      for (const section of sections) {
        const query = `
          UPDATE landing_sections
          SET order_index = $1
          WHERE id = $2
        `;

        const result = await pool.query(query, [section.order_index, section.id]);
        updated += result.rowCount;
      }

      await pool.query('COMMIT');
      logger.info(`${updated} secciones reordenadas exitosamente`);

      // Invalidar cache
      this.invalidateCache();

      return updated;
    } catch (error) {
      // Rollback en caso de error
      const pool = await DatabaseRouter.getConfigPool();
      await pool.query('ROLLBACK');

      logger.error('Error reordenando secciones:', error);
      throw error;
    }
  }

  /**
   * Duplicar una sección (admin)
   * @param {number} id - ID de la sección a duplicar
   * @param {string} new_section_key - Nuevo section_key único
   * @param {string} new_title - Nuevo título (opcional)
   * @param {string} created_by - Usuario que crea la duplicación
   * @returns {Promise<Object>} Sección duplicada
   */
  async duplicateSection(id, new_section_key, new_title = null, created_by = 'admin') {
    try {
      const pool = await DatabaseRouter.getConfigPool();

      // Obtener sección original
      const getQuery = `
        SELECT * FROM landing_sections WHERE id = $1
      `;
      const originalResult = await pool.query(getQuery, [id]);

      if (originalResult.rows.length === 0) {
        throw new Error(`Sección con ID ${id} no encontrada`);
      }

      const original = originalResult.rows[0];

      // Crear duplicado
      const insertQuery = `
        INSERT INTO landing_sections (
          section_key, section_type, title, subtitle, description,
          layout_config, is_visible, order_index, created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;

      const result = await pool.query(insertQuery, [
        new_section_key,
        original.section_type,
        new_title || `${original.title} (Copia)`,
        original.subtitle,
        original.description,
        original.layout_config,
        false, // Oculta por defecto
        original.order_index + 0.1, // Inmediatamente después
        created_by
      ]);

      logger.info(`Sección duplicada: ${new_section_key} desde ID ${id}`);

      // Invalidar cache
      this.invalidateCache();

      return result.rows[0];
    } catch (error) {
      logger.error(`Error duplicando sección ID ${id}:`, error);
      throw error;
    }
  }

  // ============================================================================
  // CACHE MANAGEMENT
  // ============================================================================

  /**
   * Invalidar todo el cache de secciones
   */
  invalidateCache() {
    CacheService.del(`${CACHE_KEY_PREFIX}visible`);
    CacheService.del(`${CACHE_KEY_PREFIX}all`);
    logger.info('Cache de secciones invalidado');
  }
}

module.exports = new LandingSectionService();
