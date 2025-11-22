import { useContext } from 'react';
import { SystemConfigContext } from '../contexts/SystemConfigContext';

/**
 * Hook para acceder a la configuración del sistema y el tema
 * @returns {Object} - { config, theme, isLoading, error, reloadConfig, reloadTheme, helpers }
 */
export function useSystemConfig() {
  const context = useContext(SystemConfigContext);

  if (!context) {
    throw new Error('useSystemConfig debe usarse dentro de SystemConfigProvider');
  }

  const { config, theme, isLoading, error, lastUpdate, reloadConfig, reloadTheme } = context;

  /**
   * Helper: Verificar si una página está habilitada
   * @param {string} pageName - Nombre de la página (resultados, estudios, nosotros, contacto)
   * @returns {boolean}
   */
  const isPageEnabled = (pageName) => {
    if (!config?.ui?.pages) return true; // Por defecto habilitado

    const pageConfig = config.ui.pages[pageName];
    return pageConfig?.enabled !== false;
  };

  /**
   * Helper: Obtener métodos de autenticación habilitados ordenados por prioridad
   * @returns {Array<{method: string, enabled: boolean, priority: number}>}
   */
  const getEnabledAuthMethods = () => {
    if (!config?.auth?.methods) {
      // Fallback por defecto
      return [
        { method: 'telegram', enabled: true, priority: 1 },
        { method: 'whatsapp', enabled: true, priority: 2 },
        { method: 'cedula', enabled: true, priority: 3 }
      ];
    }

    const methods = config.auth.methods;
    const methodList = Object.keys(methods).map(method => ({
      method,
      enabled: methods[method]?.enabled || false,
      priority: methods[method]?.priority || 999
    }));

    // Filtrar solo habilitados y ordenar por prioridad
    return methodList
      .filter(m => m.enabled)
      .sort((a, b) => a.priority - b.priority);
  };

  /**
   * Helper: Verificar si el modo mantenimiento está activo
   * @returns {boolean}
   */
  const isMaintenanceMode = () => {
    return config?.system?.maintenance_mode?.enabled === true;
  };

  /**
   * Helper: Obtener mensaje de modo mantenimiento
   * @returns {string}
   */
  const getMaintenanceMessage = () => {
    return config?.system?.maintenance_mode?.message ||
           'Sistema en mantenimiento. Volvemos pronto.';
  };

  /**
   * Helper: Verificar si una feature está habilitada
   * @param {string} featurePath - Path de la feature (ej: 'pwa.notifications', 'dashboard.heatmap')
   * @returns {boolean}
   */
  const isFeatureEnabled = (featurePath) => {
    if (!config?.features) return false;

    const parts = featurePath.split('.');
    let current = config.features;

    for (const part of parts) {
      if (!current[part]) return false;
      current = current[part];
    }

    return current?.enabled === true;
  };

  /**
   * Helper: Obtener valor de una configuración por path
   * @param {string} path - Path completo (ej: 'auth.jwt_expiration_minutes')
   * @param {*} defaultValue - Valor por defecto si no existe
   * @returns {*}
   */
  const getConfigValue = (path, defaultValue = null) => {
    if (!config) return defaultValue;

    const parts = path.split('.');
    let current = config;

    for (const part of parts) {
      if (current[part] === undefined) return defaultValue;
      current = current[part];
    }

    return current !== undefined ? current : defaultValue;
  };

  return {
    config,
    theme,
    isLoading,
    error,
    lastUpdate,
    reloadConfig,
    reloadTheme,
    // Helpers
    isPageEnabled,
    getEnabledAuthMethods,
    isMaintenanceMode,
    getMaintenanceMessage,
    isFeatureEnabled,
    getConfigValue
  };
}
