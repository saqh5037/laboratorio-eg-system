-- =====================================================
-- SEED: Actualizar Slides con Iconos Apropiados
-- Descripción: Asigna iconos contextuales a cada botón
--              según su función
-- =====================================================

-- =====================================================
-- SLIDE 1: Tu salud es nuestra prioridad
-- CTA1: "Agenda tu cita" → icono calendar
-- CTA2: "Ver estudios" → icono flask
-- =====================================================
UPDATE carousel_slides
SET
  cta1_icon = 'calendar',
  cta2_icon = 'flask',
  updated_at = NOW()
WHERE id = 1;

-- =====================================================
-- SLIDE 2: Check-up completo desde $599
-- CTA1: "Ver paquetes" → icono file (documentos/paquetes)
-- CTA2: No tiene segundo botón
-- =====================================================
UPDATE carousel_slides
SET
  cta1_icon = 'file',
  cta2_icon = NULL,
  updated_at = NOW()
WHERE id = 2;

-- =====================================================
-- SLIDE 3: Resultados en 24 horas
-- CTA1: "Portal de resultados" → icono laptop
-- CTA2: No tiene segundo botón
-- =====================================================
UPDATE carousel_slides
SET
  cta1_icon = 'laptop',
  cta2_icon = NULL,
  updated_at = NOW()
WHERE id = 3;

-- =====================================================
-- SLIDE 4: 43 años cuidando de ti
-- CTA1: "Conoce nuestro equipo" → icono user
-- CTA2: No tiene segundo botón
-- =====================================================
UPDATE carousel_slides
SET
  cta1_icon = 'user',
  cta2_icon = NULL,
  updated_at = NOW()
WHERE id = 4;

-- =====================================================
-- Verificar resultado final
-- =====================================================
SELECT
  id,
  title,
  cta1_text,
  cta1_icon,
  cta2_text,
  cta2_icon
FROM carousel_slides
ORDER BY order_position;
