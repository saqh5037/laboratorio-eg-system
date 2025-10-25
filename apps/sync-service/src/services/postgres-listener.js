/**
 * PostgreSQL LISTEN/NOTIFY Listener
 * Escucha cambios en el canal 'precio_cambio' y ejecuta sincronización
 */

import { getClient } from '../database/connection.js';
import { sync } from './sync-service.js';
import config from '../config.js';
import logger from '../utils/logger.js';

let client = null;
let debounceTimer = null;
let isListening = false;

/**
 * Iniciar listener de PostgreSQL
 */
export const startListening = async () => {
  try {
    logger.info('👂 Iniciando listener de PostgreSQL...');

    // Obtener cliente dedicado para LISTEN
    client = await getClient();

    // Configurar handler de notificaciones
    client.on('notification', handleNotification);

    // Configurar handler de errores
    client.on('error', (err) => {
      logger.error('❌ Error en cliente de LISTEN:', { error: err.message });
      // Intentar reconectar
      setTimeout(reconnect, 5000);
    });

    // Iniciar LISTEN en el canal
    await client.query(`LISTEN ${config.sync.notifyChannel}`);

    isListening = true;

    logger.info(`✅ Escuchando canal '${config.sync.notifyChannel}'`, {
      debounce: `${config.sync.debounceMs}ms`
    });

  } catch (error) {
    logger.error('❌ Error al iniciar listener:', { error: error.message });
    throw error;
  }
};

/**
 * Handler de notificaciones
 * @param {Object} msg - Mensaje de notificación
 */
function handleNotification(msg) {
  try {
    const payload = JSON.parse(msg.payload);

    logger.info('🔔 Notificación recibida', {
      canal: msg.channel,
      tabla: payload.tabla,
      operacion: payload.operacion,
      timestamp: payload.timestamp
    });

    // Cancelar timer anterior si existe
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      logger.debug('⏱️ Debounce timer reiniciado');
    }

    // Programar sincronización con debounce
    debounceTimer = setTimeout(async () => {
      logger.info(`⏱️ Debounce completado (${config.sync.debounceMs}ms), iniciando sincronización...`);

      try {
        await sync();
      } catch (error) {
        logger.error('❌ Error en sincronización automática:', { error: error.message });
      }

      debounceTimer = null;
    }, config.sync.debounceMs);

  } catch (error) {
    logger.error('❌ Error al procesar notificación:', {
      error: error.message,
      payload: msg.payload
    });
  }
}

/**
 * Reconectar listener
 */
async function reconnect() {
  if (isListening) {
    logger.warn('⚠️ Intentando reconectar listener...');

    try {
      await stopListening();
      await startListening();
      logger.info('✅ Listener reconectado exitosamente');
    } catch (error) {
      logger.error('❌ Error al reconectar:', { error: error.message });
      // Reintentar en 10 segundos
      setTimeout(reconnect, 10000);
    }
  }
}

/**
 * Detener listener
 */
export const stopListening = async () => {
  try {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }

    if (client) {
      await client.query(`UNLISTEN ${config.sync.notifyChannel}`);
      client.removeAllListeners();
      client.release();
      client = null;
    }

    isListening = false;

    logger.info('🛑 Listener detenido');

  } catch (error) {
    logger.error('❌ Error al detener listener:', { error: error.message });
  }
};

/**
 * Obtener estado del listener
 * @returns {Object}
 */
export const getListenerStatus = () => {
  return {
    isListening,
    channel: config.sync.notifyChannel,
    debounceMs: config.sync.debounceMs,
    hasPendingSync: debounceTimer !== null
  };
};

export default {
  startListening,
  stopListening,
  getListenerStatus
};
