-- Migración: Sistema de Notificaciones y Autenticación vía Telegram
-- Fecha: 2025-10-26
-- Descripción: Tablas para notificaciones automáticas y autenticación de pacientes

-- =========================================
-- 1. Tabla de Notificaciones Telegram
-- =========================================
CREATE TABLE IF NOT EXISTS telegram_notifications (
  id SERIAL PRIMARY KEY,
  orden_trabajo_id INTEGER REFERENCES orden_trabajo(id) ON DELETE CASCADE,
  paciente_id INTEGER REFERENCES paciente(id) ON DELETE CASCADE,
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

-- Índices para búsquedas rápidas
CREATE INDEX idx_telegram_notifications_orden ON telegram_notifications(orden_trabajo_id);
CREATE INDEX idx_telegram_notifications_paciente ON telegram_notifications(paciente_id);
CREATE INDEX idx_telegram_notifications_status ON telegram_notifications(status);
CREATE INDEX idx_telegram_notifications_type ON telegram_notifications(notification_type);

-- =========================================
-- 2. Tabla de Códigos de Autenticación
-- =========================================
CREATE TABLE IF NOT EXISTS telegram_auth_codes (
  id SERIAL PRIMARY KEY,
  paciente_id INTEGER REFERENCES paciente(id) ON DELETE CASCADE,
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

-- Índices
CREATE INDEX idx_telegram_auth_code ON telegram_auth_codes(code);
CREATE INDEX idx_telegram_auth_phone ON telegram_auth_codes(phone);
CREATE INDEX idx_telegram_auth_paciente ON telegram_auth_codes(paciente_id);
CREATE INDEX idx_telegram_auth_expires ON telegram_auth_codes(expires_at);

-- =========================================
-- 3. Tabla de Sesiones de Pacientes
-- =========================================
CREATE TABLE IF NOT EXISTS patient_sessions (
  id SERIAL PRIMARY KEY,
  paciente_id INTEGER REFERENCES paciente(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  telegram_chat_id VARCHAR(255),
  device_info JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  last_activity TIMESTAMP DEFAULT NOW(),
  ip_address VARCHAR(45),
  user_agent TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  revoked_at TIMESTAMP,
  revoke_reason TEXT
);

-- Índices
CREATE INDEX idx_patient_sessions_token ON patient_sessions(token);
CREATE INDEX idx_patient_sessions_paciente ON patient_sessions(paciente_id);
CREATE INDEX idx_patient_sessions_expires ON patient_sessions(expires_at);
CREATE INDEX idx_patient_sessions_active ON patient_sessions(is_active);

-- =========================================
-- 4. Funciones de Utilidad
-- =========================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para telegram_notifications
CREATE TRIGGER update_telegram_notifications_updated_at
  BEFORE UPDATE ON telegram_notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =========================================
-- 5. Función para limpiar códigos expirados
-- =========================================
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
$$ language 'plpgsql';

-- =========================================
-- 6. Función para limpiar sesiones expiradas
-- =========================================
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
$$ language 'plpgsql';

-- =========================================
-- 7. Comentarios en tablas
-- =========================================
COMMENT ON TABLE telegram_notifications IS 'Registro de notificaciones enviadas vía Telegram a pacientes';
COMMENT ON TABLE telegram_auth_codes IS 'Códigos de autenticación de 6 dígitos para login vía Telegram';
COMMENT ON TABLE patient_sessions IS 'Sesiones activas de pacientes con tokens JWT';

COMMENT ON COLUMN telegram_notifications.notification_type IS 'Tipo: orden_pagada o resultados_listos';
COMMENT ON COLUMN telegram_auth_codes.code IS 'Código de 6 dígitos generado aleatoriamente';
COMMENT ON COLUMN patient_sessions.token IS 'Token JWT para autenticación';
COMMENT ON COLUMN patient_sessions.expires_at IS 'Expiración configurada en 30 días desde creación';
