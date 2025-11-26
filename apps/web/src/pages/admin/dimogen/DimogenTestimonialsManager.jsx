import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Plus,
  Edit2,
  Trash2,
  Save,
  Eye,
  EyeOff,
  RefreshCw,
  Star,
  User
} from 'lucide-react';
import toast from 'react-hot-toast';
import { config } from '../../../config/env';
import ImageUploader from '../../../components/admin/ImageUploader';

const CONFIG_API_URL = config.VITE_CONFIG_API_URL;

const AVATAR_TYPES = [
  { value: 'FaUserMd', label: 'Médico' },
  { value: 'FaUser', label: 'Usuario' },
  { value: 'FaUserTie', label: 'Ejecutivo' },
  { value: 'FaHospital', label: 'Hospital' },
  { value: 'FaHotel', label: 'Hotel' },
  { value: 'FaBuilding', label: 'Empresa' }
];

export default function DimogenTestimonialsManager() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    text: '',
    avatar_type: 'FaUserMd',
    avatar_url: '',
    rating: 5,
    sort_order: 0,
    is_active: true
  });

  useEffect(() => {
    loadTestimonials();
  }, []);

  const getAuthToken = () => localStorage.getItem('adminToken');

  const loadTestimonials = async () => {
    try {
      setLoading(true);
      // Usamos el endpoint público ya que el admin aún no existe para testimonials
      const response = await fetch(`${CONFIG_API_URL}/api/dimogen/content`);
      const data = await response.json();
      if (data.success && data.data?.testimonials) {
        setTestimonials(data.data.testimonials);
      }
    } catch (error) {
      console.error('Error loading testimonials:', error);
      toast.error('Error al cargar testimonios');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({
      name: '',
      role: '',
      text: '',
      avatar_type: 'FaUserMd',
      avatar_url: '',
      rating: 5,
      sort_order: testimonials.length + 1,
      is_active: true
    });
    setIsCreating(true);
    setEditingItem(null);
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.name || '',
      role: item.role || '',
      text: item.text || '',
      avatar_type: item.avatar_type || 'FaUserMd',
      avatar_url: item.avatar_url || '',
      rating: item.rating || 5,
      sort_order: item.sort_order || 0,
      is_active: item.is_active !== false
    });
    setEditingItem(item);
    setIsCreating(false);
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      role: '',
      text: '',
      avatar_type: 'FaUserMd',
      avatar_url: '',
      rating: 5,
      sort_order: 0,
      is_active: true
    });
    setEditingItem(null);
    setIsCreating(false);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.text.trim()) {
      toast.error('Nombre y testimonio son requeridos');
      return;
    }

    try {
      setSaving(true);

      // Por ahora solo mostramos toast de éxito ya que necesitamos crear el endpoint
      // TODO: Implementar endpoints admin/testimonials en backend
      toast.success('Funcionalidad en desarrollo - Los testimonios se editan desde la base de datos');
      handleCancel();
    } catch (error) {
      console.error('Error saving testimonial:', error);
      toast.error(error.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    toast.error('Funcionalidad en desarrollo');
  };

  const handleToggleActive = async (item) => {
    toast.error('Funcionalidad en desarrollo');
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
            <MessageSquare className="w-7 h-7 text-blue-600" />
            Testimonios DIMOGEN
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona los testimonios de clientes del landing de DIMOGEN
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Testimonio
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Nota:</strong> Los testimonios actualmente se cargan desde la base de datos.
          La funcionalidad de edición completa estará disponible próximamente.
        </p>
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
              {isCreating ? 'Nuevo Testimonio' : 'Editar Testimonio'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Dr. Carlos García"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rol / Cargo
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="Médico Internista - Hospital General"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Testimonio *
                  </label>
                  <textarea
                    value={formData.text}
                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                    placeholder="Escribe el testimonio..."
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Avatar
                  </label>
                  <select
                    value={formData.avatar_type}
                    onChange={(e) => setFormData({ ...formData, avatar_type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {AVATAR_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <ImageUploader
                  value={formData.avatar_url}
                  onChange={(url) => setFormData({ ...formData, avatar_url: url })}
                  category="testimonials"
                  label="Imagen del testimonio (opcional)"
                  previewHeight={120}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Calificación
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        onClick={() => setFormData({ ...formData, rating: star })}
                        className="p-1"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= formData.rating
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
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

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.map((item) => (
          <motion.div
            key={item.id}
            layout
            className={`bg-white rounded-xl shadow-lg border border-gray-200 p-6 ${
              !item.is_active ? 'opacity-60' : ''
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <User className="w-7 h-7 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {[...Array(item.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <h3 className="font-semibold text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-500">{item.role}</p>
              </div>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0 ${
                item.is_active !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {item.is_active !== false ? 'Activo' : 'Inactivo'}
              </span>
            </div>

            <p className="mt-4 text-gray-600 italic">"{item.text}"</p>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-400">Orden: {item.sort_order}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleActive(item)}
                  className={`p-2 rounded-lg transition-colors ${
                    item.is_active !== false ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'
                  }`}
                  title={item.is_active !== false ? 'Desactivar' : 'Activar'}
                >
                  {item.is_active !== false ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
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

      {testimonials.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">No hay testimonios configurados</p>
        </div>
      )}
    </div>
  );
}
