# Guía de Despliegue v1.2.0-qa - Laboratorio EG

**Fecha:** 18 de Octubre, 2025
**Versión:** v1.2.0-qa
**Rama:** `feature/fusion-directorio`
**Tag:** `v1.2.0-qa`
**Tipo de Release:** Minor (Feature Release - Rediseño Accesible)
**Prioridad:** Alta (Mejoras de Accesibilidad)

---

## 📋 Resumen Ejecutivo

Esta guía proporciona instrucciones paso a paso para el despliegue de la versión **v1.2.0-qa** del proyecto Laboratorio Elizabeth Gutiérrez en el ambiente de QA.

**Cambios principales de esta versión:**
- ✅ Rediseño completo de la página `/estudios` con enfoque en accesibilidad (WCAG AAA)
- ✅ Hero section reducido en 70% para acceso directo a búsqueda
- ✅ Contraste visual mejorado (7:1+) para adultos mayores y usuarios con baja visión
- ✅ Navegación completa por teclado con anillos de enfoque visibles
- ✅ Botones touch-friendly (min 48px)
- ✅ ARIA markup completo para lectores de pantalla
- ✅ Diseño responsivo optimizado para móvil, tablet y desktop
- ✅ Corrección de bugs (StudyCard.tiempo, AdvancedSearchBox props)

**Impacto esperado:**
- 🎯 Mejora significativa en accesibilidad (Score Lighthouse > 98)
- 🎯 Mejor experiencia para adultos mayores y usuarios con discapacidades
- 🎯 Reducción de pasos para realizar búsqueda de estudios
- 🎯 Compatibilidad total con lectores de pantalla

**Riesgo:** ⬇️ **BAJO** - Solo 2 archivos modificados, sin breaking changes, totalmente compatible con v1.1.0

---

## 🎯 Prerequisitos

### Sistemas y Herramientas

| Herramienta | Versión Mínima | Propósito |
|-------------|----------------|-----------|
| **Node.js** | >= 18.x | Runtime de JavaScript |
| **npm** | >= 9.x | Gestor de paquetes |
| **Git** | >= 2.30 | Control de versiones |
| **Nginx** | >= 1.18 (o servidor web equivalente) | Servidor web estático |

### Accesos Requeridos

- [ ] Acceso SSH al servidor de QA
- [ ] Acceso al repositorio Git (https://github.com/saqh5037/TestDirectoryEG)
- [ ] Permisos de escritura en `/var/www/laboratorio-eg/` (o directorio de deploy)
- [ ] Acceso a variables de entorno (.env)
- [ ] Credenciales de base de datos PostgreSQL (QA)

### Verificación de Prerequisitos

```bash
# Verificar versiones instaladas
node --version   # Debe ser >= v18.x
npm --version    # Debe ser >= 9.x
git --version    # Debe ser >= 2.30

# Verificar acceso al servidor
ssh user@qa.laboratorio-eg.com "echo 'Conexión exitosa'"

# Verificar acceso al repositorio
git ls-remote https://github.com/saqh5037/TestDirectoryEG.git
```

---

## 📦 Paso 1: Preparación del Entorno

### 1.1 Backup del Deploy Actual

**¿Por qué?** Permite rollback rápido en caso de problemas.

```bash
# Conectar al servidor de QA
ssh user@qa.laboratorio-eg.com

# Crear backup del deploy actual
cd /var/www/laboratorio-eg
sudo cp -r dist dist.backup.v1.1.0-qa.$(date +%Y%m%d-%H%M%S)

# Verificar backup
ls -lh dist.backup.*
```

**Resultado esperado:**
```
drwxr-xr-x 5 www-data www-data 4.0K Oct 18 10:30 dist.backup.v1.1.0-qa.20251018-103000
```

### 1.2 Clonar o Actualizar Repositorio

**Opción A: Primera vez (clonar repositorio)**

```bash
cd /var/www
sudo git clone https://github.com/saqh5037/TestDirectoryEG.git laboratorio-eg
cd laboratorio-eg
```

**Opción B: Actualizar repositorio existente**

```bash
cd /var/www/laboratorio-eg

# Guardar cambios locales si existen (generalmente no debería haber)
git stash

# Actualizar desde remoto
git fetch origin
git fetch --tags

# Verificar rama actual
git branch

# Cambiar a rama de feature
git checkout feature/fusion-directorio
git pull origin feature/fusion-directorio
```

### 1.3 Checkout del Tag v1.2.0-qa

```bash
# Cambiar al tag específico de la release
git checkout v1.2.0-qa

# Verificar que estamos en el tag correcto
git describe --tags
# Debe mostrar: v1.2.0-qa

# Verificar commit hash
git log -1 --oneline
# Debe mostrar: 9a51403 feat(estudios): Rediseño completo con optimización de accesibilidad (A11y)
```

**⚠️ Importante:** Siempre hacer checkout del tag específico, no de la rama, para asegurar versión exacta.

---

## 🔧 Paso 2: Configuración

### 2.1 Instalar Dependencias

```bash
# Instalar dependencias de Node.js
npm install

# Verificar que no hay errores
echo $?
# Debe mostrar: 0 (sin errores)
```

**Tiempo estimado:** 2-3 minutos

**Tamaño de node_modules:** ~350MB

### 2.2 Configurar Variables de Entorno

**Crear archivo `.env` en la raíz del proyecto:**

```bash
# Crear archivo .env
sudo nano .env
```

**Contenido del archivo `.env` para QA:**

```env
# ========================================
# LABORATORIO EG - AMBIENTE QA
# Versión: v1.2.0-qa
# Fecha: 18 de Octubre, 2025
# ========================================

# API Endpoints (QA)
VITE_API_BASE_URL=https://api-qa.laboratorio-eg.com
VITE_API_TIMEOUT=30000

# Database (Backend - PostgreSQL)
# NOTA: Estas variables son para el servidor backend, no frontend
DB_HOST=qa-db.laboratorio-eg.com
DB_PORT=5432
DB_NAME=laboratorio_eg_qa
DB_USER=lab_eg_qa_user
DB_PASSWORD=[SOLICITAR_A_DEVOPS]

# PWA Configuration
VITE_PWA_NAME=Laboratorio EG QA
VITE_PWA_SHORT_NAME=Lab EG QA
VITE_PWA_THEME_COLOR=#7B68A6

# Analytics (opcional para QA)
VITE_GA_ID=

# Environment
NODE_ENV=production
VITE_ENV=qa
```

**⚠️ Seguridad:**
- Solicitar `DB_PASSWORD` al equipo de DevOps (no almacenar en repositorio)
- Archivo `.env` debe estar en `.gitignore`
- Permisos: `chmod 600 .env` (solo lectura para owner)

```bash
# Establecer permisos correctos
sudo chmod 600 .env
sudo chown www-data:www-data .env
```

### 2.3 Verificar Configuración

```bash
# Verificar que las variables se cargan correctamente
npm run dev &
sleep 5
curl http://localhost:5173 | grep "Laboratorio EG"
pkill -f vite
```

---

## 🏗️ Paso 3: Build de Producción

### 3.1 Ejecutar Build

```bash
# Limpiar builds anteriores
rm -rf dist

# Ejecutar build de producción
npm run build
```

**Tiempo estimado:** 30-60 segundos

**Output esperado:**

```
vite v7.1.2 building for production...
✓ 1234 modules transformed.
dist/index.html                    0.45 kB │ gzip:  0.30 kB
dist/assets/index-a1b2c3d4.css    125.40 kB │ gzip: 18.20 kB
dist/assets/index-e5f6g7h8.js     495.30 kB │ gzip: 165.50 kB
dist/assets/vendor-i9j0k1l2.js   1500.20 kB │ gzip: 520.30 kB
✓ built in 42.15s
```

### 3.2 Verificar Tamaño del Build

```bash
du -sh dist/
# Esperado: ~2.5MB

du -sh dist/assets/
# Esperado: ~2.0MB
```

**Comparación con v1.1.0:**

| Métrica | v1.1.0 | v1.2.0 | Cambio |
|---------|--------|--------|--------|
| **Total dist/** | ~2.50 MB | ~2.48 MB | -0.8% ✅ |
| **Main bundle** | ~500 KB | ~495 KB | -1.0% ✅ |
| **Gzipped** | ~800 KB | ~790 KB | -1.2% ✅ |

### 3.3 Verificar Estructura del Build

```bash
tree -L 2 dist/
```

**Estructura esperada:**

```
dist/
├── index.html
├── favicon.svg
├── Logo.png
├── LogoEG.png
├── assets/
│   ├── index-[hash].css
│   ├── index-[hash].js
│   └── vendor-[hash].js
└── [otros assets]
```

---

## 🚀 Paso 4: Deploy

### 4.1 Copiar Archivos al Servidor Web

**Opción A: Deploy en mismo servidor**

```bash
# Detener servidor web temporalmente (opcional, recomendado para evitar cache)
sudo systemctl stop nginx

# Eliminar dist anterior (ya tenemos backup)
sudo rm -rf /var/www/laboratorio-eg/dist

# Copiar nuevo dist
sudo cp -r dist /var/www/laboratorio-eg/

# Establecer permisos correctos
sudo chown -R www-data:www-data /var/www/laboratorio-eg/dist
sudo chmod -R 755 /var/www/laboratorio-eg/dist

# Reiniciar servidor web
sudo systemctl start nginx
```

**Opción B: Deploy desde máquina local**

```bash
# Desde tu máquina local, después de npm run build
rsync -avz --delete dist/ user@qa.laboratorio-eg.com:/var/www/laboratorio-eg/dist/

# Establecer permisos en servidor
ssh user@qa.laboratorio-eg.com "sudo chown -R www-data:www-data /var/www/laboratorio-eg/dist && sudo chmod -R 755 /var/www/laboratorio-eg/dist"
```

### 4.2 Configurar Nginx (Si es primera vez)

**Archivo de configuración:** `/etc/nginx/sites-available/laboratorio-eg-qa`

```bash
sudo nano /etc/nginx/sites-available/laboratorio-eg-qa
```

**Contenido:**

```nginx
server {
    listen 80;
    server_name qa.laboratorio-eg.com;

    # Redirigir a HTTPS (recomendado)
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name qa.laboratorio-eg.com;

    # Certificado SSL
    ssl_certificate /etc/letsencrypt/live/qa.laboratorio-eg.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/qa.laboratorio-eg.com/privkey.pem;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Root y archivos index
    root /var/www/laboratorio-eg/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;

    # Logs
    access_log /var/log/nginx/laboratorio-eg-qa.access.log;
    error_log /var/log/nginx/laboratorio-eg-qa.error.log;

    # SPA routing - todas las rutas a index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache de assets estáticos (JS, CSS, imágenes)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Deshabilitar cache para index.html
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Content Security Policy (ajustar según necesidades)
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api-qa.laboratorio-eg.com;" always;
}
```

**Activar sitio y recargar Nginx:**

```bash
# Crear symlink
sudo ln -s /etc/nginx/sites-available/laboratorio-eg-qa /etc/nginx/sites-enabled/

# Verificar configuración
sudo nginx -t
# Debe mostrar: syntax is ok

# Recargar Nginx
sudo systemctl reload nginx
```

### 4.3 Limpiar Cache del Navegador (Importante)

**¿Por qué?** Evitar que usuarios vean versión antigua cacheada.

**Opción A: Cache-busting automático (Vite genera hashes)**

Vite ya genera nombres de archivo con hashes únicos (ej: `index-a1b2c3d4.js`), por lo que el navegador descargará automáticamente las nuevas versiones.

**Opción B: Forzar recarga para testing**

```bash
# En navegador:
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)

# O limpiar cache manualmente:
DevTools > Application > Clear Storage > Clear site data
```

---

## ✅ Paso 5: Verificación Post-Deployment

### 5.1 Health Checks Automáticos

```bash
# Script de verificación rápida
cat << 'EOF' > /tmp/healthcheck-v1.2.0.sh
#!/bin/bash

echo "============================================"
echo "Health Check - Laboratorio EG v1.2.0-qa"
echo "============================================"

# 1. Verificar que el servidor responde
echo -n "1. Servidor responde (HTTP 200)... "
STATUS=$(curl -o /dev/null -s -w "%{http_code}\n" https://qa.laboratorio-eg.com)
if [ "$STATUS" -eq 200 ]; then
  echo "✅ OK ($STATUS)"
else
  echo "❌ FALLO ($STATUS)"
fi

# 2. Verificar página de estudios
echo -n "2. Página /estudios carga... "
STATUS=$(curl -o /dev/null -s -w "%{http_code}\n" https://qa.laboratorio-eg.com/estudios)
if [ "$STATUS" -eq 200 ]; then
  echo "✅ OK ($STATUS)"
else
  echo "❌ FALLO ($STATUS)"
fi

# 3. Verificar que assets cargan
echo -n "3. Assets JS cargan... "
ASSET=$(curl -s https://qa.laboratorio-eg.com/ | grep -oP 'assets/index-[a-z0-9]+\.js' | head -1)
if [ -n "$ASSET" ]; then
  STATUS=$(curl -o /dev/null -s -w "%{http_code}\n" "https://qa.laboratorio-eg.com/$ASSET")
  if [ "$STATUS" -eq 200 ]; then
    echo "✅ OK ($ASSET)"
  else
    echo "❌ FALLO ($STATUS)"
  fi
else
  echo "❌ FALLO (asset no encontrado)"
fi

# 4. Verificar favicon
echo -n "4. Favicon carga... "
STATUS=$(curl -o /dev/null -s -w "%{http_code}\n" https://qa.laboratorio-eg.com/favicon.svg)
if [ "$STATUS" -eq 200 ]; then
  echo "✅ OK ($STATUS)"
else
  echo "❌ FALLO ($STATUS)"
fi

# 5. Verificar que no hay errores en Nginx
echo -n "5. Logs Nginx sin errores críticos (últimos 10 min)... "
ERRORS=$(sudo tail -100 /var/log/nginx/laboratorio-eg-qa.error.log | grep -i "error" | wc -l)
if [ "$ERRORS" -eq 0 ]; then
  echo "✅ OK (0 errores)"
else
  echo "⚠️  WARNING ($ERRORS errores encontrados)"
fi

echo "============================================"
echo "Health Check Completo"
echo "============================================"
EOF

chmod +x /tmp/healthcheck-v1.2.0.sh
/tmp/healthcheck-v1.2.0.sh
```

**Resultado esperado: Todos ✅ OK**

### 5.2 Verificación Manual de Funcionalidades

#### 5.2.1 Página de Estudios - Funcionalidad Básica

Abrir en navegador: `https://qa.laboratorio-eg.com/estudios`

- [ ] **Hero compacto:** Sección superior es ~120px (no ~400px)
- [ ] **Buscador visible:** Campo de búsqueda visible sin hacer scroll
- [ ] **Contador de estudios:** Muestra "255 estudios disponibles" (o número correcto)
- [ ] **Grid de estudios:** Se muestra grid de 3 columnas (desktop)
- [ ] **Búsqueda funcional:** Escribir "hemograma" filtra resultados
- [ ] **Filtros por categoría:** Click en categoría filtra estudios
- [ ] **Vista grid/lista:** Toggle cambia entre vista cuadrícula y lista
- [ ] **Panel lateral:** Click en estudio abre panel de detalles a la derecha
- [ ] **Cerrar panel:** Click en X o Escape cierra panel
- [ ] **No hay errores de consola:** Abrir DevTools (F12) > Console (0 errores)

#### 5.2.2 Accesibilidad (A11y) - Verificación Manual

**Contraste Visual:**

- [ ] **Textos legibles:** Todos los textos son fáciles de leer
- [ ] **Contraste alto:** No hay textos tenues o difíciles de ver
- [ ] **Botones visibles:** Botones tienen buen contraste con fondo

**Navegación por Teclado:**

1. Abrir página `/estudios`
2. Presionar `Tab` repetidamente
3. Verificar:
   - [ ] Orden lógico de tabulación (izquierda → derecha, arriba → abajo)
   - [ ] Anillo de enfoque visible (4px, color púrpura)
   - [ ] Todos los botones son accesibles
   - [ ] Tarjetas de estudios son accesibles
4. Con foco en una tarjeta de estudio:
   - [ ] Presionar `Enter` abre panel de detalles
5. Con panel abierto:
   - [ ] Presionar `Escape` cierra panel

**Tamaño de Botones (Touch-Friendly):**

- [ ] Todos los botones tienen altura >= 48px
- [ ] Botones son fáciles de presionar en móvil

**Responsive Design:**

1. **Móvil (< 640px):**
   - [ ] Abrir DevTools > Toggle Device Toolbar > iPhone 12 (390x844)
   - [ ] Hero compacto y legible
   - [ ] Grid de 1 columna
   - [ ] Panel lateral full-screen
   - [ ] Botones accesibles sin scroll horizontal
   - [ ] Textos no se cortan

2. **Tablet (640px - 1024px):**
   - [ ] Abrir DevTools > iPad (768x1024)
   - [ ] Grid de 2 columnas
   - [ ] Panel lateral sidebar (no full-screen)
   - [ ] Espaciado adecuado

3. **Desktop (> 1024px):**
   - [ ] Pantalla completa normal
   - [ ] Grid de 3 columnas
   - [ ] Panel lateral sidebar ancho fijo
   - [ ] Hover states funcionan

#### 5.2.3 Lector de Pantalla (Opcional pero Recomendado)

**Herramientas:**
- Windows: NVDA (https://www.nvaccess.org/download/)
- Mac: VoiceOver (integrado, Cmd+F5)
- Chrome: ChromeVox (extensión)

**Pruebas básicas:**

1. Activar lector de pantalla
2. Abrir `/estudios`
3. Verificar:
   - [ ] Título "Buscar Estudios" se lee correctamente
   - [ ] Lista de estudios se anuncia como "lista de X elementos"
   - [ ] Botones tienen labels descriptivos
   - [ ] Estado de botones toggle se anuncia ("pressed" / "not pressed")
   - [ ] Panel lateral se anuncia como "diálogo modal"

### 5.3 Performance - Lighthouse Test

```bash
# Instalar Lighthouse CLI (si no está instalado)
npm install -g @lhci/cli

# Ejecutar Lighthouse en página de estudios
lhci autorun --collect.url=https://qa.laboratorio-eg.com/estudios --collect.numberOfRuns=3
```

**Metas esperadas para v1.2.0:**

| Métrica | Mínimo Aceptable | Target | Crítico |
|---------|------------------|--------|---------|
| **Performance** | >= 85 | >= 92 | ⚠️ |
| **Accessibility** | >= 95 | >= 98 | 🔴 **CRÍTICO** |
| **Best Practices** | >= 85 | >= 90 | ⚠️ |
| **SEO** | >= 85 | >= 90 | - |

**⚠️ IMPORTANTE:** Si **Accessibility < 95**, reportar inmediatamente al equipo de desarrollo.

**Interpretar resultados:**

```
✅ Accessibility: 100 → Excelente, deploy exitoso
✅ Accessibility: 98-99 → Muy bueno, deploy exitoso
⚠️  Accessibility: 95-97 → Aceptable, considerar mejoras
🔴 Accessibility: < 95 → ROLLBACK recomendado
```

### 5.4 Verificar Logs del Servidor

```bash
# Ver últimos 50 logs de acceso
sudo tail -50 /var/log/nginx/laboratorio-eg-qa.access.log

# Ver últimos 50 logs de error
sudo tail -50 /var/log/nginx/laboratorio-eg-qa.error.log

# Buscar errores 500/404 en última hora
sudo grep -E "HTTP/[0-9.]+ (404|500)" /var/log/nginx/laboratorio-eg-qa.access.log | tail -20
```

**Resultado esperado:** No debe haber errores 500 (server error) ni muchos 404.

### 5.5 Verificar Métricas de Uso (Opcional)

Si hay herramienta de analytics (Google Analytics, Matomo, etc.):

- [ ] Verificar que se registran visitas en `/estudios`
- [ ] Verificar que no hay aumento de bounce rate
- [ ] Verificar tiempo en página (debe mantenerse o mejorar)

---

## 🔄 Paso 6: Rollback (Si es necesario)

### 6.1 Cuándo Hacer Rollback

**Hacer rollback inmediatamente si:**

- 🔴 Errores 500 (server error) en `/estudios`
- 🔴 Página no carga (pantalla blanca)
- 🔴 Lighthouse Accessibility < 90 (regresión crítica)
- 🔴 Funcionalidad de búsqueda no funciona
- 🔴 Muchos errores en consola del navegador

**Considerar rollback si:**

- ⚠️ Performance degradó significativamente (> 10%)
- ⚠️ Usuarios reportan problemas de usabilidad
- ⚠️ Incompatibilidad con navegadores clave

### 6.2 Rollback Rápido a v1.1.0-qa

```bash
# Detener servidor web
sudo systemctl stop nginx

# Restaurar backup de v1.1.0
cd /var/www/laboratorio-eg
sudo rm -rf dist
sudo cp -r dist.backup.v1.1.0-qa.* dist
sudo mv dist.backup.v1.1.0-qa.* dist

# Reiniciar servidor web
sudo systemctl start nginx

# Verificar que carga correctamente
curl -I https://qa.laboratorio-eg.com/estudios
# Debe mostrar: HTTP/1.1 200 OK
```

**Tiempo estimado:** 1-2 minutos

### 6.3 Rollback Completo con Git

```bash
cd /var/www/laboratorio-eg

# Checkout a tag anterior
git checkout v1.1.0-qa

# Reinstalar dependencias
npm install

# Rebuild
npm run build

# Deploy (seguir pasos de Paso 4)
sudo rm -rf /var/www/laboratorio-eg/dist
sudo cp -r dist /var/www/laboratorio-eg/
sudo chown -R www-data:www-data /var/www/laboratorio-eg/dist
sudo systemctl reload nginx
```

**Tiempo estimado:** 3-5 minutos

### 6.4 Notificación de Rollback

**Comunicar al equipo:**

```
ASUNTO: [QA] Rollback a v1.1.0-qa - Laboratorio EG

Se realizó rollback de v1.2.0-qa a v1.1.0-qa en ambiente QA.

Razón: [Especificar razón]

Hora de rollback: [Timestamp]

Estado actual: Sistema funcionando con v1.1.0-qa

Próximos pasos:
1. Investigar causa raíz
2. Corregir en desarrollo
3. Re-deployment cuando esté listo

Contacto: [Tu nombre y email]
```

---

## 📊 Paso 7: Monitoreo Post-Deployment

### 7.1 Monitoreo en las Primeras 24 Horas

**Checklist de monitoreo:**

**Hora 0 (inmediatamente después de deploy):**
- [ ] Health check completo (ver 5.1)
- [ ] Verificación manual de funcionalidades (ver 5.2)
- [ ] Lighthouse test (ver 5.3)

**Hora +1:**
- [ ] Revisar logs de Nginx (errores)
- [ ] Verificar que usuarios están accediendo
- [ ] Check rápido de `/estudios` en navegador

**Hora +4:**
- [ ] Revisar logs de Nginx (errores)
- [ ] Verificar métricas de analytics (si aplica)

**Hora +24:**
- [ ] Lighthouse test de control
- [ ] Revisar feedback de usuarios QA
- [ ] Comparar métricas con v1.1.0

### 7.2 Script de Monitoreo Automatizado (Opcional)

```bash
# Crear script de monitoreo continuo
cat << 'EOF' > /usr/local/bin/monitor-laboratorio-eg.sh
#!/bin/bash

LOGFILE="/var/log/laboratorio-eg-monitor.log"
URL="https://qa.laboratorio-eg.com/estudios"

while true; do
  TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
  STATUS=$(curl -o /dev/null -s -w "%{http_code}\n" "$URL")

  if [ "$STATUS" -ne 200 ]; then
    echo "[$TIMESTAMP] ❌ ERROR: Status $STATUS" | tee -a "$LOGFILE"
    # Aquí puedes agregar notificación (email, Slack, etc.)
  else
    echo "[$TIMESTAMP] ✅ OK: Status $STATUS" >> "$LOGFILE"
  fi

  sleep 300  # Verificar cada 5 minutos
done
EOF

chmod +x /usr/local/bin/monitor-laboratorio-eg.sh

# Ejecutar en background
nohup /usr/local/bin/monitor-laboratorio-eg.sh &
```

### 7.3 KPIs a Monitorear

| KPI | Método | Frecuencia | Target |
|-----|--------|------------|--------|
| **Uptime** | Ping/curl | 5 min | 99.9% |
| **Response Time** | curl time | 5 min | < 500ms |
| **Error Rate** | Nginx logs | 1 hora | < 0.1% |
| **Accessibility Score** | Lighthouse | 1 día | >= 98 |
| **Performance Score** | Lighthouse | 1 día | >= 92 |

---

## 📞 Paso 8: Contactos y Escalamiento

### 8.1 Equipo de Desarrollo

**Desarrollador Principal:**
- Nombre: saqh5037
- Email: [Agregar email]
- Slack: [Agregar Slack]
- Disponibilidad: [Horario]

**Asistente de Desarrollo:**
- Claude Code (documentación y soporte técnico)

### 8.2 Equipo de DevOps

**DevOps Lead:**
- Nombre: [Agregar nombre]
- Email: [Agregar email]
- Teléfono: [Agregar teléfono emergencia]
- Slack: [Agregar Slack]

### 8.3 Equipo de QA

**QA Lead:**
- Nombre: [Agregar nombre]
- Email: [Agregar email]
- Slack: [Agregar Slack]

### 8.4 Procedimiento de Escalamiento

**Nivel 1 - Problema Menor (Performance leve, UI glitch):**
1. Reportar en Slack #qa-laboratorio-eg
2. Crear ticket en sistema de tracking
3. Esperar resolución en próximo sprint

**Nivel 2 - Problema Moderado (Funcionalidad degradada):**
1. Reportar en Slack #qa-laboratorio-eg + @developer
2. Email al desarrollador principal
3. Considerar rollback si no se resuelve en 2 horas

**Nivel 3 - Problema Crítico (Sistema inaccesible, errores masivos):**
1. **Hacer rollback inmediatamente** (ver 6.2)
2. Llamar a DevOps Lead
3. Email urgente a developer + DevOps
4. Mensaje en Slack #qa-laboratorio-eg + @channel

---

## 📚 Apéndices

### A. Comandos Útiles

```bash
# Ver versión actual deployada
curl -s https://qa.laboratorio-eg.com/ | grep -oP 'v\d+\.\d+\.\d+' | head -1

# Ver tamaño de build
du -sh /var/www/laboratorio-eg/dist

# Ver procesos de Node.js corriendo
ps aux | grep node

# Reiniciar Nginx
sudo systemctl restart nginx

# Ver logs en tiempo real
sudo tail -f /var/log/nginx/laboratorio-eg-qa.access.log

# Limpiar cache de Nginx (si existe)
sudo rm -rf /var/cache/nginx/*
sudo systemctl reload nginx
```

### B. Troubleshooting Común

**Problema: Página muestra versión antigua (cacheada)**

```bash
# Solución 1: Limpiar cache de navegador
Ctrl + Shift + R (forzar recarga)

# Solución 2: Verificar headers de cache
curl -I https://qa.laboratorio-eg.com/index.html | grep -i cache

# Solución 3: Limpiar cache de Nginx
sudo rm -rf /var/cache/nginx/*
sudo systemctl reload nginx
```

**Problema: Error 404 en rutas de React (/estudios)**

```bash
# Verificar configuración de Nginx
sudo nginx -t

# Verificar que existe try_files en config
sudo grep "try_files" /etc/nginx/sites-available/laboratorio-eg-qa

# Debe contener: try_files $uri $uri/ /index.html;
```

**Problema: Assets no cargan (404 en JS/CSS)**

```bash
# Verificar que archivos existen
ls -lh /var/www/laboratorio-eg/dist/assets/

# Verificar permisos
ls -ld /var/www/laboratorio-eg/dist/assets/
# Debe ser: drwxr-xr-x www-data www-data

# Corregir permisos si es necesario
sudo chown -R www-data:www-data /var/www/laboratorio-eg/dist
sudo chmod -R 755 /var/www/laboratorio-eg/dist
```

**Problema: Errores de CORS**

```bash
# Verificar headers CORS en Nginx
curl -I https://qa.laboratorio-eg.com/estudios | grep -i "access-control"

# Si no existen, agregar a Nginx config:
# add_header Access-Control-Allow-Origin "*" always;
```

### C. Checklist de Pre-Deployment

- [ ] Backup de deploy actual realizado
- [ ] Tag v1.2.0-qa verificado en repositorio
- [ ] Variables de entorno configuradas
- [ ] Build exitoso sin errores
- [ ] Tamaño de build verificado (~2.48MB)
- [ ] Configuración de Nginx actualizada (si aplica)
- [ ] Certificado SSL válido (si aplica)
- [ ] Permisos de archivos correctos (755 dist/, 644 archivos)
- [ ] Health check script preparado
- [ ] Contactos de escalamiento confirmados

### D. Checklist de Post-Deployment

- [ ] Health check automático ejecutado (5.1)
- [ ] Verificación manual de funcionalidades (5.2.1)
- [ ] Verificación de accesibilidad (5.2.2)
- [ ] Lighthouse test >= 98 accessibility (5.3)
- [ ] Logs de Nginx sin errores críticos (5.4)
- [ ] Monitoreo configurado para próximas 24h (7.1)
- [ ] Notificación a equipo de QA enviada
- [ ] Documentación de deploy completada

---

## ✅ Checklist Final de Deployment

```
┌─────────────────────────────────────────────────────────┐
│         DEPLOYMENT v1.2.0-qa - CHECKLIST FINAL          │
└─────────────────────────────────────────────────────────┘

[ ] 1. PREPARACIÓN
    [ ] Backup de v1.1.0 creado
    [ ] Repositorio clonado/actualizado
    [ ] Tag v1.2.0-qa checkeado

[ ] 2. CONFIGURACIÓN
    [ ] Dependencias instaladas (npm install)
    [ ] Variables .env configuradas
    [ ] Permisos .env establecidos (chmod 600)

[ ] 3. BUILD
    [ ] Build ejecutado (npm run build)
    [ ] Tamaño verificado (~2.48MB)
    [ ] Estructura de dist/ correcta

[ ] 4. DEPLOY
    [ ] Archivos copiados a /var/www
    [ ] Permisos establecidos (www-data:www-data)
    [ ] Nginx configurado y recargado

[ ] 5. VERIFICACIÓN
    [ ] Health check automático ✅
    [ ] /estudios carga correctamente
    [ ] Hero compacto verificado
    [ ] Búsqueda funcional
    [ ] Navegación por teclado funciona
    [ ] Lighthouse Accessibility >= 98
    [ ] Sin errores en consola

[ ] 6. MONITOREO
    [ ] Logs de Nginx sin errores
    [ ] Monitoreo 24h configurado
    [ ] Contactos de escalamiento confirmados

[ ] 7. COMUNICACIÓN
    [ ] Equipo de QA notificado
    [ ] Documentación actualizada

┌─────────────────────────────────────────────────────────┐
│                    DEPLOYMENT EXITOSO                    │
│                   Versión: v1.2.0-qa                     │
│              Fecha: [Completar con timestamp]            │
│                  Deploy por: [Tu nombre]                 │
└─────────────────────────────────────────────────────────┘
```

---

**Preparado por:** Claude Code
**Fecha:** 18 de Octubre, 2025
**Versión del Documento:** 1.0
**Versión de Software:** v1.2.0-qa

**Última Actualización:** 18 de Octubre, 2025

---

## 📖 Referencias

- [RELEASE_NOTES_v1.2.0-qa.md](RELEASE_NOTES_v1.2.0-qa.md) - Notas de release detalladas
- [RELEASE_NOTES_v1.1.0-qa.md](RELEASE_NOTES_v1.1.0-qa.md) - Release anterior
- [Repositorio GitHub](https://github.com/saqh5037/TestDirectoryEG)
- [Documentación WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [Nginx Documentation](https://nginx.org/en/docs/)
