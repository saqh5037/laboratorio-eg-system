-- ============================================
-- LIS_BOT_COMUNICACION - Tablas Telegram y Autenticación
-- ============================================
-- Fecha: 2025-10-29
-- ============================================

-- IMPORTANTE: Sin Foreign Keys a labsisEG
-- Las relaciones con paciente, orden_trabajo se validan en código

-- ============================================
-- 1. TELEGRAM_NOTIFICATIONS - Notificaciones Enviadas
-- ============================================
CREATE TABLE IF NOT EXISTS telegram_notifications (
  id SERIAL PRIMARY KEY,
  orden_trabajo_id INTEGER,  -- NO FK - Validación en código
  paciente_id INTEGER,       -- NO FK - Validación en código
  notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('orden_pagada', 'resultados_listos')),
  telegram_chat_id VARCHAR(255),
  message_text TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('sent', 'failed', 'pending')),
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_telegram_notifications_orden ON telegram_notifications(orden_trabajo_id);
CREATE INDEX idx_telegram_notifications_paciente ON telegram_notifications(paciente_id);
CREATE INDEX idx_telegram_notifications_status ON telegram_notifications(status);
CREATE INDEX idx_telegram_notifications_type ON telegram_notifications(notification_type);

COMMENT ON TABLE telegram_notifications IS 'Notificaciones enviadas vía Telegram';
COMMENT ON COLUMN telegram_notifications.orden_trabajo_id IS 'ID de orden_trabajo en labsisEG (sin FK)';
COMMENT ON COLUMN telegram_notifications.paciente_id IS 'ID de paciente en labsisEG (sin FK)';

-- ============================================
-- 2. TELEGRAM_AUTH_CODES - Códigos de Autenticación
-- ============================================
CREATE TABLE IF NOT EXISTS telegram_auth_codes (
  id SERIAL PRIMARY KEY,
  paciente_id INTEGER,  -- NO FK - Validación en código
  phone VARCHAR(50) NOT NULL,
  code VARCHAR(6) NOT NULL,
  telegram_chat_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP,
  attempts INTEGER DEFAULT 0,
  ip_address VARCHAR(45),
  user_agent TEXT
);

CREATE INDEX idx_telegram_auth_code ON telegram_auth_codes(code);
CREATE INDEX idx_telegram_auth_phone ON telegram_auth_codes(phone);
CREATE INDEX idx_telegram_auth_paciente ON telegram_auth_codes(paciente_id);
CREATE INDEX idx_telegram_auth_expires ON telegram_auth_codes(expires_at);

COMMENT ON TABLE telegram_auth_codes IS 'Códigos de autenticación de 6 dígitos';
COMMENT ON COLUMN telegram_auth_codes.paciente_id IS 'ID de paciente en labsisEG (sin FK)';
COMMENT ON COLUMN telegram_auth_codes.code IS 'Código de 6 dígitos generado aleatoriamente';

-- ============================================
-- 3. TELEGRAM_USER_REGISTRY - Registro de Usuarios Telegram
-- ============================================
CREATE TABLE IF NOT EXISTS telegram_user_registry (
  id SERIAL PRIMARY KEY,
  telegram_chat_id BIGINT NOT NULL UNIQUE,
  telegram_username VARCHAR(255),
  telegram_first_name VARCHAR(255),
  telegram_last_name VARCHAR(255),
  phone VARCHAR(20),
  paciente_id INTEGER,  -- NO FK - Validación en código
  registered_at TIMESTAMP DEFAULT NOW(),
  last_interaction TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_telegram_user_registry_phone ON telegram_user_registry(phone);
CREATE INDEX idx_telegram_user_registry_paciente ON telegram_user_registry(paciente_id);
CREATE INDEX idx_telegram_user_registry_active ON telegram_user_registry(is_active);

COMMENT ON TABLE telegram_user_registry IS 'Registro de usuarios de Telegram vinculados con pacientes';
COMMENT ON COLUMN telegram_user_registry.paciente_id IS 'ID de paciente en labsisEG (sin FK)';
COMMENT ON COLUMN telegram_user_registry.telegram_chat_id IS 'Chat ID de Telegram del usuario';

-- ============================================
-- 4. PATIENT_SESSIONS - Sesiones de Pacientes
-- ============================================
CREATE TABLE IF NOT EXISTS patient_sessions (
  id SERIAL PRIMARY KEY,
  paciente_id INTEGER,  -- NO FK - Validación en código
  token VARCHAR(255) UNIQUE NOT NULL,
  telegram_chat_id VARCHAR(255),
  device_info JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  last_used_at TIMESTAMP DEFAULT NOW(),
  ip_address VARCHAR(45),
  user_agent TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  revoked_at TIMESTAMP,
  revoke_reason TEXT
);

CREATE INDEX idx_patient_sessions_token ON patient_sessions(token);
CREATE INDEX idx_patient_sessions_paciente ON patient_sessions(paciente_id);
CREATE INDEX idx_patient_sessions_expires ON patient_sessions(expires_at);
CREATE INDEX idx_patient_sessions_active ON patient_sessions(is_active);
CREATE INDEX idx_patient_sessions_telegram_chat ON patient_sessions(telegram_chat_id);

COMMENT ON TABLE patient_sessions IS 'Sesiones activas de pacientes con tokens JWT';
COMMENT ON COLUMN patient_sessions.paciente_id IS 'ID de paciente en labsisEG (sin FK)';
COMMENT ON COLUMN patient_sessions.token IS 'Token JWT para autenticación';
COMMENT ON COLUMN patient_sessions.expires_at IS 'Expiración configurada en 30 días';

-- ============================================
-- FUNCIONES DE LIMPIEZA
-- ============================================

-- Función: Limpiar códigos de autenticación expirados
CREATE OR REPLACE FUNCTION cleanup_expired_auth_codes()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM telegram_auth_codes
  WHERE expires_at < NOW() - INTERVAL '24 hours';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_expired_auth_codes() IS 'Elimina códigos expirados hace más de 24 horas';

-- Función: Limpiar sesiones expiradas
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  UPDATE patient_sessions
  SET is_active = FALSE,
      revoked_at = NOW(),
      revoke_reason = 'Sesión expirada automáticamente'
  WHERE expires_at < NOW()
    AND is_active = TRUE;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_expired_sessions() IS 'Marca sesiones expiradas como inactivas';

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger: Auto-update updated_at en telegram_notifications
DROP TRIGGER IF EXISTS trigger_telegram_notifications_updated_at ON telegram_notifications;
CREATE TRIGGER trigger_telegram_notifications_updated_at
  BEFORE UPDATE ON telegram_notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- MENSAJE DE COMPLETADO
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '✅ Migración 002_telegram_auth_tables.sql completada';
    RAISE NOTICE 'Tablas creadas: 4 (telegram_*, patient_sessions)';
    RAISE NOTICE 'Funciones creadas: 2 (cleanup functions)';
    RAISE NOTICE 'Triggers creados: 1';
END $$;
