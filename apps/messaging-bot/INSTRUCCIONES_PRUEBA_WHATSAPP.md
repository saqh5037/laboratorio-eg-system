# 📱 Instrucciones para Probar Autenticación WhatsApp

**Fecha:** 1 de Noviembre, 2025
**Estado:** ✅ LISTO PARA PROBAR

---

## ✅ Pre-requisitos Completados

- ✅ Servicio corriendo en `http://localhost:3004`
- ✅ Template de verificación configurado
- ✅ Número autorizado en sandbox: `+5215516867745`
- ✅ Código actualizado con template correcto

---

## 🧪 Prueba Rápida (Comando cURL)

### Paso 1: Solicitar Código

```bash
curl -X POST http://localhost:3004/api/auth/whatsapp/request-code \
  -H "Content-Type: application/json" \
  -d '{"phone": "5516867745"}'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "expiresInMinutes": 10,
  "message": "Código enviado por WhatsApp"
}
```

**Deberías recibir en WhatsApp:**
- Solo el código de 6 dígitos (ej: `432939`)
- Con botón "Copy Code"

### Paso 2: Verificar Código

```bash
curl -X POST http://localhost:3004/api/auth/whatsapp/verify-code \
  -H "Content-Type: application/json" \
  -d '{"phone": "5516867745", "code": "432939"}'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Autenticación exitosa",
  "data": {
    "token": "eyJhbGciOiJIUzI1...",
    "expiresAt": "2025-12-01T18:45:06.000Z",
    "pacienteId": 173985
  }
}
```

### Paso 3: Verificar Token (Opcional)

```bash
TOKEN="<el-token-que-obtuviste>"

curl -X GET http://localhost:3004/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🌐 Prueba desde el Frontend

### URLs del Sistema

- **Frontend:** http://192.168.1.125:5173
- **Messaging Bot API:** http://localhost:3004
- **Results API:** http://localhost:3003

### Flujo de Autenticación

1. **Usuario abre el frontend**
2. **Selecciona "Ingresar con WhatsApp"**
3. **Ingresa su número de teléfono:** `5516867745` (sin código de país)
4. **Sistema envía código** → Usuario recibe en WhatsApp
5. **Usuario ingresa código:** `432939`
6. **Sistema verifica** → Usuario autenticado ✅

---

## 🔍 Verificación de Logs

### Ver logs en tiempo real

```bash
# Desde la raíz del proyecto
cd /Users/samuelquiroz/Documents/proyectos/laboratorio-eg-system

# Ver logs del messaging-bot
npm run dev
```

### Buscar en logs

```bash
# Buscar envíos de código
grep "código de verificación" apps/messaging-bot/logs/combined.log

# Buscar envíos exitosos
grep "✅ WhatsApp Template enviado" apps/messaging-bot/logs/combined.log

# Buscar errores
grep "ERROR" apps/messaging-bot/logs/combined.log
```

---

## 📊 Endpoints Disponibles

### 1. POST /api/auth/whatsapp/request-code

Solicita un código de verificación.

**Body:**
```json
{
  "phone": "5516867745"
}
```

**Respuesta (éxito):**
```json
{
  "success": true,
  "expiresInMinutes": 10,
  "message": "Código enviado por WhatsApp"
}
```

**Respuesta (no autorizado - primera vez):**
```json
{
  "success": true,
  "requiresAuthorization": true,
  "message": "Debes autorizar WhatsApp primero"
}
```

---

### 2. POST /api/auth/whatsapp/verify-code

Verifica el código y retorna JWT token.

**Body:**
```json
{
  "phone": "5516867745",
  "code": "432939"
}
```

**Respuesta (éxito):**
```json
{
  "success": true,
  "message": "Autenticación exitosa",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresAt": "2025-12-01T18:45:06.000Z",
    "pacienteId": 173985
  }
}
```

**Respuesta (código inválido):**
```json
{
  "success": false,
  "error": "Código inválido o expirado"
}
```

---

### 3. GET /api/auth/me

Obtiene información del usuario autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "paciente": {
      "id": 173985,
      "nombre": "CARLOS",
      "apellido": "ESTRADA AGUIRRE",
      "ci_paciente": "E-82289788",
      "telefono_celular": "04241967328",
      "email": null
    },
    "channel": "unified"
  }
}
```

---

### 4. POST /api/auth/whatsapp/generate-authorization-token

Genera token para autorizar usuario nuevo en sandbox.

**Body:**
```json
{
  "pacienteId": 173985,
  "phone": "5516867745"
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "whatsappLink": "https://wa.me/+14155238886?text=join%20upper-favorite",
    "sandboxCode": "join upper-favorite",
    "token": "abc123...",
    "expiresIn": 10
  }
}
```

---

## ⚠️ Problemas Comunes

### Código no llega

**Verificar:**
1. Usuario está en el sandbox (envió "join upper-favorite")
2. Logs muestran "✅ WhatsApp Template enviado exitosamente"
3. Template SID correcto en `.env`: `HXe0a71a0bec4b90f76a2085a5fcc1a831`

**Solución:**
- Revisar logs del messaging-bot
- Verificar estado del mensaje en Twilio Console

---

### Error "requiresAuthorization: true"

**Causa:** Usuario nunca se ha registrado en el sandbox

**Solución:**
1. Usuario envía a `+1 415 523 8886`: `join upper-favorite`
2. Espera confirmación
3. Reintenta solicitar código

---

### Error "Código inválido o expirado"

**Causas:**
- Código incorrecto
- Código expiró (>10 minutos)
- Ya fue usado

**Solución:**
- Solicitar nuevo código
- Verificar que se ingresa correctamente

---

## 🎯 Test Completo

```bash
#!/bin/bash

echo "🧪 Test de Autenticación WhatsApp"
echo "================================="

# Paso 1: Solicitar código
echo "1. Solicitando código..."
RESPONSE=$(curl -s -X POST http://localhost:3004/api/auth/whatsapp/request-code \
  -H "Content-Type: application/json" \
  -d '{"phone": "5516867745"}')

echo "Respuesta: $RESPONSE"
echo ""

# Esperar a que llegue el código
echo "2. Esperando código por WhatsApp..."
echo "   Ingresa el código que recibiste:"
read CODE

# Paso 2: Verificar código
echo "3. Verificando código $CODE..."
TOKEN_RESPONSE=$(curl -s -X POST http://localhost:3004/api/auth/whatsapp/verify-code \
  -H "Content-Type: application/json" \
  -d "{\"phone\": \"5516867745\", \"code\": \"$CODE\"}")

echo "Respuesta: $TOKEN_RESPONSE"

# Extraer token
TOKEN=$(echo $TOKEN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Error: No se pudo obtener el token"
  exit 1
fi

echo ""
echo "✅ Token obtenido: ${TOKEN:0:50}..."

# Paso 3: Verificar información de usuario
echo ""
echo "4. Verificando información de usuario..."
USER_INFO=$(curl -s -X GET http://localhost:3004/api/auth/me \
  -H "Authorization: Bearer $TOKEN")

echo "Información del usuario:"
echo "$USER_INFO" | python3 -m json.tool

echo ""
echo "✅ Test completado exitosamente!"
```

---

## 📝 Notas Importantes

### Formato del Mensaje

El código llega **solo con el número** (sin texto adicional):
```
432939
```

Con botón WhatsApp "Copy Code" para copiar fácilmente.

### Expiración

- **Código:** 10 minutos
- **Token JWT:** 30 días

### Límites del Sandbox

- Solo usuarios que enviaron "join upper-favorite"
- Rate limiting: 1 mensaje/segundo
- Máximo 50-100 usuarios simultáneos

---

## 🚀 Siguiente Paso: Probar desde Frontend

Una vez que confirmes que funciona con cURL, puedes probarlo desde el frontend:

1. Abre: http://192.168.1.125:5173
2. Click en "Ingresar con WhatsApp"
3. Ingresa: `5516867745`
4. Espera el código en WhatsApp
5. Ingresa el código recibido
6. ¡Deberías estar autenticado!

---

**Última actualización:** 1 de Noviembre, 2025
**Código actual en DB:** `432939` (expira en 10 minutos desde las 18:45)
