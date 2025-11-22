import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { X, Save, AlertCircle } from 'lucide-react';
import IconSelector from './IconSelector';

// Tipos de información de contacto disponibles
const CONTACT_TYPES = [
  { value: 'address', label: 'Dirección' },
  { value: 'phone', label: 'Teléfono' },
  { value: 'email', label: 'Email' },
  { value: 'hours', label: 'Horario' },
  { value: 'social', label: 'Red Social' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'service', label: 'Servicio' }
];

/**
 * ContactInfoFormModal Component
 * Modal para crear/editar información de contacto
 *
 * @param {boolean} isOpen - Si el modal está abierto
 * @param {function} onClose - Callback para cerrar el modal
 * @param {function} onSave - Callback para guardar: (contactData) => Promise
 * @param {Object} contactInfo - Info de contacto a editar (null para crear nueva)
 * @param {boolean} isLoading - Estado de loading durante guardado
 */
const ContactInfoFormModal = ({
  isOpen,
  onClose,
  onSave,
  contactInfo = null,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    type: 'phone',
    category: '',
    icon_name: '',
    label: '',
    value: '',
    link: '',
    sort_order: 0,
    is_active: true
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (contactInfo) {
      setFormData({
        type: contactInfo.type || 'phone',
        category: contactInfo.category || '',
        icon_name: contactInfo.icon_name || '',
        label: contactInfo.label || '',
        value: contactInfo.value || '',
        link: contactInfo.link || '',
        sort_order: contactInfo.sort_order || 0,
        is_active: contactInfo.is_active !== undefined ? contactInfo.is_active : true
      });
    } else {
      setFormData({
        type: 'phone',
        category: '',
        icon_name: '',
        label: '',
        value: '',
        link: '',
        sort_order: 0,
        is_active: true
      });
    }
    setErrors({});
    setTouched({});
  }, [contactInfo, isOpen]);

  const validateField = (name, value) => {
    switch (name) {
      case 'type':
        if (!value) return 'El tipo es requerido';
        return '';

      case 'icon_name':
        if (!value) return 'Debes seleccionar un icono';
        return '';

      case 'label':
        if (!value.trim()) return 'La etiqueta es requerida';
        if (value.trim().length < 2) return 'La etiqueta debe tener al menos 2 caracteres';
        if (value.trim().length > 100) return 'La etiqueta no puede superar los 100 caracteres';
        return '';

      case 'value':
        if (!value.trim()) return 'El valor es requerido';
        if (value.trim().length < 2) return 'El valor debe tener al menos 2 caracteres';
        if (value.trim().length > 500) return 'El valor no puede superar los 500 caracteres';

        // Validaciones específicas por tipo
        if (formData.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'El email no tiene un formato válido';
        }

        return '';

      case 'link':
        // Link es opcional, pero si existe debe ser una URL válida
        if (value.trim() && !/^https?:\/\/.+/.test(value)) {
          return 'El link debe ser una URL válida (http:// o https://)';
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
    // Solo validar campos requeridos
    ['type', 'icon_name', 'label', 'value'].forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    // Validar link si existe
    if (formData.link) {
      const linkError = validateField('link', formData.link);
      if (linkError) newErrors.link = linkError;
    }

    // Validar sort_order
    const sortError = validateField('sort_order', formData.sort_order);
    if (sortError) newErrors.sort_order = sortError;

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      type: true,
      icon_name: true,
      label: true,
      value: true,
      link: true,
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

  // Placeholder dinámico según tipo
  const getValuePlaceholder = () => {
    switch (formData.type) {
      case 'address':
        return 'Ej: Av. Libertador, Edf. Majestic, Piso 1...';
      case 'phone':
        return 'Ej: +58 212 762.0561';
      case 'email':
        return 'Ej: info@laboratorioeg.com';
      case 'hours':
        return 'Ej: Lun-Vie 7:00-16:00';
      case 'social':
        return 'Ej: @laboratorioeg';
      case 'whatsapp':
        return 'Ej: +58 424 1440798';
      case 'service':
        return 'Ej: Servicio de toma de muestras a domicilio';
      default:
        return 'Ingresa el valor...';
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
              {contactInfo ? 'Editar Información de Contacto' : 'Nueva Información de Contacto'}
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
            {/* Tipo */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                Tipo *
              </label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                onBlur={() => handleBlur('type')}
                disabled={isLoading}
                className={`w-full px-4 py-2 border rounded-lg text-gray-900
                         focus:ring-2 focus:ring-eg-purple focus:border-transparent
                         disabled:bg-gray-50 disabled:cursor-not-allowed transition-all
                         ${touched.type && errors.type
                           ? 'border-red-300 focus:ring-red-500'
                           : 'border-gray-300'}`}
              >
                {CONTACT_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {touched.type && errors.type && (
                <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.type}</span>
                </div>
              )}
            </div>

            {/* Categoría (opcional) */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Categoría (opcional)
              </label>
              <input
                type="text"
                id="category"
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                disabled={isLoading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900
                         focus:ring-2 focus:ring-eg-purple focus:border-transparent
                         disabled:bg-gray-50 disabled:cursor-not-allowed transition-all"
                placeholder="Ej: principal, secundario, etc."
              />
              <p className="mt-1 text-xs text-gray-500">
                Categoría para agrupar items del mismo tipo
              </p>
            </div>

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

            {/* Etiqueta */}
            <div>
              <label htmlFor="label" className="block text-sm font-medium text-gray-700 mb-2">
                Etiqueta *
              </label>
              <input
                type="text"
                id="label"
                value={formData.label}
                onChange={(e) => handleChange('label', e.target.value)}
                onBlur={() => handleBlur('label')}
                disabled={isLoading}
                className={`w-full px-4 py-2 border rounded-lg text-gray-900
                         focus:ring-2 focus:ring-eg-purple focus:border-transparent
                         disabled:bg-gray-50 disabled:cursor-not-allowed transition-all
                         ${touched.label && errors.label
                           ? 'border-red-300 focus:ring-red-500'
                           : 'border-gray-300'}`}
                placeholder="Ej: Teléfono Principal"
              />
              {touched.label && errors.label && (
                <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.label}</span>
                </div>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.label.length}/100 caracteres
              </p>
            </div>

            {/* Valor */}
            <div>
              <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-2">
                Valor *
              </label>
              <textarea
                id="value"
                value={formData.value}
                onChange={(e) => handleChange('value', e.target.value)}
                onBlur={() => handleBlur('value')}
                disabled={isLoading}
                rows={3}
                className={`w-full px-4 py-2 border rounded-lg text-gray-900
                         focus:ring-2 focus:ring-eg-purple focus:border-transparent
                         disabled:bg-gray-50 disabled:cursor-not-allowed transition-all resize-none
                         ${touched.value && errors.value
                           ? 'border-red-300 focus:ring-red-500'
                           : 'border-gray-300'}`}
                placeholder={getValuePlaceholder()}
              />
              {touched.value && errors.value && (
                <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.value}</span>
                </div>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.value.length}/500 caracteres
              </p>
            </div>

            {/* Link (opcional) */}
            <div>
              <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-2">
                Link (opcional)
              </label>
              <input
                type="url"
                id="link"
                value={formData.link}
                onChange={(e) => handleChange('link', e.target.value)}
                onBlur={() => handleBlur('link')}
                disabled={isLoading}
                className={`w-full px-4 py-2 border rounded-lg text-gray-900
                         focus:ring-2 focus:ring-eg-purple focus:border-transparent
                         disabled:bg-gray-50 disabled:cursor-not-allowed transition-all
                         ${touched.link && errors.link
                           ? 'border-red-300 focus:ring-red-500'
                           : 'border-gray-300'}`}
                placeholder="https://ejemplo.com"
              />
              {touched.link && errors.link && (
                <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.link}</span>
                </div>
              )}
              <p className="mt-1 text-xs text-gray-500">
                URL completa para enlaces externos (redes sociales, WhatsApp, etc.)
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
                    ? 'Esta información se mostrará en la landing page'
                    : 'Esta información estará oculta en la landing page'}
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
                  <span>{contactInfo ? 'Guardar Cambios' : 'Crear Información'}</span>
                </>
              )}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default ContactInfoFormModal;
