const express = require('express');
const router = express.Router();
const NotificationService = require('../core/services/NotificationService');
const { query } = require('../db/pool');
const logger = require('../utils/logger');

/**
 * Notification Routes - Manual Testing Endpoints
 *
 * Permite probar manualmente el envío de notificaciones Telegram
 */

/**
 * POST /api/notifications/test/orden-pagada
 * Probar notificación de orden pagada
 *
 * Body: { ordenTrabajoId: number }
 */
router.post('/test/orden-pagada', async (req, res) => {
  try {
    const { ordenTrabajoId } = req.body;

    if (!ordenTrabajoId) {
      return res.status(400).json({
        success: false,
        error: 'ordenTrabajoId es requerido'
      });
    }

    // Obtener datos de la orden
    const result = await query(
      `SELECT ot.id, ot.numero, ot.paciente_id, ot.fecha, ot.factura_id,
              p.nombre, p.apellido, p.telefono
       FROM orden_trabajo ot
       JOIN paciente p ON ot.paciente_id = p.id
       WHERE ot.id = $1`,
      [ordenTrabajoId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Orden de trabajo no encontrada'
      });
    }

    const orden = result.rows[0];

    // Verificar que tenga factura_id
    if (!orden.factura_id) {
      return res.status(400).json({
        success: false,
        error: 'La orden no tiene factura_id asignado (no está pagada)'
      });
    }

    // Enviar notificación
    logger.info(`📤 TEST: Enviando notificación de orden pagada para orden ${orden.numero}`);

    const notificationResult = await NotificationService.notifyOrdenPagada(orden);

    res.json({
      success: true,
      message: 'Notificación enviada exitosamente',
      data: {
        ordenTrabajo: {
          id: orden.id,
          numero: orden.numero,
          paciente: `${orden.nombre} ${orden.apellido}`,
          telefono: orden.telefono
        },
        notificationResult
      }
    });

  } catch (error) {
    logger.error('Error en test de notificación orden pagada:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/notifications/test/resultados-listos
 * Probar notificación de resultados listos
 *
 * Body: { ordenTrabajoId: number }
 */
router.post('/test/resultados-listos', async (req, res) => {
  try {
    const { ordenTrabajoId } = req.body;

    if (!ordenTrabajoId) {
      return res.status(400).json({
        success: false,
        error: 'ordenTrabajoId es requerido'
      });
    }

    // Obtener datos de la orden
    const result = await query(
      `SELECT ot.id, ot.numero, ot.paciente_id, ot.fecha_validado, ot.status_id,
              p.nombre, p.apellido, p.telefono
       FROM orden_trabajo ot
       JOIN paciente p ON ot.paciente_id = p.id
       WHERE ot.id = $1`,
      [ordenTrabajoId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Orden de trabajo no encontrada'
      });
    }

    const orden = result.rows[0];

    // Verificar que esté validada (status_id = 4)
    if (orden.status_id !== 4) {
      return res.status(400).json({
        success: false,
        error: `La orden no está validada. Status actual: ${orden.status_id} (debe ser 4)`
      });
    }

    // Enviar notificación
    logger.info(`📤 TEST: Enviando notificación de resultados listos para orden ${orden.numero}`);

    const notificationResult = await NotificationService.notifyResultadosListos(orden);

    res.json({
      success: true,
      message: 'Notificación enviada exitosamente',
      data: {
        ordenTrabajo: {
          id: orden.id,
          numero: orden.numero,
          paciente: `${orden.nombre} ${orden.apellido}`,
          telefono: orden.telefono,
          fechaValidado: orden.fecha_validado
        },
        notificationResult
      }
    });

  } catch (error) {
    logger.error('Error en test de notificación resultados listos:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/notifications/history/:ordenTrabajoId
 * Ver historial de notificaciones de una orden
 */
router.get('/history/:ordenTrabajoId', async (req, res) => {
  try {
    const { ordenTrabajoId } = req.params;

    const result = await query(
      `SELECT id, notification_type, telegram_chat_id, sent_at, status, error_message, retry_count
       FROM telegram_notifications
       WHERE orden_trabajo_id = $1
       ORDER BY sent_at DESC`,
      [ordenTrabajoId]
    );

    res.json({
      success: true,
      data: {
        ordenTrabajoId: parseInt(ordenTrabajoId),
        notifications: result.rows
      }
    });

  } catch (error) {
    logger.error('Error al obtener historial de notificaciones:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/notifications/stats
 * Estadísticas de notificaciones
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await query(`
      SELECT
        notification_type,
        status,
        COUNT(*) as count
      FROM telegram_notifications
      GROUP BY notification_type, status
      ORDER BY notification_type, status
    `);

    const total = await query(`
      SELECT COUNT(*) as total FROM telegram_notifications
    `);

    const recentErrors = await query(`
      SELECT tn.*, ot.numero as orden_numero, p.nombre, p.apellido
      FROM telegram_notifications tn
      JOIN orden_trabajo ot ON tn.orden_trabajo_id = ot.id
      JOIN paciente p ON tn.paciente_id = p.id
      WHERE tn.status = 'failed'
      ORDER BY tn.sent_at DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        total: parseInt(total.rows[0].total),
        byTypeAndStatus: stats.rows,
        recentErrors: recentErrors.rows
      }
    });

  } catch (error) {
    logger.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
