const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const logger = require('../../utils/logger');
const config = require('../../config/config');
const TwilioService = require('../../core/services/TwilioService');
const VerificationCodeService = require('../../core/services/VerificationCodeService');
const WhatsAppAuthorizationService = require('../../core/services/WhatsAppAuthorizationService');
const sessionService = require('../../core/services/SessionService');
const authService = require('../../core/services/AuthService');
const { labsisPool } = require('../../db/pool');

/**
 * POST /api/auth/whatsapp/request-code
 * Solicitar código de verificación por WhatsApp
 */
router.post('/request-code', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        error: 'Número de teléfono requerido'
      });
    }

    // Formatear número
    const formattedPhone = TwilioService.formatPhoneNumber(phone);

    if (!TwilioService.isValidPhone(formattedPhone)) {
      return res.status(400).json({
        success: false,
        error: 'Número de teléfono inválido'
      });
    }

    // Verificar si el usuario está autorizado en WhatsApp
    const authorization = await WhatsAppAuthorizationService.checkAuthorization(formattedPhone);

    if (!authorization.isAuthorized) {
      logger.info(`⚠️ Usuario ${formattedPhone} no autorizado - requiere autorización`);

      return res.json({
        success: true,
        requiresAuthorization: true,
        message: 'Debes autorizar WhatsApp primero'
      });
    }

    // Generar código de 6 dígitos
    const code = VerificationCodeService.generateCode();

    // Guardar en base de datos
    await VerificationCodeService.saveCode(formattedPhone, code, 'whatsapp');

    // Usar directamente template de WhatsApp (funciona siempre en sandbox)
    const templateSid = process.env.TWILIO_WHATSAPP_VERIFICATION_TEMPLATE_SID;

    if (!templateSid || templateSid === 'HX...') {
      logger.error(`❌ No hay Content Template configurado. Configura TWILIO_WHATSAPP_VERIFICATION_TEMPLATE_SID en .env`);

      return res.status(500).json({
        success: false,
        error: 'Error enviando código de verificación',
        details: 'Template de verificación no configurado'
      });
    }

    logger.info(`📱 Enviando código de verificación por WhatsApp usando template ${templateSid}`);

    // Enviar usando template pre-aprobada del sandbox
    const result = await TwilioService.sendWhatsAppTemplate(
      formattedPhone,
      templateSid,
      { '1': code } // Variable {{1}} = código de 6 dígitos
    );

    if (!result.success) {
      logger.error(`Error enviando código WhatsApp a ${formattedPhone}:`, result);

      return res.status(500).json({
        success: false,
        error: 'Error enviando código de verificación',
        details: result.error
      });
    }

    logger.info(`✅ Código enviado por WhatsApp a ${formattedPhone}`);

    res.json({
      success: true,
      expiresInMinutes: 10,
      message: 'Código enviado por WhatsApp'
    });

  } catch (error) {
    logger.error('Error en /request-code:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * POST /api/auth/whatsapp/verify-code
 * Verificar código y generar token JWT (usando SessionService como Telegram)
 */
router.post('/verify-code', async (req, res) => {
  try {
    const { phone, code } = req.body;

    if (!phone || !code) {
      return res.status(400).json({
        success: false,
        error: 'Teléfono y código requeridos'
      });
    }

    // Formatear número
    const formattedPhone = TwilioService.formatPhoneNumber(phone);

    // Validar código con VerificationCodeService
    const validation = await VerificationCodeService.validateCode(formattedPhone, code, 'whatsapp');

    if (!validation.valid) {
      let errorMessage = 'Código inválido';

      if (validation.reason === 'EXPIRED_CODE') {
        errorMessage = 'Código expirado. Solicita uno nuevo.';
      } else if (validation.reason === 'TOO_MANY_ATTEMPTS') {
        errorMessage = 'Demasiados intentos. Solicita un nuevo código.';
      }

      return res.status(400).json({
        success: false,
        error: errorMessage,
        reason: validation.reason
      });
    }

    // Buscar paciente en LABSIS usando AuthService (como Telegram)
    const paciente = await authService.findPatientByPhone(formattedPhone);

    if (!paciente) {
      logger.warn(`⚠️ No se encontró paciente con teléfono ${formattedPhone}`);

      return res.status(404).json({
        success: false,
        error: 'No se encontró un paciente con este número de teléfono'
      });
    }

    const pacienteId = paciente.id;
    logger.info(`✅ Paciente encontrado: ${paciente.nombre} ${paciente.apellido} (ID: ${pacienteId})`);

    // Actualizar/registrar usuario en twilio_user_registry
    await WhatsAppAuthorizationService.registerAuthorizedUser(formattedPhone, pacienteId);

    // Crear sesión usando SessionService (como Telegram)
    // Nota: SessionService acepta telegramChatId, pero para WhatsApp lo dejamos null
    const deviceInfo = {
      channel: 'whatsapp',
      phone: formattedPhone
    };

    const session = await sessionService.createSession({
      pacienteId: pacienteId,
      telegramChatId: null, // null para WhatsApp
      deviceInfo: deviceInfo,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'] || 'Unknown'
    });

    logger.info(`✅ Autenticación WhatsApp exitosa: ${formattedPhone} (Session ID: ${session.sessionId})`);

    // Respuesta con mismo formato que Telegram
    res.json({
      success: true,
      message: 'Autenticación exitosa',
      data: {
        token: session.token,
        expiresAt: session.expiresAt,
        pacienteId: pacienteId
      }
    });

  } catch (error) {
    logger.error('Error en /verify-code:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * POST /api/auth/whatsapp/generate-authorization-token
 * Generar token y link para autorizar WhatsApp sandbox
 */
router.post('/generate-authorization-token', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        error: 'Número de teléfono requerido'
      });
    }

    // Formatear número
    const formattedPhone = TwilioService.formatPhoneNumber(phone);

    // Generar token de autorización
    const authToken = await WhatsAppAuthorizationService.generateAuthorizationToken(formattedPhone);

    logger.info(`✅ Token de autorización generado para ${formattedPhone}`);

    res.json({
      success: true,
      whatsappLink: authToken.whatsappLink,
      sandboxCode: authToken.sandboxCode,
      token: authToken.token,
      expiresIn: authToken.expiresIn,
      expiresAt: authToken.expiresAt
    });

  } catch (error) {
    logger.error('Error en /generate-authorization-token:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

/**
 * GET /api/auth/whatsapp/check-authorization
 * Verificar si un usuario está autorizado en WhatsApp
 */
router.get('/check-authorization', async (req, res) => {
  try {
    const { phone } = req.query;

    if (!phone) {
      return res.status(400).json({
        success: false,
        error: 'Número de teléfono requerido'
      });
    }

    // Formatear número
    const formattedPhone = TwilioService.formatPhoneNumber(phone);

    // Verificar autorización
    const authorization = await WhatsAppAuthorizationService.checkAuthorization(formattedPhone);

    res.json({
      success: true,
      isAuthorized: authorization.isAuthorized,
      phoneNumber: authorization.phoneNumber || null
    });

  } catch (error) {
    logger.error('Error en /check-authorization:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;
