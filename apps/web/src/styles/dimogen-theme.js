/**
 * DIMOGEN Design System
 * Colores y tipografía oficial según manual de identidad corporativa
 */

// Colores oficiales DIMOGEN (del manual de identidad)
export const DIMOGEN_COLORS = {
  // Color principal oficial
  primary: '#0047CB',
  primaryDark: '#003F92',
  primaryLight: '#0047CB15',
  primaryHover: '#003A9E',

  // Colores base
  white: '#FFFFFF',
  black: '#000000',

  // Colores heredados de GRUPO MICRO-TEC
  microtec: {
    blue: '#02377D',
    green: '#98CB59',
    red: '#EC3237',
    darkBlue: '#003F92',
  },

  // Acentos por servicio (diferenciación con armonía)
  molecular: {
    primary: '#0047CB',     // Azul principal
    accent: '#00A3E0',      // Cyan
    accentLight: '#00A3E015',
    gradient: 'linear-gradient(135deg, #0047CB 0%, #00A3E0 100%)',
  },
  salud: {
    primary: '#0047CB',     // Azul principal
    accent: '#7DD3FC',      // Sky
    accentLight: '#7DD3FC15',
    gradient: 'linear-gradient(135deg, #0047CB 0%, #7DD3FC 100%)',
  },
  alimentos: {
    primary: '#0047CB',     // Azul principal
    accent: '#98CB59',      // Verde MICRO-TEC
    accentLight: '#98CB5915',
    gradient: 'linear-gradient(135deg, #0047CB 0%, #98CB59 100%)',
  },

  // Estados
  success: '#98CB59',
  warning: '#F59E0B',
  error: '#EC3237',
  info: '#00A3E0',

  // Grises
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
};

// Tipografía oficial DIMOGEN
export const DIMOGEN_FONTS = {
  primary: "'Poppins', sans-serif",
  weights: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  sizes: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
    '6xl': '3.75rem',   // 60px
  },
};

// Espaciados consistentes
export const DIMOGEN_SPACING = {
  section: {
    paddingY: 'py-16 lg:py-24',
    paddingX: 'px-6 lg:px-12',
  },
  container: 'max-w-7xl mx-auto',
  gap: {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
    xl: 'gap-12',
  },
};

// Bordes y sombras consistentes
export const DIMOGEN_STYLES = {
  borderRadius: {
    sm: 'rounded-lg',      // 8px
    md: 'rounded-xl',      // 12px
    lg: 'rounded-2xl',     // 16px
    full: 'rounded-full',
  },
  shadow: {
    sm: 'shadow-md',
    md: 'shadow-lg',
    lg: 'shadow-xl',
    xl: 'shadow-2xl',
  },
  transition: 'transition-all duration-300',
};

// Certificaciones
export const DIMOGEN_CERTS = {
  iso: {
    name: 'ISO 9001:2015',
    issuer: 'Global Standards',
    description: 'Sistema de Gestión de Calidad',
  },
  cofepris: {
    name: 'COFEPRIS',
    number: '2409152002A00328',
    description: 'Comisión Federal para la Protección contra Riesgos Sanitarios',
  },
};

// Información de contacto (actualizado según manual 2025)
export const DIMOGEN_CONTACT = {
  // Teléfonos principales
  phone: '56 1033 5124',
  phone2: '56 1045 4458',
  phoneLink: '5610335124',
  phoneLink2: '5610454458',
  whatsapp: '5610454458',

  // Email
  email: 'hola@dimogen.com.mx',
  emailMicrobiologia: 'msanchez@dimogen.com.mx',

  // Web
  website: 'www.dimogen.com.mx',

  // Ubicación (CDMX)
  address: 'Calle Quintana Roo 78, Roma Sur, Cuauhtémoc, 06760, CDMX',
  googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Calle+Quintana+Roo+78+Roma+Sur+CDMX',

  // Horario
  schedule: 'Lun - Vie: 7:30 AM - 7:00 PM',

  // Redes sociales
  social: {
    facebook: 'dimogenlaboratorio',
    instagram: 'dimogenlab',
    tiktok: '@dimogen.lab',
  },
};

// Helper para obtener color de servicio
export const getServiceColors = (service) => {
  switch (service) {
    case 'molecular':
      return DIMOGEN_COLORS.molecular;
    case 'salud':
      return DIMOGEN_COLORS.salud;
    case 'alimentos':
      return DIMOGEN_COLORS.alimentos;
    default:
      return DIMOGEN_COLORS.molecular;
  }
};

export default {
  colors: DIMOGEN_COLORS,
  fonts: DIMOGEN_FONTS,
  spacing: DIMOGEN_SPACING,
  styles: DIMOGEN_STYLES,
  certs: DIMOGEN_CERTS,
  contact: DIMOGEN_CONTACT,
  getServiceColors,
};
