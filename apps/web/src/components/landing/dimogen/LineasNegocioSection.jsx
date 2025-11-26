import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom'; // Used for service card links
import {
  FaDna,
  FaUserMd,
  FaLeaf,
  FaArrowRight,
  FaFlask,
  FaMicroscope,
  FaHeartbeat,
  FaCheckCircle,
  FaStethoscope,
  FaAppleAlt
} from 'react-icons/fa';

// Icon mapping for dynamic services
const iconMap = {
  FaDna: FaDna,
  FaUserMd: FaUserMd,
  FaLeaf: FaLeaf,
  FaFlask: FaFlask,
  FaMicroscope: FaMicroscope,
  FaHeartbeat: FaHeartbeat,
  FaStethoscope: FaStethoscope,
  FaAppleAlt: FaAppleAlt
};

/**
 * LineasNegocioSection Component
 * Sección destacada con las 3 líneas de negocio de Dimogen
 * Diseño: Cards grandes con hover effects y animaciones
 * Recibe servicios dinámicos desde la API
 */
const LineasNegocioSection = ({ services: propsServices = [], loading = false }) => {
  const [hoveredCard, setHoveredCard] = useState(null);

  // Transform API services to component format
  const lineasNegocio = propsServices.map(service => ({
    id: service.service_key,
    title: service.title,
    subtitle: service.subtitle,
    description: service.description,
    icon: iconMap[service.icon_name] || FaDna,
    color: {
      primary: service.color_primary || '#0047CB',
      secondary: service.color_secondary || '#0747A6',
      light: service.color_light || '#E6F0FF',
      gradient: service.color_gradient || 'from-[#0047CB] to-[#0747A6]'
    },
    features: service.features || [],
    stats: {
      value: service.stats_value || '500+',
      label: service.stats_label || 'Estudios'
    },
    link: service.link_url || `/dimogen/servicios/${service.service_key}`,
    image: service.image_url || 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=600&h=400&fit=crop'
  }));

  // Show loading skeleton
  if (loading || lineasNegocio.length === 0) {
    return (
      <section id="lineas-negocio" className="relative py-24 md:py-32 bg-gradient-to-b from-white via-gray-50/50 to-white overflow-hidden scroll-mt-20">
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-24">
          <div className="text-center mb-16 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
            <div className="h-12 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-100 rounded-3xl h-[500px] animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  return (
    <section
      id="lineas-negocio"
      className="relative py-24 md:py-32 bg-gradient-to-b from-white via-gray-50/50 to-white overflow-hidden scroll-mt-20"
    >
      {/* Decorative Background Elements - Animados */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0047CB] via-[#00A3E0] to-[#98CB59]" />
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-[#0047CB]/5 blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-[#98CB59]/5 blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        {/* Diamantes flotantes */}
        <motion.div
          className="absolute top-1/4 right-[10%] w-12 h-12 bg-[#0047CB]/10 hidden lg:block"
          style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
          animate={{ y: [0, -20, 0], rotate: [45, 50, 45] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/3 left-[8%] w-8 h-8 bg-[#00A3E0]/10 hidden lg:block"
          style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
          animate={{ y: [0, 15, 0], rotate: [45, 40, 45] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <motion.div
          className="absolute top-1/2 right-[5%] w-6 h-6 bg-[#98CB59]/15 hidden lg:block"
          style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
          animate={{ y: [0, -10, 0], x: [0, 5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-6 md:px-12 lg:px-24">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 md:mb-20"
        >
          <span className="inline-block px-4 py-2 bg-[#0047CB]/10 text-[#0047CB] rounded-full text-sm font-semibold mb-4"
                style={{ fontFamily: "'Poppins', sans-serif" }}>
            NUESTRAS ESPECIALIDADES
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 mb-6"
              style={{ fontFamily: "'Poppins', sans-serif" }}>
            Ramas de <span className="text-[#0047CB]">DIMOGEN</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto"
             style={{ fontFamily: "'Poppins', sans-serif" }}>
            Tres divisiones especializadas para cubrir todas tus necesidades
            en diagnóstico, salud e inocuidad alimentaria.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6"
        >
          {lineasNegocio.map((linea, index) => {
            const Icon = linea.icon;
            const isHovered = hoveredCard === linea.id;

            return (
              <motion.div
                key={linea.id}
                variants={cardVariants}
                onMouseEnter={() => setHoveredCard(linea.id)}
                onMouseLeave={() => setHoveredCard(null)}
                whileHover={{
                  y: -12,
                  rotateY: 3,
                  rotateX: -2,
                }}
                style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
                className="group relative"
              >
                <motion.div
                  className="relative h-full bg-white rounded-3xl overflow-hidden
                              shadow-lg transition-all duration-500
                              border border-gray-100"
                  animate={{
                    boxShadow: isHovered
                      ? `0 30px 60px -15px ${linea.color.primary}50`
                      : '0 10px 30px -10px rgba(0,0,0,0.1)',
                    borderColor: isHovered ? 'transparent' : 'rgb(243 244 246)'
                  }}
                >

                  {/* Top Accent Bar */}
                  <div className={`h-1.5 w-full bg-gradient-to-r ${linea.color.gradient}`} />

                  {/* Image Section */}
                  <div className="relative h-48 md:h-56 overflow-hidden">
                    <motion.img
                      src={linea.image}
                      alt={linea.title}
                      className="w-full h-full object-cover"
                      animate={{ scale: isHovered ? 1.1 : 1 }}
                      transition={{ duration: 0.7 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Icon Badge con animación */}
                    <motion.div
                      className={`absolute bottom-4 right-4 p-4 rounded-2xl bg-gradient-to-br ${linea.color.gradient} shadow-xl`}
                      animate={{
                        scale: isHovered ? 1.15 : 1,
                        rotate: isHovered ? 5 : 0,
                      }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </motion.div>

                    {/* Stats Badge con animación */}
                    <motion.div
                      className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg"
                      animate={{ scale: isHovered ? 1.05 : 1 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <span className="block text-2xl font-bold" style={{ color: linea.color.primary, fontFamily: "'Poppins', sans-serif" }}>
                        {linea.stats.value}
                      </span>
                      <span className="text-xs text-gray-600"
                            style={{ fontFamily: "'Poppins', sans-serif" }}>
                        {linea.stats.label}
                      </span>
                    </motion.div>
                  </div>

                  {/* Content Section */}
                  <div className="p-6 md:p-8">
                    <motion.span
                      className="text-sm font-medium uppercase tracking-wider inline-block"
                      style={{ color: linea.color.primary, fontFamily: "'Poppins', sans-serif" }}
                      animate={{ x: isHovered ? 5 : 0 }}
                    >
                      {linea.subtitle}
                    </motion.span>

                    <h3 className="text-2xl md:text-3xl font-semibold text-gray-900 mt-2 mb-4 group-hover:text-[#0047CB] transition-colors"
                        style={{ fontFamily: "'Poppins', sans-serif" }}>
                      {linea.title}
                    </h3>

                    <p className="text-gray-600 mb-6 leading-relaxed"
                       style={{ fontFamily: "'Poppins', sans-serif" }}>
                      {linea.description}
                    </p>

                    {/* Features List con animaciones escalonadas */}
                    <ul className="space-y-3 mb-8">
                      {linea.features.map((feature, idx) => (
                        <motion.li
                          key={idx}
                          className="flex items-center gap-3"
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.1 * idx }}
                        >
                          <motion.div
                            whileHover={{ scale: 1.2, rotate: 10 }}
                          >
                            <FaCheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: linea.color.primary }} />
                          </motion.div>
                          <span className="text-gray-700 text-sm"
                                style={{ fontFamily: "'Poppins', sans-serif" }}>
                            {feature}
                          </span>
                        </motion.li>
                      ))}
                    </ul>

                    {/* CTA Button con micro-interacciones */}
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                      <Link
                        to={linea.link}
                        className={`group/btn inline-flex items-center justify-center w-full gap-3 px-6 py-4
                                 rounded-xl font-semibold text-base transition-all duration-300
                                 bg-gradient-to-r ${linea.color.gradient} text-white
                                 hover:shadow-xl`}
                        style={{ fontFamily: "'Poppins', sans-serif" }}
                      >
                        Conocer más
                        <motion.span
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <FaArrowRight className="w-4 h-4" />
                        </motion.span>
                      </Link>
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-16 md:mt-20 px-4"
        >
          <p className="text-gray-600 mb-6"
             style={{ fontFamily: "'Poppins', sans-serif" }}>
            ¿Necesitas más información sobre nuestros servicios?
          </p>
          <a
            href="#contacto"
            onClick={(e) => {
              e.preventDefault();
              const element = document.getElementById('contacto');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
            className="inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-[#0047CB] text-white rounded-xl
                     font-semibold text-sm sm:text-base hover:bg-[#0747A6] transition-all duration-300
                     shadow-lg hover:shadow-xl hover:scale-105 w-full sm:w-auto"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Contáctanos ahora
            <FaArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default LineasNegocioSection;
