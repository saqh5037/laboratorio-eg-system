/**
 * LAB_INFO - Valores por defecto genéricos
 * IMPORTANTE: Estos son solo fallbacks cuando la API no responde.
 * Los datos reales se cargan desde config-api via useCompanyInfo()
 */
export const LAB_INFO = {
  name: 'Laboratorio',
  fullName: 'Laboratorio Clínico',
  slogan: 'Tu salud, nuestra prioridad',
  foundedYear: null,
  rif: '',
  email: '', // Se carga desde API
  phone: '', // Se carga desde API
  whatsapp: '', // Se carga desde API
  address: {
    street: '',
    colony: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  },
  social: {
    facebook: '',
    instagram: '',
    twitter: '',
  },
  schedule: {
    weekdays: {
      days: 'Lunes - Viernes',
      open: '',
      close: '',
    },
    saturday: {
      days: 'Sábado',
      open: '',
      close: '',
    },
    sunday: {
      days: 'Domingo',
      open: '',
      close: '',
    },
  },
  certifications: [],
};

export const STUDY_CATEGORIES = {
  hematologia: {
    id: 'hematologia',
    name: 'Hematología',
    description: 'Estudios de células sanguíneas y coagulación',
    icon: '🩸',
  },
  quimica: {
    id: 'quimica',
    name: 'Química Sanguínea',
    description: 'Análisis bioquímicos de sangre',
    icon: '🧪',
  },
  microbiologia: {
    id: 'microbiologia',
    name: 'Microbiología',
    description: 'Cultivos y análisis de microorganismos',
    icon: '🦠',
  },
  inmunologia: {
    id: 'inmunologia',
    name: 'Inmunología',
    description: 'Estudios del sistema inmune',
    icon: '🛡️',
  },
  orina: {
    id: 'orina',
    name: 'Urinalisis',
    description: 'Análisis completo de orina',
    icon: '💧',
  },
  hormonas: {
    id: 'hormonas',
    name: 'Hormonas',
    description: 'Perfiles hormonales completos',
    icon: '⚗️',
  },
};

export const PREPARATION_TYPES = {
  FASTING_8: 'Ayuno de 8 horas',
  FASTING_12: 'Ayuno de 12 horas',
  NO_PREPARATION: 'Sin preparación especial',
  FIRST_MORNING_URINE: 'Primera orina de la mañana',
  AVOID_EXERCISE: 'Evitar ejercicio 24 horas antes',
  SPECIAL_DIET: 'Dieta especial (consultar)',
};

export const DELIVERY_TIMES = {
  SAME_DAY: 'Mismo día',
  NEXT_DAY: '24 horas',
  TWO_DAYS: '48 horas',
  THREE_DAYS: '72 horas',
  ONE_WEEK: '7 días',
  TWO_WEEKS: '14 días',
};

export const PAYMENT_METHODS = [
  'Efectivo',
  'Tarjeta de Débito',
  'Tarjeta de Crédito',
  'Transferencia Bancaria',
  'Pago con Seguro Médico',
];

export const INSURANCE_PARTNERS = [
  'MetLife',
  'AXA',
  'GNP Seguros',
  'Seguros Monterrey',
  'MAPFRE',
  'Allianz',
  'Zurich',
  'Plan Seguro',
];

export const QUALITY_STANDARDS = {
  accuracy: '99.9%',
  reportDelivery: '95% a tiempo',
  customerSatisfaction: '4.8/5.0',
  samplesProcessedMonthly: '10,000+',
  yearsOfExperience: 43,
  certifiedProfessionals: 25,
};

export const API_ENDPOINTS = {
  base: process.env.REACT_APP_API_URL || 'https://api.laboratorioeg.com',
  studies: '/api/studies',
  appointments: '/api/appointments',
  results: '/api/results',
  contact: '/api/contact',
};

export const ROUTES = {
  home: '/',
  estudios: '/estudios',
  nosotros: '/nosotros',
  contacto: '/contacto',
  resultados: '/resultados',
  citas: '/citas',
  precios: '/precios',
};

/**
 * META_TAGS - Valores por defecto genéricos para SEO
 * Los valores reales se cargan dinámicamente desde config-api
 */
export const META_TAGS = {
  title: 'Laboratorio Clínico',
  description: 'Sistema profesional de análisis clínicos.',
  keywords: 'laboratorio clínico, análisis de sangre, estudios médicos',
  author: 'Laboratorio',
  ogImage: '/og-image.jpg',
};