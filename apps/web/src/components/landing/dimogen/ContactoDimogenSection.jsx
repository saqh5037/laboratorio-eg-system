import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaWhatsapp,
  FaInstagram,
  FaFacebookF,
  FaTiktok,
  FaPaperPlane,
  FaBuilding,
  FaUserMd,
  FaFlask
} from 'react-icons/fa';

/**
 * ContactoDimogenSection Component
 * Sección de contacto para Dimogen con múltiples ubicaciones
 * - Unidad de Salud Integral
 * - Ventas Dimogen (Biología Molecular)
 */
const ContactoDimogenSection = ({ section, content, companyInfo }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    servicio: '',
    mensaje: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  // Ubicación de Dimogen
  const ubicaciones = [
    {
      id: 'dimogen-principal',
      name: 'DIMOGEN',
      icon: FaFlask,
      color: '#0047CB',
      address: 'Calle Quintana Roo 78, Roma Sur, Cuauhtémoc, 06760, CDMX',
      phones: ['56 1033 5124', '56 1045 4458'],
      email: 'hola@dimogen.com.mx',
      hours: '07:30 a.m. – 07:00 p.m.',
      mapUrl: 'https://www.google.com/maps/search/?api=1&query=Calle+Quintana+Roo+78+Roma+Sur+CDMX'
    }
  ];

  // Redes sociales
  const redesSociales = [
    { icon: FaFacebookF, name: 'Facebook', url: 'https://facebook.com/dimogenlaboratorio', color: '#1877F2' },
    { icon: FaInstagram, name: 'Instagram', url: 'https://instagram.com/dimogenlab', color: '#E4405F' },
    { icon: FaTiktok, name: 'TikTok', url: 'https://tiktok.com/@dimogen.lab', color: '#000000' }
  ];

  // Opciones de servicio para el formulario
  const serviciosOpciones = [
    { value: '', label: 'Selecciona un servicio' },
    { value: 'biologia-molecular', label: 'Biología Molecular' },
    { value: 'salud-integral', label: 'Unidad de Salud Integral' },
    { value: 'microbiologia-alimentos', label: 'Microbiología de Alimentos' },
    { value: 'consulta-general', label: 'Consulta General' },
    { value: 'otro', label: 'Otro' }
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simular envío
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setSubmitStatus('success');
    setFormData({ nombre: '', email: '', telefono: '', servicio: '', mensaje: '' });

    setTimeout(() => setSubmitStatus(null), 5000);
  };

  return (
    <section
      id="contacto"
      className="relative py-24 md:py-32 bg-gradient-to-b from-white to-gray-50 overflow-hidden scroll-mt-20"
    >
      {/* Background Decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-[#0047CB]/5 to-transparent" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-[#00A3E0]/5 to-transparent" />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-6 md:px-12 lg:px-24">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-[#0047CB]/10 text-[#0047CB] rounded-full text-sm font-semibold mb-4"
                style={{ fontFamily: "'Poppins', sans-serif" }}>
            CONTACTO
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 mb-6"
              style={{ fontFamily: "'Poppins', sans-serif" }}>
            Comunícate con <span className="text-[#0047CB]">nosotros</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto"
             style={{ fontFamily: "'Poppins', sans-serif" }}>
            Estamos listos para atenderte. Elige la ubicación más conveniente para ti.
          </p>
        </motion.div>

        {/* Ubicaciones Grid - Centrado cuando solo hay 1 ubicación */}
        <div className={`grid grid-cols-1 gap-8 mb-16 ${
          ubicaciones.length === 1
            ? 'max-w-2xl mx-auto'
            : 'lg:grid-cols-2'
        }`}>
          {ubicaciones.map((ubicacion, index) => {
            const Icon = ubicacion.icon;
            return (
              <motion.div
                key={ubicacion.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100"
              >
                {/* Header */}
                <div className="p-6 md:p-8" style={{ backgroundColor: `${ubicacion.color}08` }}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                         style={{ backgroundColor: `${ubicacion.color}20` }}>
                      <Icon className="w-7 h-7" style={{ color: ubicacion.color }} />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900"
                          style={{ fontFamily: "'Poppins', sans-serif" }}>
                        {ubicacion.name}
                      </h3>
                      {ubicacion.subtitle && (
                        <span className="text-sm" style={{ color: ubicacion.color }}>
                          {ubicacion.subtitle}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8 pt-0 space-y-5">
                  {/* Address */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <FaMapMarkerAlt className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1"
                         style={{ fontFamily: "'Poppins', sans-serif" }}>
                        Dirección
                      </p>
                      <a
                        href={ubicacion.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-900 hover:text-[#0047CB] transition-colors"
                        style={{ fontFamily: "'Poppins', sans-serif" }}
                      >
                        {ubicacion.address}
                      </a>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <FaPhone className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1"
                         style={{ fontFamily: "'Poppins', sans-serif" }}>
                        Teléfonos
                      </p>
                      <div className="space-y-1">
                        {ubicacion.phones.map((phone, idx) => (
                          <a
                            key={idx}
                            href={`tel:${phone.replace(/\s/g, '')}`}
                            className="block text-gray-900 font-medium hover:text-[#0047CB] transition-colors"
                            style={{ fontFamily: "'Poppins', sans-serif" }}
                          >
                            {phone}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <FaEnvelope className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1"
                         style={{ fontFamily: "'Poppins', sans-serif" }}>
                        Email
                      </p>
                      <a
                        href={`mailto:${ubicacion.email}`}
                        className="text-[#0047CB] font-medium hover:underline"
                        style={{ fontFamily: "'Poppins', sans-serif" }}
                      >
                        {ubicacion.email}
                      </a>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <FaClock className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1"
                         style={{ fontFamily: "'Poppins', sans-serif" }}>
                        Horario
                      </p>
                      <p className="text-gray-900 font-medium"
                         style={{ fontFamily: "'Poppins', sans-serif" }}>
                        {ubicacion.hours}
                      </p>
                    </div>
                  </div>

                  {/* Map Button */}
                  <a
                    href={ubicacion.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 transition-all duration-300 font-medium"
                    style={{
                      borderColor: ubicacion.color,
                      color: ubicacion.color,
                      fontFamily: "'Poppins', sans-serif"
                    }}
                  >
                    <FaMapMarkerAlt className="w-4 h-4" />
                    Ver en Google Maps
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* WhatsApp CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex justify-center mb-16 px-4"
        >
          <a
            href="https://wa.me/525610454458"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center justify-center gap-3 sm:gap-4 px-6 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-[#25D366] to-[#128C7E]
                     text-white rounded-2xl font-semibold text-base sm:text-lg shadow-xl hover:shadow-2xl
                     hover:scale-105 transition-all duration-300 w-full sm:w-auto"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            <FaWhatsapp className="w-6 h-6 sm:w-8 sm:h-8 group-hover:rotate-12 transition-transform" />
            Escríbenos por WhatsApp
          </a>
        </motion.div>

        {/* Contact Form & Social */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-3"
          >
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-gray-100">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2"
                  style={{ fontFamily: "'Poppins', sans-serif" }}>
                Envíanos un mensaje
              </h3>
              <p className="text-gray-600 mb-8"
                 style={{ fontFamily: "'Poppins', sans-serif" }}>
                Completa el formulario y te responderemos pronto
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2"
                           style={{ fontFamily: "'Poppins', sans-serif" }}>
                      Nombre *
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0047CB] focus:outline-none transition-colors"
                      placeholder="Tu nombre"
                      style={{ fontFamily: "'Poppins', sans-serif" }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2"
                           style={{ fontFamily: "'Poppins', sans-serif" }}>
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0047CB] focus:outline-none transition-colors"
                      placeholder="Tu teléfono"
                      style={{ fontFamily: "'Poppins', sans-serif" }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2"
                         style={{ fontFamily: "'Poppins', sans-serif" }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0047CB] focus:outline-none transition-colors"
                    placeholder="tu@email.com"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2"
                         style={{ fontFamily: "'Poppins', sans-serif" }}>
                    Servicio de interés
                  </label>
                  <select
                    name="servicio"
                    value={formData.servicio}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0047CB] focus:outline-none transition-colors bg-white"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    {serviciosOpciones.map(opcion => (
                      <option key={opcion.value} value={opcion.value}>
                        {opcion.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2"
                         style={{ fontFamily: "'Poppins', sans-serif" }}>
                    Mensaje *
                  </label>
                  <textarea
                    name="mensaje"
                    value={formData.mensaje}
                    onChange={handleChange}
                    required
                    rows="4"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#0047CB] focus:outline-none transition-colors resize-none"
                    placeholder="¿En qué podemos ayudarte?"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#0047CB] text-white
                           rounded-xl font-semibold text-base hover:bg-[#0747A6] transition-all duration-300
                           disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane className="w-5 h-5" />
                      Enviar mensaje
                    </>
                  )}
                </button>

                {submitStatus === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-center"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    ¡Mensaje enviado exitosamente! Te contactaremos pronto.
                  </motion.div>
                )}
              </form>
            </div>
          </motion.div>

          {/* Social & Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-2 space-y-8"
          >
            {/* Social Media */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
              <h4 className="text-xl font-semibold text-gray-900 mb-6"
                  style={{ fontFamily: "'Poppins', sans-serif" }}>
                Síguenos en redes sociales
              </h4>
              <div className="flex flex-wrap gap-4">
                {redesSociales.map((red, index) => {
                  const Icon = red.icon;
                  return (
                    <a
                      key={index}
                      href={red.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 px-5 py-3 bg-gray-50 rounded-xl hover:shadow-lg transition-all duration-300"
                      style={{ fontFamily: "'Poppins', sans-serif" }}
                    >
                      <Icon className="w-6 h-6 transition-colors" style={{ color: red.color }} />
                      <span className="text-gray-700 font-medium group-hover:text-gray-900">
                        {red.name}
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>

            {/* General Contact */}
            <div className="bg-gradient-to-br from-[#0047CB] to-[#0747A6] rounded-3xl p-8">
              <h4 className="text-xl font-semibold text-white mb-6"
                  style={{ fontFamily: "'Poppins', sans-serif" }}>
                Contacto General
              </h4>
              <div className="space-y-4">
                <a href="tel:5610335124" className="flex items-center gap-3 text-white hover:text-white/80 transition-colors">
                  <FaPhone className="w-5 h-5" />
                  <span style={{ fontFamily: "'Poppins', sans-serif" }}>56 1033 5124</span>
                </a>
                <a href="tel:5610454458" className="flex items-center gap-3 text-white hover:text-white/80 transition-colors">
                  <FaPhone className="w-5 h-5" />
                  <span style={{ fontFamily: "'Poppins', sans-serif" }}>56 1045 4458</span>
                </a>
                <a href="mailto:hola@dimogen.com.mx" className="flex items-center gap-3 text-white hover:text-white/80 transition-colors">
                  <FaEnvelope className="w-5 h-5" />
                  <span style={{ fontFamily: "'Poppins', sans-serif" }}>hola@dimogen.com.mx</span>
                </a>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Calle+Quintana+Roo+78+Roma+Sur+CDMX"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-white hover:text-white/80 transition-colors"
                >
                  <FaMapMarkerAlt className="w-5 h-5" />
                  <span style={{ fontFamily: "'Poppins', sans-serif" }}>Quintana Roo 78, Roma Sur, CDMX</span>
                </a>
              </div>
            </div>

            {/* COFEPRIS Notice */}
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <p className="text-sm text-gray-600 text-center"
                 style={{ fontFamily: "'Poppins', sans-serif" }}>
                Aviso de publicidad COFEPRIS
                <br />
                <span className="font-medium text-gray-800">2409152002A00328</span>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactoDimogenSection;
