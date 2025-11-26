-- =====================================================
-- Migration: 025_create_dimogen_about.sql
-- Description: Create table for DIMOGEN About Us section content
-- =====================================================

-- Create dimogen_about table
CREATE TABLE IF NOT EXISTS dimogen_about (
    id SERIAL PRIMARY KEY,
    section_type VARCHAR(50) NOT NULL,
    title VARCHAR(200),
    description TEXT,
    icon_name VARCHAR(50),
    color VARCHAR(20),
    stat_value VARCHAR(20),
    stat_label VARCHAR(100),
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_dimogen_about_type ON dimogen_about(section_type);
CREATE INDEX IF NOT EXISTS idx_dimogen_about_active ON dimogen_about(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_dimogen_about_type_active ON dimogen_about(section_type, is_active, sort_order);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_dimogen_about_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS dimogen_about_update_timestamp ON dimogen_about;
CREATE TRIGGER dimogen_about_update_timestamp
    BEFORE UPDATE ON dimogen_about
    FOR EACH ROW
    EXECUTE FUNCTION update_dimogen_about_timestamp();

-- Add comments
COMMENT ON TABLE dimogen_about IS 'DIMOGEN About Us section content (intro, filosofia, valores)';
COMMENT ON COLUMN dimogen_about.section_type IS 'Section type: intro, filosofia, valores';
COMMENT ON COLUMN dimogen_about.stat_value IS 'Statistic value for valores section (e.g., 500+, ISO, 100%)';
COMMENT ON COLUMN dimogen_about.stat_label IS 'Statistic label (e.g., Estudios, 9001:2015, Confiable)';
