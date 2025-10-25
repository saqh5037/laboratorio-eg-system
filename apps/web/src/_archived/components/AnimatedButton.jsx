import { motion } from 'framer-motion';
import { buttonVariants } from '../utils/animations';
import { useState } from 'react';

const AnimatedButton = ({ 
  children, 
  onClick, 
  variant = "primary", 
  size = "md", 
  disabled = false,
  loading = false,
  icon: Icon,
  className = "",
  haptic = true,
  ...props 
}) => {
  const [isPressed, setIsPressed] = useState(false);

  // Feedback háptico para móviles
  const triggerHapticFeedback = () => {
    if (haptic && typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10); // Vibración sutil de 10ms
    }
  };

  const handleClick = (e) => {
    if (disabled || loading) return;
    
    triggerHapticFeedback();
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);
    
    if (onClick) onClick(e);
  };

  const baseClasses = "relative inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantClasses = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-900 focus:ring-gray-500",
    success: "bg-green-600 hover:bg-green-700 text-white focus:ring-green-500",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
    outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500",
    ghost: "text-gray-600 hover:bg-gray-100 focus:ring-gray-500",
    medical: "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white focus:ring-blue-500 shadow-lg"
  };
  
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
    xl: "px-8 py-4 text-xl"
  };

  const buttonClassNames = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <motion.button
      className={buttonClassNames}
      variants={buttonVariants}
      initial="idle"
      whileHover={!disabled && !loading ? "hover" : "idle"}
      whileTap={!disabled && !loading ? "tap" : "idle"}
      animate={loading ? "loading" : "idle"}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {/* Loading overlay */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-current bg-opacity-20 rounded-lg"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
          />
        </motion.div>
      )}

      {/* Press effect overlay */}
      {isPressed && (
        <motion.div
          initial={{ scale: 0, opacity: 0.3 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-white rounded-lg pointer-events-none"
        />
      )}

      {/* Content */}
      <span className={`flex items-center space-x-2 ${loading ? 'opacity-0' : 'opacity-100'}`}>
        {Icon && (
          <motion.span
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
          >
            <Icon className="w-5 h-5" />
          </motion.span>
        )}
        <span>{children}</span>
      </span>
    </motion.button>
  );
};

// Botón flotante especializado para acciones rápidas
export const FloatingActionButton = ({ 
  onClick, 
  icon: Icon, 
  className = "",
  position = "bottom-right",
  haptic = true 
}) => {
  const positionClasses = {
    "bottom-right": "fixed bottom-6 right-6",
    "bottom-left": "fixed bottom-6 left-6",
    "top-right": "fixed top-6 right-6",
    "top-left": "fixed top-6 left-6"
  };

  const triggerHapticFeedback = () => {
    if (haptic && typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(15);
    }
  };

  return (
    <motion.button
      className={`${positionClasses[position]} w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 z-50 ${className}`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={(e) => {
        triggerHapticFeedback();
        onClick(e);
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
    >
      {Icon && <Icon className="w-6 h-6" />}
    </motion.button>
  );
};

// Botón de toggle animado
export const AnimatedToggle = ({ 
  checked = false, 
  onChange, 
  label,
  disabled = false,
  size = "md",
  haptic = true 
}) => {
  const triggerHapticFeedback = () => {
    if (haptic && typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(8);
    }
  };

  const sizeClasses = {
    sm: "w-8 h-4",
    md: "w-10 h-5",
    lg: "w-12 h-6"
  };

  const knobSizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4", 
    lg: "w-5 h-5"
  };

  return (
    <div className="flex items-center space-x-3">
      <motion.button
        className={`${sizeClasses[size]} relative inline-flex items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
          checked ? 'bg-blue-600' : 'bg-gray-300'
        }`}
        onClick={() => {
          if (disabled) return;
          triggerHapticFeedback();
          onChange(!checked);
        }}
        disabled={disabled}
        whileTap={{ scale: 0.95 }}
      >
        <motion.span
          className={`${knobSizeClasses[size]} bg-white rounded-full shadow transform transition-transform`}
          initial={false}
          animate={{
            x: checked ? 
              (size === 'sm' ? 16 : size === 'md' ? 20 : 24) : 2
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </motion.button>
      
      {label && (
        <motion.label
          className="text-sm font-medium text-gray-700 cursor-pointer"
          onClick={() => {
            if (disabled) return;
            triggerHapticFeedback();
            onChange(!checked);
          }}
          whileTap={{ scale: 0.98 }}
        >
          {label}
        </motion.label>
      )}
    </div>
  );
};

// Botón con contador animado
export const CounterButton = ({ 
  count = 0, 
  onIncrement, 
  onDecrement, 
  min = 0, 
  max = Infinity,
  disabled = false,
  haptic = true 
}) => {
  const triggerHapticFeedback = () => {
    if (haptic && typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  return (
    <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
      <motion.button
        className="w-8 h-8 flex items-center justify-center rounded-md bg-white shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          if (count > min) {
            triggerHapticFeedback();
            onDecrement();
          }
        }}
        disabled={disabled || count <= min}
      >
        <span className="text-lg font-semibold text-gray-600">-</span>
      </motion.button>
      
      <motion.span
        key={count}
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="min-w-[2rem] text-center font-semibold text-gray-900"
      >
        {count}
      </motion.span>
      
      <motion.button
        className="w-8 h-8 flex items-center justify-center rounded-md bg-white shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          if (count < max) {
            triggerHapticFeedback();
            onIncrement();
          }
        }}
        disabled={disabled || count >= max}
      >
        <span className="text-lg font-semibold text-gray-600">+</span>
      </motion.button>
    </div>
  );
};

export default AnimatedButton;