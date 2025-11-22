-- Migration: Create theme_config table for visual customization
-- Description: Single-row table to store theme configuration (colors, fonts, logos)
--              Each deployment has its own theme configuration
-- Author: Claude Code
-- Date: 2025-11-12

-- =====================================================
-- Table: theme_config
-- =====================================================
CREATE TABLE IF NOT EXISTS theme_config (
  id INTEGER PRIMARY KEY DEFAULT 1,

  -- ==================== COLORS ====================
  -- Primary color (main brand color)
  color_primary VARCHAR(7) NOT NULL DEFAULT '#7B68A6',

  -- Secondary color (complementary brand color)
  color_secondary VARCHAR(7) NOT NULL DEFAULT '#DDB5D5',

  -- Accent color (highlights, badges, etc.)
  color_accent VARCHAR(7) NOT NULL DEFAULT '#8B8C8E',

  -- Text colors
  color_text_primary VARCHAR(7) NOT NULL DEFAULT '#231F20',
  color_text_secondary VARCHAR(7) NOT NULL DEFAULT '#8B8C8E',

  -- Background colors
  color_background VARCHAR(7) NOT NULL DEFAULT '#FFFFFF',
  color_surface VARCHAR(7) NOT NULL DEFAULT '#F9FAFB',

  -- Dark mode colors
  color_dark_bg VARCHAR(7) NOT NULL DEFAULT '#0F1729',
  color_dark_surface VARCHAR(7) NOT NULL DEFAULT '#1A2238',
  color_dark_text VARCHAR(7) NOT NULL DEFAULT '#E8F0FF',
  color_dark_text_secondary VARCHAR(7) NOT NULL DEFAULT '#94A3B8',

  -- Success, warning, error colors
  color_success VARCHAR(7) NOT NULL DEFAULT '#10B981',
  color_warning VARCHAR(7) NOT NULL DEFAULT '#F59E0B',
  color_error VARCHAR(7) NOT NULL DEFAULT '#EF4444',
  color_info VARCHAR(7) NOT NULL DEFAULT '#3B82F6',

  -- ==================== TYPOGRAPHY ====================
  font_family_primary VARCHAR(100) NOT NULL DEFAULT 'DIN Pro',
  font_family_secondary VARCHAR(100) DEFAULT 'Inter',

  -- URL to load custom font (Google Fonts, CDN, etc.)
  font_url TEXT DEFAULT NULL,

  -- Font sizes (in rem)
  font_size_base VARCHAR(10) DEFAULT '1rem',
  font_size_h1 VARCHAR(10) DEFAULT '2rem',
  font_size_h2 VARCHAR(10) DEFAULT '1.69rem',
  font_size_h3 VARCHAR(10) DEFAULT '1.5rem',

  -- ==================== LOGO & BRANDING ====================
  -- Paths relative to /public/ directory
  logo_path VARCHAR(200) NOT NULL DEFAULT '/Logo.png',
  logo_icon_path VARCHAR(200) DEFAULT '/LogoEG.png',
  favicon_path VARCHAR(200) DEFAULT '/favicon.svg',

  -- Logo specifications
  logo_margin VARCHAR(10) DEFAULT '37.8px',
  logo_max_width VARCHAR(10) DEFAULT '200px',

  -- ==================== SPACING & LAYOUT ====================
  border_radius_sm VARCHAR(10) DEFAULT '0.25rem',
  border_radius_md VARCHAR(10) DEFAULT '0.5rem',
  border_radius_lg VARCHAR(10) DEFAULT '0.75rem',
  border_radius_xl VARCHAR(10) DEFAULT '1rem',

  -- ==================== EFFECTS ====================
  -- Shadow intensity (0-10, used to generate rgba values)
  shadow_intensity INTEGER DEFAULT 5 CHECK (shadow_intensity BETWEEN 0 AND 10),

  -- Glassmorphism effect
  glassmorphism_enabled BOOLEAN DEFAULT true,
  glassmorphism_blur VARCHAR(10) DEFAULT '12px',

  -- ==================== METADATA ====================
  theme_name VARCHAR(100) DEFAULT 'Lab EG Theme',
  theme_description TEXT DEFAULT 'Tema oficial de Laboratorio Elizabeth Gutiérrez',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Ensure only one row exists
  CONSTRAINT single_row_check CHECK (id = 1)
);

-- =====================================================
-- Insert default theme (Lab EG values)
-- =====================================================
INSERT INTO theme_config (
  id,
  color_primary,
  color_secondary,
  color_accent,
  color_text_primary,
  color_text_secondary,
  color_background,
  color_surface,
  color_dark_bg,
  color_dark_surface,
  color_dark_text,
  color_dark_text_secondary,
  font_family_primary,
  logo_path,
  logo_icon_path,
  favicon_path,
  theme_name,
  theme_description
) VALUES (
  1,
  '#7B68A6',  -- Pantone 2665U (Purple)
  '#DDB5D5',  -- Pantone 250U (Pink)
  '#8B8C8E',  -- Cool Gray 9U
  '#231F20',  -- Black
  '#8B8C8E',  -- Cool Gray
  '#FFFFFF',  -- White
  '#F9FAFB',  -- Light gray
  '#0F1729',  -- Dark blue
  '#1A2238',  -- Dark surface
  '#E8F0FF',  -- Light blue text
  '#94A3B8',  -- Muted text
  'DIN Pro',
  '/Logo.png',
  '/LogoEG.png',
  '/favicon.svg',
  'Lab EG Theme',
  'Tema oficial de Laboratorio Elizabeth Gutiérrez con colores Pantone corporativos'
) ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- Create trigger to update updated_at timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_theme_config_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_theme_config_timestamp
BEFORE UPDATE ON theme_config
FOR EACH ROW
EXECUTE FUNCTION update_theme_config_timestamp();

-- =====================================================
-- Create index for faster lookups (even though single row)
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_theme_config_id ON theme_config(id);

-- =====================================================
-- Comments for documentation
-- =====================================================
COMMENT ON TABLE theme_config IS 'Single-row table storing visual theme configuration for the laboratory system';
COMMENT ON COLUMN theme_config.id IS 'Always 1 - enforces single row';
COMMENT ON COLUMN theme_config.color_primary IS 'Main brand color - used for buttons, links, primary UI elements';
COMMENT ON COLUMN theme_config.color_secondary IS 'Secondary brand color - used for accents, highlights';
COMMENT ON COLUMN theme_config.logo_path IS 'Path to main logo relative to /public/ directory';
COMMENT ON COLUMN theme_config.font_family_primary IS 'Primary font family name (must match @font-face or web font)';
COMMENT ON COLUMN theme_config.shadow_intensity IS 'Shadow intensity from 0 (no shadow) to 10 (very strong)';

-- =====================================================
-- Grant permissions
-- =====================================================
GRANT SELECT ON theme_config TO PUBLIC;
GRANT UPDATE ON theme_config TO labsis;  -- Adjust to your admin role

-- =====================================================
-- Migration complete
-- =====================================================
-- To rollback: DROP TABLE IF EXISTS theme_config CASCADE;
