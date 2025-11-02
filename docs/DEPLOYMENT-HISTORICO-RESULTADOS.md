# Guía de Despliegue - Mejoras de Histórico de Resultados

**Fecha:** 1 de Noviembre, 2025
**Rama:** `develop`
**Commit:** `34d9447`
**Autor:** Samuel Quiroz con Claude Code

---

## 📋 Resumen de Cambios

Este despliegue incluye mejoras significativas en la visualización de resultados históricos del portal de pacientes:

### ✨ Nuevas Funcionalidades

1. **Toggle Histórico Mejorado**
   - Botón más visible con iconos grandes y efectos visuales
   - Headers con fechas dinámicas en lugar de "-3, -2, -1"

2. **Soporte Completo para Pruebas Alfanuméricas**
   - Columnas expandibles muestran valores de texto
   - Tooltips funcionan con valores alfanuméricos
   - Gráficas muestran tablas cronológicas responsive

3. **Filtrado Inteligente de Órdenes**
   - Solo se muestran órdenes con resultados
   - Navegación automática salta órdenes vacías
   - Estadísticas calculadas correctamente

4. **Formateo Estandarizado**
   - Consistencia entre resultados, históricos y gráficas
   - Manejo correcto de decimales según formato

---

## 🗂️ Archivos Modificados

### Frontend (7 archivos)
```
apps/web/src/pages/Resultados.jsx
apps/web/src/components/resultados/ResultadosDetalle.jsx
apps/web/src/components/resultados/historico/HistoricoCell.jsx (NUEVO)
apps/web/src/components/historico/GraficaBarras.jsx
apps/web/src/components/historico/GraficaLinea.jsx
apps/web/src/utils/formatters.js
apps/web/src/services/resultsApi.js
```

### Backend (1 archivo)
```
apps/results-api/src/models/resultado.js
```

---

## 🚀 Pasos de Despliegue

### 1. Pre-requisitos

Verificar que el servidor de producción tenga:
- ✅ Node.js v18 o superior
- ✅ PostgreSQL 14+ corriendo
- ✅ PM2 instalado globalmente
- ✅ Nginx configurado como reverse proxy
- ✅ Variables de entorno configuradas

### 2. Backup de Base de Datos

```bash
# SSH al servidor
ssh usuario@servidor-produccion

# Backup de la base de datos
PGPASSWORD='tu_password' pg_dump -h localhost -U labsis -d labsisEG > backup_pre_deploy_$(date +%Y%m%d_%H%M%S).sql
```

### 3. Pull de Cambios

```bash
cd /ruta/a/laboratorio-eg-system

# Verificar rama actual
git branch

# Pull de cambios desde develop
git pull origin develop

# Verificar que estamos en el commit correcto
git log -1 --oneline
# Debería mostrar: 34d9447 feat(results): Mejoras completas en visualización de histórico de resultados
```

### 4. Instalación de Dependencias

```bash
# Instalar dependencias si hubo cambios
npm install

# Verificar dependencias del frontend
cd apps/web
npm install
cd ../..

# Verificar dependencias del backend
cd apps/results-api
npm install
cd ../..
```

### 5. Build del Frontend

```bash
cd apps/web

# Build de producción
npm run build

# Verificar que el build fue exitoso
ls -lh dist/

# Debería mostrar archivos como:
# - dist/index.html
# - dist/assets/js/Resultados-*.js (793 KB)
# - dist/assets/css/main-*.css (115 KB)
```

### 6. Reiniciar Servicios Backend

```bash
# Reiniciar Results API
pm2 restart results-api

# Verificar logs
pm2 logs results-api --lines 50

# Verificar que no haya errores
```

### 7. Servir Frontend Actualizado

```bash
# Copiar archivos build a directorio de Nginx
sudo cp -r apps/web/dist/* /var/www/laboratorio-eg/

# O si usas otro método de deployment
sudo rsync -av --delete apps/web/dist/ /var/www/laboratorio-eg/

# Recargar Nginx
sudo nginx -t
sudo systemctl reload nginx
```

### 8. Verificación Post-Despliegue

#### 8.1 Verificar Servicios

```bash
# Verificar que Results API está corriendo
pm2 status

# Verificar logs
pm2 logs results-api --lines 20
```

#### 8.2 Testing Manual

**En el navegador:**

1. **Ir a** `https://tu-dominio.com/resultados`

2. **Autenticarse** con credenciales de prueba

3. **Verificar Funcionalidades:**

   ✅ **Toggle Histórico**
   - Click en botón "Histórico"
   - Verificar que se expanden 3 columnas
   - Verificar headers con fechas (ej: "15 oct", "20 sep")

   ✅ **Pruebas Numéricas**
   - Seleccionar una orden con pruebas numéricas
   - Expandir histórico
   - Verificar que se muestran valores numéricos
   - Click en "Ver Histórico Completo"
   - Verificar gráfica de barras/líneas

   ✅ **Pruebas Alfanuméricas**
   - Seleccionar una orden con pruebas de texto (ej: Grupo Sanguíneo)
   - Expandir histórico
   - Verificar que se muestran valores de texto
   - Click en "Ver Histórico Completo"
   - Verificar que muestra tabla cronológica (NO gráfica)

   ✅ **Navegación**
   - Click en "Siguiente" y "Anterior"
   - Verificar que navega correctamente
   - Verificar que salta órdenes sin resultados

   ✅ **Responsive**
   - Abrir desde móvil
   - Verificar que tablas se convierten en cards
   - Verificar que todo es legible

4. **Verificar Logs del Backend**
   ```bash
   # En el servidor
   pm2 logs results-api --lines 100

   # Buscar posibles errores
   grep -i error /var/log/nginx/error.log
   ```

---

## 🔄 Rollback (Si es Necesario)

Si hay problemas críticos, rollback inmediato:

```bash
# 1. Revertir código
git revert 34d9447

# 2. Rebuild frontend
cd apps/web
npm run build

# 3. Copiar nuevamente
sudo cp -r dist/* /var/www/laboratorio-eg/
sudo systemctl reload nginx

# 4. Reiniciar backend
pm2 restart results-api

# 5. Restaurar base de datos (solo si hubo cambios en DB)
PGPASSWORD='tu_password' psql -h localhost -U labsis -d labsisEG < backup_pre_deploy_TIMESTAMP.sql
```

---

## 📊 Monitoreo Post-Despliegue

### Métricas a Monitorear (primeras 24 horas)

```bash
# CPU y Memoria
pm2 monit

# Logs en tiempo real
pm2 logs results-api --lines 100

# Errores en Nginx
tail -f /var/log/nginx/error.log

# Requests HTTP
tail -f /var/log/nginx/access.log | grep "/resultados"
```

### Queries de Verificación en DB

```sql
-- Verificar que el query de últimos 3 funciona correctamente
SELECT COUNT(*) FROM (
  SELECT prueba_id, COUNT(*) as historicos
  FROM (
    SELECT DISTINCT pr.id as prueba_id, o.numero as numero_orden
    FROM prueba pr
    INNER JOIN prueba_orden po ON po.prueba_id = pr.id
    INNER JOIN orden_trabajo o ON po.orden_id = o.id
    WHERE o.numero = 'NUMERO_ORDEN_TEST'
  ) sub
  GROUP BY prueba_id
) counts;
-- Debería retornar el número de pruebas de la orden
```

---

## 🐛 Troubleshooting

### Problema: "Error cargando resultado"

**Causa:** Orden sin resultados (`pruebas_con_resultado = 0`)

**Solución:**
- ✅ Ya implementado: filtrado automático
- Verificar logs: `pm2 logs results-api | grep "pruebas_con_resultado"`

### Problema: Gráficas no se muestran para pruebas alfanuméricas

**Causa:** Falta detección de tipo de prueba

**Solución:**
- ✅ Ya implementado: detección con `data.every(item => item.valorNumerico === null)`
- Verificar en navegador: Console → Network → Verificar response del endpoint

### Problema: Navegación no funciona

**Causa:** `ordenSeleccionada` no está en array filtrado

**Solución:**
- ✅ Ya implementado: navegación basada en índices
- Verificar logs del navegador (Console)
- Verificar que `ordenes.findIndex()` encuentra el elemento

---

## 📝 Notas Adicionales

### Compatibilidad
- ✅ Compatible con Chrome, Safari, Firefox
- ✅ Responsive design (móvil, tablet, desktop)
- ✅ No requiere cambios en base de datos
- ✅ No requiere migración de datos

### Performance
- Bundle size: ~793 KB (gzip: ~162 KB)
- Build time: ~5.3s
- No impacto significativo en performance

### Testing
- ✅ Probado en iPhone (confirmado por usuario)
- ✅ Probado en desktop Chrome/Safari
- ✅ Probado con pruebas numéricas y alfanuméricas
- ✅ Probado navegación con órdenes filtradas

---

## ✅ Checklist Final

Antes de dar por completado el deployment:

- [ ] Backup de base de datos realizado
- [ ] Código actualizado desde `develop`
- [ ] Dependencies instaladas
- [ ] Build de frontend exitoso
- [ ] Backend reiniciado sin errores
- [ ] Frontend servido por Nginx
- [ ] Testing manual completado (todas las funcionalidades)
- [ ] No hay errores en logs
- [ ] Responsive verificado en móvil
- [ ] Monitoreo activo primeras 24h

---

## 📞 Contacto de Soporte

**En caso de problemas:**
- Revisar logs: `pm2 logs results-api`
- Revisar Nginx: `tail -f /var/log/nginx/error.log`
- Contactar al equipo de desarrollo

---

**Deployment realizado el:** _[FECHA Y HORA]_
**Por:** _[NOMBRE]_
**Verificado por:** _[NOMBRE]_

---

## 🎉 Éxito del Deployment

Si todas las verificaciones pasaron:

```bash
# Tag del deployment exitoso
git tag -a v2.5.0-historico-mejoras -m "Deployment: Mejoras de histórico de resultados - 01/11/2025"
git push origin v2.5.0-historico-mejoras
```

**¡Deployment completado exitosamente!** 🚀
