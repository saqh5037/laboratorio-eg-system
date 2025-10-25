import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { FaInfoCircle } from 'react-icons/fa';

/**
 * Obtener color para el heat map basado en el estado
 * @param {string} estado - Estado del resultado (normal, bajo, alto, sin_rango)
 * @param {boolean} esCritico - Si el valor es crítico
 * @returns {string} Clase de Tailwind para el color
 */
function getColorPorEstado(estado, esCritico) {
  if (esCritico) {
    return 'bg-red-600 hover:bg-red-700';
  }

  switch (estado) {
    case 'normal':
      return 'bg-green-500 hover:bg-green-600';
    case 'alto':
      return 'bg-orange-500 hover:bg-orange-600';
    case 'bajo':
      return 'bg-yellow-500 hover:bg-yellow-600';
    default:
      return 'bg-gray-300 hover:bg-gray-400';
  }
}

/**
 * Componente de Heat Map para visualizar histórico completo
 * @param {Object} props
 * @param {Object} props.heatMapData - Datos del heat map { ordenes, pruebas, matriz }
 * @param {boolean} props.loading - Estado de carga
 */
export function HeatMapHistorico({ heatMapData, loading = false }) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl p-8 border-2 border-gray-100 shadow-lg">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-eg-purple border-t-transparent mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando heat map...</p>
          </div>
        </div>
      </div>
    );
  }

  if (
    !heatMapData ||
    !heatMapData.ordenes ||
    heatMapData.ordenes.length === 0 ||
    !heatMapData.pruebas ||
    heatMapData.pruebas.length === 0
  ) {
    return (
      <div className="bg-white rounded-xl p-8 border-2 border-gray-100 shadow-lg">
        <div className="flex flex-col items-center justify-center h-96">
          <div className="text-6xl mb-4">🗺️</div>
          <p className="text-gray-600 text-center">
            No hay datos históricos suficientes para generar el heat map
          </p>
        </div>
      </div>
    );
  }

  const { ordenes, pruebas, matriz } = heatMapData;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 border-2 border-gray-100 shadow-lg"
    >
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <span>🗺️</span>
          Heat Map Histórico
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Visualización de {pruebas.length} pruebas a través de {ordenes.length} órdenes
        </p>
      </div>

      {/* Leyenda */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <FaInfoCircle className="text-blue-500" />
          <span className="text-sm font-semibold text-gray-900">Leyenda de Colores:</span>
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500 rounded shadow"></div>
            <span className="text-sm text-gray-700">Normal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-yellow-500 rounded shadow"></div>
            <span className="text-sm text-gray-700">Bajo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-orange-500 rounded shadow"></div>
            <span className="text-sm text-gray-700">Alto</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-600 rounded shadow"></div>
            <span className="text-sm text-gray-700">Crítico</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-300 rounded shadow"></div>
            <span className="text-sm text-gray-700">Sin datos / Sin rango</span>
          </div>
        </div>
      </div>

      {/* Heat Map - Tabla con scroll horizontal */}
      <div className="overflow-x-auto border-2 border-gray-200 rounded-lg">
        <table className="w-full border-collapse">
          <thead className="bg-gradient-to-r from-eg-purple to-eg-pink text-white sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-bold border-r-2 border-white/20 min-w-[200px] sticky left-0 z-20 bg-eg-purple">
                Prueba
              </th>
              {ordenes.map((orden, index) => (
                <th
                  key={index}
                  className="px-4 py-3 text-center text-xs font-semibold border-r border-white/20 min-w-[100px]"
                >
                  <div>Orden</div>
                  <div className="font-normal">{orden.numero}</div>
                  <div className="text-xs font-normal opacity-90 mt-1">
                    {format(new Date(orden.fecha), 'dd/MM/yy', { locale: es })}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pruebas.map((prueba, pruebaIndex) => (
              <tr
                key={prueba.id}
                className={`border-b border-gray-200 ${
                  pruebaIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                {/* Nombre de la prueba - sticky */}
                <td className="px-4 py-3 border-r-2 border-gray-200 sticky left-0 z-10 bg-inherit">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {prueba.nombre}
                    </p>
                    {prueba.nomenclatura && (
                      <p className="text-xs text-gray-600 mt-0.5">
                        ({prueba.nomenclatura})
                      </p>
                    )}
                  </div>
                </td>

                {/* Celdas del heat map */}
                {ordenes.map((orden, ordenIndex) => {
                  const key = `${prueba.id}_${orden.numero}`;
                  const celda = matriz[key];

                  if (!celda || celda.valor === null) {
                    // Sin datos
                    return (
                      <td
                        key={ordenIndex}
                        className="px-4 py-3 text-center border-r border-gray-200"
                      >
                        <div className="w-full h-12 bg-gray-100 rounded flex items-center justify-center">
                          <span className="text-xs text-gray-400">—</span>
                        </div>
                      </td>
                    );
                  }

                  const colorClass = getColorPorEstado(celda.estado, celda.esCritico);

                  return (
                    <td
                      key={ordenIndex}
                      className="px-4 py-3 text-center border-r border-gray-200"
                    >
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: (pruebaIndex * ordenes.length + ordenIndex) * 0.01 }}
                        className={`w-full h-12 ${colorClass} rounded shadow-sm transition-all cursor-pointer flex flex-col items-center justify-center text-white group relative`}
                        whileHover={{ scale: 1.05, zIndex: 20 }}
                      >
                        {/* Valor */}
                        <span className="text-xs font-bold">
                          {celda.valor}
                        </span>

                        {/* Indicador de crítico */}
                        {celda.esCritico && (
                          <span className="text-xs">⚡</span>
                        )}

                        {/* Tooltip en hover */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-xl whitespace-nowrap">
                            <p className="font-semibold">{celda.valorTexto}</p>
                            {celda.valorDesde && celda.valorHasta && (
                              <p className="text-gray-300 text-xs mt-1">
                                Rango: {celda.valorDesde} - {celda.valorHasta}
                              </p>
                            )}
                            <p className={`text-xs mt-1 ${
                              celda.estado === 'normal' ? 'text-green-400' :
                              celda.estado === 'bajo' ? 'text-yellow-400' :
                              celda.estado === 'alto' ? 'text-orange-400' : 'text-gray-400'
                            }`}>
                              {celda.estado === 'normal' && '✓ Normal'}
                              {celda.estado === 'bajo' && '↓ Bajo'}
                              {celda.estado === 'alto' && '↑ Alto'}
                              {celda.estado === 'sin_rango' && '— Sin rango'}
                            </p>
                            {celda.esCritico && (
                              <p className="text-red-400 text-xs mt-1 font-bold">
                                ⚡ Valor Crítico
                              </p>
                            )}
                          </div>
                          {/* Flecha del tooltip */}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </motion.div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Estadísticas */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Total Pruebas</p>
          <p className="text-2xl font-bold text-gray-900">{pruebas.length}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Total Órdenes</p>
          <p className="text-2xl font-bold text-gray-900">{ordenes.length}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Fecha Más Antigua</p>
          <p className="text-sm font-bold text-gray-900">
            {format(new Date(ordenes[ordenes.length - 1].fecha), 'dd/MM/yyyy', { locale: es })}
          </p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Fecha Más Reciente</p>
          <p className="text-sm font-bold text-gray-900">
            {format(new Date(ordenes[0].fecha), 'dd/MM/yyyy', { locale: es })}
          </p>
        </div>
      </div>

      {/* Nota */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          💡 <strong>Nota:</strong> Pasa el cursor sobre las celdas para ver los detalles de
          cada resultado. Los colores indican si el valor está dentro o fuera del rango normal.
        </p>
      </div>
    </motion.div>
  );
}

export default HeatMapHistorico;
