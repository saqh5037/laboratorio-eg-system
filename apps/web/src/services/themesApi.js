/**
 * themesApi.js
 * Cliente API para gestión de temas dinámicos
 *
 * Endpoints disponibles:
 * - GET /api/theme - Obtener tema actual (público)
 * - GET /api/theme/colors - Obtener paleta de colores (público)
 * - GET /api/theme/templates - Obtener templates predefinidos (público)
 * - PUT /api/theme - Actualizar tema completo (admin)
 * - PATCH /api/theme/colors - Actualizar solo colores (admin)
 * - POST /api/theme/reset - Resetear a Lab EG defaults (admin)
 * - POST /api/theme/apply-template/:id - Aplicar template (admin)
 * - POST /api/theme/upload-logo - Subir logo (admin)
 */

const API_BASE_URL = import.meta.env.VITE_CONFIG_API_URL || 'http://localhost:3005';

/**
 * Helper para obtener el token de admin del localStorage
 */
function getAdminToken() {
  return localStorage.getItem('adminToken');
}

/**
 * Helper para headers con autenticación
 */
function getAuthHeaders() {
  const token = getAdminToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

/**
 * Helper para manejar respuestas de la API
 */
async function handleResponse(response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `HTTP error! status: ${response.status}`);
  }

  return data;
}

// ============================================
// ENDPOINTS PÚBLICOS (sin autenticación)
// ============================================

/**
 * Obtener configuración del tema actual
 * @returns {Promise<Object>} { success, data: { color_primary, color_secondary, ... } }
 */
export async function getTheme() {
  const response = await fetch(`${API_BASE_URL}/api/theme`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });

  return handleResponse(response);
}

/**
 * Obtener solo la paleta de colores
 * @returns {Promise<Object>} { success, data: { primary, secondary, text: {...}, ... } }
 */
export async function getColorPalette() {
  const response = await fetch(`${API_BASE_URL}/api/theme/colors`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });

  return handleResponse(response);
}

/**
 * Obtener templates predefinidos disponibles
 * @returns {Promise<Object>} { success, data: [{ id, name, description, preview }, ...] }
 */
export async function getTemplates() {
  const response = await fetch(`${API_BASE_URL}/api/theme/templates`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });

  return handleResponse(response);
}

/**
 * Obtener preview del tema con gradientes y sombras calculadas
 * @returns {Promise<Object>} { success, data: { theme, colors, gradients, shadows } }
 */
export async function getThemePreview() {
  const response = await fetch(`${API_BASE_URL}/api/theme/preview`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });

  return handleResponse(response);
}

// ============================================
// ENDPOINTS ADMIN (requieren autenticación)
// ============================================

/**
 * Actualizar configuración del tema completo
 * @param {Object} themeData - Datos del tema a actualizar
 * @returns {Promise<Object>} { success, message, data: {...} }
 */
export async function updateTheme(themeData) {
  const response = await fetch(`${API_BASE_URL}/api/theme`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(themeData)
  });

  return handleResponse(response);
}

/**
 * Actualizar solo colores principales (endpoint rápido)
 * @param {Object} colors - { primary, secondary, accent }
 * @returns {Promise<Object>} { success, message, data: {...} }
 */
export async function updateColors(colors) {
  const response = await fetch(`${API_BASE_URL}/api/theme/colors`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(colors)
  });

  return handleResponse(response);
}

/**
 * Resetear tema a valores por defecto de Lab EG
 * @returns {Promise<Object>} { success, message, data: {...} }
 */
export async function resetTheme() {
  const response = await fetch(`${API_BASE_URL}/api/theme/reset`, {
    method: 'POST',
    headers: getAuthHeaders()
  });

  return handleResponse(response);
}

/**
 * Aplicar un template predefinido
 * @param {string} templateId - ID del template (lab-eg, blue-corporate, green-health, orange-modern)
 * @returns {Promise<Object>} { success, message, data: {...} }
 */
export async function applyTemplate(templateId) {
  const response = await fetch(`${API_BASE_URL}/api/theme/apply-template/${templateId}`, {
    method: 'POST',
    headers: getAuthHeaders()
  });

  return handleResponse(response);
}

/**
 * Subir logo del laboratorio
 * @param {File} file - Archivo de imagen (JPG, PNG, SVG)
 * @param {string} type - Tipo de logo ('main' | 'icon' | 'favicon')
 * @returns {Promise<Object>} { success, message, data: { logo_url, logo_filename, logo_type } }
 */
export async function uploadLogo(file, type = 'main') {
  const formData = new FormData();
  formData.append('logo', file);
  formData.append('type', type);

  const token = getAdminToken();
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/theme/upload-logo`, {
    method: 'POST',
    headers,
    body: formData
  });

  return handleResponse(response);
}

// ============================================
// HELPERS DE VALIDACIÓN
// ============================================

/**
 * Validar formato de color hexadecimal
 * @param {string} hex - Color en formato #RRGGBB
 * @returns {boolean}
 */
export function isValidHexColor(hex) {
  return /^#[0-9A-Fa-f]{6}$/.test(hex);
}

/**
 * Validar archivo de logo
 * @param {File} file - Archivo a validar
 * @returns {Object} { valid: boolean, error: string }
 */
export function validateLogoFile(file) {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'];
  const maxSize = 2 * 1024 * 1024; // 2MB

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Tipo de archivo no permitido. Solo JPG, PNG o SVG.'
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Archivo muy grande. Máximo 2MB.'
    };
  }

  return { valid: true };
}

/**
 * Validar datos de tema antes de enviar
 * @param {Object} themeData - Datos del tema
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateThemeData(themeData) {
  const errors = [];

  // Validar colores hex
  const hexFields = [
    'color_primary',
    'color_secondary',
    'color_accent',
    'color_text_primary',
    'color_text_secondary',
    'color_background',
    'color_surface',
    'color_dark_bg',
    'color_dark_surface',
    'color_dark_text',
    'color_dark_text_secondary',
    'color_success',
    'color_warning',
    'color_error',
    'color_info'
  ];

  for (const field of hexFields) {
    if (themeData[field] && !isValidHexColor(themeData[field])) {
      errors.push(`${field} debe ser un color hexadecimal válido (ej: #7B68A6)`);
    }
  }

  // Validar shadow_intensity
  if (themeData.shadow_intensity !== undefined) {
    const intensity = parseInt(themeData.shadow_intensity);
    if (isNaN(intensity) || intensity < 0 || intensity > 10) {
      errors.push('shadow_intensity debe ser un número entre 0 y 10');
    }
  }

  // Validar glassmorphism_enabled
  if (themeData.glassmorphism_enabled !== undefined &&
      typeof themeData.glassmorphism_enabled !== 'boolean') {
    errors.push('glassmorphism_enabled debe ser un booleano');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// ============================================
// CONVERSIÓN DE COLORES
// ============================================

/**
 * Convertir HEX a RGB
 * @param {string} hex - Color en formato #RRGGBB
 * @returns {Object} { r, g, b }
 */
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

/**
 * Convertir RGB a HEX
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {string} Color en formato #RRGGBB
 */
export function rgbToHex(r, g, b) {
  return "#" + [r, g, b]
    .map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    })
    .join('');
}
