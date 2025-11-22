import React from 'react';
/* eslint-disable-next-line no-unused-vars */
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaWhatsapp, FaHeartbeat } from 'react-icons/fa';
import { useLandingContent } from '../../hooks/useLandingContent';

const CTASectionEG = () => {
  const {
    statistics,
    contentBlocks,
    contactInfo,
    loading
  } = useLandingContent();

  // Helper to get content block
  const getContentBlock = (section, blockType) => {
    const block = contentBlocks.find(b => b.section === section && b.block_type === blockType);
    return block ? block.content : '';
  };

  // Get WhatsApp contact info
  const whatsappContact = contactInfo.find(c => c.type === 'whatsapp');
  const whatsappNumber = whatsappContact?.value || '584149019327';

  // Loading state
  if (loading) {
    return (
      <section className="relative py-20 bg-gradient-to-b from-eg-light-gray to-white overflow-hidden">
        <div className="container mx-auto px-4 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-eg-purple border-t-transparent"></div>
            <p className="text-gray-600 mt-4">Cargando...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-20 bg-gradient-to-b from-eg-light-gray to-white overflow-hidden">
      {/* Decorative Elements - Directorio Style */}
      <div className="absolute top-20 left-20 w-40 h-40 bg-eg-pink/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-60 h-60 bg-eg-purple/10 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-eg-purple to-eg-pink
                     rounded-full mb-6 shadow-[0_8px_24px_rgba(123,104,166,0.3)]"
          >
            <FaHeartbeat className="text-white text-3xl" />
          </motion.div>

          {/* Title - Dynamic from CMS */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-normal text-eg-purple mb-6">
            {getContentBlock('cta-section', 'title') || '¿Listo para cuidar tu salud?'}
          </h2>

          {/* Description - Dynamic from CMS */}
          <p className="text-lg text-eg-gray mb-10 max-w-2xl mx-auto leading-relaxed">
            {getContentBlock('cta-section', 'description') ||
            'Agenda tu cita hoy y recibe atención personalizada de nuestro equipo de profesionales.'}
          </p>

          {/* Stats - Directorio Style - Dynamic from API */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
            {statistics.length > 0 ? (
              statistics.slice(0, 3).map((stat, index) => (
                <motion.div
                  key={stat.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (index + 1) * 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-[0_4px_12px_rgba(123,104,166,0.1)]"
                >
                  <div className="text-3xl font-light text-eg-purple mb-2">{stat.value}</div>
                  <div className="text-sm text-eg-gray">{stat.label}</div>
                </motion.div>
              ))
            ) : null}
          </div>

          {/* CTA Buttons - Directorio Style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/contacto"
              className="inline-flex items-center justify-center gap-2 px-8 py-3
                       bg-eg-purple text-white rounded-lg font-medium
                       hover:bg-eg-purple/90 shadow-[0_4px_12px_rgba(123,104,166,0.2)]
                       hover:shadow-[0_8px_24px_rgba(123,104,166,0.3)]
                       transition-all transform hover:scale-105"
            >
              <FaCalendarAlt />
              {getContentBlock('cta-section', 'cta1-text') || 'Agendar Cita Ahora'}
            </Link>

            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-3
                       bg-white text-eg-purple border-2 border-eg-purple rounded-lg
                       font-medium hover:bg-eg-purple hover:text-white
                       shadow-[0_4px_12px_rgba(123,104,166,0.1)]
                       hover:shadow-[0_8px_24px_rgba(123,104,166,0.2)]
                       transition-all transform hover:scale-105"
            >
              <FaWhatsapp />
              {getContentBlock('cta-section', 'cta2-text') || 'Consulta por WhatsApp'}
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASectionEG;