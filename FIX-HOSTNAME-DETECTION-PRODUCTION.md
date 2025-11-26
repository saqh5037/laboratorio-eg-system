# 🔴 FIX CRÍTICO: Pantalla Blanca iOS en Producción

**Fecha**: 2025-11-22
**Versión**: v2.8.2
**Prioridad**: CRÍTICA
**Status**: ✅ SOLUCIONADO

---

## 📋 Resumen Ejecutivo

El problema de **pantalla blanca en iOS** en producción fue causado por **lógica de detección de hostname hardcodeada** en el código fuente que **ignoraba las variables de entorno**.

### Causa Raíz Identificada

El código tenía múltiples archivos con este patrón problemático:

```javascript
// ❌ PROBLEMA: Ignora variables de entorno
const apiUrl = window.location.hostname === 'localhost'
    ? 'http://localhost:3001'
    : `http://${window.location.hostname}:3001`;
```

**Qué causaba esto en producción:**
- Hostname en producción: `laboratorio-eg.com`
- El código intentaba conectarse a: `http://laboratorio-eg.com:3001` ❌
- Puerto 3001 NO existe en producción → APIs fallan → Pantalla blanca

---

## ✅ Solución Implementada

### Commits Aplicados

1. **`3d66fdc`** - fix(pwa): Eliminar URLs hardcodeadas de localhost en Service Worker
2. **`c159b3d`** - fix(critical): Eliminar TODA lógica de detección de hostname

### Archivos Modificados

#### 1. `/apps/web/vite.config.js`
**Cambio**: Service Worker usa patrones dinámicos en lugar de localhost hardcoded

```javascript
// ANTES ❌
urlPattern: /^https?:\/\/localhost:5173\/.*\.js$/

// DESPUÉS ✅
urlPattern: ({ url, sameOrigin }) => sameOrigin && url.pathname.endsWith('.js')
```

#### 2. `/apps/web/src/components/StudyTreeView.jsx`
**Cambio**: Eliminada detección de hostname

```javascript
// ANTES ❌
const apiUrl = window.location.hostname === 'localhost'
  ? 'http://localhost:3001'
  : `http://${window.location.hostname}:3001`;

// DESPUÉS ✅
const apiUrl = import.meta.env.VITE_API_URL || '/api';
```

#### 3. `/apps/web/src/hooks/useLabDataDB.js`
**Cambio**: Usa SIEMPRE variables de entorno

```javascript
// ANTES ❌
apiUrl = import.meta.env.VITE_API_URL ||
         (window.location.hostname === 'localhost'
           ? 'http://localhost:3001/api'
           : `http://${window.location.hostname}:3001/api`)

// DESPUÉS ✅
apiUrl = import.meta.env.VITE_API_URL || '/api'
```

#### 4. `/apps/web/src/services/messagingBotApi.js`
**Cambio**: Simplificado a variable de entorno única

```javascript
// ANTES ❌
const getMessagingBotApiUrl = () => {
  if (import.meta.env.VITE_MESSAGING_BOT_API_URL) {
    return import.meta.env.VITE_MESSAGING_BOT_API_URL;
  }
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3004/api';
  }
  return `http://${hostname}:3004/api`;
};

// DESPUÉS ✅
const MESSAGING_BOT_API_URL = import.meta.env.VITE_MESSAGING_BOT_API_URL || '/api/messaging';
```

#### 5. `/apps/web/.env.production.example` (NUEVO)
**Propósito**: Template de configuración para producción

---

## 🚀 Instrucciones para DevOps

### PASO 1: Crear archivo `.env.production` en el servidor

Ubicación: `/path/to/laboratorio-eg-system/apps/web/.env.production`

```bash
# === URLs de APIs en Producción ===
# CRÍTICO: Reemplazar 'laboratorio-eg.com' con el dominio real

# Frontend API URL
VITE_API_URL=https://laboratorio-eg.com/api

# Results Service API URL
VITE_RESULTS_API_URL=https://laboratorio-eg.com/api/results

# Config Service API URL
VITE_CONFIG_API_URL=https://laboratorio-eg.com

# Messaging Bot Service API URL
VITE_MESSAGING_BOT_API_URL=https://laboratorio-eg.com/api/messaging

# Config API Settings
VITE_CONFIG_CACHE_TTL=300000
VITE_CONFIG_POLL_INTERVAL=30000

# === PWA Configuration ===
VITE_APP_NAME="Laboratorio Elizabeth Gutiérrez"
VITE_APP_SHORT_NAME="Lab EG"
VITE_APP_DESCRIPTION="Sistema de gestión de estudios clínicos"

# === Feature Flags ===
VITE_ENABLE_PUSH_NOTIFICATIONS=false
VITE_ENABLE_BACKGROUND_SYNC=true
VITE_ENABLE_OFFLINE_MODE=true
VITE_ENABLE_DATABASE=true

# === Production Settings ===
NODE_ENV=production
VITE_DEBUG_MODE=false
VITE_MOCK_API=false

# === Security ===
CORS_ORIGIN=https://laboratorio-eg.com
```

### PASO 2: Pull del código actualizado

```bash
cd /path/to/laboratorio-eg-system
git checkout develop
git pull origin develop
```

**Verificar commits:**
```bash
git log --oneline -5
# Debe mostrar:
# c159b3d fix(critical): Eliminar TODA lógica de detección de hostname
# 3d66fdc fix(pwa): Eliminar URLs hardcodeadas de localhost en Service Worker
```

### PASO 3: Rebuild completo

```bash
# Limpiar caché anterior
cd apps/web
rm -rf dist .vite node_modules/.vite

# Rebuild con .env.production
NODE_ENV=production npm run build

# Verificar que el build usó las variables correctas
grep -r "localhost" dist/ || echo "✅ No hay localhost hardcoded"
```

### PASO 4: Limpiar Service Worker en el servidor

```bash
# Si usan Nginx, limpiar caché
sudo nginx -s reload

# Si tienen caché de Varnish/CDN
# Purgar caché completo del dominio
```

### PASO 5: Reiniciar servicios

```bash
pm2 restart all
pm2 logs --lines 50
```

### PASO 6: Verificación Post-Deployment

```bash
# 1. Health checks
curl https://laboratorio-eg.com/health
curl https://laboratorio-eg.com/api/config

# 2. Verificar que el HTML NO tenga localhost
curl https://laboratorio-eg.com/ | grep -i localhost
# Debe retornar NADA (sin coincidencias)

# 3. Verificar Service Worker
curl https://laboratorio-eg.com/sw.js | grep -i localhost
# Debe retornar NADA (sin coincidencias)
```

---

## 📱 Testing en iOS (Usuario Final)

**IMPORTANTE**: El usuario final debe hacer lo siguiente en su iPhone:

### Opción 1: Limpiar Caché de Safari

1. Abrir **Configuración** en iPhone
2. Ir a **Safari**
3. Scroll down → **Borrar historial y datos de sitios web**
4. Confirmar

### Opción 2: Modo Privado

1. Abrir Safari
2. Tocar icono de pestañas (esquina inferior derecha)
3. Tocar "Privado"
4. Abrir nueva pestaña privada
5. Ir a `https://laboratorio-eg.com`

### Opción 3: Desinstalar PWA

Si la app está instalada como PWA:
1. Mantener presionado el icono de la app
2. Seleccionar "Eliminar App"
3. Volver a instalarla desde Safari

---

## 🔍 Diferencia: Antes vs Después

### ANTES (PROBLEMA)

```
┌─────────────────────────────────────────┐
│  iPhone en Safari                      │
│  URL: https://laboratorio-eg.com       │
└─────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  JavaScript detecta hostname:           │
│  window.location.hostname               │
│  → "laboratorio-eg.com"                 │
└─────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Código construye URL:                  │
│  http://laboratorio-eg.com:3001/api ❌  │
│  (Puerto 3001 NO existe en producción)  │
└─────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Fetch falla → Pantalla blanca ❌       │
└─────────────────────────────────────────┘
```

### DESPUÉS (SOLUCIÓN)

```
┌─────────────────────────────────────────┐
│  iPhone en Safari                      │
│  URL: https://laboratorio-eg.com       │
└─────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  JavaScript usa variable de entorno:    │
│  import.meta.env.VITE_API_URL           │
│  → "https://laboratorio-eg.com/api" ✅  │
└─────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  Fetch exitoso → App funciona ✅        │
└─────────────────────────────────────────┘
```

---

## ⚠️ Problemas Potenciales y Soluciones

### Problema 1: Build falla con "VITE_API_URL is not defined"

**Causa**: No existe `.env.production`

**Solución**:
```bash
cp apps/web/.env.production.example apps/web/.env.production
# Editar .env.production con URLs correctas
```

### Problema 2: APIs siguen respondiendo 404 después del deployment

**Causa**: Nginx no está configurado para proxy de /api

**Solución**: Verificar configuración de Nginx
```nginx
location /api {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

### Problema 3: Service Worker sigue cacheando localhost

**Causa**: Service Worker antiguo activo en navegador

**Solución**:
1. Incrementar versión en `package.json`
2. Rebuild completo
3. Usuario debe limpiar caché de Safari

---

## 📊 Checklist de Deployment

```
Pre-Deployment:
□ Pull del código actualizado (commits c159b3d + 3d66fdc)
□ Crear .env.production con URLs correctas
□ Verificar que NO haya localhost en .env.production

Deployment:
□ Limpiar dist y caché de Vite
□ Build con NODE_ENV=production
□ Verificar que dist/ NO tenga localhost hardcoded
□ Deploy a servidor
□ Limpiar caché de Nginx/CDN
□ Reiniciar servicios PM2

Post-Deployment:
□ Health checks pasando
□ curl https://domain.com/ | grep localhost → Sin resultados
□ curl https://domain.com/sw.js | grep localhost → Sin resultados
□ Testing manual en iPhone con caché limpio
□ Verificar que sidebar tenga 5-7 items
□ Verificar que NO haya pantalla blanca
```

---

## 📞 Contacto

**Si el problema persiste después de aplicar este fix:**

1. Verificar logs de PM2: `pm2 logs --lines 200`
2. Verificar Nginx error log: `tail -f /var/log/nginx/error.log`
3. Verificar que .env.production existe y tiene URLs correctas
4. Verificar que el build usó las variables: `grep -r "localhost" apps/web/dist/`

---

## ✅ Resultado Esperado

Después de aplicar este fix:

- ✅ Usuario accede a `https://laboratorio-eg.com` desde iPhone
- ✅ App carga correctamente (sin pantalla blanca)
- ✅ Sidebar muestra 5-7 opciones de navegación
- ✅ APIs responden correctamente
- ✅ Service Worker cachea desde el dominio correcto
- ✅ NO hay referencias a localhost en el código deployed

---

**Generado con Claude Code**
**Fecha**: 2025-11-22
**Versión**: v2.8.2
