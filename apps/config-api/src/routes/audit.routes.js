const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateAdmin } = require('../middleware/adminAuth');

/**
 * GET /api/audit
 * Obtener historial de cambios de configuración
 * Query params:
 *   - limit: número de resultados (default 50, max 500)
 *   - offset: offset para paginación
 *   - key: filtrar por key específica
 *   - changed_by: filtrar por usuario
 *   - from_date: fecha desde (ISO 8601)
 *   - to_date: fecha hasta (ISO 8601)
 */
router.get('/', authenticateAdmin, async (req, res, next) => {
  try {
    const {
      limit = 50,
      offset = 0,
      key,
      changed_by,
      from_date,
      to_date
    } = req.query;

    // Validaciones
    const limitNum = Math.min(parseInt(limit) || 50, 500);
    const offsetNum = parseInt(offset) || 0;

    // Construir query dinámicamente
    let query = 'SELECT * FROM system_config_audit WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (key) {
      query += ` AND key = $${paramCount++}`;
      params.push(key);
    }

    if (changed_by) {
      query += ` AND changed_by = $${paramCount++}`;
      params.push(changed_by);
    }

    if (from_date) {
      query += ` AND changed_at >= $${paramCount++}`;
      params.push(from_date);
    }

    if (to_date) {
      query += ` AND changed_at <= $${paramCount++}`;
      params.push(to_date);
    }

    query += ` ORDER BY changed_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(limitNum, offsetNum);

    const result = await db.query(query, params);

    // Obtener total de registros (sin paginación)
    let countQuery = 'SELECT COUNT(*) as total FROM system_config_audit WHERE 1=1';
    const countParams = [];
    let countParamCount = 1;

    if (key) {
      countQuery += ` AND key = $${countParamCount++}`;
      countParams.push(key);
    }

    if (changed_by) {
      countQuery += ` AND changed_by = $${countParamCount++}`;
      countParams.push(changed_by);
    }

    if (from_date) {
      countQuery += ` AND changed_at >= $${countParamCount++}`;
      countParams.push(from_date);
    }

    if (to_date) {
      countQuery += ` AND changed_at <= $${countParamCount++}`;
      countParams.push(to_date);
    }

    const countResult = await db.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    res.json({
      data: result.rows,
      pagination: {
        total,
        limit: limitNum,
        offset: offsetNum,
        has_more: offsetNum + limitNum < total
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/audit/recent
 * Obtener últimos N cambios (acceso rápido sin autenticación para dashboard)
 */
router.get('/recent', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);

    const query = `
      SELECT id, key, old_value, new_value, changed_by, changed_at, change_reason
      FROM system_config_audit
      ORDER BY changed_at DESC
      LIMIT $1
    `;

    const result = await db.query(query, [limit]);

    res.json({
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/audit/by-key/:key
 * Obtener historial completo de cambios de una configuración específica
 */
router.get('/by-key/:key(*)', authenticateAdmin, async (req, res, next) => {
  try {
    const { key } = req.params;
    const limit = Math.min(parseInt(req.query.limit) || 100, 500);

    const query = `
      SELECT * FROM system_config_audit
      WHERE key = $1
      ORDER BY changed_at DESC
      LIMIT $2
    `;

    const result = await db.query(query, [key, limit]);

    res.json({
      key,
      history: result.rows,
      total_changes: result.rows.length
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/audit/by-user/:username
 * Obtener cambios realizados por un usuario específico
 */
router.get('/by-user/:username', authenticateAdmin, async (req, res, next) => {
  try {
    const { username } = req.params;
    const limit = Math.min(parseInt(req.query.limit) || 100, 500);

    const query = `
      SELECT * FROM system_config_audit
      WHERE changed_by = $1
      ORDER BY changed_at DESC
      LIMIT $2
    `;

    const result = await db.query(query, [username, limit]);

    res.json({
      username,
      changes: result.rows,
      total_changes: result.rows.length
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/audit/stats
 * Estadísticas de auditoría
 */
router.get('/stats', authenticateAdmin, async (req, res, next) => {
  try {
    // Total de cambios
    const totalQuery = 'SELECT COUNT(*) as total FROM system_config_audit';
    const totalResult = await db.query(totalQuery);

    // Cambios por usuario
    const byUserQuery = `
      SELECT changed_by, COUNT(*) as changes
      FROM system_config_audit
      GROUP BY changed_by
      ORDER BY changes DESC
      LIMIT 10
    `;
    const byUserResult = await db.query(byUserQuery);

    // Configuraciones más modificadas
    const mostChangedQuery = `
      SELECT key, COUNT(*) as changes
      FROM system_config_audit
      GROUP BY key
      ORDER BY changes DESC
      LIMIT 10
    `;
    const mostChangedResult = await db.query(mostChangedQuery);

    // Cambios en últimas 24 horas
    const last24hQuery = `
      SELECT COUNT(*) as changes
      FROM system_config_audit
      WHERE changed_at >= NOW() - INTERVAL '24 hours'
    `;
    const last24hResult = await db.query(last24hQuery);

    res.json({
      total_changes: parseInt(totalResult.rows[0].total),
      changes_last_24h: parseInt(last24hResult.rows[0].changes),
      changes_by_user: byUserResult.rows,
      most_changed_configs: mostChangedResult.rows
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
