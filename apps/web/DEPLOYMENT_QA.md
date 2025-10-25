# Deployment Guide - QA Environment

**Proyecto:** Laboratorio Elizabeth Gutiérrez
**Release:** v1.1.0-qa
**Fecha:** 18 de Octubre, 2025
**Ambiente:** QA

---

## 📋 Resumen Ejecutivo

Este documento contiene las instrucciones paso a paso para que el equipo DevOps despliegue la versión **v1.1.0-qa** del proyecto en el ambiente de QA.

**Tiempo estimado de deployment:** 15-20 minutos

---

## ✅ Pre-requisitos

### Software Requerido:
- [x] Node.js >= 18.x
- [x] npm >= 9.x
- [x] Git
- [x] Acceso SSH al servidor QA
- [x] Credenciales de la base de datos QA

### Accesos Necesarios:
- [x] Repositorio GitHub: `git@github.com:saqh5037/TestDirectoryEG.git`
- [x] Servidor QA: `qa.laboratorio-eg.com`
- [x] Base de datos PostgreSQL QA
- [x] Variables de entorno de QA

---

## 🚀 Pasos de Deployment

### Paso 1: Conectar al Servidor QA

```bash
# Conectar vía SSH
ssh devops@qa.laboratorio-eg.com

# Verificar Node.js y npm
node --version  # Debe ser >= 18.x
npm --version   # Debe ser >= 9.x
```

### Paso 2: Clonar/Actualizar Repositorio

**Si es la primera vez:**
```bash
cd /var/www/
git clone git@github.com:saqh5037/TestDirectoryEG.git laboratorio-eg
cd laboratorio-eg
```

**Si el repositorio ya existe:**
```bash
cd /var/www/laboratorio-eg
git fetch --all --tags
git stash  # Guardar cambios locales si los hay
```

### Paso 3: Checkout del Release Tag

```bash
# Cambiar al tag de la release
git checkout tags/v1.1.0-qa

# Verificar que estamos en el tag correcto
git describe --tags
# Output esperado: v1.1.0-qa
```

### Paso 4: Instalar Dependencias

```bash
# Limpiar instalación anterior (opcional pero recomendado)
rm -rf node_modules package-lock.json

# Instalar dependencias
npm install

# Verificar que no haya vulnerabilidades críticas
npm audit
```

### Paso 5: Configurar Variables de Entorno

```bash
# Crear archivo .env en la raíz del proyecto
nano .env
```

**Contenido del archivo .env:**
```env
# ============================================
# LABORATORIO EG - QA ENVIRONMENT
# ============================================

# API Endpoints
VITE_API_BASE_URL=https://api-qa.laboratorio-eg.com
VITE_API_TIMEOUT=30000

# PWA Configuration
VITE_PWA_NAME=Laboratorio EG QA
VITE_PWA_SHORT_NAME=Lab EG QA
VITE_PWA_THEME_COLOR=#7B68A6
VITE_PWA_BACKGROUND_COLOR=#FFFFFF

# Feature Flags (QA)
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_ERROR_REPORTING=true
VITE_ENABLE_DEBUG_MODE=true

# Environment
VITE_ENV=qa
NODE_ENV=production
```

**Guardar y cerrar:** `Ctrl+X` → `Y` → `Enter`

### Paso 6: Build del Proyecto

```bash
# Ejecutar build de producción
npm run build

# Verificar que el build fue exitoso
ls -lah dist/
# Debe mostrar carpeta dist/ con archivos generados
```

**Output esperado:**
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [imágenes y otros assets]
└── favicon.svg
```

### Paso 7: Backup del Deployment Anterior

```bash
# Crear backup del deployment anterior (si existe)
if [ -d /var/www/laboratorio-eg-current ]; then
  sudo mv /var/www/laboratorio-eg-current /var/www/laboratorio-eg-backup-$(date +%Y%m%d-%H%M%S)
fi
```

### Paso 8: Deploy de la Nueva Versión

```bash
# Copiar build a directorio de producción
sudo cp -r dist /var/www/laboratorio-eg-current

# Verificar permisos
sudo chown -R www-data:www-data /var/www/laboratorio-eg-current
sudo chmod -R 755 /var/www/laboratorio-eg-current
```

### Paso 9: Configurar Nginx

**Verificar configuración de Nginx:**
```bash
sudo nano /etc/nginx/sites-available/laboratorio-eg-qa
```

**Configuración recomendada:**
```nginx
server {
    listen 80;
    server_name qa.laboratorio-eg.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name qa.laboratorio-eg.com;

    # SSL Configuration (ajustar rutas según certificados)
    ssl_certificate /etc/ssl/certs/laboratorio-eg-qa.crt;
    ssl_certificate_key /etc/ssl/private/laboratorio-eg-qa.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Root directory
    root /var/www/laboratorio-eg-current;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;

    # SPA routing - todas las rutas a index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache de assets estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Cache de HTML (corto para permitir updates rápidos)
    location ~* \.html$ {
        expires 1h;
        add_header Cache-Control "public, must-revalidate";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # HSTS (si se usa HTTPS)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Logs
    access_log /var/log/nginx/laboratorio-eg-qa-access.log;
    error_log /var/log/nginx/laboratorio-eg-qa-error.log;
}
```

**Activar sitio y recargar Nginx:**
```bash
# Crear symlink si no existe
sudo ln -s /etc/nginx/sites-available/laboratorio-eg-qa /etc/nginx/sites-enabled/

# Verificar configuración
sudo nginx -t

# Si la verificación es exitosa, recargar Nginx
sudo systemctl reload nginx
```

### Paso 10: Verificación Post-Deployment

#### 10.1 Health Check Básico

```bash
# Verificar que el servidor responde
curl -I https://qa.laboratorio-eg.com

# Output esperado:
# HTTP/2 200
# content-type: text/html
```

#### 10.2 Verificar Rutas Principales

```bash
# Homepage
curl -s https://qa.laboratorio-eg.com/ | grep "<title>"

# Estudios
curl -s https://qa.laboratorio-eg.com/estudios | grep "<title>"

# Resultados
curl -s https://qa.laboratorio-eg.com/resultados | grep "<title>"
```

#### 10.3 Verificar Assets Estáticos

```bash
# Verificar que el favicon carga
curl -I https://qa.laboratorio-eg.com/favicon.svg
# Debe retornar 200 OK

# Verificar JS bundle
curl -I https://qa.laboratorio-eg.com/assets/index-*.js
# Debe retornar 200 OK con cache headers
```

#### 10.4 Verificar Logs

```bash
# Ver logs de Nginx en tiempo real
sudo tail -f /var/log/nginx/laboratorio-eg-qa-access.log

# En otro terminal, hacer request
curl https://qa.laboratorio-eg.com

# Verificar que aparece en el log sin errores
```

### Paso 11: Testing Funcional

**Abrir navegador y verificar:**

1. **Homepage:** https://qa.laboratorio-eg.com/
   - [ ] Hero carousel se muestra correctamente
   - [ ] Navegación funciona
   - [ ] Logo aparece en header
   - [ ] Favicon aparece en pestaña

2. **Sección Nosotros:** https://qa.laboratorio-eg.com/#nosotros
   - [ ] Scroll smooth funciona
   - [ ] Contenido se muestra correctamente

3. **Sección Contacto:** https://qa.laboratorio-eg.com/#contacto
   - [ ] Formulario se muestra
   - [ ] Mapa carga (si aplica)

4. **Estudios:** https://qa.laboratorio-eg.com/estudios
   - [ ] Lista de estudios carga
   - [ ] Búsqueda funciona
   - [ ] Filtros funcionan

5. **Resultados:** https://qa.laboratorio-eg.com/resultados
   - [ ] Placeholder se muestra

6. **Responsive:**
   - [ ] Mobile (< 640px): Logo isotipo, menú hamburguesa
   - [ ] Tablet (640px - 1024px): Navegación adaptada
   - [ ] Desktop (> 1024px): Logo completo, navegación full

7. **Consola del Navegador:**
   - [ ] Sin errores en consola
   - [ ] Sin warnings críticos

---

## 🔧 Configuración del Backend (API)

**Nota:** Este deployment es del frontend. El backend debe estar ya configurado y corriendo.

**Verificar que el backend esté disponible:**
```bash
curl -I https://api-qa.laboratorio-eg.com/health
# Debe retornar 200 OK
```

**Si el backend no responde:**
- Contactar al equipo de backend
- Verificar variables de entorno `VITE_API_BASE_URL`

---

## 📊 Monitoreo Post-Deployment

### Métricas a Monitorear (Primeras 24 horas):

1. **Uptime:**
   ```bash
   # Verificar cada hora
   curl -s -o /dev/null -w "%{http_code}" https://qa.laboratorio-eg.com
   ```

2. **Performance:**
   - Usar Google Lighthouse
   - Objetivo: Performance > 90

3. **Errores:**
   ```bash
   # Monitorear logs de error
   sudo tail -f /var/log/nginx/laboratorio-eg-qa-error.log
   ```

4. **Tráfico:**
   ```bash
   # Ver requests en tiempo real
   sudo tail -f /var/log/nginx/laboratorio-eg-qa-access.log
   ```

---

## 🐛 Troubleshooting

### Problema 1: Página en blanco

**Síntomas:** La página carga pero muestra pantalla en blanco

**Solución:**
```bash
# Verificar consola del navegador para errores JS
# Verificar que los assets se cargaron correctamente
curl -I https://qa.laboratorio-eg.com/assets/index-*.js

# Verificar permisos
sudo ls -lah /var/www/laboratorio-eg-current/

# Rehacer build si es necesario
cd /var/www/laboratorio-eg
npm run build
sudo cp -r dist/* /var/www/laboratorio-eg-current/
```

### Problema 2: Error 404 en rutas

**Síntomas:** `/estudios` devuelve 404

**Solución:**
```bash
# Verificar configuración de Nginx
sudo nginx -t

# Asegurar que existe try_files $uri $uri/ /index.html;
sudo nano /etc/nginx/sites-available/laboratorio-eg-qa

# Recargar Nginx
sudo systemctl reload nginx
```

### Problema 3: Assets no cargan (404)

**Síntomas:** CSS/JS no cargan, errores 404

**Solución:**
```bash
# Verificar que los assets existen
ls -lah /var/www/laboratorio-eg-current/assets/

# Verificar permisos
sudo chown -R www-data:www-data /var/www/laboratorio-eg-current/
sudo chmod -R 755 /var/www/laboratorio-eg-current/

# Limpiar cache de navegador
# Ctrl+Shift+R en el navegador
```

### Problema 4: API no responde

**Síntomas:** Estudios no cargan, errores de red

**Solución:**
```bash
# Verificar variable de entorno
cat .env | grep VITE_API_BASE_URL

# Verificar que el backend está up
curl -I https://api-qa.laboratorio-eg.com/health

# Verificar CORS en el backend
# El backend debe permitir: https://qa.laboratorio-eg.com
```

### Problema 5: Favicon no aparece

**Síntomas:** Icono genérico en pestaña del navegador

**Solución:**
```bash
# Verificar que favicon.svg existe
curl -I https://qa.laboratorio-eg.com/favicon.svg

# Verificar index.html
curl https://qa.laboratorio-eg.com/ | grep favicon

# Limpiar cache del navegador
# El favicon puede tardar en actualizar
```

---

## 🔄 Rollback Procedure

**Si algo sale mal, seguir estos pasos para rollback:**

### Opción 1: Rollback al Backup Anterior

```bash
# Listar backups disponibles
ls -lah /var/www/ | grep laboratorio-eg-backup

# Restaurar backup más reciente
sudo rm -rf /var/www/laboratorio-eg-current
sudo cp -r /var/www/laboratorio-eg-backup-[TIMESTAMP] /var/www/laboratorio-eg-current

# Recargar Nginx
sudo systemctl reload nginx
```

### Opción 2: Rollback con Git

```bash
cd /var/www/laboratorio-eg

# Checkout del tag anterior
git checkout tags/backup-before-cleanup-20251018

# Rebuild
npm install
npm run build

# Deploy
sudo rm -rf /var/www/laboratorio-eg-current
sudo cp -r dist /var/www/laboratorio-eg-current
sudo chown -R www-data:www-data /var/www/laboratorio-eg-current

# Recargar Nginx
sudo systemctl reload nginx
```

---

## 📞 Contactos de Emergencia

**Desarrollo:**
- Email: saqh5037@[dominio]
- Slack: @saqh5037

**DevOps Lead:**
- [Agregar contacto]

**QA Lead:**
- [Agregar contacto]

---

## ✅ Checklist Final

Antes de marcar el deployment como completo, verificar:

- [ ] Tag `v1.1.0-qa` checked out correctamente
- [ ] Dependencias instaladas sin errores
- [ ] Variables de entorno configuradas
- [ ] Build completado exitosamente
- [ ] Backup del deployment anterior creado
- [ ] Archivos copiados a `/var/www/laboratorio-eg-current`
- [ ] Permisos configurados correctamente
- [ ] Nginx configurado y recargado
- [ ] Homepage carga correctamente
- [ ] Todas las rutas funcionan (/, /estudios, /resultados)
- [ ] Favicon aparece correctamente
- [ ] Logo aparece en Header y Footer
- [ ] Responsive funciona en mobile/tablet/desktop
- [ ] Sin errores en consola del navegador
- [ ] Sin errores en logs de Nginx
- [ ] Backend API responde correctamente
- [ ] Performance aceptable (Lighthouse > 90)
- [ ] Equipo de QA notificado
- [ ] Documentación actualizada

---

**Deployment completado:** [Fecha y hora]
**Realizado por:** [Nombre del DevOps]
**Tiempo total:** [Minutos]
**Incidencias:** [Ninguna / Describir]

---

**Preparado por:** Claude Code
**Fecha:** 18 de Octubre, 2025
**Versión:** v1.1.0-qa
