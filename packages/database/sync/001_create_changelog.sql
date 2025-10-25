-- =====================================================
-- Tabla de Auditoría de Cambios en Precios
-- =====================================================
-- Propósito: Registrar todos los cambios (INSERT/UPDATE/DELETE)
--            en la tabla de precios para sincronización con S3
-- Autor: Laboratorio EG
-- Fecha: Octubre 2025
-- =====================================================

CREATE TABLE IF NOT EXISTS precios_changelog (
    id SERIAL PRIMARY KEY,
    tabla VARCHAR(100) NOT NULL,
    operacion VARCHAR(10) NOT NULL CHECK (operacion IN ('INSERT', 'UPDATE', 'DELETE')),
    fecha TIMESTAMP NOT NULL DEFAULT NOW(),
    usuario VARCHAR(100) DEFAULT current_user,
    datos_json JSONB NOT NULL,
    sincronizado BOOLEAN DEFAULT FALSE,
    fecha_sincronizacion TIMESTAMP
);

-- Comentarios
COMMENT ON TABLE precios_changelog IS 'Registro de cambios en tabla de precios para sincronización con AWS S3';
COMMENT ON COLUMN precios_changelog.tabla IS 'Nombre de la tabla modificada';
COMMENT ON COLUMN precios_changelog.operacion IS 'Tipo de operación: INSERT, UPDATE o DELETE';
COMMENT ON COLUMN precios_changelog.fecha IS 'Timestamp del cambio';
COMMENT ON COLUMN precios_changelog.usuario IS 'Usuario que realizó el cambio';
COMMENT ON COLUMN precios_changelog.datos_json IS 'Datos del registro modificado en formato JSON';
COMMENT ON COLUMN precios_changelog.sincronizado IS 'Indica si el cambio fue sincronizado a S3';
COMMENT ON COLUMN precios_changelog.fecha_sincronizacion IS 'Timestamp de la sincronización';

-- Verificación
SELECT 'Tabla precios_changelog creada exitosamente' AS status;
