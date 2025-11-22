import React, { useState } from 'react';
import { AVAILABLE_ICONS } from '../../../services/carouselApi';
import {
  FaCalendarAlt,
  FaFlask,
  FaPhone,
  FaWhatsapp,
  FaLaptop,
  FaUser,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaHeart,
  FaStar,
  FaBell,
  FaFile,
  FaImage,
  FaVideo,
  FaPlay,
  FaSearch,
  FaCog,
  FaQuestionCircle,
  FaInfoCircle,
  FaDownload,
  FaShare,
  FaHome,
} from 'react-icons/fa';

// Mapeo de iconos
const ICON_COMPONENTS = {
  calendar: FaCalendarAlt,
  flask: FaFlask,
  phone: FaPhone,
  whatsapp: FaWhatsapp,
  laptop: FaLaptop,
  user: FaUser,
  email: FaEnvelope,
  map: FaMapMarkerAlt,
  check: FaCheckCircle,
  heart: FaHeart,
  star: FaStar,
  bell: FaBell,
  file: FaFile,
  image: FaImage,
  video: FaVideo,
  play: FaPlay,
  search: FaSearch,
  settings: FaCog,
  help: FaQuestionCircle,
  info: FaInfoCircle,
  download: FaDownload,
  share: FaShare,
  home: FaHome,
};

/**
 * IconGrid Component
 * Selector visual de iconos en formato grid
 *
 * @param {string} value - Icono actualmente seleccionado
 * @param {function} onChange - Callback cuando cambia el valor
 * @param {string} label - Etiqueta del campo
 */
const IconGrid = ({ value, onChange, label }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar iconos según búsqueda
  const filteredIcons = AVAILABLE_ICONS.filter(icon =>
    icon.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    icon.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Obtener componente de icono
  const getIconComponent = (iconValue) => {
    return ICON_COMPONENTS[iconValue] || FaCalendarAlt;
  };

  // Obtener label del icono seleccionado
  const getSelectedLabel = () => {
    const selected = AVAILABLE_ICONS.find(icon => icon.value === value);
    return selected ? selected.label : 'Seleccionar icono';
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      {/* Icono seleccionado actual */}
      {value && (
        <div className="mb-3 p-3 bg-eg-purple/5 border border-eg-purple/20 rounded-lg
                     flex items-center gap-3">
          {(() => {
            const IconComponent = getIconComponent(value);
            return (
              <>
                <div className="w-10 h-10 bg-eg-purple text-white rounded-lg
                             flex items-center justify-center">
                  <IconComponent className="text-xl" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {getSelectedLabel()}
                  </div>
                  <div className="text-xs text-gray-500">
                    Icono seleccionado
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Búsqueda */}
      <div className="mb-3">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar icono..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg
                     focus:ring-2 focus:ring-eg-purple focus:border-transparent text-gray-900"
          />
        </div>
      </div>

      {/* Grid de iconos */}
      <div className="border border-gray-200 rounded-lg p-3 max-h-64 overflow-y-auto bg-white">
        {filteredIcons.length > 0 ? (
          <div className="grid grid-cols-4 gap-2">
            {filteredIcons.map((icon) => {
              const IconComponent = getIconComponent(icon.value);
              const isSelected = value === icon.value;

              return (
                <button
                  key={icon.value}
                  type="button"
                  onClick={() => onChange(icon.value)}
                  className={`p-3 rounded-lg border-2 transition-all
                           flex flex-col items-center gap-2 hover:scale-105
                           ${isSelected
                             ? 'border-eg-purple bg-eg-purple/10 shadow-md'
                             : 'border-gray-200 hover:border-eg-purple/50 hover:bg-gray-50'
                           }`}
                  title={icon.label}
                >
                  <IconComponent className={`text-2xl ${
                    isSelected ? 'text-eg-purple' : 'text-gray-600'
                  }`} />
                  <span className={`text-xs text-center leading-tight ${
                    isSelected ? 'text-eg-purple font-medium' : 'text-gray-600'
                  }`}>
                    {icon.label}
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
      <div className="mt-2 text-xs text-gray-500 text-right">
        {filteredIcons.length} {filteredIcons.length === 1 ? 'icono' : 'iconos'} disponibles
      </div>
    </div>
  );
};

export default IconGrid;
