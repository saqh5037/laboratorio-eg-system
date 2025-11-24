# Deployment Guide - Laboratorio EG System

## 📋 Información General

Este documento describe el proceso completo para deployar el sistema Laboratorio EG en el servidor de producción AWS EC2.

### Servidor de Producción
- **IP**: 54.197.68.252
- **Usuario**: ubuntu
- **Sistema Operativo**: Ubuntu 22.04 LTS
- **Arquitectura**: Docker Compose con 5 microservicios

### Bases de Datos de Producción
- **labsisEGProduccion**: Base de datos principal del sistema LABSIS
- **lis_bot_comunicacioneg**: Base de datos del sistema de mensajería y configuración

---

## 🚀 Deployment Rápido (Quick Start)

Si ya tienes todo configurado y solo necesitas actualizar:

```bash
# En el servidor de producción
cd /home/ubuntu/laboratorio-eg-system
./deploy-production.sh
```

---

## 📦 Primera Instalación (Fresh Install)

### 1. Preparar el Servidor AWS EC2

#### 1.1 Conectar al Servidor
```bash
# Desde tu computadora local
ssh -i /path/to/your-key.pem ubuntu@54.197.68.252
```

#### 1.2 Actualizar Sistema
```bash
sudo apt update && sudo apt upgrade -y
```

#### 1.3 Instalar Docker
```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Agregar usuario ubuntu al grupo docker
sudo usermod -aG docker ubuntu

# Instalar Docker Compose
sudo apt install docker-compose-plugin -y

# Verificar instalación
docker --version
docker compose version
```

#### 1.4 Instalar PostgreSQL (para bases de datos)
```bash
# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Iniciar servicio
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Configurar usuario y bases de datos
sudo -u postgres psql

# En el prompt de PostgreSQL:
CREATE USER labsis WITH PASSWORD 'SECURE_PASSWORD_HERE';
CREATE DATABASE "labsisEGProduccion" OWNER labsis;
CREATE DATABASE "lis_bot_comunicacioneg" OWNER labsis;
GRANT ALL PRIVILEGES ON DATABASE "labsisEGProduccion" TO labsis;
GRANT ALL PRIVILEGES ON DATABASE "lis_bot_comunicacioneg" TO labsis;
\q
```

#### 1.5 Configurar PostgreSQL para Conexiones Locales
```bash
# Editar pg_hba.conf
sudo nano /etc/postgresql/14/main/pg_hba.conf

# Agregar esta línea antes de las otras reglas:
# local   all             labsis                                  md5
# host    all             labsis          127.0.0.1/32            md5

# Reiniciar PostgreSQL
sudo systemctl restart postgresql
```

### 2. Clonar el Repositorio

```bash
# En /home/ubuntu/
cd /home/ubuntu
git clone https://github.com/YOUR_USERNAME/laboratorio-eg-system.git
cd laboratorio-eg-system
git checkout main  # o la branch que desees
```

### 3. Configurar Variables de Entorno

#### 3.1 Crear .env.production desde el ejemplo
```bash
cp .env.production.example .env.production
```

#### 3.2 Editar .env.production con valores reales
```bash
nano .env.production
```

**Variables CRÍTICAS que DEBES cambiar:**

```bash
# Database Password (IMPORTANTE: Usar password seguro)
DB_PASSWORD=YOUR_SECURE_DATABASE_PASSWORD_HERE

# JWT Secret (IMPORTANTE: Generar nuevo)
# Generar con: openssl rand -hex 64
JWT_SECRET=YOUR_256_BIT_SECRET_HERE

# Telegram Bot (si usas Telegram)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_BOT_USERNAME=your_bot_username

# Twilio (si usas WhatsApp)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Gemini AI (si usas AI features)
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Restaurar Bases de Datos (si hay backup)

Si tienes backups de las bases de datos:

```bash
# Descomprimir y restaurar labsisEGProduccion
gunzip -c backup-labsisEGProduccion.sql.gz | PGPASSWORD='YOUR_PASSWORD' psql -h localhost -U labsis -d labsisEGProduccion

# Descomprimir y restaurar lis_bot_comunicacioneg
gunzip -c backup-lis_bot_comunicacioneg.sql.gz | PGPASSWORD='YOUR_PASSWORD' psql -h localhost -U labsis -d lis_bot_comunicacioneg
```

### 5. Ejecutar Deployment Inicial

```bash
# Hacer ejecutable el script (si no lo es)
chmod +x deploy-production.sh

# Ejecutar deployment
./deploy-production.sh
```

### 6. Configurar Firewall

```bash
# Permitir puertos necesarios
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS (si usas SSL)
sudo ufw allow 3002/tcp  # Sync API
sudo ufw allow 3003/tcp  # Results API
sudo ufw allow 3004/tcp  # Messaging Bot
sudo ufw allow 3005/tcp  # Config API
sudo ufw allow 3006/tcp  # Config WebSocket

# Habilitar firewall
sudo ufw enable
```

---

## 🔄 Actualización de Código (Updates)

### Opción 1: Script Automático (Recomendado)

```bash
cd /home/ubuntu/laboratorio-eg-system
./deploy-production.sh
```

El script ejecutará automáticamente:
- ✅ Backup de bases de datos
- ✅ Git pull de última versión
- ✅ Docker build sin cache
- ✅ Docker compose up -d
- ✅ Health checks de todos los servicios

### Opción 2: Manual

```bash
cd /home/ubuntu/laboratorio-eg-system

# 1. Hacer backup
mkdir -p backups
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
PGPASSWORD='YOUR_PASSWORD' pg_dump -h localhost -U labsis -d labsisEGProduccion | gzip > backups/labsisEGProduccion-$TIMESTAMP.sql.gz

# 2. Detener servicios
docker compose down

# 3. Actualizar código
git pull origin main

# 4. Rebuild imágenes
docker compose build --no-cache

# 5. Iniciar servicios
docker compose up -d

# 6. Verificar estado
docker compose ps
docker compose logs -f
```

---

## 🏥 Verificación de Salud (Health Checks)

### Verificar Estado de Contenedores

```bash
cd /home/ubuntu/laboratorio-eg-system
docker compose ps
```

Todos los servicios deben mostrar estado `healthy` o `running`.

### Verificar Logs

```bash
# Ver logs de todos los servicios
docker compose logs -f

# Ver logs de un servicio específico
docker compose logs -f web
docker compose logs -f sync-service
docker compose logs -f results-api
docker compose logs -f messaging-bot
docker compose logs -f config-api
```

### Probar Endpoints

```bash
# Sync Service Health
curl http://localhost:3002/health

# Results API Health
curl http://localhost:3003/api/health

# Messaging Bot Health
curl http://localhost:3004/api/health

# Config API Health
curl http://localhost:3005/health

# Web Frontend Health
curl http://localhost:80/health
```

### Verificar Bases de Datos

```bash
# Conectar a labsisEGProduccion
PGPASSWORD='YOUR_PASSWORD' psql -h localhost -U labsis -d labsisEGProduccion

# Verificar tablas
\dt

# Contar pacientes
SELECT COUNT(*) FROM paciente;
\q

# Conectar a lis_bot_comunicacioneg
PGPASSWORD='YOUR_PASSWORD' psql -h localhost -U labsis -d lis_bot_comunicacioneg

# Verificar tablas
\dt
\q
```

---

## 🛠️ Troubleshooting

### Problema: Contenedor no inicia

```bash
# Ver logs detallados del contenedor
docker compose logs NOMBRE_SERVICIO

# Ejemplos:
docker compose logs web
docker compose logs sync-service
docker compose logs results-api
```

### Problema: Error de conexión a base de datos

1. Verificar que PostgreSQL esté corriendo:
```bash
sudo systemctl status postgresql
```

2. Verificar conectividad:
```bash
PGPASSWORD='YOUR_PASSWORD' psql -h localhost -U labsis -d labsisEGProduccion -c "SELECT 1;"
```

3. Verificar variables de entorno en .env.production:
```bash
cat .env.production | grep DB_
```

### Problema: Puerto ya en uso

```bash
# Ver qué proceso usa el puerto (ejemplo: puerto 3002)
sudo lsof -i :3002

# Matar proceso si es necesario
sudo kill -9 PID
```

### Problema: Contenedor en estado "unhealthy"

```bash
# Ver detalles del health check
docker inspect CONTAINER_NAME | grep -A 10 Health

# Reiniciar contenedor específico
docker compose restart NOMBRE_SERVICIO
```

### Problema: Espacio en disco lleno

```bash
# Ver uso de disco
df -h

# Limpiar imágenes Docker antiguas
docker system prune -a

# Limpiar volúmenes no utilizados
docker volume prune
```

---

## 🔙 Rollback (Revertir Deployment)

### Si el deployment falla:

```bash
cd /home/ubuntu/laboratorio-eg-system

# 1. Detener servicios actuales
docker compose down

# 2. Revertir a commit anterior
git log --oneline -n 10  # Ver últimos commits
git checkout COMMIT_HASH_ANTERIOR

# 3. Rebuild y restart
docker compose build --no-cache
docker compose up -d

# 4. Verificar
docker compose ps
```

### Si las bases de datos tienen problemas:

```bash
# Restaurar desde backup
TIMESTAMP=20250124-120000  # Usar timestamp del backup

gunzip -c backups/labsisEGProduccion-$TIMESTAMP.sql.gz | \
  PGPASSWORD='YOUR_PASSWORD' psql -h localhost -U labsis -d labsisEGProduccion

gunzip -c backups/lis_bot_comunicacioneg-$TIMESTAMP.sql.gz | \
  PGPASSWORD='YOUR_PASSWORD' psql -h localhost -U labsis -d lis_bot_comunicacioneg
```

---

## 📊 Monitoreo y Mantenimiento

### Monitoreo de Recursos

```bash
# Ver uso de CPU y memoria de contenedores
docker stats

# Ver logs en tiempo real
docker compose logs -f

# Ver procesos dentro de un contenedor
docker compose exec web ps aux
```

### Backups Automáticos

Crear un cron job para backups diarios:

```bash
# Editar crontab
crontab -e

# Agregar backup diario a las 2 AM
0 2 * * * /home/ubuntu/laboratorio-eg-system/scripts/backup-databases.sh
```

Crear el script de backup:

```bash
nano /home/ubuntu/laboratorio-eg-system/scripts/backup-databases.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/home/ubuntu/laboratorio-eg-system/backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

mkdir -p $BACKUP_DIR

# Backup databases
PGPASSWORD='YOUR_PASSWORD' pg_dump -h localhost -U labsis -d labsisEGProduccion | \
  gzip > $BACKUP_DIR/labsisEGProduccion-$TIMESTAMP.sql.gz

PGPASSWORD='YOUR_PASSWORD' pg_dump -h localhost -U labsis -d lis_bot_comunicacioneg | \
  gzip > $BACKUP_DIR/lis_bot_comunicacioneg-$TIMESTAMP.sql.gz

# Eliminar backups mayores a 30 días
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
```

```bash
chmod +x /home/ubuntu/laboratorio-eg-system/scripts/backup-databases.sh
```

### Limpieza Periódica

```bash
# Limpiar contenedores detenidos y imágenes antiguas (ejecutar mensualmente)
docker system prune -a -f

# Limpiar volúmenes no utilizados
docker volume prune -f
```

---

## 🔒 Seguridad

### Mejores Prácticas

1. **Nunca commitear .env.production a Git**
   - Verificar que esté en .gitignore
   - Usar .env.production.example como template

2. **Cambiar passwords regularmente**
   - JWT_SECRET cada 6 meses
   - DB_PASSWORD según políticas de seguridad

3. **Actualizar sistema operativo**
```bash
sudo apt update && sudo apt upgrade -y
```

4. **Monitorear logs de seguridad**
```bash
sudo journalctl -u ssh -n 100
sudo tail -f /var/log/auth.log
```

5. **Configurar SSL/HTTPS** (recomendado)
   - Usar Nginx como reverse proxy
   - Obtener certificado con Let's Encrypt
   - Redirigir HTTP a HTTPS

---

## 📞 Contacto y Soporte

### Información del Sistema

- **Proyecto**: Laboratorio EG System
- **Repositorio**: GitHub (private)
- **Documentación**: Este archivo
- **Logs**: `/home/ubuntu/laboratorio-eg-system/deployment-*.log`

### Comandos Útiles de Referencia Rápida

```bash
# Ver estado de servicios
docker compose ps

# Ver logs
docker compose logs -f

# Reiniciar servicio específico
docker compose restart NOMBRE_SERVICIO

# Reiniciar todos los servicios
docker compose restart

# Detener todo
docker compose down

# Iniciar todo
docker compose up -d

# Ver uso de recursos
docker stats

# Acceder a un contenedor
docker compose exec NOMBRE_SERVICIO /bin/sh

# Ver variables de entorno de un contenedor
docker compose exec NOMBRE_SERVICIO env
```

---

## 📝 Notas Importantes

### Bases de Datos

- **labsisEGProduccion**: NO debe ser modificada por la aplicación, es READ-ONLY desde el sistema legacy
- **lis_bot_comunicacioneg**: Base de datos de la aplicación, puede ser modificada

### Puertos

- **80**: Web Frontend (público)
- **3002**: Sync Service API (interno)
- **3003**: Results API (interno)
- **3004**: Messaging Bot API (interno)
- **3005**: Config API (interno)
- **3006**: Config WebSocket (interno)

### Volúmenes Docker

Los siguientes volúmenes persisten datos:
- `sync-data`: Datos de sincronización
- `sync-logs`: Logs del sync service
- `results-temp`: Archivos temporales de results API
- `results-templates`: Templates de PDF
- `messaging-logs`: Logs del messaging bot
- `messaging-data`: Datos del bot
- `config-logs`: Logs del config API
- `config-uploads`: Uploads del config API

Para limpiar volúmenes (⚠️ CUIDADO, elimina datos):
```bash
docker compose down -v
```

---

## ✅ Checklist de Deployment

### Pre-Deployment
- [ ] Backup de bases de datos creado
- [ ] .env.production configurado correctamente
- [ ] Git pull ejecutado sin conflictos
- [ ] Docker running y funcional

### Durante Deployment
- [ ] Script deploy-production.sh ejecutado
- [ ] Todas las imágenes construidas exitosamente
- [ ] Todos los contenedores iniciados
- [ ] Health checks pasados

### Post-Deployment
- [ ] Frontend accesible en http://54.197.68.252
- [ ] Login funcional
- [ ] Resultados de pacientes se muestran correctamente
- [ ] Endpoints de API responden correctamente
- [ ] Logs no muestran errores críticos
- [ ] Bases de datos conectadas correctamente

---

**Última actualización**: 2025-01-24
**Versión del documento**: 1.0
