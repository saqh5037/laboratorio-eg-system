import { useState, useEffect } from 'react';
import { Palette, Type, Image as ImageIcon, Layout, Sparkles, Save, RotateCcw } from 'lucide-react';
import { ColorPicker } from './ColorPicker';
import { LogoUploader } from './LogoUploader';

/**
 * ThemeForm Component
 * Formulario completo para editar tema con tabs: Colores, Tipografía, Branding, Espaciado, Efectos
 *
 * @param {Object} props
 * @param {Object} props.theme - Tema actual
 * @param {Function} props.onSave - Callback para guardar cambios
 * @param {Function} props.onReset - Callback para resetear tema
 * @param {Function} props.onUploadLogo - Callback para subir logos
 * @param {boolean} props.isSaving - Estado de guardado
 * @param {boolean} props.isUploading - Estado de subida de logos
 */
export function ThemeForm({ theme, onSave, onReset, onUploadLogo, isSaving = false, isUploading = false }) {
  const [activeTab, setActiveTab] = useState('colors');
  const [formData, setFormData] = useState(theme || {});
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (theme) {
      setFormData(theme);
      setIsDirty(false);
    }
  }, [theme]);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSave = () => {
    onSave(formData);
    setIsDirty(false);
  };

  const handleReset = () => {
    if (confirm('¿Estás seguro de resetear el tema a los valores por defecto de Lab EG? Esta acción no se puede deshacer.')) {
      onReset();
      setIsDirty(false);
    }
  };

  const tabs = [
    { id: 'colors', label: 'Colores', icon: Palette },
    { id: 'typography', label: 'Tipografía', icon: Type },
    { id: 'branding', label: 'Branding', icon: ImageIcon },
    { id: 'spacing', label: 'Espaciado', icon: Layout },
    { id: 'effects', label: 'Efectos', icon: Sparkles }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-6 py-4 border-b-2 transition-colors whitespace-nowrap
                  ${activeTab === tab.id
                    ? 'border-primary text-primary font-medium'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {/* TAB: Colores */}
        {activeTab === 'colors' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Colores Principales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ColorPicker
                  label="Color Primario"
                  value={formData.color_primary || '#7B68A6'}
                  onChange={(color) => handleFieldChange('color_primary', color)}
                  disabled={isSaving}
                />
                <ColorPicker
                  label="Color Secundario"
                  value={formData.color_secondary || '#DDB5D5'}
                  onChange={(color) => handleFieldChange('color_secondary', color)}
                  disabled={isSaving}
                />
                <ColorPicker
                  label="Color Accent"
                  value={formData.color_accent || '#8B8C8E'}
                  onChange={(color) => handleFieldChange('color_accent', color)}
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Colores de Texto</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ColorPicker
                  label="Texto Principal"
                  value={formData.color_text_primary || '#231F20'}
                  onChange={(color) => handleFieldChange('color_text_primary', color)}
                  disabled={isSaving}
                />
                <ColorPicker
                  label="Texto Secundario"
                  value={formData.color_text_secondary || '#8B8C8E'}
                  onChange={(color) => handleFieldChange('color_text_secondary', color)}
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Colores de Fondo</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ColorPicker
                  label="Fondo Principal"
                  value={formData.color_background || '#FFFFFF'}
                  onChange={(color) => handleFieldChange('color_background', color)}
                  disabled={isSaving}
                />
                <ColorPicker
                  label="Superficie"
                  value={formData.color_surface || '#F9FAFB'}
                  onChange={(color) => handleFieldChange('color_surface', color)}
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Colores Semánticos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ColorPicker
                  label="Success"
                  value={formData.color_success || '#10B981'}
                  onChange={(color) => handleFieldChange('color_success', color)}
                  disabled={isSaving}
                />
                <ColorPicker
                  label="Warning"
                  value={formData.color_warning || '#F59E0B'}
                  onChange={(color) => handleFieldChange('color_warning', color)}
                  disabled={isSaving}
                />
                <ColorPicker
                  label="Error"
                  value={formData.color_error || '#EF4444'}
                  onChange={(color) => handleFieldChange('color_error', color)}
                  disabled={isSaving}
                />
                <ColorPicker
                  label="Info"
                  value={formData.color_info || '#3B82F6'}
                  onChange={(color) => handleFieldChange('color_info', color)}
                  disabled={isSaving}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB: Tipografía */}
        {activeTab === 'typography' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Fuentes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fuente Principal
                  </label>
                  <input
                    type="text"
                    value={formData.font_family_primary || 'DIN Pro'}
                    onChange={(e) => handleFieldChange('font_family_primary', e.target.value)}
                    disabled={isSaving}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none disabled:bg-gray-100"
                    placeholder="DIN Pro"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fuente Secundaria
                  </label>
                  <input
                    type="text"
                    value={formData.font_family_secondary || 'Inter'}
                    onChange={(e) => handleFieldChange('font_family_secondary', e.target.value)}
                    disabled={isSaving}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none disabled:bg-gray-100"
                    placeholder="Inter"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tamaños de Fuente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tamaño Base
                  </label>
                  <input
                    type="text"
                    value={formData.font_size_base || '1rem'}
                    onChange={(e) => handleFieldChange('font_size_base', e.target.value)}
                    disabled={isSaving}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none disabled:bg-gray-100"
                    placeholder="1rem"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    H1
                  </label>
                  <input
                    type="text"
                    value={formData.font_size_h1 || '2rem'}
                    onChange={(e) => handleFieldChange('font_size_h1', e.target.value)}
                    disabled={isSaving}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none disabled:bg-gray-100"
                    placeholder="2rem"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    H2
                  </label>
                  <input
                    type="text"
                    value={formData.font_size_h2 || '1.69rem'}
                    onChange={(e) => handleFieldChange('font_size_h2', e.target.value)}
                    disabled={isSaving}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none disabled:bg-gray-100"
                    placeholder="1.69rem"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    H3
                  </label>
                  <input
                    type="text"
                    value={formData.font_size_h3 || '1.5rem'}
                    onChange={(e) => handleFieldChange('font_size_h3', e.target.value)}
                    disabled={isSaving}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none disabled:bg-gray-100"
                    placeholder="1.5rem"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: Branding */}
        {activeTab === 'branding' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Logos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <LogoUploader
                  label="Logo Principal"
                  type="main"
                  currentLogo={formData.logo_path}
                  onUpload={onUploadLogo}
                  isUploading={isUploading}
                />
                <LogoUploader
                  label="Logo Icono"
                  type="icon"
                  currentLogo={formData.logo_icon_path}
                  onUpload={onUploadLogo}
                  isUploading={isUploading}
                />
                <LogoUploader
                  label="Favicon"
                  type="favicon"
                  currentLogo={formData.favicon_path}
                  onUpload={onUploadLogo}
                  isUploading={isUploading}
                />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración de Logo</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Margen del Logo
                  </label>
                  <input
                    type="text"
                    value={formData.logo_margin || '37.8px'}
                    onChange={(e) => handleFieldChange('logo_margin', e.target.value)}
                    disabled={isSaving}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none disabled:bg-gray-100"
                    placeholder="37.8px"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ancho Máximo del Logo
                  </label>
                  <input
                    type="text"
                    value={formData.logo_max_width || '200px'}
                    onChange={(e) => handleFieldChange('logo_max_width', e.target.value)}
                    disabled={isSaving}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none disabled:bg-gray-100"
                    placeholder="200px"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Tema</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Tema
                  </label>
                  <input
                    type="text"
                    value={formData.theme_name || 'Lab EG Theme'}
                    onChange={(e) => handleFieldChange('theme_name', e.target.value)}
                    disabled={isSaving}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none disabled:bg-gray-100"
                    placeholder="Lab EG Theme"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={formData.theme_description || ''}
                    onChange={(e) => handleFieldChange('theme_description', e.target.value)}
                    disabled={isSaving}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none disabled:bg-gray-100 resize-none"
                    placeholder="Descripción del tema visual del laboratorio"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: Espaciado */}
        {activeTab === 'spacing' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Border Radius</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Small
                  </label>
                  <input
                    type="text"
                    value={formData.border_radius_sm || '0.25rem'}
                    onChange={(e) => handleFieldChange('border_radius_sm', e.target.value)}
                    disabled={isSaving}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none disabled:bg-gray-100"
                    placeholder="0.25rem"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medium
                  </label>
                  <input
                    type="text"
                    value={formData.border_radius_md || '0.5rem'}
                    onChange={(e) => handleFieldChange('border_radius_md', e.target.value)}
                    disabled={isSaving}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none disabled:bg-gray-100"
                    placeholder="0.5rem"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Large
                  </label>
                  <input
                    type="text"
                    value={formData.border_radius_lg || '0.75rem'}
                    onChange={(e) => handleFieldChange('border_radius_lg', e.target.value)}
                    disabled={isSaving}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none disabled:bg-gray-100"
                    placeholder="0.75rem"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Extra Large
                  </label>
                  <input
                    type="text"
                    value={formData.border_radius_xl || '1rem'}
                    onChange={(e) => handleFieldChange('border_radius_xl', e.target.value)}
                    disabled={isSaving}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none disabled:bg-gray-100"
                    placeholder="1rem"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: Efectos */}
        {activeTab === 'effects' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sombras</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Intensidad de Sombra (0-10)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={formData.shadow_intensity || 5}
                    onChange={(e) => handleFieldChange('shadow_intensity', parseInt(e.target.value))}
                    disabled={isSaving}
                    className="flex-1"
                  />
                  <span className="text-sm font-mono text-gray-700 w-8 text-center">
                    {formData.shadow_intensity || 5}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Glassmorphism</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="glassmorphism"
                    checked={formData.glassmorphism_enabled || false}
                    onChange={(e) => handleFieldChange('glassmorphism_enabled', e.target.checked)}
                    disabled={isSaving}
                    className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <label htmlFor="glassmorphism" className="text-sm font-medium text-gray-700">
                    Habilitar Glassmorphism
                  </label>
                </div>

                {formData.glassmorphism_enabled && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Blur Amount
                    </label>
                    <input
                      type="text"
                      value={formData.glassmorphism_blur || '12px'}
                      onChange={(e) => handleFieldChange('glassmorphism_blur', e.target.value)}
                      disabled={isSaving}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none disabled:bg-gray-100"
                      placeholder="12px"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex items-center justify-between rounded-b-lg">
        <button
          onClick={handleReset}
          disabled={isSaving}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Resetear a Lab EG
        </button>

        <div className="flex items-center gap-3">
          {isDirty && (
            <span className="text-sm text-amber-600 font-medium">
              Hay cambios sin guardar
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving || !isDirty}
            className="px-6 py-2 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}
