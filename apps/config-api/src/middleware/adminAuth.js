const AuthService = require('../services/AuthService');
const logger = require('../utils/logger');

/**
 * Middleware para verificar autenticación de administrador
 */
function authenticateAdmin(req, res, next) {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'No autorizado',
        message: 'Token de autenticación no proporcionado'
      });
    }

    const token = authHeader.substring(7); // Remover "Bearer "

    // Verificar token
    const decoded = AuthService.verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        error: 'No autorizado',
        message: 'Token inválido o expirado'
      });
    }

    // Agregar usuario al request
    req.user = decoded;

    next();
  } catch (error) {
    logger.error('Error en middleware de autenticación:', error);
    return res.status(500).json({
      error: 'Error interno',
      message: 'Error al verificar autenticación'
    });
  }
}

/**
 * Middleware para verificar roles específicos
 * @param {Array<string>} allowedRoles - Roles permitidos
 * @returns {Function}
 */
function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'No autorizado',
        message: 'Usuario no autenticado'
      });
    }

    const hasRole = AuthService.hasRole(req.user, allowedRoles);

    if (!hasRole) {
      logger.warn(`Acceso denegado: usuario ${req.user.username} intentó acceder sin permisos (rol: ${req.user.role})`);

      return res.status(403).json({
        error: 'Prohibido',
        message: `Se requiere uno de los siguientes roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
}

/**
 * Middleware para solo super-admin
 */
const requireSuperAdmin = requireRole(['super-admin']);

/**
 * Middleware para admin o super-admin
 */
const requireAdmin = requireRole(['admin', 'super-admin']);

module.exports = {
  authenticateAdmin,
  requireRole,
  requireSuperAdmin,
  requireAdmin
};
