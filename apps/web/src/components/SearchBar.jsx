import { useState, useEffect, useRef, useCallback } from 'react';
import { estudiosData } from '../data/estudiosData';

const SearchBar = ({ onSearch, value, onChange }) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);
  const debounceTimer = useRef(null);

  // Función para obtener sugerencias
  const getSuggestions = useCallback((searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      return [];
    }

    const term = searchTerm.toLowerCase();
    const matches = estudiosData.filter(estudio => {
      // Buscar en nombre
      if (estudio.nombre.toLowerCase().includes(term)) return true;
      // Buscar en tags
      if (estudio.tags?.some(tag => tag.toLowerCase().includes(term))) return true;
      // Buscar en código
      if (estudio.codigo.toLowerCase().includes(term)) return true;
      return false;
    });

    // Limitar a 8 sugerencias y ordenar por relevancia
    return matches.slice(0, 8).sort((a, b) => {
      // Priorizar coincidencias en el nombre
      const aStartsWith = a.nombre.toLowerCase().startsWith(term);
      const bStartsWith = b.nombre.toLowerCase().startsWith(term);
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      return 0;
    });
  }, []);

  // Debounce para sugerencias
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      const newSuggestions = getSuggestions(inputValue);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0 && inputValue.length >= 2);
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [inputValue, getSuggestions]);

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    if (onChange) {
      onChange(value);
    }
  };

  const handleSuggestionClick = (estudio) => {
    setInputValue(estudio.nombre);
    setShowSuggestions(false);
    if (onSearch) {
      onSearch(estudio.nombre);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (onSearch) {
      onSearch(inputValue);
    }
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          handleSubmit(e);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Función para resaltar el término buscado
  const highlightMatch = (text, searchTerm) => {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => (
      regex.test(part) ? (
        <span key={index} className="bg-eg-purple/20 font-medium">
          {part}
        </span>
      ) : (
        <span key={index}>{part}</span>
      )
    ));
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          {/* Ícono de búsqueda */}
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg
              className="h-4 w-4 text-eg-gray"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Input de búsqueda */}
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="Buscar examen: hematología, glucosa, cultivo..."
            className="w-full pl-10 pr-28 py-3 text-sm border border-eg-gray/30 rounded-xl 
                     focus:outline-none focus:ring-2 focus:ring-eg-purple/50 focus:border-eg-purple
                     text-eg-dark placeholder-eg-gray/60 transition-all duration-200"
            autoComplete="off"
          />

          {/* Botón de búsqueda */}
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 
                     bg-eg-purple text-white px-4 py-2 rounded-lg
                     hover:bg-eg-purple/90 transition-all duration-200
                     font-light text-sm"
          >
            Buscar
          </button>

          {/* Limpiar búsqueda */}
          {inputValue && (
            <button
              type="button"
              onClick={() => {
                setInputValue('');
                setSuggestions([]);
                setShowSuggestions(false);
                if (onChange) onChange('');
              }}
              className="absolute right-28 top-1/2 -translate-y-1/2 mr-2
                       text-eg-gray hover:text-eg-dark transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </form>

      {/* Dropdown de sugerencias */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-lg border border-eg-gray/10 overflow-hidden">
          <div className="py-2">
            {suggestions.map((estudio, index) => (
              <button
                key={estudio.id}
                onClick={() => handleSuggestionClick(estudio)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`
                  w-full px-4 py-2.5 text-left hover:bg-eg-purple/5 transition-colors
                  flex items-start justify-between group
                  ${selectedIndex === index ? 'bg-eg-purple/5' : ''}
                `}
              >
                <div className="flex-1">
                  <div className="font-medium text-eg-dark">
                    {highlightMatch(estudio.nombre, inputValue)}
                  </div>
                  <div className="text-sm text-eg-gray mt-0.5 flex items-center space-x-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-eg-purple/10 text-eg-purple">
                      {estudio.area}
                    </span>
                    <span>{estudio.codigo}</span>
                    <span>•</span>
                    <span>${estudio.precio}</span>
                  </div>
                </div>
                {estudio.tipo === 'perfil' && (
                  <span className="ml-2 px-2 py-1 bg-eg-pink/20 text-eg-purple text-xs rounded-full">
                    Perfil
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="px-4 py-2 bg-eg-light-gray border-t border-eg-gray/10">
            <p className="text-xs text-eg-gray">
              Presiona <kbd className="px-1.5 py-0.5 bg-white rounded border border-eg-gray/30">Enter</kbd> para buscar 
              o <kbd className="px-1.5 py-0.5 bg-white rounded border border-eg-gray/30">↓</kbd> para navegar
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;