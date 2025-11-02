-- ============================================
-- LIS_BOT_COMUNICACION - Schema Inicial
-- ============================================
-- Base de datos separada para comunicación con pacientes
-- Fecha: 2025-10-29
-- ============================================

-- IMPORTANTE: Esta migración NO incluye Foreign Keys a labsisEG
-- Las relaciones con paciente, orden_trabajo, etc. se validan en código

-- ============================================
-- 1. BOT_CONVERSATIONS - Conversaciones Multi-Plataforma
-- ============================================
CREATE TABLE IF NOT EXISTS bot_conversations (
    id SERIAL PRIMARY KEY,
    conversation_id VARCHAR(100) UNIQUE NOT NULL,
    platform VARCHAR(20) NOT NULL CHECK (platform IN ('telegram', 'whatsapp', 'discord', 'slack', 'mock')),
    chat_id VARCHAR(100) NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    user_info JSONB DEFAULT '{}',
    state VARCHAR(50) DEFAULT 'active' CHECK (state IN ('active', 'waiting', 'completed', 'archived')),
    context JSONB DEFAULT '{}',
    last_message_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bot_conversations_platform ON bot_conversations(platform);
CREATE INDEX IF NOT EXISTS idx_bot_conversations_chat_id ON bot_conversations(chat_id);
CREATE INDEX IF NOT EXISTS idx_bot_conversations_user_id ON bot_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_bot_conversations_state ON bot_conversations(state);
CREATE INDEX IF NOT EXISTS idx_bot_conversations_last_message ON bot_conversations(last_message_at DESC);

COMMENT ON TABLE bot_conversations IS 'Conversaciones multi-plataforma (Telegram, WhatsApp, etc.)';

-- ============================================
-- 2. BOT_MESSAGES - Historial de Mensajes
-- ============================================
CREATE TABLE IF NOT EXISTS bot_messages (
    id SERIAL PRIMARY KEY,
    message_id VARCHAR(100) NOT NULL,
    conversation_id VARCHAR(100) REFERENCES bot_conversations(conversation_id) ON DELETE CASCADE,
    platform VARCHAR(20) NOT NULL,
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    type VARCHAR(20) NOT NULL CHECK (type IN ('text', 'image', 'document', 'location', 'callback', 'other')),
    content JSONB NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bot_messages_conversation ON bot_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_bot_messages_platform ON bot_messages(platform);
CREATE INDEX IF NOT EXISTS idx_bot_messages_direction ON bot_messages(direction);
CREATE INDEX IF NOT EXISTS idx_bot_messages_type ON bot_messages(type);
CREATE INDEX IF NOT EXISTS idx_bot_messages_created ON bot_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bot_messages_platform_message_id ON bot_messages(platform, message_id);

COMMENT ON TABLE bot_messages IS 'Historial de mensajes en formato UnifiedMessage';

-- ============================================
-- 3. BOT_WORK_ORDERS - Órdenes de Trabajo
-- ============================================
CREATE TABLE IF NOT EXISTS bot_work_orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    conversation_id VARCHAR(100) REFERENCES bot_conversations(conversation_id),
    platform VARCHAR(20) NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    user_name VARCHAR(200),
    type VARCHAR(50) NOT NULL CHECK (type IN ('maintenance', 'repair', 'installation', 'other')),
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    title VARCHAR(200),
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'on_hold')),
    assigned_to VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bot_work_orders_conversation ON bot_work_orders(conversation_id);
CREATE INDEX IF NOT EXISTS idx_bot_work_orders_platform ON bot_work_orders(platform);
CREATE INDEX IF NOT EXISTS idx_bot_work_orders_user_id ON bot_work_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_bot_work_orders_status ON bot_work_orders(status);
CREATE INDEX IF NOT EXISTS idx_bot_work_orders_type ON bot_work_orders(type);
CREATE INDEX IF NOT EXISTS idx_bot_work_orders_priority ON bot_work_orders(priority);
CREATE INDEX IF NOT EXISTS idx_bot_work_orders_created ON bot_work_orders(created_at DESC);

COMMENT ON TABLE bot_work_orders IS 'Órdenes de trabajo creadas vía bot';

-- ============================================
-- 4. BOT_SUPPLY_REQUESTS - Solicitudes de Insumos
-- ============================================
CREATE TABLE IF NOT EXISTS bot_supply_requests (
    id SERIAL PRIMARY KEY,
    request_number VARCHAR(50) UNIQUE NOT NULL,
    conversation_id VARCHAR(100) REFERENCES bot_conversations(conversation_id),
    platform VARCHAR(20) NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    user_name VARCHAR(200),
    items JSONB NOT NULL,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'ordered', 'received', 'cancelled')),
    approved_by VARCHAR(100),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bot_supply_requests_conversation ON bot_supply_requests(conversation_id);
CREATE INDEX IF NOT EXISTS idx_bot_supply_requests_platform ON bot_supply_requests(platform);
CREATE INDEX IF NOT EXISTS idx_bot_supply_requests_user_id ON bot_supply_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_bot_supply_requests_status ON bot_supply_requests(status);
CREATE INDEX IF NOT EXISTS idx_bot_supply_requests_created ON bot_supply_requests(created_at DESC);

COMMENT ON TABLE bot_supply_requests IS 'Solicitudes de insumos/reactivos';

-- ============================================
-- 5. BOT_METRICS - Métricas de Uso
-- ============================================
CREATE TABLE IF NOT EXISTS bot_metrics (
    id SERIAL PRIMARY KEY,
    platform VARCHAR(20) NOT NULL,
    date DATE NOT NULL,
    total_messages INTEGER DEFAULT 0,
    inbound_messages INTEGER DEFAULT 0,
    outbound_messages INTEGER DEFAULT 0,
    unique_users INTEGER DEFAULT 0,
    active_conversations INTEGER DEFAULT 0,
    new_conversations INTEGER DEFAULT 0,
    work_orders_created INTEGER DEFAULT 0,
    supply_requests_created INTEGER DEFAULT 0,
    gemini_api_calls INTEGER DEFAULT 0,
    gemini_errors INTEGER DEFAULT 0,
    average_response_time_ms INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(platform, date)
);

CREATE INDEX IF NOT EXISTS idx_bot_metrics_platform ON bot_metrics(platform);
CREATE INDEX IF NOT EXISTS idx_bot_metrics_date ON bot_metrics(date DESC);

COMMENT ON TABLE bot_metrics IS 'Métricas diarias por plataforma';

-- ============================================
-- 6. BOT_PRESUPUESTOS - Presupuestos Solicitados
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
    labsis_patient_id INTEGER,  -- NO FK - Validación en código
    tests_requested JSONB NOT NULL DEFAULT '[]',
    estimated_total DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'approved', 'rejected', 'expired')),
    sent_at TIMESTAMP,
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bot_presupuestos_conversation ON bot_presupuestos(conversation_id);
CREATE INDEX IF NOT EXISTS idx_bot_presupuestos_platform ON bot_presupuestos(platform);
CREATE INDEX IF NOT EXISTS idx_bot_presupuestos_user_id ON bot_presupuestos(user_id);
CREATE INDEX IF NOT EXISTS idx_bot_presupuestos_status ON bot_presupuestos(status);
CREATE INDEX IF NOT EXISTS idx_bot_presupuestos_created ON bot_presupuestos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bot_presupuestos_patient_phone ON bot_presupuestos(patient_phone);
CREATE INDEX IF NOT EXISTS idx_bot_presupuestos_labsis_patient ON bot_presupuestos(labsis_patient_id);

COMMENT ON TABLE bot_presupuestos IS 'Presupuestos solicitados vía bot';
COMMENT ON COLUMN bot_presupuestos.labsis_patient_id IS 'ID del paciente en labsisEG (sin FK, validar en código)';

-- ============================================
-- 7. BOT_CITAS - Citas Agendadas
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
    labsis_patient_id INTEGER,  -- NO FK - Validación en código
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

CREATE INDEX IF NOT EXISTS idx_bot_citas_conversation ON bot_citas(conversation_id);
CREATE INDEX IF NOT EXISTS idx_bot_citas_platform ON bot_citas(platform);
CREATE INDEX IF NOT EXISTS idx_bot_citas_user_id ON bot_citas(user_id);
CREATE INDEX IF NOT EXISTS idx_bot_citas_status ON bot_citas(status);
CREATE INDEX IF NOT EXISTS idx_bot_citas_appointment_date ON bot_citas(appointment_date);
CREATE INDEX IF NOT EXISTS idx_bot_citas_created ON bot_citas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bot_citas_patient_phone ON bot_citas(patient_phone);
CREATE INDEX IF NOT EXISTS idx_bot_citas_labsis_patient ON bot_citas(labsis_patient_id);

COMMENT ON TABLE bot_citas IS 'Citas agendadas vía bot';
COMMENT ON COLUMN bot_citas.labsis_patient_id IS 'ID del paciente en labsisEG (sin FK, validar en código)';

-- ============================================
-- FUNCIONES DE UTILIDAD
-- ============================================

-- Función: Generar número de orden de trabajo
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    year TEXT;
    seq_num INTEGER;
    order_num TEXT;
BEGIN
    year := TO_CHAR(NOW(), 'YYYY');
    SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 'WO-[0-9]{4}-([0-9]+)') AS INTEGER)), 0) + 1
    INTO seq_num
    FROM bot_work_orders
    WHERE order_number LIKE 'WO-' || year || '-%';
    order_num := 'WO-' || year || '-' || LPAD(seq_num::TEXT, 4, '0');
    RETURN order_num;
END;
$$ LANGUAGE plpgsql;

-- Función: Generar número de solicitud de insumos
CREATE OR REPLACE FUNCTION generate_request_number()
RETURNS TEXT AS $$
DECLARE
    year TEXT;
    seq_num INTEGER;
    request_num TEXT;
BEGIN
    year := TO_CHAR(NOW(), 'YYYY');
    SELECT COALESCE(MAX(CAST(SUBSTRING(request_number FROM 'SR-[0-9]{4}-([0-9]+)') AS INTEGER)), 0) + 1
    INTO seq_num
    FROM bot_supply_requests
    WHERE request_number LIKE 'SR-' || year || '-%';
    request_num := 'SR-' || year || '-' || LPAD(seq_num::TEXT, 4, '0');
    RETURN request_num;
END;
$$ LANGUAGE plpgsql;

-- Función: Generar número de presupuesto
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

-- Función: Generar número de cita
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

-- Función: Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger: bot_conversations
DROP TRIGGER IF EXISTS trigger_bot_conversations_updated_at ON bot_conversations;
CREATE TRIGGER trigger_bot_conversations_updated_at
    BEFORE UPDATE ON bot_conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger: bot_work_orders
DROP TRIGGER IF EXISTS trigger_bot_work_orders_updated_at ON bot_work_orders;
CREATE TRIGGER trigger_bot_work_orders_updated_at
    BEFORE UPDATE ON bot_work_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger: bot_supply_requests
DROP TRIGGER IF EXISTS trigger_bot_supply_requests_updated_at ON bot_supply_requests;
CREATE TRIGGER trigger_bot_supply_requests_updated_at
    BEFORE UPDATE ON bot_supply_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger: bot_presupuestos
DROP TRIGGER IF EXISTS trigger_bot_presupuestos_updated_at ON bot_presupuestos;
CREATE TRIGGER trigger_bot_presupuestos_updated_at
    BEFORE UPDATE ON bot_presupuestos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger: bot_citas
DROP TRIGGER IF EXISTS trigger_bot_citas_updated_at ON bot_citas;
CREATE TRIGGER trigger_bot_citas_updated_at
    BEFORE UPDATE ON bot_citas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Update last_message_at
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE bot_conversations
    SET last_message_at = NEW.created_at
    WHERE conversation_id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_conversation_last_message ON bot_messages;
CREATE TRIGGER trigger_update_conversation_last_message
    AFTER INSERT ON bot_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_conversation_last_message();

-- ============================================
-- VIEWS
-- ============================================

-- View: Conversaciones recientes
CREATE OR REPLACE VIEW bot_recent_conversations AS
SELECT
    c.id,
    c.conversation_id,
    c.platform,
    c.chat_id,
    c.user_id,
    c.user_info->>'firstName' AS first_name,
    c.user_info->>'lastName' AS last_name,
    c.state,
    c.last_message_at,
    c.created_at,
    (SELECT COUNT(*) FROM bot_messages m WHERE m.conversation_id = c.conversation_id) AS message_count,
    (SELECT content->>'text'
     FROM bot_messages m
     WHERE m.conversation_id = c.conversation_id
     ORDER BY m.created_at DESC
     LIMIT 1) AS last_message_text
FROM bot_conversations c
ORDER BY c.last_message_at DESC;

-- ============================================
-- MENSAJE DE COMPLETADO
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '✅ Migración 001_bot_core_tables.sql completada';
    RAISE NOTICE 'Tablas creadas: 7 (bot_*)';
    RAISE NOTICE 'Funciones creadas: 5';
    RAISE NOTICE 'Triggers creados: 6';
    RAISE NOTICE 'Views creadas: 1';
END $$;
