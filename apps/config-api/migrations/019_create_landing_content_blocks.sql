-- Tabla para almacenar bloques de contenido de texto en la landing page
-- (Ejemplo: historia, propósito, headers de secciones, párrafos, badges)

CREATE TABLE IF NOT EXISTS landing_content_blocks (
  id SERIAL PRIMARY KEY,
  section VARCHAR(50) NOT NULL,               -- Sección: 'nosotros-header', 'historia', 'proposito', 'cta', 'contacto-header'
  block_type VARCHAR(50) NOT NULL,            -- Tipo de bloque: 'title', 'subtitle', 'paragraph', 'badge', 'description', 'rif'
  content TEXT NOT NULL,                       -- Contenido del bloque de texto
  image_url VARCHAR(500),                      -- URL de imagen opcional
  metadata JSONB,                              -- Metadatos adicionales en formato JSON (flexible para futuras expansiones)
  sort_order INT NOT NULL DEFAULT 0,           -- Orden dentro de la sección
  is_active BOOLEAN DEFAULT true,              -- Si está activo o no
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar performance
CREATE INDEX idx_landing_content_blocks_section ON landing_content_blocks(section);
CREATE INDEX idx_landing_content_blocks_type ON landing_content_blocks(block_type);
CREATE INDEX idx_landing_content_blocks_active ON landing_content_blocks(is_active);
CREATE INDEX idx_landing_content_blocks_sort ON landing_content_blocks(sort_order);
CREATE INDEX idx_landing_content_blocks_metadata ON landing_content_blocks USING GIN (metadata);

-- Comentarios para documentación
COMMENT ON TABLE landing_content_blocks IS 'Bloques de contenido de texto mostrados en diferentes secciones de la landing page';
COMMENT ON COLUMN landing_content_blocks.section IS 'Sección donde aparece: nosotros-header, historia, proposito, cta, contacto-header';
COMMENT ON COLUMN landing_content_blocks.block_type IS 'Tipo de contenido: title, subtitle, paragraph, badge, description, rif';
COMMENT ON COLUMN landing_content_blocks.metadata IS 'Metadatos en JSON para datos adicionales flexibles';
