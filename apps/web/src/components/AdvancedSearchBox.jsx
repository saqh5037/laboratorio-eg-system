import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaSearch,
  FaTimes,
  FaFilter,
  FaMicrophone,
  FaHistory,
  FaChevronDown,
  FaDollarSign
} from 'react-icons/fa';

const AdvancedSearchBox = ({
  searchQuery,
  setSearchQuery,
  filters,
  updateFilter,
  removeFilter,
  clearSearch,
  suggestions,
  searchHistory,
  activeFilters,
  stats,
  categories,
  onSearch
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  
  const searchInputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Configurar reconocimiento de voz
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'es-ES';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [setSearchQuery]);

  // Manejar búsqueda por voz
  const handleVoiceSearch = () => {
    if (!recognitionRef.current) {
      alert('Tu navegador no soporta búsqueda por voz');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Manejar selección de sugerencia
  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.text);
    setShowSuggestions(false);
    searchInputRef.current?.focus();
  };

  // Manejar selección de historial
  const handleHistoryClick = (query) => {
    setSearchQuery(query);
    setShowHistory(false);
    searchInputRef.current?.focus();
  };

  // Aplicar rango de precio
  const applyPriceRange = () => {
    if (priceRange.min !== '') {
      updateFilter('priceMin', parseFloat(priceRange.min));
    }
    if (priceRange.max !== '') {
      updateFilter('priceMax', parseFloat(priceRange.max));
    }
  };

  // Limpiar rango de precio
  const clearPriceRange = () => {
    setPriceRange({ min: '', max: '' });
    removeFilter('priceMin');
    removeFilter('priceMax');
  };

  return (
    <div className="relative w-full">
      {/* Barra de búsqueda principal */}
      <div className="relative">
        <div className="flex items-center gap-2">
          {/* Input de búsqueda */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-eg-gray" />
            
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchHistory.length > 0 && !searchQuery) {
                  setShowHistory(true);
                }
                if (suggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              onBlur={() => {
                setTimeout(() => {
                  setShowHistory(false);
                  setShowSuggestions(false);
                }, 200);
              }}
              placeholder="Buscar estudios por nombre, código o categoría..."
              className="w-full pl-10 pr-24 py-3 border border-eg-pink rounded-lg focus:outline-none focus:ring-2 focus:ring-eg-purple text-eg-grayDark"
            />

            {/* Botones de acción */}
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="p-1.5 hover:bg-eg-pinkLight rounded-full transition-colors"
                  title="Limpiar búsqueda"
                >
                  <FaTimes className="text-eg-gray" />
                </button>
              )}
              
              {recognitionRef.current && (
                <button
                  onClick={handleVoiceSearch}
                  className={`p-1.5 rounded-full transition-colors ${
                    isListening 
                      ? 'bg-red-500 text-white animate-pulse' 
                      : 'hover:bg-eg-pinkLight'
                  }`}
                  title="Búsqueda por voz"
                >
                  <FaMicrophone className={isListening ? '' : 'text-eg-gray'} />
                </button>
              )}
            </div>
          </div>

          {/* Botón de filtros */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn flex items-center gap-2 ${
              activeFilters.length > 0 ? 'btn-primary' : 'btn-outline'
            }`}
          >
            <FaFilter />
            Filtros
            {activeFilters.length > 0 && (
              <span className="bg-white text-eg-purple px-1.5 py-0.5 rounded-full text-xs font-bold">
                {activeFilters.length}
              </span>
            )}
            <FaChevronDown className={`transform transition-transform ${
              showFilters ? 'rotate-180' : ''
            }`} />
          </button>
        </div>

        {/* Contador de resultados */}
        {stats && (
          <div className="flex items-center justify-between mt-2 text-sm text-eg-gray">
            <span>
              {stats.total} resultados encontrados
              {stats.avgRelevance > 0 && (
                <span className="ml-2">
                  (Relevancia: {stats.avgRelevance.toFixed(0)}%)
                </span>
              )}
            </span>
            {stats.withPrice > 0 && (
              <span>{stats.withPrice} con precio disponible</span>
            )}
          </div>
        )}
      </div>

      {/* Chips de filtros activos */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {activeFilters.map(filter => (
            <motion.div
              key={filter.key}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="inline-flex items-center gap-1 px-3 py-1 bg-eg-purple text-white rounded-full text-sm"
            >
              <span className="text-xs opacity-75">{filter.label}:</span>
              <span>{filter.value}</span>
              <button
                onClick={() => removeFilter(filter.key)}
                className="ml-1 hover:bg-white/20 rounded-full p-0.5"
              >
                <FaTimes size={10} />
              </button>
            </motion.div>
          ))}
          
          <button
            onClick={clearSearch}
            className="text-sm text-eg-purple hover:underline"
          >
            Limpiar todo
          </button>
        </div>
      )}

      {/* Panel de filtros expandible */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-eg-pink rounded-lg shadow-lg p-4 z-50"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Filtro por tipo */}
              {categories?.tiposEstudio && (
                <div>
                  <label className="block text-sm font-medium text-eg-gray mb-1">
                    Tipo de Estudio
                  </label>
                  <select
                    value={filters.tipoEstudio || ''}
                    onChange={(e) => updateFilter('tipoEstudio', e.target.value)}
                    className="w-full px-3 py-2 border border-eg-pink rounded-lg focus:outline-none focus:ring-2 focus:ring-eg-purple"
                  >
                    <option value="">Todos</option>
                    {categories.tiposEstudio.map(tipo => (
                      <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Filtro por nivel 1 */}
              {categories?.nivel1 && (
                <div>
                  <label className="block text-sm font-medium text-eg-gray mb-1">
                    Categoría Principal
                  </label>
                  <select
                    value={filters.nivel1 || ''}
                    onChange={(e) => updateFilter('nivel1', e.target.value)}
                    className="w-full px-3 py-2 border border-eg-pink rounded-lg focus:outline-none focus:ring-2 focus:ring-eg-purple"
                  >
                    <option value="">Todas</option>
                    {categories.nivel1.map(nivel => (
                      <option key={nivel} value={nivel}>{nivel}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Filtro por disponibilidad de precio */}
              <div>
                <label className="block text-sm font-medium text-eg-gray mb-1">
                  Disponibilidad de Precio
                </label>
                <select
                  value={filters.hasPrice === null ? '' : filters.hasPrice.toString()}
                  onChange={(e) => {
                    const value = e.target.value;
                    updateFilter('hasPrice', value === '' ? null : value === 'true');
                  }}
                  className="w-full px-3 py-2 border border-eg-pink rounded-lg focus:outline-none focus:ring-2 focus:ring-eg-purple"
                >
                  <option value="">Todos</option>
                  <option value="true">Con precio</option>
                  <option value="false">Sin precio</option>
                </select>
              </div>

              {/* Rango de precio */}
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-eg-gray mb-1">
                  <FaDollarSign className="inline mr-1" />
                  Rango de Precio
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Mínimo"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-eg-pink rounded-lg focus:outline-none focus:ring-2 focus:ring-eg-purple"
                  />
                  <span className="text-eg-gray">-</span>
                  <input
                    type="number"
                    placeholder="Máximo"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-eg-pink rounded-lg focus:outline-none focus:ring-2 focus:ring-eg-purple"
                  />
                  <button
                    onClick={applyPriceRange}
                    disabled={!priceRange.min && !priceRange.max}
                    className="btn btn-primary"
                  >
                    Aplicar
                  </button>
                  {(filters.priceMin !== null || filters.priceMax !== null) && (
                    <button
                      onClick={clearPriceRange}
                      className="btn btn-outline"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sugerencias de búsqueda */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-eg-pink rounded-lg shadow-lg z-40"
          >
            <div className="p-2">
              <p className="text-xs text-eg-gray px-2 py-1">Sugerencias</p>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-3 py-2 hover:bg-eg-pinkLight rounded-lg transition-colors"
                >
                  <div className="font-medium text-eg-grayDark">{suggestion.text}</div>
                  <div className="text-xs text-eg-gray">
                    {suggestion.codigo && `Código: ${suggestion.codigo}`}
                    {suggestion.tipo && ` • ${suggestion.tipo}`}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Historial de búsquedas */}
      <AnimatePresence>
        {showHistory && searchHistory.length > 0 && !searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-eg-pink rounded-lg shadow-lg z-40"
          >
            <div className="p-2">
              <p className="text-xs text-eg-gray px-2 py-1 flex items-center gap-1">
                <FaHistory /> Búsquedas recientes
              </p>
              {searchHistory.slice(0, 5).map((query, index) => (
                <button
                  key={index}
                  onClick={() => handleHistoryClick(query)}
                  className="w-full text-left px-3 py-2 hover:bg-eg-pinkLight rounded-lg transition-colors text-eg-grayDark"
                >
                  {query}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvancedSearchBox;