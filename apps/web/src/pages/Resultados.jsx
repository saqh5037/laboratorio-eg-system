import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ResultadosAuth from '../components/resultados/ResultadosAuth';
import ResultadosListaOrdenes from '../components/resultados/ResultadosListaOrdenes';
import ResultadosDetalle from '../components/resultados/ResultadosDetalle';
import DashboardGlobal from '../components/dashboard/DashboardGlobal';
import { FiltrosProvider } from '../contexts/FiltrosContext';
import {
  haySesionActiva,
  getPacienteInfo,
  obtenerOrdenes,
  obtenerResultadosOrden,
  cerrarSesion,
  manejarErrorAuth,
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
      setOrdenes(data.ordenes || []);
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
    setLoadingResultados(true);
    try {
      const data = await obtenerResultadosOrden(orden.numero);
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
        {/* Cintillo Lila - Igual que página de Estudios */}
        <section className="bg-eg-purple py-6 md:py-8 border-b-4 border-eg-pink">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Icono de documento */}
                <div className="bg-white/20 rounded-lg p-3">
                  <svg className="text-white w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  {/* Título principal */}
                  <h1 className="text-2xl md:text-3xl font-bold text-white">
                    Consulta de Resultados
                  </h1>
                  {autenticado && paciente && (
                    <p className="text-white/90 text-base md:text-lg font-medium mt-1">
                      {paciente.nombre} - {paciente.ci_paciente}
                    </p>
                  )}
                </div>
              </div>

              {/* Botón Cerrar Sesión */}
              {autenticado && paciente && (
                <button
                  onClick={handleCerrarSesion}
                  className="min-h-[44px] px-4 py-2 bg-white/20 hover:bg-white/30 text-white border-2 border-white/30 rounded-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-white/50"
                >
                  Cerrar Sesión
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              onVolver={handleVolver}
            />
          ) : (
            <>
              {/* Dashboard Global */}
              <DashboardGlobal
                pacienteNombre={paciente?.nombre}
                pacienteCi={paciente?.ci_paciente}
                ordenes={ordenes}
              />

              {/* Lista de Órdenes */}
              <ResultadosListaOrdenes
                ordenes={ordenes}
                onSelectOrden={handleSelectOrden}
              />
            </>
          )}
        </main>
      </div>
    </FiltrosProvider>
  );
}
