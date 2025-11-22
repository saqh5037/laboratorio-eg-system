-- Migration 026: Create configuration_backups table
-- Sistema de backup/restore de configuraciones
-- Permite guardar snapshots completos de configuración con nombre

BEGIN;

-- Crear tabla para almacenar backups
CREATE TABLE IF NOT EXISTS configuration_backups (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  data JSONB NOT NULL,
  created_by VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_configuration_backups_name ON configuration_backups(name);
CREATE INDEX IF NOT EXISTS idx_configuration_backups_created_at ON configuration_backups(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_configuration_backups_created_by ON configuration_backups(created_by);

-- Comentarios
COMMENT ON TABLE configuration_backups IS 'Almacena backups completos de configuración del sistema';
COMMENT ON COLUMN configuration_backups.name IS 'Nombre identificador único del backup (ej: elizabeth-gutierrez, microtech)';
COMMENT ON COLUMN configuration_backups.description IS 'Descripción opcional del backup';
COMMENT ON COLUMN configuration_backups.data IS 'JSON completo con toda la configuración exportada';
COMMENT ON COLUMN configuration_backups.created_by IS 'Usuario que creó el backup';

COMMIT;
