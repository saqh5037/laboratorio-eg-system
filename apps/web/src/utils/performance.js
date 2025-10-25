// Performance monitoring utilities for Laboratorio EG PWA
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      navigation: {},
      paint: {},
      resources: [],
      vitals: {}
    };
    
    this.observers = [];
    this.isSupported = this.checkSupport();
    
    if (this.isSupported) {
      this.init();
    }
  }

  checkSupport() {
    return (
      'performance' in window &&
      'PerformanceObserver' in window &&
      'requestIdleCallback' in window
    );
  }

  init() {
    // Observar métricas de navegación
    this.observeNavigation();
    
    // Observar Web Vitals
    this.observeWebVitals();
    
    // Observar recursos
    this.observeResources();
    
    // Observar eventos de interacción
    this.observeInteractions();
    
    // Reportar métricas cuando la página se oculte
    this.setupReporting();
  }

  observeNavigation() {
    if (!performance.getEntriesByType) return;
    
    const navigationEntries = performance.getEntriesByType('navigation');
    if (navigationEntries.length > 0) {
      const nav = navigationEntries[0];
      
      this.metrics.navigation = {
        dns: nav.domainLookupEnd - nav.domainLookupStart,
        tcp: nav.connectEnd - nav.connectStart,
        ttfb: nav.responseStart - nav.requestStart,
        download: nav.responseEnd - nav.responseStart,
        dom: nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart,
        load: nav.loadEventEnd - nav.loadEventStart,
        total: nav.loadEventEnd - nav.navigationStart
      };
    }
  }

  observeWebVitals() {
    // Largest Contentful Paint (LCP)
    this.createObserver('largest-contentful-paint', (entries) => {
      const lastEntry = entries[entries.length - 1];
      this.metrics.vitals.lcp = lastEntry.startTime;
      this.logMetric('LCP', lastEntry.startTime);
    });

    // First Input Delay (FID) - se observa con 'first-input'
    this.createObserver('first-input', (entries) => {
      const firstEntry = entries[0];
      this.metrics.vitals.fid = firstEntry.processingStart - firstEntry.startTime;
      this.logMetric('FID', this.metrics.vitals.fid);
    });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    this.createObserver('layout-shift', (entries) => {
      for (const entry of entries) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      this.metrics.vitals.cls = clsValue;
    });

    // First Contentful Paint (FCP)
    this.createObserver('paint', (entries) => {
      for (const entry of entries) {
        if (entry.name === 'first-contentful-paint') {
          this.metrics.vitals.fcp = entry.startTime;
          this.logMetric('FCP', entry.startTime);
        }
        if (entry.name === 'first-paint') {
          this.metrics.paint.fp = entry.startTime;
        }
      }
    });

    // Time to Interactive (TTI) - estimación básica
    this.estimateTTI();
  }

  observeResources() {
    this.createObserver('resource', (entries) => {
      for (const entry of entries) {
        const resource = {
          name: entry.name,
          type: this.getResourceType(entry),
          size: entry.transferSize || 0,
          duration: entry.duration,
          startTime: entry.startTime
        };
        
        this.metrics.resources.push(resource);
        
        // Alertar sobre recursos lentos
        if (entry.duration > 1000) {
          console.warn(`Slow resource detected: ${entry.name} (${entry.duration}ms)`);
        }
      }
    });
  }

  observeInteractions() {
    // Medir tiempo de respuesta de interacciones
    let interactionStart = 0;
    
    ['click', 'keydown', 'touchstart'].forEach(eventType => {
      document.addEventListener(eventType, () => {
        interactionStart = performance.now();
      });
    });
    
    requestIdleCallback(() => {
      if (interactionStart > 0) {
        const interactionTime = performance.now() - interactionStart;
        this.logMetric('Interaction Response', interactionTime);
      }
    });
  }

  createObserver(type, callback) {
    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });
      
      observer.observe({ type, buffered: true });
      this.observers.push(observer);
    } catch (error) {
      console.warn(`Could not observe ${type}:`, error);
    }
  }

  estimateTTI() {
    // Estimación simple de TTI basada en cuando no hay tareas largas
    requestIdleCallback(() => {
      const longTasks = performance.getEntriesByType('longtask');
      const lastLongTask = longTasks[longTasks.length - 1];
      
      this.metrics.vitals.tti = lastLongTask 
        ? lastLongTask.startTime + lastLongTask.duration
        : performance.timing.domContentLoadedEventEnd;
        
      this.logMetric('TTI (estimated)', this.metrics.vitals.tti);
    });
  }

  getResourceType(entry) {
    if (entry.initiatorType) return entry.initiatorType;
    
    const url = entry.name;
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'stylesheet';
    if (url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) return 'image';
    if (url.includes('/api/')) return 'api';
    
    return 'other';
  }

  logMetric(name, value) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 ${name}: ${Math.round(value)}ms`);
    }
  }

  setupReporting() {
    // Reportar cuando la página se oculte
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.reportMetrics();
      }
    });

    // Reportar antes de que se cierre la página
    window.addEventListener('beforeunload', () => {
      this.reportMetrics();
    });
  }

  reportMetrics() {
    const report = {
      ...this.metrics,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      connection: this.getConnectionInfo()
    };

    // Enviar métricas al servidor o servicio de analytics
    this.sendMetrics(report);
    
    // Guardar en localStorage para debug
    this.saveMetricsLocally(report);
  }

  getConnectionInfo() {
    if ('connection' in navigator) {
      const conn = navigator.connection;
      return {
        effectiveType: conn.effectiveType,
        downlink: conn.downlink,
        rtt: conn.rtt,
        saveData: conn.saveData
      };
    }
    return null;
  }

  sendMetrics(report) {
    // Usar sendBeacon para envío confiable
    if ('sendBeacon' in navigator) {
      const data = JSON.stringify(report);
      navigator.sendBeacon('/api/analytics/performance', data);
    } else {
      // Fallback para navegadores sin sendBeacon
      fetch('/api/analytics/performance', {
        method: 'POST',
        body: JSON.stringify(report),
        headers: {
          'Content-Type': 'application/json'
        },
        keepalive: true
      }).catch(err => {
        console.warn('Failed to send performance metrics:', err);
      });
    }
  }

  saveMetricsLocally(report) {
    try {
      const existing = JSON.parse(localStorage.getItem('performance_metrics') || '[]');
      existing.push(report);
      
      // Mantener solo los últimos 5 reportes
      const recent = existing.slice(-5);
      localStorage.setItem('performance_metrics', JSON.stringify(recent));
    } catch (error) {
      console.warn('Could not save metrics locally:', error);
    }
  }

  // Métodos públicos para obtener métricas
  getMetrics() {
    return { ...this.metrics };
  }

  getWebVitalsScore() {
    const { lcp, fid, cls, fcp } = this.metrics.vitals;
    
    const scores = {
      lcp: this.scoreLCP(lcp),
      fid: this.scoreFID(fid),
      cls: this.scoreCLS(cls),
      fcp: this.scoreFCP(fcp)
    };
    
    const avgScore = Object.values(scores)
      .filter(score => score !== null)
      .reduce((sum, score) => sum + score, 0) / Object.values(scores).filter(score => score !== null).length;
    
    return {
      scores,
      overall: avgScore || 0,
      grade: this.getGrade(avgScore || 0)
    };
  }

  scoreLCP(lcp) {
    if (!lcp) return null;
    if (lcp <= 2500) return 100;
    if (lcp <= 4000) return 75;
    return 50;
  }

  scoreFID(fid) {
    if (fid === undefined) return null;
    if (fid <= 100) return 100;
    if (fid <= 300) return 75;
    return 50;
  }

  scoreCLS(cls) {
    if (cls === undefined) return null;
    if (cls <= 0.1) return 100;
    if (cls <= 0.25) return 75;
    return 50;
  }

  scoreFCP(fcp) {
    if (!fcp) return null;
    if (fcp <= 1800) return 100;
    if (fcp <= 3000) return 75;
    return 50;
  }

  getGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  // Limpiar observadores
  disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Utilidad para medir el rendimiento de funciones específicas
export const measureFunction = (fn, name) => {
  return (...args) => {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();
    
    console.log(`⚡ ${name}: ${(end - start).toFixed(2)}ms`);
    
    return result;
  };
};

// Utilidad para medir el rendimiento de componentes React
export const measureComponent = (WrappedComponent, displayName) => {
  const MeasuredComponent = (props) => {
    const start = performance.now();
    
    React.useEffect(() => {
      const end = performance.now();
      console.log(`🔥 ${displayName} render: ${(end - start).toFixed(2)}ms`);
    });
    
    return React.createElement(WrappedComponent, props);
  };
  
  MeasuredComponent.displayName = `Measured(${displayName})`;
  return MeasuredComponent;
};

// Hook para monitorear el rendimiento de componentes
export const usePerformanceMonitor = (componentName) => {
  const [renderTime, setRenderTime] = React.useState(0);
  const startTime = React.useRef(0);
  
  React.useLayoutEffect(() => {
    startTime.current = performance.now();
  });
  
  React.useEffect(() => {
    const endTime = performance.now();
    const duration = endTime - startTime.current;
    setRenderTime(duration);
    
    if (duration > 16) { // Más de un frame (60fps)
      console.warn(`⚠️ Slow render in ${componentName}: ${duration.toFixed(2)}ms`);
    }
  });
  
  return renderTime;
};

// Crear instancia global
const performanceMonitor = new PerformanceMonitor();

export default performanceMonitor;