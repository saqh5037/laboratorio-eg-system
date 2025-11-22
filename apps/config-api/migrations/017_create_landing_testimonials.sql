-- Tabla para almacenar testimonios de pacientes en la landing page
-- (Ejemplo: María González, Carlos Rodríguez, Ana Martínez)

CREATE TABLE IF NOT EXISTS landing_testimonials (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,                 -- Nombre del paciente (ej: 'María González')
  role VARCHAR(100) NOT NULL,                  -- Rol/título (ej: 'Paciente frecuente', 'Paciente')
  text TEXT NOT NULL,                          -- Testimonio completo
  avatar_type VARCHAR(20) NOT NULL DEFAULT 'FaUser',  -- Tipo de avatar (ej: 'FaUser', 'FaUserMd', 'FaUserTie')
  rating INT DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),  -- Calificación de 1 a 5 estrellas
  sort_order INT NOT NULL DEFAULT 0,           -- Orden de visualización
  is_active BOOLEAN DEFAULT true,              -- Si está activo o no
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar performance
CREATE INDEX idx_landing_testimonials_active ON landing_testimonials(is_active);
CREATE INDEX idx_landing_testimonials_sort ON landing_testimonials(sort_order);
CREATE INDEX idx_landing_testimonials_rating ON landing_testimonials(rating);

-- Comentarios para documentación
COMMENT ON TABLE landing_testimonials IS 'Testimonios de pacientes mostrados en la landing page';
COMMENT ON COLUMN landing_testimonials.avatar_type IS 'Tipo de avatar de react-icons/fa (FaUser, FaUserMd, FaUserTie, etc.)';
COMMENT ON COLUMN landing_testimonials.rating IS 'Calificación en estrellas (1-5)';
COMMENT ON COLUMN landing_testimonials.sort_order IS 'Orden de rotación en el carrusel de testimonios';
