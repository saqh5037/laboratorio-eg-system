import React, { useState } from 'react';
import { renderIcon } from '../../../utils/iconMapper';
import {
  FaWhatsapp,
  FaMapMarkerAlt,
  FaClock,
  FaPhone,
  FaEnvelope,
  FaTruck,
  FaPaperPlane,
  FaInstagram,
  FaTwitter,
  FaFacebookF,
  FaLinkedinIn,
  FaYoutube,
  FaTiktok
} from 'react-icons/fa';

/**
 * ContactoSection Component
 * Sección completa de "Contacto" con múltiples subsecciones:
 * - Hero header
 * - Contact cards (dirección, teléfono, email, horarios, servicios, redes sociales)
 * - WhatsApp CTA
 * - Contact Center con horarios
 * - Google Maps integration
 * - Formulario de contacto con validación
 *
 * @param {Object} props
 * @param {Object} props.section - Configuración de la sección desde DB
 * @param {Object} props.content - Todo el contenido de landing
 * @param {Object} props.companyInfo - Información de la empresa
 */
const ContactoSection = ({ section, content, companyInfo }) => {
  // Extraer configuración de layout
  const layoutConfig = section.layout_config || {};
  const {
    backgroundColor = 'eg-purple',
    decorativeBlobs = true
  } = layoutConfig;

  // Extraer datos del content object
  const contactInfo = content.landing_contact_info || [];
  const contentBlocks = content.landing_content_blocks || [];

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    mensaje: ''
  });
  const [submitStatus, setSubmitStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Helper: Obtener content block por sección y tipo
  const getContentBlock = (sectionName, blockType) => {
    const block = contentBlocks.find(
      b => b.section === sectionName && b.block_type === blockType
    );
    return block ? block.content : '';
  };

  // Helper: Obtener contact info por tipo
  const getContactInfoByType = (type, category = null) => {
    return contactInfo.filter(
      c => c.type === type && (category === null || c.category === category)
    );
  };

  // Form validation function
  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'nombre':
        if (!value.trim()) {
          error = 'El nombre es requerido';
        } else if (value.trim().length < 2) {
          error = 'El nombre debe tener al menos 2 caracteres';
        }
        break;
      case 'email':
        if (!value.trim()) {
          error = 'El correo es requerido';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Por favor ingresa un correo válido';
        }
        break;
      case 'mensaje':
        if (!value.trim()) {
          error = 'El mensaje es requerido';
        } else if (value.trim().length < 10) {
          error = 'El mensaje debe tener al menos 10 caracteres';
        }
        break;
      default:
        break;
    }

    return error;
  };

  // Form handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validate in realtime if field has been touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach(field => {
      if (field !== 'telefono') {
        // telefono is optional
        const error = validateField(field, formData[field]);
        if (error) newErrors[field] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched({ nombre: true, email: true, mensaje: true });
      setSubmitStatus('error');
      return;
    }

    // Simulate API call with loading state
    setIsSubmitting(true);
    setSubmitStatus(null);

    // Simulated delay for form submission
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setSubmitStatus('success');

    setTimeout(() => {
      setFormData({ nombre: '', email: '', telefono: '', mensaje: '' });
      setErrors({});
      setTouched({});
      setSubmitStatus(null);
    }, 3000);
  };

  return (
    <section
      id={section.section_key || 'contacto'}
      className={`w-full min-h-screen bg-${backgroundColor} relative overflow-hidden scroll-mt-20`}
    >
      {/* Decorative Blobs */}
      {decorativeBlobs && (
        <>
          <div className="absolute top-0 left-0 w-[500px] h-[500px] opacity-30 pointer-events-none z-0">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <path
                fill="#DDB5D5"
                d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.5,-0.9C87,14.6,81.4,29.2,73.1,42.8C64.8,56.4,53.8,69,39.8,76.8C25.8,84.6,8.9,87.6,-6.4,86.3C-21.7,85,-43.4,79.4,-58.9,68.9C-74.4,58.4,-83.7,43,-87.7,26.4C-91.7,9.8,-90.4,-7.9,-84.3,-23.9C-78.2,-39.9,-67.3,-54.2,-53.5,-61.6C-39.7,-69,-23,-69.5,-7.6,-72.9C7.8,-76.3,30.6,-83.6,44.7,-76.4Z"
                transform="translate(100 100)"
              />
            </svg>
          </div>

          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] opacity-40 pointer-events-none z-0">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <path
                fill="#7B68A6"
                d="M41.3,-72.8C53.4,-65.3,63,-54.7,69.8,-42.4C76.6,-30.1,80.6,-15.1,81.4,0.4C82.2,15.9,79.8,31.8,72.5,45.2C65.2,58.6,53,69.5,39.1,76.2C25.2,82.9,9.6,85.4,-5.5,84.5C-20.6,83.6,-35.2,79.3,-48.3,71.6C-61.4,63.9,-73,52.8,-79.7,39.4C-86.4,26,-88.2,10.3,-86.4,-4.7C-84.6,-19.7,-79.2,-34,-70.5,-46.2C-61.8,-58.4,-49.8,-68.5,-36.6,-75.5C-23.4,-82.5,-8.8,-86.4,3.5,-84.6C15.8,-82.8,29.2,-80.3,41.3,-72.8Z"
                transform="translate(100 100)"
              />
            </svg>
          </div>
        </>
      )}

      {/* Hero Header */}
      <header className="relative z-10 w-full pt-12 pb-8 text-center px-6 md:px-12 lg:px-24">
        <div className="max-w-[1600px] mx-auto">
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-normal text-white mb-4 tracking-tight leading-none"
            style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5)' }}
          >
            {section.title || getContentBlock('contact-header', 'title') || 'CONTÁCTANOS'}
          </h1>
          <p
            className="text-lg md:text-xl lg:text-2xl text-white max-w-4xl mx-auto leading-relaxed mb-3"
            style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.7)' }}
          >
            {section.subtitle ||
              getContentBlock('contact-header', 'subtitle') ||
              'Siempre listos para ti y tu salud'}
          </p>
          <p
            className="text-base md:text-lg text-white"
            style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.7)' }}
          >
            {companyInfo?.rif && `RIF ${companyInfo.rif} · `}
            {getContentBlock('contact-header', 'badge') || 'Compromiso con la excelencia'}
          </p>
        </div>
      </header>

      {/* Contact Content */}
      <div className="relative z-10 w-full py-12 md:py-16">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-8 md:px-12 lg:px-16">
          {/* Contact Cards - Grid uniforme 2x2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-12 md:mb-16 relative z-20">
            {/* Address Card */}
            {getContactInfoByType('address').length > 0 && (
              <div className="bg-white rounded-2xl p-8 md:p-10 shadow-[0_8px_30px_rgba(123,104,166,0.12)] hover:shadow-[0_16px_50px_rgba(123,104,166,0.18)] border border-eg-purple/10 transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-5">
                  <div className="bg-gradient-to-br from-eg-purple to-eg-purple/80 rounded-2xl p-4 shadow-lg flex-shrink-0">
                    <FaMapMarkerAlt className="text-white w-8 h-8" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-2xl font-bold text-eg-purple mb-4 tracking-tight">Dirección</h3>
                    {getContactInfoByType('address').map((addr, idx) => (
                      <p key={idx} className="text-eg-dark text-lg leading-relaxed font-medium">
                        {addr.value}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Phones Card */}
            {getContactInfoByType('phone').length > 0 && (
              <div className="bg-white rounded-2xl p-8 md:p-10 shadow-[0_8px_30px_rgba(123,104,166,0.12)] hover:shadow-[0_16px_50px_rgba(123,104,166,0.18)] border border-eg-purple/10 transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-5">
                  <div className="bg-gradient-to-br from-eg-purple to-eg-purple/80 rounded-2xl p-4 shadow-lg flex-shrink-0">
                    <FaPhone className="text-white w-8 h-8" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-2xl font-bold text-eg-purple mb-4 tracking-tight">Teléfonos</h3>
                    <div className="space-y-2">
                      {getContactInfoByType('phone').map((phone, idx) => (
                        <a
                          key={idx}
                          href={`tel:${phone.value}`}
                          className="block text-eg-dark text-lg font-semibold hover:text-eg-purple transition-colors hover:translate-x-1 transform duration-200"
                        >
                          {phone.value}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Email Card */}
            <div className="bg-white rounded-2xl p-8 md:p-10 shadow-[0_8px_30px_rgba(123,104,166,0.12)] hover:shadow-[0_16px_50px_rgba(123,104,166,0.18)] border border-eg-purple/10 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start gap-5">
                <div className="bg-gradient-to-br from-eg-purple to-eg-purple/80 rounded-2xl p-4 shadow-lg flex-shrink-0">
                  <FaEnvelope className="text-white w-8 h-8" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-2xl font-bold text-eg-purple mb-4 tracking-tight">Email</h3>
                  <div className="space-y-2">
                    {getContactInfoByType('email').length > 0 ? (
                      getContactInfoByType('email').map((email, idx) => (
                        <a
                          key={idx}
                          href={`mailto:${email.value}`}
                          className="block text-eg-purple hover:text-eg-pink transition-colors font-bold text-lg underline decoration-2 underline-offset-4 break-words hover:translate-x-1 transform duration-200"
                        >
                          {email.value}
                        </a>
                      ))
                    ) : (
                      <a
                        href="mailto:contacto@microtec.com.mx"
                        className="block text-eg-purple hover:text-eg-pink transition-colors font-bold text-lg underline decoration-2 underline-offset-4 break-words hover:translate-x-1 transform duration-200"
                      >
                        contacto@microtec.com.mx
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Hours Card */}
            <div className="bg-white rounded-2xl p-8 md:p-10 shadow-[0_8px_30px_rgba(123,104,166,0.12)] hover:shadow-[0_16px_50px_rgba(123,104,166,0.18)] border border-eg-purple/10 transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-start gap-5">
                <div className="bg-gradient-to-br from-eg-purple to-eg-purple/80 rounded-2xl p-4 shadow-lg flex-shrink-0">
                  <FaClock className="text-white w-8 h-8" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-2xl font-bold text-eg-purple mb-4 tracking-tight">Horario</h3>
                  <div className="space-y-2">
                    {getContactInfoByType('hours').length > 0 ? (
                      getContactInfoByType('hours').map((hour, idx) => (
                        <p key={idx} className="text-eg-dark text-base leading-relaxed">
                          <span className="font-bold text-eg-purple">{hour.label}:</span>{' '}
                          <span className="font-medium">{hour.value}</span>
                        </p>
                      ))
                    ) : (
                      <p className="text-eg-dark text-base font-medium">
                        <span className="font-bold text-eg-purple">Lunes a Viernes:</span> 7:00 AM - 7:00 PM
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Services Section - Full width outside grid */}
          {getContactInfoByType('service').length > 0 && (
            <div className="mb-8 md:mb-12">
              <div className="bg-white rounded-2xl p-8 md:p-10 shadow-[0_8px_30px_rgba(123,104,166,0.12)] hover:shadow-[0_16px_50px_rgba(123,104,166,0.18)] border border-eg-purple/10 transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-5">
                  <div className="bg-gradient-to-br from-eg-purple to-eg-purple/80 rounded-2xl p-4 shadow-lg flex-shrink-0">
                    <FaTruck className="text-white w-8 h-8" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-2xl font-bold text-eg-purple mb-4 tracking-tight">
                      {getContactInfoByType('service')[0]?.label || 'Servicios'}
                    </h3>
                    <p className="text-eg-dark text-lg leading-relaxed font-medium">
                      {getContactInfoByType('service')[0]?.value ||
                        'Servicio de toma de muestras a domicilio disponible'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Social Media Section - Full width outside grid */}
          {getContactInfoByType('social').length > 0 && (
            <div className="mb-12 md:mb-16">
              <div className="bg-white rounded-2xl p-8 md:p-10 shadow-[0_8px_30px_rgba(123,104,166,0.12)] hover:shadow-[0_16px_50px_rgba(123,104,166,0.18)] border border-eg-purple/10 transition-all duration-300">
                <h3 className="text-2xl font-bold text-eg-purple mb-6 text-center tracking-tight">
                  Síguenos en Redes Sociales
                </h3>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  {getContactInfoByType('social').map((social, idx) => {
                    // Determinar el ícono basado en el label
                    let Icon = FaInstagram;
                    const label = social.label.toLowerCase();
                    if (label.includes('facebook')) Icon = FaFacebookF;
                    else if (label.includes('linkedin')) Icon = FaLinkedinIn;
                    else if (label.includes('youtube')) Icon = FaYoutube;
                    else if (label.includes('tiktok')) Icon = FaTiktok;
                    else if (label.includes('twitter') || label.includes('x')) Icon = FaTwitter;

                    return (
                      <a
                        key={idx}
                        href={social.value}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.label}
                        title={social.label}
                        className="group flex flex-col items-center gap-2 p-3 bg-white rounded-lg hover:bg-eg-purple hover:scale-110 transition-all duration-300 shadow-md hover:shadow-lg min-w-[80px]"
                      >
                        <Icon className="w-8 h-8 text-eg-purple group-hover:text-white transition-colors" />
                        <span className="text-xs font-medium text-eg-dark group-hover:text-white transition-colors text-center">
                          {social.label}
                        </span>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* WhatsApp CTA */}
          {(() => {
            const whatsappContact = getContactInfoByType('whatsapp')[0];
            const whatsappNumber = whatsappContact?.value || '5256112377380';
            const whatsappLabel = whatsappContact?.label || 'Escríbenos por WhatsApp';
            return (
              <div className="w-full mx-auto mb-20">
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={whatsappLabel}
                  className="group relative flex items-center justify-center gap-4 px-10 py-6 min-h-[48px]
                           bg-gradient-to-r from-eg-pink via-eg-purple to-eg-pink
                           text-white rounded-full text-xl md:text-2xl font-normal
                           shadow-[0_20px_50px_rgba(123,104,166,0.4)]
                           hover:shadow-[0_30px_70px_rgba(221,181,213,0.6)]
                           hover:scale-105 active:scale-95
                           transition-all duration-300
                           focus:outline-none focus:ring-4 focus:ring-eg-pink/50"
                >
                  <FaWhatsapp className="w-14 h-14 group-hover:rotate-12 transition-transform duration-300" />
                  <span>{whatsappLabel}</span>
                </a>
              </div>
            );
          })()}

          {/* Contact Center - Horarios */}
          {(() => {
            const hoursOptions = contactInfo.filter(
              info => info.type === 'hours' && info.category === 'contact_center'
            );

            if (hoursOptions.length === 0) return null;

            return (
              <div className="w-full mx-auto mb-20">
                <div className="bg-white rounded-3xl p-8 md:p-10 shadow-[0_10px_40px_rgba(123,104,166,0.15)] border border-eg-purple/10">
                  <div className="flex items-center justify-center gap-3 mb-8">
                    <FaClock className="w-10 h-10 text-eg-purple" />
                    <h3 className="text-3xl md:text-4xl font-normal text-eg-purple text-center">
                      Contact Center
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {hoursOptions.map((option, idx) => (
                      <div
                        key={idx}
                        className="bg-gradient-to-br from-eg-purple/5 to-eg-purple/10 rounded-xl p-4 hover:from-eg-purple/10 hover:to-eg-purple/20 transition-all duration-300 border border-eg-purple/20"
                      >
                        <div className="flex items-start gap-3">
                          {option.icon && (
                            <div className="text-eg-purple mt-1 flex-shrink-0">
                              {renderIcon(option.icon, 'w-5 h-5')}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-eg-purple font-medium text-sm mb-1">{option.label}</p>
                            <p className="text-eg-dark text-base font-normal break-words">
                              {option.value}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Google Maps */}
          {(() => {
            const address = getContactInfoByType('address')[0];
            const mapEmbed = contentBlocks.find(
              b => b.section === 'contact-map' && b.block_type === 'embed'
            );
            const addressValue = address?.value || 'MICRO-TEC Laboratorio Clínico';
            const hasMapUrl = mapEmbed?.content && mapEmbed.content.trim() !== '';

            return (
              <div className="w-full mx-auto mb-20">
                <div className="bg-white rounded-3xl p-6 shadow-[0_10px_40px_rgba(123,104,166,0.15)] border border-eg-purple/10">
                  <h3 className="text-3xl md:text-4xl font-normal text-eg-purple mb-6 text-center">
                    {getContentBlock('contact-map', 'title') || 'Nuestra Ubicación'}
                  </h3>

                  {/* Mapa o Fallback */}
                  {hasMapUrl ? (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressValue)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full h-96 rounded-xl overflow-hidden relative group cursor-pointer"
                    >
                      <iframe
                        title={`Ubicación ${addressValue}`}
                        src={mapEmbed.content}
                        width="100%"
                        height="100%"
                        style={{ border: 0, pointerEvents: 'none' }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                      <div className="absolute inset-0 bg-eg-purple/0 group-hover:bg-eg-purple/10 transition-all duration-300 flex items-center justify-center pointer-events-none">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/95 px-6 py-3 rounded-full shadow-lg">
                          <p className="text-eg-purple font-normal text-lg">
                            Click para abrir en Google Maps
                          </p>
                        </div>
                      </div>
                    </a>
                  ) : (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressValue)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full h-96 rounded-xl overflow-hidden relative bg-gradient-to-br from-eg-purple/5 to-eg-purple/10 hover:from-eg-purple/10 hover:to-eg-purple/20 transition-all duration-300 cursor-pointer group"
                    >
                      <div className="h-full flex flex-col items-center justify-center gap-4 p-6">
                        <FaMapMarkerAlt className="w-16 h-16 text-eg-purple group-hover:scale-110 transition-transform duration-300" />
                        <p className="text-eg-purple font-normal text-xl text-center">
                          Ver ubicación en Google Maps
                        </p>
                        <p className="text-eg-dark text-base text-center opacity-70">
                          {addressValue}
                        </p>
                      </div>
                    </a>
                  )}

                  <p className="text-center text-eg-dark mt-4 text-base md:text-lg">{addressValue}</p>
                </div>
              </div>
            );
          })()}

          {/* Contact Form */}
          <div className="w-full lg:max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl p-10 md:p-14 shadow-[0_20px_60px_rgba(123,104,166,0.2)] border border-eg-purple/10">
              <h3 className="text-3xl md:text-4xl font-normal text-eg-purple mb-4 leading-tight">
                {getContentBlock('contact-form', 'title') || 'Escríbenos'}
              </h3>
              <p className="text-eg-dark mb-12 text-lg md:text-xl font-normal leading-relaxed">
                {getContentBlock('contact-form', 'description') ||
                  'Completa el formulario y te responderemos pronto'}
              </p>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                  <label
                    htmlFor="nombre"
                    className="block text-eg-purple mb-3 text-xl md:text-2xl font-normal"
                  >
                    Nombre *
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    className={`w-full px-6 py-4 min-h-[48px] rounded-lg border-2 bg-white text-eg-dark text-base font-normal
                             focus:outline-none focus:ring-4 focus:ring-eg-purple/50
                             hover:border-eg-purple/50
                             placeholder:text-eg-gray/60
                             transition-all duration-300
                             ${errors.nombre && touched.nombre ? 'border-red-500 focus:border-red-500' : 'border-eg-purple/30 focus:border-eg-purple'}`}
                    placeholder="Tu nombre completo"
                  />
                  {errors.nombre && touched.nombre && (
                    <p className="mt-2 text-red-500 text-sm">{errors.nombre}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-eg-purple mb-3 text-xl md:text-2xl font-normal"
                  >
                    Correo *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    className={`w-full px-6 py-4 min-h-[48px] rounded-lg border-2 bg-white text-eg-dark text-base font-normal
                             focus:outline-none focus:ring-4 focus:ring-eg-purple/50
                             hover:border-eg-purple/50
                             placeholder:text-eg-gray/60
                             transition-all duration-300
                             ${errors.email && touched.email ? 'border-red-500 focus:border-red-500' : 'border-eg-purple/30 focus:border-eg-purple'}`}
                    placeholder="tu@email.com"
                  />
                  {errors.email && touched.email && (
                    <p className="mt-2 text-red-500 text-sm">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="mensaje"
                    className="block text-eg-purple mb-3 text-xl md:text-2xl font-normal"
                  >
                    Mensaje *
                  </label>
                  <textarea
                    id="mensaje"
                    name="mensaje"
                    value={formData.mensaje}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                    rows="6"
                    className={`w-full px-6 py-4 rounded-lg border-2 bg-white text-eg-dark text-base font-normal
                             focus:outline-none focus:ring-4 focus:ring-eg-purple/50
                             hover:border-eg-purple/50
                             placeholder:text-eg-gray/60
                             transition-all duration-300 resize-none
                             ${errors.mensaje && touched.mensaje ? 'border-red-500 focus:border-red-500' : 'border-eg-purple/30 focus:border-eg-purple'}`}
                    placeholder="¿En qué podemos ayudarte?"
                  />
                  {errors.mensaje && touched.mensaje && (
                    <p className="mt-2 text-red-500 text-sm">{errors.mensaje}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={Object.keys(errors).some(key => errors[key]) || isSubmitting}
                  className={`w-full flex items-center justify-center gap-4 px-10 py-6 min-h-[48px]
                           bg-gradient-to-r from-eg-purple to-eg-pink text-white rounded-2xl text-xl md:text-2xl font-normal
                           shadow-[0_10px_40px_rgba(123,104,166,0.3)]
                           transition-all duration-300
                           focus:outline-none focus:ring-4 focus:ring-eg-purple/50
                           ${
                             Object.keys(errors).some(key => errors[key]) || isSubmitting
                               ? 'opacity-50 cursor-not-allowed'
                               : 'hover:from-eg-pink hover:to-eg-purple hover:scale-[1.02] hover:shadow-[0_20px_60px_rgba(221,181,213,0.5)] hover:-translate-y-1 active:scale-95'
                           }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-7 h-7 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <FaPaperPlane className="w-7 h-7" />
                      <span>Enviar Mensaje</span>
                    </>
                  )}
                </button>

                {submitStatus && (
                  <div
                    role="alert"
                    className={`p-6 rounded-xl text-lg font-normal ${
                      submitStatus === 'success'
                        ? 'bg-eg-purple/20 text-eg-purple border-2 border-eg-purple/30 animate-fade-in'
                        : 'bg-eg-pink/20 text-eg-purple border-2 border-eg-pink/30 animate-shake'
                    }`}
                  >
                    {submitStatus === 'success' ? (
                      <p>✓ Mensaje enviado exitosamente. Nos pondremos en contacto contigo pronto.</p>
                    ) : (
                      <p>⚠ Por favor completa todos los campos requeridos.</p>
                    )}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactoSection;
