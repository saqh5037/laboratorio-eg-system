-- =====================================================
-- Migration: 024_create_dimogen_faq.sql
-- Description: Create table for DIMOGEN FAQ items
-- =====================================================

-- Create dimogen_faq table
CREATE TABLE IF NOT EXISTS dimogen_faq (
    id SERIAL PRIMARY KEY,
    category VARCHAR(50) NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_dimogen_faq_category ON dimogen_faq(category);
CREATE INDEX IF NOT EXISTS idx_dimogen_faq_active ON dimogen_faq(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_dimogen_faq_category_active ON dimogen_faq(category, is_active, sort_order);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_dimogen_faq_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS dimogen_faq_update_timestamp ON dimogen_faq;
CREATE TRIGGER dimogen_faq_update_timestamp
    BEFORE UPDATE ON dimogen_faq
    FOR EACH ROW
    EXECUTE FUNCTION update_dimogen_faq_timestamp();

-- Add comments
COMMENT ON TABLE dimogen_faq IS 'DIMOGEN frequently asked questions organized by category';
COMMENT ON COLUMN dimogen_faq.category IS 'FAQ category: general, muestras, resultados, servicios, pagos, certificaciones';
