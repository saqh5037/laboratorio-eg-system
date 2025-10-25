/**
 * Detecta el color correcto del tubo basándose en su nombre
 * Los colores en la BD están incorrectos (todos azules), así que inferimos el color real
 *
 * Basado en estándares internacionales de tubos de laboratorio:
 * - Rojo: Suero sin aditivos
 * - Morado/Lila: EDTA para hematología
 * - Azul: Citrato para coagulación
 * - Verde: Heparina para química
 * - Amarillo: Gel separador
 * - Negro: Sedimentación
 * - Gris: Glucosa/Oxalato
 * - Naranja: Trombina
 */

export const getTubeColorFromName = (tipoContenedor, colorBD = '#2196F3') => {
  if (!tipoContenedor) return colorBD;

  const nombre = tipoContenedor.toLowerCase();

  // Detección por palabras clave en el nombre del tubo

  // ROJO - Tubo tapa roja (suero sin aditivos)
  if (nombre.includes('roja') || nombre.includes('rojo') || nombre.includes('red')) {
    return '#DC2626'; // red-600
  }

  // MORADO/LILA - Tubo tapa morada (EDTA - hematología)
  if (nombre.includes('morada') || nombre.includes('morado') ||
      nombre.includes('lila') || nombre.includes('purple') ||
      nombre.includes('violeta') || nombre.includes('edta') ||
      nombre.includes('hema')) {
    return '#9333EA'; // purple-600
  }

  // AZUL - Tubo tapa azul (citrato - coagulación)
  if (nombre.includes('azul') || nombre.includes('blue') ||
      nombre.includes('citrato') || nombre.includes('coagul')) {
    return '#2563EB'; // blue-600
  }

  // VERDE - Tubo tapa verde (heparina - química)
  if (nombre.includes('verde') || nombre.includes('green') ||
      nombre.includes('heparina')) {
    return '#16A34A'; // green-600
  }

  // AMARILLO - Tubo tapa amarilla (gel separador)
  if (nombre.includes('amarill') || nombre.includes('yellow') ||
      nombre.includes('gel') || nombre.includes('separator')) {
    return '#EAB308'; // yellow-500
  }

  // NEGRO - Tubo tapa negra (sedimentación)
  if (nombre.includes('negra') || nombre.includes('negro') ||
      nombre.includes('black') || nombre.includes('sediment')) {
    return '#000000'; // black
  }

  // GRIS - Tubo tapa gris (glucosa/oxalato)
  if (nombre.includes('gris') || nombre.includes('gray') ||
      nombre.includes('grey') || nombre.includes('oxalato') ||
      nombre.includes('fluoruro')) {
    return '#6B7280'; // gray-500
  }

  // NARANJA - Tubo tapa naranja (trombina)
  if (nombre.includes('naranja') || nombre.includes('orange') ||
      nombre.includes('trombina')) {
    return '#EA580C'; // orange-600
  }

  // CELESTE/CYAN - Tubo tapa celeste
  if (nombre.includes('celeste') || nombre.includes('cielo') ||
      nombre.includes('cyan') || nombre.includes('turquesa')) {
    return '#0EA5E9'; // sky-500
  }

  // BLANCO - Tubo tapa blanca
  if (nombre.includes('blanca') || nombre.includes('blanco') ||
      nombre.includes('white')) {
    return '#E5E7EB'; // gray-200 (no usar blanco puro)
  }

  // ROSA/ROSADO - Tubo tapa rosa
  if (nombre.includes('rosa') || nombre.includes('rosado') ||
      nombre.includes('pink')) {
    return '#EC4899'; // pink-500
  }

  // Si no detecta ningún color específico, retornar el color de la BD
  // (aunque probablemente esté incorrecto)
  return colorBD;
};

/**
 * Obtiene información descriptiva del tubo basándose en su color/tipo
 * Útil para tooltips y accesibilidad
 */
export const getTubeDescription = (tipoContenedor) => {
  if (!tipoContenedor) return 'Tubo de laboratorio';

  const nombre = tipoContenedor.toLowerCase();

  // Mapeo de descripciones según el tipo de tubo
  if (nombre.includes('roja') || nombre.includes('rojo')) {
    return 'Tubo tapa roja - Para obtención de suero sin aditivos';
  }

  if (nombre.includes('morada') || nombre.includes('morado') || nombre.includes('lila') || nombre.includes('edta')) {
    return 'Tubo tapa morada - EDTA para estudios hematológicos';
  }

  if (nombre.includes('azul') || nombre.includes('citrato')) {
    return 'Tubo tapa azul - Citrato para pruebas de coagulación';
  }

  if (nombre.includes('verde') || nombre.includes('heparina')) {
    return 'Tubo tapa verde - Heparina para química sanguínea';
  }

  if (nombre.includes('amarill') || nombre.includes('gel')) {
    return 'Tubo tapa amarilla - Gel separador para suero';
  }

  if (nombre.includes('negra') || nombre.includes('negro') || nombre.includes('sediment')) {
    return 'Tubo tapa negra - Para velocidad de sedimentación';
  }

  if (nombre.includes('gris') || nombre.includes('oxalato') || nombre.includes('fluoruro')) {
    return 'Tubo tapa gris - Oxalato/Fluoruro para glucosa';
  }

  if (nombre.includes('naranja') || nombre.includes('trombina')) {
    return 'Tubo tapa naranja - Trombina para obtención rápida de suero';
  }

  // Default
  return tipoContenedor;
};

export default getTubeColorFromName;
