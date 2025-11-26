#!/bin/bash

# ==============================================================================
# Script Multi-Lab Start - Laboratorio System
# ==============================================================================
# Inicia servicios para un laboratorio específico usando configuración aislada
# Uso: ./scripts/start-lab.sh <lab-code> [servicio]
#
# Ejemplos:
#   ./scripts/start-lab.sh eg              # Inicia todos los servicios de Lab EG
#   ./scripts/start-lab.sh dimogen         # Inicia todos los servicios de Dimogen
#   ./scripts/start-lab.sh eg web          # Solo web de Lab EG
#   ./scripts/start-lab.sh dimogen config  # Solo config-api de Dimogen
#
# Labs disponibles:
#   eg       - Laboratorio Elizabeth Gutiérrez (puertos base)
#   dimogen  - Dimogen (puertos +100)
#   microtec - Microtec (puertos +200) [futuro]
# ==============================================================================

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Directorio raíz
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# ==============================================================================
# Configuración de Labs
# ==============================================================================

get_lab_config() {
  local lab=$1
  case $lab in
    eg)
      LAB_NAME="Laboratorio EG"
      PORT_WEB=5173
      PORT_BACKEND=3001
      PORT_SYNC=3002
      PORT_RESULTS=3003
      PORT_BOT=3004
      PORT_CONFIG=3005
      PORT_WS=3006
      ;;
    dimogen)
      LAB_NAME="Dimogen"
      PORT_WEB=5273
      PORT_BACKEND=3101
      PORT_SYNC=3102
      PORT_RESULTS=3103
      PORT_BOT=3104
      PORT_CONFIG=3105
      PORT_WS=3106
      ;;
    microtec)
      LAB_NAME="Microtec"
      PORT_WEB=5373
      PORT_BACKEND=3201
      PORT_SYNC=3202
      PORT_RESULTS=3203
      PORT_BOT=3204
      PORT_CONFIG=3205
      PORT_WS=3206
      ;;
    *)
      echo -e "${RED}❌ Lab desconocido: $lab${NC}"
      echo "Labs disponibles: eg, dimogen, microtec"
      exit 1
      ;;
  esac
}

# ==============================================================================
# Funciones de Utilidad
# ==============================================================================

print_header() {
  echo -e "${CYAN}"
  echo "═══════════════════════════════════════════════════════════"
  echo "   🏥 Multi-Lab Development - $LAB_NAME"
  echo "═══════════════════════════════════════════════════════════"
  echo -e "${NC}"
}

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_service() { echo -e "${PURPLE}🚀 $1${NC}"; }

check_port() {
  local port=$1
  if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
    return 1
  fi
  return 0
}

kill_port() {
  local port=$1
  if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
    lsof -ti:$port | xargs kill -9 2>/dev/null || true
    sleep 1
  fi
}

# ==============================================================================
# Verificar que existe la configuración del lab
# ==============================================================================

check_lab_config() {
  local lab=$1
  local config_dir="$PROJECT_ROOT/dev-instances/$lab"

  if [ ! -d "$config_dir" ]; then
    print_error "No existe configuración para '$lab'"
    print_info "Directorio esperado: $config_dir"
    print_info "Ejecuta: mkdir -p $config_dir y copia los archivos .env"
    exit 1
  fi

  # Verificar archivos .env
  local missing=0
  for file in .env.web .env.config-api .env.results-api .env.messaging-bot .env.sync-service; do
    if [ ! -f "$config_dir/$file" ]; then
      print_warning "Falta: $config_dir/$file"
      missing=1
    fi
  done

  if [ $missing -eq 1 ]; then
    print_error "Faltan archivos de configuración para '$lab'"
    exit 1
  fi

  print_success "Configuración de '$lab' verificada"
}

# ==============================================================================
# Copiar archivos .env al servicio
# ==============================================================================

setup_env_files() {
  local lab=$1
  local config_dir="$PROJECT_ROOT/dev-instances/$lab"

  print_info "Configurando archivos .env para $LAB_NAME..."

  # Copiar .env files a cada app
  cp "$config_dir/.env.web" "$PROJECT_ROOT/apps/web/.env.local"
  cp "$config_dir/.env.config-api" "$PROJECT_ROOT/apps/config-api/.env"
  cp "$config_dir/.env.results-api" "$PROJECT_ROOT/apps/results-api/.env"
  cp "$config_dir/.env.messaging-bot" "$PROJECT_ROOT/apps/messaging-bot/.env"
  cp "$config_dir/.env.sync-service" "$PROJECT_ROOT/apps/sync-service/.env"

  print_success "Archivos .env copiados"
}

# ==============================================================================
# Iniciar Servicios
# ==============================================================================

start_config_api() {
  local lab=$1
  print_service "Iniciando Config API ($LAB_NAME) en puerto $PORT_CONFIG..."

  if ! check_port $PORT_CONFIG; then
    print_warning "Puerto $PORT_CONFIG ocupado, liberando..."
    kill_port $PORT_CONFIG
  fi

  cd "$PROJECT_ROOT/apps/config-api"
  PORT=$PORT_CONFIG WS_PORT=$PORT_WS npm run dev > "$PROJECT_ROOT/logs/$lab-config-api.log" 2>&1 &

  local pid=$!
  echo $pid > "$PROJECT_ROOT/.pids/$lab-config-api.pid"

  sleep 2
  print_success "Config API iniciado (PID: $pid) → http://localhost:$PORT_CONFIG"
}

start_results_api() {
  local lab=$1
  print_service "Iniciando Results API ($LAB_NAME) en puerto $PORT_RESULTS..."

  if ! check_port $PORT_RESULTS; then
    print_warning "Puerto $PORT_RESULTS ocupado, liberando..."
    kill_port $PORT_RESULTS
  fi

  cd "$PROJECT_ROOT/apps/results-api"
  PORT=$PORT_RESULTS npm run dev > "$PROJECT_ROOT/logs/$lab-results-api.log" 2>&1 &

  local pid=$!
  echo $pid > "$PROJECT_ROOT/.pids/$lab-results-api.pid"

  sleep 2
  print_success "Results API iniciado (PID: $pid) → http://localhost:$PORT_RESULTS"
}

start_sync_service() {
  local lab=$1
  print_service "Iniciando Sync Service ($LAB_NAME) en puerto $PORT_SYNC..."

  if ! check_port $PORT_SYNC; then
    print_warning "Puerto $PORT_SYNC ocupado, liberando..."
    kill_port $PORT_SYNC
  fi

  cd "$PROJECT_ROOT/apps/sync-service"
  HTTP_PORT=$PORT_SYNC npm run dev > "$PROJECT_ROOT/logs/$lab-sync-service.log" 2>&1 &

  local pid=$!
  echo $pid > "$PROJECT_ROOT/.pids/$lab-sync-service.pid"

  sleep 2
  print_success "Sync Service iniciado (PID: $pid) → http://localhost:$PORT_SYNC"
}

start_messaging_bot() {
  local lab=$1
  print_service "Iniciando Messaging Bot ($LAB_NAME) en puerto $PORT_BOT..."

  if ! check_port $PORT_BOT; then
    print_warning "Puerto $PORT_BOT ocupado, liberando..."
    kill_port $PORT_BOT
  fi

  cd "$PROJECT_ROOT/apps/messaging-bot"
  PORT=$PORT_BOT npm run dev > "$PROJECT_ROOT/logs/$lab-messaging-bot.log" 2>&1 &

  local pid=$!
  echo $pid > "$PROJECT_ROOT/.pids/$lab-messaging-bot.pid"

  sleep 2
  print_success "Messaging Bot iniciado (PID: $pid) → http://localhost:$PORT_BOT"
}

start_web() {
  local lab=$1
  print_service "Iniciando Web Frontend ($LAB_NAME) en puerto $PORT_WEB..."

  if ! check_port $PORT_WEB; then
    print_warning "Puerto $PORT_WEB ocupado, liberando..."
    kill_port $PORT_WEB
  fi

  # Verificar backend API
  if ! check_port $PORT_BACKEND; then
    print_warning "Puerto $PORT_BACKEND ocupado, liberando..."
    kill_port $PORT_BACKEND
  fi

  cd "$PROJECT_ROOT/apps/web"

  # Iniciar backend API primero
  API_PORT=$PORT_BACKEND npm run server > "$PROJECT_ROOT/logs/$lab-backend-api.log" 2>&1 &
  local backend_pid=$!
  echo $backend_pid > "$PROJECT_ROOT/.pids/$lab-backend-api.pid"
  sleep 2
  print_success "Backend API iniciado (PID: $backend_pid) → http://localhost:$PORT_BACKEND"

  # Iniciar Vite
  VITE_PORT=$PORT_WEB npm run dev -- --port $PORT_WEB > "$PROJECT_ROOT/logs/$lab-frontend.log" 2>&1 &

  local pid=$!
  echo $pid > "$PROJECT_ROOT/.pids/$lab-frontend.pid"

  sleep 3
  print_success "Frontend iniciado (PID: $pid) → http://localhost:$PORT_WEB"
}

# ==============================================================================
# Resumen de Servicios
# ==============================================================================

print_summary() {
  local lab=$1

  echo ""
  echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
  print_success "$LAB_NAME - Servicios activos"
  echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
  echo ""

  # Mostrar servicios corriendo
  local services=("config-api:$PORT_CONFIG" "results-api:$PORT_RESULTS" "sync-service:$PORT_SYNC" "messaging-bot:$PORT_BOT" "backend-api:$PORT_BACKEND" "frontend:$PORT_WEB")

  for svc in "${services[@]}"; do
    local name="${svc%%:*}"
    local port="${svc##*:}"
    local pid_file="$PROJECT_ROOT/.pids/$lab-$name.pid"

    if [ -f "$pid_file" ]; then
      local pid=$(cat "$pid_file")
      if ps -p $pid > /dev/null 2>&1; then
        echo -e "  ${GREEN}✓${NC} $name → http://localhost:$port (PID: $pid)"
      fi
    fi
  done

  echo ""
  print_info "Logs: tail -f $PROJECT_ROOT/logs/$lab-*.log"
  print_info "Detener: ./scripts/stop-lab.sh $lab"
  echo ""
}

# ==============================================================================
# Main
# ==============================================================================

main() {
  local lab="${1:-}"
  local service="${2:-all}"

  if [ -z "$lab" ]; then
    print_error "Debe especificar un laboratorio"
    echo ""
    echo "Uso: $0 <lab-code> [servicio]"
    echo ""
    echo "Labs disponibles:"
    echo "  eg       - Laboratorio Elizabeth Gutiérrez"
    echo "  dimogen  - Dimogen"
    echo "  microtec - Microtec"
    echo ""
    echo "Servicios (opcional):"
    echo "  all      - Todos los servicios (default)"
    echo "  web      - Solo frontend + backend"
    echo "  config   - Solo config-api"
    echo "  results  - Solo results-api"
    echo "  sync     - Solo sync-service"
    echo "  bot      - Solo messaging-bot"
    exit 1
  fi

  # Obtener configuración del lab
  get_lab_config "$lab"

  print_header

  # Verificar configuración
  check_lab_config "$lab"

  # Setup directorios
  mkdir -p "$PROJECT_ROOT/logs"
  mkdir -p "$PROJECT_ROOT/.pids"

  # Copiar archivos .env
  setup_env_files "$lab"

  echo ""

  # Iniciar servicios según opción
  case $service in
    all)
      print_info "Iniciando TODOS los servicios para $LAB_NAME"
      echo ""
      start_config_api "$lab"
      sleep 1
      start_results_api "$lab"
      sleep 1
      start_sync_service "$lab"
      sleep 1
      start_messaging_bot "$lab"
      sleep 1
      start_web "$lab"
      ;;
    web)
      start_web "$lab"
      ;;
    config)
      start_config_api "$lab"
      ;;
    results)
      start_results_api "$lab"
      ;;
    sync)
      start_sync_service "$lab"
      ;;
    bot)
      start_messaging_bot "$lab"
      ;;
    *)
      print_error "Servicio desconocido: $service"
      exit 1
      ;;
  esac

  print_summary "$lab"
}

main "$@"
