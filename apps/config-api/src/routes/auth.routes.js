const express = require('express');
const router = express.Router();
const AuthService = require('../services/AuthService');
const { authenticateAdmin } = require('../middleware/adminAuth');
const logger = require('../utils/logger');

/**
 * POST /api/auth/login
 * Login de administrador
 */
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Validación básica
    if (!username || !password) {
      return res.status(400).json({
        error: 'Datos incompletos',
        message: 'Se requieren username y password'
      });
    }

    // Intentar login
    const result = await AuthService.login(username, password);

    if (!result) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        message: 'Usuario o contraseña incorrectos'
      });
    }

    res.json({
      message: 'Login exitoso',
      user: {
        id: result.id,
        username: result.username,
        email: result.email,
        role: result.role
      },
      token: result.token
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/auth/me
 * Obtener usuario actual autenticado
 */
router.get('/me', authenticateAdmin, async (req, res, next) => {
  try {
    const user = await AuthService.getUserById(req.user.id);

    if (!user) {
      return res.status(404).json({
        error: 'Usuario no encontrado',
        message: 'El usuario autenticado no existe'
      });
    }

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        last_login: user.last_login,
        created_at: user.created_at
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/change-password
 * Cambiar contraseña del usuario autenticado
 */
router.post('/change-password', authenticateAdmin, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validación
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Datos incompletos',
        message: 'Se requieren currentPassword y newPassword'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: 'Contraseña débil',
        message: 'La nueva contraseña debe tener al menos 6 caracteres'
      });
    }

    const success = await AuthService.changePassword(
      req.user.id,
      currentPassword,
      newPassword
    );

    if (!success) {
      return res.status(400).json({
        error: 'Contraseña actual incorrecta',
        message: 'La contraseña actual no es válida'
      });
    }

    res.json({
      message: 'Contraseña cambiada exitosamente'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/validate-token
 * Validar si un token es válido (útil para frontend)
 */
router.post('/validate-token', (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: 'Token no proporcionado',
        message: 'Se requiere token en el body'
      });
    }

    const decoded = AuthService.verifyToken(token);

    if (!decoded) {
      return res.json({
        valid: false,
        message: 'Token inválido o expirado'
      });
    }

    res.json({
      valid: true,
      user: {
        id: decoded.id,
        username: decoded.username,
        role: decoded.role
      }
    });
  } catch (error) {
    res.status(500).json({
      valid: false,
      error: 'Error al validar token'
    });
  }
});

module.exports = router;
