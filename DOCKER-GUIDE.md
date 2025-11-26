# Guía de Docker - Laboratorio EG System

Esta guía te ayudará a ejecutar el sistema completo de Laboratorio EG usando Docker y Docker Compose.

## Requisitos Previos

- [Docker](https://docs.docker.com/get-docker/) instalado (versión 20.10 o superior)
- [Docker Compose](https://docs.docker.com/compose/install/) instalado (versión 2.0 o superior)
- Al menos 4GB de RAM disponible
- 10GB de espacio en disco

### Instalación de Docker

Si Docker no está instalado en tu sistema, sigue estos pasos:

#### macOS

1. Descarga Docker Desktop desde: https://docs.docker.com/desktop/install/mac-install/
2. Instala el archivo .dmg descargado
3. Abre Docker Desktop desde Applications
4. Espera a que Docker Desktop inicie completamente (icono de ballena en la barra de menú)
5. Verifica la instalación:
   ```bash
   docker --version
   docker compose version
   ```

#### Linux (Ubuntu/Debian)

```bash
# Actualizar repositorios
sudo apt-get update

# Instalar dependencias
sudo apt-get install ca-certificates curl gnupg

# Agregar Docker GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Configurar repositorio
echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Verificar instalación
docker --version
docker compose version
```

#### Windows

1. Descarga Docker Desktop desde: https://docs.docker.com/desktop/install/windows-install/
2. Ejecuta el instalador
3. Reinicia el sistema si es necesario
4. Abre Docker Desktop
5. Verifica la instalación en PowerShell:
   ```powershell
   docker --version
   docker compose version
   ```

### Testing Rápido

Una vez instalado Docker, ejecuta el script de testing:

```bash
cd /Users/samuelquiroz/Documents/proyectos/laboratorio-eg-system
./scripts/test-docker-build.sh
```

Este script automáticamente:
- ✅ Verifica que Docker esté instalado y corriendo
- ✅ Valida que los puertos estén disponibles
- ✅ Crea .env si no existe
- ✅ Construye todas las imágenes
- ✅ Inicia los servicios
- ✅ Verifica health checks
- ✅ Prueba endpoints de salud
- ✅ Muestra logs de errores si algo falla

## Estructura del Sistema

El sistema está compuesto por 7 servicios:

1. **postgres-labsis**: Base de datos PostgreSQL (labsisEG)
2. **postgres-bot**: Base de datos PostgreSQL (lis_bot_comunicacion)
3. **sync-service**: Servicio de sincronización de datos (Puerto 3002)
4. **results-api**: API de resultados de pacientes (Puerto 3003)
5. **messaging-bot**: Bot de Telegram y WhatsApp (Puerto 3004)
6. **config-api**: API de configuración centralizada (Puerto 3005/3006)
7. **web**: Frontend PWA React + Vite (Puerto 80)

## Configuración Inicial

### 1. Crear archivo de variables de entorno

Copia el archivo `.env.example` a `.env`:

```bash
cp .env.example .env
```

### 2. Configurar variables REQUERIDAS

Edita el archivo `.env` y configura las siguientes variables:

```bash
# CRÍTICO: Cambiar en producción
JWT_SECRET=tu-secret-super-seguro-aqui
DB_PASSWORD=tu-password-seguro-aqui

# Telegram Bot (Obtener de @BotFather)
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_BOT_USERNAME=tu_bot_username

# Twilio WhatsApp (Obtener de https://www.twilio.com/console)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=tu_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Gemini AI (Obtener de https://makersuite.google.com/app/apikey)
GEMINI_API_KEY=tu_gemini_api_key_aqui
```

### 3. Configurar URLs públicas (Producción)

Si estás desplegando en producción, configura las URLs públicas:

```bash
PUBLIC_URL=https://tudominio.com
VITE_API_URL=https://tudominio.com/api
VITE_CONFIG_API_URL=https://tudominio.com/config
VITE_RESULTS_API_URL=https://tudominio.com/results
CORS_ORIGIN=https://tudominio.com,https://www.tudominio.com
```

## Uso Básico

### Iniciar todos los servicios

```bash
docker compose up -d
```

Este comando:
- Construye las imágenes Docker (primera vez)
- Crea las redes y volúmenes necesarios
- Inicia todos los servicios en background

### Ver logs de todos los servicios

```bash
docker compose logs -f
```

### Ver logs de un servicio específico

```bash
docker compose logs -f web
docker compose logs -f config-api
docker compose logs -f messaging-bot
```

### Detener todos los servicios

```bash
docker compose down
```

### Detener y eliminar volúmenes (CUIDADO: Elimina datos)

```bash
docker compose down -v
```

### Reiniciar un servicio específico

```bash
docker compose restart web
docker compose restart config-api
```

### Ver estado de los servicios

```bash
docker compose ps
```

## Comandos de Desarrollo

### Reconstruir imágenes después de cambios de código

```bash
# Reconstruir todas las imágenes
docker compose build

# Reconstruir solo un servicio
docker compose build web
docker compose build config-api

# Reconstruir y reiniciar
docker compose up -d --build
```

### Ejecutar comandos dentro de un contenedor

```bash
# Abrir shell en el contenedor
docker compose exec web sh
docker compose exec config-api sh

# Ejecutar comando específico
docker compose exec postgres-labsis psql -U labsis -d labsisEG
docker compose exec config-api npm run migrate
```

### Ver uso de recursos

```bash
docker stats
```

## Verificación del Sistema

### 1. Verificar que todos los servicios estén corriendo

```bash
docker compose ps
```

Todos los servicios deben mostrar estado `Up` o `Up (healthy)`.

### 2. Verificar endpoints de salud

```bash
curl http://localhost:3002/api/health  # Sync Service
curl http://localhost:3003/api/health  # Results API
curl http://localhost:3004/api/health  # Messaging Bot
curl http://localhost:3005/api/health  # Config API
curl http://localhost/health           # Frontend
```

### 3. Verificar base de datos

```bash
docker compose exec postgres-labsis psql -U labsis -d labsisEG -c "SELECT version();"
docker compose exec postgres-bot psql -U labsis -d lis_bot_comunicacion -c "SELECT version();"
```

## Acceso al Sistema

Una vez iniciado, puedes acceder a:

- **Frontend PWA**: http://localhost
- **Sync Service API**: http://localhost:3002/api
- **Results API**: http://localhost:3003/api
- **Messaging Bot API**: http://localhost:3004/api
- **Config API**: http://localhost:3005/api
- **PostgreSQL labsisEG**: localhost:5432
- **PostgreSQL bot**: localhost:5433

## Backups

### Backup de base de datos labsisEG

```bash
docker compose exec postgres-labsis pg_dump -U labsis labsisEG > backup-labsis-$(date +%Y%m%d).sql
```

### Backup de base de datos bot

```bash
docker compose exec postgres-bot pg_dump -U labsis lis_bot_comunicacion > backup-bot-$(date +%Y%m%d).sql
```

### Restaurar backup

```bash
docker compose exec -T postgres-labsis psql -U labsis -d labsisEG < backup-labsis-20250101.sql
```

## Troubleshooting

### Problema: Contenedor no inicia

```bash
# Ver logs detallados
docker compose logs [nombre-servicio]

# Ver últimas 100 líneas
docker compose logs --tail=100 [nombre-servicio]
```

### Problema: Puerto ya en uso

```bash
# Cambiar el puerto en .env
WEB_PORT=8080  # En lugar de 80

# Reiniciar
docker compose down
docker compose up -d
```

### Problema: Base de datos no conecta

```bash
# Verificar que PostgreSQL esté corriendo
docker compose ps postgres-labsis

# Ver logs de PostgreSQL
docker compose logs postgres-labsis

# Verificar conectividad
docker compose exec sync-service nc -zv postgres-labsis 5432
```

### Problema: Espacio en disco lleno

```bash
# Limpiar imágenes sin usar
docker image prune -a

# Limpiar volúmenes sin usar
docker volume prune

# Limpiar todo (CUIDADO)
docker system prune -a --volumes
```

### Problema: Rebuild completo necesario

```bash
# Detener todo
docker compose down -v

# Eliminar imágenes
docker compose rm -f

# Rebuild desde cero
docker compose build --no-cache
docker compose up -d
```

## Producción

### Recomendaciones para producción:

1. **Usar reverse proxy (Nginx/Traefik)** para SSL/TLS
2. **Configurar límites de recursos** en docker-compose.yml:
   ```yaml
   services:
     web:
       deploy:
         resources:
           limits:
             cpus: '0.5'
             memory: 512M
   ```

3. **Habilitar restart automático**:
   ```yaml
   restart: always
   ```

4. **Configurar logs rotación**:
   ```yaml
   logging:
     driver: "json-file"
     options:
       max-size: "10m"
       max-file: "3"
   ```

5. **Usar secrets para datos sensibles**:
   ```yaml
   secrets:
     db_password:
       file: ./secrets/db_password.txt
   ```

6. **Backups automáticos** con cron job

## Monitoreo

### Ver uso de recursos en tiempo real

```bash
docker stats
```

### Ver logs en tiempo real

```bash
docker compose logs -f --tail=100
```

### Healthchecks

Todos los servicios incluyen healthchecks automáticos:

```bash
docker compose ps
```

La columna `Status` mostrará `(healthy)` si el servicio está funcionando correctamente.

## Más Información

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [PostgreSQL on Docker](https://hub.docker.com/_/postgres)
- [Node.js on Docker](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
