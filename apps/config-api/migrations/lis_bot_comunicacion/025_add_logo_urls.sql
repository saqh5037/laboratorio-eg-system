-- Migración: Agregar URLs de logos dinámicos
-- Fecha: 2025-11-17
-- Descripción: Permite configurar los logos desde el admin panel

BEGIN;

-- Agregar campos para URLs de logos
ALTER TABLE company_info
ADD COLUMN IF NOT EXISTS logo_full_url VARCHAR(500) DEFAULT '/Logo.png',
ADD COLUMN IF NOT EXISTS logo_icon_url VARCHAR(500) DEFAULT '/LogoEG.png',
ADD COLUMN IF NOT EXISTS logo_horizontal_url VARCHAR(500) DEFAULT '/Logo.png',
ADD COLUMN IF NOT EXISTS favicon_url VARCHAR(500) DEFAULT '/favicon.svg',
ADD COLUMN IF NOT EXISTS logo_alt_text VARCHAR(200) DEFAULT 'Laboratorio Elizabeth Gutiérrez';

-- Actualizar con valores por defecto
UPDATE company_info SET
  logo_full_url = '/Logo.png',
  logo_icon_url = '/LogoEG.png',
  logo_horizontal_url = '/Logo.png',
  favicon_url = '/favicon.svg',
  logo_alt_text = 'Laboratorio Elizabeth Gutiérrez'
WHERE id = 1;

COMMIT;

-- Verificación
SELECT
  logo_full_url,
  logo_icon_url,
  logo_horizontal_url,
  favicon_url,
  logo_alt_text
FROM company_info
WHERE id = 1;
