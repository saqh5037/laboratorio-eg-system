-- ============================================
-- CAROUSEL SLIDES - LABORATORIO ELIZABETH GUTIÉRREZ
-- Diseñados según Manual de Marca EG
-- Colores: Pantone 2665U (#7B68A6), 250U (#DDB5D5)
-- Tono: Familiar, cálido, valores cristianos
-- ============================================

-- Limpiar slides existentes (si los hay)
DELETE FROM carousel_slides WHERE id > 0;

-- Slide 1: Historia y Trayectoria (43 años)
INSERT INTO carousel_slides (
  title,
  subtitle,
  description,
  image_url,
  image_alt,
  cta1_text,
  cta1_link,
  cta1_icon,
  cta2_text,
  cta2_link,
  cta2_icon,
  badge_text,
  badge_color,
  is_active,
  order_position,
  created_by
) VALUES (
  '43 años a tu lado',
  'Una historia de compromiso con tu salud',
  'Desde 1981, el Laboratorio Elizabeth Gutiérrez ha sido un pilar de confianza para las familias venezolanas. Nuestra trayectoria está construida sobre bases sólidas de excelencia profesional y atención humana.',
  '/images/carousel/historia-eg.jpg',
  'Laboratorio Elizabeth Gutiérrez - 43 años de trayectoria',
  'Conoce nuestra historia',
  '/nosotros',
  'history',
  'Ver servicios',
  '/servicios',
  'flask',
  '43 AÑOS',
  'purple',
  true,
  1,
  'system-seed'
);

-- Slide 2: Valores Cristianos (Fe y Gratitud)
INSERT INTO carousel_slides (
  title,
  subtitle,
  description,
  image_url,
  image_alt,
  cta1_text,
  cta1_link,
  cta1_icon,
  badge_text,
  badge_color,
  is_active,
  order_position,
  created_by
) VALUES (
  'Atención guiada por la fe ❤️',
  'Valores cristianos en cada servicio',
  'En Lab EG, creemos que la fe y la gratitud son pilares fundamentales. Cada análisis lo realizamos con dedicación, respeto y amor al prójimo, honrando nuestros principios cristianos.',
  '/images/carousel/valores-eg.jpg',
  'Valores cristianos del Laboratorio Elizabeth Gutiérrez',
  'Conoce nuestros valores',
  '/nosotros#valores',
  'heart',
  'FE Y GRATITUD',
  'pink',
  true,
  2,
  'system-seed'
);

-- Slide 3: Servicio a Domicilio (Diferenciador)
INSERT INTO carousel_slides (
  title,
  subtitle,
  description,
  image_url,
  image_alt,
  cta1_text,
  cta1_link,
  cta1_icon,
  cta2_text,
  cta2_link,
  cta2_icon,
  badge_text,
  badge_color,
  is_active,
  order_position,
  created_by
) VALUES (
  'Servicio a domicilio',
  'Llevamos el laboratorio hasta tu casa',
  'Tu comodidad es importante para nosotros. Ofrecemos toma de muestras a domicilio en Caracas con profesionales calificados. ¡Agenda tu cita fácilmente!',
  '/images/carousel/domicilio-eg.jpg',
  'Servicio de toma de muestras a domicilio en Caracas',
  'Solicitar toma a domicilio',
  '/contacto',
  'home',
  'Ver horarios',
  '/contacto#horarios',
  'clock',
  'A DOMICILIO',
  'purple',
  true,
  3,
  'system-seed'
);

-- Slide 4: Certificaciones Internacionales
INSERT INTO carousel_slides (
  title,
  subtitle,
  description,
  image_url,
  image_alt,
  cta1_text,
  cta1_link,
  cta1_icon,
  badge_text,
  badge_color,
  is_active,
  order_position,
  created_by
) VALUES (
  'Certificaciones de Clase Mundial',
  'Calidad respaldada internacionalmente',
  'Certificados por ISO 9001:2015, MPPS y la Sociedad Venezolana de Bioanalistas. Nuestros estándares de calidad son reconocidos nacional e internacionalmente.',
  '/images/carousel/certificaciones-eg.jpg',
  'Certificaciones ISO 9001 y acreditaciones del Laboratorio EG',
  'Ver certificaciones',
  '/#certificaciones',
  'certificate',
  'ISO 9001',
  'gray',
  true,
  4,
  'system-seed'
);

-- Comentarios sobre el diseño
COMMENT ON TABLE carousel_slides IS 'Carousel slides diseñados para Lab EG según manual de marca Pantone oficial. Colores: 2665U (Purple), 250U (Pink), Cool Gray 9U. Tono: familiar, cálido, valores cristianos. Badge colors: purple (#7B68A6), pink (#DDB5D5), gray (#8B8C8E)';

-- Verificación
SELECT
  id,
  title,
  badge_text,
  badge_color,
  order_position,
  is_active
FROM carousel_slides
ORDER BY order_position;

-- Resultado esperado:
-- 4 slides activos con badges: 43 AÑOS, FE Y GRATITUD, A DOMICILIO, ISO 9001
