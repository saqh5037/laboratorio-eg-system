#!/bin/bash

##############################################################################
# SCRIPT DE RESTORE DE CONFIGURACIÓN POR LABORATORIO
#
# Descripción: Restaura configuración JSON en base de datos específica
# Uso: ./restore-lab-config.sh <lab-name> <config-db-name> <json-file>
##############################################################################

set -e

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Parámetros
LAB_NAME=$1
DB_NAME=$2
JSON_FILE=$3

if [ -z "$LAB_NAME" ] || [ -z "$DB_NAME" ] || [ -z "$JSON_FILE" ]; then
    echo -e "${RED}Uso: $0 <lab-name> <db-name> <json-file>${NC}"
    echo "Ejemplo: $0 dimogen lis_bot_comunicacion_dimogen backups/2025-11-19-pre-migration/json/dimogen-v13-final.json"
    exit 1
fi

# Credenciales
DB_HOST="localhost"
DB_USER="labsis"
DB_PASSWORD="labsis"

echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Restaurando configuración de $LAB_NAME en $DB_NAME${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Verificar que el JSON existe
if [ ! -f "$JSON_FILE" ]; then
    echo -e "${RED}✗ Archivo JSON no encontrado: $JSON_FILE${NC}"
    exit 1
fi

# Verificar que el JSON es válido
if ! jq empty "$JSON_FILE" 2>/dev/null; then
    echo -e "${RED}✗ JSON inválido: $JSON_FILE${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} JSON válido: $JSON_FILE"

# Extraer datos del JSON
COMPANY_INFO=$(jq -c '.data.company_info[0] // .company_info[0] // .data.data.company_info[0]' "$JSON_FILE")
THEME_CONFIG=$(jq -c '.data.theme_config[0] // .theme_config[0] // .data.data.theme_config[0]' "$JSON_FILE")
NAVIGATION=$(jq -c '.data.navigation // .navigation // .data.data.navigation' "$JSON_FILE")
CAROUSEL=$(jq -c '.data.carousel_slides // .carousel_slides // .data.data.carousel_slides' "$JSON_FILE")
LANDING_VALUES=$(jq -c '.data.landing_values // .landing_values // .data.data.landing_values' "$JSON_FILE")
LANDING_CERTS=$(jq -c '.data.landing_certifications // .landing_certifications // .data.data.landing_certifications' "$JSON_FILE")
LANDING_TESTI=$(jq -c '.data.landing_testimonials // .landing_testimonials // .data.data.landing_testimonials' "$JSON_FILE")
LANDING_CONTACT=$(jq -c '.data.landing_contact_info // .landing_contact_info // .data.data.landing_contact_info' "$JSON_FILE")
LANDING_CONTENT=$(jq -c '.data.landing_content_blocks // .landing_content_blocks // .data.data.landing_content_blocks' "$JSON_FILE")
LANDING_STATS=$(jq -c '.data.landing_statistics // .landing_statistics // .data.data.landing_statistics' "$JSON_FILE")
SYSTEM_CONFIG=$(jq -c '.data.system_config // .system_config // .data.data.system_config' "$JSON_FILE")

echo -e "${GREEN}✓${NC} Datos extraídos del JSON"

# Función para insertar datos
insert_data() {
    local TABLE=$1
    local DATA=$2

    if [ "$DATA" = "null" ] || [ -z "$DATA" ]; then
        echo -e "${YELLOW}ℹ${NC} Sin datos para $TABLE"
        return
    fi

    echo -e "${GREEN}→${NC} Insertando en $TABLE..."

    # Contar items
    local COUNT=$(echo "$DATA" | jq 'length')

    # Insertar cada item
    echo "$DATA" | jq -c '.[]' | while read -r item; do
        PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 <<SQL
INSERT INTO $TABLE
SELECT * FROM json_populate_record(NULL::$TABLE, '$item');
SQL
    done

    echo -e "${GREEN}✓${NC} $TABLE: $COUNT registros insertados"
}

# Insertar company_info
echo ""
echo -e "${YELLOW}Insertando company_info...${NC}"
if [ "$COMPANY_INFO" != "null" ]; then
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 <<SQL
INSERT INTO company_info
SELECT * FROM json_populate_record(NULL::company_info, '$COMPANY_INFO');
SQL
    echo -e "${GREEN}✓${NC} company_info insertado"
else
    echo -e "${RED}✗${NC} company_info no encontrado en JSON"
fi

# Insertar theme_config
echo ""
echo -e "${YELLOW}Insertando theme_config...${NC}"
if [ "$THEME_CONFIG" != "null" ]; then
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 <<SQL
INSERT INTO theme_config
SELECT * FROM json_populate_record(NULL::theme_config, '$THEME_CONFIG');
SQL
    echo -e "${GREEN}✓${NC} theme_config insertado"
else
    echo -e "${RED}✗${NC} theme_config no encontrado en JSON"
fi

# Insertar navigation_items
echo ""
insert_data "navigation_items" "$NAVIGATION"

# Insertar carousel_slides
insert_data "carousel_slides" "$CAROUSEL"

# Insertar landing_values
insert_data "landing_values" "$LANDING_VALUES"

# Insertar landing_certifications
insert_data "landing_certifications" "$LANDING_CERTS"

# Insertar landing_testimonials
insert_data "landing_testimonials" "$LANDING_TESTI"

# Insertar landing_contact_info
insert_data "landing_contact_info" "$LANDING_CONTACT"

# Insertar landing_content_blocks
insert_data "landing_content_blocks" "$LANDING_CONTENT"

# Insertar landing_statistics
insert_data "landing_statistics" "$LANDING_STATS"

# Insertar system_config
insert_data "system_config" "$SYSTEM_CONFIG"

# Resetear sequences
echo ""
echo -e "${YELLOW}Reseteando sequences...${NC}"
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 <<'SQL'
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT
            'ALTER SEQUENCE ' || sequence_name ||
            ' RESTART WITH ' || COALESCE(MAX(id) + 1, 1) AS sql_cmd
        FROM information_schema.sequences
        LEFT JOIN (
            SELECT 'company_info' AS tbl, MAX(id) AS id FROM company_info
            UNION ALL SELECT 'theme_config', MAX(id) FROM theme_config
            UNION ALL SELECT 'navigation_items', MAX(id) FROM navigation_items
            UNION ALL SELECT 'carousel_slides', MAX(id) FROM carousel_slides
            UNION ALL SELECT 'landing_values', MAX(id) FROM landing_values
            UNION ALL SELECT 'landing_certifications', MAX(id) FROM landing_certifications
            UNION ALL SELECT 'landing_testimonials', MAX(id) FROM landing_testimonials
            UNION ALL SELECT 'landing_contact_info', MAX(id) FROM landing_contact_info
            UNION ALL SELECT 'landing_content_blocks', MAX(id) FROM landing_content_blocks
            UNION ALL SELECT 'landing_statistics', MAX(id) FROM landing_statistics
            UNION ALL SELECT 'system_config', MAX(id) FROM system_config
        ) AS max_ids ON sequence_name LIKE tbl || '%'
        WHERE sequence_schema = 'public'
    ) LOOP
        EXECUTE r.sql_cmd;
    END LOOP;
END $$;
SQL

echo -e "${GREEN}✓${NC} Sequences reseteadas"

# Verificar conteo de registros
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Verificación de registros insertados:${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "
SELECT
    'company_info' AS tabla, COUNT(*) AS registros FROM company_info
UNION ALL SELECT 'theme_config', COUNT(*) FROM theme_config
UNION ALL SELECT 'navigation_items', COUNT(*) FROM navigation_items
UNION ALL SELECT 'carousel_slides', COUNT(*) FROM carousel_slides
UNION ALL SELECT 'landing_values', COUNT(*) FROM landing_values
UNION ALL SELECT 'landing_certifications', COUNT(*) FROM landing_certifications
UNION ALL SELECT 'landing_testimonials', COUNT(*) FROM landing_testimonials
UNION ALL SELECT 'landing_contact_info', COUNT(*) FROM landing_contact_info
UNION ALL SELECT 'landing_content_blocks', COUNT(*) FROM landing_content_blocks
UNION ALL SELECT 'landing_statistics', COUNT(*) FROM landing_statistics
UNION ALL SELECT 'system_config', COUNT(*) FROM system_config
ORDER BY tabla;
"

echo ""
echo -e "${GREEN}✅ Configuración de $LAB_NAME restaurada exitosamente en $DB_NAME${NC}"
echo ""
