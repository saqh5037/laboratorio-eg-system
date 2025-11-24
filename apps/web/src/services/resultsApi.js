/**
 * API Client para Results Service
 * Maneja la comunicación con el servicio de resultados de laboratorio
 */

import { config } from '../config/env.js';

const RESULTS_API_URL = config.VITE_RESULTS_API_URL;

class ResultsApiError extends Error {
  constructor(message, code, status) {
    super(message);
    this.name = 'ResultsApiError';
    this.code = code;
    this.status = status;
  }
}

/**
 * Realizar petición HTTP al servicio de resultados
 */
async function fetchApi(endpoint, options = {}) {
  const url = `${RESULTS_API_URL}${endpoint}`;

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
      throw new ResultsApiError(
        data.error || 'Error en la petición',
        data.code,
        response.status
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ResultsApiError) {
      throw error;
    }
    throw new ResultsApiError('Error de conexión con el servidor', 'NETWORK_ERROR', 0);
  }
}

/**
 * Autenticar paciente con código de lealtad y fecha de nacimiento
 */
export async function autenticarPaciente(codigoLealtad, fechaNacimiento) {
  const data = await fetchApi('/auth/verify', {
    method: 'POST',
    body: JSON.stringify({
      codigo_lealtad: codigoLealtad,
      fecha_nacimiento: fechaNacimiento,
    }),
  });

  // Guardar token en localStorage
  if (data.success && data.data.token) {
    localStorage.setItem('results_token', data.data.token);
    localStorage.setItem('results_paciente', JSON.stringify(data.data.paciente));
  }

  return data.data;
}

/**
 * Obtener token almacenado
 */
export function getToken() {
  return localStorage.getItem('results_token');
}

/**
 * Obtener información del paciente almacenada
 */
export function getPacienteInfo() {
  const pacienteStr = localStorage.getItem('results_paciente');
  return pacienteStr ? JSON.parse(pacienteStr) : null;
}

/**
 * Cerrar sesión
 */
export function cerrarSesion() {
  localStorage.removeItem('results_token');
  localStorage.removeItem('results_paciente');
}

/**
 * Verificar si hay sesión activa
 */
export function haySesionActiva() {
  return !!getToken();
}

/**
 * Obtener órdenes del paciente
 */
export async function obtenerOrdenes() {
  const token = getToken();

  if (!token) {
    throw new ResultsApiError('No hay sesión activa', 'NO_AUTH', 401);
  }

  const data = await fetchApi('/resultados/ordenes', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data.data;
}

/**
 * Obtener resultados de una orden específica
 */
export async function obtenerResultadosOrden(numeroOrden) {
  const token = getToken();

  if (!token) {
    throw new ResultsApiError('No hay sesión activa', 'NO_AUTH', 401);
  }

  const data = await fetchApi(`/resultados/orden/${numeroOrden}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data.data;
}

/**
 * Obtener resultados de una orden específica CON histórico de últimos 3
 */
export async function obtenerResultadosOrdenConHistorico(numeroOrden) {
  const token = getToken();

  if (!token) {
    throw new ResultsApiError('No hay sesión activa', 'NO_AUTH', 401);
  }

  const data = await fetchApi(`/resultados/orden/${numeroOrden}/con-historico`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data.data;
}

/**
 * Descargar PDF de resultados de una orden específica
 */
export async function descargarPDFResultados(numeroOrden) {
  const token = getToken();

  if (!token) {
    throw new ResultsApiError('No hay sesión activa', 'NO_AUTH', 401);
  }

  const url = `${RESULTS_API_URL}/resultados/orden/${numeroOrden}/pdf`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      // Intentar leer como JSON, pero si falla, usar texto
      let errorMessage = 'Error al descargar PDF';
      let errorCode = 'PDF_ERROR';

      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          errorMessage = data.error || errorMessage;
          errorCode = data.code || errorCode;
        } else {
          const text = await response.text();
          errorMessage = text || errorMessage;
        }
      } catch (e) {
        console.error('Error al leer respuesta de error PDF:', e);
      }

      throw new ResultsApiError(errorMessage, errorCode, response.status);
    }

    // Obtener el blob del PDF
    const blob = await response.blob();

    // Crear un enlace temporal para descargar
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `Resultados_${numeroOrden}.pdf`;
    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    // Liberar el objeto URL
    window.URL.revokeObjectURL(downloadUrl);

    return true;
  } catch (error) {
    console.error('Error al descargar PDF:', error);
    if (error instanceof ResultsApiError) {
      throw error;
    }
    throw new ResultsApiError('Error de conexión con el servidor', 'NETWORK_ERROR', 0);
  }
}

/**
 * Obtener histórico de resultados de una prueba específica
 * @param {number} pruebaId - ID de la prueba
 * @param {string} pacienteCi - Cédula del paciente
 * @param {number} limit - Número máximo de resultados (default: 10)
 */
export async function getHistoricoResultados(pruebaId, pacienteCi, limit = 10) {
  const token = getToken();

  if (!token) {
    throw new ResultsApiError('No hay sesión activa', 'NO_AUTH', 401);
  }

  const data = await fetchApi(`/resultados/historico/${pruebaId}/${pacienteCi}?limit=${limit}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data.data;
}

/**
 * Obtener histórico de múltiples pruebas para comparación
 * @param {Array<number>} pruebaIds - Array de IDs de pruebas
 * @param {string} pacienteCi - Cédula del paciente
 * @param {number} limit - Número máximo de resultados por prueba (default: 10)
 * @param {string} fechaDesde - Fecha inicio (opcional, formato: YYYY-MM-DD)
 * @param {string} fechaHasta - Fecha fin (opcional, formato: YYYY-MM-DD)
 */
export async function getHistoricoMultiple(pruebaIds, pacienteCi, limit = 10, fechaDesde = null, fechaHasta = null) {
  const token = getToken();

  if (!token) {
    throw new ResultsApiError('No hay sesión activa', 'NO_AUTH', 401);
  }

  // Convertir array a string separado por comas
  const pruebaIdsString = Array.isArray(pruebaIds) ? pruebaIds.join(',') : pruebaIds;

  // Construir query params
  let queryParams = `prueba_ids=${pruebaIdsString}&limit=${limit}`;
  if (fechaDesde) queryParams += `&fecha_desde=${fechaDesde}`;
  if (fechaHasta) queryParams += `&fecha_hasta=${fechaHasta}`;

  const data = await fetchApi(
    `/resultados/historico-multiple/${pacienteCi}?${queryParams}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return data.data;
}

/**
 * Obtener datos para heat map de histórico
 * @param {string} pacienteCi - Cédula del paciente
 * @param {number} limit - Número máximo de órdenes (default: 10)
 * @param {string} fechaDesde - Fecha inicio (opcional, formato: YYYY-MM-DD)
 * @param {string} fechaHasta - Fecha fin (opcional, formato: YYYY-MM-DD)
 */
export async function getHeatMapData(pacienteCi, limit = 10, fechaDesde = null, fechaHasta = null) {
  const token = getToken();

  if (!token) {
    throw new ResultsApiError('No hay sesión activa', 'NO_AUTH', 401);
  }

  // Construir query params
  let queryParams = `limit=${limit}`;
  if (fechaDesde) queryParams += `&fecha_desde=${fechaDesde}`;
  if (fechaHasta) queryParams += `&fecha_hasta=${fechaHasta}`;

  const data = await fetchApi(`/resultados/heatmap/${pacienteCi}?${queryParams}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return data.data;
}

/**
 * Manejar errores de autenticación
 */
export function manejarErrorAuth(error) {
  if (error.code === 'TOKEN_EXPIRED' || error.code === 'TOKEN_INVALID' || error.status === 401) {
    cerrarSesion();
    return true;
  }
  return false;
}

export default {
  autenticarPaciente,
  obtenerOrdenes,
  obtenerResultadosOrden,
  obtenerResultadosOrdenConHistorico,
  descargarPDFResultados,
  getHistoricoResultados,
  getHistoricoMultiple,
  getHeatMapData,
  getToken,
  getPacienteInfo,
  cerrarSesion,
  haySesionActiva,
  manejarErrorAuth,
  ResultsApiError,
};
