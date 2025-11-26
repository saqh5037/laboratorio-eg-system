import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Eye,
  EyeOff,
  RefreshCw,
  GripVertical,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getAllAdminServices,
  createService,
  updateService,
  deleteService,
  invalidateDimogenCache
} from '../../../services/dimogenApi';
import ImageUploader from '../../../components/admin/ImageUploader';

const AVAILABLE_ICONS = [
  'FaDna', 'FaUserMd', 'FaLeaf', 'FaFlask', 'FaMicroscope',
  'FaHeartbeat', 'FaStethoscope', 'FaAppleAlt'
];

const DEFAULT_COLORS = [
  { name: 'Azul DIMOGEN', primary: '#0047CB', secondary: '#0747A6', light: '#E6F0FF', gradient: 'from-[#0047CB] to-[#0747A6]' },
  { name: 'Celeste', primary: '#00A3E0', secondary: '#0077B6', light: '#E6F9FF', gradient: 'from-[#00A3E0] to-[#0077B6]' },
  { name: 'Verde', primary: '#98CB59', secondary: '#006644', light: '#E6FFF5', gradient: 'from-[#98CB59] to-[#006644]' }
];

export default function DimogenServicesManager() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    service_key: '',
    title: '',
    subtitle: '',
    description: '',
    icon_name: 'FaDna',
    color_primary: '#0047CB',
    color_secondary: '#0747A6',
    color_light: '#E6F0FF',
    color_gradient: 'from-[#0047CB] to-[#0747A6]',
    image_url: '',
    features: [''],
    stats_value: '',
    stats_label: '',
    link_url: '',
    sort_order: 0,
    is_active: true
  });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await getAllAdminServices();
      if (response.success) {
        setServices(response.data || []);
      } else {
        toast.error('Error al cargar servicios');
      }
    } catch (error) {
      console.error('Error loading services:', error);
      toast.error('Error al cargar servicios');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({
      service_key: '',
      title: '',
      subtitle: '',
      description: '',
      icon_name: 'FaDna',
      color_primary: '#0047CB',
      color_secondary: '#0747A6',
      color_light: '#E6F0FF',
      color_gradient: 'from-[#0047CB] to-[#0747A6]',
      image_url: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=600&h=400&fit=crop',
      features: [''],
      stats_value: '100+',
      stats_label: 'Estudios',
      link_url: '',
      sort_order: services.length + 1,
      is_active: true
    });
    setIsCreating(true);
    setEditingService(null);
  };

  const handleEdit = (service) => {
    setFormData({
      service_key: service.service_key || '',
      title: service.title || '',
      subtitle: service.subtitle || '',
      description: service.description || '',
      icon_name: service.icon_name || 'FaDna',
      color_primary: service.color_primary || '#0047CB',
      color_secondary: service.color_secondary || '#0747A6',
      color_light: service.color_light || '#E6F0FF',
      color_gradient: service.color_gradient || 'from-[#0047CB] to-[#0747A6]',
      image_url: service.image_url || '',
      features: service.features || [''],
      stats_value: service.stats_value || '',
      stats_label: service.stats_label || '',
      link_url: service.link_url || '',
      sort_order: service.sort_order || 0,
      is_active: service.is_active
    });
    setEditingService(service);
    setIsCreating(false);
  };

  const handleCancel = () => {
    setFormData({
      service_key: '',
      title: '',
      subtitle: '',
      description: '',
      icon_name: 'FaDna',
      color_primary: '#0047CB',
      color_secondary: '#0747A6',
      color_light: '#E6F0FF',
      color_gradient: 'from-[#0047CB] to-[#0747A6]',
      image_url: '',
      features: [''],
      stats_value: '',
      stats_label: '',
      link_url: '',
      sort_order: 0,
      is_active: true
    });
    setEditingService(null);
    setIsCreating(false);
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.service_key.trim()) {
      toast.error('Título y clave del servicio son requeridos');
      return;
    }

    try {
      setSaving(true);

      // Clean features array
      const cleanedData = {
        ...formData,
        features: formData.features.filter(f => f.trim() !== '')
      };

      if (isCreating) {
        const response = await createService(cleanedData);
        if (response.success) {
          toast.success('Servicio creado exitosamente');
          await loadServices();
          handleCancel();
        }
      } else if (editingService) {
        const response = await updateService(editingService.id, cleanedData);
        if (response.success) {
          toast.success('Servicio actualizado exitosamente');
          await loadServices();
          handleCancel();
        }
      }

      await invalidateDimogenCache();
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error(error.message || 'Error al guardar servicio');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (service) => {
    if (!window.confirm(`¿Eliminar el servicio "${service.title}"?`)) {
      return;
    }

    try {
      const response = await deleteService(service.id);
      if (response.success) {
        toast.success('Servicio eliminado');
        await loadServices();
        await invalidateDimogenCache();
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Error al eliminar servicio');
    }
  };

  const handleToggleActive = async (service) => {
    try {
      const response = await updateService(service.id, {
        ...service,
        is_active: !service.is_active
      });
      if (response.success) {
        toast.success(service.is_active ? 'Servicio desactivado' : 'Servicio activado');
        await loadServices();
        await invalidateDimogenCache();
      }
    } catch (error) {
      console.error('Error toggling service:', error);
      toast.error('Error al cambiar estado');
    }
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ''] });
  };

  const removeFeature = (index) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures.length ? newFeatures : [''] });
  };

  const applyColorPreset = (preset) => {
    setFormData({
      ...formData,
      color_primary: preset.primary,
      color_secondary: preset.secondary,
      color_light: preset.light,
      color_gradient: preset.gradient
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Briefcase className="w-7 h-7 text-blue-600" />
            Servicios DIMOGEN
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona las líneas de negocio del landing de DIMOGEN
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Servicio
        </button>
      </div>

      {/* Create/Edit Form */}
      <AnimatePresence>
        {(isCreating || editingService) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {isCreating ? 'Nuevo Servicio' : 'Editar Servicio'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Clave del servicio * <span className="text-xs text-gray-400">(ej: biologia-molecular)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.service_key}
                    onChange={(e) => setFormData({ ...formData, service_key: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    placeholder="mi-servicio"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Biología Molecular"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subtítulo
                  </label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="Laboratorio de Alta Especialidad"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descripción del servicio..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <ImageUploader
                  value={formData.image_url}
                  onChange={(url) => setFormData({ ...formData, image_url: url })}
                  category="services"
                  label="Imagen del servicio"
                  previewHeight={150}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Link del servicio
                  </label>
                  <input
                    type="text"
                    value={formData.link_url}
                    onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                    placeholder="/dimogen/servicios/mi-servicio"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Icono
                  </label>
                  <select
                    value={formData.icon_name}
                    onChange={(e) => setFormData({ ...formData, icon_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {AVAILABLE_ICONS.map(icon => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Colores
                  </label>
                  <div className="flex gap-2 mb-2">
                    {DEFAULT_COLORS.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => applyColorPreset(preset)}
                        className="flex items-center gap-2 px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                      >
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: preset.primary }}
                        />
                        {preset.name}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={formData.color_primary}
                      onChange={(e) => setFormData({ ...formData, color_primary: e.target.value })}
                      className="w-10 h-10 rounded cursor-pointer"
                      title="Color primario"
                    />
                    <input
                      type="color"
                      value={formData.color_secondary}
                      onChange={(e) => setFormData({ ...formData, color_secondary: e.target.value })}
                      className="w-10 h-10 rounded cursor-pointer"
                      title="Color secundario"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estadística (valor)
                    </label>
                    <input
                      type="text"
                      value={formData.stats_value}
                      onChange={(e) => setFormData({ ...formData, stats_value: e.target.value })}
                      placeholder="500+"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estadística (etiqueta)
                    </label>
                    <input
                      type="text"
                      value={formData.stats_label}
                      onChange={(e) => setFormData({ ...formData, stats_label: e.target.value })}
                      placeholder="Estudios"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Características
                  </label>
                  {formData.features.map((feature, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => handleFeatureChange(idx, e.target.value)}
                        placeholder="Característica..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => removeFeature(idx)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addFeature}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    + Agregar característica
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Orden
                    </label>
                    <input
                      type="number"
                      value={formData.sort_order}
                      onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                      min="0"
                      className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer mt-6">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Activo</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Services List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <motion.div
            key={service.id}
            layout
            className={`bg-white rounded-xl shadow-lg border overflow-hidden ${
              !service.is_active ? 'opacity-60' : ''
            }`}
            style={{ borderTopColor: service.color_primary, borderTopWidth: '4px' }}
          >
            {service.image_url && (
              <div className="h-40 overflow-hidden">
                <img
                  src={service.image_url}
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                  service.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {service.is_active ? 'Activo' : 'Inactivo'}
                </span>
                <span className="text-xs text-gray-400">Orden: {service.sort_order}</span>
              </div>

              <h3 className="text-lg font-semibold text-gray-900">{service.title}</h3>
              <p className="text-sm text-gray-500 mb-2">{service.subtitle}</p>
              <p className="text-sm text-gray-600 line-clamp-2">{service.description}</p>

              {service.features?.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-1">Características:</p>
                  <div className="flex flex-wrap gap-1">
                    {service.features.slice(0, 3).map((f, idx) => (
                      <span key={idx} className="text-xs px-2 py-0.5 bg-gray-100 rounded">
                        {f}
                      </span>
                    ))}
                    {service.features.length > 3 && (
                      <span className="text-xs text-gray-400">+{service.features.length - 3}</span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(service)}
                    className={`p-2 rounded-lg transition-colors ${
                      service.is_active ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'
                    }`}
                    title={service.is_active ? 'Desactivar' : 'Activar'}
                  >
                    {service.is_active ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => handleEdit(service)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(service)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                {service.link_url && (
                  <a
                    href={service.link_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                    title="Ver página"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {services.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
          <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">No hay servicios configurados</p>
          <button
            onClick={handleCreate}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Crear primer servicio
          </button>
        </div>
      )}
    </div>
  );
}
