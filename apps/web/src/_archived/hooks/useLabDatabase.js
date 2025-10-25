// Hook personalizado para gestión de conexiones a la base de datos Labsis
// Manejo de estados, retry logic y fallback a datos cacheados

import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

// Configuración del cliente API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Configurar axios defaults
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.timeout = 10000;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Interceptor para manejo de errores global
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
    } else if (error.response?.status === 503) {
      console.error('Database unavailable, using cached data');
    }
    return Promise.reject(error);
  }
);

// Hook principal para consultas a la base de datos
export const useLabDatabase = (endpoint, options = {}) => {
  const {
    params = {},
    enabled = true,
    refetchInterval = null,
    onSuccess = null,
    onError = null,
    retry = 3,
    retryDelay = 1000,
    useCache = true,
    fallbackData = null
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFromCache, setIsFromCache] = useState(false);
  const [isFromFallback, setIsFromFallback] = useState(false);
  
  const abortControllerRef = useRef(null);
  const retryCountRef = useRef(0);
  const intervalRef = useRef(null);

  // Función para hacer fetch con retry logic
  const fetchData = useCallback(async () => {
    if (!enabled || !endpoint) return;

    // Cancelar request anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Crear nuevo AbortController
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);
    setIsFromCache(false);
    setIsFromFallback(false);

    const attemptFetch = async (attemptNumber = 1) => {
      try {
        const response = await axios.get(endpoint, {
          params: useCache ? params : { ...params, noCache: true },
          signal: abortControllerRef.current.signal
        });

        // Verificar headers de caché
        const cacheStatus = response.headers['x-cache'];
        if (cacheStatus === 'HIT') {
          setIsFromCache(true);
        }

        // Verificar si los datos son de fallback
        if (response.data?.data?._isFallback) {
          setIsFromFallback(true);
        }

        setData(response.data?.data || response.data);
        setLoading(false);
        retryCountRef.current = 0;

        // Callback de éxito
        if (onSuccess) {
          onSuccess(response.data);
        }

        return response.data;
      } catch (err) {
        // Si fue cancelado, no hacer nada
        if (axios.isCancel(err)) {
          return;
        }

        // Si quedan reintentos
        if (attemptNumber < retry) {
          console.log(`Retry attempt ${attemptNumber} of ${retry} for ${endpoint}`);
          retryCountRef.current = attemptNumber;
          
          // Esperar antes de reintentar (exponential backoff)
          await new Promise(resolve => 
            setTimeout(resolve, retryDelay * Math.pow(2, attemptNumber - 1))
          );
          
          return attemptFetch(attemptNumber + 1);
        }

        // Si no quedan reintentos, usar fallback si está disponible
        if (fallbackData) {
          console.log('Using fallback data');
          setData(fallbackData);
          setIsFromFallback(true);
          setLoading(false);
          return fallbackData;
        }

        // Error final
        setError(err.response?.data?.error || err.message);
        setLoading(false);

        // Callback de error
        if (onError) {
          onError(err);
        }
      }
    };

    return attemptFetch();
  }, [endpoint, params, enabled, retry, retryDelay, useCache, fallbackData, onSuccess, onError]);

  // Refetch manual
  const refetch = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  // Efecto para fetch inicial
  useEffect(() => {
    fetchData();

    // Cleanup
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  // Efecto para refetch interval
  useEffect(() => {
    if (refetchInterval && refetchInterval > 0) {
      intervalRef.current = setInterval(() => {
        fetchData();
      }, refetchInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [refetchInterval, fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
    isFromCache,
    isFromFallback,
    retryCount: retryCountRef.current
  };
};

// Hook para búsqueda con debounce
export const useLabSearch = (searchTerm, options = {}) => {
  const {
    minLength = 2,
    debounceMs = 300,
    includeGroups = true,
    includePruebas = true,
    limit = 100
  } = options;

  const [results, setResults] = useState({ pruebas: [], grupos: [] });
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  
  const debounceTimerRef = useRef(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    // Limpiar resultados si el término es muy corto
    if (!searchTerm || searchTerm.length < minLength) {
      setResults({ pruebas: [], grupos: [] });
      setSearching(false);
      return;
    }

    // Cancelar búsqueda anterior
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Limpiar timer anterior
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setSearching(true);

    // Configurar debounce
    debounceTimerRef.current = setTimeout(async () => {
      abortControllerRef.current = new AbortController();

      try {
        const response = await axios.get('/search', {
          params: {
            q: searchTerm,
            include_groups: includeGroups,
            include_pruebas: includePruebas,
            limit
          },
          signal: abortControllerRef.current.signal
        });

        setResults(response.data.data);
        setError(null);
      } catch (err) {
        if (!axios.isCancel(err)) {
          setError(err.message);
          console.error('Search error:', err);
        }
      } finally {
        setSearching(false);
      }
    }, debounceMs);

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [searchTerm, minLength, debounceMs, includeGroups, includePruebas, limit]);

  return {
    results,
    searching,
    error,
    hasResults: results.pruebas.length > 0 || results.grupos.length > 0
  };
};

// Hook para obtener estadísticas
export const useLabStatistics = (options = {}) => {
  const { refetchInterval = 60000 } = options; // Refetch cada minuto por defecto

  return useLabDatabase('/statistics', {
    refetchInterval,
    fallbackData: {
      total_pruebas: 0,
      total_grupos: 0,
      total_areas: 0,
      total_listas_precios: 0,
      total_tipos_muestra: 0
    }
  });
};

// Hook para obtener prueba por ID
export const usePrueba = (id, options = {}) => {
  const { includePrice = false, listaPreciosId = 1 } = options;

  return useLabDatabase(id ? `/pruebas/${id}` : null, {
    params: {
      include_price: includePrice,
      lista_precios_id: listaPreciosId
    },
    enabled: !!id
  });
};

// Hook para obtener grupo por ID
export const useGrupoPrueba = (id, options = {}) => {
  const { includePrice = false, listaPreciosId = 1 } = options;

  return useLabDatabase(id ? `/grupos/${id}` : null, {
    params: {
      include_price: includePrice,
      lista_precios_id: listaPreciosId
    },
    enabled: !!id
  });
};

// Hook para obtener áreas
export const useAreas = () => {
  return useLabDatabase('/areas', {
    fallbackData: []
  });
};

// Hook para obtener tipos de muestra
export const useTiposMuestra = () => {
  return useLabDatabase('/tipos-muestra', {
    fallbackData: []
  });
};

// Hook para gestión de caché
export const useCacheManagement = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const getStats = useCallback(async () => {
    try {
      const response = await axios.get('/cache/stats');
      setStats(response.data.data);
      return response.data.data;
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return null;
    }
  }, []);

  const invalidateCache = useCallback(async (pattern) => {
    setLoading(true);
    try {
      const response = await axios.post('/cache/invalidate', { pattern });
      await getStats(); // Actualizar stats después de invalidar
      return response.data;
    } catch (error) {
      console.error('Error invalidating cache:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [getStats]);

  const flushCache = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.post('/cache/flush');
      await getStats(); // Actualizar stats después de flush
      return response.data;
    } catch (error) {
      console.error('Error flushing cache:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [getStats]);

  const warmUpCache = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.post('/cache/warm-up');
      await getStats(); // Actualizar stats después de warm-up
      return response.data;
    } catch (error) {
      console.error('Error warming up cache:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [getStats]);

  // Obtener stats iniciales
  useEffect(() => {
    getStats();
  }, [getStats]);

  return {
    stats,
    loading,
    getStats,
    invalidateCache,
    flushCache,
    warmUpCache
  };
};

// Hook para health check
export const useHealthCheck = (interval = 30000) => {
  const [health, setHealth] = useState(null);
  const [isHealthy, setIsHealthy] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await axios.get('/health');
        setHealth(response.data);
        setIsHealthy(response.data.status === 'healthy');
      } catch (error) {
        setIsHealthy(false);
        setHealth({ status: 'unhealthy', error: error.message });
      }
    };

    checkHealth();
    const intervalId = setInterval(checkHealth, interval);

    return () => clearInterval(intervalId);
  }, [interval]);

  return { health, isHealthy };
};

// Exportar axios configurado para uso directo
export const labAPI = axios;

export default useLabDatabase;