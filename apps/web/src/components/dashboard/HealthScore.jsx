import { motion } from 'framer-motion';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';
import { getColorPorScore } from '../../utils/healthScoreCalculator';

/**
 * Componente de Score de Salud con gauge visual
 * @param {Object} props
 * @param {number} props.score - Score de salud (0-100)
 * @param {string} props.nivel - Nivel de salud (excelente, bueno, atencion, critico)
 * @param {Object} props.detalles - Detalles del cálculo
 * @param {boolean} props.loading - Estado de carga
 */
export function HealthScore({ score = 0, nivel = 'sin_datos', detalles, loading = false }) {
  const colorInfo = getColorPorScore(score);

  // Datos para el gauge
  const data = [
    {
      name: 'Score',
      value: score,
      fill: colorInfo.color,
    },
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-eg-purple border-t-transparent"></div>
          <p className="mt-4 text-gray-600 text-sm">Calculando score...</p>
        </div>
      </div>
    );
  }

  if (nivel === 'sin_datos') {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-gray-600 text-center">
            No hay datos suficientes para calcular el score de salud
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100 hover:shadow-xl transition-shadow"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="text-2xl">{colorInfo.emoji}</div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Score de Salud</h3>
          <p className="text-sm text-gray-600">Basado en tus últimos resultados</p>
        </div>
      </div>

      {/* Gauge Chart */}
      <div className="relative">
        <ResponsiveContainer width="100%" height={200}>
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="70%"
            outerRadius="100%"
            barSize={20}
            data={data}
            startAngle={180}
            endAngle={0}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              background={{ fill: '#f3f4f6' }}
              clockWise
              dataKey="value"
              cornerRadius={10}
              fill={colorInfo.color}
              animationDuration={1000}
            />
          </RadialBarChart>
        </ResponsiveContainer>

        {/* Score central */}
        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ top: '35%' }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="text-center"
          >
            <div className="text-5xl font-bold" style={{ color: colorInfo.color }}>
              {score}
            </div>
            <div className={`text-sm font-semibold mt-1 bg-gradient-to-r ${colorInfo.gradient} bg-clip-text text-transparent`}>
              {colorInfo.label}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Estadísticas detalladas */}
      {detalles && (
        <div className="mt-6 space-y-3">
          {/* Barra de progreso de valores normales */}
          <div>
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Valores Normales</span>
              <span className="font-semibold">{detalles.porcentajeNormales}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${detalles.porcentajeNormales}%` }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
              />
            </div>
          </div>

          {/* Grid de contadores */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{detalles.normales}</div>
              <div className="text-xs text-gray-600 mt-1">Normales</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{detalles.anormales}</div>
              <div className="text-xs text-gray-600 mt-1">Anormales</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{detalles.criticos}</div>
              <div className="text-xs text-gray-600 mt-1">Críticos</div>
            </div>
          </div>

          {/* Total de pruebas */}
          <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-100">
            Total: {detalles.total} {detalles.total === 1 ? 'prueba' : 'pruebas'} analizadas
          </div>
        </div>
      )}

      {/* Indicador de nivel crítico */}
      {detalles?.criticos > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-4 p-3 bg-red-50 border-2 border-red-200 rounded-lg"
        >
          <div className="flex items-start gap-2">
            <span className="text-red-600 text-lg">🚨</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800">Atención Requerida</p>
              <p className="text-xs text-red-700 mt-1">
                Tiene {detalles.criticos} {detalles.criticos === 1 ? 'valor crítico' : 'valores críticos'}.
                Consulte con su médico inmediatamente.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default HealthScore;
