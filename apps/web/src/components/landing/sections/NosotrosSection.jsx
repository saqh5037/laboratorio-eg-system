import React from 'react';
import { motion } from 'framer-motion';
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
      id={section.section_key || 'nosotros'}
      className={`w-full min-h-screen bg-${backgroundColor} relative overflow-hidden`}
    >
      {/* Decorative Blobs */}
      {decorativeBlobs && (
        <>
          <div className="absolute top-0 left-0 w-[500px] h-[500px] opacity-30 pointer-events-none z-0 animate-blob-float">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <path
                fill="#DDB5D5"
                d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.5,-0.9C87,14.6,81.4,29.2,73.1,42.8C64.8,56.4,53.8,69,39.8,76.8C25.8,84.6,8.9,87.6,-6.4,86.3C-21.7,85,-43.4,79.4,-58.9,68.9C-74.4,58.4,-83.7,43,-87.7,26.4C-91.7,9.8,-90.4,-7.9,-84.3,-23.9C-78.2,-39.9,-67.3,-54.2,-53.5,-61.6C-39.7,-69,-23,-69.5,-7.6,-72.9C7.8,-76.3,30.6,-83.6,44.7,-76.4Z"
                transform="translate(100 100)"
              />
            </svg>
          </div>

          <div
            className="absolute bottom-0 right-0 w-[600px] h-[600px] opacity-40 pointer-events-none z-0 animate-blob-float"
            style={{ animationDelay: '2s' }}
          >
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
            {section.title || nosotrosHeader.title}
          </h1>
          <p
            className="text-lg md:text-xl lg:text-2xl text-white max-w-4xl mx-auto leading-relaxed mb-3"
            style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.7)' }}
          >
            {section.subtitle || nosotrosHeader.subtitle}
          </p>
          <p
            className="text-base md:text-lg text-white"
            style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.7)' }}
          >
            RIF {LOGO_SPECS.rif} · {nosotrosHeader.badge}
          </p>
        </div>
      </header>

      {/* Historia - Two Column Grid */}
      <div id="historia" className="relative z-10 w-full py-8 md:py-12 scroll-mt-20">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 mb-12">
            {/* Content Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className={`${CARD_STYLES} rounded-3xl p-10 md:p-14`}
            >
              <h2 className="text-3xl md:text-4xl font-normal text-eg-purple mb-6 leading-tight">
                {historiaTitle}
              </h2>
              {historiaParagraphs.map((paragraph, index) => (
                <p
                  key={index}
                  className="text-eg-dark mb-6 text-lg md:text-xl font-normal leading-relaxed last:mb-0"
                >
                  {paragraph.content}
                </p>
              ))}
            </motion.div>

            {/* Image Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="w-full h-full min-h-[400px] rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(123,104,166,0.3)] border-4 border-eg-pink/20">
                <img
                  src={
                    historiaImage?.image_url ||
                    'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=800&h=600&fit=crop'
                  }
                  alt={historiaImage?.content || 'Equipo del laboratorio'}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-gradient-to-r from-eg-purple to-eg-pink text-white px-8 py-6 rounded-2xl shadow-2xl transform rotate-[-5deg] hover:rotate-0 transition-transform duration-300">
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
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Valores Corporativos - Grid de 5 columnas */}
      <div id="valores" className="relative z-10 w-full py-8 md:py-12 bg-gradient-to-b from-white via-eg-pink/20 to-eg-purple/15 overflow-hidden scroll-mt-20">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl md:text-4xl font-normal text-eg-purple mb-4 leading-tight">
              Nuestros Valores
            </h2>
            <p className="text-lg md:text-xl text-eg-dark max-w-3xl mx-auto leading-relaxed">
              Los principios que nos guían cada día
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8">
            {valuesWithIcons.map((value, index) => (
              <div key={value.id || index} className={`value-card ${CARD_STYLES} text-center`}>
                <div
                  className={`${ICON_WRAPPER_STYLES} inline-flex mb-6 animate-float`}
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  {value.icon}
                </div>
                <h3 className="text-2xl font-normal text-eg-purple mb-3 leading-tight">
                  {value.title}
                </h3>
                <p className="text-eg-dark text-base font-normal leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Propósito - Tarjeta destacada */}
      <div className="relative z-10 w-full py-20 md:py-24 bg-gradient-to-br from-eg-purple/43 via-eg-pink/28 to-eg-purple/38 overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto"
          >
            <div
              className={`${CARD_STYLES} rounded-3xl p-10 md:p-14 text-center border-2 border-eg-purple/40`}
            >
              <h2 className="text-4xl md:text-5xl font-normal text-eg-purple mb-8 leading-tight">
                Nuestro Propósito
              </h2>
              <p className="text-xl md:text-2xl text-eg-dark font-normal leading-relaxed mb-6">
                Ser el laboratorio clínico que necesitas, combinando excelencia técnica con calidez
                humana.
              </p>
              <p className="text-2xl md:text-3xl text-eg-purple font-normal leading-relaxed">
                Nos encanta atenderte con amor ❤️
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default NosotrosSection;
