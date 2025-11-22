import { useState, useEffect, useCallback, useRef } from 'react';
import { getGroupedConfig, updateConfig as updateConfigApi, invalidateCache } from '../services/configApi';
import toast from 'react-hot-toast';

/**
 * Hook para gestionar configuraciones del sistema
 * Maneja carga, actualización y cache de configs
 */
export function useConfigManager() {
  const [configs, setConfigs] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  // Usar ref para evitar dependencias en callbacks
  const configsRef = useRef(configs);

  // Mantener ref actualizado
  useEffect(() => {
    configsRef.current = configs;
  }, [configs]);

  /**
   * Cargar todas las configuraciones agrupadas
   */
  const loadConfigs = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getGroupedConfig();
      setConfigs(data);
    } catch (err) {
      console.error('Error al cargar configuraciones:', err);
      setError(err.message);
      toast.error('Error al cargar configuraciones');
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Obtener valor de una configuración por key (usando ref)
   * @param {string} key - Key con dots (ej: 'ui.pages.resultados.enabled')
   * @returns {any}
   */
  const getConfigValueFromRef = useCallback((key) => {
    const parts = key.split('.');
    let current = configsRef.current;

    for (const part of parts) {
      if (current[part] === undefined) return undefined;
      current = current[part];
    }

    return current;
  }, []);

  /**
   * Establecer valor de una configuración (para optimistic update)
   * @param {string} key
   * @param {any} value
   */
  const setConfigValue = useCallback((key, value) => {
    setConfigs(prev => {
      const newConfigs = JSON.parse(JSON.stringify(prev)); // Deep clone
      const parts = key.split('.');
      let current = newConfigs;

      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) {
          current[parts[i]] = {};
        }
        current = current[parts[i]];
      }

      current[parts[parts.length - 1]] = value;
      return newConfigs;
    });
  }, []);

  /**
   * Actualizar una configuración
   * @param {string} key - Key de la configuración (ej: 'ui.pages.resultados.enabled')
   * @param {any} value - Nuevo valor
   * @returns {Promise<boolean>} - true si fue exitoso
   */
  const updateConfig = useCallback(async (key, value) => {
    setIsSaving(true);

    // Capturar el valor actual ANTES del optimistic update
    const oldValue = getConfigValueFromRef(key);

    console.log(`[useConfigManager] Updating ${key}: ${oldValue} → ${value}`);

    // Optimistic update
    setConfigValue(key, value);

    try {
      await updateConfigApi(key, value);
      toast.success('Configuración actualizada');

      // Invalidar cache del SystemConfigContext
      await invalidateCache();

      // Recargar configs para asegurar sincronización
      await loadConfigs();

      // Notificar al SystemConfigContext para que recargue inmediatamente
      window.dispatchEvent(new CustomEvent('config-updated', {
        detail: { key, value, timestamp: Date.now() }
      }));

      return true;
    } catch (err) {
      console.error('Error al actualizar configuración:', err);

      // Revertir optimistic update
      setConfigValue(key, oldValue);

      toast.error(err.message || 'Error al actualizar');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [getConfigValueFromRef, setConfigValue, loadConfigs]);

  /**
   * Obtener valor de una configuración por key (para uso en componentes)
   * @param {string} key - Key con dots (ej: 'ui.pages.resultados.enabled')
   * @returns {any}
   */
  const getConfigValue = useCallback((key) => {
    const parts = key.split('.');
    let current = configs;

    for (const part of parts) {
      if (current[part] === undefined) return undefined;
      current = current[part];
    }

    return current;
  }, [configs]);

  /**
   * Obtener configuraciones de una categoría específica
   * @param {string} category - Categoría (ui, auth, features, system)
   * @returns {Object}
   */
  const getCategory = useCallback((category) => {
    return configs[category] || {};
  }, [configs]);

  /**
   * Cargar configs al montar
   */
  useEffect(() => {
    loadConfigs();
  }, [loadConfigs]);

  return {
    configs,
    isLoading,
    isSaving,
    error,
    loadConfigs,
    updateConfig,
    getConfigValue,
    getCategory
  };
}
