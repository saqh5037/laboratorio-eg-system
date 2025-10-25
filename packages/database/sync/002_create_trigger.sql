-- =====================================================
-- Trigger para Detección Automática de Cambios
-- =====================================================
-- Propósito: Detectar cambios en estudios_precios y enviar
--            notificación NOTIFY para sincronización en tiempo real
-- Autor: Laboratorio EG
-- Fecha: Octubre 2025
-- =====================================================

-- Función del trigger
CREATE OR REPLACE FUNCTION notify_price_change_safe()
RETURNS TRIGGER AS $$
DECLARE
    datos_registro JSONB;
BEGIN
    -- Determinar qué datos guardar según la operación
    IF TG_OP = 'DELETE' THEN
        datos_registro := row_to_json(OLD)::jsonb;
    ELSE
        datos_registro := row_to_json(NEW)::jsonb;
    END IF;

    -- Insertar en changelog (con manejo de errores)
    BEGIN
        INSERT INTO precios_changelog (
            tabla,
            operacion,
            usuario,
            datos_json,
            sincronizado
        ) VALUES (
            TG_TABLE_NAME,
            TG_OP,
            current_user,
            datos_registro,
            FALSE
        );
    EXCEPTION
        WHEN OTHERS THEN
            -- Log del error pero no interrumpir la operación
            RAISE WARNING 'Error al insertar en changelog: %', SQLERRM;
    END;

    -- Enviar notificación NOTIFY (con manejo de errores)
    BEGIN
        PERFORM pg_notify(
            'precio_cambio',
            json_build_object(
                'tabla', TG_TABLE_NAME,
                'operacion', TG_OP,
                'timestamp', NOW(),
                'usuario', current_user
            )::text
        );
    EXCEPTION
        WHEN OTHERS THEN
            RAISE WARNING 'Error al enviar NOTIFY: %', SQLERRM;
    END;

    -- Retornar el registro apropiado
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Comentario de la función
COMMENT ON FUNCTION notify_price_change_safe() IS 'Registra cambios en changelog y envía notificación NOTIFY para sincronización';

-- =====================================================
-- Crear triggers en tablas de estudios y grupos
-- =====================================================

-- Trigger 1: Tabla prueba (estudios individuales)
CREATE TRIGGER trigger_precios_cambio
AFTER INSERT OR UPDATE OR DELETE ON prueba
FOR EACH ROW
EXECUTE FUNCTION notify_price_change_safe();

COMMENT ON TRIGGER trigger_precios_cambio ON prueba IS 'Detecta cambios en pruebas y notifica al servicio de sincronización';

-- Trigger 2: Tabla grupo_prueba (perfiles/paquetes)
CREATE TRIGGER trigger_grupos_cambio
AFTER INSERT OR UPDATE OR DELETE ON grupo_prueba
FOR EACH ROW
EXECUTE FUNCTION notify_price_change_safe();

COMMENT ON TRIGGER trigger_grupos_cambio ON grupo_prueba IS 'Detecta cambios en grupos de pruebas y notifica al servicio de sincronización';

-- Trigger 3: Tabla lista_precios_has_prueba (cambios de precio en pruebas)
CREATE TRIGGER trigger_precio_prueba_cambio
AFTER INSERT OR UPDATE OR DELETE ON lista_precios_has_prueba
FOR EACH ROW
EXECUTE FUNCTION notify_price_change_safe();

COMMENT ON TRIGGER trigger_precio_prueba_cambio ON lista_precios_has_prueba IS 'Detecta cambios en precios de pruebas individuales';

-- Trigger 4: Tabla lista_precios_has_gprueba (cambios de precio en grupos)
CREATE TRIGGER trigger_precio_grupo_cambio
AFTER INSERT OR UPDATE OR DELETE ON lista_precios_has_gprueba
FOR EACH ROW
EXECUTE FUNCTION notify_price_change_safe();

COMMENT ON TRIGGER trigger_precio_grupo_cambio ON lista_precios_has_gprueba IS 'Detecta cambios en precios de grupos';

-- Verificación
SELECT 'Triggers creados exitosamente en 4 tablas: prueba, grupo_prueba, lista_precios_has_prueba, lista_precios_has_gprueba' AS status;

-- =====================================================
-- INSTRUCCIONES DE USO
-- =====================================================

-- 1. Verificar que los triggers existen:
SELECT tgname, tgrelid::regclass as tabla
FROM pg_trigger
WHERE tgname IN (
  'trigger_precios_cambio',
  'trigger_grupos_cambio',
  'trigger_precio_prueba_cambio',
  'trigger_precio_grupo_cambio'
);

-- 2. Para deshabilitar temporalmente los triggers (útil para migraciones masivas):
ALTER TABLE prueba DISABLE TRIGGER trigger_precios_cambio;
ALTER TABLE grupo_prueba DISABLE TRIGGER trigger_grupos_cambio;
ALTER TABLE lista_precios_has_prueba DISABLE TRIGGER trigger_precio_prueba_cambio;
ALTER TABLE lista_precios_has_gprueba DISABLE TRIGGER trigger_precio_grupo_cambio;

-- 3. Para habilitar nuevamente:
ALTER TABLE prueba ENABLE TRIGGER trigger_precios_cambio;
ALTER TABLE grupo_prueba ENABLE TRIGGER trigger_grupos_cambio;
ALTER TABLE lista_precios_has_prueba ENABLE TRIGGER trigger_precio_prueba_cambio;
ALTER TABLE lista_precios_has_gprueba ENABLE TRIGGER trigger_precio_grupo_cambio;

-- 4. Para eliminar un trigger específico:
-- DROP TRIGGER IF EXISTS trigger_precios_cambio ON prueba;
-- DROP TRIGGER IF EXISTS trigger_grupos_cambio ON grupo_prueba;
-- DROP TRIGGER IF EXISTS trigger_precio_prueba_cambio ON lista_precios_has_prueba;
-- DROP TRIGGER IF EXISTS trigger_precio_grupo_cambio ON lista_precios_has_gprueba;
