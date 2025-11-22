import { useContext } from 'react';
import { AdminAuthContext } from '../contexts/AdminAuthContext';

/**
 * Hook para acceder al contexto de autenticación de administradores
 * @returns {Object} - { user, isAuthenticated, isLoading, error, login, logout, getToken, hasRole }
 */
export function useAdminAuth() {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error('useAdminAuth debe usarse dentro de AdminAuthProvider');
  }

  return context;
}
