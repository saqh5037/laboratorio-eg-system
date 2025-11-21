#!/bin/bash

# ==============================================================================
# Script para Detener Servicios de Desarrollo - Laboratorio EG System
# ==============================================================================
# Detiene todos los servicios del monorepo que fueron iniciados con start-dev.sh
# Uso: ./scripts/stop-dev.sh [opción]
#
# Opciones:
#   all       - Detiene todos los servicios (default)
#   config    - Solo config-api (puerto 3005)
#   backend   - Solo backend API (puerto 3001)
#   frontend  - Solo frontend (puerto 5173)
# ==============================================================================

set -e  # Exit on error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Directorio raíz del proyecto
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# ==============================================================================
# Funciones de Utilidad
# ==============================================================================

print_header() {
  echo -e "${CYAN}"
  echo "═══════════════════════════════════════════════════════════"
  echo "   🛑 Laboratorio EG System - Detener Servicios"
  echo "═══════════════════════════════════════════════════════════"
  echo -e "${NC}"
}

print_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
  echo -e "${RED}❌ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
  echo -e "${BLUE}ℹ️  $1${NC}"
}

# ==============================================================================
# Detener Servicios
# ==============================================================================

stop_service_by_port() {
  local port=$1
  local service_name=$2

  print_info "Deteniendo $service_name (puerto $port)..."

  if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
    local pid=$(lsof -ti:$port)
    kill -15 $pid 2>/dev/null || kill -9 $pid 2>/dev/null || true
    sleep 1

    # Verificar que se detuvo
    if ! lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
      print_success "$service_name detenido correctamente"
    else
      print_warning "$service_name aún corriendo, intentando force kill..."
      kill -9 $(lsof -ti:$port) 2>/dev/null || true
      sleep 1
      print_success "$service_name forzado a detener"
    fi
  else
    print_warning "$service_name no está corriendo en puerto $port"
  fi
}

stop_service_by_pid() {
  local pid_file=$1
  local service_name=$2

  if [ -f "$pid_file" ]; then
    local pid=$(cat "$pid_file")

    if ps -p $pid > /dev/null 2>&1; then
      print_info "Deteniendo $service_name (PID: $pid)..."
      kill -15 $pid 2>/dev/null || kill -9 $pid 2>/dev/null || true
      sleep 1

      # Verificar que se detuvo
      if ! ps -p $pid > /dev/null 2>&1; then
        print_success "$service_name detenido correctamente"
      else
        print_warning "$service_name aún corriendo, forzando..."
        kill -9 $pid 2>/dev/null || true
      fi
    else
      print_warning "$service_name no está corriendo (PID file existe pero proceso no)"
    fi

    # Limpiar PID file
    rm -f "$pid_file"
  else
    print_warning "No se encontró PID file para $service_name"
  fi
}

stop_config_api() {
  print_info "Deteniendo Config API..."

  # Intentar por PID file primero
  if [ -f "$PROJECT_ROOT/.pids/config-api.pid" ]; then
    stop_service_by_pid "$PROJECT_ROOT/.pids/config-api.pid" "Config API"
  fi

  # Backup: detener por puerto
  stop_service_by_port 3005 "Config API (puerto 3005)"
}

stop_backend_api() {
  print_info "Deteniendo Backend API..."

  # Intentar por PID file primero
  if [ -f "$PROJECT_ROOT/.pids/backend-api.pid" ]; then
    stop_service_by_pid "$PROJECT_ROOT/.pids/backend-api.pid" "Backend API"
  fi

  # Backup: detener por puerto
  stop_service_by_port 3001 "Backend API (puerto 3001)"
}

stop_frontend() {
  print_info "Deteniendo Frontend..."

  # Intentar por PID file primero
  if [ -f "$PROJECT_ROOT/.pids/frontend.pid" ]; then
    stop_service_by_pid "$PROJECT_ROOT/.pids/frontend.pid" "Frontend"
  fi

  # Backup: detener por puerto
  stop_service_by_port 5173 "Frontend (puerto 5173)"
}

cleanup() {
  print_info "Limpiando archivos temporales..."

  # Limpiar PID files
  rm -f "$PROJECT_ROOT/.pids/"*.pid 2>/dev/null || true

  print_success "Limpieza completada"
}

# ==============================================================================
# Main
# ==============================================================================

main() {
  print_header

  # Determinar qué servicios detener
  MODE="${1:-all}"

  case $MODE in
    config)
      print_info "Modo: Solo Config API"
      stop_config_api
      ;;
    backend)
      print_info "Modo: Solo Backend API"
      stop_backend_api
      ;;
    frontend)
      print_info "Modo: Solo Frontend"
      stop_frontend
      ;;
    all)
      print_info "Modo: Todos los servicios"
      echo ""

      # Detener en orden inverso al inicio
      stop_frontend
      echo ""

      stop_backend_api
      echo ""

      stop_config_api
      ;;
    *)
      print_error "Opción inválida: $MODE"
      echo "Uso: $0 [all|config|backend|frontend]"
      exit 1
      ;;
  esac

  # Limpieza
  echo ""
  cleanup

  # Resumen final
  echo ""
  echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
  print_success "Servicios detenidos correctamente"
  echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
  echo ""

  # Mostrar puertos que aún están ocupados (si hay)
  print_info "Verificando puertos..."
  echo ""

  local ports_in_use=0

  if lsof -Pi :3005 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "  ${RED}✗${NC} Puerto 3005 (Config API) aún ocupado por PID $(lsof -ti:3005)"
    ports_in_use=1
  else
    echo -e "  ${GREEN}✓${NC} Puerto 3005 libre"
  fi

  if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "  ${RED}✗${NC} Puerto 3001 (Backend API) aún ocupado por PID $(lsof -ti:3001)"
    ports_in_use=1
  else
    echo -e "  ${GREEN}✓${NC} Puerto 3001 libre"
  fi

  if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "  ${RED}✗${NC} Puerto 5173 (Frontend) aún ocupado por PID $(lsof -ti:5173)"
    ports_in_use=1
  else
    echo -e "  ${GREEN}✓${NC} Puerto 5173 libre"
  fi

  echo ""

  if [ $ports_in_use -eq 1 ]; then
    print_warning "Algunos puertos aún están ocupados. Ejecuta nuevamente el script o usa:"
    print_info "kill -9 <PID>"
  fi

  print_info "Para iniciar los servicios nuevamente: ./scripts/start-dev.sh"
  echo ""
}

# Ejecutar
main "$@"
