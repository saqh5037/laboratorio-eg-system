/**
 * API Client para Messaging Bot Service
 * Maneja la autenticación via Telegram
 */

// Detectar automáticamente el host
const getMessagingBotApiUrl = () => {
  // Si hay una variable de entorno específica, usarla
  if (import.meta.env.VITE_MESSAGING_BOT_API_URL) {
    return import.meta.env.VITE_MESSAGING_BOT_API_URL;
  }

  // Detectar el hostname actual
  const hostname = window.location.hostname;

  // Si es localhost o 127.0.0.1, usar localhost
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3004/api';
  }

  // Si es una IP de red local, usar la misma IP
  return `http://${hostname}:3004/api`;
};

const MESSAGING_BOT_API_URL = getMessagingBotApiUrl();

class MessagingBotApiError extends Error {
  constructor(message, code, status) {
    super(message);
    this.name = 'MessagingBotApiError';
    this.code = code;
    this.status = status;
  }
}

/**
 * Realizar petición HTTP al servicio de messaging bot
 */
async function fetchApi(endpoint, options = {}) {
  const url = `${MESSAGING_BOT_API_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new MessagingBotApiError(
        data.error || 'Error en la petición',
        data.code,
        response.status
      );
    }

    return data;
  } catch (error) {
    if (error instanceof MessagingBotApiError) {
      throw error;
    }
    throw new MessagingBotApiError('Error de conexión con el servidor', 'NETWORK_ERROR', 0);
  }
}

/**
 * Solicitar código de autenticación via Telegram
 * @param {string} phone - Número de teléfono venezolano
 * @returns {Promise<{success: boolean, expiresInMinutes: number}>}
 */
export async function requestAuthCode(phone) {
  const data = await fetchApi('/auth/request-code', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  });

  return data;
}

/**
 * Verificar código de autenticación
 * @param {string} phone - Número de teléfono
 * @param {string} code - Código de 6 dígitos
 * @returns {Promise<{token: string, expiresAt: string, pacienteId: number}>}
 */
export async function verifyAuthCode(phone, code) {
  const data = await fetchApi('/auth/verify-code', {
    method: 'POST',
    body: JSON.stringify({ phone, code }),
  });

  // Guardar token en localStorage
  if (data.success && data.data) {
    localStorage.setItem('telegram_auth_token', data.data.token);
    localStorage.setItem('telegram_auth_expires', data.data.expiresAt);
    localStorage.setItem('telegram_auth_paciente_id', data.data.pacienteId.toString());
  }

  // Retornar solo el contenido de data.data para simplificar el uso
  return data.data;
}

/**
 * Validar token de autenticación Telegram
 * @param {string} token - Token JWT
 * @returns {Promise<{valid: boolean, pacienteId: number}>}
 */
export async function validateToken(token) {
  const data = await fetchApi('/auth/validate-token', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });

  return data;
}

/**
 * Cerrar sesión de Telegram
 * @param {string} token - Token JWT
 * @returns {Promise<{success: boolean}>}
 */
export async function logout(token) {
  const data = await fetchApi('/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });

  // Limpiar localStorage
  localStorage.removeItem('telegram_auth_token');
  localStorage.removeItem('telegram_auth_expires');
  localStorage.removeItem('telegram_auth_paciente_id');

  return data;
}

/**
 * Obtener token almacenado
 */
export function getTelegramToken() {
  return localStorage.getItem('telegram_auth_token');
}

/**
 * Obtener ID de paciente almacenado
 */
export function getTelegramPacienteId() {
  const id = localStorage.getItem('telegram_auth_paciente_id');
  return id ? parseInt(id, 10) : null;
}

/**
 * Verificar si hay sesión activa de Telegram
 */
export function hasTelegramSession() {
  const token = getTelegramToken();
  const expiresAt = localStorage.getItem('telegram_auth_expires');

  if (!token || !expiresAt) {
    return false;
  }

  // Verificar si el token no ha expirado
  const expiryDate = new Date(expiresAt);
  return expiryDate > new Date();
}

/**
 * Obtener datos del paciente autenticado
 * @returns {Promise<object>} Datos del paciente
 */
export async function getAuthenticatedPatient() {
  const token = getTelegramToken();

  if (!token) {
    throw new MessagingBotApiError('No hay token de autenticación', 'NO_TOKEN');
  }

  const response = await fetch(`${MESSAGING_BOT_API_URL}/auth/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new MessagingBotApiError(
      data.error || 'Error al obtener datos del paciente',
      response.status === 401 ? 'INVALID_TOKEN' : 'API_ERROR'
    );
  }

  return data.data.paciente;
}

/**
 * Validar formato de teléfono (venezolano o mexicano)
 * @param {string} phone - Número de teléfono
 * @returns {{valid: boolean, error?: string}}
 */
export function validateVenezuelanPhone(phone) {
  // Eliminar espacios, guiones y paréntesis
  const cleaned = phone.replace(/[\s\-()]/g, '');

  // Regex para Venezuela: +58 0412-1234567 (11-12 dígitos)
  const venezuelaRegex = /^(\+?58)?0?(412|414|424|416|426)\d{7}$/;

  // Regex para México: +52 55 1686 7745 (12-13 dígitos)
  const mexicoRegex = /^(\+?52)?1?\d{10}$/;

  if (venezuelaRegex.test(cleaned)) {
    return { valid: true };
  }

  if (mexicoRegex.test(cleaned)) {
    return { valid: true };
  }

  return {
    valid: false,
    error: 'Formato inválido. Ejemplos válidos:\n• Venezuela: 0412-1234567 o +58412-1234567\n• México: 5512345678 o +525512345678'
  };
}

/**
 * Formatear teléfono para enviar al backend
 * @param {string} phone - Número de teléfono
 * @returns {string} - Teléfono formateado
 */
export function formatPhone(phone) {
  const cleaned = phone.replace(/[\s\-()]/g, '');

  // Detectar si es número mexicano (+52 o empieza con 52 o es 10 dígitos)
  if (cleaned.startsWith('+52') || cleaned.startsWith('52')) {
    // Formato mexicano: +525512345678 o 5512345678
    const withoutPrefix = cleaned.replace(/^\+?52/, '');
    return `+52${withoutPrefix}`;
  }

  // Formato venezolano
  const withoutVenezuelaPrefix = cleaned.replace(/^\+?58/, '');

  // Si no empieza con 0, agregarlo
  const withZero = withoutVenezuelaPrefix.startsWith('0') ? withoutVenezuelaPrefix : '0' + withoutVenezuelaPrefix;

  // Formatear como 0412-1234567
  if (withZero.length === 11) {
    return `${withZero.slice(0, 4)}-${withZero.slice(4)}`;
  }

  return withZero;
}

/**
 * Generar token de autorización de Telegram
 * @param {string} phone - Número de teléfono
 * @returns {Promise<{success: boolean, requiresAuthorization: boolean, telegramLink: string, token: string, expiresIn: number, expiresAt: string}>}
 */
export async function generateAuthorizationToken(phone) {
  const data = await fetchApi('/auth/telegram/generate-authorization-token', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  });

  return data;
}

/**
 * Verificar si el usuario completó la autorización de Telegram
 * @param {string} phone - Número de teléfono
 * @returns {Promise<{success: boolean, isAuthorized: boolean, chatId: string | null}>}
 */
export async function checkAuthorization(phone) {
  const data = await fetchApi(`/auth/telegram/check-authorization?phone=${encodeURIComponent(phone)}`, {
    method: 'GET',
  });

  return data;
}
