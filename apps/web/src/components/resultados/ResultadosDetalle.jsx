import { useState } from 'react';
import { descargarPDFResultados } from '../../services/resultsApi';
import toast from 'react-hot-toast';
import HistoricoButton from '../historico/HistoricoButton';
import HistoricoModal from '../historico/HistoricoModal';
import DashboardSalud from '../dashboard/DashboardSalud';

// Helper para formatear valores según el tipo de dato
function formatearValor(resultado, decimales = 2) {
  const valor = resultado.resultado_numerico || resultado.resultado_alpha;

  if (valor === null || valor === undefined) return 'N/D';

  // Si es numérico y tenemos decimales configurados
  if (resultado.resultado_numerico !== null && resultado.resultado_numerico !== undefined) {
    return Number(valor).toFixed(decimales);
  }

  // Si es alfanumérico, retornar tal cual
  return valor;
}

// Helper para obtener clase de color según interpretación
function getAlarmColor(interpretacion) {
  switch (interpretacion) {
    case 'normal':
      return 'text-green-700 bg-green-50';
    case 'alto':
      return 'text-red-700 bg-red-50';
    case 'bajo':
      return 'text-yellow-700 bg-yellow-50';
    default:
      return 'text-gray-700 bg-gray-50';
  }
}

// Helper para obtener texto de alarma
function getAlarmText(interpretacion) {
  switch (interpretacion) {
    case 'normal':
      return '✓ Normal';
    case 'alto':
      return '↑ Alto';
    case 'bajo':
      return '↓ Bajo';
    default:
      return '—';
  }
}

// Componente de tarjeta individual para móvil
function TarjetaResultadoMovil({ resultado, onHistoricoClick }) {
  const valorFormateado = formatearValor(resultado);
  const alarmColor = getAlarmColor(resultado.interpretacion_valor);
  const valorRef = resultado.valor_desde && resultado.valor_hasta
    ? `${resultado.valor_desde} - ${resultado.valor_hasta}`
    : '—';
  const tieneValorReferencia = resultado.valor_desde && resultado.valor_hasta;

  // Función para obtener el ícono de alarma
  const getAlarmIcon = (interpretacion) => {
    switch (interpretacion) {
      case 'normal':
        return '✓';
      case 'alto':
        return '↑';
      case 'bajo':
        return '↓';
      default:
        return '—';
    }
  };

  const alarmIcon = getAlarmIcon(resultado.interpretacion_valor);

  return (
    <div className="bg-white rounded-xl border-2 border-eg-purple/20 p-4 shadow-lg hover:border-eg-purple hover:shadow-xl transition-all">
      {/* Header con nombre de prueba */}
      <div className="mb-3 pb-3 border-b border-gray-200">
        <h4 className="text-base font-bold text-gray-900">
          {resultado.prueba_nombre}
        </h4>
        {resultado.nomenclatura && (
          <p className="text-xs text-gray-600 mt-1">
            ({resultado.nomenclatura})
          </p>
        )}
      </div>

      {/* Resultado principal */}
      <div className="mb-3">
        <p className="text-xs text-gray-600 mb-1">Resultado</p>
        <p className="text-2xl font-bold text-gray-900">
          {valorFormateado}
          {resultado.unidad && (
            <span className="ml-1 text-lg text-gray-600 font-normal">
              {resultado.unidad}
            </span>
          )}
        </p>
      </div>

      {/* Valor de referencia */}
      {tieneValorReferencia && (
        <div className="mb-3">
          <p className="text-xs text-gray-600 mb-1">Valor de Referencia</p>
          <p className="text-sm text-gray-700">
            {valorRef}
            {resultado.unidad && (
              <span className="ml-1 text-gray-600">
                {resultado.unidad}
              </span>
            )}
          </p>
        </div>
      )}

      {/* Estado con ícono */}
      {tieneValorReferencia && (
        <div className="mb-3">
          <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold border-2 ${alarmColor} ${
            resultado.interpretacion_valor === 'normal' ? 'border-green-300' :
            resultado.interpretacion_valor === 'alto' ? 'border-red-300' :
            resultado.interpretacion_valor === 'bajo' ? 'border-yellow-300' :
            'border-gray-300'
          }`}>
            <span className="text-lg">{alarmIcon}</span>
            <span>
              {resultado.interpretacion_valor === 'normal' ? 'Normal' :
               resultado.interpretacion_valor === 'alto' ? 'Alto' :
               resultado.interpretacion_valor === 'bajo' ? 'Bajo' : '—'}
            </span>
          </div>
        </div>
      )}

      {/* Botón de histórico */}
      <div className="pt-3 border-t border-gray-200">
        <button
          onClick={() => onHistoricoClick({
            pruebaId: resultado.prueba_id,
            pruebaNombre: resultado.prueba_nombre
          })}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-eg-purple to-eg-pink text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Ver Histórico
        </button>
      </div>
    </div>
  );
}

function TablaResultados({ resultados, onHistoricoClick }) {
  return (
    <>
      {/* Vista de Tabla - Solo Desktop */}
      <div className="hidden md:block overflow-x-auto bg-white rounded-xl border-2 border-eg-purple/20 shadow-lg">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-eg-purple to-eg-pink text-white">
              <th className="px-3 py-2.5 text-sm font-bold border-b-2 border-white/20">
                Prueba
              </th>
              <th className="px-3 py-2.5 text-sm font-bold border-b-2 border-white/20">
                Resultado
              </th>
              <th className="px-3 py-2.5 text-sm font-bold border-b-2 border-white/20">
                Alarma
              </th>
              <th className="px-3 py-2.5 text-sm font-bold border-b-2 border-white/20">
                Valor de Referencia
              </th>
              <th className="px-3 py-2.5 text-sm font-bold border-b-2 border-white/20 text-center">
                Histórico
              </th>
            </tr>
          </thead>
          <tbody>
            {resultados.map((resultado, index) => {
              const valorFormateado = formatearValor(resultado);
              const alarmColor = getAlarmColor(resultado.interpretacion_valor);
              const alarmText = getAlarmText(resultado.interpretacion_valor);
              const valorRef = resultado.valor_desde && resultado.valor_hasta
                ? `${resultado.valor_desde} - ${resultado.valor_hasta}`
                : '—';

              // Mostrar alarma solo si hay valor de referencia
              const tieneValorReferencia = resultado.valor_desde && resultado.valor_hasta;

              return (
                <tr
                  key={resultado.prueba_orden_id}
                  className={`border-b border-gray-200 hover:bg-eg-purple/5 transition-colors ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                  }`}
                >
                  {/* Nombre de la Prueba */}
                  <td className="px-3 py-2.5">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {resultado.prueba_nombre}
                      </p>
                      {resultado.nomenclatura && (
                        <p className="text-xs text-gray-600 mt-0.5">
                          ({resultado.nomenclatura})
                        </p>
                      )}
                    </div>
                  </td>

                  {/* Resultado con Unidad */}
                  <td className="px-3 py-2.5">
                    <span className="text-base font-bold text-gray-900">
                      {valorFormateado}
                      {resultado.unidad && (
                        <span className="ml-1 text-sm text-gray-600 font-normal">
                          {resultado.unidad}
                        </span>
                      )}
                    </span>
                  </td>

                  {/* Alarma */}
                  <td className="px-3 py-2.5">
                    {tieneValorReferencia && (
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border-2 ${alarmColor} ${
                          resultado.interpretacion_valor === 'normal' ? 'border-green-300' :
                          resultado.interpretacion_valor === 'alto' ? 'border-red-300' :
                          resultado.interpretacion_valor === 'bajo' ? 'border-yellow-300' :
                          'border-gray-300'
                        }`}
                      >
                        {alarmText}
                      </span>
                    )}
                  </td>

                  {/* Valor de Referencia */}
                  <td className="px-3 py-2.5">
                    <div className="text-sm text-gray-700">
                      {valorRef}
                      {resultado.unidad && valorRef !== '—' && (
                        <span className="ml-1 text-gray-600">
                          {resultado.unidad}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Botón de Histórico */}
                  <td className="px-3 py-2.5 text-center">
                    <HistoricoButton
                      pruebaId={resultado.prueba_id}
                      pruebaNombre={resultado.prueba_nombre}
                      onClick={onHistoricoClick}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Vista de Tarjetas - Solo Móvil */}
      <div className="md:hidden space-y-4">
        {resultados.map((resultado) => (
          <TarjetaResultadoMovil
            key={resultado.prueba_orden_id}
            resultado={resultado}
            onHistoricoClick={onHistoricoClick}
          />
        ))}
      </div>
    </>
  );
}

export default function ResultadosDetalle({ orden, resultados, estadisticas, onVolver }) {
  const [descargandoPDF, setDescargandoPDF] = useState(false);
  const [modalHistoricoAbierto, setModalHistoricoAbierto] = useState(false);
  const [pruebaSeleccionada, setPruebaSeleccionada] = useState(null);

  // Función helper para formatear fecha
  const formatearFecha = (fechaStr) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Función para calcular edad
  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return null;
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mesActual = hoy.getMonth();
    const mesNacimiento = nacimiento.getMonth();
    if (mesActual < mesNacimiento || (mesActual === mesNacimiento && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  // Función para manejar click en histórico
  const handleHistoricoClick = ({ pruebaId, pruebaNombre }) => {
    setPruebaSeleccionada({
      id: pruebaId,
      nombre: pruebaNombre,
      pacienteCi: orden.ci_paciente
    });
    setModalHistoricoAbierto(true);
  };

  // Función para cerrar el modal
  const handleCerrarModal = () => {
    setModalHistoricoAbierto(false);
    setPruebaSeleccionada(null);
  };

  // Función para descargar PDF
  const handleDescargarPDF = async () => {
    console.log('[ResultadosDetalle] Click en botón descargar PDF');
    console.log('[ResultadosDetalle] Número de orden:', orden.numero);
    console.log('[ResultadosDetalle] Estado descargandoPDF antes:', descargandoPDF);

    setDescargandoPDF(true);
    console.log('[ResultadosDetalle] Estado descargandoPDF cambiado a true');

    try {
      console.log('[ResultadosDetalle] Llamando a descargarPDFResultados...');
      await descargarPDFResultados(orden.numero);
      console.log('[ResultadosDetalle] descargarPDFResultados completado exitosamente');
      toast.success('PDF descargado correctamente');
    } catch (error) {
      console.error('[ResultadosDetalle] Error capturado:', error);
      console.error('[ResultadosDetalle] Error tipo:', error.constructor.name);
      console.error('[ResultadosDetalle] Error mensaje:', error.message);
      toast.error('Error al descargar el PDF. Intente nuevamente.');
    } finally {
      console.log('[ResultadosDetalle] Ejecutando finally, estableciendo descargandoPDF a false');
      setDescargandoPDF(false);
    }
  };

  const fechaFormateada = formatearFecha(orden.fecha);
  const edad = calcularEdad(orden.fecha_nacimiento);

  // Agrupar resultados por área solamente (sin estudios por ahora)
  const resultadosPorArea = resultados.reduce((acc, resultado) => {
    const area = resultado.area_nombre;
    if (!acc[area]) {
      acc[area] = [];
    }
    acc[area].push(resultado);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header con botón de volver y descargar PDF - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onVolver}
            className="min-h-[44px] min-w-[44px] p-2 hover:bg-eg-purple/5 rounded-lg transition-colors focus:outline-none focus:ring-4 focus:ring-eg-purple/50"
            aria-label="Volver a lista de órdenes"
          >
            <svg className="w-6 h-6 text-eg-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h2 className="text-xl md:text-2xl text-eg-dark">Orden #{orden.numero}</h2>
            <p className="text-sm md:text-base text-eg-gray">{fechaFormateada}</p>
          </div>
        </div>

        {/* Botón de Descargar PDF - Ancho completo en móvil */}
        <button
          onClick={handleDescargarPDF}
          disabled={descargandoPDF}
          className="w-full sm:w-auto min-h-[48px] px-6 py-3 bg-gradient-to-r from-eg-purple to-eg-pink text-white rounded-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-eg-purple/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
        >
          {descargandoPDF ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Descargando...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Descargar PDF</span>
            </>
          )}
        </button>
      </div>

      {/* Información del Paciente con alto contraste */}
      <div className="bg-white rounded-xl border-2 border-eg-purple/20 p-6 shadow-lg hover:border-eg-purple hover:shadow-xl transition-all duration-200">
        <h3 className="text-lg text-gray-900 mb-4">Información del Paciente</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-base">
          <div>
            <span className="text-gray-600">Nombre:</span>
            <span className="ml-2 text-gray-900 font-medium">{orden.nombre} {orden.apellido}</span>
          </div>
          <div>
            <span className="text-gray-600">Cédula:</span>
            <span className="ml-2 text-gray-900 font-medium">{orden.ci_paciente}</span>
          </div>
          <div>
            <span className="text-gray-600">Sexo:</span>
            <span className="ml-2 text-gray-900 font-medium">
              {orden.sexo === 'M' ? 'Masculino' : orden.sexo === 'F' ? 'Femenino' : orden.sexo || 'No especificado'}
            </span>
          </div>
          {edad !== null && (
            <div>
              <span className="text-gray-600">Edad:</span>
              <span className="ml-2 text-gray-900 font-medium">{edad} años</span>
            </div>
          )}
          {orden.medico_nombre && orden.medico_nombre.trim() && (
            <div>
              <span className="text-gray-600">Médico:</span>
              <span className="ml-2 text-gray-900 font-medium">{orden.medico_nombre}</span>
            </div>
          )}
          <div>
            <span className="text-gray-600">Estado:</span>
            <span className={`ml-2 inline-flex items-center px-3 py-1 rounded-md text-sm font-semibold border-2 ${
              orden.estado === 'Validado' ? 'bg-eg-purple/10 text-eg-purple border-eg-purple/30' : 'bg-eg-pink/10 text-eg-pink border-eg-pink/30'
            }`}>
              {orden.estado}
            </span>
          </div>
        </div>
      </div>

      {/* Dashboard de Salud */}
      <DashboardSalud
        resultados={resultados.map(r => ({
          prueba_id: r.prueba_id,
          prueba_nombre: r.prueba_nombre,
          nomenclatura: r.nomenclatura,
          valor: r.resultado_numerico || r.resultado_alpha,
          valorNumerico: r.resultado_numerico,
          unidad: r.unidad,
          estado: r.interpretacion_valor || 'sin_rango',
          esCritico: r.es_critico || false,
          valorDesde: r.valor_desde,
          valorHasta: r.valor_hasta,
        }))}
        pacienteCi={orden.ci_paciente}
      />

      {/* Estadísticas con alto contraste - 2 columnas en móvil */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white rounded-xl border-2 border-gray-200 p-3 md:p-5 shadow-lg hover:border-eg-purple hover:shadow-xl transition-all duration-200">
          <p className="text-xs md:text-sm text-gray-600 mb-1">Total Pruebas</p>
          <p className="text-2xl md:text-3xl text-gray-900">{estadisticas.total_pruebas}</p>
        </div>
        <div className="bg-white rounded-xl border-2 border-eg-purple/20 p-3 md:p-5 shadow-lg hover:border-eg-purple hover:shadow-xl transition-all duration-200">
          <p className="text-xs md:text-sm text-gray-600 mb-1">Validados</p>
          <p className="text-2xl md:text-3xl text-eg-purple">{estadisticas.validados}</p>
        </div>
        <div className="bg-white rounded-xl border-2 border-green-300/50 p-3 md:p-5 shadow-lg hover:border-green-500 hover:shadow-xl transition-all duration-200">
          <p className="text-xs md:text-sm text-gray-600 mb-1">Valores Normales</p>
          <p className="text-2xl md:text-3xl text-green-700">{estadisticas.normales || 0}</p>
        </div>
        <div className="bg-white rounded-xl border-2 border-orange-300/50 p-3 md:p-5 shadow-lg hover:border-orange-500 hover:shadow-xl transition-all duration-200">
          <p className="text-xs md:text-sm text-gray-600 mb-1">Fuera de Rango</p>
          <p className="text-2xl md:text-3xl text-orange-700">{estadisticas.fuera_de_rango || 0}</p>
        </div>
      </div>

      {/* Resultados por Área - Formato Tabla */}
      <div className="space-y-8">
        {Object.entries(resultadosPorArea).map(([area, resultadosArea]) => (
          <div key={area}>
            <h3 className="text-xl text-gray-900 mb-5 flex items-center gap-3 pb-2 border-b-2 border-eg-purple/30">
              <div className="w-1.5 h-7 bg-gradient-to-b from-eg-purple to-eg-pink rounded"></div>
              {area}
              <span className="text-base text-gray-600">({resultadosArea.length} pruebas)</span>
            </h3>
            <TablaResultados resultados={resultadosArea} onHistoricoClick={handleHistoricoClick} />
          </div>
        ))}
      </div>

      {/* Nota Legal */}
      <div className="bg-eg-purple/5 border border-eg-purple/20 rounded-2xl p-4 text-sm text-eg-dark">
        <p>
          <span className="text-eg-purple">Nota:</span> Estos resultados son de carácter informativo. Consulte con su médico tratante para la interpretación clínica adecuada.
        </p>
      </div>

      {/* Modal de Histórico */}
      {modalHistoricoAbierto && pruebaSeleccionada && (
        <HistoricoModal
          isOpen={modalHistoricoAbierto}
          onClose={handleCerrarModal}
          pruebaId={pruebaSeleccionada.id}
          pruebaNombre={pruebaSeleccionada.nombre}
          pacienteCi={pruebaSeleccionada.pacienteCi}
        />
      )}
    </div>
  );
}
