import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import * as themesApi from '../services/themesApi';
import { useSystemConfig } from './useSystemConfig';

/**
 * Custom Hook para gestionar temas dinámicos
 * Proporciona todas las operaciones CRUD para temas y templates
 *
 * @returns {Object} Estado y funciones para gestionar temas
 */
export function useThemeManager() {
  const { theme: currentTheme, reloadTheme } = useSystemConfig();

  // Estados
  const [theme, setTheme] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  // Errores específicos por operación
  const [loadError, setLoadError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [templateError, setTemplateError] = useState(null);

  /**
   * Cargar tema actual desde la API
   */
  const loadTheme = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError(null);

      const response = await themesApi.getTheme();

      if (response.success) {
        setTheme(response.data);
      } else {
        throw new Error('Error al cargar tema');
      }
    } catch (err) {
      const errorMsg = err.message || 'Error al cargar tema';
      setLoadError(errorMsg);
      setError(errorMsg);
      console.error('Error loading theme:', err);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Cargar templates predefinidos
   */
  const loadTemplates = useCallback(async () => {
    try {
      setTemplateError(null);

      const response = await themesApi.getTemplates();

      if (response.success) {
        setTemplates(response.data);
      } else {
        throw new Error('Error al cargar templates');
      }
    } catch (err) {
      const errorMsg = err.message || 'Error al cargar templates';
      setTemplateError(errorMsg);
      console.error('Error loading templates:', err);
    }
  }, []);

  /**
   * Actualizar tema completo
   */
  const updateTheme = useCallback(async (themeData) => {
    try {
      setSaving(true);
      setSaveError(null);

      // Validar datos antes de enviar
      const validation = themesApi.validateThemeData(themeData);
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }

      const response = await themesApi.updateTheme(themeData);

      if (response.success) {
        setTheme(response.data);

        // Recargar tema en el sistema para aplicar cambios
        await reloadTheme();

        toast.success(response.message || 'Tema actualizado exitosamente');
        return response.data;
      } else {
        throw new Error('Error al actualizar tema');
      }
    } catch (err) {
      const errorMsg = err.message || 'Error al guardar tema';
      setSaveError(errorMsg);
      setError(errorMsg);
      console.error('Error updating theme:', err);
      toast.error(errorMsg);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [reloadTheme]);

  /**
   * Actualizar solo colores (más rápido)
   */
  const updateColors = useCallback(async (colors) => {
    try {
      setSaving(true);
      setSaveError(null);

      // Validar colores
      for (const [key, value] of Object.entries(colors)) {
        if (value && !themesApi.isValidHexColor(value)) {
          throw new Error(`${key} debe ser un color hexadecimal válido`);
        }
      }

      const response = await themesApi.updateColors(colors);

      if (response.success) {
        setTheme(response.data);

        // Recargar tema en el sistema
        await reloadTheme();

        toast.success('Colores actualizados exitosamente');
        return response.data;
      } else {
        throw new Error('Error al actualizar colores');
      }
    } catch (err) {
      const errorMsg = err.message || 'Error al actualizar colores';
      setSaveError(errorMsg);
      console.error('Error updating colors:', err);
      toast.error(errorMsg);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [reloadTheme]);

  /**
   * Aplicar un template predefinido
   */
  const applyTemplate = useCallback(async (templateId) => {
    try {
      setSaving(true);
      setTemplateError(null);

      const response = await themesApi.applyTemplate(templateId);

      if (response.success) {
        setTheme(response.data);

        // Recargar tema en el sistema
        await reloadTheme();

        toast.success(response.message || `Template aplicado exitosamente`);
        return response.data;
      } else {
        throw new Error('Error al aplicar template');
      }
    } catch (err) {
      const errorMsg = err.message || 'Error al aplicar template';
      setTemplateError(errorMsg);
      setError(errorMsg);
      console.error('Error applying template:', err);
      toast.error(errorMsg);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [reloadTheme]);

  /**
   * Subir logo
   */
  const uploadLogo = useCallback(async (file, type = 'main') => {
    try {
      setIsUploading(true);
      setUploadError(null);

      // Validar archivo
      const validation = themesApi.validateLogoFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const response = await themesApi.uploadLogo(file, type);

      if (response.success) {
        // Actualizar tema local con nuevo logo
        const updatedTheme = { ...theme };
        if (type === 'main') {
          updatedTheme.logo_path = response.data.logo_url;
        } else if (type === 'icon') {
          updatedTheme.logo_icon_path = response.data.logo_url;
        } else if (type === 'favicon') {
          updatedTheme.favicon_path = response.data.logo_url;
        }
        setTheme(updatedTheme);

        // Recargar tema en el sistema
        await reloadTheme();

        toast.success(response.message || 'Logo subido exitosamente');
        return response.data;
      } else {
        throw new Error('Error al subir logo');
      }
    } catch (err) {
      const errorMsg = err.message || 'Error al subir logo';
      setUploadError(errorMsg);
      setError(errorMsg);
      console.error('Error uploading logo:', err);
      toast.error(errorMsg);
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, [theme, reloadTheme]);

  /**
   * Resetear tema a valores por defecto de Lab EG
   */
  const resetTheme = useCallback(async () => {
    try {
      setSaving(true);
      setSaveError(null);

      const response = await themesApi.resetTheme();

      if (response.success) {
        setTheme(response.data);

        // Recargar tema en el sistema
        await reloadTheme();

        toast.success(response.message || 'Tema reseteado a Lab EG defaults');
        return response.data;
      } else {
        throw new Error('Error al resetear tema');
      }
    } catch (err) {
      const errorMsg = err.message || 'Error al resetear tema';
      setSaveError(errorMsg);
      setError(errorMsg);
      console.error('Error resetting theme:', err);
      toast.error(errorMsg);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [reloadTheme]);

  /**
   * Previsualizar cambios localmente (sin guardar)
   * Útil para mostrar preview en tiempo real
   */
  const previewChanges = useCallback((changes) => {
    if (!theme) return;

    const previewTheme = { ...theme, ...changes };
    return previewTheme;
  }, [theme]);

  /**
   * Cargar tema y templates al montar el componente
   */
  useEffect(() => {
    loadTheme();
    loadTemplates();
  }, [loadTheme, loadTemplates]);

  /**
   * Sincronizar con SystemConfig cuando cambie
   */
  useEffect(() => {
    if (currentTheme && !theme) {
      setTheme(currentTheme);
    }
  }, [currentTheme, theme]);

  return {
    // Estado
    theme,
    templates,
    isLoading,
    isSaving,
    isUploading,
    error,

    // Errores específicos
    loadError,
    saveError,
    uploadError,
    templateError,

    // Funciones
    loadTheme,
    loadTemplates,
    updateTheme,
    updateColors,
    applyTemplate,
    uploadLogo,
    resetTheme,
    previewChanges
  };
}
