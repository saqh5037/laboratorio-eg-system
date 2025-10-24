# Diagrama de Flujo - Sistema de Sincronización Automática

## Vista General del Sistema

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                     LABORATORIO EG - ARQUITECTURA                       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘


          USUARIO                    BASE DE DATOS                SERVICIOS
             │                            │                           │
             │                            │                           │
             ▼                            ▼                           ▼
    ┌─────────────────┐        ┌──────────────────┐       ┌──────────────────┐
    │                 │        │                  │       │                  │
    │  LABSIS (LIS)   │───────▶│  PostgreSQL      │───────│  Backend API     │
    │                 │        │  labsisEG        │   │   │  (port 3001)     │
    │  • Modificar    │        │                  │   │   │                  │
    │    precios      │        │  Tablas:         │   │   │  • REST API      │
    │  • Lista ID 27  │        │  ├─ prueba       │   │   │  • Cache         │
    │                 │        │  ├─ grupo_prueba │   │   │  • Listener      │
    └─────────────────┘        │  ├─ lista_       │   │   └──────────────────┘
                               │  │  precios_has_ │   │            │
                               │  │  prueba       │   │            │
                               │  └─ lista_       │   │            ▼
                               │     precios_has_ │   │   ┌──────────────────┐
                               │     gprueba      │   └──▶│  Sync Service    │
                               │                  │       │  (port 3002)     │
                               │  TRIGGERS:       │       │                  │
                               │  ├─ INSERT       │       │  • Listener      │
                               │  ├─ UPDATE       │◀──────│  • JSON Gen      │
                               │  └─ DELETE       │       │  • Auto-copy     │
                               │         │        │       └──────────────────┘
                               │         │        │                │
                               │         ▼        │                │
                               │  ┌────────────┐ │                │
                               │  │  NOTIFY    │ │                │
                               │  │  precio_   │ │                │
                               │  │  cambio    │ │                │
                               │  └────────────┘ │                │
                               └──────────────────┘                │
                                                                   │
                                                                   ▼
                                                       ┌──────────────────────┐
                                                       │   precios.json       │
                                                       │   (auto-generado)    │
                                                       │   ~1.2MB             │
                                                       │   513 estudios       │
                                                       └──────────────────────┘
                                                                   │
                                                                   │
                                                                   ▼
                                                       ┌──────────────────────┐
                                                       │  Frontend (Vite)     │
                                                       │  http://localhost:   │
                                                       │  5173/estudios       │
                                                       │                      │
                                                       │  • Lee JSON          │
                                                       │  • PWA               │
                                                       │  • Cache Browser     │
                                                       └──────────────────────┘
                                                                   │
                                                                   ▼
                                                              ┌─────────┐
                                                              │ USUARIO │
                                                              │ Ve      │
                                                              │ precios │
                                                              └─────────┘
```

---

## Flujo Detallado de Sincronización

```
PASO 1: CAMBIO DE PRECIO
═════════════════════════

┌────────────┐
│  USUARIO   │  Modifica precio en Labsis
│  (Labsis)  │  Lista de precios ID 27
└─────┬──────┘
      │
      │  SQL: UPDATE lista_precios_has_gprueba
      │       SET precio = 10.00
      │       WHERE gprueba_id = 1 AND lista_precios_id = 27
      │
      ▼
┌──────────────────────────────────────────┐
│   PostgreSQL Database (labsisEG)         │
│                                          │
│   tabla: lista_precios_has_gprueba       │
│   ┌────────────────────────────────┐    │
│   │ gprueba_id │ precio │ UPDATE   │    │
│   │     1      │ 10.00  │  ✅      │    │
│   └────────────────────────────────┘    │
│                                          │
│   ⏱️  Tiempo: ~1ms                       │
└─────┬────────────────────────────────────┘
      │
      │  TRIGGER: precio_cambio_notify
      │  dispara automáticamente
      │
      ▼


PASO 2: NOTIFICACIÓN POSTGRESQL
════════════════════════════════

┌──────────────────────────────────────────┐
│   PostgreSQL NOTIFY                      │
│                                          │
│   NOTIFY precio_cambio, '{               │
│     "tabla": "lista_precios_has_gprueba",│
│     "operacion": "UPDATE",               │
│     "timestamp": "2025-10-22...",        │
│     "registro_id": 1536,                 │
│     "lista_precios_id": 27               │
│   }'                                     │
│                                          │
│   ⏱️  Tiempo: ~1ms                       │
└─────┬────────────────────────────────────┘
      │
      │  Broadcast a todos los listeners
      │
      ├─────────────────┬────────────────┐
      │                 │                │
      ▼                 ▼                ▼


PASO 3: LISTENERS RECIBEN NOTIFICACIÓN
═══════════════════════════════════════

┌─────────────────────┐   ┌──────────────────────┐
│   Backend API       │   │   Sync Service       │
│   (port 3001)       │   │   (port 3002)        │
│                     │   │                      │
│  🔔 Notificación    │   │  🔔 Notificación     │
│     recibida        │   │     recibida         │
│                     │   │                      │
│  Payload:           │   │  Payload:            │
│  • tabla: ...       │   │  • tabla: ...        │
│  • operacion: ...   │   │  • operacion: ...    │
│                     │   │                      │
│  ⏱️  Instantáneo     │   │  ⏱️  Instantáneo      │
└─────┬───────────────┘   └──────┬───────────────┘
      │                          │
      │                          │
      ▼                          ▼


PASO 4A: BACKEND INVALIDA CACHE
════════════════════════════════

┌─────────────────────────────────────┐
│   Backend Cache Manager             │
│                                     │
│   🗑️  Invalidando caché:            │
│   • Grupos (grupos:*)               │
│   • Búsquedas (search:*)            │
│   • Unificado (unified:*)           │
│                                     │
│   NodeCache cleared: 3 keys         │
│                                     │
│   ⏱️  Tiempo: ~1ms                   │
└─────────────────────────────────────┘
      │
      │  Siguiente request traerá
      │  datos frescos de PostgreSQL
      │
      ▼
┌─────────────────────────────────────┐
│   ✅ Cache listo para servir         │
│      datos actualizados             │
└─────────────────────────────────────┘


PASO 4B: SYNC SERVICE GENERA JSON
══════════════════════════════════

┌─────────────────────────────────────┐
│   Sync Service                      │
│                                     │
│   ⏱️  Debounce: 2 segundos           │
│   (agrupa múltiples cambios)        │
│                                     │
│   Timer: [████████████████] 100%    │
│                                     │
│   ⏱️  Tiempo: 2000ms                 │
└─────┬───────────────────────────────┘
      │
      │  Debounce completado
      │
      ▼
┌─────────────────────────────────────┐
│   📊 Consultando PostgreSQL          │
│                                     │
│   Query 1: SELECT * FROM prueba     │
│            JOIN lista_precios_      │
│            has_prueba...            │
│            WHERE lista_precios_id=27│
│            → 349 pruebas            │
│                                     │
│   Query 2: SELECT * FROM grupo_     │
│            prueba JOIN lista_       │
│            precios_has_gprueba...   │
│            WHERE lista_precios_id=27│
│            → 164 grupos             │
│                                     │
│   ⏱️  Tiempo: ~50-70ms               │
└─────┬───────────────────────────────┘
      │
      │  Total: 513 estudios obtenidos
      │
      ▼
┌─────────────────────────────────────┐
│   🔄 Transformando a JSON            │
│                                     │
│   Estructura:                       │
│   {                                 │
│     "metadata": {...},              │
│     "estudios": [                   │
│       {                             │
│         "id": 1,                    │
│         "nombre": "Hematología...", │
│         "precio": 10.00,            │
│         "tipo_item": "grupo",       │
│         ...                         │
│       },                            │
│       ...                           │
│     ]                               │
│   }                                 │
│                                     │
│   ⏱️  Tiempo: ~10ms                  │
└─────┬───────────────────────────────┘
      │
      │  JSON listo: ~1.2MB
      │
      ▼
┌─────────────────────────────────────┐
│   💾 Guardando JSON                  │
│                                     │
│   Destino 1:                        │
│   /sync-service/output/precios.json │
│   ✅ Guardado                        │
│                                     │
│   ⏱️  Tiempo: ~5ms                   │
└─────┬───────────────────────────────┘
      │
      │  Auto-copy activado
      │
      ▼
┌─────────────────────────────────────┐
│   📋 Copiando a proyecto web         │
│                                     │
│   Destino 2:                        │
│   /laboratorio-eg/public/data/      │
│   precios.json                      │
│   ✅ Copiado                         │
│                                     │
│   ⏱️  Tiempo: ~2ms                   │
└─────┬───────────────────────────────┘
      │
      │  ✅ Sincronización completada
      │
      ▼


PASO 5: JSON DISPONIBLE PARA FRONTEND
══════════════════════════════════════

┌─────────────────────────────────────┐
│   Archivo actualizado:              │
│                                     │
│   📄 /laboratorio-eg/public/data/    │
│      precios.json                   │
│                                     │
│   Tamaño: 1.2 MB                    │
│   Estudios: 513                     │
│   Timestamp: 2025-10-22 11:54:40    │
│                                     │
│   Disponible en:                    │
│   http://localhost:5173/data/       │
│   precios.json                      │
│                                     │
│   ⏱️  Tiempo total desde cambio:     │
│      ~2.1 segundos                  │
└─────────────────────────────────────┘
      │
      │  Usuario refresca navegador
      │  (Cmd+Shift+R)
      │
      ▼


PASO 6: FRONTEND CARGA NUEVO JSON
══════════════════════════════════

┌─────────────────────────────────────┐
│   Frontend (React + Vite)           │
│   http://localhost:5173/estudios    │
│                                     │
│   Hook: useLabData()                │
│   ├─ fetch('/data/precios.json')   │
│   ├─ Parse JSON                     │
│   ├─ Cache en localStorage          │
│   └─ Renderizar estudios            │
│                                     │
│   ⏱️  Tiempo de carga: ~100-200ms    │
└─────┬───────────────────────────────┘
      │
      │  UI actualizada
      │
      ▼


PASO 7: USUARIO VE PRECIO ACTUALIZADO
══════════════════════════════════════

┌─────────────────────────────────────┐
│   🖥️  Pantalla del Usuario           │
│                                     │
│   Estudios > Búsqueda:              │
│   "Hematología Completa"            │
│                                     │
│   ┌───────────────────────────────┐ │
│   │ Hematología Completa          │ │
│   │ Código: 1001                  │ │
│   │ Precio: $10.00 ✅             │ │
│   │                               │ │
│   │ [Ver Detalles]                │ │
│   └───────────────────────────────┘ │
│                                     │
│   ✅ Precio actualizado correctamente│
└─────────────────────────────────────┘
```

---

## Tiempos de Propagación

```
Evento                              Tiempo      Acumulado
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UPDATE en PostgreSQL                ~1ms        1ms
TRIGGER dispara NOTIFY              ~1ms        2ms
Listeners reciben notificación      ~1ms        3ms
Backend invalida cache              ~1ms        4ms
Sync Service inicia debounce        —           —
  ⏸️  Espera (agrupa cambios)        2000ms      2004ms
Sync consulta PostgreSQL            ~70ms       2074ms
Transforma datos a JSON             ~10ms       2084ms
Guarda JSON local                   ~5ms        2089ms
Copia a proyecto web                ~2ms        2091ms
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL: Cambio → JSON disponible     ~2.1 segundos

Usuario refresca navegador          ~200ms      2291ms
Frontend carga y renderiza          ~100ms      2391ms
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL: Cambio → Usuario ve precio   ~2.4 segundos
```

---

## Componentes Críticos

```
┌─────────────────────────────────────────────────────────────────┐
│                   COMPONENTE: Backend API                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Archivo: server/config/pg-listener.js                          │
│                                                                  │
│  class PostgresListener {                                       │
│    async connect() {                                            │
│      this.client = new Client({...});                           │
│      await this.client.connect();                               │
│      await this.client.query('LISTEN precio_cambio');           │
│                                                                  │
│      this.client.on('notification', (msg) => {                  │
│        this.handleNotification(msg);                            │
│      });                                                         │
│    }                                                             │
│                                                                  │
│    handleNotification(msg) {                                    │
│      const payload = JSON.parse(msg.payload);                   │
│      this.invalidateCache(payload);                             │
│    }                                                             │
│                                                                  │
│    invalidateCache(payload) {                                   │
│      if (payload.tabla === 'lista_precios_has_prueba') {        │
│        cacheManager.invalidate('pruebas');                      │
│      }                                                           │
│      if (payload.tabla === 'lista_precios_has_gprueba') {       │
│        cacheManager.invalidate('grupos');                       │
│      }                                                           │
│    }                                                             │
│  }                                                               │
│                                                                  │
│  ✅ Estado: ACTIVO                                               │
│  🔌 Puerto: 3001                                                 │
│  📡 Canal: precio_cambio                                         │
└─────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                  COMPONENTE: Sync Service                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Archivo: src/services/postgres-listener.js                     │
│                                                                  │
│  class SyncListener {                                           │
│    constructor() {                                              │
│      this.debounceTimer = null;                                 │
│      this.debounceMs = 2000;                                    │
│    }                                                             │
│                                                                  │
│    async start() {                                              │
│      this.client = new Client({...});                           │
│      await this.client.connect();                               │
│      await this.client.query('LISTEN precio_cambio');           │
│                                                                  │
│      this.client.on('notification', (msg) => {                  │
│        this.handleNotification(msg);                            │
│      });                                                         │
│    }                                                             │
│                                                                  │
│    handleNotification(msg) {                                    │
│      clearTimeout(this.debounceTimer);                          │
│                                                                  │
│      this.debounceTimer = setTimeout(() => {                    │
│        this.triggerSync();                                      │
│      }, this.debounceMs);                                       │
│    }                                                             │
│                                                                  │
│    async triggerSync() {                                        │
│      await sync(); // Genera JSON                               │
│      // Auto-copy activado en file-service.js                   │
│    }                                                             │
│  }                                                               │
│                                                                  │
│  ✅ Estado: ACTIVO                                               │
│  🔌 Puerto: 3002                                                 │
│  📡 Canal: precio_cambio                                         │
│  ⏱️  Debounce: 2000ms                                            │
└─────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                  COMPONENTE: PostgreSQL Trigger                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Tablas monitoreadas:                                           │
│  • lista_precios_has_prueba                                     │
│  • lista_precios_has_gprueba                                    │
│                                                                  │
│  Trigger: precio_cambio_notify                                  │
│                                                                  │
│  CREATE OR REPLACE FUNCTION notify_precio_cambio()              │
│  RETURNS trigger AS $$                                          │
│  BEGIN                                                           │
│    PERFORM pg_notify('precio_cambio',                           │
│      json_build_object(                                         │
│        'tabla', TG_TABLE_NAME,                                  │
│        'operacion', TG_OP,                                      │
│        'timestamp', NOW(),                                      │
│        'registro_id', NEW.id,                                   │
│        'lista_precios_id', NEW.lista_precios_id                 │
│      )::text                                                    │
│    );                                                            │
│    RETURN NEW;                                                  │
│  END;                                                            │
│  $$ LANGUAGE plpgsql;                                           │
│                                                                  │
│  Eventos: INSERT, UPDATE, DELETE                                │
│                                                                  │
│  ✅ Estado: INSTALADO                                            │
│  📡 Canal: precio_cambio                                         │
└─────────────────────────────────────────────────────────────────┘
```

---

**Última actualización:** 22 de Octubre, 2025
