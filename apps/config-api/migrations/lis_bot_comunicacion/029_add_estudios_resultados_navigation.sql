-- Migration 029: Add Estudios and Resultados to navigation
-- Agregar items de menú para Catálogo de Estudios y Portal de Resultados

-- Header navigation
INSERT INTO navigation_items (location, label, url, icon, target, is_external, is_active, requires_auth, show_on_mobile, show_on_desktop, sort_order)
VALUES
  ('header', 'Estudios', '/estudios', 'FlaskConical', '_self', false, true, false, true, true, 3),
  ('header', 'Resultados', '/resultados', 'FileText', '_self', false, true, false, true, true, 5)
ON CONFLICT DO NOTHING;

-- Sidebar navigation
INSERT INTO navigation_items (location, label, url, icon, target, is_external, is_active, requires_auth, show_on_mobile, show_on_desktop, sort_order)
VALUES
  ('sidebar', 'Estudios', '/estudios', 'FlaskConical', '_self', false, true, false, true, true, 3),
  ('sidebar', 'Resultados', '/resultados', 'FileText', '_self', false, true, false, true, true, 5)
ON CONFLICT DO NOTHING;

-- Actualizar sort_order de items existentes para mantener orden correcto
-- Header
UPDATE navigation_items SET sort_order = 4 WHERE location = 'header' AND label = 'Servicios';
UPDATE navigation_items SET sort_order = 6 WHERE location = 'header' AND label = 'Contacto';

-- Sidebar
UPDATE navigation_items SET sort_order = 4 WHERE location = 'sidebar' AND label = 'Servicios';
UPDATE navigation_items SET sort_order = 6 WHERE location = 'sidebar' AND label = 'Contacto';

-- Verificar resultado
SELECT location, label, sort_order
FROM navigation_items
WHERE location IN ('header', 'sidebar') AND is_active = true
ORDER BY location, sort_order;
