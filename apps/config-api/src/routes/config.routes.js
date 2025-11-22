const express = require('express');
const router = express.Router();
const ConfigService = require('../services/ConfigService');
const CacheService = require('../services/CacheService');
const { authenticateAdmin, requireAdmin } = require('../middleware/adminAuth');
const { isValidKey, isValidCategory, isValidDataType } = require('../utils/validation');
const logger = require('../utils/logger');

/**
 * GET /api/config
 * Obtener todas las configuraciones (con cache)
 * Query params:
 *   - category: filtrar por categoría
 *   - no_cache: si es true, bypass cache
 */
router.get('/', async (req, res, next) => {
  try {
    const { category, no_cache } = req.query;

    const cacheKey = category ? `config:category:${category}` : 'config:all';

    // Intentar obtener del cache
    if (!no_cache) {
      const cached = CacheService.get(cacheKey);
      if (cached) {
        return res.json({
          data: cached,
          source: 'cache'
        });
      }
    }

    // Obtener de base de datos
    const configs = await ConfigService.getAll(category);

    // Guardar en cache
    CacheService.set(cacheKey, configs);

    res.json({
      data: configs,
      source: 'database',
      total: configs.length
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/config/grouped
 * Obtener configuraciones agrupadas por categoría
 */
router.get('/grouped', async (req, res, next) => {
  try {
    const { no_cache } = req.query;

    const cacheKey = 'config:grouped';

    // Cache
    if (!no_cache) {
      const cached = CacheService.get(cacheKey);
      if (cached) {
        return res.json({
          data: cached,
          source: 'cache'
        });
      }
    }

    const grouped = await ConfigService.getGroupedByCategory();

    // Calcular totales
    const summary = Object.keys(grouped).map(category => ({
      category,
      total: grouped[category].length
    }));

    CacheService.set(cacheKey, grouped);

    res.json({
      data: grouped,
      summary,
      source: 'database'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/config/auth-methods
 * Obtener métodos de autenticación ordenados por prioridad
 */
router.get('/auth-methods', async (req, res, next) => {
  try {
    const { no_cache } = req.query;

    const cacheKey = 'config:auth_methods';

    if (!no_cache) {
      const cached = CacheService.get(cacheKey);
      if (cached) {
        return res.json({
          data: cached,
          source: 'cache'
        });
      }
    }

    const methods = await ConfigService.getAuthMethods();

    CacheService.set(cacheKey, methods);

    res.json({
      data: methods,
      source: 'database'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/config/:key
 * Obtener configuración específica por key
 */
router.get('/:key(*)', async (req, res, next) => {
  try {
    const { key } = req.params;
    const { no_cache } = req.query;

    const cacheKey = `config:${key}`;

    if (!no_cache) {
      const cached = CacheService.get(cacheKey);
      if (cached) {
        return res.json({
          data: cached,
          source: 'cache'
        });
      }
    }

    const config = await ConfigService.getByKey(key);

    if (!config) {
      return res.status(404).json({
        error: 'No encontrado',
        message: `Configuración '${key}' no encontrada`
      });
    }

    CacheService.set(cacheKey, config);

    res.json({
      data: config,
      source: 'database'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/config
 * Crear nueva configuración (requiere autenticación de admin)
 */
router.post('/', authenticateAdmin, requireAdmin, async (req, res, next) => {
  try {
    const { key, value, data_type, category, description, is_secret, is_editable } = req.body;

    // Validaciones
    if (!key || value === undefined) {
      return res.status(400).json({
        error: 'Datos incompletos',
        message: 'Se requieren key y value'
      });
    }

    if (!isValidKey(key)) {
      return res.status(400).json({
        error: 'Key inválida',
        message: 'La key debe tener formato: category.subcategory.name (ej: ui.pages.resultados.enabled)'
      });
    }

    if (category && !isValidCategory(category)) {
      return res.status(400).json({
        error: 'Categoría inválida',
        message: 'Categoría debe ser: ui, auth, features, integrations, security, system'
      });
    }

    if (data_type && !isValidDataType(data_type)) {
      return res.status(400).json({
        error: 'Tipo de dato inválido',
        message: 'data_type debe ser: string, number, boolean, json'
      });
    }

    const config = await ConfigService.create({
      key,
      value,
      data_type,
      category,
      description,
      is_secret,
      is_editable,
      created_by: req.user.username
    });

    // Invalidar cache
    CacheService.invalidateAllConfig();

    logger.info(`Configuración creada: ${key}`, {
      user: req.user.username,
      category
    });

    res.status(201).json({
      message: 'Configuración creada exitosamente',
      data: config
    });
  } catch (error) {
    // Error de unique constraint
    if (error.code === '23505') {
      return res.status(400).json({
        error: 'Configuración ya existe',
        message: `Ya existe una configuración con la key '${req.body.key}'`
      });
    }

    next(error);
  }
});

/**
 * PUT /api/config/:key
 * Actualizar configuración existente (requiere autenticación de admin)
 */
router.put('/:key(*)', authenticateAdmin, requireAdmin, async (req, res, next) => {
  try {
    const { key } = req.params;
    const { value, description } = req.body;

    if (value === undefined) {
      return res.status(400).json({
        error: 'Datos incompletos',
        message: 'Se requiere value'
      });
    }

    const updated = await ConfigService.update(key, {
      value,
      description,
      updated_by: req.user.username
    });

    if (!updated) {
      return res.status(404).json({
        error: 'No encontrado',
        message: `Configuración '${key}' no encontrada`
      });
    }

    // Invalidar cache
    CacheService.invalidateConfig(key);

    logger.info(`Configuración actualizada: ${key}`, {
      user: req.user.username,
      new_value: value
    });

    res.json({
      message: 'Configuración actualizada exitosamente',
      data: updated
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/config/:key
 * Eliminar configuración (requiere autenticación de admin)
 */
router.delete('/:key(*)', authenticateAdmin, requireAdmin, async (req, res, next) => {
  try {
    const { key } = req.params;

    const deleted = await ConfigService.delete(key);

    if (!deleted) {
      return res.status(404).json({
        error: 'No encontrado',
        message: `Configuración '${key}' no encontrada o no es editable`
      });
    }

    // Invalidar cache
    CacheService.invalidateConfig(key);

    logger.info(`Configuración eliminada: ${key}`, {
      user: req.user.username
    });

    res.json({
      message: 'Configuración eliminada exitosamente'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/config/cache/invalidate
 * Invalidar todo el cache de configuraciones (requiere admin)
 */
router.post('/cache/invalidate', authenticateAdmin, requireAdmin, (req, res) => {
  CacheService.invalidateAllConfig();

  logger.info('Cache de configuraciones invalidado manualmente', {
    user: req.user.username
  });

  res.json({
    message: 'Cache invalidado exitosamente'
  });
});

/**
 * GET /api/config/cache/stats
 * Obtener estadísticas del cache
 */
router.get('/cache/stats', authenticateAdmin, (req, res) => {
  const stats = CacheService.getStats();
  const keys = CacheService.keys();

  res.json({
    stats,
    keys_count: keys.length,
    keys: keys.slice(0, 50) // Primeras 50 keys
  });
});

module.exports = router;
