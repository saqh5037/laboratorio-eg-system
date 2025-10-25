/**
 * Servicio de almacenamiento local de archivos
 * Guarda JSON en filesystem y opcionalmente copia a proyecto web
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import config from '../config.js';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Guardar JSON en archivo local
 * @param {Object} data - Datos a guardar
 * @param {number} retries - Número de reintentos
 * @returns {Promise<Object>} - Información del archivo guardado
 */
export const saveJSON = async (data, retries = 3) => {
  const outputDir = path.join(__dirname, '..', '..', config.storage.outputPath);
  const filePath = path.join(outputDir, config.storage.outputFilename);

  // Crear directorio si no existe
  try {
    await fs.mkdir(outputDir, { recursive: true });
  } catch (error) {
    logger.error('Error al crear directorio de output:', { error: error.message });
  }

  // Guardar con retry logic
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const jsonString = JSON.stringify(data, null, 2);
      await fs.writeFile(filePath, jsonString, 'utf-8');

      const stats = await fs.stat(filePath);

      logger.info('💾 JSON guardado localmente', {
        path: filePath,
        size: `${(stats.size / 1024).toFixed(2)} KB`,
        estudios: data.estudios?.length || 0
      });

      // Auto-copy a proyecto web si está habilitado
      if (config.storage.autoCopyToWeb && config.storage.webProjectPath) {
        await copyToWebProject(filePath);
      }

      // Auto-copy a servidor remoto si está habilitado
      if (config.storage.autoCopyToRemote && config.storage.remoteHost) {
        await copyToRemoteServer(filePath);
      }

      return {
        success: true,
        path: filePath,
        size: stats.size,
        sizeKB: (stats.size / 1024).toFixed(2)
      };

    } catch (error) {
      logger.error(`Error al guardar JSON (intento ${attempt}/${retries}):`, {
        error: error.message
      });

      if (attempt === retries) {
        throw new Error(`No se pudo guardar el archivo después de ${retries} intentos: ${error.message}`);
      }

      // Esperar antes de reintentar
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
};

/**
 * Copiar archivo a proyecto web (opcional)
 * @param {string} sourcePath - Ruta del archivo fuente
 */
async function copyToWebProject(sourcePath) {
  try {
    const destDir = config.storage.webProjectPath;
    const destPath = path.join(destDir, config.storage.outputFilename);

    // Crear directorio destino si no existe
    await fs.mkdir(destDir, { recursive: true });

    // Copiar archivo
    await fs.copyFile(sourcePath, destPath);

    logger.info('📋 JSON copiado a proyecto web', {
      destination: destPath
    });

  } catch (error) {
    // No fallar si no se puede copiar a web
    logger.warn('⚠️ No se pudo copiar a proyecto web:', {
      error: error.message,
      path: config.storage.webProjectPath
    });
  }
}

/**
 * Copiar archivo a servidor remoto vía SCP
 * @param {string} sourcePath - Ruta del archivo fuente
 */
async function copyToRemoteServer(sourcePath) {
  return new Promise((resolve, reject) => {
    const { remoteHost, remoteUser, remoteKeyPath, remotePath } = config.storage;

    logger.info('🚀 Iniciando copia a servidor remoto...', {
      host: remoteHost,
      user: remoteUser,
      destination: remotePath
    });

    // Construir comando SCP
    // scp -i <key> <source> <user>@<host>:<remote_path>
    const scpArgs = [
      '-i', remoteKeyPath,
      '-o', 'StrictHostKeyChecking=no',
      '-o', 'UserKnownHostsFile=/dev/null',
      sourcePath,
      `${remoteUser}@${remoteHost}:${remotePath}`
    ];

    const scp = spawn('scp', scpArgs);

    let stderr = '';

    scp.stdout.on('data', (data) => {
      logger.debug('SCP stdout:', data.toString());
    });

    scp.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    scp.on('close', (code) => {
      if (code === 0) {
        logger.info('✅ JSON copiado exitosamente a servidor remoto', {
          host: remoteHost,
          destination: remotePath
        });
        resolve();
      } else {
        logger.error('❌ Error al copiar a servidor remoto', {
          code,
          stderr: stderr.trim()
        });
        // No fallar la sincronización completa si falla la copia remota
        resolve();
      }
    });

    scp.on('error', (error) => {
      logger.error('❌ Error al ejecutar SCP:', {
        error: error.message
      });
      // No fallar la sincronización completa si falla la copia remota
      resolve();
    });
  });
}

/**
 * Leer JSON desde archivo
 * @returns {Promise<Object>} - Datos del JSON
 */
export const readJSON = async () => {
  try {
    const outputDir = path.join(__dirname, '..', '..', config.storage.outputPath);
    const filePath = path.join(outputDir, config.storage.outputFilename);

    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);

  } catch (error) {
    if (error.code === 'ENOENT') {
      logger.warn('Archivo JSON no existe aún');
      return null;
    }
    throw error;
  }
};

/**
 * Verificar si existe el archivo JSON
 * @returns {Promise<boolean>}
 */
export const existsJSON = async () => {
  try {
    const outputDir = path.join(__dirname, '..', '..', config.storage.outputPath);
    const filePath = path.join(outputDir, config.storage.outputFilename);

    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

/**
 * Obtener información del archivo JSON
 * @returns {Promise<Object|null>}
 */
export const getFileInfo = async () => {
  try {
    const outputDir = path.join(__dirname, '..', '..', config.storage.outputPath);
    const filePath = path.join(outputDir, config.storage.outputFilename);

    const stats = await fs.stat(filePath);

    return {
      exists: true,
      path: filePath,
      size: stats.size,
      sizeKB: (stats.size / 1024).toFixed(2),
      modified: stats.mtime
    };

  } catch (error) {
    return {
      exists: false,
      path: null
    };
  }
};

export default {
  saveJSON,
  readJSON,
  existsJSON,
  getFileInfo
};
