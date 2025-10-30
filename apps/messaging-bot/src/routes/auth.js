const express = require('express');
const router = express.Router();
const AuthService = require('../core/services/AuthService');
const SessionService = require('../core/services/SessionService');
const NotificationService = require('../core/services/NotificationService');
const AuthorizationTokenService = require('../core/services/AuthorizationTokenService');
const logger = require('../utils/logger');

/**
 * POST /api/auth/request-code
 * Solicitar código de autenticación
 *
 * Body:
 * {
 *   "phone": "0412-1234567"
 * }
 */
router.post('/request-code', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        error: 'El teléfono es requerido'
      });
    }

    // Validar formato de teléfono
    const phoneValidation = AuthService.validateVenezuelanPhone(phone);

    if (!phoneValidation.valid) {
      return res.status(400).json({
        success: false,
        error: phoneValidation.error
      });
    }

    // Buscar paciente por teléfono
    const paciente = await AuthService.findPatientByPhone(phoneValidation.formatted);

    if (!paciente) {
      return res.status(404).json({
        success: false,
        error: 'No se encontró ningún paciente con este número de teléfono'
      });
    }

    // VERIFICAR SI EL PACIENTE YA AUTORIZÓ LA COMUNICACIÓN POR TELEGRAM
    const chatId = await NotificationService.findPatientChatId(
      paciente.id,
      phoneValidation.formatted
    );

    if (!chatId) {
      // El paciente NO ha autorizado la comunicación
      logger.warn(`⚠️  Paciente ${paciente.id} no ha autorizado Telegram`);
      return res.status(403).json({
        success: false,
        requiresAuthorization: true,
        error: 'Primero debe autorizar la comunicación por Telegram',
        message: 'Para recibir códigos de autenticación por Telegram, primero debe autorizar la comunicación con el bot.'
      });
    }

    // Crear código de autenticación
    const authCode = await AuthService.createAuthCode({
      pacienteId: paciente.id,
      phone: phoneValidation.formatted,
      telegramChatId: null, // Se llenará cuando el usuario responda por Telegram
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent')
    });

    // Enviar código por Telegram
    const codeSent = await NotificationService.sendAuthCode(
      paciente.id,
      authCode.code,
      phoneValidation.formatted
    );

    logger.info(`📱 Código de autenticación solicitado para ${paciente.nombre} ${paciente.apellido}`);

    res.json({
      success: true,
      message: 'Código de autenticación enviado por Telegram',
      data: {
        pacienteId: paciente.id,
        expiresAt: authCode.expiresAt,
        expiresInMinutes: AuthService.CODE_EXPIRATION_MINUTES
      }
    });

  } catch (error) {
    logger.error('Error en request-code:', error);
    res.status(500).json({
      success: false,
      error: 'Error al procesar la solicitud'
    });
  }
});

/**
 * POST /api/auth/verify-code
 * Verificar código ingresado por el usuario
 *
 * Body:
 * {
 *   "phone": "0412-1234567",
 *   "code": "123456"
 * }
 */
router.post('/verify-code', async (req, res) => {
  try {
    const { phone, code } = req.body;

    if (!phone || !code) {
      return res.status(400).json({
        success: false,
        error: 'El teléfono y código son requeridos'
      });
    }

    // Validar formato de código
    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({
        success: false,
        error: 'El código debe tener 6 dígitos'
      });
    }

    // Validar teléfono
    const phoneValidation = AuthService.validateVenezuelanPhone(phone);
    if (!phoneValidation.valid) {
      return res.status(400).json({
        success: false,
        error: phoneValidation.error
      });
    }

    // Verificar código
    const verification = await AuthService.verifyCode(phoneValidation.formatted, code);

    if (!verification.valid) {
      // Incrementar intento fallido
      await AuthService.incrementAttempt(phoneValidation.formatted, code);

      return res.status(401).json({
        success: false,
        error: verification.error
      });
    }

    // Crear sesión con token JWT
    const session = await SessionService.createSession({
      pacienteId: verification.pacienteId,
      telegramChatId: null,
      deviceInfo: {
        userAgent: req.get('user-agent'),
        platform: 'web',
        source: 'telegram_auth'
      },
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent')
    });

    logger.info(`✅ Usuario autenticado: ${verification.pacienteId}`);

    res.json({
      success: true,
      message: 'Autenticación exitosa',
      data: {
        token: session.token,
        expiresAt: session.expiresAt,
        pacienteId: verification.pacienteId
      }
    });

  } catch (error) {
    logger.error('Error en verify-code:', error);
    res.status(500).json({
      success: false,
      error: 'Error al verificar el código'
    });
  }
});

/**
 * POST /api/auth/validate-token
 * Validar token de sesión
 *
 * Headers:
 * Authorization: Bearer <token>
 */
router.post('/validate-token', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token no proporcionado'
      });
    }

    const token = authHeader.substring(7); // Remover "Bearer "

    // Validar token
    const validation = await SessionService.validateToken(token);

    if (!validation.valid) {
      return res.status(401).json({
        success: false,
        error: validation.error
      });
    }

    res.json({
      success: true,
      message: 'Token válido',
      data: {
        pacienteId: validation.pacienteId,
        sessionId: validation.sessionId
      }
    });

  } catch (error) {
    logger.error('Error en validate-token:', error);
    res.status(500).json({
      success: false,
      error: 'Error al validar el token'
    });
  }
});

/**
 * POST /api/auth/logout
 * Cerrar sesión (revocar token)
 *
 * Headers:
 * Authorization: Bearer <token>
 */
router.post('/logout', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token no proporcionado'
      });
    }

    const token = authHeader.substring(7);

    // Validar y obtener sesión
    const validation = await SessionService.validateToken(token);

    if (!validation.valid) {
      return res.status(401).json({
        success: false,
        error: 'Token inválido'
      });
    }

    // Revocar sesión
    await SessionService.revokeSession(validation.sessionId, 'Logout manual');

    logger.info(`🔓 Sesión cerrada: ${validation.sessionId}`);

    res.json({
      success: true,
      message: 'Sesión cerrada exitosamente'
    });

  } catch (error) {
    logger.error('Error en logout:', error);
    res.status(500).json({
      success: false,
      error: 'Error al cerrar sesión'
    });
  }
});

/**
 * GET /api/auth/me
 * Obtener datos del paciente autenticado
 *
 * Headers:
 * Authorization: Bearer <token>
 */
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token no proporcionado'
      });
    }

    const token = authHeader.substring(7);

    // Validar token
    const validation = await SessionService.validateToken(token);

    if (!validation.valid) {
      return res.status(401).json({
        success: false,
        error: validation.error
      });
    }

    // Obtener datos del paciente
    const paciente = await AuthService.findPatientById(validation.pacienteId);

    if (!paciente) {
      return res.status(404).json({
        success: false,
        error: 'Paciente no encontrado'
      });
    }

    res.json({
      success: true,
      data: {
        paciente: {
          id: paciente.id,
          nombre: paciente.nombre,
          apellido: paciente.apellido,
          ci_paciente: paciente.ci_paciente,
          telefono: paciente.telefono,
          email: paciente.email
        }
      }
    });

  } catch (error) {
    logger.error('Error en /me:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener datos del paciente'
    });
  }
});

/**
 * GET /api/auth/sessions
 * Obtener sesiones activas del paciente
 *
 * Headers:
 * Authorization: Bearer <token>
 */
router.get('/sessions', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token no proporcionado'
      });
    }

    const token = authHeader.substring(7);

    // Validar token
    const validation = await SessionService.validateToken(token);

    if (!validation.valid) {
      return res.status(401).json({
        success: false,
        error: validation.error
      });
    }

    // Obtener sesiones activas
    const sessions = await SessionService.getActiveSessions(validation.pacienteId);

    res.json({
      success: true,
      data: {
        sessions: sessions.map(s => ({
          id: s.id,
          deviceInfo: s.device_info,
          createdAt: s.created_at,
          lastActivity: s.last_activity,
          expiresAt: s.expires_at,
          ipAddress: s.ip_address
        }))
      }
    });

  } catch (error) {
    logger.error('Error en sessions:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener sesiones'
    });
  }
});

/**
 * GET /api/auth/stats
 * Obtener estadísticas de autenticación
 * (Solo para administradores - TODO: agregar middleware de autenticación admin)
 */
router.get('/stats', async (req, res) => {
  try {
    const sessionStats = await SessionService.getSessionStats();
    const notificationStats = await NotificationService.getNotificationStats();

    res.json({
      success: true,
      data: {
        sessions: sessionStats,
        notifications: notificationStats
      }
    });

  } catch (error) {
    logger.error('Error en stats:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener estadísticas'
    });
  }
});

/**
 * POST /api/auth/telegram/generate-authorization-token
 * Generar token de autorización para Telegram
 *
 * Body:
 * {
 *   "phone": "+525516867745"
 * }
 */
router.post('/telegram/generate-authorization-token', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        error: 'El teléfono es requerido'
      });
    }

    // Validar formato de teléfono
    const phoneValidation = AuthService.validateVenezuelanPhone(phone);

    if (!phoneValidation.valid) {
      return res.status(400).json({
        success: false,
        error: phoneValidation.error
      });
    }

    // Buscar paciente por teléfono
    const paciente = await AuthService.findPatientByPhone(phoneValidation.formatted);

    if (!paciente) {
      return res.status(404).json({
        success: false,
        error: 'No se encontró ningún paciente con este número de teléfono'
      });
    }

    // Verificar si ya tiene un token pendiente
    const pendingToken = await AuthorizationTokenService.checkPendingToken(paciente.id);

    if (pendingToken.hasToken) {
      logger.info(`🔑 Token pendiente reutilizado para paciente ${paciente.id}`);
      return res.json({
        success: true,
        requiresAuthorization: true,
        telegramLink: pendingToken.deepLink,
        token: pendingToken.token,
        expiresAt: pendingToken.expiresAt,
        expiresIn: Math.floor((new Date(pendingToken.expiresAt) - new Date()) / 1000)
      });
    }

    // Generar nuevo token
    const tokenData = await AuthorizationTokenService.generateToken(
      paciente.id,
      phoneValidation.formatted
    );

    res.json({
      success: true,
      requiresAuthorization: true,
      telegramLink: tokenData.deepLink,
      token: tokenData.token,
      expiresIn: tokenData.expiresIn,
      expiresAt: tokenData.expiresAt
    });

  } catch (error) {
    logger.error('Error generando token de autorización:', error);
    res.status(500).json({
      success: false,
      error: 'Error al generar token de autorización'
    });
  }
});

/**
 * GET /api/auth/telegram/check-authorization
 * Verificar si un paciente ya autorizó la comunicación por Telegram
 *
 * Query params:
 * - phone: +525516867745
 */
router.get('/telegram/check-authorization', async (req, res) => {
  try {
    const { phone } = req.query;

    if (!phone) {
      return res.status(400).json({
        success: false,
        error: 'El teléfono es requerido'
      });
    }

    // Validar formato de teléfono
    const phoneValidation = AuthService.validateVenezuelanPhone(phone);

    if (!phoneValidation.valid) {
      return res.status(400).json({
        success: false,
        error: phoneValidation.error
      });
    }

    // Buscar paciente por teléfono
    const paciente = await AuthService.findPatientByPhone(phoneValidation.formatted);

    if (!paciente) {
      return res.status(404).json({
        success: false,
        error: 'No se encontró ningún paciente con este número de teléfono'
      });
    }

    // Verificar si tiene chat_id registrado
    const chatId = await NotificationService.findPatientChatId(
      paciente.id,
      phoneValidation.formatted
    );

    res.json({
      success: true,
      isAuthorized: !!chatId,
      chatId: chatId || null
    });

  } catch (error) {
    logger.error('Error verificando autorización:', error);
    res.status(500).json({
      success: false,
      error: 'Error al verificar autorización'
    });
  }
});

module.exports = router;
