// Queries SQL para sincronización desde labsisEG
import { query } from './connection.js';
import config from '../config.js';
import logger from '../utils/logger.js';
import { sanitizeEstudio, validateEstudios } from '../utils/validators.js';

/**
 * Obtener lista completa de precios activos (pruebas individuales + grupos/perfiles)
 * @param {number} listaPreciosId - ID de la lista de precios (default desde config)
 * @returns {Promise<Array>} - Array combinado de estudios y grupos con precios
 */
export const getPriceList = async (listaPreciosId = config.sync.listaPreciosId) => {
  // Query para pruebas individuales
  const pruebasSQL = `
    SELECT
      p.id,
      p.nomenclatura as codigo,
      p.nombre,
      p.descripcion,
      a.area as categoria,
      tm.tipo as tipo_muestra,
      tm.codigo as codigo_muestra,
      tc.tipo as tipo_contenedor,
      tc.abreviacion as abrev_contenedor,
      tc.color as color_contenedor,
      lpp.precio,
      p.requiere_ayuno,
      p.requiere_cita,
      p.tiempo_estimado_entrega as tiempo_entrega,
      p.metodologia,
      p.valores_normales,
      p.activa as activo,
      p.fecha_modificacion as fecha_actualizacion,
      'prueba' as tipo_item,
      -- Días de proceso
      p.lunes,
      p.martes,
      p.miercoles,
      p.jueves,
      p.viernes,
      p.sabado,
      p.domingo,
      p.feriado,
      -- Información adicional de toma de muestra
      p.info_toma_muestra,
      p.criterios_rechazo,
      p.volumen_minimo,
      p.dias_estabilidad,
      -- Valores referenciales activos (subquery)
      (
        SELECT json_agg(
          json_build_object(
            'id', vr.id,
            'edad_desde', vr.edad_desde,
            'edad_hasta', vr.edad_hasta,
            'unidad_tiempo_id', vr.unidad_tiempo_id,
            'unidad_tiempo', ut.unidad,
            'sexo', vr.sexo,
            'valor_desde', vr.valor_desde,
            'valor_hasta', vr.valor_hasta,
            'comentario', vr.comentario,
            'panico', vr.panico,
            'embarazo', vr.embarazo
          ) ORDER BY vr.edad_desde, vr.sexo
        )
        FROM valor_referencial vr
        LEFT JOIN unidad_tiempo ut ON vr.unidad_tiempo_id = ut.id
        WHERE vr.prueba_id = p.id
          AND vr.activo = true
      ) as valores_referenciales
    FROM prueba p
    INNER JOIN lista_precios_has_prueba lpp
      ON p.id = lpp.prueba_id
      AND lpp.lista_precios_id = $1
    LEFT JOIN area a ON p.area_id = a.id
    LEFT JOIN tipo_muestra tm ON p.tipo_muestra_id = tm.id
    LEFT JOIN tipo_contenedor tc ON p.tipo_contenedor_id = tc.id
    WHERE p.activa = true
    ORDER BY p.nombre ASC
  `;

  // Query para grupos de pruebas (perfiles/paquetes) CON sus pruebas incluidas
  const gruposSQL = `
    SELECT
      gp.id,
      gp.codigo_caja as codigo,
      gp.nombre,
      gp.descripcion,
      a.area as categoria,
      NULL as tipo_muestra,
      NULL as tipo_contenedor,
      lpg.precio,
      NULL as requiere_ayuno,
      NULL as requiere_cita,
      NULL as tiempo_entrega,
      NULL as metodologia,
      NULL as valores_normales,
      gp.activa as activo,
      gp.fecha_modificacion as fecha_actualizacion,
      'grupo' as tipo_item,
      -- Agregar las pruebas que contiene como JSON array (solo reportables)
      (
        SELECT json_agg(
          json_build_object(
            'prueba_id', p2.id,
            'nombre', p2.nombre,
            'codigo', p2.nomenclatura,
            'reportable', p2.reportable
          ) ORDER BY p2.nombre
        )
        FROM gp_has_prueba ghp
        INNER JOIN prueba p2 ON ghp.prueba_id = p2.id
          AND p2.reportable = true
        WHERE ghp.grupo_p_id = gp.id
      ) as pruebas
    FROM grupo_prueba gp
    INNER JOIN lista_precios_has_gprueba lpg
      ON gp.id = lpg.gprueba_id
      AND lpg.lista_precios_id = $1
    LEFT JOIN area a ON gp.area_id = a.id
    WHERE gp.activa = true
    ORDER BY gp.nombre ASC
  `;

  try {
    logger.database('Obteniendo lista de precios', { listaPreciosId });

    // Ejecutar ambas queries en paralelo para mejor performance
    const [pruebasResult, gruposResult] = await Promise.all([
      query(pruebasSQL, [listaPreciosId]),
      query(gruposSQL, [listaPreciosId])
    ]);

    logger.database(`✅ ${pruebasResult.rows.length} pruebas y ${gruposResult.rows.length} grupos obtenidos`);

    // Combinar y sanitizar resultados
    const estudios = [
      ...pruebasResult.rows.map(sanitizeEstudio),
      ...gruposResult.rows.map(sanitizeEstudio)
    ];

    // Validar estructura
    const validation = validateEstudios(estudios);

    if (!validation.valid) {
      logger.warn(`⚠️ ${validation.invalidCount} items inválidos fueron omitidos`);
    }

    return estudios;
  } catch (error) {
    logger.error('❌ Error al obtener lista de precios:', { error: error.message });
    throw error;
  }
};

/**
 * Obtener cambios no sincronizados del changelog
 * @param {number} limit - Límite de registros a obtener
 * @returns {Promise<Array>} - Array de cambios
 */
export const getPendingChanges = async (limit = 100) => {
  const sql = `
    SELECT
      id,
      tabla,
      operacion,
      fecha,
      usuario,
      datos_json
    FROM precios_changelog
    WHERE sincronizado = false
    ORDER BY fecha DESC
    LIMIT $1
  `;

  try {
    const result = await query(sql, [limit]);

    logger.database(`${result.rows.length} cambios pendientes encontrados`);

    return result.rows;
  } catch (error) {
    logger.error('Error al obtener cambios pendientes:', { error: error.message });
    throw error;
  }
};

/**
 * Marcar cambios como sincronizados
 * @param {Array<number>} changelogIds - IDs de changelog a marcar
 * @returns {Promise<number>} - Número de registros actualizados
 */
export const markAsSynced = async (changelogIds) => {
  if (!changelogIds || changelogIds.length === 0) {
    return 0;
  }

  const sql = `
    UPDATE precios_changelog
    SET
      sincronizado = true,
      fecha_sincronizacion = NOW()
    WHERE id = ANY($1::int[])
  `;

  try {
    const result = await query(sql, [changelogIds]);

    logger.database(`${result.rowCount} cambios marcados como sincronizados`);

    return result.rowCount;
  } catch (error) {
    logger.error('Error al marcar cambios como sincronizados:', { error: error.message });
    throw error;
  }
};

/**
 * Obtener estadísticas de la base de datos
 * @returns {Promise<Object>} - Estadísticas
 */
export const getStats = async () => {
  const sql = `
    SELECT
      (SELECT COUNT(*) FROM prueba WHERE activa = true) as total_pruebas_activas,
      (SELECT COUNT(*) FROM precios_changelog WHERE sincronizado = false) as cambios_pendientes,
      (SELECT COUNT(*) FROM precios_changelog WHERE fecha > NOW() - INTERVAL '24 hours') as cambios_ultimas_24h,
      (SELECT MAX(fecha) FROM precios_changelog) as ultimo_cambio
  `;

  try {
    const result = await query(sql);
    return result.rows[0];
  } catch (error) {
    logger.error('Error al obtener estadísticas:', { error: error.message });
    throw error;
  }
};

/**
 * Limpiar changelog antiguo (mantener solo últimos 90 días)
 * @returns {Promise<number>} - Número de registros eliminados
 */
export const cleanOldChangelog = async (days = 90) => {
  const sql = `
    DELETE FROM precios_changelog
    WHERE fecha < NOW() - INTERVAL '${days} days'
    AND sincronizado = true
  `;

  try {
    const result = await query(sql);

    if (result.rowCount > 0) {
      logger.database(`🗑️ ${result.rowCount} registros antiguos eliminados del changelog`);
    }

    return result.rowCount;
  } catch (error) {
    logger.error('Error al limpiar changelog antiguo:', { error: error.message });
    throw error;
  }
};

export default {
  getPriceList,
  getPendingChanges,
  markAsSynced,
  getStats,
  cleanOldChangelog
};
