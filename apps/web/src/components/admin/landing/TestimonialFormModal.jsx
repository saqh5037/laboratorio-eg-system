import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { X, Save, AlertCircle, Star } from 'lucide-react';
import IconSelector from './IconSelector';

/**
 * TestimonialFormModal Component
 * Modal para crear/editar testimonios
 *
 * @param {boolean} isOpen - Si el modal está abierto
 * @param {function} onClose - Callback para cerrar el modal
 * @param {function} onSave - Callback para guardar: (testimonialData) => Promise
 * @param {Object} testimonial - Testimonio a editar (null para crear nuevo)
 * @param {boolean} isLoading - Estado de loading durante guardado
 */
const TestimonialFormModal = ({
  isOpen,
  onClose,
  onSave,
  testimonial = null,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    text: '',
    avatar_type: '',
    rating: 5,
    sort_order: 0,
    is_active: true
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (testimonial) {
      setFormData({
        name: testimonial.name || '',
        role: testimonial.role || '',
        text: testimonial.text || '',
        avatar_type: testimonial.avatar_type || '',
        rating: testimonial.rating || 5,
        sort_order: testimonial.sort_order || 0,
        is_active: testimonial.is_active !== undefined ? testimonial.is_active : true
      });
    } else {
      setFormData({
        name: '',
        role: '',
        text: '',
        avatar_type: '',
        rating: 5,
        sort_order: 0,
        is_active: true
      });
    }
    setErrors({});
    setTouched({});
  }, [testimonial, isOpen]);

  const validateField = (name, value) => {
    switch (name) {
      case 'avatar_type':
        if (!value) return 'Debes seleccionar un avatar';
        return '';

      case 'name':
        if (!value.trim()) return 'El nombre es requerido';
        if (value.trim().length < 3) return 'El nombre debe tener al menos 3 caracteres';
        if (value.trim().length > 100) return 'El nombre no puede superar los 100 caracteres';
        return '';

      case 'role':
        if (!value.trim()) return 'El rol es requerido';
        if (value.trim().length < 3) return 'El rol debe tener al menos 3 caracteres';
        if (value.trim().length > 100) return 'El rol no puede superar los 100 caracteres';
        return '';

      case 'text':
        if (!value.trim()) return 'El testimonio es requerido';
        if (value.trim().length < 20) return 'El testimonio debe tener al menos 20 caracteres';
        if (value.trim().length > 500) return 'El testimonio no puede superar los 500 caracteres';
        return '';

      case 'rating':
        if (value < 1 || value > 5) return 'La calificación debe ser entre 1 y 5';
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
      avatar_type: true,
      name: true,
      role: true,
      text: true,
      rating: true,
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
              {testimonial ? 'Editar Testimonio' : 'Nuevo Testimonio'}
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
            {/* Avatar IconSelector */}
            <div>
              <IconSelector
                value={formData.avatar_type}
                onChange={(iconName) => handleChange('avatar_type', iconName)}
                label="Avatar *"
                disabled={isLoading}
              />
              {touched.avatar_type && errors.avatar_type && (
                <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.avatar_type}</span>
                </div>
              )}
            </div>

            {/* Nombre */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del paciente *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                onBlur={() => handleBlur('name')}
                disabled={isLoading}
                className={`w-full px-4 py-2 border rounded-lg text-gray-900
                         focus:ring-2 focus:ring-eg-purple focus:border-transparent
                         disabled:bg-gray-50 disabled:cursor-not-allowed transition-all
                         ${touched.name && errors.name
                           ? 'border-red-300 focus:ring-red-500'
                           : 'border-gray-300'}`}
                placeholder="Ej: María González"
              />
              {touched.name && errors.name && (
                <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.name}</span>
                </div>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.name.length}/100 caracteres
              </p>
            </div>

            {/* Rol */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                Rol o profesión *
              </label>
              <input
                type="text"
                id="role"
                value={formData.role}
                onChange={(e) => handleChange('role', e.target.value)}
                onBlur={() => handleBlur('role')}
                disabled={isLoading}
                className={`w-full px-4 py-2 border rounded-lg text-gray-900
                         focus:ring-2 focus:ring-eg-purple focus:border-transparent
                         disabled:bg-gray-50 disabled:cursor-not-allowed transition-all
                         ${touched.role && errors.role
                           ? 'border-red-300 focus:ring-red-500'
                           : 'border-gray-300'}`}
                placeholder="Ej: Paciente satisfecho"
              />
              {touched.role && errors.role && (
                <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.role}</span>
                </div>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.role.length}/100 caracteres
              </p>
            </div>

            {/* Testimonio */}
            <div>
              <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-2">
                Testimonio *
              </label>
              <textarea
                id="text"
                value={formData.text}
                onChange={(e) => handleChange('text', e.target.value)}
                onBlur={() => handleBlur('text')}
                disabled={isLoading}
                rows={5}
                className={`w-full px-4 py-2 border rounded-lg text-gray-900
                         focus:ring-2 focus:ring-eg-purple focus:border-transparent
                         disabled:bg-gray-50 disabled:cursor-not-allowed transition-all resize-none
                         ${touched.text && errors.text
                           ? 'border-red-300 focus:ring-red-500'
                           : 'border-gray-300'}`}
                placeholder="Escribe aquí el testimonio del paciente..."
              />
              {touched.text && errors.text && (
                <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.text}</span>
                </div>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.text.length}/500 caracteres
              </p>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Calificación *
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleChange('rating', star)}
                    disabled={isLoading}
                    className={`transition-all disabled:opacity-50 disabled:cursor-not-allowed
                             ${star <= formData.rating ? 'text-yellow-400' : 'text-gray-300'}
                             hover:scale-110`}
                  >
                    <Star
                      className="w-8 h-8"
                      fill={star <= formData.rating ? 'currentColor' : 'none'}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  {formData.rating} {formData.rating === 1 ? 'estrella' : 'estrellas'}
                </span>
              </div>
              {touched.rating && errors.rating && (
                <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.rating}</span>
                </div>
              )}
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
                    ? 'Este testimonio se mostrará en la landing page'
                    : 'Este testimonio estará oculto en la landing page'}
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
                  <span>{testimonial ? 'Guardar Cambios' : 'Crear Testimonio'}</span>
                </>
              )}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default TestimonialFormModal;
