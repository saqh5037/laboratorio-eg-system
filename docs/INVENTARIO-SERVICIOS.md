# 📦 Inventario de Servicios - Laboratorio EG

**Fecha:** 24 de Octubre, 2025

---

## 🎯 RESUMEN EJECUTIVO

| Métrica | Valor |
|---------|-------|
| **Total de Servicios** | 3 principales |
| **Tamaño Total** | 733 MB |
| **Archivos de Código** | ~150 archivos |
| **Componentes React** | 51 componentes |
| **Endpoints API** | ~15 endpoints |
| **Estudios Sincronizados** | 513 (348 pruebas + 165 grupos) |
| **Base de Datos** | PostgreSQL 14.18 (labsisEG) |
| **Documentación** | 13+ archivos Markdown |

---

## 📊 SERVICIOS PRINCIPALES

### 1️⃣ **laboratorio-eg** (PWA Frontend)
```
📁 Tamaño: 439 MB
🌐 Puerto: 5173 (http://localhost:5173)
⚡ Estado: ✅ Corriendo
📱 Tipo: Progressive Web App
🛠️ Tech: React 19 + Vite 7.1.2 + Tailwind CSS
```

**Funcionalidades:**
- ✅ Catálogo de 513 estudios
- ✅ Búsqueda fuzzy con Fuse.js
- ✅ Portal de resultados para pacientes
- ✅ Dashboard de salud con gráficas
- ✅ PWA instalable (offline-first)
- ✅ Optimización móvil completa
- ✅ Sistema de favoritos

**Componentes (51):**
```
components/
├── brand/           # Logo, branding
├── dashboard/       # Dashboard de salud (10 componentes)
│   ├── DashboardGlobal.jsx
│   ├── DashboardSalud.jsx
│   ├── HeatMapModal.jsx
│   ├── ComparacionGruposModal.jsx
│   └── GraficaMultiPrueba.jsx
├── historico/       # Gráficas históricas (3 componentes)
│   ├── HistoricoModal.jsx
│   ├── GraficaLinea.jsx
│   └── GraficaBarras.jsx
├── landing/         # Landing page
├── resultados/      # Resultados pacientes (4 componentes)
│   ├── ResultadosAuth.jsx
│   ├── ResultadosListaOrdenes.jsx
│   ├── ResultadosDetalle.jsx
│   └── TarjetaResultadoMovil.jsx (NUEVO)
└── [27 componentes UI más]
```

**Páginas (3):**
- LandingPageUnified.jsx
- Estudios.jsx
- Resultados.jsx

**Dependencies principales:**
- react: 19.1.1
- vite: 7.1.2
- tailwindcss: 3.4.17
- framer-motion: 12.23.12
- recharts: 3.3.0
- fuse.js: 7.1.0
- axios: 1.11.0

---

### 2️⃣ **results-service** (API de Resultados)
```
📁 Tamaño: 148 MB
🌐 Puerto: 3003 (http://localhost:3003)
⚡ Estado: ✅ Corriendo
🔐 Tipo: REST API con JWT
🛠️ Tech: Node.js + Express + PostgreSQL
```

**Funcionalidades:**
- ✅ Autenticación segura (CI + fecha nacimiento)
- ✅ JWT tokens (exp: 15 min)
- ✅ Consulta de órdenes
- ✅ Visualización de resultados
- ✅ Interpretación automática (normal/alto/bajo)
- ✅ Generación de PDFs
- ✅ Histórico de resultados
- ✅ Rate limiting

**Endpoints (6):**
```
POST   /api/auth/verify           # Autenticación
GET    /api/resultados/ordenes    # Lista órdenes paciente
GET    /api/resultados/orden/:numero    # Detalle de orden
GET    /api/resultados/orden/:numero/pdf    # Descargar PDF
GET    /api/resultados/historico/:pruebaId    # Histórico prueba
GET    /health                     # Health check
```

**Estructura (10 archivos):**
```
src/
├── index.js
├── config/
│   ├── database.js       # Pool PostgreSQL
│   └── logger.js         # Winston
├── models/
│   ├── orden.js          # Modelo órdenes
│   └── resultado.js      # Modelo resultados
├── services/
│   ├── auth.js           # Auth service
│   ├── pdfGenerator.js
│   ├── pdfGeneratorLabsis.js
│   └── pdfGeneratorPuppeteer.js
└── routes/
    └── results.js        # API routes
```

**Dependencies principales:**
- express: 4.18.2
- pg: 8.16.3
- jsonwebtoken: 9.0.2
- bcrypt: 5.1.1
- winston: 3.17.0
- puppeteer: 24.26.1

---

### 3️⃣ **sync-service** (Sincronización Automática)
```
📁 Tamaño: 146 MB
🌐 Puerto: 3002 (listener interno, no HTTP)
⚡ Estado: ⚠️ No detectado (verificar)
🔄 Tipo: PostgreSQL LISTEN/NOTIFY
🛠️ Tech: Node.js + pg (LISTEN/NOTIFY)
```

**Funcionalidades:**
- ✅ PostgreSQL LISTEN/NOTIFY
- ✅ Triggers en 4 tablas
- ✅ Debounce de 2 segundos
- ✅ Generación automática de JSON
- ✅ Auto-copia a proyecto web
- ✅ Logs detallados
- ✅ API HTTP opcional

**Flujo:**
```
Cambio en Labsis
   ↓ (trigger)
NOTIFY 'precio_cambio'
   ↓ (listener)
Espera 2 seg (debounce)
   ↓
Genera JSON (513 estudios)
   ↓
Guarda ./output/precios.json
   ↓
Copia a laboratorio-eg/public/data/
   ↓ (~2.1 segundos total)
Frontend lee JSON actualizado
```

**Triggers instalados (4):**
1. notify_precio_cambio (tabla: precio)
2. notify_preciogrupo_cambio (tabla: preciogrupo)
3. notify_prueba_cambio (tabla: prueba)
4. notify_pruebasgrupos_cambio (tabla: pruebas_grupos)

**Estructura (12 archivos):**
```
src/
├── index.js
├── config.js
├── database/
│   ├── connection.js     # Pool
│   └── queries.js        # SQL queries
├── services/
│   ├── postgres-listener.js    # LISTEN/NOTIFY
│   ├── sync-service.js         # Sync logic
│   └── data-transformer.js     # JSON transform
├── storage/
│   └── file-service.js   # File operations
├── http/
│   ├── server.js
│   └── routes/api.js
└── utils/
    └── logger.js
```

**Output:**
- precios.json (~160 KB, 513 estudios)
- Logs rotativos por día

**Dependencies principales:**
- express: 4.21.2
- pg: 8.16.3
- winston: 3.17.0
- winston-daily-rotate-file: 5.0.0

---

## 🗄️ BASE DE DATOS

### PostgreSQL 14.18
```
🏢 Database: labsisEG
👤 User: labsis
🌐 Host: localhost:5432
📊 Sistema: Labsis (existente)
```

**Tablas monitoreadas:**
- precio (precios individuales)
- preciogrupo (precios de grupos)
- prueba (catálogo de pruebas)
- pruebas_grupos (relación prueba-grupo)
- paciente (datos pacientes)
- orden (órdenes de laboratorio)
- prueba_orden (resultados)
- valor_referencial (rangos normales)

**Triggers:**
- 4 triggers AFTER INSERT/UPDATE/DELETE
- Envían NOTIFY al canal 'precio_cambio'
- No interrumpen operaciones

---

## 📚 DOCUMENTACIÓN

Total: **13+ archivos Markdown**

1. **RESUMEN-PROYECTO-COMPLETO.md** (NUEVO)
   - Inventario completo del sistema
   - Stack tecnológico
   - Métricas y estadísticas

2. **ESTRUCTURA-REPOSITORIOS-RECOMENDADA.md** (NUEVO)
   - Recomendación: Monorepo
   - Estructura detallada
   - Comparación Monorepo vs Multi-repo

3. **RESUMEN-EJECUTIVO.md**
   - Sistema de sincronización
   - Flujo operativo
   - Métricas

4. **SINCRONIZACION-AUTOMATICA.md**
   - Documentación técnica completa
   - Setup y configuración

5. **DEPLOYMENT_PRODUCTION.md**
   - Guía de deployment
   - AWS/VPS setup

6. **DIAGRAMA-FLUJO.md**
   - Diagramas del sistema

7. **README-INICIO-RAPIDO.md**
   - Quick start guide

8. **CLAUDE.md**
   - Historial de desarrollo

9. **ARQUITECTURA_LABORATORIO_EG.excalidraw.json**
   - Diagrama visual de arquitectura

10-13. READMEs individuales por servicio

---

## 🔧 HERRAMIENTAS Y CONFIGURACIÓN

### Instaladas
- Node.js 18+ / 22.16.0
- npm (package manager)
- PostgreSQL 14.18
- Git

### Configuradas
- ✅ ESLint (linting)
- ✅ Prettier (formatting)
- ✅ Tailwind CSS (styling)
- ✅ Vite (build tool)
- ✅ Winston (logging)
- ✅ Service Worker (PWA)

### Por Instalar (Recomendado)
- [ ] Turborepo (si monorepo)
- [ ] Vitest (unit testing)
- [ ] Playwright (E2E testing)
- [ ] PM2 (process manager)
- [ ] Docker (containerization)

---

## 🚀 COMANDOS RÁPIDOS

### Iniciar todo el sistema
```bash
# Terminal 1: Frontend
cd laboratorio-eg
npm run dev

# Terminal 2: Results API
cd results-service
npm run dev

# Terminal 3: Sync Service
cd sync-service
npm run dev
```

### Verificar servicios corriendo
```bash
lsof -ti:5173 -ti:3002 -ti:3003
# Debe retornar 3 PIDs
```

### Verificar base de datos
```bash
psql -h localhost -U labsis -d labsisEG -c "SELECT version();"
```

### Ver logs
```bash
# Results API logs
tail -f results-service/logs/combined.log

# Sync service logs
tail -f sync-service/logs/combined.log
```

---

## 📊 MÉTRICAS DE CÓDIGO

### Frontend (laboratorio-eg)
- **Archivos:** 128 JS/JSX
- **Componentes:** 51
- **Páginas:** 3
- **Hooks:** 3 personalizados
- **Servicios API:** 2
- **Tamaño:** 439 MB

### Results API (results-service)
- **Archivos:** 10 JS
- **Modelos:** 2
- **Servicios:** 4
- **Rutas:** 1
- **Endpoints:** 6
- **Tamaño:** 148 MB

### Sync Service (sync-service)
- **Archivos:** 12 JS
- **Servicios:** 3
- **Scripts:** 2
- **Triggers SQL:** 4
- **Tamaño:** 146 MB

### Total
- **Archivos de código:** ~150
- **Líneas de código:** Estimado 15,000-20,000
- **Tamaño total:** 733 MB
- **Documentación:** 13+ archivos MD

---

## 🎯 PRÓXIMOS PASOS

### Corto Plazo (Esta Semana)
1. [ ] **Decidir:** Monorepo vs Multi-repo
2. [ ] **Crear repositorio(s)** en GitHub/GitLab
3. [ ] **Migrar código** a estructura definitiva
4. [ ] **Setup CI/CD básico**
5. [ ] **Documentar deployment**

### Mediano Plazo (Próximas 2 Semanas)
1. [ ] Implementar tests unitarios (Vitest)
2. [ ] Implementar tests E2E (Playwright)
3. [ ] Setup de staging environment
4. [ ] Backup automático de DB
5. [ ] Monitoring y alertas

### Largo Plazo (Próximo Mes)
1. [ ] Performance optimization
2. [ ] Security audit
3. [ ] Load testing
4. [ ] Production deployment
5. [ ] User training

---

## ✅ ESTADO ACTUAL

**Sistema:** ✅ OPERACIONAL Y FUNCIONAL

- ✅ Frontend corriendo en localhost:5173
- ✅ Results API corriendo en localhost:3003
- ⚠️ Sync Service (verificar estado)
- ✅ Base de datos conectada
- ✅ Triggers instalados
- ✅ Documentación completa
- ✅ Optimización móvil

**Listo para:** Migración a repositorio y deployment

---

**Fecha de este inventario:** 24 de Octubre, 2025
**Próxima revisión:** Al crear repositorios
