// Configuración de PostgreSQL para Labsis
// Pool de conexiones optimizado con retry logic y manejo de errores

import pg from 'pg';
import dotenv from 'dotenv';
import pRetry from 'p-retry';

dotenv.config();

const { Pool } = pg;

// Configuración de desarrollo y producción
const dbConfig = {
  development: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'labsis_dev',
    user: process.env.DB_USER || 'labsis_user',
    password: process.env.DB_PASSWORD || '',
    max: 20, // Máximo de conexiones en el pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    allowExitOnIdle: false
  },
  production: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    max: 50,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    allowExitOnIdle: false,
    ssl: process.env.DB_SSL === 'true' ? {
      rejectUnauthorized: false
    } : false
  },
  test: {
    host: 'localhost',
    port: 5432,
    database: 'labsis_test',
    user: 'labsis_test',
    password: 'test_password',
    max: 5,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 2000
  }
};

// Clase para gestionar la conexión a la base de datos
class DatabaseManager {
  constructor() {
    this.pool = null;
    this.isConnected = false;
    this.config = dbConfig[process.env.NODE_ENV || 'development'];
    this.retryOptions = {
      retries: 5,
      factor: 2,
      minTimeout: 1000,
      maxTimeout: 10000,
      randomize: true,
      onFailedAttempt: error => {
        console.log(`Database connection attempt ${error.attemptNumber} failed. ${error.retriesLeft} retries left.`);
      }
    };
  }

  // Inicializar pool de conexiones con retry logic
  async initialize() {
    try {
      await pRetry(async () => {
        this.pool = new Pool(this.config);
        
        // Configurar event listeners
        this.setupEventListeners();
        
        // Verificar conexión inicial
        const client = await this.pool.connect();
        await client.query('SELECT NOW()');
        client.release();
        
        this.isConnected = true;
        console.log('✅ Database connection established successfully');
        
        // Verificar estructura de tablas
        await this.verifyDatabaseStructure();
        
        return this.pool;
      }, this.retryOptions);
    } catch (error) {
      console.error('❌ Failed to connect to database after retries:', error);
      this.isConnected = false;
      throw error;
    }
  }

  // Configurar event listeners del pool
  setupEventListeners() {
    if (!this.pool) return;

    this.pool.on('error', (err, client) => {
      console.error('Unexpected error on idle client', err);
      this.isConnected = false;
    });

    this.pool.on('connect', (client) => {
      console.log('New client connected to pool');
      this.isConnected = true;
    });

    this.pool.on('remove', (client) => {
      console.log('Client removed from pool');
    });
  }

  // Verificar estructura de la base de datos
  async verifyDatabaseStructure() {
    const requiredTables = [
      'prueba',
      'grupo_prueba',
      'gp_has_prueba',
      'lista_precios',
      'lista_precios_has_prueba',
      'lista_precios_has_gprueba',
      'area',
      'tipo_muestra',
      'tipo_contenedor'
    ];

    try {
      const client = await this.pool.connect();
      
      for (const table of requiredTables) {
        const result = await client.query(
          `SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          )`,
          [table]
        );
        
        if (!result.rows[0].exists) {
          console.warn(`⚠️ Table '${table}' does not exist in database`);
        }
      }
      
      client.release();
      console.log('✅ Database structure verified');
    } catch (error) {
      console.error('Error verifying database structure:', error);
    }
  }

  // Ejecutar query con retry logic
  async query(text, params) {
    if (!this.isConnected) {
      await this.initialize();
    }

    return pRetry(async () => {
      const start = Date.now();
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      
      // Log queries en desarrollo
      if (process.env.NODE_ENV === 'development') {
        console.log('Executed query', { text, duration, rows: result.rowCount });
      }
      
      return result;
    }, {
      retries: 3,
      onFailedAttempt: async (error) => {
        console.log(`Query failed, retrying... ${error.retriesLeft} attempts left`);
        
        // Reintentar conexión si es necesario
        if (error.message.includes('Connection terminated')) {
          this.isConnected = false;
          await this.initialize();
        }
      }
    });
  }

  // Transacción con manejo de errores
  async transaction(callback) {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Obtener cliente para operaciones manuales
  async getClient() {
    if (!this.isConnected) {
      await this.initialize();
    }
    return this.pool.connect();
  }

  // Cerrar todas las conexiones
  async close() {
    if (this.pool) {
      await this.pool.end();
      this.isConnected = false;
      console.log('Database pool closed');
    }
  }

  // Health check
  async healthCheck() {
    try {
      const result = await this.query('SELECT NOW() as current_time, version() as pg_version');
      return {
        status: 'healthy',
        connected: this.isConnected,
        timestamp: result.rows[0].current_time,
        version: result.rows[0].pg_version,
        poolInfo: {
          totalCount: this.pool.totalCount,
          idleCount: this.pool.idleCount,
          waitingCount: this.pool.waitingCount
        }
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        connected: false,
        error: error.message
      };
    }
  }

  // Estadísticas del pool
  getPoolStats() {
    if (!this.pool) return null;
    
    return {
      total: this.pool.totalCount,
      idle: this.pool.idleCount,
      waiting: this.pool.waitingCount,
      connected: this.isConnected
    };
  }
}

// Instancia singleton
const db = new DatabaseManager();

// Helper functions para queries comunes
export const queryHelpers = {
  // Buscar con paginación
  async paginate(table, page = 1, limit = 20, where = {}, orderBy = 'id ASC') {
    const offset = (page - 1) * limit;
    
    let whereClause = '';
    let values = [];
    let paramCounter = 1;
    
    if (Object.keys(where).length > 0) {
      const conditions = Object.entries(where).map(([key, value]) => {
        values.push(value);
        return `${key} = $${paramCounter++}`;
      });
      whereClause = `WHERE ${conditions.join(' AND ')}`;
    }
    
    values.push(limit, offset);
    
    const query = `
      SELECT * FROM ${table}
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT $${paramCounter} OFFSET $${paramCounter + 1}
    `;
    
    const countQuery = `
      SELECT COUNT(*) as total FROM ${table}
      ${whereClause}
    `;
    
    const [results, count] = await Promise.all([
      db.query(query, values),
      db.query(countQuery, values.slice(0, -2))
    ]);
    
    return {
      data: results.rows,
      pagination: {
        page,
        limit,
        total: parseInt(count.rows[0].total),
        totalPages: Math.ceil(count.rows[0].total / limit)
      }
    };
  },

  // Búsqueda full-text
  async search(table, searchColumns, searchTerm, limit = 50) {
    const searchConditions = searchColumns.map((col, index) => 
      `${col} ILIKE $${index + 2}`
    ).join(' OR ');
    
    const query = `
      SELECT * FROM ${table}
      WHERE ${searchConditions}
      LIMIT $1
    `;
    
    const values = [limit];
    searchColumns.forEach(() => values.push(`%${searchTerm}%`));
    
    return db.query(query, values);
  },

  // Insert con retorno de ID
  async insert(table, data) {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = columns.map((_, index) => `$${index + 1}`);
    
    const query = `
      INSERT INTO ${table} (${columns.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING *
    `;
    
    const result = await db.query(query, values);
    return result.rows[0];
  },

  // Update con retorno de registro actualizado
  async update(table, id, data) {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const setClause = columns.map((col, index) => 
      `${col} = $${index + 2}`
    ).join(', ');
    
    values.unshift(id);
    
    const query = `
      UPDATE ${table}
      SET ${setClause}
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await db.query(query, values);
    return result.rows[0];
  }
};

// Exportar instancia y helpers
export default db;
export { DatabaseManager };