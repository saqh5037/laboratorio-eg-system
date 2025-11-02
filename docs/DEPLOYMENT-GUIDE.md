# Guía de Deployment a AWS Staging

**Fecha de Creación:** 30 de Octubre, 2025
**Última Actualización:** 30 de Octubre, 2025
**Autor:** Equipo de Desarrollo Laboratorio EG

---

## Tabla de Contenidos

1. [Introducción](#introducción)
2. [Pre-requisitos](#pre-requisitos)
3. [Limpieza Pre-Deployment](#limpieza-pre-deployment)
4. [Deployment Paso a Paso](#deployment-paso-a-paso)
5. [Migraciones de Base de Datos](#migraciones-de-base-de-datos)
6. [Verificación Post-Deployment](#verificación-post-deployment)
7. [Comandos Útiles](#comandos-útiles)
8. [Troubleshooting](#troubleshooting)

---

## Introducción

Esta guía describe el proceso completo para desplegar la aplicación Laboratorio EG al ambiente de **AWS Staging**. Es **crítico** seguir todos los pasos, especialmente la limpieza de servicios locales, para evitar conflictos.

### Principio Fundamental

**⚠️ NUNCA ejecutar servicios locales y AWS staging simultáneamente ⚠️**

Los servicios en desarrollo local y AWS staging **NO pueden coexistir**, especialmente:
- El Telegram Bot (causará error 409)
- Servicios en puertos 3001, 3003, 3004
- Bases de datos con el mismo nombre

---

## Pre-requisitos

### Acceso y Credenciales

- [ ] Clave SSH AWS: `~/Desktop/certificados/labsisapp.pem`
- [ ] Permisos de sudo en servidor AWS
- [ ] Acceso a AWS Console para Security Groups
- [ ] Variables de entorno staging configuradas

### Servidores AWS

**App Server:**
```
Hostname: ec2-54-197-68-252.compute-1.amazonaws.com
IP: 54.197.68.252
SSH: ssh -i ~/Desktop/certificados/labsisapp.pem dynamtek@ec2-54-197-68-252.compute-1.amazonaws.com
```

**Database Server:**
```
Hostname: ec2-3-91-26-178.compute-1.amazonaws.com
Port: 5432
User: labsis
Password: ,U8x=]N02SX4
```

### Software Requerido en Servidor

- Node.js v18.20.8 (via NVM): `/home/dynamtek/.nvm/versions/node/v18.20.8`
- PM2 v6.0.13: `~/.nvm/versions/node/v18.20.8/bin/pm2`
- Nginx 1.18.0
- PostgreSQL Client

### Bases de Datos

- `labsisEG` - Base de datos existente (READ-ONLY)
- `lis_bot_comunicacion` - Base de datos para bot (READ-WRITE)

---

## Limpieza Pre-Deployment

**⚠️ PASO CRÍTICO:** Detener TODOS los servicios locales antes de deployment o testing.

### 1. Verificar Procesos Locales

```bash
# Ver procesos en puertos críticos
lsof -i -P -n | grep -E "(3001|3003|3004|5173)" | grep LISTEN
```

### 2. Matar Servicios Locales

```bash
# Matar messaging-bot (CRÍTICO - evita error 409)
ps aux | grep "messaging-bot" | grep node | awk '{print $2}' | xargs kill -9

# Matar results-service
ps aux | grep "results-service" | grep node | awk '{print $2}' | xargs kill -9

# Matar web-backend
ps aux | grep "apps/web" | grep node | awk '{print $2}' | xargs kill -9

# Matar frontend Vite
ps aux | grep "vite" | grep node | awk '{print $2}' | xargs kill -9
```

### 3. Verificar Puertos Liberados

```bash
# NO debe mostrar nada (excepto VS Code)
lsof -i -P -n | grep -E "(3001|3003|3004|5173)" | grep LISTEN
```

---

## Deployment Paso a Paso

### Servicio 1: Messaging Bot (Puerto 3004)

#### 1.1 Crear .env en Staging

```bash
ssh -i ~/Desktop/certificados/labsisapp.pem dynamtek@ec2-54-197-68-252.compute-1.amazonaws.com

cat > ~/apps/staging/apps/messaging-bot/.env << 'EOF'
# Messaging Bot - AWS Staging
PORT=3004
NODE_ENV=staging

# Bases de Datos AWS
BOT_DATABASE_URL=postgresql://labsis:,U8x=]N02SX4@ec2-3-91-26-178.compute-1.amazonaws.com:5432/lis_bot_comunicacion
LABSIS_DATABASE_URL=postgresql://labsis:,U8x=]N02SX4@ec2-3-91-26-178.compute-1.amazonaws.com:5432/labsisEG

# Telegram Bot (TOKEN DE PRODUCCIÓN)
TELEGRAM_BOT_TOKEN=7634568380:AAGmN24ESk-Fwnp1GgOM9G29xDZqnf-_TR4
TELEGRAM_ENABLED=true

# API Keys
GEMINI_API_KEY=AIzaSyAGlwn2nDECzKnqRYqHo4hVUlNqGMsp1mw
GEMINI_MODEL=gemini-2.0-flash-exp

# Security
JWT_SECRET=messaging_bot_secret_laboratorio_eg_2025

# CORS - AWS URLs
CORS_ORIGIN=http://54.197.68.252:5173,http://ec2-54-197-68-252.compute-1.amazonaws.com:5173

# Frontend URL
FRONTEND_URL=http://54.197.68.252:5173
EOF
```

#### 1.2 Desplegar Código

```bash
# Desde tu máquina local
cd /Users/samuelquiroz/Documents/proyectos/Test-Directory-EG/messaging-bot-service

rsync -avz --delete \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='.env' \
  -e "ssh -i ~/Desktop/certificados/labsisapp.pem" \
  ./src/ \
  ./package.json \
  dynamtek@ec2-54-197-68-252.compute-1.amazonaws.com:~/apps/staging/apps/messaging-bot/
```

#### 1.3 Crear Ecosystem PM2

```bash
ssh -i ~/Desktop/certificados/labsisapp.pem dynamtek@ec2-54-197-68-252.compute-1.amazonaws.com

cat > ~/apps/staging/apps/messaging-bot/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: "messaging-bot-staging",
    script: "./src/index.js",
    cwd: "/home/dynamtek/apps/staging/apps/messaging-bot",
    instances: 1,
    exec_mode: "fork",
    interpreter: "/home/dynamtek/.nvm/versions/node/v18.20.8/bin/node",
    env: {
      NODE_ENV: "staging",
      PORT: 3004
    },
    error_file: "/home/dynamtek/logs/messaging-bot-error.log",
    out_file: "/home/dynamtek/logs/messaging-bot-out.log",
    log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_restarts: 10,
    min_uptime: "10s",
    restart_delay: 4000,
    max_memory_restart: "500M"
  }]
};
EOF
```

#### 1.4 Instalar Dependencias e Iniciar

```bash
# Instalar dependencias
export PATH=~/.nvm/versions/node/v18.20.8/bin:$PATH
cd ~/apps/staging/apps/messaging-bot
npm install --production

# Iniciar con PM2
pm2 start ecosystem.config.js

# Verificar
pm2 status
pm2 logs messaging-bot-staging --lines 50
```

---

### Servicio 2: Results API (Puerto 3003)

#### 2.1 Crear .env en Staging

```bash
cat > ~/apps/staging/apps/results-api/.env << 'EOF'
# Results API - AWS Staging
DATABASE_URL=postgresql://labsis:,U8x=]N02SX4@ec2-3-91-26-178.compute-1.amazonaws.com:5432/labsisEG
PORT=3003
NODE_ENV=staging

# CORS - AWS URLs
CORS_ORIGIN=http://54.197.68.252:5173,http://ec2-54-197-68-252.compute-1.amazonaws.com:5173

# Security
JWT_SECRET=messaging_bot_secret_laboratorio_eg_2025
JWT_EXPIRATION=15m

# Logging
LOG_LEVEL=info
EOF
```

#### 2.2 Desplegar Código

```bash
# Desde local
cd /Users/samuelquiroz/Documents/proyectos/Test-Directory-EG/results-service

rsync -avz --delete \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='.env' \
  -e "ssh -i ~/Desktop/certificados/labsisapp.pem" \
  ./src/ \
  ./package.json \
  dynamtek@ec2-54-197-68-252.compute-1.amazonaws.com:~/apps/staging/apps/results-api/
```

#### 2.3 Crear Ecosystem PM2

**NOTA:** Como package.json tiene `"type": "module"`, usar extensión `.cjs`

```bash
cat > ~/apps/staging/apps/results-api/ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: "results-api-staging",
    script: "./src/index.js",
    cwd: "/home/dynamtek/apps/staging/apps/results-api",
    instances: 1,
    exec_mode: "fork",
    interpreter: "/home/dynamtek/.nvm/versions/node/v18.20.8/bin/node",
    env: {
      NODE_ENV: "staging",
      PORT: 3003
    },
    error_file: "/home/dynamtek/logs/results-api-error.log",
    out_file: "/home/dynamtek/logs/results-api-out.log",
    log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: "10s",
    max_memory_restart: "300M"
  }]
};
EOF
```

#### 2.4 Instalar e Iniciar

```bash
cd ~/apps/staging/apps/results-api
npm install --production
pm2 start ecosystem.config.cjs
pm2 status
```

---

### Servicio 3: Web Backend (Puerto 3001)

#### 3.1 Crear .env en Staging

```bash
cat > ~/apps/staging/apps/web/.env << 'EOF'
# Web Backend - AWS Staging
DB_HOST=ec2-3-91-26-178.compute-1.amazonaws.com
DB_PORT=5432
DB_NAME=labsisEG
DB_USER=labsis
DB_PASSWORD=,U8x=]N02SX4
DB_SSL=false

API_PORT=3001
NODE_ENV=production

# CORS - AWS URLs
CORS_ORIGIN=http://54.197.68.252:5173,http://ec2-54-197-68-252.compute-1.amazonaws.com:5173

LOG_LEVEL=info
EOF
```

#### 3.2 Desplegar Código

```bash
cd /Users/samuelquiroz/Documents/proyectos/laboratorio-eg-system/apps/web

rsync -avz --delete \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='dist' \
  --exclude='.env' \
  --exclude='src' \
  --exclude='public' \
  -e "ssh -i ~/Desktop/certificados/labsisapp.pem" \
  ./server/ \
  ./package.json \
  dynamtek@ec2-54-197-68-252.compute-1.amazonaws.com:~/apps/staging/apps/web/
```

#### 3.3 Crear Ecosystem PM2

```bash
cat > ~/apps/staging/apps/web/ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: "web-backend-staging",
    script: "./index.js",
    cwd: "/home/dynamtek/apps/staging/apps/web",
    instances: 1,
    exec_mode: "fork",
    interpreter: "/home/dynamtek/.nvm/versions/node/v18.20.8/bin/node",
    env: {
      NODE_ENV: "production",
      API_PORT: 3001
    },
    error_file: "/home/dynamtek/logs/web-backend-error.log",
    out_file: "/home/dynamtek/logs/web-backend-out.log",
    log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    max_memory_restart: "500M"
  }]
};
EOF
```

#### 3.4 Instalar e Iniciar

```bash
cd ~/apps/staging/apps/web
npm install --production
pm2 start ecosystem.config.cjs
pm2 status
```

---

### Servicio 4: Frontend (Puerto 5173)

#### 4.1 Build con Variables de Ambiente Correctas

**CRÍTICO:** El frontend DEBE construirse con URLs de AWS, NO localhost.

```bash
# Desde local
cd /Users/samuelquiroz/Documents/proyectos/laboratorio-eg-system/apps/web

# Copiar .env.staging como .env.production
cp .env.staging .env.production

# Verificar que contenga URLs de AWS
cat .env.production
# Debe tener:
# VITE_API_URL=http://54.197.68.252:3001/api
# VITE_RESULTS_API_URL=http://54.197.68.252:3003/api
# VITE_MESSAGING_BOT_API_URL=http://54.197.68.252:3004/api

# Build para producción
npm run build
```

#### 4.2 Desplegar Build

```bash
rsync -avz --delete \
  -e "ssh -i ~/Desktop/certificados/labsisapp.pem" \
  ./dist/ \
  dynamtek@ec2-54-197-68-252.compute-1.amazonaws.com:~/apps/staging/frontend/
```

#### 4.3 Configurar Nginx (si no existe)

```bash
ssh -i ~/Desktop/certificados/labsisapp.pem dynamtek@ec2-54-197-68-252.compute-1.amazonaws.com

sudo tee /etc/nginx/sites-available/staging > /dev/null << 'EOF'
server {
    listen 5173;
    server_name ec2-54-197-68-252.compute-1.amazonaws.com 54.197.68.252;

    root /home/dynamtek/apps/staging/frontend;
    index index.html;

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|otf)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Activar sitio
sudo ln -sf /etc/nginx/sites-available/staging /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Migraciones de Base de Datos

### Conectar a Base de Datos

```bash
PGPASSWORD=',U8x=]N02SX4' psql \
  -h ec2-3-91-26-178.compute-1.amazonaws.com \
  -U labsis \
  -d lis_bot_comunicacion
```

### Aplicar Migraciones

```bash
# Migración 004: Fix token VARCHAR limit
PGPASSWORD=',U8x=]N02SX4' psql \
  -h ec2-3-91-26-178.compute-1.amazonaws.com \
  -U labsis \
  -d lis_bot_comunicacion \
  -f migrations/lis_bot_comunicacion/004_fix_token_varchar_limit.sql
```

### Verificar Estructura de Tablas

```bash
# Listar tablas
PGPASSWORD=',U8x=]N02SX4' psql \
  -h ec2-3-91-26-178.compute-1.amazonaws.com \
  -U labsis \
  -d lis_bot_comunicacion \
  -c "\dt"
```

---

## Verificación Post-Deployment

### 1. Verificar Servicios PM2

```bash
ssh -i ~/Desktop/certificados/labsisapp.pem dynamtek@ec2-54-197-68-252.compute-1.amazonaws.com

export PATH=~/.nvm/versions/node/v18.20.8/bin:$PATH
pm2 status

# Deben estar TODOS en "online"
# messaging-bot-staging
# results-api-staging
# web-backend-staging
```

### 2. Verificar Logs

```bash
# Ver logs de todos los servicios
pm2 logs --lines 50

# Ver logs individuales
pm2 logs messaging-bot-staging
pm2 logs results-api-staging
pm2 logs web-backend-staging
```

### 3. Verificar No Hay Error 409 en Telegram Bot

```bash
pm2 logs messaging-bot-staging --err | grep "409"

# NO debe mostrar nada
# Si muestra error 409, hay un bot local corriendo
```

### 4. Test de Endpoints

```bash
# Desde local
# Frontend
curl -I http://54.197.68.252:5173/

# Web Backend
curl -I http://54.197.68.252:5173/api/areas

# Results API (directo)
curl http://54.197.68.252:3003/api/resultados/health

# Messaging Bot (directo)
curl http://54.197.68.252:3004/api/auth/health
```

### 5. Test de Autenticación en Browser

1. Abrir: `http://54.197.68.252:5173/resultados`
2. Verificar que NO hay errores CORS en consola
3. Probar login por cédula
4. Probar login por Telegram
5. Verificar que se pueden ver órdenes de trabajo

### 6. Guardar Configuración PM2

```bash
# En servidor AWS
pm2 save

# Configurar auto-start en boot
pm2 startup
# Copiar y ejecutar el comando que muestra
```

---

## Comandos Útiles

### SSH al Servidor

```bash
ssh -i ~/Desktop/certificados/labsisapp.pem dynamtek@ec2-54-197-68-252.compute-1.amazonaws.com
```

### PM2 Basics

```bash
# Ver todos los servicios
pm2 status

# Ver logs en tiempo real
pm2 logs

# Reiniciar un servicio
pm2 restart messaging-bot-staging

# Reiniciar todos
pm2 restart all

# Detener un servicio
pm2 stop messaging-bot-staging

# Eliminar un servicio
pm2 delete messaging-bot-staging

# Ver info de un proceso
pm2 show messaging-bot-staging

# Limpiar logs
pm2 flush
```

### Rsync Deployment

```bash
# Template general
rsync -avz --delete \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='.env' \
  -e "ssh -i ~/Desktop/certificados/labsisapp.pem" \
  ./source/ \
  dynamtek@ec2-54-197-68-252.compute-1.amazonaws.com:~/destination/
```

### Database Management

```bash
# Conectar a lis_bot_comunicacion
PGPASSWORD=',U8x=]N02SX4' psql \
  -h ec2-3-91-26-178.compute-1.amazonaws.com \
  -U labsis \
  -d lis_bot_comunicacion

# Conectar a labsisEG
PGPASSWORD=',U8x=]N02SX4' psql \
  -h ec2-3-91-26-178.compute-1.amazonaws.com \
  -U labsis \
  -d labsisEG

# Ejecutar SQL desde archivo
PGPASSWORD=',U8x=]N02SX4' psql \
  -h ec2-3-91-26-178.compute-1.amazonaws.com \
  -U labsis \
  -d lis_bot_comunicacion \
  -f migration.sql
```

---

## Troubleshooting

### Servicio No Arranca

```bash
# Ver logs de error
pm2 logs service-name --err

# Ver info completa del proceso
pm2 show service-name

# Intentar ejecutar manualmente
cd ~/apps/staging/apps/service-name
node index.js
```

### Error 409 en Telegram Bot

**Causa:** Hay otro bot local corriendo con el mismo token.

**Solución:**
```bash
# En local, matar TODOS los procesos de messaging-bot
ps aux | grep "messaging-bot" | grep node | awk '{print $2}' | xargs kill -9

# Esperar 30-60 segundos
# Verificar que ya no hay error 409
pm2 logs messaging-bot-staging | grep "409"
```

### Error CORS

**Causa:** Frontend tiene URLs incorrectas o CORS mal configurado.

**Solución:**
1. Verificar .env en backend tiene ambos orígenes
2. Verificar código parsea CORS_ORIGIN con `.split(',')`
3. Reiniciar servicio: `pm2 restart service-name`

### Port Already in Use

**Solución:**
```bash
# Ver qué está usando el puerto
lsof -i :3004

# Matar el proceso
kill -9 PID
```

### Base de Datos No Conecta

**Solución:**
```bash
# Verificar variables de entorno
cat ~/apps/staging/apps/service-name/.env

# Test de conexión manual
PGPASSWORD=',U8x=]N02SX4' psql \
  -h ec2-3-91-26-178.compute-1.amazonaws.com \
  -U labsis \
  -d lis_bot_comunicacion \
  -c "SELECT NOW();"
```

---

## Referencias

- [ENVIRONMENT-SEPARATION.md](./ENVIRONMENT-SEPARATION.md) - Separación de ambientes
- [AWS-INFRASTRUCTURE.md](./AWS-INFRASTRUCTURE.md) - Infraestructura AWS
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Solución de problemas

---

**Fecha de última revisión:** 30 de Octubre, 2025
