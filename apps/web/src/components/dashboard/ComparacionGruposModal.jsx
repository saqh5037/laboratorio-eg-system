import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaArrowLeft } from 'react-icons/fa';
import { SelectorGrupoPruebas } from './SelectorGrupoPruebas';
import { GraficaMultiPrueba } from './GraficaMultiPrueba';
import { useDashboardData } from '../../hooks/useDashboardData';
import { useFiltros } from '../../contexts/FiltrosContext';

/**
 * Modal para comparación de grupos de pruebas
 * @param {Object} props
 * @param {boolean} props.isOpen - Si el modal está abierto
 * @param {Function} props.onClose - Callback para cerrar
 * @param {Array} props.resultados - Resultados disponibles
 * @param {string} props.pacienteCi - CI del paciente
 */
export function ComparacionGruposModal({ isOpen, onClose, resultados = [], pacienteCi }) {
  const [paso, setPaso] = useState('seleccion'); // 'seleccion' o 'visualizacion'
  const [pruebasSeleccionadas, setPruebasSeleccionadas] = useState([]);
  const { historicoMultiple, loading, fetchHistoricoMultiple } = useDashboardData([]);
  const { fechaDesde, fechaHasta } = useFiltros();

  // Reset al abrir el modal
  useEffect(() => {
    if (isOpen) {
      setPaso('seleccion');
      setPruebasSeleccionadas([]);
    }
  }, [isOpen]);

  // Recargar datos cuando cambien los filtros en modo visualización
  useEffect(() => {
    if (paso === 'visualizacion' && pruebasSeleccionadas.length > 0) {
      fetchHistoricoMultiple(pruebasSeleccionadas, 10);
    }
  }, [fechaDesde, fechaHasta]); // Solo reacciona a cambios en los filtros

  // Manejar selección de grupo
  const handleGrupoSeleccionado = async (pruebaIds) => {
    setPruebasSeleccionadas(pruebaIds);
    setPaso('cargando');

    try {
      await fetchHistoricoMultiple(pruebaIds, 10);
      setPaso('visualizacion');
    } catch (error) {
      console.error('Error al cargar histórico múltiple:', error);
      setPaso('seleccion');
    }
  };

  // Volver a selección
  const handleVolver = () => {
    setPaso('seleccion');
    setPruebasSeleccionadas([]);
  };

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
          className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-eg-purple to-eg-pink p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {paso === 'visualizacion' && (
                <button
                  onClick={handleVolver}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  aria-label="Volver"
                >
                  <FaArrowLeft className="text-white text-xl" />
                </button>
              )}
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {paso === 'seleccion' && 'Comparar Grupos de Pruebas'}
                  {paso === 'cargando' && 'Cargando Histórico...'}
                  {paso === 'visualizacion' && 'Comparación de Pruebas'}
                </h2>
                <p className="text-white/90 text-sm mt-1">
                  {paso === 'seleccion' &&
                    'Selecciona un grupo pre-configurado o elige manualmente las pruebas'}
                  {paso === 'cargando' && 'Obteniendo datos históricos...'}
                  {paso === 'visualizacion' &&
                    `Comparando ${pruebasSeleccionadas.length} pruebas`}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Cerrar"
            >
              <FaTimes className="text-white text-2xl" />
            </button>
          </div>

          {/* Contenido */}
          <div className="flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              {paso === 'seleccion' && (
                <motion.div
                  key="seleccion"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <SelectorGrupoPruebas
                    resultados={resultados}
                    onGrupoSeleccionado={handleGrupoSeleccionado}
                    onClose={onClose}
                  />
                </motion.div>
              )}

              {paso === 'cargando' && (
                <motion.div
                  key="cargando"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center h-96"
                >
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-eg-purple border-t-transparent mx-auto"></div>
                    <p className="mt-4 text-gray-600 text-lg">
                      Cargando histórico de {pruebasSeleccionadas.length} pruebas...
                    </p>
                    <p className="text-sm text-gray-500 mt-2">Esto puede tomar unos segundos</p>
                  </div>
                </motion.div>
              )}

              {paso === 'visualizacion' && (
                <motion.div
                  key="visualizacion"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <GraficaMultiPrueba
                    historicoMultiple={historicoMultiple?.pruebas || []}
                    loading={loading.multiple}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default ComparacionGruposModal;
