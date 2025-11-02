/**
 * Script de migración: Usuarios existentes de Telegram
 *
 * Este script migra automáticamente todos los chat_ids de Telegram
 * que existen en las tablas legacy (bot_presupuestos, bot_conversations)
 * a la nueva tabla telegram_user_registry.
 *
 * Esto permite que usuarios existentes NO tengan que volver a autorizar
 * la comunicación por Telegram.
 *
 * Uso: node scripts/migrate-existing-telegram-users.js
 */

require('dotenv').config();
const { botPool, labsisPool } = require('../src/db/pool');
const logger = require('../src/utils/logger');

async function migrateFromBotPresupuestos() {
  logger.info('📋 Migrando usuarios desde bot_presupuestos...');

  try {
    // Buscar todos los presupuestos con Telegram
    const result = await labsisPool.query(`
      SELECT DISTINCT ON (conversation_id)
        conversation_id,
        labsis_patient_id,
        patient_phone,
        created_at
      FROM bot_presupuestos
      WHERE platform = 'telegram'
        AND conversation_id LIKE 'telegram_%'
        AND labsis_patient_id IS NOT NULL
      ORDER BY conversation_id, created_at DESC
    `);

    logger.info(`   Encontrados ${result.rows.length} registros en bot_presupuestos`);

    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    for (const row of result.rows) {
      try {
        // Extraer chat_id del conversation_id (formato: telegram_CHATID)
        const chatId = row.conversation_id.replace('telegram_', '');
        const pacienteId = row.labsis_patient_id;
        const phone = row.patient_phone;

        // Intentar insertar en telegram_user_registry
        const insertResult = await botPool.query(`
          INSERT INTO telegram_user_registry
          (telegram_chat_id, phone, paciente_id, is_active, registered_at, last_interaction)
          VALUES ($1, $2, $3, TRUE, NOW(), NOW())
          ON CONFLICT (telegram_chat_id) DO NOTHING
          RETURNING id
        `, [chatId, phone, pacienteId]);

        if (insertResult.rows.length > 0) {
          migrated++;
          logger.info(`   ✅ Migrado: chat_id ${chatId} -> paciente ${pacienteId}`);
        } else {
          skipped++;
        }

      } catch (error) {
        errors++;
        logger.error(`   ❌ Error migrando registro:`, error.message);
      }
    }

    return { found: result.rows.length, migrated, skipped, errors };

  } catch (error) {
    logger.error('Error en migrateFromBotPresupuestos:', error);
    throw error;
  }
}

async function migrateFromBotConversations() {
  logger.info('💬 Migrando usuarios desde bot_conversations...');

  try {
    // Buscar todas las conversaciones activas de Telegram
    const result = await labsisPool.query(`
      SELECT DISTINCT ON (chat_id)
        chat_id,
        user_info,
        last_message_at
      FROM bot_conversations
      WHERE platform = 'telegram'
        AND state = 'active'
        AND chat_id IS NOT NULL
      ORDER BY chat_id, last_message_at DESC
    `);

    logger.info(`   Encontrados ${result.rows.length} registros en bot_conversations`);

    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    for (const row of result.rows) {
      try {
        const chatId = row.chat_id;
        const userInfo = row.user_info || {};
        const phone = userInfo.phoneNumber || null;

        // Si no hay phone ni paciente_id vinculado, skip
        if (!phone) {
          skipped++;
          continue;
        }

        // Buscar paciente_id en labsisEG por teléfono
        let pacienteId = null;
        if (phone) {
          const pacienteResult = await labsisPool.query(
            'SELECT id FROM paciente WHERE telefono = $1 LIMIT 1',
            [phone]
          );
          if (pacienteResult.rows.length > 0) {
            pacienteId = pacienteResult.rows[0].id;
          }
        }

        if (!pacienteId) {
          skipped++;
          continue;
        }

        // Intentar insertar en telegram_user_registry
        const insertResult = await botPool.query(`
          INSERT INTO telegram_user_registry
          (telegram_chat_id, phone, paciente_id, is_active, registered_at, last_interaction)
          VALUES ($1, $2, $3, TRUE, NOW(), NOW())
          ON CONFLICT (telegram_chat_id) DO NOTHING
          RETURNING id
        `, [chatId, phone, pacienteId]);

        if (insertResult.rows.length > 0) {
          migrated++;
          logger.info(`   ✅ Migrado: chat_id ${chatId} -> paciente ${pacienteId}`);
        } else {
          skipped++;
        }

      } catch (error) {
        errors++;
        logger.error(`   ❌ Error migrando registro:`, error.message);
      }
    }

    return { found: result.rows.length, migrated, skipped, errors };

  } catch (error) {
    logger.error('Error en migrateFromBotConversations:', error);
    throw error;
  }
}

async function showCurrentRegistry() {
  logger.info('📊 Estado actual de telegram_user_registry:');

  try {
    const result = await botPool.query(`
      SELECT COUNT(*) as total,
             COUNT(CASE WHEN paciente_id IS NOT NULL THEN 1 END) as with_patient,
             COUNT(CASE WHEN is_active = TRUE THEN 1 END) as active
      FROM telegram_user_registry
    `);

    const stats = result.rows[0];
    logger.info(`   Total registros: ${stats.total}`);
    logger.info(`   Con paciente_id: ${stats.with_patient}`);
    logger.info(`   Activos: ${stats.active}`);

    // Mostrar algunos ejemplos
    const examples = await botPool.query(`
      SELECT telegram_chat_id, paciente_id, phone, is_active
      FROM telegram_user_registry
      ORDER BY last_interaction DESC
      LIMIT 5
    `);

    if (examples.rows.length > 0) {
      logger.info('   Últimos registros:');
      examples.rows.forEach(row => {
        logger.info(`     - chat_id: ${row.telegram_chat_id}, paciente: ${row.paciente_id}, phone: ${row.phone}, active: ${row.is_active}`);
      });
    }

  } catch (error) {
    logger.error('Error mostrando estado actual:', error);
  }
}

async function main() {
  try {
    logger.info('🚀 Iniciando migración de usuarios existentes de Telegram...\n');

    // Mostrar estado inicial
    await showCurrentRegistry();
    logger.info('');

    // Migrar desde bot_presupuestos
    const presupuestosStats = await migrateFromBotPresupuestos();
    logger.info('');

    // Migrar desde bot_conversations
    const conversationsStats = await migrateFromBotConversations();
    logger.info('');

    // Mostrar resumen
    logger.info('✅ MIGRACIÓN COMPLETADA\n');
    logger.info('📊 Resumen:');
    logger.info(`   bot_presupuestos:`);
    logger.info(`     - Encontrados: ${presupuestosStats.found}`);
    logger.info(`     - Migrados: ${presupuestosStats.migrated}`);
    logger.info(`     - Omitidos: ${presupuestosStats.skipped}`);
    logger.info(`     - Errores: ${presupuestosStats.errors}`);
    logger.info('');
    logger.info(`   bot_conversations:`);
    logger.info(`     - Encontrados: ${conversationsStats.found}`);
    logger.info(`     - Migrados: ${conversationsStats.migrated}`);
    logger.info(`     - Omitidos: ${conversationsStats.skipped}`);
    logger.info(`     - Errores: ${conversationsStats.errors}`);
    logger.info('');
    logger.info(`   Total migrados: ${presupuestosStats.migrated + conversationsStats.migrated}`);
    logger.info('');

    // Mostrar estado final
    await showCurrentRegistry();

    process.exit(0);

  } catch (error) {
    logger.error('❌ Error fatal en migración:', error);
    process.exit(1);
  }
}

// Ejecutar
main();
