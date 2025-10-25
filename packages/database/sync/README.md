# 🗄️ Scripts SQL - Sincronización de Precios

Scripts SQL para implementar el sistema de sincronización automática de precios desde PostgreSQL a AWS S3.

## 📋 Orden de Ejecución

**IMPORTANTE:** Ejecutar los scripts en este orden exacto:

```bash
# 1. Crear tabla de changelog
psql -U postgres -d labsis_dev -f 001_create_changelog.sql

# 2. Crear trigger de detección
psql -U postgres -d labsis_dev -f 002_create_trigger.sql

# 3. Crear índices de optimización
psql -U postgres -d labsis_dev -f 003_create_indexes.sql
```

## 📄 Descripción de Scripts

### 001_create_changelog.sql
Crea la tabla `precios_changelog` que registra todos los cambios en la tabla de precios.

**Columnas:**
- `id`: ID autoincremental
- `tabla`: Nombre de la tabla modificada
- `operacion`: INSERT, UPDATE o DELETE
- `fecha`: Timestamp del cambio
- `usuario`: Usuario que realizó el cambio
- `datos_json`: Datos del registro en formato JSON
- `sincronizado`: Boolean (false hasta que se sincronice con S3)
- `fecha_sincronizacion`: Timestamp de cuándo se sincronizó

### 002_create_trigger.sql
Crea **4 triggers** en las tablas del sistema LABSIS:
1. `trigger_precios_cambio` → tabla `prueba` (estudios individuales)
2. `trigger_grupos_cambio` → tabla `grupo_prueba` (perfiles/paquetes)
3. `trigger_precio_prueba_cambio` → tabla `lista_precios_has_prueba` (precios de pruebas)
4. `trigger_precio_grupo_cambio` → tabla `lista_precios_has_gprueba` (precios de grupos)

**Función:** `notify_price_change_safe()`
- Manejo de errores robusto
- No interrumpe operaciones si falla el logging
- Guarda OLD para DELETE, NEW para INSERT/UPDATE
- Envía notificación NOTIFY al canal `precio_cambio`
- Registra cambios en `precios_changelog`

### 003_create_indexes.sql
Crea índices para optimizar el performance en múltiples tablas:

**Índices en `precios_changelog`:**
- `idx_changelog_fecha`: Búsquedas por fecha (DESC)
- `idx_changelog_sincronizado`: Cambios pendientes (índice parcial)
- `idx_changelog_fecha_sincronizado`: Índice compuesto
- `idx_changelog_datos_json`: Búsquedas en JSON (GIN)

**Índices en tablas de LABSIS:**
- `idx_prueba_activa`: Para filtrar pruebas activas
- `idx_grupo_prueba_activa`: Para filtrar grupos activos
- `idx_lpp_lista_prueba`: Búsqueda de precios por lista (lista_precios_has_prueba)
- `idx_lpg_lista_grupo`: Búsqueda de precios de grupos (lista_precios_has_gprueba)

## ⚙️ Adaptación a tu Esquema

### Cambiar nombre de tabla

Si tu tabla de precios NO se llama `prueba`, edita el archivo `002_create_trigger.sql`:

```sql
-- Cambiar esta línea:
CREATE TRIGGER trigger_precios_cambio
AFTER INSERT OR UPDATE OR DELETE ON TU_TABLA_AQUI
FOR EACH ROW
EXECUTE FUNCTION notify_price_change_safe();
```

### Múltiples tablas

Si tienes múltiples tablas de precios, puedes crear el trigger en cada una:

```sql
-- Tabla 1
CREATE TRIGGER trigger_precios_cambio_estudios
AFTER INSERT OR UPDATE OR DELETE ON estudios
FOR EACH ROW
EXECUTE FUNCTION notify_price_change_safe();

-- Tabla 2
CREATE TRIGGER trigger_precios_cambio_perfiles
AFTER INSERT OR UPDATE OR DELETE ON perfiles
FOR EACH ROW
EXECUTE FUNCTION notify_price_change_safe();
```

## 🧪 Verificación

### Verificar tabla creada
```sql
SELECT COUNT(*) FROM precios_changelog;
-- Debería retornar 0 (tabla vacía inicial)
```

### Verificar triggers activos
```sql
SELECT
  tgname,
  tgrelid::regclass as tabla,
  tgenabled
FROM pg_trigger
WHERE tgname IN (
  'trigger_precios_cambio',
  'trigger_grupos_cambio',
  'trigger_precio_prueba_cambio',
  'trigger_precio_grupo_cambio'
);
-- Deberían listar 4 triggers
-- tgenabled debería ser 'O' (origin, enabled)
```

### Verificar índices
```sql
SELECT indexname
FROM pg_indexes
WHERE tablename = 'precios_changelog';
-- Debería listar 4 índices
```

### Probar el trigger
```sql
-- Actualizar un precio (ejemplo)
UPDATE prueba
SET precio = 100.00
WHERE id = 1;

-- Verificar que se registró en changelog
SELECT * FROM precios_changelog
ORDER BY fecha DESC
LIMIT 1;

-- Deberías ver el registro del cambio
```

## 🔧 Mantenimiento

### Deshabilitar triggers temporalmente
Útil para migraciones masivas o actualizaciones batch:

```sql
-- Deshabilitar todos los triggers
ALTER TABLE prueba DISABLE TRIGGER trigger_precios_cambio;
ALTER TABLE grupo_prueba DISABLE TRIGGER trigger_grupos_cambio;
ALTER TABLE lista_precios_has_prueba DISABLE TRIGGER trigger_precio_prueba_cambio;
ALTER TABLE lista_precios_has_gprueba DISABLE TRIGGER trigger_precio_grupo_cambio;
```

### Habilitar triggers
```sql
-- Habilitar todos los triggers
ALTER TABLE prueba ENABLE TRIGGER trigger_precios_cambio;
ALTER TABLE grupo_prueba ENABLE TRIGGER trigger_grupos_cambio;
ALTER TABLE lista_precios_has_prueba ENABLE TRIGGER trigger_precio_prueba_cambio;
ALTER TABLE lista_precios_has_gprueba ENABLE TRIGGER trigger_precio_grupo_cambio;
```

### Limpiar changelog antiguo (mantener últimos 90 días)
```sql
DELETE FROM precios_changelog
WHERE fecha < NOW() - INTERVAL '90 days'
AND sincronizado = true;
```

### Ver cambios no sincronizados
```sql
SELECT
    operacion,
    tabla,
    fecha,
    usuario
FROM precios_changelog
WHERE sincronizado = false
ORDER BY fecha DESC;
```

### Marcar como sincronizado manualmente
```sql
UPDATE precios_changelog
SET
    sincronizado = true,
    fecha_sincronizacion = NOW()
WHERE id = YOUR_ID;
```

## 🐛 Troubleshooting

### Error: "relation precios_changelog does not exist"
Ejecuta primero el script `001_create_changelog.sql`

### Error: "function notify_price_change_safe() does not exist"
Ejecuta el script `002_create_trigger.sql`

### Trigger no se dispara
```sql
-- Verificar que el trigger existe y está habilitado
SELECT tgname, tgenabled FROM pg_trigger WHERE tgname = 'trigger_precios_cambio';

-- Si está deshabilitado ('D'), habilitarlo:
ALTER TABLE prueba ENABLE TRIGGER trigger_precios_cambio;
```

### Changelog crece mucho
Ejecuta el script de limpieza periódicamente o configura un cron job:
```sql
-- Mantener solo últimos 30 días
DELETE FROM precios_changelog
WHERE fecha < NOW() - INTERVAL '30 days'
AND sincronizado = true;

-- Vacuum para recuperar espacio
VACUUM ANALYZE precios_changelog;
```

## 📊 Monitoreo

### Estadísticas de changelog
```sql
SELECT
    COUNT(*) as total_cambios,
    COUNT(*) FILTER (WHERE sincronizado = false) as pendientes,
    COUNT(*) FILTER (WHERE sincronizado = true) as sincronizados,
    MAX(fecha) as ultimo_cambio
FROM precios_changelog;
```

### Cambios por tipo de operación
```sql
SELECT
    operacion,
    COUNT(*) as cantidad
FROM precios_changelog
WHERE fecha > NOW() - INTERVAL '24 hours'
GROUP BY operacion;
```

## 🔒 Seguridad

- La función del trigger tiene manejo de errores para no afectar operaciones normales
- Solo se guardan los datos del registro modificado (no información sensible adicional)
- El changelog puede ser limpiado periódicamente
- Los índices parciales optimizan el rendimiento sin afectar seguridad

## 📝 Notas

- El trigger es **AFTER** (no BEFORE) para no bloquear operaciones
- Usa `EXCEPTION` handler para no interrumpir transacciones
- El canal NOTIFY es `precio_cambio` (usado por sync-service.js)
- Los índices son creados con `IF NOT EXISTS` (idempotentes)

---

**Última actualización:** Octubre 2025
