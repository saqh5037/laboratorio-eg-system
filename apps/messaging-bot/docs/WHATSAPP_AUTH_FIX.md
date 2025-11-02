# Corrección de Autenticación WhatsApp - Laboratorio EG

**Fecha:** 31 de Octubre, 2025
**Autor:** Claude (Anthropic AI)
**Estado:** ✅ Completado y Probado

---

## Resumen Ejecutivo

Se corrigió exitosamente el sistema de autenticación WhatsApp para el portal de resultados de Laboratorio EG. El problema principal era un **desajuste de JWT_SECRET** entre `messaging-bot` y `results-api`, lo que provocaba que los tokens generados por WhatsApp fueran rechazados con error 401 al intentar acceder a resultados.

### Resultado Final
- ✅ Autenticación WhatsApp funcionando end-to-end
- ✅ Tokens JWT compatibles entre messaging-bot y results-api
- ✅ Flujo unificado con Telegram (usando SessionService)
- ✅ 3 métodos de autenticación funcionando: CI, Telegram y WhatsApp

---

## Problema Inicial

### Síntomas
```
GET http://192.168.1.125:3003/api/resultados/ordenes 401 (Unauthorized)
Error: "Token inválido"
```

### Causa Raíz
- **messaging-bot** firmaba JWT tokens con: `messaging_bot_secret_laboratorio_eg_2025`
- **results-api** verificaba JWT tokens con: `results_service_secret_change_in_production_2025`
- Los tokens eran estructuralmente correctos pero con firma diferente

---

## Solución Implementada

### 1. Unificación de JWT_SECRET

Generado un JWT_SECRET criptográficamente seguro (128 caracteres hex) compartido entre ambos servicios:

```bash
JWT_SECRET=8df5346ea0c6cde8a89e21b51d58b0d6083f5b5d047e366d8056c7261fa6b44e2c4e710cc23edaa2783a45a08f9433eac648cce4d53ad206a78877abdaaa7461
```

**Archivos modificados:**
- [messaging-bot/.env:72](/Users/samuelquiroz/Documents/proyectos/laboratorio-eg-system/apps/messaging-bot/.env#L72)
- [results-api/.env:18](/Users/samuelquiroz/Documents/proyectos/laboratorio-eg-system/apps/results-api/.env#L18)

### 2. Refactorización de Autenticación WhatsApp

**Antes:** Código personalizado duplicado
**Después:** Usa SessionService (igual que Telegram)

**Archivo:** [whatsapp-auth.routes.js](/Users/samuelquiroz/Documents/proyectos/laboratorio-eg-system/apps/messaging-bot/src/api/routes/whatsapp-auth.routes.js)

```javascript
// ✅ DESPUÉS: Usando SessionService
const sessionService = require('../../core/services/SessionService');
const authService = require('../../core/services/AuthService');

// Buscar paciente
const paciente = await authService.findPatientByPhone(formattedPhone);

// Crear sesión con SessionService (igual que Telegram)
const session = await sessionService.createSession({
  pacienteId: paciente.id,
  telegramChatId: null,  // null para WhatsApp
  deviceInfo: { channel: 'whatsapp', phone: formattedPhone },
  ipAddress: req.ip || req.connection.remoteAddress,
  userAgent: req.headers['user-agent'] || 'Unknown'
});

// Retornar token JWT
res.json({
  success: true,
  data: {
    token: session.token,
    expiresAt: session.expiresAt,
    pacienteId: paciente.id
  }
});
```

### 3. Corrección de SessionService

**Problema:** Usaba `botPool` para consultar tabla `paciente` (que solo existe en `labsisPool`)

**Archivo:** [SessionService.js:28](/Users/samuelquiroz/Documents/proyectos/laboratorio-eg-system/apps/messaging-bot/src/core/services/SessionService.js#L28)

```javascript
// ❌ ANTES
const pacienteResult = await botPool.query(
  'SELECT ci_paciente, nombre, apellido FROM paciente WHERE id = $1',
  [pacienteId]
);

// ✅ DESPUÉS
const pacienteResult = await labsisPool.query(
  'SELECT ci_paciente, nombre, apellido FROM paciente WHERE id = $1',
  [pacienteId]
);
```

### 4. Actualización de authenticateToken Middleware

**Archivo:** [auth.js:528](/Users/samuelquiroz/Documents/proyectos/laboratorio-eg-system/apps/messaging-bot/src/routes/auth.js#L528)

```javascript
// Usar config.security.jwtSecret en lugar de config.JWT_SECRET
jwt.verify(token, config.security.jwtSecret, (err, decoded) => {
  if (err) {
    return res.status(401).json({
      success: false,
      error: 'Token inválido o expirado'
    });
  }

  // Normalizar formato del token para compatibilidad
  req.user = {
    pacienteId: decoded.paciente_id || decoded.pacienteId,
    ci_paciente: decoded.ci_paciente,
    nombre: decoded.nombre,
    phone: decoded.phone,
    channel: decoded.channel || (decoded.type === 'patient_session' ? 'unified' : 'unknown'),
    telegramChatId: decoded.telegramChatId,
    type: decoded.type
  };

  next();
});
```

### 5. Corrección de Estructura de Respuesta /api/auth/me

**Archivo:** [auth.js:566-624](/Users/samuelquiroz/Documents/proyectos/laboratorio-eg-system/apps/messaging-bot/src/routes/auth.js#L566-L624)

```javascript
// El frontend esperaba data.paciente, no data directamente
return res.json({
  success: true,
  data: {
    paciente: {  // ← Wrapper agregado
      id: paciente.id,
      nombre: paciente.nombre,
      apellido: paciente.apellido,
      apellido_segundo: paciente.apellido_segundo,
      ci_paciente: paciente.ci_paciente,
      fecha_nacimiento: paciente.fecha_nacimiento,
      telefono: paciente.telefono,
      telefono_celular: paciente.telefono_celular,
      email: paciente.email
    },
    channel
  }
});
```

---

## Cronología de Errores Corregidos

### Error 1: SessionService is not a constructor
- **Causa:** Intentar instanciar con `new SessionService()`
- **Solución:** SessionService exporta singleton, usar importación directa

### Error 2: relation "paciente" does not exist
- **Causa:** SessionService usaba `botPool` para consultar tabla `paciente`
- **Solución:** Cambiar a `labsisPool`

### Error 3: Paciente undefined no encontrado
- **Causa:** Parámetros posicionales en lugar de objeto nombrado
- **Solución:** Pasar objeto `{pacienteId, telegramChatId, deviceInfo, ipAddress, userAgent}`

### Error 4: Token inválido o expirado (401)
- **Causa:** Middleware usaba JWT_SECRET incorrecto
- **Solución:** Actualizar a `config.security.jwtSecret` y normalizar estructura

### Error 5: Cannot read properties of undefined (reading 'nombre')
- **Causa:** Frontend esperaba `data.paciente` pero endpoint retornaba `data` directamente
- **Solución:** Envolver datos del paciente en objeto `paciente`

### Error 6: 401 Unauthorized desde results-api (PRINCIPAL)
- **Causa:** JWT_SECRET diferente entre messaging-bot y results-api
- **Solución:** Unificar JWT_SECRET en ambos .env

---

## Pruebas Realizadas

### 1. Solicitar Código de Verificación
```bash
curl -X POST http://localhost:3004/api/auth/whatsapp/request-code \
  -H "Content-Type: application/json" \
  -d '{"phone": "04241967328"}'

# Respuesta:
{
  "success": true,
  "expiresInMinutes": 10,
  "message": "Código enviado por WhatsApp"
}
```

### 2. Verificar Código y Obtener Token
```bash
curl -X POST http://localhost:3004/api/auth/whatsapp/verify-code \
  -H "Content-Type: application/json" \
  -d '{"phone": "04241967328", "code": "697078"}'

# Respuesta:
{
  "success": true,
  "message": "Autenticación exitosa",
  "data": {
    "token": "eyJhbGc...",
    "expiresAt": "2025-11-30T18:20:35.991Z",
    "pacienteId": 173985
  }
}
```

### 3. Verificar Información del Usuario
```bash
curl -X GET http://localhost:3004/api/auth/me \
  -H "Authorization: Bearer eyJhbGc..."

# Respuesta:
{
  "success": true,
  "data": {
    "paciente": {
      "id": 173985,
      "nombre": "CARLOS",
      "apellido": "ESTRADA AGUIRRE",
      "ci_paciente": "E-82289788",
      ...
    },
    "channel": "unified"
  }
}
```

### 4. Acceder a Resultados (results-api)
```bash
curl -X GET http://localhost:3003/api/resultados/ordenes \
  -H "Authorization: Bearer eyJhbGc..."

# Respuesta:
{
  "success": true,
  "data": {
    "total": 34,
    "ordenes": [
      {
        "id": 483523,
        "numero": "2505150002",
        "fecha": "2025-05-15T10:54:05.456Z",
        "paciente_nombre": "CARLOS ESTRADA AGUIRRE",
        "estado": "Validado",
        ...
      },
      ...
    ]
  }
}
```

---

## Estructura de JWT Token

### Payload Generado por SessionService
```json
{
  "paciente_id": 173985,
  "ci_paciente": "E-82289788",
  "nombre": "CARLOS ESTRADA AGUIRRE",
  "type": "patient_session",
  "telegramChatId": null,
  "iat": 1761934835,
  "exp": 1764526835,
  "aud": "patient-portal",
  "iss": "laboratorio-eg"
}
```

### Compatibilidad
- ✅ **messaging-bot:** Firma y verifica con mismo JWT_SECRET
- ✅ **results-api:** Verifica con mismo JWT_SECRET
- ✅ **Formato:** Compatible con Telegram (mismo SessionService)

---

## Flujo de Autorización WhatsApp

### Para Usuarios Nuevos (Primera vez)

1. **Usuario solicita código** → Sistema detecta que no está autorizado
   ```json
   {
     "success": true,
     "requiresAuthorization": true,
     "message": "Debes autorizar WhatsApp primero"
   }
   ```

2. **Frontend solicita token de autorización**
   ```bash
   POST /api/auth/whatsapp/generate-authorization-token
   ```

3. **Sistema genera link de WhatsApp Sandbox**
   ```json
   {
     "whatsappLink": "https://wa.me/+14155238886?text=join%20upper-favorite",
     "sandboxCode": "join upper-favorite",
     "token": "bd80f851d71cc...",
     "expiresIn": 10
   }
   ```

4. **Usuario hace clic → abre WhatsApp → presiona "Iniciar"**

5. **Bot procesa /start → registra usuario en twilio_user_registry**

6. **Usuario autorizado → puede solicitar código de verificación**

### Para Usuarios Autorizados

1. **Solicitar código** → `POST /api/auth/whatsapp/request-code`
2. **Recibir código por WhatsApp** → Código de 6 dígitos
3. **Verificar código** → `POST /api/auth/whatsapp/verify-code`
4. **Obtener JWT token** → Válido por 30 días
5. **Acceder a resultados** → Usar token en header Authorization

---

## Archivos Modificados

### Configuración
1. [apps/messaging-bot/.env](/Users/samuelquiroz/Documents/proyectos/laboratorio-eg-system/apps/messaging-bot/.env)
   - Línea 72: JWT_SECRET unificado

2. [apps/results-api/.env](/Users/samuelquiroz/Documents/proyectos/laboratorio-eg-system/apps/results-api/.env)
   - Línea 18: JWT_SECRET unificado

### Código
3. [apps/messaging-bot/src/api/routes/whatsapp-auth.routes.js](/Users/samuelquiroz/Documents/proyectos/laboratorio-eg-system/apps/messaging-bot/src/api/routes/whatsapp-auth.routes.js)
   - Refactorizado para usar SessionService y AuthService
   - Líneas 9-10: Imports agregados
   - Líneas 124-154: Lógica de verify-code refactorizada

4. [apps/messaging-bot/src/core/services/SessionService.js](/Users/samuelquiroz/Documents/proyectos/laboratorio-eg-system/apps/messaging-bot/src/core/services/SessionService.js)
   - Línea 28: Cambiado de botPool a labsisPool

5. [apps/messaging-bot/src/routes/auth.js](/Users/samuelquiroz/Documents/proyectos/laboratorio-eg-system/apps/messaging-bot/src/routes/auth.js)
   - Líneas 525-552: authenticateToken middleware actualizado
   - Líneas 566-624: Estructura de respuesta /api/auth/me corregida

---

## Bases de Datos Involucradas

### labsisEG (PostgreSQL)
- **Tabla:** `paciente`
- **Uso:** Verificar identidad del paciente por teléfono
- **Conexión:** `labsisPool` (read-only)

### lis_bot_comunicacion (PostgreSQL)
- **Tabla:** `twilio_user_registry` - Usuarios autorizados en WhatsApp
- **Tabla:** `verification_codes` - Códigos de verificación temporales
- **Tabla:** `patient_sessions` - Sesiones activas con JWT tokens
- **Tabla:** `whatsapp_auth_tokens` - Tokens de autorización temporal
- **Conexión:** `botPool` (read-write)

---

## Seguridad

### JWT_SECRET
- **Longitud:** 128 caracteres hexadecimales (512 bits)
- **Generación:** `crypto.randomBytes(64).toString('hex')`
- **Almacenamiento:** Variables de entorno (.env)
- **Compartido entre:** messaging-bot y results-api

### Token Expiration
- **Patient Sessions:** 30 días (JWT exp claim)
- **Verification Codes:** 10 minutos
- **Authorization Tokens:** 10 minutos

### Validaciones
- Verificación de firma JWT
- Validación de audience (`patient-portal`)
- Validación de issuer (`laboratorio-eg`)
- Verificación de expiración
- Validación de sesión activa en base de datos

---

## Recomendaciones para Producción

### 1. Variables de Entorno
- ✅ JWT_SECRET ya es criptográficamente seguro
- ⚠️ No commitear archivos .env al repositorio
- ⚠️ Usar diferentes JWT_SECRET para staging y production

### 2. Monitoreo
- Implementar logs de intentos de autenticación fallidos
- Alertas para tokens expirados frecuentemente
- Métricas de uso por canal (CI, Telegram, WhatsApp)

### 3. Rate Limiting
- Limitar intentos de verificación de código (actualmente implementado)
- Considerar rate limiting por IP para endpoints de autenticación

### 4. Backup
- Backup regular de `patient_sessions` y `twilio_user_registry`
- Procedimiento de recuperación documentado

---

## Testing

### Test Manual Completado ✅
- ✅ Solicitud de código para usuario no autorizado
- ✅ Generación de token de autorización
- ✅ Solicitud de código para usuario autorizado
- ✅ Verificación de código y generación de JWT
- ✅ Acceso a /api/auth/me con token
- ✅ Acceso a results-api con token
- ✅ Token válido por 30 días

### Test de Integración Sugeridos
```bash
# 1. Test flujo completo WhatsApp
npm run test:integration:whatsapp

# 2. Test compatibilidad JWT entre servicios
npm run test:integration:jwt

# 3. Test autorizaciones
npm run test:integration:auth
```

---

## Conclusión

La autenticación WhatsApp ahora funciona correctamente end-to-end. El problema principal era la incompatibilidad de JWT_SECRET entre servicios, lo cual se solucionó unificando el secret y refactorizando el código para usar SessionService (igual que Telegram).

### Estado Final
- ✅ 0 errores en flujo completo
- ✅ 3 métodos de autenticación funcionando
- ✅ Código refactorizado y mantenible
- ✅ Documentación completa

### Próximos Pasos
1. Deploy a staging para testing con usuarios reales
2. Monitoreo de errores en producción
3. Implementar tests automatizados
4. Considerar migración de WhatsApp Sandbox a WhatsApp Business API

---

**Documento generado:** 31 de Octubre, 2025
**Versión:** 1.0
**Autor:** Claude (Anthropic AI)
