const express = require('express');
const router = express.Router();
const NavigationService = require('../services/NavigationService');
const { authenticateAdmin } = require('../middleware/adminAuth');
const logger = require('../utils/logger');

/**
 * GET /api/navigation
 * Obtener toda la navegación agrupada por ubicación
 */
router.get('/', async (req, res) => {
  try {
    const includeInactive = req.query.include_inactive === 'true' && req.adminUser;
    const navigation = await NavigationService.getAllNavigation(includeInactive);

    res.json({
      success: true,
      data: navigation
    });
  } catch (error) {
    logger.error('Error en GET /api/navigation:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener navegación'
    });
  }
});

/**
 * GET /api/navigation/location/:location
 * Obtener items por ubicación específica
 */
router.get('/location/:location', async (req, res) => {
  try {
    const { location } = req.params;
    const includeInactive = req.query.include_inactive === 'true' && req.adminUser;
    const items = await NavigationService.getNavigationByLocation(location, includeInactive);

    res.json({
      success: true,
      data: items
    });
  } catch (error) {
    logger.error(`Error en GET /api/navigation/location/${req.params.location}:`, error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener items de navegación'
    });
  }
});

/**
 * GET /api/navigation/stats
 * Obtener estadísticas de navegación (admin)
 */
router.get('/stats', authenticateAdmin, async (req, res) => {
  try {
    const stats = await NavigationService.getNavigationStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error en GET /api/navigation/stats:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener estadísticas'
    });
  }
});

/**
 * POST /api/navigation
 * Crear nuevo item de navegación (admin)
 */
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const { location, label, url } = req.body;

    if (!location || !label || !url) {
      return res.status(400).json({
        success: false,
        error: 'location, label y url son requeridos'
      });
    }

    const newItem = await NavigationService.createNavigationItem(req.body);

    logger.info(`Navigation item creado por ${req.adminUser.username}:`, { id: newItem.id });

    res.status(201).json({
      success: true,
      message: 'Item de navegación creado',
      data: newItem
    });
  } catch (error) {
    logger.error('Error en POST /api/navigation:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al crear item de navegación'
    });
  }
});

/**
 * PUT /api/navigation/:id
 * Actualizar item de navegación (admin)
 */
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No se proporcionaron campos para actualizar'
      });
    }

    const updatedItem = await NavigationService.updateNavigationItem(parseInt(id), updates);

    logger.info(`Navigation item ${id} actualizado por ${req.adminUser.username}`);

    res.json({
      success: true,
      message: 'Item de navegación actualizado',
      data: updatedItem
    });
  } catch (error) {
    logger.error(`Error en PUT /api/navigation/${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al actualizar item de navegación'
    });
  }
});

/**
 * DELETE /api/navigation/:id
 * Eliminar item de navegación (admin)
 */
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedItem = await NavigationService.deleteNavigationItem(parseInt(id));

    logger.info(`Navigation item ${id} eliminado por ${req.adminUser.username}`);

    res.json({
      success: true,
      message: 'Item de navegación eliminado',
      data: deletedItem
    });
  } catch (error) {
    logger.error(`Error en DELETE /api/navigation/${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al eliminar item de navegación'
    });
  }
});

/**
 * POST /api/navigation/:id/toggle
 * Toggle estado activo/inactivo (admin)
 */
router.post('/:id/toggle', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (is_active === undefined) {
      return res.status(400).json({
        success: false,
        error: 'is_active es requerido'
      });
    }

    const updatedItem = await NavigationService.toggleNavigationItem(parseInt(id), is_active);

    res.json({
      success: true,
      message: `Item ${is_active ? 'activado' : 'desactivado'}`,
      data: updatedItem
    });
  } catch (error) {
    logger.error(`Error en POST /api/navigation/${req.params.id}/toggle:`, error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al toggle item'
    });
  }
});

/**
 * POST /api/navigation/reorder
 * Reordenar items de navegación (admin)
 */
router.post('/reorder', authenticateAdmin, async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        error: 'items debe ser un array de { id, sort_order }'
      });
    }

    await NavigationService.reorderNavigationItems(items);

    res.json({
      success: true,
      message: 'Items reordenados correctamente'
    });
  } catch (error) {
    logger.error('Error en POST /api/navigation/reorder:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al reordenar items'
    });
  }
});

/**
 * POST /api/navigation/cache/invalidate
 * Invalidar caché de navegación (admin)
 */
router.post('/cache/invalidate', authenticateAdmin, async (req, res) => {
  try {
    NavigationService.invalidateCache();

    res.json({
      success: true,
      message: 'Caché de navegación invalidado'
    });
  } catch (error) {
    logger.error('Error en POST /api/navigation/cache/invalidate:', error);
    res.status(500).json({
      success: false,
      error: 'Error al invalidar caché'
    });
  }
});

module.exports = router;
