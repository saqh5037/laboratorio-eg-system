import { motion } from 'framer-motion';
import { FaFlask } from 'react-icons/fa';

const LoadingSpinner = ({ size = 'large', message = 'Cargando...', className = '' }) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8', 
    large: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const containerClasses = {
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8',
    xl: 'p-12'
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-[200px] ${containerClasses[size]} ${className}`}>
      {/* Spinner principal */}
      <motion.div
        className={`relative ${sizeClasses[size]} mb-4`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        {/* Círculo exterior */}
        <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
        
        {/* Círculo de progreso */}
        <div className="absolute inset-0 border-4 border-transparent border-t-eg-purple rounded-full"></div>

        {/* Icono central */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <FaFlask className="text-eg-purple text-lg" />
          </motion.div>
        </div>
      </motion.div>

      {/* Mensaje de carga */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-eg-gray font-medium text-center"
      >
        {message}
      </motion.p>

      {/* Puntos animados */}
      <motion.div
        className="flex gap-1 mt-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-eg-purple rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut"
            }}
          />
        ))}
      </motion.div>
    </div>
  );
};

// Spinner en pantalla completa para cargas iniciales
export const FullScreenLoader = ({ message = 'Iniciando Laboratorio EG...' }) => {
  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="text-center">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <img
            src="/LogoEG.png"
            alt="Laboratorio EG"
            className="w-24 h-24 mx-auto rounded-full shadow-lg"
          />
        </motion.div>

        {/* Spinner */}
        <LoadingSpinner size="xl" message={message} />

        {/* Información adicional */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-eg-gray">
            Preparando tu experiencia médica digital
          </p>
        </motion.div>
      </div>
    </div>
  );
};

// Skeleton loader para componentes específicos
export const SkeletonCard = ({ className = '' }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="h-8 w-24 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
};

// Skeleton para lista de estudios
export const SkeletonList = ({ count = 6 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
};

// Spinner inline para botones
export const InlineSpinner = ({ size = 'small' }) => {
  const sizeClass = size === 'small' ? 'w-4 h-4' : 'w-5 h-5';
  
  return (
    <motion.div
      className={`${sizeClass} border-2 border-current border-t-transparent rounded-full`}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }}
    />
  );
};

export default LoadingSpinner;