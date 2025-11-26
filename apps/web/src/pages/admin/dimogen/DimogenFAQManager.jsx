import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getAllAdminFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
  invalidateDimogenCache
} from '../../../services/dimogenApi';

const FAQ_CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'muestras', label: 'Toma de Muestras' },
  { value: 'resultados', label: 'Resultados' },
  { value: 'servicios', label: 'Servicios' },
  { value: 'pagos', label: 'Pagos y Facturación' },
  { value: 'certificaciones', label: 'Certificaciones' }
];

export default function DimogenFAQManager() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [expandedFaq, setExpandedFaq] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'general',
    sort_order: 0,
    is_active: true
  });

  // Load FAQs
  useEffect(() => {
    loadFaqs();
  }, []);

  const loadFaqs = async () => {
    try {
      setLoading(true);
      const response = await getAllAdminFaqs();
      if (response.success) {
        setFaqs(response.data || []);
      } else {
        toast.error('Error al cargar FAQs');
      }
    } catch (error) {
      console.error('Error loading FAQs:', error);
      toast.error('Error al cargar FAQs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setFormData({
      question: '',
      answer: '',
      category: 'general',
      sort_order: faqs.length + 1,
      is_active: true
    });
    setIsCreating(true);
    setEditingFaq(null);
  };

  const handleEdit = (faq) => {
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || 'general',
      sort_order: faq.sort_order || 0,
      is_active: faq.is_active
    });
    setEditingFaq(faq);
    setIsCreating(false);
  };

  const handleCancel = () => {
    setFormData({
      question: '',
      answer: '',
      category: 'general',
      sort_order: 0,
      is_active: true
    });
    setEditingFaq(null);
    setIsCreating(false);
  };

  const handleSave = async () => {
    if (!formData.question.trim() || !formData.answer.trim()) {
      toast.error('Pregunta y respuesta son requeridas');
      return;
    }

    try {
      setSaving(true);

      if (isCreating) {
        const response = await createFaq(formData);
        if (response.success) {
          toast.success('FAQ creada exitosamente');
          await loadFaqs();
          handleCancel();
        }
      } else if (editingFaq) {
        const response = await updateFaq(editingFaq.id, formData);
        if (response.success) {
          toast.success('FAQ actualizada exitosamente');
          await loadFaqs();
          handleCancel();
        }
      }

      // Invalidar caché
      await invalidateDimogenCache();
    } catch (error) {
      console.error('Error saving FAQ:', error);
      toast.error(error.message || 'Error al guardar FAQ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (faq) => {
    if (!window.confirm(`¿Eliminar la pregunta "${faq.question}"?`)) {
      return;
    }

    try {
      const response = await deleteFaq(faq.id);
      if (response.success) {
        toast.success('FAQ eliminada');
        await loadFaqs();
        await invalidateDimogenCache();
      }
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      toast.error('Error al eliminar FAQ');
    }
  };

  const handleToggleActive = async (faq) => {
    try {
      const response = await updateFaq(faq.id, {
        ...faq,
        is_active: !faq.is_active
      });
      if (response.success) {
        toast.success(faq.is_active ? 'FAQ desactivada' : 'FAQ activada');
        await loadFaqs();
        await invalidateDimogenCache();
      }
    } catch (error) {
      console.error('Error toggling FAQ:', error);
      toast.error('Error al cambiar estado');
    }
  };

  // Filter FAQs
  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || faq.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryLabel = (value) => {
    return FAQ_CATEGORIES.find(c => c.value === value)?.label || value;
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
            <HelpCircle className="w-7 h-7 text-blue-600" />
            FAQs de DIMOGEN
          </h1>
          <p className="text-gray-600 mt-1">
            Gestiona las preguntas frecuentes del landing de DIMOGEN
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nueva FAQ
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar pregunta o respuesta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
          >
            <option value="all">Todas las categorías</option>
            {FAQ_CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Create/Edit Form */}
      <AnimatePresence>
        {(isCreating || editingFaq) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {isCreating ? 'Nueva Pregunta Frecuente' : 'Editar Pregunta Frecuente'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pregunta *
                </label>
                <input
                  type="text"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="¿Cuál es tu pregunta?"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Respuesta *
                </label>
                <textarea
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  placeholder="Escribe la respuesta..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {FAQ_CATEGORIES.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Orden
                  </label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Activa</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
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
                {saving ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAQs List */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">
            {filteredFaqs.length} pregunta{filteredFaqs.length !== 1 ? 's' : ''} encontrada{filteredFaqs.length !== 1 ? 's' : ''}
          </p>
        </div>

        {filteredFaqs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <HelpCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No hay FAQs para mostrar</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredFaqs.map((faq) => (
              <div
                key={faq.id}
                className={`transition-colors ${!faq.is_active ? 'bg-gray-50 opacity-60' : ''}`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          faq.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {faq.is_active ? 'Activa' : 'Inactiva'}
                        </span>
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                          {getCategoryLabel(faq.category)}
                        </span>
                        <span className="text-xs text-gray-400">
                          Orden: {faq.sort_order}
                        </span>
                      </div>

                      <button
                        onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                        className="flex items-center gap-2 text-left w-full"
                      >
                        <h4 className="font-medium text-gray-900 hover:text-blue-600 transition-colors">
                          {faq.question}
                        </h4>
                        {expandedFaq === faq.id ? (
                          <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        )}
                      </button>

                      <AnimatePresence>
                        {expandedFaq === faq.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 p-3 bg-gray-50 rounded-lg"
                          >
                            <p className="text-gray-600 text-sm whitespace-pre-wrap">
                              {faq.answer}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleToggleActive(faq)}
                        className={`p-2 rounded-lg transition-colors ${
                          faq.is_active
                            ? 'text-green-600 hover:bg-green-50'
                            : 'text-gray-400 hover:bg-gray-100'
                        }`}
                        title={faq.is_active ? 'Desactivar' : 'Activar'}
                      >
                        {faq.is_active ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={() => handleEdit(faq)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(faq)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Nota:</strong> Los cambios se reflejan automáticamente en la landing page de DIMOGEN
          después de guardar. Las FAQs inactivas no se mostrarán en el sitio público.
        </p>
      </div>
    </div>
  );
}
