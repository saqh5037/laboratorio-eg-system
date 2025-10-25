import { motion } from 'framer-motion';

/**
 * Componente de Estadísticas Globales del Paciente
 * Muestra métricas agregadas de toda la historia clínica
 *
 * @param {Object} props
 * @param {Array} props.ordenes - Array de órdenes del paciente
 */
export function EstadisticasGlobales({ ordenes = [] }) {
  // Calcular estadísticas
  const totalOrdenes = ordenes.length;

  const ordenesValidadas = ordenes.filter(
    (o) => o.estado === 'Validado' || o.status_id === 4
  ).length;

  const ordenesPendientes = totalOrdenes - ordenesValidadas;

  // Calcular total de pruebas realizadas
  const totalPruebas = ordenes.reduce((sum, orden) => {
    return sum + (parseInt(orden.pruebas_con_resultado) || 0);
  }, 0);

  // Obtener fechas de primera y última orden
  const fechasOrdenadas = [...ordenes]
    .filter((o) => o.fecha)
    .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

  const primeraOrden = fechasOrdenadas[0];
  const ultimaOrden = fechasOrdenadas[fechasOrdenadas.length - 1];

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return 'N/D';
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', {
      month: 'short',
      year: 'numeric',
    });
  };

  const estadisticas = [
    {
      icono: '📋',
      label: 'Total Órdenes',
      valor: totalOrdenes,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      icono: '✓',
      label: 'Validadas',
      valor: ordenesValidadas,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
    {
      icono: '⏳',
      label: 'Pendientes',
      valor: ordenesPendientes,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
    },
    {
      icono: '🔬',
      label: 'Total Pruebas',
      valor: totalPruebas,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
    },
    {
      icono: '📅',
      label: 'Primera Orden',
      valor: formatearFecha(primeraOrden?.fecha),
      esTexto: true,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
    },
    {
      icono: '📅',
      label: 'Última Orden',
      valor: formatearFecha(ultimaOrden?.fecha),
      esTexto: true,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {estadisticas.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className={`${stat.bgColor} rounded-xl p-4 border-2 ${stat.borderColor} shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105`}
        >
          <div className="flex flex-col items-center text-center">
            <div className="text-3xl mb-2">{stat.icono}</div>
            <div className="text-xs text-gray-600 mb-1 font-medium">
              {stat.label}
            </div>
            <div
              className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
            >
              {stat.valor}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default EstadisticasGlobales;
