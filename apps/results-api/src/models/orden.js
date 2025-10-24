import pool from '../config/database.js';
import logger from '../config/logger.js';

/**
 * Modelo para manejar órdenes de trabajo del laboratorio
 */
export const Orden = {
  /**
   * Obtener todas las órdenes de un paciente por su código de lealtad
   */
  async findByCodigoLealtad(codigoLealtad) {
    try {
      const query = `
        SELECT
          o.id,
          o.numero,
          o.fecha,
          p.nombre || ' ' || p.apellido as paciente_nombre,
          p.ci_paciente,
          s.status as estado,
          COUNT(DISTINCT po.id) as total_pruebas,
          COUNT(DISTINCT CASE WHEN (rn.pruebao_id IS NOT NULL OR ra.pruebao_id IS NOT NULL) THEN po.id END) as pruebas_con_resultado
        FROM orden_trabajo o
        INNER JOIN paciente p ON o.paciente_id = p.id
        INNER JOIN status_orden s ON o.status_id = s.id
        LEFT JOIN prueba_orden po ON o.id = po.orden_id
        LEFT JOIN resultado_numer rn ON po.id = rn.pruebao_id
        LEFT JOIN resultado_alpha ra ON po.id = ra.pruebao_id
        WHERE p.ci_paciente = $1
        GROUP BY o.id, o.numero, o.fecha, p.nombre, p.apellido, p.ci_paciente, s.status
        ORDER BY o.fecha DESC
        LIMIT 50
      `;

      const result = await pool.query(query, [codigoLealtad]);
      logger.info(`Órdenes encontradas para código ${codigoLealtad}: ${result.rows.length}`);
      return result.rows;
    } catch (error) {
      logger.error('Error al buscar órdenes por código de lealtad:', error);
      throw error;
    }
  },

  /**
   * Obtener detalles completos de una orden específica
   */
  async findByNumero(numeroOrden, codigoLealtad) {
    try {
      const query = `
        SELECT
          o.id,
          o.numero,
          o.fecha,
          p.id as paciente_id,
          p.nombre,
          p.apellido,
          p.ci_paciente,
          p.fecha_nacimiento,
          p.sexo,
          p.telefono,
          p.email,
          s.status as estado,
          m.nombre as medico_nombre
        FROM orden_trabajo o
        INNER JOIN paciente p ON o.paciente_id = p.id
        INNER JOIN status_orden s ON o.status_id = s.id
        LEFT JOIN medico m ON o.medico_id = m.id
        WHERE o.numero = $1 AND p.ci_paciente = $2
      `;

      const result = await pool.query(query, [numeroOrden, codigoLealtad]);

      if (result.rows.length === 0) {
        logger.warn(`Orden ${numeroOrden} no encontrada para código ${codigoLealtad}`);
        return null;
      }

      logger.info(`Orden ${numeroOrden} encontrada`);
      return result.rows[0];
    } catch (error) {
      logger.error(`Error al buscar orden ${numeroOrden}:`, error);
      throw error;
    }
  },

  /**
   * Verificar que una orden pertenece a un paciente específico
   */
  async verificarPropiedad(numeroOrden, codigoLealtad) {
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM orden_trabajo o
        INNER JOIN paciente p ON o.paciente_id = p.id
        WHERE o.numero = $1 AND p.ci_paciente = $2
      `;

      const result = await pool.query(query, [numeroOrden, codigoLealtad]);
      return result.rows[0].count > 0;
    } catch (error) {
      logger.error('Error al verificar propiedad de orden:', error);
      throw error;
    }
  },
};

export default Orden;
