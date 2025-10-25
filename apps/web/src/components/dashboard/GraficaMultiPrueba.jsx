import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Colores para las diferentes líneas de las pruebas
 */
const COLORES_LINEAS = [
  '#8b5cf6', // purple-500
  '#ec4899', // pink-500
  '#3b82f6', // blue-500
  '#10b981', // green-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#06b6d4', // cyan-500
  '#8b5cf6', // purple-500 (repetir si hay más de 7)
];

/**
 * Componente para gráfica comparativa de múltiples pruebas
 * @param {Object} props
 * @param {Array} props.historicoMultiple - Array de objetos con histórico de cada prueba
 * @param {boolean} props.loading - Estado de carga
 */
export function GraficaMultiPrueba({ historicoMultiple = [], loading = false }) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl p-8 border-2 border-gray-100 shadow-lg">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-eg-purple border-t-transparent mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando histórico...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!historicoMultiple || historicoMultiple.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 border-2 border-gray-100 shadow-lg">
        <div className="flex flex-col items-center justify-center h-96">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-gray-600 text-center">No hay datos históricos disponibles</p>
        </div>
      </div>
    );
  }

  // Preparar datos para la gráfica
  // Necesitamos combinar todos los históricos en un formato que Recharts pueda usar
  // Formato: [{ fecha: '2024-01-01', prueba1: 10, prueba2: 20, ... }]

  // Primero, recopilar todas las fechas únicas
  const fechasSet = new Set();
  historicoMultiple.forEach((item) => {
    item.historico.forEach((h) => {
      const fechaStr = format(new Date(h.fecha), 'yyyy-MM-dd');
      fechasSet.add(fechaStr);
    });
  });

  // Convertir a array y ordenar
  const fechasOrdenadas = Array.from(fechasSet).sort();

  // Crear estructura de datos para la gráfica
  const datosGrafica = fechasOrdenadas.map((fecha) => {
    const punto = { fecha };

    historicoMultiple.forEach((item, index) => {
      const historicoPrueba = item.historico.find((h) => {
        const fechaH = format(new Date(h.fecha), 'yyyy-MM-dd');
        return fechaH === fecha;
      });

      if (historicoPrueba && historicoPrueba.valorNumerico != null) {
        punto[item.prueba.nomenclatura || item.prueba.nombre] =
          historicoPrueba.valorNumerico;
      }
    });

    return punto;
  });

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border-2 border-gray-200 rounded-lg shadow-xl">
          <p className="font-semibold text-gray-900 mb-2">
            {format(new Date(label), "d 'de' MMMM, yyyy", { locale: es })}
          </p>
          {payload.map((entry, index) => {
            const pruebaData = historicoMultiple.find(
              (h) => (h.prueba.nomenclatura || h.prueba.nombre) === entry.name
            );
            const unidad = pruebaData?.prueba.unidad || '';

            return (
              <div key={index} className="flex items-center gap-2 mt-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-gray-700">{entry.name}:</span>
                <span className="text-sm font-semibold text-gray-900">
                  {typeof entry.value === 'number'
                    ? entry.value.toFixed(2)
                    : entry.value}{' '}
                  {unidad}
                </span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  // Formatear fecha para eje X
  const formatearFecha = (fecha) => {
    return format(new Date(fecha), 'dd/MM', { locale: es });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 border-2 border-gray-100 shadow-lg"
    >
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span>📈</span>
          Comparación de Pruebas
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Evolución histórica de {historicoMultiple.length}{' '}
          {historicoMultiple.length === 1 ? 'prueba' : 'pruebas'}
        </p>
      </div>

      {/* Leyenda con información de las pruebas */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {historicoMultiple.map((item, index) => {
            const color = COLORES_LINEAS[index % COLORES_LINEAS.length];
            const ultimoValor = item.historico[0];

            return (
              <div
                key={index}
                className="flex items-center gap-3 p-2 bg-white rounded border border-gray-200"
              >
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {item.prueba.nombre}
                  </p>
                  <p className="text-xs text-gray-600">
                    {item.prueba.nomenclatura}
                  </p>
                </div>
                {ultimoValor && (
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">
                      {typeof ultimoValor.valorNumerico === 'number'
                        ? ultimoValor.valorNumerico.toFixed(2)
                        : ultimoValor.valorNumerico}
                    </p>
                    <p className="text-xs text-gray-600">{item.prueba.unidad}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Gráfica */}
      <div className="w-full" style={{ height: '500px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={datosGrafica}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="fecha"
              tickFormatter={formatearFecha}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6b7280' }}
              label={{
                value: 'Valor',
                angle: -90,
                position: 'insideLeft',
                style: { fontSize: 12, fill: '#6b7280' },
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
              formatter={(value) => {
                const prueba = historicoMultiple.find(
                  (h) => (h.prueba.nomenclatura || h.prueba.nombre) === value
                );
                return prueba?.prueba.nombre || value;
              }}
            />

            {/* Líneas para cada prueba */}
            {historicoMultiple.map((item, index) => {
              const key = item.prueba.nomenclatura || item.prueba.nombre;
              const color = COLORES_LINEAS[index % COLORES_LINEAS.length];

              return (
                <Line
                  key={index}
                  type="monotone"
                  dataKey={key}
                  name={key}
                  stroke={color}
                  strokeWidth={3}
                  dot={{ fill: color, r: 5 }}
                  activeDot={{ r: 7 }}
                  connectNulls
                  animationDuration={1000}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Estadísticas */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {historicoMultiple.map((item, index) => {
          const color = COLORES_LINEAS[index % COLORES_LINEAS.length];
          const valores = item.historico
            .map((h) => h.valorNumerico)
            .filter((v) => v != null && typeof v === 'number');

          if (valores.length === 0) return null;

          const promedio = valores.reduce((a, b) => a + b, 0) / valores.length;
          const min = Math.min(...valores);
          const max = Math.max(...valores);

          return (
            <div
              key={index}
              className="p-4 rounded-lg border-2"
              style={{ borderColor: color, backgroundColor: `${color}15` }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <p className="text-xs font-semibold text-gray-900 truncate">
                  {item.prueba.nomenclatura}
                </p>
              </div>
              <div className="space-y-1 text-xs text-gray-700">
                <div className="flex justify-between">
                  <span>Promedio:</span>
                  <span className="font-semibold">{promedio.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Mín:</span>
                  <span className="font-semibold">{min.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Máx:</span>
                  <span className="font-semibold">{max.toFixed(2)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Nota */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          💡 <strong>Nota:</strong> Esta gráfica muestra la evolución de múltiples
          pruebas a lo largo del tiempo. Los puntos conectados representan resultados
          validados en diferentes fechas.
        </p>
      </div>
    </motion.div>
  );
}

export default GraficaMultiPrueba;
