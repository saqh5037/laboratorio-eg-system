# 🚀 Guía de Deployment a Producción - Laboratorio EG

**Versión:** v1.2.1-prod
**Fecha:** 19 de Octubre, 2025
**Tipo:** Primera Release de Producción
**Ambiente:** AWS (laboratorio-eg) + Local/On-premise (sync-service)

---

## 📋 Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura de Deployment](#arquitectura-de-deployment)
3. [Parte 1: laboratorio-eg PWA → AWS](#parte-1-laboratorio-eg-pwa--aws)
4. [Parte 2: sync-service → Local (Temporal)](#parte-2-sync-service--local-temporal)
5. [Verificación Post-Deployment](#verificación-post-deployment)
6. [Monitoreo y Mantenimiento](#monitoreo-y-mantenimiento)
7. [Troubleshooting](#troubleshooting)
8. [Rollback Procedures](#rollback-procedures)

---

## Resumen Ejecutivo

### ¿Qué vamos a desplegar?

Esta release despliega **2 componentes independientes** del sistema Laboratorio EG:

| Componente | Versión | Destino | Estado | Prioridad |
|------------|---------|---------|--------|-----------|
| **laboratorio-eg** (PWA) | v1.2.1-prod | AWS Amplify/S3+CloudFront | ✅ Listo | 🔴 CRÍTICO |
| **sync-service** | v1.0.0 | Local (ahora) → On-premise (mañana) | ✅ Funcional | ⚠️ ALTA |
| **directorio-laboratorioeg** | - | NO se despliega (legacy) | ⏸️ Archivado | - |

### Plan de Deployment

**HOY (19 de Octubre):**
1. ✅ **laboratorio-eg** → AWS (Producción completa)
2. ✅ **sync-service** → Tu computadora local (setup temporal)

**MAÑANA (20 de Octubre):**
3. 🔄 **sync-service** → Servidor on-premise (migración)

### Duración Estimada

- **laboratorio-eg a AWS:** 30-45 minutos
- **sync-service local:** 15-20 minutos
- **Total:** ~1 hora

---

## Arquitectura de Deployment

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRODUCCIÓN                               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────┐
│   labsisEG (PostgreSQL) │  ← Base de datos existente (on-premise)
│   Puerto 5432           │
│   • 511 estudios        │
│   • Lista precios ID 27 │
└───────────┬─────────────┘
            │
            │ LISTEN/NOTIFY
            ▼
┌───────────────────────────────────────────────────────────────┐
│  sync-service (Node.js)                                       │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  HOY: Tu computadora (localhost:3001)                   │ │
│  │  MAÑANA: Servidor on-premise                            │ │
│  └─────────────────────────────────────────────────────────┘ │
│  • Detecta cambios de precios                                 │
│  • Genera precios.json                                        │
│  • Sirve JSON vía HTTP                                        │
└───────────────────────────┬───────────────────────────────────┘
                            │
                            │ fetch('/api/precios.json')
                            ▼
┌───────────────────────────────────────────────────────────────┐
│  laboratorio-eg PWA (React)                                   │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  AWS Amplify / S3 + CloudFront                          │ │
│  │  https://laboratorio-eg.com                             │ │
│  └─────────────────────────────────────────────────────────┘ │
│  • PWA instalable                                             │
│  • Offline-first                                              │
│  • 511 estudios                                               │
└───────────────────────────────────────────────────────────────┘
            │
            │ HTTPS
            ▼
     👥 USUARIOS
    (Pacientes del laboratorio)
```

---

## Parte 1: laboratorio-eg PWA → AWS

### Opción A: AWS Amplify (Recomendado)

**Ventajas:**
- ✅ CI/CD integrado con Git
- ✅ SSL automático
- ✅ CDN global integrado
- ✅ Previews de branches
- ✅ Rollback con 1 click

#### 1.1. Crear Aplicación en AWS Amplify

```bash
# 1. Ir a AWS Console → Amplify
# 2. "New app" → "Host web app"
# 3. Conectar repositorio GitHub
#    Repository: https://github.com/saqh5037/TestDirectoryEG
#    Branch: feature/fusion-directorio
#    Tag: v1.2.1-prod
```

#### 1.2. Configurar Build Settings

**amplify.yml** (crear en raíz de laboratorio-eg):

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

#### 1.3. Variables de Entorno en Amplify

En AWS Amplify Console → App Settings → Environment variables:

```bash
# API Configuration
VITE_API_BASE_URL=https://api.laboratorio-eg.com
VITE_API_TIMEOUT=30000

# PWA Configuration
VITE_PWA_NAME=Laboratorio Elizabeth Gutiérrez
VITE_PWA_SHORT_NAME=Lab EG
VITE_PWA_THEME_COLOR=#7B68A6

# Database (para backend, si se usa)
DB_HOST=labsis-db-prod.laboratorio-eg.com
DB_PORT=5432
DB_NAME=labsisEG
DB_USER=labsis_prod
DB_PASSWORD=[OBTENER DE AWS SECRETS MANAGER]

# Environment
NODE_ENV=production
VITE_ENV=production

# Analytics (opcional)
VITE_GA_ID=G-XXXXXXXXXX
```

⚠️ **IMPORTANTE:**
- Nunca hardcodear passwords en código
- Usar AWS Secrets Manager para DB_PASSWORD
- Variables VITE_* son expuestas al frontend

#### 1.4. Configurar Dominio Custom

```bash
# En AWS Amplify Console → Domain management

# Opción 1: Dominio nuevo en Route 53
# 1. "Add domain" → "Use a Route 53 domain"
# 2. Seleccionar: laboratorio-eg.com
# 3. Amplify crea automáticamente:
#    - Certificado SSL (ACM)
#    - DNS records (Route 53)
#    - CDN distribution

# Opción 2: Dominio externo
# 1. "Add domain" → "Use a domain from a third-party provider"
# 2. Agregar CNAME records en tu DNS provider:
#    CNAME: www → [amplify-app-id].amplifyapp.com
#    CNAME: @ → [amplify-app-id].amplifyapp.com
```

#### 1.5. Desplegar

```bash
# Deploy automático desde Amplify Console
# 1. "Deploy" button
# 2. O push a branch conectado (auto-deploy)
```

**Resultado esperado:**
```
✓ Build complete
✓ Deploy successful
✓ App available at: https://main.[app-id].amplifyapp.com
✓ Custom domain: https://laboratorio-eg.com (if configured)
```

---

### Opción B: S3 + CloudFront (Manual)

**Ventajas:**
- ✅ Control total
- ✅ Costos más bajos
- ✅ Configuración personalizada

#### 2.1. Build Local

```bash
cd /Users/samuelquiroz/Documents/proyectos/Test-Directory-EG/laboratorio-eg

# Checkout tag de producción
git checkout v1.2.1-prod

# Instalar dependencias
npm ci

# Configurar .env.production
cat > .env.production << 'EOF'
VITE_API_BASE_URL=https://api.laboratorio-eg.com
VITE_API_TIMEOUT=30000
VITE_PWA_NAME=Laboratorio Elizabeth Gutiérrez
VITE_PWA_SHORT_NAME=Lab EG
VITE_PWA_THEME_COLOR=#7B68A6
NODE_ENV=production
VITE_ENV=production
EOF

# Build de producción
npm run build

# Verificar build
ls -lh dist/
# Debe tener: index.html, assets/, manifest.json, sw.js
```

#### 2.2. Crear S3 Bucket

```bash
# AWS CLI (instalar si no tienes)
aws configure

# Crear bucket
aws s3 mb s3://laboratorio-eg-prod --region us-east-1

# Configurar como sitio web estático
aws s3 website s3://laboratorio-eg-prod \
  --index-document index.html \
  --error-document index.html

# Configurar política pública
cat > bucket-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::laboratorio-eg-prod/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy \
  --bucket laboratorio-eg-prod \
  --policy file://bucket-policy.json
```

#### 2.3. Subir Build a S3

```bash
# Sync con optimizaciones de cache
aws s3 sync dist/ s3://laboratorio-eg-prod/ \
  --delete \
  --cache-control "public, max-age=31536000" \
  --exclude "index.html" \
  --exclude "sw.js" \
  --exclude "manifest.json"

# index.html sin cache (para updates)
aws s3 cp dist/index.html s3://laboratorio-eg-prod/index.html \
  --cache-control "no-cache, no-store, must-revalidate" \
  --content-type "text/html"

# Service Worker sin cache
aws s3 cp dist/sw.js s3://laboratorio-eg-prod/sw.js \
  --cache-control "no-cache, no-store, must-revalidate" \
  --content-type "application/javascript"

# Manifest sin cache
aws s3 cp dist/manifest.json s3://laboratorio-eg-prod/manifest.json \
  --cache-control "no-cache, no-store, must-revalidate" \
  --content-type "application/json"
```

#### 2.4. Crear CloudFront Distribution

```bash
# Crear distribution via Console o CLI

# AWS Console:
# 1. CloudFront → Create distribution
# 2. Origin domain: laboratorio-eg-prod.s3-website-us-east-1.amazonaws.com
# 3. Viewer protocol policy: Redirect HTTP to HTTPS
# 4. Compress objects automatically: Yes
# 5. Price class: Use all edge locations (mejor performance)
# 6. Alternate domain names (CNAMEs): laboratorio-eg.com, www.laboratorio-eg.com
# 7. SSL certificate: Custom SSL certificate (solicitar en ACM)
```

**CloudFront Settings JSON:**
```json
{
  "CallerReference": "laboratorio-eg-prod-2025-10-19",
  "Comment": "Laboratorio EG PWA - Production",
  "Enabled": true,
  "DefaultRootObject": "index.html",
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-laboratorio-eg-prod",
        "DomainName": "laboratorio-eg-prod.s3-website-us-east-1.amazonaws.com",
        "CustomOriginConfig": {
          "HTTPPort": 80,
          "HTTPSPort": 443,
          "OriginProtocolPolicy": "http-only"
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-laboratorio-eg-prod",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {
      "Quantity": 2,
      "Items": ["GET", "HEAD"]
    },
    "Compress": true,
    "MinTTL": 0,
    "DefaultTTL": 86400,
    "MaxTTL": 31536000
  },
  "CustomErrorResponses": {
    "Quantity": 1,
    "Items": [
      {
        "ErrorCode": 404,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 300
      }
    ]
  }
}
```

#### 2.5. Configurar DNS (Route 53 o proveedor externo)

**Route 53:**
```bash
# Crear hosted zone (si no existe)
aws route53 create-hosted-zone --name laboratorio-eg.com --caller-reference $(date +%s)

# Crear record A (Alias a CloudFront)
cat > route53-record.json << 'EOF'
{
  "Changes": [
    {
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "laboratorio-eg.com",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z2FDTNDATAQYW2",
          "DNSName": "[CLOUDFRONT-DISTRIBUTION].cloudfront.net",
          "EvaluateTargetHealth": false
        }
      }
    },
    {
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "www.laboratorio-eg.com",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "Z2FDTNDATAQYW2",
          "DNSName": "[CLOUDFRONT-DISTRIBUTION].cloudfront.net",
          "EvaluateTargetHealth": false
        }
      }
    }
  ]
}
EOF

aws route53 change-resource-record-sets \
  --hosted-zone-id [ZONE-ID] \
  --change-batch file://route53-record.json
```

#### 2.6. SSL Certificate (ACM)

```bash
# Solicitar certificado en ACM (us-east-1 para CloudFront)
aws acm request-certificate \
  --domain-name laboratorio-eg.com \
  --subject-alternative-names www.laboratorio-eg.com \
  --validation-method DNS \
  --region us-east-1

# Obtener CNAME records para validación
aws acm describe-certificate --certificate-arn [CERT-ARN]

# Agregar CNAME records en DNS
# AWS enviará email cuando certificate esté validado
```

---

## Parte 2: sync-service → Local (Temporal)

### ⚠️ Importante

Este setup es **TEMPORAL**. Mañana migrarás a servidor on-premise.

**Razón:** La base de datos `labsisEG` está en tu red local, entonces el sync-service debe correr en un lugar que pueda accederla.

### 2.1. Setup Local Inmediato

```bash
# 1. Ir a directorio sync-service
cd /Users/samuelquiroz/Documents/proyectos/Test-Directory-EG/sync-service

# 2. Instalar dependencias
npm install

# 3. Verificar versión Node.js
node --version
# Debe ser >= 18.x
```

### 2.2. Configurar Variables de Entorno

```bash
# Copiar ejemplo
cp .env.example .env

# Editar .env
nano .env
```

**Contenido .env para PRODUCCIÓN:**

```bash
# ============================================
# LABSIS - Base de Datos PRODUCCIÓN
# ============================================
LABSIS_HOST=localhost                    # O IP si está en otra máquina
LABSIS_PORT=5432
LABSIS_DB=labsisEG                       # Base de datos PRODUCCIÓN
LABSIS_USER=labsis
LABSIS_PASSWORD=tu_password_aqui         # ⚠️ SOLICITAR A ADMIN

# ============================================
# CONFIGURACIÓN DE SINCRONIZACIÓN
# ============================================
LISTA_PRECIOS_ID=27                      # Ambulatorio_Abril_2025 (USD)
DEBOUNCE_MS=2000                         # 2 segundos de espera

# ============================================
# RUTAS DE SALIDA
# ============================================
OUTPUT_PATH=./output
OUTPUT_FILENAME=precios.json

# Auto-copiar a proyecto web (DESACTIVAR si PWA está en AWS)
AUTO_COPY_TO_WEB=false                   # ⚠️ Cambiar a false
WEB_PROJECT_PATH=                         # Dejar vacío

# ============================================
# SERVIDOR HTTP
# ============================================
HTTP_PORT=3001                            # Puerto para servir JSON

# ============================================
# APLICACIÓN
# ============================================
NODE_ENV=production
LOG_LEVEL=info
LOG_DIRECTORY=./logs
```

⚠️ **IMPORTANTE:**
- `AUTO_COPY_TO_WEB=false` porque el PWA está en AWS, no local
- El JSON se servirá vía HTTP en `http://localhost:3001/api/precios.json`
- Necesitas exponer este puerto para que AWS pueda accederlo

### 2.3. Verificar Conexión a labsisEG

```bash
# Verificar que PostgreSQL está corriendo
pg_isready -h localhost -p 5432

# Verificar conexión y triggers
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

### 2.4. Instalar Triggers (Si no están)

```bash
# Solo si verify-db dice que faltan triggers
npm run install-triggers

# O manualmente:
PGPASSWORD=tu_password psql -h localhost -U labsis -d labsisEG -f database/triggers-labsis.sql
```

### 2.5. Ejecutar Sync Service

**Opción A: Foreground (para pruebas):**
```bash
npm run dev
```

**Opción B: Background (recomendado):**
```bash
# macOS/Linux
nohup npm run start > logs/sync-service.log 2>&1 &

# Verificar que está corriendo
ps aux | grep "sync-service"

# Ver logs en tiempo real
tail -f logs/sync-service.log
```

**Salida esperada:**
```
============================================================
🚀 Laboratorio EG - Sistema de Sincronización
============================================================

✅ Configuración válida
📋 Base de datos: labsisEG
📋 Lista de precios: ID 27
📋 Archivo salida: ./output/precios.json
📋 HTTP Puerto: 3001

📡 Probando conexión a labsisEG...
✅ Conectado a labsisEG

🔄 Sincronización inicial...
✅ 511 estudios sincronizados
💾 JSON guardado: 160.62 KB

🌐 Iniciando servidor HTTP...
📍 http://localhost:3001

👂 Iniciando listener...
✅ Escuchando canal 'precio_cambio'

============================================================
✨ Sistema listo
============================================================
```

### 2.6. Verificar Funcionamiento

```bash
# 1. Health check
curl http://localhost:3001/health
# Debe responder: {"status":"ok",...}

# 2. Ver JSON de precios
curl http://localhost:3001/api/precios.json | jq '.metadata'
# Debe mostrar metadata con 511 estudios

# 3. Ver stats
curl http://localhost:3001/api/stats | jq
```

### 2.7. Exponer Puerto para AWS (Temporal)

**Opción A: ngrok (Recomendado para pruebas)**

```bash
# Instalar ngrok
brew install ngrok

# Autenticar
ngrok config add-authtoken [TU-TOKEN]

# Exponer puerto 3001
ngrok http 3001
```

**Salida:**
```
Session Status: online
Forwarding: https://abcd-1234.ngrok.io -> http://localhost:3001
```

**Usar esta URL en AWS:**
- Actualizar `VITE_API_BASE_URL` en Amplify/S3
- O configurar proxy inverso

**Opción B: Abrir puerto en router (No recomendado para producción)**

```bash
# 1. Obtener tu IP local
ipconfig getifaddr en0

# 2. Configurar port forwarding en router:
#    Puerto externo: 3001
#    Puerto interno: 3001
#    IP interna: [tu IP local]

# 3. Verificar puerto abierto
curl http://[tu-IP-pública]:3001/health
```

⚠️ **ADVERTENCIA:** Esto expone tu máquina a internet. Solo para pruebas.

---

### 2.8. Configurar PWA en AWS para Consumir JSON

**En AWS Amplify:**

Actualizar variable de entorno:
```bash
VITE_API_BASE_URL=https://abcd-1234.ngrok.io
```

Redeploy app.

**En código (src/services/api.js):**

El código ya está preparado para consumir el JSON:

```javascript
// Intenta cargar desde sync-service
const response = await fetch(`${VITE_API_BASE_URL}/api/precios.json`);
const data = await response.json();
// Usa data.estudios
```

---

## Verificación Post-Deployment

### ✅ Checklist de Verificación

#### laboratorio-eg (AWS)

```bash
# 1. Verificar URL principal
curl -I https://laboratorio-eg.com
# Debe responder: HTTP/2 200

# 2. Verificar PWA manifest
curl https://laboratorio-eg.com/manifest.json | jq
# Debe tener: name, icons, start_url

# 3. Verificar Service Worker
curl https://laboratorio-eg.com/sw.js | head -10
# Debe tener código del SW

# 4. Lighthouse audit
npx lighthouse https://laboratorio-eg.com --view

# Metas:
# - Performance: >= 90
# - Accessibility: >= 98
# - Best Practices: >= 90
# - SEO: >= 85
# - PWA: >= 90
```

#### sync-service (Local)

```bash
# 1. Verificar servicio corriendo
curl http://localhost:3001/health

# 2. Verificar JSON actualizado
curl http://localhost:3001/api/stats | jq '.sync.lastSyncTime'
# Debe ser reciente (< 1 hora)

# 3. Probar cambio de precio (opcional)
PGPASSWORD=tu_password psql -h localhost -U labsis -d labsisEG -c \
"UPDATE laboratorio.listaspreciodetalle SET precio = 99.99 WHERE id = 1042;"

# 4. Verificar logs sync-service
tail -f logs/combined-*.log
# Debe mostrar: "🔔 [LISTENER] Notificación recibida"

# 5. Verificar JSON actualizado
curl http://localhost:3001/api/precios.json | jq '.estudios[] | select(.id == 1042)'
# Debe mostrar precio: 99.99
```

#### Integración End-to-End

```bash
# 1. Abrir PWA en navegador
open https://laboratorio-eg.com/estudios

# 2. Buscar "17 HIDROXIPROGESTERONA"

# 3. Cambiar precio en labsisEG
# (usar script arriba)

# 4. Esperar 2-5 segundos

# 5. Verificar que precio se actualiza en PWA
# (sin reload de página si HMR está activo)
```

---

## Monitoreo y Mantenimiento

### AWS CloudWatch (laboratorio-eg)

**Métricas a monitorear:**

```bash
# 1. Crear alarma para errores 500
aws cloudwatch put-metric-alarm \
  --alarm-name laboratorio-eg-high-error-rate \
  --alarm-description "High error rate on Laboratorio EG" \
  --metric-name 5XXError \
  --namespace AWS/CloudFront \
  --statistic Sum \
  --period 300 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2

# 2. Alarma para latencia alta
aws cloudwatch put-metric-alarm \
  --alarm-name laboratorio-eg-high-latency \
  --metric-name OriginLatency \
  --namespace AWS/CloudFront \
  --statistic Average \
  --period 300 \
  --threshold 1000 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2
```

### Logs de sync-service (Local)

```bash
# Ver logs en tiempo real
tail -f /Users/samuelquiroz/Documents/proyectos/Test-Directory-EG/sync-service/logs/combined-*.log

# Buscar errores
grep -i "error" logs/error-*.log

# Estadísticas de sincronización
grep "estudios sincronizados" logs/combined-*.log | tail -20
```

### Script de Monitoreo Automático

```bash
# Crear script de health check
cat > ~/monitor-laboratorio-eg.sh << 'EOF'
#!/bin/bash

LOGFILE=~/laboratorio-eg-monitor.log

# Check PWA
STATUS_PWA=$(curl -s -o /dev/null -w "%{http_code}" https://laboratorio-eg.com)
if [ "$STATUS_PWA" != "200" ]; then
  echo "[$(date)] ❌ PWA ERROR: Status $STATUS_PWA" >> $LOGFILE
fi

# Check sync-service
STATUS_SYNC=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health)
if [ "$STATUS_SYNC" != "200" ]; then
  echo "[$(date)] ❌ SYNC SERVICE ERROR: Status $STATUS_SYNC" >> $LOGFILE
fi

echo "[$(date)] ✅ All systems OK" >> $LOGFILE
EOF

chmod +x ~/monitor-laboratorio-eg.sh

# Ejecutar cada 5 minutos (crontab)
crontab -e
# Agregar línea:
# */5 * * * * ~/monitor-laboratorio-eg.sh
```

---

## Troubleshooting

### Problema: PWA no carga en AWS

**Diagnóstico:**
```bash
# 1. Verificar S3 bucket
aws s3 ls s3://laboratorio-eg-prod/

# 2. Verificar CloudFront distribution
aws cloudfront get-distribution --id [DISTRIBUTION-ID]

# 3. Verificar DNS
dig laboratorio-eg.com
```

**Soluciones:**
- Verificar que S3 bucket policy permite acceso público
- Invalidar cache de CloudFront: `aws cloudfront create-invalidation --distribution-id [ID] --paths "/*"`
- Verificar certificado SSL en ACM

### Problema: sync-service no conecta a labsisEG

**Diagnóstico:**
```bash
# 1. Verificar PostgreSQL
pg_isready -h localhost -p 5432

# 2. Verificar credenciales
PGPASSWORD=tu_password psql -h localhost -U labsis -d labsisEG -c "SELECT version();"

# 3. Ver logs de sync-service
tail -50 logs/error-*.log
```

**Soluciones:**
- Verificar password en `.env`
- Verificar que PostgreSQL permite conexiones locales (`pg_hba.conf`)
- Verificar firewall no bloquea puerto 5432

### Problema: JSON no se actualiza en PWA

**Diagnóstico:**
```bash
# 1. Verificar que sync-service generó JSON
ls -lh output/precios.json
cat output/precios.json | jq '.metadata.fechaSincronizacion'

# 2. Verificar que JSON se sirve vía HTTP
curl http://localhost:3001/api/precios.json | jq '.metadata'

# 3. Verificar que PWA hace request al endpoint correcto
# Abrir DevTools → Network → filtrar "precios.json"
```

**Soluciones:**
- Verificar `VITE_API_BASE_URL` en AWS Amplify
- Verificar CORS en sync-service
- Verificar ngrok está corriendo (si se usa)
- Limpiar cache del navegador

---

## Rollback Procedures

### Rollback de laboratorio-eg (AWS Amplify)

```bash
# Opción 1: Via Console (Más rápido)
# 1. AWS Amplify → App → Deployments
# 2. Encontrar deployment anterior exitoso
# 3. Click "Redeploy this version"

# Opción 2: Via Git
git checkout v1.2.0-qa
git push origin feature/fusion-directorio --force
# Amplify auto-redeploys
```

**Tiempo: 3-5 minutos**

### Rollback de laboratorio-eg (S3 + CloudFront)

```bash
# 1. Tener backup de dist/ anterior
cd /path/to/backup/dist-v1.2.0-qa

# 2. Sync a S3
aws s3 sync . s3://laboratorio-eg-prod/ --delete

# 3. Invalidar CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id [DISTRIBUTION-ID] \
  --paths "/*"
```

**Tiempo: 5-10 minutos**

### Rollback de sync-service

```bash
# 1. Detener servicio actual
pkill -f "node.*sync-service"

# 2. Checkout versión anterior
cd /Users/samuelquiroz/Documents/proyectos/Test-Directory-EG/sync-service
git checkout v1.0.0

# 3. Reinstalar dependencias
npm install

# 4. Reiniciar
npm run start &
```

**Tiempo: 2-3 minutos**

---

## 📞 Contactos de Escalamiento

**Nivel 1 - Problemas menores:**
- Crear ticket en sistema de tracking
- Email a equipo de desarrollo

**Nivel 2 - Funcionalidad degradada:**
- Email + Slack a DevOps
- Considerar rollback si no se resuelve en 2 horas

**Nivel 3 - Sistema caído (CRÍTICO):**
1. **Ejecutar rollback inmediatamente**
2. Llamar a DevOps Lead
3. Notificar a stakeholders

**Contactos:**
- **Desarrollo:** saqh5037 - [email]
- **DevOps:** [Agregar contacto]
- **On-call (emergencias):** [Agregar teléfono]

---

## 📚 Documentación Relacionada

- [RELEASE_NOTES_v1.2.1-prod.md](laboratorio-eg/RELEASE_NOTES_v1.2.1-prod.md) - Release notes completas
- [DEPLOYMENT_SYNC_SERVICE_ONPREMISE.md](DEPLOYMENT_SYNC_SERVICE_ONPREMISE.md) - Setup on-premise para mañana
- [CLAUDE.md](CLAUDE.md) - Documentación completa del proyecto
- [sync-service/README.md](sync-service/README.md) - Documentación del sync service

---

## ✅ Checklist Final de Deployment

```
┌─────────────────────────────────────────────────────┐
│       DEPLOYMENT A PRODUCCIÓN - CHECKLIST           │
└─────────────────────────────────────────────────────┘

[ ] PREPARACIÓN
    [ ] Backup de ambiente actual
    [ ] Tag v1.2.1-prod creado
    [ ] Variables de entorno verificadas
    [ ] Credenciales de AWS configuradas
    [ ] Acceso a labsisEG confirmado

[ ] LABORATORIO-EG (AWS)
    [ ] Build de producción exitoso
    [ ] Amplify/S3 configurado
    [ ] CloudFront distribution creada
    [ ] DNS apuntando correctamente
    [ ] SSL certificate activo
    [ ] Deploy ejecutado
    [ ] Health check OK
    [ ] Lighthouse score >= 90/98/90/85/90

[ ] SYNC-SERVICE (LOCAL)
    [ ] Dependencias instaladas
    [ ] .env configurado para producción
    [ ] Conexión a labsisEG verificada
    [ ] Triggers PostgreSQL instalados
    [ ] Servicio corriendo en background
    [ ] JSON generado correctamente
    [ ] HTTP endpoint accesible
    [ ] ngrok/exposición configurada

[ ] INTEGRACIÓN
    [ ] PWA carga JSON desde sync-service
    [ ] Cambio de precio se refleja en PWA
    [ ] Sincronización funciona (< 5s)
    [ ] Sin errores en logs

[ ] VERIFICACIÓN
    [ ] Smoke tests manuales completos
    [ ] Accessibility checks OK
    [ ] Performance tests OK
    [ ] Mobile testing OK
    [ ] Cross-browser testing OK

[ ] POST-DEPLOYMENT
    [ ] Monitoreo configurado
    [ ] Alertas creadas
    [ ] Logs accesibles
    [ ] Rollback procedure documentado
    [ ] Equipo notificado

[ ] DOCUMENTACIÓN
    [ ] Release notes compartidas
    [ ] Deployment log completado
    [ ] Known issues documentados

┌─────────────────────────────────────────────────────┐
│            ✅ DEPLOYMENT EXITOSO                     │
│         Laboratorio EG v1.2.1-prod                  │
│      Deployed by: _______________                   │
│      Date: _______________                          │
└─────────────────────────────────────────────────────┘
```

---

**Preparado por:** Claude Code
**Fecha:** 19 de Octubre, 2025
**Versión:** v1.2.1-prod
**Ambiente:** Producción (AWS + Local)

🚀 **LISTO PARA DEPLOYMENT A PRODUCCIÓN**
