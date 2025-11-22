-- ============================================
-- COMPANY INFO - Información Corporativa Global
-- Base de datos: lis_bot_comunicacion
-- ============================================

-- Tabla principal de información de la empresa (single row)
CREATE TABLE IF NOT EXISTS company_info (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- Forzar single row

    -- Identidad Corporativa
    name VARCHAR(200) NOT NULL DEFAULT 'Laboratorio Elizabeth Gutiérrez',
    full_name VARCHAR(300) DEFAULT 'Laboratorio Clínico Microbiológico Elizabeth Gutiérrez',
    short_name VARCHAR(50) DEFAULT 'Lab EG',
    slogan VARCHAR(300) DEFAULT 'LaboratorioEG siempre a tu lado',
    founded_year INTEGER DEFAULT 1981,
    rif VARCHAR(50) DEFAULT 'J-40233378-1',

    -- Contacto Principal
    email VARCHAR(200) DEFAULT 'info@laboratorioeg.com',
    phone_main VARCHAR(50) DEFAULT '+58 212 762.0561',
    phone_secondary VARCHAR(50) DEFAULT '+58 212 763.5909',
    phone_tertiary VARCHAR(50) DEFAULT '+58 212 763.6628',
    whatsapp VARCHAR(50) DEFAULT '+58 414 901.9327',
    whatsapp_link VARCHAR(500) DEFAULT 'https://wa.me/584149019327',

    -- Dirección
    address_street VARCHAR(300) DEFAULT 'Av. Libertador, Edf. Majestic, Piso 1, Consultorio 18',
    address_area VARCHAR(100) DEFAULT 'La Campiña',
    address_city VARCHAR(100) DEFAULT 'Caracas',
    address_state VARCHAR(100) DEFAULT 'Distrito Capital',
    address_zip VARCHAR(20) DEFAULT '1050',
    address_country VARCHAR(100) DEFAULT 'Venezuela',
    google_maps_url TEXT DEFAULT 'https://www.google.com/maps/search/?api=1&query=Av.+Libertador,+Edf.+Majestic,+Piso+1,+Consultorio+18,+La+Campiña,+Caracas+1050,+Venezuela',

    -- Horarios
    hours_weekday VARCHAR(100) DEFAULT 'Lun-Vie: 7:00 AM - 4:00 PM',
    hours_saturday VARCHAR(100) DEFAULT 'Sáb: 8:00 AM - 12:00 PM',
    hours_sunday VARCHAR(100) DEFAULT 'Dom: Cerrado',

    -- Redes Sociales
    social_instagram VARCHAR(500) DEFAULT 'https://www.instagram.com/laboratorioeg',
    social_instagram_handle VARCHAR(100) DEFAULT '@laboratorioeg',
    social_twitter VARCHAR(500) DEFAULT 'https://twitter.com/Laboratorio_EG',
    social_twitter_handle VARCHAR(100) DEFAULT '@Laboratorio_EG',
    social_facebook VARCHAR(500) DEFAULT 'https://facebook.com/laboratorioeg',
    social_youtube VARCHAR(500),
    social_linkedin VARCHAR(500),

    -- SEO Global
    seo_title VARCHAR(300) DEFAULT 'Laboratorio Elizabeth Gutiérrez - Análisis Clínicos y Diagnóstico Médico',
    seo_description TEXT DEFAULT 'Laboratorio de análisis clínicos con más de 43 años de experiencia. Resultados confiables, tecnología de vanguardia y atención personalizada.',
    seo_keywords TEXT DEFAULT 'laboratorio clínico, análisis de sangre, estudios médicos, química sanguínea, hematología, microbiología, Caracas, Venezuela',
    seo_author VARCHAR(200) DEFAULT 'Laboratorio Elizabeth Gutiérrez',

    -- Open Graph
    og_image_url VARCHAR(500) DEFAULT '/og-image.jpg',
    og_type VARCHAR(50) DEFAULT 'website',
    og_locale VARCHAR(20) DEFAULT 'es_VE',

    -- PWA
    pwa_name VARCHAR(200) DEFAULT 'Laboratorio Elizabeth Gutiérrez - Microbiológico',
    pwa_short_name VARCHAR(50) DEFAULT 'Lab EG',
    pwa_description TEXT DEFAULT 'Sistema de gestión de estudios clínicos y análisis de laboratorio',

    -- Legal
    privacy_policy_url VARCHAR(500) DEFAULT '/privacidad',
    terms_of_service_url VARCHAR(500) DEFAULT '/terminos',
    cookies_policy_url VARCHAR(500) DEFAULT '/cookies',

    -- Copyright
    copyright_template VARCHAR(300) DEFAULT '© {year} {company_name}. Todos los derechos reservados.',

    -- Certificaciones (JSON array para flexibilidad)
    certifications JSONB DEFAULT '[
        {"name": "MPPS", "full_name": "Ministerio del Poder Popular para la Salud", "icon": "FaCertificate"},
        {"name": "SV Bioanalistas", "full_name": "Sociedad Venezolana de Bioanalistas", "icon": "FaAward"},
        {"name": "ISO 9001:2015", "full_name": "Certificación Internacional de Calidad", "icon": "FaMedal"}
    ]'::jsonb,

    -- Auditoría
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_company_info_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS company_info_updated_at ON company_info;
CREATE TRIGGER company_info_updated_at
    BEFORE UPDATE ON company_info
    FOR EACH ROW
    EXECUTE FUNCTION update_company_info_timestamp();

-- Insertar registro inicial con datos de Lab EG
INSERT INTO company_info (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- Índice para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_company_info_id ON company_info(id);

-- Comentarios
COMMENT ON TABLE company_info IS 'Información corporativa global del laboratorio - single row design';
COMMENT ON COLUMN company_info.certifications IS 'Array JSON de certificaciones para flexibilidad';
COMMENT ON COLUMN company_info.copyright_template IS 'Template con placeholders: {year}, {company_name}';
