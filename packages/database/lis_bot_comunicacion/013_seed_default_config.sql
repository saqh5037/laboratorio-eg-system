-- ================================================================
-- Migration: 013_seed_default_config
-- Description: Valores por defecto de configuración del sistema
-- Database: lis_bot_comunicacion
-- Created: 2025-11-05
-- ================================================================

-- Valores por defecto de configuración del sistema
-- Todas las configuraciones inician habilitadas y se pueden modificar desde el admin dashboard

-- ===========================================
-- CATEGORÍA: UI - Páginas y Componentes
-- ===========================================
INSERT INTO system_config (key, value, data_type, category, description, is_editable, created_by) VALUES
('ui.pages.resultados.enabled', 'true', 'boolean', 'ui', 'Mostrar página de Resultados para pacientes', TRUE, 'system'),
('ui.pages.estudios.enabled', 'true', 'boolean', 'ui', 'Mostrar página de Catálogo de Estudios', TRUE, 'system'),
('ui.pages.nosotros.enabled', 'true', 'boolean', 'ui', 'Mostrar página Nosotros', TRUE, 'system'),
('ui.pages.contacto.enabled', 'true', 'boolean', 'ui', 'Mostrar página de Contacto', TRUE, 'system'),
('ui.components.whatsapp_button.enabled', 'true', 'boolean', 'ui', 'Mostrar botón flotante de WhatsApp', TRUE, 'system'),
('ui.components.breadcrumb.enabled', 'true', 'boolean', 'ui', 'Mostrar breadcrumb de navegación', TRUE, 'system')
ON CONFLICT (key) DO NOTHING;

-- ===========================================
-- CATEGORÍA: AUTH - Métodos de Autenticación
-- ===========================================
INSERT INTO system_config (key, value, data_type, category, description, is_editable, created_by) VALUES
-- Telegram
('auth.methods.telegram.enabled', 'true', 'boolean', 'auth', 'Habilitar autenticación por Telegram', TRUE, 'system'),
('auth.methods.telegram.priority', '1', 'number', 'auth', 'Prioridad de Telegram (1=primero, menor número = mayor prioridad)', TRUE, 'system'),

-- WhatsApp
('auth.methods.whatsapp.enabled', 'true', 'boolean', 'auth', 'Habilitar autenticación por WhatsApp', TRUE, 'system'),
('auth.methods.whatsapp.priority', '2', 'number', 'auth', 'Prioridad de WhatsApp', TRUE, 'system'),

-- Cédula + Fecha de Nacimiento
('auth.methods.cedula.enabled', 'true', 'boolean', 'auth', 'Habilitar autenticación por Cédula y Fecha de Nacimiento', TRUE, 'system'),
('auth.methods.cedula.priority', '3', 'number', 'auth', 'Prioridad de Cédula', TRUE, 'system'),

-- SMS (preparado para futuro)
('auth.methods.sms.enabled', 'false', 'boolean', 'auth', 'Habilitar autenticación por SMS (no implementado)', TRUE, 'system'),
('auth.methods.sms.priority', '4', 'number', 'auth', 'Prioridad de SMS', TRUE, 'system')
ON CONFLICT (key) DO NOTHING;

-- ===========================================
-- CATEGORÍA: AUTH - Timeouts y Seguridad
-- ===========================================
INSERT INTO system_config (key, value, data_type, category, description, is_editable, created_by) VALUES
('auth.code_expiration_minutes', '15', 'number', 'auth', 'Minutos de expiración de códigos de autenticación (Telegram/WhatsApp)', TRUE, 'system'),
('auth.jwt_expiration_minutes', '480', 'number', 'auth', 'Minutos de expiración de tokens JWT (480 = 8 horas)', TRUE, 'system'),
('auth.session_timeout_minutes', '30', 'number', 'auth', 'Minutos de inactividad antes de cerrar sesión automáticamente', TRUE, 'system'),
('auth.max_login_attempts', '5', 'number', 'security', 'Máximo de intentos de login antes de bloquear temporalmente', TRUE, 'system')
ON CONFLICT (key) DO NOTHING;

-- ===========================================
-- CATEGORÍA: FEATURES - PWA
-- ===========================================
INSERT INTO system_config (key, value, data_type, category, description, is_editable, created_by) VALUES
('features.pwa.notifications.enabled', 'false', 'boolean', 'features', 'Habilitar Push Notifications (requiere permiso del usuario)', TRUE, 'system'),
('features.pwa.service_worker.enabled', 'true', 'boolean', 'features', 'Habilitar Service Worker para funcionalidad offline', TRUE, 'system'),
('features.pwa.offline_mode.enabled', 'true', 'boolean', 'features', 'Habilitar modo offline con cache', TRUE, 'system'),
('features.pwa.background_sync.enabled', 'true', 'boolean', 'features', 'Habilitar sincronización en background', TRUE, 'system'),
('features.pwa.install_prompt.enabled', 'true', 'boolean', 'features', 'Mostrar prompt de instalación de PWA', TRUE, 'system')
ON CONFLICT (key) DO NOTHING;

-- ===========================================
-- CATEGORÍA: FEATURES - Dashboard y Visualizaciones
-- ===========================================
INSERT INTO system_config (key, value, data_type, category, description, is_editable, created_by) VALUES
('features.dashboard.global.enabled', 'true', 'boolean', 'features', 'Habilitar Dashboard Global de resultados', TRUE, 'system'),
('features.dashboard.heatmap.enabled', 'true', 'boolean', 'features', 'Habilitar Heat Map de histórico de resultados', TRUE, 'system'),
('features.dashboard.charts.enabled', 'true', 'boolean', 'features', 'Habilitar gráficas de tendencias', TRUE, 'system'),
('features.dashboard.health_score.enabled', 'true', 'boolean', 'features', 'Habilitar cálculo de Health Score', TRUE, 'system')
ON CONFLICT (key) DO NOTHING;

-- ===========================================
-- CATEGORÍA: FEATURES - Exportaciones
-- ===========================================
INSERT INTO system_config (key, value, data_type, category, description, is_editable, created_by) VALUES
('features.export.pdf.enabled', 'true', 'boolean', 'features', 'Habilitar exportación a PDF de resultados', TRUE, 'system'),
('features.export.json.enabled', 'true', 'boolean', 'features', 'Habilitar exportación a JSON de estudios', TRUE, 'system'),
('features.export.excel.enabled', 'false', 'boolean', 'features', 'Habilitar exportación a Excel (no implementado)', TRUE, 'system'),
('features.export.csv.enabled', 'false', 'boolean', 'features', 'Habilitar exportación a CSV (no implementado)', TRUE, 'system')
ON CONFLICT (key) DO NOTHING;

-- ===========================================
-- CATEGORÍA: FEATURES - Búsqueda y Favoritos
-- ===========================================
INSERT INTO system_config (key, value, data_type, category, description, is_editable, created_by) VALUES
('features.search.advanced.enabled', 'true', 'boolean', 'features', 'Habilitar búsqueda avanzada con filtros', TRUE, 'system'),
('features.search.history.enabled', 'true', 'boolean', 'features', 'Guardar histórico de búsquedas', TRUE, 'system'),
('features.favorites.enabled', 'true', 'boolean', 'features', 'Habilitar sistema de favoritos de estudios', TRUE, 'system'),
('features.favorites.folders.enabled', 'true', 'boolean', 'features', 'Habilitar carpetas de favoritos', TRUE, 'system')
ON CONFLICT (key) DO NOTHING;

-- ===========================================
-- CATEGORÍA: INTEGRATIONS - Bot de Mensajería
-- ===========================================
INSERT INTO system_config (key, value, data_type, category, description, is_editable, created_by) VALUES
('integrations.bot.telegram.enabled', 'true', 'boolean', 'integrations', 'Habilitar Bot de Telegram', TRUE, 'system'),
('integrations.bot.whatsapp.enabled', 'true', 'boolean', 'integrations', 'Habilitar Bot de WhatsApp', TRUE, 'system'),
('integrations.bot.ai_responses.enabled', 'true', 'boolean', 'integrations', 'Habilitar respuestas automáticas con IA (Gemini)', TRUE, 'system'),
('integrations.bot.order_creation.enabled', 'true', 'boolean', 'integrations', 'Permitir crear órdenes desde el bot', TRUE, 'system'),
('integrations.bot.metrics.enabled', 'true', 'boolean', 'integrations', 'Registrar métricas de uso del bot', TRUE, 'system')
ON CONFLICT (key) DO NOTHING;

-- ===========================================
-- CATEGORÍA: SYSTEM - Sistema General
-- ===========================================
INSERT INTO system_config (key, value, data_type, category, description, is_editable, created_by) VALUES
('system.maintenance_mode.enabled', 'false', 'boolean', 'system', 'Activar modo mantenimiento (bloquea acceso a usuarios)', TRUE, 'system'),
('system.maintenance_mode.message', 'Sistema en mantenimiento programado. Volveremos pronto.', 'string', 'system', 'Mensaje a mostrar en modo mantenimiento', TRUE, 'system'),
('system.version', '1.0.0', 'string', 'system', 'Versión actual del sistema', FALSE, 'system'),
('system.environment', 'development', 'string', 'system', 'Ambiente actual: development, staging, production', FALSE, 'system')
ON CONFLICT (key) DO NOTHING;

-- ===========================================
-- CATEGORÍA: SYSTEM - Información del Laboratorio
-- ===========================================
INSERT INTO system_config (key, value, data_type, category, description, is_editable, created_by) VALUES
('system.lab.name', 'Laboratorio Elizabeth Gutiérrez', 'string', 'system', 'Nombre del laboratorio', TRUE, 'system'),
('system.lab.phone', '+58 212 762.0561', 'string', 'system', 'Teléfono principal del laboratorio', TRUE, 'system'),
('system.lab.whatsapp', '+58 424 275.7061', 'string', 'system', 'WhatsApp del laboratorio', TRUE, 'system'),
('system.lab.email', 'info@laboratorio-eg.com', 'string', 'system', 'Email de contacto', TRUE, 'system'),
('system.lab.address', 'Av. Libertador, Edf. Majestic, Piso 2, Oficina 2-B, Chacao, Caracas', 'string', 'system', 'Dirección completa del laboratorio', TRUE, 'system')
ON CONFLICT (key) DO NOTHING;

-- Mensaje de éxito
DO $$
DECLARE
  config_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO config_count FROM system_config;
  RAISE NOTICE 'Configuraciones iniciales cargadas: % registros', config_count;
  RAISE NOTICE 'Sistema de configuración listo para usar';
END $$;
