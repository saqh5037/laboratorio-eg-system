-- ============================================
-- MESSAGING BOT SERVICE - Presupuestos y Citas
-- ============================================
-- Agrega tablas para presupuestos y citas específicos del laboratorio
-- ============================================

-- ============================================
-- 1. PRESUPUESTOS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS bot_presupuestos (
    id SERIAL PRIMARY KEY,
    presupuesto_number VARCHAR(50) UNIQUE NOT NULL,
    conversation_id VARCHAR(100) REFERENCES bot_conversations(conversation_id),
    platform VARCHAR(20) NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    patient_name VARCHAR(200) NOT NULL,
    patient_phone VARCHAR(50) NOT NULL,
    patient_email VARCHAR(200),
    patient_cedula VARCHAR(20),
    tests_requested JSONB NOT NULL DEFAULT '[]',
    estimated_total DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'approved', 'rejected', 'expired')),
    sent_at TIMESTAMP,
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for presupuestos
CREATE INDEX IF NOT EXISTS idx_bot_presupuestos_conversation ON bot_presupuestos(conversation_id);
CREATE INDEX IF NOT EXISTS idx_bot_presupuestos_platform ON bot_presupuestos(platform);
CREATE INDEX IF NOT EXISTS idx_bot_presupuestos_user_id ON bot_presupuestos(user_id);
CREATE INDEX IF NOT EXISTS idx_bot_presupuestos_status ON bot_presupuestos(status);
CREATE INDEX IF NOT EXISTS idx_bot_presupuestos_created ON bot_presupuestos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bot_presupuestos_patient_phone ON bot_presupuestos(patient_phone);

COMMENT ON TABLE bot_presupuestos IS 'Presupuestos solicitados vía bots';
COMMENT ON COLUMN bot_presupuestos.presupuesto_number IS 'Auto-generated: PRE-YYYY-NNNN';
COMMENT ON COLUMN bot_presupuestos.tests_requested IS 'JSON array: [{name, description, estimatedPrice}]';

-- ============================================
-- 2. CITAS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS bot_citas (
    id SERIAL PRIMARY KEY,
    cita_number VARCHAR(50) UNIQUE NOT NULL,
    conversation_id VARCHAR(100) REFERENCES bot_conversations(conversation_id),
    platform VARCHAR(20) NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    patient_name VARCHAR(200) NOT NULL,
    patient_phone VARCHAR(50) NOT NULL,
    patient_email VARCHAR(200),
    patient_cedula VARCHAR(20),
    test_type VARCHAR(200) NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time VARCHAR(10) NOT NULL,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
    confirmed_at TIMESTAMP,
    completed_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for citas
CREATE INDEX IF NOT EXISTS idx_bot_citas_conversation ON bot_citas(conversation_id);
CREATE INDEX IF NOT EXISTS idx_bot_citas_platform ON bot_citas(platform);
CREATE INDEX IF NOT EXISTS idx_bot_citas_user_id ON bot_citas(user_id);
CREATE INDEX IF NOT EXISTS idx_bot_citas_status ON bot_citas(status);
CREATE INDEX IF NOT EXISTS idx_bot_citas_appointment_date ON bot_citas(appointment_date);
CREATE INDEX IF NOT EXISTS idx_bot_citas_created ON bot_citas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bot_citas_patient_phone ON bot_citas(patient_phone);

COMMENT ON TABLE bot_citas IS 'Citas agendadas vía bots';
COMMENT ON COLUMN bot_citas.cita_number IS 'Auto-generated: CIT-YYYY-NNNN';

-- ============================================
-- 3. FUNCTIONS
-- ============================================

-- Function: Generate presupuesto number
CREATE OR REPLACE FUNCTION generate_presupuesto_number()
RETURNS TEXT AS $$
DECLARE
    year TEXT;
    seq_num INTEGER;
    presupuesto_num TEXT;
BEGIN
    year := TO_CHAR(NOW(), 'YYYY');

    SELECT COALESCE(MAX(CAST(SUBSTRING(presupuesto_number FROM 'PRE-[0-9]{4}-([0-9]+)') AS INTEGER)), 0) + 1
    INTO seq_num
    FROM bot_presupuestos
    WHERE presupuesto_number LIKE 'PRE-' || year || '-%';

    presupuesto_num := 'PRE-' || year || '-' || LPAD(seq_num::TEXT, 4, '0');

    RETURN presupuesto_num;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_presupuesto_number() IS 'Generate unique presupuesto number: PRE-YYYY-NNNN';

-- Function: Generate cita number
CREATE OR REPLACE FUNCTION generate_cita_number()
RETURNS TEXT AS $$
DECLARE
    year TEXT;
    seq_num INTEGER;
    cita_num TEXT;
BEGIN
    year := TO_CHAR(NOW(), 'YYYY');

    SELECT COALESCE(MAX(CAST(SUBSTRING(cita_number FROM 'CIT-[0-9]{4}-([0-9]+)') AS INTEGER)), 0) + 1
    INTO seq_num
    FROM bot_citas
    WHERE cita_number LIKE 'CIT-' || year || '-%';

    cita_num := 'CIT-' || year || '-' || LPAD(seq_num::TEXT, 4, '0');

    RETURN cita_num;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_cita_number() IS 'Generate unique cita number: CIT-YYYY-NNNN';

-- ============================================
-- 4. TRIGGERS
-- ============================================

-- Trigger: Auto-update updated_at on presupuestos
CREATE OR REPLACE FUNCTION update_bot_presupuestos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_bot_presupuestos_updated_at ON bot_presupuestos;
CREATE TRIGGER trigger_bot_presupuestos_updated_at
    BEFORE UPDATE ON bot_presupuestos
    FOR EACH ROW
    EXECUTE FUNCTION update_bot_presupuestos_updated_at();

-- Trigger: Auto-update updated_at on citas
CREATE OR REPLACE FUNCTION update_bot_citas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_bot_citas_updated_at ON bot_citas;
CREATE TRIGGER trigger_bot_citas_updated_at
    BEFORE UPDATE ON bot_citas
    FOR EACH ROW
    EXECUTE FUNCTION update_bot_citas_updated_at();

-- ============================================
-- 5. VIEWS
-- ============================================

-- View: Pending presupuestos
CREATE OR REPLACE VIEW bot_pending_presupuestos AS
SELECT
    p.id,
    p.presupuesto_number,
    p.platform,
    p.patient_name,
    p.patient_phone,
    p.patient_email,
    p.tests_requested,
    p.estimated_total,
    p.status,
    p.created_at,
    EXTRACT(EPOCH FROM (NOW() - p.created_at))/3600 AS hours_since_created
FROM bot_presupuestos p
WHERE p.status IN ('pending', 'sent')
ORDER BY p.created_at ASC;

COMMENT ON VIEW bot_pending_presupuestos IS 'Pending presupuestos';

-- View: Upcoming citas
CREATE OR REPLACE VIEW bot_upcoming_citas AS
SELECT
    c.id,
    c.cita_number,
    c.platform,
    c.patient_name,
    c.patient_phone,
    c.patient_email,
    c.test_type,
    c.appointment_date,
    c.appointment_time,
    c.status,
    c.created_at
FROM bot_citas c
WHERE c.status IN ('pending', 'confirmed')
AND c.appointment_date >= CURRENT_DATE
ORDER BY c.appointment_date ASC, c.appointment_time ASC;

COMMENT ON VIEW bot_upcoming_citas IS 'Upcoming citas';

-- ============================================
-- Migration Complete
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '✅ Presupuestos and Citas migration completed successfully';
    RAISE NOTICE 'Tables created:';
    RAISE NOTICE '  - bot_presupuestos';
    RAISE NOTICE '  - bot_citas';
    RAISE NOTICE 'Functions created:';
    RAISE NOTICE '  - generate_presupuesto_number()';
    RAISE NOTICE '  - generate_cita_number()';
    RAISE NOTICE 'Views created:';
    RAISE NOTICE '  - bot_pending_presupuestos';
    RAISE NOTICE '  - bot_upcoming_citas';
END $$;
