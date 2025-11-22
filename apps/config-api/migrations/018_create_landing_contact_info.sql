-- Tabla para almacenar información de contacto en la landing page
-- (Ejemplo: teléfonos, emails, dirección, horarios, redes sociales, WhatsApp)

CREATE TABLE IF NOT EXISTS landing_contact_info (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL,                  -- Tipo: 'address', 'phone', 'email', 'hours', 'social', 'whatsapp', 'service'
  category VARCHAR(50),                        -- Subcategoría (ej: 'line1', 'line2' para teléfonos, 'weekday', 'saturday' para horarios)
  icon_name VARCHAR(50) NOT NULL,             -- Icono Font Awesome (ej: 'FaMapMarkerAlt', 'FaPhone', 'FaEnvelope', 'FaClock', 'FaInstagram')
  label VARCHAR(100) NOT NULL,                 -- Etiqueta descriptiva (ej: 'Teléfono 1', 'Lunes a Viernes', 'Instagram')
  value TEXT NOT NULL,                         -- Valor del contacto (ej: '+58 212 762.0561', '7:00 AM - 4:00 PM', '@laboratorioeg')
  link VARCHAR(255),                           -- Link opcional (ej: 'tel:+582127620561', 'https://instagram.com/laboratorioeg')
  sort_order INT NOT NULL DEFAULT 0,           -- Orden de visualización
  is_active BOOLEAN DEFAULT true,              -- Si está activo o no
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar performance
CREATE INDEX idx_landing_contact_info_type ON landing_contact_info(type);
CREATE INDEX idx_landing_contact_info_active ON landing_contact_info(is_active);
CREATE INDEX idx_landing_contact_info_sort ON landing_contact_info(sort_order);

-- Comentarios para documentación
COMMENT ON TABLE landing_contact_info IS 'Información de contacto mostrada en la landing page (teléfonos, dirección, horarios, redes sociales, etc.)';
COMMENT ON COLUMN landing_contact_info.type IS 'Tipo de contacto: address, phone, email, hours, social, whatsapp, service';
COMMENT ON COLUMN landing_contact_info.category IS 'Subcategoría opcional (line1/line2 para múltiples teléfonos, weekday/saturday para horarios)';
COMMENT ON COLUMN landing_contact_info.link IS 'Enlace opcional (tel:, mailto:, https://, etc.)';
