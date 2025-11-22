-- Tabla para almacenar estadísticas mostradas en la sección CTA de la landing page
-- (Ejemplo: "43 años de experiencia", "200+ estudios disponibles", "24h resultados rápidos")

CREATE TABLE IF NOT EXISTS landing_statistics (
  id SERIAL PRIMARY KEY,
  section VARCHAR(50) DEFAULT 'cta',          -- Sección donde aparece (default: 'cta', puede ser 'hero', etc.)
  label VARCHAR(100) NOT NULL,                 -- Etiqueta principal (ej: 'Experiencia', 'Estudios', 'Rapidez')
  value VARCHAR(100) NOT NULL,                 -- Valor destacado (ej: '43 años', '200+', '24h')
  description TEXT,                            -- Descripción adicional (ej: 'de excelencia médica', 'estudios disponibles')
  icon_name VARCHAR(50),                       -- Icono opcional Font Awesome (ej: 'FaAward', 'FaFlask', 'FaClock')
  sort_order INT NOT NULL DEFAULT 0,           -- Orden de visualización
  is_active BOOLEAN DEFAULT true,              -- Si está activo o no
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar performance
CREATE INDEX idx_landing_statistics_section ON landing_statistics(section);
CREATE INDEX idx_landing_statistics_active ON landing_statistics(is_active);
CREATE INDEX idx_landing_statistics_sort ON landing_statistics(sort_order);

-- Comentarios para documentación
COMMENT ON TABLE landing_statistics IS 'Estadísticas destacadas mostradas en la sección CTA y otras áreas de la landing page';
COMMENT ON COLUMN landing_statistics.section IS 'Sección donde aparece la estadística (cta, hero, etc.)';
COMMENT ON COLUMN landing_statistics.label IS 'Etiqueta que describe la estadística (Experiencia, Estudios, Rapidez)';
COMMENT ON COLUMN landing_statistics.value IS 'Valor destacado que se muestra grande (43 años, 200+, 24h)';
COMMENT ON COLUMN landing_statistics.description IS 'Texto descriptivo complementario (de excelencia médica, estudios disponibles)';
