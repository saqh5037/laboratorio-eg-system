import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Formato personalizado para los logs
const customFormat = printf(({ level, message, timestamp, stack }) => {
  if (stack) {
    return `${timestamp} [${level}] ${message}\n${stack}`;
  }
  return `${timestamp} [${level}] ${message}`;
});

// Crear logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })
  ),
  defaultMeta: { service: 'results-service' },
  transports: [
    // Logs de error en archivo separado
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error',
      format: combine(customFormat),
    }),
    // Todos los logs en archivo combinado
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/combined.log'),
      format: combine(customFormat),
    }),
  ],
});

// En desarrollo, también mostrar en consola con colores
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: combine(colorize(), customFormat),
    })
  );
}

export default logger;
