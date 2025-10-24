import jwt from 'jsonwebtoken';
import pool from '../config/database.js';
import logger from '../config/logger.js';

/**
 * Servicio de autenticación para pacientes
 */

// Rate limiting simple en memoria (en producción usar Redis)
const loginAttempts = new Map();
const MAX_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5;
const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW) || 3600000; // 1 hora

/**
 * Verificar intentos de login
 */
function checkRateLimit(codigoLealtad) {
  const key = codigoLealtad;
  const now = Date.now();

  if (!loginAttempts.has(key)) {
    loginAttempts.set(key, []);
  }

  const attempts = loginAttempts.get(key).filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW
  );

  if (attempts.length >= MAX_ATTEMPTS) {
    return false;
  }

  attempts.push(now);
  loginAttempts.set(key, attempts);
  return true;
}

/**
 * Limpiar intentos antiguos periódicamente
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, attempts] of loginAttempts.entries()) {
    const recentAttempts = attempts.filter(
      (timestamp) => now - timestamp < RATE_LIMIT_WINDOW
    );
    if (recentAttempts.length === 0) {
      loginAttempts.delete(key);
    } else {
      loginAttempts.set(key, recentAttempts);
    }
  }
}, 300000); // Cada 5 minutos

/**
 * Verificar código de lealtad y fecha de nacimiento
 */
export async function verificarPaciente(codigoLealtad, fechaNacimiento) {
  try {
    // Verificar rate limiting
    if (!checkRateLimit(codigoLealtad)) {
      logger.warn(`Rate limit excedido para código ${codigoLealtad}`);
      throw new Error('RATE_LIMIT_EXCEEDED');
    }

    const query = `
      SELECT
        id,
        nombre,
        apellido,
        ci_paciente,
        fecha_nacimiento,
        email,
        telefono
      FROM paciente
      WHERE ci_paciente = $1
        AND fecha_nacimiento = $2
      LIMIT 1
    `;

    const result = await pool.query(query, [codigoLealtad, fechaNacimiento]);

    if (result.rows.length === 0) {
      logger.warn(`Credenciales inválidas para código ${codigoLealtad}`);
      return null;
    }

    const paciente = result.rows[0];
    logger.info(`Paciente autenticado exitosamente: ${paciente.nombre} ${paciente.apellido}`);

    return paciente;
  } catch (error) {
    if (error.message === 'RATE_LIMIT_EXCEEDED') {
      throw error;
    }
    logger.error('Error al verificar paciente:', error);
    throw error;
  }
}

/**
 * Generar token JWT para el paciente
 */
export function generarToken(paciente) {
  try {
    const payload = {
      paciente_id: paciente.id,
      ci_paciente: paciente.ci_paciente,
      nombre: `${paciente.nombre} ${paciente.apellido}`,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRATION || '15m',
    });

    logger.info(`Token generado para paciente ${paciente.ci_paciente}`);
    return token;
  } catch (error) {
    logger.error('Error al generar token:', error);
    throw error;
  }
}

/**
 * Verificar y decodificar token JWT
 */
export function verificarToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('TOKEN_EXPIRED');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('TOKEN_INVALID');
    }
    throw error;
  }
}

/**
 * Middleware para proteger rutas
 */
export function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token no proporcionado',
      });
    }

    const token = authHeader.substring(7);
    const decoded = verificarToken(token);

    // Agregar información del paciente al request
    req.paciente = decoded;
    next();
  } catch (error) {
    if (error.message === 'TOKEN_EXPIRED') {
      return res.status(401).json({
        success: false,
        error: 'Token expirado',
        code: 'TOKEN_EXPIRED',
      });
    }

    if (error.message === 'TOKEN_INVALID') {
      return res.status(401).json({
        success: false,
        error: 'Token inválido',
        code: 'TOKEN_INVALID',
      });
    }

    logger.error('Error en middleware de autenticación:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
    });
  }
}

export default {
  verificarPaciente,
  generarToken,
  verificarToken,
  requireAuth,
};
