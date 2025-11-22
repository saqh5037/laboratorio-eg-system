-- Migración: Actualizar seeds para mantener valores exactos hardcodeados actuales
-- Fecha: 2025-11-17
-- Descripción: Sincroniza company_info y navigation_items con los valores exactos
--              que están hardcodeados en el frontend actual de Elizabeth Gutiérrez

BEGIN;

-- ============================================================================
-- ACTUALIZAR COMPANY_INFO CON VALORES EXACTOS
-- ============================================================================

UPDATE company_info SET
  -- Identidad (mantener RIF y años actuales)
  name = 'Laboratorio Elizabeth Gutiérrez',
  full_name = 'Laboratorio Clínico Microbiológico Elizabeth Gutiérrez',
  short_name = 'Lab EG',
  slogan = 'LaboratorioEG siempre a tu lado',
  founded_year = 1982,  -- Corregido: en el código dice "Desde 1982"
  rif = 'J-40233378-1',

  -- Contacto (valores exactos del FooterEG.jsx y LandingPageUnified)
  email = 'info@laboratorioeg.com',
  phone_main = '+58 212 762.0561',
  phone_secondary = '+58 212 763.5909',
  phone_tertiary = '+58 212 763.6628',
  whatsapp = '+58 414-901-9327',
  whatsapp_link = 'https://wa.me/584149019327',

  -- Dirección (exacta del FooterEG.jsx)
  address_street = 'Av. Libertador, Edf. Majestic, Piso 1, Consultorio 18',
  address_area = 'La Campiña',
  address_city = 'Caracas',
  address_state = 'Distrito Capital',
  address_zip = '1050',
  address_country = 'Venezuela',
  google_maps_url = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3922.6!2d-66.8658!3d10.4905!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8c2a58f7b3e9c8a9%3A0x1234567890abcdef!2sAv.%20Libertador%2C%20Caracas%2C%20Venezuela!5e0!3m2!1ses!2sve!4v1234567890',

  -- Horarios (exactos del FooterEG.jsx)
  hours_weekday = 'Lun-Vie: 7:00 AM - 4:00 PM',
  hours_saturday = 'Sábados: 7:00 AM - 12:00 PM',
  hours_sunday = 'Domingo: Cerrado',

  -- Redes Sociales (exactas del código)
  social_instagram = 'https://www.instagram.com/laboratorioeg',
  social_instagram_handle = '@laboratorioeg',
  social_twitter = 'https://twitter.com/Laboratorio_EG',
  social_twitter_handle = '@Laboratorio_EG',
  social_facebook = 'https://facebook.com/laboratorioeg',
  social_youtube = NULL,
  social_linkedin = NULL,

  -- SEO (mejorado para Venezuela)
  seo_title = 'Laboratorio Elizabeth Gutiérrez - Análisis Clínicos y Diagnóstico Médico',
  seo_description = 'Laboratorio de análisis clínicos con más de 43 años de experiencia en Caracas. Resultados confiables, tecnología de vanguardia y atención personalizada.',
  seo_keywords = 'laboratorio clínico, análisis de sangre, estudios médicos, química sanguínea, hematología, microbiología, Caracas, Venezuela, La Campiña',
  seo_author = 'Laboratorio Elizabeth Gutiérrez',
  og_image_url = '/Logo.png',
  og_type = 'website',
  og_locale = 'es_VE',

  -- PWA
  pwa_name = 'Laboratorio Elizabeth Gutiérrez - Microbiológico',
  pwa_short_name = 'Lab EG',
  pwa_description = '43 años de experiencia brindando servicios de laboratorio clínico con la más alta calidad y tecnología.',

  -- Legal
  privacy_policy_url = '/privacidad',
  terms_of_service_url = '/terminos',
  cookies_policy_url = '/cookies',
  copyright_template = '© {year} Laboratorio Elizabeth Gutiérrez. Todos los derechos reservados.',

  -- Certificaciones (exactas del LandingPageUnified)
  certifications = '[
    {
      "icon": "FaCertificate",
      "name": "Certificado MPPS",
      "full_name": "Ministerio del Poder Popular para la Salud"
    },
    {
      "icon": "FaAward",
      "name": "SV Bioanalistas",
      "full_name": "Sociedad Venezolana de Bioanalistas Especialistas"
    },
    {
      "icon": "FaMedal",
      "name": "ISO 9001:2015",
      "full_name": "Certificación Internacional de Calidad"
    }
  ]'::jsonb,

  updated_at = NOW()
WHERE id = 1;

-- ============================================================================
-- ACTUALIZAR NAVIGATION ITEMS PARA FOOTER_SERVICES
-- ============================================================================
-- Los servicios en el footer actual apuntan a /estudios, no a categorías específicas

UPDATE navigation_items SET
  url = '/estudios'
WHERE location = 'footer_services' AND label IN ('Hematología', 'Química Sanguínea', 'Inmunología', 'Endocrinología');

-- Agregar Microbiología que falta (mencionado en Footer.jsx)
INSERT INTO navigation_items (location, label, url, icon, sort_order, is_active)
SELECT 'footer_services', 'Microbiología', '/estudios', NULL, 5, true
WHERE NOT EXISTS (
  SELECT 1 FROM navigation_items WHERE location = 'footer_services' AND label = 'Microbiología'
);

-- ============================================================================
-- AGREGAR ITEMS FALTANTES EN FOOTER_QUICK
-- ============================================================================

-- Agregar "Nosotros" si no existe (mencionado en footer actual)
UPDATE navigation_items SET
  url = '/#nosotros'
WHERE location = 'footer_quick' AND label = 'Nosotros';

-- Asegurar que Contacto apunte al anchor correcto
UPDATE navigation_items SET
  url = '/#contacto'
WHERE location = 'footer_quick' AND label = 'Contacto';

COMMIT;

-- Verificación
SELECT
  'company_info' as table_name,
  name,
  founded_year,
  phone_main,
  whatsapp_link,
  hours_weekday
FROM company_info
WHERE id = 1;

SELECT
  'navigation_items' as table_name,
  location,
  label,
  url
FROM navigation_items
WHERE location IN ('footer_services', 'footer_quick')
ORDER BY location, sort_order;
