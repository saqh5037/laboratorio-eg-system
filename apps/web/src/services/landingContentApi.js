/**
 * landingContentApi.js
 * Cliente API para gestión del contenido de la landing page
 *
 * Endpoints disponibles:
 * - GET /api/landing - Obtener TODO el contenido activo (público)
 * - GET /api/landing/values - Obtener valores corporativos (público)
 * - GET /api/landing/certifications - Obtener certificaciones (público)
 * - GET /api/landing/testimonials - Obtener testimonios (público)
 * - GET /api/landing/contact - Obtener info de contacto (público)
 * - GET /api/landing/content - Obtener bloques de contenido (público)
 * - GET /api/landing/statistics - Obtener estadísticas CTA (público)
 * - POST/PUT/DELETE /api/landing/{resource}/:id - CRUD admin
 */

import { logger } from '../utils/logger';
import { config } from '../config/env.js';

const API_BASE_URL = config.VITE_CONFIG_API_URL;

/**
 * Helper para obtener el token de admin del localStorage
 */
function getAdminToken() {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    logger.warn('⚠️ [landingContentApi] No hay token de admin en localStorage');
  }
  return token;
}

/**
 * Helper para headers con autenticación
 */
function getAuthHeaders() {
  const token = getAdminToken();
  logger.debug('🔑 [landingContentApi] Token length:', token ? token.length : 0);
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
    // Log detallado para debugging
    logger.error(`❌ [landingContentApi] HTTP ${response.status}:`, {
      status: response.status,
      statusText: response.statusText,
      error: data.error,
      message: data.message,
      url: response.url
    });

    throw new Error(data.error || data.message || `HTTP error! status: ${response.status}`);
  }

  return data;
}

// ============================================
// ENDPOINT PRINCIPAL - TODO EL CONTENIDO
// ============================================

/**
 * Obtener TODO el contenido activo de la landing page en una sola llamada
 * Retorna: { values, certifications, testimonials, contactInfo, contentBlocks, statistics }
 */
export async function getAllLandingContent() {
  // Cache-busting: agregar timestamp para evitar caché del navegador
  const timestamp = new Date().getTime();
  const response = await fetch(`${API_BASE_URL}/api/landing?_t=${timestamp}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-cache' // Siempre traer datos frescos
  });

  return handleResponse(response);
}

// ============================================
// VALUES (Valores corporativos)
// ============================================

/**
 * Obtener valores corporativos activos
 */
export async function getActiveValues() {
  const response = await fetch(`${API_BASE_URL}/api/landing/values`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });

  return handleResponse(response);
}

/**
 * Obtener todos los valores (admin - incluye inactivos)
 */
export async function getAllValues() {
  const response = await fetch(`${API_BASE_URL}/api/landing/values?include_inactive=true`, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  return handleResponse(response);
}

/**
 * Crear nuevo valor (admin)
 */
export async function createValue(valueData) {
  const response = await fetch(`${API_BASE_URL}/api/landing/values`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(valueData)
  });

  return handleResponse(response);
}

/**
 * Actualizar valor (admin)
 */
export async function updateValue(id, valueData) {
  const response = await fetch(`${API_BASE_URL}/api/landing/values/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(valueData)
  });

  return handleResponse(response);
}

/**
 * Eliminar valor (admin)
 */
export async function deleteValue(id) {
  const response = await fetch(`${API_BASE_URL}/api/landing/values/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  return handleResponse(response);
}

// ============================================
// CERTIFICATIONS (Certificaciones)
// ============================================

/**
 * Obtener certificaciones activas
 */
export async function getActiveCertifications() {
  const response = await fetch(`${API_BASE_URL}/api/landing/certifications`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });

  return handleResponse(response);
}

/**
 * Obtener todas las certificaciones (admin - incluye inactivas)
 */
export async function getAllCertifications() {
  const response = await fetch(`${API_BASE_URL}/api/landing/certifications?include_inactive=true`, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  return handleResponse(response);
}

/**
 * Crear nueva certificación (admin)
 */
export async function createCertification(certData) {
  const response = await fetch(`${API_BASE_URL}/api/landing/certifications`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(certData)
  });

  return handleResponse(response);
}

/**
 * Actualizar certificación (admin)
 */
export async function updateCertification(id, certData) {
  const response = await fetch(`${API_BASE_URL}/api/landing/certifications/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(certData)
  });

  return handleResponse(response);
}

/**
 * Eliminar certificación (admin)
 */
export async function deleteCertification(id) {
  const response = await fetch(`${API_BASE_URL}/api/landing/certifications/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  return handleResponse(response);
}

// ============================================
// TESTIMONIALS (Testimonios)
// ============================================

/**
 * Obtener testimonios activos
 */
export async function getActiveTestimonials() {
  const response = await fetch(`${API_BASE_URL}/api/landing/testimonials`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });

  return handleResponse(response);
}

/**
 * Obtener todos los testimonios (admin - incluye inactivos)
 */
export async function getAllTestimonials() {
  const response = await fetch(`${API_BASE_URL}/api/landing/testimonials?include_inactive=true`, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  return handleResponse(response);
}

/**
 * Crear nuevo testimonio (admin)
 */
export async function createTestimonial(testimData) {
  const response = await fetch(`${API_BASE_URL}/api/landing/testimonials`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(testimData)
  });

  return handleResponse(response);
}

/**
 * Actualizar testimonio (admin)
 */
export async function updateTestimonial(id, testimData) {
  const response = await fetch(`${API_BASE_URL}/api/landing/testimonials/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(testimData)
  });

  return handleResponse(response);
}

/**
 * Eliminar testimonio (admin)
 */
export async function deleteTestimonial(id) {
  const response = await fetch(`${API_BASE_URL}/api/landing/testimonials/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  return handleResponse(response);
}

// ============================================
// CONTACT INFO (Información de contacto)
// ============================================

/**
 * Obtener información de contacto activa
 * @param {string} type - Filtrar por tipo (opcional): address, phone, email, hours, social, whatsapp, service
 */
export async function getActiveContactInfo(type = null) {
  const url = type
    ? `${API_BASE_URL}/api/landing/contact?type=${encodeURIComponent(type)}`
    : `${API_BASE_URL}/api/landing/contact`;

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });

  return handleResponse(response);
}

/**
 * Obtener toda la información de contacto (admin - incluye inactivos)
 */
export async function getAllContactInfo() {
  const response = await fetch(`${API_BASE_URL}/api/landing/contact?include_inactive=true`, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  return handleResponse(response);
}

/**
 * Crear nueva información de contacto (admin)
 */
export async function createContactInfo(contactData) {
  const response = await fetch(`${API_BASE_URL}/api/landing/contact`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(contactData)
  });

  return handleResponse(response);
}

/**
 * Actualizar información de contacto (admin)
 */
export async function updateContactInfo(id, contactData) {
  const response = await fetch(`${API_BASE_URL}/api/landing/contact/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(contactData)
  });

  return handleResponse(response);
}

/**
 * Eliminar información de contacto (admin)
 */
export async function deleteContactInfo(id) {
  const response = await fetch(`${API_BASE_URL}/api/landing/contact/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  return handleResponse(response);
}

// ============================================
// CONTENT BLOCKS (Bloques de contenido)
// ============================================

/**
 * Obtener bloques de contenido activos
 * @param {string} section - Filtrar por sección (opcional): nosotros-header, historia, valores-header, proposito, etc.
 */
export async function getActiveContentBlocks(section = null) {
  const url = section
    ? `${API_BASE_URL}/api/landing/content?section=${encodeURIComponent(section)}`
    : `${API_BASE_URL}/api/landing/content`;

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });

  return handleResponse(response);
}

/**
 * Obtener todos los bloques de contenido (admin - incluye inactivos)
 */
export async function getAllContentBlocks() {
  const response = await fetch(`${API_BASE_URL}/api/landing/content?include_inactive=true`, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  return handleResponse(response);
}

/**
 * Crear nuevo bloque de contenido (admin)
 */
export async function createContentBlock(blockData) {
  const response = await fetch(`${API_BASE_URL}/api/landing/content`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(blockData)
  });

  return handleResponse(response);
}

/**
 * Actualizar bloque de contenido (admin)
 */
export async function updateContentBlock(id, blockData) {
  const response = await fetch(`${API_BASE_URL}/api/landing/content/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(blockData)
  });

  return handleResponse(response);
}

/**
 * Eliminar bloque de contenido (admin)
 */
export async function deleteContentBlock(id) {
  const response = await fetch(`${API_BASE_URL}/api/landing/content/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  return handleResponse(response);
}

// ============================================
// STATISTICS (Estadísticas para CTA)
// ============================================

/**
 * Obtener estadísticas activas
 */
export async function getActiveStatistics() {
  const response = await fetch(`${API_BASE_URL}/api/landing/statistics`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });

  return handleResponse(response);
}

/**
 * Obtener todas las estadísticas (admin - incluye inactivas)
 */
export async function getAllStatistics() {
  const response = await fetch(`${API_BASE_URL}/api/landing/statistics?include_inactive=true`, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  return handleResponse(response);
}

/**
 * Crear nueva estadística (admin)
 */
export async function createStatistic(statData) {
  const response = await fetch(`${API_BASE_URL}/api/landing/statistics`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(statData)
  });

  return handleResponse(response);
}

/**
 * Actualizar estadística (admin)
 */
export async function updateStatistic(id, statData) {
  const response = await fetch(`${API_BASE_URL}/api/landing/statistics/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(statData)
  });

  return handleResponse(response);
}

/**
 * Eliminar estadística (admin)
 */
export async function deleteStatistic(id) {
  const response = await fetch(`${API_BASE_URL}/api/landing/statistics/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  return handleResponse(response);
}

// ============================================
// CACHE INVALIDATION (Publicar cambios)
// ============================================

/**
 * Invalidar todo el caché de contenido de landing page
 * Esto fuerza que la landing pública muestre los últimos cambios
 * Requiere autenticación de administrador
 * @returns {Promise<{success: boolean, message: string, data: Object}>}
 */
export async function invalidateLandingCache() {
  const response = await fetch(`${API_BASE_URL}/api/landing/invalidate-cache`, {
    method: 'POST',
    headers: getAuthHeaders()
  });

  return handleResponse(response);
}
