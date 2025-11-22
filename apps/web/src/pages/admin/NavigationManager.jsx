import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import {
  Menu,
  Plus,
  Edit3,
  Trash2,
  Save,
  X,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  ExternalLink,
  Home,
  Info,
  Mail,
  FlaskConical,
  FileBarChart,
  Heart,
  Settings,
  FileText,
  Users,
  ShoppingCart,
  Phone,
  MapPin,
  Calendar,
  Search,
  Bell,
  Star,
  Shield,
  Zap
} from 'lucide-react';

// Mapa de iconos disponibles
const availableIcons = {
  Home: Home,
  Info: Info,
  Mail: Mail,
  FlaskConical: FlaskConical,
  FileBarChart: FileBarChart,
  Heart: Heart,
  Settings: Settings,
  FileText: FileText,
  Users: Users,
  ShoppingCart: ShoppingCart,
  Phone: Phone,
  MapPin: MapPin,
  Calendar: Calendar,
  Search: Search,
  Bell: Bell,
  Star: Star,
  Shield: Shield,
  Zap: Zap,
  ExternalLink: ExternalLink
};

const API_BASE = import.meta.env.VITE_CONFIG_API_URL || 'http://localhost:3005';

export default function NavigationManager() {
  const { token } = useAdminAuth();
  const [navigationItems, setNavigationItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState('header');
  const [editingItem, setEditingItem] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    location: 'header',
    label: '',
    url: '',
    icon: 'Home',
    target: '_self',
    is_external: false,
    is_active: true,
    sort_order: 0
  });

  const locations = [
    { id: 'header', name: 'Header', description: 'Menú principal de navegación' },
    { id: 'sidebar', name: 'Sidebar', description: 'Menú lateral móvil' },
    { id: 'footer_quick', name: 'Footer - Enlaces Rápidos', description: 'Links rápidos en el footer' },
    { id: 'footer_services', name: 'Footer - Servicios', description: 'Lista de servicios en footer' }
  ];

  // Fetch navigation items
  const fetchNavigationItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/navigation`);
      const data = await response.json();
      if (data.success) {
        setNavigationItems(data.data);
      }
    } catch (error) {
      console.error('Error fetching navigation:', error);
      toast.error('Error al cargar navegación');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNavigationItems();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Create new item
  const handleCreateItem = async () => {
    if (!formData.label || !formData.url) {
      toast.error('Label y URL son requeridos');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/navigation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          location: selectedLocation
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Item creado exitosamente');
        setShowAddForm(false);
        resetForm();
        fetchNavigationItems();
      } else {
        toast.error(data.error || 'Error al crear item');
      }
    } catch (error) {
      console.error('Error creating item:', error);
      toast.error('Error al crear item');
    }
  };

  // Update item
  const handleUpdateItem = async () => {
    if (!editingItem) return;

    try {
      const response = await fetch(`${API_BASE}/api/navigation/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Item actualizado');
        setEditingItem(null);
        resetForm();
        fetchNavigationItems();
      } else {
        toast.error(data.error || 'Error al actualizar');
      }
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Error al actualizar item');
    }
  };

  // Delete item
  const handleDeleteItem = async (itemId) => {
    if (!confirm('¿Estás seguro de eliminar este item?')) return;

    try {
      const response = await fetch(`${API_BASE}/api/navigation/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Item eliminado');
        fetchNavigationItems();
      } else {
        toast.error(data.error || 'Error al eliminar');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Error al eliminar item');
    }
  };

  // Toggle item visibility
  const handleToggleVisibility = async (itemId) => {
    try {
      const response = await fetch(`${API_BASE}/api/navigation/${itemId}/toggle`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`Item ${data.data.is_active ? 'activado' : 'desactivado'}`);
        fetchNavigationItems();
      }
    } catch (error) {
      console.error('Error toggling visibility:', error);
      toast.error('Error al cambiar visibilidad');
    }
  };

  // Move item up/down
  const handleReorder = async (location, fromIndex, direction) => {
    const items = [...(navigationItems[location] || [])];
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;

    if (toIndex < 0 || toIndex >= items.length) return;

    // Swap items
    [items[fromIndex], items[toIndex]] = [items[toIndex], items[fromIndex]];

    // Update sort_order
    const reorderedIds = items.map(item => item.id);

    try {
      const response = await fetch(`${API_BASE}/api/navigation/reorder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          location,
          item_ids: reorderedIds
        })
      });

      const data = await response.json();
      if (data.success) {
        fetchNavigationItems();
      }
    } catch (error) {
      console.error('Error reordering:', error);
      toast.error('Error al reordenar');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      location: selectedLocation,
      label: '',
      url: '',
      icon: 'Home',
      target: '_self',
      is_external: false,
      is_active: true,
      sort_order: 0
    });
  };

  // Start editing
  const startEditing = (item) => {
    setEditingItem(item);
    setFormData({
      location: item.location,
      label: item.label,
      url: item.url,
      icon: item.icon || 'Home',
      target: item.target || '_self',
      is_external: item.is_external || false,
      is_active: item.is_active,
      sort_order: item.sort_order
    });
    setShowAddForm(false);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingItem(null);
    resetForm();
  };

  const currentItems = navigationItems[selectedLocation] || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-eg-purple"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Navegación</h1>
          <p className="text-gray-600 mt-1">
            Administra los menús de navegación de tu aplicación
          </p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(true);
            setEditingItem(null);
            resetForm();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-eg-purple text-white rounded-lg hover:bg-eg-purple/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Agregar Item
        </button>
      </div>

      {/* Location Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex flex-wrap -mb-px">
            {locations.map(loc => (
              <button
                key={loc.id}
                onClick={() => setSelectedLocation(loc.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  selectedLocation === loc.id
                    ? 'border-eg-purple text-eg-purple'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {loc.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4">
          <p className="text-sm text-gray-600 mb-4">
            {locations.find(l => l.id === selectedLocation)?.description}
          </p>

          {/* Add/Edit Form */}
          {(showAddForm || editingItem) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200"
            >
              <h3 className="font-medium mb-3">
                {editingItem ? 'Editar Item' : 'Nuevo Item'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Label *
                  </label>
                  <input
                    type="text"
                    name="label"
                    value={formData.label}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eg-purple focus:border-transparent"
                    placeholder="Ej: Inicio"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL *
                  </label>
                  <input
                    type="text"
                    name="url"
                    value={formData.url}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eg-purple focus:border-transparent"
                    placeholder="Ej: / o /#nosotros"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Icono
                  </label>
                  <select
                    name="icon"
                    value={formData.icon}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eg-purple focus:border-transparent"
                  >
                    {Object.keys(availableIcons).map(iconName => (
                      <option key={iconName} value={iconName}>
                        {iconName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target
                  </label>
                  <select
                    name="target"
                    value={formData.target}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eg-purple focus:border-transparent"
                  >
                    <option value="_self">Misma ventana</option>
                    <option value="_blank">Nueva ventana</option>
                  </select>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="is_external"
                      checked={formData.is_external}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-eg-purple focus:ring-eg-purple"
                    />
                    <span className="text-sm text-gray-700">Link externo</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-eg-purple focus:ring-eg-purple"
                    />
                    <span className="text-sm text-gray-700">Activo</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    cancelEditing();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <X className="w-4 h-4 inline mr-1" />
                  Cancelar
                </button>
                <button
                  onClick={editingItem ? handleUpdateItem : handleCreateItem}
                  className="px-4 py-2 bg-eg-purple text-white rounded-lg hover:bg-eg-purple/90 transition-colors"
                >
                  <Save className="w-4 h-4 inline mr-1" />
                  {editingItem ? 'Guardar Cambios' : 'Crear Item'}
                </button>
              </div>
            </motion.div>
          )}

          {/* Items List */}
          <div className="space-y-2">
            {currentItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No hay items en esta ubicación
              </div>
            ) : (
              currentItems.map((item, index) => {
                const IconComponent = availableIcons[item.icon] || Menu;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      item.is_active
                        ? 'bg-white border-gray-200'
                        : 'bg-gray-100 border-gray-300 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => handleReorder(selectedLocation, index, 'up')}
                          disabled={index === 0}
                          className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleReorder(selectedLocation, index, 'down')}
                          disabled={index === currentItems.length - 1}
                          className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="p-2 bg-eg-purple/10 rounded-lg">
                        <IconComponent className="w-4 h-4 text-eg-purple" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.label}</p>
                        <p className="text-sm text-gray-500">{item.url}</p>
                      </div>
                      {item.is_external && (
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleVisibility(item.id)}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        title={item.is_active ? 'Desactivar' : 'Activar'}
                      >
                        {item.is_active ? (
                          <Eye className="w-4 h-4 text-green-600" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                      <button
                        onClick={() => startEditing(item)}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit3 className="w-4 h-4 text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
