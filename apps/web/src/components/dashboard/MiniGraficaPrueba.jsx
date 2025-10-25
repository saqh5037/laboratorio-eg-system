import { motion } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { FaChartLine, FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa';
import { calcularTendencia } from '../../utils/healthScoreCalculator';

/**
 * Componente de mini gráfica (sparkline) para mostrar tendencia de una prueba
 * @param {Object} props
 * @param {string} props.pruebaNombre - Nombre de la prueba
 * @param {string} props.nomenclatura - Nomenclatura de la prueba
 * @param {Array} props.historico - Array de datos históricos
 * @param {string} props.valor - Valor actual
 * @param {string} props.unidad - Unidad de medida
 * @param {string} props.estado - Estado del resultado (normal, bajo, alto)
 * @param {boolean} props.esCritico - Si el valor es crítico
 * @param {Function} props.onClick - Callback al hacer click
 */
export function MiniGraficaPrueba({
  pruebaNombre,
  nomenclatura,
  historico = [],
  valor,
  unidad,
  estado = 'sin_rango',
  esCritico = false,
  onClick,
}) {
  // Preparar datos para la sparkline (últimos 5 valores)
  const sparklineData = historico
    .slice(-5)
    .map((item) => ({
      valor: item.valorNumerico,
    }))
    .filter((item) => item.valor != null);

  // Calcular tendencia
  const tendencia = calcularTendencia(historico);

  // Determinar color según estado
  const getColorByEstado = () => {
    if (esCritico) return 'red';
    switch (estado) {
      case 'normal':
        return 'green';
      case 'bajo':
        return 'yellow';
      case 'alto':
        return 'red';
      default:
        return 'gray';
    }
  };

  const color = getColorByEstado();

  const colorClasses = {
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      line: '#10b981',
      badge: 'bg-green-100 text-green-700',
      hover: 'hover:bg-green-100',
    },
    yellow: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-700',
      line: '#eab308',
      badge: 'bg-yellow-100 text-yellow-700',
      hover: 'hover:bg-yellow-100',
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      line: '#ef4444',
      badge: 'bg-red-100 text-red-700',
      hover: 'hover:bg-red-100',
    },
    gray: {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      text: 'text-gray-700',
      line: '#6b7280',
      badge: 'bg-gray-100 text-gray-700',
      hover: 'hover:bg-gray-100',
    },
  };

  const classes = colorClasses[color];

  // Tooltip personalizado para sparkline
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-2 py-1 border border-gray-300 rounded shadow-md text-xs">
          <p className="font-semibold">{payload[0].value} {unidad}</p>
        </div>
      );
    }
    return null;
  };

  // Icono de tendencia
  const getTendenciaIcon = () => {
    if (Math.abs(tendencia.porcentaje) < 5) {
      return <FaMinus className="text-gray-500" />;
    } else if (tendencia.cambio > 0) {
      return <FaArrowUp className="text-blue-500" />;
    } else {
      return <FaArrowDown className="text-orange-500" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={`${classes.bg} border-2 ${classes.border} rounded-xl p-4 cursor-pointer transition-all ${classes.hover} hover:shadow-md`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="text-sm font-bold text-gray-900 line-clamp-1">
            {pruebaNombre}
          </h4>
          {nomenclatura && (
            <p className="text-xs text-gray-600 mt-0.5">({nomenclatura})</p>
          )}
        </div>
        <FaChartLine className={`${classes.text} text-sm ml-2 flex-shrink-0`} />
      </div>

      {/* Valor Actual */}
      <div className="mb-3">
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl font-bold ${classes.text}`}>
            {valor}
          </span>
          <span className="text-sm text-gray-600">{unidad}</span>
        </div>

        {/* Badge de estado */}
        <div className="mt-2">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${classes.badge}`}>
            {esCritico && '⚡ '}
            {estado === 'normal' && '✓ Normal'}
            {estado === 'bajo' && '↓ Bajo'}
            {estado === 'alto' && '↑ Alto'}
            {estado === 'sin_rango' && '— Sin rango'}
          </span>
        </div>
      </div>

      {/* Sparkline */}
      {sparklineData.length >= 2 ? (
        <div className="h-12 mb-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparklineData}>
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="valor"
                stroke={classes.line}
                strokeWidth={2}
                dot={false}
                animationDuration={500}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-12 flex items-center justify-center">
          <p className="text-xs text-gray-500 italic">Sin histórico suficiente</p>
        </div>
      )}

      {/* Tendencia */}
      {sparklineData.length >= 2 && (
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            {getTendenciaIcon()}
            <span className="text-gray-600">
              {Math.abs(tendencia.porcentaje) < 5
                ? 'Estable'
                : tendencia.cambio > 0
                ? `+${tendencia.porcentaje}%`
                : `${tendencia.porcentaje}%`}
            </span>
          </div>
          <span className="text-gray-500">{historico.length} resultados</span>
        </div>
      )}

      {/* Click para ver más */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Click para ver histórico completo
        </p>
      </div>
    </motion.div>
  );
}

export default MiniGraficaPrueba;
