import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, createContext, useContext } from 'react';
import { toastVariants } from '../utils/animations';
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes, FaExclamationCircle } from 'react-icons/fa';

// Context para gestionar toasts globalmente
const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe usarse dentro de ToastProvider');
  }
  return context;
};

// Provider de toasts
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info', options = {}) => {
    const id = Date.now() + Math.random();
    const toast = {
      id,
      message,
      type,
      duration: options.duration || 5000,
      persistent: options.persistent || false,
      action: options.action,
      ...options
    };

    setToasts(prev => [...prev, toast]);

    // Auto remove si no es persistente
    if (!toast.persistent) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration);
    }

    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearAllToasts = () => {
    setToasts([]);
  };

  // Métodos de conveniencia
  const success = (message, options) => addToast(message, 'success', options);
  const error = (message, options) => addToast(message, 'error', options);
  const warning = (message, options) => addToast(message, 'warning', options);
  const info = (message, options) => addToast(message, 'info', options);
  const medical = (message, options) => addToast(message, 'medical', options);

  const contextValue = {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    success,
    error,
    warning,
    info,
    medical
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

// Container que renderiza los toasts
const ToastContainer = () => {
  const { toasts } = useToast();

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2 max-w-sm w-full">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Componente individual de toast
const ToastItem = ({ toast }) => {
  const { removeToast } = useToast();
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (toast.persistent) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev - (100 / (toast.duration / 100));
        return newProgress <= 0 ? 0 : newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [toast.duration, toast.persistent]);

  const getToastConfig = (type) => {
    const configs = {
      success: {
        icon: FaCheckCircle,
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        iconColor: 'text-green-500',
        textColor: 'text-green-800',
        progressColor: 'bg-green-500'
      },
      error: {
        icon: FaExclamationCircle,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        iconColor: 'text-red-500',
        textColor: 'text-red-800',
        progressColor: 'bg-red-500'
      },
      warning: {
        icon: FaExclamationTriangle,
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        iconColor: 'text-yellow-500',
        textColor: 'text-yellow-800',
        progressColor: 'bg-yellow-500'
      },
      info: {
        icon: FaInfoCircle,
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        iconColor: 'text-blue-500',
        textColor: 'text-blue-800',
        progressColor: 'bg-blue-500'
      },
      medical: {
        icon: FaInfoCircle,
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-300',
        iconColor: 'text-blue-600',
        textColor: 'text-blue-900',
        progressColor: 'bg-gradient-to-r from-blue-500 to-blue-600'
      }
    };

    return configs[type] || configs.info;
  };

  const config = getToastConfig(toast.type);
  const Icon = config.icon;

  // Trigger haptic feedback on mobile
  const triggerHapticFeedback = () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  const handleClose = () => {
    triggerHapticFeedback();
    removeToast(toast.id);
  };

  const handleActionClick = () => {
    triggerHapticFeedback();
    if (toast.action?.onClick) {
      toast.action.onClick();
    }
    if (toast.action?.dismissOnAction !== false) {
      removeToast(toast.id);
    }
  };

  return (
    <motion.div
      layout
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={toastVariants}
      className={`
        relative overflow-hidden rounded-lg shadow-lg border backdrop-blur-sm
        ${config.bgColor} ${config.borderColor}
        max-w-sm w-full pointer-events-auto
      `}
    >
      {/* Progress bar */}
      {!toast.persistent && (
        <motion.div
          className={`absolute top-0 left-0 h-1 ${config.progressColor}`}
          initial={{ width: '100%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1, ease: 'linear' }}
        />
      )}

      <div className="p-4">
        <div className="flex items-start space-x-3">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className={`flex-shrink-0 ${config.iconColor}`}
          >
            <Icon className="w-5 h-5" />
          </motion.div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {toast.title && (
                <h4 className={`text-sm font-semibold ${config.textColor} mb-1`}>
                  {toast.title}
                </h4>
              )}
              
              <p className={`text-sm ${config.textColor} leading-relaxed`}>
                {toast.message}
              </p>

              {/* Action button */}
              {toast.action && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  onClick={handleActionClick}
                  className={`
                    mt-3 text-sm font-medium underline ${config.textColor}
                    hover:no-underline focus:outline-none focus:ring-2 
                    focus:ring-offset-2 focus:ring-blue-500 rounded
                  `}
                >
                  {toast.action.label}
                </motion.button>
              )}
            </motion.div>
          </div>

          {/* Close button */}
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleClose}
            className={`
              flex-shrink-0 ${config.textColor} hover:opacity-70
              focus:outline-none focus:ring-2 focus:ring-offset-2 
              focus:ring-blue-500 rounded-full p-1
            `}
          >
            <FaTimes className="w-3 h-3" />
          </motion.button>
        </div>
      </div>

      {/* Subtle background animation */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-5"
        animate={{ x: [-100, 400] }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </motion.div>
  );
};

// Hook para toasts de carga
export const useLoadingToast = () => {
  const { addToast, removeToast } = useToast();

  const showLoading = (message = "Cargando...", options = {}) => {
    return addToast(message, 'info', {
      ...options,
      persistent: true,
      icon: () => (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"
        />
      )
    });
  };

  const hideLoading = (id) => {
    removeToast(id);
  };

  const withLoading = async (promise, loadingMessage = "Procesando...") => {
    const loadingId = showLoading(loadingMessage);
    
    try {
      const result = await promise;
      hideLoading(loadingId);
      return result;
    } catch (error) {
      hideLoading(loadingId);
      throw error;
    }
  };

  return { showLoading, hideLoading, withLoading };
};

// Toast preconfigurados para contexto médico
export const MedicalToasts = {
  patientSaved: (name) => ({
    message: `Datos de ${name} guardados correctamente`,
    type: 'success',
    title: 'Paciente actualizado'
  }),

  studyCompleted: (studyName) => ({
    message: `El estudio ${studyName} se ha completado`,
    type: 'success',
    title: 'Estudio finalizado',
    action: {
      label: 'Ver resultados',
      onClick: () => console.log('Navigate to results')
    }
  }),

  appointmentReminder: (time) => ({
    message: `Cita programada para ${time}`,
    type: 'info',
    title: 'Recordatorio',
    persistent: true
  }),

  criticalResult: (patientName) => ({
    message: `Resultado crítico para ${patientName}`,
    type: 'warning',
    title: 'Atención requerida',
    persistent: true,
    action: {
      label: 'Revisar ahora',
      onClick: () => console.log('Navigate to critical result')
    }
  }),

  systemMaintenance: () => ({
    message: 'El sistema estará en mantenimiento en 10 minutos',
    type: 'warning',
    title: 'Mantenimiento programado',
    duration: 10000
  }),

  offlineMode: () => ({
    message: 'Trabajando en modo offline. Los datos se sincronizarán automáticamente.',
    type: 'info',
    title: 'Sin conexión',
    persistent: true
  })
};

// Componente para toasts de confirmación
export const ConfirmationToast = ({ 
  message, 
  onConfirm, 
  onCancel,
  confirmText = "Confirmar",
  cancelText = "Cancelar" 
}) => {
  const { addToast } = useToast();

  const showConfirmation = () => {
    addToast(message, 'warning', {
      persistent: true,
      title: 'Confirmación requerida',
      action: {
        label: confirmText,
        onClick: onConfirm,
        dismissOnAction: true
      },
      extraActions: [
        {
          label: cancelText,
          onClick: onCancel,
          variant: 'secondary'
        }
      ]
    });
  };

  return { showConfirmation };
};

export default {
  ToastProvider,
  useToast,
  useLoadingToast,
  MedicalToasts,
  ConfirmationToast
};