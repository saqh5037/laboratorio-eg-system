-- =====================================================
-- Índices para Optimización de Changelog
-- =====================================================
-- Propósito: Mejorar el performance de queries en precios_changelog
-- Autor: Laboratorio EG
-- Fecha: Octubre 2025
-- =====================================================

-- Índice por fecha (para ordenamiento y filtrado por tiempo)
CREATE INDEX IF NOT EXISTS idx_changelog_fecha
ON precios_changelog (fecha DESC);

COMMENT ON INDEX idx_changelog_fecha IS 'Índice para ordenar y filtrar por fecha de cambio';

-- Índice por estado de sincronización (para encontrar pendientes rápidamente)
CREATE INDEX IF NOT EXISTS idx_changelog_sincronizado
ON precios_changelog (sincronizado)
WHERE sincronizado = FALSE;

COMMENT ON INDEX idx_changelog_sincronizado IS 'Índice parcial para cambios no sincronizados';

-- Índice compuesto (fecha + sincronizado) para queries comunes
CREATE INDEX IF NOT EXISTS idx_changelog_fecha_sincronizado
ON precios_changelog (fecha DESC, sincronizado);

COMMENT ON INDEX idx_changelog_fecha_sincronizado IS 'Índice compuesto para queries que filtran por ambos campos';

-- Índice GIN para búsqueda en JSONB (opcional, si necesitas buscar en datos_json)
CREATE INDEX IF NOT EXISTS idx_changelog_datos_json
ON precios_changelog USING GIN (datos_json);

COMMENT ON INDEX idx_changelog_datos_json IS 'Índice GIN para búsquedas en el campo JSON';

-- =====================================================
-- Índices en tablas de pruebas y grupos
-- =====================================================

-- Índice en prueba.activa (para filtrar pruebas activas)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE tablename = 'prueba'
        AND indexname = 'idx_prueba_activa'
    ) THEN
        CREATE INDEX idx_prueba_activa ON prueba (activa);
    END IF;
END $$;

-- Índice en grupo_prueba.activa (para filtrar grupos activos)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE tablename = 'grupo_prueba'
        AND indexname = 'idx_grupo_prueba_activa'
    ) THEN
        CREATE INDEX idx_grupo_prueba_activa ON grupo_prueba (activa);
    END IF;
END $$;

-- Índice compuesto en lista_precios_has_prueba (lista_precios_id + prueba_id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE tablename = 'lista_precios_has_prueba'
        AND indexname = 'idx_lpp_lista_prueba'
    ) THEN
        CREATE INDEX idx_lpp_lista_prueba ON lista_precios_has_prueba (lista_precios_id, prueba_id);
    END IF;
END $$;

-- Índice compuesto en lista_precios_has_gprueba (lista_precios_id + gprueba_id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes
        WHERE tablename = 'lista_precios_has_gprueba'
        AND indexname = 'idx_lpg_lista_grupo'
    ) THEN
        CREATE INDEX idx_lpg_lista_grupo ON lista_precios_has_gprueba (lista_precios_id, gprueba_id);
    END IF;
END $$;

-- Verificación de índices creados
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'precios_changelog'
ORDER BY indexname;

-- Estadísticas de la tabla
ANALYZE precios_changelog;

SELECT 'Índices creados y tabla analizada exitosamente' AS status;
