import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Configuración del pool de conexiones a PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'labsisEG',
  user: process.env.DB_USER || 'labsis',
  password: process.env.DB_PASSWORD || 'labsis',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 20, // Máximo de conexiones en el pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Event listeners para debugging
pool.on('connect', () => {
  console.log('📊 Nueva conexión al pool de PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en el pool de PostgreSQL:', err);
  process.exit(-1);
});

// Función para verificar la conexión
export async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as time, version() as version');
    console.log('✅ Conexión a PostgreSQL exitosa');
    console.log(`⏰ Hora del servidor: ${result.rows[0].time}`);
    console.log(`📦 Versión: ${result.rows[0].version.split(',')[0]}`);
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Error al conectar a PostgreSQL:', error.message);
    throw error;
  }
}

export default pool;
