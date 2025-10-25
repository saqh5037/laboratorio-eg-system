// Datos reales de estudios de LaboratorioEG basados en prácticas comunes en Venezuela
export const estudiosData = [
  // HEMATOLOGÍA
  {
    id: 1,
    codigo: "HEM001",
    nombre: "Hematología Completa",
    tipo: "prueba",
    area: "Hematología",
    precio: 15,
    muestra: "Sangre EDTA (tubo morado)",
    ayuno: false,
    tiempo: "4 horas",
    descripcion: "Incluye hemoglobina, hematocrito, contaje de glóbulos rojos, blancos, plaquetas y fórmula leucocitaria",
    tags: ["sangre", "hemograma", "anemia", "infección", "rutina"]
  },
  {
    id: 2,
    codigo: "HEM002",
    nombre: "VSG (Velocidad de Sedimentación)",
    tipo: "prueba",
    area: "Hematología",
    precio: 12,
    muestra: "Sangre citrato (tubo negro)",
    ayuno: false,
    tiempo: "4 horas",
    descripcion: "Evalúa procesos inflamatorios y enfermedades autoinmunes",
    tags: ["inflamación", "autoinmune", "VSG", "sedimentación"]
  },
  {
    id: 3,
    codigo: "HEM003",
    nombre: "PT y PTT",
    tipo: "prueba",
    area: "Hematología",
    precio: 25,
    muestra: "Sangre citrato (tubo azul)",
    ayuno: false,
    tiempo: "4 horas",
    descripcion: "Tiempo de protrombina y tiempo parcial de tromboplastina para evaluar coagulación",
    tags: ["coagulación", "sangrado", "cirugía", "anticoagulantes"]
  },
  {
    id: 4,
    codigo: "HEM004",
    nombre: "Grupo Sanguíneo y Factor Rh",
    tipo: "prueba",
    area: "Hematología",
    precio: 18,
    muestra: "Sangre EDTA",
    ayuno: false,
    tiempo: "2 horas",
    descripcion: "Determinación del tipo de sangre ABO y factor Rh",
    tags: ["tipo sangre", "transfusión", "embarazo", "Rh"]
  },

  // QUÍMICA SANGUÍNEA
  {
    id: 5,
    codigo: "QUI001",
    nombre: "Glicemia",
    tipo: "prueba",
    area: "Química",
    precio: 10,
    muestra: "Sangre sin anticoagulante",
    ayuno: true,
    tiempo: "2 horas",
    descripcion: "Medición de glucosa en sangre para diagnóstico de diabetes",
    tags: ["glucosa", "diabetes", "azúcar", "glicemia"]
  },
  {
    id: 6,
    codigo: "PERF001",
    nombre: "Perfil Lipídico",
    tipo: "perfil",
    area: "Química",
    precio: 35,
    muestra: "Sangre sin anticoagulante",
    contiene: ["Colesterol Total", "HDL", "LDL", "VLDL", "Triglicéridos", "Índice Aterogénico"],
    ayuno: true,
    tiempo: "24 horas",
    descripcion: "Evaluación completa del metabolismo de las grasas",
    tags: ["colesterol", "triglicéridos", "cardiovascular", "lípidos"]
  },
  {
    id: 7,
    codigo: "QUI002",
    nombre: "Urea y Creatinina",
    tipo: "prueba",
    area: "Química",
    precio: 20,
    muestra: "Sangre sin anticoagulante",
    ayuno: true,
    tiempo: "4 horas",
    descripcion: "Evaluación de la función renal",
    tags: ["riñón", "renal", "urea", "creatinina"]
  },
  {
    id: 8,
    codigo: "QUI003",
    nombre: "Ácido Úrico",
    tipo: "prueba",
    area: "Química",
    precio: 12,
    muestra: "Sangre sin anticoagulante",
    ayuno: true,
    tiempo: "4 horas",
    descripcion: "Diagnóstico de gota y evaluación del metabolismo de las purinas",
    tags: ["gota", "ácido úrico", "articulaciones", "purinas"]
  },
  {
    id: 9,
    codigo: "PERF002",
    nombre: "Perfil Hepático",
    tipo: "perfil",
    area: "Química",
    precio: 40,
    muestra: "Sangre sin anticoagulante",
    contiene: ["TGO/AST", "TGP/ALT", "Bilirrubina Total", "Bilirrubina Directa", "Bilirrubina Indirecta", "Fosfatasa Alcalina", "GGT"],
    ayuno: true,
    tiempo: "24 horas",
    descripcion: "Evaluación completa de la función hepática",
    tags: ["hígado", "hepatitis", "transaminasas", "bilirrubina"]
  },
  {
    id: 10,
    codigo: "QUI004",
    nombre: "Electrolitos",
    tipo: "prueba",
    area: "Química",
    precio: 25,
    muestra: "Sangre sin anticoagulante",
    ayuno: false,
    tiempo: "4 horas",
    descripcion: "Sodio, Potasio, Cloro - Balance hidroelectrolítico",
    tags: ["sodio", "potasio", "cloro", "electrolitos", "deshidratación"]
  },

  // MICROBIOLOGÍA
  {
    id: 11,
    codigo: "MIC001",
    nombre: "Urocultivo con Antibiograma",
    tipo: "prueba",
    area: "Microbiología",
    precio: 30,
    muestra: "Orina en recipiente estéril",
    ayuno: false,
    tiempo: "48-72 horas",
    descripcion: "Cultivo de orina para identificación bacteriana y sensibilidad antibiótica",
    tags: ["orina", "infección", "urinaria", "cultivo", "antibiótico"]
  },
  {
    id: 12,
    codigo: "MIC002",
    nombre: "Coprocultivo",
    tipo: "prueba",
    area: "Microbiología",
    precio: 35,
    muestra: "Heces frescas en recipiente estéril",
    ayuno: false,
    tiempo: "48-72 horas",
    descripcion: "Cultivo de heces para identificación de patógenos intestinales",
    tags: ["heces", "diarrea", "cultivo", "intestinal", "gastroenteritis"]
  },
  {
    id: 13,
    codigo: "MIC003",
    nombre: "Cultivo de Secreción",
    tipo: "prueba",
    area: "Microbiología",
    precio: 32,
    muestra: "Secreción con hisopo estéril",
    ayuno: false,
    tiempo: "48-72 horas",
    descripcion: "Cultivo de secreciones (faríngea, ótica, vaginal, uretral) con antibiograma",
    tags: ["cultivo", "infección", "secreción", "antibiótico"]
  },

  // INMUNOLOGÍA
  {
    id: 14,
    codigo: "INM001",
    nombre: "VDRL",
    tipo: "prueba",
    area: "Inmunología",
    precio: 15,
    muestra: "Sangre sin anticoagulante",
    ayuno: false,
    tiempo: "24 horas",
    descripcion: "Prueba de detección de sífilis",
    tags: ["sífilis", "VDRL", "ETS", "venérea"]
  },
  {
    id: 15,
    codigo: "INM002",
    nombre: "HIV 1-2 (4ta Generación)",
    tipo: "prueba",
    area: "Inmunología",
    precio: 25,
    muestra: "Sangre sin anticoagulante",
    ayuno: false,
    tiempo: "24 horas",
    descripcion: "Detección de anticuerpos y antígeno p24 del VIH",
    tags: ["HIV", "VIH", "SIDA", "ETS"]
  },
  {
    id: 16,
    codigo: "INM003",
    nombre: "Antígeno Prostático (PSA Total)",
    tipo: "prueba",
    area: "Inmunología",
    precio: 35,
    muestra: "Sangre sin anticoagulante",
    ayuno: false,
    tiempo: "24 horas",
    descripcion: "Marcador tumoral para cáncer de próstata",
    tags: ["próstata", "PSA", "cáncer", "urología", "marcador tumoral"]
  },
  {
    id: 17,
    codigo: "INM004",
    nombre: "Beta HCG Cuantitativa",
    tipo: "prueba",
    area: "Inmunología",
    precio: 20,
    muestra: "Sangre sin anticoagulante",
    ayuno: false,
    tiempo: "4 horas",
    descripcion: "Prueba de embarazo cuantitativa en sangre",
    tags: ["embarazo", "HCG", "gestación", "prenatal"]
  },
  {
    id: 18,
    codigo: "INM005",
    nombre: "PCR (Proteína C Reactiva)",
    tipo: "prueba",
    area: "Inmunología",
    precio: 18,
    muestra: "Sangre sin anticoagulante",
    ayuno: false,
    tiempo: "4 horas",
    descripcion: "Marcador de inflamación aguda",
    tags: ["inflamación", "PCR", "infección", "autoinmune"]
  },

  // HORMONAS
  {
    id: 19,
    codigo: "HOR001",
    nombre: "TSH",
    tipo: "prueba",
    area: "Hormonas",
    precio: 25,
    muestra: "Sangre sin anticoagulante",
    ayuno: false,
    tiempo: "24 horas",
    descripcion: "Hormona estimulante de la tiroides",
    tags: ["tiroides", "TSH", "hipotiroidismo", "hipertiroidismo"]
  },
  {
    id: 20,
    codigo: "PERF003",
    nombre: "Perfil Tiroideo",
    tipo: "perfil",
    area: "Hormonas",
    precio: 60,
    muestra: "Sangre sin anticoagulante",
    contiene: ["TSH", "T3 Total", "T4 Total", "T3 Libre", "T4 Libre"],
    ayuno: false,
    tiempo: "24 horas",
    descripcion: "Evaluación completa de la función tiroidea",
    tags: ["tiroides", "hormonal", "metabolismo", "endocrino"]
  },
  {
    id: 21,
    codigo: "HOR002",
    nombre: "Insulina Basal",
    tipo: "prueba",
    area: "Hormonas",
    precio: 28,
    muestra: "Sangre sin anticoagulante",
    ayuno: true,
    tiempo: "24 horas",
    descripcion: "Evaluación de resistencia a la insulina",
    tags: ["insulina", "diabetes", "resistencia", "metabolismo"]
  },

  // UROANÁLISIS
  {
    id: 22,
    codigo: "URI001",
    nombre: "Examen de Orina",
    tipo: "prueba",
    area: "Uroanálisis",
    precio: 12,
    muestra: "Orina completa",
    ayuno: false,
    tiempo: "2 horas",
    descripcion: "Análisis físico, químico y microscópico de orina",
    tags: ["orina", "urinálisis", "riñón", "infección"]
  },
  {
    id: 23,
    codigo: "URI002",
    nombre: "Microalbuminuria",
    tipo: "prueba",
    area: "Uroanálisis",
    precio: 25,
    muestra: "Primera orina de la mañana",
    ayuno: false,
    tiempo: "24 horas",
    descripcion: "Detección temprana de daño renal en diabéticos",
    tags: ["riñón", "diabetes", "albúmina", "nefropatía"]
  },

  // HECES
  {
    id: 24,
    codigo: "HEC001",
    nombre: "Coproanálisis",
    tipo: "prueba",
    area: "Heces",
    precio: 15,
    muestra: "Heces frescas",
    ayuno: false,
    tiempo: "4 horas",
    descripcion: "Examen de heces para parásitos y digestión",
    tags: ["heces", "parásitos", "digestión", "coprológico"]
  },
  {
    id: 25,
    codigo: "HEC002",
    nombre: "Sangre Oculta en Heces",
    tipo: "prueba",
    area: "Heces",
    precio: 18,
    muestra: "Heces (3 muestras)",
    ayuno: false,
    tiempo: "24 horas",
    descripcion: "Detección de sangrado gastrointestinal",
    tags: ["sangre oculta", "colon", "sangrado", "cáncer colorrectal"]
  },

  // PERFILES ESPECIALES
  {
    id: 26,
    codigo: "PERF004",
    nombre: "Perfil Pre-Operatorio",
    tipo: "perfil",
    area: "Especiales",
    precio: 65,
    muestra: "Sangre múltiples tubos",
    contiene: ["Hematología Completa", "PT y PTT", "Glicemia", "Urea", "Creatinina", "Grupo Sanguíneo", "VDRL", "HIV"],
    ayuno: true,
    tiempo: "24 horas",
    descripcion: "Estudios requeridos para cirugías",
    tags: ["cirugía", "preoperatorio", "operación", "quirúrgico"]
  },
  {
    id: 27,
    codigo: "PERF005",
    nombre: "Perfil Prenatal",
    tipo: "perfil",
    area: "Especiales",
    precio: 85,
    muestra: "Sangre y orina",
    contiene: ["Hematología", "Grupo y Rh", "Glicemia", "VDRL", "HIV", "Toxoplasma IgG/IgM", "Rubéola IgG/IgM", "Examen de Orina", "Urocultivo"],
    ayuno: true,
    tiempo: "48 horas",
    descripcion: "Control completo para embarazadas",
    tags: ["embarazo", "prenatal", "gestación", "maternidad"]
  },
  {
    id: 28,
    codigo: "PERF006",
    nombre: "Check-up Ejecutivo",
    tipo: "perfil",
    area: "Especiales",
    precio: 120,
    muestra: "Sangre y orina",
    contiene: ["Hematología", "Glicemia", "Perfil Lipídico", "Perfil Hepático", "Urea", "Creatinina", "Ácido Úrico", "Examen de Orina", "PSA (hombres)", "TSH"],
    ayuno: true,
    tiempo: "24 horas",
    descripcion: "Evaluación integral de salud para ejecutivos",
    tags: ["chequeo", "ejecutivo", "completo", "preventivo"]
  }
];

// Función para obtener áreas únicas
export const getAreas = () => {
  return [...new Set(estudiosData.map(e => e.area))].sort();
};

// Función para obtener tipos únicos
export const getTipos = () => {
  return [...new Set(estudiosData.map(e => e.tipo))];
};

// Función para obtener rango de precios
export const getPrecioRange = () => {
  const precios = estudiosData.map(e => e.precio);
  return {
    min: Math.min(...precios),
    max: Math.max(...precios)
  };
};

// Función de búsqueda con scoring
export const searchEstudios = (query, filters = {}) => {
  let results = [...estudiosData];
  
  // Filtrar por área
  if (filters.area && filters.area !== 'todas') {
    results = results.filter(e => e.area === filters.area);
  }
  
  // Filtrar por tipo
  if (filters.tipo && filters.tipo !== 'todos') {
    results = results.filter(e => e.tipo === filters.tipo);
  }
  
  // Filtrar por precio
  if (filters.precioMin !== undefined || filters.precioMax !== undefined) {
    results = results.filter(e => {
      if (filters.precioMin !== undefined && e.precio < filters.precioMin) return false;
      if (filters.precioMax !== undefined && e.precio > filters.precioMax) return false;
      return true;
    });
  }
  
  // Búsqueda por texto
  if (query && query.trim() !== '') {
    const searchTerm = query.toLowerCase().trim();
    
    results = results.filter(estudio => {
      // Búsqueda en nombre (peso alto)
      if (estudio.nombre.toLowerCase().includes(searchTerm)) return true;
      
      // Búsqueda en código
      if (estudio.codigo.toLowerCase().includes(searchTerm)) return true;
      
      // Búsqueda en descripción
      if (estudio.descripcion.toLowerCase().includes(searchTerm)) return true;
      
      // Búsqueda en tags
      if (estudio.tags && estudio.tags.some(tag => tag.toLowerCase().includes(searchTerm))) return true;
      
      // Búsqueda en estudios contenidos (para perfiles)
      if (estudio.contiene && estudio.contiene.some(item => item.toLowerCase().includes(searchTerm))) return true;
      
      return false;
    });
    
    // Ordenar por relevancia
    results.sort((a, b) => {
      const aNameMatch = a.nombre.toLowerCase().includes(searchTerm) ? 10 : 0;
      const bNameMatch = b.nombre.toLowerCase().includes(searchTerm) ? 10 : 0;
      
      const aCodeMatch = a.codigo.toLowerCase().includes(searchTerm) ? 5 : 0;
      const bCodeMatch = b.codigo.toLowerCase().includes(searchTerm) ? 5 : 0;
      
      const aScore = aNameMatch + aCodeMatch;
      const bScore = bNameMatch + bCodeMatch;
      
      return bScore - aScore;
    });
  }
  
  return results;
};