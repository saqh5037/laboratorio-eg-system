// Utilidades para feedback háptico en dispositivos móviles
// Proporciona vibración sutil y contextual para mejorar la UX táctil

class HapticFeedbackManager {
  constructor() {
    this.isSupported = this.checkSupport();
    this.isEnabled = this.loadPreference();
    this.patterns = this.definePatterns();
  }

  // Verificar soporte del dispositivo
  checkSupport() {
    if (typeof window === 'undefined') return false;
    
    return 'vibrate' in navigator || 
           'webkitVibrate' in navigator ||
           (window.DeviceMotionEvent && typeof DeviceMotionEvent.requestPermission === 'function');
  }

  // Cargar preferencia del usuario
  loadPreference() {
    try {
      const saved = localStorage.getItem('haptic-feedback-enabled');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  }

  // Guardar preferencia del usuario
  savePreference(enabled) {
    this.isEnabled = enabled;
    try {
      localStorage.setItem('haptic-feedback-enabled', JSON.stringify(enabled));
    } catch {
      // Silently fail if localStorage is not available
    }
  }

  // Definir patrones de vibración para diferentes contextos
  definePatterns() {
    return {
      // Interacciones básicas
      tap: [10], // Tap corto y sutil
      doubleTap: [10, 50, 10], // Doble tap
      longPress: [20], // Press largo
      
      // Navegación
      swipe: [8], // Swipe suave
      pageChange: [15], // Cambio de página
      scroll: [5], // Scroll feedback (muy sutil)
      
      // Médico específico
      buttonPress: [12], // Botón médico presionado
      toggleOn: [15], // Toggle activado
      toggleOff: [8], // Toggle desactivado
      
      // Confirmaciones
      success: [20, 50, 20], // Acción exitosa
      error: [50, 50, 50], // Error
      warning: [30, 50, 30], // Advertencia
      
      // Notificaciones
      notification: [25], // Notificación nueva
      alert: [50, 100, 50], // Alerta importante
      reminder: [15, 30, 15], // Recordatorio
      
      // Formularios
      fieldFocus: [8], // Campo enfocado
      fieldError: [30, 50, 30], // Error en campo
      formSubmit: [20], // Formulario enviado
      
      // Búsqueda y filtros
      searchStart: [10], // Inicio de búsqueda
      filterApplied: [15], // Filtro aplicado
      resultFound: [12], // Resultado encontrado
      
      // Acciones especiales
      favorite: [20, 30, 20], // Agregar a favoritos
      unfavorite: [10], // Quitar de favoritos
      share: [15], // Compartir
      download: [25], // Descarga
      
      // Gestos avanzados
      pinchStart: [8], // Inicio de pinch
      pinchEnd: [12], // Fin de pinch
      rotate: [10], // Rotación
      
      // Estados del sistema
      online: [15], // Conexión establecida
      offline: [30, 50, 30], // Sin conexión
      sync: [20], // Sincronización
      
      // Médico avanzado
      patientSelect: [15], // Selección de paciente
      studyComplete: [25, 50, 25], // Estudio completado
      criticalAlert: [100, 100, 100, 100, 100], // Alerta crítica
      labResult: [20, 30, 20], // Resultado de laboratorio
      
      // PWA específico
      install: [30, 50, 30], // Instalación PWA
      update: [20], // Actualización disponible
      cacheReady: [15] // Cache listo
    };
  }

  // Método principal para activar vibración
  vibrate(pattern) {
    if (!this.isSupported || !this.isEnabled) return false;

    try {
      // Normalizar patrón
      const vibrationPattern = Array.isArray(pattern) ? pattern : [pattern];
      
      // Limitar duración máxima para evitar molestias
      const limitedPattern = vibrationPattern.map(duration => 
        Math.min(duration, 200)
      );

      // Ejecutar vibración
      if (navigator.vibrate) {
        return navigator.vibrate(limitedPattern);
      } else if (navigator.webkitVibrate) {
        return navigator.webkitVibrate(limitedPattern);
      }
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
      return false;
    }

    return false;
  }

  // Métodos de conveniencia para patrones predefinidos
  tap() { return this.vibrate(this.patterns.tap); }
  doubleTap() { return this.vibrate(this.patterns.doubleTap); }
  longPress() { return this.vibrate(this.patterns.longPress); }
  
  swipe() { return this.vibrate(this.patterns.swipe); }
  pageChange() { return this.vibrate(this.patterns.pageChange); }
  scroll() { return this.vibrate(this.patterns.scroll); }
  
  buttonPress() { return this.vibrate(this.patterns.buttonPress); }
  toggleOn() { return this.vibrate(this.patterns.toggleOn); }
  toggleOff() { return this.vibrate(this.patterns.toggleOff); }
  
  success() { return this.vibrate(this.patterns.success); }
  error() { return this.vibrate(this.patterns.error); }
  warning() { return this.vibrate(this.patterns.warning); }
  
  notification() { return this.vibrate(this.patterns.notification); }
  alert() { return this.vibrate(this.patterns.alert); }
  reminder() { return this.vibrate(this.patterns.reminder); }
  
  fieldFocus() { return this.vibrate(this.patterns.fieldFocus); }
  fieldError() { return this.vibrate(this.patterns.fieldError); }
  formSubmit() { return this.vibrate(this.patterns.formSubmit); }
  
  searchStart() { return this.vibrate(this.patterns.searchStart); }
  filterApplied() { return this.vibrate(this.patterns.filterApplied); }
  resultFound() { return this.vibrate(this.patterns.resultFound); }
  
  favorite() { return this.vibrate(this.patterns.favorite); }
  unfavorite() { return this.vibrate(this.patterns.unfavorite); }
  share() { return this.vibrate(this.patterns.share); }
  download() { return this.vibrate(this.patterns.download); }
  
  pinchStart() { return this.vibrate(this.patterns.pinchStart); }
  pinchEnd() { return this.vibrate(this.patterns.pinchEnd); }
  rotate() { return this.vibrate(this.patterns.rotate); }
  
  online() { return this.vibrate(this.patterns.online); }
  offline() { return this.vibrate(this.patterns.offline); }
  sync() { return this.vibrate(this.patterns.sync); }
  
  patientSelect() { return this.vibrate(this.patterns.patientSelect); }
  studyComplete() { return this.vibrate(this.patterns.studyComplete); }
  criticalAlert() { return this.vibrate(this.patterns.criticalAlert); }
  labResult() { return this.vibrate(this.patterns.labResult); }
  
  install() { return this.vibrate(this.patterns.install); }
  update() { return this.vibrate(this.patterns.update); }
  cacheReady() { return this.vibrate(this.patterns.cacheReady); }

  // Método para vibración personalizada con validación
  custom(pattern, intensity = 'medium') {
    const intensityMultiplier = {
      light: 0.5,
      medium: 1,
      strong: 1.5
    };

    const multiplier = intensityMultiplier[intensity] || 1;
    const adjustedPattern = Array.isArray(pattern) 
      ? pattern.map(duration => Math.round(duration * multiplier))
      : [Math.round(pattern * multiplier)];

    return this.vibrate(adjustedPattern);
  }

  // Método para feedback contextual médico
  medicalAction(actionType, context = {}) {
    const { urgency = 'normal', success = true } = context;
    
    const medicalPatterns = {
      'patient-action': {
        normal: success ? [15] : [30, 50, 30],
        urgent: success ? [25, 50, 25] : [50, 100, 50],
        critical: [100, 100, 100]
      },
      'study-action': {
        normal: [20],
        urgent: [30, 50, 30],
        critical: [50, 100, 50, 100, 50]
      },
      'result-action': {
        normal: [15, 30, 15],
        urgent: [30, 50, 30, 50, 30],
        critical: [100, 100, 100, 100, 100]
      }
    };

    const pattern = medicalPatterns[actionType]?.[urgency] || this.patterns.tap;
    return this.vibrate(pattern);
  }

  // Método para feedback de navegación con dirección
  navigationFeedback(direction, intensity = 'light') {
    const patterns = {
      up: [8, 20, 8],
      down: [20, 8, 20],
      left: [10, 30, 10],
      right: [30, 10, 30],
      forward: [15],
      back: [15, 30, 15]
    };

    const pattern = patterns[direction] || this.patterns.tap;
    return this.custom(pattern, intensity);
  }

  // Método para secuencias de feedback
  sequence(patterns, delay = 100) {
    if (!Array.isArray(patterns)) return false;

    patterns.forEach((pattern, index) => {
      setTimeout(() => {
        this.vibrate(pattern);
      }, index * delay);
    });

    return true;
  }

  // Información del dispositivo para ajustes automáticos
  getDeviceInfo() {
    return {
      isSupported: this.isSupported,
      isEnabled: this.isEnabled,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        typeof navigator !== 'undefined' ? navigator.userAgent : ''
      ),
      isIOS: /iPad|iPhone|iPod/.test(
        typeof navigator !== 'undefined' ? navigator.userAgent : ''
      ),
      isAndroid: /Android/.test(
        typeof navigator !== 'undefined' ? navigator.userAgent : ''
      )
    };
  }

  // Control de configuración
  enable() {
    this.savePreference(true);
    return this.isEnabled;
  }

  disable() {
    this.savePreference(false);
    return this.isEnabled;
  }

  toggle() {
    this.savePreference(!this.isEnabled);
    return this.isEnabled;
  }

  // Test de funcionamiento
  test() {
    if (!this.isSupported) {
      console.warn('Haptic feedback not supported on this device');
      return false;
    }

    console.log('Testing haptic feedback...');
    this.vibrate([50, 100, 50]);
    return true;
  }
}

// Instancia global
const haptic = new HapticFeedbackManager();

// Hook de React para usar feedback háptico
export const useHapticFeedback = () => {
  return {
    vibrate: (pattern) => haptic.vibrate(pattern),
    tap: () => haptic.tap(),
    success: () => haptic.success(),
    error: () => haptic.error(),
    warning: () => haptic.warning(),
    buttonPress: () => haptic.buttonPress(),
    toggle: (isOn) => isOn ? haptic.toggleOn() : haptic.toggleOff(),
    custom: (pattern, intensity) => haptic.custom(pattern, intensity),
    medical: (actionType, context) => haptic.medicalAction(actionType, context),
    navigation: (direction, intensity) => haptic.navigationFeedback(direction, intensity),
    sequence: (patterns, delay) => haptic.sequence(patterns, delay),
    isSupported: haptic.isSupported,
    isEnabled: haptic.isEnabled,
    enable: () => haptic.enable(),
    disable: () => haptic.disable(),
    toggleEnabled: () => haptic.toggle(),
    test: () => haptic.test(),
    getDeviceInfo: () => haptic.getDeviceInfo()
  };
};

// Componente de configuración de haptic feedback
export const HapticSettings = ({ className = "" }) => {
  const hapticFeedback = useHapticFeedback();
  const [isEnabled, setIsEnabled] = useState(hapticFeedback.isEnabled);

  const handleToggle = () => {
    const newState = hapticFeedback.toggleEnabled();
    setIsEnabled(newState);
    
    // Test feedback cuando se habilita
    if (newState) {
      setTimeout(() => hapticFeedback.success(), 100);
    }
  };

  const handleTest = () => {
    hapticFeedback.test();
  };

  if (!hapticFeedback.isSupported) {
    return (
      <div className={`text-gray-500 text-sm ${className}`}>
        Feedback háptico no disponible en este dispositivo
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-gray-700">
            Feedback Háptico
          </label>
          <p className="text-xs text-gray-500">
            Vibración sutil al interactuar con la aplicación
          </p>
        </div>
        
        <button
          onClick={handleToggle}
          className={`
            relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
            transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            ${isEnabled ? 'bg-blue-600' : 'bg-gray-200'}
          `}
        >
          <span
            className={`
              pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
              transition duration-200 ease-in-out
              ${isEnabled ? 'translate-x-5' : 'translate-x-0'}
            `}
          />
        </button>
      </div>
      
      {isEnabled && (
        <button
          onClick={handleTest}
          className="text-xs text-blue-600 hover:text-blue-700 underline"
        >
          Probar vibración
        </button>
      )}
    </div>
  );
};

// Export de la instancia y utilidades
export default haptic;
export { HapticFeedbackManager };