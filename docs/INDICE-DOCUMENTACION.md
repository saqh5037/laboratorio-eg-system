# Índice de Documentación - Laboratorio EG

## 📚 Guía de Navegación

Este documento te ayuda a encontrar rápidamente la información que necesitas.

---

## 🚀 **¿Por dónde empezar?**

### Si eres nuevo en el proyecto:
1. Lee primero: **[RESUMEN-EJECUTIVO.md](./RESUMEN-EJECUTIVO.md)**
2. Luego sigue con: **[README-INICIO-RAPIDO.md](./README-INICIO-RAPIDO.md)**
3. Para entender el flujo: **[DIAGRAMA-FLUJO.md](./DIAGRAMA-FLUJO.md)**

### Si necesitas implementar o entender a fondo:
1. Documentación completa: **[SINCRONIZACION-AUTOMATICA.md](./SINCRONIZACION-AUTOMATICA.md)**

---

## 📄 Documentos Disponibles

### 1. **RESUMEN-EJECUTIVO.md** ⭐
**Para:** Gerentes, Product Owners, desarrolladores nuevos
**Contenido:**
- Resumen del sistema implementado
- Problema resuelto (antes vs ahora)
- Componentes principales
- Métricas de performance
- Pruebas realizadas
- Estado del sistema

**Tiempo de lectura:** 5 minutos

---

### 2. **README-INICIO-RAPIDO.md** ⭐⭐
**Para:** Desarrolladores que necesitan usar el sistema
**Contenido:**
- Comandos para iniciar servicios
- URLs principales
- Flujo de trabajo diario
- Comandos útiles
- Troubleshooting rápido
- Estructura de directorios

**Tiempo de lectura:** 3 minutos
**Úsalo cuando:** Necesites iniciar el sistema o resolver problemas comunes

---

### 3. **DIAGRAMA-FLUJO.md** ⭐⭐⭐
**Para:** Arquitectos, desarrolladores que quieren entender el flujo
**Contenido:**
- Diagrama completo de arquitectura
- Flujo detallado paso a paso (con ASCII art)
- Tiempos de propagación
- Componentes críticos con código
- Diagramas visuales de cada etapa

**Tiempo de lectura:** 10-15 minutos
**Úsalo cuando:** Necesites entender cómo funciona todo el sistema

---

### 4. **SINCRONIZACION-AUTOMATICA.md** ⭐⭐⭐⭐
**Para:** Desarrolladores avanzados, DevOps, mantenimiento
**Contenido:** (Documentación técnica completa)
- Descripción general del sistema
- Arquitectura detallada
- Componentes individuales con código fuente
- Triggers de PostgreSQL
- Backend API (listeners, cache, endpoints)
- Sync Service (configuración, queries SQL)
- Frontend (hooks, estructura JSON)
- Flujo completo con tiempos
- Comandos de operación
- Monitoreo y logs
- Troubleshooting detallado
- Testing del sistema
- Configuración de producción
- Archivos clave modificados
- Métricas y recursos
- Próximos pasos y mejoras

**Tiempo de lectura:** 30-45 minutos
**Úsalo cuando:** Necesites modificar el sistema, hacer debugging profundo, o entender cada detalle técnico

---

### 5. **PROCESO_SINCRONIZACION.md** (Existente)
**Para:** Referencia del proceso anterior
**Contenido:**
- Documentación del sistema de sincronización original
- Proceso anterior de sincronización manual

**Nota:** Este documento contiene información del sistema anterior. Para el nuevo sistema automático, usa **SINCRONIZACION-AUTOMATICA.md**

---

### 6. **DEPLOYMENT_PRODUCTION.md** (Existente)
**Para:** DevOps, deployment a producción
**Contenido:**
- Instrucciones de despliegue a producción
- Configuración de servidor

---

### 7. **DEPLOYMENT_SYNC_SERVICE_ONPREMISE.md** (Existente)
**Para:** DevOps, instalación on-premise
**Contenido:**
- Configuración del sync-service en servidor on-premise

---

### 8. **CLAUDE.md** (Existente)
**Para:** Referencia de desarrollo
**Contenido:**
- Notas de desarrollo con Claude

---

## 🎯 Casos de Uso Comunes

### "Necesito iniciar el sistema"
➡️ Lee: **[README-INICIO-RAPIDO.md](./README-INICIO-RAPIDO.md)** (sección: "Iniciar el Sistema Completo")

### "El JSON no se actualiza automáticamente"
➡️ Lee: **[README-INICIO-RAPIDO.md](./README-INICIO-RAPIDO.md)** (sección: "Troubleshooting Rápido")
➡️ Luego: **[SINCRONIZACION-AUTOMATICA.md](./SINCRONIZACION-AUTOMATICA.md)** (sección: "Troubleshooting")

### "¿Cómo funciona el sistema internamente?"
➡️ Lee: **[DIAGRAMA-FLUJO.md](./DIAGRAMA-FLUJO.md)**
➡️ Luego: **[SINCRONIZACION-AUTOMATICA.md](./SINCRONIZACION-AUTOMATICA.md)** (sección: "Componentes del Sistema")

### "Necesito modificar el tiempo de debounce"
➡️ Lee: **[SINCRONIZACION-AUTOMATICA.md](./SINCRONIZACION-AUTOMATICA.md)** (sección: "Sync Service" → Configuración)

### "¿Qué archivos fueron modificados?"
➡️ Lee: **[SINCRONIZACION-AUTOMATICA.md](./SINCRONIZACION-AUTOMATICA.md)** (sección: "Archivos Clave Modificados")

### "Quiero hacer deployment a producción"
➡️ Lee: **[SINCRONIZACION-AUTOMATICA.md](./SINCRONIZACION-AUTOMATICA.md)** (sección: "Configuración de Producción")
➡️ Y también: **[DEPLOYMENT_PRODUCTION.md](./DEPLOYMENT_PRODUCTION.md)**

### "¿Qué cambió desde la versión anterior?"
➡️ Lee: **[RESUMEN-EJECUTIVO.md](./RESUMEN-EJECUTIVO.md)** (sección: "Problema Resuelto")
➡️ Compara con: **[PROCESO_SINCRONIZACION.md](./PROCESO_SINCRONIZACION.md)**

---

## 📊 Resumen Rápido del Sistema

```
┌────────────────────────────────────────────────────┐
│  LABORATORIO EG - Sincronización Automática        │
├────────────────────────────────────────────────────┤
│                                                    │
│  ✅ Estado: OPERATIVO                              │
│  📅 Implementado: 22 de Octubre, 2025             │
│                                                    │
│  🔄 Sincronización: Automática en ~2.1s            │
│  📊 Estudios: 513 (349 pruebas + 164 grupos)      │
│  💾 Tamaño JSON: ~1.2 MB                          │
│  ⏱️  Debounce: 2 segundos                          │
│                                                    │
│  🌐 URLs:                                          │
│    • Frontend: http://localhost:5173              │
│    • Backend: http://localhost:3001               │
│    • Sync Service: http://localhost:3002          │
│                                                    │
│  📝 Lista de Precios: ID 27                        │
│     (Ambulatorio_Abril_2025)                      │
└────────────────────────────────────────────────────┘
```

---

## 🔍 Búsqueda Rápida por Tema

| Tema | Documento | Sección |
|------|-----------|---------|
| **Iniciar servicios** | README-INICIO-RAPIDO.md | "Iniciar el Sistema Completo" |
| **PostgreSQL Triggers** | SINCRONIZACION-AUTOMATICA.md | "Triggers de PostgreSQL" |
| **Backend Listener** | SINCRONIZACION-AUTOMATICA.md | "Backend API" |
| **Sync Service** | SINCRONIZACION-AUTOMATICA.md | "Sync Service" |
| **Debounce** | SINCRONIZACION-AUTOMATICA.md | "Sync Service" |
| **Cache invalidation** | SINCRONIZACION-AUTOMATICA.md | "Backend API" |
| **JSON estructura** | SINCRONIZACION-AUTOMATICA.md | "Frontend" |
| **Flujo completo** | DIAGRAMA-FLUJO.md | Todo el documento |
| **Troubleshooting** | README-INICIO-RAPIDO.md / SINCRONIZACION-AUTOMATICA.md | "Troubleshooting" |
| **Comandos útiles** | README-INICIO-RAPIDO.md | "Comandos Útiles" |
| **Monitoreo** | SINCRONIZACION-AUTOMATICA.md | "Monitoreo y Logs" |
| **Testing** | SINCRONIZACION-AUTOMATICA.md | "Testing del Sistema" |
| **Producción** | SINCRONIZACION-AUTOMATICA.md | "Configuración de Producción" |
| **Métricas** | RESUMEN-EJECUTIVO.md | "Métricas del Sistema" |

---

## 🛠️ Archivos de Código Modificados

Para ver los archivos de código modificados en la implementación:

**Backend:**
- `laboratorio-eg/server/config/pg-listener.js` (NUEVO)
- `laboratorio-eg/server/models/index.js` (MODIFICADO)
- `laboratorio-eg/server/routes/api.js` (MODIFICADO)
- `laboratorio-eg/server/index.js` (MODIFICADO)

**Sync Service:**
- `sync-service/.env` (MODIFICADO)
- `sync-service/src/services/postgres-listener.js` (REVISADO)
- `sync-service/src/storage/file-service.js` (REVISADO)

**Ver detalles:** [SINCRONIZACION-AUTOMATICA.md](./SINCRONIZACION-AUTOMATICA.md) (sección: "Archivos Clave Modificados")

---

## 📞 ¿Necesitas Ayuda?

1. **Problema rápido?** → [README-INICIO-RAPIDO.md](./README-INICIO-RAPIDO.md) → Troubleshooting
2. **Error específico?** → [SINCRONIZACION-AUTOMATICA.md](./SINCRONIZACION-AUTOMATICA.md) → Troubleshooting
3. **Pregunta sobre arquitectura?** → [DIAGRAMA-FLUJO.md](./DIAGRAMA-FLUJO.md)
4. **Duda general?** → [RESUMEN-EJECUTIVO.md](./RESUMEN-EJECUTIVO.md)

---

## 🗂️ Estructura de Carpetas

```
Test-Directory-EG/
├── laboratorio-eg/                 # Aplicación principal
│   ├── server/                     # Backend API
│   │   ├── config/
│   │   │   └── pg-listener.js      # ⭐ NUEVO
│   │   ├── models/
│   │   │   └── index.js            # ⭐ MODIFICADO
│   │   ├── routes/
│   │   │   └── api.js              # ⭐ MODIFICADO
│   │   └── index.js                # ⭐ MODIFICADO
│   ├── src/                        # Frontend React
│   └── public/data/
│       └── precios.json            # Auto-generado
│
├── sync-service/                   # Servicio de sincronización
│   ├── .env                        # ⭐ MODIFICADO
│   ├── src/
│   │   ├── services/
│   │   │   └── postgres-listener.js
│   │   └── storage/
│   │       └── file-service.js
│   └── output/
│       └── precios.json
│
└── Documentación/
    ├── RESUMEN-EJECUTIVO.md        # ⭐ Este resumen
    ├── README-INICIO-RAPIDO.md     # ⭐ Guía rápida
    ├── DIAGRAMA-FLUJO.md           # ⭐ Diagramas
    ├── SINCRONIZACION-AUTOMATICA.md # ⭐ Doc completa
    ├── INDICE-DOCUMENTACION.md     # ⭐ Este archivo
    ├── PROCESO_SINCRONIZACION.md   # Versión anterior
    ├── DEPLOYMENT_PRODUCTION.md    # Deploy
    ├── DEPLOYMENT_SYNC_SERVICE_ONPREMISE.md
    └── CLAUDE.md                   # Notas de desarrollo
```

---

## ✅ Checklist de Lectura Recomendada

Para nuevo desarrollador:
- [ ] RESUMEN-EJECUTIVO.md (5 min)
- [ ] README-INICIO-RAPIDO.md (3 min)
- [ ] Iniciar servicios y probar
- [ ] DIAGRAMA-FLUJO.md (15 min)
- [ ] SINCRONIZACION-AUTOMATICA.md (30 min, secciones relevantes)

Para DevOps/Deployment:
- [ ] RESUMEN-EJECUTIVO.md
- [ ] SINCRONIZACION-AUTOMATICA.md → "Configuración de Producción"
- [ ] DEPLOYMENT_PRODUCTION.md
- [ ] DEPLOYMENT_SYNC_SERVICE_ONPREMISE.md

Para debugging:
- [ ] README-INICIO-RAPIDO.md → Troubleshooting
- [ ] SINCRONIZACION-AUTOMATICA.md → Troubleshooting
- [ ] SINCRONIZACION-AUTOMATICA.md → Monitoreo y Logs
- [ ] DIAGRAMA-FLUJO.md → Componentes Críticos

---

**Última actualización:** 22 de Octubre, 2025
**Sistema:** Sincronización Automática de Precios ✅ OPERATIVO
