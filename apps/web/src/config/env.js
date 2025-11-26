import { z } from 'zod';

// Schema de validación para variables de entorno del frontend
const envSchema = z.object({
  // API URLs - REQUERIDAS
  VITE_API_URL: z.string().url('VITE_API_URL debe ser una URL válida'),
  VITE_CONFIG_API_URL: z.string().url('VITE_CONFIG_API_URL debe ser una URL válida'),
  VITE_RESULTS_API_URL: z.string().url('VITE_RESULTS_API_URL debe ser una URL válida'),

  // Messaging Bot API - Opcional (puede usar proxy /api/messaging en producción)
  VITE_MESSAGING_BOT_API_URL: z.string().optional().default('/api/messaging'),

  // Server Configuration - Opcionales con defaults
  VITE_DEV_SERVER_PORT: z.string().optional().default('5173'),
  VITE_PREVIEW_SERVER_PORT: z.string().optional().default('4173'),

  // Polling
  VITE_CONFIG_POLL_INTERVAL: z.string().optional().default('30000'),

  // Environment
  MODE: z.enum(['development', 'staging', 'production']).optional().default('development')
});

// Validar y exportar configuración
// Usa window.__ENV__ para runtime config (Docker) o import.meta.env para dev
let config;

try {
  // Priorizar runtime config inyectado por Docker entrypoint
  const runtimeEnv = window.__ENV__ || {};

  config = envSchema.parse({
    VITE_API_URL: runtimeEnv.VITE_API_URL || import.meta.env.VITE_API_URL,
    VITE_CONFIG_API_URL: runtimeEnv.VITE_CONFIG_API_URL || import.meta.env.VITE_CONFIG_API_URL,
    VITE_RESULTS_API_URL: runtimeEnv.VITE_RESULTS_API_URL || import.meta.env.VITE_RESULTS_API_URL,
    VITE_MESSAGING_BOT_API_URL: runtimeEnv.VITE_MESSAGING_BOT_API_URL || import.meta.env.VITE_MESSAGING_BOT_API_URL,
    VITE_DEV_SERVER_PORT: runtimeEnv.VITE_DEV_SERVER_PORT || import.meta.env.VITE_DEV_SERVER_PORT,
    VITE_PREVIEW_SERVER_PORT: runtimeEnv.VITE_PREVIEW_SERVER_PORT || import.meta.env.VITE_PREVIEW_SERVER_PORT,
    VITE_CONFIG_POLL_INTERVAL: runtimeEnv.VITE_CONFIG_POLL_INTERVAL || import.meta.env.VITE_CONFIG_POLL_INTERVAL,
    MODE: runtimeEnv.MODE || import.meta.env.MODE
  });

  console.log('✅ Environment variables validated successfully');
  console.log('📍 MODE:', config.MODE);
  console.log('🔗 API URLs configured:', {
    api: config.VITE_API_URL,
    config: config.VITE_CONFIG_API_URL,
    results: config.VITE_RESULTS_API_URL,
    messagingBot: config.VITE_MESSAGING_BOT_API_URL
  });
  console.log('⚙️ Config source:', window.__ENV__ ? 'Runtime (Docker)' : 'Build-time (Dev)');
} catch (error) {
  console.error('❌ Environment validation failed:');

  if (error instanceof z.ZodError) {
    error.errors.forEach(err => {
      console.error(`  - ${err.path.join('.')}: ${err.message}`);
    });
  }

  throw new Error('Missing or invalid environment variables. Please check your .env file.');
}

export { config };
