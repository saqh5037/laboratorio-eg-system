import { useState, useEffect, useCallback } from 'react';
import { config } from '../config/env.js';

const CONFIG_API_URL = config.VITE_CONFIG_API_URL;

/**
 * Hook para gestionar la navegación dinámica
 */
export function useNavigation() {
  const [navigation, setNavigation] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Cargar toda la navegación
   */
  const fetchNavigation = useCallback(async (includeInactive = false) => {
    try {
      setLoading(true);
      setError(null);

      const url = includeInactive
        ? `${CONFIG_API_URL}/api/navigation?include_inactive=true`
        : `${CONFIG_API_URL}/api/navigation`;

      // Timeout de 10 segundos para evitar bloqueos indefinidos
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('Error al cargar navegación');
      }

      const data = await response.json();
      if (data.success) {
        setNavigation(data.data);
      } else {
        throw new Error(data.error || 'Error desconocido');
      }
    } catch (err) {
      console.error('Error fetching navigation:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener items de una ubicación específica
   */
  const getLocationItems = useCallback((location) => {
    return navigation[location] || [];
  }, [navigation]);

  /**
   * Obtener items del header
   */
  const getHeaderItems = useCallback(() => {
    return getLocationItems('header');
  }, [getLocationItems]);

  /**
   * Obtener items del sidebar
   */
  const getSidebarItems = useCallback(() => {
    return getLocationItems('sidebar');
  }, [getLocationItems]);

  /**
   * Obtener items del footer (quick links)
   */
  const getFooterQuickLinks = useCallback(() => {
    return getLocationItems('footer_quick');
  }, [getLocationItems]);

  /**
   * Obtener items del footer (services)
   */
  const getFooterServices = useCallback(() => {
    return getLocationItems('footer_services');
  }, [getLocationItems]);

  /**
   * Crear nuevo item (admin)
   */
  const createNavigationItem = useCallback(async (itemData, token) => {
    try {
      const response = await fetch(`${CONFIG_API_URL}/api/navigation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(itemData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear item');
      }

      const data = await response.json();
      if (data.success) {
        await fetchNavigation(true);
        return data.data;
      }
      throw new Error(data.error);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchNavigation]);

  /**
   * Actualizar item (admin)
   */
  const updateNavigationItem = useCallback(async (id, updates, token) => {
    try {
      const response = await fetch(`${CONFIG_API_URL}/api/navigation/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar item');
      }

      const data = await response.json();
      if (data.success) {
        await fetchNavigation(true);
        return data.data;
      }
      throw new Error(data.error);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchNavigation]);

  /**
   * Eliminar item (admin)
   */
  const deleteNavigationItem = useCallback(async (id, token) => {
    try {
      const response = await fetch(`${CONFIG_API_URL}/api/navigation/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar item');
      }

      const data = await response.json();
      if (data.success) {
        await fetchNavigation(true);
        return data.data;
      }
      throw new Error(data.error);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchNavigation]);

  /**
   * Toggle estado activo (admin)
   */
  const toggleNavigationItem = useCallback(async (id, is_active, token) => {
    try {
      const response = await fetch(`${CONFIG_API_URL}/api/navigation/${id}/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_active })
      });

      if (!response.ok) {
        throw new Error('Error al toggle item');
      }

      const data = await response.json();
      if (data.success) {
        await fetchNavigation(true);
        return data.data;
      }
      throw new Error(data.error);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchNavigation]);

  /**
   * Reordenar items (admin)
   */
  const reorderNavigationItems = useCallback(async (items, token) => {
    try {
      const response = await fetch(`${CONFIG_API_URL}/api/navigation/reorder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ items })
      });

      if (!response.ok) {
        throw new Error('Error al reordenar items');
      }

      const data = await response.json();
      if (data.success) {
        await fetchNavigation(true);
        return true;
      }
      throw new Error(data.error);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [fetchNavigation]);

  // Cargar al montar
  useEffect(() => {
    fetchNavigation();
  }, [fetchNavigation]);

  return {
    // Estado
    navigation,
    loading,
    error,

    // Métodos de lectura
    fetchNavigation,
    getLocationItems,
    getHeaderItems,
    getSidebarItems,
    getFooterQuickLinks,
    getFooterServices,

    // Métodos de admin
    createNavigationItem,
    updateNavigationItem,
    deleteNavigationItem,
    toggleNavigationItem,
    reorderNavigationItems
  };
}

export default useNavigation;
