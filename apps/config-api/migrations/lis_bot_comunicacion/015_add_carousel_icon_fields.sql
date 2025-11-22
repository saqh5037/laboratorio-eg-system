-- =====================================================
-- MIGRATION: Agregar campos de iconos al carrusel
-- Descripción: Permite configurar los iconos de los
--              botones CTA de cada slide
-- Fecha: 2025-11-12
-- =====================================================

-- Agregar campos para iconos de CTAs
ALTER TABLE carousel_slides
ADD COLUMN IF NOT EXISTS cta1_icon VARCHAR(50) DEFAULT 'calendar',
ADD COLUMN IF NOT EXISTS cta2_icon VARCHAR(50) DEFAULT 'flask';

-- Comentarios para documentación
COMMENT ON COLUMN carousel_slides.cta1_icon IS 'Icono del primer Call to Action. Valores: calendar, phone, whatsapp, flask, laptop, user, email, map, check, heart, star, bell, file, image, video, play, pause, stop, refresh, search, filter, settings, help, info, warning, error, success, close, menu, home, back, forward, up, down, left, right, plus, minus, edit, delete, save, cancel, lock, unlock, eye, eye-off, download, upload, share, copy, cut, paste, print, export, import';

COMMENT ON COLUMN carousel_slides.cta2_icon IS 'Icono del segundo Call to Action. Mismos valores que cta1_icon';

-- Verificar resultado
SELECT
    column_name,
    data_type,
    character_maximum_length,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'carousel_slides'
  AND column_name IN ('cta1_icon', 'cta2_icon')
ORDER BY ordinal_position;
