import { createContext, useState, useEffect, useCallback } from 'react';
import { loginAdmin, validateToken, getCurrentUser } from '../services/adminAuthApi';
import { logger } from '../utils/logger';

export const AdminAuthContext = createContext(null);

/**
 * Provider de autenticación para administradores
 * Maneja login, logout, token JWT y validación de sesión
 */
export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Validar token almacenado al cargar la aplicación
   */
  useEffect(() => {
    const token = localStorage.getItem('adminToken');

    logger.debug('🔍 [AdminAuthContext] useEffect iniciado, token exists:', !!token);

    if (token) {
      // Intentar obtener usuario actual directamente
      getCurrentUser()
        .then((response) => {
          logger.debug('✅ [AdminAuthContext] getCurrentUser response:', response);

          // El API retorna { user } directamente si es exitoso
          if (response.user) {
            setUser(response.user);
            setIsAuthenticated(true);
            logger.debug('✅ [AdminAuthContext] Usuario autenticado:', response.user.username);
          } else {
            // Token inválido, limpiar
            logger.warn('⚠️ [AdminAuthContext] Response sin usuario válido, removiendo token');
            localStorage.removeItem('adminToken');
            setIsAuthenticated(false);
            setUser(null);
          }
        })
        .catch((err) => {
          logger.error('❌ [AdminAuthContext] Error en getCurrentUser:', err);

          // CLAVE: Solo borrar token si es un error 401 (token realmente inválido)
          // NO borrar en errores de red, CORS, timeout, etc.
          const is401Error = err.message?.includes('401') ||
                            err.message?.includes('No autorizado') ||
                            err.message?.includes('Token inválido');

          if (is401Error) {
            logger.warn('🗑️ [AdminAuthContext] Token inválido (401), removiendo de localStorage');
            localStorage.removeItem('adminToken');
            setIsAuthenticated(false);
            setUser(null);
          } else {
            logger.warn('⚠️ [AdminAuthContext] Error de red/temporal, manteniendo token:', err.message);
            // En errores de red, mantener el token y dejar isAuthenticated=false temporalmente
            // El usuario puede recargar o reintentar
            setIsAuthenticated(false);
            setUser(null);
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      logger.debug('ℹ️ [AdminAuthContext] No hay token en localStorage');
      setIsLoading(false);
    }
  }, []);

  /**
   * Login de administrador
   * @param {string} username
   * @param {string} password
   * @returns {Promise<{success: boolean, message?: string}>}
   */
  const login = useCallback(async (username, password) => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await loginAdmin(username, password);

      // El API retorna { message, user, token } directamente
      if (response.token && response.user) {
        // Guardar token
        localStorage.setItem('adminToken', response.token);

        // Guardar usuario
        setUser(response.user);
        setIsAuthenticated(true);

        console.log('✅ Login exitoso:', response.user.username);

        return { success: true };
      } else {
        setError(response.message || 'Error en el login');
        return { success: false, message: response.message };
      }
    } catch (err) {
      console.error('❌ Error en login:', err);
      const message = err.message || 'Error al conectar con el servidor';
      setError(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Logout de administrador
   */
  const logout = useCallback(() => {
    localStorage.removeItem('adminToken');
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
    console.log('👋 Logout exitoso');
  }, []);

  /**
   * Obtener token actual
   * @returns {string|null}
   */
  const getToken = useCallback(() => {
    return localStorage.getItem('adminToken');
  }, []);

  /**
   * Verificar si el usuario tiene un rol específico
   * @param {string|string[]} roles - Rol o array de roles permitidos
   * @returns {boolean}
   */
  const hasRole = useCallback((roles) => {
    if (!user) return false;

    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    // super-admin tiene acceso a todo
    if (user.role === 'super-admin') return true;

    return allowedRoles.includes(user.role);
  }, [user]);

  // Exponer token directamente para componentes que lo necesiten
  const token = localStorage.getItem('adminToken');

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    token,
    login,
    logout,
    getToken,
    hasRole
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}
