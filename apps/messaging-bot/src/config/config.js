require('dotenv').config();

/**
 * Configuración centralizada del servicio
 * Todas las variables de entorno accesibles desde un solo lugar
 */
const config = {
  // Server
  port: parseInt(process.env.PORT) || 3004,
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',

  // Database
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'labsisEG',
    user: process.env.DB_USER || 'labsis',
    password: process.env.DB_PASSWORD || 'labsis',
    ssl: process.env.DB_SSL === 'true',
    poolMin: parseInt(process.env.DB_POOL_MIN) || 2,
    poolMax: parseInt(process.env.DB_POOL_MAX) || 10
  },

  // Telegram
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    enabled: process.env.TELEGRAM_ENABLED === 'true',
    webhookUrl: process.env.TELEGRAM_WEBHOOK_URL || ''
  },

  // WhatsApp (futuro)
  whatsapp: {
    enabled: process.env.WHATSAPP_ENABLED === 'true',
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || '',
    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || ''
  },

  // Gemini AI
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp',
    maxRequestsPerMinute: parseInt(process.env.GEMINI_MAX_REQUESTS_PER_MINUTE) || 8,
    maxTokensPerRequest: parseInt(process.env.GEMINI_MAX_TOKENS_PER_REQUEST) || 8000
  },

  // Security
  security: {
    jwtSecret: process.env.JWT_SECRET || 'messaging_bot_secret_change_me',
    jwtExpiration: process.env.JWT_EXPIRATION || '24h',
    corsOrigin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173']
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  },

  // Conversation
  conversation: {
    timeoutMs: parseInt(process.env.CONVERSATION_TIMEOUT_MS) || 600000,
    maxContextMessages: parseInt(process.env.MAX_CONTEXT_MESSAGES) || 10
  },

  // Laboratory Information
  laboratory: {
    name: process.env.LAB_NAME || 'Laboratorio EG',
    fullName: process.env.LAB_FULL_NAME || 'Laboratorio Elizabeth Gutiérrez',
    address: process.env.LAB_ADDRESS || 'Av. Libertador, Edf. Majestic, Piso 1, Consultorio 18, La Campiña, Caracas 1050, Venezuela',
    phone1: process.env.LAB_PHONE_1 || '+58 212 762.0561',
    phone2: process.env.LAB_PHONE_2 || '+58 212 763.5909',
    phone3: process.env.LAB_PHONE_3 || '+58 212 763.6628',
    email: process.env.LAB_EMAIL || 'info@laboratorioeg.com',
    website: process.env.LAB_WEBSITE || 'https://laboratorioeg.com',
    social: process.env.LAB_SOCIAL || '@laboratorioeg',

    // Horarios
    hoursWeekday: process.env.LAB_HOURS_WEEKDAY || 'Lunes a Viernes: 7:00 AM - 4:00 PM',
    hoursSaturday: process.env.LAB_HOURS_SATURDAY || 'Sábado: 8:00 AM - 12:00 PM',
    hoursSunday: process.env.LAB_HOURS_SUNDAY || 'Domingo: Cerrado',

    // Servicios especiales
    servicioDomicilio: process.env.LAB_SERVICIO_DOMICILIO === 'true',
    servicioDomicilioInfo: process.env.LAB_SERVICIO_DOMICILIO_INFO || 'Servicio de toma de muestras a domicilio disponible',

    // Historia
    foundedYear: parseInt(process.env.LAB_FOUNDED_YEAR) || 1982,
    yearsExperience: parseInt(process.env.LAB_YEARS_EXPERIENCE) || 43,
    history: process.env.LAB_HISTORY || 'Desde 1982, sinónimo de confianza y compromiso en Caracas.',

    // GPS
    gpsLat: parseFloat(process.env.LAB_GPS_LAT) || 10.4959,
    gpsLon: parseFloat(process.env.LAB_GPS_LON) || -66.8531
  },

  // Frontend
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:5173',
    dashboardPath: process.env.ADMIN_DASHBOARD_PATH || '/admin/telegram'
  },

  // Feature Flags
  features: {
    aiResponses: process.env.ENABLE_AI_RESPONSES !== 'false',
    presupuestoCreation: process.env.ENABLE_PRESUPUESTO_CREATION !== 'false',
    citaCreation: process.env.ENABLE_CITA_CREATION !== 'false',
    resultadoQuery: process.env.ENABLE_RESULTADO_QUERY !== 'false',
    metricsTracking: process.env.ENABLE_METRICS_TRACKING !== 'false'
  },

  // Debug
  debug: {
    mode: process.env.DEBUG_MODE === 'true',
    verboseLogging: process.env.VERBOSE_LOGGING === 'true'
  },

  // Helper methods
  isDevelopment() {
    return this.nodeEnv === 'development';
  },

  isProduction() {
    return this.nodeEnv === 'production';
  },

  isTest() {
    return this.nodeEnv === 'test';
  },

  // Get full phone list as array
  getPhoneNumbers() {
    return [this.laboratory.phone1, this.laboratory.phone2, this.laboratory.phone3].filter(Boolean);
  },

  // Get formatted hours
  getFormattedHours() {
    return `${this.laboratory.hoursWeekday}\n${this.laboratory.hoursSaturday}\n${this.laboratory.hoursSunday}`;
  }
};

// Validación de configuración crítica
function validateConfig() {
  const errors = [];

  if (!config.telegram.botToken && config.telegram.enabled) {
    errors.push('TELEGRAM_BOT_TOKEN is required when Telegram is enabled');
  }

  if (!config.gemini.apiKey && config.features.aiResponses) {
    errors.push('GEMINI_API_KEY is required when AI responses are enabled');
  }

  if (!config.database.host || !config.database.database) {
    errors.push('Database configuration is incomplete');
  }

  if (errors.length > 0) {
    console.error('❌ Configuration validation failed:');
    errors.forEach(err => console.error(`   - ${err}`));
    if (config.isProduction()) {
      throw new Error('Invalid configuration');
    }
  }

  return errors.length === 0;
}

// Ejecutar validación al cargar
validateConfig();

module.exports = config;
