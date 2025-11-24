import { createContext, useState, useEffect, useCallback } from 'react';
import { getAllConfig, getGroupedConfig } from '../services/configApi';
import { config as envConfig } from '../config/env.js';

export const SystemConfigContext = createContext(null);

// Config API URL (usa configuración validada)
const CONFIG_API_URL = envConfig.VITE_CONFIG_API_URL;

/**
 * Provider de configuración del sistema
 * Carga configuraciones desde config-api y las hace disponibles globalmente
 * También carga y aplica el tema visual dinámicamente
 */
export function SystemConfigProvider({ children }) {
  const [config, setConfig] = useState(null);
  const [groupedConfig, setGroupedConfig] = useState(null);
  const [theme, setTheme] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  /**
   * Cargar configuraciones desde la API
   */
  const loadConfig = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Cargar todas las configuraciones
      const allConfigs = await getAllConfig();

      // Convertir array a objeto con keys como propiedades
      const configObject = {};
      allConfigs.forEach(item => {
        // Crear estructura anidada: ui.pages.resultados.enabled -> configObject.ui.pages.resultados.enabled
        const keys = item.key.split('.');
        let current = configObject;

        keys.forEach((key, index) => {
          if (index === keys.length - 1) {
            // Última key: asignar el valor
            current[key] = item.value;
          } else {
            // Keys intermedias: crear objeto si no existe
            if (!current[key]) {
              current[key] = {};
            }
            current = current[key];
          }
        });
      });

      setConfig(configObject);
      setLastUpdate(Date.now());

      // También cargar agrupadas por categoría (útil para admin dashboard)
      const grouped = await getGroupedConfig();
      setGroupedConfig(grouped);

      setIsLoading(false);

      console.log('✅ Configuración cargada exitosamente:', {
        total: allConfigs.length,
        categories: Object.keys(grouped).length
      });
    } catch (err) {
      console.error('❌ Error al cargar configuración:', err);
      setError(err);
      setIsLoading(false);

      // Configuración por defecto en caso de error
      setConfig({
        ui: {
          pages: {
            resultados: { enabled: true },
            estudios: { enabled: true },
            nosotros: { enabled: true },
            contacto: { enabled: true }
          }
        },
        auth: {
          methods: {
            telegram: { enabled: true, priority: 1 },
            whatsapp: { enabled: true, priority: 2 },
            cedula: { enabled: true, priority: 3 }
          }
        },
        system: {
          maintenance_mode: { enabled: false }
        }
      });
    }
  }, []);

  /**
   * Recargar configuración manualmente
   */
  const reloadConfig = useCallback(() => {
    loadConfig();
  }, [loadConfig]);

  /**
   * Cargar tema visual desde la API
   */
  const loadTheme = useCallback(async () => {
    try {
      const response = await fetch(`${CONFIG_API_URL}/api/theme`);
      if (!response.ok) {
        throw new Error('Error al cargar tema');
      }

      const data = await response.json();
      const themeData = data.data;

      setTheme(themeData);

      // Aplicar tema a CSS variables
      applyThemeToCSS(themeData);

      console.log('✅ Tema cargado y aplicado exitosamente');
    } catch (err) {
      console.error('❌ Error al cargar tema:', err);
      // No marcamos error crítico, el tema tiene valores por defecto en CSS
    }
  }, []);

  /**
   * Convertir color hex a formato RGB (para Tailwind CSS variables)
   * @param {string} hex - Color en formato hex (#2563EB)
   * @returns {string} - Color en formato RGB (37 99 235)
   */
  const hexToRgb = (hex) => {
    // Remover el # si existe
    const cleanHex = hex.replace('#', '');

    // Extraer componentes RGB
    const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(cleanHex);

    if (!result) {
      console.warn(`⚠️ Color hex inválido: ${hex}, usando fallback`);
      return '123 104 166'; // Fallback Lab EG purple
    }

    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);

    return `${r} ${g} ${b}`;
  };

  /**
   * Aplicar tema a CSS variables del documento
   */
  const applyThemeToCSS = useCallback((themeData) => {
    const root = document.documentElement;

    // Colores principales
    root.style.setProperty('--color-primary', themeData.color_primary);
    root.style.setProperty('--color-secondary', themeData.color_secondary);
    root.style.setProperty('--color-accent', themeData.color_accent);
    root.style.setProperty('--color-text-primary', themeData.color_text_primary);
    root.style.setProperty('--color-text-secondary', themeData.color_text_secondary);
    root.style.setProperty('--color-background', themeData.color_background);
    root.style.setProperty('--color-surface', themeData.color_surface);

    // SYNC: Actualizar variables de Tailwind para que las clases eg-purple, eg-pink, etc. respondan al tema
    root.style.setProperty('--color-eg-purple', hexToRgb(themeData.color_primary));
    root.style.setProperty('--color-eg-pink', hexToRgb(themeData.color_secondary));
    root.style.setProperty('--color-eg-gray', hexToRgb(themeData.color_accent));

    // Dark mode
    root.style.setProperty('--color-dark-bg', themeData.color_dark_bg);
    root.style.setProperty('--color-dark-surface', themeData.color_dark_surface);
    root.style.setProperty('--color-dark-text', themeData.color_dark_text);
    root.style.setProperty('--color-dark-text-secondary', themeData.color_dark_text_secondary);

    // Semantic colors
    root.style.setProperty('--color-success', themeData.color_success);
    root.style.setProperty('--color-warning', themeData.color_warning);
    root.style.setProperty('--color-error', themeData.color_error);
    root.style.setProperty('--color-info', themeData.color_info);

    // Typography
    root.style.setProperty('--font-family-primary', themeData.font_family_primary);
    if (themeData.font_family_secondary) {
      root.style.setProperty('--font-family-secondary', themeData.font_family_secondary);
    }

    // Font sizes
    if (themeData.font_size_base) root.style.setProperty('--font-size-base', themeData.font_size_base);
    if (themeData.font_size_h1) root.style.setProperty('--font-size-h1', themeData.font_size_h1);
    if (themeData.font_size_h2) root.style.setProperty('--font-size-h2', themeData.font_size_h2);
    if (themeData.font_size_h3) root.style.setProperty('--font-size-h3', themeData.font_size_h3);

    // Border radius
    if (themeData.border_radius_sm) root.style.setProperty('--border-radius-sm', themeData.border_radius_sm);
    if (themeData.border_radius_md) root.style.setProperty('--border-radius-md', themeData.border_radius_md);
    if (themeData.border_radius_lg) root.style.setProperty('--border-radius-lg', themeData.border_radius_lg);
    if (themeData.border_radius_xl) root.style.setProperty('--border-radius-xl', themeData.border_radius_xl);

    // Logo
    if (themeData.logo_path) root.style.setProperty('--logo-path', `url(${themeData.logo_path})`);
    if (themeData.logo_margin) root.style.setProperty('--logo-margin', themeData.logo_margin);
    if (themeData.logo_max_width) root.style.setProperty('--logo-max-width', themeData.logo_max_width);

    // Effects
    if (themeData.shadow_intensity !== undefined) {
      root.style.setProperty('--shadow-intensity', themeData.shadow_intensity / 10);
    }
    if (themeData.glassmorphism_blur) {
      root.style.setProperty('--glassmorphism-blur', themeData.glassmorphism_blur);
    }

    // Cargar fuente personalizada si existe
    if (themeData.font_url) {
      loadCustomFont(themeData.font_url, themeData.font_family_primary);
    }
  }, []);

  /**
   * Cargar fuente personalizada desde URL
   */
  const loadCustomFont = (fontUrl, fontName) => {
    // Verificar si ya existe la fuente
    const existingStyle = document.getElementById('custom-font-style');
    if (existingStyle) {
      existingStyle.remove();
    }

    const style = document.createElement('style');
    style.id = 'custom-font-style';
    style.textContent = `
      @font-face {
        font-family: '${fontName}';
        src: url('${fontUrl}');
        font-display: swap;
      }
    `;
    document.head.appendChild(style);
  };

  /**
   * Cargar configuración y tema al montar el componente
   */
  useEffect(() => {
    loadConfig();
    loadTheme();
  }, [loadConfig, loadTheme]);

  /**
   * Polling cada 30 segundos (opcional, se puede desactivar con WebSocket)
   * Actualiza tanto config como tema
   */
  useEffect(() => {
    const pollInterval = parseInt(envConfig.VITE_CONFIG_POLL_INTERVAL);

    const interval = setInterval(() => {
      console.log('🔄 Actualizando configuración y tema (polling)...');
      loadConfig();
      loadTheme();
    }, pollInterval);

    return () => clearInterval(interval);
  }, [loadConfig, loadTheme]);

  /**
   * Escuchar eventos de actualización de configuración desde el panel admin
   * Cuando el admin hace toggle de una configuración, se dispara este evento
   */
  useEffect(() => {
    const handleConfigUpdate = (e) => {
      console.log('⚡ Configuración actualizada desde admin, recargando...', e.detail);
      loadConfig();
      loadTheme();
    };

    window.addEventListener('config-updated', handleConfigUpdate);

    return () => {
      window.removeEventListener('config-updated', handleConfigUpdate);
    };
  }, [loadConfig, loadTheme]);

  /**
   * Recargar tema manualmente
   */
  const reloadTheme = useCallback(() => {
    loadTheme();
  }, [loadTheme]);

  const value = {
    config,
    groupedConfig,
    theme,
    isLoading,
    error,
    lastUpdate,
    reloadConfig,
    reloadTheme,
    applyThemeToCSS
  };

  return (
    <SystemConfigContext.Provider value={value}>
      {children}
    </SystemConfigContext.Provider>
  );
}
