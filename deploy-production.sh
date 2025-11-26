#!/bin/bash

# ==========================================
# Laboratorio EG System - Production Deployment Script
# ==========================================
# Este script automatiza el deployment en AWS EC2
# Servidor: 54.197.68.252
# Base de datos: labsisEGProduccion, lis_bot_comunicacioneg
# ==========================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/home/ubuntu/laboratorio-eg-system"
BACKUP_DIR="$PROJECT_DIR/backups"
LOG_FILE="$PROJECT_DIR/deployment-$(date +%Y%m%d-%H%M%S).log"

# Function to log messages
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

# ==========================================
# PRE-DEPLOYMENT CHECKS
# ==========================================

log "============================================"
log "🚀 Iniciando Deployment de Laboratorio EG"
log "============================================"

# Check if running as correct user
if [ "$EUID" -eq 0 ]; then
    error "No ejecutar este script como root. Usar usuario ubuntu."
fi

# Check if .env.production exists
if [ ! -f "$PROJECT_DIR/.env.production" ]; then
    error "Archivo .env.production no encontrado. Por favor crear desde .env.production.example"
fi

# Verify Docker is running
if ! docker info > /dev/null 2>&1; then
    error "Docker no está corriendo. Iniciar Docker primero."
fi

# Check if git repo exists
if [ ! -d "$PROJECT_DIR/.git" ]; then
    error "Directorio $PROJECT_DIR no es un repositorio Git"
fi

log "✅ Pre-deployment checks completados"

# ==========================================
# BACKUP CURRENT STATE
# ==========================================

log ""
log "📦 Creando backup del estado actual..."

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup databases
BACKUP_TIMESTAMP=$(date +%Y%m%d-%H%M%S)
info "Backing up database labsisEGProduccion..."
PGPASSWORD=labsis pg_dump -h localhost -U labsis -d labsisEGProduccion | gzip > "$BACKUP_DIR/labsisEGProduccion-$BACKUP_TIMESTAMP.sql.gz" || warning "Database backup failed, continuing anyway"

info "Backing up database lis_bot_comunicacioneg..."
PGPASSWORD=labsis pg_dump -h localhost -U labsis -d lis_bot_comunicacioneg | gzip > "$BACKUP_DIR/lis_bot_comunicacioneg-$BACKUP_TIMESTAMP.sql.gz" || warning "Database backup failed, continuing anyway"

# Backup current .env.production
if [ -f "$PROJECT_DIR/.env.production" ]; then
    cp "$PROJECT_DIR/.env.production" "$BACKUP_DIR/.env.production-$BACKUP_TIMESTAMP.backup"
    log "✅ Configuración respaldada"
fi

# ==========================================
# STOP OLD INSTANCE (if exists)
# ==========================================

log ""
log "🛑 Deteniendo instancia antigua (si existe)..."

# Check if there's a PM2 process running
if command -v pm2 &> /dev/null; then
    info "Deteniendo procesos PM2..."
    pm2 stop all || true
    pm2 delete all || true
    log "✅ Procesos PM2 detenidos"
else
    info "PM2 no encontrado, omitiendo..."
fi

# Stop any running Docker containers
if [ -f "$PROJECT_DIR/docker-compose.yml" ]; then
    info "Deteniendo contenedores Docker existentes..."
    cd "$PROJECT_DIR"
    docker compose down || true
    log "✅ Contenedores Docker detenidos"
fi

# ==========================================
# GIT PULL LATEST CODE
# ==========================================

log ""
log "📥 Obteniendo última versión del código..."

cd "$PROJECT_DIR"

# Fetch latest changes
git fetch origin || error "Git fetch falló"

# Checkout to main branch (or specified branch)
BRANCH="${1:-main}"
info "Cambiando a branch: $BRANCH"
git checkout "$BRANCH" || error "Git checkout falló"

# Pull latest changes
git pull origin "$BRANCH" || error "Git pull falló"

CURRENT_COMMIT=$(git rev-parse --short HEAD)
log "✅ Código actualizado a commit: $CURRENT_COMMIT"

# ==========================================
# BUILD DOCKER IMAGES
# ==========================================

log ""
log "🔨 Construyendo imágenes Docker..."

# Load production environment variables
set -a
source .env.production
set +a

info "Building with production configuration..."
docker compose build --no-cache || error "Docker build falló"

log "✅ Imágenes Docker construidas exitosamente"

# ==========================================
# START SERVICES
# ==========================================

log ""
log "🚀 Iniciando servicios..."

# Start all services in detached mode
docker compose up -d || error "Docker compose up falló"

log "✅ Servicios iniciados"

# ==========================================
# HEALTH CHECKS
# ==========================================

log ""
log "🏥 Verificando salud de los servicios..."

# Wait for services to start
info "Esperando 30 segundos para que los servicios inicien..."
sleep 30

# Function to check service health
check_service() {
    local service_name=$1
    local url=$2
    local max_attempts=10
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$url" > /dev/null 2>&1; then
            log "✅ $service_name está saludable"
            return 0
        fi
        info "Intento $attempt/$max_attempts: $service_name no responde aún..."
        sleep 5
        attempt=$((attempt + 1))
    done

    warning "$service_name no está respondiendo después de $max_attempts intentos"
    return 1
}

# Check each service
check_service "Sync Service" "http://localhost:3002/health"
check_service "Results API" "http://localhost:3003/api/health"
check_service "Messaging Bot" "http://localhost:3004/api/health"
check_service "Config API" "http://localhost:3005/health"
check_service "Web Frontend" "http://localhost:80/health"

# ==========================================
# DOCKER STATUS
# ==========================================

log ""
log "📊 Estado de los contenedores:"
docker compose ps

# ==========================================
# DEPLOYMENT SUMMARY
# ==========================================

log ""
log "============================================"
log "✅ DEPLOYMENT COMPLETADO EXITOSAMENTE"
log "============================================"
log "Commit desplegado: $CURRENT_COMMIT"
log "Timestamp: $(date +'%Y-%m-%d %H:%M:%S')"
log "Log file: $LOG_FILE"
log ""
log "🌐 URLs de acceso:"
log "   Frontend: http://54.197.68.252"
log "   Sync API: http://54.197.68.252:3002"
log "   Results API: http://54.197.68.252:3003"
log "   Messaging Bot: http://54.197.68.252:3004"
log "   Config API: http://54.197.68.252:3005"
log ""
log "📦 Backups creados en: $BACKUP_DIR"
log "============================================"

# ==========================================
# POST-DEPLOYMENT VERIFICATION
# ==========================================

log ""
log "🔍 Verificación post-deployment:"
log "1. Verificar logs: docker compose logs -f"
log "2. Verificar base de datos: psql -h localhost -U labsis -d labsisEGProduccion"
log "3. Probar login en: http://54.197.68.252"
log ""
log "Para rollback, ejecutar:"
log "  cd $PROJECT_DIR && docker compose down"
log "  git checkout <commit-anterior>"
log "  docker compose up -d"
log ""

exit 0
