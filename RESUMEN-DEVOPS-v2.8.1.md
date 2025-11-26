# 📋 Resumen para DevOps - Release v2.8.1

## 🎯 TL;DR (Resumen Ejecutivo)

**Versión**: v2.8.1 (Patch Release)
**Tipo**: Bug Fixes Críticos
**Downtime**: ~2-3 minutos
**Requiere Migración de BD**: ✅ SÍ (Simple - 5 INSERTs)
**Requiere Update de Node.js**: ✅ SÍ (v18 → v20)
**Breaking Changes**: ❌ NO

---

## ⚡ Quick Start (Para DevOps con prisa)

```bash
# 1. BACKUP (CRÍTICO)
PGPASSWORD=labsis pg_dump -h localhost -U labsis \
  -d lis_bot_comunicacion_elizabeth_gutierrez \
  -F c -f ~/backup_pre_v2.8.1.backup

# 2. MIGRAR BD
cd /path/to/laboratorio-eg-system/migrations
PGPASSWORD=labsis psql -h localhost -U labsis \
  -d lis_bot_comunicacion_elizabeth_gutierrez \
  -f RELEASE-v2.8.1-DB-MIGRATION.sql

# 3. DEPLOY CÓDIGO
git checkout main && git pull origin main
npm ci
npm run build --workspace=apps/web

# 4. RESTART SERVICIOS
pm2 stop all
rm -rf apps/config-api/cache/*
pm2 restart all

# 5. VERIFICAR
curl http://localhost:3005/api/navigation/location/sidebar | jq '.data | length'
# Debe retornar: 5
```

---

## 🔴 CRÍTICO - Leer Antes de Deployar

### 1. ⚠️ Node.js 20 es OBLIGATORIO

**Problema**: CI fallaba con `crypto.hash is not a function` en Node.js 18

**Acción Requerida**:
```bash
# Verificar versión de Node.js
node --version

# Si es < 20.19.0, actualizar:
# Ubuntu/Debian:
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# macOS:
brew upgrade node

# Verificar después de actualizar:
node --version  # Debe mostrar >= 20.19.0
```

### 2. 🗄️ Migración de Base de Datos es OBLIGATORIA

**Qué hace la migración**:
- Inserta 5 items de navegación en tabla `navigation_items` con `location='sidebar'`
- Items: Inicio, Estudios, Resultados, Nosotros, Contacto
- Sin estos items, el sidebar mobile aparece vacío

**Base de datos afectada**: `lis_bot_comunicacion_elizabeth_gutierrez`

**Script**: `migrations/RELEASE-v2.8.1-DB-MIGRATION.sql`

**Verificación**:
```sql
SELECT COUNT(*) FROM navigation_items WHERE location = 'sidebar';
-- Debe retornar: 5
```

### 3. 🔄 Config-API DEBE ser Reiniciado

**Por qué**: El caché interno retiene los datos viejos de navegación

**Cómo**:
```bash
pm2 stop config-api
rm -rf apps/config-api/cache/*
pm2 start config-api
```

---

## 📊 Detalles Técnicos del Release

### Cambios de Código

| Archivo | Cambio | Impacto |
|---------|--------|---------|
| `Header.jsx` | Restaurado hamburger button | Mobile nav funciona |
| `Sidebar.jsx` | Z-index z-40 → z-50 | Sidebar visible sobre contenido |
| `Sidebar.jsx` | Overlay bg-black/20 → bg-black/50 | Mejor contraste |
| `NavigationDropdown.jsx` | **ELIMINADO** | Simplificación de código |
| `.github/workflows/01-ci-tests.yml` | Node.js 18 → 20 | CI builds pasan |

### Cambios de Base de Datos

**Tabla**: `navigation_items`
**Operación**: INSERT (5 filas nuevas)
**Location**: `sidebar`

```sql
-- Items insertados:
1. Inicio       → /
2. Estudios     → /estudios
3. Resultados   → /resultados
4. Nosotros     → /#nosotros
5. Contacto     → /#contacto
```

**ON CONFLICT**: `DO NOTHING` (safe para re-ejecución)

---

## ✅ Checklist de Deployment (Copia/Pega)

```
Pre-Deployment:
□ Node.js 20+ instalado y verificado
□ Backup de BD completado
□ PM2 corriendo
□ Acceso SSH al servidor

Deployment:
□ git pull origin main ejecutado
□ Tag v2.8.1 verificado
□ Migración de BD ejecutada
□ 5 items de sidebar verificados en BD
□ npm ci ejecutado
□ npm run build completado
□ Caché de config-api limpiado
□ pm2 restart all ejecutado

Post-Deployment:
□ curl http://localhost:3005/health (debe retornar ok)
□ curl http://localhost:3005/api/navigation/location/sidebar (debe retornar 5 items)
□ Sidebar mobile probado en iPhone/iPad
□ Logs monitoreados por 1 hora
```

---

## 🚨 Problemas Comunes y Soluciones

### Problema 1: "crypto.hash is not a function"

**Causa**: Node.js 18 instalado

**Solución**:
```bash
node --version  # Verificar versión
# Si es < 20, actualizar Node.js a 20+
npm ci  # Reinstalar dependencias
npm run build --workspace=apps/web  # Rebuild
```

### Problema 2: Sidebar aparece vacío en mobile

**Causa**: Migración de BD no ejecutada o caché de config-api

**Solución**:
```bash
# Verificar BD
PGPASSWORD=labsis psql -h localhost -U labsis \
  -d lis_bot_comunicacion_elizabeth_gutierrez \
  -c "SELECT COUNT(*) FROM navigation_items WHERE location = 'sidebar';"

# Si retorna 0, ejecutar migración
cd migrations
PGPASSWORD=labsis psql -h localhost -U labsis \
  -d lis_bot_comunicacion_elizabeth_gutierrez \
  -f RELEASE-v2.8.1-DB-MIGRATION.sql

# Limpiar caché y reiniciar
pm2 stop config-api
rm -rf apps/config-api/cache/*
pm2 start config-api
```

### Problema 3: Build falla con Vite error

**Causa**: Node.js version antigua o dependencias desactualizadas

**Solución**:
```bash
# Limpiar todo
rm -rf node_modules package-lock.json
rm -rf apps/*/node_modules

# Reinstalar con Node.js 20
node --version  # Verificar >= 20.19.0
npm ci
npm run build --workspace=apps/web
```

### Problema 4: Config-API no responde después de restart

**Causa**: Base de datos no accesible o permisos

**Solución**:
```bash
# Ver logs
pm2 logs config-api --lines 100

# Verificar conexión a BD
psql -h localhost -U labsis -d lis_bot_comunicacion_elizabeth_gutierrez -c "SELECT 1;"

# Verificar puerto
lsof -i :3005
```

---

## 🔙 Rollback Rápido

Si algo sale muy mal:

```bash
# 1. Detener servicios
pm2 stop all

# 2. Rollback de BD
PGPASSWORD=labsis psql -h localhost -U labsis \
  -d lis_bot_comunicacion_elizabeth_gutierrez \
  -c "DELETE FROM navigation_items WHERE location = 'sidebar';"

# 3. Restaurar backup de BD
PGPASSWORD=labsis pg_restore -h localhost -U labsis \
  -d lis_bot_comunicacion_elizabeth_gutierrez -c \
  ~/backup_pre_v2.8.1.backup

# 4. Rollback de código
git checkout v2.8.0
npm ci
npm run build --workspace=apps/web

# 5. Restart
pm2 restart all
```

---

## 📞 Contacto y Escalación

**Si encuentras problemas**:

1. ✅ Revisar logs: `pm2 logs config-api --lines 200`
2. ✅ Verificar health: `curl http://localhost:3005/health`
3. ✅ Consultar documentación completa: `DEPLOYMENT-v2.8.1-INSTRUCCIONES-DEVOPS.md`
4. 🆘 Si persiste: **Ejecutar rollback completo** (ver sección anterior)

---

## 📂 Archivos de Referencia

1. **Migración de BD**: `/migrations/RELEASE-v2.8.1-DB-MIGRATION.sql`
2. **Instrucciones Completas**: `/DEPLOYMENT-v2.8.1-INSTRUCCIONES-DEVOPS.md`
3. **Documentación del Fix**: `/FIX-SIDEBAR-NAVIGATION.md`
4. **PR en GitHub**: https://github.com/saqh5037/laboratorio-eg-system/pull/2

---

## ⏱️ Timeline Estimado

- **Pre-deployment checks**: 5 min
- **Backup de BD**: 2 min
- **Migración de BD**: 1 min
- **Deploy código**: 3 min
- **Build**: 2 min
- **Restart servicios**: 2 min
- **Verificaciones**: 5 min

**TOTAL**: ~20 minutos
**Downtime**: ~2-3 minutos (durante restart de PM2)

---

## ✅ Estado Final Esperado

Después del deployment exitoso:

```bash
$ pm2 list
┌────┬──────────────┬─────────┬─────┬──────────┐
│ id │ name         │ status  │ ↺   │ cpu      │
├────┼──────────────┼─────────┼─────┼──────────┤
│ 0  │ config-api   │ online  │ 0   │ 0%       │
│ 1  │ web-server   │ online  │ 0   │ 0%       │
│ 2  │ results-api  │ online  │ 0   │ 0%       │
└────┴──────────────┴─────────┴─────┴──────────┘

$ curl http://localhost:3005/api/navigation/location/sidebar | jq '.data | length'
5

$ curl http://localhost:3005/health
{"status":"ok","database":"connected"}

✅ Release v2.8.1 Deployed Successfully
```

---

**Última actualización**: 2025-11-22
**Preparado por**: Claude Code
**Review**: Pendiente por DevOps Team

🚀 **Listo para Production Deployment**
