const DatabaseRouter = require('./DatabaseRouter');
const logger = require('../utils/logger');
const CacheService = require('./CacheService');

const CACHE_KEY = 'theme:config';
const CACHE_TTL = 10 * 60; // 10 minutos

/**
 * ThemeService
 * Servicio para gestionar la configuración visual del tema del laboratorio
 * Incluye colores, tipografía, logos y estilos personalizados
 */
class ThemeService {
  /**
   * Obtener configuración del tema actual
   * @returns {Promise<Object>} Configuración del tema
   */
  async getTheme() {
    const cached = CacheService.get(CACHE_KEY);

    if (cached) {
      logger.info('Theme config obtenido desde cache');
      return cached;
    }

    try {
      // Obtener pool de la DB de configuración del laboratorio activo
      const pool = await DatabaseRouter.getConfigPool();

      const query = 'SELECT * FROM theme_config WHERE id = 1';
      const result = await pool.query(query);

      if (result.rows.length === 0) {
        logger.warn('No se encontró configuración de tema, usando valores por defecto');
        return this._getDefaultTheme();
      }

      const theme = result.rows[0];

      // Cachear resultado
      CacheService.set(CACHE_KEY, theme, CACHE_TTL);

      logger.info('Theme config obtenido desde BD');

      return theme;
    } catch (error) {
      logger.error('Error obteniendo tema:', error);
      throw error;
    }
  }

  /**
   * Actualizar configuración del tema
   * @param {Object} themeData - Datos del tema a actualizar
   * @returns {Promise<Object>} Tema actualizado
   */
  async updateTheme(themeData) {
    try {
      // Validar datos del tema
      this._validateThemeData(themeData);

      // Construir query dinámicamente solo con campos permitidos
      const allowedFields = [
        'color_primary',
        'color_secondary',
        'color_accent',
        'color_text_primary',
        'color_text_secondary',
        'color_background',
        'color_surface',
        'color_dark_bg',
        'color_dark_surface',
        'color_dark_text',
        'color_dark_text_secondary',
        'color_success',
        'color_warning',
        'color_error',
        'color_info',
        'font_family_primary',
        'font_family_secondary',
        'font_url',
        'font_size_base',
        'font_size_h1',
        'font_size_h2',
        'font_size_h3',
        'logo_path',
        'logo_icon_path',
        'favicon_path',
        'logo_margin',
        'logo_max_width',
        'border_radius_sm',
        'border_radius_md',
        'border_radius_lg',
        'border_radius_xl',
        'shadow_intensity',
        'glassmorphism_enabled',
        'glassmorphism_blur',
        'theme_name',
        'theme_description'
      ];

      const updates = [];
      const values = [];
      let paramCount = 1;

      for (const field of allowedFields) {
        if (themeData[field] !== undefined) {
          updates.push(`${field} = $${paramCount}`);
          values.push(themeData[field]);
          paramCount++;
        }
      }

      if (updates.length === 0) {
        throw new Error('No hay campos válidos para actualizar');
      }

      // Obtener pool de la DB de configuración del laboratorio activo
      const pool = await DatabaseRouter.getConfigPool();

      const query = `
        UPDATE theme_config
        SET ${updates.join(', ')}
        WHERE id = 1
        RETURNING *
      `;

      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        throw new Error('No se pudo actualizar el tema');
      }

      const updatedTheme = result.rows[0];

      // Invalidar cache
      this._invalidateCache();

      logger.info('Theme config actualizado exitosamente');

      return updatedTheme;
    } catch (error) {
      logger.error('Error actualizando tema:', error);
      throw error;
    }
  }

  /**
   * Resetear tema a valores por defecto de Lab EG
   * @returns {Promise<Object>} Tema reseteado
   */
  async resetToDefault() {
    try {
      const defaultTheme = this._getDefaultTheme();

      const updatedTheme = await this.updateTheme(defaultTheme);

      logger.info('Theme config reseteado a valores por defecto de Lab EG');

      return updatedTheme;
    } catch (error) {
      logger.error('Error reseteando tema:', error);
      throw error;
    }
  }

  /**
   * Obtener configuración por defecto (Lab EG)
   * @private
   * @returns {Object} Tema por defecto
   */
  _getDefaultTheme() {
    return {
      // Colores Lab EG (Pantone official)
      color_primary: '#7B68A6',        // Pantone 2665U
      color_secondary: '#DDB5D5',      // Pantone 250U
      color_accent: '#8B8C8E',         // Cool Gray 9U
      color_text_primary: '#231F20',   // Black
      color_text_secondary: '#8B8C8E', // Cool Gray
      color_background: '#FFFFFF',
      color_surface: '#F9FAFB',

      // Dark mode
      color_dark_bg: '#0F1729',
      color_dark_surface: '#1A2238',
      color_dark_text: '#E8F0FF',
      color_dark_text_secondary: '#94A3B8',

      // Semantic colors
      color_success: '#10B981',
      color_warning: '#F59E0B',
      color_error: '#EF4444',
      color_info: '#3B82F6',

      // Typography
      font_family_primary: 'DIN Pro',
      font_family_secondary: 'Inter',
      font_url: null,
      font_size_base: '1rem',
      font_size_h1: '2rem',
      font_size_h2: '1.69rem',
      font_size_h3: '1.5rem',

      // Logo
      logo_path: '/Logo.png',
      logo_icon_path: '/LogoEG.png',
      favicon_path: '/favicon.svg',
      logo_margin: '37.8px',
      logo_max_width: '200px',

      // Spacing
      border_radius_sm: '0.25rem',
      border_radius_md: '0.5rem',
      border_radius_lg: '0.75rem',
      border_radius_xl: '1rem',

      // Effects
      shadow_intensity: 5,
      glassmorphism_enabled: true,
      glassmorphism_blur: '12px',

      // Metadata
      theme_name: 'Lab EG Theme',
      theme_description: 'Tema oficial de Laboratorio Elizabeth Gutiérrez'
    };
  }

  /**
   * Validar datos del tema
   * @private
   * @param {Object} data - Datos a validar
   * @throws {Error} Si los datos son inválidos
   */
  _validateThemeData(data) {
    const errors = [];

    // Validar colores (formato hex)
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
    const colorFields = [
      'color_primary',
      'color_secondary',
      'color_accent',
      'color_text_primary',
      'color_text_secondary',
      'color_background',
      'color_surface',
      'color_dark_bg',
      'color_dark_surface',
      'color_dark_text',
      'color_dark_text_secondary',
      'color_success',
      'color_warning',
      'color_error',
      'color_info'
    ];

    for (const field of colorFields) {
      if (data[field] !== undefined && !hexColorRegex.test(data[field])) {
        errors.push(`${field} debe ser un color hexadecimal válido (ej: #7B68A6)`);
      }
    }

    // Validar shadow_intensity
    if (data.shadow_intensity !== undefined) {
      const intensity = parseInt(data.shadow_intensity);
      if (isNaN(intensity) || intensity < 0 || intensity > 10) {
        errors.push('shadow_intensity debe ser un número entre 0 y 10');
      }
    }

    // Validar glassmorphism_enabled
    if (data.glassmorphism_enabled !== undefined && typeof data.glassmorphism_enabled !== 'boolean') {
      errors.push('glassmorphism_enabled debe ser un booleano');
    }

    // Validar paths de logo
    const pathFields = ['logo_path', 'logo_icon_path', 'favicon_path'];
    for (const field of pathFields) {
      if (data[field] !== undefined && typeof data[field] !== 'string') {
        errors.push(`${field} debe ser una cadena de texto`);
      }
    }

    if (errors.length > 0) {
      throw new Error(`Validación fallida: ${errors.join(', ')}`);
    }
  }

  /**
   * Invalidar cache del tema
   * @private
   */
  _invalidateCache() {
    CacheService.del(CACHE_KEY);
    logger.info('Cache del tema invalidado');
  }

  /**
   * Obtener paleta de colores simplificada
   * Útil para el frontend
   * @returns {Promise<Object>} Paleta de colores
   */
  async getColorPalette() {
    const theme = await this.getTheme();

    return {
      primary: theme.color_primary,
      secondary: theme.color_secondary,
      accent: theme.color_accent,
      text: {
        primary: theme.color_text_primary,
        secondary: theme.color_text_secondary
      },
      background: {
        default: theme.color_background,
        surface: theme.color_surface
      },
      dark: {
        bg: theme.color_dark_bg,
        surface: theme.color_dark_surface,
        text: theme.color_dark_text,
        textSecondary: theme.color_dark_text_secondary
      },
      semantic: {
        success: theme.color_success,
        warning: theme.color_warning,
        error: theme.color_error,
        info: theme.color_info
      }
    };
  }

  /**
   * Obtener templates predefinidos desde la base de datos
   * @returns {Promise<Array<Object>>} Lista de templates disponibles
   */
  async getTemplates() {
    try {
      const pool = await DatabaseRouter.getConfigPool();

      const query = `
        SELECT
          id,
          name,
          description,
          category,
          color_primary,
          color_secondary,
          color_accent,
          color_text_primary,
          color_text_secondary,
          color_background,
          color_surface,
          color_dark_bg,
          color_dark_surface,
          color_dark_text,
          color_dark_text_secondary,
          color_success,
          color_warning,
          color_error,
          color_info
        FROM theme_templates
        WHERE is_active = true
        ORDER BY id ASC
      `;

      const result = await pool.query(query);

      // Transformar filas de DB al formato esperado por el frontend
      return result.rows.map(template => ({
        id: template.id,
        name: template.name,
        description: template.description,
        category: template.category,
        preview: {
          primary: template.color_primary,
          secondary: template.color_secondary,
          accent: template.color_accent
        },
        theme: {
          color_primary: template.color_primary,
          color_secondary: template.color_secondary,
          color_accent: template.color_accent,
          color_text_primary: template.color_text_primary,
          color_text_secondary: template.color_text_secondary,
          color_background: template.color_background,
          color_surface: template.color_surface,
          color_dark_bg: template.color_dark_bg,
          color_dark_surface: template.color_dark_surface,
          color_dark_text: template.color_dark_text,
          color_dark_text_secondary: template.color_dark_text_secondary,
          color_success: template.color_success,
          color_warning: template.color_warning,
          color_error: template.color_error,
          color_info: template.color_info,
          theme_name: template.name,
          theme_description: template.description
        }
      }));
    } catch (error) {
      logger.error('Error obteniendo templates desde BD:', error);
      // Fallback: retornar array vacío si hay error
      return [];
    }
  }

  /**
   * Aplicar un template predefinido
   * @param {string} templateId - ID del template a aplicar
   * @returns {Promise<Object>} Tema actualizado
   */
  async applyTemplate(templateId) {
    try {
      const templates = await this.getTemplates();
      // Convertir templateId a número para comparación
      const numericId = parseInt(templateId);
      const template = templates.find(t => t.id === numericId);

      if (!template) {
        throw new Error(`Template '${templateId}' no encontrado`);
      }

      // Aplicar el tema del template (sin sobrescribir logos)
      const currentTheme = await this.getTheme();

      const updatedTheme = await this.updateTheme({
        ...template.theme,
        // Preservar logos actuales
        logo_path: currentTheme.logo_path,
        logo_icon_path: currentTheme.logo_icon_path,
        favicon_path: currentTheme.favicon_path,
        logo_margin: currentTheme.logo_margin,
        logo_max_width: currentTheme.logo_max_width
      });

      logger.info(`Template '${templateId}' aplicado exitosamente`);

      return updatedTheme;
    } catch (error) {
      logger.error('Error aplicando template:', error);
      throw error;
    }
  }
}

module.exports = new ThemeService();
