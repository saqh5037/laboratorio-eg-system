#!/bin/bash

# Script de monitoreo para testing manual
# Ejecutar en terminal separada mientras se hace testing manual

echo "========================================="
echo "🔍 Monitor de Testing - Landing CMS"
echo "========================================="
echo ""
echo "Monitoreando logs de:"
echo "  - Config-API (puerto 3005)"
echo "  - Vite Dev Server (puerto 5173)"
echo ""
echo "Presiona Ctrl+C para detener"
echo ""
echo "========================================="
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Monitorear ambos logs en paralelo
tail -f /tmp/config-api.log 2>/dev/null | while read line; do
    if [[ "$line" == *"GET"* ]] || [[ "$line" == *"POST"* ]] || [[ "$line" == *"PATCH"* ]] || [[ "$line" == *"PUT"* ]] || [[ "$line" == *"DELETE"* ]]; then
        echo -e "${GREEN}[API]${NC} $line"
    elif [[ "$line" == *"error"* ]] || [[ "$line" == *"Error"* ]] || [[ "$line" == *"ERROR"* ]]; then
        echo -e "${RED}[ERROR]${NC} $line"
    elif [[ "$line" == *"warn"* ]] || [[ "$line" == *"Warning"* ]]; then
        echo -e "${YELLOW}[WARN]${NC} $line"
    else
        echo -e "${BLUE}[LOG]${NC} $line"
    fi
done &

tail -f /tmp/web-dev.log 2>/dev/null | while read line; do
    if [[ "$line" == *"error"* ]] || [[ "$line" == *"Error"* ]] || [[ "$line" == *"ERROR"* ]]; then
        echo -e "${RED}[WEB ERROR]${NC} $line"
    elif [[ "$line" == *"✓"* ]]; then
        echo -e "${GREEN}[WEB]${NC} $line"
    elif [[ "$line" != "" ]]; then
        echo -e "${BLUE}[WEB]${NC} $line"
    fi
done &

# Esperar a que terminen los procesos
wait
