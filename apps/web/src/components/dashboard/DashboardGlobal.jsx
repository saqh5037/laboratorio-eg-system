import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaHistory } from 'react-icons/fa';
import { EstadisticasGlobales } from './EstadisticasGlobales';
import { HeatMapModal } from './HeatMapModal';
import { FiltroFechas } from './FiltroFechas';

/**
 * Componente Dashboard Global del Paciente
 * Muestra resumen de toda la historia clínica del paciente
 * Se muestra en la pantalla principal después de la autenticación
 *
 * @param {Object} props
 * @param {string} props.pacienteNombre - Nombre completo del paciente
 * @param {string} props.pacienteCi - CI del paciente
 * @param {Array} props.ordenes - Array de órdenes del paciente
 */
export function DashboardGlobal({ pacienteNombre, pacienteCi, ordenes = [] }) {
  const [heatMapModalOpen, setHeatMapModalOpen] = useState(false);

  // Extraer el primer nombre para el saludo
  const primerNombre = pacienteNombre ? pacienteNombre.split(' ')[0] : '';

  return (
    <div className="space-y-6 mb-8">
      {/* Header de Bienvenida */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-eg-purple to-eg-pink rounded-2xl p-8 shadow-xl"
      >
        <div className="flex items-center gap-4">
          <div className="text-5xl">👋</div>
          <div>
            <h1 className="text-3xl font-bold text-white">
              ¡Hola{primerNombre ? `, ${primerNombre}` : ''}!
            </h1>
            <p className="text-white/90 text-lg mt-1">
              Bienvenido a tu portal de resultados de laboratorio
            </p>
          </div>
        </div>
      </motion.div>

      {/* Estadísticas Globales */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <EstadisticasGlobales ordenes={ordenes} />
      </motion.div>

      {/* Filtros de Fecha - Oculto en móvil */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="hidden md:block"
      >
        <FiltroFechas />
      </motion.div>

      {/* Acceso Rápido a Heat Map - Oculto en móvil */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="hidden md:block"
      >
        <button
          onClick={() => setHeatMapModalOpen(true)}
          className="w-full bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-eg-purple hover:shadow-xl transition-all duration-300 text-left group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-eg-purple/20 to-eg-pink/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-4xl">🔥</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  Ver Heat Map de Toda tu Historia
                </h3>
                <p className="text-gray-600">
                  Visualiza la evolución de todas tus pruebas de laboratorio en un
                  mapa de calor interactivo
                </p>
              </div>
            </div>
            <div className="text-eg-purple group-hover:translate-x-2 transition-transform">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </button>
      </motion.div>

      {/* Tip Informativo - Oculto en móvil */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="hidden md:block bg-blue-50 border-2 border-blue-200 rounded-xl p-6"
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h3 className="text-lg font-bold text-blue-900 mb-2">
              Tip de Navegación
            </h3>
            <p className="text-blue-800">
              Selecciona cualquier orden de la lista para ver los resultados
              detallados y el dashboard específico de esa orden con tu Health Score y
              análisis completo.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Separador visual */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center gap-4 py-4"
      >
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-eg-purple/30 to-transparent"></div>
        <div className="flex items-center gap-2 text-eg-purple">
          <FaHistory className="text-xl" />
          <span className="font-semibold">Mis Órdenes de Laboratorio</span>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-eg-purple/30 to-transparent"></div>
      </motion.div>

      {/* Modal de Heat Map */}
      <HeatMapModal
        isOpen={heatMapModalOpen}
        onClose={() => setHeatMapModalOpen(false)}
        pacienteCi={pacienteCi}
      />
    </div>
  );
}

export default DashboardGlobal;
