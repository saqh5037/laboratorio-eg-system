import { logger } from '../utils/logger';
import { config } from '../config/env.js';

const CONFIG_API_URL = config.VITE_CONFIG_API_URL;

/**
 * Login de administrador
 * @param {string} username
 * @param {string} password
 * @returns {Promise<{success: boolean, data?: {token: string, user: Object}, message?: string}>}
 */
export async function loginAdmin(username, password) {
  try {
    const response = await fetch(`${CONFIG_API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error en el login');
    }

    return data;
  } catch (error) {
    console.error('Error en loginAdmin:', error);
    throw error;
  }
}

/**
 * Validar token JWT
 * @param {string} token
 * @returns {Promise<{success: boolean, valid: boolean}>}
 */
export async function validateToken(token) {
  try {
    const response = await fetch(`${CONFIG_API_URL}/api/auth/validate-token`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en validateToken:', error);
    return { success: false, valid: false };
  }
}

/**
 * Obtener datos del usuario actual
 * @returns {Promise<{success: boolean, data?: Object}>}
 */
export async function getCurrentUser() {
  try {
    logger.debug('🔐 [adminAuthApi] getCurrentUser() llamado');

    const token = localStorage.getItem('adminToken');

    if (!token) {
      logger.error('❌ [adminAuthApi] No hay token en localStorage');
      throw new Error('No hay token de autenticación');
    }

    logger.debug('🔑 [adminAuthApi] Token encontrado, length:', token.length);
    logger.debug('🌐 [adminAuthApi] Llamando a:', `${CONFIG_API_URL}/api/auth/me`);
    logger.debug('📤 [adminAuthApi] Authorization header:', `Bearer ${token.substring(0, 20)}...`);

    const response = await fetch(`${CONFIG_API_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    logger.debug('📥 [adminAuthApi] Response status:', response.status, response.statusText);

    const data = await response.json();
    logger.debug('📦 [adminAuthApi] Response data:', data);

    if (!response.ok) {
      logger.error('❌ [adminAuthApi] Response not OK:', {
        status: response.status,
        statusText: response.statusText,
        data
      });
      throw new Error(data.message || 'Error al obtener usuario');
    }

    logger.debug('✅ [adminAuthApi] getCurrentUser exitoso, user:', data.user?.username);
    return data;
  } catch (error) {
    logger.error('💥 [adminAuthApi] Error en getCurrentUser:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    throw error;
  }
}

/**
 * Cambiar contraseña del usuario actual
 * @param {string} currentPassword
 * @param {string} newPassword
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export async function changePassword(currentPassword, newPassword) {
  try {
    const token = localStorage.getItem('adminToken');

    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const response = await fetch(`${CONFIG_API_URL}/api/auth/change-password`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        currentPassword,
        newPassword
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al cambiar contraseña');
    }

    return data;
  } catch (error) {
    console.error('Error en changePassword:', error);
    throw error;
  }
}
