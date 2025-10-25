import { motion, AnimatePresence } from 'framer-motion';
import { FaCalendarAlt, FaTimes, FaFilter } from 'react-icons/fa';
import { useFiltros } from '../../contexts/FiltrosContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Componente de filtro por fechas para el dashboard
 * Permite seleccionar presets o rango personalizado
 */
export function FiltroFechas() {
  const {
    fechaDesde,
    fechaHasta,
    preset,
    setFechaDesde,
    setFechaHasta,
    aplicarPreset,
    establecerRangoPersonalizado,
    limpiarFiltros,
    hayFiltrosActivos,
  } = useFiltros();

  // Presets disponibles
  const presets = [
    { id: 'todo', label: 'Todo', icono: '🌍' },
    { id: '3meses', label: 'Últimos 3 meses', icono: '📅' },
    { id: '6meses', label: 'Últimos 6 meses', icono: '📆' },
    { id: '1ano', label: 'Último año', icono: '🗓️' },
  ];

  // Manejar cambio de fecha desde
  const handleFechaDesdeChange = (e) => {
    const nuevaFecha = e.target.value;
    setFechaDesde(nuevaFecha);

    // Si ya hay una fecha hasta, establecer como personalizado
    if (fechaHasta) {
      establecerRangoPersonalizado(nuevaFecha, fechaHasta);
    }
  };

  // Manejar cambio de fecha hasta
  const handleFechaHastaChange = (e) => {
    const nuevaFecha = e.target.value;
    setFechaHasta(nuevaFecha);

    // Si ya hay una fecha desde, establecer como personalizado
    if (fechaDesde) {
      establecerRangoPersonalizado(fechaDesde, nuevaFecha);
    }
  };

  // Validar si el rango de fechas es válido
  const rangoValido = () => {
    if (!fechaDesde || !fechaHasta) return true;
    return new Date(fechaDesde) <= new Date(fechaHasta);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 border-2 border-gray-100 shadow-lg"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-eg-purple to-eg-pink rounded-lg">
            <FaFilter className="text-white text-xl" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Filtrar por Fecha</h3>
            <p className="text-sm text-gray-600">
              Selecciona un período para visualizar
            </p>
          </div>
        </div>

        {/* Botón limpiar filtros */}
        <AnimatePresence>
          {hayFiltrosActivos() && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={limpiarFiltros}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-semibold text-sm"
            >
              <FaTimes />
              Limpiar Filtros
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Presets */}
      <div className="mb-6">
        <p className="text-sm font-semibold text-gray-700 mb-3">Períodos Rápidos:</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {presets.map((p) => (
            <motion.button
              key={p.id}
              onClick={() => aplicarPreset(p.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-4 rounded-lg border-2 transition-all font-semibold text-sm ${
                preset === p.id
                  ? 'bg-gradient-to-r from-eg-purple to-eg-pink text-white border-eg-purple shadow-lg'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-eg-purple/50 hover:bg-gray-50'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <span className="text-2xl">{p.icono}</span>
                <span>{p.label}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Separador */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px bg-gray-200"></div>
        <span className="text-sm text-gray-500 font-medium">O PERSONALIZA</span>
        <div className="flex-1 h-px bg-gray-200"></div>
      </div>

      {/* Selección de rango personalizado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Fecha Desde */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <FaCalendarAlt className="inline mr-2 text-eg-purple" />
            Fecha Desde:
          </label>
          <input
            type="date"
            value={fechaDesde || ''}
            onChange={handleFechaDesdeChange}
            className={`w-full px-4 py-3 border-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-eg-purple ${
              preset === 'personalizado'
                ? 'border-eg-purple bg-purple-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          />
        </div>

        {/* Fecha Hasta */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <FaCalendarAlt className="inline mr-2 text-eg-pink" />
            Fecha Hasta:
          </label>
          <input
            type="date"
            value={fechaHasta || ''}
            onChange={handleFechaHastaChange}
            className={`w-full px-4 py-3 border-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-eg-purple ${
              preset === 'personalizado'
                ? 'border-eg-purple bg-purple-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          />
        </div>
      </div>

      {/* Validación y feedback */}
      <AnimatePresence>
        {!rangoValido() && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-3 bg-red-50 border-2 border-red-200 rounded-lg"
          >
            <p className="text-sm text-red-700 font-medium">
              ⚠️ La fecha de inicio debe ser anterior a la fecha de fin
            </p>
          </motion.div>
        )}

        {rangoValido() && hayFiltrosActivos() && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg"
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">✅</div>
              <div className="flex-1">
                <p className="text-sm font-bold text-purple-900 mb-1">
                  Filtros Activos
                </p>
                <div className="text-xs text-purple-800 space-y-1">
                  {fechaDesde && (
                    <p>
                      📅 <strong>Desde:</strong>{' '}
                      {format(new Date(fechaDesde), "d 'de' MMMM, yyyy", {
                        locale: es,
                      })}
                    </p>
                  )}
                  {fechaHasta && (
                    <p>
                      📅 <strong>Hasta:</strong>{' '}
                      {format(new Date(fechaHasta), "d 'de' MMMM, yyyy", {
                        locale: es,
                      })}
                    </p>
                  )}
                  {preset !== 'todo' && preset !== 'personalizado' && (
                    <p>
                      🏷️ <strong>Preset:</strong> {presets.find((p) => p.id === preset)?.label}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nota informativa */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          💡 <strong>Nota:</strong> Los filtros se aplicarán a todo el dashboard,
          incluyendo el heat map, comparaciones y mini-gráficas.
        </p>
      </div>
    </motion.div>
  );
}

export default FiltroFechas;
