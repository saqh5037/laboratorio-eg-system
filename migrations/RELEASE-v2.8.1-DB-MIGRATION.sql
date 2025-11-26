-- ============================================================================
-- RELEASE v2.8.1 - DATABASE MIGRATION SCRIPT
-- ============================================================================
-- Fecha: 2025-11-22
-- Descripción: Migración para agregar items de navegación del sidebar mobile
-- Base de datos: lis_bot_comunicacion_elizabeth_gutierrez
-- ============================================================================

-- IMPORTANTE: Este script debe ejecutarse en la base de datos de configuración
-- del laboratorio activo. Por defecto: lis_bot_comunicacion_elizabeth_gutierrez

\echo '========================================='
\echo 'Release v2.8.1 - DB Migration'
\echo 'Base de datos: lis_bot_comunicacion_elizabeth_gutierrez'
\echo '========================================='

-- ============================================================================
-- 1. VERIFICACIÓN PRE-MIGRACIÓN
-- ============================================================================

\echo ''
\echo '1. Verificando estado actual de navigation_items...'

-- Mostrar conteo actual por ubicación
SELECT
  location,
  COUNT(*) as total_items,
  COUNT(CASE WHEN is_active THEN 1 END) as active_items
FROM navigation_items
GROUP BY location
ORDER BY location;

\echo ''
\echo '2. Verificando si ya existen items de sidebar...'

-- Verificar si ya hay items de sidebar
DO $$
DECLARE
  sidebar_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO sidebar_count
  FROM navigation_items
  WHERE location = 'sidebar';

  IF sidebar_count > 0 THEN
    RAISE NOTICE 'ADVERTENCIA: Ya existen % items de sidebar. La migración se ejecutará con ON CONFLICT DO NOTHING.', sidebar_count;
  ELSE
    RAISE NOTICE 'No se encontraron items de sidebar. Procediendo con inserción...';
  END IF;
END $$;

-- ============================================================================
-- 2. MIGRACIÓN: INSERTAR ITEMS DE SIDEBAR
-- ============================================================================

\echo ''
\echo '3. Insertando items de navegación del sidebar...'

-- Insertar los 5 items de navegación para el sidebar móvil
INSERT INTO navigation_items (
  location,
  label,
  url,
  icon,
  target,
  is_external,
  is_active,
  requires_auth,
  show_on_mobile,
  show_on_desktop,
  parent_id,
  sort_order
)
VALUES
  -- 1. Inicio
  (
    'sidebar',
    'Inicio',
    '/',
    'Home',
    '_self',
    false,
    true,
    false,
    true,
    true,
    NULL,
    1
  ),

  -- 2. Estudios
  (
    'sidebar',
    'Estudios',
    '/estudios',
    'FlaskConical',
    '_self',
    false,
    true,
    false,
    true,
    true,
    NULL,
    2
  ),

  -- 3. Resultados
  (
    'sidebar',
    'Resultados',
    '/resultados',
    'FileBarChart',
    '_self',
    false,
    true,
    false,
    true,
    true,
    NULL,
    3
  ),

  -- 4. Nosotros (anchor link)
  (
    'sidebar',
    'Nosotros',
    '/#nosotros',
    'Info',
    '_self',
    false,
    true,
    false,
    true,
    true,
    NULL,
    4
  ),

  -- 5. Contacto (anchor link)
  (
    'sidebar',
    'Contacto',
    '/#contacto',
    'Mail',
    '_self',
    false,
    true,
    false,
    true,
    true,
    NULL,
    5
  )
ON CONFLICT DO NOTHING;

-- Obtener el número de filas insertadas
\echo ''
\echo 'Items insertados exitosamente.'

-- ============================================================================
-- 3. VERIFICACIÓN POST-MIGRACIÓN
-- ============================================================================

\echo ''
\echo '4. Verificando resultado de la migración...'

-- Mostrar todos los items de sidebar insertados
SELECT
  id,
  location,
  label,
  url,
  icon,
  is_active,
  sort_order
FROM navigation_items
WHERE location = 'sidebar'
ORDER BY sort_order;

\echo ''
\echo '5. Conteo final por ubicación...'

-- Conteo final por ubicación
SELECT
  location,
  COUNT(*) as total_items,
  COUNT(CASE WHEN is_active THEN 1 END) as active_items
FROM navigation_items
GROUP BY location
ORDER BY location;

-- ============================================================================
-- 4. VALIDACIÓN DE ICONOS
-- ============================================================================

\echo ''
\echo '6. Validando iconos utilizados...'

-- Listar todos los iconos únicos para verificar compatibilidad con lucide-react
SELECT DISTINCT icon, COUNT(*) as usage_count
FROM navigation_items
WHERE location = 'sidebar'
GROUP BY icon
ORDER BY icon;

\echo ''
\echo '========================================='
\echo 'Migración completada exitosamente'
\echo '========================================='
\echo ''
\echo 'PRÓXIMOS PASOS:'
\echo '1. Reiniciar config-api para limpiar caché'
\echo '2. Verificar endpoint: curl http://localhost:3005/api/navigation/location/sidebar'
\echo '3. Probar sidebar en dispositivos móviles'
\echo ''

-- ============================================================================
-- 5. ROLLBACK (SOLO EN CASO DE EMERGENCIA)
-- ============================================================================

-- UNCOMMENT ONLY IF ROLLBACK IS NEEDED:
-- DELETE FROM navigation_items WHERE location = 'sidebar';
-- \echo 'ROLLBACK: Items de sidebar eliminados'
