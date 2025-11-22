/**
 * DatabaseRouter - Gestor de Conexiones Multi-Laboratorio
 *
 * Maneja conexiones dinámicas a bases de datos según el laboratorio activo.
 * Permite cambiar entre laboratorios sin reiniciar el servidor.
 *
 * @module DatabaseRouter
 */

const { Pool } = require('pg');
const logger = require('../utils/logger');

/**
 * Estado global del router
 */
let currentLaboratory = null;
let labsisPools = new Map(); // Map<laboratoryCode, Pool>
let configPools = new Map(); // Map<laboratoryCode, Pool>
let controlPool = null; // Pool de la DB de control (lis_bot_comunicacion)

/**
 * Configuración de conexión base
 */
const DB_CONFIG = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'labsis',
    password: process.env.DB_PASSWORD || 'labsis',
    max: 20, // Máximo de conexiones por pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
};

/**
 * Inicializa el pool de control (DB central)
 */
function initializeControlPool() {
    if (!controlPool) {
        controlPool = new Pool({
            ...DB_CONFIG,
            database: process.env.CONTROL_DB || 'lis_bot_comunicacion',
        });

        controlPool.on('error', (err) => {
            logger.error('Error en pool de control:', err);
        });

        logger.info('✅ Pool de control inicializado', {
            database: process.env.CONTROL_DB || 'lis_bot_comunicacion'
        });
    }

    return controlPool;
}

/**
 * Obtiene el pool de la base de datos de control
 */
function getControlPool() {
    if (!controlPool) {
        return initializeControlPool();
    }
    return controlPool;
}

/**
 * Obtiene la información de un laboratorio desde la DB
 * @param {string} laboratoryCode - Código del laboratorio
 * @returns {Promise<Object>} Información del laboratorio
 */
async function getLaboratoryInfo(laboratoryCode) {
    const pool = getControlPool();

    const result = await pool.query(
        'SELECT * FROM laboratories WHERE code = $1',
        [laboratoryCode]
    );

    if (result.rows.length === 0) {
        throw new Error(`Laboratorio no encontrado: ${laboratoryCode}`);
    }

    return result.rows[0];
}

/**
 * Obtiene el laboratorio actualmente activo
 * @returns {Promise<Object>} Laboratorio activo
 */
async function getActiveLaboratory() {
    const pool = getControlPool();

    const result = await pool.query(
        'SELECT * FROM laboratories WHERE is_active = true LIMIT 1'
    );

    if (result.rows.length === 0) {
        // Si no hay ninguno activo, activar Dimogen por defecto
        await pool.query(
            "UPDATE laboratories SET is_active = true WHERE code = 'dimogen'"
        );
        return getLaboratoryInfo('dimogen');
    }

    return result.rows[0];
}

/**
 * Obtiene o crea un pool para una base de datos específica
 * @param {Map} poolMap - Map de pools
 * @param {string} laboratoryCode - Código del laboratorio
 * @param {string} databaseName - Nombre de la base de datos
 * @returns {Pool} Pool de conexiones
 */
function getOrCreatePool(poolMap, laboratoryCode, databaseName) {
    if (!poolMap.has(laboratoryCode)) {
        const pool = new Pool({
            ...DB_CONFIG,
            database: databaseName,
        });

        pool.on('error', (err) => {
            logger.error(`Error en pool de ${laboratoryCode} (${databaseName}):`, err);
        });

        poolMap.set(laboratoryCode, pool);

        logger.info(`✅ Pool creado para ${laboratoryCode}`, {
            database: databaseName,
            totalPools: poolMap.size
        });
    }

    return poolMap.get(laboratoryCode);
}

/**
 * Obtiene el pool de labsisEG para un laboratorio
 * @param {string} laboratoryCode - Código del laboratorio (opcional, usa activo si no se especifica)
 * @returns {Promise<Pool>} Pool de conexiones
 */
async function getLabsisPool(laboratoryCode = null) {
    const lab = laboratoryCode
        ? await getLaboratoryInfo(laboratoryCode)
        : await getActiveLaboratory();

    return getOrCreatePool(labsisPools, lab.code, lab.labsis_db);
}

/**
 * Obtiene el pool de configuración para un laboratorio
 * @param {string} laboratoryCode - Código del laboratorio (opcional, usa activo si no se especifica)
 * @returns {Promise<Pool>} Pool de conexiones
 */
async function getConfigPool(laboratoryCode = null) {
    const lab = laboratoryCode
        ? await getLaboratoryInfo(laboratoryCode)
        : await getActiveLaboratory();

    return getOrCreatePool(configPools, lab.code, lab.config_db);
}

/**
 * Cambia el laboratorio activo
 * @param {string} laboratoryCode - Código del nuevo laboratorio
 * @returns {Promise<Object>} Información del laboratorio activado
 */
async function switchLaboratory(laboratoryCode) {
    const pool = getControlPool();

    // Verificar que el laboratorio existe
    const labInfo = await getLaboratoryInfo(laboratoryCode);

    // Desactivar todos los laboratorios
    await pool.query('UPDATE laboratories SET is_active = false');

    // Activar el nuevo laboratorio
    await pool.query(
        'UPDATE laboratories SET is_active = true, updated_at = NOW() WHERE code = $1',
        [laboratoryCode]
    );

    currentLaboratory = labInfo;

    logger.info(`🔄 Laboratorio cambiado a: ${labInfo.name}`, {
        code: labInfo.code,
        labsisDb: labInfo.labsis_db,
        configDb: labInfo.config_db
    });

    return labInfo;
}

/**
 * Lista todos los laboratorios disponibles
 * @returns {Promise<Array>} Lista de laboratorios
 */
async function listLaboratories() {
    const pool = getControlPool();

    const result = await pool.query(
        'SELECT id, code, name, short_name, country, is_active FROM laboratories ORDER BY name'
    );

    return result.rows;
}

/**
 * Obtiene el laboratorio actualmente en uso (cacheado)
 * @returns {Promise<Object>} Laboratorio actual
 */
async function getCurrentLaboratory() {
    if (!currentLaboratory) {
        currentLaboratory = await getActiveLaboratory();
    }
    return currentLaboratory;
}

/**
 * Cierra todos los pools de conexiones
 */
async function closeAllPools() {
    logger.info('Cerrando todos los pools de conexiones...');

    const allPools = [
        ...Array.from(labsisPools.values()),
        ...Array.from(configPools.values()),
    ];

    if (controlPool) {
        allPools.push(controlPool);
    }

    await Promise.all(allPools.map(pool => pool.end()));

    labsisPools.clear();
    configPools.clear();
    controlPool = null;
    currentLaboratory = null;

    logger.info('✅ Todos los pools cerrados');
}

/**
 * Obtiene estadísticas de los pools
 * @returns {Object} Estadísticas
 */
function getPoolStats() {
    const stats = {
        control: controlPool ? {
            totalCount: controlPool.totalCount,
            idleCount: controlPool.idleCount,
            waitingCount: controlPool.waitingCount,
        } : null,
        labsis: {},
        config: {},
    };

    labsisPools.forEach((pool, code) => {
        stats.labsis[code] = {
            totalCount: pool.totalCount,
            idleCount: pool.idleCount,
            waitingCount: pool.waitingCount,
        };
    });

    configPools.forEach((pool, code) => {
        stats.config[code] = {
            totalCount: pool.totalCount,
            idleCount: pool.idleCount,
            waitingCount: pool.waitingCount,
        };
    });

    return stats;
}

// Inicializar pool de control al cargar el módulo
initializeControlPool();

module.exports = {
    // Gestión de laboratorios
    getCurrentLaboratory,
    getActiveLaboratory,
    getLaboratoryInfo,
    listLaboratories,
    switchLaboratory,

    // Pools de conexión
    getControlPool,
    getLabsisPool,
    getConfigPool,

    // Utilidades
    getPoolStats,
    closeAllPools,
};
