import { useRef, useEffect, useCallback, useState } from 'react';
import { useHapticFeedback } from '../utils/hapticFeedback';

// Hook principal para gestos táctiles avanzados
export const useTouchGestures = (options = {}) => {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onPinch,
    onPinchStart,
    onPinchEnd,
    onRotate,
    onLongPress,
    onDoubleTap,
    onPan,
    swipeThreshold = 50,
    longPressDelay = 500,
    doubleTapDelay = 300,
    pinchThreshold = 10,
    rotateThreshold = 15,
    enableHapticFeedback = true,
    preventDefault = true
  } = options;

  const elementRef = useRef(null);
  const gestureState = useRef({
    isTracking: false,
    startTouch: null,
    startTouches: null,
    lastTap: 0,
    longPressTimer: null,
    initialDistance: 0,
    initialRotation: 0,
    lastScale: 1,
    lastRotation: 0
  });

  const haptic = useHapticFeedback();

  // Calcular distancia entre dos puntos táctiles
  const getDistance = useCallback((touch1, touch2) => {
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  }, []);

  // Calcular ángulo entre dos puntos táctiles
  const getRotation = useCallback((touch1, touch2) => {
    return Math.atan2(
      touch2.clientY - touch1.clientY,
      touch2.clientX - touch1.clientX
    ) * 180 / Math.PI;
  }, []);

  // Detectar dirección de swipe
  const getSwipeDirection = useCallback((start, end) => {
    const deltaX = end.clientX - start.clientX;
    const deltaY = end.clientY - start.clientY;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      return deltaX > 0 ? 'right' : 'left';
    } else {
      return deltaY > 0 ? 'down' : 'up';
    }
  }, []);

  // Manejar inicio de toque
  const handleTouchStart = useCallback((e) => {
    if (preventDefault) e.preventDefault();

    const touches = e.touches;
    const state = gestureState.current;

    state.isTracking = true;
    state.startTouch = touches[0];
    state.startTouches = Array.from(touches);

    // Configurar timer para long press
    if (onLongPress) {
      state.longPressTimer = setTimeout(() => {
        if (enableHapticFeedback) haptic.longPress();
        onLongPress(e, touches[0]);
      }, longPressDelay);
    }

    // Configurar para gestos multi-touch
    if (touches.length === 2) {
      state.initialDistance = getDistance(touches[0], touches[1]);
      state.initialRotation = getRotation(touches[0], touches[1]);
      state.lastScale = 1;
      state.lastRotation = 0;

      if (onPinchStart) {
        if (enableHapticFeedback) haptic.pinchStart();
        onPinchStart(e, {
          distance: state.initialDistance,
          rotation: state.initialRotation,
          center: {
            x: (touches[0].clientX + touches[1].clientX) / 2,
            y: (touches[0].clientY + touches[1].clientY) / 2
          }
        });
      }
    }

    // Detectar doble tap
    const now = Date.now();
    if (onDoubleTap && now - state.lastTap < doubleTapDelay) {
      if (enableHapticFeedback) haptic.doubleTap();
      onDoubleTap(e, touches[0]);
    }
    state.lastTap = now;
  }, [
    preventDefault, onLongPress, onPinchStart, onDoubleTap,
    longPressDelay, doubleTapDelay, enableHapticFeedback,
    haptic, getDistance, getRotation
  ]);

  // Manejar movimiento de toque
  const handleTouchMove = useCallback((e) => {
    if (preventDefault) e.preventDefault();

    const touches = e.touches;
    const state = gestureState.current;

    if (!state.isTracking) return;

    // Cancelar long press si hay movimiento
    if (state.longPressTimer) {
      clearTimeout(state.longPressTimer);
      state.longPressTimer = null;
    }

    // Gestos de un dedo
    if (touches.length === 1 && state.startTouch) {
      const currentTouch = touches[0];
      const deltaX = currentTouch.clientX - state.startTouch.clientX;
      const deltaY = currentTouch.clientY - state.startTouch.clientY;

      // Pan gesture
      if (onPan) {
        onPan(e, {
          deltaX,
          deltaY,
          startTouch: state.startTouch,
          currentTouch
        });
      }
    }

    // Gestos de dos dedos
    if (touches.length === 2 && state.startTouches?.length === 2) {
      const currentDistance = getDistance(touches[0], touches[1]);
      const currentRotation = getRotation(touches[0], touches[1]);

      // Pinch/Zoom gesture
      if (onPinch && Math.abs(currentDistance - state.initialDistance) > pinchThreshold) {
        const scale = currentDistance / state.initialDistance;
        const scaleDelta = scale - state.lastScale;

        onPinch(e, {
          scale,
          scaleDelta,
          distance: currentDistance,
          initialDistance: state.initialDistance,
          center: {
            x: (touches[0].clientX + touches[1].clientX) / 2,
            y: (touches[0].clientY + touches[1].clientY) / 2
          }
        });

        state.lastScale = scale;
      }

      // Rotation gesture
      if (onRotate) {
        let rotationDelta = currentRotation - state.initialRotation;
        
        // Normalizar el ángulo
        if (rotationDelta > 180) rotationDelta -= 360;
        if (rotationDelta < -180) rotationDelta += 360;

        if (Math.abs(rotationDelta) > rotateThreshold) {
          const rotationChange = rotationDelta - state.lastRotation;

          if (enableHapticFeedback && Math.abs(rotationChange) > 10) {
            haptic.rotate();
          }

          onRotate(e, {
            rotation: rotationDelta,
            rotationDelta: rotationChange,
            center: {
              x: (touches[0].clientX + touches[1].clientX) / 2,
              y: (touches[0].clientY + touches[1].clientY) / 2
            }
          });

          state.lastRotation = rotationDelta;
        }
      }
    }
  }, [
    preventDefault, onPan, onPinch, onRotate,
    pinchThreshold, rotateThreshold, enableHapticFeedback,
    haptic, getDistance, getRotation
  ]);

  // Manejar fin de toque
  const handleTouchEnd = useCallback((e) => {
    if (preventDefault) e.preventDefault();

    const state = gestureState.current;
    const changedTouches = e.changedTouches;

    // Limpiar timer de long press
    if (state.longPressTimer) {
      clearTimeout(state.longPressTimer);
      state.longPressTimer = null;
    }

    // Detectar swipe
    if (state.startTouch && changedTouches.length === 1) {
      const endTouch = changedTouches[0];
      const deltaX = endTouch.clientX - state.startTouch.clientX;
      const deltaY = endTouch.clientY - state.startTouch.clientY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance > swipeThreshold) {
        const direction = getSwipeDirection(state.startTouch, endTouch);
        
        if (enableHapticFeedback) {
          haptic.navigation(direction, 'light');
        }

        // Ejecutar callback correspondiente
        switch (direction) {
          case 'left':
            onSwipeLeft?.(e, { deltaX, deltaY, distance, direction });
            break;
          case 'right':
            onSwipeRight?.(e, { deltaX, deltaY, distance, direction });
            break;
          case 'up':
            onSwipeUp?.(e, { deltaX, deltaY, distance, direction });
            break;
          case 'down':
            onSwipeDown?.(e, { deltaX, deltaY, distance, direction });
            break;
        }
      }
    }

    // Fin de pinch
    if (state.startTouches?.length === 2 && onPinchEnd) {
      if (enableHapticFeedback) haptic.pinchEnd();
      onPinchEnd(e, {
        finalScale: state.lastScale,
        finalRotation: state.lastRotation
      });
    }

    // Reset del estado
    if (e.touches.length === 0) {
      state.isTracking = false;
      state.startTouch = null;
      state.startTouches = null;
      state.initialDistance = 0;
      state.initialRotation = 0;
      state.lastScale = 1;
      state.lastRotation = 0;
    }
  }, [
    preventDefault, swipeThreshold, enableHapticFeedback,
    haptic, getSwipeDirection, onSwipeLeft, onSwipeRight,
    onSwipeUp, onSwipeDown, onPinchEnd
  ]);

  // Configurar event listeners
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: !preventDefault });
    element.addEventListener('touchmove', handleTouchMove, { passive: !preventDefault });
    element.addEventListener('touchend', handleTouchEnd, { passive: !preventDefault });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, preventDefault]);

  return elementRef;
};

// Hook para swipe horizontal en carruseles
export const useSwipeCarousel = (options = {}) => {
  const {
    onSwipeLeft,
    onSwipeRight,
    threshold = 50,
    enableHapticFeedback = true
  } = options;

  return useTouchGestures({
    onSwipeLeft,
    onSwipeRight,
    swipeThreshold: threshold,
    enableHapticFeedback,
    // Solo manejar swipes horizontales
    onSwipeUp: undefined,
    onSwipeDown: undefined
  });
};

// Hook para zoom y pan en imágenes
export const useImageGestures = (options = {}) => {
  const {
    onZoom,
    onPan,
    onReset,
    minScale = 0.5,
    maxScale = 5,
    enableHapticFeedback = true
  } = options;

  const [transform, setTransform] = useState({
    scale: 1,
    translateX: 0,
    translateY: 0,
    rotation: 0
  });

  const handlePinch = useCallback((e, data) => {
    const newScale = Math.max(minScale, Math.min(maxScale, data.scale));
    
    setTransform(prev => ({
      ...prev,
      scale: newScale
    }));

    onZoom?.(newScale, data);
  }, [minScale, maxScale, onZoom]);

  const handlePan = useCallback((e, data) => {
    setTransform(prev => ({
      ...prev,
      translateX: prev.translateX + data.deltaX * 0.5,
      translateY: prev.translateY + data.deltaY * 0.5
    }));

    onPan?.(data);
  }, [onPan]);

  const handleDoubleTap = useCallback(() => {
    const newScale = transform.scale > 1 ? 1 : 2;
    
    setTransform(prev => ({
      ...prev,
      scale: newScale,
      translateX: newScale === 1 ? 0 : prev.translateX,
      translateY: newScale === 1 ? 0 : prev.translateY
    }));

    onReset?.();
  }, [transform.scale, onReset]);

  const gestureRef = useTouchGestures({
    onPinch: handlePinch,
    onPan: handlePan,
    onDoubleTap: handleDoubleTap,
    enableHapticFeedback
  });

  const reset = useCallback(() => {
    setTransform({
      scale: 1,
      translateX: 0,
      translateY: 0,
      rotation: 0
    });
  }, []);

  return {
    gestureRef,
    transform,
    reset,
    setTransform
  };
};

// Hook para pull-to-refresh
export const usePullToRefresh = (options = {}) => {
  const {
    onRefresh,
    threshold = 80,
    enableHapticFeedback = true,
    disabled = false
  } = options;

  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const haptic = useHapticFeedback();

  const handlePan = useCallback((e, data) => {
    if (disabled || isRefreshing) return;

    // Solo activar si se está en el top y tirando hacia abajo
    if (window.scrollY === 0 && data.deltaY > 0) {
      setIsPulling(true);
      setPullDistance(Math.min(data.deltaY, threshold * 1.5));

      // Haptic feedback al alcanzar threshold
      if (data.deltaY >= threshold && enableHapticFeedback) {
        haptic.success();
      }
    }
  }, [disabled, isRefreshing, threshold, enableHapticFeedback, haptic]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling || disabled || isRefreshing) return;

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      
      try {
        await onRefresh?.();
      } finally {
        setIsRefreshing(false);
      }
    }

    setIsPulling(false);
    setPullDistance(0);
  }, [isPulling, disabled, isRefreshing, pullDistance, threshold, onRefresh]);

  const gestureRef = useTouchGestures({
    onPan: handlePan,
    onTouchEnd: handleTouchEnd,
    enableHapticFeedback
  });

  return {
    gestureRef,
    isPulling,
    pullDistance,
    isRefreshing,
    progress: Math.min(pullDistance / threshold, 1)
  };
};

// Hook para gestos de navegación por pestañas
export const useTabGestures = (options = {}) => {
  const {
    onTabChange,
    currentTab = 0,
    totalTabs = 1,
    enableHapticFeedback = true
  } = options;

  const handleSwipeLeft = useCallback(() => {
    if (currentTab < totalTabs - 1) {
      onTabChange?.(currentTab + 1);
    }
  }, [currentTab, totalTabs, onTabChange]);

  const handleSwipeRight = useCallback(() => {
    if (currentTab > 0) {
      onTabChange?.(currentTab - 1);
    }
  }, [currentTab, onTabChange]);

  return useTouchGestures({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    enableHapticFeedback,
    swipeThreshold: 30
  });
};

// Hook para gestos médicos específicos
export const useMedicalGestures = (options = {}) => {
  const {
    onQuickAction,
    onEmergencyGesture,
    onPatientSelect,
    enableHapticFeedback = true
  } = options;

  const haptic = useHapticFeedback();

  const handleLongPress = useCallback((e, touch) => {
    if (enableHapticFeedback) {
      haptic.medical('patient-action', { urgency: 'normal' });
    }
    onQuickAction?.(e, touch);
  }, [enableHapticFeedback, haptic, onQuickAction]);

  const handleTripleTap = useCallback((e) => {
    if (enableHapticFeedback) {
      haptic.medical('patient-action', { urgency: 'critical' });
    }
    onEmergencyGesture?.(e);
  }, [enableHapticFeedback, haptic, onEmergencyGesture]);

  const handleDoubleTap = useCallback((e, touch) => {
    if (enableHapticFeedback) {
      haptic.patientSelect();
    }
    onPatientSelect?.(e, touch);
  }, [enableHapticFeedback, haptic, onPatientSelect]);

  return useTouchGestures({
    onLongPress: handleLongPress,
    onDoubleTap: handleDoubleTap,
    enableHapticFeedback,
    longPressDelay: 800 // Delay más largo para contexto médico
  });
};

export default {
  useTouchGestures,
  useSwipeCarousel,
  useImageGestures,
  usePullToRefresh,
  useTabGestures,
  useMedicalGestures
};