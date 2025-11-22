-- Migration 027: Create system_config table
-- Tabla de configuración del sistema que controla comportamiento de páginas y features
-- Single-tenant: cada instalación tiene su propia configuración

CREATE TABLE IF NOT EXISTS system_config (
  id SERIAL PRIMARY KEY,
  key VARCHAR(200) UNIQUE NOT NULL,
  value TEXT,
  data_type VARCHAR(20) DEFAULT 'string' CHECK (data_type IN ('string', 'number', 'boolean', 'json')),
  category VARCHAR(50) CHECK (category IN ('ui', 'auth', 'features', 'integrations', 'security', 'system')),
  description TEXT,
  is_secret BOOLEAN DEFAULT false,
  is_editable BOOLEAN DEFAULT true,
  created_by VARCHAR(50) DEFAULT 'system',
  updated_by VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_system_config_key ON system_config(key);
CREATE INDEX idx_system_config_category ON system_config(category);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_system_config_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_system_config_timestamp
BEFORE UPDATE ON system_config
FOR EACH ROW
EXECUTE FUNCTION update_system_config_timestamp();

-- ==========================================
-- SEEDS: Configuraciones por defecto
-- ==========================================

-- UI: Páginas y secciones
INSERT INTO system_config (key, value, data_type, category, description) VALUES
('ui.pages.estudios.enabled', 'true', 'boolean', 'ui', 'Mostrar página de Catálogo de Estudios disponibles'),
('ui.pages.resultados.enabled', 'true', 'boolean', 'ui', 'Mostrar página de Portal de Resultados para pacientes'),
('ui.pages.nosotros.enabled', 'true', 'boolean', 'ui', 'Mostrar sección Nosotros en landing page'),
('ui.pages.contacto.enabled', 'true', 'boolean', 'ui', 'Mostrar sección de Contacto en landing page')
ON CONFLICT (key) DO NOTHING;

-- Features: Funcionalidades opcionales
INSERT INTO system_config (key, value, data_type, category, description) VALUES
('features.favorites.enabled', 'true', 'boolean', 'features', 'Habilitar sistema de favoritos para estudios'),
('features.favorites.folders.enabled', 'false', 'boolean', 'features', 'Habilitar carpetas de favoritos (feature avanzado)'),
('features.pwa.enabled', 'true', 'boolean', 'features', 'Habilitar Progressive Web App'),
('features.pwa.notifications.enabled', 'true', 'boolean', 'features', 'Habilitar notificaciones push'),
('features.pwa.service_worker.enabled', 'true', 'boolean', 'features', 'Habilitar service worker para offline'),
('features.pwa.offline_mode.enabled', 'true', 'boolean', 'features', 'Habilitar modo offline'),
('features.pwa.background_sync.enabled', 'false', 'boolean', 'features', 'Habilitar sincronización en segundo plano'),
('features.pwa.install_prompt.enabled', 'true', 'boolean', 'features', 'Mostrar prompt de instalación PWA')
ON CONFLICT (key) DO NOTHING;

-- Dashboard de salud (analytics del paciente)
INSERT INTO system_config (key, value, data_type, category, description) VALUES
('features.dashboard.global.enabled', 'true', 'boolean', 'features', 'Habilitar dashboard de salud del paciente'),
('features.dashboard.heatmap.enabled', 'true', 'boolean', 'features', 'Mostrar heatmap de frecuencia de estudios'),
('features.dashboard.charts.enabled', 'true', 'boolean', 'features', 'Mostrar gráficos de tendencias'),
('features.dashboard.health_score.enabled', 'true', 'boolean', 'features', 'Mostrar score de salud')
ON CONFLICT (key) DO NOTHING;

-- Export de resultados
INSERT INTO system_config (key, value, data_type, category, description) VALUES
('features.export.pdf.enabled', 'true', 'boolean', 'features', 'Habilitar exportación de resultados a PDF'),
('features.export.json.enabled', 'false', 'boolean', 'features', 'Habilitar exportación de datos a JSON')
ON CONFLICT (key) DO NOTHING;

-- Búsqueda avanzada
INSERT INTO system_config (key, value, data_type, category, description) VALUES
('features.search.advanced.enabled', 'true', 'boolean', 'features', 'Habilitar búsqueda avanzada de estudios')
ON CONFLICT (key) DO NOTHING;

-- Auth: Métodos de autenticación y sus prioridades
INSERT INTO system_config (key, value, data_type, category, description) VALUES
('auth.methods.telegram.enabled', 'true', 'boolean', 'auth', 'Habilitar autenticación vía Telegram'),
('auth.methods.telegram.priority', '1', 'number', 'auth', 'Prioridad de Telegram (menor = más prioritario)'),
('auth.methods.whatsapp.enabled', 'true', 'boolean', 'auth', 'Habilitar autenticación vía WhatsApp'),
('auth.methods.whatsapp.priority', '2', 'number', 'auth', 'Prioridad de WhatsApp'),
('auth.methods.cedula.enabled', 'true', 'boolean', 'auth', 'Habilitar autenticación con cédula y código'),
('auth.methods.cedula.priority', '3', 'number', 'auth', 'Prioridad de cédula'),
('auth.methods.sms.enabled', 'false', 'boolean', 'auth', 'Habilitar autenticación vía SMS'),
('auth.methods.sms.priority', '4', 'number', 'auth', 'Prioridad de SMS')
ON CONFLICT (key) DO NOTHING;

-- System: Configuraciones del sistema
INSERT INTO system_config (key, value, data_type, category, description) VALUES
('system.version', '1.0.0', 'string', 'system', 'Versión del sistema'),
('system.environment', 'production', 'string', 'system', 'Ambiente: development, staging, production'),
('system.maintenance_mode.enabled', 'false', 'boolean', 'system', 'Activar modo mantenimiento'),
('system.maintenance_mode.message', 'Sistema en mantenimiento. Volveremos pronto.', 'string', 'system', 'Mensaje mostrado en modo mantenimiento'),
('system.lab.name', 'Laboratorio Clínico', 'string', 'system', 'Nombre del laboratorio'),
('system.lab.phone', '', 'string', 'system', 'Teléfono de contacto del laboratorio')
ON CONFLICT (key) DO NOTHING;

-- Security: Configuraciones de seguridad
INSERT INTO system_config (key, value, data_type, category, description) VALUES
('security.session_timeout', '30', 'number', 'security', 'Timeout de sesión en días'),
('security.max_login_attempts', '5', 'number', 'security', 'Máximo de intentos de login antes de bloquear')
ON CONFLICT (key) DO NOTHING;

-- Comentario final
COMMENT ON TABLE system_config IS 'Configuración global del sistema (single-tenant). Controla páginas, features, auth methods, y comportamiento general.';
