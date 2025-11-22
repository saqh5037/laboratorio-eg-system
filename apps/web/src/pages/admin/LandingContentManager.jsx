import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Dialog } from '@headlessui/react';
import { useLandingContent } from '../../hooks/useLandingContent';
import SortableList from '../../components/admin/landing/SortableList';
import ResourceCard from '../../components/admin/landing/ResourceCard';
import ValueFormModal from '../../components/admin/landing/ValueFormModal';
import CertificationFormModal from '../../components/admin/landing/CertificationFormModal';
import TestimonialFormModal from '../../components/admin/landing/TestimonialFormModal';
import ContactInfoFormModal from '../../components/admin/landing/ContactInfoFormModal';
import ContentBlockFormModal from '../../components/admin/landing/ContentBlockFormModal';
import StatisticFormModal from '../../components/admin/landing/StatisticFormModal';
import {
  Plus,
  FileText,
  Award,
  MessageSquare,
  Phone,
  Layout,
  TrendingUp,
  Eye,
  AlertCircle,
  CheckCircle,
  Loader,
  RefreshCw
} from 'lucide-react';
import {
  getAllValues,
  createValue,
  updateValue,
  deleteValue,
  getAllCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  getAllTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getAllContactInfo,
  createContactInfo,
  updateContactInfo,
  deleteContactInfo,
  getAllContentBlocks,
  createContentBlock,
  updateContentBlock,
  deleteContentBlock,
  getAllStatistics,
  createStatistic,
  updateStatistic,
  deleteStatistic,
  invalidateLandingCache
} from '../../services/landingContentApi';

// Tabs disponibles
const TABS = [
  { id: 'values', label: 'Valores', icon: FileText },
  { id: 'certifications', label: 'Certificaciones', icon: Award },
  { id: 'testimonials', label: 'Testimonios', icon: MessageSquare },
  { id: 'contact', label: 'Info Contacto', icon: Phone },
  { id: 'content', label: 'Bloques', icon: Layout },
  { id: 'statistics', label: 'Estadísticas', icon: TrendingUp },
  { id: 'preview', label: 'Vista Previa', icon: Eye }
];

/**
 * LandingContentManager Component
 * Página principal para gestionar todo el contenido de la landing page
 */
const LandingContentManager = () => {
  const { loading: initialLoading, error: initialError, refresh } = useLandingContent();

  // Estado de tabs
  const [activeTab, setActiveTab] = useState('values');

  // Estados de datos (cada tab maneja sus propios datos)
  const [values, setValues] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [contactInfo, setContactInfo] = useState([]);
  const [contentBlocks, setContentBlocks] = useState([]);
  const [statistics, setStatistics] = useState([]);

  // Estados de loading por tab
  const [loadingData, setLoadingData] = useState(false);
  const [savingData, setSavingData] = useState(false);

  // Estado de "Apply Changes" (invalidar caché)
  const [applyingChanges, setApplyingChanges] = useState(false);

  // Estados de modales
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [selectedItem, setSelectedItem] = useState(null);

  // Estado de confirmación de delete
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Cargar datos cuando cambia el tab activo
  React.useEffect(() => {
    loadTabData(activeTab);
  }, [activeTab]);

  /**
   * Cargar datos según el tab activo
   */
  const loadTabData = async (tabId) => {
    if (tabId === 'preview') return; // Preview no carga datos

    setLoadingData(true);
    try {
      let data;
      switch (tabId) {
        case 'values':
          data = await getAllValues();
          setValues(data.data || []);
          break;
        case 'certifications':
          data = await getAllCertifications();
          setCertifications(data.data || []);
          break;
        case 'testimonials':
          data = await getAllTestimonials();
          setTestimonials(data.data || []);
          break;
        case 'contact':
          data = await getAllContactInfo();
          setContactInfo(data.data || []);
          break;
        case 'content':
          data = await getAllContentBlocks();
          setContentBlocks(data.data || []);
          break;
        case 'statistics':
          data = await getAllStatistics();
          setStatistics(data.data || []);
          break;
      }
    } catch (error) {
      console.error(`Error loading ${tabId}:`, error);
      toast.error(`Error al cargar ${TABS.find(t => t.id === tabId)?.label}`);
    } finally {
      setLoadingData(false);
    }
  };

  /**
   * Obtener datos del tab activo
   */
  const getActiveTabData = () => {
    switch (activeTab) {
      case 'values':
        return values;
      case 'certifications':
        return certifications;
      case 'testimonials':
        return testimonials;
      case 'contact':
        return contactInfo;
      case 'content':
        return contentBlocks;
      case 'statistics':
        return statistics;
      default:
        return [];
    }
  };

  /**
   * Actualizar datos del tab activo
   */
  const setActiveTabData = (data) => {
    switch (activeTab) {
      case 'values':
        setValues(data);
        break;
      case 'certifications':
        setCertifications(data);
        break;
      case 'testimonials':
        setTestimonials(data);
        break;
      case 'contact':
        setContactInfo(data);
        break;
      case 'content':
        setContentBlocks(data);
        break;
      case 'statistics':
        setStatistics(data);
        break;
    }
  };

  /**
   * Crear nuevo item
   */
  const handleCreate = () => {
    setModalMode('create');
    setSelectedItem(null);
    setShowModal(true);
  };

  /**
   * Editar item existente
   */
  const handleEdit = (item) => {
    setModalMode('edit');
    setSelectedItem(item);
    setShowModal(true);
  };

  /**
   * Guardar item (create o update)
   */
  const handleSave = async (formData) => {
    setSavingData(true);
    try {
      let result;
      const isEdit = modalMode === 'edit';

      switch (activeTab) {
        case 'values':
          result = isEdit
            ? await updateValue(selectedItem.id, formData)
            : await createValue(formData);
          break;
        case 'certifications':
          result = isEdit
            ? await updateCertification(selectedItem.id, formData)
            : await createCertification(formData);
          break;
        case 'testimonials':
          result = isEdit
            ? await updateTestimonial(selectedItem.id, formData)
            : await createTestimonial(formData);
          break;
        case 'contact':
          result = isEdit
            ? await updateContactInfo(selectedItem.id, formData)
            : await createContactInfo(formData);
          break;
        case 'content':
          result = isEdit
            ? await updateContentBlock(selectedItem.id, formData)
            : await createContentBlock(formData);
          break;
        case 'statistics':
          result = isEdit
            ? await updateStatistic(selectedItem.id, formData)
            : await createStatistic(formData);
          break;
      }

      if (result.success) {
        toast.success(isEdit ? 'Item actualizado exitosamente' : 'Item creado exitosamente');
        setShowModal(false);
        setSelectedItem(null);
        await loadTabData(activeTab);
        await refresh(); // Refresh del hook para actualizar landing
      } else {
        throw new Error(result.error || 'Error al guardar');
      }
    } catch (error) {
      console.error('Error saving:', error);
      toast.error(error.message || 'Error al guardar el item');
    } finally {
      setSavingData(false);
    }
  };

  /**
   * Confirmar eliminación
   */
  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setShowDeleteConfirm(true);
  };

  /**
   * Eliminar item
   */
  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      let result;
      switch (activeTab) {
        case 'values':
          result = await deleteValue(itemToDelete.id);
          break;
        case 'certifications':
          result = await deleteCertification(itemToDelete.id);
          break;
        case 'testimonials':
          result = await deleteTestimonial(itemToDelete.id);
          break;
        case 'contact':
          result = await deleteContactInfo(itemToDelete.id);
          break;
        case 'content':
          result = await deleteContentBlock(itemToDelete.id);
          break;
        case 'statistics':
          result = await deleteStatistic(itemToDelete.id);
          break;
      }

      if (result.success) {
        toast.success('Item eliminado exitosamente');
        setShowDeleteConfirm(false);
        setItemToDelete(null);
        await loadTabData(activeTab);
        await refresh();
      } else {
        throw new Error(result.error || 'Error al eliminar');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error(error.message || 'Error al eliminar el item');
    }
  };

  /**
   * Toggle activo/inactivo
   */
  const handleToggle = async (item) => {
    try {
      const newStatus = !item.is_active;

      // Solo enviar los campos necesarios para evitar duplicación
      const updateData = {
        icon_name: item.icon_name,
        title: item.title,
        description: item.description,
        sort_order: item.sort_order,
        is_active: newStatus
      };

      let result;
      switch (activeTab) {
        case 'values':
          result = await updateValue(item.id, updateData);
          break;
        case 'certifications':
          result = await updateCertification(item.id, updateData);
          break;
        case 'testimonials':
          result = await updateTestimonial(item.id, updateData);
          break;
        case 'contact':
          result = await updateContactInfo(item.id, updateData);
          break;
        case 'content':
          result = await updateContentBlock(item.id, updateData);
          break;
        case 'statistics':
          result = await updateStatistic(item.id, updateData);
          break;
      }

      if (result.success) {
        toast.success(`Item ${newStatus ? 'activado' : 'desactivado'} exitosamente`);
        await loadTabData(activeTab);
        await refresh();
      } else {
        throw new Error(result.error || 'Error al actualizar');
      }
    } catch (error) {
      console.error('Error toggling:', error);
      toast.error(error.message || 'Error al cambiar estado del item');
    }
  };

  /**
   * Reordenar items con drag & drop
   */
  const handleReorder = async (newItems) => {
    // Actualizar localmente primero para UX fluida
    setActiveTabData(newItems);

    // Actualizar sort_order en backend
    try {
      for (const item of newItems) {
        switch (activeTab) {
          case 'values':
            await updateValue(item.id, { sort_order: item.sort_order });
            break;
          case 'certifications':
            await updateCertification(item.id, { sort_order: item.sort_order });
            break;
          case 'testimonials':
            await updateTestimonial(item.id, { sort_order: item.sort_order });
            break;
          case 'contact':
            await updateContactInfo(item.id, { sort_order: item.sort_order });
            break;
          case 'content':
            await updateContentBlock(item.id, { sort_order: item.sort_order });
            break;
          case 'statistics':
            await updateStatistic(item.id, { sort_order: item.sort_order });
            break;
        }
      }
      toast.success('Orden actualizado');
      await refresh();
    } catch (error) {
      console.error('Error reordering:', error);
      toast.error('Error al actualizar el orden');
      await loadTabData(activeTab); // Recargar en caso de error
    }
  };

  /**
   * Aplicar cambios (invalidar caché de landing pública)
   * Esto publica los cambios que se han hecho en el CMS
   */
  const handleApplyChanges = async () => {
    setApplyingChanges(true);
    try {
      const result = await invalidateLandingCache();

      if (result.success) {
        const message = result.data?.deletedCount
          ? `Cambios aplicados: ${result.data.deletedCount} cache keys invalidadas`
          : 'Cambios aplicados exitosamente. La landing page se ha actualizado.';

        toast.success(message, {
          duration: 5000,
          icon: '🎉'
        });
      } else {
        throw new Error(result.error || 'Error al aplicar cambios');
      }
    } catch (error) {
      console.error('Error applying changes:', error);

      // Manejar específicamente error de rate limiting
      if (error.message?.includes('Demasiadas solicitudes')) {
        toast.error('Por favor espera 30 segundos antes de aplicar cambios nuevamente', {
          duration: 4000
        });
      } else {
        toast.error(error.message || 'Error al aplicar los cambios');
      }
    } finally {
      setApplyingChanges(false);
    }
  };

  /**
   * Renderizar modal según tab activo
   */
  const renderModal = () => {
    const commonProps = {
      isOpen: showModal,
      onClose: () => {
        setShowModal(false);
        setSelectedItem(null);
      },
      onSave: handleSave,
      isLoading: savingData
    };

    switch (activeTab) {
      case 'values':
        return <ValueFormModal {...commonProps} value={selectedItem} />;
      case 'certifications':
        return <CertificationFormModal {...commonProps} certification={selectedItem} />;
      case 'testimonials':
        return <TestimonialFormModal {...commonProps} testimonial={selectedItem} />;
      case 'contact':
        return <ContactInfoFormModal {...commonProps} contactInfo={selectedItem} />;
      case 'content':
        return <ContentBlockFormModal {...commonProps} contentBlock={selectedItem} />;
      case 'statistics':
        return <StatisticFormModal {...commonProps} statistic={selectedItem} />;
      default:
        return null;
    }
  };

  /**
   * Renderizar contenido según tab activo
   */
  const renderTabContent = () => {
    if (activeTab === 'preview') {
      return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Vista Previa de la Landing Page
            </h3>
            <button
              onClick={() => window.open('/', '_blank')}
              className="px-4 py-2 bg-eg-purple text-white rounded-lg
                       hover:bg-eg-purple/90 transition-colors flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Abrir en nueva pestaña
            </button>
          </div>
          <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
            <iframe
              src="/"
              title="Landing Page Preview"
              className="w-full h-[600px]"
            />
          </div>
        </div>
      );
    }

    const data = getActiveTabData();
    const activeTabInfo = TABS.find(t => t.id === activeTab);

    return (
      <div className="space-y-6">
        {/* Header con stats */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              {activeTabInfo?.label}
            </h2>
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-eg-purple text-white rounded-lg
                       hover:bg-eg-purple/90 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Agregar {activeTabInfo?.label}
            </button>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Total</div>
              <div className="text-2xl font-semibold text-gray-900">{data.length}</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Activos</div>
              <div className="text-2xl font-semibold text-green-600">
                {data.filter(item => item.is_active).length}
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Inactivos</div>
              <div className="text-2xl font-semibold text-gray-600">
                {data.filter(item => !item.is_active).length}
              </div>
            </div>
          </div>
        </div>

        {/* Lista de items */}
        {loadingData ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-eg-purple animate-spin" />
          </div>
        ) : (
          <SortableList
            items={data}
            onReorder={handleReorder}
            renderItem={(item) => (
              <ResourceCard
                resource={item}
                type={activeTab.replace(/s$/, '')} // Remove 's' from plural
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                onToggle={handleToggle}
              />
            )}
            keyExtractor={(item) => item.id}
            emptyMessage={`No hay ${activeTabInfo?.label.toLowerCase()} para mostrar`}
          />
        )}
      </div>
    );
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader className="w-12 h-12 text-eg-purple animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Contenido de Landing Page</h1>
            <p className="text-gray-600 mt-2">
              Gestiona todo el contenido que se muestra en la página de inicio
            </p>
          </div>

          {/* Botón "Aplicar Cambios" */}
          <button
            onClick={handleApplyChanges}
            disabled={applyingChanges}
            className="px-6 py-3 bg-green-600 text-white rounded-lg
                     hover:bg-green-700 transition-colors flex items-center gap-2
                     disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
            title="Publicar los cambios realizados a la landing pública. Invalidará el caché y los cambios serán visibles inmediatamente."
          >
            {applyingChanges ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Aplicando...
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                Aplicar Cambios
              </>
            )}
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 overflow-x-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm
                           whitespace-nowrap transition-colors
                           ${isActive
                             ? 'border-eg-purple text-eg-purple'
                             : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                           }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {renderTabContent()}

        {/* Modales */}
        {renderModal()}

        {/* Modal de confirmación de eliminación */}
        <Dialog
          open={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Dialog.Panel className="mx-auto max-w-sm w-full bg-white rounded-xl shadow-xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full
                             flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <Dialog.Title className="text-lg font-semibold text-gray-900">
                    ¿Eliminar item?
                  </Dialog.Title>
                  <p className="text-sm text-gray-600 mt-1">
                    Esta acción no se puede deshacer
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setItemToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 bg-white border border-gray-300
                           text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg
                           hover:bg-red-700 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
    </div>
  );
};

export default LandingContentManager;
