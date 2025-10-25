export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

export const validateName = (name) => {
  return name && name.trim().length >= 2;
};

export const validateMessage = (message) => {
  return message && message.trim().length >= 10;
};

export const validateForm = (formData) => {
  const errors = {};

  if (!validateName(formData.nombre)) {
    errors.nombre = 'El nombre debe tener al menos 2 caracteres';
  }

  if (!validateEmail(formData.email)) {
    errors.email = 'Por favor ingrese un email válido';
  }

  if (formData.telefono && !validatePhone(formData.telefono)) {
    errors.telefono = 'Por favor ingrese un teléfono válido';
  }

  if (!validateMessage(formData.mensaje)) {
    errors.mensaje = 'El mensaje debe tener al menos 10 caracteres';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};