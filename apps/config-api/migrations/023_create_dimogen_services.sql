-- =====================================================
-- Migration: 023_create_dimogen_services.sql
-- Description: Create table for DIMOGEN service lines (Líneas de Negocio)
-- =====================================================

-- Create dimogen_services table
CREATE TABLE IF NOT EXISTS dimogen_services (
    id SERIAL PRIMARY KEY,
    service_key VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    subtitle VARCHAR(200),
    description TEXT,
    icon_name VARCHAR(50),
    color_primary VARCHAR(20),
    color_secondary VARCHAR(20),
    color_light VARCHAR(20),
    color_gradient VARCHAR(100),
    image_url TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    stats_value VARCHAR(20),
    stats_label VARCHAR(100),
    link_url VARCHAR(200),
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_dimogen_services_active ON dimogen_services(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_dimogen_services_key ON dimogen_services(service_key);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_dimogen_services_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS dimogen_services_update_timestamp ON dimogen_services;
CREATE TRIGGER dimogen_services_update_timestamp
    BEFORE UPDATE ON dimogen_services
    FOR EACH ROW
    EXECUTE FUNCTION update_dimogen_services_timestamp();

-- Add comments
COMMENT ON TABLE dimogen_services IS 'DIMOGEN service lines (Biología Molecular, Salud Integral, Microbiología)';
COMMENT ON COLUMN dimogen_services.service_key IS 'Unique key: biologia-molecular, salud-integral, microbiologia-alimentos';
COMMENT ON COLUMN dimogen_services.features IS 'JSON array of feature strings';
COMMENT ON COLUMN dimogen_services.color_gradient IS 'Tailwind gradient class: from-[#color1] to-[#color2]';
