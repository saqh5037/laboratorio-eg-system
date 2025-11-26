/**
 * Environment Variables Validation para Config API
 *
 * CRÍTICO: Este archivo valida que TODAS las variables de entorno
 * requeridas estén presentes ANTES de iniciar el servidor.
 *
 * Si falta alguna variable requerida, el servidor NO arrancará (fail-fast).
 * Esto previene errores en runtime por configuración incorrecta.
 */

require('dotenv-safe').config({
  allowEmptyValues: false,
  example: '.env.example'
});

// Validar y parsear valores
const config = {
  // Server configuration
  port: parseInt(process.env.PORT, 10),
  nodeEnv: process.env.NODE_ENV,

  // Database configuration
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '20', 10),
    ssl: process.env.DB_SSL === 'true'
  },

  // CORS configuration
  cors: {
    origins: process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  },

  // Public URL (para webhooks, deep links, etc)
  publicUrl: process.env.PUBLIC_URL,

  // WebSocket configuration (opcional)
  websocket: {
    port: parseInt(process.env.WS_PORT || process.env.PORT, 10)
  }
};

// Validaciones adicionales
if (isNaN(config.port) || config.port < 1 || config.port > 65535) {
  throw new Error(`PORT debe ser un número válido entre 1 y 65535. Recibido: ${process.env.PORT}`);
}

if (isNaN(config.database.port) || config.database.port < 1 || config.database.port > 65535) {
  throw new Error(`DB_PORT debe ser un número válido entre 1 y 65535. Recibido: ${process.env.DB_PORT}`);
}

if (!['development', 'staging', 'production', 'test'].includes(config.nodeEnv)) {
  throw new Error(`NODE_ENV debe ser development, staging, production o test. Recibido: ${config.nodeEnv}`);
}

if (config.cors.origins.length === 0) {
  throw new Error('CORS_ORIGIN debe contener al menos un origen válido');
}

// Log de configuración (solo en desarrollo)
if (config.nodeEnv === 'development') {
  console.log('✅ Configuración de entorno validada correctamente');
  console.log('📍 NODE_ENV:', config.nodeEnv);
  console.log('🔌 PORT:', config.port);
  console.log('🗄️  DATABASE:', `${config.database.host}:${config.database.port}/${config.database.name}`);
  console.log('🌐 CORS Origins:', config.cors.origins);
  console.log('🔗 PUBLIC_URL:', config.publicUrl);
}

module.exports = config;
