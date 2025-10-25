import { useEffect, useState } from 'react';
import { FaTimes, FaChartLine, FaChartBar } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useHistorico } from '../../hooks/useHistorico';
import { getPacienteInfo } from '../../services/resultsApi';
import GraficaLinea from './GraficaLinea';
import GraficaBarras from './GraficaBarras';

/**
 * Modal para mostrar el histórico de resultados con gráficas
 * @param {Object} props
 * @param {boolean} props.isOpen - Si el modal está abierto
 * @param {Function} props.onClose - Callback para cerrar el modal
 * @param {number} props.pruebaId - ID de la prueba
 * @param {string} props.pruebaNombre - Nombre de la prueba
 * @param {string} props.pacienteCi - CI del paciente
 */
export function HistoricoModal({
  isOpen,
  onClose,
  pruebaId,
  pruebaNombre,
  pacienteCi,
}) {
  const { historico, loading, error, fetchHistorico, clearHistorico } = useHistorico();
  const [tipoGrafica, setTipoGrafica] = useState('linea');

  useEffect(() => {
    if (isOpen && pruebaId) {
      const paciente = getPacienteInfo();
      if (paciente && paciente.ci_paciente) {
        fetchHistorico(pruebaId, paciente.ci_paciente, 10);
      }
    }

    // Limpiar al cerrar
    return () => {
      if (!isOpen) {
        clearHistorico();
      }
    };
  }, [isOpen, pruebaId, fetchHistorico, clearHistorico]);

  // Cerrar con tecla Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Modal - Responsive: Altura completa en móvil, limitada en desktop */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 pointer-events-none"
          >
            <div
              className="bg-white rounded-none md:rounded-2xl shadow-2xl w-full max-w-5xl h-full md:h-auto md:max-h-[90vh] overflow-y-auto pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header - Responsive: Más compacto en móvil */}
              <div className="sticky top-0 bg-gradient-to-r from-eg-purple to-eg-pink p-4 md:p-6 rounded-t-none md:rounded-t-2xl z-10">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                      <FaChartLine className="text-lg md:text-2xl text-white flex-shrink-0" />
                      <h2 className="text-lg md:text-2xl font-bold text-white">
                        Histórico de Resultados
                      </h2>
                    </div>
                    <p className="text-white/90 text-xs md:text-sm truncate pr-2">{pruebaNombre}</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="ml-2 md:ml-4 p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
                    aria-label="Cerrar modal"
                  >
                    <FaTimes className="text-lg md:text-xl text-white" />
                  </button>
                </div>
              </div>

              {/* Content - Responsive: Menos padding en móvil */}
              <div className="p-4 md:p-6">
                {loading && (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-eg-purple border-t-transparent"></div>
                    <p className="mt-4 text-gray-600">Cargando histórico...</p>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
                    <p className="text-red-700 font-semibold mb-2">Error al cargar el histórico</p>
                    <p className="text-red-600 text-sm">{error}</p>
                    <button
                      onClick={() => {
                        const paciente = getPacienteInfo();
                        if (paciente) {
                          fetchHistorico(pruebaId, paciente.ci_paciente, 10);
                        }
                      }}
                      className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Reintentar
                    </button>
                  </div>
                )}

                {!loading && !error && historico && (
                  <>
                    {historico.total === 0 ? (
                      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-8 text-center">
                        <p className="text-yellow-800 font-semibold mb-2">
                          No hay histórico disponible
                        </p>
                        <p className="text-yellow-700 text-sm">
                          Esta es la primera vez que se registra esta prueba para este paciente.
                        </p>
                      </div>
                    ) : historico.total === 1 ? (
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-8 text-center">
                        <p className="text-blue-800 font-semibold mb-2">
                          Histórico insuficiente
                        </p>
                        <p className="text-blue-700 text-sm mb-4">
                          Se necesitan al menos 2 resultados para mostrar la evolución gráfica.
                        </p>
                        <div className="bg-white rounded-lg p-4 inline-block">
                          <p className="text-gray-700">
                            <span className="font-semibold">Valor actual:</span>{' '}
                            {historico.historico[0].valor} {historico.prueba.unidad}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Fecha: {new Date(historico.historico[0].fecha).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Selector de tipo de gráfica - Responsive: Botones más pequeños en móvil */}
                        <div className="flex gap-2 mb-4 md:mb-6">
                          <button
                            onClick={() => setTipoGrafica('linea')}
                            className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-lg transition-all flex-1 md:flex-none justify-center ${
                              tipoGrafica === 'linea'
                                ? 'bg-gradient-to-r from-eg-purple to-eg-pink text-white shadow-lg'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            <FaChartLine className="text-sm md:text-base" />
                            <span className="text-xs md:text-sm font-medium">Línea</span>
                          </button>
                          <button
                            onClick={() => setTipoGrafica('barras')}
                            className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-lg transition-all flex-1 md:flex-none justify-center ${
                              tipoGrafica === 'barras'
                                ? 'bg-gradient-to-r from-eg-purple to-eg-pink text-white shadow-lg'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            <FaChartBar className="text-sm md:text-base" />
                            <span className="text-xs md:text-sm font-medium">Barras</span>
                          </button>
                        </div>

                        {/* Gráfica */}
                        {tipoGrafica === 'linea' ? (
                          <GraficaLinea data={historico.historico} prueba={historico.prueba} />
                        ) : (
                          <GraficaBarras data={historico.historico} prueba={historico.prueba} />
                        )}
                      </>
                    )}
                  </>
                )}
              </div>

              {/* Footer - Responsive: Stack vertical en móvil */}
              <div className="sticky bottom-0 bg-gray-50 p-3 md:p-4 rounded-b-none md:rounded-b-2xl border-t border-gray-200">
                <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-600">
                  <p className="text-center md:text-left">
                    Los valores mostrados corresponden únicamente a resultados validados por el laboratorio.
                  </p>
                  <button
                    onClick={onClose}
                    className="w-full md:w-auto px-4 py-2 bg-gradient-to-r from-eg-purple to-eg-pink text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium whitespace-nowrap"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default HistoricoModal;
