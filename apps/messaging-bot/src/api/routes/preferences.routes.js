const express = require('express');
const router = express.Router();
const NotificationPreferencesService = require('../../core/services/NotificationPreferencesService');
const MessageTemplateService = require('../../core/services/MessageTemplateService');
const logger = require('../../utils/logger');

/**
 * GET /api/preferences/:pacienteId
 * Obtener preferencias de notificación de un paciente
 */
router.get('/:pacienteId', async (req, res) => {
  try {
    const { pacienteId } = req.params;

    if (!pacienteId || isNaN(pacienteId)) {
      return res.status(400).json({
        success: false,
        error: 'ID de paciente inválido'
      });
    }

    const preferences = await NotificationPreferencesService.getPreferences(parseInt(pacienteId));

    res.json({
      success: true,
      preferences
    });

  } catch (error) {
    logger.error('Error obteniendo preferencias:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo preferencias de notificación'
    });
  }
});

/**
 * PUT /api/preferences/:pacienteId
 * Actualizar preferencias de notificación de un paciente
 */
router.put('/:pacienteId', async (req, res) => {
  try {
    const { pacienteId } = req.params;
    const preferences = req.body;

    if (!pacienteId || isNaN(pacienteId)) {
      return res.status(400).json({
        success: false,
        error: 'ID de paciente inválido'
      });
    }

    // Validar que resultados_criticos siempre esté en true
    if (preferences.resultados_criticos === false) {
      return res.status(400).json({
        success: false,
        error: 'Las notificaciones de resultados críticos no pueden ser deshabilitadas por seguridad'
      });
    }

    const updated = await NotificationPreferencesService.updatePreferences(
      parseInt(pacienteId),
      preferences
    );

    // TODO: Enviar notificación de confirmación al paciente vía Telegram
    // const template = MessageTemplateService.format('preferencias_actualizadas', {
    //   paciente: 'Nombre del paciente',
    //   preferencias: updated
    // });

    res.json({
      success: true,
      preferences: updated
    });

  } catch (error) {
    logger.error('Error actualizando preferencias:', error);
    res.status(500).json({
      success: false,
      error: 'Error actualizando preferencias de notificación'
    });
  }
});

/**
 * POST /api/preferences/:pacienteId/disable-all
 * Deshabilitar todas las notificaciones (excepto críticas)
 */
router.post('/:pacienteId/disable-all', async (req, res) => {
  try {
    const { pacienteId } = req.params;

    if (!pacienteId || isNaN(pacienteId)) {
      return res.status(400).json({
        success: false,
        error: 'ID de paciente inválido'
      });
    }

    const updated = await NotificationPreferencesService.disableAllNotifications(
      parseInt(pacienteId)
    );

    res.json({
      success: true,
      preferences: updated,
      message: 'Todas las notificaciones han sido deshabilitadas (excepto críticas)'
    });

  } catch (error) {
    logger.error('Error deshabilitando notificaciones:', error);
    res.status(500).json({
      success: false,
      error: 'Error deshabilitando notificaciones'
    });
  }
});

/**
 * POST /api/preferences/:pacienteId/enable-all
 * Habilitar todas las notificaciones
 */
router.post('/:pacienteId/enable-all', async (req, res) => {
  try {
    const { pacienteId } = req.params;

    if (!pacienteId || isNaN(pacienteId)) {
      return res.status(400).json({
        success: false,
        error: 'ID de paciente inválido'
      });
    }

    const updated = await NotificationPreferencesService.enableAllNotifications(
      parseInt(pacienteId)
    );

    res.json({
      success: true,
      preferences: updated,
      message: 'Todas las notificaciones han sido habilitadas'
    });

  } catch (error) {
    logger.error('Error habilitando notificaciones:', error);
    res.status(500).json({
      success: false,
      error: 'Error habilitando notificaciones'
    });
  }
});

/**
 * GET /api/preferences/stats
 * Obtener estadísticas de preferencias de todos los pacientes
 */
router.get('/stats/all', async (req, res) => {
  try {
    const stats = await NotificationPreferencesService.getPreferencesStats();

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    logger.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo estadísticas'
    });
  }
});

/**
 * DELETE /api/preferences/:pacienteId
 * Eliminar preferencias de un paciente
 */
router.delete('/:pacienteId', async (req, res) => {
  try {
    const { pacienteId } = req.params;

    if (!pacienteId || isNaN(pacienteId)) {
      return res.status(400).json({
        success: false,
        error: 'ID de paciente inválido'
      });
    }

    await NotificationPreferencesService.deletePreferences(parseInt(pacienteId));

    res.json({
      success: true,
      message: 'Preferencias eliminadas correctamente'
    });

  } catch (error) {
    logger.error('Error eliminando preferencias:', error);
    res.status(500).json({
      success: false,
      error: 'Error eliminando preferencias'
    });
  }
});

module.exports = router;
