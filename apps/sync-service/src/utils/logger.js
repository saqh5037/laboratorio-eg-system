// Sistema de logging con Winston
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import config from '../config.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Formato personalizado
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Formato para consola (más legible)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}] ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

// Configuración de transports
const transports = [
  // Console (siempre activo en desarrollo)
  new winston.transports.Console({
    format: consoleFormat,
    level: config.app.env === 'production' ? 'info' : config.app.logLevel || 'debug'
  }),

  // Archivo de logs combinados (rotación diaria)
  new DailyRotateFile({
    filename: path.join(config.logging.directory, 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxFiles: config.logging.maxFiles,
    maxSize: config.logging.maxSize,
    format: customFormat,
    level: 'info'
  }),

  // Archivo de errores (rotación diaria)
  new DailyRotateFile({
    filename: path.join(config.logging.directory, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxFiles: config.logging.maxFiles,
    maxSize: config.logging.maxSize,
    format: customFormat,
    level: 'error'
  }),

  // Archivo de sincronización (solo eventos de sync)
  new DailyRotateFile({
    filename: path.join(config.logging.directory, 'sync-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxFiles: config.logging.maxFiles,
    maxSize: config.logging.maxSize,
    format: customFormat,
    level: 'info'
  })
];

// Crear logger
const logger = winston.createLogger({
  level: config.logging.level,
  format: customFormat,
  transports,
  exitOnError: false
});

// Métodos helper para eventos específicos
logger.sync = (message, meta = {}) => {
  logger.info(message, { ...meta, event: 'sync' });
};

logger.database = (message, meta = {}) => {
  logger.info(message, { ...meta, event: 'database' });
};

logger.s3 = (message, meta = {}) => {
  logger.info(message, { ...meta, event: 's3' });
};

// Manejar errores no capturados
process.on('unhandledRejection', (error) => {
  logger.error('Unhandled Promise Rejection:', { error: error.message, stack: error.stack });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', { error: error.message, stack: error.stack });
  // Dar tiempo a escribir el log antes de salir
  setTimeout(() => process.exit(1), 1000);
});

export default logger;
