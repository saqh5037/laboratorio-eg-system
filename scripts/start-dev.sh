#!/bin/bash

# ==============================================================================
# Script de Inicio de Desarrollo - Laboratorio EG System
# ==============================================================================
# Inicia todos los servicios del monorepo en desarrollo
# Uso: ./scripts/start-dev.sh [opción]
#
# Opciones:
#   all       - Inicia todos los servicios (default)
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
  echo "   🏥 Laboratorio EG System - Entorno de Desarrollo"
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

print_service() {
  echo -e "${PURPLE}🚀 $1${NC}"
}

# ==============================================================================
# Verificación de Puertos
# ==============================================================================

check_port() {
  local port=$1
  local service=$2

  if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
    print_warning "Puerto $port ya está en uso ($service)"
    print_info "PID: $(lsof -ti:$port)"
    return 1
  else
    print_success "Puerto $port disponible"
    return 0
  fi
}

kill_port() {
  local port=$1
  local service=$2

  if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
    print_info "Deteniendo servicio en puerto $port..."
    lsof -ti:$port | xargs kill -9 2>/dev/null || true
    sleep 1
    print_success "Puerto $port liberado"
  fi
}

# ==============================================================================
# Iniciar Servicios
# ==============================================================================

start_config_api() {
  print_service "Iniciando Config API (puerto 3005)..."

  # Verificar puerto
  if ! check_port 3005 "Config API"; then
    read -p "¿Desea detener el servicio en puerto 3005? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      kill_port 3005 "Config API"
    else
      print_error "No se puede iniciar Config API. Puerto 3005 ocupado."
      return 1
    fi
  fi

  # Iniciar servicio
  cd "$PROJECT_ROOT/apps/config-api"

  print_info "Ejecutando: PORT=3005 DB_NAME=lis_bot_comunicacion_elizabeth_gutierrez npm run dev"
  PORT=3005 DB_NAME=lis_bot_comunicacion_elizabeth_gutierrez npm run dev > "$PROJECT_ROOT/logs/config-api.log" 2>&1 &

  local pid=$!
  echo $pid > "$PROJECT_ROOT/.pids/config-api.pid"

  # Esperar a que inicie
  sleep 3

  # Verificar que está corriendo
  if curl -s http://localhost:3005/api/health > /dev/null 2>&1; then
    print_success "Config API iniciado correctamente (PID: $pid)"
    print_info "URL: http://localhost:3005"
    print_info "Logs: $PROJECT_ROOT/logs/config-api.log"
  else
    print_warning "Config API iniciado pero healthcheck falló"
    print_info "Revisa los logs en: $PROJECT_ROOT/logs/config-api.log"
  fi
}

start_backend_api() {
  print_service "Iniciando Backend API (puerto 3001)..."

  # Verificar puerto
  if ! check_port 3001 "Backend API"; then
    read -p "¿Desea detener el servicio en puerto 3001? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      kill_port 3001 "Backend API"
    else
      print_error "No se puede iniciar Backend API. Puerto 3001 ocupado."
      return 1
    fi
  fi

  # Iniciar servicio
  cd "$PROJECT_ROOT/apps/web"

  print_info "Ejecutando: API_PORT=3001 npm run server"
  API_PORT=3001 npm run server > "$PROJECT_ROOT/logs/backend-api.log" 2>&1 &

  local pid=$!
  echo $pid > "$PROJECT_ROOT/.pids/backend-api.pid"

  # Esperar a que inicie
  sleep 3

  # Verificar que está corriendo
  if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    print_success "Backend API iniciado correctamente (PID: $pid)"
    print_info "URL: http://localhost:3001"
    print_info "Logs: $PROJECT_ROOT/logs/backend-api.log"
  else
    print_warning "Backend API iniciado pero healthcheck falló"
    print_info "Revisa los logs en: $PROJECT_ROOT/logs/backend-api.log"
  fi
}

start_frontend() {
  print_service "Iniciando Frontend (puerto 5173)..."

  # Verificar puerto
  if ! check_port 5173 "Frontend"; then
    read -p "¿Desea detener el servicio en puerto 5173? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      kill_port 5173 "Frontend"
    else
      print_error "No se puede iniciar Frontend. Puerto 5173 ocupado."
      return 1
    fi
  fi

  # Iniciar servicio
  cd "$PROJECT_ROOT/apps/web"

  print_info "Ejecutando: npm run dev"
  npm run dev > "$PROJECT_ROOT/logs/frontend.log" 2>&1 &

  local pid=$!
  echo $pid > "$PROJECT_ROOT/.pids/frontend.pid"

  # Esperar a que inicie
  sleep 5

  # Verificar que está corriendo
  if curl -s http://localhost:5173 > /dev/null 2>&1; then
    print_success "Frontend iniciado correctamente (PID: $pid)"
    print_info "URL: http://localhost:5173"
    print_info "Logs: $PROJECT_ROOT/logs/frontend.log"
  else
    print_warning "Frontend iniciado pero no responde aún"
    print_info "Revisa los logs en: $PROJECT_ROOT/logs/frontend.log"
  fi
}

# ==============================================================================
# Setup de Directorios
# ==============================================================================

setup_directories() {
  mkdir -p "$PROJECT_ROOT/logs"
  mkdir -p "$PROJECT_ROOT/.pids"
}

# ==============================================================================
# Main
# ==============================================================================

main() {
  print_header

  # Setup
  setup_directories

  # Determinar qué servicios iniciar
  MODE="${1:-all}"

  case $MODE in
    config)
      print_info "Modo: Solo Config API"
      start_config_api
      ;;
    backend)
      print_info "Modo: Solo Backend API"
      start_backend_api
      ;;
    frontend)
      print_info "Modo: Solo Frontend"
      start_frontend
      ;;
    all)
      print_info "Modo: Todos los servicios"
      echo ""

      # Iniciar en orden
      start_config_api
      echo ""
      sleep 2

      start_backend_api
      echo ""
      sleep 2

      start_frontend
      ;;
    *)
      print_error "Opción inválida: $MODE"
      echo "Uso: $0 [all|config|backend|frontend]"
      exit 1
      ;;
  esac

  # Resumen final
  echo ""
  echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
  print_success "Servicios iniciados correctamente"
  echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
  echo ""
  print_info "Servicios corriendo:"

  if [ -f "$PROJECT_ROOT/.pids/config-api.pid" ]; then
    local pid=$(cat "$PROJECT_ROOT/.pids/config-api.pid")
    if ps -p $pid > /dev/null 2>&1; then
      echo -e "  ${GREEN}✓${NC} Config API    → http://localhost:3005 (PID: $pid)"
    fi
  fi

  if [ -f "$PROJECT_ROOT/.pids/backend-api.pid" ]; then
    local pid=$(cat "$PROJECT_ROOT/.pids/backend-api.pid")
    if ps -p $pid > /dev/null 2>&1; then
      echo -e "  ${GREEN}✓${NC} Backend API   → http://localhost:3001 (PID: $pid)"
    fi
  fi

  if [ -f "$PROJECT_ROOT/.pids/frontend.pid" ]; then
    local pid=$(cat "$PROJECT_ROOT/.pids/frontend.pid")
    if ps -p $pid > /dev/null 2>&1; then
      echo -e "  ${GREEN}✓${NC} Frontend      → http://localhost:5173 (PID: $pid)"
    fi
  fi

  echo ""
  print_info "Para detener los servicios: ./scripts/stop-dev.sh"
  print_info "Para ver logs: tail -f $PROJECT_ROOT/logs/*.log"
  echo ""
}

# Ejecutar
main "$@"
