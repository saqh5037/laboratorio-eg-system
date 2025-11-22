const NodeCache = require('node-cache');
const logger = require('../utils/logger');

/**
 * Servicio de cache en memoria para configuraciones
 */
class CacheService {
  constructor() {
    // TTL por defecto: 5 minutos
    const ttl = parseInt(process.env.CACHE_TTL_SECONDS) || 300;
    const checkPeriod = parseInt(process.env.CACHE_CHECK_PERIOD_SECONDS) || 60;

    this.cache = new NodeCache({
      stdTTL: ttl,
      checkperiod: checkPeriod,
      useClones: false // Para mejor performance
    });

    // Event listeners
    this.cache.on('set', (key, value) => {
      logger.debug(`Cache SET: ${key}`);
    });

    this.cache.on('del', (key, value) => {
      logger.debug(`Cache DEL: ${key}`);
    });

    this.cache.on('expired', (key, value) => {
      logger.debug(`Cache EXPIRED: ${key}`);
    });

    logger.info(`CacheService inicializado: TTL=${ttl}s, CheckPeriod=${checkPeriod}s`);
  }

  /**
   * Obtener valor del cache
   * @param {string} key
   * @returns {*|undefined}
   */
  get(key) {
    const value = this.cache.get(key);

    if (value !== undefined) {
      logger.debug(`Cache HIT: ${key}`);
    } else {
      logger.debug(`Cache MISS: ${key}`);
    }

    return value;
  }

  /**
   * Guardar valor en cache
   * @param {string} key
   * @param {*} value
   * @param {number} ttl - TTL en segundos (opcional)
   * @returns {boolean}
   */
  set(key, value, ttl = undefined) {
    const success = this.cache.set(key, value, ttl);

    if (success) {
      logger.debug(`Cache SET exitoso: ${key}`);
    } else {
      logger.warn(`Cache SET falló: ${key}`);
    }

    return success;
  }

  /**
   * Eliminar valor del cache
   * @param {string} key
   * @returns {number} - Número de keys eliminadas
   */
  del(key) {
    const deleted = this.cache.del(key);
    logger.debug(`Cache DEL: ${key} (${deleted} keys eliminadas)`);
    return deleted;
  }

  /**
   * Eliminar múltiples keys
   * @param {Array<string>} keys
   * @returns {number}
   */
  delMany(keys) {
    const deleted = this.cache.del(keys);
    logger.debug(`Cache DEL múltiple: ${keys.length} keys solicitadas, ${deleted} eliminadas`);
    return deleted;
  }

  /**
   * Limpiar todo el cache
   */
  flush() {
    this.cache.flushAll();
    logger.info('Cache completamente limpiado');
  }

  /**
   * Obtener estadísticas del cache
   * @returns {Object}
   */
  getStats() {
    return this.cache.getStats();
  }

  /**
   * Obtener todas las keys del cache
   * @returns {Array<string>}
   */
  keys() {
    return this.cache.keys();
  }

  /**
   * Verificar si una key existe en cache
   * @param {string} key
   * @returns {boolean}
   */
  has(key) {
    return this.cache.has(key);
  }

  /**
   * Invalidar cache relacionado con configuración
   * @param {string} configKey - Key de configuración que cambió
   */
  invalidateConfig(configKey) {
    // Invalidar la key específica
    this.del(`config:${configKey}`);

    // Invalidar caches derivados
    this.del('config:all');
    this.del('config:grouped');

    // Si es un método de auth, invalidar cache de auth methods
    if (configKey.startsWith('auth.methods')) {
      this.del('config:auth_methods');
    }

    // Si es una página, invalidar cache de páginas
    if (configKey.startsWith('ui.pages')) {
      this.del('config:ui_pages');
    }

    logger.info(`Cache invalidado para configuración: ${configKey}`);
  }

  /**
   * Invalidar todo el cache de configuraciones
   */
  invalidateAllConfig() {
    const keys = this.keys();
    const configKeys = keys.filter(k => k.startsWith('config:'));

    if (configKeys.length > 0) {
      this.delMany(configKeys);
      logger.info(`Cache invalidado: ${configKeys.length} keys de configuración eliminadas`);
    }
  }
}

module.exports = new CacheService();
