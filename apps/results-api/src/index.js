import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './config/database.js';
import logger from './config/logger.js';
import resultsRouter from './routes/results.js';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

// Middlewares
// Configurar CORS para permitir múltiples orígenes
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : [];

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost',
  'http://192.168.1.125',
  'http://192.168.1.125:5173',
  ...corsOrigins
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (como mobile apps o curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger de requests en desarrollo
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`);
    next();
  });
}

// Rutas
app.use('/api', resultsRouter);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    service: 'Laboratorio EG - Results Service',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/verify',
      ordenes: '/api/resultados/ordenes',
      orden: '/api/resultados/orden/:numero',
    },
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada',
  });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  logger.error('Error no manejado:', err);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor',
  });
});

// Iniciar servidor
async function startServer() {
  try {
    console.log('');
    console.log('============================================================');
    console.log('🏥 Laboratorio EG - Results Service');
    console.log('============================================================');
    console.log('');

    // Verificar conexión a base de datos
    logger.info('📊 Verificando conexión a PostgreSQL...');
    await testConnection();
    console.log('');

    // Iniciar servidor HTTP - Bind a 0.0.0.0 para permitir acceso desde red
    app.listen(PORT, '0.0.0.0', () => {
      console.log('============================================================');
      console.log('   🚀 Results Service');
      console.log('============================================================');
      console.log(`   🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   🚀 Server running on: http://0.0.0.0:${PORT}`);
      console.log(`   📊 Database: ${process.env.DB_NAME}@${process.env.DB_HOST}:${process.env.DB_PORT}`);
      console.log(`   🔒 CORS origins: ${allowedOrigins.join(', ')}`);
      console.log(`   ⏰ Started at: ${new Date().toLocaleString()}`);
      console.log('============================================================');
      console.log('');
      logger.info(`Server started on port ${PORT}`);
    });
  } catch (error) {
    logger.error('❌ Error al iniciar el servidor:', error);
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

// Manejo de señales de terminación
process.on('SIGTERM', () => {
  logger.info('Recibida señal SIGTERM, cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('Recibida señal SIGINT, cerrando servidor...');
  process.exit(0);
});

// Iniciar
startServer();
