import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
  Cell,
  LabelList,
} from 'recharts';
import { formatearNumero } from '../../utils/formatters';
import { useThemeColors } from '../../hooks/useThemeColors';

/**
 * Componente de gráfica de barras con indicadores de estado
 * @param {Object} props
 * @param {Array} props.data - Array de datos históricos
 * @param {Object} props.prueba - Información de la prueba
 * @param {string} props.numeroOrdenActual - Número de la orden actual para resaltarla
 */
export function GraficaBarras({ data, prueba, numeroOrdenActual }) {
  const { primary } = useThemeColors();

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
  const chartData = data
    .map((item, index) => ({
      nombre: `#${index + 1}`,
      fecha: new Date(item.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
      valor: item.valorNumerico,
      valorTexto: item.valorTexto,
      valorDesde: item.valorDesde,
      valorHasta: item.valorHasta,
      estado: item.estado,
      esCritico: item.esCritico,
      numeroOrden: item.numeroOrden,
    }))
    .reverse();

  // Obtener valores de referencia
  const refData = chartData.find((d) => d.valorDesde && d.valorHasta);

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border-2 border-eg-purple/20 rounded-lg shadow-xl">
          <p className="font-bold text-gray-900 mb-1">{data.fecha}</p>
          <p className="text-sm text-gray-600 mb-2">Orden: {data.numeroOrden}</p>
          <p className={`font-semibold ${getColorTextByEstado(data.estado)}`}>
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
          <div className="w-3 h-3 rounded bg-green-500"></div>
          <span>Normal ({chartData.filter((d) => d.estado === 'normal').length})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-yellow-500"></div>
          <span>Bajo ({chartData.filter((d) => d.estado === 'bajo').length})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-red-500"></div>
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
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 50 }}
        >
          <defs>
            {/* Gradientes para barras */}
            <linearGradient id="colorNormal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.9}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.7}/>
            </linearGradient>
            <linearGradient id="colorBajo" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#eab308" stopOpacity={0.9}/>
              <stop offset="95%" stopColor="#eab308" stopOpacity={0.7}/>
            </linearGradient>
            <linearGradient id="colorAlto" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.9}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.7}/>
            </linearGradient>
            <linearGradient id="colorSinRango" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6b7280" stopOpacity={0.9}/>
              <stop offset="95%" stopColor="#6b7280" stopOpacity={0.7}/>
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />

          {/* Zona de referencia (área sombreada) */}
          {refData && refData.valorDesde && refData.valorHasta && (
            <ReferenceArea
              y1={refData.valorDesde}
              y2={refData.valorHasta}
              fill="#10b981"
              fillOpacity={0.1}
              stroke="#10b981"
              strokeOpacity={0.3}
              strokeWidth={1}
              label={{
                value: 'Normal',
                position: 'insideTopLeft',
                fill: '#059669',
                fontSize: 10,
                fontWeight: 600,
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
            tick={{ fontSize: 10, fill: '#6b7280' }}
            stroke="#9ca3af"
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#6b7280' }}
            stroke="#9ca3af"
            width={40}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }} />

          {/* Barras con colores según estado y gradientes */}
          <Bar
            dataKey="valor"
            radius={[8, 8, 0, 0]}
            animationDuration={800}
            animationBegin={0}
          >
            {chartData.map((entry, index) => {
              const esOrdenActual = entry.numeroOrden === numeroOrdenActual;
              return (
                <Cell
                  key={`cell-${index}`}
                  fill={getGradientByEstado(entry.estado)}
                  stroke={esOrdenActual ? primary : (entry.esCritico ? '#dc2626' : getColorByEstado(entry.estado))}
                  strokeWidth={esOrdenActual ? 5 : (entry.esCritico ? 4 : 1)}
                  opacity={esOrdenActual ? 1 : 0.85}
                />
              );
            })}
            {/* Etiquetas de valor en cada barra - Responsive: Más pequeño en móvil */}
            <LabelList
              dataKey="valor"
              position="top"
              style={{ fontSize: '9px', fontWeight: 'bold', fill: '#374151' }}
              className="md:!text-[11px]"
              formatter={(value) => formatearNumero(value, prueba.formato)}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Resumen y Análisis de Tendencia - Responsive: Más compacto en móvil */}
      {chartData.length >= 2 && (
        <div className="mt-3 md:mt-4 space-y-2 md:space-y-3">
          {/* Estadísticas */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs md:text-sm text-blue-900">
              <span className="font-semibold">📊 Estadísticas: </span>
              {getComparacion(chartData)}
            </p>
            <p className="text-xs md:text-sm text-blue-800 mt-1">
              <span className="font-semibold">Último: </span>
              {chartData[chartData.length - 1].valor} {prueba.unidad} -{' '}
              <span className={getEstadoBadgeClass(chartData[chartData.length - 1].estado)}>
                {getEstadoTexto(chartData[chartData.length - 1].estado)}
              </span>
            </p>
          </div>

          {/* Análisis de Tendencia */}
          {getTendencia(chartData)}
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

function getGradientByEstado(estado) {
  switch (estado) {
    case 'normal':
      return 'url(#colorNormal)';
    case 'bajo':
      return 'url(#colorBajo)';
    case 'alto':
      return 'url(#colorAlto)';
    default:
      return 'url(#colorSinRango)';
  }
}

function getColorTextByEstado(estado) {
  switch (estado) {
    case 'normal':
      return 'text-green-700';
    case 'bajo':
      return 'text-yellow-700';
    case 'alto':
      return 'text-red-700';
    default:
      return 'text-gray-600';
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

function getComparacion(data) {
  const valores = data.map((d) => d.valor);
  const max = Math.max(...valores);
  const min = Math.min(...valores);
  const promedio = (valores.reduce((a, b) => a + b, 0) / valores.length).toFixed(2);

  return `Valor máximo: ${max}, mínimo: ${min}, promedio: ${promedio}`;
}

function getTendencia(data) {
  if (data.length < 3) return null;

  const valores = data.map((d) => d.valor);
  const ultimo = valores[valores.length - 1];
  const penultimo = valores[valores.length - 2];
  const antepenultimo = valores[valores.length - 3];

  // Calcular tendencia simple (3 últimos valores)
  const cambioReciente = ultimo - penultimo;
  const cambioAnterior = penultimo - antepenultimo;

  let tendencia = 'estable';
  let icono = '➡️';
  let color = 'bg-gray-50 border-gray-200 text-gray-900';
  let mensaje = 'Los valores se mantienen relativamente estables';

  if (cambioReciente > 0 && cambioAnterior > 0) {
    tendencia = 'ascendente';
    icono = '📈';
    color = 'bg-blue-50 border-blue-200 text-blue-900';
    mensaje = 'Tendencia al alza en los últimos resultados';
  } else if (cambioReciente < 0 && cambioAnterior < 0) {
    tendencia = 'descendente';
    icono = '📉';
    color = 'bg-orange-50 border-orange-200 text-orange-900';
    mensaje = 'Tendencia a la baja en los últimos resultados';
  } else if (Math.abs(cambioReciente) > Math.abs(penultimo * 0.1)) {
    // Cambio significativo (más del 10%)
    if (cambioReciente > 0) {
      icono = '⬆️';
      color = 'bg-blue-50 border-blue-200 text-blue-900';
      mensaje = `Aumento significativo en el último resultado (+${Math.abs(cambioReciente).toFixed(2)})`;
    } else {
      icono = '⬇️';
      color = 'bg-orange-50 border-orange-200 text-orange-900';
      mensaje = `Disminución significativa en el último resultado (-${Math.abs(cambioReciente).toFixed(2)})`;
    }
  }

  return (
    <div className={`p-3 rounded-lg border ${color}`}>
      <p className="text-xs md:text-sm font-semibold">
        {icono} Análisis de Tendencia
      </p>
      <p className="text-xs md:text-sm mt-1">{mensaje}</p>
      <div className="mt-2 flex flex-wrap gap-2 text-[10px] md:text-xs">
        <span className="px-2 py-1 bg-white rounded border">
          Hace 3: {antepenultimo}
        </span>
        <span className="px-2 py-1 bg-white rounded border">
          Hace 2: {penultimo}
        </span>
        <span className="px-2 py-1 bg-white rounded border font-bold">
          Último: {ultimo}
        </span>
      </div>
    </div>
  );
}

export default GraficaBarras;
