#!/usr/bin/env node

/**
 * Script de Backfill - Cola de Notificaciones
 *
 * Propósito: Llenar la tabla notifications_queue con órdenes existentes que
 * deberían haber generado notificaciones pero que fueron creadas antes de
 * implementar el sistema de triggers.
 *
 * Uso:
 *   node scripts/backfill-notifications-queue.js
 *
 * Opciones:
 *   --dry-run   Solo muestra lo que se haría sin insertar en BD
 *   --days=N    Backfill de los últimos N días (default: 7)
 */

require('dotenv').config();
const { botPool, labsisPool } = require('../src/db/pool');

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = COLORS.reset) {
  console.log(`${color}${message}${COLORS.reset}`);
}

async function backfillNotificationsQueue(options = {}) {
  const { dryRun = false, days = 7 } = options;

  log(`\n${'='.repeat(60)}`, COLORS.bright);
  log('🔄 BACKFILL DE COLA DE NOTIFICACIONES', COLORS.cyan);
  log(`${'='.repeat(60)}\n`, COLORS.bright);

  if (dryRun) {
    log('⚠️  Modo DRY RUN - No se insertará nada en la base de datos\n', COLORS.yellow);
  }

  log(`📅 Buscando órdenes de los últimos ${days} días...`, COLORS.blue);

  try {
    // 1. Buscar órdenes creadas (sin pagar)
    log('\n1️⃣  Detectando órdenes creadas (sin pagar)...', COLORS.cyan);
    const ordenesCreadas = await labsisPool.query(
      `SELECT id, numero, paciente_id, fecha
       FROM orden_trabajo
       WHERE fecha >= NOW() - INTERVAL '${days} days'
         AND factura_id IS NULL
         AND NOT EXISTS (
           SELECT 1 FROM lis_bot_comunicacion.notifications_queue nq
           WHERE nq.orden_trabajo_id = orden_trabajo.id
             AND nq.notification_type = 'orden_creada'
         )
       ORDER BY fecha DESC`
    );

    log(`   Encontradas: ${ordenesCreadas.rows.length} órdenes`, COLORS.green);

    // 2. Buscar órdenes pagadas
    log('\n2️⃣  Detectando órdenes pagadas...', COLORS.cyan);
    const ordenesPagadas = await labsisPool.query(
      `SELECT id, numero, paciente_id, fecha
       FROM orden_trabajo
       WHERE fecha >= NOW() - INTERVAL '${days} days'
         AND factura_id IS NOT NULL
         AND NOT EXISTS (
           SELECT 1 FROM lis_bot_comunicacion.notifications_queue nq
           WHERE nq.orden_trabajo_id = orden_trabajo.id
             AND nq.notification_type = 'orden_pagada'
         )
       ORDER BY fecha DESC`
    );

    log(`   Encontradas: ${ordenesPagadas.rows.length} órdenes`, COLORS.green);

    // 3. Buscar resultados validados
    log('\n3️⃣  Detectando resultados validados...', COLORS.cyan);
    const resultadosListos = await labsisPool.query(
      `SELECT id, numero, paciente_id, fecha_validado
       FROM orden_trabajo
       WHERE fecha_validado >= NOW() - INTERVAL '${days} days'
         AND status_id = 4
         AND NOT EXISTS (
           SELECT 1 FROM lis_bot_comunicacion.notifications_queue nq
           WHERE nq.orden_trabajo_id = orden_trabajo.id
             AND nq.notification_type = 'resultados_listos'
         )
       ORDER BY fecha_validado DESC`
    );

    log(`   Encontradas: ${resultadosListos.rows.length} órdenes`, COLORS.green);

    // Totales
    const totalNotificaciones =
      ordenesCreadas.rows.length +
      ordenesPagadas.rows.length +
      resultadosListos.rows.length;

    log(`\n📊 RESUMEN:`, COLORS.bright);
    log(`   Órdenes creadas:      ${ordenesCreadas.rows.length}`);
    log(`   Órdenes pagadas:      ${ordenesPagadas.rows.length}`);
    log(`   Resultados validados: ${resultadosListos.rows.length}`);
    log(`   ─────────────────────────────────`);
    log(`   TOTAL:                ${totalNotificaciones}\n`);

    if (totalNotificaciones === 0) {
      log('✅ No hay notificaciones pendientes para backfill', COLORS.green);
      return { success: true, inserted: 0 };
    }

    if (dryRun) {
      log('✅ DRY RUN completado - No se insertó nada', COLORS.yellow);
      return { success: true, inserted: 0 };
    }

    // Insertar en la cola
    log('💾 Insertando notificaciones en la cola...', COLORS.cyan);

    let insertedCount = 0;

    // Insertar órdenes creadas
    for (const orden of ordenesCreadas.rows) {
      try {
        await botPool.query(
          `INSERT INTO notifications_queue
           (orden_trabajo_id, paciente_id, notification_type, status, created_at, metadata)
           VALUES ($1, $2, 'orden_creada', 'pending', $3, $4)
           ON CONFLICT (orden_trabajo_id, notification_type) DO NOTHING`,
          [orden.id, orden.paciente_id, orden.fecha, JSON.stringify({ backfill: true })]
        );
        insertedCount++;
      } catch (error) {
        log(`   ❌ Error insertando orden ${orden.numero}: ${error.message}`, COLORS.red);
      }
    }

    // Insertar órdenes pagadas
    for (const orden of ordenesPagadas.rows) {
      try {
        await botPool.query(
          `INSERT INTO notifications_queue
           (orden_trabajo_id, paciente_id, notification_type, status, created_at, metadata)
           VALUES ($1, $2, 'orden_pagada', 'pending', $3, $4)
           ON CONFLICT (orden_trabajo_id, notification_type) DO NOTHING`,
          [orden.id, orden.paciente_id, orden.fecha, JSON.stringify({ backfill: true })]
        );
        insertedCount++;
      } catch (error) {
        log(`   ❌ Error insertando orden ${orden.numero}: ${error.message}`, COLORS.red);
      }
    }

    // Insertar resultados validados
    for (const orden of resultadosListos.rows) {
      try {
        await botPool.query(
          `INSERT INTO notifications_queue
           (orden_trabajo_id, paciente_id, notification_type, status, created_at, metadata)
           VALUES ($1, $2, 'resultados_listos', 'pending', $3, $4)
           ON CONFLICT (orden_trabajo_id, notification_type) DO NOTHING`,
          [orden.id, orden.paciente_id, orden.fecha_validado, JSON.stringify({ backfill: true })]
        );
        insertedCount++;
      } catch (error) {
        log(`   ❌ Error insertando orden ${orden.numero}: ${error.message}`, COLORS.red);
      }
    }

    log(`\n✅ Backfill completado exitosamente`, COLORS.green);
    log(`   Insertadas: ${insertedCount} notificaciones en la cola\n`, COLORS.green);

    return { success: true, inserted: insertedCount };

  } catch (error) {
    log(`\n❌ Error en backfill: ${error.message}`, COLORS.red);
    console.error(error);
    return { success: false, error: error.message };
  }
}

// Ejecutar script
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const daysArg = args.find(arg => arg.startsWith('--days='));
  const days = daysArg ? parseInt(daysArg.split('=')[1]) : 7;

  try {
    const result = await backfillNotificationsQueue({ dryRun, days });

    await botPool.end();
    await labsisPool.end();

    process.exit(result.success ? 0 : 1);

  } catch (error) {
    log(`\n❌ Error fatal: ${error.message}`, COLORS.red);
    console.error(error);
    process.exit(1);
  }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = { backfillNotificationsQueue };
