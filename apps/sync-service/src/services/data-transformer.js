/**
 * Transformador de datos
 * Convierte datos de la BD a estructura JSON para el frontend
 */

import config from '../config.js';
import logger from '../utils/logger.js';
import { validateEstudios } from '../utils/validators.js';

/**
 * Transformar estudios de BD a JSON estructurado
 * @param {Array} estudios - Array de estudios desde PostgreSQL
 * @returns {Object} - JSON estructurado con metadata
 */
export const transformToJSON = (estudios) => {
  try {
    // Validar datos
    const validation = validateEstudios(estudios);

    if (!validation.valid) {
      logger.warn(`⚠️ ${validation.invalidCount} estudios inválidos serán omitidos`);
    }

    // Separar por tipo
    const pruebas = estudios.filter(e => e.tipo_item === 'prueba');
    const grupos = estudios.filter(e => e.tipo_item === 'grupo');

    // Enriquecer cada estudio con información adicional
    const estudiosEnriquecidos = estudios.map(estudio => {
      const esGrupo = estudio.tipo_item === 'grupo';
      const pruebasDelGrupo = estudio.pruebas || [];

      // Formatear días de proceso (solo para pruebas)
      const diasProceso = !esGrupo ? formatDiasProceso(estudio) : [];

      // Formatear valores referenciales (solo para pruebas)
      const valoresReferenciales = !esGrupo && estudio.valores_referenciales
        ? formatValoresReferenciales(estudio.valores_referenciales)
        : [];

      return {
        ...estudio,
        // Clasificación mejorada
        tipoEstudio: esGrupo ? 'Perfil/Paquete' : 'Prueba Individual',
        esPrueba: !esGrupo,
        esGrupo: esGrupo,

        // Para grupos: información de las pruebas que contiene
        pruebas: esGrupo ? pruebasDelGrupo : [],
        totalPruebas: esGrupo ? (pruebasDelGrupo ? pruebasDelGrupo.length : 0) : 0,
        pruebasReportables: esGrupo
          ? (pruebasDelGrupo ? pruebasDelGrupo.filter(p => p.reportable).length : 0)
          : 0,

        // Información adicional para pruebas
        diasProceso,
        valoresReferenciales,

        // Ficha técnica completa
        fichaTecnica: !esGrupo ? {
          diasProceso,
          valoresReferenciales,
          infoTomaMuestra: estudio.info_toma_muestra || null,
          criteriosRechazo: estudio.criterios_rechazo || null,
          volumenMinimo: estudio.volumen_minimo || null,
          diasEstabilidad: estudio.dias_estabilidad || null,
          festivosIncluidos: estudio.feriado || false
        } : null
      };
    });

    // Construir estructura JSON
    const jsonData = {
      estudios: estudiosEnriquecidos,
      metadata: {
        totalEstudios: estudios.length,
        totalPruebas: pruebas.length,
        totalGrupos: grupos.length,
        listaPreciosId: config.sync.listaPreciosId,
        fechaSincronizacion: new Date().toISOString(),
        version: '2.0', // ← Versión actualizada
        moneda: 'USD'
      }
    };

    logger.info('✅ Datos transformados a JSON', {
      total: estudios.length,
      pruebas: pruebas.length,
      grupos: grupos.length
    });

    return jsonData;

  } catch (error) {
    logger.error('❌ Error al transformar datos:', { error: error.message });
    throw error;
  }
};

/**
 * Formatear días de proceso como array legible
 * @param {Object} estudio - Estudio con días booleanos
 * @returns {Array} - Array de días habilitados
 */
const formatDiasProceso = (estudio) => {
  const dias = [];
  if (estudio.lunes) dias.push('L');
  if (estudio.martes) dias.push('M');
  if (estudio.miercoles) dias.push('X');
  if (estudio.jueves) dias.push('J');
  if (estudio.viernes) dias.push('V');
  if (estudio.sabado) dias.push('S');
  if (estudio.domingo) dias.push('D');
  return dias;
};

/**
 * Formatear valores referenciales para el frontend
 * @param {Array} valoresDB - Array de valores referenciales desde DB
 * @returns {Array} - Array formateado
 */
const formatValoresReferenciales = (valoresDB) => {
  if (!valoresDB || valoresDB.length === 0) return [];

  return valoresDB.map(vr => {
    // Formatear rango de edad
    let rangoEdad = '';
    if (vr.edad_desde === 0 && vr.edad_hasta === 120) {
      rangoEdad = 'Todas las edades';
    } else {
      const unidad = vr.unidad_tiempo || 'años';
      rangoEdad = `${vr.edad_desde}-${vr.edad_hasta} ${unidad.toLowerCase()}`;
    }

    // Formatear sexo
    let sexo = 'Ambos';
    if (vr.sexo === 'M') sexo = 'Masculino';
    else if (vr.sexo === 'F') sexo = 'Femenino';

    return {
      id: vr.id,
      rangoEdad,
      edadDesde: vr.edad_desde,
      edadHasta: vr.edad_hasta,
      unidadTiempo: vr.unidad_tiempo,
      sexo,
      sexoCodigo: vr.sexo || null,
      valorMin: vr.valor_desde,
      valorMax: vr.valor_hasta,
      comentario: vr.comentario || '',
      esPanico: vr.panico || false,
      esEmbarazo: vr.embarazo || false
    };
  });
};

/**
 * Transformar con estadísticas adicionales
 * @param {Array} estudios - Array de estudios
 * @returns {Object} - JSON con estadísticas
 */
export const transformWithStats = (estudios) => {
  const baseJSON = transformToJSON(estudios);

  // Calcular estadísticas
  const precios = estudios.map(e => parseFloat(e.precio) || 0).filter(p => p > 0);

  const stats = {
    precioMinimo: Math.min(...precios),
    precioMaximo: Math.max(...precios),
    precioPromedio: precios.reduce((a, b) => a + b, 0) / precios.length
  };

  // Agrupar por categoría
  const porCategoria = estudios.reduce((acc, e) => {
    const cat = e.categoria || 'Sin categoría';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  baseJSON.metadata.estadisticas = stats;
  baseJSON.metadata.porCategoria = porCategoria;

  return baseJSON;
};

export default {
  transformToJSON,
  transformWithStats
};
