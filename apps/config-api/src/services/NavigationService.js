const DatabaseRouter = require('./DatabaseRouter');
const logger = require('../utils/logger');
const CacheService = require('./CacheService');

const CACHE_PREFIX = 'navigation';
const CACHE_TTL = 1800; // 30 minutos

class NavigationService {
  /**
   * Obtener items de navegación por ubicación
   * @param {string} location - Ubicación del menú (header, sidebar, footer_quick, etc.)
   * @param {boolean} includeInactive - Incluir items inactivos (para admin)
   */
  static async getNavigationByLocation(location, includeInactive = false) {
    try {
      const cacheKey = `${CACHE_PREFIX}:${location}:${includeInactive}`;
      const cached = CacheService.get(cacheKey);
      if (cached) {
        return cached;
      }

      // Obtener pool de la DB de configuración del laboratorio activo
      const pool = await DatabaseRouter.getConfigPool();

      let query = `
        SELECT * FROM navigation_items
        WHERE location = $1
      `;
      const params = [location];

      if (!includeInactive) {
        query += ' AND is_active = true';
      }

      query += ' ORDER BY sort_order ASC, id ASC';

      const result = await pool.query(query, params);
      CacheService.set(cacheKey, result.rows, CACHE_TTL);

      return result.rows;
    } catch (error) {
      logger.error('Error al obtener navegación por ubicación:', error);
      throw error;
    }
  }

  /**
   * Obtener toda la navegación agrupada por ubicación
   */
  static async getAllNavigation(includeInactive = false) {
    try {
      const cacheKey = `${CACHE_PREFIX}:all:${includeInactive}`;
      const cached = CacheService.get(cacheKey);
      if (cached) {
        return cached;
      }

      // Obtener pool de la DB de configuración del laboratorio activo
      const pool = await DatabaseRouter.getConfigPool();

      let query = 'SELECT * FROM navigation_items';
      if (!includeInactive) {
        query += ' WHERE is_active = true';
      }
      query += ' ORDER BY location, sort_order ASC, id ASC';

      const result = await pool.query(query);

      // Agrupar por ubicación
      const grouped = {};
      for (const item of result.rows) {
        if (!grouped[item.location]) {
          grouped[item.location] = [];
        }
        grouped[item.location].push(item);
      }

      CacheService.set(cacheKey, grouped, CACHE_TTL);
      return grouped;
    } catch (error) {
      logger.error('Error al obtener toda la navegación:', error);
      throw error;
    }
  }

  /**
   * Crear nuevo item de navegación
   */
  static async createNavigationItem(data) {
    try {
      const {
        location, label, url, icon, target, is_external,
        is_active, requires_auth, show_on_mobile, show_on_desktop,
        parent_id, sort_order
      } = data;

      // Obtener pool de la DB de configuración del laboratorio activo
      const pool = await DatabaseRouter.getConfigPool();

      const query = `
        INSERT INTO navigation_items (
          location, label, url, icon, target, is_external,
          is_active, requires_auth, show_on_mobile, show_on_desktop,
          parent_id, sort_order
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *
      `;

      const values = [
        location, label, url, icon || null, target || '_self', is_external || false,
        is_active !== false, requires_auth || false, show_on_mobile !== false,
        show_on_desktop !== false, parent_id || null, sort_order || 0
      ];

      const result = await pool.query(query, values);
      this.invalidateCache();

      logger.info('Navigation item creado:', { id: result.rows[0].id, label, location });
      return result.rows[0];
    } catch (error) {
      logger.error('Error al crear navigation item:', error);
      throw error;
    }
  }

  /**
   * Actualizar item de navegación
   */
  static async updateNavigationItem(id, updates) {
    try {
      const allowedFields = [
        'location', 'label', 'url', 'icon', 'target', 'is_external',
        'is_active', 'requires_auth', 'show_on_mobile', 'show_on_desktop',
        'parent_id', 'sort_order'
      ];

      const setClauses = [];
      const values = [];
      let paramIndex = 1;

      for (const [key, value] of Object.entries(updates)) {
        if (allowedFields.includes(key)) {
          setClauses.push(`${key} = $${paramIndex}`);
          values.push(value);
          paramIndex++;
        }
      }

      if (setClauses.length === 0) {
        throw new Error('No hay campos válidos para actualizar');
      }

      // Obtener pool de la DB de configuración del laboratorio activo
      const pool = await DatabaseRouter.getConfigPool();

      values.push(id);
      const query = `
        UPDATE navigation_items
        SET ${setClauses.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;

      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        throw new Error('Item de navegación no encontrado');
      }

      this.invalidateCache();
      logger.info('Navigation item actualizado:', { id });
      return result.rows[0];
    } catch (error) {
      logger.error('Error al actualizar navigation item:', error);
      throw error;
    }
  }

  /**
   * Eliminar item de navegación
   */
  static async deleteNavigationItem(id) {
    try {
      // Obtener pool de la DB de configuración del laboratorio activo
      const pool = await DatabaseRouter.getConfigPool();

      const query = 'DELETE FROM navigation_items WHERE id = $1 RETURNING *';
      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        throw new Error('Item de navegación no encontrado');
      }

      this.invalidateCache();
      logger.info('Navigation item eliminado:', { id });
      return result.rows[0];
    } catch (error) {
      logger.error('Error al eliminar navigation item:', error);
      throw error;
    }
  }

  /**
   * Reordenar items de navegación
   * @param {Array} items - Array de { id, sort_order }
   */
  static async reorderNavigationItems(items) {
    try {
      // Obtener pool de la DB de configuración del laboratorio activo
      const pool = await DatabaseRouter.getConfigPool();
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        for (const item of items) {
          await client.query(
            'UPDATE navigation_items SET sort_order = $1 WHERE id = $2',
            [item.sort_order, item.id]
          );
        }

        await client.query('COMMIT');
        this.invalidateCache();
        logger.info('Navigation items reordenados:', { count: items.length });
        return true;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error('Error al reordenar navigation items:', error);
      throw error;
    }
  }

  /**
   * Toggle estado activo/inactivo
   */
  static async toggleNavigationItem(id, is_active) {
    try {
      // Obtener pool de la DB de configuración del laboratorio activo
      const pool = await DatabaseRouter.getConfigPool();

      const query = `
        UPDATE navigation_items
        SET is_active = $1
        WHERE id = $2
        RETURNING *
      `;
      const result = await pool.query(query, [is_active, id]);

      if (result.rows.length === 0) {
        throw new Error('Item de navegación no encontrado');
      }

      this.invalidateCache();
      return result.rows[0];
    } catch (error) {
      logger.error('Error al toggle navigation item:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de navegación
   */
  static async getNavigationStats() {
    try {
      // Obtener pool de la DB de configuración del laboratorio activo
      const pool = await DatabaseRouter.getConfigPool();

      const query = `
        SELECT
          location,
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE is_active = true) as active,
          COUNT(*) FILTER (WHERE is_active = false) as inactive
        FROM navigation_items
        GROUP BY location
        ORDER BY location
      `;
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      logger.error('Error al obtener stats de navegación:', error);
      throw error;
    }
  }

  /**
   * Invalidar caché de navegación
   */
  static invalidateCache() {
    // Invalidar todas las keys relacionadas con navegación
    const keys = CacheService.keys();
    for (const key of keys) {
      if (key.startsWith(CACHE_PREFIX)) {
        CacheService.delete(key);
      }
    }
    logger.info('Caché de navegación invalidado');
  }
}

module.exports = NavigationService;
