/**
 * Sistema de Logging Condicional
 *
 * En desarrollo: Muestra todos los logs
 * En producción: Solo muestra warnings y errors
 *
 * Uso:
 * import { logger } from '../utils/logger';
 *
 * logger.debug('Debugging info');  // Solo en dev
 * logger.info('Info message');     // Solo en dev
 * logger.warn('Warning');          // Siempre
 * logger.error('Error');           // Siempre
 */

const isDevelopment = import.meta.env.MODE === 'development';

export const logger = {
  /**
   * Debug logs - Solo en desarrollo
   * Usar para debugging detallado que no debe aparecer en producción
   */
  debug: isDevelopment ? console.log.bind(console) : () => {},

  /**
   * Info logs - Solo en desarrollo
   * Usar para información general útil durante desarrollo
   */
  info: isDevelopment ? console.info.bind(console) : () => {},

  /**
   * Warning logs - Siempre activo
   * Usar para advertencias que deben ser visibles en producción
   */
  warn: console.warn.bind(console),

  /**
   * Error logs - Siempre activo
   * Usar para errores que deben ser visibles en producción
   */
  error: console.error.bind(console)
};

export default logger;
