import { useState } from 'react';
import { FaChartLine } from 'react-icons/fa';

/**
 * Botón para abrir el histórico de una prueba
 * @param {Object} props
 * @param {number} props.pruebaId - ID de la prueba
 * @param {string} props.pruebaNombre - Nombre de la prueba
 * @param {Function} props.onClick - Callback cuando se hace click
 * @param {boolean} props.disabled - Si el botón está deshabilitado
 */
export function HistoricoButton({ pruebaId, pruebaNombre, onClick, disabled = false }) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (e) => {
    e.stopPropagation(); // Evitar que el click se propague
    if (!disabled && onClick) {
      onClick({ pruebaId, pruebaNombre });
    }
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={disabled}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
        text-sm font-medium transition-all duration-200
        ${
          disabled
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : isHovered
            ? 'bg-gradient-to-r from-eg-purple to-eg-pink text-white shadow-lg scale-105'
            : 'bg-eg-purple/10 text-eg-purple hover:bg-eg-purple/20'
        }
      `}
      aria-label={`Ver histórico de ${pruebaNombre}`}
      title={`Ver histórico de ${pruebaNombre}`}
    >
      <FaChartLine className={`text-base ${isHovered && !disabled ? 'animate-pulse' : ''}`} />
      <span className="hidden sm:inline">Histórico</span>
    </button>
  );
}

export default HistoricoButton;
