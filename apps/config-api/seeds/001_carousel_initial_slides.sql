-- =====================================================
-- SEED: Slides Iniciales del Carrusel
-- Descripción: Pobla la base de datos con los 4 slides
--              que están actualmente hardcodeados en producción
-- =====================================================

-- Limpiar slides existentes (solo si es necesario)
-- TRUNCATE TABLE carousel_slides RESTART IDENTITY CASCADE;

-- =====================================================
-- SLIDE 1: Tu salud es nuestra prioridad
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
  'Tu salud es nuestra prioridad',
  'Tecnología de vanguardia y atención personalizada',
  '43 años de experiencia cuidando de ti y tu familia',
  'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=1920',
  'Laboratorio de análisis clínicos moderno',
  'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=800',
  'Agenda tu cita',
  '/contacto',
  'Ver estudios',
  '/estudios',
  NULL,
  'purple',
  true,
  1,
  NOW(),
  NULL
);

-- =====================================================
-- SLIDE 2: Check-up completo desde $599
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
  'Check-up completo desde $599',
  'Paquetes preventivos con descuentos especiales',
  'Incluye más de 25 estudios esenciales',
  'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1920',
  'Paquetes de exámenes de laboratorio',
  'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800',
  'Ver paquetes',
  '/estudios',
  NULL,
  NULL,
  '30% descuento',
  'pink',
  true,
  2,
  NOW(),
  NULL
);

-- =====================================================
-- SLIDE 3: Resultados en 24 horas
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
  'Resultados en 24 horas',
  'Portal en línea y notificaciones por WhatsApp',
  'Accede a tus resultados desde cualquier dispositivo',
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1920',
  'Portal de resultados en línea',
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
  'Portal de resultados',
  '/resultados',
  'WhatsApp disponible',
  'https://wa.me/584149019327',
  NULL,
  'blue',
  true,
  3,
  NOW(),
  NULL
);

-- =====================================================
-- SLIDE 4: 43 años cuidando de ti
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
);

-- =====================================================
-- Verificar inserción
-- =====================================================
SELECT
  id,
  title,
  badge_text,
  is_active,
  order_position,
  created_at
FROM carousel_slides
ORDER BY order_position;
