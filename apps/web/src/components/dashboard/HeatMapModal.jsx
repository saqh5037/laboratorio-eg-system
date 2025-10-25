import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import { HeatMapHistorico } from './HeatMapHistorico';
import { useDashboardData } from '../../hooks/useDashboardData';
import { useFiltros } from '../../contexts/FiltrosContext';

/**
 * Modal para visualización de Heat Map completo
 * @param {Object} props
 * @param {boolean} props.isOpen - Si el modal está abierto
 * @param {Function} props.onClose - Callback para cerrar
 * @param {string} props.pacienteCi - CI del paciente
 */
export function HeatMapModal({ isOpen, onClose, pacienteCi }) {
  const [limite, setLimite] = useState(10);
  const { heatMapData, loading, fetchHeatMapData } = useDashboardData([]);
  const { fechaDesde, fechaHasta } = useFiltros();

  // Cargar datos al abrir el modal o cuando cambien los filtros
  useEffect(() => {
    if (isOpen) {
      fetchHeatMapData(limite);
    }
  }, [isOpen, limite, fetchHeatMapData, fechaDesde, fechaHasta]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-eg-purple to-eg-pink p-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Heat Map Histórico</h2>
              <p className="text-white/90 text-sm mt-1">
                Visualización completa de todos tus resultados de laboratorio
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Cerrar"
            >
              <FaTimes className="text-white text-2xl" />
            </button>
          </div>

          {/* Controles */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <label className="text-sm font-semibold text-gray-700">
                Número de órdenes a mostrar:
              </label>
              <div className="flex gap-2">
                {[5, 10, 15, 20].map((num) => (
                  <button
                    key={num}
                    onClick={() => setLimite(num)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                      limite === num
                        ? 'bg-eg-purple text-white shadow-md'
                        : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-eg-purple'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Contenido */}
          <div className="flex-1 overflow-y-auto p-6">
            <HeatMapHistorico heatMapData={heatMapData} loading={loading.heatmap} />
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-600">
                Desplázate horizontalmente para ver todas las órdenes
              </p>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default HeatMapModal;
