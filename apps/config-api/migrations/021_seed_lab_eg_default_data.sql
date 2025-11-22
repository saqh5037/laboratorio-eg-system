-- Seed data para Landing Page del Laboratorio EG
-- Datos actuales extraídos de LandingPageUnified.jsx
-- Mantiene Zero Visual Changes - la landing se verá exactamente igual después de parametrizar

-- =============================================================================
-- 1. LANDING_VALUES - Valores corporativos (Sección Nosotros)
-- =============================================================================

INSERT INTO landing_values (icon_name, title, description, sort_order, is_active) VALUES
('FaBullseye', 'Calidad', 'Diagnóstico oportuno y preciso con la más alta tecnología', 1, true),
('FaHandshake', 'Confianza', 'Respaldo profesional en cada análisis que realizamos', 2, true),
('FaHeart', 'Cercanía', 'Atención personalizada y cálida para toda la familia', 3, true),
('FaHandsHelping', 'Compromiso', 'Con tu salud integral y bienestar continuo', 4, true),
('FaPrayingHands', 'Fe y gratitud', 'Guiados por principios sólidos y valores cristianos', 5, true);

-- =============================================================================
-- 2. LANDING_CERTIFICATIONS - Certificaciones (Sección Certificaciones)
-- =============================================================================

INSERT INTO landing_certifications (icon_name, title, description, sort_order, is_active) VALUES
('FaCertificate', 'Certificado MPPS', 'Ministerio del Poder Popular para la Salud', 1, true),
('FaCertificate', 'SV Bioanalistas', 'Sociedad Venezolana de Bioanalistas Especialistas', 2, true),
('FaCertificate', 'ISO 9001:2015', 'Certificación Internacional de Calidad', 3, true);

-- =============================================================================
-- 3. LANDING_TESTIMONIALS - Testimonios de pacientes
-- =============================================================================

INSERT INTO landing_testimonials (name, role, text, avatar_type, rating, sort_order, is_active) VALUES
('María González', 'Paciente frecuente', 'Me siento como en casa cada vez que vengo. El equipo no solo es profesional, sino que te trata con un cariño genuino. Llevo 5 años confiando en ellos para todos mis estudios y nunca me han fallado.', 'FaUser', 5, 1, true),
('Dr. Carlos Rodríguez', 'Médico Internista', 'Como médico, necesito resultados en los que pueda confiar plenamente. En el Laboratorio EG encuentro esa precisión que mis pacientes merecen, junto con un trato humano que hace la diferencia.', 'FaUserMd', 5, 2, true),
('Ana Martínez', 'Empresa Cliente', 'Cuando eliges un laboratorio para tu equipo, no solo buscas profesionalismo, sino un aliado que entienda tus necesidades. El Laboratorio EG nos ha dado eso y mucho más durante años.', 'FaUserTie', 5, 3, true);

-- =============================================================================
-- 4. LANDING_CONTACT_INFO - Información de contacto
-- =============================================================================

-- Dirección
INSERT INTO landing_contact_info (type, category, icon_name, label, value, link, sort_order, is_active) VALUES
('address', NULL, 'FaMapMarkerAlt', 'Dirección', 'Av. Libertador, Edf. Majestic, Piso 1, Consultorio 18, La Campiña, Caracas 1050', 'https://www.google.com/maps/search/?api=1&query=Av.+Libertador,+Edf.+Majestic,+Piso+1,+Consultorio+18,+La+Campiña,+Caracas+1050,+Venezuela', 1, true);

-- Teléfonos
INSERT INTO landing_contact_info (type, category, icon_name, label, value, link, sort_order, is_active) VALUES
('phone', 'line1', 'FaPhone', 'Teléfono 1', '+58 212 762.0561', 'tel:+582127620561', 2, true),
('phone', 'line2', 'FaPhone', 'Teléfono 2', '+58 212 763.5909', 'tel:+582127635909', 3, true),
('phone', 'line3', 'FaPhone', 'Teléfono 3', '+58 212 763.6628', 'tel:+582127636628', 4, true);

-- Email
INSERT INTO landing_contact_info (type, category, icon_name, label, value, link, sort_order, is_active) VALUES
('email', NULL, 'FaEnvelope', 'Email', 'info@laboratorioeg.com', 'mailto:info@laboratorioeg.com', 5, true);

-- Horarios
INSERT INTO landing_contact_info (type, category, icon_name, label, value, link, sort_order, is_active) VALUES
('hours', 'weekday', 'FaClock', 'Lunes a Viernes', '7:00-16:00', NULL, 6, true),
('hours', 'saturday', 'FaClock', 'Sábado', '8:00-12:00', NULL, 7, true);

-- Servicio a domicilio
INSERT INTO landing_contact_info (type, category, icon_name, label, value, link, sort_order, is_active) VALUES
('service', 'domicilio', 'FaTruck', 'Domicilios', 'Servicio de toma de muestras a domicilio disponible', NULL, 8, true);

-- Redes sociales
INSERT INTO landing_contact_info (type, category, icon_name, label, value, link, sort_order, is_active) VALUES
('social', 'instagram', 'FaInstagram', 'Instagram', '@laboratorioeg', 'https://www.instagram.com/laboratorioeg', 9, true),
('social', 'twitter', 'FaTwitter', 'Twitter', 'Twitter', 'https://twitter.com/Laboratorio_EG', 10, true);

-- WhatsApp
INSERT INTO landing_contact_info (type, category, icon_name, label, value, link, sort_order, is_active) VALUES
('whatsapp', NULL, 'FaWhatsapp', 'WhatsApp', '+58 424 1440798', 'https://wa.me/584241440798', 11, true);

-- =============================================================================
-- 5. LANDING_CONTENT_BLOCKS - Bloques de contenido de texto
-- =============================================================================

-- Sección Nosotros - Header
INSERT INTO landing_content_blocks (section, block_type, content, image_url, metadata, sort_order, is_active) VALUES
('nosotros-header', 'title', 'NUESTRA HISTORIA', NULL, NULL, 1, true),
('nosotros-header', 'subtitle', '43 años de compromiso con tu salud', NULL, NULL, 2, true),
('nosotros-header', 'badge', 'Desde 1982', NULL, NULL, 3, true);

-- Sección Historia - Párrafos
INSERT INTO landing_content_blocks (section, block_type, content, image_url, metadata, sort_order, is_active) VALUES
('historia', 'title', 'Desde 1982', NULL, NULL, 1, true),
('historia', 'paragraph', 'Laboratorio EG ha sido sinónimo de confianza y compromiso en Caracas. Lo que comenzó como un proyecto familiar se ha convertido en un referente de calidad y cercanía humana.', NULL, NULL, 2, true),
('historia', 'paragraph', '43 años no son sencillos: han sido camino de altos y bajos que hemos aprendido a transitar unidos, en familia, y desde la convicción de que sí se puede.', NULL, NULL, 3, true),
('historia', 'paragraph', 'Hoy seguimos adelante con la misma pasión del primer día, comprometidos con tu salud y bienestar.', NULL, NULL, 4, true),
('historia', 'image', 'Equipo Laboratorio Elizabeth Gutiérrez', 'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=800&h=600&fit=crop', NULL, 5, true),
('historia', 'badge', '43 años de excelencia', NULL, NULL, 6, true);

-- Sección Valores - Header
INSERT INTO landing_content_blocks (section, block_type, content, image_url, metadata, sort_order, is_active) VALUES
('valores-header', 'title', 'Nuestros Valores', NULL, NULL, 1, true),
('valores-header', 'description', 'Los principios que nos guían cada día', NULL, NULL, 2, true);

-- Sección Propósito
INSERT INTO landing_content_blocks (section, block_type, content, image_url, metadata, sort_order, is_active) VALUES
('proposito', 'title', 'Nuestro Propósito', NULL, NULL, 1, true),
('proposito', 'paragraph', 'Ser el laboratorio clínico que necesitas, combinando excelencia técnica con calidez humana.', NULL, NULL, 2, true),
('proposito', 'paragraph', 'Nos encanta atenderte con amor ❤️', NULL, NULL, 3, true);

-- Sección Certificaciones - Header
INSERT INTO landing_content_blocks (section, block_type, content, image_url, metadata, sort_order, is_active) VALUES
('certificaciones-header', 'title', '43 años de excelencia', NULL, NULL, 1, true),
('certificaciones-header', 'description', 'Certificados y avalados por las principales instituciones de salud de Venezuela', NULL, NULL, 2, true);

-- Sección Testimonios - Header
INSERT INTO landing_content_blocks (section, block_type, content, image_url, metadata, sort_order, is_active) VALUES
('testimonios-header', 'title', 'Lo que dicen nuestros pacientes', NULL, NULL, 1, true),
('testimonios-header', 'description', 'Miles de pacientes satisfechos avalan nuestra calidad', NULL, NULL, 2, true);

-- Sección Contacto - Header
INSERT INTO landing_content_blocks (section, block_type, content, image_url, metadata, sort_order, is_active) VALUES
('contacto-header', 'title', 'CONTÁCTANOS', NULL, NULL, 1, true),
('contacto-header', 'subtitle', 'Siempre listos para ti y tu salud', NULL, NULL, 2, true),
('contacto-header', 'badge', '43 años de experiencia', NULL, NULL, 3, true);

-- Sección Contacto - Formulario
INSERT INTO landing_content_blocks (section, block_type, content, image_url, metadata, sort_order, is_active) VALUES
('contacto-form', 'title', 'Escríbenos', NULL, NULL, 1, true),
('contacto-form', 'description', 'Completa el formulario y te responderemos pronto', NULL, NULL, 2, true);

-- Sección Contacto - Ubicación
INSERT INTO landing_content_blocks (section, block_type, content, image_url, metadata, sort_order, is_active) VALUES
('contacto-ubicacion', 'title', 'Nuestra Ubicación', NULL, NULL, 1, true);

-- Sección WhatsApp CTA
INSERT INTO landing_content_blocks (section, block_type, content, image_url, metadata, sort_order, is_active) VALUES
('whatsapp-cta', 'description', 'Escríbenos por WhatsApp', NULL, NULL, 1, true);

-- =============================================================================
-- 6. LANDING_STATISTICS - Estadísticas para sección CTA
-- =============================================================================
-- Nota: Estos valores se usan en CTASectionEG.jsx
-- Por ahora los dejamos como ejemplo, ya que el CTA actual usa datos hardcodeados diferentes

INSERT INTO landing_statistics (section, label, value, description, icon_name, sort_order, is_active) VALUES
('cta', 'Experiencia', '43 años', 'de excelencia médica', 'FaAward', 1, true),
('cta', 'Estudios', '200+', 'estudios disponibles', 'FaFlask', 2, true),
('cta', 'Rapidez', '24h', 'resultados rápidos', 'FaClock', 3, true);

-- =============================================================================
-- COMENTARIOS FINALES
-- =============================================================================

-- Este seed contiene TODOS los datos actuales del Laboratorio EG extraídos de:
-- - LandingPageUnified.jsx (líneas 149-850+)
--
-- Total de registros insertados:
-- - 5 valores corporativos
-- - 3 certificaciones
-- - 3 testimonios de pacientes
-- - 11 items de información de contacto
-- - 23 bloques de contenido de texto
-- - 3 estadísticas para CTA
--
-- TOTAL: ~48 registros
--
-- Objetivo: Zero Visual Changes
-- La landing page se verá EXACTAMENTE IGUAL después de la parametrización
-- porque todos los datos actuales están ahora en la base de datos.
