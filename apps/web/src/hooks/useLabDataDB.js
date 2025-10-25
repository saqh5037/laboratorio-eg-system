import { useState, useEffect, useCallback } from 'react';

/**
 * Hook personalizado para cargar datos desde la base de datos PostgreSQL
 * Configurado para usar la lista de precios ID 27 (Ambulatorio Abril 2025)
 */
export const useLabData = (options = {}) => {
  const {
    autoLoad = true,
    useCache = true,
    // Detectar si estamos en desarrollo y usar la IP correcta
    apiUrl = import.meta.env.VITE_API_URL || 
             (window.location.hostname === 'localhost' 
               ? 'http://localhost:3001/api' 
               : `http://${window.location.hostname}:3001/api`)
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [categories, setCategories] = useState(null);
  const [treeStructure, setTreeStructure] = useState(null);

  /**
   * Carga los datos desde el JSON local
   */
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Cargando datos desde JSON local...');

      // Cargar JSON local generado por sync-service
      const response = await fetch('/data/precios.json');

      if (!response.ok) {
        throw new Error('No se pudo cargar el archivo de precios');
      }

      const jsonData = await response.json();

      console.log('JSON cargado (v2.0 - con tipo_item):', {
        totalEstudios: jsonData.metadata?.totalEstudios || jsonData.estudios.length,
        timestamp: jsonData.metadata?.fechaSincronizacion,
        version: jsonData.metadata?.version
      });

      // Separar pruebas y grupos basado en tipo_item del JSON
      const pruebas = jsonData.estudios.filter(e => e.tipo_item === 'prueba');
      const grupos = jsonData.estudios.filter(e => e.tipo_item === 'grupo');

      // Formatear datos para compatibilidad con el componente
      const estudios = jsonData.estudios.map(e => {
        const esPrueba = e.tipo_item === 'prueba';
        const esGrupo = e.tipo_item === 'grupo';

        return {
          id: `${esPrueba ? 'prueba' : 'grupo'}-${e.id}`,
          codigo: e.codigo || '',
          nombre: e.nombre,
          tipoEstudio: e.tipoEstudio || (esPrueba ? 'Prueba Individual' : 'Perfil/Paquete'),
          nivel1: e.categoria || 'Sin categoría',
          nivel2: '',
          nivel3: '',
          precio: parseFloat(e.precio || 0),
          searchText: `${e.nombre} ${e.codigo || ''} ${e.descripcion || ''}`.toLowerCase(),
          tipo: esPrueba ? 'prueba' : 'grupo',
          tipo_item: e.tipo_item,
          area: e.categoria,
          area_nombre: e.categoria,
          categoria: e.categoria,
          descripcion: e.descripcion || '',
          requiereAyuno: e.requiereAyuno || false,
          tiempoEntrega: e.tiempoEntrega || 0,
          activo: e.activo !== false,
          fechaActualizacion: e.fechaActualizacion || new Date().toISOString(),
          // Información de muestra y contenedor (solo para pruebas)
          tipoMuestra: e.tipoMuestra,
          codigoMuestra: e.codigoMuestra,
          tipoContenedor: e.tipoContenedor,
          abrevContenedor: e.abrevContenedor,
          colorContenedor: e.colorContenedor,
          metodologia: e.metodologia,
          valoresNormales: e.valoresNormales,
          // Ficha Técnica - Nuevos campos
          diasProceso: e.diasProceso || [],
          valoresReferenciales: e.valoresReferenciales || [],
          fichaTecnica: e.fichaTecnica || {},
          infoTomaMuestra: e.fichaTecnica?.infoTomaMuestra || e.info_toma_muestra,
          criteriosRechazo: e.fichaTecnica?.criteriosRechazo || e.criterios_rechazo,
          volumenMinimo: e.fichaTecnica?.volumenMinimo || e.volumen_minimo,
          diasEstabilidad: e.fichaTecnica?.diasEstabilidad || e.dias_estabilidad,
          // Para grupos: incluir las pruebas que contiene
          pruebas: esGrupo ? (e.pruebas || []) : undefined,
          cantidadPruebas: esGrupo ? (e.totalPruebas || 0) : undefined,
          pruebasReportables: esGrupo ? (e.pruebasReportables || 0) : undefined
        };
      });

      const finalData = {
        estudios,
        pruebas: pruebas.map(p => ({
          id: p.id,
          nombre: p.nombre,
          codigo: p.codigo,
          nomenclatura: p.codigo,
          precio: p.precio,
          precio_lista: p.precio,
          area_nombre: p.categoria,
          descripcion: p.descripcion
        })),
        gruposPrueba: grupos.map(g => ({
          id: g.id,
          nombre: g.nombre,
          codigo: g.codigo,
          codigo_caja: g.codigo,
          precio: g.precio,
          precio_lista: g.precio,
          area_nombre: g.categoria,
          descripcion: g.descripcion,
          cantidad_pruebas: 0
        })),
        areas: [],
        totalPruebas: jsonData.metadata?.totalPruebas || pruebas.length,
        totalGrupos: jsonData.metadata?.totalGrupos || grupos.length,
        totalEstudios: jsonData.metadata?.totalEstudios || estudios.length,
        fechaSincronizacion: jsonData.metadata?.fechaSincronizacion,
        version: jsonData.metadata?.version
      };

      console.log('📊 Data loaded successfully:', {
        totalEstudios: finalData.estudios.length,
        estudiosArray: finalData.estudios,
        sampleEstudio: finalData.estudios[0]
      });

      // Guardar en cache si está habilitado
      if (useCache) {
        localStorage.setItem('labdata_cache', JSON.stringify({
          data: finalData,
          timestamp: Date.now()
        }));
      }

      setData(finalData);
      processLoadedData(finalData);

      console.log('✅ Datos cargados exitosamente:', {
        estudios: finalData.estudios.length,
        pruebas: finalData.pruebas.length,
        grupos: finalData.gruposPrueba.length,
        fechaSync: finalData.fechaSincronizacion
      });

      return finalData;
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError(err.message);

      // Intentar cargar desde cache si hay error
      if (useCache) {
        const cached = localStorage.getItem('labdata_cache');
        if (cached) {
          const { data: cachedData } = JSON.parse(cached);
          setData(cachedData);
          processLoadedData(cachedData);
          console.log('⚠️ Datos cargados desde cache debido a error');
          return cachedData;
        }
      }

      return null;
    } finally {
      setLoading(false);
    }
  }, [useCache]);

  /**
   * Procesa los datos cargados
   */
  const processLoadedData = (loadedData) => {
    if (!loadedData) return;

    // Construir estructura de árbol simple
    const tree = {
      'Pruebas Individuales': loadedData.estudios.filter(e => e.tipo === 'prueba'),
      'Perfiles/Paquetes': loadedData.estudios.filter(e => e.tipo === 'grupo')
    };
    setTreeStructure(tree);

    // Obtener categorías únicas
    const cats = {
      tiposEstudio: ['Prueba Individual', 'Perfil/Paquete'],
      nivel1: [...new Set(loadedData.estudios.map(e => e.nivel1).filter(Boolean))],
      nivel2: [...new Set(loadedData.estudios.map(e => e.nivel2).filter(Boolean))]
    };
    setCategories(cats);
  };

  /**
   * Busca estudios según término y filtros (búsqueda local)
   */
  const search = useCallback(async (searchTerm, filters = {}) => {
    if (!data) {
      setSearchResults([]);
      return [];
    }

    if (!searchTerm || searchTerm.length < 2) {
      setSearchResults(data.estudios || []);
      return data.estudios || [];
    }

    // Búsqueda local en memoria
    const searchLower = searchTerm.toLowerCase();
    const results = data.estudios.filter(e =>
      e.searchText && e.searchText.includes(searchLower)
    );

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
        case 'tipo':
          return estudio.tipo === category;
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
      totalEstudios: data.totalEstudios || data.estudios.length,
      totalPruebas: data.totalPruebas || 348,
      totalGrupos: data.totalGrupos || 163,
      estudiosConPrecio: withPrice,
      precioPromedio: avgPrice.toFixed(2),
      categorias: categories?.tiposEstudio.length || 2
    };
  }, [data, categories]);

  /**
   * Limpia el cache
   */
  const clearCache = useCallback(() => {
    localStorage.removeItem('labdata_cache');
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