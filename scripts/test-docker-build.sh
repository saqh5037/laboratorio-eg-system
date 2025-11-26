#!/bin/bash

# ==========================================
# Test Docker Build Script
# ==========================================
# Este script valida que la infraestructura Docker esté correctamente configurada
# Ejecutar después de instalar Docker Desktop
# ==========================================

set -e  # Exit on error

echo "🐳 Laboratorio EG - Test de Infraestructura Docker"
echo "=================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar que Docker esté instalado
echo "📋 Paso 1: Verificando instalación de Docker..."
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker no está instalado${NC}"
    echo "Por favor instala Docker Desktop desde: https://docs.docker.com/get-docker/"
    exit 1
fi
echo -e "${GREEN}✅ Docker instalado: $(docker --version)${NC}"

if ! command -v docker compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose no está instalado${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker Compose instalado: $(docker compose version)${NC}"
echo ""

# Verificar que Docker esté corriendo
echo "📋 Paso 2: Verificando que Docker daemon esté corriendo..."
if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker daemon no está corriendo${NC}"
    echo "Por favor inicia Docker Desktop"
    exit 1
fi
echo -e "${GREEN}✅ Docker daemon corriendo${NC}"
echo ""

# Verificar que .env exista
echo "📋 Paso 3: Verificando archivo .env..."
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Archivo .env no existe${NC}"
    echo "Creando .env desde .env.example..."
    cp .env.example .env
    echo -e "${GREEN}✅ Archivo .env creado${NC}"
    echo -e "${YELLOW}⚠️  Por favor edita .env y configura las variables requeridas:${NC}"
    echo "   - TELEGRAM_BOT_TOKEN"
    echo "   - TWILIO_ACCOUNT_SID"
    echo "   - TWILIO_AUTH_TOKEN"
    echo "   - GEMINI_API_KEY"
    echo "   - JWT_SECRET (cambiar el valor por defecto)"
    echo ""
    read -p "¿Continuar de todos modos? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo -e "${GREEN}✅ Archivo .env existe${NC}"
fi
echo ""

# Detener servicios locales que puedan usar los puertos
echo "📋 Paso 4: Verificando puertos disponibles..."
PORTS=(80 3002 3003 3004 3005 3006 5432 5433)
PORTS_IN_USE=()

for port in "${PORTS[@]}"; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        PORTS_IN_USE+=($port)
    fi
done

if [ ${#PORTS_IN_USE[@]} -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Los siguientes puertos están en uso: ${PORTS_IN_USE[*]}${NC}"
    echo "Intentando liberar puertos..."
    for port in "${PORTS_IN_USE[@]}"; do
        lsof -ti:$port | xargs kill -9 2>/dev/null || true
    done
    sleep 2
    echo -e "${GREEN}✅ Puertos liberados${NC}"
else
    echo -e "${GREEN}✅ Todos los puertos están disponibles${NC}"
fi
echo ""

# Limpiar contenedores previos si existen
echo "📋 Paso 5: Limpiando contenedores previos..."
docker compose down -v 2>/dev/null || true
echo -e "${GREEN}✅ Cleanup completado${NC}"
echo ""

# Build de las imágenes
echo "📋 Paso 6: Construyendo imágenes Docker..."
echo "Esto puede tomar varios minutos la primera vez..."
echo ""

if docker compose build; then
    echo -e "${GREEN}✅ Build completado exitosamente${NC}"
else
    echo -e "${RED}❌ Error en el build${NC}"
    exit 1
fi
echo ""

# Iniciar los servicios
echo "📋 Paso 7: Iniciando servicios..."
if docker compose up -d; then
    echo -e "${GREEN}✅ Servicios iniciados${NC}"
else
    echo -e "${RED}❌ Error al iniciar servicios${NC}"
    exit 1
fi
echo ""

# Esperar a que los servicios estén listos
echo "📋 Paso 8: Esperando a que los servicios estén listos..."
echo "Esto puede tomar 30-60 segundos..."
sleep 10

# Verificar estado de los contenedores
echo ""
echo "📋 Paso 9: Verificando estado de contenedores..."
docker compose ps
echo ""

# Verificar health checks
echo "📋 Paso 10: Verificando health checks..."
echo "Esperando healthchecks (30 segundos)..."
sleep 30

UNHEALTHY=$(docker compose ps --format json | jq -r 'select(.Health == "unhealthy") | .Name' 2>/dev/null || echo "")
if [ -n "$UNHEALTHY" ]; then
    echo -e "${YELLOW}⚠️  Servicios unhealthy: $UNHEALTHY${NC}"
    echo "Mostrando logs de servicios unhealthy:"
    for service in $UNHEALTHY; do
        echo ""
        echo "--- Logs de $service ---"
        docker compose logs --tail=50 $service
    done
else
    echo -e "${GREEN}✅ Todos los servicios están healthy${NC}"
fi
echo ""

# Verificar endpoints
echo "📋 Paso 11: Verificando endpoints de salud..."

ENDPOINTS=(
    "http://localhost:3002/api/health|Sync Service"
    "http://localhost:3003/api/health|Results API"
    "http://localhost:3004/api/health|Messaging Bot"
    "http://localhost:3005/api/health|Config API"
    "http://localhost/health|Frontend"
)

for endpoint_info in "${ENDPOINTS[@]}"; do
    IFS='|' read -r endpoint name <<< "$endpoint_info"
    if curl -s -f "$endpoint" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $name: $endpoint${NC}"
    else
        echo -e "${RED}❌ $name: $endpoint${NC}"
    fi
done
echo ""

# Verificar bases de datos
echo "📋 Paso 12: Verificando bases de datos PostgreSQL..."
if docker compose exec -T postgres-labsis psql -U labsis -d labsisEG -c "SELECT version();" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PostgreSQL labsisEG conectado${NC}"
else
    echo -e "${RED}❌ PostgreSQL labsisEG no conecta${NC}"
fi

if docker compose exec -T postgres-bot psql -U labsis -d lis_bot_comunicacion -c "SELECT version();" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PostgreSQL lis_bot_comunicacion conectado${NC}"
else
    echo -e "${RED}❌ PostgreSQL lis_bot_comunicacion no conecta${NC}"
fi
echo ""

# Mostrar logs resumidos
echo "📋 Paso 13: Logs recientes de servicios..."
echo "--- Últimas 10 líneas de cada servicio ---"
docker compose logs --tail=10
echo ""

# Resumen final
echo "=================================================="
echo "🎉 Testing completado!"
echo "=================================================="
echo ""
echo "Comandos útiles:"
echo "  docker compose ps                    # Ver estado de servicios"
echo "  docker compose logs -f               # Ver logs en tiempo real"
echo "  docker compose logs -f web           # Ver logs de un servicio"
echo "  docker compose down                  # Detener servicios"
echo "  docker compose down -v               # Detener y eliminar volúmenes"
echo "  docker compose restart web           # Reiniciar un servicio"
echo ""
echo "URLs de acceso:"
echo "  Frontend:        http://localhost"
echo "  Config API:      http://localhost:3005/api"
echo "  Results API:     http://localhost:3003/api"
echo "  Messaging Bot:   http://localhost:3004/api"
echo "  Sync Service:    http://localhost:3002/api"
echo ""
echo "Para detener todos los servicios:"
echo "  docker compose down"
echo ""
