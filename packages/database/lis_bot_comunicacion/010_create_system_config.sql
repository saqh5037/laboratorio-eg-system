-- ================================================================
-- Migration: 010_create_system_config
-- Description: Tabla principal de configuración del sistema
-- Database: lis_bot_comunicacion
-- Created: 2025-11-05
-- ================================================================

-- Tabla principal de configuración del sistema
CREATE TABLE IF NOT EXISTS system_config (
  id SERIAL PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  data_type VARCHAR(20) DEFAULT 'string'
    CHECK (data_type IN ('string', 'number', 'boolean', 'json')),
  category VARCHAR(50) DEFAULT 'general'
    CHECK (category IN ('ui', 'auth', 'features', 'integrations', 'security', 'system')),
  description TEXT,
  is_secret BOOLEAN DEFAULT FALSE,
  is_editable BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by VARCHAR(100),
  updated_by VARCHAR(100)
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_system_config_key ON system_config(key);
CREATE INDEX IF NOT EXISTS idx_system_config_category ON system_config(category);
CREATE INDEX IF NOT EXISTS idx_system_config_updated ON system_config(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_config_editable ON system_config(is_editable);

-- Comentarios de documentación
COMMENT ON TABLE system_config IS 'Configuración centralizada del sistema laboratorio-eg. Almacena todas las configuraciones dinámicas que se pueden modificar sin deployments.';
COMMENT ON COLUMN system_config.key IS 'Clave única de configuración (ej: ui.pages.resultados.enabled, auth.methods.telegram.priority)';
COMMENT ON COLUMN system_config.value IS 'Valor almacenado como texto. Se convierte según data_type al leer.';
COMMENT ON COLUMN system_config.data_type IS 'Tipo de dato para conversión correcta: string, number, boolean, json';
COMMENT ON COLUMN system_config.category IS 'Categoría de la configuración: ui, auth, features, integrations, security, system';
COMMENT ON COLUMN system_config.description IS 'Descripción legible de qué controla esta configuración';
COMMENT ON COLUMN system_config.is_secret IS 'Indica si es información sensible (no mostrar en logs públicos)';
COMMENT ON COLUMN system_config.is_editable IS 'Permite bloquear edición de configuraciones críticas del sistema';
COMMENT ON COLUMN system_config.created_by IS 'Usuario que creó la configuración';
COMMENT ON COLUMN system_config.updated_by IS 'Último usuario que modificó la configuración';

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_system_config_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER system_config_update_timestamp
BEFORE UPDATE ON system_config
FOR EACH ROW
EXECUTE FUNCTION update_system_config_timestamp();

-- Mensaje de éxito
DO $$
BEGIN
  RAISE NOTICE 'Tabla system_config creada exitosamente en lis_bot_comunicacion';
END $$;
