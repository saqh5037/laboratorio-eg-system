# 🔄 Deployment de sync-service a Servidor On-Premise

**Fecha:** 20 de Octubre, 2025 (Para ejecución mañana)
**Servicio:** sync-service v1.0.0
**Ambiente:** Servidor On-Premise (vía TeamViewer)
**Duración estimada:** 45-60 minutos

---

## 📋 Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Pre-requisitos](#pre-requisitos)
3. [Arquitectura del Deployment](#arquitectura-del-deployment)
4. [Paso a Paso: Deployment](#paso-a-paso-deployment)
5. [Configuración de Servicio Systemd](#configuración-de-servicio-systemd)
6. [Verificación](#verificación)
7. [Monitoreo y Logs](#monitoreo-y-logs)
8. [Troubleshooting](#troubleshooting)
9. [Mantenimiento](#mantenimiento)

---

## Resumen Ejecutivo

### ¿Qué vamos a hacer?

Migrar el **sync-service** desde tu computadora local al **servidor on-premise** donde corre la base de datos `labsisEG`.

**Beneficios:**
- ✅ Conexión directa a labsisEG (sin latencia de red)
- ✅ Alta disponibilidad (servidor siempre encendido)
- ✅ Mejor performance de sincronización
- ✅ No depende de tu computadora personal
- ✅ Fácil acceso para administración

### Estado Actual vs Deseado

**HOY (19 Oct):**
```
Tu Computadora (localhost:3001)
    ↓
labsisEG (PostgreSQL on-premise)
    ↓
AWS Amplify (laboratorio-eg PWA)
```

**MAÑANA (20 Oct):**
```
Servidor On-Premise (http://servidor-local:3001)
    ↓
labsisEG (PostgreSQL - misma máquina o red local)
    ↓
AWS Amplify (laboratorio-eg PWA)
```

---

## Pre-requisitos

### Información del Servidor

**Antes de empezar, necesitas conocer:**

- [ ] IP o hostname del servidor: `_____________________`
- [ ] Sistema operativo: [ ] Ubuntu [ ] CentOS [ ] Windows Server [ ] Otro: _____
- [ ] Usuario SSH: `_____________________`
- [ ] Password o key SSH: `_____________________`
- [ ] ¿Tiene Node.js instalado?: [ ] Sí (versión: _____) [ ] No
- [ ] ¿Tiene Git instalado?: [ ] Sí [ ] No
- [ ] ¿Tiene acceso directo a labsisEG?: [ ] Sí (localhost) [ ] No (IP: _____)
- [ ] Puerto disponible para HTTP: [ ] 3001 [ ] Otro: _____

### Software Requerido

**En el servidor on-premise:**

| Software | Versión Mínima | Propósito | ¿Instalado? |
|----------|----------------|-----------|-------------|
| **Node.js** | >= 18.x | Runtime para sync-service | [ ] |
| **npm** | >= 9.x | Gestor de paquetes | [ ] |
| **Git** | >= 2.30 | Control de versiones | [ ] |
| **PostgreSQL Client** | >= 12.x | Acceso a labsisEG | [ ] |
| **systemd** | Cualquiera | Daemon manager (Linux) | [ ] |

### Credenciales Necesarias

- [ ] Password de PostgreSQL para usuario `labsis`
- [ ] Acceso sudo en servidor (para instalar software)
- [ ] Permisos para abrir puerto 3001 (firewall)

---

## Arquitectura del Deployment

### Diagrama de Red

```
┌─────────────────────────────────────────────────────────┐
│           SERVIDOR ON-PREMISE                           │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │  labsisEG (PostgreSQL)                           │  │
│  │  localhost:5432                                  │  │
│  │  • Base de datos de producción                   │  │
│  │  • 511 estudios, lista ID 27                     │  │
│  └──────────┬───────────────────────────────────────┘  │
│             │ LISTEN/NOTIFY                            │
│             ↓                                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │  sync-service (Node.js)                          │  │
│  │  localhost:3001                                  │  │
│  │  • Detecta cambios de precios                    │  │
│  │  • Genera precios.json                           │  │
│  │  • Sirve JSON vía HTTP                           │  │
│  │  • Systemd service (auto-restart)                │  │
│  └──────────────────────────────────────────────────┘  │
│             │                                           │
│             │ HTTP (expuesto)                          │
└─────────────┼───────────────────────────────────────────┘
              │
              │ http://[IP-servidor]:3001/api/precios.json
              ↓
┌─────────────────────────────────────────────────────────┐
│           AWS AMPLIFY / CLOUDFRONT                      │
│  laboratorio-eg PWA (React)                             │
│  https://laboratorio-eg.com                             │
│  • Consume JSON cada X minutos                          │
│  • Actualiza precios en UI                              │
└─────────────────────────────────────────────────────────┘
```

### Flujo de Datos

1. **Usuario admin cambia precio** en labsisEG (PostgreSQL)
2. **Trigger PostgreSQL** emite NOTIFY 'precio_cambio'
3. **sync-service** recibe notificación (< 100ms)
4. **Espera 2 segundos** (debounce por si hay más cambios)
5. **Query 511 estudios** de labsisEG
6. **Genera precios.json** (160KB)
7. **Sirve JSON** vía HTTP GET `/api/precios.json`
8. **PWA en AWS** fetch el JSON cada 5 minutos (o cuando recarga)
9. **Usuario final** ve precio actualizado

**Tiempo total:** 2-5 segundos desde cambio en DB hasta JSON disponible

---

## Paso a Paso: Deployment

### 1. Conectar al Servidor (vía TeamViewer o SSH)

**Opción A: TeamViewer**
```
1. Abrir TeamViewer
2. Conectar a ID del servidor
3. Abrir terminal/cmd
```

**Opción B: SSH**
```bash
# Desde tu computadora
ssh usuario@[IP-servidor]

# O si usas key
ssh -i ~/.ssh/id_rsa usuario@[IP-servidor]
```

### 2. Verificar Pre-requisitos

```bash
# Verificar sistema operativo
uname -a
# O en Windows: systeminfo

# Verificar Node.js
node --version
# Debe mostrar: v18.x.x o superior

# Verificar npm
npm --version
# Debe mostrar: 9.x.x o superior

# Verificar Git
git --version
# Debe mostrar: git version 2.x.x

# Verificar PostgreSQL client
psql --version
# Debe mostrar: psql (PostgreSQL) 12.x o superior
```

**Si falta algo, instalar:**

**Ubuntu/Debian:**
```bash
# Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Git
sudo apt-get install -y git

# PostgreSQL client
sudo apt-get install -y postgresql-client
```

**CentOS/RHEL:**
```bash
# Node.js 18.x
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Git
sudo yum install -y git

# PostgreSQL client
sudo yum install -y postgresql
```

**Windows Server:**
```powershell
# Descargar e instalar manualmente:
# - Node.js: https://nodejs.org/
# - Git: https://git-scm.com/download/win
# - PostgreSQL client viene con PostgreSQL Server (ya debería estar instalado)
```

### 3. Clonar Repositorio

```bash
# Crear directorio de aplicaciones
sudo mkdir -p /opt/laboratorio-eg
sudo chown $USER:$USER /opt/laboratorio-eg
cd /opt/laboratorio-eg

# Clonar repositorio
git clone https://github.com/saqh5037/TestDirectoryEG.git
cd TestDirectoryEG/sync-service

# Verificar contenido
ls -la
# Debe mostrar: package.json, src/, database/, etc.
```

### 4. Instalar Dependencias

```bash
# Instalar dependencias de Node.js
npm install --production

# Verificar instalación
npm list --depth=0
```

**Dependencias esperadas:**
- pg (PostgreSQL driver)
- express (HTTP server)
- winston (Logging)
- dotenv (Environment variables)
- cors (CORS middleware)

### 5. Configurar Variables de Entorno

```bash
# Copiar ejemplo
cp .env.example .env

# Editar configuración
nano .env
# O en Windows: notepad .env
```

**Contenido de .env:**

```bash
# ============================================
# LABSIS - Base de Datos de Producción
# ============================================
LABSIS_HOST=localhost              # O IP si está en otra máquina
LABSIS_PORT=5432
LABSIS_DB=labsisEG                 # Base de datos de producción
LABSIS_USER=labsis
LABSIS_PASSWORD=tu_password_aqui   # ⚠️ SOLICITAR A ADMIN DB

# ============================================
# CONFIGURACIÓN DE SINCRONIZACIÓN
# ============================================
LISTA_PRECIOS_ID=27                # Ambulatorio_Abril_2025 (USD)
DEBOUNCE_MS=2000                   # Espera 2 segundos por batch

# ============================================
# RUTAS DE SALIDA
# ============================================
OUTPUT_PATH=./output
OUTPUT_FILENAME=precios.json

# Auto-copiar a proyecto web (NO en on-premise)
AUTO_COPY_TO_WEB=false
WEB_PROJECT_PATH=

# ============================================
# SERVIDOR HTTP
# ============================================
HTTP_PORT=3001                      # Puerto para servir JSON

# ============================================
# APLICACIÓN
# ============================================
NODE_ENV=production
LOG_LEVEL=info
LOG_DIRECTORY=./logs
```

⚠️ **IMPORTANTE:**
- Cambiar `LABSIS_PASSWORD` por el password real
- `AUTO_COPY_TO_WEB=false` (PWA está en AWS, no local)
- `NODE_ENV=production` para optimizaciones

### 6. Establecer Permisos Correctos

```bash
# Hacer .env solo legible por owner
chmod 600 .env

# Crear directorios de output y logs
mkdir -p output logs

# Establecer permisos
chmod 755 output logs
```

### 7. Verificar Conexión a labsisEG

```bash
# Verificar que PostgreSQL está corriendo
pg_isready -h localhost -p 5432

# Probar conexión manual
PGPASSWORD='tu_password' psql -h localhost -U labsis -d labsisEG -c "SELECT version();"
```

**Salida esperada:**
```
PostgreSQL 14.x on x86_64-pc-linux-gnu, compiled by gcc ...
```

### 8. Verificar/Instalar Triggers PostgreSQL

```bash
# Verificar base de datos y triggers
npm run verify-db
```

**Salida esperada:**
```
🔍 VERIFICACIÓN DE BASE DE DATOS LABSIS
✅ Conectado exitosamente
✅ Base de datos: labsisEG
✅ Tablas encontradas: 6/6
✅ Lista de precios ID 27 encontrada
📊 Total en lista: 511 estudios
✅ Triggers instalados: 4/4
✅ Verificación completada exitosamente
```

**Si faltan triggers:**
```bash
# Instalar triggers
npm run install-triggers

# O manualmente:
PGPASSWORD='tu_password' psql -h localhost -U labsis -d labsisEG -f database/triggers-labsis.sql
```

### 9. Sincronización Manual Inicial (Test)

```bash
# Ejecutar sincronización manual
npm run manual-sync
```

**Salida esperada:**
```
🔄 Sincronización manual iniciada...
📊 Consultando base de datos labsisEG...
✅ 348 pruebas y 163 grupos obtenidos
💾 JSON guardado localmente (160.62 KB, 511 estudios)
✅ Sincronización completada en 25ms
```

### 10. Verificar JSON Generado

```bash
# Ver JSON generado
ls -lh output/precios.json
# Debe mostrar: ~160KB

# Ver metadata
cat output/precios.json | jq '.metadata'
# Debe mostrar: totalEstudios: 511, listaPreciosId: 27
```

### 11. Abrir Puerto en Firewall

**Ubuntu/Debian (ufw):**
```bash
# Abrir puerto 3001
sudo ufw allow 3001/tcp

# Verificar
sudo ufw status
```

**CentOS/RHEL (firewalld):**
```bash
# Abrir puerto 3001
sudo firewall-cmd --permanent --add-port=3001/tcp
sudo firewall-cmd --reload

# Verificar
sudo firewall-cmd --list-ports
```

**Windows Server:**
```powershell
# Abrir puerto en Windows Firewall
New-NetFirewallRule -DisplayName "Sync Service HTTP" -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow
```

---

## Configuración de Servicio Systemd

### Crear Servicio Systemd (Linux)

**Para que sync-service se inicie automáticamente al arrancar el servidor:**

```bash
# Crear archivo de servicio
sudo nano /etc/systemd/system/laboratorio-eg-sync.service
```

**Contenido del archivo:**

```ini
[Unit]
Description=Laboratorio EG - Sync Service
Documentation=https://github.com/saqh5037/TestDirectoryEG
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
User=labsis
WorkingDirectory=/opt/laboratorio-eg/TestDirectoryEG/sync-service
Environment=NODE_ENV=production
ExecStart=/usr/bin/node src/index.js
Restart=always
RestartSec=10
StandardOutput=append:/opt/laboratorio-eg/TestDirectoryEG/sync-service/logs/systemd-out.log
StandardError=append:/opt/laboratorio-eg/TestDirectoryEG/sync-service/logs/systemd-err.log

# Limits
LimitNOFILE=4096
TimeoutStopSec=30

# Security
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ReadWritePaths=/opt/laboratorio-eg/TestDirectoryEG/sync-service/output
ReadWritePaths=/opt/laboratorio-eg/TestDirectoryEG/sync-service/logs

[Install]
WantedBy=multi-user.target
```

### Habilitar y Arrancar Servicio

```bash
# Recargar systemd para que vea el nuevo servicio
sudo systemctl daemon-reload

# Habilitar inicio automático
sudo systemctl enable laboratorio-eg-sync.service

# Iniciar servicio
sudo systemctl start laboratorio-eg-sync.service

# Verificar estado
sudo systemctl status laboratorio-eg-sync.service
```

**Salida esperada:**
```
● laboratorio-eg-sync.service - Laboratorio EG - Sync Service
   Loaded: loaded (/etc/systemd/system/laboratorio-eg-sync.service; enabled)
   Active: active (running) since Mon 2025-10-20 08:00:00 -04; 5s ago
 Main PID: 12345 (node)
   CGroup: /system.slice/laboratorio-eg-sync.service
           └─12345 /usr/bin/node src/index.js

Oct 20 08:00:00 servidor systemd[1]: Started Laboratorio EG - Sync Service.
Oct 20 08:00:01 servidor node[12345]: ✅ Sistema listo
Oct 20 08:00:01 servidor node[12345]: ✅ Escuchando canal 'precio_cambio'
```

### Comandos Útiles del Servicio

```bash
# Iniciar servicio
sudo systemctl start laboratorio-eg-sync

# Detener servicio
sudo systemctl stop laboratorio-eg-sync

# Reiniciar servicio
sudo systemctl restart laboratorio-eg-sync

# Ver estado
sudo systemctl status laboratorio-eg-sync

# Ver logs en tiempo real
sudo journalctl -u laboratorio-eg-sync -f

# Ver logs desde última hora
sudo journalctl -u laboratorio-eg-sync --since "1 hour ago"
```

### Servicio en Windows (alternativa)

**Si el servidor es Windows, usar NSSM (Non-Sucking Service Manager):**

```powershell
# Descargar NSSM
# https://nssm.cc/download

# Instalar servicio
nssm install LaboratorioEGSync "C:\Program Files\nodejs\node.exe" "C:\opt\laboratorio-eg\TestDirectoryEG\sync-service\src\index.js"

# Configurar directorio de trabajo
nssm set LaboratorioEGSync AppDirectory "C:\opt\laboratorio-eg\TestDirectoryEG\sync-service"

# Configurar variables de entorno
nssm set LaboratorioEGSync AppEnvironmentExtra NODE_ENV=production

# Iniciar servicio
nssm start LaboratorioEGSync

# Ver estado
nssm status LaboratorioEGSync
```

---

## Verificación

### 1. Health Check Local

```bash
# Desde el servidor on-premise
curl http://localhost:3001/health

# Debe responder:
{
  "status": "ok",
  "timestamp": "2025-10-20T12:00:00.000Z",
  "service": "laboratorio-eg-sync-service",
  "version": "1.0.0"
}
```

### 2. Verificar JSON Disponible

```bash
curl http://localhost:3001/api/precios.json | jq '.metadata'

# Debe responder:
{
  "totalEstudios": 511,
  "totalPruebas": 348,
  "totalGrupos": 163,
  "listaPreciosId": 27,
  "fechaSincronizacion": "2025-10-20T12:00:00.000Z",
  "version": "1.0",
  "moneda": "USD"
}
```

### 3. Verificar Stats

```bash
curl http://localhost:3001/api/stats | jq

# Debe mostrar:
{
  "sync": {
    "isSyncing": false,
    "lastSyncTime": "...",
    "syncCount": 1
  },
  "listener": {
    "isListening": true,
    "channel": "precio_cambio"
  },
  "file": {
    "exists": true,
    "size": 164471,
    "sizeKB": "160.62"
  }
}
```

### 4. Test de Sincronización End-to-End

```bash
# 1. Cambiar un precio en labsisEG
PGPASSWORD='tu_password' psql -h localhost -U labsis -d labsisEG << 'SQL'
UPDATE laboratorio.listaspreciodetalle
SET precio = 99.99
WHERE id = 1042 AND lpid = 27;
SQL

# 2. Esperar 2-5 segundos

# 3. Ver logs del sync-service
tail -f logs/combined-*.log
# Debe mostrar: "🔔 [LISTENER] Notificación recibida: precio_cambio"

# 4. Verificar JSON actualizado
curl http://localhost:3001/api/precios.json | jq '.estudios[] | select(.id == 1042)'
# Debe mostrar: "precio": 99.99
```

### 5. Verificar desde Red Externa

**Desde tu computadora (fuera del servidor):**

```bash
# Obtener IP del servidor
# Pedir a admin de red o usar:
# ip addr show (Linux)
# ipconfig (Windows)

# Test desde tu computadora
curl http://[IP-SERVIDOR]:3001/health

# Si funciona:
✅ Servicio accesible desde red externa
```

---

## Monitoreo y Logs

### Logs del Sync Service

**Ubicación:**
```
/opt/laboratorio-eg/TestDirectoryEG/sync-service/logs/
├── combined-2025-10-20.log    # Todos los logs
├── error-2025-10-20.log       # Solo errores
└── sync-2025-10-20.log        # Solo sincronizaciones
```

**Ver logs en tiempo real:**
```bash
# Todos los logs
tail -f logs/combined-*.log

# Solo errores
tail -f logs/error-*.log

# Solo sincronizaciones
tail -f logs/sync-*.log

# Via systemd
sudo journalctl -u laboratorio-eg-sync -f
```

**Buscar errores:**
```bash
# Últimos 100 errores
grep -i "error" logs/error-*.log | tail -100

# Errores de hoy
grep -i "error" logs/error-$(date +%Y-%m-%d).log
```

### Métricas a Monitorear

**1. Uptime del servicio:**
```bash
# Via systemd
systemctl is-active laboratorio-eg-sync
# Debe mostrar: active

# Uptime
systemctl show laboratorio-eg-sync --property=ActiveEnterTimestamp
```

**2. Frecuencia de sincronización:**
```bash
# Contar sincronizaciones hoy
grep "estudios sincronizados" logs/combined-$(date +%Y-%m-%d).log | wc -l
```

**3. Tamaño del JSON:**
```bash
ls -lh output/precios.json
# Debe ser ~160KB (puede variar ligeramente)
```

**4. Última sincronización:**
```bash
curl -s http://localhost:3001/api/stats | jq '.sync.lastSyncTime'
# Debe ser reciente (< 1 hora si hubo cambios)
```

### Script de Monitoreo Automático

```bash
# Crear script de health check
sudo nano /opt/laboratorio-eg/monitor-sync-service.sh
```

**Contenido:**
```bash
#!/bin/bash

LOGFILE="/var/log/laboratorio-eg-sync-monitor.log"
SERVICE_URL="http://localhost:3001"

# Check service health
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$SERVICE_URL/health")

if [ "$STATUS" != "200" ]; then
  echo "[$(date)] ❌ ERROR: Service not responding (HTTP $STATUS)" >> "$LOGFILE"
  # Intentar restart automático
  systemctl restart laboratorio-eg-sync
  echo "[$(date)] 🔄 Service restarted automatically" >> "$LOGFILE"
else
  echo "[$(date)] ✅ Service OK" >> "$LOGFILE"
fi
```

**Hacer ejecutable y agregar a cron:**
```bash
sudo chmod +x /opt/laboratorio-eg/monitor-sync-service.sh

# Ejecutar cada 5 minutos
sudo crontab -e

# Agregar línea:
*/5 * * * * /opt/laboratorio-eg/monitor-sync-service.sh
```

---

## Troubleshooting

### Problema: Servicio no inicia

**Diagnóstico:**
```bash
# Ver status detallado
sudo systemctl status laboratorio-eg-sync

# Ver logs de systemd
sudo journalctl -u laboratorio-eg-sync -n 50 --no-pager

# Ver logs de la app
tail -50 logs/error-*.log
```

**Soluciones comunes:**
- Verificar `.env` tiene password correcto
- Verificar PostgreSQL está corriendo: `systemctl status postgresql`
- Verificar permisos de directorio: `ls -la`
- Verificar puerto 3001 no está ocupado: `lsof -i :3001`

### Problema: Servicio inicia pero no escucha notificaciones

**Diagnóstico:**
```bash
# Ver logs del listener
grep "LISTENER" logs/combined-*.log | tail -20

# Ver stats
curl http://localhost:3001/api/stats | jq '.listener'
```

**Soluciones:**
- Verificar triggers instalados: `npm run verify-db`
- Reinstalar triggers: `npm run install-triggers`
- Verificar conexión PostgreSQL: `PGPASSWORD=xxx psql -h localhost -U labsis -d labsisEG -c "SELECT 1"`

### Problema: JSON no se genera

**Diagnóstico:**
```bash
# Verificar output directory
ls -la output/

# Ver logs de sincronización
grep "sincronizados" logs/combined-*.log | tail -10

# Forzar sync manual
curl -X POST http://localhost:3001/api/sync
```

**Soluciones:**
- Verificar permisos de output/: `chmod 755 output`
- Verificar espacio en disco: `df -h`
- Ver errores específicos en `logs/error-*.log`

### Problema: No accesible desde red externa

**Diagnóstico:**
```bash
# Verificar puerto abierto en firewall
sudo ufw status | grep 3001
# O: sudo firewall-cmd --list-ports

# Verificar servicio escuchando en todas las interfaces
netstat -tulpn | grep 3001
# Debe mostrar: 0.0.0.0:3001 (no solo 127.0.0.1:3001)
```

**Soluciones:**
- Abrir puerto en firewall (ver sección anterior)
- Verificar router/firewall corporativo no bloquea puerto
- Configurar reverse proxy (Nginx) si es necesario

---

## Mantenimiento

### Actualización del Código

```bash
# 1. Detener servicio
sudo systemctl stop laboratorio-eg-sync

# 2. Actualizar código
cd /opt/laboratorio-eg/TestDirectoryEG
git pull origin main

# 3. Actualizar dependencias (si cambiaron)
cd sync-service
npm install --production

# 4. Reiniciar servicio
sudo systemctl start laboratorio-eg-sync

# 5. Verificar
sudo systemctl status laboratorio-eg-sync
```

### Limpieza de Logs

```bash
# Los logs rotan automáticamente cada 14 días
# Si quieres limpiar manualmente:

# Eliminar logs antiguos (> 30 días)
find logs/ -name "*.log" -mtime +30 -delete

# Comprimir logs antiguos
find logs/ -name "*.log" -mtime +7 -exec gzip {} \;
```

### Backup de Configuración

```bash
# Crear backup de .env y archivos críticos
sudo mkdir -p /opt/backups/laboratorio-eg
sudo cp /opt/laboratorio-eg/TestDirectoryEG/sync-service/.env \
  /opt/backups/laboratorio-eg/.env.backup.$(date +%Y%m%d)

# Backup de archivo de servicio systemd
sudo cp /etc/systemd/system/laboratorio-eg-sync.service \
  /opt/backups/laboratorio-eg/laboratorio-eg-sync.service.backup
```

---

## Actualizar PWA en AWS para Usar Nuevo Endpoint

**Una vez sync-service esté corriendo en on-premise, actualizar el endpoint en AWS:**

### En AWS Amplify:

```bash
# Cambiar variable de entorno
VITE_API_BASE_URL=http://[IP-SERVIDOR]:3001

# Redeploy app
# (Amplify auto-redeploys cuando cambias variables de entorno)
```

### O usar Reverse Proxy (Recomendado)

**Instalar Nginx en servidor on-premise:**

```bash
# Instalar Nginx
sudo apt-get install nginx

# Configurar proxy inverso
sudo nano /etc/nginx/sites-available/laboratorio-eg-sync
```

**Contenido:**
```nginx
server {
    listen 80;
    server_name api.laboratorio-eg.com;

    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # CORS headers
        add_header Access-Control-Allow-Origin "*";
        add_header Access-Control-Allow-Methods "GET, OPTIONS";
    }
}
```

**Activar y usar:**
```bash
sudo ln -s /etc/nginx/sites-available/laboratorio-eg-sync /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Ahora puedes usar:
# http://api.laboratorio-eg.com/api/precios.json
# En lugar de: http://[IP]:3001/api/precios.json
```

---

## ✅ Checklist de Deployment On-Premise

```
┌───────────────────────────────────────────────────┐
│    DEPLOYMENT SYNC-SERVICE ON-PREMISE             │
└───────────────────────────────────────────────────┘

[ ] PREPARACIÓN
    [ ] Acceso al servidor confirmado (TeamViewer/SSH)
    [ ] Información del servidor recopilada
    [ ] Credenciales de PostgreSQL obtenidas
    [ ] Backup del servicio local creado

[ ] SOFTWARE
    [ ] Node.js >= 18.x instalado
    [ ] npm >= 9.x instalado
    [ ] Git instalado
    [ ] PostgreSQL client instalado
    [ ] systemd disponible (Linux)

[ ] DEPLOYMENT
    [ ] Repositorio clonado en /opt/laboratorio-eg
    [ ] Dependencias instaladas (npm install)
    [ ] .env configurado con producción
    [ ] Permisos de archivos establecidos
    [ ] Triggers PostgreSQL verificados/instalados
    [ ] Sincronización manual exitosa
    [ ] Puerto 3001 abierto en firewall

[ ] SERVICIO SYSTEMD
    [ ] Archivo .service creado
    [ ] Servicio habilitado (systemctl enable)
    [ ] Servicio iniciado (systemctl start)
    [ ] Estado activo verificado

[ ] VERIFICACIÓN
    [ ] Health check OK (localhost:3001/health)
    [ ] JSON disponible (localhost:3001/api/precios.json)
    [ ] Stats muestran listener activo
    [ ] Test de sincronización exitoso (cambio de precio)
    [ ] Accesible desde red externa

[ ] MONITOREO
    [ ] Logs verificados (sin errores)
    [ ] Script de monitoreo configurado
    [ ] Cron job agregado
    [ ] Alertas configuradas (opcional)

[ ] INTEGRACIÓN
    [ ] AWS Amplify actualizado con nuevo endpoint
    [ ] PWA carga JSON desde servidor on-premise
    [ ] Test end-to-end exitoso

[ ] DOCUMENTACIÓN
    [ ] Credenciales guardadas en password manager
    [ ] Backup de configuración creado
    [ ] Procedimientos documentados
    [ ] Equipo notificado

┌───────────────────────────────────────────────────┐
│        ✅ DEPLOYMENT EXITOSO                       │
│     sync-service corriendo en servidor on-premise │
│     Deployed by: _______________                  │
│     Date: _______________                         │
└───────────────────────────────────────────────────┘
```

---

## 📞 Contactos

**Si tienes problemas durante el deployment:**

- **Documentación:** [CLAUDE.md](CLAUDE.md)
- **Sync Service README:** [sync-service/README.md](sync-service/README.md)
- **Soporte:** [Agregar contacto de soporte]

---

**Preparado por:** Claude Code
**Fecha:** 19 de Octubre, 2025
**Para ejecución:** 20 de Octubre, 2025 (acceso TeamViewer)
**Duración estimada:** 45-60 minutos

🔄 **LISTO PARA DEPLOYMENT A ON-PREMISE**
