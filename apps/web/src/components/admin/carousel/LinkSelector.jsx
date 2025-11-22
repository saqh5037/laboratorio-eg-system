import React, { useState, useRef, useEffect } from 'react';
import { getAvailableLinks } from '../../../services/carouselApi';
import { useSystemConfig } from '../../../hooks/useSystemConfig';
import { FaChevronDown, FaSearch, FaTimes, FaLink, FaExternalLinkAlt, FaBan } from 'react-icons/fa';

/**
 * LinkSelector Component
 * Dropdown inteligente para seleccionar links con opciones precargadas
 * y búsqueda/filtrado. Respeta las configuraciones del sistema.
 *
 * @param {string} value - URL actual seleccionada
 * @param {function} onChange - Callback cuando cambia el valor
 * @param {string} label - Etiqueta del campo
 * @param {string} placeholder - Placeholder para búsqueda
 */
const LinkSelector = ({ value, onChange, label, placeholder = "Buscar o escribir URL..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [customMode, setCustomMode] = useState(false);
  const dropdownRef = useRef(null);

  // Obtener configuración del sistema
  const { config } = useSystemConfig();

  // Obtener links disponibles según configuración
  const availableLinks = getAvailableLinks(config);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Filtrar links basado en búsqueda (ya filtrados por configuración)
  const filteredCategories = availableLinks.map(category => ({
    ...category,
    links: category.links.filter(link =>
      link.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.links.length > 0);

  // Obtener label del link seleccionado
  const getSelectedLabel = () => {
    if (!value) return '';

    for (const category of availableLinks) {
      const found = category.links.find(link => link.value === value);
      if (found) return found.label;
    }

    return value; // Mostrar URL si no está en los precargados
  };

  // Obtener icono según tipo de link
  const getLinkTypeIcon = (type) => {
    const icons = {
      internal: '🏠',
      anchor: '⚓',
      phone: '📞',
      email: '✉️',
      whatsapp: '💬',
      social: '📱',
      external: '🔗'
    };
    return icons[type] || '🔗';
  };

  // Manejar selección de link
  const handleLinkSelect = (linkValue) => {
    onChange(linkValue);
    setIsOpen(false);
    setSearchTerm('');
    setCustomMode(false);
  };

  // Manejar modo personalizado
  const handleCustomInput = (e) => {
    onChange(e.target.value);
  };

  // Toggle modo personalizado
  const toggleCustomMode = () => {
    setCustomMode(!customMode);
    if (!customMode) {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      {/* Campo de entrada principal */}
      <div className="relative">
        {customMode ? (
          // Modo entrada manual
          <div className="flex gap-2">
            <input
              type="text"
              value={value}
              onChange={handleCustomInput}
              placeholder="https://ejemplo.com/pagina"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2
                       focus:ring-eg-purple focus:border-transparent text-gray-900"
            />
            <button
              type="button"
              onClick={toggleCustomMode}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg
                       transition-colors flex items-center gap-2"
              title="Volver a selector"
            >
              <FaTimes />
            </button>
          </div>
        ) : (
          // Modo selector con dropdown
          <div>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg
                       focus:ring-2 focus:ring-eg-purple focus:border-transparent
                       text-left text-gray-900 bg-white hover:bg-gray-50
                       transition-colors flex items-center justify-between"
            >
              <span className={value ? 'text-gray-900' : 'text-gray-400'}>
                {getSelectedLabel() || placeholder}
              </span>
              <FaChevronDown className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown */}
            {isOpen && (
              <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200
                           rounded-lg shadow-xl max-h-96 overflow-hidden">
                {/* Búsqueda */}
                <div className="p-3 border-b border-gray-200 bg-gray-50">
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar link..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg
                               focus:ring-2 focus:ring-eg-purple focus:border-transparent text-gray-900"
                      autoFocus
                    />
                  </div>
                  {/* Indicador de filtrado por configuración */}
                  {availableLinks.length < 7 && (
                    <div className="mt-2 px-2 py-1 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800 flex items-center gap-1">
                      <FaBan className="text-yellow-600" />
                      <span>Algunas páginas están deshabilitadas en la configuración del sistema</span>
                    </div>
                  )}
                </div>

                {/* Lista de links */}
                <div className="overflow-y-auto max-h-80">
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((category, idx) => (
                      <div key={idx}>
                        {/* Categoría header */}
                        <div className="px-4 py-2 bg-gray-100 border-b border-gray-200
                                     flex items-center gap-2 sticky top-0">
                          <span className="text-lg">{category.icon}</span>
                          <span className="font-semibold text-gray-700 text-sm">
                            {category.category}
                          </span>
                        </div>

                        {/* Links de la categoría */}
                        {category.links.map((link, linkIdx) => (
                          <button
                            key={linkIdx}
                            type="button"
                            onClick={() => handleLinkSelect(link.value)}
                            className={`w-full px-4 py-3 text-left hover:bg-eg-purple/5
                                     transition-colors border-b border-gray-100
                                     ${value === link.value ? 'bg-eg-purple/10' : ''}`}
                          >
                            <div className="flex items-start gap-3">
                              <span className="text-lg mt-0.5 flex-shrink-0">
                                {getLinkTypeIcon(link.type)}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-gray-900 text-sm">
                                    {link.label}
                                  </span>
                                  {link.primary && (
                                    <span className="px-2 py-0.5 bg-eg-purple text-white
                                                 text-xs rounded-full">
                                      Principal
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500 mt-0.5 truncate">
                                  {link.value}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                  {link.description}
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-gray-500">
                      <FaSearch className="mx-auto text-3xl mb-2 text-gray-300" />
                      <p>No se encontraron links</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Intenta con otro término de búsqueda
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer con opción de entrada manual */}
                <div className="p-3 border-t border-gray-200 bg-gray-50">
                  <button
                    type="button"
                    onClick={toggleCustomMode}
                    className="w-full px-4 py-2 bg-white border border-gray-300
                             rounded-lg hover:bg-gray-50 transition-colors
                             flex items-center justify-center gap-2 text-sm text-gray-700"
                  >
                    <FaLink />
                    <span>Escribir URL personalizada</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mostrar URL seleccionada si no está en modo custom */}
      {!customMode && value && (
        <div className="mt-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <FaLink className="text-gray-400" />
            <span className="font-mono truncate">{value}</span>
            {value.startsWith('http') && !value.startsWith(window.location.origin) && (
              <FaExternalLinkAlt className="text-gray-400 flex-shrink-0" title="Link externo" />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LinkSelector;
