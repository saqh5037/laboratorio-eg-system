#!/bin/bash

# ==============================================================================
# Script Multi-Lab Stop - Laboratorio System
# ==============================================================================
# Detiene servicios de un laboratorio específico o todos
# Uso: ./scripts/stop-lab.sh <lab-code|all>
#
# Ejemplos:
#   ./scripts/stop-lab.sh eg        # Detiene todos los servicios de Lab EG
#   ./scripts/stop-lab.sh dimogen   # Detiene todos los servicios de Dimogen
#   ./scripts/stop-lab.sh all       # Detiene TODOS los labs
# ==============================================================================

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Directorio raíz
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# ==============================================================================
# Funciones de Utilidad
# ==============================================================================

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }

# ==============================================================================
# Detener servicios de un lab
# ==============================================================================

stop_lab() {
  local lab=$1
  local lab_name=""

  case $lab in
    eg) lab_name="Laboratorio EG" ;;
    dimogen) lab_name="Dimogen" ;;
    microtec) lab_name="Microtec" ;;
  esac

  echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
  echo -e "${CYAN}   Deteniendo servicios de $lab_name${NC}"
  echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
  echo ""

  local services=("config-api" "results-api" "sync-service" "messaging-bot" "backend-api" "frontend")
  local stopped=0

  for service in "${services[@]}"; do
    local pid_file="$PROJECT_ROOT/.pids/$lab-$service.pid"

    if [ -f "$pid_file" ]; then
      local pid=$(cat "$pid_file")

      if ps -p $pid > /dev/null 2>&1; then
        kill $pid 2>/dev/null || true
        sleep 0.5

        # Force kill si sigue corriendo
        if ps -p $pid > /dev/null 2>&1; then
          kill -9 $pid 2>/dev/null || true
        fi

        print_success "Detenido: $service (PID: $pid)"
        stopped=$((stopped + 1))
      fi

      rm -f "$pid_file"
    fi
  done

  if [ $stopped -eq 0 ]; then
    print_info "No había servicios corriendo para $lab_name"
  else
    print_success "Detenidos $stopped servicios de $lab_name"
  fi

  echo ""
}

# ==============================================================================
# Main
# ==============================================================================

main() {
  local target="${1:-}"

  if [ -z "$target" ]; then
    print_error "Debe especificar un laboratorio o 'all'"
    echo ""
    echo "Uso: $0 <lab-code|all>"
    echo ""
    echo "Opciones:"
    echo "  eg       - Detener Laboratorio EG"
    echo "  dimogen  - Detener Dimogen"
    echo "  microtec - Detener Microtec"
    echo "  all      - Detener TODOS los labs"
    exit 1
  fi

  case $target in
    all)
      print_info "Deteniendo TODOS los laboratorios..."
      echo ""
      stop_lab "eg"
      stop_lab "dimogen"
      stop_lab "microtec"
      print_success "Todos los servicios detenidos"
      ;;
    eg|dimogen|microtec)
      stop_lab "$target"
      ;;
    *)
      print_error "Lab desconocido: $target"
      echo "Labs disponibles: eg, dimogen, microtec, all"
      exit 1
      ;;
  esac
}

main "$@"
