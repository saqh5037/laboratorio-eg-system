# 🎯 Guía Paso a Paso: Configurar GitHub Secrets

## ✅ Archivos Preparados

He creado el archivo **`SECRETS-VALUES.txt`** con todos los valores que necesitas.

**Ubicación:** `/Users/samuelquiroz/Documents/proyectos/laboratorio-eg-system/SECRETS-VALUES.txt`

---

## 📝 Paso 1: Abrir GitHub Secrets

1. Ve a: https://github.com/saqh5037/laboratorio-eg-system/settings/secrets/actions

2. Deberías ver una página como esta:
   ```
   Actions secrets / New repository secret
   ```

---

## 📋 Paso 2: Agregar Cada Secret

Para **CADA** secret en el archivo `SECRETS-VALUES.txt`:

### Ejemplo con `SSH_PRIVATE_KEY`:

1. **Click** en "New repository secret" (botón verde)

2. **Name:** Escribe exactamente:
   ```
   SSH_PRIVATE_KEY
   ```

3. **Secret:** Copia TODO el contenido (incluye las líneas BEGIN/END):
   ```
   -----BEGIN RSA PRIVATE KEY-----
   MIIEpAIBAAKCAQEAwx3bNhX++/1fWVI0NJWc/xuwREHaZhljvcWSI9PtR55TdL/M
   ... (todas las líneas)
   -----END RSA PRIVATE KEY-----
   ```

4. **Click** "Add secret"

5. **Verifica** que aparezca en la lista con un ✅

---

## 📊 Lista Completa de Secrets (17 total)

### SSH & Servidores (4 secrets)
- [ ] `SSH_PRIVATE_KEY` ← ⚠️ Incluye BEGIN/END
- [ ] `SSH_USER`
- [ ] `SSH_HOST_PRODUCTION`
- [ ] `SSH_HOST_STAGING`

### Database Production (5 secrets)
- [ ] `DB_HOST_PROD`
- [ ] `DB_PORT_PROD`
- [ ] `DB_USER_PROD`
- [ ] `DB_PASSWORD_PROD`
- [ ] `DB_NAME_PROD`

### Database Staging (2 secrets)
- [ ] `DB_HOST_STAGING`
- [ ] `DB_USER_STAGING`
- [ ] `DB_PASSWORD_STAGING`

### Application (4 secrets)
- [ ] `TELEGRAM_BOT_TOKEN`
- [ ] `GEMINI_API_KEY`
- [ ] `JWT_SECRET_PRODUCTION`
- [ ] `JWT_SECRET_STAGING`

### Opcional (2 secrets)
- [ ] `SLACK_WEBHOOK_URL` (si tienes)
- [ ] `DISCORD_WEBHOOK_URL` (si tienes)

---

## ⚠️ Errores Comunes

### ❌ Error: "Invalid format"
**Causa:** No copiaste completo el valor
**Solución:** Asegúrate de copiar TODO, incluidas las líneas `-----BEGIN...-----` y `-----END...-----`

### ❌ Error: "Secret already exists"
**Causa:** Ya existe un secret con ese nombre
**Solución:**
1. Elimina el secret existente
2. Agrégalo de nuevo con el nuevo valor

### ❌ Error: Espacios extra
**Causa:** Copiaste con espacios al inicio/final
**Solución:** Copia exactamente como está en el archivo

---

## ✅ Verificación

Después de agregar todos los secrets:

1. **Cuenta:** Deberías tener al menos **15 secrets** (17 si agregaste Slack/Discord)

2. **Verifica en la lista:**
   - Todos deberían aparecer con fecha de "Updated"
   - No deberías ver ningún símbolo de error

3. **Test rápido:**
   - Ve a: https://github.com/saqh5037/laboratorio-eg-system/actions
   - Click en "01 - CI Tests"
   - Click "Run workflow"
   - Si no hay errores de "secret not found", ¡está bien! ✅

---

## 🚀 Siguiente Paso

Una vez que hayas agregado TODOS los secrets:

1. **Avísame** cuando termines
2. Continuaremos con:
   - Crear usuario readonly en la base de datos
   - Preparar el servidor AWS EC2
   - Hacer el primer deployment de prueba

---

## 📞 Ayuda Rápida

**¿No ves el botón "New repository secret"?**
→ Verifica que tienes permisos de admin en el repositorio

**¿Los secrets no aparecen después de agregarlos?**
→ Refresca la página (F5)

**¿Un secret tiene el valor incorrecto?**
→ Click en el secret → "Update" → Pega el nuevo valor

---

## ⏱️ Tiempo Estimado

- **Agregar 15-17 secrets:** ~10-15 minutos
- **Copiar/pegar cuidadosamente** es importante para evitar errores

---

**Archivo de referencia:** `SECRETS-VALUES.txt`
**URL GitHub:** https://github.com/saqh5037/laboratorio-eg-system/settings/secrets/actions

**¡Avísame cuando termines de agregar todos los secrets!** 🎯
