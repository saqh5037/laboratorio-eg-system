# 🚀 Configuración del Servidor AWS - Instrucciones Rápidas

## 📋 Paso 1: Conectar al Servidor

Copia y pega este comando en una **NUEVA TERMINAL**:

```bash
ssh -i ~/Desktop/certificados/labsisapp.pem dynamtek@ec2-54-197-68-252.compute-1.amazonaws.com
```

**Deberías ver:**
```
Welcome to Ubuntu...
dynamtek@ip-172-31-xx-xx:~$
```

✅ **¡Estás conectado!**

---

## 📦 Paso 2: Ejecutar Setup Automático

Una vez conectado al servidor, copia y pega este comando:

```bash
curl -o setup.sh https://raw.githubusercontent.com/saqh5037/laboratorio-eg-system/main/scripts/setup-aws-server.sh && chmod +x setup.sh && ./setup.sh
```

Este comando hace 3 cosas:
1. Descarga el script de setup
2. Le da permisos de ejecución
3. Lo ejecuta

**⏱️ Tiempo estimado: 30-40 minutos**

---

## 🔑 Paso 3: Configurar SSH Key (IMPORTANTE)

En algún momento durante la ejecución, verás:

```
📋 Add this public key to GitHub:
   https://github.com/settings/keys

PUBLIC KEY:
==========================================
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAA... (una línea larga)
==========================================

Press ENTER when you've added the key to GitHub...
```

**Qué hacer:**

### 3.1. Copiar la clave pública
- Selecciona TODA la línea que empieza con `ssh-ed25519`
- Copia al portapapeles (Cmd+C)

### 3.2. Agregar a GitHub
1. Ve a: https://github.com/settings/keys
2. Click en **"New SSH key"** (botón verde)
3. **Title:** Escribe: `AWS EC2 - Laboratorio EG`
4. **Key:** Pega la clave que copiaste
5. Click **"Add SSH key"**

### 3.3. Confirmar en el servidor
- Vuelve a la terminal del servidor
- Presiona **ENTER**
- El script verificará la conexión con GitHub

---

## ✅ Paso 4: Verificar Instalación

Al terminar, el script mostrará:

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

**Verifica manualmente ejecutando:**

```bash
# Check Node.js
node --version
# Debe mostrar: v18.x.x

# Check PM2
pm2 --version
# Debe mostrar un número

# Check directorios
ls -la ~/
# Debes ver: apps/  backups/  logs/

# Check Nginx
sudo systemctl status nginx
# Debe mostrar: active (running)
```

---

## 🎯 Si Todo Está OK

Una vez que veas todo funcionando:

```bash
# Puedes cerrar la conexión SSH
exit
```

---

## 🔜 Siguiente Paso

Después de configurar el servidor, el siguiente paso es:

### **Crear rama develop y hacer test deployment**

Avísame cuando termines el setup del servidor y continuamos! 🚀

---

## 🆘 Si Algo Sale Mal

### Error: "Permission denied"
```bash
# Verifica permisos del archivo .pem
chmod 400 ~/Desktop/certificados/labsisapp.pem
```

### Error: "Node command not found"
```bash
# Recarga el shell
source ~/.bashrc

# O cierra y abre nueva conexión SSH
```

### Error: Script no se descarga
```bash
# Verifica conexión a internet
ping -c 3 github.com

# Intenta descargar manualmente
wget https://raw.githubusercontent.com/saqh5037/laboratorio-eg-system/main/scripts/setup-aws-server.sh -O setup.sh
```

---

## 📞 Necesitas Ayuda?

**Copia el error completo y avísame!**

Estoy aquí para ayudarte 👋
