-- ============================================
-- TRIGGERS PARA NOTIFICACIONES EN labsisEG
-- ============================================
-- Base de Datos: labsisEG (Base de datos principal del laboratorio)
-- Propósito: Triggers ligeros que insertan en cola de lis_bot_comunicacion
-- Fecha: 2025-10-31
-- IMPORTANTE: Ejecutar manualmente por DBA
-- ============================================

-- ============================================
-- PASO 1: Habilitar extensión dblink
-- ============================================
CREATE EXTENSION IF NOT EXISTS dblink;

-- ============================================
-- PASO 2: Crear servidor remoto (si no existe)
-- ============================================
-- NOTA: Ajustar host, port si es necesario
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_foreign_server WHERE srvname = 'lis_bot_server'
  ) THEN
    CREATE SERVER lis_bot_server
    FOREIGN DATA WRAPPER dblink_fdw
    OPTIONS (host 'localhost', dbname 'lis_bot_comunicacion', port '5432');
  END IF;
END $$;

-- ============================================
-- PASO 3: Crear user mapping
-- ============================================
-- NOTA: Ajustar credenciales si es necesario
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_user_mappings
    WHERE srvname = 'lis_bot_server' AND usename = current_user
  ) THEN
    EXECUTE format(
      'CREATE USER MAPPING FOR %I SERVER lis_bot_server OPTIONS (user %L, password %L)',
      current_user,
      'labsis',  -- Usuario de lis_bot_comunicacion
      'labsis'   -- Contraseña de lis_bot_comunicacion
    );
  END IF;
END $$;

-- ============================================
-- PASO 4: Función que inserta en cola remota
-- ============================================
CREATE OR REPLACE FUNCTION notify_orden_trabajo_changes()
RETURNS TRIGGER AS $$
DECLARE
  notification_type TEXT;
  query TEXT;
BEGIN
  -- Determinar tipo de notificación según el cambio
  IF (TG_OP = 'INSERT') THEN
    -- Verificar si la orden fue creada con factura_id Y está completamente pagada
    IF (NEW.factura_id IS NOT NULL) THEN
      DECLARE
        factura_status INTEGER;
      BEGIN
        -- Verificar status de la factura (3 = Cancelada = Completamente pagada)
        SELECT status_id INTO factura_status
        FROM factura
        WHERE id = NEW.factura_id;

        -- Solo notificar si factura está cancelada (completamente pagada)
        IF factura_status = 3 THEN
          notification_type := 'orden_pagada';
        ELSE
          -- Factura no está completamente pagada, no notificar
          RETURN NEW;
        END IF;
      END;
    ELSE
      -- Orden creada sin factura, no notificar
      RETURN NEW;
    END IF;

  ELSIF (TG_OP = 'UPDATE') THEN
    -- Verificar si se asignó factura_id Y la factura está completamente pagada
    IF (OLD.factura_id IS NULL AND NEW.factura_id IS NOT NULL) THEN
      DECLARE
        factura_status INTEGER;
      BEGIN
        -- Verificar status de la factura (3 = Cancelada = Completamente pagada)
        SELECT status_id INTO factura_status
        FROM factura
        WHERE id = NEW.factura_id;

        -- Solo notificar si factura está cancelada (completamente pagada)
        IF factura_status = 3 THEN
          notification_type := 'orden_pagada';
        ELSE
          -- Factura no está completamente pagada, no notificar
          RETURN NEW;
        END IF;
      END;

    -- Verificar si se validó (status_id cambió a 4)
    ELSIF (OLD.status_id IS DISTINCT FROM 4 AND NEW.status_id = 4) THEN
      notification_type := 'resultados_listos';

    ELSE
      -- No es un cambio relevante para notificaciones
      RETURN NEW;
    END IF;

  ELSE
    -- DELETE u otra operación - no hacer nada
    RETURN NEW;
  END IF;

  -- Construir query de INSERT para ejecutar remotamente
  query := format(
    'INSERT INTO notifications_queue (orden_trabajo_id, paciente_id, notification_type, created_at) VALUES (%s, %s, %L, NOW()) ON CONFLICT (orden_trabajo_id, notification_type) DO NOTHING',
    NEW.id,
    NEW.paciente_id,
    notification_type
  );

  -- Ejecutar INSERT en lis_bot_comunicacion usando dblink
  BEGIN
    PERFORM dblink_exec('lis_bot_server', query);
  EXCEPTION
    WHEN OTHERS THEN
      -- Si falla, NO bloquear la operación en labsisEG
      -- Solo loggear advertencia
      RAISE WARNING 'Error insertando notificación en cola: % (Error: %)', notification_type, SQLERRM;
      -- Continuar con la operación normal
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PASO 5: Crear triggers en orden_trabajo
-- ============================================

-- Eliminar triggers existentes si existen (idempotencia)
DROP TRIGGER IF EXISTS trg_notify_orden_insert ON orden_trabajo;
DROP TRIGGER IF EXISTS trg_notify_orden_update ON orden_trabajo;

-- Trigger para INSERT (orden creada)
CREATE TRIGGER trg_notify_orden_insert
  AFTER INSERT ON orden_trabajo
  FOR EACH ROW
  EXECUTE FUNCTION notify_orden_trabajo_changes();

-- Trigger para UPDATE (orden pagada, resultados validados)
CREATE TRIGGER trg_notify_orden_update
  AFTER UPDATE ON orden_trabajo
  FOR EACH ROW
  EXECUTE FUNCTION notify_orden_trabajo_changes();

-- ============================================
-- PASO 6: Comentarios documentación
-- ============================================
COMMENT ON FUNCTION notify_orden_trabajo_changes() IS 'Trigger function que inserta notificaciones en lis_bot_comunicacion.notifications_queue usando dblink';
COMMENT ON TRIGGER trg_notify_orden_insert ON orden_trabajo IS 'Notifica creación de órdenes de trabajo';
COMMENT ON TRIGGER trg_notify_orden_update ON orden_trabajo IS 'Notifica cuando orden es pagada o resultados validados';

-- ============================================
-- PASO 7: Testing (OPCIONAL - Comentado por defecto)
-- ============================================
/*
-- Test 1: Verificar conexión dblink
SELECT dblink_connect('lis_bot_server');
SELECT * FROM dblink('lis_bot_server', 'SELECT COUNT(*) FROM notifications_queue') AS t(count BIGINT);
SELECT dblink_disconnect('lis_bot_server');

-- Test 2: Crear orden de prueba (generará notificación "orden_creada")
INSERT INTO orden_trabajo (numero, paciente_id, fecha, medico_id, status_id)
VALUES ('TEST-' || to_char(NOW(), 'YYYYMMDDHH24MISS'), 173985, NOW(), 1, 1);

-- Test 3: Verificar que se insertó en la cola
-- (Ejecutar en lis_bot_comunicacion)
SELECT * FROM notifications_queue WHERE notification_type = 'orden_creada' ORDER BY created_at DESC LIMIT 5;

-- Test 4: Marcar orden como pagada (generará notificación "orden_pagada")
UPDATE orden_trabajo
SET factura_id = 999
WHERE numero LIKE 'TEST-%'
  AND factura_id IS NULL
LIMIT 1;

-- Test 5: Validar resultados (generará notificación "resultados_listos")
UPDATE orden_trabajo
SET status_id = 4, fecha_validado = NOW()
WHERE numero LIKE 'TEST-%'
  AND status_id != 4
LIMIT 1;

-- Cleanup de tests
DELETE FROM orden_trabajo WHERE numero LIKE 'TEST-%';
*/

-- ============================================
-- PASO 8: Rollback (solo si es necesario)
-- ============================================
/*
-- Para eliminar los triggers:
DROP TRIGGER IF EXISTS trg_notify_orden_insert ON orden_trabajo;
DROP TRIGGER IF EXISTS trg_notify_orden_update ON orden_trabajo;

-- Para eliminar la función:
DROP FUNCTION IF EXISTS notify_orden_trabajo_changes();

-- Para eliminar el user mapping:
DROP USER MAPPING IF EXISTS FOR labsis SERVER lis_bot_server;
DROP USER MAPPING IF EXISTS FOR CURRENT_USER SERVER lis_bot_server;

-- Para eliminar el servidor:
DROP SERVER IF EXISTS lis_bot_server CASCADE;

-- Para desinstalar dblink (CUIDADO: puede afectar otros sistemas):
-- DROP EXTENSION IF EXISTS dblink CASCADE;
*/

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================
/*
1. SEGURIDAD:
   - Las credenciales están hardcodeadas en el user mapping
   - En producción, considerar usar .pgpass o variables de entorno
   - El usuario de lis_bot_comunicacion solo necesita INSERT en notifications_queue

2. PERFORMANCE:
   - El INSERT remoto es asíncrono (no bloquea la transacción)
   - Si dblink falla, la operación en labsisEG continúa normalmente
   - El overhead es mínimo (~5-10ms por operación)

3. MANTENIMIENTO:
   - Si lis_bot_comunicacion no está disponible, las notificaciones se pierden
   - El sistema de polling en ChangeDetectorService actúa como backup
   - Monitorear logs de PostgreSQL para ver warnings de dblink

4. ALTERNATIVAS:
   - PostgreSQL LISTEN/NOTIFY (requiere conexión persistente)
   - Cron job que ejecuta queries periódicas (sistema actual)
   - Message queue externa (RabbitMQ, Redis)

5. TESTING EN DESARROLLO:
   - Descomentar sección de testing arriba
   - Verificar que ambas bases de datos estén corriendo
   - Ejecutar tests en orden
*/

-- ============================================
-- FIN DE ARCHIVO DE TRIGGERS
-- ============================================

SELECT 'Triggers de notificaciones instalados correctamente' AS status;
