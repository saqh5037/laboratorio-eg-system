-- Migration: Add Sidebar Navigation Items
-- Database: lis_bot_comunicacion_elizabeth_gutierrez
-- Date: 2025-11-22
-- Description: Crear items de navegación para el sidebar móvil

-- Insertar items de sidebar para menú móvil
INSERT INTO navigation_items (location, label, url, icon, target, is_external, is_active, requires_auth, show_on_mobile, show_on_desktop, sort_order)
VALUES
  ('sidebar', 'Inicio', '/', 'Home', '_self', false, true, false, true, true, 1),
  ('sidebar', 'Estudios', '/estudios', 'FlaskConical', '_self', false, true, false, true, true, 2),
  ('sidebar', 'Resultados', '/resultados', 'FileBarChart', '_self', false, true, false, true, true, 3),
  ('sidebar', 'Nosotros', '/#nosotros', 'Info', '_self', false, true, false, true, true, 4),
  ('sidebar', 'Contacto', '/#contacto', 'Mail', '_self', false, true, false, true, true, 5)
ON CONFLICT DO NOTHING;

-- Verificación
SELECT
  location,
  COUNT(*) as total_items,
  COUNT(CASE WHEN is_active THEN 1 END) as active_items
FROM navigation_items
GROUP BY location
ORDER BY location;
