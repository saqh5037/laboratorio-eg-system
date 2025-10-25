import { useState, useCallback } from 'react';
import { getHistoricoResultados } from '../services/resultsApi';

/**
 * Hook personalizado para obtener histórico de resultados de una prueba específica
 * @returns {Object} - Estado y funciones para manejar el histórico
 */
export function useHistorico() {
  const [historico, setHistorico] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Obtener histórico de resultados
   * @param {number} pruebaId - ID de la prueba
   * @param {string} pacienteCi - Cédula del paciente
   * @param {number} limit - Número de resultados (default: 10)
   */
  const fetchHistorico = useCallback(async (pruebaId, pacienteCi, limit = 10) => {
    setLoading(true);
    setError(null);

    try {
      const data = await getHistoricoResultados(pruebaId, pacienteCi, limit);
      setHistorico(data);
      return data;
    } catch (err) {
      console.error('Error al obtener histórico:', err);
      setError(err.message || 'Error al cargar histórico de resultados');
      setHistorico(null);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Limpiar histórico
   */
  const clearHistorico = useCallback(() => {
    setHistorico(null);
    setError(null);
  }, []);

  return {
    historico,
    loading,
    error,
    fetchHistorico,
    clearHistorico
  };
}
