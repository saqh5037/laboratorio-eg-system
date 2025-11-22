-- ================================================================
-- Migration: 011_create_system_config_audit
-- Description: Tabla de auditoría para cambios en system_config
-- Database: lis_bot_comunicacion
-- Created: 2025-11-05
-- ================================================================

-- Tabla de auditoría de cambios en configuración
CREATE TABLE IF NOT EXISTS system_config_audit (
  id SERIAL PRIMARY KEY,
  config_id INT REFERENCES system_config(id) ON DELETE SET NULL,
  key VARCHAR(100) NOT NULL,
  old_value TEXT,
  new_value TEXT NOT NULL,
  changed_by VARCHAR(100) NOT NULL,
  changed_at TIMESTAMP DEFAULT NOW(),
  change_reason TEXT,
  ip_address VARCHAR(50),
  user_agent TEXT
);

-- Índices para consultas rápidas de auditoría
CREATE INDEX IF NOT EXISTS idx_config_audit_config_id ON system_config_audit(config_id);
CREATE INDEX IF NOT EXISTS idx_config_audit_key ON system_config_audit(key);
CREATE INDEX IF NOT EXISTS idx_config_audit_changed_at ON system_config_audit(changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_config_audit_changed_by ON system_config_audit(changed_by);

-- Comentarios de documentación
COMMENT ON TABLE system_config_audit IS 'Auditoría completa de todos los cambios realizados en system_config';
COMMENT ON COLUMN system_config_audit.config_id IS 'FK a system_config. NULL si la configuración fue eliminada.';
COMMENT ON COLUMN system_config_audit.key IS 'Copia de la key de configuración para histórico';
COMMENT ON COLUMN system_config_audit.old_value IS 'Valor anterior antes del cambio';
COMMENT ON COLUMN system_config_audit.new_value IS 'Nuevo valor después del cambio';
COMMENT ON COLUMN system_config_audit.changed_by IS 'Usuario que realizó el cambio (username o email)';
COMMENT ON COLUMN system_config_audit.changed_at IS 'Timestamp del cambio';
COMMENT ON COLUMN system_config_audit.change_reason IS 'Razón opcional del cambio (ej: "Mantenimiento programado")';
COMMENT ON COLUMN system_config_audit.ip_address IS 'IP del usuario que realizó el cambio';
COMMENT ON COLUMN system_config_audit.user_agent IS 'User agent del navegador';

-- Función para registrar cambios automáticamente
CREATE OR REPLACE FUNCTION log_config_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo registrar si el valor cambió realmente
  IF OLD.value IS DISTINCT FROM NEW.value THEN
    INSERT INTO system_config_audit (
      config_id,
      key,
      old_value,
      new_value,
      changed_by,
      changed_at
    ) VALUES (
      OLD.id,
      OLD.key,
      OLD.value,
      NEW.value,
      NEW.updated_by,
      NOW()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger que se ejecuta después de cada UPDATE en system_config
CREATE TRIGGER config_audit_trigger
AFTER UPDATE ON system_config
FOR EACH ROW
EXECUTE FUNCTION log_config_change();

-- Función para registrar eliminaciones
CREATE OR REPLACE FUNCTION log_config_deletion()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO system_config_audit (
    config_id,
    key,
    old_value,
    new_value,
    changed_by,
    changed_at,
    change_reason
  ) VALUES (
    NULL,  -- config_id es NULL porque fue eliminado
    OLD.key,
    OLD.value,
    '[DELETED]',
    COALESCE(OLD.updated_by, 'system'),
    NOW(),
    'Configuración eliminada'
  );
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger para eliminaciones
CREATE TRIGGER config_deletion_audit_trigger
AFTER DELETE ON system_config
FOR EACH ROW
EXECUTE FUNCTION log_config_deletion();

-- Mensaje de éxito
DO $$
BEGIN
  RAISE NOTICE 'Tabla system_config_audit y triggers creados exitosamente';
END $$;
