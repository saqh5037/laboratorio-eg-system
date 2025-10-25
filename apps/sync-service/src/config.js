/**
 * Configuración centralizada del servicio
 * Carga variables de entorno y las valida
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar .env
dotenv.config({ path: join(__dirname, '..', '.env') });

const config = {
  // Base de datos LABSIS
  labsis: {
    host: process.env.LABSIS_HOST || 'localhost',
    port: parseInt(process.env.LABSIS_PORT) || 5432,
    database: process.env.LABSIS_DB || 'labsisEG',
    user: process.env.LABSIS_USER || 'postgres',
    password: process.env.LABSIS_PASSWORD || '',
  },

  // Sincronización
  sync: {
    listaPreciosId: parseInt(process.env.LISTA_PRECIOS_ID) || 27,
    debounceMs: parseInt(process.env.DEBOUNCE_MS) || 2000,
    notifyChannel: 'precio_cambio',
  },

  // Almacenamiento
  storage: {
    outputPath: process.env.OUTPUT_PATH || './output',
    outputFilename: process.env.OUTPUT_FILENAME || 'precios.json',
    autoCopyToWeb: process.env.AUTO_COPY_TO_WEB === 'true',
    webProjectPath: process.env.WEB_PROJECT_PATH || '',
    autoCopyToRemote: process.env.AUTO_COPY_TO_REMOTE === 'true',
    remoteHost: process.env.REMOTE_HOST || '',
    remoteUser: process.env.REMOTE_USER || '',
    remoteKeyPath: process.env.REMOTE_KEY_PATH || '',
    remotePath: process.env.REMOTE_PATH || '',
  },

  // HTTP Server
  http: {
    port: parseInt(process.env.HTTP_PORT) || 3001,
  },

  // Aplicación
  app: {
    env: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || 'info',
  },

  // Logging
  logging: {
    directory: process.env.LOG_DIRECTORY || './logs',
    level: process.env.LOG_LEVEL || 'info',
    maxFiles: process.env.LOG_MAX_FILES || '14d',
    maxSize: process.env.LOG_MAX_SIZE || '20m',
  },
};

// Validar configuración crítica
export function validateConfig() {
  const errors = [];

  if (!config.labsis.password) {
    errors.push('LABSIS_PASSWORD no está configurado en .env');
  }

  if (!config.labsis.database) {
    errors.push('LABSIS_DB no está configurado');
  }

  if (config.storage.autoCopyToWeb && !config.storage.webProjectPath) {
    errors.push('AUTO_COPY_TO_WEB está activado pero WEB_PROJECT_PATH no está configurado');
  }

  if (config.storage.autoCopyToRemote) {
    if (!config.storage.remoteHost) {
      errors.push('AUTO_COPY_TO_REMOTE está activado pero REMOTE_HOST no está configurado');
    }
    if (!config.storage.remoteUser) {
      errors.push('AUTO_COPY_TO_REMOTE está activado pero REMOTE_USER no está configurado');
    }
    if (!config.storage.remoteKeyPath) {
      errors.push('AUTO_COPY_TO_REMOTE está activado pero REMOTE_KEY_PATH no está configurado');
    }
    if (!config.storage.remotePath) {
      errors.push('AUTO_COPY_TO_REMOTE está activado pero REMOTE_PATH no está configurado');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export default config;
