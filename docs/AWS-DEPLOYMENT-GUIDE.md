# Guía de Deployment a AWS - Laboratorio EG System

**Última actualización:** 2 de Noviembre, 2025
**Servidor:** AWS EC2 54.197.68.252
**Usuario:** dynamtek

---

## 📋 Información del Servidor

### Servidor de Aplicaciones (AWS EC2)
```
IP: 54.197.68.252
Puerto: 8080
URL: http://54.197.68.252:8080/labsis
SSH: ssh -i "labsisapp.pem" dynamtek@ec2-54-197-68-252.compute-1.amazonaws.com
```

**Servicios que corren:**
- Frontend PWA (Laboratorio EG)
- Results API
- Sync Service
- Messaging Bot

### Servidor de Base de Datos (AWS EC2)
```
IP: 3.91.26.178
Puerto: 5432
Host: ec2-3-91-26-178.compute-1.amazonaws.com
Usuario: labsis
Password: ,U8x=]N02SX4
Base de datos: labsisEG
```

---

## 🚀 Métodos de Deployment

Hay **2 formas** de hacer deployment a AWS:

### Opción 1: Deployment Automático (GitHub Actions) ⭐ RECOMENDADO

### Opción 2: Deployment Manual (Script)

---

## 📦 Opción 1: Deployment con GitHub Actions

### Pre-requisitos (Solo una vez)

Debes configurar los **GitHub Secrets** en tu repositorio:

1. Ve a tu repositorio en GitHub:
   ```
   https://github.com/saqh5037/laboratorio-eg-system
   ```

2. Click en **Settings** → **Secrets and variables** → **Actions**

3. Click en **New repository secret** y agrega los siguientes secrets:

   **Secret 1: `AWS_EC2_HOST`**
   ```
   Valor: 54.197.68.252
   ```

   **Secret 2: `AWS_EC2_USER`**
   ```
   Valor: dynamtek
   ```

   **Secret 3: `AWS_SSH_PRIVATE_KEY`**
   ```
   Valor: [Contenido completo del archivo labsisapp.pem]
   ```

   Para obtener el contenido de `labsisapp.pem`:
   ```bash
   cat /ruta/a/labsisapp.pem
   ```

   Copia TODO el contenido (incluye `-----BEGIN RSA PRIVATE KEY-----` y `-----END RSA PRIVATE KEY-----`)

4. Click en **Add secret**

✅ **Secrets configurados correctamente**

### Hacer Deployment

1. **Ve a GitHub Actions**:
   ```
   https://github.com/saqh5037/laboratorio-eg-system/actions
   ```

2. En el menú lateral, click en **07 - Deploy to AWS Production**

3. Click en el botón **Run workflow** (lado derecho)

4. Selecciona:
   - **Branch**: `main`
   - **Confirmation**: Escribe `DEPLOY`

5. Click en **Run workflow** (verde)

6. El deployment comenzará automáticamente

7. **Monitorea el progreso**:
   - Click en el workflow que se está ejecutando
   - Verás los pasos en tiempo real:
     - ✅ Validate confirmation
     - ✅ Deploy to AWS EC2
     - ✅ Health Check
     - ✅ Deployment Summary

8. **Verificación**:
   - Si todo está verde ✅, el deployment fue exitoso
   - Verifica en: http://54.197.68.252:8080/labsis

**Tiempo total**: ~5-10 minutos

---

## 🛠️ Opción 2: Deployment Manual con Script

### Pre-requisitos

1. **SSH Key**: Tener el archivo `labsisapp.pem` en tu máquina

2. **Configurar variables de entorno** (opcional):
   ```bash
   export AWS_EC2_HOST=54.197.68.252
   export AWS_EC2_USER=dynamtek
   export SSH_KEY=/ruta/a/labsisapp.pem
   ```

### Ejecutar Deployment

1. **Navegar al directorio del proyecto**:
   ```bash
   cd /Users/samuelquiroz/Documents/proyectos/laboratorio-eg-system
   ```

2. **Ejecutar el script de deployment**:
   ```bash
   ./scripts/deploy-aws.sh
   ```

   O si quieres deployar otra rama:
   ```bash
   ./scripts/deploy-aws.sh develop
   ```

3. **Confirmar deployment**:
   - El script mostrará información del deployment
   - Te pedirá confirmación
   - Escribe `yes` y presiona Enter

4. **Esperar a que termine**:
   - El script hará:
     - ✅ Backup pre-deployment
     - ✅ Pull del código desde GitHub
     - ✅ Install de dependencias
     - ✅ Build del frontend
     - ✅ Restart de PM2
     - ✅ Health check

5. **Verificación**:
   - Al final verás un resumen
   - Verifica en: http://54.197.68.252:8080/labsis

**Tiempo total**: ~5-10 minutos

---

## 🔍 Verificación Post-Deployment

### 1. Verificar Frontend

Abre en el navegador:
```
http://54.197.68.252:8080/labsis
```

Verifica:
- ✅ La página carga correctamente
- ✅ Puedes hacer login
- ✅ La versión es la correcta

### 2. Verificar PM2 Services

SSH al servidor:
```bash
ssh -i labsisapp.pem dynamtek@54.197.68.252
```

Ver estado de servicios:
```bash
pm2 status
```

Debería mostrar algo como:
```
┌─────┬────────────────────┬─────────┬─────────┬───────────┬────────┐
│ id  │ name               │ status  │ restart │ uptime    │ cpu    │
├─────┼────────────────────┼─────────┼─────────┼───────────┼────────┤
│ 0   │ results-api        │ online  │ 0       │ 5m        │ 0%     │
│ 1   │ sync-service       │ online  │ 0       │ 5m        │ 0%     │
│ 2   │ messaging-bot      │ online  │ 0       │ 5m        │ 0%     │
└─────┴────────────────────┴─────────┴─────────┴───────────┴────────┘
```

Ver logs:
```bash
pm2 logs --lines 50
```

Ver logs de un servicio específico:
```bash
pm2 logs results-api --lines 50
```

### 3. Verificar Versión del Código

En el servidor:
```bash
cd ~/laboratorio-eg-system  # o ~/proyectos/laboratorio-eg-system
git log -1 --oneline
```

Compara con GitHub:
```bash
# Local
git log -1 --oneline
```

Deberían ser el mismo commit.

---

## 🐛 Troubleshooting

### Problema: "SSH connection failed"

**Causa**: No se puede conectar al servidor

**Solución**:
1. Verifica que tienes el archivo `labsisapp.pem`
2. Verifica permisos del archivo:
   ```bash
   chmod 600 /ruta/a/labsisapp.pem
   ```
3. Verifica conectividad:
   ```bash
   ping 54.197.68.252
   ```
4. Intenta SSH manual:
   ```bash
   ssh -i labsisapp.pem dynamtek@54.197.68.252
   ```

### Problema: "Project directory not found"

**Causa**: El directorio del proyecto no está en la ubicación esperada

**Solución**:
1. SSH al servidor:
   ```bash
   ssh -i labsisapp.pem dynamtek@54.197.68.252
   ```
2. Busca el directorio:
   ```bash
   find ~ -name "laboratorio-eg-system" -type d
   ```
3. Actualiza el script con la ruta correcta

### Problema: "PM2 services not starting"

**Causa**: PM2 no puede iniciar los servicios

**Solución**:
1. SSH al servidor
2. Ver logs de PM2:
   ```bash
   pm2 logs --lines 100
   ```
3. Ver qué proceso está fallando
4. Reiniciar manualmente:
   ```bash
   pm2 delete all
   pm2 start ecosystem.config.js
   ```

### Problema: "Health check failed"

**Causa**: El servidor no responde en el puerto esperado

**Solución**:
1. SSH al servidor
2. Verificar qué puertos están escuchando:
   ```bash
   sudo netstat -tlnp | grep LISTEN
   ```
3. Verificar Nginx (si aplica):
   ```bash
   sudo systemctl status nginx
   sudo nginx -t
   ```
4. Verificar logs:
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

### Problema: "Build failed"

**Causa**: Errores durante el build del frontend

**Solución**:
1. SSH al servidor
2. Navegar al proyecto
3. Build manual:
   ```bash
   cd apps/web
   npm install
   npm run build
   ```
4. Ver errores específicos y corregir

---

## 🔄 Rollback (Revertir Deployment)

Si hay problemas después del deployment, puedes hacer rollback:

### Método 1: Rollback Automático (Script)

El script de deployment crea un backup automático. Para revertir:

1. SSH al servidor:
   ```bash
   ssh -i labsisapp.pem dynamtek@54.197.68.252
   ```

2. Ver backups disponibles:
   ```bash
   ls -lt ~/backups/
   ```

3. Ver el commit previo:
   ```bash
   cat ~/backups/pre_deploy_commit_YYYYMMDD_HHMMSS.txt
   ```

4. Revertir a ese commit:
   ```bash
   cd ~/laboratorio-eg-system
   git checkout <commit-hash>
   npm install
   cd apps/web && npm install && npm run build && cd ../..
   pm2 restart all
   ```

### Método 2: Rollback Manual

Si conoces el tag o commit de la versión anterior:

1. SSH al servidor:
   ```bash
   ssh -i labsisapp.pem dynamtek@54.197.68.252
   ```

2. Checkout de la versión anterior:
   ```bash
   cd ~/laboratorio-eg-system
   git checkout v2.5.0  # o el tag anterior
   npm install
   cd apps/web && npm install && npm run build && cd ../..
   pm2 restart all
   ```

3. Verificar:
   ```bash
   pm2 status
   pm2 logs --lines 50
   ```

**Tiempo de rollback**: ~5 minutos

---

## 📊 Logs y Monitoreo

### Ver logs de PM2

```bash
# Todos los servicios
pm2 logs

# Servicio específico
pm2 logs results-api
pm2 logs sync-service
pm2 logs messaging-bot

# Últimas 100 líneas
pm2 logs --lines 100

# Logs sin streaming (estáticos)
pm2 logs --nostream
```

### Ver logs de Nginx (si aplica)

```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

### Monitorear recursos del servidor

```bash
# CPU y RAM
htop

# Disk usage
df -h

# PM2 monitoring dashboard
pm2 monit
```

---

## 🔐 Seguridad

### Buenas Prácticas

1. **No compartas el archivo `labsisapp.pem`**
   - Mantenlo seguro
   - No lo subas a GitHub
   - No lo compartas por email

2. **Usa GitHub Secrets** para el workflow
   - Los secrets están encriptados
   - Solo los workflows pueden accederlos
   - Nunca se muestran en logs

3. **SSH Key Permissions**
   ```bash
   chmod 600 labsisapp.pem
   ```

4. **Passwords en .env**
   - No subas archivos `.env` a GitHub
   - Usa variables de entorno en el servidor

---

## 📝 Checklist de Deployment

Antes de hacer deployment:

- [ ] Código probado localmente
- [ ] Commit pusheado a GitHub
- [ ] Branch `main` actualizada
- [ ] Tests pasando (si aplica)
- [ ] Backup de base de datos (si hay cambios en DB)

Durante deployment:

- [ ] Confirmar deployment con "DEPLOY" o "yes"
- [ ] Monitorear logs del workflow o script
- [ ] Verificar que no hay errores

Después de deployment:

- [ ] Verificar frontend: http://54.197.68.252:8080/labsis
- [ ] Verificar PM2 services en el servidor
- [ ] Probar funcionalidad crítica
- [ ] Monitorear logs por 10-15 minutos
- [ ] Notificar al equipo si aplica

---

## 🎯 Workflow Completo

```
┌─────────────────────────────────────────────────────────────┐
│  LOCAL DEVELOPMENT                                          │
│  1. git add .                                               │
│  2. git commit -m "feat: nueva funcionalidad"               │
│  3. git push origin main                                    │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  GITHUB                                                     │
│  - Código en rama main                                      │
│  - CI Tests pasan (opcional)                                │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  DEPLOYMENT (Elige uno)                                     │
│  • GitHub Actions: "Run workflow" → Type "DEPLOY"           │
│  • Manual: ./scripts/deploy-aws.sh → Type "yes"            │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  AWS EC2 SERVER (54.197.68.252)                            │
│  1. Pull código desde GitHub                                │
│  2. npm install                                             │
│  3. npm run build (frontend)                                │
│  4. pm2 restart all                                         │
│  5. Health check                                            │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  VERIFICATION                                               │
│  - Frontend: http://54.197.68.252:8080/labsis              │
│  - PM2 status: ssh + pm2 status                             │
│  - Logs: pm2 logs                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔗 Enlaces Útiles

- **Repositorio GitHub**: https://github.com/saqh5037/laboratorio-eg-system
- **GitHub Actions**: https://github.com/saqh5037/laboratorio-eg-system/actions
- **Frontend Producción**: http://54.197.68.252:8080/labsis
- **PM2 Documentation**: https://pm2.keymetrics.io/docs/usage/quick-start/

---

## 📞 Soporte

En caso de problemas durante el deployment:

1. Revisa esta guía (sección Troubleshooting)
2. Revisa logs de PM2 en el servidor
3. Revisa logs del workflow en GitHub Actions
4. Si el problema persiste, haz rollback

---

**¡Deployment exitoso!** 🎉
