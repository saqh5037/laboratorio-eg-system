import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaFilter,
  FaSortAmountDown,
  FaSortAmountUp,
  FaSearch,
  FaTh,
  FaThLarge,
  FaList,
  FaSpinner,
  FaExclamationTriangle
} from 'react-icons/fa';
import StudyCard from './StudyCard';

// Componente de filtros y ordenamiento
const StudyFilters = ({ 
  searchTerm, 
  onSearchChange, 
  sortBy, 
  onSortChange, 
  sortOrder, 
  onSortOrderChange,
  filterBy,
  onFilterChange,
  categories,
  viewMode,
  onViewModeChange 
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 space-y-4">
      {/* Primera fila: Búsqueda y vista */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Búsqueda */}
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
          <input
            type="text"
            placeholder="Buscar estudios, códigos o pruebas..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-eg-purple/50 focus:border-eg-purple"
          />
        </div>
        
        {/* Selector de vista */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => onViewModeChange('grid-large')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'grid-large' 
                ? 'bg-white text-eg-purple shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title="Vista grande"
          >
            <FaThLarge size={16} />
          </button>
          <button
            onClick={() => onViewModeChange('grid-medium')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'grid-medium' 
                ? 'bg-white text-eg-purple shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title="Vista mediana"
          >
            <FaTh size={16} />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'list' 
                ? 'bg-white text-eg-purple shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            title="Vista lista"
          >
            <FaList size={16} />
          </button>
        </div>
      </div>
      
      {/* Segunda fila: Filtros y ordenamiento */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Filtro por categoría */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <FaFilter className="inline mr-1" size={12} />
            Categoría
          </label>
          <select
            value={filterBy.categoria || ''}
            onChange={(e) => onFilterChange({ ...filterBy, categoria: e.target.value || null })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-eg-purple/50"
          >
            <option value="">Todas las categorías</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        
        {/* Filtro por precio */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rango de precio
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filterBy.precioMin || ''}
              onChange={(e) => onFilterChange({ 
                ...filterBy, 
                precioMin: e.target.value ? Number(e.target.value) : null 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-eg-purple/50"
            />
            <input
              type="number"
              placeholder="Max"
              value={filterBy.precioMax || ''}
              onChange={(e) => onFilterChange({ 
                ...filterBy, 
                precioMax: e.target.value ? Number(e.target.value) : null 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-eg-purple/50"
            />
          </div>
        </div>
        
        {/* Ordenamiento */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ordenar por
          </label>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-eg-purple/50"
            >
              <option value="nombre">Nombre</option>
              <option value="precio">Precio</option>
              <option value="categoria">Categoría</option>
              <option value="codigo">Código</option>
            </select>
            <button
              onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title={sortOrder === 'asc' ? 'Descendente' : 'Ascendente'}
            >
              {sortOrder === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente principal StudyGrid
const StudyGrid = ({
  studies = [],
  loading = false,
  error = null,
  favorites = new Set(),
  selectedStudies = new Set(),
  onToggleFavorite,
  onMoreInfo,
  onSelectStudy,
  onMultiSelect,
  className = '',
  showFilters = true,
  defaultViewMode = 'grid-medium',
  emptyMessage = 'No se encontraron estudios',
  loadingMessage = 'Cargando estudios...'
}) => {
  // Estados locales
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('nombre');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterBy, setFilterBy] = useState({
    categoria: null,
    precioMin: null,
    precioMax: null
  });
  const [viewMode, setViewMode] = useState(defaultViewMode);

  // Obtener categorías únicas
  const categories = useMemo(() => {
    const cats = new Set();
    studies.forEach(study => {
      const categoria = study.categoria || study.tipoEstudio || study.nivel1;
      if (categoria) cats.add(categoria);
    });
    return Array.from(cats).sort();
  }, [studies]);

  // Filtrar y ordenar estudios
  const filteredAndSortedStudies = useMemo(() => {
    let filtered = studies;

    // Aplicar búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(study => 
        study.nombre?.toLowerCase().includes(searchLower) ||
        study.name?.toLowerCase().includes(searchLower) ||
        study.codigo?.toLowerCase().includes(searchLower) ||
        study.pruebas?.some(p => p.nombre?.toLowerCase().includes(searchLower))
      );
    }

    // Aplicar filtros
    if (filterBy.categoria) {
      filtered = filtered.filter(study => {
        const categoria = study.categoria || study.tipoEstudio || study.nivel1;
        return categoria === filterBy.categoria;
      });
    }

    if (filterBy.precioMin !== null) {
      filtered = filtered.filter(study => study.precio && study.precio >= filterBy.precioMin);
    }

    if (filterBy.precioMax !== null) {
      filtered = filtered.filter(study => study.precio && study.precio <= filterBy.precioMax);
    }

    // Aplicar ordenamiento
    filtered.sort((a, b) => {
      let aVal, bVal;
      
      switch (sortBy) {
        case 'precio':
          aVal = a.precio || 0;
          bVal = b.precio || 0;
          break;
        case 'categoria':
          aVal = a.categoria || a.tipoEstudio || a.nivel1 || '';
          bVal = b.categoria || b.tipoEstudio || b.nivel1 || '';
          break;
        case 'codigo':
          aVal = a.codigo || '';
          bVal = b.codigo || '';
          break;
        default: // nombre
          aVal = a.nombre || a.name || '';
          bVal = b.nombre || b.name || '';
      }

      if (typeof aVal === 'string') {
        const result = aVal.localeCompare(bVal, 'es');
        return sortOrder === 'asc' ? result : -result;
      } else {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
    });

    return filtered;
  }, [studies, searchTerm, filterBy, sortBy, sortOrder]);

  // Obtener clases CSS para el grid según el modo de vista
  const getGridClasses = () => {
    switch (viewMode) {
      case 'grid-large':
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6';
      case 'grid-medium':
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4';
      case 'list':
        return 'grid-cols-1 gap-3';
      default:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4';
    }
  };

  // Limpiar filtros
  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setFilterBy({
      categoria: null,
      precioMin: null,
      precioMax: null
    });
  }, []);

  // Renderizar estado de error
  if (error) {
    return (
      <div className="text-center py-12">
        <FaExclamationTriangle className="mx-auto text-4xl text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar estudios</h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Filtros */}
      {showFilters && (
        <StudyFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          sortBy={sortBy}
          onSortChange={setSortBy}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          filterBy={filterBy}
          onFilterChange={setFilterBy}
          categories={categories}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      )}

      {/* Información de resultados */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {loading ? (
            'Cargando...'
          ) : (
            `${filteredAndSortedStudies.length} estudio${filteredAndSortedStudies.length !== 1 ? 's' : ''} encontrado${filteredAndSortedStudies.length !== 1 ? 's' : ''}`
          )}
        </p>
        
        {(searchTerm || filterBy.categoria || filterBy.precioMin || filterBy.precioMax) && (
          <button
            onClick={clearFilters}
            className="text-sm text-eg-purple hover:text-eg-purpleDark transition-colors"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Grid de estudios */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <FaSpinner className="animate-spin text-3xl text-eg-purple mr-3" />
          <span className="text-lg text-gray-600">{loadingMessage}</span>
        </div>
      ) : filteredAndSortedStudies.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <FaSearch className="text-2xl text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{emptyMessage}</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterBy.categoria || filterBy.precioMin || filterBy.precioMax
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'No hay estudios disponibles en este momento'
            }
          </p>
          {(searchTerm || filterBy.categoria || filterBy.precioMin || filterBy.precioMax) && (
            <button
              onClick={clearFilters}
              className="btn btn-outline btn-sm"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      ) : (
        <motion.div
          layout
          className={`grid ${getGridClasses()}`}
        >
          <AnimatePresence mode="popLayout">
            {filteredAndSortedStudies.map((study) => (
              <StudyCard
                key={study.id}
                study={study}
                isFavorite={favorites.has(study.id)}
                isSelected={selectedStudies.has(study.id)}
                onToggleFavorite={onToggleFavorite}
                onMoreInfo={onMoreInfo}
                onSelect={onSelectStudy}
                className={viewMode === 'list' ? 'md:flex md:items-center' : ''}
                showPruebas={viewMode !== 'list'}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default StudyGrid;