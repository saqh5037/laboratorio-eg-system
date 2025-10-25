// Pool de conexiones PostgreSQL a labsisEG
import pg from 'pg';
import config from '../config.js';
import logger from '../utils/logger.js';

const { Pool } = pg;

// Crear pool de conexiones a labsisEG
const pool = new Pool(config.labsis);

// Event listeners
pool.on('connect', (client) => {
  logger.database('Nueva conexión al pool de PostgreSQL');
});

pool.on('error', (err, client) => {
  logger.error('Error inesperado en cliente PostgreSQL:', { error: err.message });
});

pool.on('remove', (client) => {
  logger.database('Cliente removido del pool');
});

/**
 * Ejecutar query con retry logic
 * @param {string} text - Query SQL
 * @param {Array} params - Parámetros
 * @param {number} retries - Número de reintentos
 * @returns {Promise<Object>} - Resultado de la query
 */
export const query = async (text, params, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const start = Date.now();
      const result = await pool.query(text, params);
      const duration = Date.now() - start;

      logger.database('Query ejecutada', {
        duration: `${duration}ms`,
        rows: result.rowCount
      });

      return result;
    } catch (error) {
      logger.error(`Query falló (intento ${attempt}/${retries}):`, {
        error: error.message,
        query: text.substring(0, 100)
      });

      if (attempt === retries) {
        throw error;
      }

      // Esperar antes de reintentar (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
};

/**
 * Obtener cliente para transacciones
 * @returns {Promise<Client>} - Cliente de PostgreSQL
 */
export const getClient = async () => {
  const client = await pool.connect();
  logger.database('Cliente obtenido del pool');
  return client;
};

/**
 * Ejecutar transacción
 * @param {Function} callback - Función que ejecuta queries dentro de la transacción
 * @returns {Promise<any>} - Resultado del callback
 */
export const transaction = async (callback) => {
  const client = await getClient();

  try {
    await client.query('BEGIN');
    logger.database('Transacción iniciada');

    const result = await callback(client);

    await client.query('COMMIT');
    logger.database('Transacción completada');

    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Transacción revertida:', { error: error.message });
    throw error;
  } finally {
    client.release();
    logger.database('Cliente liberado al pool');
  }
};

/**
 * Verificar conexión a la base de datos
 * @returns {Promise<boolean>} - True si la conexión es exitosa
 */
export const testConnection = async () => {
  try {
    const result = await query('SELECT NOW() as current_time, version() as pg_version');

    logger.database('✅ Conexión a PostgreSQL exitosa', {
      time: result.rows[0].current_time,
      version: result.rows[0].pg_version
    });

    return true;
  } catch (error) {
    logger.error('❌ No se pudo conectar a PostgreSQL:', { error: error.message });
    return false;
  }
};

/**
 * Obtener estadísticas del pool
 * @returns {Object} - Estadísticas del pool
 */
export const getPoolStats = () => {
  return {
    total: pool.totalCount,
    idle: pool.idleCount,
    waiting: pool.waitingCount
  };
};

/**
 * Cerrar todas las conexiones del pool
 */
export const close = async () => {
  await pool.end();
  logger.database('Pool de conexiones cerrado');
};

export default {
  query,
  getClient,
  transaction,
  testConnection,
  getPoolStats,
  close,
  pool
};
