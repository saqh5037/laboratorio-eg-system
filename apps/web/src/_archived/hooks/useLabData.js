import { useState, useEffect, useCallback } from 'react';
import {
  processExcelFile,
  buildTreeStructure,
  mergeWithPrices,
  searchStudies,
  getUniqueCategories,
  cacheManager
} from '../utils/excelProcessor';

/**
 * Hook personalizado para cargar y procesar datos del Laboratorio EG
 * @param {Object} options - Opciones de configuración
 * @returns {Object} Estado y funciones para manejar los datos
 */
export const useLabData = (options = {}) => {
  const {
    autoLoad = true,
    useCache = true,
    excelPath = '/recursos/ListadePreciosYArbilEG.xlsx'
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [categories, setCategories] = useState(null);
  const [treeStructure, setTreeStructure] = useState(null);

  /**
   * Carga los datos desde el archivo Excel
   */
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Intentar cargar desde cache primero
      if (useCache) {
        const cachedData = cacheManager.load();
        if (cachedData) {
          console.log('Datos cargados desde cache');
          setData(cachedData);
          processLoadedData(cachedData);
          setLoading(false);
          return cachedData;
        }
      }

      // Cargar archivo Excel
      console.log('Cargando archivo Excel...');
      const response = await fetch(excelPath);
      
      if (!response.ok) {
        throw new Error(`Error al cargar el archivo: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      
      // Procesar el archivo
      const processedData = await processExcelFile(arrayBuffer);
      
      // Combinar con precios
      const estudiosConPrecios = mergeWithPrices(
        processedData.estudios,
        processedData.pruebas,
        processedData.gruposPrueba
      );
      
      const finalData = {
        ...processedData,
        estudios: estudiosConPrecios
      };

      // Guardar en cache
      if (useCache) {
        cacheManager.save(finalData);
      }

      setData(finalData);
      processLoadedData(finalData);
      
      console.log('Datos cargados exitosamente:', {
        estudios: finalData.estudios.length,
        pruebas: finalData.pruebas.length,
        grupos: finalData.gruposPrueba.length
      });

      return finalData;
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [excelPath, useCache]);

  /**
   * Procesa los datos cargados
   */
  const processLoadedData = (loadedData) => {
    if (!loadedData) return;

    // Construir estructura de árbol
    const tree = buildTreeStructure(loadedData.estudios);
    setTreeStructure(tree);

    // Obtener categorías únicas
    const cats = getUniqueCategories(loadedData.estudios);
    setCategories(cats);
  };

  /**
   * Busca estudios según término y filtros
   */
  const search = useCallback((searchTerm, filters = {}) => {
    if (!data) return [];

    const results = searchStudies(data.estudios, searchTerm, filters);
    setSearchResults(results);
    return results;
  }, [data]);

  /**
   * Obtiene un estudio por ID
   */
  const getStudyById = useCallback((id) => {
    if (!data) return null;
    return data.estudios.find(e => e.id === id);
  }, [data]);

  /**
   * Obtiene estudios por categoría
   */
  const getStudiesByCategory = useCallback((category, level = 'tipoEstudio') => {
    if (!data) return [];
    
    return data.estudios.filter(estudio => {
      switch(level) {
        case 'tipoEstudio':
          return estudio.tipoEstudio === category;
        case 'nivel1':
          return estudio.nivel1 === category;
        case 'nivel2':
          return estudio.nivel2 === category;
        case 'nivel3':
          return estudio.nivel3 === category;
        default:
          return false;
      }
    });
  }, [data]);

  /**
   * Obtiene estadísticas de los datos
   */
  const getStats = useCallback(() => {
    if (!data) return null;

    const withPrice = data.estudios.filter(e => e.precio > 0).length;
    const avgPrice = data.estudios
      .filter(e => e.precio > 0)
      .reduce((sum, e) => sum + e.precio, 0) / (withPrice || 1);

    return {
      totalEstudios: data.estudios.length,
      totalPruebas: data.pruebas.length,
      totalGrupos: data.gruposPrueba.length,
      estudiosConPrecio: withPrice,
      precioPromedio: avgPrice.toFixed(2),
      categorias: categories?.tiposEstudio.length || 0
    };
  }, [data, categories]);

  /**
   * Limpia el cache
   */
  const clearCache = useCallback(() => {
    cacheManager.clear();
    console.log('Cache limpiado');
  }, []);

  /**
   * Recarga los datos (forzando nueva carga)
   */
  const reload = useCallback(async () => {
    clearCache();
    return await loadData();
  }, [clearCache, loadData]);

  // Cargar datos automáticamente al montar
  useEffect(() => {
    if (autoLoad && !data && !loading) {
      loadData();
    }
  }, [autoLoad, data, loading, loadData]);

  return {
    // Estado
    data,
    loading,
    error,
    searchResults,
    categories,
    treeStructure,
    
    // Funciones
    loadData,
    search,
    getStudyById,
    getStudiesByCategory,
    getStats,
    clearCache,
    reload,
    
    // Utilidades
    isReady: !loading && !error && data !== null,
    isEmpty: data?.estudios.length === 0
  };
};

/**
 * Hook para buscar estudios con debounce
 */
export const useStudySearch = (delay = 300) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [filters, setFilters] = useState({});
  
  const labData = useLabData();

  // Debounce del término de búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, delay);

    return () => clearTimeout(timer);
  }, [searchTerm, delay]);

  // Ejecutar búsqueda cuando cambie el término debounced
  useEffect(() => {
    if (labData.isReady) {
      labData.search(debouncedTerm, filters);
    }
  }, [debouncedTerm, filters, labData]);

  return {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    results: labData.searchResults,
    loading: labData.loading,
    updateFilter: (key, value) => {
      setFilters(prev => ({
        ...prev,
        [key]: value
      }));
    },
    clearFilters: () => setFilters({}),
    ...labData
  };
};