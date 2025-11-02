/**
 * Database Connection Pools
 *
 * Desde 2025-10-29: Arquitectura de 2 bases de datos separadas
 * - lis_bot_comunicacion: Comunicación con pacientes (bot_*, telegram_*, etc.)
 * - labsisEG: Sistema LABSIS original (solo lectura desde el bot)
 */

const botPool = require('./botPool');
const labsisPool = require('./labsisPool');

// Por defecto, exportar botPool como 'pool' para compatibilidad
const pool = botPool;

/**
 * Verifica la conexión a ambas bases de datos
 * @returns {Promise<boolean>}
 */
async function testConnection() {
  console.log('🔍 Verificando conexiones a las bases de datos...\n');

  try {
    // Test Bot DB
    const botClient = await botPool.connect();
    const botResult = await botClient.query('SELECT NOW() as time, current_database() as db');
    console.log('✅ lis_bot_comunicacion: Conectado');
    console.log(`   ⏰ Hora: ${botResult.rows[0].time}`);
    console.log(`   💬 Database: ${botResult.rows[0].db}`);
    botClient.release();

    // Test LABSIS DB
    const labsisClient = await labsisPool.connect();
    const labsisResult = await labsisClient.query('SELECT NOW() as time, current_database() as db');
    console.log('\n✅ labsisEG: Conectado (Read-Only)');
    console.log(`   ⏰ Hora: ${labsisResult.rows[0].time}`);
    console.log(`   💬 Database: ${labsisResult.rows[0].db}`);
    labsisClient.release();

    return true;
  } catch (error) {
    console.error('❌ Error al conectar a PostgreSQL:', error.message);
    throw error;
  }
}

/**
 * Cierra ambos pools de conexiones (para graceful shutdown)
 * @returns {Promise<void>}
 */
async function closePool() {
  try {
    await Promise.all([
      botPool.end(),
      labsisPool.end()
    ]);
    console.log('💬 Pools de PostgreSQL cerrados correctamente');
  } catch (error) {
    console.error('❌ Error al cerrar pools de PostgreSQL:', error);
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
  pool,          // Por defecto = botPool
  botPool,       // Explícito para bot DB
  labsisPool,    // Explícito para LABSIS DB
  query,
  getClient,
  testConnection,
  closePool
};
