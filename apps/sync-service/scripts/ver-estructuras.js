import { query } from '../src/database/connection.js';

async function verEstructuras() {
  try {
    console.log('📊 ESTRUCTURAS DE TABLAS\n');
    console.log('='.repeat(80));

    // Tabla gp_has_prueba
    console.log('\n📋 Tabla: gp_has_prueba\n');
    const ghp = await query(`
      SELECT column_name, data_type, is_nullable, table_schema
      FROM information_schema.columns
      WHERE table_name = 'gp_has_prueba'
      ORDER BY ordinal_position
    `);

    if (ghp.rows.length === 0) {
      console.log('   ⚠️ Tabla no encontrada o sin columnas');
    } else {
      console.log(`   Schema: ${ghp.rows[0].table_schema}\n`);
      ghp.rows.forEach(col => {
        console.log(`   ${col.column_name.padEnd(30)} ${col.data_type.padEnd(20)} ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
    }

    // Tabla gp_has_gp
    console.log('\n📋 Tabla: gp_has_gp\n');
    const ghg = await query(`
      SELECT column_name, data_type, is_nullable, table_schema
      FROM information_schema.columns
      WHERE table_name = 'gp_has_gp'
      ORDER BY ordinal_position
    `);

    if (ghg.rows.length === 0) {
      console.log('   ⚠️ Tabla no encontrada o sin columnas');
    } else {
      console.log(`   Schema: ${ghg.rows[0].table_schema}\n`);
      ghg.rows.forEach(col => {
        console.log(`   ${col.column_name.padEnd(30)} ${col.data_type.padEnd(20)} ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
    }

    // Tabla prueba
    console.log('\n📋 Tabla: prueba (solo algunas columnas relevantes)\n');
    const prueba = await query(`
      SELECT column_name, data_type, is_nullable, table_schema
      FROM information_schema.columns
      WHERE table_name = 'prueba'
      AND column_name IN ('id', 'nombre', 'nomenclatura', 'reportable', 'activa')
      ORDER BY ordinal_position
    `);

    if (prueba.rows.length > 0) {
      console.log(`   Schema: ${prueba.rows[0].table_schema}\n`);
      prueba.rows.forEach(col => {
        console.log(`   ${col.column_name.padEnd(30)} ${col.data_type.padEnd(20)} ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
    }

    // Tabla grupo_prueba
    console.log('\n📋 Tabla: grupo_prueba (solo algunas columnas relevantes)\n');
    const grupo = await query(`
      SELECT column_name, data_type, is_nullable, table_schema
      FROM information_schema.columns
      WHERE table_name = 'grupo_prueba'
      AND column_name IN ('id', 'nombre', 'codigo_caja', 'activa')
      ORDER BY ordinal_position
    `);

    if (grupo.rows.length > 0) {
      console.log(`   Schema: ${grupo.rows[0].table_schema}\n`);
      grupo.rows.forEach(col => {
        console.log(`   ${col.column_name.padEnd(30)} ${col.data_type.padEnd(20)} ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
      });
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ Estructuras mostradas\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

verEstructuras();
