import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Info,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Eye,
  EyeOff,
  RefreshCw,
  Heart,
  Target
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getAllAdminAbout,
  createAbout,
  updateAbout,
  deleteAbout,
  invalidateDimogenCache
} from '../../../services/dimogenApi';

const SECTION_TYPES = [
  { value: 'filosofia', label: 'Filosofía', icon: Heart, color: 'text-pink-600' },
  { value: 'valores', label: 'Valores', icon: Target, color: 'text-blue-600' }
];

const AVAILABLE_ICONS = [
  'FaHeartbeat', 'FaLightbulb', 'FaUserShield', 'FaMicroscope',
  'FaCertificate', 'FaHandshake', 'FaShieldAlt', 'FaDna',
  'FaFlask', 'FaHandHoldingHeart'
];

const DEFAULT_COLORS = ['#0047CB', '#00A3E0', '#98CB59', '#E11D48', '#F59E0B'];

export default function DimogenAboutManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState('filosofia');

  // Form state
  const [formData, setFormData] = useState({
    section_type: 'filosofia',
    title: '',
    description: '',
    icon_name: 'FaHeartbeat',
    color: '#0047CB',
    stat_value: '',
    stat_label: '',
    sort_order: 0,
    is_active: true
  });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const response = await getAllAdminAbout();
      if (response.success) {
        setItems(response.data || []);
      } else {
        toast.error('Error al cargar items');
      }
    } catch (error) {
      console.error('Error loading about items:', error);
      toast.error('Error al cargar items');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = (sectionType = activeTab) => {
    const currentItems = items.filter(i => i.section_type === sectionType);
    setFormData({
      section_type: sectionType,
      title: '',
      description: '',
      icon_name: 'FaHeartbeat',
      color: '#0047CB',
      stat_value: sectionType === 'valores' ? '' : '',
      stat_label: sectionType === 'valores' ? '' : '',
      sort_order: currentItems.length + 1,
      is_active: true
    });
    setIsCreating(true);
    setEditingItem(null);
  };

  const handleEdit = (item) => {
    setFormData({
      section_type: item.section_type || 'filosofia',
      title: item.title || '',
      description: item.description || '',
      icon_name: item.icon_name || 'FaHeartbeat',
      color: item.color || '#0047CB',
      stat_value: item.stat_value || '',
      stat_label: item.stat_label || '',
      sort_order: item.sort_order || 0,
      is_active: item.is_active
    });
    setEditingItem(item);
    setIsCreating(false);
    setActiveTab(item.section_type);
  };

  const handleCancel = () => {
    setFormData({
      section_type: activeTab,
      title: '',
      description: '',
      icon_name: 'FaHeartbeat',
      color: '#0047CB',
      stat_value: '',
      stat_label: '',
      sort_order: 0,
      is_active: true
    });
    setEditingItem(null);
    setIsCreating(false);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error('El título es requerido');
      return;
    }

    try {
      setSaving(true);

      if (isCreating) {
        const response = await createAbout(formData);
        if (response.success) {
          toast.success('Item creado exitosamente');
          await loadItems();
          handleCancel();
        }
      } else if (editingItem) {
        const response = await updateAbout(editingItem.id, formData);
        if (response.success) {
          toast.success('Item actualizado exitosamente');
          await loadItems();
          handleCancel();
        }
      }

      await invalidateDimogenCache();
    } catch (error) {
      console.error('Error saving item:', error);
      toast.error(error.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`¿Eliminar "${item.title}"?`)) {
      return;
    }

    try {
      const response = await deleteAbout(item.id);
      if (response.success) {
        toast.success('Item eliminado');
        await loadItems();
        await invalidateDimogenCache();
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Error al eliminar');
    }
  };

  const handleToggleActive = async (item) => {
    try {
      const response = await updateAbout(item.id, {
        ...item,
        is_active: !item.is_active
      });
      if (response.success) {
        toast.success(item.is_active ? 'Item desactivado' : 'Item activado');
        await loadItems();
        await invalidateDimogenCache();
      }
    } catch (error) {
      console.error('Error toggling item:', error);
      toast.error('Error al cambiar estado');
    }
  };

  // Filter items by section type
  const filosofiaItems = items.filter(i => i.section_type === 'filosofia');
  const valoresItems = items.filter(i => i.section_type === 'valores');

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
            <Info className="w-7 h-7 text-blue-600" />
            Sobre DIMOGEN
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona la filosofía y valores del landing de DIMOGEN
          </p>
        </div>
        <button
          onClick={() => handleCreate(activeTab)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Item
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {SECTION_TYPES.map(section => {
          const Icon = section.icon;
          const count = section.value === 'filosofia' ? filosofiaItems.length : valoresItems.length;
          return (
            <button
              key={section.value}
              onClick={() => setActiveTab(section.value)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === section.value
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className={`w-5 h-5 ${activeTab === section.value ? section.color : ''}`} />
              <span className="font-medium">{section.label}</span>
              <span className="px-2 py-0.5 text-xs bg-gray-100 rounded-full">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Create/Edit Form */}
      <AnimatePresence>
        {(isCreating || editingItem) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {isCreating ? `Nuevo Item de ${activeTab === 'filosofia' ? 'Filosofía' : 'Valores'}` : 'Editar Item'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de sección
                  </label>
                  <select
                    value={formData.section_type}
                    onChange={(e) => setFormData({ ...formData, section_type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {SECTION_TYPES.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Prevención Oportuna"
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
                    placeholder="Descripción del item..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>

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
                    Color
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <div className="flex gap-1">
                      {DEFAULT_COLORS.map(color => (
                        <button
                          key={color}
                          onClick={() => setFormData({ ...formData, color })}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            formData.color === color ? 'border-gray-800 scale-110' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {formData.section_type === 'valores' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estadística (valor)
                      </label>
                      <input
                        type="text"
                        value={formData.stat_value}
                        onChange={(e) => setFormData({ ...formData, stat_value: e.target.value })}
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
                        value={formData.stat_label}
                        onChange={(e) => setFormData({ ...formData, stat_label: e.target.value })}
                        placeholder="Estudios"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

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

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(activeTab === 'filosofia' ? filosofiaItems : valoresItems).map((item) => (
          <motion.div
            key={item.id}
            layout
            className={`bg-white rounded-xl shadow-lg border border-gray-200 p-6 ${
              !item.is_active ? 'opacity-60' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${item.color}20` }}
              >
                <span className="text-2xl" style={{ color: item.color }}>
                  {item.icon_name === 'FaHeartbeat' ? '❤️' :
                   item.icon_name === 'FaLightbulb' ? '💡' :
                   item.icon_name === 'FaUserShield' ? '🛡️' :
                   item.icon_name === 'FaMicroscope' ? '🔬' :
                   item.icon_name === 'FaCertificate' ? '📜' :
                   item.icon_name === 'FaHandshake' ? '🤝' :
                   item.icon_name === 'FaDna' ? '🧬' :
                   item.icon_name === 'FaFlask' ? '🧪' : '✨'}
                </span>
              </div>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {item.is_active ? 'Activo' : 'Inactivo'}
              </span>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-3 mb-4">{item.description}</p>

            {item.section_type === 'valores' && item.stat_value && (
              <div className="flex items-baseline gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
                <span className="text-2xl font-bold" style={{ color: item.color }}>
                  {item.stat_value}
                </span>
                <span className="text-sm text-gray-500">{item.stat_label}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-400">Orden: {item.sort_order}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleActive(item)}
                  className={`p-2 rounded-lg transition-colors ${
                    item.is_active ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'
                  }`}
                  title={item.is_active ? 'Desactivar' : 'Activar'}
                >
                  {item.is_active ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => handleEdit(item)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(item)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {(activeTab === 'filosofia' ? filosofiaItems : valoresItems).length === 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
          <Info className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">No hay items de {activeTab === 'filosofia' ? 'filosofía' : 'valores'}</p>
          <button
            onClick={() => handleCreate(activeTab)}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Crear primer item
          </button>
        </div>
      )}
    </div>
  );
}
