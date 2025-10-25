import { createContext, useContext, useState, useCallback } from 'react';
import { subMonths, format } from 'date-fns';

/**
 * Contexto para manejar filtros globales del dashboard
 */
const FiltrosContext = createContext();

/**
 * Hook para usar el contexto de filtros
 */
export function useFiltros() {
  const context = useContext(FiltrosContext);
  if (!context) {
    throw new Error('useFiltros debe ser usado dentro de un FiltrosProvider');
  }
  return context;
}

/**
 * Provider del contexto de filtros
 */
export function FiltrosProvider({ children }) {
  // Estado de los filtros
  const [fechaDesde, setFechaDesde] = useState(null);
  const [fechaHasta, setFechaHasta] = useState(null);
  const [preset, setPreset] = useState('todo'); // 'todo', '3meses', '6meses', '1ano', 'personalizado'

  /**
   * Aplicar preset de fecha
   */
  const aplicarPreset = useCallback((presetNombre) => {
    const hoy = new Date();
    const hoyStr = format(hoy, 'yyyy-MM-dd');

    switch (presetNombre) {
      case '3meses':
        setFechaDesde(format(subMonths(hoy, 3), 'yyyy-MM-dd'));
        setFechaHasta(hoyStr);
        setPreset('3meses');
        break;
      case '6meses':
        setFechaDesde(format(subMonths(hoy, 6), 'yyyy-MM-dd'));
        setFechaHasta(hoyStr);
        setPreset('6meses');
        break;
      case '1ano':
        setFechaDesde(format(subMonths(hoy, 12), 'yyyy-MM-dd'));
        setFechaHasta(hoyStr);
        setPreset('1ano');
        break;
      case 'todo':
      default:
        setFechaDesde(null);
        setFechaHasta(null);
        setPreset('todo');
        break;
    }
  }, []);

  /**
   * Establecer rango personalizado
   */
  const establecerRangoPersonalizado = useCallback((desde, hasta) => {
    setFechaDesde(desde);
    setFechaHasta(hasta);
    setPreset('personalizado');
  }, []);

  /**
   * Limpiar filtros
   */
  const limpiarFiltros = useCallback(() => {
    setFechaDesde(null);
    setFechaHasta(null);
    setPreset('todo');
  }, []);

  /**
   * Obtener filtros en formato API
   */
  const obtenerFiltrosAPI = useCallback(() => {
    return {
      fechaDesde: fechaDesde || null,
      fechaHasta: fechaHasta || null,
    };
  }, [fechaDesde, fechaHasta]);

  /**
   * Verificar si hay filtros activos
   */
  const hayFiltrosActivos = useCallback(() => {
    return fechaDesde !== null || fechaHasta !== null;
  }, [fechaDesde, fechaHasta]);

  const value = {
    // Estado
    fechaDesde,
    fechaHasta,
    preset,

    // Setters básicos
    setFechaDesde,
    setFechaHasta,

    // Funciones
    aplicarPreset,
    establecerRangoPersonalizado,
    limpiarFiltros,
    obtenerFiltrosAPI,
    hayFiltrosActivos,
  };

  return <FiltrosContext.Provider value={value}>{children}</FiltrosContext.Provider>;
}

export default FiltrosContext;
