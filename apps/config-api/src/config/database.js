const { Pool } = require('pg');
const logger = require('../utils/logger');

// Pool de conexión a lis_bot_comunicacion
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'lis_bot_comunicacion',
  user: process.env.DB_USER || 'labsis',
  password: process.env.DB_PASSWORD || 'labsis',
  max: parseInt(process.env.DB_MAX_CONNECTIONS) || 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Event handlers
pool.on('connect', () => {
  logger.info('Nueva conexión establecida con PostgreSQL (lis_bot_comunicacion)');
});

pool.on('error', (err) => {
  logger.error('Error inesperado en pool de PostgreSQL:', err);
  process.exit(-1);
});

// Verificar conexión al iniciar
async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW(), current_database()');
    logger.info('Conexión a PostgreSQL exitosa:', {
      database: result.rows[0].current_database,
      timestamp: result.rows[0].now
    });
    client.release();
    return true;
  } catch (error) {
    logger.error('Error al conectar a PostgreSQL:', error.message);
    throw error;
  }
}

module.exports = {
  pool,
  testConnection,
  query: (text, params) => pool.query(text, params)
};
