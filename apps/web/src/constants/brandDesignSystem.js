/**
 * ===== MANUAL DE IMAGEN: SISTEMA DE DISEÑO CORPORATIVO =====
 * Laboratorio Elizabeth Gutiérrez
 *
 * IMPORTANTE: Este archivo contiene las constantes oficiales del manual de imagen.
 * NO modificar sin autorización. SOLO usar estos valores en toda la aplicación.
 */

// ===== COLORES PANTONE OFICIALES =====
// NUNCA usar colores fuera de esta paleta
export const PANTONE_COLORS = {
  // Pantone 2665U - Purple principal
  purple: {
    pantone: '2665U',
    hex: '#7B68A6',
    rgb: 'rgb(123, 104, 166)',
    tailwind: 'eg-purple',
    uso: 'Color principal corporativo. Usar en headers, botones primarios, enlaces',
  },

  // Pantone 250U - Pink secundario
  pink: {
    pantone: '250U',
    hex: '#DDB5D5',
    rgb: 'rgb(221, 181, 213)',
    tailwind: 'eg-pink',
    uso: 'Color secundario. Usar en acentos, backgrounds suaves, botones secundarios',
  },

  // CoolGray 9U - Gris frío oficial
  gray: {
    pantone: 'CoolGray 9U',
    hex: '#8B8C8E',
    rgb: 'rgb(139, 140, 142)',
    tailwind: 'eg-gray',
    uso: 'Texto secundario, iconos, borders',
  },

  // Negro Pantone 231F20
  black: {
    pantone: '231F20',
    hex: '#231F20',
    rgb: 'rgb(35, 31, 32)',
    tailwind: 'eg-black',
    uso: 'Texto principal, títulos',
  },

  // Blanco puro
  white: {
    hex: '#FFFFFF',
    rgb: 'rgb(255, 255, 255)',
    tailwind: 'eg-white',
    uso: 'Backgrounds claros, texto sobre fondos oscuros',
  },
};

// ===== MODO OSCURO (TEMPERATURA FRÍA) =====
// Usar tonos azules fríos en lugar de grises cálidos
export const DARK_MODE_COLORS = {
  background: '#0F1729',      // Background azul oscuro frío
  surface: '#1A2238',         // Surface azul oscuro
  elevated: '#243447',        // Cards elevados
  textPrimary: '#E8F0FF',     // Texto azul claro frío
  textSecondary: '#8B9FC7',   // Texto secundario azul
  border: '#243447',          // Border frío
};

// ===== COLORES PROHIBIDOS =====
// NUNCA usar estos colores (no están en el manual)
export const PROHIBITED_COLORS = [
  '#FF0000', '#FF5733', '#FFA500', '#FFD700', // Rojos, naranjas, amarillos cálidos
  '#00FF00', '#32CD32', '#98FB98',            // Verdes cálidos
  '#00FFFF', '#87CEEB',                        // Cyans/azules claros cálidos
  'red', 'orange', 'yellow', 'green', 'cyan', 'lime', 'emerald', 'teal', 'sky',
];

// ===== TIPOGRAFÍA CORPORATIVA =====
export const TYPOGRAPHY = {
  fontFamily: {
    primary: 'DIN Pro',
    fallback: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
    complete: "'DIN Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },

  // ===== JERARQUÍA POR TAMAÑO (NO POR BOLD) =====
  // Manual de imagen: NO usar bold/semibold. Jerarquía SOLO por tamaño.
  hierarchy: {
    h1: { size: '24pt', pixels: '32px', uso: 'Títulos principales de página' },
    h2: { size: '20pt', pixels: '27px', uso: 'Títulos de sección' },
    h3: { size: '18pt', pixels: '24px', uso: 'Subtítulos importantes' },
    h4: { size: '16pt', pixels: '21px', uso: 'Títulos de tarjetas y componentes' },
    h5: { size: '14pt', pixels: '19px', uso: 'Subtítulos menores' },
    h6: { size: '12pt', pixels: '16px', uso: 'Etiquetas pequeñas' },
    body: { size: '14pt', pixels: '19px', uso: 'Texto normal' },
    small: { size: '12pt', pixels: '16px', uso: 'Texto secundario, footer' },
  },

  // PROHIBIDO: NO usar estos pesos de fuente
  prohibitedWeights: ['bold', 'semibold', '600', '700', '800', '900'],
  allowedWeights: ['normal', '400'], // SOLO peso normal permitido
};

// ===== LOGOTIPO Y MARCA =====
export const LOGO_SPECS = {
  rif: 'J-40233378-1',
  rifVisibility: 'ALWAYS', // RIF debe estar SIEMPRE visible

  margins: {
    minimum: '1cm',      // Margen mínimo del manual
    pixels: '37.8px',    // 1cm = 37.8px
    tailwind: 'logo-margin',
  },

  sizes: {
    header: {
      height: '60px',
      uso: 'Header principal desktop',
    },
    headerMobile: {
      height: '48px',
      uso: 'Header mobile',
    },
    footer: {
      height: '56px',
      uso: 'Footer',
    },
  },

  prohibitions: [
    'NO distorsionar',
    'NO cambiar colores',
    'NO agregar efectos (sombras, brillos, degradados no autorizados)',
    'NO rotar',
    'NO usar sobre fondos con ruido visual',
  ],
};

// ===== GRADIENTES AUTORIZADOS =====
// SOLO usar estos gradientes con colores Pantone
export const AUTHORIZED_GRADIENTS = {
  purpleGradient: {
    css: 'linear-gradient(135deg, #7B68A6 0%, #9B88C6 100%)',
    tailwind: 'bg-eg-purple-gradient',
    uso: 'Backgrounds de hero, headers destacados',
  },
  pinkGradient: {
    css: 'linear-gradient(135deg, #DDB5D5 0%, #E8C4DD 100%)',
    tailwind: 'bg-eg-pink-gradient',
    uso: 'Acentos suaves, backgrounds secundarios',
  },
  purplePinkGradient: {
    css: 'linear-gradient(135deg, #7B68A6 0%, #DDB5D5 100%)',
    tailwind: 'bg-eg-gradient',
    uso: 'CTAs principales, elementos destacados',
  },
};

// ===== ICONOGRAFÍA =====
export const ICONOGRAPHY = {
  style: 'outline', // Preferir outline sobre solid
  strokeWidth: 2,   // Grosor consistente
  sizes: {
    xs: '16px',
    sm: '20px',
    md: '24px',
    lg: '32px',
    xl: '40px',
  },
  color: PANTONE_COLORS.purple.hex, // Iconos en purple por defecto
  secondaryColor: PANTONE_COLORS.gray.hex,
};

// ===== ESPACIADO Y MÁRGENES =====
export const SPACING = {
  logoMargin: '37.8px',        // 1cm obligatorio
  sectionPadding: '4rem',      // 64px entre secciones
  componentGap: '1.5rem',      // 24px entre componentes
  cardPadding: '1.5rem',       // 24px padding interno de cards

  // Sistema de espaciado 8px
  scale: {
    xs: '0.5rem',   // 8px
    sm: '1rem',     // 16px
    md: '1.5rem',   // 24px
    lg: '2rem',     // 32px
    xl: '3rem',     // 48px
    '2xl': '4rem',  // 64px
  },
};

// ===== ACCESIBILIDAD (WCAG AA) =====
export const ACCESSIBILITY = {
  contrast: {
    minimum: 4.5,           // Ratio mínimo 4.5:1 para texto normal
    large: 3,               // Ratio 3:1 para texto grande (18pt+)
    standard: 'WCAG AA',
  },

  touchTargets: {
    minimum: '44px',        // Tamaño mínimo según WCAG
    recommended: '48px',
  },

  focusVisible: {
    ring: '2px',
    color: PANTONE_COLORS.purple.hex,
    offset: '2px',
  },

  aria: {
    required: true,
    labels: 'Todos los elementos interactivos deben tener aria-label',
    landmarks: 'Usar <header>, <main>, <nav>, <footer>, <aside>',
  },

  keyboard: {
    navigation: 'required',
    tabOrder: 'lógico y secuencial',
    shortcuts: 'documentar todos los atajos',
  },
};

// ===== TRANSICIONES Y ANIMACIONES =====
export const ANIMATIONS = {
  theme: {
    duration: '300ms',
    easing: 'ease-in-out',
    properties: ['background-color', 'color', 'border-color'],
  },

  hover: {
    duration: '200ms',
    easing: 'ease-out',
  },

  page: {
    duration: '400ms',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

// ===== SOMBRAS =====
// Usar tonos purple con baja opacidad (temperatura fría)
export const SHADOWS = {
  sm: '0 1px 2px 0 rgba(123, 104, 166, 0.05)',
  DEFAULT: '0 1px 3px 0 rgba(123, 104, 166, 0.1), 0 1px 2px 0 rgba(123, 104, 166, 0.06)',
  md: '0 4px 6px -1px rgba(123, 104, 166, 0.1), 0 2px 4px -1px rgba(123, 104, 166, 0.06)',
  lg: '0 10px 15px -3px rgba(123, 104, 166, 0.1), 0 4px 6px -2px rgba(123, 104, 166, 0.05)',
  xl: '0 20px 25px -5px rgba(123, 104, 166, 0.1), 0 10px 10px -5px rgba(123, 104, 166, 0.04)',
  '2xl': '0 25px 50px -12px rgba(123, 104, 166, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(123, 104, 166, 0.06)',
  purple: '0 10px 40px -10px rgba(123, 104, 166, 0.3)',
  pink: '0 10px 40px -10px rgba(221, 181, 213, 0.3)',
};

// ===== BORDER RADIUS =====
export const BORDER_RADIUS = {
  sm: '0.25rem',   // 4px
  DEFAULT: '0.5rem',   // 8px
  md: '0.75rem',   // 12px
  lg: '1rem',      // 16px
  xl: '1.25rem',   // 20px
  '2xl': '1.5rem', // 24px
  full: '9999px',
};

// ===== BREAKPOINTS =====
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// ===== VALIDACIÓN DEL DISEÑO =====
export const DESIGN_VALIDATION = {
  checklist: [
    '✓ Usar SOLO colores Pantone oficiales',
    '✓ DIN Pro como ÚNICA fuente',
    '✓ NO usar bold/semibold',
    '✓ RIF siempre visible',
    '✓ Logo con margen mínimo 1cm',
    '✓ Contraste mínimo 4.5:1',
    '✓ Touch targets ≥44px',
    '✓ Modo oscuro con tonos fríos',
    '✓ ARIA labels en todos los elementos interactivos',
    '✓ Navegación por teclado funcional',
  ],

  prohibitions: [
    '✗ NO usar colores cálidos (red, orange, yellow, green)',
    '✗ NO usar bold o semibold',
    '✗ NO distorsionar el logo',
    '✗ NO usar gradientes no autorizados',
    '✗ NO usar fondos con ruido visual',
    '✗ NO usar fuentes que no sean DIN Pro',
  ],
};

// ===== EXPORTACIÓN DEFAULT =====
export default {
  colors: PANTONE_COLORS,
  darkMode: DARK_MODE_COLORS,
  typography: TYPOGRAPHY,
  logo: LOGO_SPECS,
  gradients: AUTHORIZED_GRADIENTS,
  icons: ICONOGRAPHY,
  spacing: SPACING,
  accessibility: ACCESSIBILITY,
  animations: ANIMATIONS,
  shadows: SHADOWS,
  borderRadius: BORDER_RADIUS,
  breakpoints: BREAKPOINTS,
  validation: DESIGN_VALIDATION,
  prohibitedColors: PROHIBITED_COLORS,
};
