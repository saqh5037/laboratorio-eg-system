import { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Upload, Image as ImageIcon } from 'lucide-react';
import { BADGE_COLORS, formatSlideForForm, uploadCarouselImage } from '../../../services/carouselApi';
import Toggle from '../ui/Toggle';
import LinkSelector from './LinkSelector';
import IconGrid from './IconGrid';
import LivePreview from './LivePreview';

export default function SlideFormModal({
  isOpen,
  onClose,
  onSave,
  slide = null,
  mode = 'create',
  saving = false
}) {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    image_url: '',
    image_alt: '',
    image_mobile_url: '',
    cta1_text: '',
    cta1_link: '',
    cta1_icon: 'calendar',
    cta2_text: '',
    cta2_link: '',
    cta2_icon: 'flask',
    badge_text: '',
    badge_color: 'purple',
    is_active: true,
    start_date: '',
    end_date: ''
  });

  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  // Cargar datos del slide si es modo editar
  useEffect(() => {
    if (mode === 'edit' && slide) {
      setFormData(formatSlideForForm(slide));
    } else if (mode === 'create') {
      // Reset form para modo crear
      setFormData({
        title: '',
        subtitle: '',
        description: '',
        image_url: '',
        image_alt: '',
        image_mobile_url: '',
        cta1_text: '',
        cta1_link: '',
        cta1_icon: 'calendar',
        cta2_text: '',
        cta2_link: '',
        cta2_icon: 'flask',
        badge_text: '',
        badge_color: 'purple',
        is_active: true,
        start_date: '',
        end_date: ''
      });
      setErrors({});
    }
  }, [mode, slide]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return;

    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Por favor selecciona una imagen válida (JPG, PNG o WebP)');
      return;
    }

    // Validar tamaño (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no debe superar 5MB');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress('Subiendo imagen...');

      const response = await uploadCarouselImage(file);

      if (response.success) {
        // Actualizar URLs en el formulario
        setFormData(prev => ({
          ...prev,
          image_url: response.data.desktop_url,
          image_mobile_url: response.data.mobile_url
        }));
        setUploadProgress('Imagen subida exitosamente');
        setTimeout(() => setUploadProgress(''), 2000);
      }
    } catch (error) {
      console.error('Error al subir imagen:', error);
      alert('Error al subir la imagen: ' + error.message);
      setUploadProgress('');
    } finally {
      setUploading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Título requerido y mínimo 3 caracteres
    if (!formData.title || formData.title.trim().length < 3) {
      newErrors.title = 'El título debe tener al menos 3 caracteres';
    }

    if (formData.title && formData.title.length > 200) {
      newErrors.title = 'El título no puede exceder 200 caracteres';
    }

    // Imagen requerida
    if (!formData.image_url || formData.image_url.trim() === '') {
      newErrors.image_url = 'La URL de la imagen es obligatoria';
    }

    // Validar URLs
    if (formData.image_url && !isValidUrl(formData.image_url)) {
      newErrors.image_url = 'Debe ser una URL válida';
    }

    if (formData.image_mobile_url && !isValidUrl(formData.image_mobile_url)) {
      newErrors.image_mobile_url = 'Debe ser una URL válida';
    }

    // CTA validations
    if (formData.cta1_text && !formData.cta1_link) {
      newErrors.cta1_link = 'Si defines un texto de CTA debe tener un link';
    }

    if (formData.cta2_text && !formData.cta2_link) {
      newErrors.cta2_link = 'Si defines un texto de CTA debe tener un link';
    }

    // Validar fechas
    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);

      if (startDate > endDate) {
        newErrors.end_date = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Preparar datos para enviar
    const dataToSend = {
      ...formData,
      // Convertir strings vacíos a null
      subtitle: formData.subtitle || null,
      description: formData.description || null,
      image_alt: formData.image_alt || null,
      image_mobile_url: formData.image_mobile_url || null,
      cta1_text: formData.cta1_text || null,
      cta1_link: formData.cta1_link || null,
      cta2_text: formData.cta2_text || null,
      cta2_link: formData.cta2_link || null,
      badge_text: formData.badge_text || null,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null
    };

    onSave(dataToSend);
  };

  const handleClose = () => {
    if (!saving) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-eg-purple to-eg-purple/90">
          <div>
            <h2 className="text-2xl font-semibold text-white">
              {mode === 'create' ? 'Crear Nuevo Slide' : 'Editar Slide'}
            </h2>
            <p className="text-white/80 text-sm mt-1">
              Completa los campos y observa el preview en tiempo real
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={saving}
            className="text-white hover:text-white/80 transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form - 2 Column Layout */}
        <div className="overflow-y-auto flex-1 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Columna Izquierda - Formulario */}
            <div className="space-y-6">
              <form onSubmit={handleSubmit} id="slide-form">
                {/* Sección: Contenido Principal */}
                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-eg-purple text-white rounded-full flex items-center justify-center text-sm">1</span>
                    Contenido Principal
                  </h3>

                  <div className="space-y-4">
                    {/* Título */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Título <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-eg-purple focus:border-transparent text-gray-900 ${
                          errors.title ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Ej: Tu salud es nuestra prioridad"
                        disabled={saving}
                      />
                      {errors.title && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.title}
                        </p>
                      )}
                    </div>

                    {/* Subtítulo */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subtítulo
                      </label>
                      <input
                        type="text"
                        value={formData.subtitle}
                        onChange={(e) => handleChange('subtitle', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eg-purple focus:border-transparent text-gray-900"
                        placeholder="Ej: Tecnología de vanguardia y atención personalizada"
                        disabled={saving}
                      />
                    </div>

                    {/* Descripción */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descripción
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eg-purple focus:border-transparent text-gray-900"
                        placeholder="Ej: Descripción del servicio o característica destacada"
                        disabled={saving}
                      />
                    </div>
                  </div>
                </div>

                {/* Sección: Imagen */}
                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200 mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-eg-purple text-white rounded-full flex items-center justify-center text-sm">2</span>
                    Imagen del Slide
                  </h3>

                  {/* Upload Section */}
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <ImageIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-medium text-blue-900 mb-1">Subir Imagen</h4>
                        <p className="text-sm text-blue-700 mb-3">
                          Sube una imagen y se optimizará automáticamente para desktop (1920x1080) y móvil (800x600)
                        </p>

                        <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                          <Upload className="w-4 h-4" />
                          <span>Seleccionar Imagen</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(file);
                              e.target.value = '';
                            }}
                            disabled={uploading || saving}
                            className="hidden"
                          />
                        </label>

                        {uploadProgress && (
                          <p className="mt-2 text-sm text-blue-700 font-medium">{uploadProgress}</p>
                        )}

                        <p className="mt-2 text-xs text-blue-600">
                          Formatos: JPG, PNG, WebP | Tamaño máximo: 5MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Manual URLs */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        URL Imagen Desktop <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.image_url}
                        onChange={(e) => handleChange('image_url', e.target.value)}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-eg-purple focus:border-transparent text-gray-900 ${
                          errors.image_url ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Se genera automáticamente al subir imagen"
                        disabled={saving || uploading}
                      />
                      {errors.image_url && (
                        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.image_url}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Texto Alternativo (Alt)
                      </label>
                      <input
                        type="text"
                        value={formData.image_alt}
                        onChange={(e) => handleChange('image_alt', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eg-purple focus:border-transparent text-gray-900"
                        placeholder="Descripción de la imagen para accesibilidad"
                        disabled={saving}
                      />
                    </div>
                  </div>
                </div>

                {/* Sección: Botón Principal (CTA1) */}
                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200 mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-eg-purple text-white rounded-full flex items-center justify-center text-sm">3</span>
                    Botón Principal (CTA 1)
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Texto del Botón
                      </label>
                      <input
                        type="text"
                        value={formData.cta1_text}
                        onChange={(e) => handleChange('cta1_text', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eg-purple focus:border-transparent text-gray-900"
                        placeholder="Ej: Agenda tu cita"
                        disabled={saving}
                      />
                    </div>

                    <LinkSelector
                      value={formData.cta1_link}
                      onChange={(value) => handleChange('cta1_link', value)}
                      label="Link del Botón"
                      placeholder="Selecciona un link o escribe uno personalizado"
                    />

                    <IconGrid
                      value={formData.cta1_icon}
                      onChange={(value) => handleChange('cta1_icon', value)}
                      label="Icono del Botón"
                    />
                  </div>
                </div>

                {/* Sección: Botón Secundario (CTA2) */}
                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200 mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-gray-400 text-white rounded-full flex items-center justify-center text-sm">4</span>
                    Botón Secundario (CTA 2) - Opcional
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Texto del Botón
                      </label>
                      <input
                        type="text"
                        value={formData.cta2_text}
                        onChange={(e) => handleChange('cta2_text', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eg-purple focus:border-transparent text-gray-900"
                        placeholder="Ej: Ver estudios"
                        disabled={saving}
                      />
                    </div>

                    <LinkSelector
                      value={formData.cta2_link}
                      onChange={(value) => handleChange('cta2_link', value)}
                      label="Link del Botón"
                      placeholder="Selecciona un link o escribe uno personalizado"
                    />

                    <IconGrid
                      value={formData.cta2_icon}
                      onChange={(value) => handleChange('cta2_icon', value)}
                      label="Icono del Botón"
                    />
                  </div>
                </div>

                {/* Sección: Badge y Configuración */}
                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200 mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-gray-400 text-white rounded-full flex items-center justify-center text-sm">5</span>
                    Configuración Adicional
                  </h3>

                  <div className="space-y-4">
                    {/* Badge */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Texto del Badge (Opcional)
                      </label>
                      <input
                        type="text"
                        value={formData.badge_text}
                        onChange={(e) => handleChange('badge_text', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eg-purple focus:border-transparent text-gray-900"
                        placeholder="Ej: 30% descuento"
                        maxLength={50}
                        disabled={saving}
                      />
                    </div>

                    {/* Color del Badge */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Color del Badge
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {BADGE_COLORS.map((color) => (
                          <button
                            key={color.value}
                            type="button"
                            onClick={() => handleChange('badge_color', color.value)}
                            disabled={saving}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                              formData.badge_color === color.value
                                ? 'border-eg-purple bg-purple-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className={`w-4 h-4 rounded-full ${color.color}`}></div>
                            <span className="text-xs font-medium">{color.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Programación Temporal */}
                    <div className="pt-4 border-t border-gray-300">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Programación Temporal (Opcional)
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            Fecha de Inicio
                          </label>
                          <input
                            type="datetime-local"
                            value={formData.start_date}
                            onChange={(e) => handleChange('start_date', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eg-purple focus:border-transparent text-gray-900 text-sm"
                            disabled={saving}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            Fecha de Fin
                          </label>
                          <input
                            type="datetime-local"
                            value={formData.end_date}
                            onChange={(e) => handleChange('end_date', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-eg-purple focus:border-transparent text-gray-900 text-sm"
                            disabled={saving}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Estado */}
                    <div className="pt-4 border-t border-gray-300">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-1">
                            Estado del Slide
                          </label>
                          <p className="text-xs text-gray-600">
                            {formData.is_active
                              ? 'El slide se mostrará en el carrusel'
                              : 'El slide está desactivado'}
                          </p>
                        </div>
                        <Toggle
                          enabled={formData.is_active}
                          onChange={(value) => handleChange('is_active', value)}
                          disabled={saving}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Columna Derecha - Preview en Tiempo Real */}
            <div className="lg:sticky lg:top-6 h-fit">
              <LivePreview slideData={formData} />
            </div>
          </div>
        </div>

        {/* Botones - Fixed at bottom */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="slide-form"
            disabled={saving}
            className="px-6 py-2 bg-eg-purple text-white rounded-lg hover:bg-eg-purple/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {mode === 'create' ? 'Crear Slide' : 'Guardar Cambios'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
