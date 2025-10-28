const winston = require('winston');
const path = require('path');
const fs = require('fs');
const config = require('../config/config');

// Crear directorio de logs si no existe
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Formato personalizado
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;

    // Agregar metadata si existe
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }

    // Agregar stack trace si existe
    if (stack) {
      log += `\n${stack}`;
    }

    return log;
  })
);

// Crear logger
const logger = winston.createLogger({
  level: config.logLevel,
  format: customFormat,
  transports: [
    // Archivo de logs combinados
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),

    // Archivo solo de errores
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880,
      maxFiles: 5
    })
  ]
});

// En desarrollo, también loguear a consola con colores
if (config.isDevelopment()) {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Helper methods para logging específico del bot
logger.bot = {
  /**
   * Log de mensaje recibido
   */
  messageReceived(platform, userId, messageType, text = '') {
    logger.info(`📩 [${platform.toUpperCase()}] Message received from ${userId}`, {
      platform,
      userId,
      messageType,
      textPreview: text.substring(0, 50)
    });
  },

  /**
   * Log de mensaje enviado
   */
  messageSent(platform, userId, messageType) {
    logger.info(`📤 [${platform.toUpperCase()}] Message sent to ${userId}`, {
      platform,
      userId,
      messageType
    });
  },

  /**
   * Log de comando ejecutado
   */
  commandExecuted(platform, userId, command) {
    logger.info(`⚡ [${platform.toUpperCase()}] Command executed: ${command}`, {
      platform,
      userId,
      command
    });
  },

  /**
   * Log de llamada a Gemini AI
   */
  geminiCall(userId, prompt, tokensUsed = 0) {
    logger.info(`🧠 Gemini API call for user ${userId}`, {
      userId,
      promptLength: prompt.length,
      tokensUsed
    });
  },

  /**
   * Log de creación de presupuesto
   */
  presupuestoCreated(presupuestoNumber, userId) {
    logger.info(`💰 Presupuesto created: ${presupuestoNumber}`, {
      presupuestoNumber,
      userId
    });
  },

  /**
   * Log de creación de cita
   */
  citaCreated(citaNumber, userId) {
    logger.info(`📅 Cita created: ${citaNumber}`, {
      citaNumber,
      userId
    });
  },

  /**
   * Log de error del bot
   */
  error(context, error, metadata = {}) {
    logger.error(`❌ ${context}: ${error.message}`, {
      context,
      error: error.message,
      stack: error.stack,
      ...metadata
    });
  },

  /**
   * Log de inicio del bot
   */
  started(platform) {
    logger.info(`🚀 ${platform.toUpperCase()} bot started successfully`, {
      platform
    });
  },

  /**
   * Log de parada del bot
   */
  stopped(platform) {
    logger.info(`🛑 ${platform.toUpperCase()} bot stopped`, {
      platform
    });
  }
};

module.exports = logger;
