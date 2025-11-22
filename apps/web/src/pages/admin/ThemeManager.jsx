import { useEffect } from 'react';
import { Palette, AlertCircle, Loader } from 'lucide-react';
import { useThemeManager } from '../../hooks/useThemeManager';
import { ThemeForm } from '../../components/admin/themes/ThemeForm';
import { TemplateSelector } from '../../components/admin/themes/TemplateSelector';

/**
 * ThemeManager Page
 * Página principal del admin panel para gestionar temas
 */
export default function ThemeManager() {
  const {
    theme,
    templates,
    isLoading,
    isSaving,
    isUploading,
    error,
    loadTheme,
    loadTemplates,
    updateTheme,
    applyTemplate,
    uploadLogo,
    resetTheme
  } = useThemeManager();

  useEffect(() => {
    loadTheme();
    loadTemplates();
  }, []);

  const handleSaveTheme = async (themeData) => {
    try {
      await updateTheme(themeData);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const handleApplyTemplate = async (templateId) => {
    try {
      await applyTemplate(templateId);
    } catch (error) {
      console.error('Error applying template:', error);
    }
  };

  const handleUploadLogo = async (file, type) => {
    try {
      await uploadLogo(file, type);
    } catch (error) {
      console.error('Error uploading logo:', error);
      throw error;
    }
  };

  const handleResetTheme = async () => {
    try {
      await resetTheme();
    } catch (error) {
      console.error('Error resetting theme:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Palette className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestor de Temas</h1>
              <p className="text-sm text-gray-600 mt-1">
                Personaliza los colores, tipografía y branding del sistema
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-gray-600 font-medium">Cargando configuración del tema...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-3 mb-6">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-red-900 font-semibold mb-1">Error al cargar tema</h3>
              <p className="text-red-700 text-sm">{error}</p>
              <button
                onClick={loadTheme}
                className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {/* Main Content - Two Column Layout */}
        {!isLoading && theme && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar: Template Selector */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
                <TemplateSelector
                  templates={templates}
                  currentTheme={theme.theme_name}
                  onApply={handleApplyTemplate}
                  isLoading={isSaving}
                />
              </div>
            </div>

            {/* Main: Theme Form */}
            <div className="lg:col-span-3">
              <ThemeForm
                theme={theme}
                onSave={handleSaveTheme}
                onReset={handleResetTheme}
                onUploadLogo={handleUploadLogo}
                isSaving={isSaving}
                isUploading={isUploading}
              />

              {/* Info Card */}
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-2">Información importante:</p>
                    <ul className="space-y-1 list-disc list-inside text-blue-800">
                      <li>Los cambios se aplican inmediatamente en toda la plataforma</li>
                      <li>Los logos actuales se conservan al aplicar templates</li>
                      <li>Puedes resetear a los valores por defecto de Lab EG en cualquier momento</li>
                      <li>Todos los usuarios verán los cambios automáticamente</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
