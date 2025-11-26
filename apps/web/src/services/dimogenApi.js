/**
 * DIMOGEN API Client
 * Cliente para consumir endpoints de contenido DIMOGEN desde config-api
 */

import { config } from '../config/env.js';

const CONFIG_API_URL = config.VITE_CONFIG_API_URL;

// ============================================
// HELPER FUNCTIONS
// ============================================

function getAuthToken() {
  return localStorage.getItem('adminToken');
}

function getAuthHeaders() {
  const token = getAuthToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

// ============================================
// PUBLIC ENDPOINTS (No auth required)
// ============================================

/**
 * Obtener TODO el contenido de DIMOGEN en una sola llamada
 * Optimizado para la landing page
 * @returns {Promise<Object>}
 */
export async function getAllDimogenContent() {
  try {
    const response = await fetch(`${CONFIG_API_URL}/api/dimogen/content`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error fetching DIMOGEN content:', error);
    return { success: false, error: error.message, data: null };
  }
}

/**
 * Obtener servicios activos (líneas de negocio)
 * @returns {Promise<Object>}
 */
export async function getDimogenServices() {
  try {
    const response = await fetch(`${CONFIG_API_URL}/api/dimogen/services`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching DIMOGEN services:', error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Obtener un servicio específico por key
 * @param {string} serviceKey - Key del servicio (ej: 'biologia-molecular')
 * @returns {Promise<Object>}
 */
export async function getDimogenServiceByKey(serviceKey) {
  try {
    const response = await fetch(`${CONFIG_API_URL}/api/dimogen/services/${serviceKey}`);

    if (!response.ok) {
      if (response.status === 404) {
        return { success: false, error: 'Servicio no encontrado', data: null };
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching DIMOGEN service:', error);
    return { success: false, error: error.message, data: null };
  }
}

/**
 * Obtener sección About (filosofía y valores)
 * @returns {Promise<Object>}
 */
export async function getDimogenAbout() {
  try {
    const response = await fetch(`${CONFIG_API_URL}/api/dimogen/about`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching DIMOGEN about:', error);
    return { success: false, error: error.message, data: null };
  }
}

/**
 * Obtener FAQs activas
 * @param {string} category - Categoría opcional para filtrar
 * @returns {Promise<Object>}
 */
export async function getDimogenFaqs(category = null) {
  try {
    let url = `${CONFIG_API_URL}/api/dimogen/faq`;
    if (category) {
      url += `?category=${encodeURIComponent(category)}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching DIMOGEN FAQs:', error);
    return { success: false, error: error.message, data: [] };
  }
}

// ============================================
// ADMIN ENDPOINTS (Auth required)
// ============================================

// --- SERVICES ADMIN ---

/**
 * Obtener todos los servicios (incluyendo inactivos)
 * @returns {Promise<Object>}
 */
export async function getAllAdminServices() {
  try {
    const response = await fetch(`${CONFIG_API_URL}/api/dimogen/admin/services`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching admin services:', error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Crear un nuevo servicio
 * @param {Object} serviceData - Datos del servicio
 * @returns {Promise<Object>}
 */
export async function createService(serviceData) {
  try {
    const response = await fetch(`${CONFIG_API_URL}/api/dimogen/admin/services`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(serviceData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error al crear servicio');
    }

    return data;
  } catch (error) {
    console.error('Error creating service:', error);
    throw error;
  }
}

/**
 * Actualizar un servicio
 * @param {number} id - ID del servicio
 * @param {Object} serviceData - Datos actualizados
 * @returns {Promise<Object>}
 */
export async function updateService(id, serviceData) {
  try {
    const response = await fetch(`${CONFIG_API_URL}/api/dimogen/admin/services/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(serviceData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error al actualizar servicio');
    }

    return data;
  } catch (error) {
    console.error('Error updating service:', error);
    throw error;
  }
}

/**
 * Eliminar un servicio
 * @param {number} id - ID del servicio
 * @returns {Promise<Object>}
 */
export async function deleteService(id) {
  try {
    const response = await fetch(`${CONFIG_API_URL}/api/dimogen/admin/services/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error al eliminar servicio');
    }

    return data;
  } catch (error) {
    console.error('Error deleting service:', error);
    throw error;
  }
}

// --- FAQ ADMIN ---

/**
 * Obtener todas las FAQs (incluyendo inactivas)
 * @returns {Promise<Object>}
 */
export async function getAllAdminFaqs() {
  try {
    const response = await fetch(`${CONFIG_API_URL}/api/dimogen/admin/faq`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching admin FAQs:', error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Crear una nueva FAQ
 * @param {Object} faqData - Datos de la FAQ
 * @returns {Promise<Object>}
 */
export async function createFaq(faqData) {
  try {
    const response = await fetch(`${CONFIG_API_URL}/api/dimogen/admin/faq`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(faqData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error al crear FAQ');
    }

    return data;
  } catch (error) {
    console.error('Error creating FAQ:', error);
    throw error;
  }
}

/**
 * Actualizar una FAQ
 * @param {number} id - ID de la FAQ
 * @param {Object} faqData - Datos actualizados
 * @returns {Promise<Object>}
 */
export async function updateFaq(id, faqData) {
  try {
    const response = await fetch(`${CONFIG_API_URL}/api/dimogen/admin/faq/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(faqData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error al actualizar FAQ');
    }

    return data;
  } catch (error) {
    console.error('Error updating FAQ:', error);
    throw error;
  }
}

/**
 * Eliminar una FAQ
 * @param {number} id - ID de la FAQ
 * @returns {Promise<Object>}
 */
export async function deleteFaq(id) {
  try {
    const response = await fetch(`${CONFIG_API_URL}/api/dimogen/admin/faq/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error al eliminar FAQ');
    }

    return data;
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    throw error;
  }
}

// --- ABOUT ADMIN ---

/**
 * Obtener todos los items de About (incluyendo inactivos)
 * @returns {Promise<Object>}
 */
export async function getAllAdminAbout() {
  try {
    const response = await fetch(`${CONFIG_API_URL}/api/dimogen/admin/about`, {
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching admin about:', error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Crear un nuevo item de About
 * @param {Object} aboutData - Datos del item
 * @returns {Promise<Object>}
 */
export async function createAbout(aboutData) {
  try {
    const response = await fetch(`${CONFIG_API_URL}/api/dimogen/admin/about`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(aboutData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error al crear item');
    }

    return data;
  } catch (error) {
    console.error('Error creating about item:', error);
    throw error;
  }
}

/**
 * Actualizar un item de About
 * @param {number} id - ID del item
 * @param {Object} aboutData - Datos actualizados
 * @returns {Promise<Object>}
 */
export async function updateAbout(id, aboutData) {
  try {
    const response = await fetch(`${CONFIG_API_URL}/api/dimogen/admin/about/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(aboutData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error al actualizar item');
    }

    return data;
  } catch (error) {
    console.error('Error updating about item:', error);
    throw error;
  }
}

/**
 * Eliminar un item de About
 * @param {number} id - ID del item
 * @returns {Promise<Object>}
 */
export async function deleteAbout(id) {
  try {
    const response = await fetch(`${CONFIG_API_URL}/api/dimogen/admin/about/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error al eliminar item');
    }

    return data;
  } catch (error) {
    console.error('Error deleting about item:', error);
    throw error;
  }
}

// --- CACHE ---

/**
 * Invalidar todo el cache de DIMOGEN
 * @returns {Promise<Object>}
 */
export async function invalidateDimogenCache() {
  try {
    const response = await fetch(`${CONFIG_API_URL}/api/dimogen/admin/invalidate-cache`, {
      method: 'POST',
      headers: getAuthHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error al invalidar cache');
    }

    return data;
  } catch (error) {
    console.error('Error invalidating cache:', error);
    throw error;
  }
}
