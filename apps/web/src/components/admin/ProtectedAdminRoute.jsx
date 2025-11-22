import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import LoadingSpinner from '../LoadingSpinner';

/**
 * Componente para proteger rutas del admin
 * Verifica autenticación JWT y opcionalmente roles específicos
 */
export default function ProtectedAdminRoute({ children, requireRole = null }) {
  const { isAuthenticated, isLoading, user, hasRole } = useAdminAuth();

  // Mientras valida el token, mostrar loader
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir a login
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // Si se requiere un rol específico y el usuario no lo tiene
  if (requireRole && !hasRole(requireRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 max-w-md">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Acceso Denegado</h1>
          <p className="text-gray-600 mb-4">
            No tienes permisos suficientes para acceder a esta sección.
          </p>
          <p className="text-sm text-gray-500">
            Rol requerido: <span className="font-semibold">{requireRole}</span>
            <br />
            Tu rol: <span className="font-semibold">{user?.role}</span>
          </p>
        </div>
      </div>
    );
  }

  // Usuario autenticado y con permisos adecuados
  return children;
}
