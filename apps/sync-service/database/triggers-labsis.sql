-- =====================================================
-- TRIGGERS PARA SISTEMA DE SINCRONIZACIÓN
-- Base de datos: labsisEG
-- Fecha: 2025-10-18
-- =====================================================

\c labsisEG;

-- =====================================================
-- FUNCIÓN: Notificar cambios en precios
-- =====================================================

CREATE OR REPLACE FUNCTION notificar_cambio_precios()
RETURNS TRIGGER AS $$
DECLARE
  cambio_data JSON;
BEGIN
  -- Construir payload con información del cambio
  cambio_data := json_build_object(
    'tabla', TG_TABLE_NAME,
    'operacion', TG_OP,
    'timestamp', CURRENT_TIMESTAMP,
    'registro_id', COALESCE(NEW.id, OLD.id),
    'usuario', current_user,
    'lista_precios_id', CASE
      WHEN TG_TABLE_NAME = 'lista_precios_has_prueba' THEN COALESCE(NEW.lista_precios_id, OLD.lista_precios_id)
      WHEN TG_TABLE_NAME = 'lista_precios_has_gprueba' THEN COALESCE(NEW.lista_precios_id, OLD.lista_precios_id)
      ELSE NULL
    END
  );

  -- Enviar notificación al canal 'precio_cambio'
  PERFORM pg_notify('precio_cambio', cambio_data::text);

  -- Log para debugging
  RAISE NOTICE '🔔 Cambio detectado en %: %', TG_TABLE_NAME, cambio_data;

  RETURN COALESCE(NEW, OLD);
EXCEPTION
  WHEN OTHERS THEN
    -- No interrumpir la operación si falla la notificación
    RAISE WARNING '⚠️ Error al notificar cambio: %', SQLERRM;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION notificar_cambio_precios() IS
'Función de trigger que envía notificación NOTIFY cuando hay cambios en precios';

-- =====================================================
-- TRIGGER 1: Tabla prueba (estudios individuales)
-- =====================================================

DROP TRIGGER IF EXISTS trigger_prueba_cambio ON prueba;

CREATE TRIGGER trigger_prueba_cambio
AFTER INSERT OR UPDATE OR DELETE ON prueba
FOR EACH ROW
EXECUTE FUNCTION notificar_cambio_precios();

COMMENT ON TRIGGER trigger_prueba_cambio ON prueba IS
'Detecta cambios en pruebas individuales y notifica al sync-service';

-- =====================================================
-- TRIGGER 2: Tabla grupo_prueba (perfiles/paquetes)
-- =====================================================

DROP TRIGGER IF EXISTS trigger_grupo_prueba_cambio ON grupo_prueba;

CREATE TRIGGER trigger_grupo_prueba_cambio
AFTER INSERT OR UPDATE OR DELETE ON grupo_prueba
FOR EACH ROW
EXECUTE FUNCTION notificar_cambio_precios();

COMMENT ON TRIGGER trigger_grupo_prueba_cambio ON grupo_prueba IS
'Detecta cambios en grupos de pruebas y notifica al sync-service';

-- =====================================================
-- TRIGGER 3: Tabla lista_precios_has_prueba
-- =====================================================

DROP TRIGGER IF EXISTS trigger_precio_prueba_cambio ON lista_precios_has_prueba;

CREATE TRIGGER trigger_precio_prueba_cambio
AFTER INSERT OR UPDATE OR DELETE ON lista_precios_has_prueba
FOR EACH ROW
EXECUTE FUNCTION notificar_cambio_precios();

COMMENT ON TRIGGER trigger_precio_prueba_cambio ON lista_precios_has_prueba IS
'Detecta cambios en precios de pruebas individuales y notifica al sync-service';

-- =====================================================
-- TRIGGER 4: Tabla lista_precios_has_gprueba
-- =====================================================

DROP TRIGGER IF EXISTS trigger_precio_grupo_cambio ON lista_precios_has_gprueba;

CREATE TRIGGER trigger_precio_grupo_cambio
AFTER INSERT OR UPDATE OR DELETE ON lista_precios_has_gprueba
FOR EACH ROW
EXECUTE FUNCTION notificar_cambio_precios();

COMMENT ON TRIGGER trigger_precio_grupo_cambio ON lista_precios_has_gprueba IS
'Detecta cambios en precios de grupos y notifica al sync-service';

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

SELECT
  'Trigger instalado: ' || trigger_name || ' en tabla ' || event_object_table as mensaje
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name IN (
    'trigger_prueba_cambio',
    'trigger_grupo_prueba_cambio',
    'trigger_precio_prueba_cambio',
    'trigger_precio_grupo_cambio'
  )
ORDER BY event_object_table;

-- Mostrar resumen
SELECT
  COUNT(*) as total_triggers,
  STRING_AGG(trigger_name, ', ') as nombres
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name LIKE 'trigger_%cambio';

-- =====================================================
-- INSTRUCCIONES DE USO
-- =====================================================

-- Para ejecutar este script:
--   psql -h localhost -U postgres -d labsisEG -f database/triggers-labsis.sql

-- Para verificar que los triggers están activos:
--   SELECT tgname, tgrelid::regclass, tgenabled
--   FROM pg_trigger
--   WHERE tgname LIKE 'trigger_%cambio';

-- Para deshabilitar temporalmente (migraciones masivas):
--   ALTER TABLE prueba DISABLE TRIGGER trigger_prueba_cambio;
--   ALTER TABLE grupo_prueba DISABLE TRIGGER trigger_grupo_prueba_cambio;
--   ALTER TABLE lista_precios_has_prueba DISABLE TRIGGER trigger_precio_prueba_cambio;
--   ALTER TABLE lista_precios_has_gprueba DISABLE TRIGGER trigger_precio_grupo_cambio;

-- Para habilitar nuevamente:
--   ALTER TABLE prueba ENABLE TRIGGER trigger_prueba_cambio;
--   ALTER TABLE grupo_prueba ENABLE TRIGGER trigger_grupo_prueba_cambio;
--   ALTER TABLE lista_precios_has_prueba ENABLE TRIGGER trigger_precio_prueba_cambio;
--   ALTER TABLE lista_precios_has_gprueba ENABLE TRIGGER trigger_precio_grupo_cambio;

-- Para eliminar todos los triggers:
--   DROP TRIGGER IF EXISTS trigger_prueba_cambio ON prueba;
--   DROP TRIGGER IF EXISTS trigger_grupo_prueba_cambio ON grupo_prueba;
--   DROP TRIGGER IF EXISTS trigger_precio_prueba_cambio ON lista_precios_has_prueba;
--   DROP TRIGGER IF EXISTS trigger_precio_grupo_cambio ON lista_precios_has_gprueba;
--   DROP FUNCTION IF EXISTS notificar_cambio_precios();

\echo '✅ Triggers instalados exitosamente en labsisEG'
