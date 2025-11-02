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
  ReferenceArea,
  Dot,
} from 'recharts';
import { formatearNumero } from '../../utils/formatters';

/**
 * Componente de gráfica de línea con zona de rango de referencia
 * @param {Object} props
 * @param {Array} props.data - Array de datos históricos
 * @param {Object} props.prueba - Información de la prueba
 * @param {string} props.numeroOrdenActual - Número de la orden actual para resaltarla
 */
export function GraficaLinea({ data, prueba, numeroOrdenActual }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No hay datos suficientes para mostrar la gráfica</p>
      </div>
    );
  }

  // Verificar si es una prueba alfanumérica (texto)
  const esAlfanumerica = data.every(item => item.valorNumerico === null && item.valorTexto !== null);

  // Si es alfanumérica, mostrar tabla en lugar de gráfica
  if (esAlfanumerica) {
    const dataOrdenada = [...data].reverse(); // Cronológico (más antiguo primero)

    return (
      <div className="w-full">
        {/* Header */}
        <div className="mb-4 p-4 bg-gradient-to-r from-eg-purple/5 to-eg-pink/5 rounded-lg">
          <h3 className="text-lg font-bold text-gray-900">{prueba.nombre}</h3>
          <p className="text-sm text-gray-500 mt-1">
            Histórico de resultados ({dataOrdenada.length} {dataOrdenada.length === 1 ? 'registro' : 'registros'})
          </p>
          {prueba.unidad && (
            <p className="text-xs text-gray-600 mt-1">
              Unidad: {prueba.unidad}
            </p>
          )}
        </div>

        {/* Tabla Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-collapse bg-white rounded-lg shadow-md">
            <thead>
              <tr className="bg-gradient-to-r from-eg-purple to-eg-pink text-white">
                <th className="px-4 py-3 text-left text-sm font-bold">Fecha</th>
                <th className="px-4 py-3 text-left text-sm font-bold">Orden</th>
                <th className="px-4 py-3 text-left text-sm font-bold">Resultado</th>
              </tr>
            </thead>
            <tbody>
              {dataOrdenada.map((item, index) => {
                const esOrdenActual = item.numeroOrden === numeroOrdenActual;
                return (
                  <tr
                    key={index}
                    className={`border-b border-gray-200 transition-colors ${
                      esOrdenActual
                        ? 'bg-eg-purple/10 font-bold'
                        : index % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50/50 hover:bg-gray-100'
                    }`}
                  >
                    <td className="px-4 py-3 text-sm">
                      {new Date(item.fecha).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={esOrdenActual ? 'text-eg-purple font-bold' : ''}>
                        #{item.numeroOrden}
                        {esOrdenActual && (
                          <span className="ml-2 text-xs bg-eg-purple text-white px-2 py-0.5 rounded">
                            Actual
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {item.valorTexto}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Cards Móvil */}
        <div className="md:hidden space-y-3">
          {dataOrdenada.map((item, index) => {
            const esOrdenActual = item.numeroOrden === numeroOrdenActual;
            return (
              <div
                key={index}
                className={`rounded-lg border-2 p-4 ${
                  esOrdenActual
                    ? 'bg-eg-purple/10 border-eg-purple shadow-lg'
                    : 'bg-white border-gray-200 shadow'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs text-gray-600">
                    {new Date(item.fecha).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded font-medium ${
                    esOrdenActual
                      ? 'bg-eg-purple text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    #{item.numeroOrden}
                    {esOrdenActual && ' (Actual)'}
                  </span>
                </div>
                <p className="text-base font-semibold text-gray-900">{item.valorTexto}</p>
              </div>
            );
          })}
        </div>

        {/* Nota informativa */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">ℹ️ Nota:</span> Esta prueba tiene resultados de tipo texto que no pueden ser graficados.
            Se muestra un histórico cronológico de todos los resultados.
          </p>
        </div>
      </div>
    );
  }

  // Preparar datos para la gráfica (solo para pruebas numéricas)
  const chartData = data.map((item, index) => ({
    nombre: `#${index + 1}`,
    fecha: new Date(item.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
    valor: item.valorNumerico,
    valorTexto: item.valorTexto,
    valorDesde: item.valorDesde,
    valorHasta: item.valorHasta,
    estado: item.estado,
    esCritico: item.esCritico,
    numeroOrden: item.numeroOrden,
  })).reverse(); // Invertir para mostrar cronológicamente

  // Calcular los límites del eje Y
  const valores = chartData
    .filter((d) => d.valor !== null && d.valor !== undefined)
    .map((d) => d.valor);

  const rangosMin = chartData
    .filter((d) => d.valorDesde !== null && d.valorDesde !== undefined)
    .map((d) => d.valorDesde);

  const rangosMax = chartData
    .filter((d) => d.valorHasta !== null && d.valorHasta !== undefined)
    .map((d) => d.valorHasta);

  const todosLosValores = [...valores, ...rangosMin, ...rangosMax];
  const minValue = Math.min(...todosLosValores);
  const maxValue = Math.max(...todosLosValores);
  const padding = (maxValue - minValue) * 0.2;

  const yAxisMin = Math.max(0, minValue - padding);
  const yAxisMax = maxValue + padding;

  // Obtener valores de referencia (usar el primer elemento con rangos)
  const refData = chartData.find((d) => d.valorDesde && d.valorHasta);

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border-2 border-eg-purple/20 rounded-lg shadow-xl">
          <p className="font-bold text-gray-900 mb-1">{data.fecha}</p>
          <p className="text-sm text-gray-600 mb-2">Orden: {data.numeroOrden}</p>
          <p className={`font-semibold ${getColorByEstado(data.estado)}`}>
            Valor: {formatearNumero(data.valor, prueba.formato)} {prueba.unidad}
          </p>
          {data.valorDesde && data.valorHasta && (
            <p className="text-xs text-gray-500 mt-1">
              Rango: {formatearNumero(data.valorDesde, prueba.formato)} - {formatearNumero(data.valorHasta, prueba.formato)}
            </p>
          )}
          <p className={`text-xs font-medium mt-1 ${getEstadoBadgeClass(data.estado)}`}>
            {getEstadoTexto(data.estado)}
            {data.esCritico && ' ⚡'}
          </p>
        </div>
      );
    }
    return null;
  };

  // Punto personalizado
  const CustomDot = (props) => {
    const { cx, cy, payload } = props;
    const color = getColorByEstado(payload.estado);
    const esOrdenActual = payload.numeroOrden === numeroOrdenActual;
    const size = payload.esCritico ? 8 : 6;
    const sizeResaltado = esOrdenActual ? size + 4 : size;

    return (
      <g>
        {/* Anillo exterior si es la orden actual */}
        {esOrdenActual && (
          <>
            {/* Anillo pulsante */}
            <circle
              cx={cx}
              cy={cy}
              r={sizeResaltado + 6}
              fill="none"
              stroke="#7B68A6"
              strokeWidth={3}
              opacity={0.4}
              className="animate-pulse"
            />
            {/* Anillo sólido */}
            <circle
              cx={cx}
              cy={cy}
              r={sizeResaltado + 3}
              fill="none"
              stroke="#7B68A6"
              strokeWidth={2}
            />
          </>
        )}
        {/* Punto principal */}
        <circle
          cx={cx}
          cy={cy}
          r={sizeResaltado}
          fill={color}
          stroke="white"
          strokeWidth={esOrdenActual ? 3 : 2}
          className="drop-shadow-md"
        />
      </g>
    );
  };

  return (
    <div className="w-full">
      {/* Información de la prueba - Responsive: Más compacto en móvil */}
      <div className="mb-3 md:mb-4 p-3 md:p-4 bg-gradient-to-r from-eg-purple/5 to-eg-pink/5 rounded-lg">
        <h3 className="text-base md:text-lg font-bold text-gray-900">{prueba.nombre}</h3>
        {prueba.nomenclatura && (
          <p className="text-xs md:text-sm text-gray-600">({prueba.nomenclatura})</p>
        )}
        <p className="text-xs md:text-sm text-gray-500 mt-1">
          Mostrando últimos {data.length} resultados validados
        </p>
      </div>

      {/* Leyenda de estados - Responsive: Oculta en móvil, visible en tablet+ */}
      <div className="hidden sm:flex flex-wrap gap-3 mb-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span>Normal ({chartData.filter((d) => d.estado === 'normal').length})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span>Bajo ({chartData.filter((d) => d.estado === 'bajo').length})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span>Alto ({chartData.filter((d) => d.estado === 'alto').length})</span>
        </div>
        {chartData.some((d) => d.esCritico) && (
          <div className="flex items-center gap-1.5">
            <span className="text-red-600 font-bold">⚡</span>
            <span>Crítico ({chartData.filter((d) => d.esCritico).length})</span>
          </div>
        )}
      </div>

      {/* Gráfica - Responsive: Altura reducida en móvil */}
      <ResponsiveContainer width="100%" height={300} className="md:!h-[400px]">
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 50 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />

          {/* Zona de rango normal (área sombreada verde) */}
          {refData && refData.valorDesde && refData.valorHasta && (
            <ReferenceArea
              y1={refData.valorDesde}
              y2={refData.valorHasta}
              fill="#10b981"
              fillOpacity={0.1}
              stroke="#10b981"
              strokeOpacity={0.3}
              strokeDasharray="5 5"
              label={{
                value: 'Normal',
                position: 'insideTopRight',
                fill: '#059669',
                fontSize: 10,
              }}
            />
          )}

          {/* Líneas de referencia - Labels más compactas */}
          {refData && refData.valorDesde && (
            <ReferenceLine
              y={refData.valorDesde}
              stroke="#10b981"
              strokeDasharray="5 5"
              strokeWidth={1.5}
              label={{
                value: `${refData.valorDesde}`,
                position: 'right',
                fill: '#059669',
                fontSize: 9,
              }}
            />
          )}
          {refData && refData.valorHasta && (
            <ReferenceLine
              y={refData.valorHasta}
              stroke="#10b981"
              strokeDasharray="5 5"
              strokeWidth={1.5}
              label={{
                value: `${refData.valorHasta}`,
                position: 'right',
                fill: '#059669',
                fontSize: 9,
              }}
            />
          )}

          <XAxis
            dataKey="fecha"
            angle={-45}
            textAnchor="end"
            height={50}
            tick={{ fontSize: 10 }}
            stroke="#6b7280"
          />
          <YAxis
            domain={[yAxisMin, yAxisMax]}
            tick={{ fontSize: 10 }}
            stroke="#6b7280"
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Línea principal */}
          <Line
            type="monotone"
            dataKey="valor"
            stroke="#8b5cf6"
            strokeWidth={3}
            dot={<CustomDot />}
            activeDot={{ r: 8 }}
            name={prueba.nombre}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Tendencia - Responsive: Más compacto en móvil */}
      {chartData.length >= 2 && (
        <div className="mt-3 md:mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs md:text-sm text-blue-900">
            <span className="font-semibold">📊 Tendencia: </span>
            {getTendencia(chartData)}
          </p>
          <p className="text-xs md:text-sm text-blue-800 mt-1">
            <span className="font-semibold">Último: </span>
            {chartData[chartData.length - 1].valor} {prueba.unidad} -{' '}
            <span className={getEstadoBadgeClass(chartData[chartData.length - 1].estado)}>
              {getEstadoTexto(chartData[chartData.length - 1].estado)}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}

// Utilidades
function getColorByEstado(estado) {
  switch (estado) {
    case 'normal':
      return '#10b981'; // green-500
    case 'bajo':
      return '#eab308'; // yellow-500
    case 'alto':
      return '#ef4444'; // red-500
    default:
      return '#6b7280'; // gray-500
  }
}

function getEstadoTexto(estado) {
  switch (estado) {
    case 'normal':
      return '✓ Normal';
    case 'bajo':
      return '↓ Bajo';
    case 'alto':
      return '↑ Alto';
    default:
      return '— Sin rango';
  }
}

function getEstadoBadgeClass(estado) {
  switch (estado) {
    case 'normal':
      return 'text-green-700 font-medium';
    case 'bajo':
      return 'text-yellow-700 font-medium';
    case 'alto':
      return 'text-red-700 font-medium';
    default:
      return 'text-gray-600';
  }
}

function getTendencia(data) {
  const primero = data[0].valor;
  const ultimo = data[data.length - 1].valor;
  const diferencia = ultimo - primero;
  const porcentaje = ((diferencia / primero) * 100).toFixed(1);

  if (Math.abs(diferencia) < 0.01) {
    return '→ Estable (sin cambios significativos)';
  } else if (diferencia > 0) {
    return `↗️ Incremento de ${porcentaje}% respecto al primer registro`;
  } else {
    return `↘️ Disminución de ${Math.abs(porcentaje)}% respecto al primer registro`;
  }
}

export default GraficaLinea;
