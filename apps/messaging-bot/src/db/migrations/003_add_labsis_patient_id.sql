-- Migration 003: Add labsis_patient_id to bot_presupuestos and bot_citas
-- This links bot presupuestos/citas with Labsis paciente records

-- Add labsis_patient_id to bot_presupuestos
ALTER TABLE bot_presupuestos
ADD COLUMN labsis_patient_id INTEGER REFERENCES paciente(id);

-- Add labsis_patient_id to bot_citas
ALTER TABLE bot_citas
ADD COLUMN labsis_patient_id INTEGER REFERENCES paciente(id);

-- Create index for faster lookups
CREATE INDEX idx_bot_presupuestos_labsis_patient ON bot_presupuestos(labsis_patient_id);
CREATE INDEX idx_bot_citas_labsis_patient ON bot_citas(labsis_patient_id);

-- Add comment
COMMENT ON COLUMN bot_presupuestos.labsis_patient_id IS 'Reference to paciente.id in Labsis system';
COMMENT ON COLUMN bot_citas.labsis_patient_id IS 'Reference to paciente.id in Labsis system';
