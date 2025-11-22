import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { X, Save, AlertCircle } from 'lucide-react';
import IconSelector from './IconSelector';

/**
 * CertificationFormModal Component
 * Modal para crear/editar certificaciones
 *
 * @param {boolean} isOpen - Si el modal está abierto
 * @param {function} onClose - Callback para cerrar el modal
 * @param {function} onSave - Callback para guardar: (certData) => Promise
 * @param {Object} certification - Certificación a editar (null para crear nueva)
 * @param {boolean} isLoading - Estado de loading durante guardado
 */
const CertificationFormModal = ({
  isOpen,
  onClose,
  onSave,
  certification = null,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    icon_name: '',
    title: '',
    description: '',
    sort_order: 0,
    is_active: true
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (certification) {
      setFormData({
        icon_name: certification.icon_name || '',
        title: certification.title || '',
        description: certification.description || '',
        sort_order: certification.sort_order || 0,
        is_active: certification.is_active !== undefined ? certification.is_active : true
      });
    } else {
      setFormData({
        icon_name: '',
        title: '',
        description: '',
        sort_order: 0,
        is_active: true
      });
    }
    setErrors({});
    setTouched({});
  }, [certification, isOpen]);

  const validateField = (name, value) => {
    switch (name) {
      case 'icon_name':
        if (!value) return 'Debes seleccionar un icono';
        return '';

      case 'title':
        if (!value.trim()) return 'El título es requerido';
        if (value.trim().length < 3) return 'El título debe tener al menos 3 caracteres';
        if (value.trim().length > 150) return 'El título no puede superar los 150 caracteres';
        return '';

      case 'description':
        if (!value.trim()) return 'La descripción es requerida';
        if (value.trim().length < 10) return 'La descripción debe tener al menos 10 caracteres';
        if (value.trim().length > 300) return 'La descripción no puede superar los 300 caracteres';
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
      if (key !== 'is_active') {
        const error = validateField(key, formData[key]);
        if (error) newErrors[key] = error;
      }
    });
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      icon_name: true,
      title: true,
      description: true,
      sort_order: true
    });

    const newErrors = validateForm();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    await onSave(formData);
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
        <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white rounded-xl shadow-2xl
                                max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4
                       flex items-center justify-between z-10">
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              {certification ? 'Editar Certificación' : 'Nueva Certificación'}
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
            {/* IconSelector */}
            <div>
              <IconSelector
                value={formData.icon_name}
                onChange={(iconName) => handleChange('icon_name', iconName)}
                label="Icono *"
                disabled={isLoading}
              />
              {touched.icon_name && errors.icon_name && (
                <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.icon_name}</span>
                </div>
              )}
            </div>

            {/* Título */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Título *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                onBlur={() => handleBlur('title')}
                disabled={isLoading}
                className={`w-full px-4 py-2 border rounded-lg text-gray-900
                         focus:ring-2 focus:ring-eg-purple focus:border-transparent
                         disabled:bg-gray-50 disabled:cursor-not-allowed transition-all
                         ${touched.title && errors.title
                           ? 'border-red-300 focus:ring-red-500'
                           : 'border-gray-300'}`}
                placeholder="Ej: Certificado MPPS"
              />
              {touched.title && errors.title && (
                <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.title}</span>
                </div>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.title.length}/150 caracteres
              </p>
            </div>

            {/* Descripción */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Descripción *
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                onBlur={() => handleBlur('description')}
                disabled={isLoading}
                rows={3}
                className={`w-full px-4 py-2 border rounded-lg text-gray-900
                         focus:ring-2 focus:ring-eg-purple focus:border-transparent
                         disabled:bg-gray-50 disabled:cursor-not-allowed transition-all resize-none
                         ${touched.description && errors.description
                           ? 'border-red-300 focus:ring-red-500'
                           : 'border-gray-300'}`}
                placeholder="Ej: Ministerio del Poder Popular para la Salud"
              />
              {touched.description && errors.description && (
                <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.description}</span>
                </div>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.description.length}/300 caracteres
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
              <p className="mt-1 text-xs text-gray-500">
                Número menor aparece primero
              </p>
            </div>

            {/* Estado activo */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <label htmlFor="is_active" className="text-sm font-medium text-gray-900">
                  Estado
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.is_active
                    ? 'Esta certificación se mostrará en la landing page'
                    : 'Esta certificación estará oculta en la landing page'}
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
                  <span>{certification ? 'Guardar Cambios' : 'Crear Certificación'}</span>
                </>
              )}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default CertificationFormModal;
