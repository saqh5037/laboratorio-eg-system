-- ==========================================
-- Migration 027: Create Laboratories Table
-- ==========================================
-- This table is required for the multi-laboratory architecture
-- It stores information about each laboratory instance and their database connections

-- Create laboratories table
CREATE TABLE IF NOT EXISTS laboratories (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,          -- Lab identifier (e.g., 'eg', 'dimogen')
    name VARCHAR(255) NOT NULL,                -- Full name
    short_name VARCHAR(100),                   -- Short display name
    country VARCHAR(100) DEFAULT 'Venezuela',  -- Country
    labsis_db VARCHAR(100) NOT NULL,           -- LABSIS database name (e.g., 'labsisEG')
    config_db VARCHAR(100) NOT NULL,           -- Config database name (e.g., 'lis_bot_comunicacion_dimogen')
    is_active BOOLEAN DEFAULT FALSE,           -- Whether this lab is currently active
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on code for fast lookups
CREATE INDEX IF NOT EXISTS idx_laboratories_code ON laboratories(code);
CREATE INDEX IF NOT EXISTS idx_laboratories_is_active ON laboratories(is_active);

-- Insert Dimogen laboratory
INSERT INTO laboratories (code, name, short_name, country, labsis_db, config_db, is_active)
VALUES (
    'dimogen',
    'Laboratorio Dimogen',
    'Dimogen',
    'Venezuela',
    'labsisDimogen',
    'lis_bot_comunicacion_dimogen',
    true
) ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    labsis_db = EXCLUDED.labsis_db,
    config_db = EXCLUDED.config_db,
    is_active = EXCLUDED.is_active,
    updated_at = CURRENT_TIMESTAMP;

-- Verify insertion
DO $$
BEGIN
    RAISE NOTICE 'Laboratories table created and seeded successfully';
END $$;
