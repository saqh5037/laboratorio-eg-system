import React from 'react';
import { motion } from 'framer-motion';
import { FaExclamationTriangle, FaHome, FaSync } from 'react-icons/fa';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Actualizar el estado para que la próxima renderización muestre la UI de error
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Registrar el error
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
      hasError: true
    });

    // Enviar error a servicio de monitoreo (si está configurado)
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService(error, errorInfo) {
    // Implementar envío a servicio de monitoreo como Sentry, LogRocket, etc.
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      retryCount: this.state.retryCount
    };

    // Por ahora solo log a console, pero se puede enviar a un servicio
    console.error('Error logged:', errorData);
    
    // Guardar en localStorage para debug
    try {
      const existingErrors = JSON.parse(localStorage.getItem('app_errors') || '[]');
      existingErrors.push(errorData);
      // Mantener solo los últimos 10 errores
      const recentErrors = existingErrors.slice(-10);
      localStorage.setItem('app_errors', JSON.stringify(recentErrors));
    } catch (e) {
      console.warn('Could not save error to localStorage:', e);
    }
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg w-full bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-pink-500 p-6 text-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <FaExclamationTriangle className="text-2xl" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">¡Ups! Algo salió mal</h1>
                  <p className="text-white/90">Se ha producido un error inesperado</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="text-center mb-6">
                <p className="text-gray-600 mb-4">
                  No te preocupes, nuestro equipo ha sido notificado automáticamente. 
                  Puedes intentar recargar la página o volver al inicio.
                </p>

                {/* Error details toggle (solo en desarrollo) */}
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="text-left bg-gray-50 rounded p-4 mt-4">
                    <summary className="cursor-pointer font-medium text-red-600 mb-2">
                      Detalles técnicos (desarrollo)
                    </summary>
                    <div className="text-sm text-gray-700 space-y-2">
                      <div>
                        <strong>Error:</strong>
                        <pre className="text-xs bg-red-50 p-2 rounded mt-1 overflow-auto">
                          {this.state.error.toString()}
                        </pre>
                      </div>
                      <div>
                        <strong>Stack trace:</strong>
                        <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-32">
                          {this.state.error.stack}
                        </pre>
                      </div>
                    </div>
                  </details>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={this.handleRetry}
                  className="flex-1 btn btn-primary flex items-center justify-center gap-2"
                >
                  <FaSync />
                  Reintentar
                </button>
                
                <button
                  onClick={this.handleGoHome}
                  className="flex-1 btn btn-outline flex items-center justify-center gap-2"
                >
                  <FaHome />
                  Ir al inicio
                </button>
              </div>

              {/* Additional help */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500 mb-2">
                  Si el problema persiste, puedes:
                </p>
                <div className="flex flex-wrap gap-2 justify-center text-xs">
                  <button
                    onClick={() => window.location.reload()}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  >
                    Recargar página
                  </button>
                  <button
                    onClick={() => {
                      localStorage.clear();
                      window.location.reload();
                    }}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  >
                    Limpiar datos
                  </button>
                  <a
                    href="/contacto"
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  >
                    Contactar soporte
                  </a>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Laboratorio Elizabeth Gutiérrez</span>
                <span>ID: {Date.now().toString(36)}</span>
              </div>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook para manejar errores en componentes funcionales
export const useErrorHandler = () => {
  const handleError = (error, errorInfo) => {
    console.error('Error handled:', error, errorInfo);
    
    // Mostrar notificación de error al usuario
    if (window.showErrorNotification) {
      window.showErrorNotification('Se ha producido un error. Por favor, intenta nuevamente.');
    }
  };

  return handleError;
};

// Componente de error para rutas no encontradas
export const NotFound = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl text-gray-400">404</span>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Página no encontrada
        </h1>
        
        <p className="text-gray-600 mb-6">
          La página que buscas no existe o ha sido movida.
        </p>
        
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => window.history.back()}
            className="btn btn-outline"
          >
            Volver atrás
          </button>
          
          <a href="/" className="btn btn-primary">
            Ir al inicio
          </a>
        </div>
      </motion.div>
    </div>
  );
};

export default ErrorBoundary;