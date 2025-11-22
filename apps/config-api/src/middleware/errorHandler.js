const logger = require('../utils/logger');

/**
 * Middleware global de manejo de errores
 */
function errorHandler(err, req, res, next) {
  // Log del error
  logger.error('Error en request:', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    path: req.path,
    body: req.body,
    user: req.user ? req.user.username : 'anónimo'
  });

  // Errores de validación de PostgreSQL
  if (err.code && err.code.startsWith('23')) {
    if (err.code === '23505') {
      // Unique violation
      return res.status(400).json({
        error: 'Conflicto',
        message: 'Ya existe un registro con esos datos',
        detail: err.detail
      });
    }

    if (err.code === '23503') {
      // Foreign key violation
      return res.status(400).json({
        error: 'Referencia inválida',
        message: 'El registro referenciado no existe'
      });
    }
  }

  // Errores de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'No autorizado',
      message: 'Token JWT inválido'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'No autorizado',
      message: 'Token JWT expirado'
    });
  }

  // Error genérico
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  res.status(statusCode).json({
    error: 'Error',
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
}

/**
 * Middleware para rutas no encontradas (404)
 */
function notFoundHandler(req, res, next) {
  res.status(404).json({
    error: 'No encontrado',
    message: `Ruta ${req.method} ${req.path} no encontrada`
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};
