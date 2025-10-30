/**
 * LABSIS Database Connection Pool (Read-Only)
 *
 * Pool de conexiones para labsisEG (sistema LABSIS original)
 * SOLO para consultas (SELECT) - NO modificar datos
 *
 * Uso: Consultar pacientes, órdenes, estudios, precios, etc.
 * Permisos: Solo Lectura
 */

const { Pool } = require('pg');
const logger = require('../utils/logger');

if (!process.env.LABSIS_DATABASE_URL) {
  logger.error('❌ Falta variable de entorno: LABSIS_DATABASE_URL');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.LABSIS_DATABASE_URL,
  max: 10,  // Menos conexiones, solo lectura
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
  logger.info('🔬 Nueva conexión al pool de PostgreSQL (labsisEG - Read Only)');
});

pool.on('error', (err) => {
  logger.error('❌ Error inesperado en pool de LABSIS:', err);
});

// Verificar conexión al iniciar
pool.query('SELECT NOW(), version()', (err, res) => {
  if (err) {
    logger.error('❌ Error conectando a labsisEG:', err);
  } else {
    logger.info('✅ Conexión a labsisEG exitosa (Read-Only)');
    logger.info('⏰ Hora del servidor:', res.rows[0].now);
    logger.info('📦 Versión:', res.rows[0].version.split(' ')[0] + ' ' + res.rows[0].version.split(' ')[1]);
  }
});

// Interceptar queries de escritura (opcional, para debugging)
const originalQuery = pool.query.bind(pool);
pool.query = function(text, ...args) {
  // Detectar queries de escritura
  const writePatterns = /^\s*(INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|TRUNCATE)/i;
  if (writePatterns.test(text)) {
    logger.warn(`⚠️ Intento de escritura en labsisEG (Read-Only): ${text.substring(0, 100)}...`);
    // En producción, podrías rechazar la query aquí
  }
  return originalQuery(text, ...args);
};

module.exports = pool;
