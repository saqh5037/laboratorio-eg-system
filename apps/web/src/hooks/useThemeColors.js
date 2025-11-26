import { useState, useEffect, useMemo } from 'react';

/**
 * Hook para obtener colores dinámicos del tema desde CSS variables
 * Convierte colores CSS (rgb/hex) a formato hex para usar en librerías
 * como Chart.js, react-hot-toast, etc. que no soportan CSS variables directamente
 *
 * @returns {Object} Objeto con colores en formato hex
 */
export function useThemeColors() {
  const [colors, setColors] = useState({
    // Fallbacks por defecto (DIMOGEN)
    primary: '#0047CB',
    secondary: '#00A3E0',
    accent: '#98CB59',
    purpleAccent: '#0066FF',
    pinkAccent: '#00A3E0',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  });

  useEffect(() => {
    const updateColors = () => {
      const root = getComputedStyle(document.documentElement);

      // Leer colores principales desde CSS variables
      const primary = root.getPropertyValue('--color-primary').trim();
      const secondary = root.getPropertyValue('--color-secondary').trim();
      const accent = root.getPropertyValue('--color-accent').trim();

      // Leer colores semánticos
      const success = root.getPropertyValue('--color-success').trim();
      const warning = root.getPropertyValue('--color-warning').trim();
      const error = root.getPropertyValue('--color-error').trim();
      const info = root.getPropertyValue('--color-info').trim();

      // Convertir a hex si es necesario
      setColors({
        primary: convertToHex(primary) || '#0047CB',
        secondary: convertToHex(secondary) || '#00A3E0',
        accent: convertToHex(accent) || '#98CB59',
        purpleAccent: convertToHex(primary) || '#0066FF', // Derivado del primary con opacidad
        pinkAccent: convertToHex(secondary) || '#00A3E0',
        success: convertToHex(success) || '#10B981',
        warning: convertToHex(warning) || '#F59E0B',
        error: convertToHex(error) || '#EF4444',
        info: convertToHex(info) || '#3B82F6',
      });
    };

    // Actualizar en mount
    updateColors();

    // Observer para detectar cambios en CSS variables
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          updateColors();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style'],
    });

    return () => observer.disconnect();
  }, []);

  return colors;
}

/**
 * Convierte un color en formato CSS a hex
 * Soporta: hex (#7B68A6), rgb(123, 104, 166), rgb(123 104 166)
 *
 * @param {string} color - Color en cualquier formato CSS
 * @returns {string|null} - Color en formato hex o null si no es válido
 */
function convertToHex(color) {
  if (!color) return null;

  // Si ya es hex, retornar tal cual
  if (color.startsWith('#')) {
    return color.toUpperCase();
  }

  // Si es rgb() o formato RGB de Tailwind
  const rgbMatch = color.match(/\d+/g);
  if (!rgbMatch || rgbMatch.length < 3) return null;

  // Convertir RGB a hex
  const r = parseInt(rgbMatch[0]);
  const g = parseInt(rgbMatch[1]);
  const b = parseInt(rgbMatch[2]);

  const toHex = (n) => {
    const hex = n.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

/**
 * Hook para obtener colores con opacidad para gráficas
 * Útil para Chart.js que requiere colores rgba
 *
 * @returns {Object} Objeto con funciones para obtener colores con opacidad
 */
export function useChartColors() {
  const colors = useThemeColors();

  return useMemo(() => ({
    /**
     * Obtiene un color con opacidad específica
     * @param {string} colorKey - Key del color ('primary', 'secondary', etc.)
     * @param {number} alpha - Opacidad 0-1
     * @returns {string} Color en formato rgba
     */
    withAlpha: (colorKey, alpha = 1) => {
      const hex = colors[colorKey];
      if (!hex) return `rgba(0, 71, 203, ${alpha})`;

      // Convertir hex a rgba
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);

      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    },

    /**
     * Paleta de colores para gráficas con múltiples datasets
     * @returns {Array<string>} Array de colores hex
     */
    palette: [
      colors.primary,
      colors.pinkAccent,
      colors.info,
      colors.success,
      colors.warning,
      colors.error,
      colors.accent,
    ],
  }), [colors]);
}
