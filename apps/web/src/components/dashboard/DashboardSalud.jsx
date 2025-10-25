import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaChartBar, FaHistory, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useDashboardData } from '../../hooks/useDashboardData';
import { HealthScore } from './HealthScore';
import { AlertSemaforo } from './AlertSemaforo';
import { MiniGraficaPrueba } from './MiniGraficaPrueba';
import { HistoricoModal } from '../historico/HistoricoModal';
import { ComparacionGruposModal } from './ComparacionGruposModal';
import { HeatMapModal } from './HeatMapModal';
import { FiltroFechas } from './FiltroFechas';
import { generarRecomendaciones } from '../../utils/healthScoreCalculator';

/**
 * Componente principal del Dashboard de Salud
 * @param {Object} props
 * @param {Array} props.resultados - Array de resultados de la orden actual
 * @param {string} props.pacienteCi - CI del paciente
 */
export function DashboardSalud({ resultados = [], pacienteCi }) {
  const { healthScore, loading, error } = useDashboardData(resultados);
  const [isExpanded, setIsExpanded] = useState(false); // Contraído por defecto
  const [historicoModalOpen, setHistoricoModalOpen] = useState(false);
  const [pruebaSeleccionada, setPruebaSeleccionada] = useState(null);
  const [comparacionModalOpen, setComparacionModalOpen] = useState(false);
  const [heatMapModalOpen, setHeatMapModalOpen] = useState(false);

  // Filtrar solo resultados con valores numéricos para mostrar sparklines
  const resultadosConHistorico = resultados
    .filter((r) => r.valorNumerico != null)
    .slice(0, 6); // Mostrar máximo 6 sparklines

  const handleVerHistorico = (resultado) => {
    setPruebaSeleccionada({
      id: resultado.prueba_id,
      nombre: resultado.prueba_nombre,
    });
    setHistoricoModalOpen(true);
  };

  const recomendaciones = healthScore ? generarRecomendaciones(healthScore) : [];

  return (
    <div className="mb-8">
      {/* Header colapsable */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gradient-to-r from-eg-purple to-eg-pink rounded-t-2xl p-6 shadow-lg cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-3xl">📊</div>
            <div>
              <h2 className="text-2xl font-bold text-white">Dashboard de Salud</h2>
              <p className="text-white/90 text-sm mt-1">
                Resumen visual de tu estado de salud actual
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {healthScore && (
              <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                <div className="text-white text-center">
                  <div className="text-2xl font-bold">{healthScore.score}</div>
                  <div className="text-xs">Score</div>
                </div>
              </div>
            )}
            <button className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
              {isExpanded ? (
                <FaChevronUp className="text-2xl" />
              ) : (
                <FaChevronDown className="text-2xl" />
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Contenido del dashboard */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-gray-50 rounded-b-2xl p-6 shadow-lg border-x-2 border-b-2 border-gray-100"
        >
          {error && (
            <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <p className="text-red-800 font-semibold">Error al cargar el dashboard</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          )}

          {/* Grid principal: Health Score y Alert Semaforo */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <HealthScore
              score={healthScore?.score}
              nivel={healthScore?.nivel}
              detalles={healthScore?.detalles}
              loading={loading.score}
            />
            <AlertSemaforo resultados={resultados} loading={loading.score} />
          </div>

          {/* Filtros de Fecha - Oculto en móvil */}
          <div className="mb-6 hidden md:block">
            <FiltroFechas />
          </div>

          {/* Recomendaciones */}
          {recomendaciones.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl"
            >
              <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
                <span>💡</span>
                Recomendaciones
              </h3>
              <ul className="space-y-2">
                {recomendaciones.map((recomendacion, index) => (
                  <li key={index} className="text-sm text-blue-800 flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>{recomendacion}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Mini gráficas (Sparklines) */}
          {resultadosConHistorico.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <FaHistory className="text-xl text-eg-purple" />
                <h3 className="text-lg font-bold text-gray-900">
                  Tendencias Recientes
                </h3>
                <span className="text-sm text-gray-600">
                  ({resultadosConHistorico.length} pruebas con histórico)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {resultadosConHistorico.map((resultado, index) => (
                  <motion.div
                    key={resultado.prueba_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <MiniGraficaPrueba
                      pruebaNombre={resultado.prueba_nombre}
                      nomenclatura={resultado.nomenclatura}
                      historico={[
                        {
                          valorNumerico: resultado.valorNumerico,
                          fecha: new Date(),
                        },
                      ]} // Solo valor actual por ahora
                      valor={resultado.valor}
                      unidad={resultado.unidad}
                      estado={resultado.estado}
                      esCritico={resultado.esCritico}
                      onClick={() => handleVerHistorico(resultado)}
                    />
                  </motion.div>
                ))}
              </div>

              {resultados.length > resultadosConHistorico.length && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">
                    + {resultados.length - resultadosConHistorico.length} pruebas más sin
                    histórico numérico
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Botones de acción adicionales - Oculto en móvil */}
          <div className="mt-6 pt-6 border-t border-gray-200 hidden md:block">
            <div className="flex flex-wrap gap-3">
              <button
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-eg-purple to-eg-pink text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium"
                onClick={() => setComparacionModalOpen(true)}
              >
                <FaChartBar />
                Comparar Grupos de Pruebas
              </button>

              <button
                className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-eg-purple text-eg-purple rounded-lg hover:bg-eg-purple hover:text-white transition-all text-sm font-medium"
                onClick={() => setHeatMapModalOpen(true)}
              >
                <FaHistory />
                Ver Heat Map Completo
              </button>
            </div>
          </div>

          {/* Información adicional */}
          <div className="mt-4 text-xs text-gray-500 text-center">
            <p>
              Los datos mostrados corresponden a los resultados validados de tu última
              orden de laboratorio.
            </p>
            <p className="mt-1">
              Las recomendaciones son generales. Consulta con tu médico para orientación
              personalizada.
            </p>
          </div>
        </motion.div>
      )}

      {/* Modal de Histórico */}
      {pruebaSeleccionada && (
        <HistoricoModal
          isOpen={historicoModalOpen}
          onClose={() => {
            setHistoricoModalOpen(false);
            setPruebaSeleccionada(null);
          }}
          pruebaId={pruebaSeleccionada.id}
          pruebaNombre={pruebaSeleccionada.nombre}
          pacienteCi={pacienteCi}
        />
      )}

      {/* Modal de Comparación de Grupos */}
      <ComparacionGruposModal
        isOpen={comparacionModalOpen}
        onClose={() => setComparacionModalOpen(false)}
        resultados={resultados}
        pacienteCi={pacienteCi}
      />

      {/* Modal de Heat Map */}
      <HeatMapModal
        isOpen={heatMapModalOpen}
        onClose={() => setHeatMapModalOpen(false)}
        pacienteCi={pacienteCi}
      />
    </div>
  );
}

export default DashboardSalud;
