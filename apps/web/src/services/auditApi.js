const CONFIG_API_URL = import.meta.env.VITE_CONFIG_API_URL;

/**
 * Helper para obtener headers con autenticación
 * @returns {Object}
 */
function getAuthHeaders() {
  const token = localStorage.getItem('adminToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}

/**
 * Obtener log de auditoría con filtros y paginación
 * @param {Object} params - { limit, offset, key, changed_by, from_date, to_date }
 * @returns {Promise<{success: boolean, data: Array, total: number}>}
 */
export async function getAuditLog(params = {}) {
  try {
    const queryString = new URLSearchParams(params).toString();
    const url = `${CONFIG_API_URL}/api/audit${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      headers: getAuthHeaders()
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al obtener audit log');
    }

    return data;
  } catch (error) {
    console.error('Error en getAuditLog:', error);
    throw error;
  }
}

/**
 * Obtener historial de cambios de una configuración específica
 * @param {string} key - Key de la configuración
 * @returns {Promise<{success: boolean, data: Array}>}
 */
export async function getAuditByKey(key) {
  try {
    const response = await fetch(`${CONFIG_API_URL}/api/audit/by-key/${encodeURIComponent(key)}`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al obtener historial');
    }

    return data;
  } catch (error) {
    console.error('Error en getAuditByKey:', error);
    throw error;
  }
}

/**
 * Obtener cambios realizados por un usuario específico
 * @param {string} username - Username del admin
 * @returns {Promise<{success: boolean, data: Array}>}
 */
export async function getAuditByUser(username) {
  try {
    const response = await fetch(`${CONFIG_API_URL}/api/audit/by-user/${encodeURIComponent(username)}`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al obtener cambios del usuario');
    }

    return data;
  } catch (error) {
    console.error('Error en getAuditByUser:', error);
    throw error;
  }
}

/**
 * Obtener estadísticas de auditoría
 * @returns {Promise<{success: boolean, data: Object}>}
 */
export async function getAuditStats() {
  try {
    const response = await fetch(`${CONFIG_API_URL}/api/audit/stats`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al obtener estadísticas');
    }

    return data;
  } catch (error) {
    console.error('Error en getAuditStats:', error);
    throw error;
  }
}

/**
 * Obtener cambios recientes
 * @param {number} limit - Número de cambios a obtener (default: 10, max: 50)
 * @returns {Promise<{success: boolean, data: Array}>}
 */
export async function getRecentAudit(limit = 10) {
  try {
    const response = await fetch(`${CONFIG_API_URL}/api/audit/recent?limit=${limit}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al obtener cambios recientes');
    }

    return data;
  } catch (error) {
    console.error('Error en getRecentAudit:', error);
    throw error;
  }
}
