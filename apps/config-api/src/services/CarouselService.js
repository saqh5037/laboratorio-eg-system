const DatabaseRouter = require('./DatabaseRouter');
const logger = require('../utils/logger');
const CacheService = require('./CacheService');

const CACHE_KEY_PREFIX = 'carousel:';
const CACHE_TTL = 5 * 60; // 5 minutos

/**
 * CarouselService
 * Servicio para gestionar slides del carrusel principal
 */
class CarouselService {
  /**
   * Obtener slides activos y programados para mostrar públicamente
   * Solo retorna slides que estén:
   * - Activos (is_active = true)
   * - Dentro del rango de fechas (si están configuradas)
   * @param {string} lab - Código del laboratorio (opcional, usa activo si no se especifica)
   */
  async getActiveSlides(lab = null) {
    const cacheKey = `${CACHE_KEY_PREFIX}${lab || 'default'}:active`;
    const cached = CacheService.get(cacheKey);

    if (cached) {
      logger.info(`Carousel slides obtenidos desde cache (lab: ${lab || 'default'})`);
      return cached;
    }

    try {
      // Obtener pool de la DB de configuración del laboratorio especificado o activo
      const pool = await DatabaseRouter.getConfigPool(lab);

      const query = `
        SELECT *
        FROM carousel_slides
        WHERE is_active = true
          AND (start_date IS NULL OR start_date <= NOW())
          AND (end_date IS NULL OR end_date >= NOW())
        ORDER BY order_position ASC
      `;

      const result = await pool.query(query);

      logger.info(`${result.rows.length} slides activos obtenidos desde BD (lab: ${lab || 'default'})`);

      // Cachear resultado
      CacheService.set(cacheKey, result.rows, CACHE_TTL);

      return result.rows;
    } catch (error) {
      logger.error('Error obteniendo slides activos:', error);
      throw error;
    }
  }

  /**
   * Obtener todos los slides (admin)
   * Incluye slides inactivos y fuera de rango de fechas
   * @param {string} lab - Código del laboratorio (opcional, usa activo si no se especifica)
   */
  async getAllSlides(lab = null) {
    try {
      // Obtener pool de la DB de configuración del laboratorio especificado o activo
      const pool = await DatabaseRouter.getConfigPool(lab);

      const query = `
        SELECT *
        FROM carousel_slides
        ORDER BY order_position ASC, created_at DESC
      `;

      const result = await pool.query(query);

      logger.info(`${result.rows.length} slides totales obtenidos (admin view, lab: ${lab || 'default'})`);

      return result.rows;
    } catch (error) {
      logger.error('Error obteniendo todos los slides:', error);
      throw error;
    }
  }

  /**
   * Obtener un slide por ID
   * @param {number} id - ID del slide
   * @param {string} lab - Código del laboratorio (opcional)
   */
  async getSlideById(id, lab = null) {
    try {
      // Obtener pool de la DB de configuración del laboratorio especificado o activo
      const pool = await DatabaseRouter.getConfigPool(lab);

      const query = `SELECT * FROM carousel_slides WHERE id = $1`;
      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        logger.warn(`Slide con ID ${id} no encontrado (lab: ${lab || 'default'})`);
        return null;
      }

      return result.rows[0];
    } catch (error) {
      logger.error(`Error obteniendo slide ${id}:`, error);
      throw error;
    }
  }

  /**
   * Crear nuevo slide
   * @param {Object} slideData - Datos del slide
   * @param {string} lab - Código del laboratorio (opcional)
   */
  async createSlide(slideData, lab = null) {
    try {
      const {
        title,
        subtitle,
        description,
        image_url,
        image_alt,
        image_mobile_url,
        cta1_text,
        cta1_link,
        cta2_text,
        cta2_link,
        badge_text,
        badge_color = 'purple',
        is_active = true,
        start_date,
        end_date,
        created_by
      } = slideData;

      // Validaciones
      this._validateSlideData(slideData);

      // Obtener pool de la DB de configuración del laboratorio especificado o activo
      const pool = await DatabaseRouter.getConfigPool(lab);

      // Obtener el siguiente order_position
      const maxOrderResult = await pool.query(
        'SELECT COALESCE(MAX(order_position), -1) + 1 as next_order FROM carousel_slides'
      );
      const order_position = maxOrderResult.rows[0].next_order;

      const query = `
        INSERT INTO carousel_slides (
          title, subtitle, description,
          image_url, image_alt, image_mobile_url,
          cta1_text, cta1_link, cta2_text, cta2_link,
          badge_text, badge_color,
          is_active, order_position,
          start_date, end_date,
          created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING *
      `;

      const values = [
        title,
        subtitle || null,
        description || null,
        image_url,
        image_alt || null,
        image_mobile_url || null,
        cta1_text || null,
        cta1_link || null,
        cta2_text || null,
        cta2_link || null,
        badge_text || null,
        badge_color,
        is_active,
        order_position,
        start_date || null,
        end_date || null,
        created_by || null
      ];

      const result = await pool.query(query, values);
      const newSlide = result.rows[0];

      logger.info(`Slide creado exitosamente: ID ${newSlide.id}, título "${newSlide.title}"`);

      // Invalidar cache
      this._invalidateCache(lab);

      return newSlide;
    } catch (error) {
      logger.error('Error creando slide:', error);
      throw error;
    }
  }

  /**
   * Actualizar slide existente
   * @param {number} id - ID del slide
   * @param {Object} slideData - Datos a actualizar
   * @param {string} lab - Código del laboratorio (opcional)
   */
  async updateSlide(id, slideData, lab = null) {
    try {
      // Verificar que el slide existe
      const existingSlide = await this.getSlideById(id, lab);
      if (!existingSlide) {
        throw new Error(`Slide con ID ${id} no encontrado`);
      }

      const {
        title,
        subtitle,
        description,
        image_url,
        image_alt,
        image_mobile_url,
        cta1_text,
        cta1_link,
        cta2_text,
        cta2_link,
        badge_text,
        badge_color,
        is_active,
        start_date,
        end_date,
        updated_by
      } = slideData;

      // Validaciones
      this._validateSlideData(slideData);

      // Obtener pool de la DB de configuración del laboratorio especificado o activo
      const pool = await DatabaseRouter.getConfigPool(lab);

      const query = `
        UPDATE carousel_slides
        SET
          title = $1,
          subtitle = $2,
          description = $3,
          image_url = $4,
          image_alt = $5,
          image_mobile_url = $6,
          cta1_text = $7,
          cta1_link = $8,
          cta2_text = $9,
          cta2_link = $10,
          badge_text = $11,
          badge_color = $12,
          is_active = $13,
          start_date = $14,
          end_date = $15,
          updated_by = $16,
          updated_at = NOW()
        WHERE id = $17
        RETURNING *
      `;

      const values = [
        title || existingSlide.title,
        subtitle !== undefined ? subtitle : existingSlide.subtitle,
        description !== undefined ? description : existingSlide.description,
        image_url || existingSlide.image_url,
        image_alt !== undefined ? image_alt : existingSlide.image_alt,
        image_mobile_url !== undefined ? image_mobile_url : existingSlide.image_mobile_url,
        cta1_text !== undefined ? cta1_text : existingSlide.cta1_text,
        cta1_link !== undefined ? cta1_link : existingSlide.cta1_link,
        cta2_text !== undefined ? cta2_text : existingSlide.cta2_text,
        cta2_link !== undefined ? cta2_link : existingSlide.cta2_link,
        badge_text !== undefined ? badge_text : existingSlide.badge_text,
        badge_color || existingSlide.badge_color,
        is_active !== undefined ? is_active : existingSlide.is_active,
        start_date !== undefined ? start_date : existingSlide.start_date,
        end_date !== undefined ? end_date : existingSlide.end_date,
        updated_by || null,
        id
      ];

      const result = await pool.query(query, values);
      const updatedSlide = result.rows[0];

      logger.info(`Slide actualizado exitosamente: ID ${id}`);

      // Invalidar cache
      this._invalidateCache(lab);

      return updatedSlide;
    } catch (error) {
      logger.error(`Error actualizando slide ${id}:`, error);
      throw error;
    }
  }

  /**
   * Eliminar slide
   * @param {number} id - ID del slide
   * @param {string} lab - Código del laboratorio (opcional)
   */
  async deleteSlide(id, lab = null) {
    try {
      const slide = await this.getSlideById(id, lab);
      if (!slide) {
        throw new Error(`Slide con ID ${id} no encontrado`);
      }

      // Obtener pool de la DB de configuración del laboratorio especificado o activo
      const pool = await DatabaseRouter.getConfigPool(lab);

      const query = 'DELETE FROM carousel_slides WHERE id = $1 RETURNING *';
      const result = await pool.query(query, [id]);

      logger.info(`Slide eliminado: ID ${id}, título "${slide.title}"`);

      // Invalidar cache
      this._invalidateCache(lab);

      return result.rows[0];
    } catch (error) {
      logger.error(`Error eliminando slide ${id}:`, error);
      throw error;
    }
  }

  /**
   * Toggle estado activo/inactivo
   * @param {number} id - ID del slide
   * @param {boolean} isActive - Nuevo estado
   * @param {string} lab - Código del laboratorio (opcional)
   */
  async toggleActive(id, isActive, lab = null) {
    try {
      // Obtener pool de la DB de configuración del laboratorio especificado o activo
      const pool = await DatabaseRouter.getConfigPool(lab);

      const query = `
        UPDATE carousel_slides
        SET is_active = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING *
      `;

      const result = await pool.query(query, [isActive, id]);

      if (result.rows.length === 0) {
        throw new Error(`Slide con ID ${id} no encontrado`);
      }

      logger.info(`Slide ${id} ${isActive ? 'activado' : 'desactivado'}`);

      // Invalidar cache
      this._invalidateCache(lab);

      return result.rows[0];
    } catch (error) {
      logger.error(`Error cambiando estado de slide ${id}:`, error);
      throw error;
    }
  }

  /**
   * Reordenar slide a nueva posición
   * @param {number} id - ID del slide
   * @param {number} newPosition - Nueva posición
   * @param {string} lab - Código del laboratorio (opcional)
   */
  async reorderSlide(id, newPosition, lab = null) {
    // Obtener pool de la DB de configuración del laboratorio especificado o activo
    const pool = await DatabaseRouter.getConfigPool(lab);

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Obtener posición actual
      const currentSlideResult = await client.query(
        'SELECT order_position FROM carousel_slides WHERE id = $1',
        [id]
      );

      if (currentSlideResult.rows.length === 0) {
        throw new Error(`Slide con ID ${id} no encontrado`);
      }

      const oldPosition = currentSlideResult.rows[0].order_position;

      // Si la posición no cambió, no hacer nada
      if (oldPosition === newPosition) {
        await client.query('COMMIT');
        return await this.getSlideById(id);
      }

      if (newPosition > oldPosition) {
        // Mover hacia abajo: decrementar los que están en el medio
        await client.query(`
          UPDATE carousel_slides
          SET order_position = order_position - 1
          WHERE order_position > $1 AND order_position <= $2
        `, [oldPosition, newPosition]);
      } else if (newPosition < oldPosition) {
        // Mover hacia arriba: incrementar los que están en el medio
        await client.query(`
          UPDATE carousel_slides
          SET order_position = order_position + 1
          WHERE order_position >= $1 AND order_position < $2
        `, [newPosition, oldPosition]);
      }

      // Actualizar la posición del slide movido
      const result = await client.query(
        'UPDATE carousel_slides SET order_position = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
        [newPosition, id]
      );

      await client.query('COMMIT');

      logger.info(`Slide ${id} reordenado de posición ${oldPosition} a ${newPosition} (lab: ${lab || 'default'})`);

      // Invalidar cache
      this._invalidateCache(lab);

      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error(`Error reordenando slide ${id}:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Obtener estadísticas de slides
   * @param {string} lab - Código del laboratorio (opcional)
   */
  async getStats(lab = null) {
    try {
      // Obtener pool de la DB de configuración del laboratorio especificado o activo
      const pool = await DatabaseRouter.getConfigPool(lab);

      const query = `
        SELECT
          COUNT(*) as total_slides,
          COUNT(*) FILTER (WHERE is_active = true) as active_slides,
          COUNT(*) FILTER (WHERE is_active = false) as inactive_slides,
          COUNT(*) FILTER (WHERE start_date IS NOT NULL AND end_date IS NOT NULL) as scheduled_slides,
          COUNT(*) FILTER (WHERE badge_text IS NOT NULL) as slides_with_badges
        FROM carousel_slides
      `;

      const result = await pool.query(query);
      return result.rows[0];
    } catch (error) {
      logger.error('Error obteniendo estadísticas de carousel:', error);
      throw error;
    }
  }

  /**
   * Validar datos del slide
   */
  _validateSlideData(data) {
    const errors = [];

    if (data.title && data.title.trim().length < 3) {
      errors.push('El título debe tener al menos 3 caracteres');
    }

    if (data.title && data.title.length > 200) {
      errors.push('El título no puede exceder 200 caracteres');
    }

    if (!data.image_url && data.title) { // Solo validar si es creación
      errors.push('La imagen es obligatoria');
    }

    if (data.cta1_text && !data.cta1_link) {
      errors.push('Si defines un CTA1 debe tener un link');
    }

    if (data.cta2_text && !data.cta2_link) {
      errors.push('Si defines un CTA2 debe tener un link');
    }

    if (data.order_position !== undefined && data.order_position < 0) {
      errors.push('La posición debe ser mayor o igual a 0');
    }

    if (data.start_date && data.end_date) {
      const startDate = new Date(data.start_date);
      const endDate = new Date(data.end_date);

      if (startDate > endDate) {
        errors.push('La fecha de inicio debe ser anterior a la fecha de fin');
      }
    }

    if (errors.length > 0) {
      throw new Error(`Validación fallida: ${errors.join(', ')}`);
    }
  }

  /**
   * Invalidar cache del carrusel
   * @param {string} lab - Código del laboratorio (opcional)
   */
  _invalidateCache(lab = null) {
    const activeKey = `${CACHE_KEY_PREFIX}${lab || 'default'}:active`;
    CacheService.del(activeKey);
    // También invalidar el cache default por si acaso
    if (lab) {
      CacheService.del(`${CACHE_KEY_PREFIX}default:active`);
    }
    logger.info(`Cache del carrusel invalidado (lab: ${lab || 'default'})`);
  }
}

module.exports = new CarouselService();
