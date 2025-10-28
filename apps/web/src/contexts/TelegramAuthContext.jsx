import { createContext, useContext, useState, useEffect } from 'react';
import {
  getTelegramToken,
  getTelegramPacienteId,
  hasTelegramSession,
  validateToken,
  logout as logoutApi,
} from '../services/messagingBotApi';

const TelegramAuthContext = createContext(null);

export function TelegramAuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pacienteId, setPacienteId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar sesión al cargar
  useEffect(() => {
    checkSession();
  }, []);

  // Verificar si hay sesión válida
  const checkSession = async () => {
    setLoading(true);

    try {
      const token = getTelegramToken();
      const storedPacienteId = getTelegramPacienteId();

      if (!token || !storedPacienteId || !hasTelegramSession()) {
        setIsAuthenticated(false);
        setPacienteId(null);
        setLoading(false);
        return;
      }

      // Validar token con el backend
      const result = await validateToken(token);

      if (result.valid) {
        setIsAuthenticated(true);
        setPacienteId(result.pacienteId);
      } else {
        // Token inválido, limpiar sesión
        await logout();
      }
    } catch (error) {
      console.error('Error validando sesión Telegram:', error);
      await logout();
    } finally {
      setLoading(false);
    }
  };

  // Iniciar sesión (llamado desde el modal)
  const login = (authData) => {
    // Guardar token en localStorage
    localStorage.setItem('telegram_auth_token', authData.token);
    localStorage.setItem('telegram_auth_paciente_id', authData.pacienteId.toString());
    localStorage.setItem('telegram_auth_expires', authData.expiresAt);

    // Actualizar estado
    setIsAuthenticated(true);
    setPacienteId(authData.pacienteId);
  };

  // Cerrar sesión
  const logout = async () => {
    try {
      const token = getTelegramToken();
      if (token) {
        await logoutApi(token);
      }
    } catch (error) {
      console.error('Error cerrando sesión:', error);
    } finally {
      // Limpiar localStorage
      localStorage.removeItem('telegram_auth_token');
      localStorage.removeItem('telegram_auth_paciente_id');
      localStorage.removeItem('telegram_auth_expires');

      // Actualizar estado
      setIsAuthenticated(false);
      setPacienteId(null);
    }
  };

  const value = {
    isAuthenticated,
    pacienteId,
    loading,
    login,
    logout,
    checkSession,
  };

  return (
    <TelegramAuthContext.Provider value={value}>
      {children}
    </TelegramAuthContext.Provider>
  );
}

export function useTelegramAuth() {
  const context = useContext(TelegramAuthContext);
  if (!context) {
    throw new Error('useTelegramAuth debe usarse dentro de TelegramAuthProvider');
  }
  return context;
}
