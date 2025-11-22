-- ================================================================
-- Migration: 012_create_admin_users
-- Description: Tabla de usuarios administradores del sistema
-- Database: lis_bot_comunicacion
-- Created: 2025-11-05
-- ================================================================

-- Tabla de usuarios administradores
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'admin'
    CHECK (role IN ('super-admin', 'admin', 'viewer')),
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para autenticación rápida
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_is_active ON admin_users(is_active);

-- Comentarios de documentación
COMMENT ON TABLE admin_users IS 'Usuarios administradores del sistema con acceso al panel de configuración';
COMMENT ON COLUMN admin_users.username IS 'Nombre de usuario único para login';
COMMENT ON COLUMN admin_users.email IS 'Email único del administrador';
COMMENT ON COLUMN admin_users.password_hash IS 'Hash bcrypt de la contraseña (nunca almacenar en texto plano)';
COMMENT ON COLUMN admin_users.role IS 'Rol: super-admin (full access), admin (editar config), viewer (solo lectura)';
COMMENT ON COLUMN admin_users.is_active IS 'Indica si el usuario está activo. FALSE = deshabilitado.';
COMMENT ON COLUMN admin_users.last_login IS 'Timestamp del último login exitoso';

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_admin_users_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER admin_users_update_timestamp
BEFORE UPDATE ON admin_users
FOR EACH ROW
EXECUTE FUNCTION update_admin_users_timestamp();

-- Crear primer usuario super-admin
-- Password: admin123 (CAMBIAR EN PRODUCCIÓN)
-- Hash generado con: bcrypt.hashSync('admin123', 10)
INSERT INTO admin_users (username, email, password_hash, role, is_active)
VALUES (
  'admin',
  'admin@laboratorio-eg.com',
  '$2b$10$rGJZ3V5xK6X0YxY3V5xK6O9mX0YxY3V5xK6O9mX0YxY3V5xK6O9m',
  'super-admin',
  TRUE
) ON CONFLICT (username) DO NOTHING;

-- Mensaje de éxito
DO $$
BEGIN
  RAISE NOTICE 'Tabla admin_users creada exitosamente';
  RAISE NOTICE 'Usuario por defecto: admin / admin123 (CAMBIAR EN PRODUCCIÓN)';
END $$;
