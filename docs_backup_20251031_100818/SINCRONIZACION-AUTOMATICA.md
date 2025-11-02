# Sistema de Sincronización Automática de Precios

## Descripción General

Sistema completo de sincronización en tiempo real de precios desde la base de datos PostgreSQL (labsisEG) hacia la aplicación web PWA. Los cambios en los precios se propagan automáticamente sin intervención manual.

**Fecha de implementación:** 22 de Octubre, 2025
**Base de datos:** labsisEG
**Lista de precios:** ID 27 (Ambulatorio_Abril_2025)

---

## Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                         LABSIS (Sistema LIS)                     │
│                  Modificación de Precios Manual                  │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database (labsisEG)                │
│  Tablas: lista_precios_has_prueba, lista_precios_has_gprueba    │
└─────────┬───────────────────────────────┬───────────────────────┘
          ↓                               ↓
    [TRIGGER]                      [TRIGGER]
    precio_cambio_notify           precio_cambio_notify
          ↓                               ↓
          └───────────┬───────────────────┘
                      ↓
            [NOTIFY "precio_cambio"]
                      ↓
        ┌─────────────┴─────────────┐
        ↓                           ↓
┌───────────────────┐    ┌──────────────────────┐
│   Backend API     │    │   Sync Service       │
│   (port 3001)     │    │   (port 3002)        │
├───────────────────┤    ├──────────────────────┤
│ • PostgreSQL      │    │ • PostgreSQL         │
│   Listener        │    │   Listener           │
│ • Cache           │    │ • Debounce (2s)      │
│   Invalidation    │    │ • JSON Generator     │
│ • REST API        │    │ • Auto-copy to Web   │
└───────────────────┘    └──────────┬───────────┘
                                    ↓
                         [Copia Automática]
                                    ↓
                    /laboratorio-eg/public/data/precios.json
                                    ↓
                    ┌───────────────────────────┐
                    │   Frontend (Vite)         │
                    │   http://localhost:5173   │
                    │                           │
                    │ • Lee JSON estático       │
                    │ • PWA con Service Worker  │
                    │ • Cache del navegador     │
                    └───────────────────────────┘
```

---

## Componentes del Sistema

### 1. Triggers de PostgreSQL

**Ubicación:** Base de datos `labsisEG`

#### Trigger: `precio_cambio_notify`

Detecta cambios en las tablas de precios y envía notificaciones al canal `precio_cambio`.

**Tablas monitoreadas:**
- `lista_precios_has_prueba` (pruebas individuales)
- `lista_precios_has_gprueba` (grupos/perfiles)

**Eventos detectados:**
- `INSERT` - Nuevos precios
- `UPDATE` - Modificación de precios
- `DELETE` - Eliminación de precios

**Payload de notificación:**
```json
{
  "tabla": "lista_precios_has_prueba",
  "operacion": "UPDATE",
  "timestamp": "2025-10-22T11:36:21.478579-06:00",
  "registro_id": 1536,
  "usuario": "labsis",
  "lista_precios_id": 27
}
```

**Verificar triggers instalados:**
```sql
SELECT
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE trigger_name LIKE '%precio_cambio%';
```

---

### 2. Backend API (Express + Node.js)

**Ubicación:** `/Users/samuelquiroz/Documents/proyectos/Test-Directory-EG/laboratorio-eg/server/`
**Puerto:** 3001
**URL:** http://localhost:3001

#### Características:

1. **PostgreSQL Listener** (`server/config/pg-listener.js`)
   - Escucha el canal `precio_cambio`
   - Invalida cache automáticamente
   - Reconexión automática en caso de fallo

2. **Cache Management**
   - NodeCache en memoria
   - TTL: 600s (pruebas), 1800s (grupos)
   - Invalidación selectiva por tipo de cambio

3. **API Endpoints**
   - `GET /api/pruebas` - Lista de pruebas con precios
   - `GET /api/grupos` - Lista de grupos con precios
   - `GET /api/grupos/:id` - Detalle de grupo con precio correcto
   - `POST /api/cache/flush` - Limpiar cache manualmente

#### Configuración de precios correctos:

**Archivo modificado:** `server/models/index.js`

Método `findByIdWithPruebas()` ahora obtiene precios desde `lista_precios_has_gprueba`:

```javascript
async findByIdWithPruebas(id, listaPreciosId = 27) {
  const groupQuery = `
    SELECT
      gp.*,
      COALESCE(lpg.precio, gp.precio) as precio_lista
    FROM grupo_prueba gp
    LEFT JOIN lista_precios_has_gprueba lpg
      ON gp.id = lpg.gprueba_id
      AND lpg.lista_precios_id = $2
    WHERE gp.id = $1 AND gp.activa = true
  `;

  const grupo = groupResult.rows[0];
  return {
    ...grupo,
    precio: grupo.precio_lista, // Usa precio de lista_precios_id=27
    pruebas: pruebasResult.rows,
    // ...
  };
}
```

#### Headers anti-cache:

```javascript
const noCacheMiddleware = (req, res, next) => {
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  next();
};
```

Aplicado a endpoints:
- `/api/pruebas`
- `/api/grupos`
- `/api/grupos/:id`

---

### 3. Sync Service (Node.js)

**Ubicación:** `/Users/samuelquiroz/Documents/proyectos/Test-Directory-EG/sync-service/`
**Puerto:** 3002
**URL:** http://localhost:3002

#### Características:

1. **PostgreSQL Listener** (`src/services/postgres-listener.js`)
   - Escucha canal `precio_cambio`
   - Debounce de 2 segundos (agrupa múltiples cambios)
   - Trigger automático de sincronización

2. **Generador de JSON** (`src/services/sync-service.js`)
   - Consulta completa a base de datos
   - 349 pruebas + 164 grupos = 513 estudios
   - Formato optimizado para frontend

3. **Auto-copy a proyecto web** (`src/storage/file-service.js`)
   - Copia automática a `/laboratorio-eg/public/data/precios.json`
   - Sin necesidad de intervención manual
   - Verificación de integridad

#### Configuración (.env):

```env
# Base de datos
LABSIS_HOST=localhost
LABSIS_PORT=5432
LABSIS_DB=labsisEG
LABSIS_USER=labsis
LABSIS_PASSWORD=labsis

# Lista de precios
LISTA_PRECIOS_ID=27

# Debounce (milisegundos)
DEBOUNCE_MS=2000

# Auto-copy a proyecto web
AUTO_COPY_TO_WEB=true
WEB_PROJECT_PATH=/Users/samuelquiroz/Documents/proyectos/Test-Directory-EG/laboratorio-eg/public/data

# Auto-copy a servidor remoto (desactivado en local)
AUTO_COPY_TO_REMOTE=false

# Servidor HTTP
HTTP_PORT=3002
```

#### Queries SQL:

**Pruebas individuales:**
```sql
SELECT
  p.id,
  p.nomenclatura as codigo,
  p.nombre,
  lpp.precio,
  -- ... más campos
FROM prueba p
INNER JOIN lista_precios_has_prueba lpp
  ON p.id = lpp.prueba_id
  AND lpp.lista_precios_id = 27
WHERE p.activa = true
ORDER BY p.nombre ASC
```

**Grupos de pruebas:**
```sql
SELECT
  gp.id,
  gp.codigo_caja as codigo,
  gp.nombre,
  lpg.precio,
  -- ... más campos
FROM grupo_prueba gp
INNER JOIN lista_precios_has_gprueba lpg
  ON gp.id = lpg.gprueba_id
  AND lpg.lista_precios_id = 27
WHERE gp.activa = true
ORDER BY gp.nombre ASC
```

---

### 4. Frontend (React + Vite)

**Ubicación:** `/Users/samuelquiroz/Documents/proyectos/Test-Directory-EG/laboratorio-eg/`
**Puerto:** 5173
**URL:** http://localhost:5173

#### Características:

1. **Hook personalizado** (`src/hooks/useLabDataDB.js`)
   - Lee JSON estático desde `/data/precios.json`
   - Cache en localStorage
   - Búsqueda en memoria (sin llamadas a API)

2. **Lectura del JSON:**
```javascript
const response = await fetch('/data/precios.json');
const jsonData = await response.json();
```

3. **Estructura del JSON:**
```json
{
  "metadata": {
    "version": "2.0.0",
    "fechaSincronizacion": "2025-10-22T17:54:40.123Z",
    "totalEstudios": 513,
    "totalPruebas": 349,
    "totalGrupos": 164,
    "listaPreciosId": 27
  },
  "estudios": [
    {
      "id": 1,
      "nombre": "Hematología Completa",
      "tipo_item": "grupo",
      "precio": 10.00,
      "codigo": "1001",
      "categoria": null,
      "activo": true,
      "pruebas": [...]
    }
  ]
}
```

---

## Flujo Completo de Sincronización

### Paso a Paso:

1. **Usuario modifica precio en Labsis**
   ```sql
   UPDATE lista_precios_has_gprueba
   SET precio = 10.00
   WHERE gprueba_id = 1 AND lista_precios_id = 27;
   ```

2. **Trigger PostgreSQL dispara NOTIFY**
   ```
   NOTIFY precio_cambio, '{"tabla":"lista_precios_has_gprueba",...}'
   ```

3. **Backend API recibe notificación**
   - PostgreSQL Listener detecta el cambio
   - Invalida cache de grupos
   - Log: `🗑️ Invalidando caché por cambio en "lista_precios_has_gprueba"`

4. **Sync Service recibe notificación**
   - PostgreSQL Listener detecta el cambio
   - Log: `🔔 Notificación recibida {"canal":"precio_cambio",...}`
   - Espera 2 segundos (debounce) para agrupar cambios

5. **Sync Service regenera JSON**
   - Log: `⏱️ Debounce completado (2000ms), iniciando sincronización...`
   - Consulta 349 pruebas + 164 grupos
   - Genera JSON de ~1.2MB
   - Guarda en `/sync-service/output/precios.json`

6. **Auto-copy a proyecto web**
   - Log: `📋 JSON copiado a proyecto web`
   - Copia a `/laboratorio-eg/public/data/precios.json`
   - Disponible en http://localhost:5173/data/precios.json

7. **Usuario refresca navegador**
   - Presiona Cmd+Shift+R (Mac) o Ctrl+Shift+R (Windows)
   - Frontend lee nuevo JSON
   - Muestra precios actualizados

### Tiempos de propagación:

- Trigger → NOTIFY: **Instantáneo** (~1ms)
- NOTIFY → Listeners: **Instantáneo** (~1-5ms)
- Backend cache invalidation: **Instantáneo** (~1ms)
- Sync Service debounce: **2 segundos** (configurable)
- Generación de JSON: **50-100ms**
- Copia a web: **1-5ms**
- **Total: ~2.1 segundos** desde cambio hasta JSON disponible

---

## Comandos de Operación

### Iniciar servicios:

```bash
# Backend + Frontend
cd /Users/samuelquiroz/Documents/proyectos/Test-Directory-EG/laboratorio-eg
npm run dev:all

# Sync Service
cd /Users/samuelquiroz/Documents/proyectos/Test-Directory-EG/sync-service
npm run dev
```

### Sincronización manual (si es necesario):

```bash
cd /Users/samuelquiroz/Documents/proyectos/Test-Directory-EG/sync-service
node scripts/manual-sync.js
cp output/precios.json ../laboratorio-eg/public/data/precios.json
```

### Verificar servicios corriendo:

```bash
# Frontend
curl -I http://localhost:5173

# Backend API
curl http://localhost:3001/api/statistics

# Sync Service
curl http://localhost:3002

# PostgreSQL
psql -h localhost -U labsis -d labsisEG -c "SELECT version();"
```

### Verificar listeners activos:

```bash
# Ver procesos escuchando en PostgreSQL
psql -h localhost -U labsis -d labsisEG -c "
  SELECT pid, application_name, state, query
  FROM pg_stat_activity
  WHERE query LIKE '%LISTEN%';
"
```

### Limpiar cache manualmente:

```bash
# Backend API cache
curl -X POST http://localhost:3001/api/cache/flush

# Frontend localStorage
# En DevTools del navegador:
# localStorage.removeItem('labdata_cache');
```

---

## Monitoreo y Logs

### Backend API logs:

```
✅ PostgreSQL Listener conectado y escuchando canal "precio_cambio"
🔔 Notificación recibida en canal "precio_cambio"
📦 Payload: {"tabla":"lista_precios_has_gprueba","operacion":"UPDATE",...}
🗑️ Invalidando caché por cambio en "lista_precios_has_gprueba"
Cache invalidated: 0 keys matching "grupos"
✅ Caché de grupos invalidado
```

### Sync Service logs:

```
✅ Escuchando canal 'precio_cambio' {"debounce":"2000ms"}
🔔 Notificación recibida {"canal":"precio_cambio","tabla":"lista_precios_has_gprueba"}
⏱️ Debounce completado (2000ms), iniciando sincronización...
📊 Consultando base de datos labsisEG...
✅ 349 pruebas y 164 grupos obtenidos
💾 JSON guardado localmente {"path":"...","size":"1239.51 KB"}
📋 JSON copiado a proyecto web {"destination":"..."}
✅ Sincronización completada exitosamente {"duracion":"97ms","estudios":513}
```

---

## Troubleshooting

### Problema: JSON no se actualiza automáticamente

**Verificar:**
1. Sync Service está corriendo en puerto 3002
2. AUTO_COPY_TO_WEB=true en `.env`
3. WEB_PROJECT_PATH apunta al directorio correcto
4. Permisos de escritura en `/laboratorio-eg/public/data/`

**Solución:**
```bash
cd /Users/samuelquiroz/Documents/proyectos/Test-Directory-EG/sync-service
# Verificar configuración
cat .env | grep -E "AUTO_COPY|WEB_PROJECT"

# Reiniciar sync-service
pkill -f "sync-service"
npm run dev
```

### Problema: Cache del backend no se invalida

**Verificar:**
1. Backend tiene PostgreSQL Listener activo
2. Triggers de PostgreSQL están instalados
3. Canal de notificación es correcto (`precio_cambio`)

**Solución:**
```bash
# Verificar triggers
psql -h localhost -U labsis -d labsisEG -c "
  SELECT trigger_name, event_object_table
  FROM information_schema.triggers
  WHERE trigger_name LIKE '%precio_cambio%';
"

# Verificar listener en backend logs
# Buscar: "✅ PostgreSQL Listener conectado"

# Reiniciar backend
cd /Users/samuelquiroz/Documents/proyectos/Test-Directory-EG/laboratorio-eg
pkill -f "node server/index.js"
npm run server
```

### Problema: Frontend muestra precios antiguos

**Causa:** Cache del navegador

**Solución:**
1. Hard refresh: **Cmd+Shift+R** (Mac) o **Ctrl+Shift+R** (Windows)
2. Limpiar localStorage:
   ```javascript
   // En DevTools Console:
   localStorage.removeItem('labdata_cache');
   location.reload();
   ```
3. Desactivar cache en DevTools → Network → Disable cache

### Problema: Conflicto de puertos

**Síntoma:** `EADDRINUSE: address already in use`

**Solución:**
```bash
# Matar procesos en puerto específico
lsof -ti:3001 | xargs kill -9  # Backend
lsof -ti:3002 | xargs kill -9  # Sync Service
lsof -ti:5173 | xargs kill -9  # Frontend

# Reiniciar servicios
npm run dev:all
```

---

## Testing del Sistema

### Test 1: Actualización de precio de grupo

```bash
# 1. Actualizar precio
psql -h localhost -U labsis -d labsisEG -c "
  UPDATE lista_precios_has_gprueba
  SET precio = 15.00
  WHERE gprueba_id = 1 AND lista_precios_id = 27;
"

# 2. Esperar 2-3 segundos (debounce)

# 3. Verificar JSON
curl -s http://localhost:5173/data/precios.json | \
  python3 -c "import sys, json; data = json.load(sys.stdin); \
  hema = [e for e in data['estudios'] if e['id'] == 1]; \
  print(f'Precio: ${hema[0][\"precio\"]}' if hema else 'No encontrado')"

# 4. Verificar API
curl -s http://localhost:3001/api/grupos/1 | \
  python3 -c "import sys, json; data = json.load(sys.stdin); \
  print(f'Precio: ${data[\"data\"][\"precio\"]}')"
```

### Test 2: Actualización de precio de prueba

```bash
# 1. Actualizar precio de prueba
psql -h localhost -U labsis -d labsisEG -c "
  UPDATE lista_precios_has_prueba
  SET precio = 5.00
  WHERE prueba_id = 62 AND lista_precios_id = 27;
"

# 2. Esperar 2-3 segundos

# 3. Verificar cambios (similar al Test 1)
```

### Test 3: Múltiples cambios (debounce)

```bash
# 1. Hacer varios cambios rápidos
psql -h localhost -U labsis -d labsisEG -c "
  UPDATE lista_precios_has_gprueba SET precio = 10.00 WHERE gprueba_id = 1;
  UPDATE lista_precios_has_gprueba SET precio = 11.00 WHERE gprueba_id = 2;
  UPDATE lista_precios_has_gprueba SET precio = 12.00 WHERE gprueba_id = 3;
"

# 2. Observar logs del sync-service
# Debería ver UNA sola sincronización después de 2 segundos
# (agrupa los 3 cambios en una sincronización)
```

---

## Configuración de Producción

### Recomendaciones:

1. **Aumentar debounce en producción:**
   ```env
   DEBOUNCE_MS=5000  # 5 segundos en producción
   ```

2. **Activar auto-copy a servidor remoto:**
   ```env
   AUTO_COPY_TO_REMOTE=true
   REMOTE_HOST=52.55.189.120
   REMOTE_USER=dynamtek
   REMOTE_KEY_PATH=/path/to/key.pem
   REMOTE_PATH=/path/to/production/data/precios.json
   ```

3. **Configurar SSL para PostgreSQL:**
   ```env
   DB_SSL=true
   ```

4. **Usar PM2 para procesos:**
   ```bash
   # Backend
   pm2 start server/index.js --name laboratorio-backend

   # Sync Service
   pm2 start sync-service/src/index.js --name laboratorio-sync
   ```

5. **Configurar Nginx para cache del JSON:**
   ```nginx
   location /data/precios.json {
       add_header Cache-Control "public, max-age=60";
       add_header Last-Modified $date_gmt;
   }
   ```

---

## Archivos Clave Modificados

### Backend API:

1. **`server/config/pg-listener.js`** (NUEVO)
   - PostgreSQL LISTEN/NOTIFY client
   - Invalidación automática de cache

2. **`server/models/index.js`**
   - Método `findByIdWithPruebas()` modificado
   - JOIN con `lista_precios_has_gprueba`
   - Usa `precio_lista` de lista_precios_id=27

3. **`server/routes/api.js`**
   - Headers anti-cache en endpoints
   - Middleware `noCacheMiddleware`

4. **`server/index.js`**
   - Inicialización de PostgreSQL Listener
   - Graceful shutdown

### Sync Service:

1. **`.env`**
   - `AUTO_COPY_TO_WEB=true`
   - `WEB_PROJECT_PATH=/path/to/laboratorio-eg/public/data`

2. **`src/services/postgres-listener.js`**
   - LISTEN al canal `precio_cambio`
   - Debounce de 2 segundos
   - Trigger automático de sincronización

3. **`src/storage/file-service.js`**
   - Auto-copy a proyecto web
   - Función `copyToWebProject()`

---

## Métricas del Sistema

### Performance:

- **Generación de JSON:** 50-100ms (513 estudios)
- **Tamaño del JSON:** ~1.2 MB
- **Debounce:** 2 segundos (configurable)
- **Propagación total:** ~2.1 segundos (desde DB hasta JSON)

### Base de datos:

- **Pruebas activas:** 349
- **Grupos activos:** 164
- **Total estudios:** 513
- **Lista de precios:** ID 27 (Ambulatorio_Abril_2025)

### Recursos:

- **Backend API:** ~50MB RAM
- **Sync Service:** ~60MB RAM
- **Frontend (Vite):** ~40MB RAM
- **PostgreSQL connections:** 2 (backend + sync-service)

---

## Contacto y Soporte

**Proyecto:** Laboratorio EG - Sistema de Sincronización de Precios
**Fecha:** 22 de Octubre, 2025
**Stack:** Node.js, Express, PostgreSQL, React, Vite

**Servicios:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Sync Service: http://localhost:3002

**Base de datos:** labsisEG (PostgreSQL 14.18)

---

## Próximos Pasos

### Mejoras sugeridas:

1. **WebSocket para frontend:**
   - Notificar cambios en tiempo real sin refresh
   - Actualización automática de precios en pantalla

2. **Dashboard de monitoreo:**
   - Ver sincronizaciones en tiempo real
   - Historial de cambios de precios
   - Métricas de performance

3. **Tests automatizados:**
   - Tests de integración del flujo completo
   - Tests unitarios de componentes
   - Tests de carga del sistema

4. **Backup automático:**
   - Versionar JSONs generados
   - Backup antes de cada sincronización
   - Rollback en caso de error

5. **Alertas:**
   - Notificar si sync-service falla
   - Alertar cambios de precio >50%
   - Monitoreo de salud del sistema

---

**FIN DE LA DOCUMENTACIÓN**
