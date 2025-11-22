-- =====================================================
-- SEED: Actualizar Slides con Datos Completos
-- Descripción: Actualiza los 3 slides existentes con
--              todos los datos y agrega el cuarto slide
-- =====================================================

-- =====================================================
-- Actualizar SLIDE 1: Tu salud es nuestra prioridad
-- =====================================================
UPDATE carousel_slides
SET
  subtitle = 'Tecnología de vanguardia y atención personalizada',
  description = '43 años de experiencia cuidando de ti y tu familia',
  image_alt = 'Laboratorio de análisis clínicos moderno',
  image_mobile_url = 'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=800',
  cta1_text = 'Agenda tu cita',
  cta1_link = '/contacto',
  cta2_text = 'Ver estudios',
  cta2_link = '/estudios',
  badge_color = 'purple',
  updated_at = NOW()
WHERE id = 1;

-- =====================================================
-- Actualizar SLIDE 2: Check-up completo desde $599
-- =====================================================
UPDATE carousel_slides
SET
  title = 'Check-up completo desde $599',
  subtitle = 'Paquetes preventivos con descuentos especiales',
  description = 'Incluye más de 25 estudios esenciales',
  image_url = 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1920',
  image_alt = 'Paquetes de exámenes de laboratorio',
  image_mobile_url = 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800',
  cta1_text = 'Ver paquetes',
  cta1_link = '/estudios',
  cta2_text = NULL,
  cta2_link = NULL,
  badge_text = '30% descuento',
  badge_color = 'pink',
  updated_at = NOW()
WHERE id = 2;

-- =====================================================
-- Actualizar SLIDE 3: Resultados en 24 horas
-- =====================================================
UPDATE carousel_slides
SET
  subtitle = 'Portal en línea y notificaciones por WhatsApp',
  description = 'Accede a tus resultados desde cualquier dispositivo',
  image_url = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1920',
  image_alt = 'Portal de resultados en línea',
  image_mobile_url = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
  cta1_text = 'Portal de resultados',
  cta1_link = '/resultados',
  cta2_text = 'WhatsApp disponible',
  cta2_link = 'https://wa.me/584149019327',
  badge_color = 'blue',
  updated_at = NOW()
WHERE id = 3;

-- =====================================================
-- Insertar SLIDE 4: 43 años cuidando de ti
-- =====================================================
INSERT INTO carousel_slides (
  title,
  subtitle,
  description,
  image_url,
  image_alt,
  image_mobile_url,
  cta1_text,
  cta1_link,
  cta2_text,
  cta2_link,
  badge_text,
  badge_color,
  is_active,
  order_position,
  start_date,
  end_date
) VALUES (
  '43 años cuidando de ti',
  'Personal altamente calificado y certificado',
  'Cumplimos con los más altos estándares de calidad',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=1920',
  'Equipo médico profesional',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800',
  'Conoce nuestro equipo',
  '/nosotros',
  NULL,
  NULL,
  'ISO 9001:2015',
  'green',
  true,
  4,
  NOW(),
  NULL
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- Verificar resultado final
-- =====================================================
SELECT
  id,
  title,
  subtitle,
  badge_text,
  badge_color,
  is_active,
  order_position,
  cta1_text,
  cta2_text
FROM carousel_slides
ORDER BY order_position;
