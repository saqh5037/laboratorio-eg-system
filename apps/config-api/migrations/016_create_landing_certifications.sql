-- Tabla para almacenar las certificaciones mostradas en la landing page
-- (Ejemplo: ISO 9001:2015, Certificado MPPS, Sociedad Venezolana de Bioanalistas)

CREATE TABLE IF NOT EXISTS landing_certifications (
  id SERIAL PRIMARY KEY,
  icon_name VARCHAR(50) NOT NULL,           -- Nombre del icono Font Awesome (ej: 'FaCertificate', 'FaAward')
  title VARCHAR(100) NOT NULL,               -- Título de la certificación (ej: 'ISO 9001:2015')
  description TEXT NOT NULL,                 -- Descripción de la certificación
  sort_order INT NOT NULL DEFAULT 0,         -- Orden de visualización
  is_active BOOLEAN DEFAULT true,            -- Si está activa o no
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar performance
CREATE INDEX idx_landing_certifications_active ON landing_certifications(is_active);
CREATE INDEX idx_landing_certifications_sort ON landing_certifications(sort_order);

-- Comentarios para documentación
COMMENT ON TABLE landing_certifications IS 'Certificaciones y reconocimientos mostrados en la landing page';
COMMENT ON COLUMN landing_certifications.icon_name IS 'Nombre del icono de react-icons/fa (ej: FaCertificate, FaAward, FaMedal)';
COMMENT ON COLUMN landing_certifications.sort_order IS 'Orden de visualización (menor número = aparece primero)';
