/**
 * Rutas de API para gestión de laboratorios
 *
 * Endpoints para cambiar entre laboratorios y obtener información.
 *
 * @module routes/laboratories
 */

const express = require('express');
const router = express.Router();
const DatabaseRouter = require('../services/DatabaseRouter');
const { authenticateAdmin } = require('../middleware/adminAuth');
const logger = require('../utils/logger');

/**
 * GET /api/laboratories
 * Lista todos los laboratorios disponibles
 */
router.get('/', authenticateAdmin, async (req, res) => {
    try {
        const laboratories = await DatabaseRouter.listLaboratories();

        res.json({
            success: true,
            data: laboratories,
            message: `${laboratories.length} laboratorios encontrados`
        });
    } catch (error) {
        logger.error('Error al listar laboratorios:', error);
        res.status(500).json({
            success: false,
            error: 'Error al listar laboratorios',
            message: error.message
        });
    }
});

/**
 * GET /api/laboratories/current
 * Obtiene el laboratorio actualmente activo
 */
router.get('/current', async (req, res) => {
    try {
        const laboratory = await DatabaseRouter.getCurrentLaboratory();

        res.json({
            success: true,
            data: laboratory,
            message: `Laboratorio activo: ${laboratory.name}`
        });
    } catch (error) {
        logger.error('Error al obtener laboratorio activo:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener laboratorio activo',
            message: error.message
        });
    }
});

/**
 * GET /api/laboratories/:code
 * Obtiene información de un laboratorio específico
 */
router.get('/:code', authenticateAdmin, async (req, res) => {
    try {
        const { code } = req.params;
        const laboratory = await DatabaseRouter.getLaboratoryInfo(code);

        res.json({
            success: true,
            data: laboratory
        });
    } catch (error) {
        logger.error(`Error al obtener laboratorio ${req.params.code}:`, error);
        res.status(404).json({
            success: false,
            error: 'Laboratorio no encontrado',
            message: error.message
        });
    }
});

/**
 * POST /api/laboratories/switch
 * Cambia el laboratorio activo
 *
 * Body:
 * {
 *   "code": "dimogen" | "microtec" | "elizabeth-gutierrez"
 * }
 */
router.post('/switch', authenticateAdmin, async (req, res) => {
    try {
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({
                success: false,
                error: 'Código de laboratorio requerido',
                message: 'Debes proporcionar el código del laboratorio'
            });
        }

        const laboratory = await DatabaseRouter.switchLaboratory(code);

        // Invalidar caché de configuración
        const CacheService = require('../services/CacheService');
        CacheService.flush();

        logger.info(`✅ Laboratorio cambiado a: ${laboratory.name}`, {
            code: laboratory.code,
            userId: req.user.id,
            username: req.user.username
        });

        res.json({
            success: true,
            data: laboratory,
            message: `Laboratorio cambiado a: ${laboratory.name}`,
            note: 'El caché ha sido invalidado. Recarga la aplicación para ver los cambios.'
        });
    } catch (error) {
        logger.error('Error al cambiar laboratorio:', error);
        res.status(500).json({
            success: false,
            error: 'Error al cambiar laboratorio',
            message: error.message
        });
    }
});

/**
 * GET /api/laboratories/stats/pools
 * Obtiene estadísticas de los pools de conexiones
 */
router.get('/stats/pools', authenticateAdmin, async (req, res) => {
    try {
        const stats = DatabaseRouter.getPoolStats();

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        logger.error('Error al obtener estadísticas de pools:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtener estadísticas',
            message: error.message
        });
    }
});

module.exports = router;
