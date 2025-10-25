// Script para crear la base de datos LabsisEG si no existe
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

async function createDatabase() {
  // Primero conectar a la base de datos por defecto 'postgres'
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: 'postgres', // Base de datos por defecto
    user: process.env.DB_USER || 'labsis',
    password: process.env.DB_PASSWORD || 'labsis',
    connectionTimeoutMillis: 5000
  });

  try {
    console.log('🔌 Intentando conectar a PostgreSQL...\n');
    await client.connect();
    console.log('✅ Conexión exitosa a PostgreSQL!\n');

    // Verificar si la base de datos existe
    const checkDB = await client.query(`
      SELECT datname FROM pg_database 
      WHERE datname = $1
    `, ['LabsisEG']);

    if (checkDB.rows.length === 0) {
      console.log('📦 La base de datos LabsisEG no existe. Creándola...\n');
      
      // Crear la base de datos
      await client.query('CREATE DATABASE "LabsisEG"');
      console.log('✅ Base de datos LabsisEG creada exitosamente!\n');
    } else {
      console.log('ℹ️ La base de datos LabsisEG ya existe.\n');
    }

    // Listar todas las bases de datos
    const databases = await client.query(`
      SELECT datname, pg_size_pretty(pg_database_size(datname)) as size
      FROM pg_database 
      WHERE datistemplate = false
      ORDER BY datname
    `);

    console.log('📊 Bases de datos disponibles:');
    console.log('─────────────────────────────────────');
    databases.rows.forEach(db => {
      console.log(`  • ${db.datname.padEnd(20)} (${db.size})`);
    });

  } catch (error) {
    console.error('\n❌ Error:');
    console.error('─────────────────────────────────────');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('   No se puede conectar a PostgreSQL.');
      console.error('\n   💡 Soluciones posibles:');
      console.error('   1. Verificar que PostgreSQL esté ejecutándose');
      console.error('   2. Verificar el puerto (por defecto: 5432)');
      console.error('   3. Verificar las credenciales en .env');
      console.error('\n   Para macOS con PostgreSQL.app:');
      console.error('   - Abrir la aplicación PostgreSQL desde /Applications');
      console.error('   - Verificar que el servidor esté iniciado');
    } else if (error.code === '28P01') {
      console.error('   Autenticación fallida.');
      console.error('\n   💡 Verifica el usuario y contraseña en .env');
      console.error(`   Usuario actual: ${process.env.DB_USER || 'labsis'}`);
    } else if (error.code === '42P04') {
      console.error('   La base de datos ya existe.');
    } else {
      console.error(`   ${error.message}`);
    }
    
    process.exit(1);
  } finally {
    await client.end();
  }

  console.log('\n✅ Proceso completado!');
}

// Ejecutar
createDatabase();