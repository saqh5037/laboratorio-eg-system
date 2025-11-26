/**
 * DimogenContentService
 * Service for managing DIMOGEN landing page content
 */

const db = require('../config/database');
const logger = require('../utils/logger');
const CacheService = require('./CacheService');

class DimogenContentService {
  constructor() {
    this.cache = CacheService;
    this.CACHE_PREFIX = 'dimogen:';
    this.CACHE_TTL = 300; // 5 minutes
  }

  // =====================================================
  // SERVICES (Líneas de Negocio)
  // =====================================================

  async getServices() {
    const cacheKey = `${this.CACHE_PREFIX}services:active`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      const query = `
        SELECT * FROM dimogen_services
        WHERE is_active = true
        ORDER BY sort_order ASC
      `;
      const result = await db.query(query);
      this.cache.set(cacheKey, result.rows, this.CACHE_TTL);
      return result.rows;
    } catch (error) {
      logger.error('Error getting DIMOGEN services:', error);
      throw error;
    }
  }

  async getAllServices() {
    try {
      const query = `SELECT * FROM dimogen_services ORDER BY sort_order ASC`;
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      logger.error('Error getting all DIMOGEN services:', error);
      throw error;
    }
  }

  async getServiceByKey(serviceKey) {
    try {
      const query = `SELECT * FROM dimogen_services WHERE service_key = $1`;
      const result = await db.query(query, [serviceKey]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error getting service by key:', error);
      throw error;
    }
  }

  async createService(data) {
    try {
      const query = `
        INSERT INTO dimogen_services (
          service_key, title, subtitle, description, icon_name,
          color_primary, color_secondary, color_light, color_gradient,
          image_url, features, stats_value, stats_label, link_url, sort_order, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING *
      `;
      const values = [
        data.service_key, data.title, data.subtitle, data.description, data.icon_name,
        data.color_primary, data.color_secondary, data.color_light, data.color_gradient,
        data.image_url, JSON.stringify(data.features || []),
        data.stats_value, data.stats_label, data.link_url,
        data.sort_order || 0, data.is_active !== false
      ];
      const result = await db.query(query, values);
      this.invalidateServicesCache();
      return result.rows[0];
    } catch (error) {
      logger.error('Error creating service:', error);
      throw error;
    }
  }

  async updateService(id, data) {
    try {
      const query = `
        UPDATE dimogen_services SET
          title = COALESCE($2, title),
          subtitle = COALESCE($3, subtitle),
          description = COALESCE($4, description),
          icon_name = COALESCE($5, icon_name),
          color_primary = COALESCE($6, color_primary),
          color_secondary = COALESCE($7, color_secondary),
          color_light = COALESCE($8, color_light),
          color_gradient = COALESCE($9, color_gradient),
          image_url = COALESCE($10, image_url),
          features = COALESCE($11, features),
          stats_value = COALESCE($12, stats_value),
          stats_label = COALESCE($13, stats_label),
          link_url = COALESCE($14, link_url),
          sort_order = COALESCE($15, sort_order),
          is_active = COALESCE($16, is_active),
          updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `;
      const values = [
        id,
        data.title, data.subtitle, data.description, data.icon_name,
        data.color_primary, data.color_secondary, data.color_light, data.color_gradient,
        data.image_url, data.features ? JSON.stringify(data.features) : null,
        data.stats_value, data.stats_label, data.link_url, data.sort_order, data.is_active
      ];
      const result = await db.query(query, values);
      this.invalidateServicesCache();
      return result.rows[0];
    } catch (error) {
      logger.error('Error updating service:', error);
      throw error;
    }
  }

  async deleteService(id) {
    try {
      const query = `DELETE FROM dimogen_services WHERE id = $1 RETURNING *`;
      const result = await db.query(query, [id]);
      this.invalidateServicesCache();
      return result.rows[0];
    } catch (error) {
      logger.error('Error deleting service:', error);
      throw error;
    }
  }

  invalidateServicesCache() {
    this.cache.del(`${this.CACHE_PREFIX}services:active`);
    this.cache.del(`${this.CACHE_PREFIX}content:all`);
  }

  // =====================================================
  // FAQ
  // =====================================================

  async getFaqs(category = null) {
    const cacheKey = category
      ? `${this.CACHE_PREFIX}faq:${category}`
      : `${this.CACHE_PREFIX}faq:all`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      let query = `SELECT * FROM dimogen_faq WHERE is_active = true`;
      const values = [];

      if (category) {
        query += ` AND category = $1`;
        values.push(category);
      }

      query += ` ORDER BY category, sort_order ASC`;

      const result = await db.query(query, values);
      this.cache.set(cacheKey, result.rows, this.CACHE_TTL);
      return result.rows;
    } catch (error) {
      logger.error('Error getting FAQs:', error);
      throw error;
    }
  }

  async getAllFaqs() {
    try {
      const query = `SELECT * FROM dimogen_faq ORDER BY category, sort_order ASC`;
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      logger.error('Error getting all FAQs:', error);
      throw error;
    }
  }

  async createFaq(data) {
    try {
      const query = `
        INSERT INTO dimogen_faq (category, question, answer, sort_order, is_active)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      const values = [data.category, data.question, data.answer, data.sort_order || 0, data.is_active !== false];
      const result = await db.query(query, values);
      this.invalidateFaqCache();
      return result.rows[0];
    } catch (error) {
      logger.error('Error creating FAQ:', error);
      throw error;
    }
  }

  async updateFaq(id, data) {
    try {
      const query = `
        UPDATE dimogen_faq SET
          category = COALESCE($2, category),
          question = COALESCE($3, question),
          answer = COALESCE($4, answer),
          sort_order = COALESCE($5, sort_order),
          is_active = COALESCE($6, is_active),
          updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `;
      const values = [id, data.category, data.question, data.answer, data.sort_order, data.is_active];
      const result = await db.query(query, values);
      this.invalidateFaqCache();
      return result.rows[0];
    } catch (error) {
      logger.error('Error updating FAQ:', error);
      throw error;
    }
  }

  async deleteFaq(id) {
    try {
      const query = `DELETE FROM dimogen_faq WHERE id = $1 RETURNING *`;
      const result = await db.query(query, [id]);
      this.invalidateFaqCache();
      return result.rows[0];
    } catch (error) {
      logger.error('Error deleting FAQ:', error);
      throw error;
    }
  }

  invalidateFaqCache() {
    // Clear all FAQ related cache keys
    const keys = this.cache.keys().filter(k => k.startsWith(`${this.CACHE_PREFIX}faq:`));
    keys.forEach(k => this.cache.del(k));
    this.cache.del(`${this.CACHE_PREFIX}content:all`);
  }

  // =====================================================
  // ABOUT (Filosofía y Valores)
  // =====================================================

  async getAbout() {
    const cacheKey = `${this.CACHE_PREFIX}about:active`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      const query = `
        SELECT * FROM dimogen_about
        WHERE is_active = true
        ORDER BY section_type, sort_order ASC
      `;
      const result = await db.query(query);

      // Group by section_type
      const grouped = {
        filosofia: result.rows.filter(r => r.section_type === 'filosofia'),
        valores: result.rows.filter(r => r.section_type === 'valores'),
        intro: result.rows.filter(r => r.section_type === 'intro')
      };

      this.cache.set(cacheKey, grouped, this.CACHE_TTL);
      return grouped;
    } catch (error) {
      logger.error('Error getting About section:', error);
      throw error;
    }
  }

  async getAllAbout() {
    try {
      const query = `SELECT * FROM dimogen_about ORDER BY section_type, sort_order ASC`;
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      logger.error('Error getting all About items:', error);
      throw error;
    }
  }

  async createAbout(data) {
    try {
      const query = `
        INSERT INTO dimogen_about (
          section_type, title, description, icon_name, color,
          stat_value, stat_label, sort_order, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;
      const values = [
        data.section_type, data.title, data.description, data.icon_name, data.color,
        data.stat_value, data.stat_label, data.sort_order || 0, data.is_active !== false
      ];
      const result = await db.query(query, values);
      this.invalidateAboutCache();
      return result.rows[0];
    } catch (error) {
      logger.error('Error creating About item:', error);
      throw error;
    }
  }

  async updateAbout(id, data) {
    try {
      const query = `
        UPDATE dimogen_about SET
          section_type = COALESCE($2, section_type),
          title = COALESCE($3, title),
          description = COALESCE($4, description),
          icon_name = COALESCE($5, icon_name),
          color = COALESCE($6, color),
          stat_value = COALESCE($7, stat_value),
          stat_label = COALESCE($8, stat_label),
          sort_order = COALESCE($9, sort_order),
          is_active = COALESCE($10, is_active),
          updated_at = NOW()
        WHERE id = $1
        RETURNING *
      `;
      const values = [
        id, data.section_type, data.title, data.description, data.icon_name,
        data.color, data.stat_value, data.stat_label, data.sort_order, data.is_active
      ];
      const result = await db.query(query, values);
      this.invalidateAboutCache();
      return result.rows[0];
    } catch (error) {
      logger.error('Error updating About item:', error);
      throw error;
    }
  }

  async deleteAbout(id) {
    try {
      const query = `DELETE FROM dimogen_about WHERE id = $1 RETURNING *`;
      const result = await db.query(query, [id]);
      this.invalidateAboutCache();
      return result.rows[0];
    } catch (error) {
      logger.error('Error deleting About item:', error);
      throw error;
    }
  }

  invalidateAboutCache() {
    this.cache.del(`${this.CACHE_PREFIX}about:active`);
    this.cache.del(`${this.CACHE_PREFIX}content:all`);
  }

  // =====================================================
  // ALL CONTENT (for landing page)
  // =====================================================

  async getAllContent() {
    const cacheKey = `${this.CACHE_PREFIX}content:all`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    try {
      // Fetch all data in parallel
      const [services, faqs, about, testimonials, contact, statistics, carousel, company] = await Promise.all([
        this.getServices(),
        this.getFaqs(),
        this.getAbout(),
        this.getTestimonials(),
        this.getContactInfo(),
        this.getStatistics(),
        this.getCarouselSlides(),
        this.getCompanyInfo()
      ]);

      const content = {
        services,
        faqs,
        about,
        testimonials,
        contact,
        statistics,
        carousel,
        company
      };

      this.cache.set(cacheKey, content, this.CACHE_TTL);
      return content;
    } catch (error) {
      logger.error('Error getting all DIMOGEN content:', error);
      throw error;
    }
  }

  // Helper methods for existing tables
  async getTestimonials() {
    try {
      const query = `SELECT * FROM landing_testimonials WHERE is_active = true ORDER BY sort_order ASC`;
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      logger.error('Error getting testimonials:', error);
      return [];
    }
  }

  async getContactInfo() {
    try {
      const query = `SELECT * FROM landing_contact_info WHERE is_active = true ORDER BY sort_order ASC`;
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      logger.error('Error getting contact info:', error);
      return [];
    }
  }

  async getStatistics() {
    try {
      const query = `SELECT * FROM landing_statistics WHERE is_active = true ORDER BY sort_order ASC`;
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      logger.error('Error getting statistics:', error);
      return [];
    }
  }

  async getCarouselSlides() {
    try {
      const query = `SELECT * FROM carousel_slides WHERE is_active = true ORDER BY order_position ASC`;
      const result = await db.query(query);
      return result.rows;
    } catch (error) {
      logger.error('Error getting carousel slides:', error);
      return [];
    }
  }

  async getCompanyInfo() {
    try {
      const query = `SELECT * FROM company_info LIMIT 1`;
      const result = await db.query(query);
      return result.rows[0] || null;
    } catch (error) {
      logger.error('Error getting company info:', error);
      return null;
    }
  }

  // =====================================================
  // CACHE INVALIDATION
  // =====================================================

  invalidateAllCache() {
    const keys = this.cache.keys().filter(k => k.startsWith(this.CACHE_PREFIX));
    keys.forEach(k => this.cache.del(k));
    logger.info(`Invalidated ${keys.length} DIMOGEN cache keys`);
  }
}

module.exports = new DimogenContentService();
