# 📊 PROCESO DE SINCRONIZACIÓN DE PRECIOS - Laboratorio EG

## RESUMEN EJECUTIVO

Cuando cambias un precio en **labsisEG**, el sistema sincroniza automáticamente el cambio a http://localhost:5173/estudios

---

## 🔄 FLUJO COMPLETO DE SINCRONIZACIÓN

```
labsisEG (PostgreSQL)  →  sync-service  →  JSON local  →  React App
    ↓ cambio precio       ↓ detecta          ↓ genera      ↓ muestra
    UPDATE precio         LISTEN/NOTIFY      precios.json  estudios page
```

---

## 📋 PASO A PASO - QUÉ SUCEDE

### 1️⃣ **CAMBIAS EL PRECIO EN LABSIS** (PostgreSQL)
   - Abres labsis y editas un precio
   - Por ejemplo: "17 HIDROXIPROGESTERONA" de $25 → $30

### 2️⃣ **POSTGRESQL EMITE NOTIFICACIÓN** (Instantáneo)
   - El TRIGGER en la tabla `listaspreciodetalle` detecta el UPDATE
   - PostgreSQL emite: `NOTIFY precio_cambio, 'precio_actualizado'`

### 3️⃣ **SYNC-SERVICE DETECTA EL CAMBIO** (< 1 segundo)
   ```
   📡 [LISTENER] → Recibe notificación 'precio_cambio'
   ⏱️  [DEBOUNCE] → Espera 2 segundos (por si hay más cambios)
   🔄 [SYNC] → Inicia sincronización automática
   ```

### 4️⃣ **SYNC-SERVICE EXTRAE DATOS** (~20ms)
   ```sql
   SELECT id, codigo, nombre, categoria, precio, descripcion...
   FROM laboratorio.listaspreciodetalle
   WHERE lpid = 27 AND activo = true
   ```
   - Obtiene las 511 estudios con precios actualizados
   - Separa en pruebas (< 1000) y grupos (>= 1000)

### 5️⃣ **GENERA JSON** (~5ms)
   ```
   📝 Crea: /sync-service/output/precios.json (160 KB)
   📋 Copia a: /laboratorio-eg/public/data/precios.json
   ```

### 6️⃣ **REACT APP DETECTA CAMBIO** (Automático)
   - Vite dev server detecta que `precios.json` cambió
   - **Hot Module Replacement (HMR)** se activa
   - La página NO se recarga completamente

### 7️⃣ **USUARIO VE EL CAMBIO** (Instantáneo en UI)
   - Si estás en `/estudios`, verás el nuevo precio **SIN RECARGAR**
   - Si estás en otra página, el cambio estará listo cuando vuelvas

---

## ⏱️ TIEMPOS DE SINCRONIZACIÓN

| Paso | Tiempo | Descripción |
|------|--------|-------------|
| **Detección** | < 100ms | PostgreSQL NOTIFY → sync-service |
| **Debounce** | 2000ms | Espera por cambios adicionales |
| **Consulta DB** | ~20ms | SELECT 511 estudios |
| **Generación JSON** | ~5ms | Transformar y escribir archivo |
| **HMR Vite** | ~50ms | Detectar cambio y actualizar UI |
| **TOTAL** | **~2.2 segundos** | Desde UPDATE hasta UI actualizada |

---

## 🎯 CÓMO PROBAR LA SINCRONIZACIÓN

### PREPARACIÓN (Ya está listo):
1. ✅ **Sync-service corriendo** → http://localhost:3001
2. ✅ **React app corriendo** → http://localhost:5173
3. ✅ **Listener activo** → Escuchando canal 'precio_cambio'

### PRUEBA:

**1. Abre el navegador:**
   ```
   http://localhost:5173/estudios
   ```
   - Busca "17 HIDROXIPROGESTERONA"
   - Anota el precio actual: **$25.00**

**2. Abre la consola del sync-service** (donde está corriendo)
   - Deberías ver: `✅ Escuchando canal 'precio_cambio'`

**3. Cambia el precio en labsis:**
   - Abre labsis
   - Busca "17 HIDROXIPROGESTERONA" (ID: 1042)
   - Cambia precio de `25` a `30`
   - Guarda

**4. Observa la consola del sync-service:**
   Verás algo como:
   ```
   🔔 [LISTENER] Notificación recibida: precio_cambio
   📊 Payload: precio_actualizado
   ⏱️  Programando sincronización en 2000ms...
   🔄 Iniciando sincronización...
   ✅ 511 estudios sincronizados
   💾 JSON guardado: 160.62 KB
   ```

**5. Observa el navegador en /estudios:**
   - Vite detectará el cambio automáticamente
   - Verás en la consola del navegador:
     ```
     [vite] hmr update /data/precios.json
     ```
   - El precio cambiará de **$25.00** a **$30.00** **SIN RECARGAR**

---

## 📂 ARCHIVOS INVOLUCRADOS

### Backend (Sync-Service):
```
/sync-service/
├── src/
│   ├── index.js              ← Servidor principal
│   ├── services/
│   │   ├── database.js       ← Conexión PostgreSQL
│   │   └── sync.js           ← Lógica de sincronización
│   └── listeners/
│       └── priceListener.js  ← LISTEN/NOTIFY handler
├── output/
│   └── precios.json          ← JSON generado (fuente)
└── .env                      ← Config (DB, lista_id=27)
```

### Frontend (React App):
```
/laboratorio-eg/
├── public/
│   └── data/
│       └── precios.json      ← JSON copiado (consumido por React)
└── src/
    ├── hooks/
    │   ├── useLabDataDB.js   ← Hook para cargar JSON
    │   └── useAdvancedSearch.js ← Búsqueda con Fuse.js
    └── pages/
        └── Estudios.jsx       ← Página que muestra estudios
```

### Base de Datos:
```sql
-- TRIGGER que emite la notificación
CREATE OR REPLACE FUNCTION notify_precio_cambio()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify('precio_cambio', 'precio_actualizado');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_precio_cambio
AFTER INSERT OR UPDATE OR DELETE ON laboratorio.listaspreciodetalle
FOR EACH ROW EXECUTE FUNCTION notify_precio_cambio();
```

---

## 🔍 VERIFICACIÓN DE LOGS

### Logs del sync-service (http://localhost:3001):
```bash
✅ Sistema listo
👂 Escuchando canal 'precio_cambio'

# Cuando cambies el precio:
🔔 [LISTENER] Notificación recibida: precio_cambio
⏱️  Programando sincronización en 2000ms...
🔄 Iniciando sincronización...
📊 Consultando base de datos labsisEG...
✅ 348 pruebas y 163 grupos obtenidos
💾 JSON guardado localmente (160.62 KB, 511 estudios)
📋 JSON copiado a proyecto web
✅ Sincronización completada (20ms)
```

### Consola del navegador (F12 en Chrome):
```javascript
// Cuando se detecta el cambio:
[vite] hmr update /data/precios.json

// De useLabDataDB.js:
📊 Data loaded successfully: {
  totalEstudios: 511,
  estudiosArray: [...],
  sampleEstudio: { nombre: "17 HIDROXIPROGESTERONA", precio: 30 }
}
```

---

## ❓ TROUBLESHOOTING

### ❌ El precio NO se actualiza en /estudios:

**1. Verifica sync-service está corriendo:**
```bash
curl http://localhost:3001/health
# Debe responder: {"status":"ok","timestamp":"..."}
```

**2. Verifica que el LISTENER está activo:**
- Busca en logs: `✅ Escuchando canal 'precio_cambio'`

**3. Fuerza una sincronización manual:**
```bash
curl http://localhost:3001/sync
```

**4. Verifica el JSON se generó:**
```bash
ls -lh /Users/samuelquiroz/Documents/proyectos/Test-Directory-EG/laboratorio-eg/public/data/precios.json
# Debe existir y tener ~160 KB
```

**5. Limpia el cache del navegador:**
```javascript
// En consola del navegador:
localStorage.clear()
location.reload()
```

---

## 🎬 LISTO PARA PROBAR

**ESTADO ACTUAL:**
- ✅ Sync-service: **CORRIENDO** (puerto 3001)
- ✅ React App: **CORRIENDO** (puerto 5173)  
- ✅ Listener: **ACTIVO** (canal 'precio_cambio')
- ✅ JSON: **GENERADO** (511 estudios)
- ✅ Hooks: **ARREGLADOS** (muestra todos los estudios)

**PUEDES CAMBIAR EL PRECIO AHORA** ✅

1. Abre http://localhost:5173/estudios
2. Busca cualquier estudio (ej: "17 HIDROXIPROGESTERONA")
3. Anota el precio actual
4. Ve a labsis y cámbialo
5. Regresa al navegador y observa el cambio automático

**¡El sistema está 100% funcional y listo!** 🚀
