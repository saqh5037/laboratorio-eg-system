import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaHeart, FaRegHeart, FaPlus } from 'react-icons/fa';

/**
 * Botón animado para agregar/quitar favoritos
 * Con feedback visual y efectos de partículas
 */
const FavoriteButton = ({
  isFavorite,
  onToggle,
  study,
  size = 'medium',
  variant = 'default',
  showLabel = false,
  disabled = false,
  className = ''
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showParticles, setShowParticles] = useState(false);

  // Configuraciones de tamaño
  const sizeConfig = {
    small: {
      icon: 14,
      button: 'w-8 h-8',
      text: 'text-xs'
    },
    medium: {
      icon: 16,
      button: 'w-10 h-10',
      text: 'text-sm'
    },
    large: {
      icon: 20,
      button: 'w-12 h-12',
      text: 'text-base'
    }
  };

  const config = sizeConfig[size];

  // Manejar click con animación
  const handleClick = async (e) => {
    e.stopPropagation();
    
    if (disabled || isAnimating) return;

    setIsAnimating(true);

    // Mostrar partículas si se está agregando a favoritos
    if (!isFavorite) {
      setShowParticles(true);
      setTimeout(() => setShowParticles(false), 1000);
    }

    // Ejecutar callback
    if (onToggle) {
      onToggle(study);
    }

    // Finalizar animación
    setTimeout(() => setIsAnimating(false), 600);
  };

  // Variantes de estilo
  const getButtonStyles = () => {
    const baseStyles = `${config.button} rounded-full flex items-center justify-center transition-all duration-200 relative overflow-hidden`;
    
    switch (variant) {
      case 'floating':
        return `${baseStyles} bg-white shadow-lg hover:shadow-xl border border-gray-200 ${
          isFavorite ? 'bg-red-50 border-red-200' : 'hover:bg-gray-50'
        }`;
      
      case 'outline':
        return `${baseStyles} border-2 ${
          isFavorite 
            ? 'border-red-500 bg-red-50' 
            : 'border-gray-300 hover:border-red-300 hover:bg-red-50'
        }`;
      
      case 'minimal':
        return `${baseStyles} ${
          isFavorite ? 'bg-red-50' : 'hover:bg-gray-100'
        }`;
      
      default:
        return `${baseStyles} ${
          isFavorite 
            ? 'bg-red-500 hover:bg-red-600 text-white' 
            : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
        }`;
    }
  };

  // Color del icono
  const getIconColor = () => {
    if (variant === 'default' && isFavorite) return 'text-white';
    if (isFavorite) return 'text-red-500';
    return 'text-gray-400';
  };

  return (
    <div className={`relative inline-flex items-center gap-2 ${className}`}>
      {/* Botón principal */}
      <motion.button
        onClick={handleClick}
        disabled={disabled}
        className={`${getButtonStyles()} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        whileHover={disabled ? {} : { scale: 1.05 }}
        whileTap={disabled ? {} : { scale: 0.95 }}
        initial={false}
        animate={{
          scale: isAnimating ? [1, 1.2, 1] : 1,
        }}
        transition={{
          duration: 0.6,
          ease: "easeInOut"
        }}
      >
        {/* Icono principal */}
        <motion.div
          initial={false}
          animate={{
            scale: isAnimating ? [1, 1.3, 1] : 1,
            rotate: isAnimating ? [0, 15, -15, 0] : 0
          }}
          transition={{
            duration: 0.6,
            ease: "easeInOut"
          }}
        >
          {isFavorite ? (
            <FaHeart className={getIconColor()} size={config.icon} />
          ) : (
            <FaRegHeart className={getIconColor()} size={config.icon} />
          )}
        </motion.div>

        {/* Efecto de ondas al hacer click */}
        {isAnimating && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-red-400"
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        )}

        {/* Partículas flotantes */}
        {showParticles && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-red-400 rounded-full"
                initial={{
                  x: 0,
                  y: 0,
                  scale: 0,
                  opacity: 1
                }}
                animate={{
                  x: (Math.random() - 0.5) * 40,
                  y: (Math.random() - 0.5) * 40,
                  scale: [0, 1, 0],
                  opacity: [1, 1, 0]
                }}
                transition={{
                  duration: 1,
                  delay: i * 0.1,
                  ease: "easeOut"
                }}
              />
            ))}
          </>
        )}
      </motion.button>

      {/* Label opcional */}
      {showLabel && (
        <motion.span
          className={`${config.text} font-medium ${
            isFavorite ? 'text-red-600' : 'text-gray-600'
          }`}
          initial={false}
          animate={{
            color: isFavorite ? '#dc2626' : '#6b7280'
          }}
          transition={{ duration: 0.3 }}
        >
          {isFavorite ? 'En favoritos' : 'Agregar a favoritos'}
        </motion.span>
      )}
    </div>
  );
};

/**
 * Botón flotante para agregar a favoritos
 * Versión simplificada para uso en cards y listas
 */
export const FavoriteButtonFloating = ({ 
  isFavorite, 
  onToggle, 
  study, 
  className = '' 
}) => {
  return (
    <FavoriteButton
      isFavorite={isFavorite}
      onToggle={onToggle}
      study={study}
      size="medium"
      variant="floating"
      className={className}
    />
  );
};

/**
 * Botón con icono de más para agregar rápido
 * Para usar en headers y barras de herramientas
 */
export const AddToFavoritesButton = ({ 
  onAdd, 
  study, 
  className = '' 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.button
      onClick={(e) => {
        e.stopPropagation();
        onAdd(study);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        inline-flex items-center gap-2 px-3 py-2 rounded-lg
        bg-eg-purple text-white hover:bg-eg-purpleDark
        transition-all duration-200 ${className}
      `}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <motion.div
        animate={{ rotate: isHovered ? 90 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <FaPlus size={14} />
      </motion.div>
      <span className="text-sm font-medium">Agregar a favoritos</span>
    </motion.button>
  );
};

/**
 * Indicador de favorito con contador
 * Para mostrar en navegación y estadísticas
 */
export const FavoriteIndicator = ({ 
  count = 0, 
  isActive = false, 
  onClick,
  className = '' 
}) => {
  return (
    <motion.button
      onClick={onClick}
      className={`
        inline-flex items-center gap-2 px-3 py-2 rounded-lg
        transition-all duration-200 ${className}
        ${isActive 
          ? 'bg-red-50 text-red-600 border border-red-200' 
          : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
        }
      `}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <motion.div
        animate={{ 
          scale: isActive ? [1, 1.2, 1] : 1,
          color: isActive ? '#dc2626' : '#6b7280'
        }}
        transition={{ duration: 0.3 }}
      >
        <FaHeart size={16} />
      </motion.div>
      <span className="text-sm font-medium">
        {count > 0 ? count : 'Favoritos'}
      </span>
    </motion.button>
  );
};

export default FavoriteButton;