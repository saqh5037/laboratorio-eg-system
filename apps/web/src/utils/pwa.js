// PWA Manager para Laboratorio EG
class PWAManager {
  constructor() {
    this.swRegistration = null;
    this.isOnline = navigator.onLine;
    this.installPromptEvent = null;
    this.isInstalled = false;
    this.updateAvailable = false;
    this.callbacks = {
      onInstallable: [],
      onInstalled: [],
      onUpdateAvailable: [],
      onOffline: [],
      onOnline: []
    };
    
    this.init();
  }

  async init() {
    // Verificar si ya está instalado
    this.checkIfInstalled();
    
    // Registrar Service Worker
    if ('serviceWorker' in navigator) {
      await this.registerServiceWorker();
    }
    
    // Configurar eventos
    this.setupEventListeners();
    
    // Verificar conectividad inicial
    this.handleConnectionChange();
  }

  async registerServiceWorker() {
    try {
      console.log('[PWA] Registering Service Worker...');
      
      this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('[PWA] Service Worker registered successfully');
      
      // Configurar eventos del Service Worker
      this.setupServiceWorkerEvents();
      
      // Verificar actualizaciones
      this.checkForUpdates();
      
    } catch (error) {
      console.error('[PWA] Service Worker registration failed:', error);
    }
  }

  setupServiceWorkerEvents() {
    if (!this.swRegistration) return;
    
    // Escuchar mensajes del Service Worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      const { type, version } = event.data;
      
      switch (type) {
        case 'SW_UPDATED':
          console.log('[PWA] Service Worker updated to version:', version);
          this.updateAvailable = true;
          this.triggerCallbacks('onUpdateAvailable', { version });
          break;
        default:
          console.log('[PWA] Message from SW:', event.data);
      }
    });
    
    // Detectar nuevo Service Worker en espera
    this.swRegistration.addEventListener('updatefound', () => {
      const newWorker = this.swRegistration.installing;
      
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          console.log('[PWA] New Service Worker installed, update available');
          this.updateAvailable = true;
          this.triggerCallbacks('onUpdateAvailable', { newWorker });
        }
      });
    });
  }

  setupEventListeners() {
    // Detectar prompt de instalación
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('[PWA] Install prompt available');
      e.preventDefault();
      this.installPromptEvent = e;
      this.triggerCallbacks('onInstallable');
    });
    
    // Detectar instalación completada
    window.addEventListener('appinstalled', () => {
      console.log('[PWA] App installed successfully');
      this.isInstalled = true;
      this.installPromptEvent = null;
      this.triggerCallbacks('onInstalled');
    });
    
    // Detectar cambios de conectividad
    window.addEventListener('online', () => {
      console.log('[PWA] Back online');
      this.isOnline = true;
      this.handleConnectionChange();
      this.triggerCallbacks('onOnline');
    });
    
    window.addEventListener('offline', () => {
      console.log('[PWA] Gone offline');
      this.isOnline = false;
      this.handleConnectionChange();
      this.triggerCallbacks('onOffline');
    });
    
    // Detectar cambios de visibilidad para verificar actualizaciones
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.checkForUpdates();
      }
    });
  }

  checkIfInstalled() {
    // Verificar si está en modo standalone (instalado)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true;
      return;
    }
    
    // Verificar en iOS
    if (window.navigator.standalone === true) {
      this.isInstalled = true;
      return;
    }
    
    // Verificar con User-Agent hints si está disponible
    if ('userAgentData' in navigator && navigator.userAgentData.mobile) {
      this.isInstalled = window.matchMedia('(display-mode: standalone)').matches;
    }
  }

  async promptInstall() {
    if (!this.installPromptEvent) {
      throw new Error('Install prompt not available');
    }
    
    try {
      console.log('[PWA] Showing install prompt');
      const result = await this.installPromptEvent.prompt();
      
      console.log('[PWA] Install prompt result:', result.outcome);
      
      if (result.outcome === 'accepted') {
        this.installPromptEvent = null;
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('[PWA] Install prompt failed:', error);
      throw error;
    }
  }

  async updateApp() {
    if (!this.swRegistration || !this.updateAvailable) {
      throw new Error('No update available');
    }
    
    try {
      console.log('[PWA] Updating app...');
      
      // Si hay un worker en espera, activarlo
      if (this.swRegistration.waiting) {
        this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
        
        // Esperar a que el nuevo SW tome control
        await new Promise((resolve) => {
          navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true });
        });
      }
      
      // Recargar la página para aplicar la actualización
      window.location.reload();
      
    } catch (error) {
      console.error('[PWA] App update failed:', error);
      throw error;
    }
  }

  async checkForUpdates() {
    if (!this.swRegistration) return;
    
    try {
      console.log('[PWA] Checking for updates...');
      await this.swRegistration.update();
    } catch (error) {
      console.error('[PWA] Update check failed:', error);
    }
  }

  handleConnectionChange() {
    // Actualizar indicadores visuales
    this.updateNetworkStatus();
    
    // Intentar sincronización si volvió la conectividad
    if (this.isOnline && 'serviceWorker' in navigator) {
      this.requestBackgroundSync();
    }
  }

  updateNetworkStatus() {
    const statusElement = document.querySelector('#network-status');
    if (statusElement) {
      statusElement.className = this.isOnline ? 'network-online' : 'network-offline';
      statusElement.textContent = this.isOnline ? 'En línea' : 'Sin conexión';
    }
  }

  async requestBackgroundSync() {
    if (!this.swRegistration || !this.swRegistration.sync) {
      console.warn('[PWA] Background sync not supported');
      return;
    }
    
    try {
      // Solicitar sincronización de favoritos
      await this.swRegistration.sync.register('sync-favorites');
      
      // Solicitar sincronización de acciones offline
      await this.swRegistration.sync.register('sync-offline-actions');
      
      console.log('[PWA] Background sync requested');
    } catch (error) {
      console.error('[PWA] Background sync request failed:', error);
    }
  }

  // Notificaciones push (preparación para futuro)
  async requestNotificationPermission() {
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported');
    }
    
    if (Notification.permission === 'denied') {
      throw new Error('Notifications blocked by user');
    }
    
    if (Notification.permission === 'granted') {
      return true;
    }
    
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  async subscribeToPushNotifications() {
    if (!this.swRegistration) {
      throw new Error('Service Worker not registered');
    }
    
    try {
      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(process.env.REACT_APP_VAPID_PUBLIC_KEY || '')
      });
      
      console.log('[PWA] Push subscription:', subscription);
      
      // Enviar suscripción al servidor
      await this.sendSubscriptionToServer(subscription);
      
      return subscription;
    } catch (error) {
      console.error('[PWA] Push subscription failed:', error);
      throw error;
    }
  }

  async sendSubscriptionToServer(subscription) {
    // Implementar envío al servidor cuando esté disponible
    console.log('[PWA] Would send subscription to server:', subscription);
  }

  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    
    return outputArray;
  }

  // Gestión de callbacks
  on(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event].push(callback);
    }
  }

  off(event, callback) {
    if (this.callbacks[event]) {
      const index = this.callbacks[event].indexOf(callback);
      if (index > -1) {
        this.callbacks[event].splice(index, 1);
      }
    }
  }

  triggerCallbacks(event, data = null) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[PWA] Callback error for ${event}:`, error);
        }
      });
    }
  }

  // Métodos públicos para obtener estado
  getInstallStatus() {
    return {
      isInstallable: !!this.installPromptEvent,
      isInstalled: this.isInstalled,
      canPromptInstall: !!this.installPromptEvent
    };
  }

  getUpdateStatus() {
    return {
      updateAvailable: this.updateAvailable,
      canUpdate: this.updateAvailable && !!this.swRegistration
    };
  }

  getNetworkStatus() {
    return {
      isOnline: this.isOnline,
      isOffline: !this.isOnline
    };
  }

  getCapabilities() {
    return {
      serviceWorker: 'serviceWorker' in navigator,
      notifications: 'Notification' in window,
      pushManager: 'PushManager' in window,
      backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
      installPrompt: 'BeforeInstallPromptEvent' in window || 'onbeforeinstallprompt' in window
    };
  }
}

// Crear instancia global
const pwaManager = new PWAManager();

export default pwaManager;