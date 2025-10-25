/**
 * Datos de perfiles/grupos de estudios
 * Estos son conjuntos de estudios que se solicitan juntos
 */

export const perfilesData = [
  {
    id: 'perfil_001',
    codigo: 'PERF-BAS',
    nombre: 'Perfil Básico',
    descripcion: 'Evaluación general del estado de salud',
    area: 'Perfiles',
    precio: 45.00,
    tiempoEntrega: '24-48 horas',
    pruebas: [
      'Hematología completa',
      'Glicemia',
      'Urea',
      'Creatinina',
      'Colesterol total',
      'Triglicéridos'
    ],
    preparacion: 'Ayuno de 8-12 horas',
    popular: true,
    tags: ['chequeo', 'rutina', 'básico']
  },
  {
    id: 'perfil_002',
    codigo: 'PERF-COMP',
    nombre: 'Perfil Completo',
    descripcion: 'Evaluación exhaustiva del estado de salud',
    area: 'Perfiles',
    precio: 85.00,
    tiempoEntrega: '48-72 horas',
    pruebas: [
      'Hematología completa',
      'Química sanguínea (12 parámetros)',
      'Perfil lipídico completo',
      'Perfil hepático',
      'Perfil renal',
      'Electrolitos',
      'Uroanálisis'
    ],
    preparacion: 'Ayuno de 12 horas',
    popular: true,
    tags: ['completo', 'ejecutivo', 'chequeo']
  },
  {
    id: 'perfil_003',
    codigo: 'PERF-CARD',
    nombre: 'Perfil Cardiológico',
    descripcion: 'Evaluación de riesgo cardiovascular',
    area: 'Perfiles',
    precio: 65.00,
    tiempoEntrega: '24-48 horas',
    pruebas: [
      'Perfil lipídico completo',
      'Proteína C reactiva ultrasensible',
      'Homocisteína',
      'Fibrinógeno',
      'CPK',
      'CPK-MB',
      'Troponina'
    ],
    preparacion: 'Ayuno de 12 horas',
    tags: ['cardio', 'corazón', 'riesgo']
  },
  {
    id: 'perfil_004',
    codigo: 'PERF-DIAB',
    nombre: 'Perfil Diabético',
    descripcion: 'Control y diagnóstico de diabetes',
    area: 'Perfiles',
    precio: 55.00,
    tiempoEntrega: '24-48 horas',
    pruebas: [
      'Glicemia en ayunas',
      'Hemoglobina glicosilada',
      'Insulina basal',
      'Índice HOMA',
      'Microalbuminuria',
      'Perfil lipídico'
    ],
    preparacion: 'Ayuno de 8-12 horas',
    popular: true,
    tags: ['diabetes', 'glucosa', 'control']
  },
  {
    id: 'perfil_005',
    codigo: 'PERF-TIRO',
    nombre: 'Perfil Tiroideo',
    descripcion: 'Evaluación completa de función tiroidea',
    area: 'Perfiles',
    precio: 60.00,
    tiempoEntrega: '24-48 horas',
    pruebas: [
      'TSH',
      'T3 libre',
      'T4 libre',
      'Anti-TPO',
      'Anti-tiroglobulina'
    ],
    preparacion: 'No requiere preparación',
    popular: true,
    tags: ['tiroides', 'hormonal', 'metabolismo']
  },
  {
    id: 'perfil_006',
    codigo: 'PERF-HEP',
    nombre: 'Perfil Hepático',
    descripcion: 'Evaluación de la función hepática',
    area: 'Perfiles',
    precio: 48.00,
    tiempoEntrega: '24 horas',
    pruebas: [
      'Transaminasas (TGO/TGP)',
      'Bilirrubina total y fraccionada',
      'Fosfatasa alcalina',
      'GGT',
      'Proteínas totales y fraccionadas',
      'Tiempo de protrombina'
    ],
    preparacion: 'Ayuno de 8 horas',
    tags: ['hígado', 'hepático', 'enzimas']
  },
  {
    id: 'perfil_007',
    codigo: 'PERF-REN',
    nombre: 'Perfil Renal',
    descripcion: 'Evaluación de la función renal',
    area: 'Perfiles',
    precio: 42.00,
    tiempoEntrega: '24 horas',
    pruebas: [
      'Urea',
      'Creatinina',
      'Ácido úrico',
      'Electrolitos (Na, K, Cl)',
      'Depuración de creatinina',
      'Uroanálisis completo'
    ],
    preparacion: 'No requiere ayuno',
    tags: ['riñón', 'renal', 'electrolitos']
  },
  {
    id: 'perfil_008',
    codigo: 'PERF-PREN',
    nombre: 'Perfil Prenatal',
    descripcion: 'Control completo para embarazadas',
    area: 'Perfiles',
    precio: 75.00,
    tiempoEntrega: '48 horas',
    pruebas: [
      'Hematología completa',
      'Grupo sanguíneo y Rh',
      'VDRL',
      'HIV',
      'Toxoplasma IgG/IgM',
      'Rubéola IgG/IgM',
      'Citomegalovirus IgG/IgM',
      'Hepatitis B y C',
      'Glicemia',
      'Uroanálisis'
    ],
    preparacion: 'Ayuno de 8 horas',
    popular: true,
    tags: ['embarazo', 'prenatal', 'gestación']
  },
  {
    id: 'perfil_009',
    codigo: 'PERF-PEDI',
    nombre: 'Perfil Pediátrico',
    descripcion: 'Chequeo completo para niños',
    area: 'Perfiles',
    precio: 38.00,
    tiempoEntrega: '24 horas',
    pruebas: [
      'Hematología completa',
      'Glicemia',
      'Calcio',
      'Hierro sérico',
      'Ferritina',
      'Examen de heces',
      'Uroanálisis'
    ],
    preparacion: 'Ayuno de 6 horas',
    tags: ['niños', 'pediátrico', 'infantil']
  },
  {
    id: 'perfil_010',
    codigo: 'PERF-HORM-F',
    nombre: 'Perfil Hormonal Femenino',
    descripcion: 'Evaluación hormonal completa para mujeres',
    area: 'Perfiles',
    precio: 95.00,
    tiempoEntrega: '48-72 horas',
    pruebas: [
      'FSH',
      'LH',
      'Estradiol',
      'Progesterona',
      'Prolactina',
      'Testosterona total',
      'DHEA-S',
      'TSH'
    ],
    preparacion: 'Según fase del ciclo menstrual',
    tags: ['hormonal', 'femenino', 'ginecológico']
  },
  {
    id: 'perfil_011',
    codigo: 'PERF-HORM-M',
    nombre: 'Perfil Hormonal Masculino',
    descripcion: 'Evaluación hormonal completa para hombres',
    area: 'Perfiles',
    precio: 85.00,
    tiempoEntrega: '48-72 horas',
    pruebas: [
      'Testosterona total',
      'Testosterona libre',
      'FSH',
      'LH',
      'Prolactina',
      'PSA total',
      'PSA libre',
      'TSH'
    ],
    preparacion: 'Preferiblemente en la mañana',
    tags: ['hormonal', 'masculino', 'andrológico']
  },
  {
    id: 'perfil_012',
    codigo: 'PERF-ALERG',
    nombre: 'Panel de Alergias Básico',
    descripcion: 'Detección de alergias comunes',
    area: 'Perfiles',
    precio: 120.00,
    tiempoEntrega: '5-7 días',
    pruebas: [
      'IgE total',
      'Panel de alimentos comunes',
      'Panel de inhalantes',
      'Panel de ácaros',
      'Panel de epitelios de animales'
    ],
    preparacion: 'No requiere preparación',
    tags: ['alergia', 'inmunología', 'panel']
  },
  {
    id: 'perfil_013',
    codigo: 'PERF-ETS',
    nombre: 'Perfil ETS Completo',
    descripcion: 'Detección de enfermedades de transmisión sexual',
    area: 'Perfiles',
    precio: 110.00,
    tiempoEntrega: '48-72 horas',
    pruebas: [
      'HIV 1+2',
      'VDRL',
      'Hepatitis B (HBsAg)',
      'Hepatitis C',
      'Herpes simplex 1 y 2',
      'Clamidia',
      'Gonorrea',
      'Tricomoniasis'
    ],
    preparacion: 'No requiere preparación especial',
    tags: ['ETS', 'sexual', 'screening']
  },
  {
    id: 'perfil_014',
    codigo: 'PERF-ONCO',
    nombre: 'Perfil Marcadores Tumorales',
    descripcion: 'Screening de marcadores oncológicos',
    area: 'Perfiles',
    precio: 145.00,
    tiempoEntrega: '48-72 horas',
    pruebas: [
      'CEA',
      'CA 19-9',
      'CA 125 (mujeres)',
      'CA 15-3 (mujeres)',
      'PSA total (hombres)',
      'PSA libre (hombres)',
      'AFP'
    ],
    preparacion: 'Ayuno de 8 horas',
    tags: ['oncológico', 'cáncer', 'marcadores']
  },
  {
    id: 'perfil_015',
    codigo: 'PERF-NUTRI',
    nombre: 'Perfil Nutricional',
    descripcion: 'Evaluación del estado nutricional',
    area: 'Perfiles',
    precio: 68.00,
    tiempoEntrega: '48 horas',
    pruebas: [
      'Proteínas totales y fraccionadas',
      'Vitamina D',
      'Vitamina B12',
      'Ácido fólico',
      'Hierro sérico',
      'Ferritina',
      'Transferrina',
      'Calcio',
      'Magnesio'
    ],
    preparacion: 'Ayuno de 8 horas',
    tags: ['nutrición', 'vitaminas', 'minerales']
  },
  {
    id: 'perfil_016',
    codigo: 'PERF-SPORT',
    nombre: 'Perfil Deportivo',
    descripcion: 'Evaluación para deportistas',
    area: 'Perfiles',
    precio: 72.00,
    tiempoEntrega: '24-48 horas',
    pruebas: [
      'Hematología completa',
      'CPK',
      'LDH',
      'Electrolitos',
      'Perfil renal',
      'Ácido láctico',
      'Cortisol',
      'Testosterona'
    ],
    preparacion: 'Evitar ejercicio intenso 24h antes',
    tags: ['deporte', 'atleta', 'rendimiento']
  },
  {
    id: 'perfil_017',
    codigo: 'PERF-GERI',
    nombre: 'Perfil Geriátrico',
    descripcion: 'Chequeo completo para adultos mayores',
    area: 'Perfiles',
    precio: 88.00,
    tiempoEntrega: '48-72 horas',
    pruebas: [
      'Hematología completa',
      'Química sanguínea completa',
      'Perfil lipídico',
      'Perfil tiroideo',
      'Vitamina D',
      'Vitamina B12',
      'PSA (hombres)',
      'Densitometría ósea'
    ],
    preparacion: 'Ayuno de 12 horas',
    tags: ['geriátrico', 'adulto mayor', 'senior']
  },
  {
    id: 'perfil_018',
    codigo: 'PERF-PREOP',
    nombre: 'Perfil Preoperatorio',
    descripcion: 'Evaluación previa a cirugía',
    area: 'Perfiles',
    precio: 52.00,
    tiempoEntrega: '24 horas',
    pruebas: [
      'Hematología completa',
      'Grupo sanguíneo y Rh',
      'PT y PTT',
      'Glicemia',
      'Urea',
      'Creatinina',
      'HIV',
      'VDRL'
    ],
    preparacion: 'Ayuno de 8 horas',
    popular: true,
    tags: ['preoperatorio', 'cirugía', 'quirúrgico']
  },
  {
    id: 'perfil_019',
    codigo: 'PERF-REUM',
    nombre: 'Perfil Reumatológico',
    descripcion: 'Evaluación de enfermedades reumáticas',
    area: 'Perfiles',
    precio: 78.00,
    tiempoEntrega: '48-72 horas',
    pruebas: [
      'Factor reumatoideo',
      'Anti-CCP',
      'ANA',
      'Anti-DNA',
      'C3 y C4',
      'VSG',
      'PCR',
      'Ácido úrico'
    ],
    preparacion: 'No requiere preparación',
    tags: ['reumatología', 'artritis', 'autoinmune']
  },
  {
    id: 'perfil_020',
    codigo: 'PERF-COVID',
    nombre: 'Perfil Post-COVID',
    descripcion: 'Evaluación posterior a infección por COVID-19',
    area: 'Perfiles',
    precio: 95.00,
    tiempoEntrega: '48-72 horas',
    pruebas: [
      'Hematología completa',
      'Dímero D',
      'Ferritina',
      'LDH',
      'PCR',
      'Perfil hepático',
      'Troponina',
      'Pro-BNP'
    ],
    preparacion: 'Ayuno de 8 horas',
    tags: ['COVID', 'post-COVID', 'seguimiento']
  }
];

export default perfilesData;