#!/usr/bin/env node

/**
 * Script de verificación de conexión a labsisEG
 * Valida que todo está configurado correctamente antes de iniciar el servicio
 */

import dotenv from 'dotenv';
import pg from 'pg';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: join(__dirname, '..', '.env') });

const { Pool } = pg;

const config = {
  host: process.env.LABSIS_HOST || 'localhost',
  port: parseInt(process.env.LABSIS_PORT) || 5432,
  database: process.env.LABSIS_DB || 'labsisEG',
  user: process.env.LABSIS_USER || 'postgres',
  password: process.env.LABSIS_PASSWORD,
};

async function verifyDatabase() {
  console.log('\n' + '='.repeat(60));
  console.log('🔍 VERIFICACIÓN DE BASE DE DATOS LABSIS');
  console.log('='.repeat(60) + '\n');

  const pool = new Pool(config);

  try {
    // 1. Verificar conexión
    console.log('📡 Verificando conexión...');
    const timeResult = await pool.query('SELECT NOW() as timestamp, version() as version');
    console.log('   ✅ Conectado exitosamente');
    console.log(`   📅 Timestamp: ${timeResult.rows[0].timestamp.toISOString()}`);
    console.log(`   🐘 PostgreSQL: ${timeResult.rows[0].version.split(',')[0]}\n`);

    // 2. Verificar base de datos
    const dbResult = await pool.query('SELECT current_database() as db');
    const dbName = dbResult.rows[0].db;
    console.log(`📊 Base de datos: ${dbName}`);

    if (dbName !== 'labsisEG') {
      console.log(`   ⚠️  ADVERTENCIA: Se esperaba 'labsisEG' pero está conectado a '${dbName}'`);
    } else {
      console.log('   ✅ Nombre correcto\n');
    }

    // 3. Verificar tablas principales
    console.log('📋 Verificando tablas principales...');
    const tablesQuery = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN (
        'prueba',
        'grupo_prueba',
        'lista_precios',
        'lista_precios_has_prueba',
        'lista_precios_has_gprueba',
        'area'
      )
      ORDER BY table_name
    `;
    const tables = await pool.query(tablesQuery);
    console.log(`   ✅ Tablas encontradas: ${tables.rows.length}/6`);
    tables.rows.forEach(t => console.log(`      - ${t.table_name}`));

    if (tables.rows.length < 6) {
      console.log('\n   ⚠️  ADVERTENCIA: No se encontraron todas las tablas necesarias');
    }
    console.log('');

    // 4. Verificar lista de precios ID 27
    console.log('💰 Verificando lista de precios ID 27...');
    const listaPreciosQuery = `
      SELECT id, nombre, descripcion, fecha_inicio, activo
      FROM lista_precios
      WHERE id = 27
    `;
    const lista = await pool.query(listaPreciosQuery);

    if (lista.rows.length === 0) {
      console.log('   ❌ Lista de precios ID 27 NO ENCONTRADA');
      console.log('   ⚠️  El servicio no funcionará correctamente sin esta lista\n');
    } else {
      const l = lista.rows[0];
      console.log('   ✅ Lista encontrada:');
      console.log(`      Nombre: ${l.nombre}`);
      console.log(`      Descripción: ${l.descripcion || 'N/A'}`);
      console.log(`      Fecha inicio: ${l.fecha_inicio || 'N/A'}`);
      console.log(`      Activo: ${l.activo ? 'Sí' : 'No'}\n`);
    }

    // 5. Contar estudios en lista ID 27
    console.log('📈 Estadísticas de estudios...');
    const statsQuery = `
      SELECT
        (SELECT COUNT(*) FROM prueba WHERE activa = true) as pruebas_activas,
        (SELECT COUNT(*) FROM grupo_prueba WHERE activa = true) as grupos_activos,
        COUNT(DISTINCT lpp.prueba_id) as pruebas_en_lista,
        COUNT(DISTINCT lpg.gprueba_id) as grupos_en_lista
      FROM lista_precios lp
      LEFT JOIN lista_precios_has_prueba lpp ON lpp.lista_precios_id = lp.id
      LEFT JOIN lista_precios_has_gprueba lpg ON lpg.lista_precios_id = lp.id
      WHERE lp.id = 27
    `;
    const stats = await pool.query(statsQuery);
    const s = stats.rows[0];

    console.log(`   📊 Pruebas activas en BD: ${s.pruebas_activas}`);
    console.log(`   📦 Grupos activos en BD: ${s.grupos_activos}`);
    console.log(`   💵 Pruebas en lista ID 27: ${s.pruebas_en_lista}`);
    console.log(`   💵 Grupos en lista ID 27: ${s.grupos_en_lista}`);
    console.log(`   🎯 Total en lista: ${parseInt(s.pruebas_en_lista) + parseInt(s.grupos_en_lista)}\n`);

    // 6. Verificar triggers instalados
    console.log('🔧 Verificando triggers...');
    const triggersQuery = `
      SELECT trigger_name, event_object_table, action_timing
      FROM information_schema.triggers
      WHERE trigger_schema = 'public'
      AND trigger_name IN (
        'trigger_prueba_cambio',
        'trigger_grupo_prueba_cambio',
        'trigger_precio_prueba_cambio',
        'trigger_precio_grupo_cambio'
      )
      ORDER BY event_object_table
    `;
    const triggers = await pool.query(triggersQuery);

    console.log(`   Triggers instalados: ${triggers.rows.length}/4`);

    if (triggers.rows.length === 0) {
      console.log('   ❌ NO HAY TRIGGERS INSTALADOS');
      console.log('   ⚠️  Ejecutar: npm run install-triggers\n');
    } else if (triggers.rows.length < 4) {
      console.log('   ⚠️  FALTAN ALGUNOS TRIGGERS');
      triggers.rows.forEach(t => {
        console.log(`      ✅ ${t.trigger_name} en ${t.event_object_table}`);
      });
      console.log('   ⚠️  Ejecutar: npm run install-triggers\n');
    } else {
      triggers.rows.forEach(t => {
        console.log(`      ✅ ${t.trigger_name} en ${t.event_object_table}`);
      });
      console.log('');
    }

    // 7. Verificar función NOTIFY
    console.log('📢 Verificando función de notificación...');
    const funcQuery = `
      SELECT routine_name
      FROM information_schema.routines
      WHERE routine_schema = 'public'
      AND routine_name = 'notificar_cambio_precios'
    `;
    const func = await pool.query(funcQuery);

    if (func.rows.length === 0) {
      console.log('   ❌ Función notificar_cambio_precios() NO ENCONTRADA');
      console.log('   ⚠️  Ejecutar: npm run install-triggers\n');
    } else {
      console.log('   ✅ Función notificar_cambio_precios() instalada\n');
    }

    // Resumen final
    console.log('='.repeat(60));

    const allOk =
      dbName === 'labsisEG' &&
      tables.rows.length === 6 &&
      lista.rows.length > 0 &&
      triggers.rows.length === 4 &&
      func.rows.length > 0;

    if (allOk) {
      console.log('✅ VERIFICACIÓN COMPLETADA EXITOSAMENTE');
      console.log('✅ El sistema está listo para funcionar');
    } else {
      console.log('⚠️  VERIFICACIÓN COMPLETADA CON ADVERTENCIAS');
      console.log('⚠️  Revisa los mensajes anteriores');

      if (triggers.rows.length < 4 || func.rows.length === 0) {
        console.log('\n💡 Siguiente paso: npm run install-triggers');
      }
    }

    console.log('='.repeat(60) + '\n');

    await pool.end();
    process.exit(allOk ? 0 : 1);

  } catch (error) {
    console.error('\n❌ ERROR DE CONEXIÓN:\n');
    console.error(`   ${error.message}\n`);
    console.error('Posibles causas:');
    console.error('  1. PostgreSQL no está corriendo');
    console.error('  2. Credenciales incorrectas en .env');
    console.error('  3. Base de datos "labsisEG" no existe');
    console.error('  4. Usuario no tiene permisos');
    console.error('  5. Firewall bloqueando conexión\n');
    console.error('Configuración actual:');
    console.error(`  Host: ${config.host}`);
    console.error(`  Puerto: ${config.port}`);
    console.error(`  Base de datos: ${config.database}`);
    console.error(`  Usuario: ${config.user}`);
    console.error(`  Password: ${config.password ? '***' : '(vacío)'}\n`);

    await pool.end();
    process.exit(1);
  }
}

// Ejecutar verificación
verifyDatabase();
