/**
 * DIMOGEN Routes
 * Routes for managing DIMOGEN landing page content
 */

const express = require('express');
const router = express.Router();
const DimogenContentService = require('../services/DimogenContentService');
const { authenticateAdmin } = require('../middleware/adminAuth');
const logger = require('../utils/logger');

// =====================================================
// PUBLIC ROUTES (No authentication required)
// =====================================================

/**
 * GET /api/dimogen/content
 * Get ALL content for landing page (single request)
 */
router.get('/content', async (req, res) => {
  try {
    const content = await DimogenContentService.getAllContent();
    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    logger.error('Error fetching DIMOGEN content:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener contenido de DIMOGEN'
    });
  }
});

/**
 * GET /api/dimogen/services
 * Get active services (líneas de negocio)
 */
router.get('/services', async (req, res) => {
  try {
    const services = await DimogenContentService.getServices();
    res.json({
      success: true,
      data: services
    });
  } catch (error) {
    logger.error('Error fetching services:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener servicios'
    });
  }
});

/**
 * GET /api/dimogen/services/:key
 * Get a specific service by key
 */
router.get('/services/:key', async (req, res) => {
  try {
    const service = await DimogenContentService.getServiceByKey(req.params.key);
    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Servicio no encontrado'
      });
    }
    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    logger.error('Error fetching service:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener servicio'
    });
  }
});

/**
 * GET /api/dimogen/about
 * Get about section (filosofía y valores)
 */
router.get('/about', async (req, res) => {
  try {
    const about = await DimogenContentService.getAbout();
    res.json({
      success: true,
      data: about
    });
  } catch (error) {
    logger.error('Error fetching about section:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener sección Sobre Nosotros'
    });
  }
});

/**
 * GET /api/dimogen/faq
 * Get all FAQs or filter by category
 */
router.get('/faq', async (req, res) => {
  try {
    const { category } = req.query;
    const faqs = await DimogenContentService.getFaqs(category);
    res.json({
      success: true,
      data: faqs
    });
  } catch (error) {
    logger.error('Error fetching FAQs:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener preguntas frecuentes'
    });
  }
});

// =====================================================
// ADMIN ROUTES (Authentication required)
// =====================================================

// --- SERVICES ADMIN ---

/**
 * GET /api/dimogen/admin/services
 * Get all services (including inactive)
 */
router.get('/admin/services', authenticateAdmin, async (req, res) => {
  try {
    const services = await DimogenContentService.getAllServices();
    res.json({
      success: true,
      data: services
    });
  } catch (error) {
    logger.error('Error fetching all services:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener servicios'
    });
  }
});

/**
 * POST /api/dimogen/admin/services
 * Create a new service
 */
router.post('/admin/services', authenticateAdmin, async (req, res) => {
  try {
    const service = await DimogenContentService.createService(req.body);
    res.status(201).json({
      success: true,
      data: service,
      message: 'Servicio creado exitosamente'
    });
  } catch (error) {
    logger.error('Error creating service:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear servicio'
    });
  }
});

/**
 * PUT /api/dimogen/admin/services/:id
 * Update a service
 */
router.put('/admin/services/:id', authenticateAdmin, async (req, res) => {
  try {
    const service = await DimogenContentService.updateService(req.params.id, req.body);
    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Servicio no encontrado'
      });
    }
    res.json({
      success: true,
      data: service,
      message: 'Servicio actualizado exitosamente'
    });
  } catch (error) {
    logger.error('Error updating service:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar servicio'
    });
  }
});

/**
 * DELETE /api/dimogen/admin/services/:id
 * Delete a service
 */
router.delete('/admin/services/:id', authenticateAdmin, async (req, res) => {
  try {
    const service = await DimogenContentService.deleteService(req.params.id);
    if (!service) {
      return res.status(404).json({
        success: false,
        error: 'Servicio no encontrado'
      });
    }
    res.json({
      success: true,
      message: 'Servicio eliminado exitosamente'
    });
  } catch (error) {
    logger.error('Error deleting service:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar servicio'
    });
  }
});

// --- FAQ ADMIN ---

/**
 * GET /api/dimogen/admin/faq
 * Get all FAQs (including inactive)
 */
router.get('/admin/faq', authenticateAdmin, async (req, res) => {
  try {
    const faqs = await DimogenContentService.getAllFaqs();
    res.json({
      success: true,
      data: faqs
    });
  } catch (error) {
    logger.error('Error fetching all FAQs:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener preguntas frecuentes'
    });
  }
});

/**
 * POST /api/dimogen/admin/faq
 * Create a new FAQ
 */
router.post('/admin/faq', authenticateAdmin, async (req, res) => {
  try {
    const faq = await DimogenContentService.createFaq(req.body);
    res.status(201).json({
      success: true,
      data: faq,
      message: 'Pregunta frecuente creada exitosamente'
    });
  } catch (error) {
    logger.error('Error creating FAQ:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear pregunta frecuente'
    });
  }
});

/**
 * PUT /api/dimogen/admin/faq/:id
 * Update a FAQ
 */
router.put('/admin/faq/:id', authenticateAdmin, async (req, res) => {
  try {
    const faq = await DimogenContentService.updateFaq(req.params.id, req.body);
    if (!faq) {
      return res.status(404).json({
        success: false,
        error: 'Pregunta frecuente no encontrada'
      });
    }
    res.json({
      success: true,
      data: faq,
      message: 'Pregunta frecuente actualizada exitosamente'
    });
  } catch (error) {
    logger.error('Error updating FAQ:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar pregunta frecuente'
    });
  }
});

/**
 * DELETE /api/dimogen/admin/faq/:id
 * Delete a FAQ
 */
router.delete('/admin/faq/:id', authenticateAdmin, async (req, res) => {
  try {
    const faq = await DimogenContentService.deleteFaq(req.params.id);
    if (!faq) {
      return res.status(404).json({
        success: false,
        error: 'Pregunta frecuente no encontrada'
      });
    }
    res.json({
      success: true,
      message: 'Pregunta frecuente eliminada exitosamente'
    });
  } catch (error) {
    logger.error('Error deleting FAQ:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar pregunta frecuente'
    });
  }
});

// --- ABOUT ADMIN ---

/**
 * GET /api/dimogen/admin/about
 * Get all about items (including inactive)
 */
router.get('/admin/about', authenticateAdmin, async (req, res) => {
  try {
    const about = await DimogenContentService.getAllAbout();
    res.json({
      success: true,
      data: about
    });
  } catch (error) {
    logger.error('Error fetching all about items:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener items de Sobre Nosotros'
    });
  }
});

/**
 * POST /api/dimogen/admin/about
 * Create a new about item
 */
router.post('/admin/about', authenticateAdmin, async (req, res) => {
  try {
    const about = await DimogenContentService.createAbout(req.body);
    res.status(201).json({
      success: true,
      data: about,
      message: 'Item creado exitosamente'
    });
  } catch (error) {
    logger.error('Error creating about item:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear item'
    });
  }
});

/**
 * PUT /api/dimogen/admin/about/:id
 * Update an about item
 */
router.put('/admin/about/:id', authenticateAdmin, async (req, res) => {
  try {
    const about = await DimogenContentService.updateAbout(req.params.id, req.body);
    if (!about) {
      return res.status(404).json({
        success: false,
        error: 'Item no encontrado'
      });
    }
    res.json({
      success: true,
      data: about,
      message: 'Item actualizado exitosamente'
    });
  } catch (error) {
    logger.error('Error updating about item:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar item'
    });
  }
});

/**
 * DELETE /api/dimogen/admin/about/:id
 * Delete an about item
 */
router.delete('/admin/about/:id', authenticateAdmin, async (req, res) => {
  try {
    const about = await DimogenContentService.deleteAbout(req.params.id);
    if (!about) {
      return res.status(404).json({
        success: false,
        error: 'Item no encontrado'
      });
    }
    res.json({
      success: true,
      message: 'Item eliminado exitosamente'
    });
  } catch (error) {
    logger.error('Error deleting about item:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar item'
    });
  }
});

// --- CACHE INVALIDATION ---

/**
 * POST /api/dimogen/admin/invalidate-cache
 * Invalidate all DIMOGEN cache
 */
router.post('/admin/invalidate-cache', authenticateAdmin, async (req, res) => {
  try {
    DimogenContentService.invalidateAllCache();
    res.json({
      success: true,
      message: 'Caché de DIMOGEN invalidado exitosamente'
    });
  } catch (error) {
    logger.error('Error invalidating cache:', error);
    res.status(500).json({
      success: false,
      error: 'Error al invalidar caché'
    });
  }
});

module.exports = router;
