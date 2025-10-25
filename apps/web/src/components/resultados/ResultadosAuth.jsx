import { useState } from 'react';
import { autenticarPaciente } from '../../services/resultsApi';
import toast from 'react-hot-toast';

export default function ResultadosAuth({ onAuthSuccess }) {
  const [codigoLealtad, setCodigoLealtad] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [loading, setLoading] = useState(false);

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
      console.error('Error de autenticación:', error);

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

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg hover:shadow-xl border-2 border-eg-purple/20 p-8 transition-all duration-200">
        {/* Header con mayor contraste */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-eg-purple/20 to-eg-pink/20 border-2 border-eg-purple/30 rounded-full mb-6">
            <svg className="w-10 h-10 text-eg-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-3xl text-gray-900 mb-3">
            Consulta de Resultados
          </h2>
          <p className="text-lg text-gray-600">
            Ingrese sus datos para acceder a sus resultados
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Código de Lealtad con mayor contraste */}
          <div>
            <label htmlFor="codigo" className="block text-base text-gray-900 mb-2">
              Código de Lealtad / Cédula
            </label>
            <input
              id="codigo"
              type="text"
              value={codigoLealtad}
              onChange={(e) => setCodigoLealtad(e.target.value)}
              placeholder="Ej: V-12345678"
              className="w-full px-4 py-3 min-h-[48px] text-base text-gray-900 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-eg-purple/50 focus:border-eg-purple hover:border-eg-purple/50 placeholder:text-gray-400 transition-all duration-200"
              disabled={loading}
            />
          </div>

          {/* Fecha de Nacimiento con mayor contraste */}
          <div>
            <label htmlFor="fecha" className="block text-base text-gray-900 mb-2">
              Fecha de Nacimiento
            </label>
            <input
              id="fecha"
              type="date"
              value={fechaNacimiento}
              onChange={(e) => setFechaNacimiento(e.target.value)}
              className="w-full px-4 py-3 min-h-[48px] text-base text-gray-900 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-eg-purple/50 focus:border-eg-purple hover:border-eg-purple/50 transition-all duration-200"
              disabled={loading}
            />
          </div>

          {/* Submit Button con mayor contraste */}
          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[48px] text-lg bg-gradient-to-r from-eg-purple to-eg-pink text-white py-3 px-6 rounded-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-eg-purple/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
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

        {/* Help Text con mayor contraste */}
        <div className="mt-6 p-4 bg-eg-purple/10 border-2 border-eg-purple/30 rounded-lg">
          <p className="text-base text-gray-900">
            <span className="text-eg-purple">Nota:</span> Para acceder a sus resultados, ingrese su código de lealtad (cédula) y su fecha de nacimiento exacta.
          </p>
        </div>

        {/* Demo Data (only in development) con mayor contraste */}
        {import.meta.env.DEV && (
          <div className="mt-4 p-4 bg-eg-pink/10 border-2 border-eg-pink/30 rounded-lg">
            <p className="text-sm font-mono text-gray-900">
              <span className="text-eg-pink-700">DEV:</span> Código: V-17371453, Fecha: 1998-10-16
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
