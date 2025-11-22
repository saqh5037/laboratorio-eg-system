/**
 * Colores oficiales de marcas de terceros (Telegram, WhatsApp, etc.)
 *
 * IMPORTANTE: Estos colores son OFICIALES de las marcas registradas y
 * NO deben cambiar cuando se modifica el tema del laboratorio.
 *
 * Son colores estáticos que deben mantenerse consistentes para
 * cumplir con las guías de branding de cada plataforma.
 */

export const THIRD_PARTY_COLORS = {
  /**
   * Telegram Brand Colors
   * Fuente: https://telegram.org/blog/brand-guidelines
   */
  telegram: {
    primary: '#0088cc',      // Telegram Blue (color oficial)
    hover: '#0077b3',        // Hover state (más oscuro)
    pressed: '#006699',      // Pressed state (aún más oscuro)
    light: '#0088cc1A',      // 10% opacidad para backgrounds
    name: 'Telegram Blue',
    description: 'Color oficial de la marca Telegram Messenger',
  },

  /**
   * WhatsApp Brand Colors
   * Fuente: https://www.whatsappbrand.com/
   */
  whatsapp: {
    primary: '#25D366',      // WhatsApp Green (color oficial)
    hover: '#128C7E',        // Hover state (dark teal)
    pressed: '#075E54',      // Pressed state (darker teal)
    light: '#25D3661A',      // 10% opacidad para backgrounds
    name: 'WhatsApp Green',
    description: 'Color oficial de la marca WhatsApp',
  },

  /**
   * Otros servicios de mensajería (para futuras integraciones)
   */
  // facebook: {
  //   primary: '#1877F2',
  //   hover: '#166FE5',
  //   pressed: '#1464D6',
  //   name: 'Facebook Blue',
  // },

  // instagram: {
  //   primary: '#E4405F',
  //   hover: '#D62956',
  //   pressed: '#C7254E',
  //   name: 'Instagram Pink',
  // },
};

/**
 * Helper function para obtener un gradiente de una marca
 * @param {string} brand - Nombre de la marca ('telegram', 'whatsapp')
 * @param {string} direction - Dirección del gradiente (default: 'to right')
 * @returns {string} - CSS gradient string
 */
export function getBrandGradient(brand, direction = 'to right') {
  const colors = THIRD_PARTY_COLORS[brand];
  if (!colors) return null;

  return `linear-gradient(${direction}, ${colors.primary}, ${colors.hover})`;
}

/**
 * Helper function para obtener gradiente con estados (hover, pressed)
 * Útil para botones con efectos interactivos
 * @param {string} brand - Nombre de la marca
 * @returns {Object} - Objeto con gradientes para diferentes estados
 */
export function getBrandGradients(brand) {
  const colors = THIRD_PARTY_COLORS[brand];
  if (!colors) return null;

  return {
    default: `linear-gradient(to bottom right, ${colors.primary}, ${colors.hover})`,
    hover: `linear-gradient(to bottom right, ${colors.hover}, ${colors.pressed})`,
    pressed: `linear-gradient(to bottom right, ${colors.pressed}, ${colors.pressed})`,
  };
}

/**
 * Helper para obtener color con opacidad
 * @param {string} brand - Nombre de la marca
 * @param {number} alpha - Opacidad 0-1
 * @returns {string} - Color con opacidad en formato rgba
 */
export function getBrandColorWithAlpha(brand, alpha = 1) {
  const colors = THIRD_PARTY_COLORS[brand];
  if (!colors) return null;

  const hex = colors.primary;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
