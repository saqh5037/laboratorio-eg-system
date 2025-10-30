-- =====================================================
-- Migración 003: Tabla de tokens de autorización de Telegram
-- =====================================================
-- Descripción: Tabla para almacenar tokens temporales que permiten
--              a los pacientes autorizar la comunicación con Telegram
--              mediante deep links. Los tokens expiran en 10 minutos.
-- Base de datos: lis_bot_comunicacion
-- Fecha: 2025-10-29
-- =====================================================

-- Crear tabla de tokens de autorización
CREATE TABLE IF NOT EXISTS telegram_auth_tokens (
    id SERIAL PRIMARY KEY,
    token VARCHAR(100) UNIQUE NOT NULL,
    paciente_id INTEGER NOT NULL,
    phone VARCHAR(50) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_telegram_auth_tokens_token ON telegram_auth_tokens(token);
CREATE INDEX IF NOT EXISTS idx_telegram_auth_tokens_paciente ON telegram_auth_tokens(paciente_id);
CREATE INDEX IF NOT EXISTS idx_telegram_auth_tokens_expires ON telegram_auth_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_telegram_auth_tokens_used ON telegram_auth_tokens(used);

-- Comentarios
COMMENT ON TABLE telegram_auth_tokens IS 'Tokens temporales para autorización de comunicación por Telegram (expiran en 10 min)';
COMMENT ON COLUMN telegram_auth_tokens.token IS 'Token único generado para el deep link de Telegram';
COMMENT ON COLUMN telegram_auth_tokens.paciente_id IS 'ID del paciente en la base de datos de LABSIS';
COMMENT ON COLUMN telegram_auth_tokens.phone IS 'Teléfono del paciente';
COMMENT ON COLUMN telegram_auth_tokens.expires_at IS 'Fecha/hora de expiración del token (10 minutos después de creación)';
COMMENT ON COLUMN telegram_auth_tokens.used IS 'Indica si el token ya fue usado para autorizar';
COMMENT ON COLUMN telegram_auth_tokens.used_at IS 'Fecha/hora en que se usó el token';
COMMENT ON COLUMN telegram_auth_tokens.created_at IS 'Fecha/hora de creación del token';
