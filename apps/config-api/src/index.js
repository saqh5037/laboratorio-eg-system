// CRÍTICO: Validar variables de entorno ANTES de importar cualquier cosa
// Si faltan variables requeridas, el servidor NO arrancará (fail-fast)
const config = require('./config/env');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');

const logger = require('./utils/logger');
const { testConnection } = require('./config/database');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Routes
const authRoutes = require('./routes/auth.routes');
const configRoutes = require('./routes/config.routes');
const auditRoutes = require('./routes/audit.routes');
const carouselRoutes = require('./routes/carousel.routes');
const themeRoutes = require('./routes/theme.routes');
const landingRoutes = require('./routes/landing.routes');
const landingSectionsRoutes = require('./routes/landingSections.routes');
const companyRoutes = require('./routes/company.routes');
const navigationRoutes = require('./routes/navigation.routes');
const pwaRoutes = require('./routes/pwa.routes');
const backupRoutes = require('./routes/backup.routes');
const laboratoriesRoutes = require('./routes/laboratories.routes');

const app = express();
const PORT = config.port;

// ========================================
// MIDDLEWARE
// ========================================

// Security headers - Configurar CSP para permitir imágenes cross-origin
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "img-src": ["'self'", "data:", "http:", "https:"],
    },
  },
}));

// CORS - Usar configuración validada
app.use(cors({
  origin: config.cors.origins,
  credentials: true
}));

// Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir archivos estáticos de uploads con CORS
const path = require('path');
app.use('/uploads', cors({
  origin: config.cors.origins,
  credentials: true
}), express.static(path.join(__dirname, '../uploads')));

// Rate limiting - Configuración más permisiva para desarrollo
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 1 * 60 * 1000, // 1 minuto
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 300, // 300 requests por minuto
  message: {
    error: 'Demasiadas peticiones',
    message: 'Por favor intenta de nuevo más tarde'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip rate limiting para GET requests en desarrollo
  skip: (req) => {
    if (process.env.NODE_ENV === 'development' && req.method === 'GET') {
      return true;
    }
    return false;
  }
});

app.use('/api/', limiter);

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    user_agent: req.get('user-agent')
  });
  next();
});

// ========================================
// ROUTES
// ========================================

// Health check
app.get('/health', async (req, res) => {
  try {
    const startTime = Date.now();

    // Check database connection
    const dbPool = require('./config/database').pool;
    let dbHealth = {
      status: 'error',
      latency: null,
      version: null
    };

    try {
      const dbStartTime = Date.now();
      const dbResult = await dbPool.query('SELECT version(), current_database()');
      const dbLatency = Date.now() - dbStartTime;

      dbHealth = {
        status: 'ok',
        latency: `${dbLatency}ms`,
        version: dbResult.rows[0].version,
        database: dbResult.rows[0].current_database
      };
    } catch (dbError) {
      dbHealth.error = dbError.message;
    }

    // Get cache stats
    const cacheService = require('./services/CacheService');
    const cacheStats = cacheService.getStats();
    const cacheKeys = cacheService.keys();

    // Calculate uptime
    const uptime = process.uptime();
    const uptimeFormatted = `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`;

    // Memory usage
    const memUsage = process.memoryUsage();
    const memUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    const memTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);

    res.json({
      success: true,
      status: 'healthy',
      service: 'config-api',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: uptimeFormatted,
      checks: {
        database: dbHealth,
        cache: {
          status: 'ok',
          keys: cacheKeys.length,
          hits: cacheStats.hits || 0,
          misses: cacheStats.misses || 0,
          hitRate: cacheStats.hits && cacheStats.misses
            ? `${Math.round((cacheStats.hits / (cacheStats.hits + cacheStats.misses)) * 100)}%`
            : 'N/A'
        },
        memory: {
          status: memUsedMB < memTotalMB * 0.9 ? 'ok' : 'warning',
          used: `${memUsedMB}MB`,
          total: `${memTotalMB}MB`,
          percentage: `${Math.round((memUsedMB / memTotalMB) * 100)}%`
        }
      }
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      service: 'config-api',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/config', configRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/carousel', carouselRoutes);
app.use('/api/theme', themeRoutes);
app.use('/api/landing', landingRoutes);
app.use('/api/landing/sections', landingSectionsRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/navigation', navigationRoutes);
app.use('/api/pwa', pwaRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/laboratories', laboratoriesRoutes);

// Root
app.get('/', (req, res) => {
  res.json({
    message: 'Config API - Sistema de Configuración Centralizada',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      auth: {
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
        changePassword: 'POST /api/auth/change-password',
        validateToken: 'POST /api/auth/validate-token'
      },
      config: {
        getAll: 'GET /api/config',
        getByKey: 'GET /api/config/:key',
        getGrouped: 'GET /api/config/grouped',
        getAuthMethods: 'GET /api/config/auth-methods',
        create: 'POST /api/config',
        update: 'PUT /api/config/:key',
        delete: 'DELETE /api/config/:key',
        invalidateCache: 'POST /api/config/cache/invalidate',
        cacheStats: 'GET /api/config/cache/stats'
      },
      audit: {
        getAll: 'GET /api/audit',
        getRecent: 'GET /api/audit/recent',
        getByKey: 'GET /api/audit/by-key/:key',
        getByUser: 'GET /api/audit/by-user/:username',
        getStats: 'GET /api/audit/stats'
      },
      carousel: {
        getActive: 'GET /api/carousel',
        getAll: 'GET /api/carousel?include_inactive=true',
        getById: 'GET /api/carousel/:id',
        getStats: 'GET /api/carousel/stats',
        create: 'POST /api/carousel',
        update: 'PUT /api/carousel/:id',
        delete: 'DELETE /api/carousel/:id',
        toggle: 'POST /api/carousel/:id/toggle',
        reorder: 'POST /api/carousel/:id/reorder',
        upload: 'POST /api/carousel/upload',
        listFiles: 'GET /api/carousel/uploads/list',
        uploadStats: 'GET /api/carousel/uploads/stats'
      },
      theme: {
        get: 'GET /api/theme',
        getColors: 'GET /api/theme/colors',
        getPreview: 'GET /api/theme/preview',
        update: 'PUT /api/theme',
        updateColors: 'PATCH /api/theme/colors',
        reset: 'POST /api/theme/reset'
      },
      landing: {
        getAll: 'GET /api/landing',
        values: 'GET /api/landing/values',
        certifications: 'GET /api/landing/certifications',
        testimonials: 'GET /api/landing/testimonials',
        contact: 'GET /api/landing/contact',
        content: 'GET /api/landing/content',
        statistics: 'GET /api/landing/statistics',
        adminCRUD: 'POST/PUT/DELETE /api/landing/{resource}/:id'
      },
      company: {
        getAll: 'GET /api/company',
        getContact: 'GET /api/company/contact',
        getSEO: 'GET /api/company/seo',
        getPWA: 'GET /api/company/pwa',
        update: 'PUT /api/company',
        updateIdentity: 'PATCH /api/company/identity',
        updateContact: 'PATCH /api/company/contact',
        updateSocial: 'PATCH /api/company/social',
        updateSEO: 'PATCH /api/company/seo',
        updatePWA: 'PATCH /api/company/pwa',
        invalidateCache: 'POST /api/company/cache/invalidate'
      },
      laboratories: {
        list: 'GET /api/laboratories',
        current: 'GET /api/laboratories/current',
        getByCode: 'GET /api/laboratories/:code',
        switch: 'POST /api/laboratories/switch',
        poolStats: 'GET /api/laboratories/stats/pools'
      }
    }
  });
});

// ========================================
// ERROR HANDLERS
// ========================================

// 404 handler
app.use(notFoundHandler);

// Error handler global
app.use(errorHandler);

// ========================================
// START SERVER
// ========================================

async function startServer() {
  try {
    // Verificar conexión a base de datos
    logger.info('Verificando conexión a PostgreSQL...');
    await testConnection();

    // Iniciar servidor
    app.listen(PORT, () => {
      logger.info(`🚀 Config API escuchando en puerto ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`CORS origins: ${config.cors.origins.join(', ')}`);
      logger.info('');
      logger.info('Endpoints disponibles:');
      logger.info(`  - Health check: http://localhost:${PORT}/health`);
      logger.info(`  - API docs: http://localhost:${PORT}/`);
      logger.info(`  - Auth: http://localhost:${PORT}/api/auth`);
      logger.info(`  - Config: http://localhost:${PORT}/api/config`);
      logger.info(`  - Audit: http://localhost:${PORT}/api/audit`);
      logger.info(`  - Carousel: http://localhost:${PORT}/api/carousel`);
      logger.info(`  - Theme: http://localhost:${PORT}/api/theme`);
      logger.info(`  - Landing: http://localhost:${PORT}/api/landing`);
      logger.info(`  - Company: http://localhost:${PORT}/api/company`);
      logger.info(`  - Navigation: http://localhost:${PORT}/api/navigation`);
      logger.info(`  - Laboratories: http://localhost:${PORT}/api/laboratories`);
      logger.info('');
      logger.info('Usuario por defecto: admin / admin123 (CAMBIAR EN PRODUCCIÓN)');
    });
  } catch (error) {
    logger.error('Error fatal al iniciar servidor:', error);
    process.exit(1);
  }
}

// Manejo de señales de terminación
process.on('SIGTERM', () => {
  logger.info('SIGTERM recibido, cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT recibido, cerrando servidor...');
  process.exit(0);
});

// Iniciar
startServer();
