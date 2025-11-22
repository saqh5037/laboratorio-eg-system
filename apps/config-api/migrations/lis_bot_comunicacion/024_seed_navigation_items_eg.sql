-- ============================================
-- NAVIGATION ITEMS - LABORATORIO ELIZABETH GUTIÉRREZ
-- Items de navegación para el header
-- ============================================

-- Limpiar items existentes (si los hay)
DELETE FROM navigation_items WHERE id > 0;

-- Item 1: Inicio
INSERT INTO navigation_items (
  location,
  label,
  url,
  icon,
  parent_id,
  sort_order,
  is_active
) VALUES (
  'header',
  'Inicio',
  '/',
  'FaHome',
  NULL,
  1,
  true
);

-- Item 2: Nosotros (parent para dropdown)
INSERT INTO navigation_items (
  location,
  label,
  url,
  icon,
  parent_id,
  sort_order,
  is_active
) VALUES (
  'header',
  'Nosotros',
  '/nosotros',
  'FaInfoCircle',
  NULL,
  2,
  true
);

-- Sub-items de Nosotros
INSERT INTO navigation_items (
  location,
  label,
  url,
  icon,
  parent_id,
  sort_order,
  is_active
) VALUES
(
  'header',
  'Nuestra Historia',
  '/nosotros#historia',
  'FaHistory',
  (SELECT id FROM navigation_items WHERE label = 'Nosotros' AND parent_id IS NULL LIMIT 1),
  1,
  true
),
(
  'header',
  'Nuestros Valores',
  '/nosotros#valores',
  'FaHeart',
  (SELECT id FROM navigation_items WHERE label = 'Nosotros' AND parent_id IS NULL LIMIT 1),
  2,
  true
),
(
  'header',
  'Certificaciones',
  '/nosotros#certificaciones',
  'FaCertificate',
  (SELECT id FROM navigation_items WHERE label = 'Nosotros' AND parent_id IS NULL LIMIT 1),
  3,
  true
);

-- Item 3: Servicios
INSERT INTO navigation_items (
  location,
  label,
  url,
  icon,
  parent_id,
  sort_order,
  is_active
) VALUES (
  'header',
  'Servicios',
  '/servicios',
  'FaFlask',
  NULL,
  3,
  true
);

-- Item 4: Resultados
INSERT INTO navigation_items (
  location,
  label,
  url,
  icon,
  parent_id,
  sort_order,
  is_active
) VALUES (
  'header',
  'Resultados',
  '/resultados',
  'FaFileAlt',
  NULL,
  4,
  true
);

-- Item 5: Contacto (anchor link a sección en landing page)
INSERT INTO navigation_items (
  location,
  label,
  url,
  icon,
  parent_id,
  sort_order,
  is_active
) VALUES (
  'header',
  'Contacto',
  '/#contacto',
  'FaPhone',
  NULL,
  5,
  true
);

-- Verificación
SELECT
  ni.id,
  CASE
    WHEN ni.parent_id IS NULL THEN ni.label
    ELSE '  → ' || ni.label
  END as menu_item,
  ni.url,
  ni.icon,
  ni.sort_order,
  ni.is_active
FROM navigation_items ni
LEFT JOIN navigation_items parent ON ni.parent_id = parent.id
ORDER BY
  COALESCE(parent.sort_order, ni.sort_order),
  ni.parent_id NULLS FIRST,
  ni.sort_order;

-- Resultado esperado:
-- 1. Inicio
-- 2. Nosotros (dropdown)
--    → Nuestra Historia
--    → Nuestros Valores
--    → Certificaciones
-- 3. Servicios
-- 4. Resultados
-- 5. Contacto
