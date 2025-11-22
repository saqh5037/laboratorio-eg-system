const express = require('express');
const router = express.Router();
const CompanyService = require('../services/CompanyService');
const { authenticateAdmin } = require('../middleware/adminAuth');
const logger = require('../utils/logger');

/**
 * GET /api/company
 * Obtener información completa de la empresa (público)
 */
router.get('/', async (req, res) => {
  try {
    const companyInfo = await CompanyService.getCompanyInfo();

    res.json({
      success: true,
      data: companyInfo
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
 */
router.get('/contact', async (req, res) => {
  try {
    const contactInfo = await CompanyService.getContactInfo();

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
 */
router.get('/seo', async (req, res) => {
  try {
    const seoInfo = await CompanyService.getSEOInfo();

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
 */
router.get('/pwa', async (req, res) => {
  try {
    const pwaInfo = await CompanyService.getPWAInfo();

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
 */
router.put('/', authenticateAdmin, async (req, res) => {
  try {
    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No se proporcionaron campos para actualizar'
      });
    }

    const updatedInfo = await CompanyService.updateCompanyInfo(updates);

    logger.info(`Company info actualizado por ${req.adminUser.username}`, {
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
 */
router.patch('/identity', authenticateAdmin, async (req, res) => {
  try {
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

    const updatedInfo = await CompanyService.updateCompanyInfo(updates);

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
 */
router.patch('/contact', authenticateAdmin, async (req, res) => {
  try {
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

    const updatedInfo = await CompanyService.updateCompanyInfo(updates);

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
 */
router.patch('/social', authenticateAdmin, async (req, res) => {
  try {
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

    const updatedInfo = await CompanyService.updateCompanyInfo(updates);

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
 */
router.patch('/seo', authenticateAdmin, async (req, res) => {
  try {
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

    const updatedInfo = await CompanyService.updateCompanyInfo(updates);

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
 */
router.patch('/pwa', authenticateAdmin, async (req, res) => {
  try {
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

    const updatedInfo = await CompanyService.updateCompanyInfo(updates);

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
 */
router.post('/cache/invalidate', authenticateAdmin, async (req, res) => {
  try {
    CompanyService.invalidateCache();

    res.json({
      success: true,
      message: 'Caché de información de empresa invalidado'
    });
  } catch (error) {
    logger.error('Error en POST /api/company/cache/invalidate:', error);
    res.status(500).json({
      success: false,
      error: 'Error al invalidar caché'
    });
  }
});

module.exports = router;
