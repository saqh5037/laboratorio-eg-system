import { useState } from 'react';
import { formatearNumero } from '../../../utils/formatters';

/**
 * Componente para mostrar un valor histórico individual con tooltip
 * Replica la funcionalidad de Labsis mostrando últimos 3 resultados
 *
 * @param {Object} props
 * @param {Object} props.historico - Datos del resultado histórico
 * @param {number} props.historico.valorNumerico - Valor del resultado
 * @param {string} props.historico.formato - Formato de la prueba (ej: "#.#", "#.##")
 * @param {string} props.historico.unidad - Unidad de medida
 * @param {string} props.historico.numeroOrden - Número de orden
 * @param {string} props.historico.fecha - Fecha del resultado
 * @param {string} props.historico.estado - Estado (normal, bajo, alto)
 * @param {number|null} props.historico.valorDesde - Límite inferior
 * @param {number|null} props.historico.valorHasta - Límite superior
 */
export function HistoricoCell({ historico }) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!historico) {
    return (
      <div className="text-center py-1 px-1 text-xs text-gray-400">
        —
      </div>
    );
  }

  // Determinar símbolo según estado
  const getSimbolo = (estado) => {
    switch (estado) {
      case 'normal':
        return '✓';
      case 'bajo':
        return '↓';
      case 'alto':
        return '↑';
      default:
        return '•';
    }
  };

  // Determinar color según estado
  const getColorClasses = (estado) => {
    switch (estado) {
      case 'normal':
        return 'text-green-600';
      case 'bajo':
        return 'text-yellow-600';
      case 'alto':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  // Formatear fecha compacta
  const formatearFechaCompacta = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: '2-digit'
    });
  };

  const valorFormateado = historico.valorNumerico !== null
    ? formatearNumero(historico.valorNumerico, historico.formato)
    : (historico.valorTexto || '—');
  const colorClasses = getColorClasses(historico.estado);
  const simbolo = getSimbolo(historico.estado);

  return (
    <div className="relative inline-block group">
      {/* Símbolo compacto */}
      <div
        className={`
          text-base font-bold cursor-help
          transition-all duration-200 hover:scale-125
          ${colorClasses}
        `}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {simbolo}
      </div>

      {/* Tooltip mejorado - NO se corta */}
      {showTooltip && (
        <div className="absolute z-[9999] bottom-full left-1/2 transform -translate-x-1/2 mb-2 pointer-events-none">
          <div className="bg-gray-900 text-white text-xs rounded-lg shadow-2xl p-3 whitespace-nowrap">
            {/* Flecha del tooltip */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2">
              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-900"></div>
            </div>

            {/* Contenido del tooltip */}
            <div className="space-y-1">
              <p className="font-bold text-white">
                Orden: {historico.numeroOrden}
              </p>
              <p className="text-gray-300 text-[11px]">
                {formatearFechaCompacta(historico.fecha)}
              </p>
              <p className="font-semibold text-white">
                {valorFormateado} {historico.unidad}
              </p>
              {historico.valorDesde && historico.valorHasta && (
                <p className="text-gray-400 text-[10px]">
                  Rango: {formatearNumero(historico.valorDesde, historico.formato)}-{formatearNumero(historico.valorHasta, historico.formato)}
                </p>
              )}
              <p className={`text-xs font-medium pt-1 border-t border-gray-700 ${getEstadoTextoClasses(historico.estado)}`}>
                {getEstadoTexto(historico.estado)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Utilidades
function getEstadoTexto(estado) {
  switch (estado) {
    case 'normal':
      return '✓ Normal';
    case 'bajo':
      return '↓ Bajo';
    case 'alto':
      return '↑ Alto';
    default:
      return '— Sin rango';
  }
}

function getEstadoTextoClasses(estado) {
  switch (estado) {
    case 'normal':
      return 'text-green-400';
    case 'bajo':
      return 'text-yellow-400';
    case 'alto':
      return 'text-orange-400';
    default:
      return 'text-gray-400';
  }
}

export default HistoricoCell;
