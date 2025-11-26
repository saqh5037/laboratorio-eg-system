import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaQuestionCircle,
  FaChevronDown,
  FaPhoneAlt,
  FaWhatsapp,
  FaEnvelope
} from 'react-icons/fa';

/**
 * FAQSection Component
 * Preguntas frecuentes para la landing de Dimogen
 * Recibe FAQs dinámicas desde la API
 */
const FAQSection = ({ faqs: propsFaqs = [], contact = [], loading = false }) => {
  // -1 significa que todos los acordeones inician cerrados
  const [openIndex, setOpenIndex] = useState(-1);

  // Use props FAQs or fallback to empty array
  const faqs = propsFaqs.length > 0 ? propsFaqs : [];

  // Get contact info helpers
  const getPhone = () => {
    const phone = contact.find(c => c.type === 'phone');
    return phone?.link || 'tel:5610335124';
  };

  const getWhatsApp = () => {
    const wa = contact.find(c => c.type === 'whatsapp');
    return wa?.link || 'https://wa.me/525610454458';
  };

  const getEmail = () => {
    const email = contact.find(c => c.type === 'email');
    return email?.link || 'mailto:hola@dimogen.com.mx';
  };

  // If loading or no FAQs, show placeholder
  if (loading || faqs.length === 0) {
    return (
      <section id="faq" className="relative py-24 md:py-32 bg-white overflow-hidden scroll-mt-20">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 lg:px-24 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section
      id="faq"
      className="relative py-24 md:py-32 bg-white overflow-hidden scroll-mt-20"
    >
      {/* Background con elementos animados */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-[#0047CB]/5 to-transparent rounded-full"
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-[#98CB59]/5 to-transparent rounded-full"
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        {/* Diamantes flotantes sutiles */}
        <motion.div
          className="absolute top-1/4 left-[10%] w-8 h-8 bg-[#0047CB]/8 hidden lg:block"
          style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
          animate={{ y: [0, -15, 0], rotate: [45, 50, 45] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/4 right-[15%] w-6 h-6 bg-[#00A3E0]/8 hidden lg:block"
          style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
          animate={{ y: [0, 12, 0], rotate: [45, 40, 45] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        />
      </div>

      <div className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-12 lg:px-24">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-[#0047CB]/10 rounded-full mb-6">
            <FaQuestionCircle className="w-5 h-5 text-[#0047CB]" />
            <span className="text-[#0047CB] font-semibold"
                  style={{ fontFamily: "'Poppins', sans-serif" }}>
              PREGUNTAS FRECUENTES
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 mb-6"
              style={{ fontFamily: "'Poppins', sans-serif" }}>
            ¿Tienes dudas?
          </h2>

          <p className="text-lg text-gray-700 max-w-2xl mx-auto"
             style={{ fontFamily: "'Poppins', sans-serif" }}>
            Encuentra respuestas a las preguntas más comunes sobre nuestros servicios
          </p>
        </motion.div>

        {/* FAQ Accordion con animaciones mejoradas */}
        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="mb-4"
            >
              <motion.button
                onClick={() => toggleFAQ(index)}
                className={`w-full flex items-center justify-between p-5 rounded-xl text-left transition-colors duration-300 ${
                  openIndex === index
                    ? 'bg-[#0047CB] text-white shadow-lg'
                    : 'bg-gray-50 text-gray-900'
                }`}
                whileHover={{
                  scale: openIndex === index ? 1 : 1.01,
                  backgroundColor: openIndex === index ? '#0047CB' : '#f3f4f6',
                  boxShadow: openIndex === index
                    ? '0 10px 30px rgba(0,71,203,0.3)'
                    : '0 4px 15px rgba(0,0,0,0.05)'
                }}
                whileTap={{ scale: 0.99 }}
              >
                <span className="font-medium pr-4"
                      style={{ fontFamily: "'Poppins', sans-serif" }}>
                  {faq.question}
                </span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
                >
                  <FaChevronDown className="w-5 h-5 flex-shrink-0" />
                </motion.div>
              </motion.button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{
                      height: { duration: 0.4, type: 'spring', stiffness: 100, damping: 15 },
                      opacity: { duration: 0.3 }
                    }}
                    className="overflow-hidden"
                  >
                    <motion.div
                      className="p-5 bg-white border border-gray-100 border-t-0 rounded-b-xl shadow-sm"
                      initial={{ y: -10 }}
                      animate={{ y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                    >
                      <p className="text-gray-700 leading-relaxed"
                         style={{ fontFamily: "'Poppins', sans-serif" }}>
                        {faq.answer}
                      </p>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8 md:p-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-4"
                style={{ fontFamily: "'Poppins', sans-serif" }}>
              ¿No encontraste lo que buscabas?
            </h3>
            <p className="text-gray-700 mb-8"
               style={{ fontFamily: "'Poppins', sans-serif" }}>
              Nuestro equipo está listo para resolver todas tus dudas
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4">
              <motion.a
                href={getPhone()}
                className="inline-flex items-center justify-center gap-2 sm:gap-3 px-5 sm:px-6 py-3 bg-[#0047CB] text-white rounded-xl
                         font-medium text-sm sm:text-base shadow-md"
                style={{ fontFamily: "'Poppins', sans-serif" }}
                whileHover={{ scale: 1.05, boxShadow: '0 15px 30px rgba(0,71,203,0.3)' }}
                whileTap={{ scale: 0.98 }}
              >
                <FaPhoneAlt className="w-4 h-4" />
                Llamar ahora
              </motion.a>

              <motion.a
                href={getWhatsApp()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 sm:gap-3 px-5 sm:px-6 py-3 bg-[#25D366] text-white rounded-xl
                         font-medium text-sm sm:text-base shadow-md"
                style={{ fontFamily: "'Poppins', sans-serif" }}
                whileHover={{ scale: 1.05, boxShadow: '0 15px 30px rgba(37,211,102,0.3)' }}
                whileTap={{ scale: 0.98 }}
              >
                <FaWhatsapp className="w-5 h-5" />
                WhatsApp
              </motion.a>

              <motion.a
                href={getEmail()}
                className="inline-flex items-center justify-center gap-2 sm:gap-3 px-5 sm:px-6 py-3 bg-white text-gray-700 rounded-xl
                         font-medium text-sm sm:text-base shadow-md border border-gray-200"
                style={{ fontFamily: "'Poppins', sans-serif" }}
                whileHover={{ scale: 1.05, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
                whileTap={{ scale: 0.98 }}
              >
                <FaEnvelope className="w-4 h-4" />
                Email
              </motion.a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
