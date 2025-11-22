-- ============================================
-- ADMIN USER - LABORATORIO ELIZABETH GUTIÉRREZ
-- Seed inicial de usuario administrador
-- ============================================

-- Limpiar usuarios existentes (si los hay)
DELETE FROM admin_users WHERE id > 0;

-- Insertar usuario admin por defecto
-- Username: admin
-- Password: admin123 (hash bcrypt con salt rounds = 10)
INSERT INTO admin_users (
  username,
  email,
  password_hash,
  role,
  is_active
) VALUES (
  'admin',
  'admin@laboratorioeg.com',
  '$2b$10$AKlIlwqBRwK0vyVxZMN2DOI0Mr4AtoXZqHDuo0NLYmkLtd.VlmRGa',
  'super-admin',
  true
);

-- Verificación
SELECT
  id,
  username,
  email,
  role,
  is_active,
  created_at
FROM admin_users;

-- Resultado esperado:
-- id | username | email                      | role        | is_active | created_at
-- ---+----------+----------------------------+-------------+-----------+-------------------
--  1 | admin    | admin@laboratorioeg.com    | super-admin | true      | 2025-11-20 ...
