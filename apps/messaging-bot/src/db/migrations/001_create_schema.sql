-- ============================================
-- MESSAGING BOT SERVICE - Database Schema
-- ============================================
-- Database: labsisEG (shared with results-service)
-- Prefix: bot_ (to avoid conflicts with existing tables)
-- Platform-agnostic: Works with Telegram, WhatsApp, Discord, etc.
-- ============================================

-- ============================================
-- 1. CONVERSATIONS TABLE
-- ============================================
-- Stores all conversations across all platforms
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

-- Indexes for conversations
CREATE INDEX IF NOT EXISTS idx_bot_conversations_platform ON bot_conversations(platform);
CREATE INDEX IF NOT EXISTS idx_bot_conversations_chat_id ON bot_conversations(chat_id);
CREATE INDEX IF NOT EXISTS idx_bot_conversations_user_id ON bot_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_bot_conversations_state ON bot_conversations(state);
CREATE INDEX IF NOT EXISTS idx_bot_conversations_last_message ON bot_conversations(last_message_at DESC);

COMMENT ON TABLE bot_conversations IS 'Platform-agnostic conversation tracking';
COMMENT ON COLUMN bot_conversations.conversation_id IS 'Unique identifier: {platform}_{chat_id}';
COMMENT ON COLUMN bot_conversations.platform IS 'Source platform: telegram, whatsapp, etc.';
COMMENT ON COLUMN bot_conversations.chat_id IS 'Platform-specific chat/channel ID';
COMMENT ON COLUMN bot_conversations.user_id IS 'Platform-specific user ID';
COMMENT ON COLUMN bot_conversations.user_info IS 'JSON: {username, firstName, lastName, phoneNumber, profilePhoto}';
COMMENT ON COLUMN bot_conversations.state IS 'Conversation state for workflow management';
COMMENT ON COLUMN bot_conversations.context IS 'JSON: Current workflow context and variables';

-- ============================================
-- 2. MESSAGES TABLE
-- ============================================
-- Stores all messages (inbound and outbound) across all platforms
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

-- Indexes for messages
CREATE INDEX IF NOT EXISTS idx_bot_messages_conversation ON bot_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_bot_messages_platform ON bot_messages(platform);
CREATE INDEX IF NOT EXISTS idx_bot_messages_direction ON bot_messages(direction);
CREATE INDEX IF NOT EXISTS idx_bot_messages_type ON bot_messages(type);
CREATE INDEX IF NOT EXISTS idx_bot_messages_created ON bot_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bot_messages_platform_message_id ON bot_messages(platform, message_id);

COMMENT ON TABLE bot_messages IS 'All messages in UnifiedMessage format';
COMMENT ON COLUMN bot_messages.message_id IS 'Platform-specific message ID';
COMMENT ON COLUMN bot_messages.direction IS 'inbound (user->bot) or outbound (bot->user)';
COMMENT ON COLUMN bot_messages.type IS 'Message type: text, image, document, location, callback';
COMMENT ON COLUMN bot_messages.content IS 'JSON: {text, mediaUrl, caption, location, callbackData}';
COMMENT ON COLUMN bot_messages.metadata IS 'Platform-specific additional data';

-- ============================================
-- 3. WORK ORDERS TABLE
-- ============================================
-- Work orders created through bot conversations
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

-- Indexes for work orders
CREATE INDEX IF NOT EXISTS idx_bot_work_orders_conversation ON bot_work_orders(conversation_id);
CREATE INDEX IF NOT EXISTS idx_bot_work_orders_platform ON bot_work_orders(platform);
CREATE INDEX IF NOT EXISTS idx_bot_work_orders_user_id ON bot_work_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_bot_work_orders_status ON bot_work_orders(status);
CREATE INDEX IF NOT EXISTS idx_bot_work_orders_type ON bot_work_orders(type);
CREATE INDEX IF NOT EXISTS idx_bot_work_orders_priority ON bot_work_orders(priority);
CREATE INDEX IF NOT EXISTS idx_bot_work_orders_created ON bot_work_orders(created_at DESC);

COMMENT ON TABLE bot_work_orders IS 'Work orders created via messaging bots';
COMMENT ON COLUMN bot_work_orders.order_number IS 'Auto-generated: WO-YYYY-NNNN';
COMMENT ON COLUMN bot_work_orders.platform IS 'Source platform where order was created';
COMMENT ON COLUMN bot_work_orders.type IS 'Order type: maintenance, repair, installation';
COMMENT ON COLUMN bot_work_orders.priority IS 'Priority level: high, medium, low';

-- ============================================
-- 4. SUPPLY REQUESTS TABLE
-- ============================================
-- Supply/reagent requests made through bot
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

-- Indexes for supply requests
CREATE INDEX IF NOT EXISTS idx_bot_supply_requests_conversation ON bot_supply_requests(conversation_id);
CREATE INDEX IF NOT EXISTS idx_bot_supply_requests_platform ON bot_supply_requests(platform);
CREATE INDEX IF NOT EXISTS idx_bot_supply_requests_user_id ON bot_supply_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_bot_supply_requests_status ON bot_supply_requests(status);
CREATE INDEX IF NOT EXISTS idx_bot_supply_requests_created ON bot_supply_requests(created_at DESC);

COMMENT ON TABLE bot_supply_requests IS 'Supply/reagent requests made via bots';
COMMENT ON COLUMN bot_supply_requests.request_number IS 'Auto-generated: SR-YYYY-NNNN';
COMMENT ON COLUMN bot_supply_requests.items IS 'JSON array: [{name, quantity, unit, priority}]';

-- ============================================
-- 5. BOT METRICS TABLE
-- ============================================
-- Daily metrics per platform for monitoring
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

-- Indexes for metrics
CREATE INDEX IF NOT EXISTS idx_bot_metrics_platform ON bot_metrics(platform);
CREATE INDEX IF NOT EXISTS idx_bot_metrics_date ON bot_metrics(date DESC);

COMMENT ON TABLE bot_metrics IS 'Daily metrics aggregated per platform';
COMMENT ON COLUMN bot_metrics.date IS 'Date for metrics aggregation';

-- ============================================
-- 6. FUNCTIONS
-- ============================================

-- Function: Generate work order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    year TEXT;
    seq_num INTEGER;
    order_num TEXT;
BEGIN
    year := TO_CHAR(NOW(), 'YYYY');

    -- Get next sequence number for this year
    SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 'WO-[0-9]{4}-([0-9]+)') AS INTEGER)), 0) + 1
    INTO seq_num
    FROM bot_work_orders
    WHERE order_number LIKE 'WO-' || year || '-%';

    -- Format: WO-2025-0001
    order_num := 'WO-' || year || '-' || LPAD(seq_num::TEXT, 4, '0');

    RETURN order_num;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_order_number() IS 'Generate unique work order number: WO-YYYY-NNNN';

-- Function: Generate supply request number
CREATE OR REPLACE FUNCTION generate_request_number()
RETURNS TEXT AS $$
DECLARE
    year TEXT;
    seq_num INTEGER;
    request_num TEXT;
BEGIN
    year := TO_CHAR(NOW(), 'YYYY');

    -- Get next sequence number for this year
    SELECT COALESCE(MAX(CAST(SUBSTRING(request_number FROM 'SR-[0-9]{4}-([0-9]+)') AS INTEGER)), 0) + 1
    INTO seq_num
    FROM bot_supply_requests
    WHERE request_number LIKE 'SR-' || year || '-%';

    -- Format: SR-2025-0001
    request_num := 'SR-' || year || '-' || LPAD(seq_num::TEXT, 4, '0');

    RETURN request_num;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_request_number() IS 'Generate unique supply request number: SR-YYYY-NNNN';

-- ============================================
-- 7. TRIGGERS
-- ============================================

-- Trigger: Auto-update updated_at on conversations
CREATE OR REPLACE FUNCTION update_bot_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_bot_conversations_updated_at ON bot_conversations;
CREATE TRIGGER trigger_bot_conversations_updated_at
    BEFORE UPDATE ON bot_conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_bot_conversations_updated_at();

-- Trigger: Auto-update updated_at on work orders
CREATE OR REPLACE FUNCTION update_bot_work_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_bot_work_orders_updated_at ON bot_work_orders;
CREATE TRIGGER trigger_bot_work_orders_updated_at
    BEFORE UPDATE ON bot_work_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_bot_work_orders_updated_at();

-- Trigger: Auto-update updated_at on supply requests
CREATE OR REPLACE FUNCTION update_bot_supply_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_bot_supply_requests_updated_at ON bot_supply_requests;
CREATE TRIGGER trigger_bot_supply_requests_updated_at
    BEFORE UPDATE ON bot_supply_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_bot_supply_requests_updated_at();

-- Trigger: Update last_message_at on conversations when message is inserted
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
-- 8. VIEWS (Optional - for easier querying)
-- ============================================

-- View: Recent conversations with last message
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

COMMENT ON VIEW bot_recent_conversations IS 'Conversations with last message info for dashboard';

-- View: Pending work orders
CREATE OR REPLACE VIEW bot_pending_work_orders AS
SELECT
    wo.id,
    wo.order_number,
    wo.platform,
    wo.user_name,
    wo.type,
    wo.priority,
    wo.title,
    wo.description,
    wo.status,
    wo.created_at,
    EXTRACT(EPOCH FROM (NOW() - wo.created_at))/3600 AS hours_since_created
FROM bot_work_orders wo
WHERE wo.status IN ('pending', 'in_progress')
ORDER BY
    CASE wo.priority
        WHEN 'high' THEN 1
        WHEN 'medium' THEN 2
        WHEN 'low' THEN 3
    END,
    wo.created_at ASC;

COMMENT ON VIEW bot_pending_work_orders IS 'Pending work orders sorted by priority';

-- View: Pending supply requests
CREATE OR REPLACE VIEW bot_pending_supply_requests AS
SELECT
    sr.id,
    sr.request_number,
    sr.platform,
    sr.user_name,
    sr.items,
    sr.status,
    sr.created_at,
    EXTRACT(EPOCH FROM (NOW() - sr.created_at))/3600 AS hours_since_created
FROM bot_supply_requests sr
WHERE sr.status IN ('pending', 'approved', 'ordered')
ORDER BY sr.created_at ASC;

COMMENT ON VIEW bot_pending_supply_requests IS 'Pending supply requests';

-- ============================================
-- 9. SAMPLE DATA (For testing)
-- ============================================

-- Sample conversation (Telegram)
-- INSERT INTO bot_conversations (conversation_id, platform, chat_id, user_id, user_info, state, context)
-- VALUES (
--     'telegram_12345',
--     'telegram',
--     '12345',
--     'user_123',
--     '{"username": "juan", "firstName": "Juan", "lastName": "Pérez"}',
--     'active',
--     '{}'
-- );

-- ============================================
-- Migration Complete
-- ============================================

-- Verify tables were created
DO $$
BEGIN
    RAISE NOTICE '✅ Bot schema migration completed successfully';
    RAISE NOTICE 'Tables created:';
    RAISE NOTICE '  - bot_conversations';
    RAISE NOTICE '  - bot_messages';
    RAISE NOTICE '  - bot_work_orders';
    RAISE NOTICE '  - bot_supply_requests';
    RAISE NOTICE '  - bot_metrics';
    RAISE NOTICE 'Functions created:';
    RAISE NOTICE '  - generate_order_number()';
    RAISE NOTICE '  - generate_request_number()';
    RAISE NOTICE 'Views created:';
    RAISE NOTICE '  - bot_recent_conversations';
    RAISE NOTICE '  - bot_pending_work_orders';
    RAISE NOTICE '  - bot_pending_supply_requests';
END $$;
