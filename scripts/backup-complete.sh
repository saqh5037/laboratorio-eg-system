#!/bin/bash

##############################################################################
# SCRIPT DE BACKUP COMPLETO - SISTEMA MULTI-LABORATORIO
#
# Descripción: Backup automático de bases de datos y configuraciones JSON
# Autor: Sistema Lab EG
# Fecha: 2025-11-19
#
# Uso: ./scripts/backup-complete.sh
##############################################################################

set -e  # Exit on error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
PROJECT_ROOT="/Users/samuelquiroz/Documents/proyectos/laboratorio-eg-system"
BACKUP_BASE_DIR="$PROJECT_ROOT/backups"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_DIR="$BACKUP_BASE_DIR/$TIMESTAMP"
CONFIG_API_URL="http://localhost:3005"

# Credenciales PostgreSQL (desde .env)
DB_HOST="localhost"
DB_USER="labsis"
DB_PASSWORD="labsis"
DB_LABSIS="labsisEG"
DB_CONFIG="lis_bot_comunicacion"

# JWT Admin Credentials
ADMIN_USER="admin"
ADMIN_PASS="admin123"

##############################################################################
# FUNCIONES
##############################################################################

print_header() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

check_dependencies() {
    print_header "Verificando dependencias"

    # Verificar pg_dump
    if ! command -v pg_dump &> /dev/null; then
        print_error "pg_dump no está instalado. Instalar PostgreSQL client."
        exit 1
    fi
    print_success "pg_dump encontrado"

    # Verificar curl
    if ! command -v curl &> /dev/null; then
        print_error "curl no está instalado"
        exit 1
    fi
    print_success "curl encontrado"

    # Verificar jq
    if ! command -v jq &> /dev/null; then
        print_info "jq no está instalado (opcional, mejora el output)"
    else
        print_success "jq encontrado"
    fi

    # Verificar que config-api esté corriendo
    if ! curl -s -f "$CONFIG_API_URL/health" > /dev/null; then
        print_error "Config API no está corriendo en $CONFIG_API_URL"
        print_info "Inicia el servidor con: npm run dev"
        exit 1
    fi
    print_success "Config API corriendo"

    echo ""
}

create_directories() {
    print_header "Creando directorios de backup"

    mkdir -p "$BACKUP_DIR/sql"
    mkdir -p "$BACKUP_DIR/json"
    mkdir -p "$BACKUP_DIR/scripts"
    mkdir -p "$BACKUP_DIR/logs"

    print_success "Directorios creados en: $BACKUP_DIR"
    echo ""
}

backup_databases() {
    print_header "Backup de Bases de Datos PostgreSQL"

    # Backup labsisEG
    print_info "Haciendo backup de $DB_LABSIS..."
    PGPASSWORD="$DB_PASSWORD" pg_dump \
        -h "$DB_HOST" \
        -U "$DB_USER" \
        -d "$DB_LABSIS" \
        --verbose \
        --format=custom \
        --file="$BACKUP_DIR/sql/${DB_LABSIS}_full.backup" \
        2>&1 | tee "$BACKUP_DIR/logs/labsisEG_backup.log"

    LABSIS_SIZE=$(du -h "$BACKUP_DIR/sql/${DB_LABSIS}_full.backup" | cut -f1)
    print_success "Backup de $DB_LABSIS completado: $LABSIS_SIZE"

    # Backup lis_bot_comunicacion
    print_info "Haciendo backup de $DB_CONFIG..."
    PGPASSWORD="$DB_PASSWORD" pg_dump \
        -h "$DB_HOST" \
        -U "$DB_USER" \
        -d "$DB_CONFIG" \
        --verbose \
        --format=custom \
        --file="$BACKUP_DIR/sql/${DB_CONFIG}_full.backup" \
        2>&1 | tee "$BACKUP_DIR/logs/lis_bot_comunicacion_backup.log"

    CONFIG_SIZE=$(du -h "$BACKUP_DIR/sql/${DB_CONFIG}_full.backup" | cut -f1)
    print_success "Backup de $DB_CONFIG completado: $CONFIG_SIZE"

    echo ""
}

get_admin_token() {
    print_info "Obteniendo token de autenticación..."

    TOKEN=$(curl -s -X POST "$CONFIG_API_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"username\":\"$ADMIN_USER\",\"password\":\"$ADMIN_PASS\"}" \
        | jq -r '.token // empty')

    if [ -z "$TOKEN" ]; then
        print_error "No se pudo obtener token de autenticación"
        exit 1
    fi

    print_success "Token obtenido"
}

export_lab_configuration() {
    local LAB_NAME=$1
    local BACKUP_ID=$2
    local OUTPUT_FILE="$BACKUP_DIR/json/${LAB_NAME}.json"

    print_info "Exportando configuración de $LAB_NAME..."

    if [ -n "$BACKUP_ID" ]; then
        # Exportar desde backup guardado
        curl -s -H "Authorization: Bearer $TOKEN" \
            "$CONFIG_API_URL/api/backup/$BACKUP_ID" \
            > "$OUTPUT_FILE"
    else
        # Exportar configuración actual
        curl -s -H "Authorization: Bearer $TOKEN" \
            "$CONFIG_API_URL/api/backup/export" \
            > "$OUTPUT_FILE"
    fi

    # Verificar que el JSON sea válido
    if jq empty "$OUTPUT_FILE" 2>/dev/null; then
        FILE_SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)
        print_success "Configuración de $LAB_NAME exportada: $FILE_SIZE"
    else
        print_error "Error al exportar configuración de $LAB_NAME (JSON inválido)"
    fi
}

backup_configurations() {
    print_header "Backup de Configuraciones JSON"

    get_admin_token

    # Obtener IDs de backups desde BD
    print_info "Obteniendo IDs de backups guardados..."

    EG_ID=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_CONFIG" -t -c \
        "SELECT id FROM configuration_backups WHERE name LIKE '%elizabeth%' ORDER BY created_at DESC LIMIT 1;" \
        | xargs)

    MICROTEC_ID=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_CONFIG" -t -c \
        "SELECT id FROM configuration_backups WHERE name LIKE '%microtec%' ORDER BY created_at DESC LIMIT 1;" \
        | xargs)

    DIMOGEN_ID=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_CONFIG" -t -c \
        "SELECT id FROM configuration_backups WHERE name LIKE '%dimogen%' ORDER BY created_at DESC LIMIT 1;" \
        | xargs)

    # Exportar configuraciones
    export_lab_configuration "elizabeth-gutierrez" "$EG_ID"
    export_lab_configuration "microtec" "$MICROTEC_ID"
    export_lab_configuration "dimogen" "$DIMOGEN_ID"
    export_lab_configuration "current" ""  # Configuración actualmente en uso

    echo ""
}

create_restore_script() {
    print_header "Creando script de restore"

    cat > "$BACKUP_DIR/scripts/RESTORE.sh" <<'RESTORE_SCRIPT'
#!/bin/bash

##############################################################################
# SCRIPT DE RESTORE - Restaurar desde este backup
#
# Uso: ./RESTORE.sh [labsisEG|lis_bot_comunicacion|both]
##############################################################################

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="$(dirname "$SCRIPT_DIR")"

DB_HOST="localhost"
DB_USER="labsis"
DB_PASSWORD="labsis"

restore_database() {
    local DB_NAME=$1
    local BACKUP_FILE="$BACKUP_DIR/sql/${DB_NAME}_full.backup"

    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "⚠️  ADVERTENCIA: Restaurar $DB_NAME"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Esto ELIMINARÁ todos los datos actuales en $DB_NAME"
    echo "y los reemplazará con el backup de:"
    echo "  $BACKUP_FILE"
    echo ""
    read -p "¿Estás seguro? (escribe 'SI' para confirmar): " CONFIRM

    if [ "$CONFIRM" != "SI" ]; then
        echo "✗ Restore cancelado"
        exit 1
    fi

    echo ""
    echo "🔄 Restaurando $DB_NAME..."

    # Drop y recrear DB
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;"
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d postgres -c "CREATE DATABASE $DB_NAME;"

    # Restore desde backup
    PGPASSWORD="$DB_PASSWORD" pg_restore \
        -h "$DB_HOST" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        --verbose \
        "$BACKUP_FILE"

    echo "✓ Restore de $DB_NAME completado"
    echo ""
}

MODE="${1:-both}"

case $MODE in
    labsisEG)
        restore_database "labsisEG"
        ;;
    lis_bot_comunicacion)
        restore_database "lis_bot_comunicacion"
        ;;
    both)
        restore_database "labsisEG"
        restore_database "lis_bot_comunicacion"
        ;;
    *)
        echo "Uso: $0 [labsisEG|lis_bot_comunicacion|both]"
        exit 1
        ;;
esac

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✓ Restore completado exitosamente"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
RESTORE_SCRIPT

    chmod +x "$BACKUP_DIR/scripts/RESTORE.sh"
    print_success "Script de restore creado"
    echo ""
}

create_readme() {
    print_header "Creando documentación README"

    cat > "$BACKUP_DIR/README.md" <<README
# Backup Completo - Sistema Multi-Laboratorio

**Fecha de backup:** $TIMESTAMP
**Creado por:** Script automatizado

## Contenido del Backup

### Bases de Datos (SQL)

- \`sql/labsisEG_full.backup\` - Base de datos operacional (pacientes, resultados, órdenes)
- \`sql/lis_bot_comunicacion_full.backup\` - Base de datos de configuración (branding, landing, bot)

### Configuraciones JSON

- \`json/elizabeth-gutierrez.json\` - Configuración completa de Lab Elizabeth Gutiérrez
- \`json/microtec.json\` - Configuración completa de MICRO-TEC
- \`json/dimogen.json\` - Configuración completa de DIMOGEN
- \`json/current.json\` - Configuración actualmente en uso

### Scripts

- \`scripts/RESTORE.sh\` - Script para restaurar bases de datos

### Logs

- \`logs/labsisEG_backup.log\` - Log detallado del backup de labsisEG
- \`logs/lis_bot_comunicacion_backup.log\` - Log detallado del backup de configuración

## Cómo Restaurar

### Opción 1: Restaurar todo

\`\`\`bash
cd $BACKUP_DIR/scripts
./RESTORE.sh both
\`\`\`

### Opción 2: Restaurar solo labsisEG

\`\`\`bash
cd $BACKUP_DIR/scripts
./RESTORE.sh labsisEG
\`\`\`

### Opción 3: Restaurar solo configuración

\`\`\`bash
cd $BACKUP_DIR/scripts
./RESTORE.sh lis_bot_comunicacion
\`\`\`

### Opción 4: Restaurar configuración de un laboratorio específico

Usa el panel de administración:
1. Ve a http://localhost:5173/admin/backups
2. Click en "Importar configuración"
3. Selecciona el archivo JSON del laboratorio deseado

O usa curl:

\`\`\`bash
# Obtener token
TOKEN=\$(curl -s -X POST http://localhost:3005/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"username":"admin","password":"admin123"}' \\
  | jq -r '.token')

# Importar configuración
curl -X POST http://localhost:3005/api/backup/import \\
  -H "Authorization: Bearer \$TOKEN" \\
  -H "Content-Type: application/json" \\
  -d @json/dimogen.json
\`\`\`

## Tamaños de Archivo

\`\`\`
$(du -h sql/* json/* 2>/dev/null)
\`\`\`

## Información del Sistema

- **PostgreSQL Version:** $(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d postgres -t -c "SELECT version();" | head -1)
- **Laboratorios en sistema:** 3 (Elizabeth Gutiérrez, MICRO-TEC, DIMOGEN)
- **Backups guardados:** Completo (datos + configuración)

## Notas Importantes

⚠️ **ADVERTENCIAS:**

1. El restore es **DESTRUCTIVO** - borra datos actuales
2. Siempre hacer backup antes de restore
3. Verificar que los servicios estén detenidos antes de restore
4. Después del restore, reiniciar todos los servicios

✅ **RECOMENDACIONES:**

1. Mantener backups en ubicación segura
2. Probar restore en ambiente de desarrollo primero
3. Documentar cualquier cambio post-restore
4. Verificar integridad de datos después de restore

## Estructura de Archivos

\`\`\`
$TIMESTAMP/
├── sql/
│   ├── labsisEG_full.backup
│   └── lis_bot_comunicacion_full.backup
├── json/
│   ├── elizabeth-gutierrez.json
│   ├── microtec.json
│   ├── dimogen.json
│   └── current.json
├── scripts/
│   └── RESTORE.sh
├── logs/
│   ├── labsisEG_backup.log
│   └── lis_bot_comunicacion_backup.log
└── README.md
\`\`\`

## Contacto

Para soporte técnico, contactar al administrador del sistema.
README

    print_success "README.md creado"
    echo ""
}

generate_summary() {
    print_header "Resumen del Backup"

    echo -e "${YELLOW}Directorio:${NC} $BACKUP_DIR"
    echo ""
    echo -e "${YELLOW}Archivos creados:${NC}"
    find "$BACKUP_DIR" -type f -exec du -h {} \; | sort -hr
    echo ""

    TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
    echo -e "${YELLOW}Tamaño total del backup:${NC} ${GREEN}$TOTAL_SIZE${NC}"
    echo ""

    print_success "Backup completado exitosamente"
    echo ""
    echo -e "${BLUE}Para restaurar, consultar: $BACKUP_DIR/README.md${NC}"
    echo ""
}

##############################################################################
# MAIN
##############################################################################

main() {
    print_header "🗄️  BACKUP COMPLETO - SISTEMA MULTI-LABORATORIO"
    echo ""

    check_dependencies
    create_directories
    backup_databases
    backup_configurations
    create_restore_script
    create_readme
    generate_summary

    print_header "✅ BACKUP FINALIZADO"
}

# Ejecutar
main "$@"
