-- ================================================================
-- Migration 022: Landing Sections Manager
-- Database: microtec_config / dimogen_config / labeg_config
-- Description: Table to make landing page structure 100% dynamic
-- Author: Claude Code
-- Date: 2025-11-20
-- ================================================================

-- ================================================================
-- TABLE: landing_sections
-- Purpose: Store landing page section configuration
-- ================================================================

CREATE TABLE IF NOT EXISTS landing_sections (
  -- Primary Key
  id SERIAL PRIMARY KEY,

  -- Section Identification
  section_key VARCHAR(50) NOT NULL UNIQUE,  -- Unique identifier: 'hero', 'nosotros', 'certificaciones', etc.
  section_type VARCHAR(50) NOT NULL,        -- Component type: 'carousel', 'values_grid', 'testimonials', etc.

  -- Display Configuration
  title VARCHAR(200),                       -- Optional section title
  subtitle VARCHAR(300),                    -- Optional subtitle
  description TEXT,                         -- Optional description

  -- Layout Configuration (JSON)
  layout_config JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Visibility & Ordering
  is_visible BOOLEAN DEFAULT true,          -- Show/hide section
  order_index INT NOT NULL DEFAULT 0,       -- Display order (0 = first)

  -- Conditional Display (future feature)
  display_conditions JSONB,                 -- Rules for when to show section

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(100),
  updated_by VARCHAR(100),

  -- Constraints
  CONSTRAINT landing_sections_order_non_negative CHECK (order_index >= 0),
  CONSTRAINT landing_sections_key_format CHECK (section_key ~ '^[a-z0-9_-]+$')
);

-- ================================================================
-- INDEXES for Performance
-- ================================================================

-- Primary query: Get all visible sections ordered
CREATE INDEX idx_landing_sections_visible_order
  ON landing_sections(is_visible, order_index)
  WHERE is_visible = true;

-- Query by section_key (lookup)
CREATE UNIQUE INDEX idx_landing_sections_key
  ON landing_sections(section_key);

-- Query by section_type (grouping)
CREATE INDEX idx_landing_sections_type
  ON landing_sections(section_type);

-- JSON queries on layout_config
CREATE INDEX idx_landing_sections_layout_config
  ON landing_sections USING GIN (layout_config);

-- JSON queries on display_conditions
CREATE INDEX idx_landing_sections_conditions
  ON landing_sections USING GIN (display_conditions);

-- Audit queries
CREATE INDEX idx_landing_sections_created_by
  ON landing_sections(created_by);

-- ================================================================
-- TRIGGER for Auto-Update Timestamp
-- ================================================================

CREATE OR REPLACE FUNCTION update_landing_sections_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER landing_sections_update_timestamp
BEFORE UPDATE ON landing_sections
FOR EACH ROW
EXECUTE FUNCTION update_landing_sections_timestamp();

-- ================================================================
-- SEED Default Sections (Lab EG Configuration)
-- ================================================================

INSERT INTO landing_sections (
  section_key,
  section_type,
  title,
  subtitle,
  layout_config,
  is_visible,
  order_index,
  created_by
) VALUES

-- SECTION 1: Hero Carousel
(
  'hero',
  'carousel',
  NULL,  -- No title needed for carousel
  NULL,
  '{
    "component": "HeroCarouselEG",
    "autoplay": true,
    "interval": 5000,
    "showDots": true,
    "showArrows": false,
    "transition": "fade",
    "dataSource": "carousel_slides"
  }'::jsonb,
  true,
  0,
  'seed'
),

-- SECTION 2: Nosotros (Complex multi-component section)
(
  'nosotros',
  'composite',
  'NUESTRA HISTORIA',
  '#PorLaSaludDelPaciente',
  '{
    "component": "CompositeSection",
    "backgroundColor": "eg-purple",
    "subsections": [
      {
        "type": "hero_header",
        "dataSource": "content_blocks",
        "section": "nosotros-header"
      },
      {
        "type": "two_column_grid",
        "columns": [
          {
            "type": "content_card",
            "dataSource": "content_blocks",
            "section": "historia",
            "cardStyle": "rounded-3xl p-10"
          },
          {
            "type": "image_card",
            "dataSource": "content_blocks",
            "section": "historia",
            "blockType": "image",
            "hasBadge": true
          }
        ]
      },
      {
        "type": "values_grid",
        "dataSource": "landing_values",
        "gridColumns": 5,
        "cardStyle": "text-center",
        "showIcon": true,
        "backgroundColor": "gradient-to-b from-white via-eg-pink/20 to-eg-purple/15"
      },
      {
        "type": "purpose_card",
        "dataSource": "content_blocks",
        "section": "proposito",
        "cardStyle": "rounded-3xl p-14 text-center border-2 border-eg-purple/40",
        "backgroundColor": "gradient-to-br from-eg-purple/43 via-eg-pink/28 to-eg-purple/38"
      }
    ],
    "decorativeBlobs": true
  }'::jsonb,
  true,
  1,
  'seed'
),

-- SECTION 3: Certificaciones
(
  'certificaciones',
  'grid',
  'Excelencia y calidad',
  'Certificados y avalados por las principales instituciones de salud',
  '{
    "component": "GridSection",
    "dataSource": "landing_certifications",
    "gridColumns": 3,
    "cardStyle": "text-center",
    "showIcon": true,
    "iconSize": 14,
    "backgroundColor": "eg-purple",
    "textColor": "white",
    "decorativeBlobs": true
  }'::jsonb,
  true,
  2,
  'seed'
),

-- SECTION 4: Testimonios
(
  'testimonios',
  'carousel',
  'Lo que dicen nuestros pacientes',
  'Miles de pacientes satisfechos avalan nuestra calidad',
  '{
    "component": "TestimonialsCarousel",
    "dataSource": "landing_testimonials",
    "autoplay": true,
    "interval": 5000,
    "showRating": true,
    "showAvatar": true,
    "showDots": true,
    "cardStyle": "max-w-4xl mx-auto",
    "backgroundColor": "eg-purple",
    "textColor": "white",
    "decorativeBlobs": true
  }'::jsonb,
  true,
  3,
  'seed'
),

-- SECTION 5: Contacto
(
  'contacto',
  'composite',
  'CONTÁCTANOS',
  'Siempre listos para ti y tu salud',
  '{
    "component": "CompositeSection",
    "backgroundColor": "eg-purple",
    "subsections": [
      {
        "type": "hero_header",
        "dataSource": "content_blocks",
        "section": "contact-header"
      },
      {
        "type": "contact_cards",
        "dataSource": "landing_contact_info",
        "layout": "responsive_grid"
      },
      {
        "type": "whatsapp_cta",
        "dataSource": "landing_contact_info",
        "filterType": "whatsapp"
      },
      {
        "type": "contact_center_hours",
        "dataSource": "landing_contact_info",
        "filterCategory": "contact_center"
      },
      {
        "type": "map",
        "dataSource": "content_blocks",
        "section": "contact-map"
      },
      {
        "type": "contact_form",
        "dataSource": "content_blocks",
        "section": "contact-form",
        "fields": ["nombre", "email", "telefono", "mensaje"],
        "validation": true
      }
    ],
    "decorativeBlobs": true
  }'::jsonb,
  true,
  4,
  'seed'
),

-- SECTION 6: CTA (Call to Action)
(
  'cta',
  'statistics_cta',
  NULL,
  NULL,
  '{
    "component": "CTASectionEG",
    "dataSource": "landing_statistics",
    "gridColumns": 4,
    "showIcons": true,
    "ctaText": "Agenda tu cita hoy",
    "ctaLink": "/contacto",
    "backgroundColor": "gradient"
  }'::jsonb,
  true,
  5,
  'seed'
),

-- SECTION 7: Footer
(
  'footer',
  'footer',
  NULL,
  NULL,
  '{
    "component": "DynamicFooter",
    "showSocialMedia": true,
    "showQuickLinks": true,
    "showContactInfo": true,
    "columns": 3
  }'::jsonb,
  true,
  6,
  'seed'
);

-- ================================================================
-- Comments for Documentation
-- ================================================================

COMMENT ON TABLE landing_sections IS 'Configuration table for dynamic landing page sections - allows each laboratory to have unique page structure';
COMMENT ON COLUMN landing_sections.section_key IS 'Unique identifier for the section (used in code): hero, nosotros, certificaciones, etc.';
COMMENT ON COLUMN landing_sections.section_type IS 'Component type: carousel, grid, composite, testimonials, footer, etc.';
COMMENT ON COLUMN landing_sections.layout_config IS 'JSON configuration for section layout, styling, and behavior';
COMMENT ON COLUMN landing_sections.order_index IS 'Display order (0 = first section, supports decimals for insertions)';
COMMENT ON COLUMN landing_sections.display_conditions IS 'Future: JSON rules for conditional display (time-based, user-based, etc.)';

-- ================================================================
-- Verification Queries (for manual testing)
-- ================================================================

-- View all visible sections in order
-- SELECT
--   section_key,
--   section_type,
--   title,
--   is_visible,
--   order_index,
--   layout_config->>'component' as component
-- FROM landing_sections
-- WHERE is_visible = true
-- ORDER BY order_index;

-- Count sections by type
-- SELECT
--   section_type,
--   COUNT(*) as count,
--   SUM(CASE WHEN is_visible THEN 1 ELSE 0 END) as visible_count
-- FROM landing_sections
-- GROUP BY section_type;
