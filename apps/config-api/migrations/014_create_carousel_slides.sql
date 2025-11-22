-- ================================================================
-- Migración 014: Sistema de Carrusel Dinámico
-- Database: lis_bot_comunicacion
-- Descripción: Tabla para gestionar slides del carrusel principal
--              con soporte para programación temporal y ordenamiento
-- Fecha: 2025-11-12
-- ================================================================

-- Tabla principal de slides del carrusel
CREATE TABLE IF NOT EXISTS carousel_slides (
  id SERIAL PRIMARY KEY,

  -- Contenido del slide
  title VARCHAR(200) NOT NULL,
  subtitle VARCHAR(300),
  description TEXT,

  -- Imágenes
  image_url TEXT NOT NULL,
  image_alt VARCHAR(200),
  image_mobile_url TEXT, -- Versión optimizada para móvil

  -- Calls to Action (CTAs)
  cta1_text VARCHAR(100),
  cta1_link VARCHAR(500),
  cta2_text VARCHAR(100),
  cta2_link VARCHAR(500),

  -- Badge promocional
  badge_text VARCHAR(50),
  badge_color VARCHAR(20) DEFAULT 'purple', -- purple, pink, blue, green, red, yellow

  -- Control de visibilidad
  is_active BOOLEAN DEFAULT TRUE,
  order_position INTEGER NOT NULL DEFAULT 0,

  -- Programación temporal (fechas opcionales para promociones)
  start_date TIMESTAMP,
  end_date TIMESTAMP,

  -- Metadata y auditoría
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by VARCHAR(100),
  updated_by VARCHAR(100),

  -- Constraints
  CONSTRAINT carousel_order_non_negative CHECK (order_position >= 0),
  CONSTRAINT carousel_dates_valid CHECK (
    (start_date IS NULL AND end_date IS NULL) OR
    (start_date IS NULL AND end_date IS NOT NULL) OR
    (start_date IS NOT NULL AND end_date IS NULL) OR
    (start_date <= end_date)
  )
);

-- ================================================================
-- Índices para optimización de consultas
-- ================================================================

-- Índice para búsquedas de slides activos (consulta más frecuente)
CREATE INDEX idx_carousel_active ON carousel_slides(is_active)
WHERE is_active = TRUE;

-- Índice para ordenamiento
CREATE INDEX idx_carousel_order ON carousel_slides(order_position ASC);

-- Índice compuesto para filtrado por fechas y estado activo
CREATE INDEX idx_carousel_active_dates ON carousel_slides(is_active, start_date, end_date)
WHERE is_active = TRUE;

-- Índice para búsquedas por creador
CREATE INDEX idx_carousel_created_by ON carousel_slides(created_by);

-- ================================================================
-- Trigger para actualizar updated_at automáticamente
-- ================================================================

CREATE OR REPLACE FUNCTION update_carousel_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER carousel_update_timestamp
BEFORE UPDATE ON carousel_slides
FOR EACH ROW
EXECUTE FUNCTION update_carousel_timestamp();

-- ================================================================
-- Insertar slides de ejemplo (migración de contenido actual)
-- ================================================================

INSERT INTO carousel_slides (
  title,
  subtitle,
  description,
  image_url,
  image_alt,
  cta1_text,
  cta1_link,
  cta2_text,
  cta2_link,
  is_active,
  order_position,
  created_by
) VALUES
(
  'Tu salud es nuestra prioridad',
  'Tecnología de vanguardia y atención personalizada',
  '43 años de experiencia cuidando de ti y tu familia',
  'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=1920',
  'Laboratorio EG - Tecnología médica de vanguardia',
  'Agenda tu cita',
  '/contacto',
  'Ver estudios',
  '/estudios',
  TRUE,
  1,
  'migration'
),
(
  'Check-up desde $599',
  'Paquetes preventivos con descuentos especiales',
  'Incluye más de 25 estudios esenciales',
  'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1920',
  'Paquetes de Check-up preventivo',
  'Ver paquetes',
  '/estudios',
  NULL,
  NULL,
  TRUE,
  2,
  'migration'
),
(
  'Resultados en 24 horas',
  'Portal en línea y notificaciones por WhatsApp',
  'Accede a tus resultados desde cualquier dispositivo',
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1920',
  'Portal de resultados en línea',
  'Portal de resultados',
  '/resultados',
  NULL,
  NULL,
  TRUE,
  3,
  'migration'
);

-- Actualizar badge en el segundo slide
UPDATE carousel_slides
SET badge_text = '30% descuento', badge_color = 'pink'
WHERE order_position = 2;

-- ================================================================
-- Comentarios para documentación
-- ================================================================

COMMENT ON TABLE carousel_slides IS 'Gestión de slides del carrusel principal del sitio web';
COMMENT ON COLUMN carousel_slides.title IS 'Título principal del slide (requerido)';
COMMENT ON COLUMN carousel_slides.subtitle IS 'Subtítulo opcional para contexto adicional';
COMMENT ON COLUMN carousel_slides.description IS 'Descripción larga del slide';
COMMENT ON COLUMN carousel_slides.image_url IS 'URL de la imagen principal (desktop)';
COMMENT ON COLUMN carousel_slides.image_mobile_url IS 'URL de imagen optimizada para móvil';
COMMENT ON COLUMN carousel_slides.cta1_text IS 'Texto del primer Call-to-Action';
COMMENT ON COLUMN carousel_slides.cta1_link IS 'Link del primer CTA (puede ser ruta relativa o absoluta)';
COMMENT ON COLUMN carousel_slides.cta2_text IS 'Texto del segundo Call-to-Action (opcional)';
COMMENT ON COLUMN carousel_slides.cta2_link IS 'Link del segundo CTA';
COMMENT ON COLUMN carousel_slides.badge_text IS 'Texto del badge promocional (ej: "30% OFF")';
COMMENT ON COLUMN carousel_slides.badge_color IS 'Color del badge: purple, pink, blue, green, red, yellow';
COMMENT ON COLUMN carousel_slides.is_active IS 'Si está activo se muestra en el carrusel público';
COMMENT ON COLUMN carousel_slides.order_position IS 'Orden de aparición (0 = primero)';
COMMENT ON COLUMN carousel_slides.start_date IS 'Fecha de inicio de visibilidad (opcional, para promociones temporales)';
COMMENT ON COLUMN carousel_slides.end_date IS 'Fecha de fin de visibilidad (opcional)';

-- ================================================================
-- Permisos (ajustar según configuración de producción)
-- ================================================================

-- GRANT SELECT ON carousel_slides TO public_role; -- Si tienes un rol público
-- GRANT ALL ON carousel_slides TO admin_role; -- Si tienes un rol admin

-- ================================================================
-- Verificación de migración exitosa
-- ================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Migración 014 completada exitosamente';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Tabla carousel_slides creada';
  RAISE NOTICE 'Índices creados: 4';
  RAISE NOTICE 'Triggers creados: 1';
  RAISE NOTICE 'Slides de ejemplo insertados: 3';
  RAISE NOTICE '';
  RAISE NOTICE 'Consulta de verificación:';
  RAISE NOTICE 'SELECT COUNT(*) FROM carousel_slides;';
  RAISE NOTICE '';
END $$;

-- Verificar que se insertaron los slides
SELECT
  id,
  title,
  is_active,
  order_position,
  created_at
FROM carousel_slides
ORDER BY order_position;
