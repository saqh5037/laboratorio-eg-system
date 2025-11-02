# Guía de Configuración: Monitoreo de Producción con UptimeRobot

**Última actualización:** 1 de Noviembre, 2025
**Tiempo estimado:** 10-15 minutos
**Costo:** GRATIS (plan Free)

---

## ℹ️ ¿Por qué Monitoring?

El monitoreo de producción es **crítico** para:
- ✅ Detectar caídas del servidor antes que los usuarios
- ✅ Recibir alertas instantáneas por email/SMS/Slack
- ✅ Medir uptime y disponibilidad (99.9% SLA)
- ✅ Identificar problemas de rendimiento
- ✅ Generar reportes de estabilidad

**Sin monitoring:**
- ❌ Te enteras de problemas cuando los usuarios se quejan
- ❌ No sabes cuánto tiempo estuvo caído el sistema
- ❌ No tienes datos para mejoras

**Con UptimeRobot:**
- ✅ Alertas automáticas en menos de 5 minutos
- ✅ Historial completo de uptime
- ✅ Status page público (opcional)
- ✅ Gratis para hasta 50 monitores

---

## 🎯 URLs a Monitorear

### Producción (Prioritario)

1. **Frontend (PWA)**
   - URL: `https://resultados.laboratorioeg.com`
   - Tipo: HTTP(s)
   - Check: Cada 5 minutos
   - Alerta: Si está DOWN por 5 minutos

2. **Results API Health**
   - URL: `https://resultados.laboratorioeg.com/api/health`
   - Tipo: HTTP(s)
   - Check: Cada 5 minutos
   - Keyword: `"status":"ok"` (verificar que responde JSON correcto)
   - Alerta: Si está DOWN por 5 minutos

3. **Messaging Bot Health** (si está expuesto)
   - URL: `https://resultados.laboratorioeg.com/bot/health`
   - Tipo: HTTP(s)
   - Check: Cada 10 minutos
   - Keyword: `"status":"ok"`
   - Alerta: Si está DOWN por 10 minutos

4. **Database Connectivity** (via API)
   - URL: `https://resultados.laboratorioeg.com/api/health/db`
   - Tipo: HTTP(s)
   - Check: Cada 10 minutos
   - Keyword: `"database":"connected"`
   - Alerta: Si está DOWN por 10 minutos

### Staging (Opcional - Monitoreo menos frecuente)

5. **Staging Frontend**
   - URL: `https://staging.laboratorioeg.com`
   - Check: Cada 15 minutos
   - Alerta: Si está DOWN por 30 minutos (menos crítico)

6. **Staging API Health**
   - URL: `https://staging.laboratorioeg.com/api/health`
   - Check: Cada 15 minutos
   - Alerta: Si está DOWN por 30 minutos

---

## 🚀 Paso a Paso: Configurar UptimeRobot

### Paso 1: Crear Cuenta (GRATIS)

1. Ve a: [https://uptimerobot.com/](https://uptimerobot.com/)

2. Click en **Sign Up Free**

3. Registra tu cuenta con:
   - Email profesional (ej: `admin@laboratorioeg.com`)
   - Password seguro

4. Verifica tu email

5. Login a tu dashboard

---

### Paso 2: Crear Primer Monitor (Frontend)

1. En el dashboard, click en **+ Add New Monitor**

2. Configura:

   **Monitor Type:** `HTTP(s)`

   **Friendly Name:** `Laboratorio EG - Frontend (Producción)`

   **URL (or IP):** `https://resultados.laboratorioeg.com`

   **Monitoring Interval:** `Every 5 minutes` (plan Free permite 5 min)

   **Monitor Timeout:** `30 seconds`

3. **Advanced Settings** (click para expandir):

   - **HTTP Method:** `HEAD` (más rápido, solo verifica que responde)
   - **HTTP Status Code:** `200` (esperar código 200 OK)

4. Click en **Create Monitor**

✅ Tu primer monitor está activo

---

### Paso 3: Crear Monitor para API Health

1. Click en **+ Add New Monitor**

2. Configura:

   **Monitor Type:** `HTTP(s)`

   **Friendly Name:** `Laboratorio EG - Results API Health`

   **URL (or IP):** `https://resultados.laboratorioeg.com/api/health`

   **Monitoring Interval:** `Every 5 minutes`

   **Monitor Timeout:** `30 seconds`

3. **Advanced Settings**:

   - **HTTP Method:** `GET` (necesitamos leer respuesta)
   - **HTTP Status Code:** `200`
   - **Keyword:** `"status":"ok"` (verifica que el JSON contiene esto)
   - **Keyword Type:** `Exists` (el keyword debe existir en la respuesta)

4. Click en **Create Monitor**

---

### Paso 4: Crear Monitores Adicionales

Repite el proceso para:

**Monitor 3: Messaging Bot**
- Friendly Name: `Laboratorio EG - Messaging Bot Health`
- URL: `https://resultados.laboratorioeg.com/bot/health`
- Interval: Every 10 minutes
- Keyword: `"status":"ok"`

**Monitor 4: Database Connectivity**
- Friendly Name: `Laboratorio EG - Database Health`
- URL: `https://resultados.laboratorioeg.com/api/health/db`
- Interval: Every 10 minutes
- Keyword: `"database":"connected"`

**Monitor 5: Staging Frontend** (opcional)
- Friendly Name: `Laboratorio EG - Staging Frontend`
- URL: `https://staging.laboratorioeg.com`
- Interval: Every 15 minutes

---

### Paso 5: Configurar Alertas

Por defecto, UptimeRobot te enviará emails cuando un monitor esté DOWN.

#### 5.1 Verificar Alertas por Email

1. En el dashboard, click en **My Settings** (arriba derecha)

2. Ve a **Alert Contacts**

3. Verifica que tu email está listado

4. Click en **Edit** para configurar:
   - **Send alerts when:** `Monitor goes down` (cuando cae)
   - **Send alerts when:** `Monitor comes up` (cuando se recupera)

#### 5.2 Agregar Más Contactos (Opcional)

Puedes agregar:
- **SMS**: Para alertas críticas (plan Free: hasta 10 SMS/mes)
- **Slack**: Enviar alertas a canal de Slack
- **Webhook**: Integrar con otros sistemas

**Para agregar SMS:**
1. Click en **Add Alert Contact**
2. Selecciona **SMS**
3. Ingresa tu número de teléfono
4. Verifica el código que te llega por SMS

**Para agregar Slack:**
1. Click en **Add Alert Contact**
2. Selecciona **Slack**
3. Sigue las instrucciones para autorizar Slack
4. Selecciona el canal (ej: `#alerts` o `#production`)

---

### Paso 6: Configurar Thresholds (Umbrales)

Para evitar **falsos positivos** (alertas innecesarias):

1. En **My Settings** → **Alert Contacts**

2. Para cada contacto, configura:

   **Alert After:** `2 checks` (esperar 2 checks antes de alertar)
   - Esto significa: alerta solo si falla 2 veces seguidas
   - Con check cada 5 min: alerta después de 10 min DOWN

   **For Production:**
   - Alert After: `2 checks` (10 minutos)

   **For Staging:**
   - Alert After: `4 checks` (60 minutos si check es cada 15 min)

3. Click en **Save**

---

## 📊 Dashboard y Reportes

### Ver Estado Actual

1. En el dashboard principal verás:
   - 🟢 **Up**: Monitor funcionando (verde)
   - 🔴 **Down**: Monitor caído (rojo)
   - ⚠️ **Paused**: Monitor pausado (amarillo)

2. Click en cualquier monitor para ver:
   - Uptime % (últimas 24h, 7 días, 30 días)
   - Historial de eventos (cuándo cayó, cuándo se recuperó)
   - Response time promedio

### Generar Reportes

1. Ve a **Monitors** → Selecciona un monitor

2. Click en **View Details**

3. Scroll a **Uptime Logs**

4. Filtra por fecha (ej: último mes)

5. Exportar reporte (solo en plan Pro, pero puedes tomar screenshots)

---

## 🔔 Tipos de Alertas Recomendadas

### Configuración Ideal

| Servicio | Intervalo | Alerta Después | Contacto |
|----------|-----------|----------------|----------|
| Frontend Producción | 5 min | 2 checks (10 min) | Email + SMS |
| API Health Producción | 5 min | 2 checks (10 min) | Email + SMS |
| Messaging Bot | 10 min | 2 checks (20 min) | Email |
| Database Health | 10 min | 2 checks (20 min) | Email + Slack |
| Staging Frontend | 15 min | 4 checks (60 min) | Email |
| Staging API | 15 min | 4 checks (60 min) | Email |

---

## 🌐 Status Page Público (Opcional)

UptimeRobot permite crear un **status page público** para que los usuarios vean el estado del servicio.

### Crear Status Page

1. En el dashboard, click en **Public Status Pages**

2. Click en **+ Add New Status Page**

3. Configura:
   - **Status Page URL:** `https://status-laboratorioeg.uptimerobot.com` (gratis)
   - **Status Page Name:** `Laboratorio EG - System Status`
   - **Monitors to Show:** Selecciona solo monitores de producción

4. **Custom Domain** (opcional, plan Pro):
   - Puedes usar `status.laboratorioeg.com` con plan Pro

5. Click en **Create Status Page**

6. Compartir URL: `https://status-laboratorioeg.uptimerobot.com`

---

## 🔄 Mantenimiento y Pausar Monitores

### Cuando Hacer Mantenimiento

Si vas a hacer deployment o mantenimiento programado:

1. Ve a **Monitors**

2. Selecciona los monitores de producción

3. Click en **Pause** (icono de pausa)

4. Selecciona duración: `30 minutes` (o el tiempo estimado)

5. Click en **Pause**

✅ No recibirás alertas durante este tiempo

**IMPORTANTE:** No olvides **Resume** después del mantenimiento

---

## 🐛 Troubleshooting

### Problema: Alertas de falsos positivos

**Síntoma:** Recibes alerta de DOWN pero el sitio está funcionando

**Causas posibles:**
1. Timeout muy bajo (30s puede ser poco)
2. Conexión lenta temporalmente
3. Check muy frecuente

**Solución:**
1. Aumentar **Monitor Timeout** a `60 seconds`
2. Aumentar **Alert After** a `3 checks` (15 min con check cada 5 min)
3. Verificar logs de Nginx para ver si hubo picos de tráfico

### Problema: No recibo alertas por email

**Causas posibles:**
1. Email en spam
2. Alert Contact no verificado
3. Alertas deshabilitadas

**Solución:**
1. Revisar carpeta de Spam/Junk
2. Agregar `support@uptimerobot.com` a contactos seguros
3. Verificar Alert Contact en configuración
4. Hacer un **Test Alert** desde UptimeRobot

### Problema: Monitor marca DOWN pero API responde

**Causa:** Keyword no encontrado en la respuesta

**Solución:**
1. Verificar que el endpoint `/api/health` retorna exactamente `"status":"ok"`
2. Click en el monitor → **View Details** → **Latest Log Entry**
3. Ver el **Response** que UptimeRobot recibió
4. Ajustar keyword si es necesario

---

## 📋 Checklist de Configuración

Antes de dar por completado el setup de monitoring:

- [ ] Cuenta de UptimeRobot creada y verificada
- [ ] Monitor de Frontend (Producción) creado
- [ ] Monitor de Results API Health creado
- [ ] Monitor de Messaging Bot creado (si aplica)
- [ ] Monitor de Database Health creado (si aplica)
- [ ] Alert Contact (Email) verificado
- [ ] Alert Contact (SMS) agregado (opcional)
- [ ] Alert Contact (Slack) agregado (opcional)
- [ ] Thresholds configurados (Alert After: 2 checks)
- [ ] Test de alertas realizado (pausar/reanudar un monitor)
- [ ] Status Page creado (opcional)
- [ ] Monitores de Staging creados (opcional)

---

## 🎯 Endpoints de Health a Implementar

Si aún **NO tienes endpoints de health** en tu API, aquí está cómo crearlos:

### Backend: `apps/results-api/src/routes/health.js`

```javascript
const express = require('express');
const router = express.Router();
const pool = require('../config/database'); // Tu conexión a PostgreSQL

/**
 * GET /api/health
 * Health check básico
 */
router.get('/', async (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * GET /api/health/db
 * Health check de base de datos
 */
router.get('/db', async (req, res) => {
  try {
    // Simple query para verificar conectividad
    const result = await pool.query('SELECT NOW() as timestamp');

    res.json({
      status: 'ok',
      database: 'connected',
      timestamp: result.rows[0].timestamp,
    });
  } catch (error) {
    console.error('Database health check failed:', error);
    res.status(503).json({
      status: 'error',
      database: 'disconnected',
      error: error.message,
    });
  }
});

module.exports = router;
```

### Registrar en `apps/results-api/src/server.js`

```javascript
const healthRouter = require('./routes/health');

// ... otros imports

app.use('/api/health', healthRouter);
```

### Verificar localmente

```bash
curl http://localhost:3003/api/health
# {"status":"ok","timestamp":"2025-11-01T12:00:00.000Z"}

curl http://localhost:3003/api/health/db
# {"status":"ok","database":"connected","timestamp":"2025-11-01T12:00:00.000Z"}
```

---

## 📊 Métricas de Éxito

### Objetivos de Uptime

**Producción:**
- 🎯 **Target:** 99.9% uptime (8.76 horas de downtime al año)
- ⚠️ **Warning:** Si baja de 99.5% (43.8 horas de downtime al año)
- 🚨 **Critical:** Si baja de 99% (87.6 horas de downtime al año)

**Staging:**
- 🎯 **Target:** 98% uptime (175 horas de downtime al año)

### Response Time

**Bueno:**
- Frontend: < 500ms
- API Health: < 200ms
- Database Health: < 300ms

**Aceptable:**
- Frontend: 500ms - 1000ms
- API Health: 200ms - 500ms
- Database Health: 300ms - 800ms

**Lento (investigar):**
- Frontend: > 1000ms
- API Health: > 500ms
- Database Health: > 800ms

---

## 🔗 Recursos Adicionales

- [UptimeRobot Documentation](https://uptimerobot.com/docs/)
- [Best Practices for Monitoring](https://uptimerobot.com/blog/best-practices/)
- [Status Page Examples](https://uptimerobot.com/public-status-pages)

---

## 🎉 Siguientes Pasos

Una vez configurado el monitoring:

1. **Probar alertas**: Pausar un monitor y verificar que recibes email
2. **Configurar Nginx** para servir health endpoints sin autenticación
3. **Documentar** los números de contacto para alertas críticas
4. **Revisar dashboard** semanalmente para identificar patrones

**Próximos pasos del deployment:**
1. ✅ Monitoring configurado (este documento)
2. Crear Pull Request de develop → main
3. Configurar Branch Protection
4. Hacer primer deployment profesional

---

**¿Problemas?** Revisa la sección de Troubleshooting o contacta al equipo de desarrollo.

---

**Configuración completada el:** _[FECHA Y HORA]_
**Por:** _[NOMBRE]_
