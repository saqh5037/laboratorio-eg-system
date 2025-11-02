# 📊 Resumen del Sistema de Sincronización Automática - LOCAL

**Fecha:** 19 de Octubre, 2025
**Proyecto:** Laboratorio EG - Sistema de Sincronización de Precios
**Versión:** 1.0
**Estado:** ✅ **COMPLETADO Y FUNCIONAL**

---

## 🎯 Objetivo

Implementar un sistema de sincronización automática que detecte cambios en la base de datos PostgreSQL de labsisEG y actualice un archivo JSON **LOCAL** en **tiempo real (2-5 segundos)**, sin necesidad de intervención manual ni servicios en la nube.

---

## 🏗️ Arquitectura Implementada

```
PostgreSQL labsisEG (4 tablas con triggers)
         ↓
   NOTIFY/LISTEN
         ↓
   sync-service (Node.js)
         ↓
  Filesystem Local (JSON)
         ↓
   HTTP Server (Express)
         ↓
   React App (laboratorio-eg)
```

**SIN AWS S3** - Todo funciona localmente

---

## 📂 Estructura de Archivos Creados

```
Test-Directory-EG/
├── sync-service/                    ✅ COMPLETADO
│   ├── package.json                 (Node.js dependencies - SIN AWS)
│   ├── .env.example                 (Variables de configuración)
│   ├── .env                         (Configuración local)
│   ├── .gitignore
│   ├── README.md
│   │
│   ├── database/
│   │   └── triggers-labsis.sql      ✅ 4 triggers instalados
│   │
│   ├── scripts/
│   │   ├── verify-database.js       ✅ Script de verificación
│   │   └── manual-sync.js           ✅ Sincronización manual
│   │
│   └── src/
│       ├── config.js                ✅ Configuración centralizada
│       ├── index.js                 ✅ Entry point principal
│       │
│       ├── database/
│       │   ├── connection.js        ✅ Pool de PostgreSQL
│       │   └── queries.js           ✅ Queries (pruebas + grupos)
│       │
│       ├── services/
│       │   ├── postgres-listener.js ✅ LISTEN/NOTIFY
│       │   ├── sync-service.js      ✅ Orquestador principal
│       │   └── data-transformer.js  ✅ Transform a JSON
│       │
│       ├── storage/
│       │   └── file-service.js      ✅ Guardar archivo local
│       │
│       ├── http/
│       │   ├── server.js            ✅ Servidor Express
│       │   └── routes/
│       │       └── api.js           ✅ API endpoints
│       │
│       └── utils/
│           └── logger.js            ✅ Winston logger
│
└── docs/                            ✅
    ├── arquitectura-sincronizacion.excalidraw
    └── RESUMEN_SINCRONIZACION.md
```

---

## 🔧 Componentes Técnicos

### 1. **Triggers de PostgreSQL (4 triggers)**

| Trigger | Tabla | Detecta |
|---------|-------|---------|
| `trigger_precios_cambio` | `prueba` | Cambios en estudios individuales |
| `trigger_grupos_cambio` | `grupo_prueba` | Cambios en grupos/perfiles |
| `trigger_precio_prueba_cambio` | `lista_precios_has_prueba` | Cambios de precio en estudios |
| `trigger_precio_grupo_cambio` | `lista_precios_has_gprueba` | Cambios de precio en grupos |

**Función:** `notificar_cambio_precios()`
- Envía `NOTIFY 'precio_cambio'` con datos JSON
- Manejo robusto de errores (no interrumpe transacciones)
- Incluye metadata: tabla, operación, timestamp, usuario

### 2. **Servicio de Sincronización (Node.js)**

**Tecnologías:**
- Node.js 22.16.0
- PostgreSQL driver (`pg` 8.13.1)
- Express 4.21.2 (HTTP Server)
- Winston 3.17.0 (Logging)
- Dotenv (Configuración)
- **SIN AWS SDK**

**Funcionalidades:**
- ✅ Escucha LISTEN/NOTIFY en tiempo real
- ✅ Query paralela a PostgreSQL (pruebas + grupos con Promise.all())
- ✅ Debounce de 2 segundos para agrupar cambios
- ✅ Transformación a JSON con metadata
- ✅ Almacenamiento en filesystem local
- ✅ Auto-copy a proyecto React
- ✅ API HTTP RESTful
- ✅ Logging detallado con rotación diaria
- ✅ Graceful shutdown
- ✅ Retry logic con exponential backoff

---

## 📊 Estadísticas Reales del Sistema

**Base de datos:** labsisEG
**Lista de precios:** ID 27 - "Ambulatorio_Abril_2025"

```
Total estudios sincronizados: 511
├── Pruebas individuales: 348
└── Grupos/Perfiles: 163

Tamaño del JSON: ~160 KB
Tiempo de sincronización: 20-50ms
Moneda: USD
```

---

## 📊 Estructura del JSON Generado

```json
{
  "estudios": [
    {
      "id": 1042,
      "codigo": "17 HIDROPROGEST",
      "nombre": "17 HIDROXIPROGESTERONA",
      "categoria": "Hormonas",
      "precio": 25,
      "descripcion": "",
      "requiereAyuno": false,
      "tiempoEntrega": 7,
      "activo": true,
      "fechaActualizacion": "2025-10-19T04:21:19.121Z"
    },
    {
      "id": 907,
      "codigo": "25(OH)VD-T",
      "nombre": "25 (OH)VITAMINA D (TOTAL)",
      "categoria": "Hormonas",
      "precio": 25,
      "descripcion": "",
      "requiereAyuno": false,
      "tiempoEntrega": 1,
      "activo": true,
      "fechaActualizacion": "2025-10-19T04:21:19.121Z"
    }
    // ... 509 estudios más
  ],
  "metadata": {
    "totalEstudios": 511,
    "totalPruebas": 348,
    "totalGrupos": 163,
    "listaPreciosId": 27,
    "fechaSincronizacion": "2025-10-19T04:21:19.122Z",
    "version": "1.0",
    "moneda": "USD"
  }
}
```

**Campos incluidos por estudio:**
- `id`, `codigo`, `nombre` - Identificación
- `categoria` - Categoría del estudio
- `precio` - Precio en USD
- `descripcion` - Descripción detallada
- `requiereAyuno` - Boolean
- `tiempoEntrega` - Días de entrega
- `activo` - Estado del estudio
- `fechaActualizacion` - Timestamp ISO 8601

---

## ⚡ Flujo de Sincronización Detallado

### Escenario: Usuario actualiza precio de un estudio en labsisEG

```
1. Usuario ejecuta en labsisEG:
   UPDATE lista_precios_has_prueba
   SET precio = 450.00
   WHERE prueba_id = 123 AND lista_precios_id = 27;

2. Trigger se dispara automáticamente:
   trigger_precio_prueba_cambio()

3. Función notificar_cambio_precios():
   - Construye objeto JSON con metadata
   - Envía NOTIFY al canal 'precio_cambio'

4. postgres-listener.js escucha y recibe notificación
   - Registra el cambio en logs
   - Inicia debounce timer de 2 segundos

5. Después del debounce, sync-service ejecuta:
   - Query 1: SELECT pruebas (lista_precios_id = 27) → 348 rows
   - Query 2: SELECT grupos (lista_precios_id = 27) → 163 rows
   - Ambas queries en paralelo con Promise.all()

6. data-transformer.js procesa los datos:
   - Combina pruebas + grupos
   - Genera metadata (totales, timestamp, versión)
   - Retorna objeto JSON completo

7. file-service.js guarda el archivo:
   - Crea directorio ./output si no existe
   - Guarda ./output/precios.json (160 KB)
   - Si AUTO_COPY_TO_WEB=true:
     → Copia a laboratorio-eg/public/data/precios.json

8. HTTP Server sirve el archivo:
   - Disponible en http://localhost:3001/api/precios.json
   - Endpoint /api/stats muestra estadísticas
   - CORS habilitado para React

9. React App consume los datos:
   - Opción 1: fetch('/data/precios.json') (archivo local)
   - Opción 2: fetch('http://localhost:3001/api/precios.json')
   - Actualiza UI con nuevos precios

⏱️ Tiempo total: 2-5 segundos
```

---

## 🚀 Instalación y Configuración

### 1. Instalar Triggers en PostgreSQL

```bash
cd /Users/samuelquiroz/Documents/proyectos/Test-Directory-EG/sync-service

# Conectar a PostgreSQL
PGPASSWORD=labsis psql -h localhost -U labsis -d labsisEG -f database/triggers-labsis.sql
```

### 2. Configurar sync-service

```bash
cd /Users/samuelquiroz/Documents/proyectos/Test-Directory-EG/sync-service

# Instalar dependencias
npm install

# Copiar configuración
cp .env.example .env

# Editar .env con tus credenciales
nano .env
```

**Variables requeridas en `.env`:**

```bash
# PostgreSQL labsisEG
LABSIS_HOST=localhost
LABSIS_PORT=5432
LABSIS_DB=labsisEG
LABSIS_USER=labsis
LABSIS_PASSWORD=tu_password

# Sincronización
LISTA_PRECIOS_ID=27
DEBOUNCE_MS=2000

# Storage Local
OUTPUT_PATH=./output
OUTPUT_FILENAME=precios.json

# Auto-copy a React
AUTO_COPY_TO_WEB=true
WEB_PROJECT_PATH=/Users/.../laboratorio-eg/public/data

# HTTP Server
HTTP_PORT=3001

# Logging
LOG_LEVEL=info
LOG_DIRECTORY=./logs
```

### 3. Verificar Conexión

```bash
npm run verify-db
```

**Salida esperada:**
```
🔍 VERIFICACIÓN DE BASE DE DATOS LABSIS
✅ Conectado exitosamente a labsisEG
✅ Tablas encontradas: 6/6
✅ Lista de precios ID 27 encontrada
📊 Total en lista: 511 estudios (348 pruebas + 163 grupos)
✅ Triggers instalados: 4/4
✅ Verificación completada exitosamente
```

### 4. Ejecutar Sincronización Manual

```bash
npm run manual-sync
```

**Salida esperada:**
```
🔄 Sincronización manual iniciada

✅ Sincronización completada exitosamente
   Estudios: 511
   Archivo: /path/to/output/precios.json
   Tamaño: 160.62 KB
   Duración: 44ms
```

### 5. Iniciar Servicio

```bash
# Desarrollo (con hot reload)
npm run dev

# Producción (TODO - crear systemd service)
npm start
```

**Logs esperados:**
```
============================================================
🚀 Laboratorio EG - Sistema de Sincronización
============================================================

✅ Configuración válida
📋 Configuración:
   Base de datos: labsisEG
   Lista de precios: ID 27
   Archivo salida: ./output/precios.json
   HTTP Puerto: 3001

✅ Conexión a PostgreSQL exitosa
✅ 511 estudios sincronizados
🌐 Servidor HTTP iniciado en puerto 3001
   📍 http://localhost:3001

✅ Escuchando canal 'precio_cambio' (debounce: 2000ms)

============================================================
✨ Sistema listo
============================================================
```

---

## 🌐 API HTTP Endpoints

### `GET /health`
Estado del servicio

**Ejemplo:**
```bash
curl http://localhost:3001/health
```

**Respuesta:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-19T04:21:41.646Z",
  "service": "laboratorio-eg-sync-service",
  "version": "1.0.0"
}
```

### `GET /api/precios.json`
Obtener JSON completo con todos los precios

**Ejemplo:**
```bash
curl http://localhost:3001/api/precios.json
```

**Respuesta:** JSON con 511 estudios (~160 KB)

### `GET /api/stats`
Estadísticas en tiempo real

**Ejemplo:**
```bash
curl http://localhost:3001/api/stats
```

**Respuesta:**
```json
{
  "sync": {
    "isSyncing": false,
    "lastSyncTime": "2025-10-19T04:21:19.124Z",
    "syncCount": 1
  },
  "listener": {
    "isListening": true,
    "channel": "precio_cambio",
    "hasPendingSync": false
  },
  "file": {
    "exists": true,
    "size": 164471,
    "sizeKB": "160.62"
  },
  "data": {
    "totalEstudios": 511,
    "metadata": {
      "totalPruebas": 348,
      "totalGrupos": 163
    }
  }
}
```

### `POST /api/sync`
Forzar sincronización manual

**Ejemplo:**
```bash
curl -X POST http://localhost:3001/api/sync
```

### `GET /api/config`
Ver configuración actual

---

## ✅ Verificación del Sistema

### 1. Verificar triggers activos

```sql
SELECT
  tgname,
  tgrelid::regclass as tabla,
  tgenabled
FROM pg_trigger
WHERE tgname IN (
  'trigger_precios_cambio',
  'trigger_grupos_cambio',
  'trigger_precio_prueba_cambio',
  'trigger_precio_grupo_cambio'
);
```

**Resultado esperado:** 4 triggers con `tgenabled = 'O'`

### 2. Probar trigger manualmente

```sql
-- Hacer un cambio de prueba
UPDATE prueba SET nombre = 'Test - ' || nombre WHERE id = 1;

-- El sistema debería detectar el cambio y sincronizar automáticamente
-- Verifica los logs:
```

```bash
tail -f logs/combined-$(date +%Y-%m-%d).log
```

**Logs esperados:**
```
[2025-10-19 22:21:19] info: 🔔 Notificación recibida {"canal":"precio_cambio"}
[2025-10-19 22:21:21] info: ✅ 511 estudios obtenidos de labsisEG
[2025-10-19 22:21:21] info: ✅ Sincronización completada exitosamente
```

### 3. Verificar archivo JSON generado

```bash
ls -lh output/precios.json
cat output/precios.json | jq '.metadata'
```

**Salida esperada:**
```json
{
  "totalEstudios": 511,
  "totalPruebas": 348,
  "totalGrupos": 163,
  "listaPreciosId": 27,
  "fechaSincronizacion": "2025-10-19T04:21:19.122Z",
  "version": "1.0",
  "moneda": "USD"
}
```

---

## 📈 Métricas y Monitoreo

### Ver estadísticas en vivo

```bash
# Opción 1: HTTP API
curl http://localhost:3001/api/stats | jq

# Opción 2: Logs
tail -f logs/sync-$(date +%Y-%m-%d).log

# Opción 3: Verificar archivo
ls -lh output/precios.json
```

### Logs del sistema

```bash
# Ver todos los logs
tail -f logs/combined-$(date +%Y-%m-%d).log

# Ver solo errores
tail -f logs/error-$(date +%Y-%m-%d).log

# Ver solo sincronizaciones
tail -f logs/sync-$(date +%Y-%m-%d).log
```

---

## 🔧 Mantenimiento

### Limpiar logs antiguos

```bash
# Eliminar logs de más de 14 días
find logs/ -name "*.log" -mtime +14 -delete

# TODO: Crear script clean.sh automatizado
```

### Re-sincronizar manualmente

```bash
# Sincronización única
npm run manual-sync

# O vía API
curl -X POST http://localhost:3001/api/sync
```

### Reiniciar servicio

```bash
# Detener servicio (Ctrl+C)
# Iniciar nuevamente
npm run dev
```

---

## 🎯 Integración con React App

### Opción 1: Consumir archivo local (recomendado)

```javascript
// src/hooks/usePrecios.js
import { useState, useEffect } from 'react';

export function usePrecios() {
  const [estudios, setEstudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/data/precios.json')
      .then(res => res.json())
      .then(data => {
        setEstudios(data.estudios);
        console.log(`✅ ${data.metadata.totalEstudios} estudios cargados`);
      })
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return { estudios, loading, error };
}
```

### Opción 2: Consumir desde API HTTP

```javascript
// Con polling cada 5 minutos
useEffect(() => {
  const fetchPrecios = async () => {
    const res = await fetch('http://localhost:3001/api/precios.json');
    const data = await res.json();
    setEstudios(data.estudios);
  };

  fetchPrecios();
  const interval = setInterval(fetchPrecios, 5 * 60 * 1000);

  return () => clearInterval(interval);
}, []);
```

### Opción 3: Verificar cambios antes de recargar

```javascript
// Optimización: solo recargar si hay cambios
const [lastSync, setLastSync] = useState(null);

useEffect(() => {
  const checkUpdates = async () => {
    const res = await fetch('http://localhost:3001/api/stats');
    const stats = await res.json();

    if (stats.sync.lastSyncTime !== lastSync) {
      // Hay cambios, recargar JSON
      const data = await fetch('/data/precios.json').then(r => r.json());
      setEstudios(data.estudios);
      setLastSync(stats.sync.lastSyncTime);
    }
  };

  checkUpdates();
  const interval = setInterval(checkUpdates, 30 * 1000); // cada 30 seg

  return () => clearInterval(interval);
}, [lastSync]);
```

---

## 🎓 Tecnologías Utilizadas

| Componente | Tecnología | Versión |
|------------|------------|---------|
| Base de Datos | PostgreSQL | 14.18 |
| Backend | Node.js | 22.16.0 |
| DB Driver | pg | 8.13.1 |
| HTTP Server | Express | 4.21.2 |
| Logging | Winston | 3.17.0 |
| Storage | **Local Filesystem** | - |
| Frontend | React | 19.1.1 |
| Build Tool | Vite | 7.1.2 |

**NOTA:** ⚠️ **SIN AWS SDK** - Sistema 100% local

---

## 📚 Documentación Adicional

- **[sync-service/README.md](../sync-service/README.md)** - Documentación detallada del servicio
- **[database/triggers-labsis.sql](../sync-service/database/triggers-labsis.sql)** - Código de los triggers
- **[arquitectura-sincronizacion.excalidraw](./arquitectura-sincronizacion.excalidraw)** - Diagrama visual

---

## 🔄 Estado Actual vs Planificado

### ✅ Completado

1. ✅ Estructura de archivos creada
2. ✅ Queries actualizadas (pruebas + grupos en paralelo)
3. ✅ 4 triggers implementados en labsisEG
4. ✅ Configuración centralizada sin AWS
5. ✅ LISTEN/NOTIFY funcionando
6. ✅ Sistema de sincronización completo
7. ✅ Almacenamiento en filesystem local
8. ✅ API HTTP RESTful
9. ✅ Logging con Winston
10. ✅ Auto-copy a React App
11. ✅ Sistema probado y funcional

### ⏳ Pendiente (Opcional)

- [ ] Script `status.sh` para monitoreo
- [ ] Script `clean.sh` para limpieza de logs
- [ ] Servicio systemd para producción
- [ ] Dashboard de métricas (Prometheus + Grafana)
- [ ] Alertas automáticas (Slack/Email)

---

## 👥 Créditos

**Proyecto:** Laboratorio EG
**Desarrollado por:** Claude AI + Samuel Quiroz
**Fecha:** Octubre 2025
**Versión:** 1.0

---

## 📝 Notas Importantes

- ✅ **SIN AWS S3** - Todo es almacenamiento local en filesystem
- ✅ Los triggers NO interrumpen operaciones de BD aunque fallen
- ✅ Debounce de 2 segundos agrupa múltiples cambios en uno solo
- ✅ Sistema idempotente (puede ejecutarse múltiples veces sin efectos secundarios)
- ✅ Compatible con PostgreSQL 12+
- ✅ No requiere extensiones adicionales de PostgreSQL
- ✅ Logs con rotación diaria (se mantienen 14 días)
- ⚠️ Verificar que AUTO_COPY_TO_WEB apunte a la ruta correcta de laboratorio-eg
- ⚠️ Puerto 3001 debe estar disponible para HTTP server
- ⚠️ En producción, considerar usar PM2 o systemd para mantener el servicio corriendo

---

## 🚀 Diferencias con Arquitectura AWS

| Aspecto | Arquitectura AWS (Planificada) | Arquitectura LOCAL (Implementada) |
|---------|--------------------------------|-----------------------------------|
| Storage | AWS S3 Bucket | Filesystem local + HTTP |
| Credenciales | AWS Access Key + Secret | No requiere |
| Costo | Pago por uso | Gratis |
| Latencia | ~100-500ms | ~20-50ms |
| Disponibilidad | 99.99% SLA | Depende del servidor |
| Acceso | URL pública S3 | http://localhost:3001 |
| Deploy | Más complejo | Simple (npm run dev) |
| Dependencias | @aws-sdk/client-s3 | Ninguna extra |

**Decisión:** Se implementó arquitectura LOCAL por:
- ✅ Más simple
- ✅ Sin costos
- ✅ Más rápido
- ✅ Desarrollo local
- ✅ DevOps manejará deploy a producción

---

**Última actualización:** 19 de Octubre, 2025
**Estado:** ✅ **COMPLETADO Y OPERACIONAL**
