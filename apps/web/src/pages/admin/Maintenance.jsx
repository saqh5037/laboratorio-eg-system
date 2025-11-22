import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Página de Mantenimiento del Sistema
 *
 * Esta página redirige automáticamente a la sección de configuraciones SYSTEM
 * donde se puede activar/desactivar el modo mantenimiento.
 *
 * Razón: La funcionalidad de mantenimiento ya existe en Configuraciones → SYSTEM,
 * así que no necesitamos duplicar la UI.
 */
export default function Maintenance() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirigir a configuraciones con el tab SYSTEM activo (index 3)
    navigate('/admin/configurations', {
      state: { activeTab: 3 },
      replace: true
    });
  }, [navigate]);

  // No renderizar nada, solo redirigir
  return null;
}
