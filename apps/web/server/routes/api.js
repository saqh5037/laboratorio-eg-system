// API Routes para consultas a PostgreSQL
// Endpoints RESTful con caché y manejo de errores

import express from 'express';
import models from '../models/index.js';
import cacheManager, { cacheMiddleware, generateCacheKey } from '../middleware/cache.js';

const router = express.Router();

// Middleware para logging de API calls
router.use((req, res, next) => {
  console.log(`API ${req.method} ${req.path}`, req.query);
  next();
});

// Middleware para deshabilitar caché HTTP en datos dinámicos
const noCacheMiddleware = (req, res, next) => {
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  next();
};

// ============= PRUEBAS (ESTUDIOS) =============

// GET /api/pruebas - Obtener todas las pruebas
router.get('/pruebas',
  noCacheMiddleware,
  cacheMiddleware(req => generateCacheKey('pruebas', req), { ttl: 600 }),
  async (req, res, next) => {
    try {
      const { 
        page = 1, 
        limit = 100,
        area_id,
        search,
        include_prices = false
      } = req.query;

      let result;

      if (search) {
        result = await models.Prueba.search(search, parseInt(limit));
      } else if (area_id) {
        result = await models.Prueba.findByArea(parseInt(area_id));
      } else {
        result = await models.Prueba.findAll({
          page: parseInt(page),
          limit: parseInt(limit),
          includePrecios: include_prices === 'true'
        });
      }

      res.json({
        success: true,
        data: result,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: result.length
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/pruebas/:id - Obtener prueba por ID
router.get('/pruebas/:id',
  cacheMiddleware(req => `prueba:${req.params.id}`, { ttl: 1800 }),
  async (req, res, next) => {
    try {
      const prueba = await models.Prueba.findById(req.params.id);
      
      if (!prueba) {
        return res.status(404).json({
          success: false,
          error: 'Prueba no encontrada'
        });
      }

      // Obtener precio si se solicita
      if (req.query.include_price) {
        const listaPreciosId = req.query.lista_precios_id || 1;
        const precio = await models.Prueba.getPrice(req.params.id, listaPreciosId);
        prueba.precio_info = precio;
      }

      res.json({
        success: true,
        data: prueba
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/pruebas/codigo/:codigo - Buscar prueba por código
router.get('/pruebas/codigo/:codigo',
  cacheMiddleware(req => `prueba:codigo:${req.params.codigo}`, { ttl: 1800 }),
  async (req, res, next) => {
    try {
      const prueba = await models.Prueba.findByCode(req.params.codigo);
      
      if (!prueba) {
        return res.status(404).json({
          success: false,
          error: 'Prueba no encontrada'
        });
      }

      res.json({
        success: true,
        data: prueba
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============= GRUPOS (PERFILES) =============

// GET /api/grupos - Obtener todos los grupos
router.get('/grupos',
  noCacheMiddleware,
  cacheMiddleware(req => generateCacheKey('grupos', req), { ttl: 600 }),
  async (req, res, next) => {
    try {
      const { 
        page = 1, 
        limit = 50,
        search,
        include_prices = false
      } = req.query;

      let result;

      if (search) {
        result = await models.GrupoPrueba.search(search, parseInt(limit));
      } else {
        result = await models.GrupoPrueba.findAll({
          page: parseInt(page),
          limit: parseInt(limit),
          includePrecios: include_prices === 'true'
        });
      }

      res.json({
        success: true,
        data: result,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: result.length
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/grupos/:id - Obtener grupo con sus pruebas
router.get('/grupos/:id',
  noCacheMiddleware,
  cacheMiddleware(req => `grupo:${req.params.id}`, { ttl: 1800 }),
  async (req, res, next) => {
    try {
      const grupo = await models.GrupoPrueba.findByIdWithPruebas(req.params.id);
      
      if (!grupo) {
        return res.status(404).json({
          success: false,
          error: 'Grupo no encontrado'
        });
      }

      // Obtener precio si se solicita
      if (req.query.include_price) {
        const listaPreciosId = req.query.lista_precios_id || 1;
        const precio = await models.GrupoPrueba.getPrice(req.params.id, listaPreciosId);
        grupo.precio_info = precio;
      }

      res.json({
        success: true,
        data: grupo
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/grupos/:id/tree - Obtener árbol jerárquico del grupo
router.get('/grupos/:id/tree',
  cacheMiddleware(req => `grupo:${req.params.id}:tree`, { ttl: 1800 }),
  async (req, res, next) => {
    try {
      const listaPreciosId = req.query.lista_precios_id || 27;
      const tree = await models.GrupoPrueba.getTreeStructure(req.params.id, listaPreciosId);
      
      if (!tree || tree.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Grupo no encontrado o sin estructura de árbol'
        });
      }

      res.json({
        success: true,
        data: tree
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============= BÚSQUEDA UNIFICADA =============

// GET /api/search - Búsqueda global
router.get('/search',
  cacheMiddleware(req => generateCacheKey('search', req), { ttl: 300 }),
  async (req, res, next) => {
    try {
      const { 
        q,
        include_groups = true,
        include_pruebas = true,
        lista_precios_id = 1,
        limit = 100
      } = req.query;

      if (!q || q.length < 2) {
        return res.status(400).json({
          success: false,
          error: 'Término de búsqueda debe tener al menos 2 caracteres'
        });
      }

      const results = await models.UnifiedSearch.search(q, {
        includeGroups: include_groups === 'true',
        includePruebas: include_pruebas === 'true',
        listaPreciosId: parseInt(lista_precios_id),
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        data: results,
        query: q,
        total: results.pruebas.length + results.grupos.length
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============= LISTAS DE PRECIOS =============

// GET /api/listas-precios - Obtener todas las listas
router.get('/listas-precios',
  cacheMiddleware('listas_precios:all', { ttl: 3600 }),
  async (req, res, next) => {
    try {
      const listas = await models.ListaPrecios.findAll();
      
      res.json({
        success: true,
        data: listas
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/listas-precios/:id/items - Obtener items con precios
router.get('/listas-precios/:id/items',
  cacheMiddleware(req => `lista_precios:${req.params.id}:items`, { ttl: 600 }),
  async (req, res, next) => {
    try {
      const items = await models.ListaPrecios.getFullPriceList(req.params.id);
      
      res.json({
        success: true,
        data: items,
        total: items.length
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============= ÁREAS =============

// GET /api/areas - Obtener todas las áreas
router.get('/areas',
  cacheMiddleware('areas:all', { ttl: 3600 }),
  async (req, res, next) => {
    try {
      const areas = await models.Area.findAll();
      
      res.json({
        success: true,
        data: areas
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============= TIPOS DE MUESTRA =============

// GET /api/tipos-muestra - Obtener tipos de muestra
router.get('/tipos-muestra',
  cacheMiddleware('tipos_muestra:all', { ttl: 3600 }),
  async (req, res, next) => {
    try {
      const tipos = await models.TipoMuestra.findAll();
      
      res.json({
        success: true,
        data: tipos
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============= TIPOS DE CONTENEDOR =============

// GET /api/tipos-contenedor - Obtener tipos de contenedor
router.get('/tipos-contenedor',
  cacheMiddleware('tipos_contenedor:all', { ttl: 3600 }),
  async (req, res, next) => {
    try {
      const tipos = await models.TipoContenedor.findAll();
      
      res.json({
        success: true,
        data: tipos
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============= ESTADÍSTICAS =============

// GET /api/statistics - Estadísticas generales
router.get('/statistics',
  cacheMiddleware('statistics', { ttl: 600 }),
  async (req, res, next) => {
    try {
      const stats = await models.UnifiedSearch.getStatistics();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============= CACHE MANAGEMENT =============

// GET /api/cache/stats - Estadísticas de caché
router.get('/cache/stats', async (req, res) => {
  const stats = cacheManager.getStats();
  
  res.json({
    success: true,
    data: stats
  });
});

// POST /api/cache/invalidate - Invalidar caché
router.post('/cache/invalidate', async (req, res) => {
  const { pattern } = req.body;
  
  if (!pattern) {
    return res.status(400).json({
      success: false,
      error: 'Pattern es requerido'
    });
  }

  const deleted = cacheManager.invalidate(pattern);
  
  res.json({
    success: true,
    message: `${deleted} keys invalidadas`,
    pattern
  });
});

// POST /api/cache/flush - Limpiar todo el caché
router.post('/cache/flush', async (req, res) => {
  cacheManager.flush();
  
  res.json({
    success: true,
    message: 'Caché limpiado completamente'
  });
});

// POST /api/cache/warm-up - Pre-calentar caché
router.post('/cache/warm-up', async (req, res) => {
  await cacheManager.warmUp(models);
  
  res.json({
    success: true,
    message: 'Caché pre-calentado'
  });
});

// ============= HEALTH CHECK =============

// GET /api/health - Health check del API
router.get('/health', async (req, res) => {
  try {
    const dbHealth = await require('../config/database.js').default.healthCheck();
    const cacheStats = cacheManager.getStats();
    
    res.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: dbHealth,
      cache: {
        hitRate: cacheStats.hitRate,
        keys: cacheStats.keys
      }
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      error: error.message
    });
  }
});

// Error handler middleware
router.use((error, req, res, next) => {
  console.error('API Error:', error);
  
  // Si la base de datos no está disponible, intentar fallback
  if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
    res.status(503).json({
      success: false,
      error: 'Base de datos no disponible',
      fallback: true,
      message: 'Usando datos en caché cuando sea posible'
    });
  } else {
    res.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor'
    });
  }
});

export default router;