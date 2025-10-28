const { Pool } = require('pg');
require('dotenv').config();

/**
 * Pool de conexiones a PostgreSQL - labsisEG database
 *
 * Compartimos la misma base de datos que results-service y sync-service.
 * Las tablas del bot tienen prefijo distintivo para evitar conflictos.
 */
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'labsisEG',
  user: process.env.DB_USER || 'labsis',
  password: process.env.DB_PASSWORD || 'labsis',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,

  // Pool settings
  min: parseInt(process.env.DB_POOL_MIN) || 2,
  max: parseInt(process.env.DB_POOL_MAX) || 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Event listeners para debugging y monitoring
pool.on('connect', (client) => {
  console.log('💬 Nueva conexión al pool de PostgreSQL (messaging-bot-service)');
});

pool.on('acquire', (client) => {
  // Cliente tomado del pool
});

pool.on('remove', (client) => {
  console.log('💬 Cliente removido del pool');
});

pool.on('error', (err, client) => {
  console.error('❌ Error inesperado en el pool de PostgreSQL:', err);
  // No hacer exit aquí, dejar que la aplicación maneje el error
});

/**
 * Verifica la conexión a la base de datos
 * @returns {Promise<boolean>}
 */
async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as time, version() as version');

    console.log('✅ Conexión a PostgreSQL exitosa (messaging-bot-service)');
    console.log(`⏰ Hora del servidor: ${result.rows[0].time}`);
    console.log(`📦 Versión: ${result.rows[0].version.split(',')[0]}`);
    console.log(`💬 Database: ${process.env.DB_NAME || 'labsisEG'}`);

    client.release();
    return true;
  } catch (error) {
    console.error('❌ Error al conectar a PostgreSQL:', error.message);
    console.error('   Host:', process.env.DB_HOST || 'localhost');
    console.error('   Port:', process.env.DB_PORT || 5432);
    console.error('   Database:', process.env.DB_NAME || 'labsisEG');
    console.error('   User:', process.env.DB_USER || 'labsis');
    throw error;
  }
}

/**
 * Cierra el pool de conexiones (para graceful shutdown)
 * @returns {Promise<void>}
 */
async function closePool() {
  try {
    await pool.end();
    console.log('💬 Pool de PostgreSQL cerrado correctamente');
  } catch (error) {
    console.error('❌ Error al cerrar pool de PostgreSQL:', error);
    throw error;
  }
}

/**
 * Helper para ejecutar queries con logging
 * @param {string} text - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<object>} - Result object
 */
async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;

    if (process.env.LOG_LEVEL === 'debug') {
      console.log('📝 Query executed:', { text, duration, rows: result.rowCount });
    }

    return result;
  } catch (error) {
    console.error('❌ Query error:', { text, error: error.message });
    throw error;
  }
}

/**
 * Helper para obtener un cliente del pool (para transacciones)
 * @returns {Promise<object>} - Pool client
 */
async function getClient() {
  const client = await pool.connect();
  const originalQuery = client.query.bind(client);
  const originalRelease = client.release.bind(client);

  // Track query count
  let queryCount = 0;

  // Wrap query to track count
  client.query = (...args) => {
    queryCount++;
    return originalQuery(...args);
  };

  // Wrap release to log
  client.release = () => {
    if (process.env.LOG_LEVEL === 'debug') {
      console.log(`💬 Client released after ${queryCount} queries`);
    }
    client.query = originalQuery;
    client.release = originalRelease;
    return client.release();
  };

  return client;
}

module.exports = {
  pool,
  query,
  getClient,
  testConnection,
  closePool
};
