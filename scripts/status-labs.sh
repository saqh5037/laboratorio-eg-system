#!/bin/bash

# ==============================================================================
# Script Multi-Lab Status - Laboratorio System
# ==============================================================================
# Muestra el estado de todos los servicios de todos los laboratorios
# Uso: ./scripts/status-labs.sh
# ==============================================================================

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
GRAY='\033[0;90m'
NC='\033[0m'

# Directorio raíz
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# ==============================================================================
# Funciones
# ==============================================================================

get_port() {
  local lab=$1
  local service=$2

  case "$lab-$service" in
    # Lab EG
    eg-config-api) echo 3005 ;;
    eg-results-api) echo 3003 ;;
    eg-sync-service) echo 3002 ;;
    eg-messaging-bot) echo 3004 ;;
    eg-backend-api) echo 3001 ;;
    eg-frontend) echo 5173 ;;
    # Dimogen
    dimogen-config-api) echo 3105 ;;
    dimogen-results-api) echo 3103 ;;
    dimogen-sync-service) echo 3102 ;;
    dimogen-messaging-bot) echo 3104 ;;
    dimogen-backend-api) echo 3101 ;;
    dimogen-frontend) echo 5273 ;;
    # Microtec
    microtec-config-api) echo 3205 ;;
    microtec-results-api) echo 3203 ;;
    microtec-sync-service) echo 3202 ;;
    microtec-messaging-bot) echo 3204 ;;
    microtec-backend-api) echo 3201 ;;
    microtec-frontend) echo 5373 ;;
    *) echo "---" ;;
  esac
}

get_lab_name() {
  local lab=$1
  case $lab in
    eg) echo "Laboratorio EG" ;;
    dimogen) echo "Dimogen" ;;
    microtec) echo "Microtec" ;;
    *) echo "$lab" ;;
  esac
}

check_service() {
  local lab=$1
  local service=$2
  local port=$(get_port "$lab" "$service")
  local pid_file="$PROJECT_ROOT/.pids/$lab-$service.pid"

  local status="${RED}○${NC}"
  local pid_info="${GRAY}---${NC}"
  local port_info="${GRAY}:$port${NC}"

  if [ -f "$pid_file" ]; then
    local pid=$(cat "$pid_file")
    if ps -p $pid > /dev/null 2>&1; then
      status="${GREEN}●${NC}"
      pid_info="${GREEN}$pid${NC}"
      port_info="${GREEN}:$port${NC}"
    fi
  fi

  printf "  %b %-15s %b  PID: %b\n" "$status" "$service" "$port_info" "$pid_info"
}

print_lab_status() {
  local lab=$1
  local lab_name=$(get_lab_name "$lab")
  local has_config="no"

  if [ -d "$PROJECT_ROOT/dev-instances/$lab" ]; then
    has_config="yes"
  fi

  echo ""
  echo -e "${CYAN}┌─────────────────────────────────────────────────────────┐${NC}"

  if [ "$has_config" = "yes" ]; then
    echo -e "${CYAN}│${NC}  ${GREEN}🏥 $lab_name${NC}"
  else
    echo -e "${CYAN}│${NC}  ${GRAY}🏥 $lab_name (sin configurar)${NC}"
  fi

  echo -e "${CYAN}└─────────────────────────────────────────────────────────┘${NC}"

  if [ "$has_config" = "yes" ]; then
    check_service "$lab" "config-api"
    check_service "$lab" "results-api"
    check_service "$lab" "sync-service"
    check_service "$lab" "messaging-bot"
    check_service "$lab" "backend-api"
    check_service "$lab" "frontend"
  else
    echo -e "  ${GRAY}Ejecuta: mkdir -p dev-instances/$lab y configura los .env${NC}"
  fi
}

# ==============================================================================
# Main
# ==============================================================================

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}        🖥️  Estado de Laboratorios - Multi-Lab Dev${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"

print_lab_status "eg"
print_lab_status "dimogen"
print_lab_status "microtec"

echo ""
echo -e "${CYAN}───────────────────────────────────────────────────────────${NC}"
echo -e "  ${GREEN}●${NC} Corriendo   ${RED}○${NC} Detenido   ${GRAY}○ Sin configurar${NC}"
echo -e "${CYAN}───────────────────────────────────────────────────────────${NC}"
echo ""
echo -e "  ${BLUE}Comandos útiles:${NC}"
echo -e "    ./scripts/start-lab.sh <lab>   # Iniciar lab"
echo -e "    ./scripts/stop-lab.sh <lab>    # Detener lab"
echo -e "    ./scripts/stop-lab.sh all      # Detener todos"
echo ""
