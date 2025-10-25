#!/usr/bin/env node

/**
 * Laboratorio EG - Sistema de Sincronización Local
 * Entry point principal del servicio
 *
 * Base de datos: labsisEG (NO labsis_dev)
 * Lista de precios: ID 27 (Ambulatorio_Abril_2025)
 * Total estudios: 542 (369 pruebas + 173 grupos)
 */

import config, { validateConfig } from './config.js';
import { testConnection } from './database/connection.js';
import { sync } from './services/sync-service.js';
import { startListening, stopListening } from './services/postgres-listener.js';
import { startServer } from './http/server.js';
import logger from './utils/logger.js';

let httpServer = null;

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 Laboratorio EG - Sistema de Sincronización');
  console.log('='.repeat(60) + '\n');

  try {
    // 1. Validar configuración
    logger.info('🔧 Validando configuración...');
    const configValidation = validateConfig();

    if (!configValidation.valid) {
      logger.error('❌ Configuración inválida:');
      configValidation.errors.forEach(err => logger.error(`   - ${err}`));
      process.exit(1);
    }

    logger.info('✅ Configuración válida');

    console.log('📋 Configuración:');
    console.log(`   Base de datos: ${config.labsis.database}`);
    console.log(`   Lista de precios: ID ${config.sync.listaPreciosId}`);
    console.log(`   Archivo salida: ${config.storage.outputPath}/${config.storage.outputFilename}`);
    console.log(`   HTTP Puerto: ${config.http.port}\n`);

    // 2. Probar conexión
    logger.info('📡 Probando conexión a labsisEG...');
    const dbConnected = await testConnection();

    if (!dbConnected) {
      logger.error('❌ No se pudo conectar a labsisEG');
      process.exit(1);
    }

    // 3. Sincronización inicial
    logger.info('🔄 Sincronización inicial...');
    const initialSync = await sync();

    if (!initialSync.success) {
      logger.error('❌ Error en sincronización inicial');
      process.exit(1);
    }

    logger.info(`✅ ${initialSync.estudios} estudios sincronizados`);

    // 4. HTTP server
    logger.info('🌐 Iniciando servidor HTTP...');
    httpServer = await startServer();
    console.log(`   📍 http://localhost:${config.http.port}\n`);

    // 5. Listener
    logger.info('👂 Iniciando listener...');
    await startListening();

    console.log('='.repeat(60));
    console.log('✨ Sistema listo');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    logger.error('❌ Error fatal:', { error: error.message });
    console.error('\n❌ Error:', error.message, '\n');
    process.exit(1);
  }
}

async function shutdown(signal) {
  console.log(`\n🛑 Cerrando (${signal})...\n`);
  try {
    await stopListening();
    if (httpServer) {
      await new Promise(resolve => httpServer.close(resolve));
    }
    console.log('✅ Cerrado\n');
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

main();
