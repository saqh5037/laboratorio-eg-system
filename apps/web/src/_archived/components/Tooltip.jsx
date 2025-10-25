import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

// Hook para calcular posición de tooltip
const useTooltipPosition = (triggerRef, tooltipRef, placement = 'top', offset = 8) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const updatePosition = () => {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let x = 0;
      let y = 0;

      switch (placement) {
        case 'top':
          x = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
          y = triggerRect.top - tooltipRect.height - offset;
          break;
        case 'bottom':
          x = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
          y = triggerRect.bottom + offset;
          break;
        case 'left':
          x = triggerRect.left - tooltipRect.width - offset;
          y = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
          break;
        case 'right':
          x = triggerRect.right + offset;
          y = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
          break;
      }

      // Ajustar si se sale del viewport
      if (x < 0) x = 8;
      if (x + tooltipRect.width > viewportWidth) x = viewportWidth - tooltipRect.width - 8;
      if (y < 0) y = 8;
      if (y + tooltipRect.height > viewportHeight) y = viewportHeight - tooltipRect.height - 8;

      setPosition({ x, y });
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [triggerRef, tooltipRef, placement, offset]);

  return position;
};

// Tooltip básico
export const Tooltip = ({ 
  children, 
  content, 
  placement = 'top',
  delay = 500,
  offset = 8,
  disabled = false,
  className = "",
  arrow = true,
  interactive = false,
  maxWidth = 200
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);

  const position = useTooltipPosition(triggerRef, tooltipRef, placement, offset);

  const showTooltip = () => {
    if (disabled) return;
    
    const id = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  };

  const tooltipVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      y: placement === 'top' ? 10 : placement === 'bottom' ? -10 : 0,
      x: placement === 'left' ? 10 : placement === 'right' ? -10 : 0
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      x: 0,
      transition: {
        duration: 0.2,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const getArrowClasses = () => {
    const base = "absolute w-2 h-2 bg-gray-900 transform rotate-45";
    switch (placement) {
      case 'top':
        return `${base} bottom-[-4px] left-1/2 -translate-x-1/2`;
      case 'bottom':
        return `${base} top-[-4px] left-1/2 -translate-x-1/2`;
      case 'left':
        return `${base} right-[-4px] top-1/2 -translate-y-1/2`;
      case 'right':
        return `${base} left-[-4px] top-1/2 -translate-y-1/2`;
      default:
        return base;
    }
  };

  const tooltipElement = (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={tooltipRef}
          variants={tooltipVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          style={{
            position: 'fixed',
            left: position.x,
            top: position.y,
            zIndex: 9999,
            maxWidth: maxWidth
          }}
          className={`
            px-2 py-1 text-sm text-white bg-gray-900 rounded-md shadow-lg
            pointer-events-none
            ${interactive ? 'pointer-events-auto' : ''}
            ${className}
          `}
          onMouseEnter={interactive ? showTooltip : undefined}
          onMouseLeave={interactive ? hideTooltip : undefined}
        >
          {content}
          {arrow && <div className={getArrowClasses()} />}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="inline-block"
      >
        {children}
      </div>
      {typeof document !== 'undefined' && createPortal(tooltipElement, document.body)}
    </>
  );
};

// Tooltip médico con información adicional
export const MedicalTooltip = ({ 
  children,
  title,
  description,
  details = [],
  warning,
  type = 'info',
  placement = 'top'
}) => {
  const getTypeStyles = () => {
    const styles = {
      info: 'bg-blue-900 border-blue-700',
      warning: 'bg-yellow-900 border-yellow-700',
      error: 'bg-red-900 border-red-700',
      success: 'bg-green-900 border-green-700'
    };
    return styles[type] || styles.info;
  };

  const content = (
    <div className="max-w-xs">
      {title && (
        <div className="font-semibold text-white mb-1">{title}</div>
      )}
      
      {description && (
        <div className="text-gray-200 text-sm mb-2">{description}</div>
      )}
      
      {details.length > 0 && (
        <div className="space-y-1">
          {details.map((detail, index) => (
            <div key={index} className="flex justify-between text-xs">
              <span className="text-gray-300">{detail.label}:</span>
              <span className="text-white font-medium">{detail.value}</span>
            </div>
          ))}
        </div>
      )}
      
      {warning && (
        <div className="mt-2 p-2 bg-red-800 bg-opacity-50 rounded text-xs text-red-200">
          ⚠️ {warning}
        </div>
      )}
    </div>
  );

  return (
    <Tooltip
      content={content}
      placement={placement}
      className={`border ${getTypeStyles()}`}
      maxWidth={300}
      interactive
    >
      {children}
    </Tooltip>
  );
};

// Tooltip con contenido rico (HTML)
export const RichTooltip = ({ 
  children,
  content,
  title,
  actions = [],
  placement = 'top',
  className = ""
}) => {
  const tooltipContent = (
    <div className="max-w-sm">
      {title && (
        <h4 className="font-semibold text-white mb-2 pb-2 border-b border-gray-700">
          {title}
        </h4>
      )}
      
      <div className="text-gray-200 text-sm mb-3">
        {content}
      </div>
      
      {actions.length > 0 && (
        <div className="flex space-x-2 pt-2 border-t border-gray-700">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <Tooltip
      content={tooltipContent}
      placement={placement}
      className={`bg-gray-800 border border-gray-600 ${className}`}
      interactive
      maxWidth={400}
    >
      {children}
    </Tooltip>
  );
};

// Tooltip de ayuda con icono
export const HelpTooltip = ({ 
  content,
  placement = 'top',
  size = 'sm'
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <Tooltip content={content} placement={placement}>
      <button
        type="button"
        className={`
          ${sizes[size]} inline-flex items-center justify-center
          text-gray-400 hover:text-gray-600 rounded-full
          focus:outline-none focus:ring-2 focus:ring-blue-500
          transition-colors
        `}
      >
        <svg 
          fill="currentColor" 
          viewBox="0 0 20 20"
          className="w-full h-full"
        >
          <path 
            fillRule="evenodd" 
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" 
            clipRule="evenodd" 
          />
        </svg>
      </button>
    </Tooltip>
  );
};

// Tooltip flotante para status
export const StatusTooltip = ({ 
  children,
  status,
  message,
  lastUpdated,
  placement = 'top'
}) => {
  const getStatusConfig = () => {
    const configs = {
      online: { color: 'text-green-400', icon: '●', bg: 'bg-green-900' },
      offline: { color: 'text-red-400', icon: '●', bg: 'bg-red-900' },
      pending: { color: 'text-yellow-400', icon: '●', bg: 'bg-yellow-900' },
      processing: { color: 'text-blue-400', icon: '⟳', bg: 'bg-blue-900' }
    };
    return configs[status] || configs.offline;
  };

  const config = getStatusConfig();

  const content = (
    <div className="flex items-center space-x-2">
      <motion.span
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className={`${config.color} text-lg`}
      >
        {config.icon}
      </motion.span>
      
      <div>
        <div className="text-white font-medium">{message}</div>
        {lastUpdated && (
          <div className="text-gray-400 text-xs">
            Actualizado: {lastUpdated}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Tooltip
      content={content}
      placement={placement}
      className={`${config.bg} border border-gray-600`}
    >
      {children}
    </Tooltip>
  );
};

// Hook para tooltip controlado manualmente
export const useTooltip = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [content, setContent] = useState('');
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const show = (newContent, event) => {
    setContent(newContent);
    setPosition({ x: event.clientX, y: event.clientY });
    setIsVisible(true);
  };

  const hide = () => {
    setIsVisible(false);
  };

  const TooltipComponent = () => (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          style={{
            position: 'fixed',
            left: position.x + 10,
            top: position.y - 40,
            zIndex: 9999
          }}
          className="px-2 py-1 text-sm text-white bg-gray-900 rounded-md shadow-lg pointer-events-none"
        >
          {content}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return { show, hide, TooltipComponent };
};

export default {
  Tooltip,
  MedicalTooltip,
  RichTooltip,
  HelpTooltip,
  StatusTooltip,
  useTooltip
};