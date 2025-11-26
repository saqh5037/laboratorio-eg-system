const express = require('express');
const router = express.Router();
const CompanyService = require('../services/CompanyService');
const { authenticateAdmin } = require('../middleware/adminAuth');
const logger = require('../utils/logger');
const { upload, LogoUploadService } = require('../services/LogoUploadService');

/**
 * GET /api/company
 * Obtener información completa de la empresa (público)
 *
 * Query params:
 * - lab: string (código del laboratorio, ej: 'eg', 'dimogen')
 */
router.get('/', async (req, res) => {
  try {
    const { lab } = req.query;
    const companyInfo = await CompanyService.getCompanyInfo(lab || null);

    res.json({
      success: true,
      data: companyInfo,
      lab: lab || 'default'
    });
  } catch (error) {
    logger.error('Error en GET /api/company:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener información de la empresa'
    });
  }
});

/**
 * GET /api/company/contact
 * Obtener solo información de contacto (público)
 *
 * Query params:
 * - lab: string (código del laboratorio)
 */
router.get('/contact', async (req, res) => {
  try {
    const { lab } = req.query;
    const contactInfo = await CompanyService.getContactInfo(lab || null);

    res.json({
      success: true,
      data: contactInfo
    });
  } catch (error) {
    logger.error('Error en GET /api/company/contact:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener información de contacto'
    });
  }
});

/**
 * GET /api/company/seo
 * Obtener información SEO (público)
 *
 * Query params:
 * - lab: string (código del laboratorio)
 */
router.get('/seo', async (req, res) => {
  try {
    const { lab } = req.query;
    const seoInfo = await CompanyService.getSEOInfo(lab || null);

    res.json({
      success: true,
      data: seoInfo
    });
  } catch (error) {
    logger.error('Error en GET /api/company/seo:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener información SEO'
    });
  }
});

/**
 * GET /api/company/pwa
 * Obtener información para PWA manifest (público)
 *
 * Query params:
 * - lab: string (código del laboratorio)
 */
router.get('/pwa', async (req, res) => {
  try {
    const { lab } = req.query;
    const pwaInfo = await CompanyService.getPWAInfo(lab || null);

    res.json({
      success: true,
      data: pwaInfo
    });
  } catch (error) {
    logger.error('Error en GET /api/company/pwa:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener información PWA'
    });
  }
});

/**
 * PUT /api/company
 * Actualizar información de la empresa (admin only)
 *
 * Query params:
 * - lab: string (código del laboratorio)
 */
router.put('/', authenticateAdmin, async (req, res) => {
  try {
    const { lab } = req.query;
    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No se proporcionaron campos para actualizar'
      });
    }

    const updatedInfo = await CompanyService.updateCompanyInfo(updates, lab || null);

    logger.info(`Company info actualizado por ${req.user.username} (lab: ${lab || 'default'})`, {
      fields: Object.keys(updates)
    });

    res.json({
      success: true,
      message: 'Información de la empresa actualizada correctamente',
      data: updatedInfo
    });
  } catch (error) {
    logger.error('Error en PUT /api/company:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al actualizar información de la empresa'
    });
  }
});

/**
 * PATCH /api/company/identity
 * Actualizar solo identidad corporativa (admin only)
 *
 * Query params:
 * - lab: string (código del laboratorio)
 */
router.patch('/identity', authenticateAdmin, async (req, res) => {
  try {
    const { lab } = req.query;
    const { name, full_name, short_name, slogan, founded_year, rif } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (full_name) updates.full_name = full_name;
    if (short_name) updates.short_name = short_name;
    if (slogan) updates.slogan = slogan;
    if (founded_year) updates.founded_year = founded_year;
    if (rif) updates.rif = rif;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No se proporcionaron campos de identidad para actualizar'
      });
    }

    const updatedInfo = await CompanyService.updateCompanyInfo(updates, lab || null);

    res.json({
      success: true,
      message: 'Identidad corporativa actualizada',
      data: updatedInfo
    });
  } catch (error) {
    logger.error('Error en PATCH /api/company/identity:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al actualizar identidad corporativa'
    });
  }
});

/**
 * PATCH /api/company/contact
 * Actualizar solo información de contacto (admin only)
 *
 * Query params:
 * - lab: string (código del laboratorio)
 */
router.patch('/contact', authenticateAdmin, async (req, res) => {
  try {
    const { lab } = req.query;
    const {
      email, phone_main, phone_secondary, phone_tertiary,
      whatsapp, whatsapp_link,
      address_street, address_area, address_city, address_state, address_zip, address_country,
      google_maps_url,
      hours_weekday, hours_saturday, hours_sunday
    } = req.body;

    const updates = {};

    if (email) updates.email = email;
    if (phone_main) updates.phone_main = phone_main;
    if (phone_secondary !== undefined) updates.phone_secondary = phone_secondary;
    if (phone_tertiary !== undefined) updates.phone_tertiary = phone_tertiary;
    if (whatsapp) updates.whatsapp = whatsapp;
    if (whatsapp_link) updates.whatsapp_link = whatsapp_link;
    if (address_street) updates.address_street = address_street;
    if (address_area) updates.address_area = address_area;
    if (address_city) updates.address_city = address_city;
    if (address_state) updates.address_state = address_state;
    if (address_zip) updates.address_zip = address_zip;
    if (address_country) updates.address_country = address_country;
    if (google_maps_url) updates.google_maps_url = google_maps_url;
    if (hours_weekday) updates.hours_weekday = hours_weekday;
    if (hours_saturday) updates.hours_saturday = hours_saturday;
    if (hours_sunday !== undefined) updates.hours_sunday = hours_sunday;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No se proporcionaron campos de contacto para actualizar'
      });
    }

    const updatedInfo = await CompanyService.updateCompanyInfo(updates, lab || null);

    res.json({
      success: true,
      message: 'Información de contacto actualizada',
      data: updatedInfo
    });
  } catch (error) {
    logger.error('Error en PATCH /api/company/contact:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al actualizar información de contacto'
    });
  }
});

/**
 * PATCH /api/company/social
 * Actualizar redes sociales (admin only)
 *
 * Query params:
 * - lab: string (código del laboratorio)
 */
router.patch('/social', authenticateAdmin, async (req, res) => {
  try {
    const { lab } = req.query;
    const {
      social_instagram, social_instagram_handle,
      social_twitter, social_twitter_handle,
      social_facebook, social_youtube, social_linkedin
    } = req.body;

    const updates = {};

    if (social_instagram) updates.social_instagram = social_instagram;
    if (social_instagram_handle) updates.social_instagram_handle = social_instagram_handle;
    if (social_twitter) updates.social_twitter = social_twitter;
    if (social_twitter_handle) updates.social_twitter_handle = social_twitter_handle;
    if (social_facebook) updates.social_facebook = social_facebook;
    if (social_youtube !== undefined) updates.social_youtube = social_youtube;
    if (social_linkedin !== undefined) updates.social_linkedin = social_linkedin;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No se proporcionaron campos de redes sociales para actualizar'
      });
    }

    const updatedInfo = await CompanyService.updateCompanyInfo(updates, lab || null);

    res.json({
      success: true,
      message: 'Redes sociales actualizadas',
      data: updatedInfo
    });
  } catch (error) {
    logger.error('Error en PATCH /api/company/social:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al actualizar redes sociales'
    });
  }
});

/**
 * PATCH /api/company/seo
 * Actualizar información SEO (admin only)
 *
 * Query params:
 * - lab: string (código del laboratorio)
 */
router.patch('/seo', authenticateAdmin, async (req, res) => {
  try {
    const { lab } = req.query;
    const {
      seo_title, seo_description, seo_keywords, seo_author,
      og_image_url, og_type, og_locale
    } = req.body;

    const updates = {};

    if (seo_title) updates.seo_title = seo_title;
    if (seo_description) updates.seo_description = seo_description;
    if (seo_keywords) updates.seo_keywords = seo_keywords;
    if (seo_author) updates.seo_author = seo_author;
    if (og_image_url) updates.og_image_url = og_image_url;
    if (og_type) updates.og_type = og_type;
    if (og_locale) updates.og_locale = og_locale;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No se proporcionaron campos SEO para actualizar'
      });
    }

    const updatedInfo = await CompanyService.updateCompanyInfo(updates, lab || null);

    res.json({
      success: true,
      message: 'Información SEO actualizada',
      data: updatedInfo
    });
  } catch (error) {
    logger.error('Error en PATCH /api/company/seo:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al actualizar información SEO'
    });
  }
});

/**
 * PATCH /api/company/pwa
 * Actualizar información PWA (admin only)
 *
 * Query params:
 * - lab: string (código del laboratorio)
 */
router.patch('/pwa', authenticateAdmin, async (req, res) => {
  try {
    const { lab } = req.query;
    const { pwa_name, pwa_short_name, pwa_description } = req.body;

    const updates = {};

    if (pwa_name) updates.pwa_name = pwa_name;
    if (pwa_short_name) updates.pwa_short_name = pwa_short_name;
    if (pwa_description) updates.pwa_description = pwa_description;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No se proporcionaron campos PWA para actualizar'
      });
    }

    const updatedInfo = await CompanyService.updateCompanyInfo(updates, lab || null);

    res.json({
      success: true,
      message: 'Información PWA actualizada',
      data: updatedInfo
    });
  } catch (error) {
    logger.error('Error en PATCH /api/company/pwa:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al actualizar información PWA'
    });
  }
});

/**
 * POST /api/company/cache/invalidate
 * Invalidar caché de company info (admin only)
 *
 * Query params:
 * - lab: string (código del laboratorio)
 */
router.post('/cache/invalidate', authenticateAdmin, async (req, res) => {
  try {
    const { lab } = req.query;
    CompanyService.invalidateCache(lab || null);

    res.json({
      success: true,
      message: `Caché de información de empresa invalidado (lab: ${lab || 'default'})`
    });
  } catch (error) {
    logger.error('Error en POST /api/company/cache/invalidate:', error);
    res.status(500).json({
      success: false,
      error: 'Error al invalidar caché'
    });
  }
});

/**
 * POST /api/company/logos/upload
 * Upload de logos (admin only)
 * Soporta: logo_full, logo_icon, logo_horizontal, favicon
 *
 * Query params:
 * - lab: string (código del laboratorio)
 */
router.post('/logos/upload', authenticateAdmin, upload, async (req, res) => {
  try {
    const { lab } = req.query;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No se proporcionó ningún archivo'
      });
    }

    const logoType = req.body.type || 'logo'; // logo_full, logo_icon, logo_horizontal, favicon
    const filePath = req.file.path;
    const filename = req.file.filename;

    logger.info('Logo recibido para upload:', {
      type: logoType,
      filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
      lab: lab || 'default'
    });

    // Validar logo
    const validation = await LogoUploadService.validateLogo(filePath, logoType);
    if (!validation.valid) {
      // Si la validación falla, eliminar el archivo
      await LogoUploadService.deleteLogo(filename);

      return res.status(400).json({
        success: false,
        error: 'Logo no válido',
        details: validation.errors
      });
    }

    // Optimizar logo
    const optimized = await LogoUploadService.optimizeLogo(filePath, filename, logoType);

    // Obtener URL pública
    const publicUrl = LogoUploadService.getPublicUrl(optimized.filename);

    // Mapear tipo de logo a campo de BD
    const fieldMap = {
      'logo_full': 'logo_full_url',
      'logo_icon': 'logo_icon_url',
      'logo_horizontal': 'logo_horizontal_url',
      'favicon': 'favicon_url'
    };

    const field = fieldMap[logoType];
    if (!field) {
      return res.status(400).json({
        success: false,
        error: 'Tipo de logo no válido. Use: logo_full, logo_icon, logo_horizontal, favicon'
      });
    }

    // Actualizar en la base de datos
    const updates = {};
    updates[field] = publicUrl;

    const updatedInfo = await CompanyService.updateCompanyInfo(updates, lab || null);

    logger.info(`Logo ${logoType} actualizado por ${req.user.username} (lab: ${lab || 'default'})`, {
      url: publicUrl,
      filename: optimized.filename
    });

    res.json({
      success: true,
      message: 'Logo subido y actualizado correctamente',
      data: {
        type: logoType,
        field,
        url: publicUrl,
        filename: optimized.filename,
        optimized: optimized.optimized,
        company: updatedInfo
      }
    });
  } catch (error) {
    logger.error('Error en POST /api/company/logos/upload:', error);

    // Intentar limpiar archivo si existe
    if (req.file) {
      try {
        await LogoUploadService.deleteLogo(req.file.filename);
      } catch (cleanupError) {
        logger.warn('No se pudo limpiar archivo después de error:', cleanupError);
      }
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Error al subir logo'
    });
  }
});

/**
 * PATCH /api/company/logos
 * Actualizar URLs de logos manualmente (admin only)
 * Para cuando el usuario quiere usar URLs externas
 *
 * Query params:
 * - lab: string (código del laboratorio)
 */
router.patch('/logos', authenticateAdmin, async (req, res) => {
  try {
    const { lab } = req.query;
    const { logo_full_url, logo_icon_url, logo_horizontal_url, favicon_url, logo_alt_text } = req.body;

    const updates = {};

    if (logo_full_url !== undefined) updates.logo_full_url = logo_full_url;
    if (logo_icon_url !== undefined) updates.logo_icon_url = logo_icon_url;
    if (logo_horizontal_url !== undefined) updates.logo_horizontal_url = logo_horizontal_url;
    if (favicon_url !== undefined) updates.favicon_url = favicon_url;
    if (logo_alt_text !== undefined) updates.logo_alt_text = logo_alt_text;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No se proporcionaron URLs de logos para actualizar'
      });
    }

    const updatedInfo = await CompanyService.updateCompanyInfo(updates, lab || null);

    logger.info(`URLs de logos actualizados por ${req.user.username} (lab: ${lab || 'default'})`, {
      fields: Object.keys(updates)
    });

    res.json({
      success: true,
      message: 'URLs de logos actualizados',
      data: updatedInfo
    });
  } catch (error) {
    logger.error('Error en PATCH /api/company/logos:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al actualizar URLs de logos'
    });
  }
});

/**
 * GET /api/company/logos/list
 * Listar todos los logos subidos (admin only)
 */
router.get('/logos/list', authenticateAdmin, async (req, res) => {
  try {
    const logos = await LogoUploadService.listLogos();

    res.json({
      success: true,
      data: logos
    });
  } catch (error) {
    logger.error('Error en GET /api/company/logos/list:', error);
    res.status(500).json({
      success: false,
      error: 'Error al listar logos'
    });
  }
});

/**
 * DELETE /api/company/logos/:filename
 * Eliminar un logo subido (admin only)
 */
router.delete('/logos/:filename', authenticateAdmin, async (req, res) => {
  try {
    const { filename } = req.params;

    const deleted = await LogoUploadService.deleteLogo(filename);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Logo no encontrado'
      });
    }

    logger.info(`Logo eliminado por ${req.user.username}:`, filename);

    res.json({
      success: true,
      message: 'Logo eliminado correctamente'
    });
  } catch (error) {
    logger.error('Error en DELETE /api/company/logos/:filename:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar logo'
    });
  }
});

module.exports = router;
