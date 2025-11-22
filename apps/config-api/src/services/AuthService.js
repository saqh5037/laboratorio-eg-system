const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const logger = require('../utils/logger');

class AuthService {
  /**
   * Autenticar usuario administrador
   * @param {string} username
   * @param {string} password
   * @returns {Promise<Object|null>} - User data con token o null si falla
   */
  async login(username, password) {
    try {
      // Buscar usuario
      const query = `
        SELECT * FROM admin_users
        WHERE (username = $1 OR email = $1) AND is_active = TRUE
      `;

      const result = await db.query(query, [username]);

      if (result.rows.length === 0) {
        logger.warn(`Intento de login fallido: usuario no encontrado (${username})`);
        return null;
      }

      const user = result.rows[0];

      // Verificar contraseña
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);

      if (!isPasswordValid) {
        logger.warn(`Intento de login fallido: contraseña incorrecta (${username})`);
        return null;
      }

      // Actualizar last_login
      await db.query(
        'UPDATE admin_users SET last_login = NOW() WHERE id = $1',
        [user.id]
      );

      // Generar token JWT
      const token = this.generateToken(user);

      logger.info(`Login exitoso: ${user.username} (${user.role})`);

      // Retornar datos del usuario (sin password_hash)
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        token
      };
    } catch (error) {
      logger.error('Error en login:', error);
      throw error;
    }
  }

  /**
   * Generar token JWT
   * @param {Object} user
   * @returns {string}
   */
  generateToken(user) {
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
    const expiresIn = process.env.JWT_EXPIRATION || '8h';

    return jwt.sign(payload, secret, { expiresIn });
  }

  /**
   * Verificar token JWT
   * @param {string} token
   * @returns {Object|null} - Decoded payload o null si es inválido
   */
  verifyToken(token) {
    try {
      const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
      const decoded = jwt.verify(token, secret);
      return decoded;
    } catch (error) {
      logger.warn('Token JWT inválido:', error.message);
      return null;
    }
  }

  /**
   * Obtener usuario por ID
   * @param {number} userId
   * @returns {Promise<Object|null>}
   */
  async getUserById(userId) {
    try {
      const query = `
        SELECT id, username, email, role, is_active, last_login, created_at
        FROM admin_users
        WHERE id = $1 AND is_active = TRUE
      `;

      const result = await db.query(query, [userId]);

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    } catch (error) {
      logger.error(`Error al obtener usuario ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Crear nuevo usuario administrador
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  async createUser(data) {
    const { username, email, password, role = 'admin' } = data;

    try {
      // Hash de contraseña
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(password, saltRounds);

      const query = `
        INSERT INTO admin_users (username, email, password_hash, role)
        VALUES ($1, $2, $3, $4)
        RETURNING id, username, email, role, created_at
      `;

      const result = await db.query(query, [username, email, password_hash, role]);

      logger.info(`Usuario administrador creado: ${username} (${role})`);

      return result.rows[0];
    } catch (error) {
      logger.error('Error al crear usuario:', error);
      throw error;
    }
  }

  /**
   * Cambiar contraseña de usuario
   * @param {number} userId
   * @param {string} currentPassword
   * @param {string} newPassword
   * @returns {Promise<boolean>}
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      // Obtener usuario actual
      const userQuery = 'SELECT password_hash FROM admin_users WHERE id = $1';
      const userResult = await db.query(userQuery, [userId]);

      if (userResult.rows.length === 0) {
        throw new Error('Usuario no encontrado');
      }

      const user = userResult.rows[0];

      // Verificar contraseña actual
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);

      if (!isCurrentPasswordValid) {
        logger.warn(`Intento fallido de cambio de contraseña: usuario ${userId}`);
        return false;
      }

      // Hash de nueva contraseña
      const saltRounds = 10;
      const new_password_hash = await bcrypt.hash(newPassword, saltRounds);

      // Actualizar contraseña
      const updateQuery = 'UPDATE admin_users SET password_hash = $1, updated_at = NOW() WHERE id = $2';
      await db.query(updateQuery, [new_password_hash, userId]);

      logger.info(`Contraseña cambiada exitosamente: usuario ${userId}`);

      return true;
    } catch (error) {
      logger.error(`Error al cambiar contraseña del usuario ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Verificar si un usuario tiene un rol específico
   * @param {Object} user - Usuario decoded del token
   * @param {string|Array<string>} allowedRoles
   * @returns {boolean}
   */
  hasRole(user, allowedRoles) {
    if (!user || !user.role) {
      return false;
    }

    if (Array.isArray(allowedRoles)) {
      return allowedRoles.includes(user.role);
    }

    return user.role === allowedRoles;
  }
}

module.exports = new AuthService();
