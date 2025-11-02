-- ============================================
-- Migration 007: Verification Codes Table
-- ============================================
-- Tabla para almacenar códigos de verificación
-- Soporta SMS, WhatsApp, Telegram
-- ============================================

BEGIN;

-- ============================================
-- 1. CREAR TABLA verification_codes
-- ============================================

CREATE TABLE IF NOT EXISTS verification_codes (
    id SERIAL PRIMARY KEY,
    phone_number VARCHAR(20) NOT NULL,
    code VARCHAR(10) NOT NULL,
    channel VARCHAR(20) NOT NULL, -- 'sms', 'whatsapp', 'telegram'
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP,
    attempts INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 2. CREAR ÍNDICES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_verification_codes_phone
    ON verification_codes(phone_number);

CREATE INDEX IF NOT EXISTS idx_verification_codes_phone_channel
    ON verification_codes(phone_number, channel);

CREATE INDEX IF NOT EXISTS idx_verification_codes_expires
    ON verification_codes(expires_at)
    WHERE is_used = FALSE;

CREATE INDEX IF NOT EXISTS idx_verification_codes_active
    ON verification_codes(phone_number, channel, is_used, expires_at);

-- ============================================
-- 3. COMENTARIOS
-- ============================================

COMMENT ON TABLE verification_codes IS
'Códigos de verificación para autenticación multi-canal (SMS, WhatsApp, Telegram)';

COMMENT ON COLUMN verification_codes.phone_number IS
'Número de teléfono en formato E.164 (+5215516867745)';

COMMENT ON COLUMN verification_codes.code IS
'Código de verificación de 6 dígitos';

COMMENT ON COLUMN verification_codes.channel IS
'Canal de envío: sms, whatsapp, telegram';

COMMENT ON COLUMN verification_codes.expires_at IS
'Fecha de expiración del código (típicamente 10 minutos)';

COMMENT ON COLUMN verification_codes.attempts IS
'Número de intentos de validación (máximo 5)';

COMMENT ON COLUMN verification_codes.metadata IS
'Metadata adicional en formato JSON';

-- ============================================
-- 4. TRIGGER PARA updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_verification_codes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_verification_codes_updated_at ON verification_codes;

CREATE TRIGGER trg_verification_codes_updated_at
    BEFORE UPDATE ON verification_codes
    FOR EACH ROW
    EXECUTE FUNCTION update_verification_codes_updated_at();

-- ============================================
-- 5. FUNCIÓN DE LIMPIEZA AUTOMÁTICA
-- ============================================

CREATE OR REPLACE FUNCTION cleanup_expired_verification_codes()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM verification_codes
    WHERE expires_at < NOW() - INTERVAL '24 hours';

    GET DIAGNOSTICS deleted_count = ROW_COUNT;

    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_expired_verification_codes() IS
'Limpia códigos de verificación expirados (más de 24 horas)';

-- ============================================
-- 6. CREAR TABLA whatsapp_auth_tokens
-- ============================================

CREATE TABLE IF NOT EXISTS whatsapp_auth_tokens (
    id SERIAL PRIMARY KEY,
    token VARCHAR(64) UNIQUE NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    paciente_id INTEGER,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_auth_tokens_token
    ON whatsapp_auth_tokens(token);

CREATE INDEX IF NOT EXISTS idx_whatsapp_auth_tokens_phone
    ON whatsapp_auth_tokens(phone_number);

CREATE INDEX IF NOT EXISTS idx_whatsapp_auth_tokens_active
    ON whatsapp_auth_tokens(token, is_used, expires_at);

COMMENT ON TABLE whatsapp_auth_tokens IS
'Tokens de autorización para sandbox de Twilio WhatsApp';

-- ============================================
-- 7. VERIFICACIÓN
-- ============================================

DO $$
DECLARE
    table_count INTEGER;
    index_count INTEGER;
BEGIN
    -- Verificar tabla
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_name = 'verification_codes';

    -- Verificar índices
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes
    WHERE tablename = 'verification_codes';

    RAISE NOTICE '========================================';
    RAISE NOTICE 'VERIFICACIÓN DE MIGRACIÓN 007:';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tabla verification_codes: %', CASE WHEN table_count = 1 THEN '✅' ELSE '❌' END;
    RAISE NOTICE 'Índices creados: % índices', index_count;
    RAISE NOTICE '========================================';
END $$;

COMMIT;
