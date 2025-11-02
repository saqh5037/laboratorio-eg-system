// Servidor Express con PostgreSQL para Laboratorio EG
// Incluye seguridad, caché, retry logic y manejo de errores

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Importar configuraciones y rutas
import db from './config/database.js';
import apiRoutes from './routes/api.js';
import cacheManager from './middleware/cache.js';
import models from './models/index.js';
import pgListener from './config/pg-listener.js';

// Configurar variables de entorno
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crear aplicación Express
const app = express();
const PORT = process.env.API_PORT || 3001;

// ============= MIDDLEWARES =============

// Seguridad con Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuración - Permitir acceso desde la red local
const corsOptions = {
  origin: function (origin, callback) {
    // En desarrollo, permitir cualquier origen de red local
    if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
      // Permitir requests sin origin y cualquier IP local
      const allowedPatterns = [
        /^http:\/\/localhost(:\d+)?$/,
        /^http:\/\/127\.0\.0\.1(:\d+)?$/,
        /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/,
        /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/,
        /^http:\/\/172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}(:\d+)?$/
      ];
      
      if (!origin || allowedPatterns.some(pattern => pattern.test(origin))) {
        callback(null, true);
      } else {
        callback(null, true); // En desarrollo, permitir todo
      }
    } else {
      // En producción, usar lista estricta
      // Parsear CORS_ORIGIN como lista separada por comas
      const corsOriginEnv = process.env.CORS_ORIGIN || '';
      const corsOriginsList = corsOriginEnv.split(',').map(o => o.trim()).filter(Boolean);

      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:3000',
        ...corsOriginsList
      ].filter(Boolean);

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Cache', 'X-Cache-Key', 'X-Cache-TTL']
};

app.use(cors(corsOptions));

// Compresión de respuestas
app.use(compression());

// Parser de JSON y URL-encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging con Morgan
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Servir archivos estáticos (para fallback data)
app.use('/static', express.static(path.join(__dirname, 'data')));

// ============= RATE LIMITING =============

// Rate limiting simple (sin redis)
const rateLimitMap = new Map();

const rateLimit = (windowMs = 60000, max = 100) => {
  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    
    if (!rateLimitMap.has(key)) {
      rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    const limit = rateLimitMap.get(key);
    
    if (now > limit.resetTime) {
      limit.count = 1;
      limit.resetTime = now + windowMs;
      return next();
    }
    
    if (limit.count >= max) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests, please try again later'
      });
    }
    
    limit.count++;
    next();
  };
};

// Aplicar rate limiting a API
app.use('/api', rateLimit(60000, 100)); // 100 requests por minuto

// ============= ROUTES =============

// Health check rápido
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Laboratorio EG API Server',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api', apiRoutes);

// ============= ERROR HANDLING =============

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  
  // CORS error
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      error: 'CORS policy violation'
    });
  }
  
  // Database connection error
  if (err.code === 'ECONNREFUSED') {
    return res.status(503).json({
      success: false,
      error: 'Database connection failed',
      message: 'The service is temporarily unavailable'
    });
  }
  
  // Validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation error',
      details: err.details
    });
  }
  
  // Default error
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============= SERVER INITIALIZATION =============

// Función para inicializar el servidor
async function startServer() {
  try {
    console.log('🚀 Starting Laboratorio EG API Server...');
    
    // Inicializar conexión a la base de datos
    console.log('📊 Connecting to PostgreSQL database...');
    await db.initialize();
    
    // Pre-calentar caché con datos comunes
    console.log('🔥 Warming up cache...');
    await cacheManager.warmUp(models);

    // Iniciar listener de PostgreSQL para invalidación automática de caché
    await pgListener.connect();

    // Iniciar servidor
    const server = app.listen(PORT, () => {
      console.log(`
═══════════════════════════════════════════════════
   🏥 Laboratorio EG API Server
═══════════════════════════════════════════════════
   🌍 Environment: ${process.env.NODE_ENV || 'development'}
   🚀 Server running on: http://localhost:${PORT}
   📊 Database: ${process.env.DB_NAME}@${process.env.DB_HOST}:${process.env.DB_PORT}
   💾 Cache enabled: Yes
   🔒 CORS origin: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}
   ⏰ Started at: ${new Date().toLocaleString()}
═══════════════════════════════════════════════════
      `);
    });
    
    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);
      
      // Cerrar servidor HTTP
      server.close(() => {
        console.log('HTTP server closed');
      });
      
      // Cerrar listener de PostgreSQL
      await pgListener.disconnect();
      console.log('PostgreSQL listener closed');

      // Cerrar conexión a base de datos
      await db.close();
      console.log('Database connection closed');

      // Limpiar caché
      cacheManager.flush();
      console.log('Cache cleared');
      
      // Salir
      process.exit(0);
    };
    
    // Manejar señales de terminación
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // Manejar errores no capturados
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('UNHANDLED_REJECTION');
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    
    // Si la base de datos no está disponible, iniciar en modo fallback
    if (error.code === 'ECONNREFUSED' || error.message.includes('database')) {
      console.log('⚠️ Starting in FALLBACK mode (database unavailable)');
      
      // Iniciar servidor sin base de datos
      app.listen(PORT, () => {
        console.log(`
═══════════════════════════════════════════════════
   🏥 Laboratorio EG API Server (FALLBACK MODE)
═══════════════════════════════════════════════════
   ⚠️  Database unavailable - using cached data only
   🚀 Server running on: http://localhost:${PORT}
   💾 Cache enabled: Yes
   🔒 CORS origin: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}
═══════════════════════════════════════════════════
        `);
      });
    } else {
      process.exit(1);
    }
  }
}

// ============= MONITORING =============

// Monitoreo de memoria
setInterval(() => {
  const memUsage = process.memoryUsage();
  const formatMemory = (bytes) => (bytes / 1024 / 1024).toFixed(2) + ' MB';
  
  if (process.env.NODE_ENV === 'development') {
    console.log('Memory Usage:', {
      rss: formatMemory(memUsage.rss),
      heapTotal: formatMemory(memUsage.heapTotal),
      heapUsed: formatMemory(memUsage.heapUsed),
      external: formatMemory(memUsage.external)
    });
  }
  
  // Alertar si el uso de memoria es muy alto
  if (memUsage.heapUsed / memUsage.heapTotal > 0.9) {
    console.warn('⚠️ High memory usage detected');
  }
}, 60000); // Cada minuto

// ============= START SERVER =============

startServer();

export default app;