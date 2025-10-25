/**
 * Calculadora de Score de Salud (0-100)
 * Basado en los resultados de laboratorio del paciente
 */

/**
 * Calcula el score de salud general del paciente
 * @param {Array} resultados - Array de resultados de pruebas
 * @returns {Object} { score: number, nivel: string, detalles: Object }
 */
export function calcularHealthScore(resultados) {
  if (!resultados || resultados.length === 0) {
    return {
      score: 0,
      nivel: 'sin_datos',
      detalles: {
        total: 0,
        normales: 0,
        anormales: 0,
        criticos: 0,
      },
    };
  }

  // Contar resultados por estado
  const normales = resultados.filter(
    (r) => r.estado === 'normal' && !r.esCritico
  ).length;
  const anormales = resultados.filter(
    (r) => (r.estado === 'bajo' || r.estado === 'alto') && !r.esCritico
  ).length;
  const criticos = resultados.filter((r) => r.esCritico).length;
  const total = resultados.length;

  // Calcular score base (0-100)
  // - 100% si todos normales
  // - Penalización por valores anormales
  // - Penalización mayor por valores críticos
  let score = 100;

  // Penalización por anormales: -5 puntos por cada anormal
  const penalizacionAnormales = anormales * 5;

  // Penalización por críticos: -15 puntos por cada crítico
  const penalizacionCriticos = criticos * 15;

  // Aplicar penalizaciones
  score = Math.max(0, score - penalizacionAnormales - penalizacionCriticos);

  // Ajustar por porcentaje de valores normales
  const porcentajeNormales = (normales / total) * 100;
  score = Math.round((score + porcentajeNormales) / 2);

  // Determinar nivel
  let nivel = 'excelente';
  if (criticos > 0 || score < 40) {
    nivel = 'critico';
  } else if (anormales > total * 0.5 || score < 60) {
    nivel = 'atencion';
  } else if (anormales > 0 || score < 80) {
    nivel = 'bueno';
  }

  return {
    score: Math.min(100, Math.max(0, score)),
    nivel,
    detalles: {
      total,
      normales,
      anormales,
      criticos,
      porcentajeNormales: Math.round(porcentajeNormales),
    },
  };
}

/**
 * Calcula la tendencia de un resultado comparando con histórico
 * @param {Array} historico - Array de valores históricos ordenados cronológicamente
 * @returns {Object} { tendencia: string, cambio: number, porcentaje: number }
 */
export function calcularTendencia(historico) {
  if (!historico || historico.length < 2) {
    return {
      tendencia: 'estable',
      cambio: 0,
      porcentaje: 0,
    };
  }

  // Comparar último valor con el penúltimo
  const ultimo = historico[historico.length - 1]?.valorNumerico;
  const penultimo = historico[historico.length - 2]?.valorNumerico;

  if (ultimo == null || penultimo == null || penultimo === 0) {
    return {
      tendencia: 'estable',
      cambio: 0,
      porcentaje: 0,
    };
  }

  const cambio = ultimo - penultimo;
  const porcentaje = ((cambio / penultimo) * 100).toFixed(1);

  let tendencia = 'estable';
  if (Math.abs(porcentaje) < 5) {
    tendencia = 'estable';
  } else if (cambio > 0) {
    tendencia = 'subiendo';
  } else {
    tendencia = 'bajando';
  }

  return {
    tendencia,
    cambio: parseFloat(cambio.toFixed(2)),
    porcentaje: parseFloat(porcentaje),
  };
}

/**
 * Determina el nivel de alerta según el estado y criticidad
 * @param {string} estado - Estado del resultado (normal, bajo, alto, sin_rango)
 * @param {boolean} esCritico - Si el valor es crítico
 * @returns {Object} { nivel: string, color: string, mensaje: string }
 */
export function getNivelAlerta(estado, esCritico) {
  if (esCritico) {
    return {
      nivel: 'critico',
      color: 'red',
      mensaje: '¡Atención inmediata requerida!',
      icono: '🚨',
    };
  }

  switch (estado) {
    case 'normal':
      return {
        nivel: 'normal',
        color: 'green',
        mensaje: 'Resultados dentro del rango normal',
        icono: '✓',
      };
    case 'bajo':
    case 'alto':
      return {
        nivel: 'advertencia',
        color: 'yellow',
        mensaje: 'Valor fuera del rango normal',
        icono: '⚠',
      };
    default:
      return {
        nivel: 'info',
        color: 'gray',
        mensaje: 'Sin rango de referencia',
        icono: 'ℹ',
      };
  }
}

/**
 * Calcula estadísticas resumidas de un conjunto de resultados
 * @param {Array} resultados - Array de resultados
 * @returns {Object} Estadísticas calculadas
 */
export function calcularEstadisticas(resultados) {
  if (!resultados || resultados.length === 0) {
    return null;
  }

  const valoresNumericos = resultados
    .filter((r) => r.valorNumerico != null)
    .map((r) => r.valorNumerico);

  if (valoresNumericos.length === 0) {
    return null;
  }

  const suma = valoresNumericos.reduce((a, b) => a + b, 0);
  const promedio = suma / valoresNumericos.length;
  const max = Math.max(...valoresNumericos);
  const min = Math.min(...valoresNumericos);

  // Calcular desviación estándar
  const varianza =
    valoresNumericos.reduce((acc, val) => acc + Math.pow(val - promedio, 2), 0) /
    valoresNumericos.length;
  const desviacionEstandar = Math.sqrt(varianza);

  return {
    promedio: parseFloat(promedio.toFixed(2)),
    max: parseFloat(max.toFixed(2)),
    min: parseFloat(min.toFixed(2)),
    desviacionEstandar: parseFloat(desviacionEstandar.toFixed(2)),
    cantidad: valoresNumericos.length,
  };
}

/**
 * Obtiene el color para visualización según el score
 * @param {number} score - Score de salud (0-100)
 * @returns {Object} { color: string, gradient: string, label: string }
 */
export function getColorPorScore(score) {
  if (score >= 80) {
    return {
      color: '#10b981', // green-500
      gradient: 'from-green-400 to-green-600',
      label: 'Excelente',
      emoji: '🎉',
    };
  } else if (score >= 60) {
    return {
      color: '#3b82f6', // blue-500
      gradient: 'from-blue-400 to-blue-600',
      label: 'Bueno',
      emoji: '👍',
    };
  } else if (score >= 40) {
    return {
      color: '#eab308', // yellow-500
      gradient: 'from-yellow-400 to-yellow-600',
      label: 'Atención',
      emoji: '⚠️',
    };
  } else {
    return {
      color: '#ef4444', // red-500
      gradient: 'from-red-400 to-red-600',
      label: 'Crítico',
      emoji: '🚨',
    };
  }
}

/**
 * Genera recomendaciones basadas en el score de salud
 * @param {Object} scoreData - Datos del score calculado
 * @returns {Array<string>} Array de recomendaciones
 */
export function generarRecomendaciones(scoreData) {
  const recomendaciones = [];

  if (scoreData.detalles.criticos > 0) {
    recomendaciones.push(
      '🚨 Tiene valores críticos. Consulte con su médico inmediatamente.'
    );
  }

  if (scoreData.detalles.anormales > scoreData.detalles.total * 0.5) {
    recomendaciones.push(
      '⚠️ Más de la mitad de sus resultados están fuera del rango normal. Se recomienda seguimiento médico.'
    );
  }

  if (scoreData.score >= 80) {
    recomendaciones.push(
      '✓ Sus resultados están en excelente condición. Continúe con sus hábitos saludables.'
    );
  } else if (scoreData.score >= 60) {
    recomendaciones.push(
      '👍 Sus resultados están en buena condición general. Considere mejorar los valores alterados.'
    );
  } else if (scoreData.score < 60 && scoreData.detalles.criticos === 0) {
    recomendaciones.push(
      '⚠️ Algunos valores necesitan atención. Consulte con su médico para establecer un plan de mejora.'
    );
  }

  return recomendaciones;
}

export default {
  calcularHealthScore,
  calcularTendencia,
  getNivelAlerta,
  calcularEstadisticas,
  getColorPorScore,
  generarRecomendaciones,
};
