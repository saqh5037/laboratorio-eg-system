# 🚀 Deployment Instructions - Release v2.8.1

## 📋 Información del Release

- **Versión**: v2.8.1 (Patch Release)
- **Tipo**: Bug Fixes + CI Improvements
- **Fecha**: 2025-11-22
- **Branch**: `develop` → `main`
- **Tag anterior**: v2.8.0
- **PR**: #2

## 🎯 Resumen Ejecutivo

Este release incluye **fixes críticos** para el menú de navegación móvil que no mostraba opciones en iPhone/iPad, y actualización del CI a Node.js 20 para compatibilidad con Vite.

### Cambios Principales
1. ✅ Fix sidebar navigation vacío en mobile/iPad
2. ✅ Actualización CI: Node.js v18 → v20
3. ✅ Mejoras de z-index y overlay del sidebar
4. ✅ Eliminación de componente NavigationDropdown

---

## 📦 Pre-requisitos

### Software Requerido
- ✅ Node.js **20.19+** o **22.12+** (IMPORTANTE: Ya no soportamos Node.js 18)
- ✅ PostgreSQL 13+ con acceso a base de datos `lis_bot_comunicacion_elizabeth_gutierrez`
- ✅ PM2 para gestión de procesos
- ✅ Git con acceso al repositorio

### Verificaciones Previas
```bash
# Verificar versión de Node.js
node --version  # Debe ser >= 20.19.0

# Verificar conexión a PostgreSQL
psql -h localhost -U labsis -d lis_bot_comunicacion_elizabeth_gutierrez -c "SELECT version();"

# Verificar servicios corriendo
pm2 list
```

---

## 🗄️ PASO 1: Migración de Base de Datos

### ⚠️ CRÍTICO: Backup Antes de Migrar

```bash
# 1. Crear directorio de backups si no existe
mkdir -p ~/backups/$(date +%Y-%m-%d)

# 2. Backup completo de la base de datos
PGPASSWORD=labsis pg_dump \
  -h localhost \
  -U labsis \
  -d lis_bot_comunicacion_elizabeth_gutierrez \
  -F c \
  -f ~/backups/$(date +%Y-%m-%d)/lis_bot_comunicacion_elizabeth_gutierrez_pre_v2.8.1.backup

# 3. Verificar que el backup se creó correctamente
ls -lh ~/backups/$(date +%Y-%m-%d)/

echo "✅ Backup completado: ~/backups/$(date +%Y-%m-%d)/lis_bot_comunicacion_elizabeth_gutierrez_pre_v2.8.1.backup"
```

### 🔧 Ejecutar Migración

```bash
# 1. Navegar al directorio de migraciones
cd /path/to/laboratorio-eg-system/migrations

# 2. Ejecutar script de migración
PGPASSWORD=labsis psql \
  -h localhost \
  -U labsis \
  -d lis_bot_comunicacion_elizabeth_gutierrez \
  -f RELEASE-v2.8.1-DB-MIGRATION.sql

# Salida esperada:
# =========================================
# Release v2.8.1 - DB Migration
# =========================================
#
# 1. Verificando estado actual...
# 2. Verificando items de sidebar...
# 3. Insertando items de navegación...
# 4. Verificando resultado...
# 5. Conteo final...
#
# Migración completada exitosamente
```

### ✅ Verificación Post-Migración

```bash
# Verificar que los 5 items de sidebar fueron insertados
PGPASSWORD=labsis psql -h localhost -U labsis -d lis_bot_comunicacion_elizabeth_gutierrez -c \
  "SELECT id, label, url, icon FROM navigation_items WHERE location = 'sidebar' ORDER BY sort_order;"

# Salida esperada:
#  id |   label    |     url     |     icon
# ----+------------+-------------+--------------
#  10 | Inicio     | /           | Home
#  11 | Estudios   | /estudios   | FlaskConical
#  12 | Resultados | /resultados | FileBarChart
#  13 | Nosotros   | /#nosotros  | Info
#  14 | Contacto   | /#contacto  | Mail
# (5 rows)
```

---

## 📥 PASO 2: Deployment del Código

### 2.1. Pull del Código

```bash
# Navegar al directorio del proyecto
cd /path/to/laboratorio-eg-system

# Hacer backup del código actual
cp -r . ../laboratorio-eg-system_backup_$(date +%Y%m%d_%H%M%S)

# Pull de los cambios
git fetch origin
git checkout main
git pull origin main

# Verificar que estamos en el tag correcto
git describe --tags
# Debe mostrar: v2.8.1
```

### 2.2. Instalación de Dependencias

```bash
# Instalar dependencias (con Node.js 20+)
npm ci

# Verificar que no haya vulnerabilidades críticas
npm audit --audit-level=high

# Si hay vulnerabilidades, aplicar fixes automáticos
npm audit fix
```

### 2.3. Build de Producción

```bash
# Build del frontend
npm run build --workspace=apps/web

# Verificar que el build fue exitoso
ls -la apps/web/dist/

# Debe mostrar:
# - index.html
# - assets/ (con archivos JS y CSS)
# - favicon.ico
# - manifest.webmanifest
```

---

## 🔄 PASO 3: Reinicio de Servicios

### 3.1. Detener Servicios

```bash
# Detener todos los servicios PM2
pm2 stop all

# Verificar que están detenidos
pm2 list
```

### 3.2. Limpiar Caché del Config-API

```bash
# Eliminar archivos de caché temporales
rm -rf apps/config-api/cache/*
rm -rf apps/config-api/.cache/*

# Si usan Redis, limpiar el caché
# redis-cli FLUSHDB  # ⚠️ SOLO si tienen Redis dedicado para config
```

### 3.3. Reiniciar Servicios con PM2

```bash
# Opción 1: Reiniciar todos los servicios
pm2 restart all

# Opción 2: Reiniciar servicios específicos uno por uno
pm2 restart config-api    # Puerto 3005
pm2 restart web-server    # Puerto 3001
pm2 restart results-api   # Puerto 3003
pm2 restart frontend      # Puerto 5173 (si aplica)

# Verificar que todos estén corriendo
pm2 list

# Debe mostrar todos los servicios en estado "online"
```

### 3.4. Verificar Logs

```bash
# Ver logs en tiempo real
pm2 logs

# Ver logs de config-api específicamente
pm2 logs config-api

# Buscar errores
pm2 logs | grep -i error
```

---

## ✅ PASO 4: Verificaciones Post-Deployment

### 4.1. Health Checks de APIs

```bash
# 1. Config API (Puerto 3005)
curl http://localhost:3005/health
# Esperado: {"status":"ok","timestamp":"...","services":{"database":"connected"}}

# 2. Verificar endpoint de navegación
curl http://localhost:3005/api/navigation/location/sidebar | jq '.'
# Esperado: Array con 5 items de sidebar

# 3. Web API (Puerto 3001)
curl http://localhost:3001/health
# Esperado: {"status":"healthy"}

# 4. Results API (Puerto 3003)
curl http://localhost:3003/health
# Esperado: {"status":"ok"}
```

### 4.2. Verificar Frontend

```bash
# Verificar que el frontend sirva correctamente
curl -I http://localhost:5173/
# Esperado: HTTP/1.1 200 OK

# Verificar que los assets estén compilados
ls -la apps/web/dist/assets/
# Debe mostrar archivos .js y .css con hash
```

### 4.3. Testing Funcional del Sidebar

**Testing Manual en Dispositivos Móviles:**

1. **iPhone (< 640px)**:
   - ✅ Abrir http://your-domain.com en Safari mobile
   - ✅ Verificar que aparece botón hamburguesa [☰]
   - ✅ Click en hamburguesa → debe aparecer sidebar
   - ✅ Verificar que se ven 5 opciones: Inicio, Estudios, Resultados, Nosotros, Contacto
   - ✅ Click en cualquier opción → debe navegar correctamente
   - ✅ Verificar que el overlay oscuro aparece detrás del sidebar

2. **iPad (640px-1023px)**:
   - ✅ Abrir http://your-domain.com en Safari iPad
   - ✅ Verificar botón hamburguesa [☰ MENÚ]
   - ✅ Same as iPhone tests

3. **Desktop (≥ 1024px)**:
   - ✅ Verificar que NO aparece botón hamburguesa
   - ✅ Verificar que aparece menú horizontal en el header
   - ✅ Sidebar NO debe estar visible

---

## 🔙 PASO 5: Rollback (Solo en caso de Emergencia)

### Si algo sale mal, ejecutar en este orden:

```bash
# 1. Detener servicios
pm2 stop all

# 2. Restaurar código anterior
cd /path/to
rm -rf laboratorio-eg-system
mv laboratorio-eg-system_backup_YYYYMMDD_HHMMSS laboratorio-eg-system
cd laboratorio-eg-system

# 3. Rollback de base de datos
PGPASSWORD=labsis pg_restore \
  -h localhost \
  -U labsis \
  -d lis_bot_comunicacion_elizabeth_gutierrez \
  -c \
  ~/backups/YYYY-MM-DD/lis_bot_comunicacion_elizabeth_gutierrez_pre_v2.8.1.backup

# 4. Reiniciar servicios
pm2 restart all

# 5. Verificar
pm2 list
curl http://localhost:3005/health
```

### Rollback Manual de DB (Alternativo)

```sql
-- Conectar a la base de datos
psql -h localhost -U labsis -d lis_bot_comunicacion_elizabeth_gutierrez

-- Eliminar items de sidebar insertados
DELETE FROM navigation_items WHERE location = 'sidebar';

-- Verificar
SELECT COUNT(*) FROM navigation_items WHERE location = 'sidebar';
-- Debe retornar 0
```

---

## 📊 Monitoreo Post-Deployment

### Métricas a Monitorear (Primeras 24 horas)

1. **Logs de Errores**:
   ```bash
   # Monitorear errores en config-api
   pm2 logs config-api --err --lines 100

   # Monitorear errores en frontend
   pm2 logs web-server --err --lines 100
   ```

2. **Performance del Endpoint de Navegación**:
   ```bash
   # Medir tiempo de respuesta
   time curl -s http://localhost:3005/api/navigation/location/sidebar > /dev/null
   # Debe ser < 100ms
   ```

3. **Uso de Memoria**:
   ```bash
   pm2 monit
   # Verificar que config-api no esté usando memoria excesiva
   ```

4. **Acceso a Logs del Sistema**:
   ```bash
   # Ver logs de nginx (si aplica)
   tail -f /var/log/nginx/access.log | grep "navigation"
   ```

---

## 📝 Checklist de Deployment

**Pre-Deployment:**
- [ ] Node.js 20+ instalado y verificado
- [ ] Backup de base de datos completado
- [ ] Backup de código fuente completado
- [ ] PM2 corriendo y servicios identificados

**Deployment:**
- [ ] Migración de BD ejecutada exitosamente
- [ ] 5 items de sidebar verificados en BD
- [ ] Código pulled desde `main` branch
- [ ] Tag v2.8.1 verificado
- [ ] `npm ci` ejecutado
- [ ] Build de producción completado
- [ ] Caché de config-api limpiado

**Post-Deployment:**
- [ ] Servicios PM2 reiniciados
- [ ] Health checks pasando (3005, 3001, 3003)
- [ ] Endpoint `/api/navigation/location/sidebar` retorna 5 items
- [ ] Frontend accesible
- [ ] Testing manual en iPhone completado
- [ ] Testing manual en iPad completado
- [ ] Testing manual en Desktop completado
- [ ] Logs monitoreados por 1 hora sin errores

**Rollback Plan:**
- [ ] Procedimiento de rollback documentado
- [ ] Backups accesibles y verificados
- [ ] Equipo de DevOps notificado

---

## 🆘 Contacto y Soporte

**En caso de problemas durante el deployment:**

1. **Revisar logs**:
   ```bash
   pm2 logs config-api --lines 200
   pm2 logs web-server --lines 200
   ```

2. **Verificar conectividad de DB**:
   ```bash
   psql -h localhost -U labsis -d lis_bot_comunicacion_elizabeth_gutierrez -c "SELECT 1;"
   ```

3. **Verificar permisos**:
   ```bash
   ls -la apps/web/dist/
   ls -la apps/config-api/
   ```

4. **Si persisten problemas**: Ejecutar rollback completo

---

## 📌 Notas Adicionales

### Breaking Changes
❌ **Ninguno** - Este es un patch release completamente compatible con v2.8.0

### Downtime Esperado
⏱️ **~2-3 minutos** durante el reinicio de servicios PM2

### Node.js 18 Deprecation
⚠️ **Node.js 18 ya no es soportado** debido a Vite y @vitejs/plugin-legacy que requieren crypto.hash (disponible solo en Node.js 20+)

---

## ✅ Deployment Exitoso

Al completar todos los pasos, deberías ver:

```bash
pm2 list
# ┌────┬────────────────┬──────────┬──────┬───────────┬──────────┐
# │ id │ name           │ mode     │ ↺    │ status    │ cpu      │
# ├────┼────────────────┼──────────┼──────┼───────────┼──────────┤
# │ 0  │ config-api     │ fork     │ 0    │ online    │ 0%       │
# │ 1  │ web-server     │ fork     │ 0    │ online    │ 0%       │
# │ 2  │ results-api    │ fork     │ 0    │ online    │ 0%       │
# └────┴────────────────┴──────────┴──────┴───────────┴──────────┘

curl http://localhost:3005/api/navigation/location/sidebar | jq '.data | length'
# 5  ← Debe retornar 5 items

# ✅ Deployment v2.8.1 Completado Exitosamente
```

---

**Generado con Claude Code**
**Fecha**: 2025-11-22
**Release**: v2.8.1
