const express = require('express');
const router = express.Router();
const BackupService = require('../services/BackupService');
const { authenticateAdmin } = require('../middleware/adminAuth');
const logger = require('../utils/logger');

/**
 * @route GET /api/backup/export
 * @desc Exportar configuración actual a JSON
 * @access Private (Admin)
 */
router.get('/export', authenticateAdmin, async (req, res) => {
  try {
    const exportData = await BackupService.exportConfiguration();

    res.json({
      success: true,
      data: exportData,
      message: 'Configuración exportada exitosamente'
    });
  } catch (error) {
    logger.error('Error en GET /api/backup/export:', error);
    res.status(500).json({
      success: false,
      error: 'Error al exportar configuración',
      message: error.message
    });
  }
});

/**
 * @route POST /api/backup/import
 * @desc Importar configuración desde JSON
 * @access Private (Admin)
 */
router.post('/import', authenticateAdmin, async (req, res) => {
  try {
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({
        success: false,
        error: 'Datos de importación requeridos'
      });
    }

    const username = req.user?.username || 'admin';
    const result = await BackupService.importConfiguration(data, username);

    res.json({
      success: true,
      data: result,
      message: 'Configuración importada exitosamente'
    });
  } catch (error) {
    logger.error('Error en POST /api/backup/import:', error);
    res.status(500).json({
      success: false,
      error: 'Error al importar configuración',
      message: error.message
    });
  }
});

/**
 * @route GET /api/backup/list
 * @desc Listar backups guardados
 * @access Private (Admin)
 */
router.get('/list', authenticateAdmin, async (req, res) => {
  try {
    const backups = await BackupService.listBackups();

    res.json({
      success: true,
      data: backups,
      total: backups.length
    });
  } catch (error) {
    logger.error('Error en GET /api/backup/list:', error);
    res.status(500).json({
      success: false,
      error: 'Error al listar backups'
    });
  }
});

/**
 * @route POST /api/backup/save
 * @desc Guardar backup con nombre
 * @access Private (Admin)
 */
router.post('/save', authenticateAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Nombre del backup requerido'
      });
    }

    const username = req.user?.username || 'admin';
    const backup = await BackupService.saveBackup(name, description || '', username);

    res.json({
      success: true,
      data: backup,
      message: `Backup "${name}" guardado exitosamente`
    });
  } catch (error) {
    logger.error('Error en POST /api/backup/save:', error);
    res.status(500).json({
      success: false,
      error: 'Error al guardar backup',
      message: error.message
    });
  }
});

/**
 * @route GET /api/backup/:id
 * @desc Obtener backup por ID
 * @access Private (Admin)
 */
router.get('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const backup = await BackupService.getBackupById(parseInt(id));

    if (!backup) {
      return res.status(404).json({
        success: false,
        error: 'Backup no encontrado'
      });
    }

    res.json({
      success: true,
      data: backup
    });
  } catch (error) {
    logger.error('Error en GET /api/backup/:id:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener backup'
    });
  }
});

/**
 * @route POST /api/backup/:id/restore
 * @desc Restaurar desde backup guardado
 * @access Private (Admin)
 */
router.post('/:id/restore', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const username = req.user?.username || 'admin';

    const result = await BackupService.restoreFromBackup(parseInt(id), username);

    res.json({
      success: true,
      data: result,
      message: 'Configuración restaurada exitosamente desde backup'
    });
  } catch (error) {
    logger.error('Error en POST /api/backup/:id/restore:', error);
    res.status(500).json({
      success: false,
      error: 'Error al restaurar backup',
      message: error.message
    });
  }
});

/**
 * @route DELETE /api/backup/:id
 * @desc Eliminar backup
 * @access Private (Admin)
 */
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await BackupService.deleteBackup(parseInt(id));

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Backup no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Backup eliminado exitosamente'
    });
  } catch (error) {
    logger.error('Error en DELETE /api/backup/:id:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar backup'
    });
  }
});

module.exports = router;
