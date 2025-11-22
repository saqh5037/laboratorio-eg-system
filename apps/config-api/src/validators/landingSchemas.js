const Joi = require('joi');

/**
 * Schemas de validación para Landing Content CMS
 * Usando Joi para validar datos de entrada y prevenir data corruption/XSS
 */

// Schema para Values (Valores corporativos)
const valueSchema = Joi.object({
  icon_name: Joi.string().max(50).required().messages({
    'string.empty': 'El nombre del ícono es requerido',
    'string.max': 'El nombre del ícono no puede exceder 50 caracteres',
    'any.required': 'El nombre del ícono es requerido'
  }),
  title: Joi.string().max(200).required().messages({
    'string.empty': 'El título es requerido',
    'string.max': 'El título no puede exceder 200 caracteres',
    'any.required': 'El título es requerido'
  }),
  description: Joi.string().max(1000).required().messages({
    'string.empty': 'La descripción es requerida',
    'string.max': 'La descripción no puede exceder 1000 caracteres',
    'any.required': 'La descripción es requerida'
  }),
  sort_order: Joi.number().integer().min(0).default(0).messages({
    'number.base': 'El orden debe ser un número',
    'number.integer': 'El orden debe ser un número entero',
    'number.min': 'El orden no puede ser negativo'
  }),
  is_active: Joi.boolean().default(true)
});

// Schema para Certifications (Certificaciones)
const certificationSchema = Joi.object({
  icon_name: Joi.string().max(50).required().messages({
    'string.empty': 'El nombre del ícono es requerido',
    'string.max': 'El nombre del ícono no puede exceder 50 caracteres'
  }),
  title: Joi.string().max(200).required().messages({
    'string.empty': 'El título es requerido',
    'string.max': 'El título no puede exceder 200 caracteres'
  }),
  description: Joi.string().max(1000).required().messages({
    'string.empty': 'La descripción es requerida',
    'string.max': 'La descripción no puede exceder 1000 caracteres'
  }),
  sort_order: Joi.number().integer().min(0).default(0),
  is_active: Joi.boolean().default(true)
});

// Schema para Testimonials (Testimonios)
const testimonialSchema = Joi.object({
  name: Joi.string().max(200).required().messages({
    'string.empty': 'El nombre es requerido',
    'string.max': 'El nombre no puede exceder 200 caracteres'
  }),
  role: Joi.string().max(200).allow('', null).messages({
    'string.max': 'El rol no puede exceder 200 caracteres'
  }),
  text: Joi.string().max(2000).required().messages({
    'string.empty': 'El testimonio es requerido',
    'string.max': 'El testimonio no puede exceder 2000 caracteres'
  }),
  avatar_type: Joi.string().max(50).default('FaUser'),
  rating: Joi.number().integer().min(1).max(5).default(5).messages({
    'number.base': 'La calificación debe ser un número',
    'number.integer': 'La calificación debe ser un número entero',
    'number.min': 'La calificación debe ser al menos 1',
    'number.max': 'La calificación no puede exceder 5'
  }),
  sort_order: Joi.number().integer().min(0).default(0),
  is_active: Joi.boolean().default(true)
});

// Schema para Contact Info (Información de contacto)
const contactInfoSchema = Joi.object({
  type: Joi.string().valid('address', 'phone', 'email', 'hours', 'social', 'whatsapp', 'service').required().messages({
    'any.only': 'El tipo debe ser uno de: address, phone, email, hours, social, whatsapp, service',
    'any.required': 'El tipo es requerido'
  }),
  category: Joi.string().max(100).allow('', null),
  icon_name: Joi.string().max(50).allow('', null),
  label: Joi.string().max(200).required().messages({
    'string.empty': 'La etiqueta es requerida',
    'string.max': 'La etiqueta no puede exceder 200 caracteres'
  }),
  value: Joi.string().max(500).required().messages({
    'string.empty': 'El valor es requerido',
    'string.max': 'El valor no puede exceder 500 caracteres'
  }),
  link: Joi.string().uri().max(500).allow('', null).messages({
    'string.uri': 'El enlace debe ser una URL válida',
    'string.max': 'El enlace no puede exceder 500 caracteres'
  }),
  sort_order: Joi.number().integer().min(0).default(0),
  is_active: Joi.boolean().default(true)
});

// Schema para Content Blocks (Bloques de contenido)
const contentBlockSchema = Joi.object({
  section: Joi.string().max(100).required().messages({
    'string.empty': 'La sección es requerida',
    'string.max': 'La sección no puede exceder 100 caracteres'
  }),
  block_type: Joi.string().max(50).required().messages({
    'string.empty': 'El tipo de bloque es requerido',
    'string.max': 'El tipo de bloque no puede exceder 50 caracteres'
  }),
  content: Joi.string().max(5000).required().messages({
    'string.empty': 'El contenido es requerido',
    'string.max': 'El contenido no puede exceder 5000 caracteres'
  }),
  image_url: Joi.string().uri().max(500).allow('', null).messages({
    'string.uri': 'La URL de imagen debe ser válida',
    'string.max': 'La URL de imagen no puede exceder 500 caracteres'
  }),
  metadata: Joi.object().allow(null),
  sort_order: Joi.number().integer().min(0).default(0),
  is_active: Joi.boolean().default(true)
});

// Schema para Statistics (Estadísticas CTA)
const statisticSchema = Joi.object({
  section: Joi.string().max(100).default('cta'),
  label: Joi.string().max(200).required().messages({
    'string.empty': 'La etiqueta es requerida',
    'string.max': 'La etiqueta no puede exceder 200 caracteres'
  }),
  value: Joi.string().max(100).required().messages({
    'string.empty': 'El valor es requerido',
    'string.max': 'El valor no puede exceder 100 caracteres'
  }),
  description: Joi.string().max(500).allow('', null).messages({
    'string.max': 'La descripción no puede exceder 500 caracteres'
  }),
  icon_name: Joi.string().max(50).allow('', null),
  sort_order: Joi.number().integer().min(0).default(0),
  is_active: Joi.boolean().default(true)
});

/**
 * Middleware de validación genérico
 * @param {Joi.Schema} schema - Schema de Joi para validar
 * @returns {Function} Middleware de Express
 */
function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Retornar todos los errores, no solo el primero
      stripUnknown: true // Remover campos desconocidos
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        error: 'Validación fallida',
        errors
      });
    }

    // Reemplazar req.body con los valores validados y sanitizados
    req.body = value;
    next();
  };
}

module.exports = {
  valueSchema,
  certificationSchema,
  testimonialSchema,
  contactInfoSchema,
  contentBlockSchema,
  statisticSchema,
  validate
};
