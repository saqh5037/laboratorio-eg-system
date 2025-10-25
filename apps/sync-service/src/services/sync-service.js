/**
 * Servicio de sincronización principal
 * Orquesta el proceso completo: DB → Transform → Save
 */

import { getPriceList } from '../database/queries.js';
import { transformToJSON } from './data-transformer.js';
import { saveJSON } from '../storage/file-service.js';
import config from '../config.js';
import logger from '../utils/logger.js';

let isSyncing = false;
let lastSyncTime = null;
let syncCount = 0;

/**
 * Ejecutar sincronización completa
 * @returns {Promise<Object>} - Resultado de la sincronización
 */
export const sync = async () => {
  // Evitar sincronizaciones concurrentes
  if (isSyncing) {
    logger.warn('⏳ Sincronización ya en progreso, omitiendo...');
    return { skipped: true, reason: 'Sincronización en progreso' };
  }

  isSyncing = true;
  const startTime = Date.now();

  try {
    logger.info('🔄 Iniciando sincronización...', {
      listaPreciosId: config.sync.listaPreciosId
    });

    // PASO 1: Obtener datos de PostgreSQL
    logger.info('📊 Consultando base de datos labsisEG...');
    const estudios = await getPriceList();

    if (!estudios || estudios.length === 0) {
      throw new Error('No se obtuvieron estudios de la base de datos');
    }

    logger.info(`✅ ${estudios.length} estudios obtenidos de labsisEG`);

    // PASO 2: Transformar a JSON
    logger.info('🔄 Transformando datos a JSON...');
    const jsonData = transformToJSON(estudios);

    // PASO 3: Guardar en archivo
    logger.info('💾 Guardando JSON...');
    const fileInfo = await saveJSON(jsonData);

    // Actualizar estadísticas
    lastSyncTime = new Date();
    syncCount++;

    const duration = Date.now() - startTime;

    logger.info('✅ Sincronización completada exitosamente', {
      duracion: `${duration}ms`,
      estudios: estudios.length,
      archivo: fileInfo.path,
      tamaño: fileInfo.sizeKB + ' KB',
      syncNumber: syncCount
    });

    return {
      success: true,
      estudios: estudios.length,
      duration,
      fileInfo,
      timestamp: lastSyncTime,
      syncNumber: syncCount
    };

  } catch (error) {
    logger.error('❌ Error durante la sincronización:', {
      error: error.message,
      stack: error.stack
    });

    return {
      success: false,
      error: error.message,
      duration: Date.now() - startTime
    };

  } finally {
    isSyncing = false;
  }
};

/**
 * Obtener estado de la sincronización
 * @returns {Object} - Estado actual
 */
export const getStatus = () => {
  return {
    isSyncing,
    lastSyncTime,
    syncCount,
    config: {
      listaPreciosId: config.sync.listaPreciosId,
      debounceMs: config.sync.debounceMs,
      outputPath: config.storage.outputPath
    }
  };
};

/**
 * Reiniciar contador de sincronizaciones
 */
export const resetStats = () => {
  syncCount = 0;
  lastSyncTime = null;
  logger.info('📊 Estadísticas de sincronización reiniciadas');
};

export default {
  sync,
  getStatus,
  resetStats
};
