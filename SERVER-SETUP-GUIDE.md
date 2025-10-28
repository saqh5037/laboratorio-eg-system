# 🖥️ Guía de Configuración del Servidor AWS EC2

## 📋 Resumen

Vamos a preparar el servidor AWS EC2 para recibir deployments automáticos desde GitHub Actions.

**Servidor:** ec2-54-197-68-252.compute-1.amazonaws.com
**Usuario:** dynamtek
**Tiempo estimado:** 30-40 minutos

---

## 🚀 Paso 1: Conectar al Servidor

Abre una terminal y conéctate al servidor:

```bash
ssh -i ~/Desktop/certificados/labsisapp.pem dynamtek@ec2-54-197-68-252.compute-1.amazonaws.com
```

**Si ves un warning sobre "authenticity of host":**
- Escribe `yes` y presiona Enter

Deberías ver algo como:
```
Welcome to Ubuntu...
dynamtek@ip-172-31-xx-xx:~$
```

✅ **Estás conectado!**

---

## 📦 Paso 2: Descargar y Ejecutar Script de Setup

Copia y pega este comando completo:

```bash
curl -s https://raw.githubusercontent.com/saqh5037/laboratorio-eg-system/main/scripts/setup-aws-server.sh | bash
```

**O ejecuta paso a paso:**

```bash
# Descargar el script
curl -o setup.sh https://raw.githubusercontent.com/saqh5037/laboratorio-eg-system/main/scripts/setup-aws-server.sh

# Dar permisos de ejecución
chmod +x setup.sh

# Ejecutar
./setup.sh
```

---

## 🔑 Paso 3: Configurar SSH Key para GitHub

Durante la ejecución del script, verás un mensaje que dice:

```
📋 Add this public key to GitHub:
   https://github.com/settings/keys

PUBLIC KEY:
==========================================
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAA...
==========================================
```

**Qué hacer:**

1. **Copia** toda la línea que empieza con `ssh-ed25519`

2. **Abre** en tu navegador:
   ```
   https://github.com/settings/keys
   ```

3. **Click** en "New SSH key" (botón verde)

4. **Título:** Escribe: `AWS EC2 - Laboratorio EG Server`

5. **Key:** Pega la clave que copiaste

6. **Click** "Add SSH key"

7. **Vuelve** a la terminal y presiona **ENTER**

El script continuará y verificará la conexión con GitHub.

---

## ✅ Verificación del Setup

Al finalizar, deberías ver:

```
================================================
🎉 Server setup complete!
================================================

📋 Next steps:

1. ✅ Node.js 18 installed
2. ✅ PM2 installed and configured
3. ✅ Directories created
4. ✅ Nginx installed
5. ✅ PostgreSQL client installed

🚀 Ready for deployment!
```

**Verifica manualmente:**

```bash
# Check Node.js
node --version
# Debería mostrar: v18.x.x

# Check PM2
pm2 --version
# Debería mostrar un número de versión

# Check directorios
ls -la ~/
# Deberías ver: apps/, backups/, logs/

# Check Nginx
sudo systemctl status nginx
# Debería mostrar: active (running)
```

---

## 🔧 Configuración Adicional (Opcional)

### Configurar Nginx para tus dominios

Si tienes un dominio configurado, crea la configuración de Nginx:

```bash
sudo nano /etc/nginx/sites-available/laboratorio-eg
```

Pega esta configuración básica:

```nginx
# Frontend
server {
    listen 80;
    server_name laboratorio-eg.com www.laboratorio-eg.com;

    root /var/www/laboratorio-eg;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static assets caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Results API
server {
    listen 80;
    server_name api.laboratorio-eg.com;

    location / {
        proxy_pass http://localhost:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

**Activar configuración:**

```bash
sudo ln -s /etc/nginx/sites-available/laboratorio-eg /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Instalar SSL con Let's Encrypt (Opcional)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d laboratorio-eg.com -d www.laboratorio-eg.com
```

---

## 🐛 Troubleshooting

### "Permission denied" al conectar SSH
```bash
# Verifica permisos del archivo .pem
chmod 400 ~/Desktop/certificados/labsisapp.pem

# Intenta de nuevo
ssh -i ~/Desktop/certificados/labsisapp.pem dynamtek@ec2-54-197-68-252.compute-1.amazonaws.com
```

### "Node command not found" después de instalar
```bash
# Recarga el profile
source ~/.bashrc

# O cierra y abre nueva sesión SSH
exit
ssh -i ~/Desktop/certificados/labsisapp.pem dynamtek@ec2-54-197-68-252.compute-1.amazonaws.com
```

### PM2 no inicia automáticamente
```bash
# Ejecuta el comando de startup
pm2 startup

# Copia y ejecuta el comando que te muestra
sudo env PATH=$PATH:/home/dynamtek/.nvm/versions/node/v18.x.x/bin...
```

### Nginx no inicia
```bash
# Check logs
sudo journalctl -u nginx --no-pager | tail -20

# Test configuration
sudo nginx -t

# Restart
sudo systemctl restart nginx
```

---

## 📊 Estado Actual

Después de completar esta guía:

```
✅ GitHub Secrets configurados
✅ Usuario DB staging creado
✅ Servidor AWS preparado:
   ✓ Node.js 18 instalado
   ✓ PM2 configurado
   ✓ Directorios creados
   ✓ Nginx instalado
   ✓ SSH keys configuradas

⏭️  Siguiente: Test deployment
```

---

## 🔜 Próximo Paso

Una vez que el servidor esté configurado, el siguiente paso es:

### **Crear rama `develop` y hacer test deployment**

```bash
# En tu máquina local
cd /Users/samuelquiroz/Documents/proyectos/laboratorio-eg-system

# Crear rama develop
git checkout -b develop

# Push a GitHub
git push origin develop

# Ir a GitHub Actions y ver el deployment automático
```

---

## 📞 Necesitas Ayuda?

Si encuentras algún error:

1. **Copia el mensaje de error completo**
2. **Toma screenshot si es necesario**
3. **Avísame** y te ayudo a resolverlo

---

**Tiempo estimado total:** 30-40 minutos
**Dificultad:** Media
**Resultado:** Servidor listo para deployments automáticos! 🚀
