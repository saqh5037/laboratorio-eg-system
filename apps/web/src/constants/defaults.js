/**
 * Valores por defecto GENÉRICOS (NO específicos de empresa)
 * Se usan solo cuando la API no responde
 * IMPORTANTE: NO contienen información de "Elizabeth Gutiérrez" ni "MICRO-TEC"
 */

export const DEFAULT_COMPANY = {
  name: 'Laboratorio',
  shortName: 'Lab',
  description: 'Sistema de laboratorio clínico',
  yearsOfExperience: 0,
  phone: '',
  email: '',
  address: '',
  rif: '',
  slogan: 'Tu salud, nuestra prioridad'
};

export const DEFAULT_METADATA = {
  title: 'Laboratorio - Sistema de Análisis Clínicos',
  description: 'Sistema profesional de análisis clínicos',
  author: 'Sistema de Laboratorio',
  keywords: 'laboratorio, análisis clínicos, médico'
};

export const DEFAULT_LOGO = {
  full: '/LogoMicrotec.svg',
  icon: '/LogoMicrotec.svg',
  horizontal: '/LogoMicrotec.svg',
  altText: 'MICRO-TEC - Laboratorio Clínico de Referencia'
};
