import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ResultadosAuth from '../components/resultados/ResultadosAuth';
import ResultadosListaOrdenes from '../components/resultados/ResultadosListaOrdenes';
import ResultadosDetalle from '../components/resultados/ResultadosDetalle';
import DashboardGlobal from '../components/dashboard/DashboardGlobal';
import HeatMapModal from '../components/dashboard/HeatMapModal';
import { FiltrosProvider } from '../contexts/FiltrosContext';
import {
  haySesionActiva,
  getPacienteInfo,
  obtenerOrdenes,
  obtenerResultadosOrden,
  obtenerResultadosOrdenConHistorico,
  cerrarSesion,
  manejarErrorAuth,
  descargarPDFResultados,
} from '../services/resultsApi';
import toast from 'react-hot-toast';

export default function Resultados() {
  const navigate = useNavigate();
  const [autenticado, setAutenticado] = useState(false);
  const [paciente, setPaciente] = useState(null);
  const [ordenes, setOrdenes] = useState([]);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState(null);
  const [resultados, setResultados] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingResultados, setLoadingResultados] = useState(false);
  const [heatMapModalOpen, setHeatMapModalOpen] = useState(false);
  const [filtrosExpanded, setFiltrosExpanded] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // Verificar sesión al cargar
  useEffect(() => {
    const verificarSesion = async () => {
      if (haySesionActiva()) {
        setAutenticado(true);
        const info = getPacienteInfo();
        setPaciente(info);
        await cargarOrdenes();
      }
      setLoading(false);
    };

    verificarSesion();
  }, []);

  // Cargar órdenes del paciente
  const cargarOrdenes = async () => {
    try {
      const data = await obtenerOrdenes();
      // Filtrar solo órdenes CON resultados (pruebas_con_resultado > 0)
      const ordenesConResultados = (data.ordenes || []).filter(
        orden => parseInt(orden.pruebas_con_resultado) > 0
      );
      setOrdenes(ordenesConResultados);
    } catch (error) {
      console.error('Error al cargar órdenes:', error);

      if (manejarErrorAuth(error)) {
        setAutenticado(false);
        setPaciente(null);
        toast.error('Sesión expirada. Por favor, autentíquese nuevamente.');
      } else {
        toast.error('Error al cargar las órdenes');
      }
    }
  };

  // Manejar autenticación exitosa
  const handleAuthSuccess = async (data) => {
    setAutenticado(true);
    setPaciente(data.paciente);
    await cargarOrdenes();
  };

  // Manejar selección de orden
  const handleSelectOrden = async (orden) => {
    // Validación preventiva: No permitir entrar a órdenes sin resultados
    if (!orden.pruebas_con_resultado || parseInt(orden.pruebas_con_resultado) === 0) {
      toast.info('Esta orden aún no tiene resultados disponibles');
      return;
    }

    setLoadingResultados(true);
    try {
      const data = await obtenerResultadosOrdenConHistorico(orden.numero);
      setResultados(data);
      setOrdenSeleccionada(orden);
    } catch (error) {
      console.error('Error al cargar resultados:', error);

      if (manejarErrorAuth(error)) {
        setAutenticado(false);
        setPaciente(null);
        setOrdenSeleccionada(null);
        toast.error('Sesión expirada. Por favor, autentíquese nuevamente.');
      } else {
        toast.error('Error al cargar los resultados de la orden');
      }
    } finally {
      setLoadingResultados(false);
    }
  };

  // Volver a la lista de órdenes desde detalle de orden
  const handleVolver = () => {
    setOrdenSeleccionada(null);
    setResultados(null);
  };

  // Cerrar sesión
  const handleCerrarSesion = () => {
    cerrarSesion();
    setAutenticado(false);
    setPaciente(null);
    setOrdenes([]);
    setOrdenSeleccionada(null);
    setResultados(null);
    toast.success('Sesión cerrada');
  };

  // Exportar resultados
  const handleExportar = async () => {
    if (!ordenSeleccionada) {
      toast.info('Selecciona una orden desde la lista para exportar sus resultados');
      return;
    }

    setExportLoading(true);
    try {
      await descargarPDFResultados(ordenSeleccionada.numero);
      toast.success('PDF descargado correctamente');
    } catch (error) {
      console.error('Error al descargar PDF:', error);
      toast.error('Error al descargar el PDF');
    } finally {
      setExportLoading(false);
    }
  };

  // Navegación entre órdenes
  const obtenerIndiceOrdenActual = () => {
    if (!ordenSeleccionada) return -1;
    return ordenes.findIndex(o => o.numero === ordenSeleccionada.numero);
  };

  const obtenerOrdenSiguiente = () => {
    const indice = obtenerIndiceOrdenActual();
    if (indice >= 0 && indice < ordenes.length - 1) {
      return ordenes[indice + 1];
    }
    return null;
  };

  const obtenerOrdenAnterior = () => {
    const indice = obtenerIndiceOrdenActual();
    if (indice > 0) {
      return ordenes[indice - 1];
    }
    return null;
  };

  const handleOrdenSiguiente = async () => {
    const siguiente = obtenerOrdenSiguiente();
    if (siguiente) {
      await handleSelectOrden(siguiente);
    }
  };

  const handleOrdenAnterior = async () => {
    const anterior = obtenerOrdenAnterior();
    if (anterior) {
      await handleSelectOrden(anterior);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-eg-purple/5 via-white to-eg-pink/5 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-eg-purple mx-auto"></div>
          <p className="mt-4 text-eg-gray">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <FiltrosProvider>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Header Adaptativo: Cambia según si hay orden seleccionada o no */}
        <section className="bg-eg-purple py-4 md:py-6 border-b-4 border-eg-pink">
          <div className="max-w-full mx-auto px-4 md:px-6 lg:px-8">
            {!ordenSeleccionada ? (
              /* VISTA LISTA DE ÓRDENES */
              <>
                {/* Fila 1: Título + Nombre + Botón */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 rounded-lg p-2">
                      <svg className="text-white w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h1 className="text-xl md:text-2xl font-bold text-white">
                        Consulta de Resultados
                      </h1>
                      {autenticado && paciente && (
                        <p className="text-white/90 text-sm md:text-base font-medium">
                          {paciente.nombre} - {paciente.ci_paciente}
                        </p>
                      )}
                    </div>
                  </div>

                  {autenticado && paciente && (
                    <button
                      onClick={handleCerrarSesion}
                      className="min-h-[44px] px-5 py-2 bg-white hover:bg-red-50 text-red-600 hover:text-red-700 border border-red-200 rounded-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-white/50 font-semibold text-sm shadow-md hover:shadow-lg hover:scale-105"
                    >
                      Cerrar Sesión
                    </button>
                  )}
                </div>

                {/* Separador + Estadísticas + Acciones */}
                {autenticado && ordenes.length > 0 && (
                  <>
                    <div className="h-px bg-white/30 mb-3"></div>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      {/* Estadísticas globales */}
                      <div className="flex flex-wrap items-center gap-3 md:gap-5">
                        <div title="Total de órdenes" className="flex items-center gap-2 bg-white/20 px-3 py-2 rounded-lg backdrop-blur-sm">
                          <span className="text-xl">📋</span>
                          <strong className="text-white text-xl font-bold">{ordenes.length}</strong>
                        </div>
                        <div title="Órdenes validadas" className="flex items-center gap-2 bg-green-500/30 px-3 py-2 rounded-lg backdrop-blur-sm border border-green-300/40">
                          <span className="text-xl">✓</span>
                          <strong className="text-white text-xl font-bold">{ordenes.filter(o => o.estado === 'Validado').length}</strong>
                        </div>
                        <div title="Órdenes pendientes" className="flex items-center gap-2 bg-yellow-500/30 px-3 py-2 rounded-lg backdrop-blur-sm border border-yellow-300/40">
                          <span className="text-xl">⏳</span>
                          <strong className="text-white text-xl font-bold">{ordenes.filter(o => o.estado !== 'Validado').length}</strong>
                        </div>
                        <div title="Total de pruebas" className="flex items-center gap-2 bg-white/20 px-3 py-2 rounded-lg backdrop-blur-sm">
                          <span className="text-xl">🔬</span>
                          <strong className="text-white text-xl font-bold">
                            {ordenes.reduce((sum, orden) => sum + (parseInt(orden.total_pruebas) || 0), 0)}
                          </strong>
                        </div>
                        <div title="Período" className="hidden md:flex items-center gap-2 bg-white/20 px-3 py-2 rounded-lg backdrop-blur-sm">
                          <span className="text-lg">📅</span>
                          <span className="text-white font-semibold text-sm">{ordenes.length > 0 && (() => {
                            const fechas = ordenes.map(o => new Date(o.fecha)).sort((a, b) => a - b);
                            const primera = fechas[0];
                            const ultima = fechas[fechas.length - 1];
                            const fmt = (f) => f.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
                            return `${fmt(primera)} - ${fmt(ultima)}`;
                          })()}</span>
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="flex items-center gap-2 md:gap-3">
                        <button
                          onClick={() => setFiltrosExpanded(!filtrosExpanded)}
                          className="px-4 py-2 bg-white hover:bg-eg-purple text-eg-purple hover:text-white rounded-lg transition-all duration-200 text-sm font-semibold flex items-center gap-2 min-h-[40px] shadow-md hover:shadow-lg hover:scale-105 border border-white/60"
                          title="Filtrar resultados"
                        >
                          <span className="text-base">🔍</span>
                          <span className="hidden sm:inline">Filtrar</span>
                        </button>
                        <button
                          onClick={() => setHeatMapModalOpen(true)}
                          className="px-4 py-2 bg-white hover:bg-orange-50 text-orange-600 hover:text-orange-700 rounded-lg transition-all duration-200 text-sm font-semibold flex items-center gap-2 min-h-[40px] shadow-md hover:shadow-lg hover:scale-105 border border-orange-200"
                          title="Heat Map"
                        >
                          <span className="text-base">🔥</span>
                          <span className="hidden sm:inline">Heat Map</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : (
              /* VISTA DETALLE DE ORDEN */
              <>
                {/* Fila 1: Volver + Info Orden + Cerrar Sesión */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleVolver}
                      className="min-h-[44px] px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors focus:outline-none focus:ring-4 focus:ring-white/50 flex items-center gap-2 text-white font-semibold"
                      title="Volver a lista de órdenes"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      <span className="hidden sm:inline">Volver</span>
                    </button>
                    <div>
                      <h1 className="text-xl md:text-2xl font-bold text-white">
                        ORDEN {ordenSeleccionada.numero}
                      </h1>
                      <p className="text-white/90 text-sm md:text-base">
                        {new Date(ordenSeleccionada.fecha).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  {autenticado && paciente && (
                    <button
                      onClick={handleCerrarSesion}
                      className="min-h-[44px] px-4 md:px-5 py-2 bg-white hover:bg-red-50 text-red-600 hover:text-red-700 border border-red-200 rounded-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-white/50 font-semibold text-sm shadow-md hover:shadow-lg hover:scale-105"
                    >
                      <span className="hidden sm:inline">Cerrar Sesión</span>
                      <span className="sm:hidden">Cerrar</span>
                    </button>
                  )}
                </div>

                {/* Fila 2: Paciente + Estado */}
                {autenticado && paciente && (
                  <div className="mb-3">
                    <div className="flex flex-wrap items-center gap-2 text-white/90 text-sm md:text-base">
                      <span className="font-semibold text-white">{paciente.nombre}</span>
                      <span className="text-white/60">•</span>
                      <span>{paciente.ci_paciente}</span>
                      <span className="text-white/60">•</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold ${
                        ordenSeleccionada.estado === 'Validado'
                          ? 'bg-green-500/30 text-white border border-green-300/40'
                          : 'bg-yellow-500/30 text-white border border-yellow-300/40'
                      }`}>
                        {ordenSeleccionada.estado === 'Validado' ? '✓' : '⏳'} {ordenSeleccionada.estado}
                      </span>
                    </div>
                  </div>
                )}

                {/* Separador + Info Orden + Navegación */}
                <div className="h-px bg-white/30 mb-3"></div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  {/* Info de la orden */}
                  <div className="flex flex-wrap items-center gap-3">
                    {resultados && resultados.estadisticas && (
                      <>
                        <div title="Total de pruebas" className="flex items-center gap-2 bg-white/20 px-3 py-2 rounded-lg backdrop-blur-sm">
                          <span className="text-lg">🔬</span>
                          <strong className="text-white font-bold">{resultados.estadisticas.total_pruebas}</strong>
                          <span className="text-white/80 text-sm hidden sm:inline">pruebas</span>
                        </div>
                        {resultados.resultados && (
                          <div title="Áreas" className="flex items-center gap-2 bg-white/20 px-3 py-2 rounded-lg backdrop-blur-sm">
                            <span className="text-lg">📊</span>
                            <strong className="text-white font-bold">
                              {new Set(resultados.resultados.map(r => r.area_nombre)).size}
                            </strong>
                            <span className="text-white/80 text-sm hidden sm:inline">áreas</span>
                          </div>
                        )}
                        {resultados.estadisticas.fuera_de_rango > 0 && (
                          <div title="Valores fuera de rango" className="flex items-center gap-2 bg-orange-500/30 px-3 py-2 rounded-lg backdrop-blur-sm border border-orange-300/40">
                            <span className="text-lg">⚠️</span>
                            <strong className="text-white font-bold">{resultados.estadisticas.fuera_de_rango}</strong>
                            <span className="text-white/80 text-sm hidden sm:inline">alertas</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Navegación + Exportar */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleOrdenAnterior}
                      disabled={!obtenerOrdenAnterior() || loadingResultados}
                      className="px-3 md:px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white font-semibold text-sm disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 min-h-[40px]"
                      title={obtenerOrdenAnterior() ? `Anterior: ${obtenerOrdenAnterior().numero}` : 'No hay orden anterior'}
                    >
                      <span>◀</span>
                      <span className="hidden md:inline">Anterior</span>
                    </button>

                    <div className="px-2 py-1 bg-white/10 rounded text-white/90 text-xs font-semibold hidden sm:block">
                      {obtenerIndiceOrdenActual() + 1} de {ordenes.length}
                    </div>

                    <button
                      onClick={handleOrdenSiguiente}
                      disabled={!obtenerOrdenSiguiente() || loadingResultados}
                      className="px-3 md:px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white font-semibold text-sm disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 min-h-[40px]"
                      title={obtenerOrdenSiguiente() ? `Siguiente: ${obtenerOrdenSiguiente().numero}` : 'No hay orden siguiente'}
                    >
                      <span className="hidden md:inline">Siguiente</span>
                      <span>▶</span>
                    </button>

                    <button
                      onClick={handleExportar}
                      disabled={exportLoading}
                      className={`px-4 py-2 bg-white hover:bg-green-50 text-green-600 hover:text-green-700 rounded-lg transition-all duration-200 text-sm font-semibold flex items-center gap-2 min-h-[40px] shadow-md hover:shadow-lg hover:scale-105 border border-green-200 ${
                        exportLoading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      title="Exportar PDF"
                    >
                      {exportLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                          <span className="hidden sm:inline">Exportando...</span>
                        </>
                      ) : (
                        <>
                          <span className="text-base">📄</span>
                          <span className="hidden sm:inline">Exportar PDF</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Content */}
        <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
          {!autenticado ? (
            <ResultadosAuth onAuthSuccess={handleAuthSuccess} />
          ) : loadingResultados ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-eg-purple mx-auto"></div>
                <p className="mt-4 text-eg-gray">Cargando resultados...</p>
              </div>
            </div>
          ) : ordenSeleccionada && resultados ? (
            <ResultadosDetalle
              orden={resultados.orden}
              resultados={resultados.resultados}
              estadisticas={resultados.estadisticas}
              ultimos3PorPrueba={resultados.ultimos3_por_prueba || {}}
              onVolver={handleVolver}
            />
          ) : (
            <>
              {/* Dashboard Global */}
              <DashboardGlobal
                pacienteNombre={paciente?.nombre}
                pacienteCi={paciente?.ci_paciente}
                ordenes={ordenes}
                filtrosExpanded={filtrosExpanded}
                onToggleFiltros={() => setFiltrosExpanded(!filtrosExpanded)}
              />

              {/* Lista de Órdenes */}
              <ResultadosListaOrdenes
                ordenes={ordenes}
                onSelectOrden={handleSelectOrden}
              />
            </>
          )}
        </main>

        {/* Modal de Heat Map */}
        {autenticado && paciente && (
          <HeatMapModal
            isOpen={heatMapModalOpen}
            onClose={() => setHeatMapModalOpen(false)}
            pacienteCi={paciente.ci_paciente}
          />
        )}
      </div>
    </FiltrosProvider>
  );
}
