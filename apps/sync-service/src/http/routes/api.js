/**
 * API Routes
 * Endpoints para servir JSON y gestionar sincronización
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { readJSON, getFileInfo } from '../../storage/file-service.js';
import { sync, getStatus } from '../../services/sync-service.js';
import { getListenerStatus } from '../../services/postgres-listener.js';
import config from '../../config.js';
import logger from '../../utils/logger.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * GET /api/precios.json
 * Servir archivo JSON de precios
 */
router.get('/precios.json', async (req, res) => {
  try {
    const jsonPath = path.join(__dirname, '..', '..', '..', config.storage.outputPath, config.storage.outputFilename);

    res.sendFile(jsonPath, (err) => {
      if (err) {
        if (err.code === 'ENOENT') {
          logger.warn('Archivo JSON no encontrado, ejecutando sincronización inicial...');
          res.status(404).json({
            error: 'Archivo no encontrado',
            message: 'Ejecuta una sincronización primero: POST /api/sync'
          });
        } else {
          logger.error('Error al servir JSON:', { error: err.message });
          res.status(500).json({ error: 'Error al leer archivo' });
        }
      }
    });

  } catch (error) {
    logger.error('Error en /api/precios.json:', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/stats
 * Obtener estadísticas del sistema
 */
router.get('/stats', async (req, res) => {
  try {
    const syncStatus = getStatus();
    const listenerStatus = getListenerStatus();
    const fileInfo = await getFileInfo();
    const jsonData = await readJSON();

    res.json({
      sync: syncStatus,
      listener: listenerStatus,
      file: fileInfo,
      data: {
        totalEstudios: jsonData?.estudios?.length || 0,
        metadata: jsonData?.metadata || null
      }
    });

  } catch (error) {
    logger.error('Error en /api/stats:', { error: error.message });
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/sync
 * Forzar sincronización manual
 */
router.post('/sync', async (req, res) => {
  try {
    logger.info('🔄 Sincronización manual solicitada vía API');

    const result = await sync();

    if (result.success) {
      res.json({
        success: true,
        message: 'Sincronización completada',
        ...result
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error en sincronización',
        error: result.error
      });
    }

  } catch (error) {
    logger.error('Error en /api/sync:', { error: error.message });
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/config
 * Obtener configuración actual (sin datos sensibles)
 */
router.get('/config', (req, res) => {
  res.json({
    sync: {
      listaPreciosId: config.sync.listaPreciosId,
      debounceMs: config.sync.debounceMs,
      notifyChannel: config.sync.notifyChannel
    },
    storage: {
      outputPath: config.storage.outputPath,
      outputFilename: config.storage.outputFilename,
      autoCopyToWeb: config.storage.autoCopyToWeb
    },
    http: {
      port: config.http.port
    },
    app: {
      env: config.app.env,
      logLevel: config.app.logLevel
    }
  });
});

export default router;
