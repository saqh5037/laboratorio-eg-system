const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const LandingContentService = require('../services/LandingContentService');
const { authenticateAdmin } = require('../middleware/adminAuth');
const logger = require('../utils/logger');
const {
  valueSchema,
  certificationSchema,
  testimonialSchema,
  contactInfoSchema,
  contentBlockSchema,
  statisticSchema,
  validate
} = require('../validators/landingSchemas');

// Rate limiter específico para invalidación de caché
// Limita a 1 request cada 30 segundos por IP
const cacheInvalidateLimit = rateLimit({
  windowMs: 30 * 1000, // 30 segundos
  max: 1, // 1 request por ventana
  message: {
    success: false,
    error: 'Demasiadas solicitudes de invalidación',
    message: 'Por favor espera 30 segundos antes de invalidar el caché nuevamente'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// ============================================================================
// ENDPOINTS PÚBLICOS (Sin autenticación)
// ============================================================================

/**
 * GET /api/landing
 * Obtener TODO el contenido activo de la landing page
 * Endpoint público optimizado para cargar todo en una sola llamada
 */
router.get('/', async (req, res) => {
  try {
    const allContent = await LandingContentService.getAllLandingContent();

    res.json({
      success: true,
      data: allContent
    });
  } catch (error) {
    logger.error('Error en GET /api/landing:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener contenido de landing'
    });
  }
});

/**
 * GET /api/landing/values
 * Obtener valores corporativos activos
 */
router.get('/values', async (req, res) => {
  try {
    const { include_inactive } = req.query;

    if (include_inactive === 'true') {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({
          success: false,
          error: 'Se requiere autenticación para ver valores inactivos'
        });
      }

      const values = await LandingContentService.getAllValues();
      return res.json({
        success: true,
        data: values,
        total: values.length
      });
    }

    const values = await LandingContentService.getActiveValues();
    res.json({
      success: true,
      data: values,
      total: values.length
    });
  } catch (error) {
    logger.error('Error en GET /api/landing/values:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener valores'
    });
  }
});

/**
 * GET /api/landing/certifications
 * Obtener certificaciones activas
 */
router.get('/certifications', async (req, res) => {
  try {
    const { include_inactive } = req.query;

    if (include_inactive === 'true') {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({
          success: false,
          error: 'Se requiere autenticación para ver certificaciones inactivas'
        });
      }

      const certifications = await LandingContentService.getAllCertifications();
      return res.json({
        success: true,
        data: certifications,
        total: certifications.length
      });
    }

    const certifications = await LandingContentService.getActiveCertifications();
    res.json({
      success: true,
      data: certifications,
      total: certifications.length
    });
  } catch (error) {
    logger.error('Error en GET /api/landing/certifications:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener certificaciones'
    });
  }
});

/**
 * GET /api/landing/testimonials
 * Obtener testimonios activos
 */
router.get('/testimonials', async (req, res) => {
  try {
    const { include_inactive } = req.query;

    if (include_inactive === 'true') {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({
          success: false,
          error: 'Se requiere autenticación para ver testimonios inactivos'
        });
      }

      const testimonials = await LandingContentService.getAllTestimonials();
      return res.json({
        success: true,
        data: testimonials,
        total: testimonials.length
      });
    }

    const testimonials = await LandingContentService.getActiveTestimonials();
    res.json({
      success: true,
      data: testimonials,
      total: testimonials.length
    });
  } catch (error) {
    logger.error('Error en GET /api/landing/testimonials:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener testimonios'
    });
  }
});

/**
 * GET /api/landing/contact
 * Obtener información de contacto activa
 * Query params:
 * - type: Filtrar por tipo (address, phone, email, hours, social, whatsapp, service)
 */
router.get('/contact', async (req, res) => {
  try {
    const { type, include_inactive } = req.query;

    if (include_inactive === 'true') {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({
          success: false,
          error: 'Se requiere autenticación para ver contactos inactivos'
        });
      }

      const contactInfo = await LandingContentService.getAllContactInfo();
      return res.json({
        success: true,
        data: contactInfo,
        total: contactInfo.length
      });
    }

    // Si hay filtro por tipo
    if (type) {
      const contactInfo = await LandingContentService.getContactInfoByType(type);
      return res.json({
        success: true,
        data: contactInfo,
        total: contactInfo.length
      });
    }

    const contactInfo = await LandingContentService.getActiveContactInfo();
    res.json({
      success: true,
      data: contactInfo,
      total: contactInfo.length
    });
  } catch (error) {
    logger.error('Error en GET /api/landing/contact:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener información de contacto'
    });
  }
});

/**
 * GET /api/landing/content
 * Obtener bloques de contenido activos
 * Query params:
 * - section: Filtrar por sección (nosotros-header, historia, valores-header, etc.)
 */
router.get('/content', async (req, res) => {
  try {
    const { section, include_inactive } = req.query;

    if (include_inactive === 'true') {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({
          success: false,
          error: 'Se requiere autenticación para ver contenido inactivo'
        });
      }

      const contentBlocks = await LandingContentService.getAllContentBlocks();
      return res.json({
        success: true,
        data: contentBlocks,
        total: contentBlocks.length
      });
    }

    // Si hay filtro por sección
    if (section) {
      const contentBlocks = await LandingContentService.getContentBlocksBySection(section);
      return res.json({
        success: true,
        data: contentBlocks,
        total: contentBlocks.length
      });
    }

    const contentBlocks = await LandingContentService.getActiveContentBlocks();
    res.json({
      success: true,
      data: contentBlocks,
      total: contentBlocks.length
    });
  } catch (error) {
    logger.error('Error en GET /api/landing/content:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener bloques de contenido'
    });
  }
});

/**
 * GET /api/landing/statistics
 * Obtener estadísticas activas (para CTA)
 */
router.get('/statistics', async (req, res) => {
  try {
    const { include_inactive } = req.query;

    if (include_inactive === 'true') {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({
          success: false,
          error: 'Se requiere autenticación para ver estadísticas inactivas'
        });
      }

      const statistics = await LandingContentService.getAllStatistics();
      return res.json({
        success: true,
        data: statistics,
        total: statistics.length
      });
    }

    const statistics = await LandingContentService.getActiveStatistics();
    res.json({
      success: true,
      data: statistics,
      total: statistics.length
    });
  } catch (error) {
    logger.error('Error en GET /api/landing/statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener estadísticas'
    });
  }
});

// ============================================================================
// ENDPOINTS ADMIN - VALUES (Requieren autenticación)
// ============================================================================

/**
 * POST /api/landing/values
 * Crear nuevo valor corporativo
 */
router.post('/values', authenticateAdmin, async (req, res) => {
  try {
    const newValue = await LandingContentService.createValue(req.body);

    logger.info(`Valor creado por ${req.user?.username || 'admin'}:`, {
      id: newValue.id,
      title: newValue.title
    });

    res.status(201).json({
      success: true,
      message: 'Valor creado exitosamente',
      data: newValue
    });
  } catch (error) {
    logger.error('Error en POST /api/landing/values:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Error al crear valor'
    });
  }
});

/**
 * PUT /api/landing/values/:id
 * Actualizar valor existente
 */
router.put('/values/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedValue = await LandingContentService.updateValue(parseInt(id), req.body);

    logger.info(`Valor ${id} actualizado por ${req.user?.username || 'admin'}`);

    res.json({
      success: true,
      message: 'Valor actualizado exitosamente',
      data: updatedValue
    });
  } catch (error) {
    logger.error(`Error en PUT /api/landing/values/${req.params.id}:`, error);
    res.status(400).json({
      success: false,
      error: error.message || 'Error al actualizar valor'
    });
  }
});

/**
 * DELETE /api/landing/values/:id
 * Eliminar valor
 */
router.delete('/values/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedValue = await LandingContentService.deleteValue(parseInt(id));

    logger.info(`Valor ${id} eliminado por ${req.user?.username || 'admin'}`);

    res.json({
      success: true,
      message: 'Valor eliminado exitosamente',
      data: deletedValue
    });
  } catch (error) {
    logger.error(`Error en DELETE /api/landing/values/${req.params.id}:`, error);
    res.status(400).json({
      success: false,
      error: error.message || 'Error al eliminar valor'
    });
  }
});

// ============================================================================
// ENDPOINTS ADMIN - CERTIFICATIONS
// ============================================================================

/**
 * POST /api/landing/certifications
 * Crear nueva certificación
 */
router.post('/certifications', authenticateAdmin, async (req, res) => {
  try {
    const newCert = await LandingContentService.createCertification(req.body);

    logger.info(`Certificación creada por ${req.user?.username || 'admin'}:`, {
      id: newCert.id,
      title: newCert.title
    });

    res.status(201).json({
      success: true,
      message: 'Certificación creada exitosamente',
      data: newCert
    });
  } catch (error) {
    logger.error('Error en POST /api/landing/certifications:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Error al crear certificación'
    });
  }
});

/**
 * PUT /api/landing/certifications/:id
 * Actualizar certificación
 */
router.put('/certifications/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedCert = await LandingContentService.updateCertification(parseInt(id), req.body);

    logger.info(`Certificación ${id} actualizada por ${req.user?.username || 'admin'}`);

    res.json({
      success: true,
      message: 'Certificación actualizada exitosamente',
      data: updatedCert
    });
  } catch (error) {
    logger.error(`Error en PUT /api/landing/certifications/${req.params.id}:`, error);
    res.status(400).json({
      success: false,
      error: error.message || 'Error al actualizar certificación'
    });
  }
});

/**
 * DELETE /api/landing/certifications/:id
 * Eliminar certificación
 */
router.delete('/certifications/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCert = await LandingContentService.deleteCertification(parseInt(id));

    logger.info(`Certificación ${id} eliminada por ${req.user?.username || 'admin'}`);

    res.json({
      success: true,
      message: 'Certificación eliminada exitosamente',
      data: deletedCert
    });
  } catch (error) {
    logger.error(`Error en DELETE /api/landing/certifications/${req.params.id}:`, error);
    res.status(400).json({
      success: false,
      error: error.message || 'Error al eliminar certificación'
    });
  }
});

// ============================================================================
// ENDPOINTS ADMIN - TESTIMONIALS
// ============================================================================

/**
 * POST /api/landing/testimonials
 * Crear nuevo testimonio
 */
router.post('/testimonials', authenticateAdmin, async (req, res) => {
  try {
    const newTestim = await LandingContentService.createTestimonial(req.body);

    logger.info(`Testimonio creado por ${req.user?.username || 'admin'}:`, {
      id: newTestim.id,
      name: newTestim.name
    });

    res.status(201).json({
      success: true,
      message: 'Testimonio creado exitosamente',
      data: newTestim
    });
  } catch (error) {
    logger.error('Error en POST /api/landing/testimonials:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Error al crear testimonio'
    });
  }
});

/**
 * PUT /api/landing/testimonials/:id
 * Actualizar testimonio
 */
router.put('/testimonials/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedTestim = await LandingContentService.updateTestimonial(parseInt(id), req.body);

    logger.info(`Testimonio ${id} actualizado por ${req.user?.username || 'admin'}`);

    res.json({
      success: true,
      message: 'Testimonio actualizado exitosamente',
      data: updatedTestim
    });
  } catch (error) {
    logger.error(`Error en PUT /api/landing/testimonials/${req.params.id}:`, error);
    res.status(400).json({
      success: false,
      error: error.message || 'Error al actualizar testimonio'
    });
  }
});

/**
 * DELETE /api/landing/testimonials/:id
 * Eliminar testimonio
 */
router.delete('/testimonials/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTestim = await LandingContentService.deleteTestimonial(parseInt(id));

    logger.info(`Testimonio ${id} eliminado por ${req.user?.username || 'admin'}`);

    res.json({
      success: true,
      message: 'Testimonio eliminado exitosamente',
      data: deletedTestim
    });
  } catch (error) {
    logger.error(`Error en DELETE /api/landing/testimonials/${req.params.id}:`, error);
    res.status(400).json({
      success: false,
      error: error.message || 'Error al eliminar testimonio'
    });
  }
});

// ============================================================================
// ENDPOINTS ADMIN - CONTACT INFO
// ============================================================================

/**
 * POST /api/landing/contact
 * Crear nueva información de contacto
 */
router.post('/contact', authenticateAdmin, async (req, res) => {
  try {
    const newContact = await LandingContentService.createContactInfo(req.body);

    logger.info(`Contact info creado por ${req.user?.username || 'admin'}:`, {
      id: newContact.id,
      type: newContact.type
    });

    res.status(201).json({
      success: true,
      message: 'Información de contacto creada exitosamente',
      data: newContact
    });
  } catch (error) {
    logger.error('Error en POST /api/landing/contact:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Error al crear información de contacto'
    });
  }
});

/**
 * PUT /api/landing/contact/:id
 * Actualizar información de contacto
 */
router.put('/contact/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedContact = await LandingContentService.updateContactInfo(parseInt(id), req.body);

    logger.info(`Contact info ${id} actualizado por ${req.user?.username || 'admin'}`);

    res.json({
      success: true,
      message: 'Información de contacto actualizada exitosamente',
      data: updatedContact
    });
  } catch (error) {
    logger.error(`Error en PUT /api/landing/contact/${req.params.id}:`, error);
    res.status(400).json({
      success: false,
      error: error.message || 'Error al actualizar información de contacto'
    });
  }
});

/**
 * DELETE /api/landing/contact/:id
 * Eliminar información de contacto
 */
router.delete('/contact/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedContact = await LandingContentService.deleteContactInfo(parseInt(id));

    logger.info(`Contact info ${id} eliminado por ${req.user?.username || 'admin'}`);

    res.json({
      success: true,
      message: 'Información de contacto eliminada exitosamente',
      data: deletedContact
    });
  } catch (error) {
    logger.error(`Error en DELETE /api/landing/contact/${req.params.id}:`, error);
    res.status(400).json({
      success: false,
      error: error.message || 'Error al eliminar información de contacto'
    });
  }
});

// ============================================================================
// ENDPOINTS ADMIN - CONTENT BLOCKS
// ============================================================================

/**
 * POST /api/landing/content
 * Crear nuevo bloque de contenido
 */
router.post('/content', authenticateAdmin, async (req, res) => {
  try {
    const newBlock = await LandingContentService.createContentBlock(req.body);

    logger.info(`Content block creado por ${req.user?.username || 'admin'}:`, {
      id: newBlock.id,
      section: newBlock.section
    });

    res.status(201).json({
      success: true,
      message: 'Bloque de contenido creado exitosamente',
      data: newBlock
    });
  } catch (error) {
    logger.error('Error en POST /api/landing/content:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Error al crear bloque de contenido'
    });
  }
});

/**
 * PUT /api/landing/content/:id
 * Actualizar bloque de contenido
 */
router.put('/content/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedBlock = await LandingContentService.updateContentBlock(parseInt(id), req.body);

    logger.info(`Content block ${id} actualizado por ${req.user?.username || 'admin'}`);

    res.json({
      success: true,
      message: 'Bloque de contenido actualizado exitosamente',
      data: updatedBlock
    });
  } catch (error) {
    logger.error(`Error en PUT /api/landing/content/${req.params.id}:`, error);
    res.status(400).json({
      success: false,
      error: error.message || 'Error al actualizar bloque de contenido'
    });
  }
});

/**
 * DELETE /api/landing/content/:id
 * Eliminar bloque de contenido
 */
router.delete('/content/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBlock = await LandingContentService.deleteContentBlock(parseInt(id));

    logger.info(`Content block ${id} eliminado por ${req.user?.username || 'admin'}`);

    res.json({
      success: true,
      message: 'Bloque de contenido eliminado exitosamente',
      data: deletedBlock
    });
  } catch (error) {
    logger.error(`Error en DELETE /api/landing/content/${req.params.id}:`, error);
    res.status(400).json({
      success: false,
      error: error.message || 'Error al eliminar bloque de contenido'
    });
  }
});

// ============================================================================
// ENDPOINTS ADMIN - STATISTICS
// ============================================================================

/**
 * POST /api/landing/statistics
 * Crear nueva estadística
 */
router.post('/statistics', authenticateAdmin, async (req, res) => {
  try {
    const newStat = await LandingContentService.createStatistic(req.body);

    logger.info(`Estadística creada por ${req.user?.username || 'admin'}:`, {
      id: newStat.id,
      label: newStat.label
    });

    res.status(201).json({
      success: true,
      message: 'Estadística creada exitosamente',
      data: newStat
    });
  } catch (error) {
    logger.error('Error en POST /api/landing/statistics:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Error al crear estadística'
    });
  }
});

/**
 * PUT /api/landing/statistics/:id
 * Actualizar estadística
 */
router.put('/statistics/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedStat = await LandingContentService.updateStatistic(parseInt(id), req.body);

    logger.info(`Estadística ${id} actualizada por ${req.user?.username || 'admin'}`);

    res.json({
      success: true,
      message: 'Estadística actualizada exitosamente',
      data: updatedStat
    });
  } catch (error) {
    logger.error(`Error en PUT /api/landing/statistics/${req.params.id}:`, error);
    res.status(400).json({
      success: false,
      error: error.message || 'Error al actualizar estadística'
    });
  }
});

/**
 * DELETE /api/landing/statistics/:id
 * Eliminar estadística
 */
router.delete('/statistics/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedStat = await LandingContentService.deleteStatistic(parseInt(id));

    logger.info(`Estadística ${id} eliminada por ${req.user?.username || 'admin'}`);

    res.json({
      success: true,
      message: 'Estadística eliminada exitosamente',
      data: deletedStat
    });
  } catch (error) {
    logger.error(`Error en DELETE /api/landing/statistics/${req.params.id}:`, error);
    res.status(400).json({
      success: false,
      error: error.message || 'Error al eliminar estadística'
    });
  }
});

// ============================================================================
// ENDPOINT DE INVALIDACIÓN DE CACHÉ (Admin only)
// ============================================================================

/**
 * POST /api/landing/invalidate-cache
 * Invalidar todo el caché de contenido de landing page
 * Endpoint de administrador para forzar actualización de datos en la landing pública
 * Rate limited: 1 request cada 30 segundos
 */
router.post('/invalidate-cache', cacheInvalidateLimit, authenticateAdmin, async (req, res) => {
  try {
    const result = await LandingContentService.invalidateAllCache();

    logger.info(`Caché de landing invalidado por usuario: ${req.user.username}`);

    res.json({
      success: true,
      message: 'Caché invalidado exitosamente. Los cambios se reflejarán en la landing page',
      data: result
    });
  } catch (error) {
    logger.error('Error en POST /api/landing/invalidate-cache:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al invalidar caché'
    });
  }
});

module.exports = router;
