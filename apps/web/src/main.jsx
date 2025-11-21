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

// Register Service Worker (vite-plugin-pwa)
if ('serviceWorker' in navigator) {
  // Importar el registro del SW generado por vite-plugin-pwa
  import('virtual:pwa-register').then(({ registerSW }) => {
    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        console.log('[PWA] Nueva versión disponible, actualizando...');
      },
      onOfflineReady() {
        console.log('[PWA] App lista para funcionar offline');
      },
      onRegistered(registration) {
        console.log('[PWA] Service Worker registrado correctamente');

        // Auto-update cada hora
        if (registration) {
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000); // 1 hora
        }
      },
      onRegisterError(error) {
        console.error('[PWA] Error al registrar Service Worker:', error);
      },
    });

    // Forzar actualización si hay nueva versión
    window.addEventListener('vite:preloadError', (event) => {
      console.warn('[PWA] Error de precarga detectado, recargando...');
      window.location.reload();
    });
  }).catch((err) => {
    console.error('[PWA] Error al importar virtual:pwa-register:', err);
  });
}
