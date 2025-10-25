#!/usr/bin/env node

/**
 * Script de sincronización manual
 * Ejecuta una sincronización una vez y termina
 */

import { testConnection } from '../src/database/connection.js';
import { sync } from '../src/services/sync-service.js';
import logger from '../src/utils/logger.js';

async function manualSync() {
  console.log('\n🔄 Sincronización manual iniciada\n');

  try {
    // Verificar conexión
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ No se pudo conectar a labsisEG\n');
      process.exit(1);
    }

    // Ejecutar sincronización
    const result = await sync();

    if (result.success) {
      console.log('\n✅ Sincronización completada exitosamente');
      console.log(`   Estudios: ${result.estudios}`);
      console.log(`   Archivo: ${result.fileInfo.path}`);
      console.log(`   Tamaño: ${result.fileInfo.sizeKB} KB`);
      console.log(`   Duración: ${result.duration}ms\n`);
      process.exit(0);
    } else {
      console.error('\n❌ Error en sincronización');
      console.error(`   ${result.error}\n`);
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message, '\n');
    process.exit(1);
  }
}

manualSync();
