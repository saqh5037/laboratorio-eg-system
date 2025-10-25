// Script para consultar las tablas principales del sistema Labsis
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

async function queryMainTables() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 ANALIZANDO TABLAS PRINCIPALES DE LABSIS\n');
    console.log('═══════════════════════════════════════════════════════════════\n');

    // 1. TABLA PRUEBA (Estudios)
    console.log('📋 TABLA: prueba (Estudios individuales)');
    console.log('─────────────────────────────────────────────────────');
    
    const pruebaInfo = await client.query(`
      SELECT 
        column_name,
        data_type,
        character_maximum_length,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'prueba'
      ORDER BY ordinal_position
      LIMIT 20
    `);
    
    console.log('Columnas principales:');
    pruebaInfo.rows.forEach(col => {
      const type = col.character_maximum_length 
        ? `${col.data_type}(${col.character_maximum_length})`
        : col.data_type;
      console.log(`  • ${col.column_name.padEnd(25)} ${type.padEnd(25)} ${col.is_nullable}`);
    });

    const pruebaCount = await client.query('SELECT COUNT(*) as total FROM prueba');
    console.log(`\nTotal de registros: ${pruebaCount.rows[0].total}`);

    // Muestra de datos
    const pruebasSample = await client.query(`
      SELECT id, codigo, nombre, precio 
      FROM prueba 
      WHERE activo = true
      ORDER BY nombre 
      LIMIT 5
    `);
    
    console.log('\nEjemplos de pruebas:');
    pruebasSample.rows.forEach(p => {
      console.log(`  ${p.id.toString().padEnd(6)} ${p.codigo?.padEnd(15) || 'N/A'.padEnd(15)} ${p.nombre?.substring(0, 40).padEnd(40)} $${p.precio || 0}`);
    });

    // 2. TABLA GRUPO_PRUEBA (Perfiles/Paquetes)
    console.log('\n\n📋 TABLA: grupo_prueba (Perfiles/Paquetes)');
    console.log('─────────────────────────────────────────────────────');
    
    const grupoInfo = await client.query(`
      SELECT 
        column_name,
        data_type,
        character_maximum_length,
        is_nullable
      FROM information_schema.columns
      WHERE table_name = 'grupo_prueba'
      ORDER BY ordinal_position
      LIMIT 15
    `);
    
    console.log('Columnas principales:');
    grupoInfo.rows.forEach(col => {
      const type = col.character_maximum_length 
        ? `${col.data_type}(${col.character_maximum_length})`
        : col.data_type;
      console.log(`  • ${col.column_name.padEnd(25)} ${type.padEnd(25)} ${col.is_nullable}`);
    });

    const grupoCount = await client.query('SELECT COUNT(*) as total FROM grupo_prueba');
    console.log(`\nTotal de registros: ${grupoCount.rows[0].total}`);

    // Muestra de grupos
    const gruposSample = await client.query(`
      SELECT id, codigo, nombre, precio 
      FROM grupo_prueba 
      WHERE activo = true
      ORDER BY nombre 
      LIMIT 5
    `);
    
    console.log('\nEjemplos de grupos:');
    gruposSample.rows.forEach(g => {
      console.log(`  ${g.id.toString().padEnd(6)} ${g.codigo?.padEnd(15) || 'N/A'.padEnd(15)} ${g.nombre?.substring(0, 40).padEnd(40)} $${g.precio || 0}`);
    });

    // 3. RELACIÓN GRUPO-PRUEBA
    console.log('\n\n📋 TABLA: gp_has_prueba (Relación Grupo-Prueba)');
    console.log('─────────────────────────────────────────────────────');
    
    const relCount = await client.query('SELECT COUNT(*) as total FROM gp_has_prueba');
    console.log(`Total de relaciones: ${relCount.rows[0].total}`);

    // Ejemplo de grupo con sus pruebas
    const grupoEjemplo = await client.query(`
      SELECT 
        gp.nombre as grupo,
        COUNT(ghp.prueba_id) as total_pruebas
      FROM grupo_prueba gp
      JOIN gp_has_prueba ghp ON gp.id = ghp.grupo_prueba_id
      WHERE gp.activo = true
      GROUP BY gp.id, gp.nombre
      ORDER BY total_pruebas DESC
      LIMIT 5
    `);
    
    console.log('\nGrupos con más pruebas:');
    grupoEjemplo.rows.forEach(g => {
      console.log(`  • ${g.grupo?.substring(0, 50).padEnd(50)} ${g.total_pruebas} pruebas`);
    });

    // 4. LISTAS DE PRECIOS
    console.log('\n\n📋 TABLA: lista_precios (Tarifarios)');
    console.log('─────────────────────────────────────────────────────');
    
    const listasCount = await client.query('SELECT COUNT(*) as total FROM lista_precios');
    console.log(`Total de listas: ${listasCount.rows[0].total}`);

    const listas = await client.query(`
      SELECT id, nombre, descripcion, activo
      FROM lista_precios
      ORDER BY id
      LIMIT 10
    `);
    
    console.log('\nListas de precios disponibles:');
    listas.rows.forEach(l => {
      const status = l.activo ? '✓' : '✗';
      console.log(`  ${status} ${l.id.toString().padEnd(4)} ${l.nombre?.padEnd(30)} ${l.descripcion || ''}`);
    });

    // 5. PRECIOS POR LISTA
    console.log('\n\n📋 TABLA: lista_precios_has_prueba (Precios por lista)');
    console.log('─────────────────────────────────────────────────────');
    
    const preciosCount = await client.query('SELECT COUNT(*) as total FROM lista_precios_has_prueba');
    console.log(`Total de precios configurados: ${preciosCount.rows[0].total}`);

    // Ejemplo de precios diferentes por lista
    const preciosEjemplo = await client.query(`
      SELECT 
        p.nombre as prueba,
        lp.nombre as lista,
        lph.precio
      FROM lista_precios_has_prueba lph
      JOIN prueba p ON lph.prueba_id = p.id
      JOIN lista_precios lp ON lph.lista_precios_id = lp.id
      WHERE p.id IN (SELECT id FROM prueba WHERE activo = true LIMIT 1)
      ORDER BY lp.id
      LIMIT 5
    `);
    
    console.log('\nEjemplo de precios por lista:');
    preciosEjemplo.rows.forEach(p => {
      console.log(`  ${p.prueba?.substring(0, 40).padEnd(40)} | ${p.lista?.padEnd(25)} | $${p.precio}`);
    });

    // 6. ÁREAS Y DEPARTAMENTOS
    console.log('\n\n📋 TABLA: area');
    console.log('─────────────────────────────────────────────────────');
    
    const areasCount = await client.query('SELECT COUNT(*) as total FROM area');
    console.log(`Total de áreas: ${areasCount.rows[0].total}`);

    const areas = await client.query(`
      SELECT id, nombre
      FROM area
      WHERE activo = true
      ORDER BY nombre
      LIMIT 10
    `);
    
    console.log('\nÁreas disponibles:');
    areas.rows.forEach(a => {
      console.log(`  • ${a.nombre}`);
    });

    // 7. TIPOS DE MUESTRA
    console.log('\n\n📋 TABLA: tipo_muestra');
    console.log('─────────────────────────────────────────────────────');
    
    const tiposCount = await client.query('SELECT COUNT(*) as total FROM tipo_muestra');
    console.log(`Total de tipos de muestra: ${tiposCount.rows[0].total}`);

    const tipos = await client.query(`
      SELECT id, nombre, descripcion
      FROM tipo_muestra
      WHERE activo = true
      ORDER BY nombre
      LIMIT 10
    `);
    
    console.log('\nTipos de muestra:');
    tipos.rows.forEach(t => {
      console.log(`  • ${t.nombre?.padEnd(20)} ${t.descripcion || ''}`);
    });

    // 8. ESTADÍSTICAS GENERALES
    console.log('\n\n📊 ESTADÍSTICAS GENERALES');
    console.log('═══════════════════════════════════════════════════════════════');
    
    const stats = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM prueba WHERE activo = true) as pruebas_activas,
        (SELECT COUNT(*) FROM grupo_prueba WHERE activo = true) as grupos_activos,
        (SELECT COUNT(*) FROM lista_precios WHERE activo = true) as listas_activas,
        (SELECT COUNT(*) FROM paciente) as total_pacientes,
        (SELECT COUNT(*) FROM orden_trabajo) as total_ordenes,
        (SELECT COUNT(*) FROM usuario WHERE activo = true) as usuarios_activos
    `);
    
    const s = stats.rows[0];
    console.log(`
  Pruebas activas:     ${s.pruebas_activas}
  Grupos activos:      ${s.grupos_activos}
  Listas de precios:   ${s.listas_activas}
  Total pacientes:     ${s.total_pacientes}
  Total órdenes:       ${s.total_ordenes}
  Usuarios activos:    ${s.usuarios_activos}
    `);

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.detail) console.error('Detalle:', error.detail);
  } finally {
    client.release();
    await pool.end();
  }
}

queryMainTables();