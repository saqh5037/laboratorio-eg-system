import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaDownload, 
  FaSync, 
  FaTimes, 
  FaWifi, 
  FaMobile,
  FaDesktop,
  FaBell,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';
import pwaManager from '../utils/pwa';

// Componente para prompt de instalación
export const InstallPrompt = ({ className = '' }) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    const handleInstallable = () => {
      setShowPrompt(true);
    };

    const handleInstalled = () => {
      setShowPrompt(false);
      setIsInstalling(false);
    };

    pwaManager.on('onInstallable', handleInstallable);
    pwaManager.on('onInstalled', handleInstalled);

    // Verificar estado inicial
    const installStatus = pwaManager.getInstallStatus();
    if (installStatus.canPromptInstall) {
      setShowPrompt(true);
    }

    return () => {
      pwaManager.off('onInstallable', handleInstallable);
      pwaManager.off('onInstalled', handleInstalled);
    };
  }, []);

  const handleInstall = async () => {
    setIsInstalling(true);
    
    try {
      await pwaManager.promptInstall();
    } catch (error) {
      console.error('Install failed:', error);
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // No mostrar si se descartó recientemente (dentro de 7 días)
  const dismissedAt = localStorage.getItem('pwa-install-dismissed');
  if (dismissedAt) {
    const daysSinceDismissed = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
    if (daysSinceDismissed < 7) {
      return null;
    }
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          className={`fixed bottom-4 right-4 z-50 ${className}`}
        >
          <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-6 max-w-sm">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-eg-purple to-eg-pink rounded-lg flex items-center justify-center">
                  <FaMobile className="text-white text-xl" />
                </div>
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  Instalar Laboratorio EG
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Accede rápidamente desde tu dispositivo, incluso sin conexión
                </p>
                
                <div className="flex gap-2">
                  <button
                    onClick={handleInstall}
                    disabled={isInstalling}
                    className={`btn btn-primary flex-1 flex items-center justify-center gap-2 ${
                      isInstalling ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    {isInstalling ? (
                      <>
                        <FaSync className="animate-spin" />
                        Instalando...
                      </>
                    ) : (
                      <>
                        <FaDownload />
                        Instalar
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={handleDismiss}
                    className="btn btn-outline px-3"
                    title="Cerrar"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Indicador de estado de conexión
export const NetworkStatus = ({ className = '' }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
      
      // Ocultar mensaje después de 5 segundos
      setTimeout(() => setShowOfflineMessage(false), 5000);
    };

    pwaManager.on('onOnline', handleOnline);
    pwaManager.on('onOffline', handleOffline);

    return () => {
      pwaManager.off('onOnline', handleOnline);
      pwaManager.off('onOffline', handleOffline);
    };
  }, []);

  return (
    <>
      {/* Indicador fijo en la esquina */}
      <div className={`fixed top-4 left-4 z-40 ${className}`}>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
          isOnline 
            ? 'bg-green-100 text-green-700 border border-green-200' 
            : 'bg-red-100 text-red-700 border border-red-200'
        }`}>
          {isOnline ? (
            <>
              <FaWifi className="text-green-600" />
              <span className="hidden sm:inline">En línea</span>
            </>
          ) : (
            <>
              <FaExclamationTriangle className="text-red-600" />
              <span className="hidden sm:inline">Sin conexión</span>
            </>
          )}
        </div>
      </div>

      {/* Mensaje de conexión perdida */}
      <AnimatePresence>
        {showOfflineMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
          >
            <div className="bg-amber-50 border border-amber-200 rounded-lg shadow-lg p-4 max-w-sm">
              <div className="flex items-center gap-3">
                <FaExclamationTriangle className="text-amber-600" />
                <div>
                  <h4 className="font-semibold text-amber-900">
                    Conexión perdida
                  </h4>
                  <p className="text-sm text-amber-700">
                    Trabajando en modo offline
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// Wrapper que incluye todos los componentes PWA
export const PWAWrapper = ({ children }) => {
  return (
    <>
      {children}
      <NetworkStatus />
      <InstallPrompt />
    </>
  );
};

export default PWAWrapper;