import { useState } from 'react';
import { useFiltros } from '../../contexts/FiltrosContext';

/**
 * Filtros Colapsables Compactos
 * Reduce espacio de 500px a 40px collapsed
 * Expandible para configuración avanzada
 */

export function FiltrosCollapsible({ externalIsExpanded, onToggleExpanded }) {
  const [internalIsExpanded, setInternalIsExpanded] = useState(false);
  const { filtroActivo, aplicarFiltroRapido, fechaDesde, fechaHasta, aplicarFiltroPersonalizado, limpiarFiltros } = useFiltros();

  // Usar estado externo si se proporciona, sino usar estado interno
  const isExpanded = externalIsExpanded !== undefined ? externalIsExpanded : internalIsExpanded;
  const setIsExpanded = onToggleExpanded || setInternalIsExpanded;

  // Opciones de filtro rápido
  const filtrosRapidos = [
    { id: 'todo', label: 'Todo el historial', meses: null },
    { id: '3m', label: 'Últimos 3 meses', meses: 3 },
    { id: '6m', label: 'Últimos 6 meses', meses: 6 },
    { id: '1a', label: 'Último año', meses: 12 }
  ];

  // Manejar click en filtro rápido
  const handleFiltroRapido = (meses) => {
    if (meses === null) {
      limpiarFiltros();
    } else {
      aplicarFiltroRapido(meses);
    }
    setIsExpanded(false);
  };

  // Obtener label del filtro activo
  const getFiltroLabel = () => {
    const filtro = filtrosRapidos.find(f => f.id === filtroActivo);
    return filtro?.label || 'Personalizado';
  };

  return (
    <div className="bg-white border-2 border-eg-purple/20 rounded-xl shadow-sm overflow-hidden">
      {/* Header - Siempre visible */}
      <div className="p-4">
        <div className="flex items-center justify-between gap-4">
          {/* Estado actual del filtro */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-sm md:text-base text-gray-700 hover:text-eg-purple transition-colors min-h-[44px]"
          >
            <span className="text-lg" aria-hidden="true">🔍</span>
            <span className="font-medium">Filtrar:</span>
            <span className="text-eg-purple font-bold">{getFiltroLabel()}</span>
            <svg
              className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Filtros rápidos - Pills */}
          <div className="hidden md:flex items-center gap-2">
            {filtrosRapidos.slice(1).map((filtro) => (
              <button
                key={filtro.id}
                onClick={() => handleFiltroRapido(filtro.meses)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 min-h-[36px] ${
                  filtroActivo === filtro.id
                    ? 'bg-eg-purple text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-eg-purple/10 hover:text-eg-purple'
                }`}
              >
                {filtro.label.replace('Últimos ', '').replace('Último ', '')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Panel Expandible */}
      {isExpanded && (
        <div className="border-t border-gray-200 bg-gray-50 p-4 animate-in slide-in-from-top duration-200">
          {/* Filtros rápidos - Móvil */}
          <div className="md:hidden mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Filtros rápidos:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {filtrosRapidos.map((filtro) => (
                <button
                  key={filtro.id}
                  onClick={() => handleFiltroRapido(filtro.meses)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 min-h-[44px] ${
                    filtroActivo === filtro.id
                      ? 'bg-eg-purple text-white shadow-md'
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-eg-purple'
                  }`}
                >
                  {filtro.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filtro personalizado */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Período personalizado:
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <label htmlFor="fecha-desde" className="block text-xs text-gray-600 mb-1">
                  Desde:
                </label>
                <input
                  type="date"
                  id="fecha-desde"
                  value={fechaDesde || ''}
                  onChange={(e) => aplicarFiltroPersonalizado(e.target.value, fechaHasta)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-eg-purple focus:outline-none focus:ring-2 focus:ring-eg-purple/20 transition-all text-base min-h-[44px]"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="fecha-hasta" className="block text-xs text-gray-600 mb-1">
                  Hasta:
                </label>
                <input
                  type="date"
                  id="fecha-hasta"
                  value={fechaHasta || ''}
                  onChange={(e) => aplicarFiltroPersonalizado(fechaDesde, e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-eg-purple focus:outline-none focus:ring-2 focus:ring-eg-purple/20 transition-all text-base min-h-[44px]"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => setIsExpanded(false)}
                  className="w-full sm:w-auto px-6 py-2 bg-eg-purple text-white rounded-lg font-medium hover:bg-eg-purple/90 transition-colors shadow-md min-h-[44px]"
                >
                  Aplicar
                </button>
              </div>
            </div>
          </div>

          {/* Botón limpiar */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                limpiarFiltros();
                setIsExpanded(false);
              }}
              className="text-sm text-gray-600 hover:text-eg-purple underline min-h-[36px]"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FiltrosCollapsible;
