const DatabaseRouter = require('./DatabaseRouter');
const logger = require('../utils/logger');
const CacheService = require('./CacheService');

const CACHE_KEY_PREFIX = 'landing:';
const CACHE_TTL = 5 * 60; // 5 minutos

/**
 * LandingContentService
 * Servicio para gestionar todo el contenido de la landing page
 * Maneja 6 tablas: values, certifications, testimonials, contact_info, content_blocks, statistics
 */
class LandingContentService {
  // ============================================================================
  // LANDING VALUES (Valores corporativos)
  // ============================================================================

  /**
   * Obtener valores activos para mostrar públicamente
   */
  async getActiveValues() {
    const cacheKey = `${CACHE_KEY_PREFIX}values:active`;
    const cached = CacheService.get(cacheKey);

    if (cached) {
      logger.info('Landing values obtenidos desde cache');
      return cached;
    }

    try {
      // Obtener pool de la DB de configuración del laboratorio activo
      const pool = await DatabaseRouter.getConfigPool();

      const query = `
        SELECT *
        FROM landing_values
        WHERE is_active = true
        ORDER BY sort_order ASC
      `;

      const result = await pool.query(query);
      logger.info(`${result.rows.length} valores activos obtenidos desde BD`);

      CacheService.set(cacheKey, result.rows, CACHE_TTL);
      return result.rows;
    } catch (error) {
      logger.error('Error obteniendo valores activos:', error);
      throw error;
    }
  }

  /**
   * Obtener todos los valores (admin)
   */
  async getAllValues() {
    try {
      // Obtener pool de la DB de configuración del laboratorio activo
      const pool = await DatabaseRouter.getConfigPool();

      const query = `
        SELECT *
        FROM landing_values
        ORDER BY sort_order ASC, created_at DESC
      `;

      const result = await pool.query(query);
      logger.info(`${result.rows.length} valores totales obtenidos (admin view)`);

      return result.rows;
    } catch (error) {
      logger.error('Error obteniendo todos los valores:', error);
      throw error;
    }
  }

  /**
   * Crear nuevo valor
   */
  async createValue(valueData) {
    try {
      const { icon_name, title, description, sort_order = 0, is_active = true } = valueData;

      // Obtener pool de la DB de configuración del laboratorio activo
      const pool = await DatabaseRouter.getConfigPool();

      const query = `
        INSERT INTO landing_values (icon_name, title, description, sort_order, is_active)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;

      const result = await pool.query(query, [icon_name, title, description, sort_order, is_active]);
      logger.info(`Valor creado con ID: ${result.rows[0].id}`);

      // Invalidar cache
      CacheService.del(`${CACHE_KEY_PREFIX}values:active`);

      return result.rows[0];
    } catch (error) {
      logger.error('Error creating value:', error);
      throw error;
    }
  }

  /**
   * Actualizar valor
   */
  async updateValue(id, valueData) {
    try {
      const { icon_name, title, description, sort_order, is_active } = valueData;

      // Obtener pool de la DB de configuración del laboratorio activo
      const pool = await DatabaseRouter.getConfigPool();

      const query = `
        UPDATE landing_values
        SET icon_name = $1, title = $2, description = $3, sort_order = $4, is_active = $5, updated_at = CURRENT_TIMESTAMP
        WHERE id = $6
        RETURNING *
      `;

      const result = await pool.query(query, [icon_name, title, description, sort_order, is_active, id]);

      if (result.rows.length === 0) {
        throw new Error(`Valor con ID ${id} no encontrado`);
      }

      logger.info(`Valor ${id} actualizado`);
      CacheService.del(`${CACHE_KEY_PREFIX}values:active`);

      return result.rows[0];
    } catch (error) {
      logger.error(`Error updating value ${id}:`, error);
      throw error;
    }
  }

  /**
   * Eliminar valor
   */
  async deleteValue(id) {
    try {
      // Obtener pool de la DB de configuración del laboratorio activo
      const pool = await DatabaseRouter.getConfigPool();

      const query = `DELETE FROM landing_values WHERE id = $1 RETURNING *`;
      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        throw new Error(`Valor con ID ${id} no encontrado`);
      }

      logger.info(`Valor ${id} eliminado`);
      CacheService.del(`${CACHE_KEY_PREFIX}values:active`);

      return result.rows[0];
    } catch (error) {
      logger.error(`Error deleting value ${id}:`, error);
      throw error;
    }
  }

  // ============================================================================
  // LANDING CERTIFICATIONS (Certificaciones)
  // ============================================================================

  /**
   * Obtener certificaciones activas
   */
  async getActiveCertifications() {
    const cacheKey = `${CACHE_KEY_PREFIX}certifications:active`;
    const cached = CacheService.get(cacheKey);

    if (cached) {
      logger.info('Landing certifications obtenidas desde cache');
      return cached;
    }

    try {
      // Obtener pool de la DB de configuración del laboratorio activo
      const pool = await DatabaseRouter.getConfigPool();

      const query = `
        SELECT *
        FROM landing_certifications
        WHERE is_active = true
        ORDER BY sort_order ASC
      `;

      const result = await pool.query(query);
      logger.info(`${result.rows.length} certificaciones activas obtenidas desde BD`);

      CacheService.set(cacheKey, result.rows, CACHE_TTL);
      return result.rows;
    } catch (error) {
      logger.error('Error obteniendo certificaciones activas:', error);
      throw error;
    }
  }

  /**
   * Obtener todas las certificaciones (admin)
   */
  async getAllCertifications() {
    try {
      // Obtener pool de la DB de configuración del laboratorio activo
      const pool = await DatabaseRouter.getConfigPool();

      const query = `
        SELECT *
        FROM landing_certifications
        ORDER BY sort_order ASC, created_at DESC
      `;

      const result = await pool.query(query);
      logger.info(`${result.rows.length} certificaciones totales obtenidas (admin view)`);

      return result.rows;
    } catch (error) {
      logger.error('Error obteniendo todas las certificaciones:', error);
      throw error;
    }
  }

  /**
   * Crear certificación
   */
  async createCertification(certData) {
    try {
      const { icon_name, title, description, sort_order = 0, is_active = true } = certData;

      // Obtener pool de la DB de configuración del laboratorio activo
      const pool = await DatabaseRouter.getConfigPool();

      const query = `
        INSERT INTO landing_certifications (icon_name, title, description, sort_order, is_active)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;

      const result = await pool.query(query, [icon_name, title, description, sort_order, is_active]);
      logger.info(`Certificación creada con ID: ${result.rows[0].id}`);

      CacheService.del(`${CACHE_KEY_PREFIX}certifications:active`);
      return result.rows[0];
    } catch (error) {
      logger.error('Error creating certification:', error);
      throw error;
    }
  }

  /**
   * Actualizar certificación
   */
  async updateCertification(id, certData) {
    try {
      const { icon_name, title, description, sort_order, is_active } = certData;

      // Obtener pool de la DB de configuración del laboratorio activo
      const pool = await DatabaseRouter.getConfigPool();

      const query = `
        UPDATE landing_certifications
        SET icon_name = $1, title = $2, description = $3, sort_order = $4, is_active = $5, updated_at = CURRENT_TIMESTAMP
        WHERE id = $6
        RETURNING *
      `;

      const result = await pool.query(query, [icon_name, title, description, sort_order, is_active, id]);

      if (result.rows.length === 0) {
        throw new Error(`Certificación con ID ${id} no encontrada`);
      }

      logger.info(`Certificación ${id} actualizada`);
      CacheService.del(`${CACHE_KEY_PREFIX}certifications:active`);

      return result.rows[0];
    } catch (error) {
      logger.error(`Error updating certification ${id}:`, error);
      throw error;
    }
  }

  /**
   * Eliminar certificación
   */
  async deleteCertification(id) {
    try {
      // Obtener pool de la DB de configuración del laboratorio activo
      const pool = await DatabaseRouter.getConfigPool();

      const query = `DELETE FROM landing_certifications WHERE id = $1 RETURNING *`;
      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        throw new Error(`Certificación con ID ${id} no encontrada`);
      }

      logger.info(`Certificación ${id} eliminada`);
      CacheService.del(`${CACHE_KEY_PREFIX}certifications:active`);

      return result.rows[0];
    } catch (error) {
      logger.error(`Error deleting certification ${id}:`, error);
      throw error;
    }
  }

  // ============================================================================
  // LANDING TESTIMONIALS (Testimonios)
  // ============================================================================

  /**
   * Obtener testimonios activos
   */
  async getActiveTestimonials() {
    const cacheKey = `${CACHE_KEY_PREFIX}testimonials:active`;
    const cached = CacheService.get(cacheKey);

    if (cached) {
      logger.info('Landing testimonials obtenidos desde cache');
      return cached;
    }

    try {
      // Obtener pool de la DB de configuración del laboratorio activo
      const pool = await DatabaseRouter.getConfigPool();

      const query = `
        SELECT *
        FROM landing_testimonials
        WHERE is_active = true
        ORDER BY sort_order ASC
      `;

      const result = await pool.query(query);
      logger.info(`${result.rows.length} testimonios activos obtenidos desde BD`);

      CacheService.set(cacheKey, result.rows, CACHE_TTL);
      return result.rows;
    } catch (error) {
      logger.error('Error obteniendo testimonios activos:', error);
      throw error;
    }
  }

  /**
   * Obtener todos los testimonios (admin)
   */
  async getAllTestimonials() {
    try {
      // Obtener pool de la DB de configuración del laboratorio activo
      const pool = await DatabaseRouter.getConfigPool();

      const query = `
        SELECT *
        FROM landing_testimonials
        ORDER BY sort_order ASC, created_at DESC
      `;

      const result = await pool.query(query);
      logger.info(`${result.rows.length} testimonios totales obtenidos (admin view)`);

      return result.rows;
    } catch (error) {
      logger.error('Error obteniendo todos los testimonios:', error);
      throw error;
    }
  }

  /**
   * Crear testimonio
   */
  async createTestimonial(testimData) {
    try {
      const { name, role, text, avatar_type = 'FaUser', rating = 5, sort_order = 0, is_active = true } = testimData;

      // Obtener pool de la DB de configuración del laboratorio activo
      const pool = await DatabaseRouter.getConfigPool();

      const query = `
        INSERT INTO landing_testimonials (name, role, text, avatar_type, rating, sort_order, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;

      const result = await pool.query(query, [name, role, text, avatar_type, rating, sort_order, is_active]);
      logger.info(`Testimonio creado con ID: ${result.rows[0].id}`);

      CacheService.del(`${CACHE_KEY_PREFIX}testimonials:active`);
      return result.rows[0];
    } catch (error) {
      logger.error('Error creating testimonial:', error);
      throw error;
    }
  }

  /**
   * Actualizar testimonio
   */
  async updateTestimonial(id, testimData) {
    try {
      const { name, role, text, avatar_type, rating, sort_order, is_active } = testimData;

      // Obtener pool de la DB de configuración del laboratorio activo
      const pool = await DatabaseRouter.getConfigPool();

      const query = `
        UPDATE landing_testimonials
        SET name = $1, role = $2, text = $3, avatar_type = $4, rating = $5, sort_order = $6, is_active = $7, updated_at = CURRENT_TIMESTAMP
        WHERE id = $8
        RETURNING *
      `;

      const result = await pool.query(query, [name, role, text, avatar_type, rating, sort_order, is_active, id]);

      if (result.rows.length === 0) {
        throw new Error(`Testimonio con ID ${id} no encontrado`);
      }

      logger.info(`Testimonio ${id} actualizado`);
      CacheService.del(`${CACHE_KEY_PREFIX}testimonials:active`);

      return result.rows[0];
    } catch (error) {
      logger.error(`Error updating testimonial ${id}:`, error);
      throw error;
    }
  }

  /**
   * Eliminar testimonio
   */
  async deleteTestimonial(id) {
    try {
      // Obtener pool de la DB de configuración del laboratorio activo
      const pool = await DatabaseRouter.getConfigPool();

      const query = `DELETE FROM landing_testimonials WHERE id = $1 RETURNING *`;
      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        throw new Error(`Testimonio con ID ${id} no encontrado`);
      }

      logger.info(`Testimonio ${id} eliminado`);
      CacheService.del(`${CACHE_KEY_PREFIX}testimonials:active`);

      return result.rows[0];
    } catch (error) {
      logger.error(`Error deleting testimonial ${id}:`, error);
      throw error;
    }
  }

  // ============================================================================
  // LANDING CONTACT INFO (Información de contacto)
  // ============================================================================

  /**
   * Obtener información de contacto activa
   */
  async getActiveContactInfo() {
    const cacheKey = `${CACHE_KEY_PREFIX}contact:active`;
    const cached = CacheService.get(cacheKey);

    if (cached) {
      logger.info('Landing contact info obtenida desde cache');
      return cached;
    }

    try {
      // Obtener pool de la DB de configuración del laboratorio activo
      const pool = await DatabaseRouter.getConfigPool();

      const query = `
        SELECT *
        FROM landing_contact_info
        WHERE is_active = true
        ORDER BY sort_order ASC
      `;

      const result = await pool.query(query);
      logger.info(`${result.rows.length} items de contacto activos obtenidos desde BD`);

      CacheService.set(cacheKey, result.rows, CACHE_TTL);
      return result.rows;
    } catch (error) {
      logger.error('Error obteniendo contact info activa:', error);
      throw error;
    }
  }

  /**
   * Obtener contact info por tipo
   */
  async getContactInfoByType(type) {
    const cacheKey = `${CACHE_KEY_PREFIX}contact:type:${type}`;
    const cached = CacheService.get(cacheKey);

    if (cached) {
      logger.info(`Landing contact info tipo ${type} obtenida desde cache`);
      return cached;
    }

    try {
      // Obtener pool de la DB de configuración del laboratorio activo
      const pool = await DatabaseRouter.getConfigPool();

      const query = `
        SELECT *
        FROM landing_contact_info
        WHERE type = $1 AND is_active = true
        ORDER BY sort_order ASC
      `;

      const result = await pool.query(query, [type]);
      logger.info(`${result.rows.length} items de contacto tipo ${type} obtenidos desde BD`);

      CacheService.set(cacheKey, result.rows, CACHE_TTL);
      return result.rows;
    } catch (error) {
      logger.error(`Error obteniendo contact info tipo ${type}:`, error);
      throw error;
    }
  }

  /**
   * Obtener toda la contact info (admin)
   */
  async getAllContactInfo() {
    try {
      // Obtener pool de la DB de configuración del laboratorio activo
      const pool = await DatabaseRouter.getConfigPool();

      const query = `
        SELECT *
        FROM landing_contact_info
        ORDER BY sort_order ASC, created_at DESC
      `;

      const result = await pool.query(query);
      logger.info(`${result.rows.length} items de contacto totales obtenidos (admin view)`);

      return result.rows;
    } catch (error) {
      logger.error('Error obteniendo toda la contact info:', error);
      throw error;
    }
  }

  /**
   * Crear contact info
   */
  async createContactInfo(contactData) {
    try {
      const { type, category, icon_name, label, value, link, sort_order = 0, is_active = true } = contactData;

      // Obtener pool de la DB de configuración del laboratorio activo
      const pool = await DatabaseRouter.getConfigPool();

      const query = `
        INSERT INTO landing_contact_info (type, category, icon_name, label, value, link, sort_order, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;

      const result = await pool.query(query, [type, category, icon_name, label, value, link, sort_order, is_active]);
      logger.info(`Contact info creada con ID: ${result.rows[0].id}`);

      CacheService.del(`${CACHE_KEY_PREFIX}contact:active`);
      if (type) CacheService.del(`${CACHE_KEY_PREFIX}contact:type:${type}`);

      return result.rows[0];
    } catch (error) {
      logger.error('Error creating contact info:', error);
      throw error;
    }
  }

  /**
   * Actualizar contact info
   */
  async updateContactInfo(id, contactData) {
    try {
      const { type, category, icon_name, label, value, link, sort_order, is_active } = contactData;

      // Obtener pool de la DB de configuración del laboratorio activo
      const pool = await DatabaseRouter.getConfigPool();

      const query = `
        UPDATE landing_contact_info
        SET type = $1, category = $2, icon_name = $3, label = $4, value = $5, link = $6, sort_order = $7, is_active = $8, updated_at = CURRENT_TIMESTAMP
        WHERE id = $9
        RETURNING *
      `;

      const result = await pool.query(query, [type, category, icon_name, label, value, link, sort_order, is_active, id]);

      if (result.rows.length === 0) {
        throw new Error(`Contact info con ID ${id} no encontrada`);
      }

      logger.info(`Contact info ${id} actualizada`);
      CacheService.del(`${CACHE_KEY_PREFIX}contact:active`);
      if (type) CacheService.del(`${CACHE_KEY_PREFIX}contact:type:${type}`);

      return result.rows[0];
    } catch (error) {
      logger.error(`Error updating contact info ${id}:`, error);
      throw error;
    }
  }

  /**
   * Eliminar contact info
   */
  async deleteContactInfo(id) {
    try {
      // Obtener pool de la DB de configuración del laboratorio activo
      const pool = await DatabaseRouter.getConfigPool();

      const query = `DELETE FROM landing_contact_info WHERE id = $1 RETURNING *`;
      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        throw new Error(`Contact info con ID ${id} no encontrada`);
      }

      logger.info(`Contact info ${id} eliminada`);
      CacheService.del(`${CACHE_KEY_PREFIX}contact:active`);

      return result.rows[0];
    } catch (error) {
      logger.error(`Error deleting contact info ${id}:`, error);
      throw error;
    }
  }

  // ============================================================================
  // LANDING CONTENT BLOCKS (Bloques de contenido de texto)
  // ============================================================================

  /**
   * Obtener content blocks activos
   */
  async getActiveContentBlocks() {
    const cacheKey = `${CACHE_KEY_PREFIX}content:active`;
    const cached = CacheService.get(cacheKey);

    if (cached) {
      logger.info('Landing content blocks obtenidos desde cache');
      return cached;
    }

    try {
      // Obtener pool de la DB de configuración del laboratorio activo
      const pool = await DatabaseRouter.getConfigPool();

      const query = `
        SELECT *
        FROM landing_content_blocks
        WHERE is_active = true
        ORDER BY section ASC, sort_order ASC
      `;

      const result = await pool.query(query);
      logger.info(`${result.rows.length} content blocks activos obtenidos desde BD`);

      CacheService.set(cacheKey, result.rows, CACHE_TTL);
      return result.rows;
    } catch (error) {
      logger.error('Error obteniendo content blocks activos:', error);
      throw error;
    }
  }

  /**
   * Obtener content blocks por sección
   */
  async getContentBlocksBySection(section) {
    const cacheKey = `${CACHE_KEY_PREFIX}content:section:${section}`;
    const cached = CacheService.get(cacheKey);

    if (cached) {
      logger.info(`Landing content blocks sección ${section} obtenidos desde cache`);
      return cached;
    }

    try {
      // Obtener pool de la DB de configuración del laboratorio activo
      const pool = await DatabaseRouter.getConfigPool();

      const query = `
        SELECT *
        FROM landing_content_blocks
        WHERE section = $1 AND is_active = true
        ORDER BY sort_order ASC
      `;

      const result = await pool.query(query, [section]);
      logger.info(`${result.rows.length} content blocks sección ${section} obtenidos desde BD`);

      CacheService.set(cacheKey, result.rows, CACHE_TTL);
      return result.rows;
    } catch (error) {
      logger.error(`Error obteniendo content blocks sección ${section}:`, error);
      throw error;
    }
  }

  /**
   * Obtener todos los content blocks (admin)
   */
  async getAllContentBlocks() {
    try {
      // Obtener pool de la DB de configuración del laboratorio activo
      const pool = await DatabaseRouter.getConfigPool();

      const query = `
        SELECT *
        FROM landing_content_blocks
        ORDER BY section ASC, sort_order ASC, created_at DESC
      `;

      const result = await pool.query(query);
      logger.info(`${result.rows.length} content blocks totales obtenidos (admin view)`);

      return result.rows;
    } catch (error) {
      logger.error('Error obteniendo todos los content blocks:', error);
      throw error;
    }
  }

  /**
   * Crear content block
   */
  async createContentBlock(blockData) {
    try {
      const { section, block_type, content, image_url, metadata, sort_order = 0, is_active = true } = blockData;

      // Obtener pool de la DB de configuración del laboratorio activo
      const pool = await DatabaseRouter.getConfigPool();

      const query = `
        INSERT INTO landing_content_blocks (section, block_type, content, image_url, metadata, sort_order, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;

      const result = await pool.query(query, [section, block_type, content, image_url, metadata, sort_order, is_active]);
      logger.info(`Content block creado con ID: ${result.rows[0].id}`);

      CacheService.del(`${CACHE_KEY_PREFIX}content:active`);
      if (section) CacheService.del(`${CACHE_KEY_PREFIX}content:section:${section}`);

      return result.rows[0];
    } catch (error) {
      logger.error('Error creating content block:', error);
      throw error;
    }
  }

  /**
   * Actualizar content block
   */
  async updateContentBlock(id, blockData) {
    try {
      const { section, block_type, content, image_url, metadata, sort_order, is_active } = blockData;

      // Obtener pool de la DB de configuración del laboratorio activo
      const pool = await DatabaseRouter.getConfigPool();

      const query = `
        UPDATE landing_content_blocks
        SET section = $1, block_type = $2, content = $3, image_url = $4, metadata = $5, sort_order = $6, is_active = $7, updated_at = CURRENT_TIMESTAMP
        WHERE id = $8
        RETURNING *
      `;

      const result = await pool.query(query, [section, block_type, content, image_url, metadata, sort_order, is_active, id]);

      if (result.rows.length === 0) {
        throw new Error(`Content block con ID ${id} no encontrado`);
      }

      logger.info(`Content block ${id} actualizado`);
      CacheService.del(`${CACHE_KEY_PREFIX}content:active`);
      if (section) CacheService.del(`${CACHE_KEY_PREFIX}content:section:${section}`);

      return result.rows[0];
    } catch (error) {
      logger.error(`Error updating content block ${id}:`, error);
      throw error;
    }
  }

  /**
   * Eliminar content block
   */
  async deleteContentBlock(id) {
    try {
      // Obtener pool de la DB de configuración del laboratorio activo
      const pool = await DatabaseRouter.getConfigPool();

      const query = `DELETE FROM landing_content_blocks WHERE id = $1 RETURNING *`;
      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        throw new Error(`Content block con ID ${id} no encontrado`);
      }

      logger.info(`Content block ${id} eliminado`);
      CacheService.del(`${CACHE_KEY_PREFIX}content:active`);

      return result.rows[0];
    } catch (error) {
      logger.error(`Error deleting content block ${id}:`, error);
      throw error;
    }
  }

  // ============================================================================
  // LANDING STATISTICS (Estadísticas para CTA)
  // ============================================================================

  /**
   * Obtener estadísticas activas
   */
  async getActiveStatistics() {
    const cacheKey = `${CACHE_KEY_PREFIX}statistics:active`;
    const cached = CacheService.get(cacheKey);

    if (cached) {
      logger.info('Landing statistics obtenidas desde cache');
      return cached;
    }

    try {
      // Obtener pool de la DB de configuración del laboratorio activo
      const pool = await DatabaseRouter.getConfigPool();

      const query = `
        SELECT *
        FROM landing_statistics
        WHERE is_active = true
        ORDER BY sort_order ASC
      `;

      const result = await pool.query(query);
      logger.info(`${result.rows.length} estadísticas activas obtenidas desde BD`);

      CacheService.set(cacheKey, result.rows, CACHE_TTL);
      return result.rows;
    } catch (error) {
      logger.error('Error obteniendo estadísticas activas:', error);
      throw error;
    }
  }

  /**
   * Obtener todas las estadísticas (admin)
   */
  async getAllStatistics() {
    try {
      // Obtener pool de la DB de configuración del laboratorio activo
      const pool = await DatabaseRouter.getConfigPool();

      const query = `
        SELECT *
        FROM landing_statistics
        ORDER BY sort_order ASC, created_at DESC
      `;

      const result = await pool.query(query);
      logger.info(`${result.rows.length} estadísticas totales obtenidas (admin view)`);

      return result.rows;
    } catch (error) {
      logger.error('Error obteniendo todas las estadísticas:', error);
      throw error;
    }
  }

  /**
   * Crear estadística
   */
  async createStatistic(statData) {
    try {
      const { section = 'cta', label, value, description, icon_name, sort_order = 0, is_active = true } = statData;

      // Obtener pool de la DB de configuración del laboratorio activo
      const pool = await DatabaseRouter.getConfigPool();

      const query = `
        INSERT INTO landing_statistics (section, label, value, description, icon_name, sort_order, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;

      const result = await pool.query(query, [section, label, value, description, icon_name, sort_order, is_active]);
      logger.info(`Estadística creada con ID: ${result.rows[0].id}`);

      CacheService.del(`${CACHE_KEY_PREFIX}statistics:active`);
      return result.rows[0];
    } catch (error) {
      logger.error('Error creating statistic:', error);
      throw error;
    }
  }

  /**
   * Actualizar estadística
   */
  async updateStatistic(id, statData) {
    try {
      const { section, label, value, description, icon_name, sort_order, is_active } = statData;

      // Obtener pool de la DB de configuración del laboratorio activo
      const pool = await DatabaseRouter.getConfigPool();

      const query = `
        UPDATE landing_statistics
        SET section = $1, label = $2, value = $3, description = $4, icon_name = $5, sort_order = $6, is_active = $7, updated_at = CURRENT_TIMESTAMP
        WHERE id = $8
        RETURNING *
      `;

      const result = await pool.query(query, [section, label, value, description, icon_name, sort_order, is_active, id]);

      if (result.rows.length === 0) {
        throw new Error(`Estadística con ID ${id} no encontrada`);
      }

      logger.info(`Estadística ${id} actualizada`);
      CacheService.del(`${CACHE_KEY_PREFIX}statistics:active`);

      return result.rows[0];
    } catch (error) {
      logger.error(`Error updating statistic ${id}:`, error);
      throw error;
    }
  }

  /**
   * Eliminar estadística
   */
  async deleteStatistic(id) {
    try {
      // Obtener pool de la DB de configuración del laboratorio activo
      const pool = await DatabaseRouter.getConfigPool();

      const query = `DELETE FROM landing_statistics WHERE id = $1 RETURNING *`;
      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        throw new Error(`Estadística con ID ${id} no encontrada`);
      }

      logger.info(`Estadística ${id} eliminada`);
      CacheService.del(`${CACHE_KEY_PREFIX}statistics:active`);

      return result.rows[0];
    } catch (error) {
      logger.error(`Error deleting statistic ${id}:`, error);
      throw error;
    }
  }

  // ============================================================================
  // HELPER: Obtener TODO el contenido de la landing (útil para frontend)
  // ============================================================================

  /**
   * Obtener TODO el contenido activo de la landing page en una sola llamada
   * Retorna objeto con todas las secciones
   */
  async getAllLandingContent() {
    const cacheKey = `${CACHE_KEY_PREFIX}all:active`;
    const cached = CacheService.get(cacheKey);

    if (cached) {
      logger.info('Todo el contenido de landing obtenido desde cache');
      return cached;
    }

    try {
      const [
        values,
        certifications,
        testimonials,
        contactInfo,
        contentBlocks,
        statistics
      ] = await Promise.all([
        this.getActiveValues(),
        this.getActiveCertifications(),
        this.getActiveTestimonials(),
        this.getActiveContactInfo(),
        this.getActiveContentBlocks(),
        this.getActiveStatistics()
      ]);

      const allContent = {
        values,
        certifications,
        testimonials,
        contactInfo,
        contentBlocks,
        statistics
      };

      logger.info('Todo el contenido de landing obtenido exitosamente');
      CacheService.set(cacheKey, allContent, CACHE_TTL);

      return allContent;
    } catch (error) {
      logger.error('Error obteniendo todo el contenido de landing:', error);
      throw error;
    }
  }

  // ============================================================================
  // CACHE INVALIDATION (Invalidar caché para publicar cambios)
  // ============================================================================

  /**
   * Invalidar TODO el caché de landing page
   * Útil cuando el admin quiere publicar cambios a la landing pública
   *
   * @returns {Object} - Resultado con cantidad de keys eliminadas
   */
  async invalidateAllCache() {
    try {
      logger.info('🗑️ Iniciando invalidación de todo el caché de landing...');

      // Lista de todas las keys de caché que usamos
      const cacheKeys = [
        // Cache principal
        `${CACHE_KEY_PREFIX}all:active`,

        // Values
        `${CACHE_KEY_PREFIX}values:active`,

        // Certifications
        `${CACHE_KEY_PREFIX}certifications:active`,

        // Testimonials
        `${CACHE_KEY_PREFIX}testimonials:active`,

        // Contact info
        `${CACHE_KEY_PREFIX}contact:active`,
        // Note: contact info by type usa keys dinámicas como "landing:contact:type:phone"
        // pero las invalidaremos cuando se actualicen individualmente

        // Content blocks
        `${CACHE_KEY_PREFIX}content:active`,
        // Note: content blocks by section usa keys dinámicas como "landing:content:section:nosotros-header"
        // pero las invalidaremos cuando se actualicen individualmente

        // Statistics
        `${CACHE_KEY_PREFIX}statistics:active`
      ];

      let deletedCount = 0;
      let errors = [];

      // Eliminar cada key
      for (const key of cacheKeys) {
        try {
          const result = CacheService.del(key);
          if (result) {
            deletedCount++;
            logger.info(`✅ Cache key eliminada: ${key}`);
          } else {
            logger.info(`ℹ️ Cache key no existía: ${key}`);
          }
        } catch (err) {
          logger.error(`❌ Error eliminando cache key ${key}:`, err);
          errors.push({ key, error: err.message });
        }
      }

      logger.info(`🎉 Invalidación de caché completada: ${deletedCount} keys eliminadas`);

      return {
        success: true,
        deletedCount,
        totalKeys: cacheKeys.length,
        errors: errors.length > 0 ? errors : null,
        message: `Caché invalidado exitosamente. ${deletedCount} keys eliminadas.`
      };
    } catch (error) {
      logger.error('💥 Error en invalidateAllCache:', error);
      throw error;
    }
  }
}

module.exports = new LandingContentService();
