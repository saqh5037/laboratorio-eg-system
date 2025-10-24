import pool from '../config/database.js';
import logger from '../config/logger.js';

/**
 * Modelo para manejar resultados de laboratorio
 */
export const Resultado = {
  /**
   * Obtener todos los resultados de una orden con valores referenciales
   */
  async findByOrden(numeroOrden) {
    try {
      const query = `
        SELECT
          po.id as prueba_orden_id,
          pr.id as prueba_id,
          pr.nombre as prueba_nombre,
          pr.nomenclatura,
          pr.formato,
          pr.orden as prueba_orden,
          a.area as area_nombre,
          a.id as area_id,
          tm.tipo as tipo_muestra,

          -- Grupo de Prueba
          gp.id as grupo_prueba_id,
          gp.nombre as grupo_prueba_nombre,
          gp.orden as grupo_orden,
          tgp.codigo as tipo_grupo_codigo,

          -- Resultado numérico
          rn.valor as resultado_numerico,
          u.simbolo as unidad,

          -- Resultado alfanumérico
          ra.valor as resultado_alpha,

          -- Validación
          CASE
            WHEN rn.validado_por IS NOT NULL OR ra.validado_por IS NOT NULL THEN true
            ELSE false
          END as validado,
          rn.actualizado_timestamp as fecha_validacion,
          b.id as validado_por_id,
          b.nombre as validado_por_nombre,
          b.apellido as validado_por_apellido,
          b.cdb as validado_por_cdb,
          b.mpps as validado_por_mpps,

          -- Valores referenciales
          vr.valor_desde,
          vr.valor_hasta,
          vr.comentario as interpretacion,
          vr.panico as es_critico,

          -- Estado de la prueba
          so.status as estado_prueba,

          -- Determinar si está dentro del rango
          CASE
            WHEN rn.valor IS NOT NULL AND vr.valor_desde IS NOT NULL AND vr.valor_hasta IS NOT NULL THEN
              CASE
                WHEN rn.valor < vr.valor_desde THEN 'bajo'
                WHEN rn.valor > vr.valor_hasta THEN 'alto'
                ELSE 'normal'
              END
            ELSE 'sin_rango'
          END as interpretacion_valor

        FROM prueba_orden po
        INNER JOIN orden_trabajo o ON po.orden_id = o.id
        INNER JOIN prueba pr ON po.prueba_id = pr.id
        INNER JOIN area a ON pr.area_id = a.id
        INNER JOIN tipo_muestra tm ON pr.tipo_muestra_id = tm.id
        LEFT JOIN status_orden so ON po.status_id = so.id

        -- Grupo de Prueba
        LEFT JOIN grupo_prueba gp ON po.gp_id = gp.id
        LEFT JOIN tipo_grupo_prueba tgp ON gp.tipo_grupo_prueba_id = tgp.id

        -- Resultados
        LEFT JOIN resultado_numer rn ON po.id = rn.pruebao_id
        LEFT JOIN resultado_alpha ra ON po.id = ra.pruebao_id
        LEFT JOIN unidad u ON pr.unidad_id = u.id

        -- Validación
        LEFT JOIN bioanalista b ON COALESCE(rn.validado_por, ra.validado_por) = b.id

        -- Valores referenciales (ajustados por edad y sexo del paciente)
        LEFT JOIN paciente p ON o.paciente_id = p.id
        LEFT JOIN valor_referencial vr ON pr.id = vr.prueba_id
          AND (vr.sexo IS NULL OR vr.sexo = p.sexo)
          AND (
            EXTRACT(YEAR FROM AGE(p.fecha_nacimiento)) * 12 + EXTRACT(MONTH FROM AGE(p.fecha_nacimiento))
            BETWEEN
            vr.edad_desde * CASE vr.unidad_tiempo_id
              WHEN 1 THEN 12  -- Años a meses
              WHEN 2 THEN 1   -- Meses
              WHEN 3 THEN 0.033 -- Días a meses (aproximado)
              ELSE 1
            END
            AND
            vr.edad_hasta * CASE vr.unidad_tiempo_id
              WHEN 1 THEN 12  -- Años a meses
              WHEN 2 THEN 1   -- Meses
              WHEN 3 THEN 0.033 -- Días a meses (aproximado)
              ELSE 1
            END
          )

        WHERE o.numero = $1
          AND pr.reportable = true
          AND (so.id = 4 OR rn.valor IS NOT NULL OR ra.valor IS NOT NULL)
        ORDER BY
          a.area,
          COALESCE(gp.orden, 999999),
          gp.id,
          pr.orden,
          pr.id
      `;

      const result = await pool.query(query, [numeroOrden]);
      logger.info(`Resultados encontrados para orden ${numeroOrden}: ${result.rows.length}`);

      // Agrupar por área
      const resultadosPorArea = result.rows.reduce((acc, row) => {
        const area = row.area_nombre;
        if (!acc[area]) {
          acc[area] = [];
        }
        acc[area].push(row);
        return acc;
      }, {});

      return {
        total: result.rows.length,
        resultados: result.rows,
        porArea: resultadosPorArea
      };
    } catch (error) {
      logger.error(`Error al obtener resultados de orden ${numeroOrden}:`, error);
      throw error;
    }
  },

  /**
   * Obtener histórico de resultados de una prueba específica para un paciente
   * @param {number} pruebaId - ID de la prueba
   * @param {string} pacienteCi - Cédula del paciente
   * @param {number} limit - Número máximo de resultados (default: 10)
   */
  async findHistorico(pruebaId, pacienteCi, limit = 10) {
    try {
      const query = `
        SELECT
          o.numero as numero_orden,
          o.fecha as fecha_resultado,
          pr.id as prueba_id,
          pr.nombre as prueba_nombre,
          pr.nomenclatura,
          u.simbolo as unidad,

          -- Resultado (numérico o alfanumérico)
          COALESCE(rn.valor::text, ra.valor) as valor,
          rn.valor as valor_numerico,
          ra.valor as valor_texto,

          -- Valores referenciales ajustados por edad y sexo
          vr.valor_desde,
          vr.valor_hasta,
          vr.comentario as interpretacion,
          vr.panico as es_critico,

          -- Determinar si está dentro del rango
          CASE
            WHEN rn.valor IS NOT NULL AND vr.valor_desde IS NOT NULL AND vr.valor_hasta IS NOT NULL THEN
              CASE
                WHEN rn.valor < vr.valor_desde THEN 'bajo'
                WHEN rn.valor > vr.valor_hasta THEN 'alto'
                ELSE 'normal'
              END
            ELSE 'sin_rango'
          END as estado,

          -- Información de validación
          rn.actualizado_timestamp as fecha_validacion,
          b.nombre as validado_por_nombre,
          b.apellido as validado_por_apellido

        FROM prueba_orden po
        INNER JOIN orden_trabajo o ON po.orden_id = o.id
        INNER JOIN prueba pr ON po.prueba_id = pr.id
        INNER JOIN paciente p ON o.paciente_id = p.id
        LEFT JOIN unidad u ON pr.unidad_id = u.id

        -- Resultados (numérico o alfanumérico)
        LEFT JOIN resultado_numer rn ON po.id = rn.pruebao_id
        LEFT JOIN resultado_alpha ra ON po.id = ra.pruebao_id

        -- Validación
        LEFT JOIN bioanalista b ON COALESCE(rn.validado_por, ra.validado_por) = b.id

        -- Valores referenciales (ajustados por edad y sexo del paciente en el momento de la orden)
        LEFT JOIN valor_referencial vr ON pr.id = vr.prueba_id
          AND (vr.sexo IS NULL OR vr.sexo = p.sexo)
          AND (
            EXTRACT(YEAR FROM AGE(o.fecha, p.fecha_nacimiento)) * 12 +
            EXTRACT(MONTH FROM AGE(o.fecha, p.fecha_nacimiento))
            BETWEEN
            vr.edad_desde * CASE vr.unidad_tiempo_id
              WHEN 1 THEN 12  -- Años a meses
              WHEN 2 THEN 1   -- Meses
              WHEN 3 THEN 0.033 -- Días a meses (aproximado)
              ELSE 1
            END
            AND
            vr.edad_hasta * CASE vr.unidad_tiempo_id
              WHEN 1 THEN 12  -- Años a meses
              WHEN 2 THEN 1   -- Meses
              WHEN 3 THEN 0.033 -- Días a meses (aproximado)
              ELSE 1
            END
          )

        WHERE pr.id = $1
          AND p.ci_paciente = $2
          AND (rn.validado_por IS NOT NULL OR ra.validado_por IS NOT NULL)  -- Solo resultados validados
          AND (rn.valor IS NOT NULL OR ra.valor IS NOT NULL)  -- Solo con valor
          AND pr.reportable = true
        ORDER BY o.fecha DESC
        LIMIT $3
      `;

      const result = await pool.query(query, [pruebaId, pacienteCi, limit]);
      logger.info(`Histórico encontrado para prueba ${pruebaId}, paciente ${pacienteCi}: ${result.rows.length} resultados`);

      return {
        total: result.rows.length,
        prueba: result.rows[0] ? {
          id: result.rows[0].prueba_id,
          nombre: result.rows[0].prueba_nombre,
          nomenclatura: result.rows[0].nomenclatura,
          unidad: result.rows[0].unidad
        } : null,
        historico: result.rows.map(row => ({
          numeroOrden: row.numero_orden,
          fecha: row.fecha_resultado,
          valor: row.valor_numerico !== null ? row.valor_numerico : row.valor_texto,
          valorNumerico: row.valor_numerico,
          valorTexto: row.valor_texto,
          unidad: row.unidad,
          valorDesde: row.valor_desde,
          valorHasta: row.valor_hasta,
          estado: row.estado,
          esCritico: row.es_critico,
          interpretacion: row.interpretacion,
          fechaValidacion: row.fecha_validacion,
          validadoPor: row.validado_por_nombre && row.validado_por_apellido
            ? `${row.validado_por_nombre} ${row.validado_por_apellido}`
            : null
        }))
      };
    } catch (error) {
      logger.error(`Error al obtener histórico de prueba ${pruebaId}, paciente ${pacienteCi}:`, error);
      throw error;
    }
  },

  /**
   * Obtener estadísticas de resultados de una orden
   */
  async getEstadisticas(numeroOrden) {
    try {
      const query = `
        SELECT
          COUNT(*) as total_pruebas,
          COUNT(CASE WHEN rn.valor IS NOT NULL OR ra.valor IS NOT NULL THEN 1 END) as con_resultado,
          COUNT(CASE WHEN rn.validado_por IS NOT NULL OR ra.validado_por IS NOT NULL THEN 1 END) as validados,
          COUNT(CASE
            WHEN rn.valor IS NOT NULL
              AND vr.valor_desde IS NOT NULL
              AND vr.valor_hasta IS NOT NULL
              AND rn.valor >= vr.valor_desde
              AND rn.valor <= vr.valor_hasta
            THEN 1
          END) as normales,
          COUNT(CASE
            WHEN rn.valor IS NOT NULL
              AND vr.valor_desde IS NOT NULL
              AND vr.valor_hasta IS NOT NULL
              AND (rn.valor < vr.valor_desde OR rn.valor > vr.valor_hasta)
            THEN 1
          END) as fuera_de_rango
        FROM prueba_orden po
        INNER JOIN orden_trabajo o ON po.orden_id = o.id
        LEFT JOIN resultado_numer rn ON po.id = rn.pruebao_id
        LEFT JOIN resultado_alpha ra ON po.id = ra.pruebao_id
        INNER JOIN prueba pr ON po.prueba_id = pr.id
        LEFT JOIN paciente p ON o.paciente_id = p.id
        LEFT JOIN valor_referencial vr ON pr.id = vr.prueba_id
          AND (vr.sexo IS NULL OR vr.sexo = p.sexo)
        WHERE o.numero = $1
          AND pr.reportable = true
          AND (rn.valor IS NOT NULL OR ra.valor IS NOT NULL)
      `;

      const result = await pool.query(query, [numeroOrden]);
      return result.rows[0];
    } catch (error) {
      logger.error(`Error al obtener estadísticas de orden ${numeroOrden}:`, error);
      throw error;
    }
  },

  /**
   * Obtener histórico de múltiples pruebas para dashboard comparativo
   * @param {Array<number>} pruebaIds - Array de IDs de pruebas
   * @param {string} pacienteCi - CI del paciente
   * @param {number} limit - Número máximo de resultados por prueba
   * @param {string} fechaDesde - Fecha inicio (opcional)
   * @param {string} fechaHasta - Fecha fin (opcional)
   */
  async findHistoricoMultiple(pruebaIds, pacienteCi, limit = 10, fechaDesde = null, fechaHasta = null) {
    try {
      if (!Array.isArray(pruebaIds) || pruebaIds.length === 0) {
        throw new Error('pruebaIds debe ser un array no vacío');
      }

      // Construir condición de fechas dinámicamente
      let fechaCondition = '';
      const queryParams = [pruebaIds, pacienteCi];
      let paramIndex = 3;

      if (fechaDesde && fechaHasta) {
        fechaCondition = `AND o.fecha BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
        queryParams.push(fechaDesde, fechaHasta);
      } else if (fechaDesde) {
        fechaCondition = `AND o.fecha >= $${paramIndex}`;
        queryParams.push(fechaDesde);
      } else if (fechaHasta) {
        fechaCondition = `AND o.fecha <= $${paramIndex}`;
        queryParams.push(fechaHasta);
      }

      const query = `
        SELECT
          o.numero as numero_orden,
          o.fecha as fecha_resultado,
          pr.id as prueba_id,
          pr.nombre as prueba_nombre,
          pr.nomenclatura,
          u.simbolo as unidad,
          COALESCE(rn.valor::text, ra.valor) as valor,
          rn.valor as valor_numerico,
          ra.valor as valor_texto,
          vr.valor_desde,
          vr.valor_hasta,
          CASE
            WHEN rn.valor IS NOT NULL AND vr.valor_desde IS NOT NULL AND vr.valor_hasta IS NOT NULL THEN
              CASE
                WHEN rn.valor < vr.valor_desde THEN 'bajo'
                WHEN rn.valor > vr.valor_hasta THEN 'alto'
                ELSE 'normal'
              END
            ELSE 'sin_rango'
          END as estado,
          vr.panico as es_critico
        FROM prueba_orden po
        INNER JOIN orden_trabajo o ON po.orden_id = o.id
        INNER JOIN prueba pr ON po.prueba_id = pr.id
        INNER JOIN paciente p ON o.paciente_id = p.id
        LEFT JOIN unidad u ON pr.unidad_id = u.id
        LEFT JOIN resultado_numer rn ON po.id = rn.pruebao_id
        LEFT JOIN resultado_alpha ra ON po.id = ra.pruebao_id
        LEFT JOIN valor_referencial vr ON pr.id = vr.prueba_id
          AND (vr.sexo IS NULL OR vr.sexo = p.sexo)
          AND (
            EXTRACT(YEAR FROM AGE(o.fecha, p.fecha_nacimiento)) * 12 +
            EXTRACT(MONTH FROM AGE(o.fecha, p.fecha_nacimiento))
            BETWEEN
            vr.edad_desde * CASE vr.unidad_tiempo_id WHEN 1 THEN 12 WHEN 2 THEN 1 WHEN 3 THEN 0.033 ELSE 1 END
            AND
            vr.edad_hasta * CASE vr.unidad_tiempo_id WHEN 1 THEN 12 WHEN 2 THEN 1 WHEN 3 THEN 0.033 ELSE 1 END
          )
        WHERE pr.id = ANY($1)
          AND p.ci_paciente = $2
          AND (rn.validado_por IS NOT NULL OR ra.validado_por IS NOT NULL)
          AND (rn.valor IS NOT NULL OR ra.valor IS NOT NULL)
          AND pr.reportable = true
          ${fechaCondition}
        ORDER BY pr.id, o.fecha DESC
      `;

      const result = await pool.query(query, queryParams);

      // Agrupar resultados por prueba y limitar cada grupo
      const groupedByPrueba = {};
      result.rows.forEach(row => {
        if (!groupedByPrueba[row.prueba_id]) {
          groupedByPrueba[row.prueba_id] = {
            prueba: {
              id: row.prueba_id,
              nombre: row.prueba_nombre,
              nomenclatura: row.nomenclatura,
              unidad: row.unidad
            },
            historico: []
          };
        }

        if (groupedByPrueba[row.prueba_id].historico.length < limit) {
          groupedByPrueba[row.prueba_id].historico.push({
            numeroOrden: row.numero_orden,
            fecha: row.fecha_resultado,
            valor: row.valor_numerico !== null ? row.valor_numerico : row.valor_texto,
            valorNumerico: row.valor_numerico,
            valorTexto: row.valor_texto,
            unidad: row.unidad,
            valorDesde: row.valor_desde,
            valorHasta: row.valor_hasta,
            estado: row.estado,
            esCritico: row.es_critico
          });
        }
      });

      logger.info(`Histórico múltiple obtenido para ${pruebaIds.length} pruebas, paciente ${pacienteCi}`);
      return Object.values(groupedByPrueba);
    } catch (error) {
      logger.error(`Error al obtener histórico múltiple para paciente ${pacienteCi}:`, error);
      throw error;
    }
  },

  /**
   * Obtener datos para heat map de histórico
   * @param {string} pacienteCi - CI del paciente
   * @param {number} limit - Número máximo de órdenes a incluir
   * @param {string} fechaDesde - Fecha inicio (opcional)
   * @param {string} fechaHasta - Fecha fin (opcional)
   */
  async findHeatMapData(pacienteCi, limit = 10, fechaDesde = null, fechaHasta = null) {
    try {
      // Construir condición de fechas dinámicamente
      let fechaCondition = '';
      const queryParams = [pacienteCi];
      let paramIndex = 2;

      if (fechaDesde && fechaHasta) {
        fechaCondition = `AND o.fecha BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
        queryParams.push(fechaDesde, fechaHasta);
        paramIndex += 2;
      } else if (fechaDesde) {
        fechaCondition = `AND o.fecha >= $${paramIndex}`;
        queryParams.push(fechaDesde);
        paramIndex++;
      } else if (fechaHasta) {
        fechaCondition = `AND o.fecha <= $${paramIndex}`;
        queryParams.push(fechaHasta);
        paramIndex++;
      }

      queryParams.push(limit);

      const query = `
        WITH ultimas_ordenes AS (
          SELECT DISTINCT o.id, o.numero, o.fecha, o.paciente_id
          FROM orden_trabajo o
          INNER JOIN paciente p ON o.paciente_id = p.id
          WHERE p.ci_paciente = $1
            AND o.status_id IN (3, 4)
            ${fechaCondition}
          ORDER BY o.fecha DESC
          LIMIT $${paramIndex}
        )
        SELECT
          o.numero as numero_orden,
          o.fecha as fecha_resultado,
          pr.id as prueba_id,
          pr.nombre as prueba_nombre,
          pr.nomenclatura,
          COALESCE(rn.valor::text, ra.valor) as valor,
          rn.valor as valor_numerico,
          vr.valor_desde,
          vr.valor_hasta,
          CASE
            WHEN rn.valor IS NOT NULL AND vr.valor_desde IS NOT NULL AND vr.valor_hasta IS NOT NULL THEN
              CASE
                WHEN rn.valor < vr.valor_desde THEN 'bajo'
                WHEN rn.valor > vr.valor_hasta THEN 'alto'
                ELSE 'normal'
              END
            ELSE 'sin_rango'
          END as estado,
          vr.panico as es_critico
        FROM ultimas_ordenes o
        INNER JOIN prueba_orden po ON po.orden_id = o.id
        INNER JOIN prueba pr ON po.prueba_id = pr.id
        INNER JOIN paciente p ON o.paciente_id = p.id
        LEFT JOIN resultado_numer rn ON po.id = rn.pruebao_id
        LEFT JOIN resultado_alpha ra ON po.id = ra.pruebao_id
        LEFT JOIN valor_referencial vr ON pr.id = vr.prueba_id
          AND (vr.sexo IS NULL OR vr.sexo = p.sexo)
          AND (
            EXTRACT(YEAR FROM AGE(o.fecha, p.fecha_nacimiento)) * 12 +
            EXTRACT(MONTH FROM AGE(o.fecha, p.fecha_nacimiento))
            BETWEEN
            vr.edad_desde * CASE vr.unidad_tiempo_id WHEN 1 THEN 12 WHEN 2 THEN 1 WHEN 3 THEN 0.033 ELSE 1 END
            AND
            vr.edad_hasta * CASE vr.unidad_tiempo_id WHEN 1 THEN 12 WHEN 2 THEN 1 WHEN 3 THEN 0.033 ELSE 1 END
          )
        WHERE (rn.validado_por IS NOT NULL OR ra.validado_por IS NOT NULL)
          AND pr.reportable = true
        ORDER BY pr.nombre, o.fecha DESC
      `;

      const result = await pool.query(query, queryParams);

      // Organizar datos en formato de matriz para heat map
      const ordenes = [];
      const pruebas = [];
      const matriz = {};

      result.rows.forEach(row => {
        // Agregar orden si no existe
        if (!ordenes.find(o => o.numero === row.numero_orden)) {
          ordenes.push({
            numero: row.numero_orden,
            fecha: row.fecha_resultado
          });
        }

        // Agregar prueba si no existe
        if (!pruebas.find(p => p.id === row.prueba_id)) {
          pruebas.push({
            id: row.prueba_id,
            nombre: row.prueba_nombre,
            nomenclatura: row.nomenclatura
          });
        }

        // Crear clave para la matriz
        const key = `${row.prueba_id}_${row.numero_orden}`;
        matriz[key] = {
          valor: row.valor_numerico,
          valorTexto: row.valor,
          estado: row.estado,
          esCritico: row.es_critico,
          valorDesde: row.valor_desde,
          valorHasta: row.valor_hasta
        };
      });

      logger.info(`Heat map data obtenido para paciente ${pacienteCi}: ${ordenes.length} órdenes, ${pruebas.length} pruebas`);

      return {
        ordenes: ordenes.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)),
        pruebas: pruebas.sort((a, b) => a.nombre.localeCompare(b.nombre)),
        matriz
      };
    } catch (error) {
      logger.error(`Error al obtener heat map data para paciente ${pacienteCi}:`, error);
      throw error;
    }
  },
};

export default Resultado;
