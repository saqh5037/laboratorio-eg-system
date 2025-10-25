export const categorias = [
  {
    id: 'hematologia',
    nombre: 'Hematología',
    descripcion: 'Estudios de sangre y componentes sanguíneos',
    icono: '🩸',
    color: 'bg-red-50 border-red-200'
  },
  {
    id: 'quimica',
    nombre: 'Química Sanguínea',
    descripcion: 'Análisis químicos y metabólicos',
    icono: '🧪',
    color: 'bg-blue-50 border-blue-200'
  },
  {
    id: 'microbiologia',
    nombre: 'Microbiología',
    descripcion: 'Cultivos y estudios bacteriológicos',
    icono: '🦠',
    color: 'bg-green-50 border-green-200'
  },
  {
    id: 'inmunologia',
    nombre: 'Inmunología',
    descripcion: 'Estudios del sistema inmune',
    icono: '🛡️',
    color: 'bg-purple-50 border-purple-200'
  },
  {
    id: 'orina',
    nombre: 'Uroanálisis',
    descripcion: 'Análisis de orina y función renal',
    icono: '💧',
    color: 'bg-yellow-50 border-yellow-200'
  },
  {
    id: 'hormonas',
    nombre: 'Hormonas',
    descripcion: 'Perfiles hormonales y endocrinos',
    icono: '⚗️',
    color: 'bg-pink-50 border-pink-200'
  },
  {
    id: 'alergias',
    nombre: 'Alergias',
    descripcion: 'Pruebas de sensibilidad alérgica',
    icono: '🌿',
    color: 'bg-emerald-50 border-emerald-200'
  },
  {
    id: 'especiales',
    nombre: 'Pruebas Especiales',
    descripcion: 'Estudios especializados',
    icono: '🔬',
    color: 'bg-indigo-50 border-indigo-200'
  }
];

export const estudios = [
  // HEMATOLOGÍA
  {
    id: 1,
    categoria: 'hematologia',
    nombre: 'Hematología Completa',
    descripcion: 'Incluye hemoglobina, hematocrito, contaje de glóbulos rojos y blancos, plaquetas y fórmula leucocitaria',
    precio: 15,
    preparacion: 'Ayuno de 8 horas',
    tiempoEntrega: '24 horas',
    popular: true
  },
  {
    id: 2,
    categoria: 'hematologia',
    nombre: 'VSG (Velocidad de Sedimentación)',
    descripcion: 'Mide la velocidad de sedimentación de los glóbulos rojos',
    precio: 12,
    preparacion: 'Ayuno de 8 horas',
    tiempoEntrega: '24 horas'
  },
  {
    id: 3,
    categoria: 'hematologia',
    nombre: 'PT y PTT',
    descripcion: 'Tiempo de protrombina y tiempo parcial de tromboplastina',
    precio: 25,
    preparacion: 'No requiere ayuno',
    tiempoEntrega: '24 horas'
  },
  {
    id: 4,
    categoria: 'hematologia',
    nombre: 'Grupo Sanguíneo y Factor Rh',
    descripcion: 'Determinación del tipo de sangre y factor Rh',
    precio: 18,
    preparacion: 'No requiere preparación',
    tiempoEntrega: '24 horas'
  },
  {
    id: 5,
    categoria: 'hematologia',
    nombre: 'Reticulocitos',
    descripcion: 'Contaje de glóbulos rojos inmaduros',
    precio: 15,
    preparacion: 'No requiere preparación',
    tiempoEntrega: '24 horas'
  },

  // QUÍMICA SANGUÍNEA
  {
    id: 6,
    categoria: 'quimica',
    nombre: 'Glicemia',
    descripcion: 'Medición de glucosa en sangre',
    precio: 10,
    preparacion: 'Ayuno de 8-12 horas',
    tiempoEntrega: '24 horas',
    popular: true
  },
  {
    id: 7,
    categoria: 'quimica',
    nombre: 'Perfil Lipídico Completo',
    descripcion: 'Colesterol total, HDL, LDL, VLDL y triglicéridos',
    precio: 35,
    preparacion: 'Ayuno de 12 horas',
    tiempoEntrega: '24 horas',
    popular: true
  },
  {
    id: 8,
    categoria: 'quimica',
    nombre: 'Urea y Creatinina',
    descripcion: 'Evaluación de la función renal',
    precio: 20,
    preparacion: 'Ayuno de 8 horas',
    tiempoEntrega: '24 horas'
  },
  {
    id: 9,
    categoria: 'quimica',
    nombre: 'Ácido Úrico',
    descripcion: 'Medición de ácido úrico en sangre',
    precio: 12,
    preparacion: 'Ayuno de 8 horas',
    tiempoEntrega: '24 horas'
  },
  {
    id: 10,
    categoria: 'quimica',
    nombre: 'Perfil Hepático',
    descripcion: 'TGO, TGP, bilirrubina total y fraccionada, fosfatasa alcalina',
    precio: 40,
    preparacion: 'Ayuno de 8 horas',
    tiempoEntrega: '24 horas'
  },
  {
    id: 11,
    categoria: 'quimica',
    nombre: 'Electrolitos',
    descripcion: 'Sodio, potasio, cloro',
    precio: 25,
    preparacion: 'No requiere ayuno',
    tiempoEntrega: '24 horas'
  },
  {
    id: 12,
    categoria: 'quimica',
    nombre: 'Proteínas Totales y Fraccionadas',
    descripcion: 'Proteínas totales, albúmina y globulinas',
    precio: 22,
    preparacion: 'Ayuno de 8 horas',
    tiempoEntrega: '24 horas'
  },

  // MICROBIOLOGÍA
  {
    id: 13,
    categoria: 'microbiologia',
    nombre: 'Urocultivo',
    descripcion: 'Cultivo de orina con antibiograma',
    precio: 30,
    preparacion: 'Aseo genital, primera orina de la mañana',
    tiempoEntrega: '48-72 horas',
    popular: true
  },
  {
    id: 14,
    categoria: 'microbiologia',
    nombre: 'Coprocultivo',
    descripcion: 'Cultivo de heces con antibiograma',
    precio: 35,
    preparacion: 'Muestra fresca en recipiente estéril',
    tiempoEntrega: '48-72 horas'
  },
  {
    id: 15,
    categoria: 'microbiologia',
    nombre: 'Cultivo de Secreción',
    descripcion: 'Cultivo de secreciones con antibiograma',
    precio: 32,
    preparacion: 'No aplicar medicamentos tópicos 24h antes',
    tiempoEntrega: '48-72 horas'
  },
  {
    id: 16,
    categoria: 'microbiologia',
    nombre: 'KOH (Hongos)',
    descripcion: 'Examen directo para hongos',
    precio: 18,
    preparacion: 'No aplicar antimicóticos',
    tiempoEntrega: '24 horas'
  },

  // INMUNOLOGÍA
  {
    id: 17,
    categoria: 'inmunologia',
    nombre: 'VDRL',
    descripcion: 'Prueba de sífilis',
    precio: 15,
    preparacion: 'No requiere preparación',
    tiempoEntrega: '24 horas'
  },
  {
    id: 18,
    categoria: 'inmunologia',
    nombre: 'HIV 1-2 (Prueba rápida)',
    descripcion: 'Detección de anticuerpos contra VIH',
    precio: 25,
    preparacion: 'No requiere preparación',
    tiempoEntrega: '30 minutos'
  },
  {
    id: 19,
    categoria: 'inmunologia',
    nombre: 'Antígeno Prostático (PSA)',
    descripcion: 'Marcador tumoral prostático',
    precio: 35,
    preparacion: 'No tener relaciones sexuales 48h antes',
    tiempoEntrega: '24 horas',
    popular: true
  },
  {
    id: 20,
    categoria: 'inmunologia',
    nombre: 'Prueba de Embarazo en Sangre',
    descripcion: 'Beta HCG cuantitativa',
    precio: 20,
    preparacion: 'No requiere preparación',
    tiempoEntrega: '24 horas'
  },
  {
    id: 21,
    categoria: 'inmunologia',
    nombre: 'PCR (Proteína C Reactiva)',
    descripcion: 'Marcador de inflamación',
    precio: 18,
    preparacion: 'No requiere preparación',
    tiempoEntrega: '24 horas'
  },
  {
    id: 22,
    categoria: 'inmunologia',
    nombre: 'Factor Reumatoideo',
    descripcion: 'Detección de artritis reumatoide',
    precio: 20,
    preparacion: 'Ayuno de 8 horas',
    tiempoEntrega: '24 horas'
  },
  {
    id: 23,
    categoria: 'inmunologia',
    nombre: 'ASTO (Antiestreptolisinas)',
    descripcion: 'Detección de infección estreptocócica',
    precio: 18,
    preparacion: 'No requiere preparación',
    tiempoEntrega: '24 horas'
  },

  // UROANÁLISIS
  {
    id: 24,
    categoria: 'orina',
    nombre: 'Examen de Orina',
    descripcion: 'Análisis físico, químico y microscópico de orina',
    precio: 12,
    preparacion: 'Primera orina de la mañana, aseo genital',
    tiempoEntrega: '24 horas',
    popular: true
  },
  {
    id: 25,
    categoria: 'orina',
    nombre: 'Microalbuminuria',
    descripcion: 'Detección temprana de daño renal',
    precio: 25,
    preparacion: 'Primera orina de la mañana',
    tiempoEntrega: '24 horas'
  },
  {
    id: 26,
    categoria: 'orina',
    nombre: 'Depuración de Creatinina',
    descripcion: 'Evaluación de filtración glomerular',
    precio: 30,
    preparacion: 'Recolección de orina 24 horas',
    tiempoEntrega: '48 horas'
  },

  // HORMONAS
  {
    id: 27,
    categoria: 'hormonas',
    nombre: 'TSH',
    descripcion: 'Hormona estimulante de tiroides',
    precio: 25,
    preparacion: 'No requiere preparación',
    tiempoEntrega: '24 horas',
    popular: true
  },
  {
    id: 28,
    categoria: 'hormonas',
    nombre: 'T3 y T4 Libre',
    descripcion: 'Hormonas tiroideas',
    precio: 35,
    preparacion: 'No requiere preparación',
    tiempoEntrega: '24 horas'
  },
  {
    id: 29,
    categoria: 'hormonas',
    nombre: 'Insulina',
    descripcion: 'Medición de insulina en sangre',
    precio: 28,
    preparacion: 'Ayuno de 8-12 horas',
    tiempoEntrega: '24 horas'
  },
  {
    id: 30,
    categoria: 'hormonas',
    nombre: 'Cortisol',
    descripcion: 'Hormona del estrés',
    precio: 30,
    preparacion: 'Muestra a las 8 AM',
    tiempoEntrega: '24 horas'
  },
  {
    id: 31,
    categoria: 'hormonas',
    nombre: 'Testosterona',
    descripcion: 'Hormona masculina',
    precio: 32,
    preparacion: 'Muestra en la mañana',
    tiempoEntrega: '24 horas'
  },
  {
    id: 32,
    categoria: 'hormonas',
    nombre: 'Progesterona',
    descripcion: 'Hormona femenina',
    precio: 30,
    preparacion: 'Según día del ciclo menstrual',
    tiempoEntrega: '24 horas'
  },
  {
    id: 33,
    categoria: 'hormonas',
    nombre: 'Estradiol',
    descripcion: 'Hormona femenina',
    precio: 30,
    preparacion: 'Según día del ciclo menstrual',
    tiempoEntrega: '24 horas'
  },

  // ALERGIAS
  {
    id: 34,
    categoria: 'alergias',
    nombre: 'IgE Total',
    descripcion: 'Inmunoglobulina E total',
    precio: 25,
    preparacion: 'No requiere preparación',
    tiempoEntrega: '24 horas'
  },
  {
    id: 35,
    categoria: 'alergias',
    nombre: 'Panel de Alimentos',
    descripcion: 'Detección de alergias alimentarias comunes',
    precio: 80,
    preparacion: 'No requiere preparación',
    tiempoEntrega: '5 días'
  },
  {
    id: 36,
    categoria: 'alergias',
    nombre: 'Panel Respiratorio',
    descripcion: 'Alergias a ácaros, polen, pelo de animales',
    precio: 75,
    preparacion: 'No requiere preparación',
    tiempoEntrega: '5 días'
  },

  // ESPECIALES
  {
    id: 37,
    categoria: 'especiales',
    nombre: 'Vitamina D',
    descripcion: '25-hidroxi vitamina D',
    precio: 45,
    preparacion: 'No requiere preparación',
    tiempoEntrega: '3 días'
  },
  {
    id: 38,
    categoria: 'especiales',
    nombre: 'Vitamina B12',
    descripcion: 'Cianocobalamina',
    precio: 35,
    preparacion: 'Ayuno de 8 horas',
    tiempoEntrega: '24 horas'
  },
  {
    id: 39,
    categoria: 'especiales',
    nombre: 'Ferritina',
    descripcion: 'Reservas de hierro',
    precio: 28,
    preparacion: 'Ayuno de 8 horas',
    tiempoEntrega: '24 horas'
  },
  {
    id: 40,
    categoria: 'especiales',
    nombre: 'Hemoglobina Glicosilada',
    descripcion: 'Control de diabetes (3 meses)',
    precio: 30,
    preparacion: 'No requiere ayuno',
    tiempoEntrega: '24 horas',
    popular: true
  },
  {
    id: 41,
    categoria: 'especiales',
    nombre: 'Curva de Tolerancia Glucosada',
    descripcion: 'Diagnóstico de diabetes gestacional',
    precio: 40,
    preparacion: 'Ayuno de 8-12 horas',
    tiempoEntrega: '24 horas'
  },
  {
    id: 42,
    categoria: 'especiales',
    nombre: 'Marcadores Tumorales (CA 125)',
    descripcion: 'Marcador tumoral ovárico',
    precio: 45,
    preparacion: 'No requiere preparación',
    tiempoEntrega: '3 días'
  },
  {
    id: 43,
    categoria: 'especiales',
    nombre: 'Marcadores Tumorales (CA 19-9)',
    descripcion: 'Marcador tumoral pancreático',
    precio: 45,
    preparacion: 'No requiere preparación',
    tiempoEntrega: '3 días'
  },
  {
    id: 44,
    categoria: 'especiales',
    nombre: 'Helicobacter Pylori',
    descripcion: 'Detección de H. pylori en heces',
    precio: 35,
    preparacion: 'No tomar antibióticos 2 semanas antes',
    tiempoEntrega: '24 horas'
  }
];

export const paquetes = [
  {
    id: 'basico',
    nombre: 'Chequeo Básico',
    descripcion: 'Evaluación general de salud',
    estudios: ['Hematología Completa', 'Glicemia', 'Urea y Creatinina', 'Examen de Orina'],
    precioNormal: 57,
    precioDescuento: 45,
    ahorro: 12,
    popular: true
  },
  {
    id: 'completo',
    nombre: 'Chequeo Completo',
    descripcion: 'Evaluación integral de salud',
    estudios: [
      'Hematología Completa',
      'Glicemia',
      'Perfil Lipídico Completo',
      'Urea y Creatinina',
      'Ácido Úrico',
      'Perfil Hepático',
      'Examen de Orina',
      'TSH'
    ],
    precioNormal: 167,
    precioDescuento: 120,
    ahorro: 47,
    popular: true
  },
  {
    id: 'prenatal',
    nombre: 'Control Prenatal',
    descripcion: 'Estudios esenciales para embarazadas',
    estudios: [
      'Hematología Completa',
      'Grupo Sanguíneo y Factor Rh',
      'Glicemia',
      'VDRL',
      'HIV 1-2',
      'Examen de Orina',
      'Urocultivo'
    ],
    precioNormal: 133,
    precioDescuento: 95,
    ahorro: 38
  },
  {
    id: 'tiroideo',
    nombre: 'Perfil Tiroideo',
    descripcion: 'Evaluación completa de función tiroidea',
    estudios: ['TSH', 'T3 y T4 Libre'],
    precioNormal: 60,
    precioDescuento: 50,
    ahorro: 10
  },
  {
    id: 'diabetico',
    nombre: 'Control Diabético',
    descripcion: 'Seguimiento para pacientes diabéticos',
    estudios: [
      'Glicemia',
      'Hemoglobina Glicosilada',
      'Perfil Lipídico Completo',
      'Urea y Creatinina',
      'Microalbuminuria',
      'Examen de Orina'
    ],
    precioNormal: 132,
    precioDescuento: 95,
    ahorro: 37
  },
  {
    id: 'cardiaco',
    nombre: 'Riesgo Cardiovascular',
    descripcion: 'Evaluación de factores de riesgo cardíaco',
    estudios: [
      'Perfil Lipídico Completo',
      'Glicemia',
      'PCR',
      'Ácido Úrico',
      'Hematología Completa'
    ],
    precioNormal: 90,
    precioDescuento: 70,
    ahorro: 20
  }
];