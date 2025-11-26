import React from 'react';
import { motion } from 'framer-motion';
import {
  FaHeartbeat,
  FaLightbulb,
  FaUserShield,
  FaMicroscope,
  FaCertificate,
  FaHandshake,
  FaQuoteLeft
} from 'react-icons/fa';

// Icon mapping for dynamic about section
const iconMapAbout = {
  FaHeartbeat: FaHeartbeat,
  FaLightbulb: FaLightbulb,
  FaUserShield: FaUserShield,
  FaMicroscope: FaMicroscope,
  FaCertificate: FaCertificate,
  FaHandshake: FaHandshake,
  FaShieldAlt: FaUserShield,
  FaDna: FaMicroscope,
  FaFlask: FaMicroscope,
  FaHandHoldingHeart: FaHandshake
};

/**
 * SobreDimogenSection Component
 * Sección "Acerca de" con filosofía, valores y diferenciadores de Dimogen
 * Diseño: Layout asimétrico moderno con animaciones de revelación
 * Recibe datos dinámicos desde la API
 */
const SobreDimogenSection = ({ about = {}, statistics = [], loading = false }) => {

  // Transform API about data to component format
  const filosofia = (about.filosofia || []).map(item => ({
    icon: iconMapAbout[item.icon_name] || FaHeartbeat,
    title: item.title,
    description: item.description,
    color: item.color || '#0047CB'
  }));

  // Transform valores
  const valores = (about.valores || []).map(item => ({
    icon: iconMapAbout[item.icon_name] || FaMicroscope,
    title: item.title,
    description: item.description,
    stat: item.stat_value || '',
    statLabel: item.stat_label || ''
  }));

  // Show loading skeleton
  if (loading || (filosofia.length === 0 && valores.length === 0)) {
    return (
      <section id="sobre-dimogen" className="relative py-24 md:py-32 bg-white overflow-hidden scroll-mt-20">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 animate-pulse">
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded w-3/4"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
            <div className="h-[400px] bg-gray-200 rounded-3xl"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="sobre-dimogen"
      className="relative py-24 md:py-32 bg-white overflow-hidden scroll-mt-20"
    >
      {/* Background Decorations */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Gradient mesh background */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#0047CB]/5 to-transparent" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gradient-to-tr from-[#00A3E0]/5 to-transparent" />

        {/* Grid pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.02]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#0047CB" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-6 md:px-12 lg:px-24">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center mb-24">

          {/* Left Column - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-2 bg-[#0047CB]/10 text-[#0047CB] rounded-full text-sm font-semibold mb-6"
                  style={{ fontFamily: "'Poppins', sans-serif" }}>
              SOBRE NOSOTROS
            </span>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 mb-6 leading-tight"
                style={{ fontFamily: "'Poppins', sans-serif" }}>
              ¿Qué es <span className="text-[#0047CB]">DIMOGEN</span>?
            </h2>

            <p className="text-lg text-gray-600 mb-6 leading-relaxed"
               style={{ fontFamily: "'Poppins', sans-serif" }}>
              Enfocados en la salud integral del paciente, ofrecemos servicios de consultoría médica
              general, consulta de especialidad y toma de muestras para análisis clínicos.
            </p>

            <p className="text-lg text-gray-600 mb-8 leading-relaxed"
               style={{ fontFamily: "'Poppins', sans-serif" }}>
              De igual manera, nos dedicamos a la <strong className="text-[#0047CB]">investigación, desarrollo
              y comercialización</strong> de análisis especializados en Biología Molecular,
              Secuenciación Genética y Microbiología de Alimentos.
            </p>

            {/* Key Stats */}
            <div className="flex flex-wrap gap-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#0047CB]/10 flex items-center justify-center">
                  <FaMicroscope className="w-6 h-6 text-[#0047CB]" />
                </div>
                <div>
                  <span className="block text-2xl font-bold text-gray-900"
                        style={{ fontFamily: "'Poppins', sans-serif" }}>
                    Grupo Micro-Tec
                  </span>
                  <span className="text-sm text-gray-500">Perteneciente a</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#98CB59]/10 flex items-center justify-center">
                  <FaCertificate className="w-6 h-6 text-[#98CB59]" />
                </div>
                <div>
                  <span className="block text-2xl font-bold text-gray-900"
                        style={{ fontFamily: "'Poppins', sans-serif" }}>
                    COFEPRIS
                  </span>
                  <span className="text-sm text-gray-500">Certificación</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Image with overlay */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&h=600&fit=crop"
                alt="Laboratorio Dimogen"
                className="w-full h-[400px] md:h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0047CB]/60 via-transparent to-transparent" />

              {/* Floating Quote */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-xl">
                <FaQuoteLeft className="w-8 h-8 text-[#0047CB]/30 mb-3" />
                <p className="text-gray-800 font-medium italic text-lg"
                   style={{ fontFamily: "'Poppins', sans-serif" }}>
                  "Nuestra pasión es ofrecer soluciones innovadoras para brindar diagnósticos precisos y oportunos."
                </p>
              </div>
            </div>

            {/* Decorative Element */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-[#00A3E0]/20 rounded-3xl -z-10 blur-sm" />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-[#0047CB]/20 rounded-3xl -z-10 blur-sm" />
          </motion.div>
        </div>

        {/* Filosofía Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-24"
        >
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4"
                style={{ fontFamily: "'Poppins', sans-serif" }}>
              Nuestra <span className="text-[#0047CB]">Filosofía</span>
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto"
               style={{ fontFamily: "'Poppins', sans-serif" }}>
              Los principios que guían cada diagnóstico y cada atención
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filosofia.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group relative bg-white rounded-2xl p-8 border border-gray-100
                           hover:border-transparent hover:shadow-xl transition-all duration-500"
                  style={{
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                  }}
                >
                  {/* Top accent line */}
                  <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                       style={{ backgroundColor: item.color }} />

                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110"
                       style={{ backgroundColor: `${item.color}15` }}>
                    <Icon className="w-8 h-8" style={{ color: item.color }} />
                  </div>

                  <h4 className="text-xl font-semibold text-gray-900 mb-3"
                      style={{ fontFamily: "'Poppins', sans-serif" }}>
                    {item.title}
                  </h4>

                  <p className="text-gray-600 leading-relaxed"
                     style={{ fontFamily: "'Poppins', sans-serif" }}>
                    {item.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Valores Section - Full Width Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="relative bg-gradient-to-br from-[#0047CB] via-[#0747A6] to-[#003D99] rounded-3xl p-8 md:p-12 lg:p-16 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="diagonal" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M-10,10 l20,-20 M0,40 l40,-40 M30,50 l20,-20" stroke="white" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#diagonal)" />
              </svg>
            </div>

            <div className="relative z-10">
              <div className="text-center mb-12">
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-white mb-4"
                    style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Comprometidos con la Excelencia
                </h3>
                <p className="text-white/90 max-w-2xl mx-auto"
                   style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Hemos constituido un gran equipo de profesionales en ciencias,
                  capacitados y motivados para ofrecer análisis y resultados con la máxima calidad.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {valores.map((valor, index) => {
                  const Icon = valor.icon;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20
                               hover:bg-white/20 transition-all duration-300"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-white mb-2"
                              style={{ fontFamily: "'Poppins', sans-serif" }}>
                            {valor.title}
                          </h4>
                          <p className="text-white/80 text-sm mb-3"
                             style={{ fontFamily: "'Poppins', sans-serif" }}>
                            {valor.description}
                          </p>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-white"
                                  style={{ fontFamily: "'Poppins', sans-serif" }}>
                              {valor.stat}
                            </span>
                            <span className="text-white/70 text-sm">
                              {valor.statLabel}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SobreDimogenSection;
