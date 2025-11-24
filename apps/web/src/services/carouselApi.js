/**
 * carouselApi.js
 * Cliente API para gestión del carrusel dinámico
 *
 * Endpoints disponibles:
 * - GET /api/carousel - Obtener slides activos (público)
 * - GET /api/carousel?include_inactive=true - Obtener todos los slides (admin)
 * - GET /api/carousel/:id - Obtener slide por ID
 * - GET /api/carousel/stats - Obtener estadísticas
 * - POST /api/carousel - Crear nuevo slide
 * - PUT /api/carousel/:id - Actualizar slide
 * - DELETE /api/carousel/:id - Eliminar slide
 * - POST /api/carousel/:id/toggle - Activar/desactivar slide
 * - POST /api/carousel/:id/reorder - Reordenar slide
 * - POST /api/carousel/upload - Subir y optimizar imagen
 * - GET /api/carousel/uploads/list - Listar archivos subidos
 * - GET /api/carousel/uploads/stats - Estadísticas de almacenamiento
 */

import { config } from '../config/env.js';

const API_BASE_URL = config.VITE_CONFIG_API_URL;

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
 * Obtener slides activos y programados para el carrusel público
 */
export async function getActiveSlides() {
  const response = await fetch(`${API_BASE_URL}/api/carousel`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });

  return handleResponse(response);
}

/**
 * Obtener un slide específico por ID
 */
export async function getSlideById(id) {
  const response = await fetch(`${API_BASE_URL}/api/carousel/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });

  return handleResponse(response);
}

// ============================================
// ENDPOINTS ADMIN (requieren autenticación)
// ============================================

/**
 * Obtener todos los slides (incluidos inactivos) - ADMIN
 */
export async function getAllSlides() {
  const response = await fetch(`${API_BASE_URL}/api/carousel?include_inactive=true`, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  return handleResponse(response);
}

/**
 * Obtener estadísticas de slides - ADMIN
 */
export async function getCarouselStats() {
  const response = await fetch(`${API_BASE_URL}/api/carousel/stats`, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  return handleResponse(response);
}

/**
 * Crear nuevo slide - ADMIN
 * @param {Object} slideData - Datos del slide
 * @param {string} slideData.title - Título (requerido)
 * @param {string} slideData.subtitle - Subtítulo
 * @param {string} slideData.description - Descripción
 * @param {string} slideData.image_url - URL de imagen desktop (requerido)
 * @param {string} slideData.image_alt - Texto alternativo
 * @param {string} slideData.image_mobile_url - URL de imagen móvil
 * @param {string} slideData.cta1_text - Texto CTA 1
 * @param {string} slideData.cta1_link - Link CTA 1
 * @param {string} slideData.cta2_text - Texto CTA 2
 * @param {string} slideData.cta2_link - Link CTA 2
 * @param {string} slideData.badge_text - Texto del badge
 * @param {string} slideData.badge_color - Color del badge (purple, pink, blue, green, red, yellow)
 * @param {boolean} slideData.is_active - Si está activo
 * @param {string} slideData.start_date - Fecha de inicio (ISO)
 * @param {string} slideData.end_date - Fecha de fin (ISO)
 */
export async function createSlide(slideData) {
  const response = await fetch(`${API_BASE_URL}/api/carousel`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(slideData)
  });

  return handleResponse(response);
}

/**
 * Actualizar slide existente - ADMIN
 * @param {number} id - ID del slide
 * @param {Object} slideData - Datos a actualizar
 */
export async function updateSlide(id, slideData) {
  const response = await fetch(`${API_BASE_URL}/api/carousel/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(slideData)
  });

  return handleResponse(response);
}

/**
 * Eliminar slide - ADMIN
 * @param {number} id - ID del slide
 */
export async function deleteSlide(id) {
  const response = await fetch(`${API_BASE_URL}/api/carousel/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  return handleResponse(response);
}

/**
 * Activar o desactivar slide - ADMIN
 * @param {number} id - ID del slide
 * @param {boolean} isActive - Nuevo estado
 */
export async function toggleSlideActive(id, isActive) {
  const response = await fetch(`${API_BASE_URL}/api/carousel/${id}/toggle`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ is_active: isActive })
  });

  return handleResponse(response);
}

/**
 * Reordenar slide a nueva posición - ADMIN
 * @param {number} id - ID del slide
 * @param {number} newPosition - Nueva posición
 */
export async function reorderSlide(id, newPosition) {
  const response = await fetch(`${API_BASE_URL}/api/carousel/${id}/reorder`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ new_position: newPosition })
  });

  return handleResponse(response);
}

// ============================================
// UPLOAD DE IMÁGENES
// ============================================

/**
 * Subir y optimizar imagen para carrusel - ADMIN
 * Genera automáticamente versiones desktop (1920x1080) y móvil (800x600) en WebP
 * @param {File} file - Archivo de imagen (JPG, PNG o WebP, máx 5MB)
 * @returns {Promise<{desktop_url, mobile_url, desktop_filename, mobile_filename}>}
 */
export async function uploadCarouselImage(file) {
  const formData = new FormData();
  formData.append('file', file);

  const token = getAdminToken();

  const response = await fetch(`${API_BASE_URL}/api/carousel/upload`, {
    method: 'POST',
    headers: {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      // NO incluir Content-Type, el navegador lo establece automáticamente con boundary
    },
    body: formData
  });

  return handleResponse(response);
}

/**
 * Listar todos los archivos subidos - ADMIN
 */
export async function listUploadedFiles() {
  const response = await fetch(`${API_BASE_URL}/api/carousel/uploads/list`, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  return handleResponse(response);
}

/**
 * Obtener estadísticas de almacenamiento - ADMIN
 */
export async function getStorageStats() {
  const response = await fetch(`${API_BASE_URL}/api/carousel/uploads/stats`, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  return handleResponse(response);
}

// ============================================
// HELPERS Y UTILIDADES
// ============================================

/**
 * Validar datos del slide antes de enviar
 */
export function validateSlideData(slideData) {
  const errors = [];

  if (!slideData.title || slideData.title.trim().length < 3) {
    errors.push('El título debe tener al menos 3 caracteres');
  }

  if (slideData.title && slideData.title.length > 200) {
    errors.push('El título no puede exceder 200 caracteres');
  }

  if (!slideData.image_url) {
    errors.push('La imagen es obligatoria');
  }

  if (slideData.cta1_text && !slideData.cta1_link) {
    errors.push('Si defines un CTA1 debe tener un link');
  }

  if (slideData.cta2_text && !slideData.cta2_link) {
    errors.push('Si defines un CTA2 debe tener un link');
  }

  if (slideData.start_date && slideData.end_date) {
    const startDate = new Date(slideData.start_date);
    const endDate = new Date(slideData.end_date);

    if (startDate > endDate) {
      errors.push('La fecha de inicio debe ser anterior a la fecha de fin');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Formatear slide para formulario
 */
export function formatSlideForForm(slide) {
  return {
    title: slide.title || '',
    subtitle: slide.subtitle || '',
    description: slide.description || '',
    image_url: slide.image_url || '',
    image_alt: slide.image_alt || '',
    image_mobile_url: slide.image_mobile_url || '',
    cta1_text: slide.cta1_text || '',
    cta1_link: slide.cta1_link || '',
    cta1_icon: slide.cta1_icon || 'calendar',
    cta2_text: slide.cta2_text || '',
    cta2_link: slide.cta2_link || '',
    cta2_icon: slide.cta2_icon || 'flask',
    badge_text: slide.badge_text || '',
    badge_color: slide.badge_color || 'purple',
    is_active: slide.is_active !== undefined ? slide.is_active : true,
    start_date: slide.start_date ? new Date(slide.start_date).toISOString().slice(0, 16) : '',
    end_date: slide.end_date ? new Date(slide.end_date).toISOString().slice(0, 16) : ''
  };
}

/**
 * Colores de badge disponibles
 */
export const BADGE_COLORS = [
  { value: 'purple', label: 'Morado', color: 'bg-purple-500' },
  { value: 'pink', label: 'Rosa', color: 'bg-pink-500' },
  { value: 'blue', label: 'Azul', color: 'bg-blue-500' },
  { value: 'green', label: 'Verde', color: 'bg-green-500' },
  { value: 'red', label: 'Rojo', color: 'bg-red-500' },
  { value: 'yellow', label: 'Amarillo', color: 'bg-yellow-500' }
];

/**
 * Iconos disponibles para botones CTA
 */
export const AVAILABLE_ICONS = [
  { value: 'calendar', label: 'Calendario' },
  { value: 'flask', label: 'Laboratorio' },
  { value: 'phone', label: 'Teléfono' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'laptop', label: 'Computadora' },
  { value: 'user', label: 'Usuario' },
  { value: 'email', label: 'Email' },
  { value: 'map', label: 'Ubicación' },
  { value: 'check', label: 'Check' },
  { value: 'heart', label: 'Corazón' },
  { value: 'star', label: 'Estrella' },
  { value: 'bell', label: 'Campana' },
  { value: 'file', label: 'Archivo' },
  { value: 'image', label: 'Imagen' },
  { value: 'video', label: 'Video' },
  { value: 'play', label: 'Reproducir' },
  { value: 'search', label: 'Buscar' },
  { value: 'settings', label: 'Configuración' },
  { value: 'help', label: 'Ayuda' },
  { value: 'info', label: 'Información' },
  { value: 'download', label: 'Descargar' },
  { value: 'share', label: 'Compartir' },
  { value: 'home', label: 'Inicio' }
];

/**
 * Links comunes precargados para el selector de links
 */
export const COMMON_LINKS = [
  {
    category: "Páginas Principales",
    icon: "🏠",
    links: [
      { label: "Inicio", value: "/", type: "internal", description: "Página principal del sitio", configKey: null },
      { label: "Sección Nosotros", value: "/#nosotros", type: "anchor", description: "Información sobre el laboratorio", configKey: null },
      { label: "Sección Contacto", value: "/#contacto", type: "anchor", description: "Formulario de contacto", configKey: null },
    ]
  },
  {
    category: "Servicios",
    icon: "🔬",
    links: [
      { label: "Directorio de Estudios", value: "/estudios", type: "internal", description: "Catálogo completo de estudios", configKey: "ui.pages.estudios.enabled" },
      { label: "Consultar Resultados", value: "/resultados", type: "internal", description: "Portal de resultados en línea", configKey: "ui.pages.resultados.enabled" },
      { label: "Buscar", value: "/buscar", type: "internal", description: "Búsqueda de estudios", configKey: "ui.pages.buscar.enabled" },
    ]
  },
  {
    category: "Contacto Directo",
    icon: "📞",
    links: [
      { label: "Contact Center", value: "tel:+525552653770", type: "phone", description: "Teléfono principal", configKey: null },
      { label: "Email: contacto@micro-tec.com.mx", value: "mailto:contacto@micro-tec.com.mx", type: "email", description: "Correo electrónico oficial", configKey: null },
    ]
  },
  {
    category: "WhatsApp",
    icon: "💬",
    links: [
      { label: "WhatsApp", value: "https://wa.me/5256112377380", type: "whatsapp", description: "WhatsApp principal", primary: true, configKey: null },
    ]
  },
  {
    category: "Redes Sociales",
    icon: "📱",
    links: [
      { label: "Instagram @laboratorioeg", value: "https://www.instagram.com/laboratorioeg", type: "social", description: "Síguenos en Instagram", configKey: null },
      { label: "Twitter/X @Laboratorio_EG", value: "https://twitter.com/Laboratorio_EG", type: "social", description: "Síguenos en Twitter", configKey: null },
      { label: "Facebook", value: "https://facebook.com", type: "social", description: "Síguenos en Facebook", configKey: null },
    ]
  },
  {
    category: "Ubicación",
    icon: "📍",
    links: [
      { label: "Ver en Google Maps", value: "", type: "external", description: "Nuestra ubicación", configKey: null },
    ]
  },
  {
    category: "Legal",
    icon: "📋",
    links: [
      { label: "Política de Privacidad", value: "/privacidad", type: "internal", description: "Cómo protegemos tus datos", configKey: null },
      { label: "Términos y Condiciones", value: "/terminos", type: "internal", description: "Términos de uso del sitio", configKey: null },
      { label: "Política de Cookies", value: "/cookies", type: "internal", description: "Uso de cookies", configKey: null },
    ]
  }
];

/**
 * Filtrar links según configuraciones activas del sistema
 * @param {Object} systemConfig - Configuración del sistema desde useSystemConfig
 * @returns {Array} - Links filtrados según configuraciones activas
 */
export function getAvailableLinks(systemConfig) {
  if (!systemConfig) {
    // Si no hay config, retornar todos los links
    return COMMON_LINKS;
  }

  // Filtrar categorías y links
  const filteredCategories = COMMON_LINKS.map(category => ({
    ...category,
    links: category.links.filter(link => {
      // Si no tiene configKey, siempre está disponible
      if (!link.configKey) return true;

      // Verificar si la configuración está habilitada
      const parts = link.configKey.split('.');
      let current = systemConfig;

      for (const part of parts) {
        if (current[part] === undefined) {
          // Si no existe la config, asumir que está habilitado
          return true;
        }
        current = current[part];
      }

      // El valor final debe ser true para que esté habilitado
      return current === true;
    })
  })).filter(category => category.links.length > 0); // Eliminar categorías vacías

  return filteredCategories;
}
