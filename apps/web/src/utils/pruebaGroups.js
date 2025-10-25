/**
 * Grupos de pruebas pre-configurados para visualización comparativa
 * Estos grupos representan paneles médicos comunes
 */

export const GRUPOS_PRUEBAS = [
  {
    id: 'perfil-lipidico',
    nombre: 'Perfil Lipídico',
    descripcion: 'Evaluación de grasas en la sangre',
    icono: '💊',
    color: 'purple',
    pruebas: [
      { nombre: 'Colesterol Total', nomenclatura: 'CHOL', keywords: ['colesterol total', 'cholesterol'] },
      { nombre: 'HDL Colesterol', nomenclatura: 'HDL', keywords: ['hdl', 'colesterol hdl', 'high density'] },
      { nombre: 'LDL Colesterol', nomenclatura: 'LDL', keywords: ['ldl', 'colesterol ldl', 'low density'] },
      { nombre: 'Triglicéridos', nomenclatura: 'TRIG', keywords: ['trigliceridos', 'triglycerides'] },
      { nombre: 'VLDL', nomenclatura: 'VLDL', keywords: ['vldl', 'very low density'] },
    ],
  },
  {
    id: 'hemograma',
    nombre: 'Hemograma Completo',
    descripcion: 'Análisis completo de células sanguíneas',
    icono: '🔴',
    color: 'red',
    pruebas: [
      { nombre: 'Glóbulos Blancos', nomenclatura: 'WBC', keywords: ['leucocitos', 'wbc', 'white blood', 'globulos blancos'] },
      { nombre: 'Glóbulos Rojos', nomenclatura: 'RBC', keywords: ['eritrocitos', 'rbc', 'red blood', 'globulos rojos'] },
      { nombre: 'Hemoglobina', nomenclatura: 'HGB', keywords: ['hemoglobina', 'hgb', 'hb', 'hemoglobin'] },
      { nombre: 'Hematocrito', nomenclatura: 'HCT', keywords: ['hematocrito', 'hct', 'hematocrit'] },
      { nombre: 'Plaquetas', nomenclatura: 'PLT', keywords: ['plaquetas', 'plt', 'platelets'] },
      { nombre: 'VCM', nomenclatura: 'MCV', keywords: ['vcm', 'mcv', 'volumen corpuscular medio'] },
      { nombre: 'HCM', nomenclatura: 'MCH', keywords: ['hcm', 'mch', 'hemoglobina corpuscular media'] },
      { nombre: 'CHCM', nomenclatura: 'MCHC', keywords: ['chcm', 'mchc', 'concentracion hemoglobina'] },
    ],
  },
  {
    id: 'funcion-renal',
    nombre: 'Función Renal',
    descripcion: 'Evaluación de la función de los riñones',
    icono: '🫘',
    color: 'blue',
    pruebas: [
      { nombre: 'Creatinina', nomenclatura: 'CREAT', keywords: ['creatinina', 'creat', 'creatinine'] },
      { nombre: 'BUN (Urea)', nomenclatura: 'BUN', keywords: ['bun', 'urea', 'blood urea nitrogen'] },
      { nombre: 'Ácido Úrico', nomenclatura: 'URIC', keywords: ['acido urico', 'uric acid', 'urato'] },
      { nombre: 'Nitrógeno Ureico', nomenclatura: 'BUN', keywords: ['nitrogeno ureico', 'urea nitrogen'] },
      { nombre: 'TFG (Filtrado Glomerular)', nomenclatura: 'GFR', keywords: ['tfg', 'gfr', 'filtrado glomerular', 'egfr'] },
    ],
  },
  {
    id: 'funcion-hepatica',
    nombre: 'Función Hepática',
    descripcion: 'Evaluación de la función del hígado',
    icono: '🏥',
    color: 'orange',
    pruebas: [
      { nombre: 'ALT (TGP)', nomenclatura: 'ALT', keywords: ['alt', 'tgp', 'alanina aminotransferasa', 'sgpt'] },
      { nombre: 'AST (TGO)', nomenclatura: 'AST', keywords: ['ast', 'tgo', 'aspartato aminotransferasa', 'sgot'] },
      { nombre: 'Bilirrubina Total', nomenclatura: 'TBIL', keywords: ['bilirrubina total', 'tbil', 'total bilirubin'] },
      { nombre: 'Bilirrubina Directa', nomenclatura: 'DBIL', keywords: ['bilirrubina directa', 'dbil', 'direct bilirubin'] },
      { nombre: 'Bilirrubina Indirecta', nomenclatura: 'IBIL', keywords: ['bilirrubina indirecta', 'ibil', 'indirect bilirubin'] },
      { nombre: 'Fosfatasa Alcalina', nomenclatura: 'ALP', keywords: ['fosfatasa alcalina', 'alp', 'alkaline phosphatase'] },
      { nombre: 'GGT', nomenclatura: 'GGT', keywords: ['ggt', 'gamma glutamil transferasa', 'gamma gt'] },
      { nombre: 'Albúmina', nomenclatura: 'ALB', keywords: ['albumina', 'alb', 'albumin'] },
      { nombre: 'Proteínas Totales', nomenclatura: 'TP', keywords: ['proteinas totales', 'tp', 'total protein'] },
    ],
  },
  {
    id: 'glucemia',
    nombre: 'Perfil Glucémico',
    descripcion: 'Control de azúcar en sangre',
    icono: '🍬',
    color: 'pink',
    pruebas: [
      { nombre: 'Glucosa', nomenclatura: 'GLU', keywords: ['glucosa', 'glu', 'glucose', 'glicemia'] },
      { nombre: 'Hemoglobina Glicosilada', nomenclatura: 'HBA1C', keywords: ['hba1c', 'hemoglobina glicosilada', 'a1c', 'glycated hemoglobin'] },
      { nombre: 'Glucosa Postprandial', nomenclatura: 'GLU-PP', keywords: ['glucosa postprandial', 'postprandial glucose'] },
      { nombre: 'Insulina', nomenclatura: 'INS', keywords: ['insulina', 'insulin'] },
    ],
  },
  {
    id: 'tiroides',
    nombre: 'Perfil Tiroideo',
    descripcion: 'Función de la glándula tiroides',
    icono: '🦋',
    color: 'teal',
    pruebas: [
      { nombre: 'TSH', nomenclatura: 'TSH', keywords: ['tsh', 'hormona estimulante tiroides', 'thyroid stimulating'] },
      { nombre: 'T3 Total', nomenclatura: 'T3', keywords: ['t3 total', 't3', 'triiodothyronine'] },
      { nombre: 'T4 Total', nomenclatura: 'T4', keywords: ['t4 total', 't4', 'thyroxine'] },
      { nombre: 'T3 Libre', nomenclatura: 'FT3', keywords: ['t3 libre', 'ft3', 'free t3'] },
      { nombre: 'T4 Libre', nomenclatura: 'FT4', keywords: ['t4 libre', 'ft4', 'free t4'] },
    ],
  },
  {
    id: 'electrolitos',
    nombre: 'Electrolitos',
    descripcion: 'Balance de minerales en sangre',
    icono: '⚡',
    color: 'cyan',
    pruebas: [
      { nombre: 'Sodio', nomenclatura: 'NA', keywords: ['sodio', 'na', 'sodium'] },
      { nombre: 'Potasio', nomenclatura: 'K', keywords: ['potasio', 'k', 'potassium'] },
      { nombre: 'Cloro', nomenclatura: 'CL', keywords: ['cloro', 'cl', 'chloride'] },
      { nombre: 'Calcio', nomenclatura: 'CA', keywords: ['calcio', 'ca', 'calcium'] },
      { nombre: 'Magnesio', nomenclatura: 'MG', keywords: ['magnesio', 'mg', 'magnesium'] },
      { nombre: 'Fósforo', nomenclatura: 'PHOS', keywords: ['fosforo', 'phos', 'phosphorus'] },
    ],
  },
  {
    id: 'coagulacion',
    nombre: 'Perfil de Coagulación',
    descripcion: 'Evaluación de la coagulación sanguínea',
    icono: '🩸',
    color: 'rose',
    pruebas: [
      { nombre: 'Tiempo de Protrombina', nomenclatura: 'PT', keywords: ['tiempo protrombina', 'pt', 'prothrombin time', 'tp'] },
      { nombre: 'INR', nomenclatura: 'INR', keywords: ['inr', 'international normalized ratio'] },
      { nombre: 'Tiempo de Tromboplastina Parcial', nomenclatura: 'PTT', keywords: ['ptt', 'aptt', 'tiempo tromboplastina', 'partial thromboplastin'] },
      { nombre: 'Fibrinógeno', nomenclatura: 'FIB', keywords: ['fibrinogeno', 'fib', 'fibrinogen'] },
    ],
  },
  {
    id: 'inflamacion',
    nombre: 'Marcadores de Inflamación',
    descripcion: 'Indicadores de procesos inflamatorios',
    icono: '🔥',
    color: 'amber',
    pruebas: [
      { nombre: 'Proteína C Reactiva', nomenclatura: 'CRP', keywords: ['pcr', 'crp', 'proteina c reactiva', 'c-reactive protein'] },
      { nombre: 'VSG (Eritrosedimentación)', nomenclatura: 'ESR', keywords: ['vsg', 'esr', 'eritrosedimentacion', 'velocidad sedimentacion'] },
      { nombre: 'Ferritina', nomenclatura: 'FER', keywords: ['ferritina', 'fer', 'ferritin'] },
    ],
  },
  {
    id: 'cardiaco',
    nombre: 'Marcadores Cardíacos',
    descripcion: 'Evaluación de función cardíaca',
    icono: '❤️',
    color: 'red',
    pruebas: [
      { nombre: 'Troponina I', nomenclatura: 'TNI', keywords: ['troponina i', 'tni', 'troponin i'] },
      { nombre: 'Troponina T', nomenclatura: 'TNT', keywords: ['troponina t', 'tnt', 'troponin t'] },
      { nombre: 'CK-MB', nomenclatura: 'CKMB', keywords: ['ck-mb', 'ckmb', 'creatina kinasa mb'] },
      { nombre: 'BNP', nomenclatura: 'BNP', keywords: ['bnp', 'peptido natriuretico', 'brain natriuretic peptide'] },
      { nombre: 'LDH', nomenclatura: 'LDH', keywords: ['ldh', 'lactato deshidrogenasa', 'lactate dehydrogenase'] },
    ],
  },
];

/**
 * Busca pruebas en un resultado que coincidan con un grupo
 * @param {Array} resultados - Array de resultados del paciente
 * @param {Object} grupo - Grupo de pruebas a buscar
 * @returns {Array} Array de pruebas encontradas con sus IDs
 */
export function buscarPruebasDeGrupo(resultados, grupo) {
  if (!resultados || !grupo) return [];

  const pruebasEncontradas = [];

  grupo.pruebas.forEach((pruebaBuscada) => {
    // Buscar en los resultados por nombre, nomenclatura o keywords
    const resultadoEncontrado = resultados.find((r) => {
      const nombreResultado = (r.prueba_nombre || '').toLowerCase();
      const nomenclaturaResultado = (r.nomenclatura || '').toLowerCase();

      // Buscar coincidencia exacta con nombre
      if (nombreResultado === pruebaBuscada.nombre.toLowerCase()) {
        return true;
      }

      // Buscar coincidencia exacta con nomenclatura
      if (
        nomenclaturaResultado === pruebaBuscada.nomenclatura.toLowerCase()
      ) {
        return true;
      }

      // Buscar coincidencia con keywords
      return pruebaBuscada.keywords.some(
        (keyword) =>
          nombreResultado.includes(keyword.toLowerCase()) ||
          nomenclaturaResultado.includes(keyword.toLowerCase())
      );
    });

    if (resultadoEncontrado) {
      pruebasEncontradas.push({
        pruebaId: resultadoEncontrado.prueba_id,
        nombre: resultadoEncontrado.prueba_nombre,
        nomenclatura: resultadoEncontrado.nomenclatura,
        nombreGrupo: pruebaBuscada.nombre,
      });
    }
  });

  return pruebasEncontradas;
}

/**
 * Obtiene todos los grupos disponibles para un paciente basado en sus resultados
 * @param {Array} resultados - Array de resultados del paciente
 * @returns {Array} Array de grupos con pruebas disponibles
 */
export function getGruposDisponibles(resultados) {
  if (!resultados || resultados.length === 0) return [];

  const gruposDisponibles = [];

  GRUPOS_PRUEBAS.forEach((grupo) => {
    const pruebasEncontradas = buscarPruebasDeGrupo(resultados, grupo);

    // Solo incluir grupos con al menos 2 pruebas
    if (pruebasEncontradas.length >= 2) {
      gruposDisponibles.push({
        ...grupo,
        pruebasDisponibles: pruebasEncontradas,
        cantidadDisponible: pruebasEncontradas.length,
        cantidadTotal: grupo.pruebas.length,
      });
    }
  });

  // Ordenar por cantidad de pruebas disponibles (descendente)
  return gruposDisponibles.sort(
    (a, b) => b.cantidadDisponible - a.cantidadDisponible
  );
}

/**
 * Obtiene los IDs de las pruebas de un grupo
 * @param {Array} resultados - Array de resultados del paciente
 * @param {string} grupoId - ID del grupo
 * @returns {Array<number>} Array de IDs de pruebas
 */
export function getPruebaIdsDeGrupo(resultados, grupoId) {
  const grupo = GRUPOS_PRUEBAS.find((g) => g.id === grupoId);
  if (!grupo) return [];

  const pruebasEncontradas = buscarPruebasDeGrupo(resultados, grupo);
  return pruebasEncontradas.map((p) => p.pruebaId);
}

/**
 * Obtiene el color CSS para un grupo
 * @param {string} color - Nombre del color del grupo
 * @returns {Object} { bg: string, text: string, border: string, gradient: string }
 */
export function getColorClasses(color) {
  const colorMap = {
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200',
      gradient: 'from-purple-400 to-purple-600',
      hover: 'hover:bg-purple-100',
    },
    red: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
      gradient: 'from-red-400 to-red-600',
      hover: 'hover:bg-red-100',
    },
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      gradient: 'from-blue-400 to-blue-600',
      hover: 'hover:bg-blue-100',
    },
    orange: {
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      border: 'border-orange-200',
      gradient: 'from-orange-400 to-orange-600',
      hover: 'hover:bg-orange-100',
    },
    pink: {
      bg: 'bg-pink-50',
      text: 'text-pink-700',
      border: 'border-pink-200',
      gradient: 'from-pink-400 to-pink-600',
      hover: 'hover:bg-pink-100',
    },
    teal: {
      bg: 'bg-teal-50',
      text: 'text-teal-700',
      border: 'border-teal-200',
      gradient: 'from-teal-400 to-teal-600',
      hover: 'hover:bg-teal-100',
    },
    cyan: {
      bg: 'bg-cyan-50',
      text: 'text-cyan-700',
      border: 'border-cyan-200',
      gradient: 'from-cyan-400 to-cyan-600',
      hover: 'hover:bg-cyan-100',
    },
    rose: {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      gradient: 'from-rose-400 to-rose-600',
      hover: 'hover:bg-rose-100',
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      gradient: 'from-amber-400 to-amber-600',
      hover: 'hover:bg-amber-100',
    },
  };

  return (
    colorMap[color] || {
      bg: 'bg-gray-50',
      text: 'text-gray-700',
      border: 'border-gray-200',
      gradient: 'from-gray-400 to-gray-600',
      hover: 'hover:bg-gray-100',
    }
  );
}

export default {
  GRUPOS_PRUEBAS,
  buscarPruebasDeGrupo,
  getGruposDisponibles,
  getPruebaIdsDeGrupo,
  getColorClasses,
};
