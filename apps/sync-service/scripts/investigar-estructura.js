import { query } from '../src/database/connection.js';
import config from '../src/config.js';

async function investigar() {
  try {
    console.log('📊 INVESTIGANDO ESTRUCTURA DE TABLAS\n');
    console.log('='.repeat(60));

    // 1. Ver distribución real de pruebas vs grupos
    console.log('\n1️⃣  DISTRIBUCIÓN DE PRUEBAS VS GRUPOS EN LISTA PRECIOS 27:\n');

    const distPruebas = await query(`
      SELECT COUNT(*) as total
      FROM lista_precios_has_prueba lpp
      INNER JOIN prueba p ON lpp.prueba_id = p.id
      WHERE lpp.lista_precios_id = $1 AND p.activa = true
    `, [27]);

    const distGrupos = await query(`
      SELECT COUNT(*) as total
      FROM lista_precios_has_gprueba lpg
      INNER JOIN grupo_prueba gp ON lpg.gprueba_id = gp.id
      WHERE lpg.lista_precios_id = $1 AND gp.activa = true
    `, [27]);

    console.log(`   ✅ Pruebas individuales: ${distPruebas.rows[0].total}`);
    console.log(`   ✅ Grupos/Perfiles: ${distGrupos.rows[0].total}`);
    console.log(`   ✅ TOTAL: ${parseInt(distPruebas.rows[0].total) + parseInt(distGrupos.rows[0].total)}`);

    // 2. Buscar HEMATOLOGIA (búsqueda más amplia)
    console.log('\n2️⃣  BÚSQUEDA: ESTUDIOS CON "HEMATOLOGIA" EN EL NOMBRE:\n');

    const hemaPrueba = await query(`
      SELECT p.id, p.nombre, p.nomenclatura, 'Prueba Individual' as tipo
      FROM prueba p
      INNER JOIN lista_precios_has_prueba lpp ON p.id = lpp.prueba_id
      WHERE p.nombre ILIKE '%hematolog%'
        AND lpp.lista_precios_id = $1
        AND p.activa = true
      LIMIT 5
    `, [27]);

    const hemaGrupo = await query(`
      SELECT gp.id, gp.nombre, gp.codigo_caja, 'Perfil/Paquete' as tipo
      FROM grupo_prueba gp
      INNER JOIN lista_precios_has_gprueba lpg ON gp.id = lpg.gprueba_id
      WHERE gp.nombre ILIKE '%hematolog%'
        AND lpg.lista_precios_id = $1
        AND gp.activa = true
      LIMIT 5
    `, [27]);

    if (hemaPrueba.rows.length > 0) {
      console.log('   📌 Encontrado en PRUEBA:');
      hemaPrueba.rows.forEach(row => {
        console.log(`      ID: ${row.id}, Nombre: ${row.nombre}, Tipo: ${row.tipo}`);
      });
    }

    if (hemaGrupo.rows.length > 0) {
      console.log('   📌 Encontrado en GRUPO_PRUEBA:');
      hemaGrupo.rows.forEach(row => {
        console.log(`      ID: ${row.id}, Nombre: ${row.nombre}, Tipo: ${row.tipo}`);
      });

      // Ver qué pruebas contiene
      for (const grupo of hemaGrupo.rows) {
        console.log(`\n   📋 PRUEBAS QUE CONTIENE EL GRUPO "${grupo.nombre}" (ID: ${grupo.id}):\n`);

        // Primero ver la estructura de gp_has_prueba
        const estructuraGHP = await query(`
          SELECT column_name, data_type
          FROM information_schema.columns
          WHERE table_name = 'gp_has_prueba'
          AND table_schema = 'laboratorio'
          ORDER BY ordinal_position
        `);

        console.log(`\n      📋 Estructura de gp_has_prueba:`);
        estructuraGHP.rows.forEach(col => {
          console.log(`         ${col.column_name}: ${col.data_type}`);
        });

        const pruebas = await query(`
          SELECT p.id, p.nombre, p.nomenclatura, p.reportable
          FROM gp_has_prueba ghp
          INNER JOIN prueba p ON ghp.prueba_id = p.id
          WHERE ghp.gp_id = $1
          ORDER BY p.nombre
        `, [grupo.id]);

        console.log(`      Total de pruebas: ${pruebas.rows.length}`);
        console.log(`      Reportables: ${pruebas.rows.filter(p => p.reportable).length}`);
        console.log('\n      Primeras 10 pruebas:');
        pruebas.rows.slice(0, 10).forEach((p, idx) => {
          console.log(`      ${idx + 1}. ${p.nombre} (${p.nomenclatura}) - Reportable: ${p.reportable ? '✅' : '❌'}`);
        });

        if (pruebas.rows.length > 10) {
          console.log(`      ... y ${pruebas.rows.length - 10} pruebas más`);
        }
      }
    }

    // 3. Ver si hay grupos anidados
    console.log('\n3️⃣  GRUPOS ANIDADOS (gp_has_gp):\n');

    const anidados = await query(`
      SELECT COUNT(*) as total
      FROM gp_has_gp
    `);

    console.log(`   Total relaciones grupo→grupo: ${anidados.rows[0].total}`);

    if (parseInt(anidados.rows[0].total) > 0) {
      // Primero necesito ver la estructura de gp_has_gp
      const estructura = await query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'gp_has_gp'
        AND table_schema = 'laboratorio'
        ORDER BY ordinal_position
      `);

      console.log('\n   📋 Estructura de gp_has_gp:');
      estructura.rows.forEach(col => {
        console.log(`      ${col.column_name}: ${col.data_type}`);
      });
    }

    // 4. Ver ejemplo de un grupo con precio
    console.log('\n4️⃣  EJEMPLO DE GRUPO CON PRECIO:\n');

    const ejemploGrupo = await query(`
      SELECT
        gp.id,
        gp.codigo_caja,
        gp.nombre,
        lpg.precio,
        gp.descripcion
      FROM grupo_prueba gp
      INNER JOIN lista_precios_has_gprueba lpg ON gp.id = lpg.gprueba_id
      WHERE lpg.lista_precios_id = $1 AND gp.activa = true
      LIMIT 1
    `, [27]);

    if (ejemploGrupo.rows.length > 0) {
      const grupo = ejemploGrupo.rows[0];
      console.log(`   Grupo: ${grupo.nombre}`);
      console.log(`   ID: ${grupo.id}`);
      console.log(`   Código: ${grupo.codigo_caja}`);
      console.log(`   Precio: $${grupo.precio}`);

      const pruebasGrupo = await query(`
        SELECT p.nombre, p.nomenclatura, p.reportable
        FROM gp_has_prueba ghp
        INNER JOIN prueba p ON ghp.prueba_id = p.id
        WHERE ghp.gp_id = $1
        ORDER BY p.nombre
      `, [grupo.id]);

      console.log(`   Contiene ${pruebasGrupo.rows.length} pruebas`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Investigación completada\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

investigar();
