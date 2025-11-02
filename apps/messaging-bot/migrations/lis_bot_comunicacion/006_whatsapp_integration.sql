-- ================================================================
-- MIGRACIÓN 006: Integración Completa de WhatsApp
-- ================================================================
-- Fecha: 2025-10-31
-- Autor: Claude + Samuel Quiroz
-- Descripción:
--   - Agregar soporte completo de WhatsApp al sistema
--   - Extender twilio_user_registry con paciente_id
--   - Renombrar telegram_notifications a system_notifications
--   - Agregar índices para performance
-- ================================================================

BEGIN;

-- ================================================================
-- 1. EXTENDER twilio_user_registry
-- ================================================================

-- Agregar paciente_id si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'twilio_user_registry'
        AND column_name = 'paciente_id'
    ) THEN
        ALTER TABLE twilio_user_registry
        ADD COLUMN paciente_id INTEGER;

        COMMENT ON COLUMN twilio_user_registry.paciente_id IS
        'ID del paciente en LABSIS (FK lógica, no física)';
    END IF;
END $$;

-- Agregar verification_status
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'twilio_user_registry'
        AND column_name = 'verification_status'
    ) THEN
        ALTER TABLE twilio_user_registry
        ADD COLUMN verification_status VARCHAR(20) DEFAULT 'pending'
        CHECK (verification_status IN ('pending', 'verified', 'rejected'));

        COMMENT ON COLUMN twilio_user_registry.verification_status IS
        'Estado de verificación del número de WhatsApp';
    END IF;
END $$;

-- Agregar verified_at
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'twilio_user_registry'
        AND column_name = 'verified_at'
    ) THEN
        ALTER TABLE twilio_user_registry
        ADD COLUMN verified_at TIMESTAMP;

        COMMENT ON COLUMN twilio_user_registry.verified_at IS
        'Fecha y hora de verificación del número';
    END IF;
END $$;

-- ================================================================
-- 2. ÍNDICES PARA twilio_user_registry
-- ================================================================

-- Índice por paciente_id (búsqueda rápida de números por paciente)
CREATE INDEX IF NOT EXISTS idx_twilio_user_paciente_id
ON twilio_user_registry(paciente_id)
WHERE paciente_id IS NOT NULL;

-- Índice por phone_number (búsqueda rápida por teléfono)
CREATE INDEX IF NOT EXISTS idx_twilio_user_phone
ON twilio_user_registry(phone_number);

-- Índice compuesto para búsquedas combinadas
CREATE INDEX IF NOT EXISTS idx_twilio_user_paciente_phone
ON twilio_user_registry(paciente_id, phone_number)
WHERE paciente_id IS NOT NULL;

-- Índice para usuarios activos con WhatsApp habilitado
CREATE INDEX IF NOT EXISTS idx_twilio_user_active_whatsapp
ON twilio_user_registry(paciente_id)
WHERE whatsapp_enabled = TRUE AND is_active = TRUE;

-- ================================================================
-- 3. RENOMBRAR Y EXTENDER system_notifications
-- ================================================================

-- Renombrar telegram_notifications a system_notifications (si no existe)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'telegram_notifications'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'system_notifications'
    ) THEN
        ALTER TABLE telegram_notifications RENAME TO system_notifications;

        -- Renombrar el check constraint si existe
        ALTER TABLE system_notifications
        DROP CONSTRAINT IF EXISTS telegram_notifications_notification_type_check;

        -- Renombrar índices
        ALTER INDEX IF EXISTS telegram_notifications_pkey
        RENAME TO system_notifications_pkey;
    END IF;
END $$;

-- Agregar columna channel si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'system_notifications'
        AND column_name = 'channel'
    ) THEN
        ALTER TABLE system_notifications
        ADD COLUMN channel VARCHAR(20) DEFAULT 'telegram'
        CHECK (channel IN ('telegram', 'whatsapp', 'sms', 'email'));

        COMMENT ON COLUMN system_notifications.channel IS
        'Canal por el que se envió la notificación';
    END IF;
END $$;

-- Agregar twilio_message_sid si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'system_notifications'
        AND column_name = 'twilio_message_sid'
    ) THEN
        ALTER TABLE system_notifications
        ADD COLUMN twilio_message_sid VARCHAR(255);

        COMMENT ON COLUMN system_notifications.twilio_message_sid IS
        'SID del mensaje de Twilio (para WhatsApp/SMS)';
    END IF;
END $$;

-- Agregar delivery_status si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'system_notifications'
        AND column_name = 'delivery_status'
    ) THEN
        ALTER TABLE system_notifications
        ADD COLUMN delivery_status VARCHAR(50);

        COMMENT ON COLUMN system_notifications.delivery_status IS
        'Estado de entrega reportado por Twilio';
    END IF;
END $$;

-- Agregar phone_number si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'system_notifications'
        AND column_name = 'phone_number'
    ) THEN
        ALTER TABLE system_notifications
        ADD COLUMN phone_number VARCHAR(20);

        COMMENT ON COLUMN system_notifications.phone_number IS
        'Número de teléfono destino (para WhatsApp/SMS)';
    END IF;
END $$;

-- ================================================================
-- 4. ÍNDICES PARA system_notifications
-- ================================================================

-- Índice por channel (filtrar notificaciones por canal)
CREATE INDEX IF NOT EXISTS idx_system_notif_channel
ON system_notifications(channel);

-- Índice por notification_type y channel
CREATE INDEX IF NOT EXISTS idx_system_notif_type_channel
ON system_notifications(notification_type, channel);

-- Índice por paciente_id y sent_at (historial de notificaciones)
CREATE INDEX IF NOT EXISTS idx_system_notif_paciente_sent
ON system_notifications(paciente_id, sent_at DESC);

-- Índice por twilio_message_sid (búsqueda por SID de Twilio)
CREATE INDEX IF NOT EXISTS idx_system_notif_twilio_sid
ON system_notifications(twilio_message_sid)
WHERE twilio_message_sid IS NOT NULL;

-- ================================================================
-- 5. FUNCIÓN: Buscar número de WhatsApp de paciente
-- ================================================================

CREATE OR REPLACE FUNCTION get_patient_whatsapp_number(p_paciente_id INTEGER)
RETURNS VARCHAR(20)
LANGUAGE plpgsql
AS $$
DECLARE
    v_phone_number VARCHAR(20);
BEGIN
    -- Buscar número de WhatsApp activo del paciente
    SELECT phone_number INTO v_phone_number
    FROM twilio_user_registry
    WHERE paciente_id = p_paciente_id
      AND whatsapp_enabled = TRUE
      AND is_active = TRUE
    ORDER BY last_interaction DESC
    LIMIT 1;

    RETURN v_phone_number;
END;
$$;

COMMENT ON FUNCTION get_patient_whatsapp_number(INTEGER) IS
'Obtiene el número de WhatsApp activo más reciente de un paciente';

-- ================================================================
-- 6. FUNCIÓN: Obtener todos los canales de notificación de un paciente
-- ================================================================

CREATE OR REPLACE FUNCTION get_patient_notification_channels(p_paciente_id INTEGER)
RETURNS TABLE (
    channel VARCHAR(20),
    identifier VARCHAR(255),
    enabled BOOLEAN,
    last_used TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Telegram
    RETURN QUERY
    SELECT
        'telegram'::VARCHAR(20) as channel,
        telegram_chat_id::VARCHAR(255) as identifier,
        is_active as enabled,
        last_interaction as last_used
    FROM telegram_user_registry
    WHERE paciente_id = p_paciente_id
      AND is_active = TRUE
    ORDER BY last_interaction DESC
    LIMIT 1;

    -- WhatsApp
    RETURN QUERY
    SELECT
        'whatsapp'::VARCHAR(20) as channel,
        phone_number::VARCHAR(255) as identifier,
        whatsapp_enabled as enabled,
        last_interaction as last_used
    FROM twilio_user_registry
    WHERE paciente_id = p_paciente_id
      AND whatsapp_enabled = TRUE
      AND is_active = TRUE
    ORDER BY last_interaction DESC
    LIMIT 1;

    -- SMS
    RETURN QUERY
    SELECT
        'sms'::VARCHAR(20) as channel,
        phone_number::VARCHAR(255) as identifier,
        sms_enabled as enabled,
        last_interaction as last_used
    FROM twilio_user_registry
    WHERE paciente_id = p_paciente_id
      AND sms_enabled = TRUE
      AND is_active = TRUE
    ORDER BY last_interaction DESC
    LIMIT 1;

    RETURN;
END;
$$;

COMMENT ON FUNCTION get_patient_notification_channels(INTEGER) IS
'Obtiene todos los canales de notificación activos de un paciente';

-- ================================================================
-- 7. VISTA: Resumen de usuarios multi-canal
-- ================================================================

CREATE OR REPLACE VIEW v_multi_channel_users AS
SELECT
    COALESCE(t.paciente_id, w.paciente_id) as paciente_id,
    t.telegram_chat_id,
    t.is_active as telegram_active,
    w.phone_number as whatsapp_number,
    w.whatsapp_enabled,
    w.sms_enabled,
    w.is_active as whatsapp_active,
    GREATEST(t.last_interaction, w.last_interaction) as last_interaction
FROM telegram_user_registry t
FULL OUTER JOIN twilio_user_registry w
    ON t.paciente_id = w.paciente_id
WHERE (t.is_active = TRUE OR w.is_active = TRUE);

COMMENT ON VIEW v_multi_channel_users IS
'Vista consolidada de usuarios con acceso multi-canal (Telegram + WhatsApp)';

-- ================================================================
-- 8. TRIGGER: Actualizar last_interaction automáticamente
-- ================================================================

-- Función del trigger
CREATE OR REPLACE FUNCTION update_user_last_interaction()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Actualizar last_interaction en twilio_user_registry
    IF NEW.channel IN ('whatsapp', 'sms') AND NEW.phone_number IS NOT NULL THEN
        UPDATE twilio_user_registry
        SET last_interaction = NOW()
        WHERE phone_number = NEW.phone_number;
    END IF;

    -- Actualizar last_interaction en telegram_user_registry
    IF NEW.channel = 'telegram' AND NEW.telegram_chat_id IS NOT NULL THEN
        UPDATE telegram_user_registry
        SET last_interaction = NOW()
        WHERE telegram_chat_id = NEW.telegram_chat_id;
    END IF;

    RETURN NEW;
END;
$$;

-- Crear trigger si no existe
DROP TRIGGER IF EXISTS trg_update_user_interaction ON system_notifications;
CREATE TRIGGER trg_update_user_interaction
    AFTER INSERT ON system_notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_user_last_interaction();

COMMENT ON TRIGGER trg_update_user_interaction ON system_notifications IS
'Actualiza automáticamente last_interaction cuando se envía una notificación';

-- ================================================================
-- 9. DATOS DE CONFIGURACIÓN
-- ================================================================

-- Insertar configuración de canales si no existe
INSERT INTO app_config (key, value, description, created_at)
VALUES
    ('whatsapp_enabled', 'true', 'WhatsApp notifications enabled', NOW()),
    ('whatsapp_sandbox_mode', 'true', 'Using Twilio WhatsApp Sandbox', NOW()),
    ('notification_channels', '["telegram", "whatsapp", "sms"]', 'Active notification channels', NOW())
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value,
    updated_at = NOW();

-- ================================================================
-- 10. ESTADÍSTICAS Y VALIDACIÓN
-- ================================================================

-- Contar usuarios multi-canal
DO $$
DECLARE
    v_telegram_users INTEGER;
    v_whatsapp_users INTEGER;
    v_multi_channel_users INTEGER;
BEGIN
    -- Contar usuarios de Telegram
    SELECT COUNT(*) INTO v_telegram_users
    FROM telegram_user_registry
    WHERE is_active = TRUE;

    -- Contar usuarios de WhatsApp
    SELECT COUNT(*) INTO v_whatsapp_users
    FROM twilio_user_registry
    WHERE whatsapp_enabled = TRUE AND is_active = TRUE;

    -- Contar usuarios multi-canal
    SELECT COUNT(*) INTO v_multi_channel_users
    FROM v_multi_channel_users
    WHERE telegram_active = TRUE AND whatsapp_active = TRUE;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'ESTADÍSTICAS DE MIGRACIÓN:';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Usuarios Telegram activos: %', v_telegram_users;
    RAISE NOTICE 'Usuarios WhatsApp activos: %', v_whatsapp_users;
    RAISE NOTICE 'Usuarios multi-canal: %', v_multi_channel_users;
    RAISE NOTICE '========================================';
END $$;

COMMIT;

-- ================================================================
-- FIN DE MIGRACIÓN 006
-- ================================================================

-- Verificar que todo se creó correctamente
SELECT
    'twilio_user_registry columns' as check_type,
    COUNT(*) as count
FROM information_schema.columns
WHERE table_name = 'twilio_user_registry'
  AND column_name IN ('paciente_id', 'verification_status', 'verified_at')

UNION ALL

SELECT
    'system_notifications columns' as check_type,
    COUNT(*) as count
FROM information_schema.columns
WHERE table_name = 'system_notifications'
  AND column_name IN ('channel', 'twilio_message_sid', 'delivery_status', 'phone_number')

UNION ALL

SELECT
    'functions' as check_type,
    COUNT(*) as count
FROM pg_proc
WHERE proname IN ('get_patient_whatsapp_number', 'get_patient_notification_channels')

UNION ALL

SELECT
    'views' as check_type,
    COUNT(*) as count
FROM information_schema.views
WHERE table_name = 'v_multi_channel_users';
