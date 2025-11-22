-- Tabla para almacenar los valores corporativos de la landing page
-- (Ejemplo: Calidad, Confianza, Cercanía, Compromiso, Fe y gratitud)

CREATE TABLE IF NOT EXISTS landing_values (
  id SERIAL PRIMARY KEY,
  icon_name VARCHAR(50) NOT NULL,           -- Nombre del icono Font Awesome (ej: 'FaBullseye', 'FaHandshake')
  title VARCHAR(100) NOT NULL,               -- Título del valor (ej: 'Calidad', 'Confianza')
  description TEXT NOT NULL,                 -- Descripción del valor
  sort_order INT NOT NULL DEFAULT 0,         -- Orden de visualización
  is_active BOOLEAN DEFAULT true,            -- Si está activo o no
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar performance
CREATE INDEX idx_landing_values_active ON landing_values(is_active);
CREATE INDEX idx_landing_values_sort ON landing_values(sort_order);

-- Comentarios para documentación
COMMENT ON TABLE landing_values IS 'Valores corporativos mostrados en la sección "Nosotros" de la landing page';
COMMENT ON COLUMN landing_values.icon_name IS 'Nombre del icono de react-icons/fa (ej: FaBullseye, FaHandshake, FaHeart)';
COMMENT ON COLUMN landing_values.sort_order IS 'Orden de visualización (menor número = aparece primero)';
