/**
 * Bot Database Connection Pool
 *
 * Pool de conexiones para lis_bot_comunicacion
 * Base de datos dedicada para comunicación con pacientes
 * (Telegram, WhatsApp, futuras plataformas)
 *
 * Permisos: Lectura y Escritura
 */

const { Pool } = require('pg');
const logger = require('../utils/logger');

if (!process.env.BOT_DATABASE_URL) {
  logger.error('❌ Falta variable de entorno: BOT_DATABASE_URL');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.BOT_DATABASE_URL,
  max: 20,  // Máximo de conexiones
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
  logger.info('💬 Nueva conexión al pool de PostgreSQL (lis_bot_comunicacion)');
});

pool.on('error', (err) => {
  logger.error('❌ Error inesperado en pool de bot:', err);
});

// Verificar conexión al iniciar
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    logger.error('❌ Error conectando a lis_bot_comunicacion:', err);
  } else {
    logger.info('✅ Conexión a lis_bot_comunicacion exitosa');
    logger.info('⏰ Hora del servidor:', res.rows[0].now);
  }
});

module.exports = pool;
