#!/bin/bash

# Script para aplicar un template de tema a MICROTEC
# Uso: ./apply-theme-template.sh [template_id]

DB_NAME="lis_bot_comunicacion_microtec"
DB_USER="labsis"
DB_PASSWORD="labsis"
DB_HOST="localhost"

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Aplicador de Templates de Tema${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Si no se proporciona ID, mostrar lista
if [ -z "$1" ]; then
  echo -e "${YELLOW}📋 Templates disponibles:${NC}"
  echo ""
  PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "
    SELECT
      id,
      name,
      category,
      description
    FROM theme_templates
    ORDER BY id;
  "
  echo ""
  echo -e "${YELLOW}Uso: $0 [template_id]${NC}"
  echo -e "${YELLOW}Ejemplo: $0 3  (aplica Verde Salud)${NC}"
  exit 0
fi

TEMPLATE_ID=$1

# Verificar que el template existe
TEMPLATE_EXISTS=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -t -c "SELECT COUNT(*) FROM theme_templates WHERE id = $TEMPLATE_ID;")

if [ "$TEMPLATE_EXISTS" -eq 0 ]; then
  echo -e "${RED}❌ Error: Template con ID $TEMPLATE_ID no encontrado${NC}"
  exit 1
fi

# Obtener nombre del template
TEMPLATE_NAME=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -t -c "SELECT name FROM theme_templates WHERE id = $TEMPLATE_ID;")

echo -e "${BLUE}🎨 Aplicando template: ${GREEN}$TEMPLATE_NAME${NC}"
echo ""

# Aplicar template a theme_config
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME << EOF
UPDATE theme_config SET
  color_primary = (SELECT color_primary FROM theme_templates WHERE id = $TEMPLATE_ID),
  color_secondary = (SELECT color_secondary FROM theme_templates WHERE id = $TEMPLATE_ID),
  color_accent = (SELECT color_accent FROM theme_templates WHERE id = $TEMPLATE_ID),
  color_text_primary = (SELECT color_text_primary FROM theme_templates WHERE id = $TEMPLATE_ID),
  color_text_secondary = (SELECT color_text_secondary FROM theme_templates WHERE id = $TEMPLATE_ID),
  color_background = (SELECT color_background FROM theme_templates WHERE id = $TEMPLATE_ID),
  color_surface = (SELECT color_surface FROM theme_templates WHERE id = $TEMPLATE_ID),
  color_dark_bg = (SELECT color_dark_bg FROM theme_templates WHERE id = $TEMPLATE_ID),
  color_dark_surface = (SELECT color_dark_surface FROM theme_templates WHERE id = $TEMPLATE_ID),
  color_dark_text = (SELECT color_dark_text FROM theme_templates WHERE id = $TEMPLATE_ID),
  color_dark_text_secondary = (SELECT color_dark_text_secondary FROM theme_templates WHERE id = $TEMPLATE_ID),
  color_success = (SELECT color_success FROM theme_templates WHERE id = $TEMPLATE_ID),
  color_warning = (SELECT color_warning FROM theme_templates WHERE id = $TEMPLATE_ID),
  color_error = (SELECT color_error FROM theme_templates WHERE id = $TEMPLATE_ID),
  color_info = (SELECT color_info FROM theme_templates WHERE id = $TEMPLATE_ID),
  theme_name = (SELECT name FROM theme_templates WHERE id = $TEMPLATE_ID),
  theme_description = (SELECT description FROM theme_templates WHERE id = $TEMPLATE_ID),
  updated_at = NOW()
WHERE id = 1;

SELECT
  'Template aplicado exitosamente' as status,
  color_primary,
  color_secondary,
  theme_name
FROM theme_config WHERE id = 1;
EOF

echo ""
echo -e "${GREEN}✅ Template aplicado exitosamente!${NC}"
echo -e "${YELLOW}🔄 Recarga el navegador (Cmd+Shift+R) para ver los cambios${NC}"
echo ""
