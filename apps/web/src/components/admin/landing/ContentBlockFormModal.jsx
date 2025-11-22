import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { X, Save, AlertCircle } from 'lucide-react';

// Secciones predefinidas de la landing
const SECTIONS = [
  { value: 'nosotros-header', label: 'Nosotros - Header' },
  { value: 'historia', label: 'Historia' },
  { value: 'valores-header', label: 'Valores - Header' },
  { value: 'proposito', label: 'Propósito' },
  { value: 'certificaciones-header', label: 'Certificaciones - Header' },
  { value: 'testimonios-header', label: 'Testimonios - Header' },
  { value: 'contacto-header', label: 'Contacto - Header' },
  { value: 'cta', label: 'Call to Action' },
  { value: 'footer', label: 'Footer' },
  { value: 'otro', label: 'Otro' }
];

// Tipos de bloque
const BLOCK_TYPES = [
  { value: 'title', label: 'Título' },
  { value: 'subtitle', label: 'Subtítulo' },
  { value: 'paragraph', label: 'Párrafo' },
  { value: 'image', label: 'Imagen' },
  { value: 'text', label: 'Texto' }
];

/**
 * ContentBlockFormModal Component
 * Modal para crear/editar bloques de contenido
 */
const ContentBlockFormModal = ({
  isOpen,
  onClose,
  onSave,
  contentBlock = null,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    section: 'nosotros-header',
    block_type: 'paragraph',
    content: '',
    image_url: '',
    metadata: '',
    sort_order: 0,
    is_active: true
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (contentBlock) {
      setFormData({
        section: contentBlock.section || 'nosotros-header',
        block_type: contentBlock.block_type || 'paragraph',
        content: contentBlock.content || '',
        image_url: contentBlock.image_url || '',
        metadata: contentBlock.metadata ? JSON.stringify(contentBlock.metadata, null, 2) : '',
        sort_order: contentBlock.sort_order || 0,
        is_active: contentBlock.is_active !== undefined ? contentBlock.is_active : true
      });
    } else {
      setFormData({
        section: 'nosotros-header',
        block_type: 'paragraph',
        content: '',
        image_url: '',
        metadata: '',
        sort_order: 0,
        is_active: true
      });
    }
    setErrors({});
    setTouched({});
  }, [contentBlock, isOpen]);

  const validateField = (name, value) => {
    switch (name) {
      case 'section':
        if (!value) return 'La sección es requerida';
        return '';

      case 'block_type':
        if (!value) return 'El tipo de bloque es requerido';
        return '';

      case 'content':
        if (!value.trim()) return 'El contenido es requerido';
        if (value.trim().length < 3) return 'El contenido debe tener al menos 3 caracteres';
        if (value.trim().length > 5000) return 'El contenido no puede superar los 5000 caracteres';
        return '';

      case 'image_url':
        // Imagen es opcional, pero si existe debe ser URL válida
        if (value.trim() && !/^https?:\/\/.+/.test(value)) {
          return 'La URL de imagen debe ser válida (http:// o https://)';
        }
        return '';

      case 'metadata':
        // Metadata es opcional, pero si existe debe ser JSON válido
        if (value.trim()) {
          try {
            JSON.parse(value);
          } catch (e) {
            return 'El JSON no es válido';
          }
        }
        return '';

      case 'sort_order':
        if (value < 0) return 'El orden no puede ser negativo';
        return '';

      default:
        return '';
    }
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, formData[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      if (key !== 'is_active' && key !== 'image_url' && key !== 'metadata') {
        const error = validateField(key, formData[key]);
        if (error) newErrors[key] = error;
      }
    });

    // Validar opcionales si tienen contenido
    if (formData.image_url) {
      const imgError = validateField('image_url', formData.image_url);
      if (imgError) newErrors.image_url = imgError;
    }

    if (formData.metadata) {
      const metaError = validateField('metadata', formData.metadata);
      if (metaError) newErrors.metadata = metaError;
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      section: true,
      block_type: true,
      content: true,
      image_url: true,
      metadata: true,
      sort_order: true
    });

    const newErrors = validateForm();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    // Preparar datos para enviar
    const dataToSend = {
      ...formData,
      metadata: formData.metadata ? JSON.parse(formData.metadata) : null
    };

    await onSave(dataToSend);
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-3xl w-full bg-white rounded-xl shadow-2xl
                                max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4
                       flex items-center justify-between z-10">
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              {contentBlock ? 'Editar Bloque de Contenido' : 'Nuevo Bloque de Contenido'}
            </Dialog.Title>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-500 transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {/* Sección */}
              <div>
                <label htmlFor="section" className="block text-sm font-medium text-gray-700 mb-2">
                  Sección *
                </label>
                <select
                  id="section"
                  value={formData.section}
                  onChange={(e) => handleChange('section', e.target.value)}
                  onBlur={() => handleBlur('section')}
                  disabled={isLoading}
                  className={`w-full px-4 py-2 border rounded-lg text-gray-900
                           focus:ring-2 focus:ring-eg-purple focus:border-transparent
                           disabled:bg-gray-50 disabled:cursor-not-allowed transition-all
                           ${touched.section && errors.section
                             ? 'border-red-300 focus:ring-red-500'
                             : 'border-gray-300'}`}
                >
                  {SECTIONS.map(section => (
                    <option key={section.value} value={section.value}>
                      {section.label}
                    </option>
                  ))}
                </select>
                {touched.section && errors.section && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.section}</span>
                  </div>
                )}
              </div>

              {/* Tipo de bloque */}
              <div>
                <label htmlFor="block_type" className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de bloque *
                </label>
                <select
                  id="block_type"
                  value={formData.block_type}
                  onChange={(e) => handleChange('block_type', e.target.value)}
                  onBlur={() => handleBlur('block_type')}
                  disabled={isLoading}
                  className={`w-full px-4 py-2 border rounded-lg text-gray-900
                           focus:ring-2 focus:ring-eg-purple focus:border-transparent
                           disabled:bg-gray-50 disabled:cursor-not-allowed transition-all
                           ${touched.block_type && errors.block_type
                             ? 'border-red-300 focus:ring-red-500'
                             : 'border-gray-300'}`}
                >
                  {BLOCK_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {touched.block_type && errors.block_type && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.block_type}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Contenido */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Contenido *
              </label>
              <textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleChange('content', e.target.value)}
                onBlur={() => handleBlur('content')}
                disabled={isLoading}
                rows={6}
                className={`w-full px-4 py-2 border rounded-lg text-gray-900 font-mono text-sm
                         focus:ring-2 focus:ring-eg-purple focus:border-transparent
                         disabled:bg-gray-50 disabled:cursor-not-allowed transition-all resize-none
                         ${touched.content && errors.content
                           ? 'border-red-300 focus:ring-red-500'
                           : 'border-gray-300'}`}
                placeholder="Ingresa el contenido del bloque..."
              />
              {touched.content && errors.content && (
                <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.content}</span>
                </div>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.content.length}/5000 caracteres
              </p>
            </div>

            {/* URL de imagen (opcional) */}
            <div>
              <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-2">
                URL de imagen (opcional)
              </label>
              <input
                type="url"
                id="image_url"
                value={formData.image_url}
                onChange={(e) => handleChange('image_url', e.target.value)}
                onBlur={() => handleBlur('image_url')}
                disabled={isLoading}
                className={`w-full px-4 py-2 border rounded-lg text-gray-900
                         focus:ring-2 focus:ring-eg-purple focus:border-transparent
                         disabled:bg-gray-50 disabled:cursor-not-allowed transition-all
                         ${touched.image_url && errors.image_url
                           ? 'border-red-300 focus:ring-red-500'
                           : 'border-gray-300'}`}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
              {touched.image_url && errors.image_url && (
                <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.image_url}</span>
                </div>
              )}
            </div>

            {/* Metadata JSON (opcional) */}
            <div>
              <label htmlFor="metadata" className="block text-sm font-medium text-gray-700 mb-2">
                Metadata JSON (opcional)
              </label>
              <textarea
                id="metadata"
                value={formData.metadata}
                onChange={(e) => handleChange('metadata', e.target.value)}
                onBlur={() => handleBlur('metadata')}
                disabled={isLoading}
                rows={4}
                className={`w-full px-4 py-2 border rounded-lg text-gray-900 font-mono text-sm
                         focus:ring-2 focus:ring-eg-purple focus:border-transparent
                         disabled:bg-gray-50 disabled:cursor-not-allowed transition-all resize-none
                         ${touched.metadata && errors.metadata
                           ? 'border-red-300 focus:ring-red-500'
                           : 'border-gray-300'}`}
                placeholder='{"key": "value"}'
              />
              {touched.metadata && errors.metadata && (
                <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.metadata}</span>
                </div>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Datos adicionales en formato JSON
              </p>
            </div>

            {/* Sort Order */}
            <div>
              <label htmlFor="sort_order" className="block text-sm font-medium text-gray-700 mb-2">
                Orden de visualización
              </label>
              <input
                type="number"
                id="sort_order"
                value={formData.sort_order}
                onChange={(e) => handleChange('sort_order', parseInt(e.target.value) || 0)}
                onBlur={() => handleBlur('sort_order')}
                disabled={isLoading}
                min="0"
                className={`w-full px-4 py-2 border rounded-lg text-gray-900
                         focus:ring-2 focus:ring-eg-purple focus:border-transparent
                         disabled:bg-gray-50 disabled:cursor-not-allowed transition-all
                         ${touched.sort_order && errors.sort_order
                           ? 'border-red-300 focus:ring-red-500'
                           : 'border-gray-300'}`}
              />
              {touched.sort_order && errors.sort_order && (
                <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.sort_order}</span>
                </div>
              )}
            </div>

            {/* Estado activo */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="text-sm font-medium text-gray-900">Estado</label>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.is_active
                    ? 'Este bloque se mostrará en la landing page'
                    : 'Este bloque estará oculto en la landing page'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleChange('is_active', !formData.is_active)}
                disabled={isLoading}
                className={`relative inline-flex h-6 w-11 items-center rounded-full
                         transition-colors focus:outline-none focus:ring-2 focus:ring-eg-purple
                         focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed
                         ${formData.is_active ? 'bg-eg-purple' : 'bg-gray-300'}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                           ${formData.is_active ? 'translate-x-6' : 'translate-x-1'}`}
                />
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4
                       flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white
                       border border-gray-300 rounded-lg hover:bg-gray-50
                       transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading || Object.keys(errors).some(key => errors[key])}
              className="px-4 py-2 text-sm font-medium text-white bg-eg-purple
                       rounded-lg hover:bg-eg-purple/90 transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white
                               rounded-full animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{contentBlock ? 'Guardar Cambios' : 'Crear Bloque'}</span>
                </>
              )}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default ContentBlockFormModal;
