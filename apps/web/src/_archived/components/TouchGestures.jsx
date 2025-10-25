import React, { useState, useRef, useEffect } from 'react';
import { motion, useAnimation, PanInfo } from 'framer-motion';
import { gestureVariants } from '../utils/animations';

/**
 * Sistema de componentes para gestos táctiles avanzados
 * Mejora la experiencia en dispositivos móviles con interacciones naturales
 */

// Hook para detectar dispositivos táctiles
export const useTouchDevice = () => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0
      );
    };

    checkTouch();
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  return isTouchDevice;
};

// Componente Swipeable para navegación gestual
export const SwipeableCard = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 100,
  className = '',
  enableHaptic = true
}) => {
  const [exitDirection, setExitDirection] = useState(null);
  const controls = useAnimation();

  const handleDragEnd = (event, info) => {
    const { offset, velocity } = info;
    
    // Detectar dirección del swipe
    if (Math.abs(offset.x) > Math.abs(offset.y)) {
      // Swipe horizontal
      if (offset.x > threshold) {
        setExitDirection('right');
        if (enableHaptic) navigator.vibrate?.(20);
        onSwipeRight?.();
      } else if (offset.x < -threshold) {
        setExitDirection('left');
        if (enableHaptic) navigator.vibrate?.(20);
        onSwipeLeft?.();
      }
    } else {
      // Swipe vertical
      if (offset.y > threshold) {
        setExitDirection('down');
        if (enableHaptic) navigator.vibrate?.(20);
        onSwipeDown?.();
      } else if (offset.y < -threshold) {
        setExitDirection('up');
        if (enableHaptic) navigator.vibrate?.(20);
        onSwipeUp?.();
      }
    }

    // Resetear posición si no se alcanza el threshold
    if (!exitDirection) {
      controls.start({ x: 0, y: 0, rotate: 0 });
    }
  };

  const getExitAnimation = () => {
    switch (exitDirection) {
      case 'left':
        return { x: -window.innerWidth, opacity: 0, rotate: -20 };
      case 'right':
        return { x: window.innerWidth, opacity: 0, rotate: 20 };
      case 'up':
        return { y: -window.innerHeight, opacity: 0 };
      case 'down':
        return { y: window.innerHeight, opacity: 0 };
      default:
        return {};
    }
  };

  return (
    <motion.div
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={1}
      onDragEnd={handleDragEnd}
      animate={exitDirection ? getExitAnimation() : controls}
      transition={{ duration: 0.3 }}
      className={`cursor-grab active:cursor-grabbing ${className}`}
      whileDrag={{ scale: 1.05 }}
    >
      {children}
    </motion.div>
  );
};

// Componente de carrusel táctil
export const TouchCarousel = ({
  items = [],
  itemWidth = 300,
  gap = 20,
  className = '',
  enableHaptic = true
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);
  const constraintsRef = useRef(null);

  const handleDragEnd = (event, info) => {
    const { velocity, offset } = info;
    const swipeThreshold = 50;
    
    if (Math.abs(offset.x) > swipeThreshold || Math.abs(velocity.x) > 500) {
      if (offset.x > 0 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
        if (enableHaptic) navigator.vibrate?.(10);
      } else if (offset.x < 0 && currentIndex < items.length - 1) {
        setCurrentIndex(currentIndex + 1);
        if (enableHaptic) navigator.vibrate?.(10);
      }
    }
  };

  return (
    <div ref={constraintsRef} className={`overflow-hidden ${className}`}>
      <motion.div
        ref={containerRef}
        drag="x"
        dragConstraints={constraintsRef}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        animate={{ x: -currentIndex * (itemWidth + gap) }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="flex"
        style={{ gap }}
      >
        {items.map((item, index) => (
          <motion.div
            key={index}
            style={{ minWidth: itemWidth }}
            whileTap={{ scale: 0.95 }}
          >
            {item}
          </motion.div>
        ))}
      </motion.div>
      
      {/* Indicadores */}
      <div className="flex justify-center gap-2 mt-4">
        {items.map((_, index) => (
          <motion.button
            key={index}
            className={`w-2 h-2 rounded-full ${
              index === currentIndex ? 'bg-eg-purple' : 'bg-gray-300'
            }`}
            whileTap={{ scale: 0.8 }}
            onClick={() => {
              setCurrentIndex(index);
              if (enableHaptic) navigator.vibrate?.(5);
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Componente de zoom con pinch
export const PinchZoom = ({
  children,
  minScale = 1,
  maxScale = 3,
  className = ''
}) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const lastDistance = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let initialDistance = 0;
    let initialScale = 1;

    const handleTouchStart = (e) => {
      if (e.touches.length === 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        initialDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        initialScale = scale;
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        
        const scaleDelta = currentDistance / initialDistance;
        const newScale = Math.max(minScale, Math.min(maxScale, initialScale * scaleDelta));
        setScale(newScale);
      }
    };

    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchmove', handleTouchMove);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
    };
  }, [scale, minScale, maxScale]);

  return (
    <div ref={containerRef} className={`overflow-hidden ${className}`}>
      <motion.div
        animate={{ scale }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        drag={scale > 1}
        dragConstraints={{
          left: -(scale - 1) * 100,
          right: (scale - 1) * 100,
          top: -(scale - 1) * 100,
          bottom: (scale - 1) * 100
        }}
        className="origin-center"
      >
        {children}
      </motion.div>
      
      {/* Controles de zoom */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setScale(Math.max(minScale, scale - 0.5))}
          className="w-10 h-10 bg-white/80 rounded-full shadow-lg flex items-center justify-center"
        >
          -
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setScale(Math.min(maxScale, scale + 0.5))}
          className="w-10 h-10 bg-white/80 rounded-full shadow-lg flex items-center justify-center"
        >
          +
        </motion.button>
      </div>
    </div>
  );
};

// Componente de lista con pull-to-refresh
export const PullToRefresh = ({
  children,
  onRefresh,
  threshold = 80,
  className = ''
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef(null);

  const handleDragEnd = async (event, info) => {
    if (pullDistance > threshold) {
      setIsRefreshing(true);
      navigator.vibrate?.(30);
      
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Indicador de refresh */}
      <motion.div
        className="absolute top-0 left-0 right-0 flex justify-center"
        style={{ height: pullDistance }}
      >
        <motion.div
          animate={isRefreshing ? { rotate: 360 } : {}}
          transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0 }}
          className="mt-4"
        >
          {pullDistance > threshold ? '↻' : '↓'}
        </motion.div>
      </motion.div>
      
      {/* Contenido scrolleable */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0.5, bottom: 0 }}
        onDrag={(event, info) => {
          if (info.offset.y > 0) {
            setPullDistance(info.offset.y);
          }
        }}
        onDragEnd={handleDragEnd}
        animate={{ y: isRefreshing ? threshold : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {children}
      </motion.div>
    </div>
  );
};

// Componente de menú radial táctil
export const RadialMenu = ({
  items = [],
  trigger,
  radius = 100,
  startAngle = 0,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    navigator.vibrate?.(10);
  };

  const angleStep = (2 * Math.PI) / items.length;

  return (
    <div className={`relative ${className}`}>
      {/* Trigger button */}
      <motion.button
        onClick={toggleMenu}
        whileTap={{ scale: 0.9 }}
        className="z-20 relative"
      >
        {trigger}
      </motion.button>
      
      {/* Menu items */}
      {items.map((item, index) => {
        const angle = startAngle + angleStep * index;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        return (
          <motion.div
            key={index}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
            animate={isOpen ? {
              x,
              y,
              opacity: 1,
              scale: 1
            } : {
              x: 0,
              y: 0,
              opacity: 0,
              scale: 0
            }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 20,
              delay: isOpen ? index * 0.05 : 0
            }}
            className="absolute z-10"
            style={{ left: '50%', top: '50%', marginLeft: -20, marginTop: -20 }}
          >
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                item.onClick?.();
                navigator.vibrate?.(5);
                setIsOpen(false);
              }}
              className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center"
            >
              {item.icon}
            </motion.button>
          </motion.div>
        );
      })}
    </div>
  );
};

// Hook para detectar gestos personalizados
export const useGesture = (element, options = {}) => {
  const [gesture, setGesture] = useState(null);
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });
  
  useEffect(() => {
    if (!element) return;
    
    const handleTouchStart = (e) => {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now()
      };
    };
    
    const handleTouchEnd = (e) => {
      const touchEnd = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY,
        time: Date.now()
      };
      
      const deltaX = touchEnd.x - touchStartRef.current.x;
      const deltaY = touchEnd.y - touchStartRef.current.y;
      const deltaTime = touchEnd.time - touchStartRef.current.time;
      
      // Detectar tipo de gesto
      if (deltaTime < 300 && Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
        setGesture('tap');
      } else if (Math.abs(deltaX) > Math.abs(deltaY)) {
        setGesture(deltaX > 0 ? 'swipeRight' : 'swipeLeft');
      } else {
        setGesture(deltaY > 0 ? 'swipeDown' : 'swipeUp');
      }
      
      // Reset gesture after callback
      setTimeout(() => setGesture(null), 100);
    };
    
    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [element]);
  
  return gesture;
};

export default {
  useTouchDevice,
  SwipeableCard,
  TouchCarousel,
  PinchZoom,
  PullToRefresh,
  RadialMenu,
  useGesture
};