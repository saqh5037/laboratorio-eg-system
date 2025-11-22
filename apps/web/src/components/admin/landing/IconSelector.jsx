import React, { useState, useMemo } from 'react';
import { FaSearch } from 'react-icons/fa';
import { getAvailableIcons, renderIcon } from '../../../utils/iconMapper';

/**
 * IconSelector Component
 * Selector visual de iconos para contenido de landing page
 * Usa el sistema de iconMapper para obtener iconos disponibles
 *
 * @param {string} value - Nombre del icono seleccionado (ej: 'FaBullseye')
 * @param {function} onChange - Callback cuando cambia el valor
 * @param {string} label - Etiqueta del campo (opcional)
 * @param {string} className - Clases CSS adicionales (opcional)
 * @param {boolean} disabled - Deshabilitar el selector (opcional)
 */
const IconSelector = ({
  value,
  onChange,
  label = 'Icono',
  className = '',
  disabled = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Obtener todos los iconos disponibles desde iconMapper
  const availableIcons = useMemo(() => getAvailableIcons(), []);

  // Filtrar iconos según búsqueda
  const filteredIcons = useMemo(() => {
    if (!searchTerm.trim()) return availableIcons;

    const search = searchTerm.toLowerCase();
    return availableIcons.filter(iconName =>
      iconName.toLowerCase().includes(search)
    );
  }, [availableIcons, searchTerm]);

  // Obtener nombre legible del icono
  const getIconLabel = (iconName) => {
    // Convertir 'FaBullseye' -> 'Bullseye'
    return iconName.replace(/^Fa/, '').replace(/([A-Z])/g, ' $1').trim();
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      {/* Icono seleccionado actual */}
      {value && (
        <div className={`mb-3 p-3 border rounded-lg flex items-center gap-3 transition-all
                     ${disabled
                       ? 'bg-gray-50 border-gray-200'
                       : 'bg-eg-purple/5 border-eg-purple/20'}`}>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center
                       ${disabled ? 'bg-gray-300' : 'bg-eg-purple'}`}>
            {renderIcon(value, disabled ? 'text-gray-500' : 'text-white', 5)}
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">
              {getIconLabel(value)}
            </div>
            <div className="text-xs text-gray-500">
              Icono seleccionado
            </div>
          </div>
        </div>
      )}

      {/* Búsqueda */}
      <div className="mb-3">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar icono..."
            disabled={disabled}
            className={`w-full pl-10 pr-4 py-2 border rounded-lg text-gray-900
                     focus:ring-2 focus:ring-eg-purple focus:border-transparent
                     transition-all
                     ${disabled
                       ? 'bg-gray-50 border-gray-200 cursor-not-allowed'
                       : 'bg-white border-gray-300'}`}
          />
        </div>
      </div>

      {/* Grid de iconos */}
      <div className={`border rounded-lg p-3 max-h-80 overflow-y-auto
                   ${disabled ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'}`}>
        {filteredIcons.length > 0 ? (
          <div className="grid grid-cols-5 gap-2">
            {filteredIcons.map((iconName) => {
              const isSelected = value === iconName;

              return (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => !disabled && onChange(iconName)}
                  disabled={disabled}
                  className={`p-3 rounded-lg border-2 transition-all
                           flex flex-col items-center gap-2
                           ${disabled
                             ? 'cursor-not-allowed opacity-50'
                             : 'hover:scale-105 cursor-pointer'}
                           ${isSelected
                             ? 'border-eg-purple bg-eg-purple/10 shadow-md'
                             : disabled
                               ? 'border-gray-200 bg-gray-50'
                               : 'border-gray-200 hover:border-eg-purple/50 hover:bg-gray-50'
                           }`}
                  title={getIconLabel(iconName)}
                >
                  {renderIcon(
                    iconName,
                    isSelected
                      ? 'text-eg-purple'
                      : disabled
                        ? 'text-gray-400'
                        : 'text-gray-600',
                    6
                  )}
                  <span className={`text-xs text-center leading-tight line-clamp-2
                                 ${isSelected
                                   ? 'text-eg-purple font-medium'
                                   : disabled
                                     ? 'text-gray-400'
                                     : 'text-gray-600'}`}>
                    {getIconLabel(iconName)}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            <FaSearch className="mx-auto text-3xl mb-2 text-gray-300" />
            <p className="text-sm">No se encontraron iconos</p>
            <p className="text-xs text-gray-400 mt-1">
              Intenta con otro término de búsqueda
            </p>
          </div>
        )}
      </div>

      {/* Indicador de cantidad */}
      <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
        <span>
          {filteredIcons.length} {filteredIcons.length === 1 ? 'icono' : 'iconos'}
          {searchTerm ? ' encontrados' : ' disponibles'}
        </span>
        {value && !disabled && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-eg-purple hover:text-eg-pink transition-colors underline"
          >
            Limpiar selección
          </button>
        )}
      </div>
    </div>
  );
};

export default IconSelector;
