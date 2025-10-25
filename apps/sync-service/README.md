# 🔄 Laboratorio EG - Sistema de Sincronización Local

Sistema de sincronización automática de precios desde **labsisEG** (PostgreSQL) a archivo JSON local, **SIN AWS**.

---

## 📊 Estado del Proyecto

### ✅ Sistema COMPLETADO Y FUNCIONAL

**Versión:** 1.0.0
**Estado:** ✅ **OPERACIONAL** - Sistema 100% funcional
**Última actualización:** 2025-10-19

**Estadísticas reales:**
- 📦 **511 estudios** sincronizados
  - 348 pruebas individuales
  - 163 grupos/perfiles
- 📋 Lista de precios: ID 27 ("Ambulatorio_Abril_2025")
- 💾 Tamaño del JSON: ~160 KB
- ⚡ Tiempo de sincronización: ~20-50ms
- 🔄 Auto-copia a React: ✅ ACTIVO

---

## 🎯 Información de labsisEG

```
Base de datos: labsisEG (NO labsis_dev)
Usuario: labsis
Lista de precios: ID 27 - "Ambulatorio_Abril_2025"
├── Pruebas activas: 348
├── Grupos activos: 163
└── Total: 511 estudios

Moneda: USD
Arquitectura: LOCAL (sin AWS S3)
```

---

## 🚀 Instalación Rápida

### 1. Instalar dependencias

```bash
cd sync-service
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
nano .env
```

**Editar y agregar:**
```bash
LABSIS_USER=labsis
LABSIS_PASSWORD=tu_password_aqui
```

### 3. Verificar conexión a labsisEG

```bash
npm run verify-db
```

**Salida esperada:**
```
🔍 VERIFICACIÓN DE BASE DE DATOS LABSIS
✅ Conectado exitosamente
✅ Base de datos: labsisEG
✅ Tablas encontradas: 6/6
✅ Lista de precios ID 27 encontrada
📊 Total en lista: 511 estudios
✅ Triggers instalados: 4/4
✅ Verificación completada exitosamente
```

### 4. Instalar triggers en labsisEG

```bash
PGPASSWORD=labsis psql -h localhost -U labsis -d labsisEG -f database/triggers-labsis.sql
```

O usando el script:
```bash
npm run install-triggers
```

### 5. Ejecutar el sistema

```bash
# Modo desarrollo (con hot-reload)
npm run dev

# Sincronización manual (una vez)
npm run manual-sync
```

---

## ⚡ Flujo de Sincronización

```
1. Usuario modifica precio en labsisEG
   ↓
2. Trigger detecta → NOTIFY 'precio_cambio'
   ↓
3. postgres-listener.js recibe notificación
   ↓
4. Espera 2 seg (debounce para batch)
   ↓
5. sync-service.js ejecuta:
   • Query 348 pruebas en paralelo
   • Query 163 grupos en paralelo
   • Genera JSON con metadata
   • Guarda ./output/precios.json
   • Copia a laboratorio-eg/public/data/
   ↓
6. JSON disponible en:
   • Local: ./output/precios.json
   • React: laboratorio-eg/public/data/precios.json
   • HTTP: http://localhost:3001/api/precios.json
   ↓
7. React App puede consumir vía fetch

⏱️ Tiempo total: 2-5 segundos
```

---

## 📋 Scripts NPM

```bash
npm run verify-db        # Verificar conexión a labsisEG
npm run install-triggers # Instalar triggers en DB
npm run dev              # Iniciar servicio (modo desarrollo)
npm run manual-sync      # Sincronización manual una vez
npm run status           # Ver estado del servicio (TODO)
npm run clean            # Limpiar logs antiguos (TODO)
```

---

## 🌐 API HTTP Endpoints

El servicio expone una API HTTP en `http://localhost:3001`:

### `GET /health`
Estado del servicio

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
Obtener archivo JSON completo con todos los precios

**Respuesta:** Archivo JSON con 511 estudios

### `GET /api/stats`
Estadísticas del sistema en tiempo real

**Respuesta:**
```json
{
  "sync": {
    "isSyncing": false,
    "lastSyncTime": "2025-10-19T04:21:19.124Z",
    "syncCount": 1,
    "config": {
      "listaPreciosId": 27,
      "debounceMs": 2000,
      "outputPath": "./output"
    }
  },
  "listener": {
    "isListening": true,
    "channel": "precio_cambio",
    "debounceMs": 2000,
    "hasPendingSync": false
  },
  "file": {
    "exists": true,
    "path": "/path/to/output/precios.json",
    "size": 164471,
    "sizeKB": "160.62",
    "modified": "2025-10-19T04:21:19.123Z"
  },
  "data": {
    "totalEstudios": 511,
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
}
```

### `POST /api/sync`
Forzar sincronización manual

**Respuesta:**
```json
{
  "success": true,
  "estudios": 511,
  "fileInfo": {
    "path": "/path/to/output/precios.json",
    "size": "160.62 KB"
  }
}
```

### `GET /api/config`
Ver configuración actual del sistema

---

## 🔧 Variables de Entorno

```bash
# labsisEG (NO labsis_dev)
LABSIS_HOST=localhost
LABSIS_PORT=5432
LABSIS_DB=labsisEG
LABSIS_USER=labsis         # Usuario de la base de datos
LABSIS_PASSWORD=           # ⚠️ REQUERIDO

# Lista de precios
LISTA_PRECIOS_ID=27        # Ambulatorio_Abril_2025

# Output local
OUTPUT_PATH=./output
OUTPUT_FILENAME=precios.json

# Auto-copy a proyecto web
AUTO_COPY_TO_WEB=true
WEB_PROJECT_PATH=/Users/.../laboratorio-eg/public/data

# HTTP Server
HTTP_PORT=3001

# Sincronización
DEBOUNCE_MS=2000           # Espera 2 seg para agrupar cambios

# Logging
LOG_LEVEL=info
LOG_DIRECTORY=./logs
```

---

## 📁 Estructura del Proyecto

```
sync-service/
├── package.json              ✅ Sin AWS, solo dependencias locales
├── .env.example              ✅ Variables de configuración
├── .env                      ✅ Configuración local (git ignored)
├── .gitignore                ✅
├── README.md                 ✅
│
├── database/
│   └── triggers-labsis.sql   ✅ 4 triggers instalados
│
├── scripts/
│   ├── verify-database.js    ✅ Verificar conexión
│   └── manual-sync.js        ✅ Sincronización manual
│
├── src/
│   ├── index.js              ✅ Entry point principal
│   ├── config.js             ✅ Configuración centralizada
│   │
│   ├── database/
│   │   ├── connection.js     ✅ Pool de PostgreSQL
│   │   └── queries.js        ✅ Queries (pruebas + grupos)
│   │
│   ├── services/
│   │   ├── postgres-listener.js  ✅ LISTEN/NOTIFY
│   │   ├── sync-service.js       ✅ Lógica de sincronización
│   │   └── data-transformer.js   ✅ Transform a JSON
│   │
│   ├── storage/
│   │   └── file-service.js   ✅ Guardar archivo local
│   │
│   ├── http/
│   │   ├── server.js         ✅ Servidor Express
│   │   └── routes/
│   │       └── api.js        ✅ API endpoints
│   │
│   └── utils/
│       └── logger.js         ✅ Winston logger
│
├── output/                   ✅ Auto-generado
│   └── precios.json          ✅ 511 estudios (160 KB)
│
└── logs/                     ✅ Auto-generado
    ├── combined-YYYY-MM-DD.log
    ├── error-YYYY-MM-DD.log
    └── sync-YYYY-MM-DD.log
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

---

## 🐛 Troubleshooting

### Error de conexión

```bash
# Verificar que PostgreSQL está corriendo
psql -U labsis -d labsisEG -c "SELECT version();"

# Verificar password en .env
cat .env | grep LABSIS_PASSWORD
```

### Triggers no instalados

```bash
# Instalar manualmente
PGPASSWORD=labsis psql -h localhost -U labsis -d labsisEG -f database/triggers-labsis.sql

# Verificar
npm run verify-db
```

### Puerto 3001 ocupado

```bash
# Ver qué proceso usa el puerto
lsof -i :3001

# Cambiar puerto en .env
echo "HTTP_PORT=3002" >> .env
```

### Logs no se generan

```bash
# Verificar permisos
ls -la logs/

# Crear directorio manualmente
mkdir -p logs
chmod 755 logs
```

---

## 🎯 Uso desde React App

### Opción 1: Archivo local (auto-copy)

```javascript
// React component
useEffect(() => {
  fetch('/data/precios.json')
    .then(res => res.json())
    .then(data => {
      console.log(`${data.metadata.totalEstudios} estudios cargados`);
      setEstudios(data.estudios);
    });
}, []);
```

### Opción 2: API HTTP

```javascript
// React component con polling
useEffect(() => {
  const fetchPrecios = async () => {
    const res = await fetch('http://localhost:3001/api/precios.json');
    const data = await res.json();
    setEstudios(data.estudios);
  };

  fetchPrecios();
  const interval = setInterval(fetchPrecios, 5 * 60 * 1000); // cada 5 min

  return () => clearInterval(interval);
}, []);
```

### Opción 3: Verificar actualización

```javascript
// Obtener metadata sin descargar todo el JSON
fetch('http://localhost:3001/api/stats')
  .then(res => res.json())
  .then(stats => {
    console.log('Última sincronización:', stats.sync.lastSyncTime);
    console.log('Total estudios:', stats.data.totalEstudios);
  });
```

---

## 📚 Documentación Relacionada

- [Resumen completo](../docs/RESUMEN_SINCRONIZACION.md) - Arquitectura detallada
- [Diagrama Excalidraw](../docs/arquitectura-sincronizacion.excalidraw) - Diagrama visual

---

## 🔄 Próximos Pasos (Opcionales)

- [ ] Crear script `status.sh` para monitorear el servicio
- [ ] Crear script `clean.sh` para limpiar logs antiguos
- [ ] Implementar systemd service para producción
- [ ] Agregar métricas de Prometheus
- [ ] Dashboard de monitoreo

---

## 🎓 Tecnologías Utilizadas

| Componente | Tecnología | Versión |
|------------|------------|---------|
| Base de Datos | PostgreSQL | 14.18 |
| Backend | Node.js | 22.16.0 |
| DB Driver | pg | 8.13.1 |
| HTTP Server | Express | 4.21.2 |
| Logging | Winston | 3.17.0 |
| Storage | Local Filesystem | - |

---

## 📝 Notas Importantes

- ✅ **SIN AWS** - Todo es local, no requiere credenciales de AWS
- ✅ Trigger no interrumpe operaciones aunque falle
- ✅ Debounce de 2 segundos agrupa múltiples cambios
- ✅ Sistema idempotente (puede ejecutarse múltiples veces)
- ✅ Compatible con PostgreSQL 12+
- ✅ Logs rotativos cada 14 días
- ⚠️ Verificar que AUTO_COPY_TO_WEB tenga la ruta correcta

---

**Versión:** 1.0.0
**Estado:** ✅ COMPLETADO Y FUNCIONAL
**Última actualización:** 2025-10-19
