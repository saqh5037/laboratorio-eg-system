import { useState, useEffect } from 'react';
import { descargarPDFResultados } from '../../services/resultsApi';
import toast from 'react-hot-toast';
import HistoricoButton from '../historico/HistoricoButton';
import HistoricoModal from '../historico/HistoricoModal';
import HistoricoCell from './historico/HistoricoCell';
import DashboardSalud from '../dashboard/DashboardSalud';
import { formatearValorConFormato, formatearNumero } from '../../utils/formatters';

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

// Helper para obtener clases de color según estado (para valores históricos)
function getColorClassByEstado(estado) {
  switch (estado) {
    case 'normal':
      return 'text-green-700 font-semibold';
    case 'bajo':
      return 'text-yellow-700 font-semibold';
    case 'alto':
      return 'text-orange-700 font-semibold';
    default:
      return 'text-gray-600';
  }
}

// Componente de tarjeta individual para móvil
function TarjetaResultadoMovil({ resultado, ultimos3, onHistoricoClick }) {
  const [mostrarHistorico, setMostrarHistorico] = useState(false);
  const valorFormateado = formatearValorConFormato(resultado, resultado.formato);
  const alarmColor = getAlarmColor(resultado.interpretacion_valor);
  const valorRef = resultado.valor_desde && resultado.valor_hasta
    ? `${formatearNumero(resultado.valor_desde, resultado.formato)} - ${formatearNumero(resultado.valor_hasta, resultado.formato)}`
    : '—';
  const tieneValorReferencia = resultado.valor_desde && resultado.valor_hasta;
  const tieneHistorico = ultimos3 && ultimos3.length > 0;

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

      {/* Últimos 3 resultados históricos (colapsable) */}
      {tieneHistorico && (
        <div className="pt-3 border-t border-gray-200">
          <button
            onClick={() => setMostrarHistorico(!mostrarHistorico)}
            className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all text-sm font-medium text-gray-700"
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-eg-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Últimos {ultimos3.length} resultados
            </span>
            <svg
              className={`w-4 h-4 transition-transform ${mostrarHistorico ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {mostrarHistorico && (
            <div className="mt-2 space-y-2">
              {ultimos3.map((historico, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200">
                  <div className="flex-1">
                    <p className="text-xs text-gray-600">
                      {new Date(historico.fecha).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        year: '2-digit'
                      })}
                    </p>
                    <p className="text-xs text-gray-500">Orden {historico.numeroOrden}</p>
                  </div>
                  <div className="text-right">
                    <HistoricoCell historico={historico} />
                  </div>
                </div>
              ))}
            </div>
          )}
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
          Ver Histórico Completo
        </button>
      </div>
    </div>
  );
}

function TablaResultados({ resultados, ultimos3PorPrueba, onHistoricoClick, historicoExpandido, onToggleHistorico }) {
  // Función para formatear fecha compacta para headers
  const formatearFechaHeader = (fechaStr) => {
    if (!fechaStr) return '—';
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short'
    });
  };

  // Obtener fechas de los primeros 3 históricos del primer resultado disponible
  const obtenerFechasHeaders = () => {
    // Buscar el primer resultado que tenga históricos
    for (const resultado of resultados) {
      const historicos = ultimos3PorPrueba[resultado.prueba_id];
      if (historicos && historicos.length > 0) {
        return {
          fecha3: historicos[2]?.fecha || null,
          fecha2: historicos[1]?.fecha || null,
          fecha1: historicos[0]?.fecha || null
        };
      }
    }
    return { fecha3: null, fecha2: null, fecha1: null };
  };

  const { fecha3, fecha2, fecha1 } = obtenerFechasHeaders();

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
              {historicoExpandido && (
                <>
                  <th className="px-2 py-2.5 text-xs font-bold border-b-2 border-white/20 text-center">
                    {formatearFechaHeader(fecha3)}
                  </th>
                  <th className="px-2 py-2.5 text-xs font-bold border-b-2 border-white/20 text-center">
                    {formatearFechaHeader(fecha2)}
                  </th>
                  <th className="px-2 py-2.5 text-xs font-bold border-b-2 border-white/20 text-center">
                    {formatearFechaHeader(fecha1)}
                  </th>
                </>
              )}
              <th className="px-3 py-2.5 text-sm font-bold border-b-2 border-white/20 text-center">
                <button
                  onClick={onToggleHistorico}
                  className="flex items-center gap-2 mx-auto px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all shadow-md hover:shadow-lg border-2 border-white/40"
                  title={historicoExpandido ? "Contraer histórico" : "Expandir histórico"}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-bold">Histórico</span>
                  <svg
                    className={`w-5 h-5 transition-transform duration-300 ${historicoExpandido ? 'rotate-90' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {resultados.map((resultado, index) => {
              const valorFormateado = formatearValorConFormato(resultado, resultado.formato);
              const alarmColor = getAlarmColor(resultado.interpretacion_valor);
              const alarmText = getAlarmText(resultado.interpretacion_valor);
              const valorRef = resultado.valor_desde && resultado.valor_hasta
                ? `${formatearNumero(resultado.valor_desde, resultado.formato)} - ${formatearNumero(resultado.valor_hasta, resultado.formato)}`
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

                  {/* Últimos 3 resultados históricos - Solo si expandido */}
                  {historicoExpandido && (() => {
                    const historicos = ultimos3PorPrueba[resultado.prueba_id] || [];
                    return (
                      <>
                        <td className="px-2 py-2.5 text-center text-sm font-medium text-gray-700">
                          {historicos[2] ? (
                            <span className={getColorClassByEstado(historicos[2].estado)}>
                              {historicos[2].valorNumerico !== null
                                ? formatearNumero(historicos[2].valorNumerico, historicos[2].formato)
                                : (historicos[2].valorTexto || '—')}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="px-2 py-2.5 text-center text-sm font-medium text-gray-700">
                          {historicos[1] ? (
                            <span className={getColorClassByEstado(historicos[1].estado)}>
                              {historicos[1].valorNumerico !== null
                                ? formatearNumero(historicos[1].valorNumerico, historicos[1].formato)
                                : (historicos[1].valorTexto || '—')}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="px-2 py-2.5 text-center text-sm font-medium text-gray-700">
                          {historicos[0] ? (
                            <span className={getColorClassByEstado(historicos[0].estado)}>
                              {historicos[0].valorNumerico !== null
                                ? formatearNumero(historicos[0].valorNumerico, historicos[0].formato)
                                : (historicos[0].valorTexto || '—')}
                            </span>
                          ) : '—'}
                        </td>
                      </>
                    );
                  })()}

                  {/* Botón Ver Gráfica */}
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
            ultimos3={ultimos3PorPrueba[resultado.prueba_id] || []}
            onHistoricoClick={onHistoricoClick}
          />
        ))}
      </div>
    </>
  );
}

export default function ResultadosDetalle({ orden, resultados, estadisticas, ultimos3PorPrueba = {}, onVolver }) {
  const [descargandoPDF, setDescargandoPDF] = useState(false);
  const [modalHistoricoAbierto, setModalHistoricoAbierto] = useState(false);
  const [pruebaSeleccionada, setPruebaSeleccionada] = useState(null);
  const [historicoExpandidoPorArea, setHistoricoExpandidoPorArea] = useState({});

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

  // Función para toggle del histórico por área
  const handleToggleHistorico = (area) => {
    setHistoricoExpandidoPorArea(prev => ({
      ...prev,
      [area]: !prev[area]
    }));
  };

  // Función para descargar PDF
  const handleDescargarPDF = async () => {
    setDescargandoPDF(true);
    try {
      await descargarPDFResultados(orden.numero);
      toast.success('PDF descargado correctamente');
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      toast.error('Error al descargar el PDF. Intente nuevamente.');
    } finally {
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
    <div className="space-y-4">

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

      {/* Resultados por Área - Formato Tabla */}
      <div className="space-y-5">
        {Object.entries(resultadosPorArea).map(([area, resultadosArea]) => (
          <div key={area}>
            <h3 className="text-xl text-gray-900 mb-3 flex items-center gap-3 pb-2 border-b-2 border-eg-purple/30">
              <div className="w-1.5 h-7 bg-gradient-to-b from-eg-purple to-eg-pink rounded"></div>
              {area}
              <span className="text-base text-gray-600">({resultadosArea.length} pruebas)</span>
            </h3>
            <TablaResultados
              resultados={resultadosArea}
              ultimos3PorPrueba={ultimos3PorPrueba}
              onHistoricoClick={handleHistoricoClick}
              historicoExpandido={historicoExpandidoPorArea[area] || false}
              onToggleHistorico={() => handleToggleHistorico(area)}
            />
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
          numeroOrdenActual={orden.numero}
        />
      )}
    </div>
  );
}
