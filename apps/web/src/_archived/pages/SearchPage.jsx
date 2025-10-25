import { useState, useEffect } from 'react';
import { useUnifiedApp } from '../contexts/UnifiedAppContext';
import { Search, Filter, X, Clock, TrendingUp } from 'lucide-react';
import StudyCard from '../components/StudyCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Página de búsqueda avanzada con filtros y resultados en tiempo real
 */
function SearchPage() {
  const {
    studies,
    loading,
    searchQuery,
    setSearchQuery,
    searchHistory,
    filters,
    applyFilters,
    resetFilters,
    performSearch,
    clearSearchHistory,
    viewMode,
    setViewMode,
    areas
  } = useUnifiedApp();

  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Debounce para búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localQuery !== searchQuery) {
        performSearch(localQuery);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [localQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    performSearch(localQuery);
  };

  const handleHistoryClick = (query) => {
    setLocalQuery(query);
    setShowHistory(false);
    performSearch(query);
  };

  const handleFilterChange = (filterName, value) => {
    applyFilters({ [filterName]: value });
  };

  const activeFiltersCount = Object.values(filters).filter(
    v => v && v !== '' && (Array.isArray(v) ? v.length > 0 : true)
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header de búsqueda */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={localQuery}
                  onChange={(e) => setLocalQuery(e.target.value)}
                  onFocus={() => setShowHistory(true)}
                  placeholder="Buscar estudios, análisis, perfiles..."
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eg-purple focus:border-transparent"
                />
                {localQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setLocalQuery('');
                      setSearchQuery('');
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-lg border ${
                  showFilters ? 'bg-eg-purple text-white' : 'bg-white text-gray-700'
                } hover:shadow-md transition-all relative`}
              >
                <Filter className="w-5 h-5" />
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              <button
                type="submit"
                className="px-6 py-2 bg-eg-purple text-white rounded-lg hover:bg-eg-purple/90 transition-colors"
              >
                Buscar
              </button>
            </div>

            {/* Historial de búsqueda */}
            <AnimatePresence>
              {showHistory && searchHistory.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
                >
                  <div className="p-3 border-b border-gray-100 flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Búsquedas recientes</span>
                    <button
                      onClick={clearSearchHistory}
                      className="text-xs text-gray-500 hover:text-red-600"
                    >
                      Limpiar
                    </button>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {searchHistory.map((query, index) => (
                      <button
                        key={index}
                        onClick={() => handleHistoryClick(query)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{query}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>
      </div>

      {/* Panel de filtros */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white border-b shadow-sm"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {/* Filtro por área */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Área
                  </label>
                  <select
                    value={filters.area}
                    onChange={(e) => handleFilterChange('area', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-eg-purple focus:border-eg-purple"
                  >
                    <option value="">Todas las áreas</option>
                    {areas.map(area => (
                      <option key={area.id} value={area.nombre}>
                        {area.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtro por precio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rango de precio
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.priceRange[0]}
                      onChange={(e) => handleFilterChange('priceRange', [Number(e.target.value), filters.priceRange[1]])}
                      className="w-1/2 px-2 py-2 border border-gray-300 rounded-md text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.priceRange[1]}
                      onChange={(e) => handleFilterChange('priceRange', [filters.priceRange[0], Number(e.target.value)])}
                      className="w-1/2 px-2 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </div>

                {/* Filtro por preparación */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preparación
                  </label>
                  <select
                    value={filters.requiresFasting === null ? '' : filters.requiresFasting.toString()}
                    onChange={(e) => handleFilterChange('requiresFasting', e.target.value === '' ? null : e.target.value === 'true')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-eg-purple focus:border-eg-purple"
                  >
                    <option value="">Cualquiera</option>
                    <option value="true">Requiere ayuno</option>
                    <option value="false">Sin ayuno</option>
                  </select>
                </div>

                {/* Filtro por tipo de muestra */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de muestra
                  </label>
                  <select
                    value={filters.sampleType}
                    onChange={(e) => handleFilterChange('sampleType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-eg-purple focus:border-eg-purple"
                  >
                    <option value="">Todos los tipos</option>
                    <option value="Sangre">Sangre</option>
                    <option value="Orina">Orina</option>
                    <option value="Heces">Heces</option>
                    <option value="Esputo">Esputo</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>

                {/* Botón de reset */}
                <div className="flex items-end">
                  <button
                    onClick={resetFilters}
                    className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Limpiar filtros
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resultados */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Barra de resultados */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-600">
            {loading ? (
              'Buscando...'
            ) : (
              <>
                {studies.length} resultado{studies.length !== 1 ? 's' : ''} encontrado{studies.length !== 1 ? 's' : ''}
                {searchQuery && ` para "${searchQuery}"`}
              </>
            )}
          </div>

          {/* Selector de vista */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-eg-purple text-white' : 'bg-gray-200 text-gray-600'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-eg-purple text-white' : 'bg-gray-200 text-gray-600'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Lista de resultados */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : studies.length > 0 ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
            <AnimatePresence>
              {studies.map((study, index) => (
                <motion.div
                  key={study.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <StudyCard study={study} viewMode={viewMode} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se encontraron resultados
            </h3>
            <p className="text-gray-600">
              Intenta con otros términos de búsqueda o ajusta los filtros
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchPage;