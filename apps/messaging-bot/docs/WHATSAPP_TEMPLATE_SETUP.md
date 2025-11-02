# Configuración de Plantilla WhatsApp para Códigos de Verificación

**Fecha:** 1 de Noviembre, 2025
**Problema:** Error 63016 - WhatsApp requiere plantillas aprobadas para mensajes fuera de ventana de 24h
**Estado:** ⚠️ Pendiente de configuración en Twilio Console

---

## Problema

Desde abril de 2025, WhatsApp cambió sus políticas y requiere usar **plantillas pre-aprobadas** para mensajes iniciados por el negocio fuera de la ventana de conversación de 24 horas.

### Error Original
```
Error 63016: Failed to send freeform message because you are outside the allowed window.
If you are using WhatsApp, please use a Message Template.
```

---

## Solución Implementada

El código ahora soporta **fallback automático a plantillas**:

1. **Primero intenta:** Envío directo (`body` text) - funciona si hay conversación activa
2. **Si falla con 63016:** Automáticamente usa Content Template

---

## Pasos para Configurar Plantilla en Twilio

### Paso 1: Crear Content Template

1. **Ir a Twilio Console:**
   ```
   https://console.twilio.com/us1/develop/sms/content-editor
   ```

2. **Click en "Create new Content"**

3. **Configurar la plantilla:**

   ```
   Display Name: Laboratorio EG - Código de Verificación
   Content SID: (se genera automáticamente, ejemplo: HXa1b2c3d4e5...)

   Language: Spanish (es)
   Category: AUTHENTICATION

   Message Type: Text

   Content:
   🔬 *Laboratorio Elizabeth Gutiérrez*

   Tu código de verificación es:

   *{{1}}*

   Este código expira en 10 minutos.

   No compartas este código con nadie.
   ```

4. **Variables de la plantilla:**
   - `{{1}}` = Código de 6 dígitos (ejemplo: 123456)

5. **Submit for Approval**
   - Meta/WhatsApp debe aprobar la plantilla
   - Tiempo de aprobación: minutos a 24 horas

---

### Paso 2: Obtener el Content SID

Una vez aprobada la plantilla:

1. Ve a la plantilla en Twilio Console
2. Copia el **Content SID** (comienza con `HX...`)
3. Ejemplo: `HXa1b2c3d4e5f6g7h8i9j0k1l2m3n4o5`

---

### Paso 3: Configurar el Content SID en el Proyecto

Edita el archivo `.env` del messaging-bot:

```bash
# apps/messaging-bot/.env

# WhatsApp Content Template
TWILIO_WHATSAPP_VERIFICATION_TEMPLATE_SID=HXa1b2c3d4e5f6g7h8i9j0k1l2m3n4o5
```

⚠️ **Importante:** Reemplaza `HXa1b2c3d4e5...` con el SID real de tu plantilla aprobada.

---

### Paso 4: Reiniciar el Servicio

```bash
# Reiniciar messaging-bot para cargar la nueva variable
npm run dev
```

---

## Cómo Funciona el Código

### Lógica de Fallback Automático

```javascript
// 1. Intentar envío directo primero
let result = await TwilioService.sendWhatsApp(phone, message);

// 2. Si falla con 63016, usar template
if (!result.success && result.code === 63016) {
  const templateSid = process.env.TWILIO_WHATSAPP_VERIFICATION_TEMPLATE_SID;

  result = await TwilioService.sendWhatsAppTemplate(
    phone,
    templateSid,
    { '1': code } // Variable {{1}} = código de 6 dígitos
  );
}
```

### Ventajas de esta Implementación

✅ **Funciona en ambos escenarios:**
- Si hay conversación activa (< 24h): usa mensaje directo
- Si está fuera de ventana (> 24h): usa template automáticamente

✅ **No requiere cambios en el frontend**

✅ **Degradación elegante:** Si template no está configurado, muestra error claro

---

## Testing

### Test 1: Verificar Variables de Entorno

```bash
cd apps/messaging-bot
grep TWILIO_WHATSAPP_VERIFICATION_TEMPLATE_SID .env
```

Debe mostrar el Content SID configurado (no `HX...`).

### Test 2: Solicitar Código

```bash
curl -X POST http://localhost:3004/api/auth/whatsapp/request-code \
  -H "Content-Type: application/json" \
  -d '{"phone": "+5215516867745"}'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "expiresInMinutes": 10,
  "message": "Código enviado por WhatsApp"
}
```

### Test 3: Revisar Logs

```bash
# Deberías ver en los logs:
✅ WhatsApp Template enviado exitosamente
   - SID: SMxxx...
   - Status: queued
```

---

## Troubleshooting

### Error: "Template no configurado"

**Causa:** `TWILIO_WHATSAPP_VERIFICATION_TEMPLATE_SID` no está configurado o tiene valor por defecto `HX...`

**Solución:**
1. Verificar que la plantilla esté aprobada en Twilio
2. Copiar el Content SID correcto
3. Actualizar `.env`
4. Reiniciar el servicio

### Error: "Content SID not found"

**Causa:** El Content SID es inválido o la plantilla fue eliminada

**Solución:**
1. Verificar en Twilio Console que la plantilla existe
2. Verificar que el SID sea correcto (comienza con `HX`)
3. Verificar que la plantilla esté aprobada

### Error: "Template variables mismatch"

**Causa:** Las variables enviadas no coinciden con las de la plantilla

**Solución:**
- Verificar que la plantilla use `{{1}}` como variable
- Verificar que el código se esté enviando como `{ '1': code }`

---

## Alternativas

### Opción A: Usar Telegram (Recomendado para Desarrollo)

Telegram no tiene restricciones de plantillas:

```bash
# Simplemente usar Telegram en lugar de WhatsApp
# Ya está implementado y funcionando
```

### Opción B: WhatsApp Business API (Producción)

Para producción, considera migrar a WhatsApp Business API:

1. Registrar cuenta de WhatsApp Business
2. Obtener número verificado
3. No requiere sandbox
4. Más confiable para producción

---

## Estado Actual

- ✅ Código actualizado para soportar templates
- ✅ Fallback automático implementado
- ✅ Manejo de errores mejorado
- ⚠️ **Pendiente:** Crear y aprobar template en Twilio Console
- ⚠️ **Pendiente:** Configurar Content SID en `.env`

---

## Próximos Pasos

1. **Crear template en Twilio Console** (15 minutos)
2. **Esperar aprobación de WhatsApp** (minutos a 24h)
3. **Configurar Content SID en `.env`** (1 minuto)
4. **Probar envío de código** (2 minutos)

---

**Documento creado:** 1 de Noviembre, 2025
**Autor:** Claude (Anthropic AI)
