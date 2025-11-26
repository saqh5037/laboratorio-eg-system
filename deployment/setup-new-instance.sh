#!/bin/bash
# ==========================================
# Setup New Laboratory Instance
# ==========================================
# This script creates a new lab deployment configuration
# from templates, ready to deploy with Docker Compose
# ==========================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "\n${BLUE}===========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}===========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATES_DIR="${SCRIPT_DIR}/templates"
INSTANCES_DIR="${SCRIPT_DIR}/instances"

# Check templates exist
if [ ! -d "$TEMPLATES_DIR" ]; then
    print_error "Templates directory not found: $TEMPLATES_DIR"
    exit 1
fi

print_header "Laboratory System - New Instance Setup"

# ==========================================
# Gather Information
# ==========================================

echo -e "${YELLOW}This script will create a new laboratory deployment configuration.${NC}\n"

# Lab Code (short identifier)
read -p "Enter lab code (e.g., eg, dimogen, microtec): " LAB_CODE
LAB_CODE=$(echo "$LAB_CODE" | tr '[:upper:]' '[:lower:]' | tr -d ' ')

if [ -z "$LAB_CODE" ]; then
    print_error "Lab code is required"
    exit 1
fi

# Lab Name (display name)
read -p "Enter lab full name (e.g., Laboratorio Elizabeth Gutiérrez): " LAB_NAME
if [ -z "$LAB_NAME" ]; then
    LAB_NAME="Laboratorio $LAB_CODE"
fi

# Instance prefix for Docker
INSTANCE_PREFIX="lab-${LAB_CODE}"
read -p "Docker container prefix [$INSTANCE_PREFIX]: " CUSTOM_PREFIX
INSTANCE_PREFIX="${CUSTOM_PREFIX:-$INSTANCE_PREFIX}"

# Database names
DB_NAME_LABSIS_DEFAULT="labsis${LAB_CODE^}"  # e.g., labsisEg
DB_NAME_BOT_DEFAULT="lis_bot_comunicacion_${LAB_CODE}"  # e.g., lis_bot_comunicacion_eg

read -p "LABSIS database name [$DB_NAME_LABSIS_DEFAULT]: " DB_NAME_LABSIS
DB_NAME_LABSIS="${DB_NAME_LABSIS:-$DB_NAME_LABSIS_DEFAULT}"

read -p "Bot/Config database name [$DB_NAME_BOT_DEFAULT]: " DB_NAME_BOT
DB_NAME_BOT="${DB_NAME_BOT:-$DB_NAME_BOT_DEFAULT}"

# Database host
read -p "Database host [localhost]: " DB_HOST
DB_HOST="${DB_HOST:-localhost}"

# Database password
read -s -p "Database password: " DB_PASSWORD
echo ""
if [ -z "$DB_PASSWORD" ]; then
    print_error "Database password is required"
    exit 1
fi

# Public URL
read -p "Public URL (e.g., http://lab-eg.example.com): " PUBLIC_URL
if [ -z "$PUBLIC_URL" ]; then
    print_error "Public URL is required"
    exit 1
fi

# Generate JWT secret
JWT_SECRET=$(openssl rand -hex 32)
print_success "Generated JWT secret"

# Telegram Bot (optional)
echo ""
read -p "Telegram Bot Token (leave empty to skip): " TELEGRAM_BOT_TOKEN
if [ -n "$TELEGRAM_BOT_TOKEN" ]; then
    read -p "Telegram Bot Username (without @): " TELEGRAM_BOT_USERNAME
fi

# Gemini API Key (optional)
read -p "Gemini API Key (leave empty to skip): " GEMINI_API_KEY

# Twilio (optional)
echo ""
read -p "Configure Twilio/WhatsApp? (y/n) [n]: " CONFIGURE_TWILIO
if [ "$CONFIGURE_TWILIO" = "y" ]; then
    read -p "Twilio Account SID: " TWILIO_ACCOUNT_SID
    read -p "Twilio Auth Token: " TWILIO_AUTH_TOKEN
    read -p "Twilio Phone Number: " TWILIO_PHONE_NUMBER
fi

# Ports
echo ""
print_warning "Port configuration (leave empty for defaults)"
read -p "Web port [80]: " WEB_PORT
WEB_PORT="${WEB_PORT:-80}"
read -p "Sync service port [3002]: " SYNC_PORT
SYNC_PORT="${SYNC_PORT:-3002}"
read -p "Results API port [3003]: " RESULTS_PORT
RESULTS_PORT="${RESULTS_PORT:-3003}"
read -p "Messaging bot port [3004]: " MESSAGING_PORT
MESSAGING_PORT="${MESSAGING_PORT:-3004}"
read -p "Config API port [3005]: " CONFIG_PORT
CONFIG_PORT="${CONFIG_PORT:-3005}"
read -p "Config WebSocket port [3006]: " CONFIG_WS_PORT
CONFIG_WS_PORT="${CONFIG_WS_PORT:-3006}"

# Docker registry
read -p "Docker registry [ghcr.io/your-org]: " DOCKER_REGISTRY
DOCKER_REGISTRY="${DOCKER_REGISTRY:-ghcr.io/your-org}"

read -p "Image tag [latest]: " IMAGE_TAG
IMAGE_TAG="${IMAGE_TAG:-latest}"

# ==========================================
# Create Instance Directory
# ==========================================

print_header "Creating Instance Configuration"

INSTANCE_DIR="${INSTANCES_DIR}/${LAB_CODE}"
mkdir -p "$INSTANCE_DIR"

# Generate CORS_ORIGIN
CORS_ORIGIN="${PUBLIC_URL}"
if [ "$WEB_PORT" != "80" ] && [ "$WEB_PORT" != "443" ]; then
    CORS_ORIGIN="${PUBLIC_URL}:${WEB_PORT}"
fi

# ==========================================
# Generate .env file
# ==========================================

cat > "${INSTANCE_DIR}/.env" << EOF
# ==========================================
# ${LAB_NAME} - Production Environment
# ==========================================
# Instance: ${LAB_CODE}
# Generated: $(date)
# ==========================================

# ==========================================
# Instance Identification
# ==========================================
LAB_CODE=${LAB_CODE}
LAB_NAME="${LAB_NAME}"
INSTANCE_PREFIX=${INSTANCE_PREFIX}

# ==========================================
# General Configuration
# ==========================================
NODE_ENV=production
LOG_LEVEL=info

# ==========================================
# Database Configuration
# ==========================================
DB_HOST=${DB_HOST}
DB_PORT=5432
DB_PASSWORD=${DB_PASSWORD}
DB_MAX_CONNECTIONS=20
DB_NAME_LABSIS=${DB_NAME_LABSIS}
DB_NAME_BOT=${DB_NAME_BOT}

# ==========================================
# JWT Authentication
# ==========================================
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRATION=24h

# ==========================================
# URLs Configuration
# ==========================================
PUBLIC_URL=${PUBLIC_URL}
CORS_ORIGIN=${CORS_ORIGIN}

# ==========================================
# Port Configuration
# ==========================================
WEB_PORT=${WEB_PORT}
SYNC_PORT=${SYNC_PORT}
RESULTS_PORT=${RESULTS_PORT}
MESSAGING_PORT=${MESSAGING_PORT}
CONFIG_PORT=${CONFIG_PORT}
CONFIG_WS_PORT=${CONFIG_WS_PORT}

# ==========================================
# Docker Configuration
# ==========================================
DOCKER_REGISTRY=${DOCKER_REGISTRY}
IMAGE_TAG=${IMAGE_TAG}

# ==========================================
# Frontend API URLs
# ==========================================
VITE_API_URL=${PUBLIC_URL}:${SYNC_PORT}/api
VITE_CONFIG_API_URL=${PUBLIC_URL}:${CONFIG_PORT}
VITE_RESULTS_API_URL=${PUBLIC_URL}:${RESULTS_PORT}
VITE_MESSAGING_BOT_API_URL=/api/messaging

# ==========================================
# Telegram Bot
# ==========================================
TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN:-}
TELEGRAM_BOT_USERNAME=${TELEGRAM_BOT_USERNAME:-}

# ==========================================
# WhatsApp (Twilio)
# ==========================================
TWILIO_ACCOUNT_SID=${TWILIO_ACCOUNT_SID:-}
TWILIO_AUTH_TOKEN=${TWILIO_AUTH_TOKEN:-}
TWILIO_PHONE_NUMBER=${TWILIO_PHONE_NUMBER:-}

# ==========================================
# Gemini AI
# ==========================================
GEMINI_API_KEY=${GEMINI_API_KEY:-}

# ==========================================
# Cache & Rate Limiting
# ==========================================
CACHE_TTL_SECONDS=300
CACHE_CHECK_PERIOD_SECONDS=60
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=1000
WS_HEARTBEAT_INTERVAL=30000
EOF

print_success "Created .env file"

# ==========================================
# Generate docker-compose.yml
# ==========================================

# Copy and substitute template
envsubst < "${TEMPLATES_DIR}/docker-compose.template.yml" > "${INSTANCE_DIR}/docker-compose.yml"
print_success "Created docker-compose.yml"

# ==========================================
# Generate Database Init Script
# ==========================================

cat > "${INSTANCE_DIR}/init-database.sql" << EOF
-- ==========================================
-- ${LAB_NAME} - Database Initialization
-- ==========================================
-- Run this script as PostgreSQL superuser to create databases
-- psql -U postgres -f init-database.sql
-- ==========================================

-- Create user if not exists
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'labsis') THEN
        CREATE ROLE labsis WITH LOGIN PASSWORD '${DB_PASSWORD}';
    END IF;
END
\$\$;

-- Create LABSIS database (lab data)
CREATE DATABASE "${DB_NAME_LABSIS}" OWNER labsis;

-- Create Bot/Config database
CREATE DATABASE "${DB_NAME_BOT}" OWNER labsis;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE "${DB_NAME_LABSIS}" TO labsis;
GRANT ALL PRIVILEGES ON DATABASE "${DB_NAME_BOT}" TO labsis;

-- Connect to bot database and run migrations
\c ${DB_NAME_BOT}

-- This database will receive migrations from config-api
-- Run: docker exec -it ${INSTANCE_PREFIX}-config-api npm run migrate

\echo 'Databases created successfully!'
\echo 'Next steps:'
\echo '1. Run migrations: docker exec -it ${INSTANCE_PREFIX}-config-api npm run migrate'
\echo '2. Configure company_info table with lab branding'
\echo '3. Configure theme_config table with lab colors'
EOF

print_success "Created init-database.sql"

# ==========================================
# Generate Helper Scripts
# ==========================================

cat > "${INSTANCE_DIR}/start.sh" << 'SCRIPT'
#!/bin/bash
# Start all services
cd "$(dirname "$0")"
docker compose up -d
echo "Services starting... Check status with: docker compose ps"
SCRIPT
chmod +x "${INSTANCE_DIR}/start.sh"

cat > "${INSTANCE_DIR}/stop.sh" << 'SCRIPT'
#!/bin/bash
# Stop all services
cd "$(dirname "$0")"
docker compose down
echo "Services stopped"
SCRIPT
chmod +x "${INSTANCE_DIR}/stop.sh"

cat > "${INSTANCE_DIR}/logs.sh" << 'SCRIPT'
#!/bin/bash
# View logs
cd "$(dirname "$0")"
docker compose logs -f "$@"
SCRIPT
chmod +x "${INSTANCE_DIR}/logs.sh"

cat > "${INSTANCE_DIR}/update.sh" << 'SCRIPT'
#!/bin/bash
# Update images and restart
cd "$(dirname "$0")"
docker compose pull
docker compose up -d
echo "Services updated and restarted"
SCRIPT
chmod +x "${INSTANCE_DIR}/update.sh"

print_success "Created helper scripts (start.sh, stop.sh, logs.sh, update.sh)"

# ==========================================
# Generate README
# ==========================================

cat > "${INSTANCE_DIR}/README.md" << EOF
# ${LAB_NAME} - Deployment Configuration

**Instance Code:** \`${LAB_CODE}\`
**Container Prefix:** \`${INSTANCE_PREFIX}\`
**Generated:** $(date)

## Quick Start

### 1. Initialize Database
\`\`\`bash
# As PostgreSQL superuser
psql -U postgres -f init-database.sql
\`\`\`

### 2. Start Services
\`\`\`bash
./start.sh
# or
docker compose up -d
\`\`\`

### 3. Run Migrations
\`\`\`bash
docker exec -it ${INSTANCE_PREFIX}-config-api npm run migrate
\`\`\`

### 4. Configure Branding
Access the admin panel at \`${PUBLIC_URL}:${CONFIG_PORT}\` and configure:
- Company information (name, contact, social media)
- Theme colors
- Logos

## Services

| Service | Container | Port |
|---------|-----------|------|
| Web Frontend | ${INSTANCE_PREFIX}-web | ${WEB_PORT} |
| Sync Service | ${INSTANCE_PREFIX}-sync-service | ${SYNC_PORT} |
| Results API | ${INSTANCE_PREFIX}-results-api | ${RESULTS_PORT} |
| Messaging Bot | ${INSTANCE_PREFIX}-messaging-bot | ${MESSAGING_PORT} |
| Config API | ${INSTANCE_PREFIX}-config-api | ${CONFIG_PORT} |

## Helper Scripts

- \`./start.sh\` - Start all services
- \`./stop.sh\` - Stop all services
- \`./logs.sh [service]\` - View logs
- \`./update.sh\` - Pull latest images and restart

## Databases

- **Lab Data:** \`${DB_NAME_LABSIS}\`
- **Config/Bot:** \`${DB_NAME_BOT}\`

## URLs

- **Public URL:** ${PUBLIC_URL}
- **Web App:** ${PUBLIC_URL}:${WEB_PORT}
- **Config API:** ${PUBLIC_URL}:${CONFIG_PORT}
- **Results API:** ${PUBLIC_URL}:${RESULTS_PORT}
EOF

print_success "Created README.md"

# ==========================================
# Summary
# ==========================================

print_header "Instance Created Successfully!"

echo -e "Instance directory: ${GREEN}${INSTANCE_DIR}${NC}"
echo ""
echo "Files created:"
echo "  - .env (environment configuration)"
echo "  - docker-compose.yml (service definitions)"
echo "  - init-database.sql (database initialization)"
echo "  - start.sh, stop.sh, logs.sh, update.sh (helper scripts)"
echo "  - README.md (documentation)"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Review and adjust .env if needed"
echo "2. Copy files to the deployment server"
echo "3. Run init-database.sql to create databases"
echo "4. Run ./start.sh to start services"
echo "5. Run migrations via config-api container"
echo "6. Configure branding via admin panel"
echo ""
print_success "Setup complete for ${LAB_NAME}!"
