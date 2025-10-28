-- Migration: Preferencias de Notificación por Paciente
-- Descripción: Permite a los pacientes configurar qué tipos de notificaciones desean recibir

-- Crear tabla de preferencias de notificación
CREATE TABLE IF NOT EXISTS notification_preferences (
  id SERIAL PRIMARY KEY,
  paciente_id INTEGER NOT NULL REFERENCES paciente(id) ON DELETE CASCADE,

  -- Preferencias por tipo de notificación
  orden_pagada BOOLEAN DEFAULT true,
  resultados_listos BOOLEAN DEFAULT true,
  orden_en_proceso BOOLEAN DEFAULT true,
  recordatorio_retiro BOOLEAN DEFAULT true,
  resultados_criticos BOOLEAN DEFAULT true, -- Siempre true por seguridad, no modificable

  -- Preferencias de horario (opcional, para futuras mejoras)
  horario_desde TIME DEFAULT '07:00:00',
  horario_hasta TIME DEFAULT '21:00:00',
  notificar_fines_semana BOOLEAN DEFAULT true,

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Un paciente solo puede tener un registro de preferencias
  UNIQUE(paciente_id)
);

-- Índice para búsquedas rápidas por paciente_id
CREATE INDEX IF NOT EXISTS idx_notification_preferences_paciente
  ON notification_preferences(paciente_id);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_notification_preferences_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notification_preferences_updated_at
BEFORE UPDATE ON notification_preferences
FOR EACH ROW
EXECUTE FUNCTION update_notification_preferences_timestamp();

-- Comentarios en la tabla
COMMENT ON TABLE notification_preferences IS 'Preferencias de notificación configurables por paciente';
COMMENT ON COLUMN notification_preferences.orden_pagada IS 'Notificar cuando la orden es pagada';
COMMENT ON COLUMN notification_preferences.resultados_listos IS 'Notificar cuando los resultados están disponibles';
COMMENT ON COLUMN notification_preferences.orden_en_proceso IS 'Notificar actualizaciones de proceso';
COMMENT ON COLUMN notification_preferences.recordatorio_retiro IS 'Recordatorios para retirar resultados físicos';
COMMENT ON COLUMN notification_preferences.resultados_criticos IS 'Notificaciones de resultados urgentes (siempre activo)';
COMMENT ON COLUMN notification_preferences.horario_desde IS 'Hora de inicio para recibir notificaciones';
COMMENT ON COLUMN notification_preferences.horario_hasta IS 'Hora de fin para recibir notificaciones';
COMMENT ON COLUMN notification_preferences.notificar_fines_semana IS 'Permitir notificaciones en sábado y domingo';
