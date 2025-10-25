/**
 * Servidor HTTP Express
 * Sirve el JSON de precios y API endpoints
 */

import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/api.js';
import config from '../config.js';
import logger from '../utils/logger.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.http(`${req.method} ${req.path}`, {
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip
    });
  });

  next();
});

// Routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'laboratorio-eg-sync-service',
    version: '1.0.0'
  });
});

// Root
app.get('/', (req, res) => {
  res.json({
    service: 'Laboratorio EG - Sistema de Sincronización',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      precios: '/api/precios.json',
      stats: '/api/stats',
      sync: '/api/sync (POST)'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    path: req.path
  });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Error en servidor HTTP:', {
    error: err.message,
    path: req.path,
    method: req.method
  });

  res.status(500).json({
    error: 'Error interno del servidor',
    message: config.app.env === 'development' ? err.message : undefined
  });
});

/**
 * Iniciar servidor HTTP
 * @returns {Promise<Object>} - Servidor iniciado
 */
export const startServer = () => {
  return new Promise((resolve, reject) => {
    const server = app.listen(config.http.port, () => {
      logger.info(`🌐 Servidor HTTP iniciado`, {
        port: config.http.port,
        url: `http://localhost:${config.http.port}`
      });

      resolve(server);
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`❌ Puerto ${config.http.port} ya está en uso`);
      } else {
        logger.error('❌ Error al iniciar servidor:', { error: error.message });
      }
      reject(error);
    });
  });
};

export default app;
