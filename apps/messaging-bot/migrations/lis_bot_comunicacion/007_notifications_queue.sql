-- ============================================
-- MIGRACIÓN 007: COLA DE NOTIFICACIONES
-- ============================================
-- Base de Datos: lis_bot_comunicacion
-- Propósito: Tabla de cola para notificaciones disparadas por triggers en labsisEG
-- Fecha: 2025-10-31
-- ============================================

-- ============================================
-- TABLA: notifications_queue
-- ============================================
CREATE TABLE IF NOT EXISTS notifications_queue (
  id SERIAL PRIMARY KEY,

  -- Referencias a labsisEG (no son FK físicas por estar en BD diferente)
  orden_trabajo_id INTEGER NOT NULL,
  paciente_id INTEGER NOT NULL,

  -- Tipo de notificación
  notification_type VARCHAR(50) NOT NULL CHECK (
    notification_type IN ('orden_creada', 'orden_pagada', 'resultados_listos')
  ),

  -- Estado de procesamiento
  status VARCHAR(20) DEFAULT 'pending' CHECK (
    status IN ('pending', 'processing', 'completed', 'failed')
  ),

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP,

  -- Control de reintentos
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  last_error TEXT,

  -- Metadata adicional (JSON para futura expansión)
  metadata JSONB DEFAULT '{}'::JSONB,

  -- Índice único para evitar duplicados de la misma notificación
  UNIQUE(orden_trabajo_id, notification_type)
);

-- ============================================
-- ÍNDICES
-- ============================================

-- Índice para obtener items pendientes rápidamente
CREATE INDEX idx_notif_queue_pending
ON notifications_queue(status, created_at)
WHERE status = 'pending';

-- Índice para consultas por orden de trabajo
CREATE INDEX idx_notif_queue_orden
ON notifications_queue(orden_trabajo_id);

-- Índice para consultas por paciente
CREATE INDEX idx_notif_queue_paciente
ON notifications_queue(paciente_id);

-- Índice para consultas por tipo de notificación
CREATE INDEX idx_notif_queue_type
ON notifications_queue(notification_type, status);

-- Índice para cleanup de items procesados/fallidos
CREATE INDEX idx_notif_queue_cleanup
ON notifications_queue(status, processed_at)
WHERE status IN ('completed', 'failed');

-- ============================================
-- FUNCIÓN: Limpiar cola antigua
-- ============================================
CREATE OR REPLACE FUNCTION cleanup_old_queue_items()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
  completed_deleted INTEGER;
  failed_deleted INTEGER;
BEGIN
  -- Eliminar items completados hace más de 30 días
  DELETE FROM notifications_queue
  WHERE status = 'completed'
    AND processed_at < NOW() - INTERVAL '30 days';

  GET DIAGNOSTICS completed_deleted = ROW_COUNT;
  deleted_count := deleted_count + completed_deleted;

  -- Eliminar items fallidos hace más de 7 días (después de max intentos)
  DELETE FROM notifications_queue
  WHERE status = 'failed'
    AND attempts >= max_attempts
    AND created_at < NOW() - INTERVAL '7 days';

  GET DIAGNOSTICS failed_deleted = ROW_COUNT;
  deleted_count := deleted_count + failed_deleted;

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCIÓN: Obtener estadísticas de la cola
-- ============================================
CREATE OR REPLACE FUNCTION get_queue_stats()
RETURNS TABLE(
  total_pending BIGINT,
  total_processing BIGINT,
  total_completed BIGINT,
  total_failed BIGINT,
  oldest_pending TIMESTAMP,
  avg_process_time_seconds NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE status = 'pending') as total_pending,
    COUNT(*) FILTER (WHERE status = 'processing') as total_processing,
    COUNT(*) FILTER (WHERE status = 'completed') as total_completed,
    COUNT(*) FILTER (WHERE status = 'failed') as total_failed,
    MIN(created_at) FILTER (WHERE status = 'pending') as oldest_pending,
    AVG(EXTRACT(EPOCH FROM (processed_at - created_at))) FILTER (WHERE status = 'completed') as avg_process_time_seconds
  FROM notifications_queue;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMENTARIOS
-- ============================================
COMMENT ON TABLE notifications_queue IS 'Cola de notificaciones disparadas por triggers en labsisEG';
COMMENT ON COLUMN notifications_queue.orden_trabajo_id IS 'ID de la orden de trabajo en labsisEG (FK lógica)';
COMMENT ON COLUMN notifications_queue.paciente_id IS 'ID del paciente en labsisEG (FK lógica)';
COMMENT ON COLUMN notifications_queue.notification_type IS 'Tipo: orden_creada, orden_pagada, resultados_listos';
COMMENT ON COLUMN notifications_queue.status IS 'Estado: pending, processing, completed, failed';
COMMENT ON COLUMN notifications_queue.attempts IS 'Número de intentos de procesamiento';
COMMENT ON COLUMN notifications_queue.max_attempts IS 'Máximo de intentos antes de marcar como fallido';

-- ============================================
-- DATOS INICIALES (OPCIONAL)
-- ============================================
-- Ninguno, la tabla empieza vacía

-- ============================================
-- FIN DE MIGRACIÓN 007
-- ============================================
