# 📋 INSTRUCCIONES COMPLETAS DE DEPLOYMENT - Release v2.7.0
## Sistema de Laboratorio Clínico - Laboratorio Elizabeth Gutiérrez

---

## 📌 INFORMACIÓN DEL RELEASE

- **Versión**: v2.7.0
- **Commit**: `22b3b78`
- **Branch**: `develop`
- **Release URL**: https://github.com/saqh5037/laboratorio-eg-system/releases/tag/v2.7.0
- **Repositorio**: `github.com/saqh5037/laboratorio-eg-system.git`
- **Fecha**: 2025-11-22

---

## 🗄️ ARQUITECTURA DE BASE DE DATOS EN PRODUCCIÓN

### Base de Datos 1: `labsisEGProduccion`
- **Tipo**: Solo lectura (réplica)
- **Propósito**: Consulta de datos de LABSIS (órdenes, pacientes, resultados)
- **Migraciones**: ❌ NINGUNA - No ejecutar migraciones en esta DB

### Base de Datos 2: `lis_bot_comunicacionEG`
- **Tipo**: Lectura/Escritura (principal)
- **Propósito**: Configuraciones, landing page, bot, temas, PWA, auditoría
- **Migraciones**: ✅ TODAS las 38 migraciones se ejecutan aquí

---

## 🗄️ MIGRACIONES DE BASE DE DATOS (38 TOTAL)

**IMPORTANTE**:
- Todas las migraciones se ejecutan en `lis_bot_comunicacionEG`
- Deben ejecutarse en el orden especificado
- Sin estas migraciones, la aplicación NO funcionará

---

### FASE 1: Infraestructura Bot y Comunicación (6 migraciones)

```bash
# Migración 1: Tablas core del bot (conversaciones, mensajes, órdenes)
PGPASSWORD='<PASSWORD>' psql -h <HOST> -U <USER> -d lis_bot_comunicacionEG \
  -f apps/messaging-bot/migrations/lis_bot_comunicacion/001_bot_core_tables.sql

# Migración 2: Autenticación vía Telegram
PGPASSWORD='<PASSWORD>' psql -h <HOST> -U <USER> -d lis_bot_comunicacionEG \
  -f apps/messaging-bot/migrations/lis_bot_comunicacion/002_telegram_auth_tables.sql

# Migración 3: Tokens de autorización Telegram (deep links)
PGPASSWORD='<PASSWORD>' psql -h <HOST> -U <USER> -d lis_bot_comunicacionEG \
  -f apps/messaging-bot/migrations/lis_bot_comunicacion/003_telegram_authorization_tokens.sql

# Migración 4: Integración WhatsApp con Twilio
PGPASSWORD='<PASSWORD>' psql -h <HOST> -U <USER> -d lis_bot_comunicacionEG \
  -f apps/messaging-bot/migrations/lis_bot_comunicacion/006_whatsapp_integration.sql

# Migración 5: Cola de notificaciones asincrónicas
PGPASSWORD='<PASSWORD>' psql -h <HOST> -U <USER> -d lis_bot_comunicacionEG \
  -f apps/messaging-bot/migrations/lis_bot_comunicacion/007_notifications_queue.sql

# Migración 6: Códigos de verificación (SMS/Telegram)
PGPASSWORD='<PASSWORD>' psql -h <HOST> -U <USER> -d lis_bot_comunicacionEG \
  -f apps/messaging-bot/migrations/lis_bot_comunicacion/007_verification_codes.sql
```

---

### FASE 2: Sistema de Configuración Centralizada (4 migraciones)

```bash
# Migración 7: Tabla principal de configuración del sistema
PGPASSWORD='<PASSWORD>' psql -h <HOST> -U <USER> -d lis_bot_comunicacionEG \
  -f packages/database/lis_bot_comunicacion/010_create_system_config.sql

# Migración 8: Auditoría de cambios en configuración
PGPASSWORD='<PASSWORD>' psql -h <HOST> -U <USER> -d lis_bot_comunicacionEG \
  -f packages/database/lis_bot_comunicacion/011_create_system_config_audit.sql

# Migración 9: Usuarios administrativos del sistema
PGPASSWORD='<PASSWORD>' psql -h <HOST> -U <USER> -d lis_bot_comunicacionEG \
  -f packages/database/lis_bot_comunicacion/012_create_admin_users.sql

# Migración 10: SEED - Configuración por defecto del sistema
PGPASSWORD='<PASSWORD>' psql -h <HOST> -U <USER> -d lis_bot_comunicacionEG \
  -f packages/database/lis_bot_comunicacion/013_seed_default_config.sql
```

---

### FASE 3: Landing Page - Contenido (9 migraciones) ⭐ CRÍTICO

**IMPORTANTE**: Sin estas migraciones, la landing page NO funcionará.

```bash
# Migración 11: Tabla de slides del carrusel (Hero)
PGPASSWORD='<PASSWORD>' psql -h <HOST> -U <USER> -d lis_bot_comunicacionEG \
  -f apps/config-api/migrations/014_create_carousel_slides.sql

# Migración 12: Valores corporativos (Calidad, Confianza, Compromiso, etc.)
PGPASSWORD='<PASSWORD>' psql -h <HOST> -U <USER> -d lis_bot_comunicacionEG \
  -f apps/config-api/migrations/015_create_landing_values.sql

# Migración 13: Certificaciones (ISO 9001, MPPS, Bioanalistas)
PGPASSWORD='<PASSWORD>' psql -h <HOST> -U <USER> -d lis_bot_comunicacionEG \
  -f apps/config-api/migrations/016_create_landing_certifications.sql

# Migración 14: Testimonios de pacientes
PGPASSWORD='<PASSWORD>' psql -h <HOST> -U <USER> -d lis_bot_comunicacionEG \
  -f apps/config-api/migrations/017_create_landing_testimonials.sql

# Migración 15: Información de contacto (teléfonos, emails, dirección, horarios)
PGPASSWORD='<PASSWORD>' psql -h <HOST> -U <USER> -d lis_bot_comunicacionEG \
  -f apps/config-api/migrations/018_create_landing_contact_info.sql

# Migración 16: Bloques de contenido (textos de historia, propósito, etc.)
PGPASSWORD='<PASSWORD>' psql -h <HOST> -U <USER> -d lis_bot_comunicacionEG \
  -f apps/config-api/migrations/019_create_landing_content_blocks.sql

# Migración 17: Estadísticas para CTA (43 años, 200+ estudios, 24h resultados)
PGPASSWORD='<PASSWORD>' psql -h <HOST> -U <USER> -d lis_bot_comunicacionEG \
  -f apps/config-api/migrations/020_create_landing_statistics.sql

# Migración 18: SEED - Datos iniciales de Elizabeth Gutiérrez
PGPASSWORD='<PASSWORD>' psql -h <HOST> -U <USER> -d lis_bot_comunicacionEG \
  -f apps/config-api/migrations/021_seed_lab_eg_default_data.sql

# Migración 19: Tabla de secciones de landing (estructura dinámica)
PGPASSWORD='<PASSWORD>' psql -h <HOST> -U <USER> -d lis_bot_comunicacionEG \
  -f apps/config-api/migrations/022_create_landing_sections.sql
```

---

### FASE 4: Config API - Sistema Multi-Laboratorio (13 migraciones)

```bash
# Migración 20: Añadir campos de iconos al carrusel
PGPASSWORD='<PASSWORD>' psql -h <HOST> -U <USER> -d lis_bot_comunicacionEG \
  -f apps/config-api/migrations/lis_bot_comunicacion/015_add_carousel_icon_fields.sql

# Migración 21: Tabla de configuración de temas (colores, tipografía, logos)
PGPASSWORD='<PASSWORD>' psql -h <HOST> -U <USER> -d lis_bot_comunicacionEG \
  -f apps/config-api/migrations/lis_bot_comunicacion/016_create_theme_config.sql

# Migración 22: Información de compañía/laboratorio
PGPASSWORD='<PASSWORD>' psql -h <HOST> -U <USER> -d lis_bot_comunicacionEG \
  -f apps/config-api/migrations/lis_bot_comunicacion/022_create_company_info.sql

# Migración 23: Items de navegación personalizables
PGPASSWORD='<PASSWORD>' psql -h <HOST> -U <USER> -d lis_bot_comunicacionEG \
  -f apps/config-api/migrations/lis_bot_comunicacion/023_create_navigation_items.sql

# Migración 24: SEED - Slides del carrusel para Elizabeth Gutiérrez
PGPASSWORD='<PASSWORD>' psql -h <HOST> -U <USER> -d lis_bot_comunicacionEG \
  -f apps/config-api/migrations/lis_bot_comunicacion/023_seed_carousel_slides_eg.sql

# Migración 25: SEED - Items de navegación para Elizabeth Gutiérrez
PGPASSWORD='<PASSWORD>' psql -h <HOST> -U <USER> -d lis_bot_comunicacionEG \
  -f apps/config-api/migrations/lis_bot_comunicacion/024_seed_navigation_items_eg.sql

# Migración 26: SEED - Actualización de datos a estado actual
PGPASSWORD='<PASSWORD>' psql -h <HOST> -U <USER> -d lis_bot_comunicacionEG \
  -f apps/config-api/migrations/lis_bot_comunicacion/024_update_seeds_to_match_current.sql

# Migración 27: Añadir campos para URLs de logos
PGPASSWORD='<PASSWORD>' psql -h <HOST> -U <USER> -d lis_bot_comunicacionEG \
  -f apps/config-api/migrations/lis_bot_comunicacion/025_add_logo_urls.sql

# Migración 28: SEED - Usuario admin por defecto
PGPASSWORD='<PASSWORD>' psql -h <HOST> -U <USER> -d lis_bot_comunicacionEG \
  -f apps/config-api/migrations/lis_bot_comunicacion/025_seed_admin_user_eg.sql

# Migración 29: Sistema de backups de configuración
PGPASSWORD='<PASSWORD>' psql -h <HOST> -U <USER> -d lis_bot_comunicacionEG \
  -f apps/config-api/migrations/lis_bot_comunicacion/026_create_configuration_backups.sql

# Migración 30: Tabla de configuración del sistema
PGPASSWORD='<PASSWORD>' psql -h <HOST> -U <USER> -d lis_bot_comunicacionEG \
  -f apps/config-api/migrations/lis_bot_comunicacion/027_create_system_config.sql

# Migración 31: Tabla de auditoría de cambios en config
PGPASSWORD='<PASSWORD>' psql -h <HOST> -U <USER> -d lis_bot_comunicacionEG \
  -f apps/config-api/migrations/lis_bot_comunicacion/028_create_config_audit.sql

# Migración 32: Añadir items de navegación para estudios y resultados
PGPASSWORD='<PASSWORD>' psql -h <HOST> -U <USER> -d lis_bot_comunicacionEG \
  -f apps/config-api/migrations/lis_bot_comunicacion/029_add_estudios_resultados_navigation.sql
```

---

### FASE 5: Seeds de Carrusel (3 migraciones)

```bash
# Migración 33: SEED - Slides iniciales del carrusel
PGPASSWORD='<PASSWORD>' psql -h <HOST> -U <USER> -d lis_bot_comunicacionEG \
  -f apps/config-api/seeds/001_carousel_initial_slides.sql

# Migración 34: SEED - Actualización completa de slides
PGPASSWORD='<PASSWORD>' psql -h <HOST> -U <USER> -d lis_bot_comunicacionEG \
  -f apps/config-api/seeds/002_update_carousel_slides_full.sql

# Migración 35: SEED - Iconos para slides del carrusel
PGPASSWORD='<PASSWORD>' psql -h <HOST> -U <USER> -d lis_bot_comunicacionEG \
  -f apps/config-api/seeds/003_update_carousel_icons.sql
```

---

### FASE 6: Sincronización de Datos (3 migraciones)

```bash
# Migración 36: Tabla de changelog para sincronización
PGPASSWORD='<PASSWORD>' psql -h <HOST> -U <USER> -d lis_bot_comunicacionEG \
  -f packages/database/sync/001_create_changelog.sql

# Migración 37: Triggers para detectar cambios automáticamente
PGPASSWORD='<PASSWORD>' psql -h <HOST> -U <USER> -d lis_bot_comunicacionEG \
  -f packages/database/sync/002_create_trigger.sql

# Migración 38: Índices para optimización de sincronización
PGPASSWORD='<PASSWORD>' psql -h <HOST> -U <USER> -d lis_bot_comunicacionEG \
  -f packages/database/sync/003_create_indexes.sql
```

---

## 🔧 SCRIPT AUTOMATIZADO DE MIGRACIONES

Para facilitar el proceso, aquí está un script bash que ejecuta todas las migraciones:

```bash
#!/bin/bash
# run_all_migrations_v2.7.0.sh

set -e  # Exit on error

# ===== CONFIGURACIÓN =====
DB_HOST="${DB_HOST:-localhost}"
DB_USER="${DB_USER:-labsis}"
DB_PASS="${DB_PASS:-labsis}"
DB_NAME="lis_bot_comunicacionEG"
PROJECT_DIR="${PROJECT_DIR:-~/laboratorio-eg-system}"

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   MIGRACIONES v2.7.0${NC}"
echo -e "${BLUE}   Base de datos: $DB_NAME${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

cd "$PROJECT_DIR"

# Función para ejecutar migración
run_migration() {
    local file=$1
    local description=$2
    local number=$3

    echo -e "${YELLOW}[$number/38]${NC} $description"
    echo -e "        Archivo: $file"

    if PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f "$file" > /dev/null 2>&1; then
        echo -e "        ${GREEN}✓ Completada${NC}"
    else
        echo -e "        ${RED}✗ ERROR${NC}"
        echo -e "${RED}Migración falló: $file${NC}"
        exit 1
    fi
    echo ""
}

echo -e "${BLUE}FASE 1: Infraestructura Bot (6 migraciones)${NC}"
echo ""
run_migration "apps/messaging-bot/migrations/lis_bot_comunicacion/001_bot_core_tables.sql" "Tablas core del bot" "1"
run_migration "apps/messaging-bot/migrations/lis_bot_comunicacion/002_telegram_auth_tables.sql" "Autenticación Telegram" "2"
run_migration "apps/messaging-bot/migrations/lis_bot_comunicacion/003_telegram_authorization_tokens.sql" "Tokens autorización Telegram" "3"
run_migration "apps/messaging-bot/migrations/lis_bot_comunicacion/006_whatsapp_integration.sql" "Integración WhatsApp" "4"
run_migration "apps/messaging-bot/migrations/lis_bot_comunicacion/007_notifications_queue.sql" "Cola de notificaciones" "5"
run_migration "apps/messaging-bot/migrations/lis_bot_comunicacion/007_verification_codes.sql" "Códigos de verificación" "6"

echo -e "${BLUE}FASE 2: Sistema de Configuración (4 migraciones)${NC}"
echo ""
run_migration "packages/database/lis_bot_comunicacion/010_create_system_config.sql" "Configuración del sistema" "7"
run_migration "packages/database/lis_bot_comunicacion/011_create_system_config_audit.sql" "Auditoría de configuración" "8"
run_migration "packages/database/lis_bot_comunicacion/012_create_admin_users.sql" "Usuarios administrativos" "9"
run_migration "packages/database/lis_bot_comunicacion/013_seed_default_config.sql" "SEED configuración por defecto" "10"

echo -e "${BLUE}FASE 3: Landing Page - Contenido (9 migraciones) ⭐${NC}"
echo ""
run_migration "apps/config-api/migrations/014_create_carousel_slides.sql" "Tabla carrusel" "11"
run_migration "apps/config-api/migrations/015_create_landing_values.sql" "Valores corporativos" "12"
run_migration "apps/config-api/migrations/016_create_landing_certifications.sql" "Certificaciones" "13"
run_migration "apps/config-api/migrations/017_create_landing_testimonials.sql" "Testimonios" "14"
run_migration "apps/config-api/migrations/018_create_landing_contact_info.sql" "Información de contacto" "15"
run_migration "apps/config-api/migrations/019_create_landing_content_blocks.sql" "Bloques de contenido" "16"
run_migration "apps/config-api/migrations/020_create_landing_statistics.sql" "Estadísticas CTA" "17"
run_migration "apps/config-api/migrations/021_seed_lab_eg_default_data.sql" "SEED datos Elizabeth Gutiérrez" "18"
run_migration "apps/config-api/migrations/022_create_landing_sections.sql" "Secciones de landing" "19"

echo -e "${BLUE}FASE 4: Config API Multi-Laboratorio (13 migraciones)${NC}"
echo ""
run_migration "apps/config-api/migrations/lis_bot_comunicacion/015_add_carousel_icon_fields.sql" "Campos de iconos carrusel" "20"
run_migration "apps/config-api/migrations/lis_bot_comunicacion/016_create_theme_config.sql" "Configuración de temas" "21"
run_migration "apps/config-api/migrations/lis_bot_comunicacion/022_create_company_info.sql" "Información de compañía" "22"
run_migration "apps/config-api/migrations/lis_bot_comunicacion/023_create_navigation_items.sql" "Items de navegación" "23"
run_migration "apps/config-api/migrations/lis_bot_comunicacion/023_seed_carousel_slides_eg.sql" "SEED slides EG" "24"
run_migration "apps/config-api/migrations/lis_bot_comunicacion/024_seed_navigation_items_eg.sql" "SEED navegación EG" "25"
run_migration "apps/config-api/migrations/lis_bot_comunicacion/024_update_seeds_to_match_current.sql" "SEED actualización datos" "26"
run_migration "apps/config-api/migrations/lis_bot_comunicacion/025_add_logo_urls.sql" "URLs de logos" "27"
run_migration "apps/config-api/migrations/lis_bot_comunicacion/025_seed_admin_user_eg.sql" "SEED usuario admin" "28"
run_migration "apps/config-api/migrations/lis_bot_comunicacion/026_create_configuration_backups.sql" "Sistema de backups" "29"
run_migration "apps/config-api/migrations/lis_bot_comunicacion/027_create_system_config.sql" "Configuración sistema" "30"
run_migration "apps/config-api/migrations/lis_bot_comunicacion/028_create_config_audit.sql" "Auditoría config" "31"
run_migration "apps/config-api/migrations/lis_bot_comunicacion/029_add_estudios_resultados_navigation.sql" "Nav estudios/resultados" "32"

echo -e "${BLUE}FASE 5: Seeds de Carrusel (3 migraciones)${NC}"
echo ""
run_migration "apps/config-api/seeds/001_carousel_initial_slides.sql" "SEED slides iniciales" "33"
run_migration "apps/config-api/seeds/002_update_carousel_slides_full.sql" "SEED slides completos" "34"
run_migration "apps/config-api/seeds/003_update_carousel_icons.sql" "SEED iconos slides" "35"

echo -e "${BLUE}FASE 6: Sincronización (3 migraciones)${NC}"
echo ""
run_migration "packages/database/sync/001_create_changelog.sql" "Tabla de changelog" "36"
run_migration "packages/database/sync/002_create_trigger.sql" "Triggers de cambios" "37"
run_migration "packages/database/sync/003_create_indexes.sql" "Índices de optimización" "38"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}   ✓ TODAS LAS MIGRACIONES COMPLETADAS${NC}"
echo -e "${GREEN}   38/38 ejecutadas exitosamente${NC}"
echo -e "${GREEN}========================================${NC}"
```

**Uso del script**:

```bash
# 1. Guardar el script
cat > run_all_migrations_v2.7.0.sh << 'SCRIPT'
# (pegar el contenido del script aquí)
SCRIPT

# 2. Dar permisos de ejecución
chmod +x run_all_migrations_v2.7.0.sh

# 3. Ejecutar con variables de entorno
DB_HOST="tu_host" \
DB_USER="tu_usuario" \
DB_PASS="tu_password" \
PROJECT_DIR="~/laboratorio-eg-system" \
./run_all_migrations_v2.7.0.sh
```

---

## ⚠️ INFORMACIÓN CRÍTICA SOBRE LA LANDING PAGE

### ¿Por qué son tan importantes las migraciones de landing?

La landing page del sistema es **100% dinámica** y se configura desde la base de datos.

**7 Tablas de Landing Page** (todas en `lis_bot_comunicacionEG`):

1. `landing_sections` - Estructura completa de la página
2. `landing_values` - Valores corporativos (Calidad, Confianza, etc.)
3. `landing_certifications` - Certificaciones y acreditaciones
4. `landing_testimonials` - Testimonios de pacientes
5. `landing_contact_info` - Teléfonos, emails, dirección, horarios, redes sociales
6. `landing_content_blocks` - Bloques de texto (historia, propósito, etc.)
7. `landing_statistics` - Estadísticas para CTA (43 años, 200+ estudios, etc.)

### Flujo de la Landing Page:

```
Base de Datos                    Config API                 Frontend
(lis_bot_comunicacionEG)        (puerto 3001)              (React)
       │                             │                          │
       │  SELECT * FROM              │                          │
       │  landing_sections...        │                          │
       ├────────────────────────────>│                          │
       │                             │  GET /api/landing        │
       │                             │<─────────────────────────┤
       │                             │                          │
       │                             │  JSON con toda la config │
       │                             ├─────────────────────────>│
       │                             │                          │
       │                             │                          │  Renderiza
       │                             │                          │  componentes
       │                             │                          │  dinámicos
```

### Sin las migraciones de landing:

- ❌ La página home mostrará errores
- ❌ No habrá contenido para mostrar
- ❌ El carrusel estará vacío
- ❌ Las secciones de "Nosotros", "Certificaciones", "Testimonios" no funcionarán
- ❌ El footer y contacto estarán vacíos

---

## 🚀 PROCESO COMPLETO DE DEPLOYMENT

### PRE-REQUISITOS

1. ✅ Acceso SSH al servidor configurado
2. ✅ Credenciales de base de datos `lis_bot_comunicacionEG`
3. ✅ PM2 instalado en el servidor
4. ✅ Node.js v18+ y npm instalados
5. ✅ PostgreSQL client (psql) instalado

---

### PASO 1: Conectar al Servidor

```bash
ssh <usuario>@<servidor>
```

---

### PASO 2: Navegar al Proyecto

```bash
cd ~/laboratorio-eg-system
# O la ubicación donde esté el proyecto
```

---

### PASO 3: Crear Backup COMPLETO

```bash
# Crear directorio de backups
mkdir -p ~/backups/v2.7.0

# Backup del commit actual
git rev-parse HEAD > ~/backups/v2.7.0/pre_deploy_commit.txt
echo "Commit backup guardado: $(cat ~/backups/v2.7.0/pre_deploy_commit.txt)"

# Backup de base de datos (MUY IMPORTANTE)
echo "Creando backup de base de datos..."
PGPASSWORD='<PASSWORD>' pg_dump \
  -h <HOST> \
  -U <USER> \
  -d lis_bot_comunicacionEG \
  --format=custom \
  --file=~/backups/v2.7.0/lis_bot_comunicacionEG_pre_v2.7.0.backup

echo "✓ Backup completado: ~/backups/v2.7.0/"
ls -lh ~/backups/v2.7.0/
```

---

### PASO 4: Fetch y Checkout de v2.7.0

```bash
# Fetch todos los tags
git fetch --all --tags

# Verificar que el tag existe
git tag -l | grep v2.7.0

# Checkout del tag v2.7.0
git checkout tags/v2.7.0

# Verificar que estás en el tag correcto
git describe --exact-match --tags
# Debe mostrar: v2.7.0

# Ver el commit
git log -1 --oneline
# Debe mostrar: 22b3b78 feat: Implementación completa de sistema dinámico...
```

---

### PASO 5: Instalar Dependencias

```bash
echo "Instalando dependencias..."

# Root
npm install

# Apps individuales
echo "- Frontend..."
cd apps/web && npm install && cd ../..

echo "- Config API..."
cd apps/config-api && npm install && cd ../..

echo "- Results API..."
cd apps/results-api && npm install && cd ../..

echo "- Messaging Bot..."
cd apps/messaging-bot && npm install && cd ../..

echo "- Sync Service..."
if [ -d "apps/sync-service" ]; then
  cd apps/sync-service && npm install && cd ../..
fi

echo "✓ Dependencias instaladas"
```

---

### PASO 6: Ejecutar las 38 Migraciones ⭐ CRÍTICO

**Opción A: Usar el script automatizado** (Recomendado)

```bash
# Copiar el script al servidor (ver script completo arriba)
cat > ~/run_migrations_v2.7.0.sh << 'SCRIPT'
# (pegar todo el script de migraciones aquí)
SCRIPT

chmod +x ~/run_migrations_v2.7.0.sh

# Ejecutar
DB_HOST="<tu_host>" \
DB_USER="<tu_usuario>" \
DB_PASS="<tu_password>" \
PROJECT_DIR="~/laboratorio-eg-system" \
./run_migrations_v2.7.0.sh
```

**Opción B: Ejecutar manualmente**

Si prefieres ejecutar una por una, copia los 38 comandos de las secciones FASE 1 a FASE 6 arriba.

---

### PASO 7: Verificar que las Migraciones se Aplicaron

```bash
# Verificar que las tablas existen
PGPASSWORD='<PASSWORD>' psql -h <HOST> -U <USER> -d lis_bot_comunicacionEG -c "
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'landing_%'
ORDER BY table_name;
"

# Deberías ver:
# landing_certifications
# landing_contact_info
# landing_content_blocks
# landing_sections
# landing_statistics
# landing_testimonials
# landing_values
```

---

### PASO 8: Build del Frontend

```bash
cd apps/web

echo "Ejecutando build de producción..."
npm run build

# Verificar que el build fue exitoso
if [ -d "dist" ]; then
  echo "✓ Build completado"
  echo "Archivos generados:"
  ls -lh dist/ | head -10
else
  echo "✗ ERROR: El directorio dist/ no fue creado"
  exit 1
fi

cd ../..
```

---

### PASO 9: Reiniciar Servicios PM2

```bash
# Ver estado actual
pm2 status

# Reiniciar todos los servicios
pm2 restart all

# O si es primera vez
# pm2 start ecosystem.config.js

# Guardar configuración
pm2 save

# Esperar a que se estabilicen
sleep 10

# Ver logs para verificar
pm2 logs --lines 30 --nostream
```

---

### PASO 10: Verificar Deployment

```bash
# Ver estado de PM2
pm2 status
# Todos deben estar en "online"

# Verificar logs en busca de errores
pm2 logs --err --lines 50 --nostream

# Verificar que no haya procesos crasheando
pm2 status | grep "errored\|stopped"
```

---

## ✅ CHECKLIST POST-DEPLOYMENT

Marcar cada punto:

### Git y Código
- [ ] `git describe --tags` muestra `v2.7.0`
- [ ] `git log -1` muestra commit `22b3b78`

### Base de Datos
- [ ] Las 38 migraciones se ejecutaron sin errores
- [ ] Tabla `landing_sections` existe y tiene datos
- [ ] Tabla `landing_values` existe y tiene datos
- [ ] Tabla `landing_certifications` existe y tiene datos
- [ ] Tabla `landing_testimonials` existe y tiene datos
- [ ] Tabla `landing_contact_info` existe y tiene datos
- [ ] Tabla `landing_content_blocks` existe y tiene datos
- [ ] Tabla `landing_statistics` existe y tiene datos

### Build y Archivos
- [ ] `apps/web/dist/` existe y contiene archivos
- [ ] `apps/web/dist/index.html` existe
- [ ] `apps/web/dist/sw.js` existe (Service Worker)
- [ ] `apps/web/dist/manifest.webmanifest` existe (PWA)

### Servicios PM2
- [ ] PM2 muestra todos los servicios como "online"
- [ ] No hay servicios en estado "errored" o "stopped"
- [ ] Logs de PM2 no muestran errores críticos

### Endpoints y Conectividad
- [ ] Frontend responde (verificar en navegador)
- [ ] Config API responde: `curl <URL_CONFIG_API>/health`
- [ ] Backend API responde: `curl <URL_BACKEND>/api/health`
- [ ] Landing page carga correctamente
- [ ] Landing page muestra carrusel (Hero)
- [ ] Landing page muestra valores corporativos
- [ ] Landing page muestra certificaciones
- [ ] Landing page muestra testimonios
- [ ] Landing page muestra información de contacto
- [ ] Footer muestra datos correctos

### PWA
- [ ] Service Worker se registra (ver en DevTools > Application > Service Workers)
- [ ] Manifest está disponible (DevTools > Application > Manifest)

### Bases de Datos
- [ ] Conexión a `labsisEGProduccion` funciona (solo lectura)
- [ ] Conexión a `lis_bot_comunicacionEG` funciona

### Redis (opcional)
- [ ] Redis conectado (o fallback en memoria funcionando)

---

## 🔄 PLAN DE ROLLBACK

Si hay problemas críticos después del deployment:

### Paso 1: Volver al Commit Anterior

```bash
# Ver el commit previo
cat ~/backups/v2.7.0/pre_deploy_commit.txt

# Hacer checkout a ese commit
git checkout <commit-hash>
```

### Paso 2: Reinstalar Dependencias

```bash
npm install
cd apps/web && npm install && npm run build && cd ../..
cd apps/config-api && npm install && cd ../..
cd apps/results-api && npm install && cd ../..
cd apps/messaging-bot && npm install && cd ../..
```

### Paso 3: Restaurar Base de Datos (Solo si es Necesario)

⚠️ **PRECAUCIÓN**: Solo restaurar la BD si las migraciones causaron problemas.

```bash
# Restaurar el backup
PGPASSWORD='<PASSWORD>' pg_restore \
  -h <HOST> \
  -U <USER> \
  -d lis_bot_comunicacionEG \
  --clean \
  --if-exists \
  ~/backups/v2.7.0/lis_bot_comunicacionEG_pre_v2.7.0.backup
```

### Paso 4: Reiniciar PM2

```bash
pm2 restart all
pm2 logs --lines 50
```

---

## 📞 TROUBLESHOOTING

### Problema: Servicios PM2 no inician

```bash
# Ver logs de error
pm2 logs --err --lines 100

# Verificar variables de entorno
pm2 env <nombre-del-servicio>

# Reiniciar un servicio específico
pm2 restart <nombre-del-servicio> --update-env
```

### Problema: Landing page no muestra contenido

```bash
# Verificar que las tablas existen
PGPASSWORD='<PASSWORD>' psql -h <HOST> -U <USER> -d lis_bot_comunicacionEG -c "\dt landing_*"

# Verificar que hay datos
PGPASSWORD='<PASSWORD>' psql -h <HOST> -U <USER> -d lis_bot_comunicacionEG -c "SELECT COUNT(*) FROM landing_sections;"

# Verificar que config-api responde
curl <URL_CONFIG_API>/api/landing/sections
```

### Problema: Error de conexión a base de datos

```bash
# Test de conexión manual
PGPASSWORD='<PASSWORD>' psql -h <HOST> -U <USER> -d lis_bot_comunicacionEG -c "SELECT version();"

# Verificar variables de entorno en .env
cat ~/laboratorio-eg-system/.env | grep DB
```

### Problema: Frontend muestra pantalla blanca

```bash
# Verificar que el build existe
ls -la ~/laboratorio-eg-system/apps/web/dist/

# Ver logs del servidor frontend
pm2 logs web-frontend --lines 100

# Verificar permisos
chmod -R 755 ~/laboratorio-eg-system/apps/web/dist/
```

---

## 🎯 NUEVAS FUNCIONALIDADES POST-DEPLOYMENT

Una vez desplegado exitosamente, estarán disponibles:

### Para Usuarios Finales:
1. **Landing Page Dinámica** - Contenido actualizable desde admin
2. **PWA (Progressive Web App)** - Instalable en dispositivos
3. **Service Worker** - Funcionalidad offline parcial
4. **Sistema de Favoritos** - Marcar estudios favoritos
5. **Temas Personalizables** - Colores y logos del laboratorio
6. **Carrusel Hero Dinámico** - Slides editables

### Para Administradores:
1. **CMS de Landing Pages** - `/admin/landing` - Editor completo de contenido
2. **Editor de Temas** - `/admin/themes` - Personalizar colores, tipografía, logos
3. **Gestión de Carrusel** - `/admin/carousel` - Editar slides del hero
4. **Dashboard Admin** - `/admin/dashboard` - Vista general del sistema
5. **Auditoría** - `/admin/audit` - Registro de cambios
6. **Backups** - `/admin/backups` - Gestión de backups de configuración

---

## 📊 RESUMEN DEL RELEASE v2.7.0

### Estadísticas:
- **208 archivos** modificados
- **52,096 inserciones** (+)
- **7,854 eliminaciones** (-)
- **38 migraciones** de base de datos
- **7 tablas nuevas** de landing page
- **5 commits** desde v2.6.0

### Cambios Principales:
1. Sistema de configuración dinámica multi-laboratorio
2. PWA con Service Worker y estrategias de caché
3. CMS completo para landing pages
4. Editor de temas y personalización
5. Infraestructura DevOps mejorada
6. Sistema de favoritos
7. Mejoras en autenticación (Telegram + WhatsApp)

---

**Fecha de Deployment**: _____________
**Ejecutado por**: _____________
**Tiempo total**: _____________

**Notas adicionales**:
_____________________________________________
_____________________________________________

---

🤖 **Documento generado con Claude Code**
**Versión del documento**: 1.0
**Última actualización**: 2025-11-22
