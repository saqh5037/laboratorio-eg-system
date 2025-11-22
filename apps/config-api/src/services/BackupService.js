const DatabaseRouter = require('./DatabaseRouter');
const logger = require('../utils/logger');
const CacheService = require('./CacheService');

class BackupService {
  /**
   * Exportar TODA la configuración a JSON
   * Incluye TODAS las tablas necesarias para un restore completo
   * @returns {Promise<Object>}
   */
  async exportConfiguration() {
    try {
      logger.info('Iniciando exportación de configuración completa');
      const pool = await DatabaseRouter.getConfigPool();

      // Exportar TODAS las tablas de configuración
      const [
        navigation,
        companyInfo,
        themeConfig,
        systemConfig,
        carouselSlides,
        landingValues,
        landingCertifications,
        landingTestimonials,
        landingContactInfo,
        landingContentBlocks,
        landingStatistics
      ] = await Promise.all([
        pool.query('SELECT * FROM navigation_items ORDER BY location, sort_order'),
        pool.query('SELECT * FROM company_info WHERE id = 1'),
        pool.query('SELECT * FROM theme_config WHERE id = 1'),
        pool.query('SELECT * FROM system_config ORDER BY category, key'),
        pool.query('SELECT * FROM carousel_slides ORDER BY order_position'),
        pool.query('SELECT * FROM landing_values ORDER BY sort_order'),
        pool.query('SELECT * FROM landing_certifications ORDER BY sort_order'),
        pool.query('SELECT * FROM landing_testimonials ORDER BY sort_order'),
        pool.query('SELECT * FROM landing_contact_info ORDER BY sort_order'),
        pool.query('SELECT * FROM landing_content_blocks ORDER BY section, sort_order'),
        pool.query('SELECT * FROM landing_statistics ORDER BY sort_order')
      ]);

      const exportData = {
        version: '2.0.0', // Nueva versión con backup completo
        exported_at: new Date().toISOString(),
        data: {
          navigation: navigation.rows,
          company_info: companyInfo.rows[0] || {},
          theme_config: themeConfig.rows[0] || {},
          system_config: systemConfig.rows,
          carousel_slides: carouselSlides.rows,
          landing_values: landingValues.rows,
          landing_certifications: landingCertifications.rows,
          landing_testimonials: landingTestimonials.rows,
          landing_contact_info: landingContactInfo.rows,
          landing_content_blocks: landingContentBlocks.rows,
          landing_statistics: landingStatistics.rows
        },
        metadata: {
          total_navigation_items: navigation.rows.length,
          total_system_configs: systemConfig.rows.length,
          total_carousel_slides: carouselSlides.rows.length,
          total_landing_values: landingValues.rows.length,
          total_landing_certifications: landingCertifications.rows.length,
          total_landing_testimonials: landingTestimonials.rows.length,
          total_landing_contact_info: landingContactInfo.rows.length,
          total_landing_content_blocks: landingContentBlocks.rows.length,
          total_landing_statistics: landingStatistics.rows.length
        }
      };

      logger.info('Exportación completada exitosamente', exportData.metadata);
      return exportData;
    } catch (error) {
      logger.error('Error al exportar configuración:', error);
      throw error;
    }
  }

  /**
   * Importar configuración COMPLETA desde JSON
   * Restaura TODAS las tablas para un cambio total de branding
   * @param {Object} importData - Datos a importar
   * @param {string} importedBy - Usuario que importa
   * @returns {Promise<Object>}
   */
  async importConfiguration(importData, importedBy = 'admin') {
    const pool = await DatabaseRouter.getConfigPool();
    const client = await pool.connect();

    try {
      logger.info('Iniciando importación de configuración COMPLETA', { importedBy });

      // Validar estructura - Soportar tanto nuevo formato {version, data} como legacy {data, metadata}
      const hasNewFormat = importData.version && importData.data;
      const hasLegacyFormat = importData.data && !importData.version && !importData.exported_at;

      if (!hasNewFormat && !hasLegacyFormat) {
        throw new Error('Formato de backup inválido: falta estructura de datos válida');
      }

      // Para backups legacy: importData = {data: {...tablas...}, metadata: {...}}
      // Para backups nuevos: importData = {version: "2.0.0", data: {...tablas...}, metadata: {...}, exported_at: "..."}
      // En ambos casos necesitamos acceder a importData.data para obtener las tablas
      const backupData = importData;

      if (hasLegacyFormat) {
        logger.info('📦 Detectado backup en formato legacy (sin version/exported_at)');
      } else {
        logger.info('📦 Detectado backup en formato nuevo', { version: importData.version });
      }

      await client.query('BEGIN');

      const results = {
        navigation: 0,
        company_info: 0,
        theme_config: 0,
        system_config: 0,
        carousel_slides: 0,
        landing_values: 0,
        landing_certifications: 0,
        landing_testimonials: 0,
        landing_contact_info: 0,
        landing_content_blocks: 0,
        landing_statistics: 0
      };

      // 1. Importar Navigation Items
      if (backupData.data.navigation && backupData.data.navigation.length > 0) {
        await client.query('DELETE FROM navigation_items');

        for (const item of backupData.data.navigation) {
          await client.query(`
            INSERT INTO navigation_items (id, location, label, url, icon, target, is_active, sort_order, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
          `, [
            item.id,
            item.location,
            item.label,
            item.url,
            item.icon || 'Home',
            item.target || '_self',
            item.is_active !== false,
            item.sort_order || 0,
            item.created_at || new Date()
          ]);
          results.navigation++;
        }

        const maxNavId = Math.max(...backupData.data.navigation.map(n => n.id));
        await client.query(`SELECT setval('navigation_items_id_seq', $1, true)`, [maxNavId]);
      }

      // 2. Importar Company Info (COMPLETO con todas las columnas reales)
      if (backupData.data.company_info && Array.isArray(backupData.data.company_info) && backupData.data.company_info.length > 0) {
        const ci = backupData.data.company_info[0]; // company_info es un array, acceder al primer elemento

        await client.query(`
          UPDATE company_info SET
            name = $1, full_name = $2, short_name = $3, slogan = $4, founded_year = $5,
            rif = $6, email = $7, phone_main = $8, phone_secondary = $9, phone_tertiary = $10,
            whatsapp = $11, whatsapp_link = $12,
            address_street = $13, address_area = $14, address_city = $15, address_state = $16,
            address_zip = $17, address_country = $18, google_maps_url = $19,
            hours_weekday = $20, hours_saturday = $21, hours_sunday = $22,
            social_instagram = $23, social_instagram_handle = $24, social_twitter = $25,
            social_twitter_handle = $26, social_facebook = $27, social_youtube = $28, social_linkedin = $29,
            seo_title = $30, seo_description = $31, seo_keywords = $32, seo_author = $33,
            og_image_url = $34, og_type = $35, og_locale = $36,
            pwa_name = $37, pwa_short_name = $38, pwa_description = $39,
            privacy_policy_url = $40, terms_of_service_url = $41, cookies_policy_url = $42,
            copyright_template = $43, certifications = $44,
            logo_full_url = $45, logo_icon_url = $46, logo_horizontal_url = $47,
            favicon_url = $48, logo_alt_text = $49,
            updated_at = NOW()
          WHERE id = 1
        `, [
          ci.name, ci.full_name, ci.short_name, ci.slogan, ci.founded_year,
          ci.rif, ci.email, ci.phone_main, ci.phone_secondary, ci.phone_tertiary,
          ci.whatsapp, ci.whatsapp_link,
          ci.address_street, ci.address_area, ci.address_city, ci.address_state,
          ci.address_zip, ci.address_country, ci.google_maps_url,
          ci.hours_weekday, ci.hours_saturday, ci.hours_sunday,
          ci.social_instagram, ci.social_instagram_handle, ci.social_twitter,
          ci.social_twitter_handle, ci.social_facebook, ci.social_youtube, ci.social_linkedin,
          ci.seo_title, ci.seo_description, ci.seo_keywords, ci.seo_author,
          ci.og_image_url, ci.og_type, ci.og_locale,
          ci.pwa_name, ci.pwa_short_name, ci.pwa_description,
          ci.privacy_policy_url, ci.terms_of_service_url, ci.cookies_policy_url,
          ci.copyright_template, JSON.stringify(ci.certifications || []),
          ci.logo_full_url, ci.logo_icon_url, ci.logo_horizontal_url,
          ci.favicon_url, ci.logo_alt_text
        ]);
        results.company_info = 1;
      }

      // 3. Importar Theme Config
      if (backupData.data.theme_config && Array.isArray(backupData.data.theme_config) && backupData.data.theme_config.length > 0) {
        const tc = backupData.data.theme_config[0]; // theme_config es un array, acceder al primer elemento

        // Mapear nombres de campos legacy (primary_color) a nuevos (color_primary)
        const color_primary = tc.color_primary || tc.primary_color || '#7B68A6';
        const color_secondary = tc.color_secondary || tc.secondary_color || '#DDB5D5';
        const color_accent = tc.color_accent || tc.accent_color || '#8B8C8E';
        const color_text_primary = tc.color_text_primary || tc.text_primary_color || '#231F20';
        const color_text_secondary = tc.color_text_secondary || tc.text_secondary_color || '#8B8C8E';
        const color_background = tc.color_background || tc.background_color || '#FFFFFF';
        const color_surface = tc.color_surface || tc.card_bg_color || '#F9FAFB';
        const color_success = tc.color_success || tc.success_color || '#10B981';
        const color_warning = tc.color_warning || tc.warning_color || '#F59E0B';
        const color_error = tc.color_error || tc.error_color || '#EF4444';
        const color_info = tc.color_info || tc.info_color || '#3B82F6';
        // Valores por defecto para dark mode (no existen en backups legacy)
        const color_dark_bg = tc.color_dark_bg || '#0F1729';
        const color_dark_surface = tc.color_dark_surface || '#1A2238';
        const color_dark_text = tc.color_dark_text || '#E8F0FF';
        const color_dark_text_secondary = tc.color_dark_text_secondary || '#94A3B8';

        await client.query(`
          UPDATE theme_config SET
            color_primary = $1, color_secondary = $2, color_accent = $3,
            color_text_primary = $4, color_text_secondary = $5,
            color_background = $6, color_surface = $7,
            color_dark_bg = $8, color_dark_surface = $9,
            color_dark_text = $10, color_dark_text_secondary = $11,
            color_success = $12, color_warning = $13, color_error = $14, color_info = $15,
            font_family_primary = $16, font_family_secondary = $17, font_url = $18,
            font_size_base = $19, font_size_h1 = $20, font_size_h2 = $21, font_size_h3 = $22,
            logo_path = $23, logo_icon_path = $24, favicon_path = $25,
            logo_margin = $26, logo_max_width = $27,
            border_radius_sm = $28, border_radius_md = $29, border_radius_lg = $30, border_radius_xl = $31,
            shadow_intensity = $32, glassmorphism_enabled = $33, glassmorphism_blur = $34,
            theme_name = $35, theme_description = $36
          WHERE id = 1
        `, [
          color_primary, color_secondary, color_accent,
          color_text_primary, color_text_secondary,
          color_background, color_surface,
          color_dark_bg, color_dark_surface,
          color_dark_text, color_dark_text_secondary,
          color_success, color_warning, color_error, color_info,
          tc.font_family_primary || 'DIN Pro', tc.font_family_secondary || 'Inter', tc.font_url,
          tc.font_size_base || '1rem', tc.font_size_h1 || '2rem', tc.font_size_h2 || '1.69rem', tc.font_size_h3 || '1.5rem',
          tc.logo_path || '/Logo.png', tc.logo_icon_path || '/LogoEG.png', tc.favicon_path || '/favicon.svg',
          tc.logo_margin || '37.8px', tc.logo_max_width || '200px',
          tc.border_radius_sm || '0.25rem', tc.border_radius_md || '0.5rem', tc.border_radius_lg || '0.75rem', tc.border_radius_xl || '1rem',
          tc.shadow_intensity || 5, tc.glassmorphism_enabled !== undefined ? tc.glassmorphism_enabled : true, tc.glassmorphism_blur || '12px',
          tc.theme_name || 'Lab Theme', tc.theme_description || 'Tema del laboratorio'
        ]);
        results.theme_config = 1;
      }

      // 4. Importar System Config
      if (backupData.data.system_config && backupData.data.system_config.length > 0) {
        for (const config of backupData.data.system_config) {
          await client.query(`
            INSERT INTO system_config (key, value, data_type, category, description, is_secret, is_editable, created_by, updated_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
            ON CONFLICT (key) DO UPDATE SET
              value = EXCLUDED.value,
              updated_by = $8,
              updated_at = NOW()
          `, [
            config.key, config.value, config.data_type || 'string',
            config.category || 'general', config.description || '',
            config.is_secret || false, config.is_editable !== false, importedBy
          ]);
          results.system_config++;
        }
      }

      // 5. Importar Carousel Slides
      if (backupData.data.carousel_slides && backupData.data.carousel_slides.length > 0) {
        await client.query('DELETE FROM carousel_slides');

        for (const slide of backupData.data.carousel_slides) {
          await client.query(`
            INSERT INTO carousel_slides (id, title, subtitle, description, image_url, image_mobile_url,
              cta1_text, cta1_link, cta2_text, cta2_link, badge_text, badge_color,
              is_active, order_position, start_date, end_date, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW())
          `, [
            slide.id, slide.title, slide.subtitle, slide.description,
            slide.image_url, slide.image_mobile_url,
            slide.cta1_text, slide.cta1_link, slide.cta2_text, slide.cta2_link,
            slide.badge_text, slide.badge_color,
            slide.is_active !== false, slide.order_position || 0,
            slide.start_date, slide.end_date, slide.created_at || new Date()
          ]);
          results.carousel_slides++;
        }

        const maxSlideId = Math.max(...backupData.data.carousel_slides.map(s => s.id));
        await client.query(`SELECT setval('carousel_slides_id_seq', $1, true)`, [maxSlideId]);
      }

      // 6. Importar Landing Values
      if (backupData.data.landing_values && backupData.data.landing_values.length > 0) {
        await client.query('DELETE FROM landing_values');

        for (const value of backupData.data.landing_values) {
          await client.query(`
            INSERT INTO landing_values (id, icon_name, title, description, sort_order, is_active, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
          `, [
            value.id, value.icon_name, value.title, value.description,
            value.sort_order || 0, value.is_active !== false, value.created_at || new Date()
          ]);
          results.landing_values++;
        }

        const maxId = Math.max(...backupData.data.landing_values.map(v => v.id));
        await client.query(`SELECT setval('landing_values_id_seq', $1, true)`, [maxId]);
      }

      // 7. Importar Landing Certifications
      if (backupData.data.landing_certifications && backupData.data.landing_certifications.length > 0) {
        await client.query('DELETE FROM landing_certifications');

        for (const cert of backupData.data.landing_certifications) {
          await client.query(`
            INSERT INTO landing_certifications (id, icon_name, title, description, sort_order, is_active, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
          `, [
            cert.id, cert.icon_name, cert.title, cert.description,
            cert.sort_order || 0, cert.is_active !== false, cert.created_at || new Date()
          ]);
          results.landing_certifications++;
        }

        const maxId = Math.max(...backupData.data.landing_certifications.map(c => c.id));
        await client.query(`SELECT setval('landing_certifications_id_seq', $1, true)`, [maxId]);
      }

      // 8. Importar Landing Testimonials
      if (backupData.data.landing_testimonials && backupData.data.landing_testimonials.length > 0) {
        await client.query('DELETE FROM landing_testimonials');

        for (const test of backupData.data.landing_testimonials) {
          await client.query(`
            INSERT INTO landing_testimonials (id, name, role, text, avatar_type, rating, sort_order, is_active, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
          `, [
            test.id, test.name, test.role, test.text, test.avatar_type,
            test.rating || 5, test.sort_order || 0, test.is_active !== false, test.created_at || new Date()
          ]);
          results.landing_testimonials++;
        }

        const maxId = Math.max(...backupData.data.landing_testimonials.map(t => t.id));
        await client.query(`SELECT setval('landing_testimonials_id_seq', $1, true)`, [maxId]);
      }

      // 9. Importar Landing Contact Info
      if (backupData.data.landing_contact_info && backupData.data.landing_contact_info.length > 0) {
        await client.query('DELETE FROM landing_contact_info');

        for (const contact of backupData.data.landing_contact_info) {
          await client.query(`
            INSERT INTO landing_contact_info (id, type, category, icon_name, label, value, link, sort_order, is_active, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
          `, [
            contact.id, contact.type, contact.category, contact.icon_name,
            contact.label, contact.value, contact.link,
            contact.sort_order || 0, contact.is_active !== false, contact.created_at || new Date()
          ]);
          results.landing_contact_info++;
        }

        const maxId = Math.max(...backupData.data.landing_contact_info.map(c => c.id));
        await client.query(`SELECT setval('landing_contact_info_id_seq', $1, true)`, [maxId]);
      }

      // 10. Importar Landing Content Blocks
      if (backupData.data.landing_content_blocks && backupData.data.landing_content_blocks.length > 0) {
        await client.query('DELETE FROM landing_content_blocks');

        for (const block of backupData.data.landing_content_blocks) {
          await client.query(`
            INSERT INTO landing_content_blocks (id, section, block_type, content, image_url, metadata, sort_order, is_active, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
          `, [
            block.id, block.section, block.block_type, block.content,
            block.image_url, block.metadata ? JSON.stringify(block.metadata) : null,
            block.sort_order || 0, block.is_active !== false, block.created_at || new Date()
          ]);
          results.landing_content_blocks++;
        }

        const maxId = Math.max(...backupData.data.landing_content_blocks.map(b => b.id));
        await client.query(`SELECT setval('landing_content_blocks_id_seq', $1, true)`, [maxId]);
      }

      // 11. Importar Landing Statistics
      if (backupData.data.landing_statistics && backupData.data.landing_statistics.length > 0) {
        await client.query('DELETE FROM landing_statistics');

        for (const stat of backupData.data.landing_statistics) {
          await client.query(`
            INSERT INTO landing_statistics (id, section, label, value, description, icon_name, sort_order, is_active, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
          `, [
            stat.id, stat.section, stat.label, stat.value, stat.description,
            stat.icon_name, stat.sort_order || 0, stat.is_active !== false, stat.created_at || new Date()
          ]);
          results.landing_statistics++;
        }

        const maxId = Math.max(...backupData.data.landing_statistics.map(s => s.id));
        await client.query(`SELECT setval('landing_statistics_id_seq', $1, true)`, [maxId]);
      }

      await client.query('COMMIT');

      // Limpiar TODO el caché después de restore exitoso
      // Esto asegura que la API sirva los datos frescos de la DB
      CacheService.flush();
      logger.info('✅ Caché completamente limpiado después del restore');

      logger.info('Importación COMPLETA exitosa', results);
      return {
        success: true,
        imported: results,
        message: 'Configuración importada exitosamente - TODAS las tablas restauradas'
      };
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Error al importar configuración:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Guardar backup con nombre
   * @param {string} name - Nombre del backup
   * @param {string} description - Descripción
   * @param {string} createdBy - Usuario
   * @returns {Promise<Object>}
   */
  async saveBackup(name, description = '', createdBy = 'admin') {
    try {
      const exportData = await this.exportConfiguration();
      const pool = await DatabaseRouter.getConfigPool();

      const query = `
        INSERT INTO configuration_backups (name, description, data, created_by)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;

      const result = await pool.query(query, [
        name,
        description,
        JSON.stringify(exportData),
        createdBy
      ]);

      logger.info(`Backup guardado: ${name}`, { id: result.rows[0].id, createdBy });
      return result.rows[0];
    } catch (error) {
      logger.error('Error al guardar backup:', error);
      throw error;
    }
  }

  /**
   * Listar backups guardados
   * @returns {Promise<Array>}
   */
  async listBackups() {
    try {
      const pool = await DatabaseRouter.getConfigPool();
      const query = `
        SELECT
          id,
          name,
          description,
          created_by,
          created_at,
          (data::jsonb -> 'metadata') as metadata,
          data
        FROM configuration_backups
        ORDER BY created_at DESC
      `;

      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      logger.error('Error al listar backups:', error);
      throw error;
    }
  }

  /**
   * Obtener backup por ID
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  async getBackupById(id) {
    try {
      const pool = await DatabaseRouter.getConfigPool();
      const query = 'SELECT * FROM configuration_backups WHERE id = $1';
      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        return null;
      }

      const backup = result.rows[0];
      backup.data = typeof backup.data === 'string' ? JSON.parse(backup.data) : backup.data;
      return backup;
    } catch (error) {
      logger.error('Error al obtener backup:', error);
      throw error;
    }
  }

  /**
   * Eliminar backup
   * @param {number} id
   * @returns {Promise<boolean>}
   */
  async deleteBackup(id) {
    try {
      const pool = await DatabaseRouter.getConfigPool();
      const query = 'DELETE FROM configuration_backups WHERE id = $1 RETURNING *';
      const result = await pool.query(query, [id]);

      if (result.rows.length > 0) {
        logger.info(`Backup eliminado: ID ${id}`);
        return true;
      }
      return false;
    } catch (error) {
      logger.error('Error al eliminar backup:', error);
      throw error;
    }
  }

  /**
   * Restaurar desde backup guardado
   * @param {number} backupId
   * @param {string} restoredBy
   * @returns {Promise<Object>}
   */
  async restoreFromBackup(backupId, restoredBy = 'admin') {
    try {
      const backup = await this.getBackupById(backupId);

      if (!backup) {
        throw new Error(`Backup con ID ${backupId} no encontrado`);
      }

      logger.info(`Restaurando backup COMPLETO: ${backup.name}`, { backupId, restoredBy });

      return await this.importConfiguration(backup.data, restoredBy);
    } catch (error) {
      logger.error('Error al restaurar backup:', error);
      throw error;
    }
  }
}

module.exports = new BackupService();
