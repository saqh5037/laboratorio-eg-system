import { useState, useEffect } from 'react';
import { useCompanyInfo } from '../../hooks/useCompanyInfo';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import {
  Building2, Mail, Phone, MapPin, Clock, Share2, Search, Globe,
  Smartphone, Save, RefreshCw, AlertCircle, CheckCircle, Loader2, Image
} from 'lucide-react';

const CompanyInfoManager = () => {
  const { companyInfo, loading, error, updateCompanyInfo, fetchCompanyInfo } = useCompanyInfo();
  const { token } = useAdminAuth();

  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('identity');
  const [hasChanges, setHasChanges] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    if (companyInfo) {
      setFormData(companyInfo);
    }
  }, [companyInfo]);

  // Detectar cambios
  useEffect(() => {
    if (companyInfo && formData) {
      const changed = JSON.stringify(companyInfo) !== JSON.stringify(formData);
      setHasChanges(changed);
    }
  }, [formData, companyInfo]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveMessage(null);
      await updateCompanyInfo(formData, token);
      setSaveMessage({ type: 'success', text: 'Información guardada correctamente' });
      setHasChanges(false);
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      setSaveMessage({ type: 'error', text: err.message || 'Error al guardar' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (companyInfo) {
      setFormData(companyInfo);
      setHasChanges(false);
    }
  };

  const tabs = [
    { id: 'identity', label: 'Identidad', icon: Building2 },
    { id: 'logos', label: 'Logos', icon: Image },
    { id: 'contact', label: 'Contacto', icon: Phone },
    { id: 'address', label: 'Dirección', icon: MapPin },
    { id: 'hours', label: 'Horarios', icon: Clock },
    { id: 'social', label: 'Redes Sociales', icon: Share2 },
    { id: 'seo', label: 'SEO', icon: Search },
    { id: 'pwa', label: 'PWA', icon: Smartphone },
    { id: 'legal', label: 'Legal', icon: Globe }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-lg">Cargando información de la empresa...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-700 mb-2">Error al cargar datos</h3>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchCompanyInfo}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Información de la Empresa</h1>
          <p className="text-gray-600 mt-1">
            Gestiona la información corporativa que se muestra en toda la aplicación
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <span className="text-sm text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
              Cambios sin guardar
            </span>
          )}
          <button
            onClick={handleReset}
            disabled={!hasChanges || saving}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className="w-4 h-4" />
            Descartar
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar Cambios
          </button>
        </div>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className={`flex items-center gap-2 p-4 rounded-lg ${
          saveMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {saveMessage.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {saveMessage.text}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Identity Tab */}
          {activeTab === 'identity' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Identidad Corporativa</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Empresa</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    value={formData.full_name || ''}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Corto</label>
                  <input
                    type="text"
                    value={formData.short_name || ''}
                    onChange={(e) => handleInputChange('short_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">RIF</label>
                  <input
                    type="text"
                    value={formData.rif || ''}
                    onChange={(e) => handleInputChange('rif', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Año de Fundación</label>
                  <input
                    type="number"
                    value={formData.founded_year || ''}
                    onChange={(e) => handleInputChange('founded_year', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Años de experiencia: {formData.years_of_experience || (new Date().getFullYear() - (formData.founded_year || 1981))}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slogan</label>
                  <input
                    type="text"
                    value={formData.slogan || ''}
                    onChange={(e) => handleInputChange('slogan', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Logos Tab */}
          {activeTab === 'logos' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Logos e Imágenes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL Logo Completo</label>
                    <input
                      type="text"
                      value={formData.logo_full_url || ''}
                      onChange={(e) => handleInputChange('logo_full_url', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="/Logo.png"
                    />
                    <p className="text-xs text-gray-500 mt-1">Logo principal para footer y páginas completas</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL Logo Icono</label>
                    <input
                      type="text"
                      value={formData.logo_icon_url || ''}
                      onChange={(e) => handleInputChange('logo_icon_url', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="/LogoMicrotec.svg"
                    />
                    <p className="text-xs text-gray-500 mt-1">Isotipo/icono para header móvil y favicons</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL Logo Horizontal</label>
                    <input
                      type="text"
                      value={formData.logo_horizontal_url || ''}
                      onChange={(e) => handleInputChange('logo_horizontal_url', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="/Logo.png"
                    />
                    <p className="text-xs text-gray-500 mt-1">Versión horizontal para header desktop</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL Favicon</label>
                    <input
                      type="text"
                      value={formData.favicon_url || ''}
                      onChange={(e) => handleInputChange('favicon_url', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="/favicon.svg"
                    />
                    <p className="text-xs text-gray-500 mt-1">Icono del navegador (preferiblemente SVG)</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Texto Alternativo del Logo</label>
                    <input
                      type="text"
                      value={formData.logo_alt_text || ''}
                      onChange={(e) => handleInputChange('logo_alt_text', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="Nombre de su laboratorio"
                    />
                    <p className="text-xs text-gray-500 mt-1">Texto para accesibilidad (alt attribute)</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-700">Vista Previa</h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Logo Completo:</p>
                      <img
                        src={formData.logo_full_url || '/Logo.png'}
                        alt="Logo completo"
                        className="h-16 object-contain"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Logo Icono:</p>
                      <img
                        src={formData.logo_icon_url || '/LogoMicrotec.svg'}
                        alt="Logo icono"
                        className="h-12 object-contain"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Favicon:</p>
                      <img
                        src={formData.favicon_url || '/favicon.svg'}
                        alt="Favicon"
                        className="h-8 w-8 object-contain"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md">
                    <p className="text-sm text-yellow-800">
                      <strong>Nota:</strong> Las imágenes deben estar en la carpeta public/ del proyecto web
                      o ser URLs absolutas válidas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Información de Contacto</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Principal</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono Principal</label>
                  <input
                    type="text"
                    value={formData.phone_main || ''}
                    onChange={(e) => handleInputChange('phone_main', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono Secundario</label>
                  <input
                    type="text"
                    value={formData.phone_secondary || ''}
                    onChange={(e) => handleInputChange('phone_secondary', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono Terciario</label>
                  <input
                    type="text"
                    value={formData.phone_tertiary || ''}
                    onChange={(e) => handleInputChange('phone_tertiary', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                  <input
                    type="text"
                    value={formData.whatsapp || ''}
                    onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Link de WhatsApp</label>
                  <input
                    type="url"
                    value={formData.whatsapp_link || ''}
                    onChange={(e) => handleInputChange('whatsapp_link', e.target.value)}
                    placeholder="https://wa.me/584149019327"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Address Tab */}
          {activeTab === 'address' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Dirección Física</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                  <input
                    type="text"
                    value={formData.address_street || ''}
                    onChange={(e) => handleInputChange('address_street', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zona/Área</label>
                  <input
                    type="text"
                    value={formData.address_area || ''}
                    onChange={(e) => handleInputChange('address_area', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                  <input
                    type="text"
                    value={formData.address_city || ''}
                    onChange={(e) => handleInputChange('address_city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado/Provincia</label>
                  <input
                    type="text"
                    value={formData.address_state || ''}
                    onChange={(e) => handleInputChange('address_state', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Código Postal</label>
                  <input
                    type="text"
                    value={formData.address_zip || ''}
                    onChange={(e) => handleInputChange('address_zip', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">País</label>
                  <input
                    type="text"
                    value={formData.address_country || ''}
                    onChange={(e) => handleInputChange('address_country', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL de Google Maps</label>
                  <input
                    type="url"
                    value={formData.google_maps_url || ''}
                    onChange={(e) => handleInputChange('google_maps_url', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Hours Tab */}
          {activeTab === 'hours' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Horarios de Atención</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lunes a Viernes</label>
                  <input
                    type="text"
                    value={formData.hours_weekday || ''}
                    onChange={(e) => handleInputChange('hours_weekday', e.target.value)}
                    placeholder="Lun-Vie: 7:00 AM - 4:00 PM"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sábados</label>
                  <input
                    type="text"
                    value={formData.hours_saturday || ''}
                    onChange={(e) => handleInputChange('hours_saturday', e.target.value)}
                    placeholder="Sáb: 8:00 AM - 12:00 PM"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Domingos</label>
                  <input
                    type="text"
                    value={formData.hours_sunday || ''}
                    onChange={(e) => handleInputChange('hours_sunday', e.target.value)}
                    placeholder="Dom: Cerrado"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Social Tab */}
          {activeTab === 'social' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Redes Sociales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instagram URL</label>
                  <input
                    type="url"
                    value={formData.social_instagram || ''}
                    onChange={(e) => handleInputChange('social_instagram', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instagram Handle</label>
                  <input
                    type="text"
                    value={formData.social_instagram_handle || ''}
                    onChange={(e) => handleInputChange('social_instagram_handle', e.target.value)}
                    placeholder="@laboratorioeg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Twitter URL</label>
                  <input
                    type="url"
                    value={formData.social_twitter || ''}
                    onChange={(e) => handleInputChange('social_twitter', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Twitter Handle</label>
                  <input
                    type="text"
                    value={formData.social_twitter_handle || ''}
                    onChange={(e) => handleInputChange('social_twitter_handle', e.target.value)}
                    placeholder="@Laboratorio_EG"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Facebook URL</label>
                  <input
                    type="url"
                    value={formData.social_facebook || ''}
                    onChange={(e) => handleInputChange('social_facebook', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">YouTube URL</label>
                  <input
                    type="url"
                    value={formData.social_youtube || ''}
                    onChange={(e) => handleInputChange('social_youtube', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
                  <input
                    type="url"
                    value={formData.social_linkedin || ''}
                    onChange={(e) => handleInputChange('social_linkedin', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SEO Tab */}
          {activeTab === 'seo' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Configuración SEO</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título SEO</label>
                  <input
                    type="text"
                    value={formData.seo_title || ''}
                    onChange={(e) => handleInputChange('seo_title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                  <p className="text-xs text-gray-500 mt-1">{(formData.seo_title || '').length}/60 caracteres recomendados</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meta Descripción</label>
                  <textarea
                    value={formData.seo_description || ''}
                    onChange={(e) => handleInputChange('seo_description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                  <p className="text-xs text-gray-500 mt-1">{(formData.seo_description || '').length}/160 caracteres recomendados</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Palabras Clave</label>
                  <textarea
                    value={formData.seo_keywords || ''}
                    onChange={(e) => handleInputChange('seo_keywords', e.target.value)}
                    rows={2}
                    placeholder="laboratorio, análisis clínicos, hematología, ..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Autor</label>
                    <input
                      type="text"
                      value={formData.seo_author || ''}
                      onChange={(e) => handleInputChange('seo_author', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">OG Image URL</label>
                    <input
                      type="text"
                      value={formData.og_image_url || ''}
                      onChange={(e) => handleInputChange('og_image_url', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">OG Type</label>
                    <input
                      type="text"
                      value={formData.og_type || ''}
                      onChange={(e) => handleInputChange('og_type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">OG Locale</label>
                    <input
                      type="text"
                      value={formData.og_locale || ''}
                      onChange={(e) => handleInputChange('og_locale', e.target.value)}
                      placeholder="es_VE"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PWA Tab */}
          {activeTab === 'pwa' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Configuración PWA</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la App</label>
                  <input
                    type="text"
                    value={formData.pwa_name || ''}
                    onChange={(e) => handleInputChange('pwa_name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Corto (máx. 12 caracteres)</label>
                  <input
                    type="text"
                    value={formData.pwa_short_name || ''}
                    onChange={(e) => handleInputChange('pwa_short_name', e.target.value)}
                    maxLength={12}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                  <p className="text-xs text-gray-500 mt-1">{(formData.pwa_short_name || '').length}/12 caracteres</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción de la App</label>
                  <textarea
                    value={formData.pwa_description || ''}
                    onChange={(e) => handleInputChange('pwa_description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Legal Tab */}
          {activeTab === 'legal' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Información Legal</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL Política de Privacidad</label>
                  <input
                    type="text"
                    value={formData.privacy_policy_url || ''}
                    onChange={(e) => handleInputChange('privacy_policy_url', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL Términos de Servicio</label>
                  <input
                    type="text"
                    value={formData.terms_of_service_url || ''}
                    onChange={(e) => handleInputChange('terms_of_service_url', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL Política de Cookies</label>
                  <input
                    type="text"
                    value={formData.cookies_policy_url || ''}
                    onChange={(e) => handleInputChange('cookies_policy_url', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Template de Copyright</label>
                  <input
                    type="text"
                    value={formData.copyright_template || ''}
                    onChange={(e) => handleInputChange('copyright_template', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Usa {'{year}'} para el año actual y {'{company_name}'} para el nombre de la empresa
                  </p>
                  <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                    Preview: {(formData.copyright_template || '').replace('{year}', new Date().getFullYear()).replace('{company_name}', formData.name || '')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyInfoManager;
