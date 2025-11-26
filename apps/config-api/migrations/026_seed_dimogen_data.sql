-- =====================================================
-- Migration: 026_seed_dimogen_data.sql
-- Description: Seed initial data for DIMOGEN landing page
-- =====================================================

-- =====================================================
-- 1. DIMOGEN SERVICES (Líneas de Negocio)
-- =====================================================

INSERT INTO dimogen_services (service_key, title, subtitle, description, icon_name, color_primary, color_secondary, color_light, color_gradient, image_url, features, stats_value, stats_label, link_url, sort_order, is_active)
VALUES
(
    'biologia-molecular',
    'Biología Molecular',
    'Laboratorio de Alta Especialidad',
    'Expertos en diagnóstico molecular con un extenso catálogo de pruebas genéticas, genómicas y bioquímicas de alta especialidad.',
    'FaDna',
    '#0047CB',
    '#0747A6',
    '#E6F0FF',
    'from-[#0047CB] to-[#0747A6]',
    'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=600&h=400&fit=crop',
    '["Pruebas genéticas avanzadas", "Secuenciación genética", "Diagnóstico molecular preciso", "Tecnología de vanguardia"]'::jsonb,
    '500+',
    'Estudios disponibles',
    '/dimogen/servicios/biologia-molecular',
    1,
    true
),
(
    'salud-integral',
    'Unidad de Salud Integral',
    'Cuidado Personalizado',
    'Consulta médica ajustada a tus necesidades, amplia gama de estudios clínicos de rutina y alta especialidad, con acompañamiento personalizado.',
    'FaUserMd',
    '#00A3E0',
    '#0077B6',
    '#E6F9FF',
    'from-[#00A3E0] to-[#0077B6]',
    'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=600&h=400&fit=crop',
    '["Consulta médica general", "Especialidades médicas", "Toma de muestras", "Ultrasonografía"]'::jsonb,
    '10K+',
    'Pacientes atendidos',
    '/dimogen/servicios/salud-integral',
    2,
    true
),
(
    'microbiologia-alimentos',
    'Microbiología de Alimentos',
    'Certificación ISO 9001:2015',
    'Análisis de microorganismos en agua, hielo, superficies y alimentos. Resultados confiables para la industria alimentaria, hoteles, hospitales y más.',
    'FaLeaf',
    '#98CB59',
    '#006644',
    '#E6FFF5',
    'from-[#98CB59] to-[#006644]',
    'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=600&h=400&fit=crop',
    '["Análisis microbiológico", "Certificación ISO 9001:2015", "Control de calidad alimentaria", "Resultados confiables"]'::jsonb,
    '50+',
    'Empresas confían en nosotros',
    '/dimogen/servicios/microbiologia-alimentos',
    3,
    true
)
ON CONFLICT (service_key) DO UPDATE SET
    title = EXCLUDED.title,
    subtitle = EXCLUDED.subtitle,
    description = EXCLUDED.description,
    icon_name = EXCLUDED.icon_name,
    color_primary = EXCLUDED.color_primary,
    color_secondary = EXCLUDED.color_secondary,
    color_light = EXCLUDED.color_light,
    color_gradient = EXCLUDED.color_gradient,
    image_url = EXCLUDED.image_url,
    features = EXCLUDED.features,
    stats_value = EXCLUDED.stats_value,
    stats_label = EXCLUDED.stats_label,
    link_url = EXCLUDED.link_url,
    sort_order = EXCLUDED.sort_order,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- =====================================================
-- 2. DIMOGEN ABOUT (Filosofía y Valores)
-- =====================================================

-- Filosofía items
INSERT INTO dimogen_about (section_type, title, description, icon_name, color, sort_order, is_active)
VALUES
('filosofia', 'Prevención Oportuna', 'Creemos que la salud comienza con la prevención. Nuestro objetivo es detectar a tiempo cualquier alteración en tu salud.', 'FaShieldAlt', '#0047CB', 1, true),
('filosofia', 'Tecnología Accesible', 'Ponemos a tu alcance la tecnología más avanzada en diagnóstico molecular, haciéndola accesible para todos.', 'FaMicroscope', '#00A3E0', 2, true),
('filosofia', 'Medicina de Precisión', 'Cada persona es única. Nuestros análisis permiten tratamientos personalizados basados en tu perfil genético.', 'FaDna', '#98CB59', 3, true)
ON CONFLICT DO NOTHING;

-- Valores items (con estadísticas)
INSERT INTO dimogen_about (section_type, title, description, icon_name, color, stat_value, stat_label, sort_order, is_active)
VALUES
('valores', 'Alta Especialidad', 'Contamos con el más amplio catálogo de estudios de biología molecular en México.', 'FaFlask', '#0047CB', '500+', 'Estudios', 1, true),
('valores', 'Tecnología e Innovación', 'Certificados bajo los más altos estándares internacionales de calidad.', 'FaCertificate', '#00A3E0', 'ISO', '9001:2015', 2, true),
('valores', 'Comprometidos', 'Tu salud es nuestra prioridad. Resultados confiables, siempre.', 'FaHandHoldingHeart', '#98CB59', '100%', 'Confiable', 3, true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 3. DIMOGEN FAQ
-- =====================================================

INSERT INTO dimogen_faq (category, question, answer, sort_order, is_active)
VALUES
-- General
('general', '¿Qué es la PCR en tiempo real?', 'La PCR (Reacción en Cadena de la Polimerasa) en tiempo real es una técnica de biología molecular que permite detectar y cuantificar material genético (ADN o ARN) de forma muy precisa. Es el estándar de oro para el diagnóstico de enfermedades infecciosas y análisis genéticos.', 1, true),
('general', '¿Qué tipos de muestras analizan?', 'Analizamos diversos tipos de muestras: sangre, orina, saliva, hisopos nasofaríngeos, tejidos, alimentos, agua, superficies y más. El tipo de muestra depende del estudio solicitado.', 2, true),

-- Muestras
('muestras', '¿Necesito cita previa para toma de muestras?', 'Sí, recomendamos agendar una cita para garantizar una atención personalizada y reducir tiempos de espera. Puedes agendar por WhatsApp o llamando a nuestras líneas de atención.', 3, true),
('muestras', '¿Cuáles son los requisitos de ayuno?', 'El ayuno depende del tipo de estudio. Para análisis de glucosa y perfil lipídico se requieren 8-12 horas de ayuno. Para estudios genéticos y moleculares generalmente no se requiere ayuno. Te informaremos los requisitos específicos al agendar tu cita.', 4, true),

-- Resultados
('resultados', '¿Cuánto tiempo tardan los resultados?', 'Los tiempos varían según el estudio: pruebas de rutina (24-48 horas), estudios moleculares especializados (3-7 días), y paneles genéticos complejos (10-15 días). Siempre te informamos el tiempo estimado al momento de tu visita.', 5, true),
('resultados', '¿Cómo recibo mis resultados?', 'Puedes recibir tus resultados por correo electrónico de forma segura, recogerlos en nuestras instalaciones, o consultar a través de nuestro portal de pacientes. Los resultados confidenciales son entregados únicamente al paciente o a quien él autorice.', 6, true),

-- Servicios
('servicios', '¿Realizan servicio a domicilio?', 'Sí, contamos con servicio de toma de muestras a domicilio en la Ciudad de México y área metropolitana. Este servicio tiene un costo adicional y debe agendarse con anticipación.', 7, true),
('servicios', '¿Trabajan con aseguradoras?', 'Trabajamos con las principales aseguradoras del país. Te recomendamos consultar con tu aseguradora sobre la cobertura de los estudios que requieras y traer tu póliza vigente.', 8, true),

-- Pagos
('pagos', '¿Qué formas de pago aceptan?', 'Aceptamos efectivo, tarjetas de débito y crédito, transferencias bancarias y pagos a meses sin intereses con tarjetas participantes. También manejamos convenios corporativos y facturación electrónica.', 9, true),

-- Certificaciones
('certificaciones', '¿Qué certificaciones tienen?', 'Contamos con certificación ISO 9001:2015 para nuestro sistema de gestión de calidad, autorización de COFEPRIS (2409152002A00328), y nuestro personal está continuamente capacitado en las últimas técnicas de biología molecular.', 10, true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 4. UPDATE COMPANY_INFO (if exists)
-- =====================================================

UPDATE company_info SET
    name = 'DIMOGEN',
    full_name = 'DIMOGEN - Laboratorio de Biología Molecular',
    short_name = 'DIMOGEN',
    slogan = 'Laboratorio de Alta Especialidad',
    phone_main = '56 1033 5124',
    phone_secondary = '56 1045 4458',
    email = 'hola@dimogen.com.mx',
    whatsapp = '5510335124',
    whatsapp_link = 'https://wa.me/525510335124',
    address_street = 'Calle Quintana Roo 78',
    address_area = 'Roma Sur, Cuauhtémoc',
    address_city = 'Ciudad de México',
    address_state = 'CDMX',
    address_zip = '06760',
    address_country = 'México',
    google_maps_url = 'https://www.google.com/maps/search/?api=1&query=Calle+Quintana+Roo+78+Roma+Sur+CDMX',
    hours_weekday = '07:30 a.m. – 07:00 p.m.',
    hours_saturday = '08:00 a.m. – 02:00 p.m.',
    social_facebook = 'https://facebook.com/dimogenlaboratorio',
    social_instagram = 'https://instagram.com/dimogenlab',
    social_tiktok = 'https://tiktok.com/@dimogen.lab',
    certifications = '[{"name": "COFEPRIS", "code": "2409152002A00328"}, {"name": "ISO 9001:2015", "code": ""}]'::jsonb,
    seo_title = 'DIMOGEN - Laboratorio de Biología Molecular y Alta Especialidad',
    seo_description = 'Laboratorio de biología molecular con más de 500 estudios especializados. Pruebas genéticas, diagnóstico molecular, microbiología de alimentos. Certificación ISO 9001:2015 y COFEPRIS.',
    pwa_name = 'DIMOGEN Laboratorio',
    pwa_short_name = 'DIMOGEN',
    updated_at = NOW()
WHERE id = 1;

-- If no company_info exists, insert new one
INSERT INTO company_info (
    name, full_name, short_name, slogan,
    phone_main, phone_secondary, email,
    whatsapp, whatsapp_link,
    address_street, address_area, address_city, address_state, address_zip, address_country,
    google_maps_url, hours_weekday, hours_saturday,
    social_facebook, social_instagram, social_tiktok,
    certifications, seo_title, seo_description, pwa_name, pwa_short_name
)
SELECT
    'DIMOGEN',
    'DIMOGEN - Laboratorio de Biología Molecular',
    'DIMOGEN',
    'Laboratorio de Alta Especialidad',
    '56 1033 5124',
    '56 1045 4458',
    'hola@dimogen.com.mx',
    '5510335124',
    'https://wa.me/525510335124',
    'Calle Quintana Roo 78',
    'Roma Sur, Cuauhtémoc',
    'Ciudad de México',
    'CDMX',
    '06760',
    'México',
    'https://www.google.com/maps/search/?api=1&query=Calle+Quintana+Roo+78+Roma+Sur+CDMX',
    '07:30 a.m. – 07:00 p.m.',
    '08:00 a.m. – 02:00 p.m.',
    'https://facebook.com/dimogenlaboratorio',
    'https://instagram.com/dimogenlab',
    'https://tiktok.com/@dimogen.lab',
    '[{"name": "COFEPRIS", "code": "2409152002A00328"}, {"name": "ISO 9001:2015", "code": ""}]'::jsonb,
    'DIMOGEN - Laboratorio de Biología Molecular y Alta Especialidad',
    'Laboratorio de biología molecular con más de 500 estudios especializados. Pruebas genéticas, diagnóstico molecular, microbiología de alimentos. Certificación ISO 9001:2015 y COFEPRIS.',
    'DIMOGEN Laboratorio',
    'DIMOGEN'
WHERE NOT EXISTS (SELECT 1 FROM company_info WHERE id = 1);

-- =====================================================
-- 5. CAROUSEL SLIDES FOR HERO
-- =====================================================

-- Clear existing slides and insert DIMOGEN slides
DELETE FROM carousel_slides WHERE id > 0;

INSERT INTO carousel_slides (title, subtitle, description, badge_text, badge_color, cta1_text, cta1_link, cta2_text, cta2_link, image_url, order_position, is_active)
VALUES
(
    'Biología Molecular',
    'Laboratorio de Alta Especialidad',
    'Pruebas genéticas, genómicas y bioquímicas con tecnología de vanguardia. Más de 500 estudios especializados para un diagnóstico preciso.',
    'BIOLOGÍA MOLECULAR',
    'blue',
    'Solicitar cotización',
    '#contacto',
    'Ver servicios',
    '/dimogen/servicios/biologia-molecular',
    'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=1920&h=1080&fit=crop',
    1,
    true
),
(
    'Unidad de Salud Integral',
    'Cuidado Personalizado',
    'Consultas médicas, estudios clínicos de rutina y alta especialidad. Atención personalizada para tu bienestar.',
    'SALUD INTEGRAL',
    'cyan',
    'Agendar cita',
    '#contacto',
    'Conocer más',
    '/dimogen/servicios/salud-integral',
    'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1920&h=1080&fit=crop',
    2,
    true
),
(
    'Microbiología de Alimentos',
    'Certificación ISO 9001:2015',
    'Análisis microbiológico de alimentos, agua, superficies e hielo. Resultados confiables para la industria alimentaria.',
    'MICROBIOLOGÍA',
    'green',
    'Solicitar cotización',
    '#contacto',
    'Ver catálogo',
    '/dimogen/servicios/microbiologia-alimentos',
    'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=1920&h=1080&fit=crop',
    3,
    true
);

-- =====================================================
-- 6. LANDING TESTIMONIALS
-- =====================================================

DELETE FROM landing_testimonials WHERE id > 0;

INSERT INTO landing_testimonials (name, role, text, avatar_type, rating, sort_order, is_active)
VALUES
('Dr. Carlos García', 'Médico Internista - Hospital General', 'Dimogen ha sido fundamental en el diagnóstico de mis pacientes. La precisión de sus estudios moleculares y la rapidez en la entrega de resultados nos permite tomar decisiones clínicas oportunas.', 'FaUserMd', 5, 1, true),
('María Fernández', 'Gerente de Calidad - Hotel Boutique', 'Confiamos en Dimogen para nuestros análisis de alimentos e higiene. Su certificación ISO 9001:2015 nos da la tranquilidad de cumplir con los más altos estándares de calidad.', 'FaUser', 5, 2, true),
('Lic. Ana Martínez', 'Directora - Clínica de Fertilidad', 'Los estudios genéticos de Dimogen son de primer nivel. Su equipo de especialistas nos brinda asesoría personalizada para cada caso, lo cual es invaluable.', 'FaUserTie', 5, 3, true),
('Ing. Roberto López', 'Director de Operaciones - Procesadora de Alimentos', 'Llevamos 3 años trabajando con Dimogen para nuestros análisis microbiológicos. Su servicio es impecable y sus tiempos de entrega nos permiten mantener nuestra producción sin interrupciones.', 'FaUserTie', 5, 4, true);

-- =====================================================
-- 7. LANDING CONTACT INFO
-- =====================================================

DELETE FROM landing_contact_info WHERE id > 0;

INSERT INTO landing_contact_info (type, category, icon_name, label, value, link, sort_order, is_active)
VALUES
('address', 'main', 'FaMapMarkerAlt', 'Dirección', 'Calle Quintana Roo 78, Roma Sur, Cuauhtémoc, 06760, CDMX', 'https://www.google.com/maps/search/?api=1&query=Calle+Quintana+Roo+78+Roma+Sur+CDMX', 1, true),
('phone', 'line1', 'FaPhone', 'Teléfono 1', '56 1033 5124', 'tel:+525510335124', 2, true),
('phone', 'line2', 'FaPhone', 'Teléfono 2', '56 1045 4458', 'tel:+525510454458', 3, true),
('email', 'main', 'FaEnvelope', 'Correo', 'hola@dimogen.com.mx', 'mailto:hola@dimogen.com.mx', 4, true),
('hours', 'weekday', 'FaClock', 'Lun - Vie', '07:30 a.m. – 07:00 p.m.', NULL, 5, true),
('hours', 'saturday', 'FaClock', 'Sábado', '08:00 a.m. – 02:00 p.m.', NULL, 6, true),
('whatsapp', 'main', 'FaWhatsapp', 'WhatsApp', '55 1033 5124', 'https://wa.me/525510335124', 7, true),
('social', 'facebook', 'FaFacebookF', 'Facebook', 'dimogenlaboratorio', 'https://facebook.com/dimogenlaboratorio', 8, true),
('social', 'instagram', 'FaInstagram', 'Instagram', '@dimogenlab', 'https://instagram.com/dimogenlab', 9, true),
('social', 'tiktok', 'FaTiktok', 'TikTok', '@dimogen.lab', 'https://tiktok.com/@dimogen.lab', 10, true);

-- =====================================================
-- 8. LANDING STATISTICS (for CTA section)
-- =====================================================

DELETE FROM landing_statistics WHERE id > 0;

INSERT INTO landing_statistics (section, label, value, description, icon_name, sort_order, is_active)
VALUES
('cta', 'Estudios', '500+', 'estudios especializados', 'FaFlask', 1, true),
('cta', 'Experiencia', '25+', 'años de experiencia', 'FaAward', 2, true),
('cta', 'Pacientes', '10K+', 'pacientes atendidos', 'FaUsers', 3, true),
('cta', 'Satisfacción', '98%', 'satisfacción', 'FaStar', 4, true);

-- =====================================================
-- Done!
-- =====================================================
SELECT 'DIMOGEN seed data inserted successfully!' AS status;
