// Service Worker para Laboratorio EG
// Versión: 1.1.2 - Fix para PDF downloads y POST requests
const CACHE_NAME = 'lab-eg-v1.1.2';
const OFFLINE_CACHE = 'lab-eg-offline-v1.1.2';
const RUNTIME_CACHE = 'lab-eg-runtime-v1.1.2';

// Recursos críticos para cache inicial
const CRITICAL_RESOURCES = [
  '/',
  '/estudios',
  '/favoritos',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/LogoEG.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/manifest.json'
];

// Recursos para precargar
const PRELOAD_RESOURCES = [
  '/estudios/tree',
  '/nosotros',
  '/contacto'
];

// Estrategias de cache
const CACHE_STRATEGIES = {
  // Cache First - Para recursos estáticos
  CACHE_FIRST: 'cache-first',
  // Network First - Para datos dinámicos
  NETWORK_FIRST: 'network-first',
  // Stale While Revalidate - Para recursos que pueden estar desactualizados
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  // Network Only - Para requests críticos
  NETWORK_ONLY: 'network-only',
  // Cache Only - Para recursos offline
  CACHE_ONLY: 'cache-only'
};

// Configuración de rutas y estrategias
const ROUTE_STRATEGIES = [
  {
    pattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
    strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
    cache: RUNTIME_CACHE
  },
  {
    pattern: /\.(?:js|css)$/,
    strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
    cache: RUNTIME_CACHE
  },
  {
    pattern: /^https:\/\/fonts\.googleapis\.com/,
    strategy: CACHE_STRATEGIES.STALE_WHILE_REVALIDATE,
    cache: RUNTIME_CACHE
  },
  {
    pattern: /^https:\/\/fonts\.gstatic\.com/,
    strategy: CACHE_STRATEGIES.CACHE_FIRST,
    cache: RUNTIME_CACHE
  },
  // IMPORTANTE: PDFs y descargas SIEMPRE van directamente al network, sin cache
  {
    pattern: /\/pdf$/,
    strategy: CACHE_STRATEGIES.NETWORK_ONLY
  },
  {
    pattern: /\.pdf$/,
    strategy: CACHE_STRATEGIES.NETWORK_ONLY
  },
  {
    pattern: /\/api\//,
    strategy: CACHE_STRATEGIES.NETWORK_FIRST,
    cache: RUNTIME_CACHE
  }
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker v1.1.2');
  
  event.waitUntil(
    Promise.all([
      // Cache recursos críticos
      caches.open(CACHE_NAME).then((cache) => {
        console.log('[SW] Caching critical resources');
        return cache.addAll(CRITICAL_RESOURCES);
      }),
      // Precargar recursos adicionales
      caches.open(RUNTIME_CACHE).then((cache) => {
        console.log('[SW] Preloading additional resources');
        return cache.addAll(PRELOAD_RESOURCES).catch(err => {
          console.warn('[SW] Some preload resources failed:', err);
        });
      }),
      // Forzar activación inmediata
      self.skipWaiting()
    ])
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker v1.1.2');
  
  event.waitUntil(
    Promise.all([
      // Limpiar caches antiguos
      cleanupOldCaches(),
      // Reclamar control de todas las pestañas
      self.clients.claim(),
      // Notificar actualización a los clientes
      notifyClientsOfUpdate()
    ])
  );
});

// Manejo de peticiones
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar peticiones no HTTP/HTTPS
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Ignorar peticiones de Chrome Extensions
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // IMPORTANTE: Solo cachear peticiones GET
  // POST, PUT, DELETE, etc. siempre van directo al network
  if (request.method !== 'GET') {
    return;
  }

  event.respondWith(handleRequest(request));
});

// Sincronización en background
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  switch (event.tag) {
    case 'sync-favorites':
      event.waitUntil(syncFavorites());
      break;
    case 'sync-offline-actions':
      event.waitUntil(syncOfflineActions());
      break;
    default:
      console.log('[SW] Unknown sync tag:', event.tag);
  }
});

// Notificaciones push (preparación para futuro)
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'Nueva notificación del laboratorio',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: 'lab-eg-notification',
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: 'Abrir aplicación'
      },
      {
        action: 'close',
        title: 'Cerrar'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Laboratorio EG', options)
  );
});

// Click en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click:', event);
  
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Funciones auxiliares

async function handleRequest(request) {
  const url = new URL(request.url);
  
  // Encontrar estrategia para esta URL
  const routeConfig = ROUTE_STRATEGIES.find(route => 
    route.pattern.test(url.pathname) || route.pattern.test(url.href)
  );
  
  if (routeConfig) {
    return handleWithStrategy(request, routeConfig);
  }
  
  // Estrategia por defecto para navegación
  if (request.mode === 'navigate') {
    return handleNavigation(request);
  }
  
  // Estrategia por defecto para otros recursos
  return handleWithStrategy(request, {
    strategy: CACHE_STRATEGIES.NETWORK_FIRST,
    cache: RUNTIME_CACHE
  });
}

async function handleWithStrategy(request, config) {
  const { strategy, cache: cacheName } = config;
  
  switch (strategy) {
    case CACHE_STRATEGIES.CACHE_FIRST:
      return cacheFirst(request, cacheName);
    case CACHE_STRATEGIES.NETWORK_FIRST:
      return networkFirst(request, cacheName);
    case CACHE_STRATEGIES.STALE_WHILE_REVALIDATE:
      return staleWhileRevalidate(request, cacheName);
    case CACHE_STRATEGIES.NETWORK_ONLY:
      return fetch(request);
    case CACHE_STRATEGIES.CACHE_ONLY:
      return caches.match(request);
    default:
      return networkFirst(request, cacheName);
  }
}

async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const responseToCache = networkResponse.clone();
      const cache = await caches.open(cacheName);
      await cache.put(request, responseToCache);
    }
    return networkResponse;
  } catch (error) {
    console.warn('[SW] Cache first failed:', error);
    return createOfflineResponse(request);
  }
}

async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const responseToCache = networkResponse.clone();
      const cache = await caches.open(cacheName);
      await cache.put(request, responseToCache);
    }
    return networkResponse;
  } catch (error) {
    console.warn('[SW] Network first failed, trying cache:', error);
    const cachedResponse = await caches.match(request);
    return cachedResponse || createOfflineResponse(request);
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request).then(async networkResponse => {
    if (networkResponse.ok) {
      // Clone the response BEFORE using it
      const responseToCache = networkResponse.clone();
      const cache = await caches.open(cacheName);
      await cache.put(request, responseToCache);
    }
    return networkResponse;
  }).catch(error => {
    console.warn('[SW] Stale while revalidate fetch failed:', error);
    return cachedResponse;
  });
  
  return cachedResponse || fetchPromise;
}

async function handleNavigation(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const responseToCache = networkResponse.clone();
      const cache = await caches.open(RUNTIME_CACHE);
      await cache.put(request, responseToCache);
    }
    return networkResponse;
  } catch (error) {
    console.warn('[SW] Navigation failed, serving offline page:', error);
    
    // Intentar servir página específica desde cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Servir página offline
    return createOfflinePage();
  }
}

function createOfflineResponse(request) {
  const url = new URL(request.url);
  
  if (request.destination === 'image') {
    return createOfflineImage();
  }
  
  if (request.mode === 'navigate') {
    return createOfflinePage();
  }
  
  return new Response('Offline', {
    status: 503,
    statusText: 'Service Unavailable',
    headers: {
      'Content-Type': 'text/plain'
    }
  });
}

function createOfflinePage() {
  const offlineHTML = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Laboratorio EG - Sin conexión</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          margin: 0;
          padding: 20px;
          background: linear-gradient(135deg, #7B68A6, #E8C4DD);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        .container {
          text-align: center;
          max-width: 400px;
          background: rgba(255, 255, 255, 0.1);
          padding: 40px;
          border-radius: 20px;
          backdrop-filter: blur(10px);
        }
        .logo {
          width: 80px;
          height: 80px;
          background: white;
          border-radius: 50%;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: #7B68A6;
          font-weight: bold;
        }
        h1 { margin: 0 0 10px 0; font-size: 24px; }
        p { margin: 0 0 20px 0; opacity: 0.9; }
        .retry-btn {
          background: white;
          color: #7B68A6;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
          font-size: 16px;
        }
        .retry-btn:hover {
          background: #f0f0f0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">EG</div>
        <h1>Sin conexión</h1>
        <p>No se puede conectar con el servidor. Verifica tu conexión a internet e intenta nuevamente.</p>
        <button class="retry-btn" onclick="location.reload()">
          Reintentar
        </button>
      </div>
    </body>
    </html>
  `;
  
  return new Response(offlineHTML, {
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'no-cache'
    }
  });
}

function createOfflineImage() {
  // SVG placeholder para imágenes offline
  const offlineSVG = `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="300" fill="#f0f0f0"/>
      <circle cx="200" cy="120" r="30" fill="#7B68A6"/>
      <text x="200" y="180" text-anchor="middle" font-family="Arial" font-size="16" fill="#666">
        Imagen no disponible offline
      </text>
    </svg>
  `;
  
  return new Response(offlineSVG, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'no-cache'
    }
  });
}

async function cleanupOldCaches() {
  const cacheNames = await caches.keys();
  const oldCaches = cacheNames.filter(name => 
    name.startsWith('lab-eg-') && name !== CACHE_NAME && 
    name !== OFFLINE_CACHE && name !== RUNTIME_CACHE
  );
  
  return Promise.all(
    oldCaches.map(name => {
      console.log('[SW] Deleting old cache:', name);
      return caches.delete(name);
    })
  );
}

async function notifyClientsOfUpdate() {
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({
      type: 'SW_UPDATED',
      version: '1.0.0'
    });
  });
}

async function syncFavorites() {
  console.log('[SW] Syncing favorites...');
  // Implementar sincronización de favoritos cuando haya conectividad
  try {
    // Obtener favoritos pendientes de sincronización
    const favoritesSyncData = await getFromIndexedDB('favorites-sync');
    if (favoritesSyncData) {
      // Enviar al servidor
      await fetch('/api/sync/favorites', {
        method: 'POST',
        body: JSON.stringify(favoritesSyncData),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Limpiar datos sincronizados
      await removeFromIndexedDB('favorites-sync');
    }
  } catch (error) {
    console.error('[SW] Favorites sync failed:', error);
  }
}

async function syncOfflineActions() {
  console.log('[SW] Syncing offline actions...');
  // Implementar sincronización de acciones offline
  try {
    const offlineActions = await getFromIndexedDB('offline-actions');
    if (offlineActions && offlineActions.length > 0) {
      for (const action of offlineActions) {
        await fetch(action.url, {
          method: action.method,
          body: action.data,
          headers: action.headers
        });
      }
      
      await removeFromIndexedDB('offline-actions');
    }
  } catch (error) {
    console.error('[SW] Offline actions sync failed:', error);
  }
}

// Funciones IndexedDB (simplificadas para el ejemplo)
async function getFromIndexedDB(key) {
  // Implementar acceso a IndexedDB
  return null;
}

async function removeFromIndexedDB(key) {
  // Implementar eliminación de IndexedDB
  return true;
}

// Manejar errores no capturados
self.addEventListener('error', (event) => {
  console.error('[SW] Error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('[SW] Unhandled promise rejection:', event.reason);
  event.preventDefault();
});

console.log('[SW] Service Worker loaded successfully');