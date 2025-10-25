// Validadores de datos
import logger from './logger.js';

/**
 * Valida la estructura de un estudio/precio
 * @param {Object} estudio - Objeto del estudio
 * @returns {boolean} - True si es válido
 */
export const validateEstudio = (estudio) => {
  const required = ['id', 'codigo', 'nombre', 'precio'];

  for (const field of required) {
    if (estudio[field] === undefined || estudio[field] === null) {
      logger.warn(`Estudio inválido - falta campo: ${field}`, { estudio });
      return false;
    }
  }

  // Validar que precio sea número
  if (typeof estudio.precio !== 'number' && isNaN(parseFloat(estudio.precio))) {
    logger.warn(`Estudio inválido - precio no es número`, { estudio });
    return false;
  }

  return true;
};

/**
 * Valida la lista completa de estudios
 * @param {Array} estudios - Array de estudios
 * @returns {Object} - { valid: boolean, invalidCount: number }
 */
export const validateEstudios = (estudios) => {
  if (!Array.isArray(estudios)) {
    logger.error('Estudios no es un array');
    return { valid: false, invalidCount: 0 };
  }

  const invalidEstudios = estudios.filter(e => !validateEstudio(e));

  if (invalidEstudios.length > 0) {
    logger.warn(`${invalidEstudios.length} estudios inválidos encontrados`);
    return { valid: false, invalidCount: invalidEstudios.length };
  }

  return { valid: true, invalidCount: 0 };
};

/**
 * Valida estructura de JSON final
 * @param {Object} data - Objeto con estructura completa
 * @returns {boolean} - True si es válido
 */
export const validateJSONStructure = (data) => {
  if (!data || typeof data !== 'object') {
    logger.error('JSON inválido - no es un objeto');
    return false;
  }

  if (!data.estudios || !Array.isArray(data.estudios)) {
    logger.error('JSON inválido - falta array de estudios');
    return false;
  }

  if (!data.metadata || typeof data.metadata !== 'object') {
    logger.error('JSON inválido - falta metadata');
    return false;
  }

  return true;
};

/**
 * Sanitiza un estudio eliminando campos innecesarios
 * @param {Object} estudio - Estudio a sanitizar
 * @returns {Object} - Estudio sanitizado
 */
export const sanitizeEstudio = (estudio) => {
  // Campos permitidos en el JSON público
  const allowedFields = [
    'id',
    'codigo',
    'nombre',
    'categoria',
    'precio',
    'descripcion',
    'requiere_ayuno',
    'tiempo_entrega',
    'activo',
    'fecha_actualizacion',
    'tipo_item',  // Nuevo: para distinguir 'prueba' vs 'grupo'
    'pruebas',     // Nuevo: array de pruebas que contiene un grupo
    'tipo_muestra',
    'codigo_muestra',
    'tipo_contenedor',
    'abrev_contenedor',
    'color_contenedor',
    'metodologia',
    'valores_normales',
    // Nuevos campos para ficha técnica
    'lunes',
    'martes',
    'miercoles',
    'jueves',
    'viernes',
    'sabado',
    'domingo',
    'feriado',
    'valores_referenciales',
    'info_toma_muestra',
    'criterios_rechazo',
    'volumen_minimo',
    'dias_estabilidad'
  ];

  const sanitized = {};

  for (const field of allowedFields) {
    if (estudio[field] !== undefined) {
      sanitized[field] = estudio[field];
    }
  }

  // Convertir snake_case a camelCase para JSON
  return {
    id: sanitized.id,
    codigo: sanitized.codigo,
    nombre: sanitized.nombre,
    categoria: sanitized.categoria,
    precio: parseFloat(sanitized.precio),
    descripcion: sanitized.descripcion || '',
    requiereAyuno: sanitized.requiere_ayuno || false,
    tiempoEntrega: sanitized.tiempo_entrega || 'No especificado',
    activo: sanitized.activo !== false,
    fechaActualizacion: sanitized.fecha_actualizacion || new Date().toISOString(),
    tipo_item: sanitized.tipo_item,  // Preservar tipo_item
    pruebas: sanitized.pruebas,       // Preservar array de pruebas
    tipoMuestra: sanitized.tipo_muestra,
    codigoMuestra: sanitized.codigo_muestra,
    tipoContenedor: sanitized.tipo_contenedor,
    abrevContenedor: sanitized.abrev_contenedor,
    colorContenedor: sanitized.color_contenedor,
    metodologia: sanitized.metodologia,
    valoresNormales: sanitized.valores_normales,
    // Nuevos campos para ficha técnica
    lunes: sanitized.lunes,
    martes: sanitized.martes,
    miercoles: sanitized.miercoles,
    jueves: sanitized.jueves,
    viernes: sanitized.viernes,
    sabado: sanitized.sabado,
    domingo: sanitized.domingo,
    feriado: sanitized.feriado,
    valores_referenciales: sanitized.valores_referenciales,
    info_toma_muestra: sanitized.info_toma_muestra,
    criterios_rechazo: sanitized.criterios_rechazo,
    volumen_minimo: sanitized.volumen_minimo,
    dias_estabilidad: sanitized.dias_estabilidad
  };
};

export default {
  validateEstudio,
  validateEstudios,
  validateJSONStructure,
  sanitizeEstudio
};
