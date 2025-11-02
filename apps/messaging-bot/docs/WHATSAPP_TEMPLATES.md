# Plantillas de WhatsApp para Laboratorio EG

**Fecha:** 1 de Noviembre, 2025
**Propósito:** Notificaciones automáticas a pacientes vía WhatsApp
**Estado:** ⚠️ Pendiente de creación en Twilio Console

---

## Plantillas Requeridas

Se necesitan **3 plantillas** para las notificaciones del laboratorio:

1. ✅ **Código de Verificación** (AUTHENTICATION)
2. 🆕 **Orden Creada** (UTILITY)
3. 🆕 **Resultados Listos** (UTILITY)
4. 🆕 **Cancelación de Cita** (UTILITY)

---

## 1. Plantilla: Código de Verificación ✅

**Ya implementada - Ver WHATSAPP_TEMPLATE_SETUP.md**

---

## 2. Plantilla: Orden Creada 🆕

### Información de la Plantilla

```
Display Name: Laboratorio EG - Orden Creada
Language: Spanish (es)
Category: UTILITY
Message Type: Text
```

### Contenido

```
🔬 *Laboratorio Elizabeth Gutiérrez*

Estimado(a) *{{1}}*,

Se ha creado exitosamente su orden de trabajo:

📋 *Orden #{{2}}*

Podrá consultar sus resultados cuando estén listos a través de nuestro portal web.

¿Necesita ayuda? Responda a este mensaje.

_Laboratorio EG - Salud y Confianza desde 1982_
```

### Variables

- `{{1}}` = Nombre del paciente (ej: "Carlos Estrada")
- `{{2}}` = Número de orden (ej: "2505150002")

### Ejemplo Real

```
🔬 Laboratorio Elizabeth Gutiérrez

Estimado(a) Carlos Estrada,

Se ha creado exitosamente su orden de trabajo:

📋 Orden #2505150002

Podrá consultar sus resultados cuando estén listos a través de nuestro portal web.

¿Necesita ayuda? Responda a este mensaje.

Laboratorio EG - Salud y Confianza desde 1982
```

---

## 3. Plantilla: Resultados Listos 🆕

### Información de la Plantilla

```
Display Name: Laboratorio EG - Resultados Listos
Language: Spanish (es)
Category: UTILITY
Message Type: Text
```

### Contenido

```
🔬 *Laboratorio Elizabeth Gutiérrez*

¡Hola *{{1}}*! 👋

Sus resultados de la orden *#{{2}}* ya están disponibles.

🔗 *Acceda aquí:*
{{3}}

Para ver sus resultados:
1️⃣ Haga clic en el enlace
2️⃣ Ingrese su cédula: {{4}}
3️⃣ Ingrese su fecha de nacimiento

_Sus datos están protegidos y son confidenciales._

¿Preguntas? Responda este mensaje.

_Laboratorio EG - 43 años de confianza_
```

### Variables

- `{{1}}` = Nombre del paciente (ej: "Carlos Estrada")
- `{{2}}` = Número de orden (ej: "2505150002")
- `{{3}}` = URL del portal (ej: "https://resultados.laboratoriog.com")
- `{{4}}` = Cédula del paciente (ej: "E-82289788")

### Ejemplo Real

```
🔬 Laboratorio Elizabeth Gutiérrez

¡Hola Carlos Estrada! 👋

Sus resultados de la orden #2505150002 ya están disponibles.

🔗 Acceda aquí:
https://resultados.laboratoriog.com

Para ver sus resultados:
1️⃣ Haga clic en el enlace
2️⃣ Ingrese su cédula: E-82289788
3️⃣ Ingrese su fecha de nacimiento

Sus datos están protegidos y son confidenciales.

¿Preguntas? Responda este mensaje.

Laboratorio EG - 43 años de confianza
```

---

## 4. Plantilla: Cancelación de Cita 🆕

### Información de la Plantilla

```
Display Name: Laboratorio EG - Cancelación de Cita
Language: Spanish (es)
Category: UTILITY
Message Type: Text
```

### Contenido

```
🔬 *Laboratorio Elizabeth Gutiérrez*

Estimado(a) *{{1}}*,

Lamentamos informarle que su cita programada para el *{{2}}* a las *{{3}}* ha sido cancelada.

❌ *Motivo:* {{4}}

📞 *¿Desea reprogramar?*
Por favor contáctenos:
• Teléfono: (212) 123-4567
• WhatsApp: Responda este mensaje

Disculpe las molestias ocasionadas.

_Laboratorio EG - A su servicio_
```

### Variables

- `{{1}}` = Nombre del paciente (ej: "Carlos Estrada")
- `{{2}}` = Fecha de la cita (ej: "15 de Mayo de 2025")
- `{{3}}` = Hora de la cita (ej: "10:30 AM")
- `{{4}}` = Motivo de cancelación (ej: "Mantenimiento programado del equipo")

### Ejemplo Real

```
🔬 Laboratorio Elizabeth Gutiérrez

Estimado(a) Carlos Estrada,

Lamentamos informarle que su cita programada para el 15 de Mayo de 2025 a las 10:30 AM ha sido cancelada.

❌ Motivo: Mantenimiento programado del equipo

📞 ¿Desea reprogramar?
Por favor contáctenos:
• Teléfono: (212) 123-4567
• WhatsApp: Responda este mensaje

Disculpe las molestias ocasionadas.

Laboratorio EG - A su servicio
```

---

## Instrucciones de Creación en Twilio

### Para cada plantilla:

1. **Ir a Twilio Console:**
   ```
   https://console.twilio.com/us1/develop/sms/content-editor
   ```

2. **Click en "Create new Content"**

3. **Llenar el formulario:**
   - Display Name: (nombre de la plantilla)
   - Language: Spanish (es)
   - Category: UTILITY (o AUTHENTICATION para código)
   - Message Type: Text

4. **Copiar el contenido** exactamente como se muestra arriba

5. **Submit for Approval**

6. **Esperar aprobación** (minutos a 24 horas)

7. **Copiar el Content SID** (comienza con `HX...`)

---

## Configuración en .env

Una vez aprobadas todas las plantillas, agregar al archivo `.env`:

```bash
# WhatsApp Content Templates
TWILIO_WHATSAPP_VERIFICATION_TEMPLATE_SID=HXxxx...
TWILIO_WHATSAPP_ORDER_CREATED_TEMPLATE_SID=HXyyy...
TWILIO_WHATSAPP_RESULTS_READY_TEMPLATE_SID=HXzzz...
TWILIO_WHATSAPP_APPOINTMENT_CANCELLED_TEMPLATE_SID=HXaaa...
```

---

## Uso en el Código

### Ejemplo 1: Notificar Orden Creada

```javascript
await TwilioService.sendWhatsAppTemplate(
  phoneNumber,
  process.env.TWILIO_WHATSAPP_ORDER_CREATED_TEMPLATE_SID,
  {
    '1': paciente.nombre,           // "Carlos Estrada"
    '2': orden.numero                // "2505150002"
  }
);
```

### Ejemplo 2: Notificar Resultados Listos

```javascript
await TwilioService.sendWhatsAppTemplate(
  phoneNumber,
  process.env.TWILIO_WHATSAPP_RESULTS_READY_TEMPLATE_SID,
  {
    '1': paciente.nombre,            // "Carlos Estrada"
    '2': orden.numero,               // "2505150002"
    '3': portalUrl,                  // "https://resultados.laboratoriog.com"
    '4': paciente.ci_paciente        // "E-82289788"
  }
);
```

### Ejemplo 3: Notificar Cancelación de Cita

```javascript
await TwilioService.sendWhatsAppTemplate(
  phoneNumber,
  process.env.TWILIO_WHATSAPP_APPOINTMENT_CANCELLED_TEMPLATE_SID,
  {
    '1': paciente.nombre,            // "Carlos Estrada"
    '2': cita.fecha_formatted,       // "15 de Mayo de 2025"
    '3': cita.hora_formatted,        // "10:30 AM"
    '4': motivo                      // "Mantenimiento programado"
  }
);
```

---

## Mejores Prácticas

### ✅ Hacer:

- Usar emojis moderadamente para mejor legibilidad
- Incluir información clara y concisa
- Proporcionar enlaces directos cuando sea posible
- Ofrecer opciones de contacto alternativas
- Mantener tono profesional pero cercano

### ❌ Evitar:

- Mensajes demasiado largos
- Jerga técnica innecesaria
- Enlaces sin contexto
- Omitir información crítica (números de orden, fechas)
- Tono demasiado formal o distante

---

## Checklist de Implementación

### Fase 1: Crear Plantillas en Twilio ⏳

- [ ] Crear plantilla "Código de Verificación"
- [ ] Crear plantilla "Orden Creada"
- [ ] Crear plantilla "Resultados Listos"
- [ ] Crear plantilla "Cancelación de Cita"
- [ ] Esperar aprobación de todas las plantillas

### Fase 2: Configurar en Proyecto ⏳

- [ ] Copiar Content SIDs de cada plantilla
- [ ] Agregar Content SIDs al archivo `.env`
- [ ] Reiniciar el servicio messaging-bot

### Fase 3: Actualizar Código ⏳

- [ ] Actualizar NotificationService para usar plantillas
- [ ] Actualizar ChangeDetectorService
- [ ] Agregar helpers para formatear fechas/horas
- [ ] Testing de cada tipo de notificación

### Fase 4: Testing ⏳

- [ ] Test: Envío de código de verificación
- [ ] Test: Notificación de orden creada
- [ ] Test: Notificación de resultados listos
- [ ] Test: Notificación de cancelación de cita
- [ ] Verificar entrega en WhatsApp real

---

## Notas Adicionales

### Personalización

Estas plantillas pueden personalizarse según las necesidades del laboratorio:

- Ajustar el tono (más formal o más cercano)
- Agregar/quitar emojis
- Modificar el footer/firma
- Incluir información adicional (dirección, horarios)

### Limitaciones de WhatsApp

- Máximo **1024 caracteres** por mensaje
- Las variables deben estar numeradas secuencialmente: {{1}}, {{2}}, {{3}}...
- No se pueden usar saltos de línea arbitrarios (WhatsApp los preserva del template)
- Los emojis cuentan como caracteres

### Aprobación de Meta/WhatsApp

Meta revisa cada plantilla para asegurarse de que cumple con sus políticas:

- ✅ **Se aprueba rápido:** Información útil, profesional, no spam
- ❌ **Se rechaza:** Contenido promocional agresivo, información engañosa

---

## Soporte

Para problemas con las plantillas:

1. **Verificar estado en Twilio Console**
2. **Revisar logs del messaging-bot**
3. **Consultar documentación de Twilio:** https://www.twilio.com/docs/content-api

---

**Documento creado:** 1 de Noviembre, 2025
**Autor:** Claude (Anthropic AI)
**Versión:** 1.0
