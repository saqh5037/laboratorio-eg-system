import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import performanceMonitor from './utils/performance.js'
import { SystemConfigProvider } from './contexts/SystemConfigContext.jsx'
import { AdminAuthProvider } from './contexts/AdminAuthContext.jsx'

// Inicializar monitoreo de rendimiento
if (process.env.NODE_ENV === 'production') {
  performanceMonitor.init();
}

// Precargar datos críticos
const preloadCriticalData = async () => {
  // Precargar estudios si están en cache
  if ('caches' in window) {
    try {
      const cache = await caches.open('lab-eg-runtime-v1.0.0');
      const estudiosResponse = await cache.match('/api/estudios');
      if (estudiosResponse) {
        const estudios = await estudiosResponse.json();
        window.__PRELOADED_ESTUDIOS__ = estudios;
      }
    } catch (error) {
      console.warn('Could not preload estudios:', error);
    }
  }
};

// Inicializar precarga
preloadCriticalData();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SystemConfigProvider>
      <AdminAuthProvider>
        <App />
      </AdminAuthProvider>
    </SystemConfigProvider>
  </StrictMode>,
)

// DESARROLLO: Desregistrar Service Worker si existe
// En producción, el SW se registrará automáticamente con vite-plugin-pwa
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'development') {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister();
      console.log('[DEV] Service Worker desregistrado para desarrollo');
    }
  });

  // Limpiar caches del Service Worker
  if ('caches' in window) {
    caches.keys().then((names) => {
      names.forEach((name) => {
        caches.delete(name);
        console.log('[DEV] Cache eliminado:', name);
      });
    });
  }
}
