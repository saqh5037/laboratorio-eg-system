-- Migration 028: Create config_audit table
-- Tabla de auditoría para tracking de cambios en system_config
-- Permite ver historial completo de modificaciones

CREATE TABLE IF NOT EXISTS config_audit (
  id SERIAL PRIMARY KEY,
  config_id INTEGER REFERENCES system_config(id) ON DELETE SET NULL,
  key VARCHAR(200) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_by VARCHAR(50) NOT NULL,
  changed_at TIMESTAMP DEFAULT NOW(),
  change_type VARCHAR(20) CHECK (change_type IN ('create', 'update', 'delete')) DEFAULT 'update'
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_config_audit_config_id ON config_audit(config_id);
CREATE INDEX idx_config_audit_key ON config_audit(key);
CREATE INDEX idx_config_audit_changed_by ON config_audit(changed_by);
CREATE INDEX idx_config_audit_changed_at ON config_audit(changed_at DESC);

-- Comentario
COMMENT ON TABLE config_audit IS 'Registro de auditoría de cambios en configuraciones del sistema. Permite ver quién cambió qué y cuándo.';
