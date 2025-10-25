// Script optimizado para consultar la estructura real de Labsis
import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'labsisEG',
  user: process.env.DB_USER || 'labsis',
  password: process.env.DB_PASSWORD || 'labsis'
});

async function analyzeLabsisStructure() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 ANÁLISIS DE LA ESTRUCTURA REAL DE LABSIS\n');
    console.log('═══════════════════════════════════════════════════════════════\n');

    // 1. PRUEBAS (Estudios)
    console.log('📋 1. TABLA PRUEBA - Estudios Individuales');
    console.log('─────────────────────────────────────────────────────');
    
    const pruebasSample = await client.query(`
      SELECT 
        p.id,
        p.nomenclatura as codigo,
        p.nombre,
        p.precio,
        p.precio2,
        a.nombre as area,
        tm.nombre as tipo_muestra,
        p.activa as activo
      FROM prueba p
      LEFT JOIN area a ON p.area_id = a.id
      LEFT JOIN tipo_muestra tm ON p.tipo_muestra_id = tm.id
      WHERE p.activa = true
      ORDER BY p.nombre
      LIMIT 10
    `);
    
    console.log('Ejemplos de pruebas:');
    console.log('ID     Código          Nombre                                    Precio    Área');
    console.log('────────────────────────────────────────────────────────────────────────────────');
    pruebasSample.rows.forEach(p => {
      console.log(
        `${p.id.toString().padEnd(6)} ` +
        `${(p.codigo || 'N/A').padEnd(15)} ` +
        `${p.nombre.substring(0, 40).padEnd(41)} ` +
        `$${(p.precio || 0).toString().padEnd(8)} ` +
        `${(p.area || 'N/A').substring(0, 20)}`
      );
    });

    // 2. GRUPOS DE PRUEBAS (Perfiles)
    console.log('\n\n📋 2. TABLA GRUPO_PRUEBA - Perfiles/Paquetes');
    console.log('─────────────────────────────────────────────────────');
    
    const gruposSample = await client.query(`
      SELECT 
        gp.id,
        gp.codigo,
        gp.nombre,
        gp.precio,
        gp.activo,
        COUNT(ghp.prueba_id) as total_pruebas
      FROM grupo_prueba gp
      LEFT JOIN gp_has_prueba ghp ON gp.id = ghp.grupo_prueba_id
      WHERE gp.activo = true
      GROUP BY gp.id, gp.codigo, gp.nombre, gp.precio, gp.activo
      ORDER BY gp.nombre
      LIMIT 10
    `);
    
    console.log('Ejemplos de grupos/perfiles:');
    console.log('ID     Código          Nombre                                    Precio    Pruebas');
    console.log('──────────────────────────────────────────────────────────────────────────────────');
    gruposSample.rows.forEach(g => {
      console.log(
        `${g.id.toString().padEnd(6)} ` +
        `${(g.codigo || 'N/A').padEnd(15)} ` +
        `${g.nombre.substring(0, 40).padEnd(41)} ` +
        `$${(g.precio || 0).toString().padEnd(8)} ` +
        `${g.total_pruebas} pruebas`
      );
    });

    // 3. RELACIONES GRUPO-PRUEBA
    console.log('\n\n📋 3. RELACIÓN GRUPO_PRUEBA ↔ PRUEBA');
    console.log('─────────────────────────────────────────────────────');
    
    // Ejemplo detallado de un grupo
    const grupoDetalle = await client.query(`
      SELECT 
        gp.nombre as grupo,
        p.nomenclatura as codigo_prueba,
        p.nombre as prueba
      FROM grupo_prueba gp
      JOIN gp_has_prueba ghp ON gp.id = ghp.grupo_prueba_id
      JOIN prueba p ON ghp.prueba_id = p.id
      WHERE gp.activo = true
        AND p.activa = true
        AND gp.id = (SELECT id FROM grupo_prueba WHERE activo = true LIMIT 1)
      ORDER BY p.nombre
      LIMIT 10
    `);
    
    if (grupoDetalle.rows.length > 0) {
      console.log(`\nEjemplo - Grupo: ${grupoDetalle.rows[0].grupo}`);
      console.log('Pruebas incluidas:');
      grupoDetalle.rows.forEach(d => {
        console.log(`  • ${(d.codigo_prueba || 'N/A').padEnd(15)} ${d.prueba}`);
      });
    }

    // 4. LISTAS DE PRECIOS
    console.log('\n\n📋 4. LISTAS DE PRECIOS - Tarifarios');
    console.log('─────────────────────────────────────────────────────');
    
    const listas = await client.query(`
      SELECT 
        lp.id,
        lp.nombre,
        lp.descripcion,
        lp.activo,
        COUNT(DISTINCT lph.prueba_id) as total_pruebas,
        COUNT(DISTINCT lpg.grupo_prueba_id) as total_grupos
      FROM lista_precios lp
      LEFT JOIN lista_precios_has_prueba lph ON lp.id = lph.lista_precios_id
      LEFT JOIN lista_precios_has_gprueba lpg ON lp.id = lpg.lista_precios_id
      GROUP BY lp.id, lp.nombre, lp.descripcion, lp.activo
      ORDER BY lp.id
      LIMIT 15
    `);
    
    console.log('Listas de precios disponibles:');
    console.log('ID   Nombre                          Pruebas  Grupos  Estado');
    console.log('──────────────────────────────────────────────────────────────');
    listas.rows.forEach(l => {
      const estado = l.activo ? '✓ Activo' : '✗ Inactivo';
      console.log(
        `${l.id.toString().padEnd(4)} ` +
        `${(l.nombre || 'Sin nombre').substring(0, 30).padEnd(31)} ` +
        `${l.total_pruebas.toString().padEnd(8)} ` +
        `${l.total_grupos.toString().padEnd(7)} ` +
        `${estado}`
      );
    });

    // 5. COMPARACIÓN DE PRECIOS
    console.log('\n\n📋 5. COMPARACIÓN DE PRECIOS POR LISTA');
    console.log('─────────────────────────────────────────────────────');
    
    const comparacionPrecios = await client.query(`
      SELECT 
        p.nombre as prueba,
        p.precio as precio_base,
        MAX(CASE WHEN lph.lista_precios_id = 1 THEN lph.precio END) as lista_1,
        MAX(CASE WHEN lph.lista_precios_id = 2 THEN lph.precio END) as lista_2,
        MAX(CASE WHEN lph.lista_precios_id = 3 THEN lph.precio END) as lista_3
      FROM prueba p
      LEFT JOIN lista_precios_has_prueba lph ON p.id = lph.prueba_id
      WHERE p.activa = true
        AND p.id IN (SELECT id FROM prueba WHERE activa = true ORDER BY nombre LIMIT 5)
      GROUP BY p.id, p.nombre, p.precio
      ORDER BY p.nombre
    `);
    
    console.log('Comparación de precios (primeras 5 pruebas):');
    console.log('Prueba                                    Base      Lista 1   Lista 2   Lista 3');
    console.log('────────────────────────────────────────────────────────────────────────────────');
    comparacionPrecios.rows.forEach(p => {
      console.log(
        `${p.prueba.substring(0, 40).padEnd(41)} ` +
        `$${(p.precio_base || 0).toFixed(2).padEnd(8)} ` +
        `$${(p.lista_1 || 0).toFixed(2).padEnd(8)} ` +
        `$${(p.lista_2 || 0).toFixed(2).padEnd(8)} ` +
        `$${(p.lista_3 || 0).toFixed(2)}`
      );
    });

    // 6. ÁREAS Y DEPARTAMENTOS
    console.log('\n\n📋 6. ÁREAS Y DEPARTAMENTOS');
    console.log('─────────────────────────────────────────────────────');
    
    const areas = await client.query(`
      SELECT 
        a.id,
        a.nombre,
        a.formato,
        COUNT(p.id) as total_pruebas
      FROM area a
      LEFT JOIN prueba p ON a.id = p.area_id AND p.activa = true
      WHERE a.activo = true
      GROUP BY a.id, a.nombre, a.formato
      ORDER BY a.nombre
      LIMIT 15
    `);
    
    console.log('Áreas del laboratorio:');
    areas.rows.forEach(a => {
      console.log(`  ${a.id.toString().padEnd(4)} ${a.nombre.padEnd(30)} (${a.total_pruebas} pruebas)`);
    });

    // 7. TIPOS DE MUESTRA Y CONTENEDORES
    console.log('\n\n📋 7. TIPOS DE MUESTRA Y CONTENEDORES');
    console.log('─────────────────────────────────────────────────────');
    
    const tiposMuestra = await client.query(`
      SELECT 
        tm.id,
        tm.nombre,
        tm.descripcion,
        COUNT(p.id) as total_pruebas
      FROM tipo_muestra tm
      LEFT JOIN prueba p ON tm.id = p.tipo_muestra_id AND p.activa = true
      WHERE tm.activo = true
      GROUP BY tm.id, tm.nombre, tm.descripcion
      ORDER BY total_pruebas DESC
      LIMIT 10
    `);
    
    console.log('Tipos de muestra más utilizados:');
    tiposMuestra.rows.forEach(t => {
      console.log(`  • ${t.nombre.padEnd(25)} (${t.total_pruebas} pruebas) ${t.descripcion || ''}`);
    });

    // 8. ESTADÍSTICAS FINALES
    console.log('\n\n📊 ESTADÍSTICAS GENERALES DEL SISTEMA');
    console.log('═══════════════════════════════════════════════════════════════');
    
    const stats = await client.query(`
      SELECT 
        (SELECT COUNT(*) FROM prueba WHERE activa = true) as pruebas_activas,
        (SELECT COUNT(*) FROM prueba WHERE activa = false) as pruebas_inactivas,
        (SELECT COUNT(*) FROM grupo_prueba WHERE activo = true) as grupos_activos,
        (SELECT COUNT(*) FROM lista_precios WHERE activo = true) as listas_activas,
        (SELECT COUNT(*) FROM area WHERE activo = true) as areas_activas,
        (SELECT COUNT(*) FROM tipo_muestra WHERE activo = true) as tipos_muestra,
        (SELECT COUNT(*) FROM tipo_contenedor WHERE activo = true) as tipos_contenedor,
        (SELECT COUNT(*) FROM paciente) as total_pacientes,
        (SELECT COUNT(*) FROM orden_trabajo) as total_ordenes,
        (SELECT COUNT(*) FROM usuario WHERE activo = true) as usuarios_activos,
        (SELECT COUNT(DISTINCT tabla) FROM (
          SELECT table_name as tabla 
          FROM information_schema.tables 
          WHERE table_schema = 'public'
        ) t) as total_tablas
    `);
    
    const s = stats.rows[0];
    console.log(`
  Total de tablas en el sistema:     ${s.total_tablas}
  ─────────────────────────────────────────
  Pruebas activas:                   ${s.pruebas_activas}
  Pruebas inactivas:                 ${s.pruebas_inactivas}
  Grupos/Perfiles activos:           ${s.grupos_activos}
  Listas de precios activas:         ${s.listas_activas}
  Áreas activas:                     ${s.areas_activas}
  Tipos de muestra:                  ${s.tipos_muestra}
  Tipos de contenedor:               ${s.tipos_contenedor}
  ─────────────────────────────────────────
  Total de pacientes:                ${s.total_pacientes}
  Total de órdenes de trabajo:       ${s.total_ordenes}
  Usuarios activos:                  ${s.usuarios_activos}
    `);

    // Guardar estructura en JSON
    const estructura = {
      timestamp: new Date().toISOString(),
      database: process.env.DB_NAME,
      tablas_principales: {
        prueba: {
          total: s.pruebas_activas,
          columnas_clave: ['id', 'nomenclatura', 'nombre', 'precio', 'area_id', 'tipo_muestra_id']
        },
        grupo_prueba: {
          total: s.grupos_activos,
          columnas_clave: ['id', 'codigo', 'nombre', 'precio']
        },
        lista_precios: {
          total: s.listas_activas,
          relaciones: ['lista_precios_has_prueba', 'lista_precios_has_gprueba']
        }
      },
      estadisticas: s
    };

    const outputPath = path.join(__dirname, '..', 'data', 'labsis-structure.json');
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(estructura, null, 2));
    
    console.log(`\n✅ Estructura guardada en: ${outputPath}`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.detail) console.error('Detalle:', error.detail);
  } finally {
    client.release();
    await pool.end();
  }
}

analyzeLabsisStructure();