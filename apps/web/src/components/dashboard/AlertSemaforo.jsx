import { motion } from 'framer-motion';
import { FaCheckCircle, FaExclamationTriangle, FaExclamationCircle } from 'react-icons/fa';

/**
 * Componente de sistema de alertas tipo semáforo
 * @param {Object} props
 * @param {Array} props.resultados - Array de resultados para analizar
 * @param {boolean} props.loading - Estado de carga
 */
export function AlertSemaforo({ resultados = [], loading = false }) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-eg-purple border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (!resultados || resultados.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
        <div className="flex flex-col items-center justify-center h-48">
          <div className="text-4xl mb-3">🚦</div>
          <p className="text-gray-600 text-center">No hay resultados para analizar</p>
        </div>
      </div>
    );
  }

  // Clasificar resultados
  const normales = resultados.filter((r) => r.estado === 'normal' && !r.esCritico);
  const advertencias = resultados.filter(
    (r) => (r.estado === 'bajo' || r.estado === 'alto') && !r.esCritico
  );
  const criticos = resultados.filter((r) => r.esCritico);

  // Determinar nivel de alerta general
  let nivelGeneral = 'normal';
  let colorGeneral = 'green';
  let iconoGeneral = <FaCheckCircle />;
  let mensajeGeneral = 'Todos los resultados están dentro del rango normal';

  if (criticos.length > 0) {
    nivelGeneral = 'critico';
    colorGeneral = 'red';
    iconoGeneral = <FaExclamationCircle />;
    mensajeGeneral = `${criticos.length} ${criticos.length === 1 ? 'valor crítico detectado' : 'valores críticos detectados'}`;
  } else if (advertencias.length > 0) {
    nivelGeneral = 'advertencia';
    colorGeneral = 'yellow';
    iconoGeneral = <FaExclamationTriangle />;
    mensajeGeneral = `${advertencias.length} ${advertencias.length === 1 ? 'valor' : 'valores'} fuera del rango normal`;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100 hover:shadow-xl transition-shadow"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="text-2xl">🚦</div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Alertas de Salud</h3>
          <p className="text-sm text-gray-600">Semáforo de estado general</p>
        </div>
      </div>

      {/* Semáforo visual */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative">
          {/* Contenedor del semáforo */}
          <div className="bg-gray-800 rounded-3xl p-4 shadow-xl">
            <div className="space-y-3">
              {/* Luz Verde - Normal */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0.3 }}
                animate={{
                  scale: nivelGeneral === 'normal' ? 1.1 : 0.9,
                  opacity: nivelGeneral === 'normal' ? 1 : 0.3,
                }}
                transition={{ duration: 0.5 }}
                className={`w-16 h-16 rounded-full ${
                  nivelGeneral === 'normal'
                    ? 'bg-green-500 shadow-lg shadow-green-500/50'
                    : 'bg-green-900'
                }`}
              >
                {nivelGeneral === 'normal' && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-full h-full rounded-full bg-green-400 opacity-50"
                  />
                )}
              </motion.div>

              {/* Luz Amarilla - Advertencia */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0.3 }}
                animate={{
                  scale: nivelGeneral === 'advertencia' ? 1.1 : 0.9,
                  opacity: nivelGeneral === 'advertencia' ? 1 : 0.3,
                }}
                transition={{ duration: 0.5 }}
                className={`w-16 h-16 rounded-full ${
                  nivelGeneral === 'advertencia'
                    ? 'bg-yellow-500 shadow-lg shadow-yellow-500/50'
                    : 'bg-yellow-900'
                }`}
              >
                {nivelGeneral === 'advertencia' && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-full h-full rounded-full bg-yellow-400 opacity-50"
                  />
                )}
              </motion.div>

              {/* Luz Roja - Crítico */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0.3 }}
                animate={{
                  scale: nivelGeneral === 'critico' ? 1.1 : 0.9,
                  opacity: nivelGeneral === 'critico' ? 1 : 0.3,
                }}
                transition={{ duration: 0.5 }}
                className={`w-16 h-16 rounded-full ${
                  nivelGeneral === 'critico'
                    ? 'bg-red-500 shadow-lg shadow-red-500/50'
                    : 'bg-red-900'
                }`}
              >
                {nivelGeneral === 'critico' && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="w-full h-full rounded-full bg-red-400 opacity-50"
                  />
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Mensaje de estado general */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className={`p-4 rounded-lg border-2 ${
          nivelGeneral === 'normal'
            ? 'bg-green-50 border-green-200'
            : nivelGeneral === 'advertencia'
            ? 'bg-yellow-50 border-yellow-200'
            : 'bg-red-50 border-red-200'
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`text-2xl ${
              nivelGeneral === 'normal'
                ? 'text-green-600'
                : nivelGeneral === 'advertencia'
                ? 'text-yellow-600'
                : 'text-red-600'
            }`}
          >
            {iconoGeneral}
          </div>
          <div className="flex-1">
            <p
              className={`font-semibold ${
                nivelGeneral === 'normal'
                  ? 'text-green-800'
                  : nivelGeneral === 'advertencia'
                  ? 'text-yellow-800'
                  : 'text-red-800'
              }`}
            >
              {mensajeGeneral}
            </p>
            <p
              className={`text-sm mt-1 ${
                nivelGeneral === 'normal'
                  ? 'text-green-700'
                  : nivelGeneral === 'advertencia'
                  ? 'text-yellow-700'
                  : 'text-red-700'
              }`}
            >
              {nivelGeneral === 'normal' && 'Continúe con sus hábitos saludables.'}
              {nivelGeneral === 'advertencia' &&
                'Algunos valores requieren atención. Consulte con su médico.'}
              {nivelGeneral === 'critico' &&
                'Se detectaron valores críticos. Contacte a su médico inmediatamente.'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Desglose de alertas */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        {/* Normal */}
        <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="text-2xl font-bold text-green-600">{normales.length}</div>
          <div className="text-xs text-green-700 mt-1 font-medium">Normales</div>
          <FaCheckCircle className="text-green-500 mx-auto mt-2 text-lg" />
        </div>

        {/* Advertencia */}
        <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="text-2xl font-bold text-yellow-600">{advertencias.length}</div>
          <div className="text-xs text-yellow-700 mt-1 font-medium">Advertencia</div>
          <FaExclamationTriangle className="text-yellow-500 mx-auto mt-2 text-lg" />
        </div>

        {/* Crítico */}
        <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
          <div className="text-2xl font-bold text-red-600">{criticos.length}</div>
          <div className="text-xs text-red-700 mt-1 font-medium">Crítico</div>
          <FaExclamationCircle className="text-red-500 mx-auto mt-2 text-lg" />
        </div>
      </div>

      {/* Lista de valores críticos */}
      {criticos.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ delay: 0.7 }}
          className="mt-4 p-3 bg-red-50 border-2 border-red-200 rounded-lg"
        >
          <p className="text-sm font-semibold text-red-800 mb-2">
            ⚡ Valores Críticos Detectados:
          </p>
          <ul className="space-y-1">
            {criticos.slice(0, 5).map((resultado, index) => (
              <li key={index} className="text-xs text-red-700 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                <span className="font-medium">{resultado.prueba_nombre}:</span>
                <span>{resultado.valor} {resultado.unidad}</span>
              </li>
            ))}
            {criticos.length > 5 && (
              <li className="text-xs text-red-600 italic">
                ...y {criticos.length - 5} más
              </li>
            )}
          </ul>
        </motion.div>
      )}

      {/* Lista de valores con advertencia */}
      {advertencias.length > 0 && criticos.length === 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ delay: 0.7 }}
          className="mt-4 p-3 bg-yellow-50 border-2 border-yellow-200 rounded-lg"
        >
          <p className="text-sm font-semibold text-yellow-800 mb-2">
            ⚠️ Valores Fuera del Rango:
          </p>
          <ul className="space-y-1">
            {advertencias.slice(0, 5).map((resultado, index) => (
              <li key={index} className="text-xs text-yellow-700 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                <span className="font-medium">{resultado.prueba_nombre}:</span>
                <span>{resultado.valor} {resultado.unidad}</span>
                <span className="text-yellow-600">
                  ({resultado.estado === 'bajo' ? '↓ Bajo' : '↑ Alto'})
                </span>
              </li>
            ))}
            {advertencias.length > 5 && (
              <li className="text-xs text-yellow-600 italic">
                ...y {advertencias.length - 5} más
              </li>
            )}
          </ul>
        </motion.div>
      )}
    </motion.div>
  );
}

export default AlertSemaforo;
