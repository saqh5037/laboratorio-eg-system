import { useState, useCallback, useEffect } from 'react';
import {
  getHistoricoMultiple,
  getHeatMapData,
  getPacienteInfo,
} from '../services/resultsApi';
import { calcularHealthScore } from '../utils/healthScoreCalculator';
import { useFiltros } from '../contexts/FiltrosContext';

/**
 * Hook personalizado para obtener y gestionar datos del dashboard de salud
 * @param {Array} resultadosActuales - Resultados de la orden actual
 * @returns {Object} - Estado y funciones para manejar el dashboard
 */
export function useDashboardData(resultadosActuales = []) {
  const [healthScore, setHealthScore] = useState(null);
  const [historicoMultiple, setHistoricoMultiple] = useState(null);
  const [heatMapData, setHeatMapData] = useState(null);
  const [loading, setLoading] = useState({
    score: false,
    multiple: false,
    heatmap: false,
  });
  const [error, setError] = useState(null);

  // Obtener filtros del contexto
  const { obtenerFiltrosAPI } = useFiltros();

  /**
   * Calcular health score basado en resultados actuales
   */
  const calculateHealthScore = useCallback(() => {
    if (!resultadosActuales || resultadosActuales.length === 0) {
      setHealthScore(null);
      return;
    }

    setLoading((prev) => ({ ...prev, score: true }));
    setError(null);

    try {
      const score = calcularHealthScore(resultadosActuales);
      setHealthScore(score);
    } catch (err) {
      console.error('Error al calcular health score:', err);
      setError('Error al calcular score de salud');
      setHealthScore(null);
    } finally {
      setLoading((prev) => ({ ...prev, score: false }));
    }
  }, [resultadosActuales]);

  /**
   * Obtener histórico de múltiples pruebas
   * @param {Array<number>} pruebaIds - Array de IDs de pruebas
   * @param {number} limit - Número de resultados por prueba
   */
  const fetchHistoricoMultiple = useCallback(async (pruebaIds, limit = 10) => {
    if (!pruebaIds || pruebaIds.length === 0) {
      return;
    }

    setLoading((prev) => ({ ...prev, multiple: true }));
    setError(null);

    try {
      const paciente = getPacienteInfo();
      if (!paciente || !paciente.ci_paciente) {
        throw new Error('No hay información del paciente');
      }

      // Obtener filtros activos
      const { fechaDesde, fechaHasta } = obtenerFiltrosAPI();

      const data = await getHistoricoMultiple(
        pruebaIds,
        paciente.ci_paciente,
        limit,
        fechaDesde,
        fechaHasta
      );
      setHistoricoMultiple(data);
      return data;
    } catch (err) {
      console.error('Error al obtener histórico múltiple:', err);
      setError(err.message || 'Error al cargar histórico múltiple');
      setHistoricoMultiple(null);
      throw err;
    } finally {
      setLoading((prev) => ({ ...prev, multiple: false }));
    }
  }, [obtenerFiltrosAPI]);

  /**
   * Obtener datos para heat map
   * @param {number} limit - Número máximo de órdenes
   */
  const fetchHeatMapData = useCallback(async (limit = 10) => {
    setLoading((prev) => ({ ...prev, heatmap: true }));
    setError(null);

    try {
      const paciente = getPacienteInfo();
      if (!paciente || !paciente.ci_paciente) {
        throw new Error('No hay información del paciente');
      }

      // Obtener filtros activos
      const { fechaDesde, fechaHasta } = obtenerFiltrosAPI();

      const data = await getHeatMapData(
        paciente.ci_paciente,
        limit,
        fechaDesde,
        fechaHasta
      );
      setHeatMapData(data);
      return data;
    } catch (err) {
      console.error('Error al obtener heat map data:', err);
      setError(err.message || 'Error al cargar datos de heat map');
      setHeatMapData(null);
      throw err;
    } finally {
      setLoading((prev) => ({ ...prev, heatmap: false }));
    }
  }, [obtenerFiltrosAPI]);

  /**
   * Limpiar datos del dashboard
   */
  const clearDashboardData = useCallback(() => {
    setHealthScore(null);
    setHistoricoMultiple(null);
    setHeatMapData(null);
    setError(null);
  }, []);

  /**
   * Refrescar todos los datos del dashboard
   */
  const refreshDashboard = useCallback(
    async (pruebaIds = null, heatmapLimit = 10) => {
      calculateHealthScore();

      if (pruebaIds && pruebaIds.length > 0) {
        await fetchHistoricoMultiple(pruebaIds);
      }

      await fetchHeatMapData(heatmapLimit);
    },
    [calculateHealthScore, fetchHistoricoMultiple, fetchHeatMapData]
  );

  // Calcular health score automáticamente cuando cambian los resultados
  useEffect(() => {
    calculateHealthScore();
  }, [calculateHealthScore]);

  return {
    // Estado
    healthScore,
    historicoMultiple,
    heatMapData,
    loading,
    error,

    // Funciones
    calculateHealthScore,
    fetchHistoricoMultiple,
    fetchHeatMapData,
    clearDashboardData,
    refreshDashboard,
  };
}

export default useDashboardData;
