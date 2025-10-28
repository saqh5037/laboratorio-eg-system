import { useState, useEffect } from 'react';
import logger from '../../utils/logger';
import { autenticarPaciente } from '../../services/resultsApi';
import toast from 'react-hot-toast';
import TelegramAuthModal from '../auth/TelegramAuthModal';
import { useTelegramAuth } from '../../contexts/TelegramAuthContext';
import { getAuthenticatedPatient } from '../../services/messagingBotApi';

export default function ResultadosAuth({ onAuthSuccess }) {
  const [codigoLealtad, setCodigoLealtad] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTelegramModal, setShowTelegramModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null); // null, 'telegram', 'cedula'
  const { login } = useTelegramAuth();

  // Verificar si hay un estado de autenticación Telegram pendiente al montar
  useEffect(() => {
    const savedState = sessionStorage.getItem('telegram_auth_state');
    if (savedState) {
      try {
        const { step } = JSON.parse(savedState);
        // Si hay un código pendiente (step 2), abrir automáticamente el modal
        if (step === 2) {
          setSelectedMethod('telegram');
          setShowTelegramModal(true);
        }
      } catch (error) {
        console.error('Error al restaurar estado de Telegram:', error);
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!codigoLealtad || !fechaNacimiento) {
      toast.error('Por favor complete todos los campos');
      return;
    }

    setLoading(true);

    try {
      const data = await autenticarPaciente(codigoLealtad, fechaNacimiento);
      toast.success(`Bienvenido ${data.paciente.nombre}`);
      onAuthSuccess(data);
    } catch (error) {
      logger.error('Error de autenticación:', error);

      if (error.code === 'RATE_LIMIT_EXCEEDED') {
        toast.error('Demasiados intentos. Por favor, intente más tarde.');
      } else if (error.status === 401) {
        toast.error('Código o fecha de nacimiento incorrectos');
      } else if (error.code === 'NETWORK_ERROR') {
        toast.error('Error de conexión. Verifique su conexión a internet.');
      } else {
        toast.error('Error al autenticar. Intente nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Manejar selección de método
  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    if (method === 'telegram') {
      setShowTelegramModal(true);
    }
  };

  // Manejar éxito de autenticación Telegram
  const handleTelegramAuthSuccess = async (authData) => {
    try {
      // Llamar al login del context
      login(authData);

      // Obtener datos reales del paciente desde el backend
      const { getAuthenticatedPatient } = await import('../../services/messagingBotApi');
      const pacienteData = await getAuthenticatedPatient();

      // IMPORTANTE: Guardar el token también como 'results_token' para compatibilidad
      // con el resultsApi.js que busca ese nombre específico
      localStorage.setItem('results_token', authData.token);
      localStorage.setItem('results_paciente', JSON.stringify({
        nombre: `${pacienteData.nombre} ${pacienteData.apellido}`,
        ci_paciente: pacienteData.ci_paciente,
      }));

      // Crear objeto compatible con onAuthSuccess
      const authSuccessData = {
        token: authData.token,
        paciente: {
          id: pacienteData.id,
          nombre: pacienteData.nombre,
          apellido: pacienteData.apellido,
          ci_paciente: pacienteData.ci_paciente,
        },
      };

      onAuthSuccess(authSuccessData);
    } catch (error) {
      console.error('Error al obtener datos del paciente:', error);
      toast.error('Error al cargar datos del paciente');
    }
  };

  return (
    <>
      <div className="min-h-screen sm:min-h-[60vh] flex items-center justify-center px-3 sm:px-4 py-4 sm:py-6">
        <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg hover:shadow-xl border-2 border-eg-purple/20 p-4 sm:p-6 lg:p-8 transition-all duration-200">
          {/* Header con mayor contraste */}
          <div className="text-center mb-4 sm:mb-6 lg:mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-eg-purple/20 to-eg-pink/20 border-2 border-eg-purple/30 rounded-full mb-3 sm:mb-4 lg:mb-6">
              <svg className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-eg-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl text-gray-900 mb-2 sm:mb-3 font-bold">
              Consulta de Resultados
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 px-2">
              {selectedMethod === null ? 'Seleccione su método de acceso' : 'Ingrese sus datos'}
            </p>
          </div>

          {/* Pantalla de selección de método */}
          {selectedMethod === null && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
              {/* Opción Telegram */}
              <button
                onClick={() => handleMethodSelect('telegram')}
                className="group relative overflow-hidden bg-gradient-to-br from-[#0088cc] to-[#0077b3] active:from-[#0077b3] active:to-[#006699] md:hover:from-[#0077b3] md:hover:to-[#006699] text-white rounded-xl p-5 sm:p-6 lg:p-8 shadow-lg md:hover:shadow-2xl transition-all duration-300 md:transform md:hover:scale-105 active:scale-95 min-h-[140px] sm:min-h-[160px]"
              >
                <div className="flex flex-col items-center space-y-2 sm:space-y-3 lg:space-y-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1">Telegram</h3>
                    <p className="text-white/90 text-xs sm:text-sm">Rápido y Seguro</p>
                  </div>
                  <div className="hidden sm:block text-xs text-white/80 mt-2 lg:mt-4">
                    ✓ Sin contraseñas<br/>
                    ✓ Autenticación instantánea
                  </div>
                </div>
              </button>

              {/* Opción Cédula */}
              <button
                onClick={() => handleMethodSelect('cedula')}
                className="group relative overflow-hidden bg-gradient-to-br from-eg-purple to-eg-pink active:from-eg-purple/90 active:to-eg-pink/90 md:hover:from-eg-purple/90 md:hover:to-eg-pink/90 text-white rounded-xl p-5 sm:p-6 lg:p-8 shadow-lg md:hover:shadow-2xl transition-all duration-300 md:transform md:hover:scale-105 active:scale-95 min-h-[140px] sm:min-h-[160px]"
              >
                <div className="flex flex-col items-center space-y-2 sm:space-y-3 lg:space-y-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1">Cédula</h3>
                    <p className="text-white/90 text-xs sm:text-sm">Método Tradicional</p>
                  </div>
                  <div className="hidden sm:block text-xs text-white/80 mt-2 lg:mt-4">
                    ✓ Código de lealtad<br/>
                    ✓ Fecha de nacimiento
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Formulario de Cédula (solo si se seleccionó cedula) */}
          {selectedMethod === 'cedula' && (
            <>
              <button
                onClick={() => setSelectedMethod(null)}
                className="mb-4 sm:mb-6 flex items-center gap-2 text-eg-purple hover:text-eg-purple/80 active:text-eg-purple/70 transition-colors min-h-[44px]"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="text-sm sm:text-base">Volver</span>
              </button>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Código de Lealtad con mayor contraste */}
            <div>
              <label htmlFor="codigo" className="block text-sm sm:text-base text-gray-900 mb-2 font-medium">
                Código de Lealtad / Cédula
              </label>
              <input
                id="codigo"
                type="text"
                value={codigoLealtad}
                onChange={(e) => setCodigoLealtad(e.target.value)}
                placeholder="Ej: V-12345678"
                className="w-full px-3 sm:px-4 py-3 min-h-[44px] sm:min-h-[48px] text-sm sm:text-base text-gray-900 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-eg-purple/50 focus:border-eg-purple hover:border-eg-purple/50 placeholder:text-gray-400 transition-all duration-200"
                disabled={loading}
                autoComplete="username"
              />
            </div>

            {/* Fecha de Nacimiento con mayor contraste */}
            <div>
              <label htmlFor="fecha" className="block text-sm sm:text-base text-gray-900 mb-2 font-medium">
                Fecha de Nacimiento
              </label>
              <input
                id="fecha"
                type="date"
                value={fechaNacimiento}
                onChange={(e) => setFechaNacimiento(e.target.value)}
                className="w-full px-3 sm:px-4 py-3 min-h-[44px] sm:min-h-[48px] text-sm sm:text-base text-gray-900 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-eg-purple/50 focus:border-eg-purple hover:border-eg-purple/50 transition-all duration-200"
                disabled={loading}
                autoComplete="bday"
              />
            </div>

            {/* Submit Button con mayor contraste */}
            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[44px] sm:min-h-[48px] text-base sm:text-lg bg-gradient-to-r from-eg-purple to-eg-pink text-white py-3 px-6 rounded-lg font-medium shadow-lg active:shadow-md md:hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-eg-purple/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verificando...
                </span>
              ) : (
                'Acceder a Resultados'
              )}
            </button>
          </form>

              {/* Help Text con mayor contraste - más compacto en móviles */}
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-eg-purple/10 border-2 border-eg-purple/30 rounded-lg">
                <p className="text-xs sm:text-sm lg:text-base text-gray-900">
                  <span className="text-eg-purple font-semibold">Nota:</span> Ingrese su código de lealtad (cédula) y fecha de nacimiento.
                </p>
              </div>

              {/* Demo Data (only in development) con mayor contraste */}
              {import.meta.env.DEV && (
                <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-eg-pink/10 border-2 border-eg-pink/30 rounded-lg">
                  <p className="text-xs sm:text-sm font-mono text-gray-900">
                    <span className="text-eg-pink-700 font-semibold">DEV:</span> V-17371453, 1998-10-16
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal de Telegram */}
      <TelegramAuthModal
        isOpen={showTelegramModal}
        onClose={() => setShowTelegramModal(false)}
        onSuccess={handleTelegramAuthSuccess}
      />
    </>
  );
}
