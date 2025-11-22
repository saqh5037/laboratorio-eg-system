import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useCarouselManager } from '../../hooks/useCarouselManager';
import Card from '../../components/admin/ui/Card';
import Badge from '../../components/admin/ui/Badge';
import Toggle from '../../components/admin/ui/Toggle';
import SlideFormModal from '../../components/admin/carousel/SlideFormModal';
import SlidePreviewModal from '../../components/admin/carousel/SlidePreviewModal';
import ImageUploadModal from '../../components/admin/carousel/ImageUploadModal';
import {
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Calendar,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Upload,
  X
} from 'lucide-react';

// Componente sortable para cada slide
function SortableSlide({ slide, onEdit, onPreview, onToggle, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slide.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border rounded-lg p-4 transition-all ${
        slide.is_active ? 'border-gray-200 bg-white' : 'border-gray-200 bg-gray-50 opacity-75'
      } ${isDragging ? 'shadow-lg z-50' : ''}`}
    >
      <div className="flex items-start gap-4">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing mt-2 touch-none"
        >
          <GripVertical className="w-5 h-5" />
        </button>

        {/* Image Preview */}
        <div className="w-32 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
          {slide.image_url ? (
            <img
              src={slide.image_url}
              alt={slide.image_alt || slide.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-gray-300" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{slide.title}</h3>
              {slide.subtitle && (
                <p className="text-sm text-gray-600 mt-1">{slide.subtitle}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                {slide.badge_text && (
                  <Badge variant={slide.badge_color}>{slide.badge_text}</Badge>
                )}
                {slide.start_date && (
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(slide.start_date).toLocaleDateString()}
                  </span>
                )}
                <span className="text-xs text-gray-500">
                  Posición: {slide.order_position}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Toggle
                enabled={slide.is_active}
                onChange={() => onToggle(slide.id, slide.is_active)}
              />
              <button
                onClick={() => onPreview(slide)}
                className="p-2 text-gray-600 hover:text-eg-purple hover:bg-purple-50 rounded-lg transition-colors"
                title="Vista previa"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => onEdit(slide)}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Editar"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(slide.id)}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Eliminar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* CTAs */}
          {(slide.cta1_text || slide.cta2_text) && (
            <div className="flex gap-2 mt-3">
              {slide.cta1_text && (
                <a
                  href={slide.cta1_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                >
                  {slide.cta1_text}
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {slide.cta2_text && (
                <a
                  href={slide.cta2_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                >
                  {slide.cta2_text}
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CarouselManager() {
  const {
    slides,
    stats,
    loading,
    uploading,
    savingSlide,
    error,
    uploadError,
    clearErrors,
    toggleActive,
    deleteSlide,
    uploadImage,
    createSlide,
    updateSlide,
    reorderSlide,
    refreshAll
  } = useCarouselManager();

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit' | 'preview'
  const [selectedSlide, setSelectedSlide] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [localSlides, setLocalSlides] = useState([]);

  // Sensores para drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Sincronizar slides del hook con estado local
  useEffect(() => {
    setLocalSlides(slides);
  }, [slides]);

  // Handler de drag end
  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = localSlides.findIndex((slide) => slide.id === active.id);
    const newIndex = localSlides.findIndex((slide) => slide.id === over.id);

    // Optimistic update
    const newSlides = arrayMove(localSlides, oldIndex, newIndex);
    setLocalSlides(newSlides);

    // Calcular nueva posición
    const newPosition = newIndex + 1;

    // Llamar a la API
    const result = await reorderSlide(active.id, newPosition);

    if (result.success) {
      toast.success('Orden actualizado exitosamente');
    } else {
      // Revertir cambio si falla
      setLocalSlides(slides);
      toast.error(result.error || 'Error al reordenar slide');
    }
  };

  // ============================================
  // HANDLERS
  // ============================================

  const handleCreateNew = () => {
    setModalMode('create');
    setSelectedSlide(null);
    setShowModal(true);
  };

  const handleEdit = (slide) => {
    setModalMode('edit');
    setSelectedSlide(slide);
    setShowModal(true);
  };

  const handlePreview = (slide) => {
    setSelectedSlide(slide);
    setShowPreviewModal(true);
  };

  const handleSaveSlide = async (slideData) => {
    try {
      let result;

      if (modalMode === 'create') {
        result = await createSlide(slideData);
        if (result.success) {
          toast.success('Slide creado exitosamente');
          setShowModal(false);
          setSelectedSlide(null);
        } else {
          toast.error(result.error || 'Error al crear el slide');
        }
      } else if (modalMode === 'edit') {
        result = await updateSlide(selectedSlide.id, slideData);
        if (result.success) {
          toast.success('Slide actualizado exitosamente');
          setShowModal(false);
          setSelectedSlide(null);
        } else {
          toast.error(result.error || 'Error al actualizar el slide');
        }
      }

      return result;
    } catch (err) {
      toast.error('Error al guardar el slide');
      return { success: false, error: err.message };
    }
  };

  const handleUploadImage = async (file) => {
    try {
      const result = await uploadImage(file);

      if (result.success) {
        toast.success('Imagen subida exitosamente');
        return result;
      } else {
        toast.error(result.error || 'Error al subir imagen');
        return result;
      }
    } catch (err) {
      toast.error('Error al subir imagen');
      return { success: false, error: err.message };
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    const result = await toggleActive(id, !currentStatus);
    if (result.success) {
      toast.success(currentStatus ? 'Slide desactivado' : 'Slide activado');
    } else {
      toast.error(result.error || 'Error al cambiar estado');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro de eliminar este slide? Esta acción no se puede deshacer.')) {
      const result = await deleteSlide(id);
      if (result.success) {
        toast.success('Slide eliminado exitosamente');
      } else {
        toast.error(result.error || 'Error al eliminar slide');
      }
    }
  };

  const handleUpload = () => {
    setShowUploadModal(true);
  };

  const handleCloseModal = () => {
    if (!savingSlide) {
      setShowModal(false);
      setSelectedSlide(null);
    }
  };

  const handleCloseUploadModal = () => {
    if (!uploading) {
      setShowUploadModal(false);
    }
  };

  const handleClosePreviewModal = () => {
    setShowPreviewModal(false);
    setSelectedSlide(null);
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestor de Carrusel</h1>
            <p className="text-gray-600 mt-1">
              Administra los slides del carrusel principal del sitio web
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleUpload}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Subir Imagen
            </button>
            <button
              onClick={handleCreateNew}
              className="px-4 py-2 bg-eg-purple text-white rounded-lg hover:bg-eg-purple/90 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Crear Slide
            </button>
          </div>
        </div>

        {/* Error Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <button
              onClick={clearErrors}
              className="text-red-600 hover:text-red-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Slides</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total_slides || 0}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <ImageIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Slides Activos</p>
                  <p className="text-2xl font-bold text-green-600 mt-1">{stats.active_slides || 0}</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Slides Inactivos</p>
                  <p className="text-2xl font-bold text-gray-600 mt-1">{stats.inactive_slides || 0}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <EyeOff className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Programados</p>
                  <p className="text-2xl font-bold text-purple-600 mt-1">{stats.scheduled_slides || 0}</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Slides List */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Slides del Carrusel</h2>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-eg-purple border-t-transparent"></div>
                <p className="text-gray-600 mt-4">Cargando slides...</p>
              </div>
            ) : localSlides.length === 0 ? (
              <div className="text-center py-12">
                <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No hay slides creados</p>
                <p className="text-gray-500 text-sm mt-1">Crea tu primer slide para comenzar</p>
                <button
                  onClick={handleCreateNew}
                  className="mt-4 px-4 py-2 bg-eg-purple text-white rounded-lg hover:bg-eg-purple/90 transition-colors inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Crear Primer Slide
                </button>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={localSlides.map(s => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {localSlides.map((slide) => (
                      <SortableSlide
                        key={slide.id}
                        slide={slide}
                        onEdit={handleEdit}
                        onPreview={handlePreview}
                        onToggle={handleToggleActive}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </Card>

        {/* Slide Form Modal (Create/Edit) */}
        <SlideFormModal
          isOpen={showModal}
          onClose={handleCloseModal}
          onSave={handleSaveSlide}
          slide={selectedSlide}
          mode={modalMode}
          saving={savingSlide}
        />

        {/* Slide Preview Modal */}
        <SlidePreviewModal
          isOpen={showPreviewModal}
          onClose={handleClosePreviewModal}
          slide={selectedSlide}
        />

        {/* Image Upload Modal */}
        <ImageUploadModal
          isOpen={showUploadModal}
          onClose={handleCloseUploadModal}
          onUpload={handleUploadImage}
          uploading={uploading}
        />
    </div>
  );
}
