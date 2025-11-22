-- ============================================
-- NAVIGATION ITEMS - Menús Configurables
-- Base de datos: lis_bot_comunicacion
-- ============================================

CREATE TABLE IF NOT EXISTS navigation_items (
    id SERIAL PRIMARY KEY,

    -- Ubicación del menú
    location VARCHAR(50) NOT NULL, -- 'header', 'sidebar', 'footer_quick', 'footer_services', 'mobile'

    -- Contenido
    label VARCHAR(100) NOT NULL,
    url VARCHAR(500) NOT NULL,
    icon VARCHAR(50), -- Nombre del icono de Lucide o FontAwesome

    -- Comportamiento
    target VARCHAR(20) DEFAULT '_self', -- '_self', '_blank'
    is_external BOOLEAN DEFAULT false,

    -- Visibilidad
    is_active BOOLEAN DEFAULT true,
    requires_auth BOOLEAN DEFAULT false,
    show_on_mobile BOOLEAN DEFAULT true,
    show_on_desktop BOOLEAN DEFAULT true,

    -- Jerarquía
    parent_id INTEGER REFERENCES navigation_items(id) ON DELETE SET NULL,

    -- Ordenamiento
    sort_order INTEGER DEFAULT 0,

    -- Auditoría
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_navigation_items_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS navigation_items_updated_at ON navigation_items;
CREATE TRIGGER navigation_items_updated_at
    BEFORE UPDATE ON navigation_items
    FOR EACH ROW
    EXECUTE FUNCTION update_navigation_items_timestamp();

-- Índices
CREATE INDEX IF NOT EXISTS idx_navigation_location ON navigation_items(location);
CREATE INDEX IF NOT EXISTS idx_navigation_active ON navigation_items(is_active);
CREATE INDEX IF NOT EXISTS idx_navigation_sort ON navigation_items(location, sort_order);
CREATE INDEX IF NOT EXISTS idx_navigation_parent ON navigation_items(parent_id);

-- Seed con navegación actual del header
INSERT INTO navigation_items (location, label, url, icon, sort_order, is_active) VALUES
    -- Header principal
    ('header', 'Inicio', '/', 'Home', 1, true),
    ('header', 'Nosotros', '/#nosotros', 'Info', 2, true),
    ('header', 'Contacto', '/#contacto', 'Mail', 3, true),
    ('header', 'Estudios', '/estudios', 'FlaskConical', 4, true),
    ('header', 'Resultados', '/resultados', 'FileBarChart', 5, true),
    ('header', 'Favoritos', '/favoritos', 'Heart', 6, true),

    -- Sidebar (mismo contenido para móvil)
    ('sidebar', 'Inicio', '/', 'Home', 1, true),
    ('sidebar', 'Nosotros', '/#nosotros', 'Info', 2, true),
    ('sidebar', 'Contacto', '/#contacto', 'Mail', 3, true),
    ('sidebar', 'Estudios', '/estudios', 'FlaskConical', 4, true),
    ('sidebar', 'Resultados', '/resultados', 'FileBarChart', 5, true),
    ('sidebar', 'Favoritos', '/favoritos', 'Heart', 6, true),

    -- Footer Quick Links
    ('footer_quick', 'Inicio', '/', NULL, 1, true),
    ('footer_quick', 'Estudios', '/estudios', NULL, 2, true),
    ('footer_quick', 'Nosotros', '/#nosotros', NULL, 3, true),
    ('footer_quick', 'Contacto', '/#contacto', NULL, 4, true),

    -- Footer Services
    ('footer_services', 'Hematología', '/estudios/hematologia', NULL, 1, true),
    ('footer_services', 'Química Sanguínea', '/estudios/quimica', NULL, 2, true),
    ('footer_services', 'Inmunología', '/estudios/inmunologia', NULL, 3, true),
    ('footer_services', 'Endocrinología', '/estudios/endocrinologia', NULL, 4, true)
ON CONFLICT DO NOTHING;

-- Comentarios
COMMENT ON TABLE navigation_items IS 'Items de navegación configurables para header, sidebar y footer';
COMMENT ON COLUMN navigation_items.location IS 'Ubicación: header, sidebar, footer_quick, footer_services, mobile';
COMMENT ON COLUMN navigation_items.icon IS 'Nombre del icono de Lucide React (Home, Info, Mail, etc.)';
COMMENT ON COLUMN navigation_items.target IS '_self para misma pestaña, _blank para nueva';
COMMENT ON COLUMN navigation_items.parent_id IS 'Para menús con sub-items (dropdowns)';
