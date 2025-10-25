// Script para verificar las columnas exactas de las tablas principales
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'labsisEG',
  user: process.env.DB_USER || 'labsis',
  password: process.env.DB_PASSWORD || 'labsis'
});

async function checkColumns() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 VERIFICANDO COLUMNAS DE TABLAS PRINCIPALES\n');
    console.log('═══════════════════════════════════════════════════════════════\n');

    // Lista de tablas a verificar
    const tablesToCheck = [
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

    for (const table of tablesToCheck) {
      console.log(`📋 TABLA: ${table}`);
      console.log('─────────────────────────────────────────────────────');

      // Verificar si la tabla existe
      const tableExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        )
      `, [table]);

      if (!tableExists.rows[0].exists) {
        console.log(`  ❌ Tabla no existe\n`);
        continue;
      }

      // Obtener columnas
      const columns = await client.query(`
        SELECT 
          column_name,
          data_type,
          character_maximum_length,
          numeric_precision,
          numeric_scale,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_schema = 'public' 
          AND table_name = $1
        ORDER BY ordinal_position
      `, [table]);

      console.log(`  Total columnas: ${columns.rows.length}\n`);
      console.log('  Columnas:');
      
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
        
        const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
        const defaultVal = col.column_default ? ` DEFAULT: ${col.column_default.substring(0, 30)}` : '';
        
        console.log(`    • ${col.column_name.padEnd(30)} ${dataType.padEnd(25)} ${nullable}${defaultVal}`);
      });

      // Contar registros
      try {
        const count = await client.query(`SELECT COUNT(*) as total FROM ${table}`);
        console.log(`\n  Total registros: ${count.rows[0].total}`);
      } catch (e) {
        console.log(`\n  No se pudo contar registros: ${e.message}`);
      }

      console.log('\n');
    }

    // Verificar específicamente tabla área con todas sus variaciones
    console.log('📋 VERIFICANDO VARIACIONES DE TABLA ÁREA');
    console.log('─────────────────────────────────────────────────────');
    
    const areaVariations = ['area', 'areas', 'departamento', 'departamento_laboratorio'];
    
    for (const variation of areaVariations) {
      const exists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        )
      `, [variation]);
      
      if (exists.rows[0].exists) {
        const count = await client.query(`SELECT COUNT(*) as total FROM ${variation}`);
        console.log(`  ✓ ${variation}: ${count.rows[0].total} registros`);
        
        // Verificar si tiene columna nombre
        const hasNombre = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = $1
            AND column_name = 'nombre'
          )
        `, [variation]);
        
        if (hasNombre.rows[0].exists) {
          const sample = await client.query(`SELECT nombre FROM ${variation} LIMIT 3`);
          console.log(`    Ejemplos: ${sample.rows.map(r => r.nombre).join(', ')}`);
        }
      }
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkColumns();