import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { renderIcon } from '../../../utils/iconMapper';
import { LOGO_SPECS } from '../../../constants/brandDesignSystem';

// Constantes de estilos reutilizables (mantenemos consistencia)
const CARD_STYLES = "bg-white rounded-2xl p-6 md:p-8 shadow-[0_10px_40px_rgba(123,104,166,0.15)] hover:shadow-[0_20px_60px_rgba(123,104,166,0.25)] hover:scale-[1.03] hover:-translate-y-3 border border-eg-purple/10 transition-all duration-500 ease-out";
const ICON_WRAPPER_STYLES = "bg-gradient-to-br from-eg-purple/20 to-eg-pink/20 rounded-full p-5 border-2 border-eg-purple/30 shadow-md hover:shadow-lg hover:scale-110 hover:rotate-6 transition-all duration-300";

/**
 * NosotrosSection Component
 * Sección completa de "Nosotros" con múltiples subsecciones:
 * - Hero header
 * - Historia (two-column grid con imagen)
 * - Valores corporativos (grid de 5 columnas)
 * - Propósito (tarjeta destacada)
 *
 * @param {Object} props
 * @param {Object} props.section - Configuración de la sección desde DB
 * @param {Object} props.content - Todo el contenido de landing
 */
const NosotrosSection = ({ section, content }) => {
  // Parallax hooks
  const sectionRef = useRef(null);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 800], [0, 120]);
  const y2 = useTransform(scrollY, [0, 800], [0, 60]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0.8]);
  const scale = useTransform(scrollY, [0, 400], [1, 1.05]);

  // Extraer configuración de layout (si existe)
  const layoutConfig = section.layout_config || {};
  const {
    backgroundColor = 'eg-purple',
    decorativeBlobs = true
  } = layoutConfig;

  // Extraer datos del content object
  const values = content.landing_values || [];
  const contentBlocks = content.landing_content_blocks || [];

  // Helper: Obtener content block por sección y tipo
  const getContentBlock = (sectionName, blockType) => {
    const block = contentBlocks.find(
      b => b.section === sectionName && b.block_type === blockType
    );
    return block ? block.content : '';
  };

  // Helper: Obtener todos los content blocks de una sección
  const getContentBlocksBySection = (sectionName) => {
    return contentBlocks
      .filter(b => b.section === sectionName)
      .sort((a, b) => a.sort_order - b.sort_order);
  };

  // Extraer datos dinámicos para el header
  const nosotrosHeader = {
    title: getContentBlock('nosotros-header', 'title') || 'NUESTRA HISTORIA',
    subtitle: getContentBlock('nosotros-header', 'subtitle') || '#PorLaSaludDelPaciente',
    badge: getContentBlock('nosotros-header', 'badge') || 'Compromiso con la excelencia'
  };

  // Extraer datos dinámicos para Historia
  const historiaParagraphs = getContentBlocksBySection('historia')
    .filter(b => b.block_type === 'paragraph');
  const historiaTitle = getContentBlock('historia', 'title') || 'Desde 1992';
  const historiaImage = contentBlocks.find(
    b => b.section === 'historia' && b.block_type === 'image'
  );
  const historiaBadge = getContentBlock('historia', 'badge') || 'Compromiso con la excelencia';

  // Mapear valores con iconos renderizados dinámicamente
  const valuesWithIcons = values.map(value => ({
    ...value,
    icon: renderIcon(value.icon_name, 'text-eg-purple w-12 h-12')
  }));

  return (
    <section
      ref={sectionRef}
      id={section.section_key || 'nosotros'}
      className={`w-full min-h-screen bg-${backgroundColor} relative overflow-hidden`}
    >
      {/* Decorative Blobs with Parallax */}
      {decorativeBlobs && (
        <>
          <motion.div
            style={{ y: y1, scale }}
            className="absolute top-0 left-0 w-[500px] h-[500px] opacity-30 pointer-events-none z-0"
          >
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <path
                fill="#DDB5D5"
                d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.5,-0.9C87,14.6,81.4,29.2,73.1,42.8C64.8,56.4,53.8,69,39.8,76.8C25.8,84.6,8.9,87.6,-6.4,86.3C-21.7,85,-43.4,79.4,-58.9,68.9C-74.4,58.4,-83.7,43,-87.7,26.4C-91.7,9.8,-90.4,-7.9,-84.3,-23.9C-78.2,-39.9,-67.3,-54.2,-53.5,-61.6C-39.7,-69,-23,-69.5,-7.6,-72.9C7.8,-76.3,30.6,-83.6,44.7,-76.4Z"
                transform="translate(100 100)"
              />
            </svg>
          </motion.div>

          <motion.div
            style={{ y: y2, opacity }}
            className="absolute bottom-0 right-0 w-[600px] h-[600px] opacity-40 pointer-events-none z-0"
          >
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <path
                fill="#7B68A6"
                d="M41.3,-72.8C53.4,-65.3,63,-54.7,69.8,-42.4C76.6,-30.1,80.6,-15.1,81.4,0.4C82.2,15.9,79.8,31.8,72.5,45.2C65.2,58.6,53,69.5,39.1,76.2C25.2,82.9,9.6,85.4,-5.5,84.5C-20.6,83.6,-35.2,79.3,-48.3,71.6C-61.4,63.9,-73,52.8,-79.7,39.4C-86.4,26,-88.2,10.3,-86.4,-4.7C-84.6,-19.7,-79.2,-34,-70.5,-46.2C-61.8,-58.4,-49.8,-68.5,-36.6,-75.5C-23.4,-82.5,-8.8,-86.4,3.5,-84.6C15.8,-82.8,29.2,-80.3,41.3,-72.8Z"
                transform="translate(100 100)"
              />
            </svg>
          </motion.div>

          {/* Floating decorative elements */}
          <motion.div
            className="absolute top-1/4 right-[15%] w-16 h-16 bg-eg-pink/20 rounded-full blur-xl hidden lg:block"
            animate={{ y: [0, -20, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-1/3 left-[10%] w-12 h-12 bg-eg-purple/20 rounded-full blur-lg hidden lg:block"
            animate={{ y: [0, 15, 0], scale: [1.1, 1, 1.1] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />
          <motion.div
            className="absolute top-1/2 right-[8%] w-8 h-8 bg-white/30 rounded-full hidden lg:block"
            animate={{ y: [0, -12, 0], x: [0, 5, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          />
        </>
      )}

      {/* Hero Header with animations */}
      <header className="relative z-10 w-full pt-12 pb-8 text-center px-6 md:px-12 lg:px-24">
        <div className="max-w-[1600px] mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl lg:text-6xl font-normal text-white mb-4 tracking-tight leading-none"
            style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5)' }}
          >
            {section.title || nosotrosHeader.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl lg:text-2xl text-white max-w-4xl mx-auto leading-relaxed mb-3"
            style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.7)' }}
          >
            {section.subtitle || nosotrosHeader.subtitle}
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-base md:text-lg text-white"
            style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.7)' }}
          >
            RIF {LOGO_SPECS.rif} · {nosotrosHeader.badge}
          </motion.p>
        </div>
      </header>

      {/* Historia - Two Column Grid */}
      <div id="historia" className="relative z-10 w-full py-8 md:py-12 scroll-mt-20">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 mb-12">
            {/* Content Card with enhanced animations */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              whileHover={{ y: -8, boxShadow: '0 25px 70px rgba(123,104,166,0.3)' }}
              className={`${CARD_STYLES} rounded-3xl p-10 md:p-14`}
            >
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-3xl md:text-4xl font-normal text-eg-purple mb-6 leading-tight"
              >
                {historiaTitle}
              </motion.h2>
              {historiaParagraphs.map((paragraph, index) => (
                <motion.p
                  key={index}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className="text-eg-dark mb-6 text-lg md:text-xl font-normal leading-relaxed last:mb-0"
                >
                  {paragraph.content}
                </motion.p>
              ))}
            </motion.div>

            {/* Image Card with enhanced animations */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative group"
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.4 }}
                className="w-full h-full min-h-[400px] rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(123,104,166,0.3)] border-4 border-eg-pink/20"
              >
                <motion.img
                  src={
                    historiaImage?.image_url ||
                    'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=800&h=600&fit=crop'
                  }
                  alt={historiaImage?.content || 'Equipo del laboratorio'}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.7 }}
                />
              </motion.div>
              <motion.div
                initial={{ rotate: -5, scale: 0.9, opacity: 0 }}
                whileInView={{ rotate: -5, scale: 1, opacity: 1 }}
                whileHover={{ rotate: 0, scale: 1.05 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3, type: 'spring', stiffness: 200 }}
                className="absolute -bottom-6 -left-6 bg-gradient-to-r from-eg-purple to-eg-pink text-white px-8 py-6 rounded-2xl shadow-2xl"
              >
                {historiaBadge.split(' ').length > 2 ? (
                  <>
                    <span className="text-4xl font-normal block">
                      {historiaBadge.split(' ').slice(0, 2).join(' ')}
                    </span>
                    <span className="text-lg font-normal block mt-1">
                      {historiaBadge.split(' ').slice(2).join(' ')}
                    </span>
                  </>
                ) : (
                  <span className="text-4xl font-normal block">{historiaBadge}</span>
                )}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Valores Corporativos - Grid de 5 columnas */}
      <div id="valores" className="relative z-10 w-full py-8 md:py-12 bg-gradient-to-b from-white via-eg-pink/20 to-eg-purple/15 overflow-hidden scroll-mt-20">
        {/* Decorative floating elements for this section */}
        <motion.div
          className="absolute top-20 left-[5%] w-10 h-10 bg-eg-purple/10 rounded-full blur-lg hidden lg:block"
          animate={{ y: [0, -15, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-20 right-[8%] w-14 h-14 bg-eg-pink/15 rounded-full blur-xl hidden lg:block"
          animate={{ y: [0, 20, 0], scale: [1.1, 1, 1.1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />

        <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8"
          >
            <motion.h2
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-3xl md:text-4xl font-normal text-eg-purple mb-4 leading-tight"
            >
              Nuestros Valores
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg md:text-xl text-eg-dark max-w-3xl mx-auto leading-relaxed"
            >
              Los principios que nos guían cada día
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8">
            {valuesWithIcons.map((value, index) => (
              <motion.div
                key={value.id || index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10, boxShadow: '0 25px 60px rgba(123,104,166,0.25)' }}
                className={`value-card ${CARD_STYLES} text-center`}
              >
                <motion.div
                  className={`${ICON_WRAPPER_STYLES} inline-flex mb-6`}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3 + index * 0.5, repeat: Infinity, ease: 'easeInOut' }}
                  whileHover={{ scale: 1.15, rotate: 10 }}
                >
                  {value.icon}
                </motion.div>
                <h3 className="text-2xl font-normal text-eg-purple mb-3 leading-tight">
                  {value.title}
                </h3>
                <p className="text-eg-dark text-base font-normal leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Propósito - Tarjeta destacada */}
      <div className="relative z-10 w-full py-20 md:py-24 bg-gradient-to-br from-eg-purple/43 via-eg-pink/28 to-eg-purple/38 overflow-hidden">
        {/* Floating decorative elements */}
        <motion.div
          className="absolute top-10 left-[10%] w-20 h-20 bg-white/10 rounded-full blur-xl hidden lg:block"
          animate={{ y: [0, -25, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-10 right-[10%] w-16 h-16 bg-eg-pink/20 rounded-full blur-lg hidden lg:block"
          animate={{ y: [0, 20, 0], x: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />

        <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-5xl mx-auto"
          >
            <motion.div
              whileHover={{ y: -8, boxShadow: '0 30px 80px rgba(123,104,166,0.35)' }}
              transition={{ duration: 0.4 }}
              className={`${CARD_STYLES} rounded-3xl p-10 md:p-14 text-center border-2 border-eg-purple/40`}
            >
              <motion.h2
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-4xl md:text-5xl font-normal text-eg-purple mb-8 leading-tight"
              >
                Nuestro Propósito
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-xl md:text-2xl text-eg-dark font-normal leading-relaxed mb-6"
              >
                Ser el laboratorio clínico que necesitas, combinando excelencia técnica con calidez
                humana.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-2xl md:text-3xl text-eg-purple font-normal leading-relaxed"
              >
                Nos encanta atenderte con amor{' '}
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="inline-block"
                >
                  ❤️
                </motion.span>
              </motion.p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default NosotrosSection;
