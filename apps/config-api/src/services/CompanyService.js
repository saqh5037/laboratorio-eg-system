const DatabaseRouter = require('./DatabaseRouter');
const logger = require('../utils/logger');
const CacheService = require('./CacheService');

const CACHE_KEY = 'company_info';
const CACHE_TTL = 3600; // 1 hora

class CompanyService {
  /**
   * Obtener información de la empresa
   * @returns {Object} Información corporativa completa
   */
  static async getCompanyInfo() {
    try {
      // Verificar caché
      const cached = CacheService.get(CACHE_KEY);
      if (cached) {
        logger.info('Company info servido desde caché');
        return cached;
      }

      // Obtener pool de la DB de configuración del laboratorio activo
      const pool = await DatabaseRouter.getConfigPool();

      const query = 'SELECT * FROM company_info WHERE id = 1';
      const result = await pool.query(query);

      if (result.rows.length === 0) {
        throw new Error('No se encontró información de la empresa');
      }

      const companyInfo = result.rows[0];

      // Calcular años de experiencia dinámicamente
      const currentYear = new Date().getFullYear();
      companyInfo.years_of_experience = currentYear - companyInfo.founded_year;

      // Guardar en caché
      CacheService.set(CACHE_KEY, companyInfo, CACHE_TTL);

      logger.info('Company info cargado desde base de datos');
      return companyInfo;
    } catch (error) {
      logger.error('Error al obtener company info:', error);
      throw error;
    }
  }

  /**
   * Actualizar información de la empresa
   * @param {Object} updates - Campos a actualizar
   * @returns {Object} Información actualizada
   */
  static async updateCompanyInfo(updates) {
    try {
      // Filtrar campos válidos
      const allowedFields = [
        'name', 'full_name', 'short_name', 'slogan', 'founded_year', 'rif',
        'email', 'phone_main', 'phone_secondary', 'phone_tertiary', 'whatsapp', 'whatsapp_link',
        'address_street', 'address_area', 'address_city', 'address_state', 'address_zip', 'address_country', 'google_maps_url',
        'hours_weekday', 'hours_saturday', 'hours_sunday',
        'social_instagram', 'social_instagram_handle', 'social_twitter', 'social_twitter_handle', 'social_facebook', 'social_youtube', 'social_linkedin',
        'seo_title', 'seo_description', 'seo_keywords', 'seo_author',
        'og_image_url', 'og_type', 'og_locale',
        'pwa_name', 'pwa_short_name', 'pwa_description',
        'privacy_policy_url', 'terms_of_service_url', 'cookies_policy_url',
        'copyright_template', 'certifications',
        'logo_full_url', 'logo_icon_url', 'logo_horizontal_url', 'favicon_url', 'logo_alt_text'
      ];

      const filteredUpdates = {};
      for (const key of allowedFields) {
        if (updates[key] !== undefined) {
          filteredUpdates[key] = updates[key];
        }
      }

      if (Object.keys(filteredUpdates).length === 0) {
        throw new Error('No hay campos válidos para actualizar');
      }

      // Construir query dinámico
      const setClauses = [];
      const values = [];
      let paramIndex = 1;

      for (const [key, value] of Object.entries(filteredUpdates)) {
        if (key === 'certifications' && typeof value === 'object') {
          setClauses.push(`${key} = $${paramIndex}::jsonb`);
          values.push(JSON.stringify(value));
        } else {
          setClauses.push(`${key} = $${paramIndex}`);
          values.push(value);
        }
        paramIndex++;
      }

      // Obtener pool de la DB de configuración del laboratorio activo
      const pool = await DatabaseRouter.getConfigPool();

      const query = `
        UPDATE company_info
        SET ${setClauses.join(', ')}
        WHERE id = 1
        RETURNING *
      `;

      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        throw new Error('No se pudo actualizar la información');
      }

      const updatedInfo = result.rows[0];

      // Calcular años de experiencia
      const currentYear = new Date().getFullYear();
      updatedInfo.years_of_experience = currentYear - updatedInfo.founded_year;

      // Invalidar caché
      CacheService.del(CACHE_KEY);
      logger.info('Caché de company info invalidado');

      // Guardar nuevo valor en caché
      CacheService.set(CACHE_KEY, updatedInfo, CACHE_TTL);

      logger.info('Company info actualizado', { fields: Object.keys(filteredUpdates) });
      return updatedInfo;
    } catch (error) {
      logger.error('Error al actualizar company info:', error);
      throw error;
    }
  }

  /**
   * Obtener solo información de contacto
   * @returns {Object} Datos de contacto
   */
  static async getContactInfo() {
    try {
      const companyInfo = await this.getCompanyInfo();
      return {
        email: companyInfo.email,
        phone_main: companyInfo.phone_main,
        phone_secondary: companyInfo.phone_secondary,
        phone_tertiary: companyInfo.phone_tertiary,
        whatsapp: companyInfo.whatsapp,
        whatsapp_link: companyInfo.whatsapp_link,
        address: {
          street: companyInfo.address_street,
          area: companyInfo.address_area,
          city: companyInfo.address_city,
          state: companyInfo.address_state,
          zip: companyInfo.address_zip,
          country: companyInfo.address_country,
          google_maps_url: companyInfo.google_maps_url
        },
        hours: {
          weekday: companyInfo.hours_weekday,
          saturday: companyInfo.hours_saturday,
          sunday: companyInfo.hours_sunday
        },
        social: {
          instagram: companyInfo.social_instagram,
          instagram_handle: companyInfo.social_instagram_handle,
          twitter: companyInfo.social_twitter,
          twitter_handle: companyInfo.social_twitter_handle,
          facebook: companyInfo.social_facebook,
          youtube: companyInfo.social_youtube,
          linkedin: companyInfo.social_linkedin
        }
      };
    } catch (error) {
      logger.error('Error al obtener contact info:', error);
      throw error;
    }
  }

  /**
   * Obtener solo información SEO
   * @returns {Object} Datos SEO
   */
  static async getSEOInfo() {
    try {
      const companyInfo = await this.getCompanyInfo();
      return {
        title: companyInfo.seo_title,
        description: companyInfo.seo_description,
        keywords: companyInfo.seo_keywords,
        author: companyInfo.seo_author,
        og: {
          image_url: companyInfo.og_image_url,
          type: companyInfo.og_type,
          locale: companyInfo.og_locale,
          site_name: companyInfo.name
        }
      };
    } catch (error) {
      logger.error('Error al obtener SEO info:', error);
      throw error;
    }
  }

  /**
   * Obtener información PWA
   * @returns {Object} Datos para PWA manifest
   */
  static async getPWAInfo() {
    try {
      const companyInfo = await this.getCompanyInfo();
      return {
        name: companyInfo.pwa_name,
        short_name: companyInfo.pwa_short_name,
        description: companyInfo.pwa_description
      };
    } catch (error) {
      logger.error('Error al obtener PWA info:', error);
      throw error;
    }
  }

  /**
   * Invalidar caché de company info
   */
  static invalidateCache() {
    CacheService.del(CACHE_KEY);
    logger.info('Caché de company info invalidado manualmente');
  }
}

module.exports = CompanyService;
