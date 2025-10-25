import { useState, useEffect, useMemo, useCallback } from 'react';
import Fuse from 'fuse.js';

/**
 * Hook para búsqueda avanzada con Fuse.js
 */
export const useAdvancedSearch = (data, options = {}) => {
  const {
    keys = ['nombre', 'codigo', 'tipoEstudio', 'searchText'],
    threshold = 0.3,
    includeScore = true,
    includeMatches = true,
    minMatchCharLength = 2,
    useExtendedSearch = true,
    debounceDelay = 300
  } = options;

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [filters, setFilters] = useState({
    tipoEstudio: '',
    nivel1: '',
    nivel2: '',
    priceMin: null,
    priceMax: null,
    hasPrice: null
  });
  const [searchHistory, setSearchHistory] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Configuración de Fuse
  const fuseOptions = {
    keys,
    threshold,
    includeScore,
    includeMatches,
    minMatchCharLength,
    useExtendedSearch,
    ignoreLocation: true,
    shouldSort: true,
    findAllMatches: true,
    location: 0,
    distance: 100
  };

  // Crear instancia de Fuse
  const fuse = useMemo(() => {
    if (!data || data.length === 0) return null;
    return new Fuse(data, fuseOptions);
  }, [data, JSON.stringify(fuseOptions)]);

  // Debounce para la búsqueda
  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setIsSearching(false);
    }, debounceDelay);

    return () => clearTimeout(timer);
  }, [searchQuery, debounceDelay]);

  // Cargar historial desde localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('search_history_lab_eg');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Guardar búsqueda en historial
  const saveToHistory = useCallback((query) => {
    if (!query || query.length < 3) return;
    
    setSearchHistory(prev => {
      const newHistory = [
        query,
        ...prev.filter(h => h !== query)
      ].slice(0, 10); // Mantener solo las últimas 10 búsquedas
      
      localStorage.setItem('search_history_lab_eg', JSON.stringify(newHistory));
      return newHistory;
    });
  }, []);


  // Aplicar filtros a los resultados
  const applyFilters = (results, filters) => {
    let filtered = [...results];

    // Filtro por tipo de estudio
    if (filters.tipoEstudio) {
      filtered = filtered.filter(item => 
        item.tipoEstudio === filters.tipoEstudio
      );
    }

    // Filtro por nivel 1
    if (filters.nivel1) {
      filtered = filtered.filter(item => 
        item.nivel1 === filters.nivel1
      );
    }

    // Filtro por nivel 2
    if (filters.nivel2) {
      filtered = filtered.filter(item => 
        item.nivel2 === filters.nivel2
      );
    }

    // Filtro por rango de precio
    if (filters.priceMin !== null || filters.priceMax !== null) {
      filtered = filtered.filter(item => {
        const price = item.precio || 0;
        if (filters.priceMin !== null && price < filters.priceMin) return false;
        if (filters.priceMax !== null && price > filters.priceMax) return false;
        return true;
      });
    }

    // Filtro por disponibilidad de precio
    if (filters.hasPrice !== null) {
      filtered = filtered.filter(item => 
        filters.hasPrice ? (item.precio && item.precio > 0) : (!item.precio || item.precio === 0)
      );
    }

    return filtered;
  };

  // Actualizar sugerencias cuando cambie el query
  useEffect(() => {
    if (!fuse || !searchQuery || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const results = fuse.search(searchQuery, { limit: 5 });
    const suggs = results.map(r => ({
      text: r.item.nombre,
      codigo: r.item.codigo,
      tipo: r.item.tipoEstudio
    }));

    setSuggestions(suggs);
  }, [fuse, searchQuery]);

  // Resultados de búsqueda
  const searchResults = useMemo(() => {
    // Si no hay datos, retornar array vacío
    if (!data || data.length === 0) return [];

    let results = data;

    // Búsqueda con Fuse si hay query Y fuse está listo
    if (fuse && debouncedQuery && debouncedQuery.trim()) {
      const fuseResults = fuse.search(debouncedQuery);
      results = fuseResults.map(result => ({
        ...result.item,
        score: result.score,
        matches: result.matches
      }));
    }

    // Aplicar filtros
    results = applyFilters(results, filters);

    return results;
  }, [fuse, data, debouncedQuery, filters]);

  // Guardar en historial cuando cambie el query debounced
  useEffect(() => {
    if (debouncedQuery && debouncedQuery.trim()) {
      saveToHistory(debouncedQuery);
    }
  }, [debouncedQuery, saveToHistory]);

  // Limpiar búsqueda
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setDebouncedQuery('');
    setFilters({
      tipoEstudio: '',
      nivel1: '',
      nivel2: '',
      priceMin: null,
      priceMax: null,
      hasPrice: null
    });
    setSuggestions([]);
  }, []);

  // Actualizar un filtro específico
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Remover un filtro específico
  const removeFilter = useCallback((key) => {
    setFilters(prev => ({
      ...prev,
      [key]: key.includes('price') || key === 'hasPrice' ? null : ''
    }));
  }, []);

  // Obtener filtros activos para mostrar como chips
  const activeFilters = useMemo(() => {
    const active = [];
    
    if (filters.tipoEstudio) {
      active.push({ key: 'tipoEstudio', label: 'Tipo', value: filters.tipoEstudio });
    }
    if (filters.nivel1) {
      active.push({ key: 'nivel1', label: 'Nivel 1', value: filters.nivel1 });
    }
    if (filters.nivel2) {
      active.push({ key: 'nivel2', label: 'Nivel 2', value: filters.nivel2 });
    }
    if (filters.priceMin !== null) {
      active.push({ key: 'priceMin', label: 'Precio mín', value: `$${filters.priceMin}` });
    }
    if (filters.priceMax !== null) {
      active.push({ key: 'priceMax', label: 'Precio máx', value: `$${filters.priceMax}` });
    }
    if (filters.hasPrice !== null) {
      active.push({ 
        key: 'hasPrice', 
        label: 'Precio', 
        value: filters.hasPrice ? 'Con precio' : 'Sin precio' 
      });
    }
    
    return active;
  }, [filters]);

  // Estadísticas de búsqueda
  const stats = useMemo(() => {
    const withPrice = searchResults.filter(r => r.precio && r.precio > 0).length;
    const avgScore = searchResults.reduce((acc, r) => acc + (r.score || 0), 0) / (searchResults.length || 1);
    
    return {
      total: searchResults.length,
      withPrice,
      withoutPrice: searchResults.length - withPrice,
      avgRelevance: (1 - avgScore) * 100 // Convertir score a porcentaje de relevancia
    };
  }, [searchResults]);

  return {
    // Estados
    searchQuery,
    setSearchQuery,
    filters,
    searchResults,
    suggestions,
    searchHistory,
    activeFilters,
    isSearching,
    stats,
    
    // Funciones
    updateFilter,
    removeFilter,
    clearSearch,
    saveToHistory,
    
    // Utilidades
    hasActiveFilters: activeFilters.length > 0,
    hasResults: searchResults.length > 0
  };
};

/**
 * Función para resaltar coincidencias en el texto
 */
export const highlightMatches = (text, matches) => {
  if (!matches || matches.length === 0) return text;
  
  let highlighted = text;
  const sortedMatches = [...matches].sort((a, b) => b.indices[0][0] - a.indices[0][0]);
  
  sortedMatches.forEach(match => {
    match.indices.forEach(([start, end]) => {
      const before = highlighted.substring(0, start);
      const matched = highlighted.substring(start, end + 1);
      const after = highlighted.substring(end + 1);
      highlighted = `${before}<mark class="bg-yellow-200 text-gray-900">${matched}</mark>${after}`;
    });
  });
  
  return highlighted;
};