// Script para analizar la estructura completa de la base de datos LabsisEG
// Obtiene todas las tablas, columnas, relaciones y estadísticas

import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de conexión
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'LabsisEG',
  user: process.env.DB_USER || 'labsis',
  password: process.env.DB_PASSWORD || 'labsis',
  connectionTimeoutMillis: 10000
});

async function analyzeDatabase() {
  let client;
  
  try {
    console.log('🔍 Conectando a la base de datos LabsisEG...\n');
    client = await pool.connect();
    
    console.log('✅ Conexión exitosa!\n');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('   ANÁLISIS COMPLETO DE LA BASE DE DATOS LabsisEG');
    console.log('═══════════════════════════════════════════════════════════════\n');

    // 1. Información general de la base de datos
    const dbInfo = await client.query(`
      SELECT 
        current_database() as database_name,
        pg_database_size(current_database()) as database_size,
        pg_size_pretty(pg_database_size(current_database())) as database_size_pretty,
        version() as postgres_version,
        current_user,
        inet_server_addr() as server_address,
        inet_server_port() as server_port
    `);
    
    console.log('📊 INFORMACIÓN GENERAL:');
    console.log('─────────────────────────────────────────');
    console.log(`Database: ${dbInfo.rows[0].database_name}`);
    console.log(`Tamaño: ${dbInfo.rows[0].database_size_pretty}`);
    console.log(`Usuario: ${dbInfo.rows[0].current_user}`);
    console.log(`PostgreSQL: ${dbInfo.rows[0].postgres_version.split(',')[0]}`);
    console.log('\n');

    // 2. Listar todos los schemas
    const schemas = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
      ORDER BY schema_name
    `);
    
    console.log('📁 SCHEMAS ENCONTRADOS:');
    console.log('─────────────────────────────────────────');
    schemas.rows.forEach(schema => {
      console.log(`  • ${schema.schema_name}`);
    });
    console.log('\n');

    // 3. Obtener todas las tablas con sus estadísticas
    const tables = await client.query(`
      SELECT 
        t.table_schema,
        t.table_name,
        t.table_type,
        obj_description(c.oid) as table_comment,
        pg_size_pretty(pg_total_relation_size(c.oid)) as total_size,
        pg_stat_get_live_tuples(c.oid) as row_count,
        COUNT(col.column_name) as column_count
      FROM information_schema.tables t
      JOIN pg_class c ON c.relname = t.table_name
      JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = t.table_schema
      LEFT JOIN information_schema.columns col ON 
        col.table_schema = t.table_schema AND 
        col.table_name = t.table_name
      WHERE t.table_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
        AND t.table_type = 'BASE TABLE'
      GROUP BY t.table_schema, t.table_name, t.table_type, c.oid
      ORDER BY t.table_schema, t.table_name
    `);

    console.log(`📋 TABLAS ENCONTRADAS: ${tables.rows.length}`);
    console.log('═══════════════════════════════════════════════════════════════\n');

    const tableDetails = [];

    // 4. Analizar cada tabla en detalle
    for (const table of tables.rows) {
      console.log(`\n📌 TABLA: ${table.table_schema}.${table.table_name}`);
      console.log('─────────────────────────────────────────────────────');
      console.log(`   Tipo: ${table.table_type}`);
      console.log(`   Filas: ${table.row_count || 0}`);
      console.log(`   Columnas: ${table.column_count}`);
      console.log(`   Tamaño: ${table.total_size}`);
      if (table.table_comment) {
        console.log(`   Comentario: ${table.table_comment}`);
      }
      console.log('');

      // Obtener columnas de la tabla
      const columns = await client.query(`
        SELECT 
          c.column_name,
          c.data_type,
          c.character_maximum_length,
          c.numeric_precision,
          c.numeric_scale,
          c.is_nullable,
          c.column_default,
          c.is_identity,
          c.is_generated,
          col_description(pgc.oid, c.ordinal_position) as column_comment,
          CASE 
            WHEN pk.column_name IS NOT NULL THEN 'PK'
            WHEN fk.column_name IS NOT NULL THEN 'FK'
            WHEN uk.column_name IS NOT NULL THEN 'UK'
            ELSE NULL
          END as constraint_type,
          fk.foreign_table_name,
          fk.foreign_column_name
        FROM information_schema.columns c
        JOIN pg_class pgc ON pgc.relname = c.table_name
        JOIN pg_namespace n ON n.oid = pgc.relnamespace AND n.nspname = c.table_schema
        LEFT JOIN (
          SELECT kcu.column_name, kcu.table_schema, kcu.table_name
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu 
            ON tc.constraint_name = kcu.constraint_name
          WHERE tc.constraint_type = 'PRIMARY KEY'
        ) pk ON pk.table_schema = c.table_schema 
          AND pk.table_name = c.table_name 
          AND pk.column_name = c.column_name
        LEFT JOIN (
          SELECT 
            kcu.column_name, 
            kcu.table_schema, 
            kcu.table_name,
            ccu.table_name as foreign_table_name,
            ccu.column_name as foreign_column_name
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu 
            ON tc.constraint_name = kcu.constraint_name
          JOIN information_schema.constraint_column_usage ccu
            ON tc.constraint_name = ccu.constraint_name
          WHERE tc.constraint_type = 'FOREIGN KEY'
        ) fk ON fk.table_schema = c.table_schema 
          AND fk.table_name = c.table_name 
          AND fk.column_name = c.column_name
        LEFT JOIN (
          SELECT kcu.column_name, kcu.table_schema, kcu.table_name
          FROM information_schema.table_constraints tc
          JOIN information_schema.key_column_usage kcu 
            ON tc.constraint_name = kcu.constraint_name
          WHERE tc.constraint_type = 'UNIQUE'
        ) uk ON uk.table_schema = c.table_schema 
          AND uk.table_name = c.table_name 
          AND uk.column_name = c.column_name
        WHERE c.table_schema = $1 AND c.table_name = $2
        ORDER BY c.ordinal_position
      `, [table.table_schema, table.table_name]);

      console.log('   COLUMNAS:');
      columns.rows.forEach(col => {
        let dataType = col.data_type;
        if (col.character_maximum_length) {
          dataType += `(${col.character_maximum_length})`;
        } else if (col.numeric_precision) {
          dataType += `(${col.numeric_precision}`;
          if (col.numeric_scale) {
            dataType += `,${col.numeric_scale}`;
          }
          dataType += ')';
        }

        let constraints = [];
        if (col.constraint_type) constraints.push(col.constraint_type);
        if (col.is_nullable === 'NO') constraints.push('NOT NULL');
        if (col.column_default) constraints.push(`DEFAULT: ${col.column_default.substring(0, 30)}`);
        
        console.log(`     • ${col.column_name.padEnd(30)} ${dataType.padEnd(20)} ${constraints.join(', ')}`);
        
        if (col.foreign_table_name) {
          console.log(`       └─> Referencias: ${col.foreign_table_name}.${col.foreign_column_name}`);
        }
        if (col.column_comment) {
          console.log(`       └─> ${col.column_comment}`);
        }
      });

      // Obtener índices
      const indexes = await client.query(`
        SELECT 
          i.relname as index_name,
          idx.indisprimary as is_primary,
          idx.indisunique as is_unique,
          pg_size_pretty(pg_relation_size(i.oid)) as index_size,
          array_to_string(array_agg(a.attname ORDER BY array_position(idx.indkey, a.attnum)), ', ') as columns
        FROM pg_index idx
        JOIN pg_class t ON t.oid = idx.indrelid
        JOIN pg_class i ON i.oid = idx.indexrelid
        JOIN pg_namespace n ON n.oid = t.relnamespace
        JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(idx.indkey)
        WHERE n.nspname = $1 AND t.relname = $2
        GROUP BY i.relname, idx.indisprimary, idx.indisunique, i.oid
        ORDER BY idx.indisprimary DESC, idx.indisunique DESC, i.relname
      `, [table.table_schema, table.table_name]);

      if (indexes.rows.length > 0) {
        console.log('\n   ÍNDICES:');
        indexes.rows.forEach(idx => {
          let type = idx.is_primary ? 'PRIMARY KEY' : idx.is_unique ? 'UNIQUE' : 'INDEX';
          console.log(`     • ${idx.index_name.padEnd(40)} ${type.padEnd(12)} (${idx.columns}) - ${idx.index_size}`);
        });
      }

      // Obtener constraints
      const constraints = await client.query(`
        SELECT 
          con.conname as constraint_name,
          con.contype,
          CASE con.contype
            WHEN 'c' THEN 'CHECK'
            WHEN 'f' THEN 'FOREIGN KEY'
            WHEN 'p' THEN 'PRIMARY KEY'
            WHEN 'u' THEN 'UNIQUE'
            WHEN 'x' THEN 'EXCLUDE'
          END as constraint_type,
          pg_get_constraintdef(con.oid) as definition
        FROM pg_constraint con
        JOIN pg_namespace n ON n.oid = con.connamespace
        JOIN pg_class c ON c.oid = con.conrelid
        WHERE n.nspname = $1 AND c.relname = $2
          AND con.contype NOT IN ('p') -- Primary keys ya mostrados en índices
        ORDER BY con.contype, con.conname
      `, [table.table_schema, table.table_name]);

      if (constraints.rows.length > 0) {
        console.log('\n   CONSTRAINTS:');
        constraints.rows.forEach(con => {
          console.log(`     • ${con.constraint_name} (${con.constraint_type})`);
          console.log(`       └─> ${con.definition}`);
        });
      }

      // Guardar detalles para análisis
      tableDetails.push({
        schema: table.table_schema,
        name: table.table_name,
        rows: table.row_count || 0,
        columns: columns.rows,
        indexes: indexes.rows,
        constraints: constraints.rows
      });
    }

    // 5. Analizar relaciones entre tablas
    console.log('\n\n🔗 RELACIONES ENTRE TABLAS (FOREIGN KEYS):');
    console.log('═══════════════════════════════════════════════════════════════');
    
    const relations = await client.query(`
      SELECT 
        tc.table_schema || '.' || tc.table_name as source_table,
        kcu.column_name as source_column,
        ccu.table_schema || '.' || ccu.table_name as target_table,
        ccu.column_name as target_column,
        tc.constraint_name,
        rc.update_rule,
        rc.delete_rule
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage ccu
        ON tc.constraint_name = ccu.constraint_name
      JOIN information_schema.referential_constraints rc
        ON tc.constraint_name = rc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema NOT IN ('pg_catalog', 'information_schema')
      ORDER BY tc.table_schema, tc.table_name, kcu.column_name
    `);

    relations.rows.forEach(rel => {
      console.log(`\n   ${rel.source_table}.${rel.source_column}`);
      console.log(`     └─> ${rel.target_table}.${rel.target_column}`);
      console.log(`         Constraint: ${rel.constraint_name}`);
      console.log(`         On Update: ${rel.update_rule}, On Delete: ${rel.delete_rule}`);
    });

    // 6. Vistas encontradas
    const views = await client.query(`
      SELECT 
        table_schema,
        table_name as view_name,
        view_definition
      FROM information_schema.views
      WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
      ORDER BY table_schema, table_name
    `);

    if (views.rows.length > 0) {
      console.log('\n\n👁️ VISTAS ENCONTRADAS:');
      console.log('═══════════════════════════════════════════════════════════════');
      views.rows.forEach(view => {
        console.log(`\n   ${view.table_schema}.${view.view_name}`);
        console.log(`     Definición: ${view.view_definition.substring(0, 200)}...`);
      });
    }

    // 7. Funciones y procedimientos almacenados
    const functions = await client.query(`
      SELECT 
        n.nspname as schema_name,
        p.proname as function_name,
        pg_catalog.pg_get_function_result(p.oid) as result_type,
        pg_catalog.pg_get_function_arguments(p.oid) as arguments,
        CASE p.prokind
          WHEN 'f' THEN 'FUNCTION'
          WHEN 'p' THEN 'PROCEDURE'
          WHEN 'a' THEN 'AGGREGATE'
          WHEN 'w' THEN 'WINDOW'
        END as type
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
      ORDER BY n.nspname, p.proname
    `);

    if (functions.rows.length > 0) {
      console.log('\n\n⚙️ FUNCIONES Y PROCEDIMIENTOS:');
      console.log('═══════════════════════════════════════════════════════════════');
      functions.rows.forEach(func => {
        console.log(`\n   ${func.schema_name}.${func.function_name}(${func.arguments})`);
        console.log(`     Tipo: ${func.type}`);
        console.log(`     Retorna: ${func.result_type}`);
      });
    }

    // 8. Secuencias
    const sequences = await client.query(`
      SELECT 
        schemaname,
        sequencename,
        last_value,
        start_value,
        increment_by,
        max_value,
        min_value,
        cache_value
      FROM pg_sequences
      WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
      ORDER BY schemaname, sequencename
    `);

    if (sequences.rows.length > 0) {
      console.log('\n\n🔢 SECUENCIAS:');
      console.log('═══════════════════════════════════════════════════════════════');
      sequences.rows.forEach(seq => {
        console.log(`\n   ${seq.schemaname}.${seq.sequencename}`);
        console.log(`     Valor actual: ${seq.last_value || 'No inicializada'}`);
        console.log(`     Rango: ${seq.min_value} - ${seq.max_value}`);
        console.log(`     Incremento: ${seq.increment_by}`);
      });
    }

    // 9. Resumen de estadísticas
    console.log('\n\n📈 RESUMEN DE ESTADÍSTICAS:');
    console.log('═══════════════════════════════════════════════════════════════');
    
    const stats = await client.query(`
      SELECT 
        COUNT(DISTINCT table_name) as total_tables,
        SUM(pg_stat_get_live_tuples(c.oid)) as total_rows,
        COUNT(DISTINCT col.column_name) as total_columns,
        pg_size_pretty(SUM(pg_total_relation_size(c.oid))) as total_size
      FROM information_schema.tables t
      JOIN pg_class c ON c.relname = t.table_name
      JOIN pg_namespace n ON n.oid = c.relnamespace AND n.nspname = t.table_schema
      LEFT JOIN information_schema.columns col ON 
        col.table_schema = t.table_schema AND 
        col.table_name = t.table_name
      WHERE t.table_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
        AND t.table_type = 'BASE TABLE'
    `);

    console.log(`\n   Total de Tablas: ${stats.rows[0].total_tables}`);
    console.log(`   Total de Filas: ${stats.rows[0].total_rows || 0}`);
    console.log(`   Total de Columnas: ${stats.rows[0].total_columns}`);
    console.log(`   Tamaño Total: ${stats.rows[0].total_size}`);
    console.log(`   Total de Relaciones FK: ${relations.rows.length}`);
    console.log(`   Total de Vistas: ${views.rows.length}`);
    console.log(`   Total de Funciones: ${functions.rows.length}`);
    console.log(`   Total de Secuencias: ${sequences.rows.length}`);

    // 10. Guardar análisis en archivo JSON
    const analysis = {
      timestamp: new Date().toISOString(),
      database: dbInfo.rows[0],
      schemas: schemas.rows,
      tables: tableDetails,
      relations: relations.rows,
      views: views.rows,
      functions: functions.rows,
      sequences: sequences.rows,
      statistics: stats.rows[0]
    };

    const outputPath = path.join(__dirname, '..', 'data', 'database-analysis.json');
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(analysis, null, 2));
    
    console.log(`\n\n✅ Análisis completo guardado en: ${outputPath}`);

  } catch (error) {
    console.error('\n❌ Error al analizar la base de datos:');
    console.error('─────────────────────────────────────────');
    console.error(`   Tipo: ${error.code || 'Unknown'}`);
    console.error(`   Mensaje: ${error.message}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n   💡 Sugerencia: Verifica que PostgreSQL esté ejecutándose');
      console.error('      y que las credenciales en .env sean correctas.');
    } else if (error.code === '3D000') {
      console.error('\n   💡 Sugerencia: La base de datos especificada no existe.');
      console.error('      Créala con: createdb LabsisEG');
    } else if (error.code === '28P01') {
      console.error('\n   💡 Sugerencia: Usuario o contraseña incorrectos.');
    }
    
    process.exit(1);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('   ANÁLISIS COMPLETADO');
  console.log('═══════════════════════════════════════════════════════════════\n');
}

// Ejecutar análisis
analyzeDatabase();