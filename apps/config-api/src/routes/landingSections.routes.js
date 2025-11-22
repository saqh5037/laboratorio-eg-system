const express = require('express');
const router = express.Router();
const LandingSectionService = require('../services/LandingSectionService');
const { authenticateAdmin } = require('../middleware/adminAuth');
const logger = require('../utils/logger');

// ============================================================================
// ENDPOINTS PÚBLICOS (Sin autenticación)
// ============================================================================

/**
 * GET /api/landing/sections
 * Obtener todas las secciones visibles (público)
 * Para renderizar la landing page dinámicamente
 */
router.get('/', async (req, res) => {
  try {
    const sections = await LandingSectionService.getVisibleSections();

    res.json({
      success: true,
      data: sections,
      total: sections.length
    });
  } catch (error) {
    logger.error('Error en GET /api/landing/sections:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener secciones'
    });
  }
});

/**
 * GET /api/landing/sections/:section_key
 * Obtener una sección específica por su key (público)
 */
router.get('/:section_key', async (req, res) => {
  try {
    const { section_key } = req.params;
    const section = await LandingSectionService.getSectionByKey(section_key);

    if (!section) {
      return res.status(404).json({
        success: false,
        error: `Sección '${section_key}' no encontrada`
      });
    }

    res.json({
      success: true,
      data: section
    });
  } catch (error) {
    logger.error(`Error en GET /api/landing/sections/${req.params.section_key}:`, error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener sección'
    });
  }
});

// ============================================================================
// ENDPOINTS ADMIN (Requieren autenticación)
// ============================================================================

/**
 * GET /api/admin/landing/sections
 * Obtener todas las secciones (admin)
 * Soporta filtros y opciones de visibilidad
 */
router.get('/admin/all', authenticateAdmin, async (req, res) => {
  try {
    const { include_hidden, section_type } = req.query;

    const filters = {
      include_hidden: include_hidden === 'true',
      section_type: section_type || null
    };

    const sections = await LandingSectionService.getAllSections(filters);
    const stats = await LandingSectionService.getSectionStats();

    res.json({
      success: true,
      data: sections,
      total: sections.length,
      stats
    });
  } catch (error) {
    logger.error('Error en GET /api/admin/landing/sections:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener secciones (admin)'
    });
  }
});

/**
 * GET /api/admin/landing/sections/stats
 * Obtener estadísticas de secciones (admin)
 */
router.get('/admin/stats', authenticateAdmin, async (req, res) => {
  try {
    const stats = await LandingSectionService.getSectionStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error en GET /api/admin/landing/sections/stats:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener estadísticas'
    });
  }
});

/**
 * POST /api/admin/landing/sections
 * Crear nueva sección (admin)
 */
router.post('/admin', authenticateAdmin, async (req, res) => {
  try {
    const sectionData = req.body;
    const created_by = req.user?.username || req.user?.email || 'admin';

    // Validar campos requeridos
    if (!sectionData.section_key || !sectionData.section_type) {
      return res.status(400).json({
        success: false,
        error: 'Campos requeridos: section_key, section_type'
      });
    }

    const newSection = await LandingSectionService.createSection(sectionData, created_by);

    logger.info(`Sección creada por ${created_by}: ${newSection.section_key}`);

    res.status(201).json({
      success: true,
      message: 'Sección creada exitosamente',
      data: newSection
    });
  } catch (error) {
    logger.error('Error en POST /api/admin/landing/sections:', error);

    // Manejo de errores de duplicado (violación de UNIQUE constraint)
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        error: 'Ya existe una sección con ese section_key'
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Error al crear sección'
    });
  }
});

/**
 * PUT /api/admin/landing/sections/:id
 * Actualizar sección existente (admin)
 */
router.put('/admin/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const sectionData = req.body;
    const updated_by = req.user?.username || req.user?.email || 'admin';

    const updatedSection = await LandingSectionService.updateSection(
      parseInt(id),
      sectionData,
      updated_by
    );

    logger.info(`Sección actualizada por ${updated_by}: ID ${id}`);

    res.json({
      success: true,
      message: 'Sección actualizada exitosamente',
      data: updatedSection
    });
  } catch (error) {
    logger.error(`Error en PUT /api/admin/landing/sections/${req.params.id}:`, error);

    if (error.message.includes('no encontrada')) {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Error al actualizar sección'
    });
  }
});

/**
 * DELETE /api/admin/landing/sections/:id
 * Eliminar sección (admin)
 */
router.delete('/admin/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted_by = req.user?.username || req.user?.email || 'admin';

    const deletedSection = await LandingSectionService.deleteSection(parseInt(id));

    logger.info(`Sección eliminada por ${deleted_by}: ID ${id} (${deletedSection.section_key})`);

    res.json({
      success: true,
      message: 'Sección eliminada exitosamente',
      data: deletedSection
    });
  } catch (error) {
    logger.error(`Error en DELETE /api/admin/landing/sections/${req.params.id}:`, error);

    if (error.message.includes('no encontrada')) {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Error al eliminar sección'
    });
  }
});

/**
 * PATCH /api/admin/landing/sections/:id/toggle
 * Toggle visibilidad de una sección (admin)
 * Operación rápida para mostrar/ocultar
 */
router.patch('/admin/:id/toggle', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updated_by = req.user?.username || req.user?.email || 'admin';

    const updatedSection = await LandingSectionService.toggleVisibility(parseInt(id));

    const status = updatedSection.is_visible ? 'visible' : 'oculta';
    logger.info(`Visibilidad de sección ID ${id} cambiada a ${status} por ${updated_by}`);

    res.json({
      success: true,
      message: `Sección ahora está ${status}`,
      data: {
        id: updatedSection.id,
        section_key: updatedSection.section_key,
        is_visible: updatedSection.is_visible
      }
    });
  } catch (error) {
    logger.error(`Error en PATCH /api/admin/landing/sections/${req.params.id}/toggle:`, error);

    if (error.message.includes('no encontrada')) {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Error al cambiar visibilidad'
    });
  }
});

/**
 * PATCH /api/admin/landing/sections/reorder
 * Reordenar múltiples secciones en batch (admin)
 * Body: { sections: [{ id: 1, order_index: 0 }, { id: 2, order_index: 1 }, ...] }
 */
router.patch('/admin/reorder', authenticateAdmin, async (req, res) => {
  try {
    const { sections } = req.body;
    const updated_by = req.user?.username || req.user?.email || 'admin';

    // Validar formato
    if (!Array.isArray(sections) || sections.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Body debe contener un array "sections" con al menos un elemento'
      });
    }

    // Validar que cada elemento tenga id y order_index
    for (const section of sections) {
      if (!section.id || section.order_index === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Cada elemento debe tener "id" y "order_index"'
        });
      }
    }

    const updated = await LandingSectionService.reorderSections(sections);

    logger.info(`${updated} secciones reordenadas por ${updated_by}`);

    res.json({
      success: true,
      message: 'Secciones reordenadas exitosamente',
      data: {
        updated
      }
    });
  } catch (error) {
    logger.error('Error en PATCH /api/admin/landing/sections/reorder:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al reordenar secciones'
    });
  }
});

/**
 * POST /api/admin/landing/sections/:id/duplicate
 * Duplicar una sección (admin)
 * Body: { new_section_key: 'nueva-key', new_title: 'Nuevo Título' }
 */
router.post('/admin/:id/duplicate', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { new_section_key, new_title } = req.body;
    const created_by = req.user?.username || req.user?.email || 'admin';

    // Validar new_section_key
    if (!new_section_key) {
      return res.status(400).json({
        success: false,
        error: 'Campo requerido: new_section_key'
      });
    }

    const duplicatedSection = await LandingSectionService.duplicateSection(
      parseInt(id),
      new_section_key,
      new_title,
      created_by
    );

    logger.info(`Sección ID ${id} duplicada como '${new_section_key}' por ${created_by}`);

    res.status(201).json({
      success: true,
      message: 'Sección duplicada exitosamente',
      data: duplicatedSection
    });
  } catch (error) {
    logger.error(`Error en POST /api/admin/landing/sections/${req.params.id}/duplicate:`, error);

    // Manejo de errores de duplicado (violación de UNIQUE constraint)
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        error: 'Ya existe una sección con ese new_section_key'
      });
    }

    if (error.message.includes('no encontrada')) {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Error al duplicar sección'
    });
  }
});

module.exports = router;
