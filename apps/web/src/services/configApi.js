/**
 * Cliente de la Config API
 * Consume endpoints de config-api
 */

import { config } from '../config/env.js';

const CONFIG_API_URL = config.VITE_CONFIG_API_URL;

/**
 * Obtener todas las configuraciones
 * @returns {Promise<Array>}
 */
export async function getAllConfig() {
  try {
    const response = await fetch(`${CONFIG_API_URL}/api/config`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error al obtener configuraciones:', error);
    return [];
  }
}

/**
 * Transformar array plano de configs a objeto anidado
 * Ejemplo: [ { key: 'ui.pages.resultados.enabled', value: false } ]
 * → { ui: { pages: { resultados: { enabled: false } } } }
 * @param {Array} flatArray - Array plano de configuraciones
 * @returns {Object} - Objeto anidado
 */
function transformFlatArrayToNested(flatArray) {
  const result = {};

  for (const item of flatArray) {
    const parts = item.key.split('.');
    let current = result;

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }

    // Asignar el valor al último nivel
    const lastPart = parts[parts.length - 1];
    current[lastPart] = item.value;
  }

  return result;
}

/**
 * Obtener configuraciones agrupadas por categoría
 * @returns {Promise<Object>}
 */
export async function getGroupedConfig() {
  try {
    const response = await fetch(`${CONFIG_API_URL}/api/config/grouped`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    const groupedData = result.data || {};

    // Transformar cada categoría de array plano a objeto anidado
    const nestedConfig = {};
    for (const [category, items] of Object.entries(groupedData)) {
      if (Array.isArray(items)) {
        // Transformar el array a objeto anidado
        const nestedItems = transformFlatArrayToNested(items);
        // Obtener solo la parte correspondiente a esta categoría
        nestedConfig[category] = nestedItems[category] || nestedItems;
      } else {
        nestedConfig[category] = items;
      }
    }

    return nestedConfig;
  } catch (error) {
    console.error('Error al obtener configuraciones agrupadas:', error);
    return {};
  }
}

/**
 * Obtener una configuración específica por key
 * @param {string} key
 * @returns {Promise<any>}
 */
export async function getConfigValue(key) {
  try {
    const response = await fetch(`${CONFIG_API_URL}/api/config/${key}`);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data?.value;
  } catch (error) {
    console.error(`Error al obtener configuración ${key}:`, error);
    return null;
  }
}

/**
 * Obtener métodos de autenticación ordenados por prioridad
 * @returns {Promise<Array>}
 */
export async function getAuthMethods() {
  try {
    const response = await fetch(`${CONFIG_API_URL}/api/config/auth-methods`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Error al obtener métodos de autenticación:', error);
    // Fallback: todos habilitados con prioridad por defecto
    return [
      { method: 'telegram', enabled: true, priority: 1 },
      { method: 'whatsapp', enabled: true, priority: 2 },
      { method: 'cedula', enabled: true, priority: 3 }
    ];
  }
}

/**
 * Verificar si una página está habilitada
 * @param {string} pageName - Nombre de la página (resultados, estudios, nosotros, contacto)
 * @returns {Promise<boolean>}
 */
export async function isPageEnabled(pageName) {
  const key = `ui.pages.${pageName}.enabled`;
  const value = await getConfigValue(key);

  // Por defecto, todas las páginas están habilitadas si no hay config
  return value !== false;
}

/**
 * Verificar si el modo mantenimiento está activo
 * @returns {Promise<boolean>}
 */
export async function isMaintenanceMode() {
  const value = await getConfigValue('system.maintenance_mode.enabled');
  return value === true;
}

/**
 * Obtener mensaje de modo mantenimiento
 * @returns {Promise<string>}
 */
export async function getMaintenanceMessage() {
  const value = await getConfigValue('system.maintenance_mode.message');
  return value || 'Sistema en mantenimiento. Volvemos pronto.';
}

// ==========================================
// MÉTODOS AUTENTICADOS (requieren JWT)
// ==========================================

/**
 * Obtener token de autenticación del localStorage
 * @returns {string|null}
 */
function getAuthToken() {
  return localStorage.getItem('adminToken');
}

/**
 * Headers con autenticación JWT
 * @returns {Object}
 */
function getAuthHeaders() {
  const token = getAuthToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
}

/**
 * Actualizar una configuración (requiere autenticación)
 * @param {string} key - Key de la configuración
 * @param {any} value - Nuevo valor
 * @param {string} username - Usuario que realiza el cambio (opcional, se obtiene del token)
 * @returns {Promise<{success: boolean, data?: Object, message?: string}>}
 */
export async function updateConfig(key, value, username = null) {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const body = { value };
    if (username) {
      body.updated_by = username;
    }

    const response = await fetch(`${CONFIG_API_URL}/api/config/${encodeURIComponent(key)}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al actualizar configuración');
    }

    return data;
  } catch (error) {
    console.error('Error en updateConfig:', error);
    throw error;
  }
}

/**
 * Crear una nueva configuración (requiere autenticación)
 * @param {Object} configData - { key, value, data_type, category, description, is_secret, is_editable }
 * @returns {Promise<{success: boolean, data?: Object, message?: string}>}
 */
export async function createConfig(configData) {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const response = await fetch(`${CONFIG_API_URL}/api/config`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(configData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al crear configuración');
    }

    return data;
  } catch (error) {
    console.error('Error en createConfig:', error);
    throw error;
  }
}

/**
 * Eliminar una configuración (requiere autenticación)
 * @param {string} key - Key de la configuración
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export async function deleteConfig(key) {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const response = await fetch(`${CONFIG_API_URL}/api/config/${encodeURIComponent(key)}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al eliminar configuración');
    }

    return data;
  } catch (error) {
    console.error('Error en deleteConfig:', error);
    throw error;
  }
}

/**
 * Invalidar cache de configuraciones (requiere autenticación)
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export async function invalidateCache() {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const response = await fetch(`${CONFIG_API_URL}/api/config/cache/invalidate`, {
      method: 'POST',
      headers: getAuthHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al invalidar cache');
    }

    return data;
  } catch (error) {
    console.error('Error en invalidateCache:', error);
    throw error;
  }
}

/**
 * Subir una imagen de contenido (requiere autenticación)
 * @param {FormData} formData - FormData con 'file' y 'category'
 * @param {Object} options - Opciones adicionales (onUploadProgress)
 * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
 */
export async function uploadImage(formData, options = {}) {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const xhr = new XMLHttpRequest();

    return new Promise((resolve, reject) => {
      xhr.open('POST', `${CONFIG_API_URL}/api/upload/image`);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);

      // Progress callback
      if (options.onUploadProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            options.onUploadProgress({
              loaded: event.loaded,
              total: event.total
            });
          }
        };
      }

      xhr.onload = () => {
        try {
          const response = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(response);
          } else {
            resolve({
              success: false,
              error: response.error || 'Error al subir imagen'
            });
          }
        } catch (e) {
          reject(new Error('Error parsing response'));
        }
      };

      xhr.onerror = () => {
        reject(new Error('Error de red al subir imagen'));
      };

      xhr.send(formData);
    });
  } catch (error) {
    console.error('Error en uploadImage:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Listar imágenes subidas (requiere autenticación)
 * @param {string} category - Filtrar por categoría (opcional)
 * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
 */
export async function listUploadedImages(category = null) {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const url = category
      ? `${CONFIG_API_URL}/api/upload/images?category=${category}`
      : `${CONFIG_API_URL}/api/upload/images`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error al listar imágenes');
    }

    return data;
  } catch (error) {
    console.error('Error en listUploadedImages:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
}

/**
 * Eliminar una imagen subida (requiere autenticación)
 * @param {string} filename - Nombre del archivo a eliminar
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteUploadedImage(filename) {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const response = await fetch(`${CONFIG_API_URL}/api/upload/image/${encodeURIComponent(filename)}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error al eliminar imagen');
    }

    return data;
  } catch (error) {
    console.error('Error en deleteUploadedImage:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Export como objeto para facilitar uso
export const configApi = {
  getAllConfig,
  getGroupedConfig,
  getConfigValue,
  getAuthMethods,
  isPageEnabled,
  isMaintenanceMode,
  getMaintenanceMessage,
  updateConfig,
  createConfig,
  deleteConfig,
  invalidateCache,
  uploadImage,
  listUploadedImages,
  deleteUploadedImage
};
