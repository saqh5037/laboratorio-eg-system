import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  FaArrowLeft, FaWhatsapp, FaPhone, FaMapMarkerAlt, FaClock,
  FaStethoscope, FaSyringe, FaHeartbeat, FaUserMd, FaCalendarAlt,
  FaCheckCircle, FaEnvelope, FaChevronRight
} from 'react-icons/fa';
import { MdMedicalServices, MdHealthAndSafety } from 'react-icons/md';
import NavbarDimogen from '../../components/landing/dimogen/NavbarDimogen';
import FooterDimogen from '../../components/landing/dimogen/FooterDimogen';
// Logo vectorizado en: /images/dimogen/logos/svg/dimogen-logo-completo-white.svg
import { CertBadge, MicrotecBrandBadge, CertificationsSection } from '../../components/dimogen/DimogenCertBadge';
import { DIMOGEN_COLORS, DIMOGEN_CONTACT } from '../../styles/dimogen-theme';
import { HeartbeatSVG, StethoscopeSVG, MedicalCrossSVG, PulseSVG, DoctorSVG, ShieldHealthSVG, CalendarHeartSVG } from '../../components/dimogen/HealthIcons';
import { useCounter, ScrollProgressBar } from '../../components/dimogen/CounterAnimation';
import {
  serviciosSalud,
  beneficiosSalud,
  filosofiaSalud,
  contactoSalud,
  procesoAtencion
} from '../../data/dimogen/servicios-salud';

/**
 * AnimatedStat - Estadística con animación de contador
 */
const AnimatedStat = ({ value, label, suffix = '', color = '#7DD3FC' }) => {
  const { count, ref } = useCounter(typeof value === 'number' ? value : 0, 2);
  const isNumeric = typeof value === 'number';

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center p-2 sm:p-4 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10
                 hover:bg-white/10 transition-all duration-300 group"
    >
      <div
        className="text-xl sm:text-3xl font-bold group-hover:scale-110 transition-transform"
        style={{ color }}
      >
        {isNumeric ? count : value}{suffix}
      </div>
      <div className="text-xs sm:text-sm text-white/90">{label}</div>
    </motion.div>
  );
};

/**
 * SaludIntegralPage - Página dedicada de Unidad de Salud Integral
 * Diseño basado en manual de identidad DIMOGEN con parallax y micro-interacciones
 */
const SaludIntegralPage = () => {
  const heroRef = useRef(null);
  const { scrollY } = useScroll();

  // Parallax effects
  const y1 = useTransform(scrollY, [0, 500], [0, 150]); // Background layer - más lento
  const y2 = useTransform(scrollY, [0, 500], [0, 75]);  // Icons layer - medio
  const y3 = useTransform(scrollY, [0, 500], [0, 25]);  // Content layer - más rápido
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.95]);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = 'Unidad de Salud Integral | DIMOGEN - Laboratorio de Alta Especialidad';
  }, []);

  const iconMap = {
    stethoscope: FaStethoscope,
    specialist: FaUserMd,
    syringe: FaSyringe,
    'user-heart': FaHeartbeat,
    'check-shield': FaCheckCircle,
    'users-medical': FaUserMd,
    'building-heart': MdHealthAndSafety,
  };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <NavbarDimogen />

      {/* Progress Bar */}
      <ScrollProgressBar color="#7DD3FC" />

      {/* Hero Section - Diseño con parallax de 3 capas */}
      <section ref={heroRef} className="relative pt-24 pb-20 overflow-hidden min-h-[90vh]">
        {/* CAPA 1: Fondo con parallax lento */}
        <motion.div className="absolute inset-0" style={{ y: y1 }}>
          {/* Gradiente principal cyan-to-blue */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#00A3E0] via-[#0077B6] to-[#0047CB]" />

          {/* Diagonal decorativa */}
          <div
            className="absolute top-0 right-0 w-[55%] h-full bg-[#0047CB]"
            style={{
              clipPath: 'polygon(25% 0, 100% 0, 100% 100%, 0% 100%)',
            }}
          />

          {/* Rombos decorativos animados */}
          <motion.div
            className="absolute top-16 left-[12%] w-24 h-24 bg-white/10 rotate-45 hidden lg:block"
            animate={{ rotate: [45, 50, 45], scale: [1, 1.05, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-32 left-[8%] w-16 h-16 bg-[#7DD3FC]/30 rotate-45 hidden lg:block"
            animate={{ rotate: [45, 40, 45], scale: [1, 1.1, 1] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          />

          {/* Acento verde MICRO-TEC */}
          <div
            className="absolute bottom-0 right-0 w-48 h-48 bg-[#98CB59] opacity-20"
            style={{
              clipPath: 'polygon(100% 40%, 100% 100%, 40% 100%)',
            }}
          />
        </motion.div>

        {/* CAPA 2: Iconos flotantes de salud con parallax medio */}
        <motion.div className="absolute inset-0 pointer-events-none" style={{ y: y2, opacity }}>
          {/* Iconos SVG animados flotantes */}
          <motion.div
            className="absolute top-[15%] left-[5%] hidden lg:block"
            animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <HeartbeatSVG size={80} color="#7DD3FC" delay={0} />
          </motion.div>

          <motion.div
            className="absolute top-[25%] right-[8%] hidden lg:block"
            animate={{ y: [0, 12, 0], rotate: [0, -3, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          >
            <StethoscopeSVG size={75} color="#00A3E0" delay={0.3} />
          </motion.div>

          <motion.div
            className="absolute top-[60%] left-[3%] hidden lg:block"
            animate={{ y: [0, -10, 0], x: [0, 5, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          >
            <MedicalCrossSVG size={65} color="#98CB59" delay={0.6} />
          </motion.div>

          <motion.div
            className="absolute bottom-[20%] right-[5%] hidden lg:block"
            animate={{ y: [0, 15, 0], rotate: [0, 8, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
          >
            <ShieldHealthSVG size={70} color="#98CB59" delay={0.9} />
          </motion.div>

          <motion.div
            className="absolute top-[45%] left-[12%] hidden xl:block"
            animate={{ y: [0, -12, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
          >
            <DoctorSVG size={60} color="#0047CB" delay={1.2} />
          </motion.div>

          <motion.div
            className="absolute bottom-[35%] right-[12%] hidden xl:block"
            animate={{ y: [0, 10, 0], x: [0, -5, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
          >
            <CalendarHeartSVG size={55} color="#00A3E0" delay={1.5} />
          </motion.div>

          {/* Línea de pulso animada en la parte inferior */}
          <div className="absolute bottom-[10%] left-[20%] right-[20%] hidden lg:block">
            <PulseSVG size={200} color="rgba(125, 211, 252, 0.3)" delay={0} />
          </div>
        </motion.div>

        {/* CAPA 3: Contenido principal con parallax rápido */}
        <motion.div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12" style={{ y: y3, scale }}>
          {/* Breadcrumb con logo */}
          <div className="flex items-center justify-between mb-8">
            <Link
              to="/dimogen"
              className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors
                       hover:gap-3 group"
            >
              <FaArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Volver al inicio</span>
            </Link>

            <div className="hidden md:block">
              <img
                src="/images/dimogen/logos/svg/dimogen-logo-completo-white.svg"
                alt="DIMOGEN"
                className="h-12 sm:h-14 lg:h-16 w-auto object-contain"
              />
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Badges */}
              <div className="flex items-center gap-3 mb-6 flex-wrap">
                <motion.div
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full"
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.15)' }}
                >
                  <MdHealthAndSafety className="w-5 h-5 text-[#7DD3FC]" />
                  <span className="text-white text-sm font-medium">Atención Personalizada</span>
                </motion.div>
                <MicrotecBrandBadge variant="dark" size="sm" className="hidden sm:flex" />
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Unidad de
                <motion.span
                  className="block text-[#7DD3FC]"
                  animate={{ textShadow: ['0 0 20px rgba(125,211,252,0)', '0 0 30px rgba(125,211,252,0.5)', '0 0 20px rgba(125,211,252,0)'] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  Salud Integral
                </motion.span>
              </h1>

              <p className="text-xl text-white/90 mb-8 leading-relaxed max-w-lg">
                {filosofiaSalud.mision}
              </p>

              {/* Stats animados mejorados */}
              <div className="grid grid-cols-3 gap-2 sm:gap-6 mb-8">
                <AnimatedStat value={5} suffix="+" label="Especialidades" color="#7DD3FC" />
                <AnimatedStat value="12h" label="Atención" color="#98CB59" />
                <AnimatedStat value="A/D" label="Domicilio" color="#ffffff" />
              </div>

              {/* CTAs con micro-interacciones */}
              <div className="flex flex-wrap gap-4">
                <motion.a
                  href={`https://wa.me/${DIMOGEN_CONTACT.whatsapp}?text=Hola,%20me%20interesa%20agendar%20una%20cita%20en%20la%20Unidad%20de%20Salud%20Integral`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-6 py-3.5 bg-white text-[#0047CB]
                           rounded-xl font-semibold shadow-lg"
                  whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FaCalendarAlt className="w-5 h-5 text-[#00A3E0]" />
                  Agendar cita
                </motion.a>
                <motion.a
                  href={`tel:+52${contactoSalud.telefono.replace(/\s/g, '')}`}
                  className="inline-flex items-center gap-3 px-6 py-3.5 bg-white/10 backdrop-blur-sm
                           text-white rounded-xl font-semibold border border-white/20"
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.2)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FaPhone className="w-4 h-4" />
                  {contactoSalud.telefono}
                </motion.a>
              </div>
            </motion.div>

            {/* Services Preview con efecto 3D */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="grid grid-cols-2 gap-4">
                {serviciosSalud.slice(0, 3).map((servicio, index) => {
                  const Icon = iconMap[servicio.icon] || MdMedicalServices;
                  return (
                    <motion.div
                      key={servicio.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      whileHover={{
                        scale: 1.03,
                        rotateY: 5,
                        rotateX: -5,
                        boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
                      }}
                      style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
                      className={`bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20
                                hover:bg-white/15 transition-all group cursor-pointer
                                ${index === 2 ? 'col-span-2' : ''}`}
                    >
                      <div className="flex items-start gap-4">
                        <motion.div
                          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${servicio.color}30` }}
                          whileHover={{ scale: 1.15, rotate: 5 }}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </motion.div>
                        <div>
                          <h3 className="font-semibold text-white mb-1">{servicio.nombre}</h3>
                          <p className="text-sm text-white/90 line-clamp-2">{servicio.descripcion}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {/* Certificaciones en hero */}
                <div className="col-span-2 flex gap-3 mt-2">
                  <CertBadge type="iso" variant="compact" color="white" />
                  <CertBadge type="cofepris" variant="compact" color="white" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-white/90 text-sm">Descubre más</span>
            <motion.div
              className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2"
            >
              <motion.div
                className="w-1.5 h-3 bg-white/60 rounded-full"
                animate={{ y: [0, 12, 0], opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Services Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#00A3E0]/10 text-[#00A3E0]
                          rounded-full text-sm font-medium mb-4">
              <MdHealthAndSafety className="w-4 h-4" />
              Servicios Integrales
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Nuestros Servicios
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Ofrecemos una atención integral para cuidar tu salud con profesionales capacitados
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {serviciosSalud.map((servicio, index) => {
              const Icon = iconMap[servicio.icon] || MdMedicalServices;
              return (
                <motion.div
                  key={servicio.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{
                    y: -8,
                    rotateY: 3,
                    rotateX: -3,
                    boxShadow: '0 25px 50px rgba(0,163,224,0.15)',
                  }}
                  style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
                  className="bg-white rounded-2xl p-8 shadow-sm transition-all duration-300
                           border-2 border-gray-100 hover:border-[#00A3E0]/30 group cursor-pointer"
                >
                  <motion.div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                    style={{ backgroundColor: `${servicio.color}15` }}
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Icon className="w-8 h-8" style={{ color: servicio.color }} />
                  </motion.div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3">{servicio.nombre}</h3>
                  <p className="text-gray-600 mb-6">{servicio.descripcion}</p>

                  {/* Características o Especialidades */}
                  {servicio.caracteristicas && (
                    <ul className="space-y-2 mb-6">
                      {servicio.caracteristicas.slice(0, 4).map((item, i) => (
                        <motion.li
                          key={i}
                          className="flex items-center gap-2 text-sm text-gray-600"
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.3 + i * 0.05 }}
                        >
                          <FaCheckCircle className="w-4 h-4 text-[#98CB59] flex-shrink-0" />
                          {item}
                        </motion.li>
                      ))}
                    </ul>
                  )}

                  {servicio.especialidades && (
                    <div className="space-y-2 mb-6">
                      {servicio.especialidades.slice(0, 3).map((esp, i) => (
                        <motion.div
                          key={i}
                          className="flex items-center justify-between text-sm"
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.3 + i * 0.05 }}
                        >
                          <span className="text-gray-700">{esp.nombre}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              esp.disponibilidad === 'Disponible todos los días'
                                ? 'bg-[#98CB59]/10 text-[#98CB59]'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {esp.disponibilidad === 'Disponible todos los días' ? 'Disponible' : 'Consultar'}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {servicio.serviciosDomicilio && (
                    <motion.div
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#0047CB]/5 text-[#0047CB] rounded-lg text-sm font-medium"
                      whileHover={{ scale: 1.05, backgroundColor: 'rgba(0,71,203,0.1)' }}
                    >
                      <FaMapMarkerAlt className="w-3 h-3" />
                      Servicio a domicilio disponible
                    </motion.div>
                  )}

                  <motion.a
                    href={`https://wa.me/${DIMOGEN_CONTACT.whatsapp}?text=Hola,%20me%20interesa%20información%20sobre%20${encodeURIComponent(servicio.nombre)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[#0047CB] font-semibold mt-4"
                    whileHover={{ x: 5, gap: '12px' }}
                  >
                    Agendar cita
                    <FaChevronRight className="w-3 h-3" />
                  </motion.a>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#0047CB]/10 text-[#0047CB]
                          rounded-full text-sm font-medium mb-4">
              <FaCalendarAlt className="w-4 h-4" />
              Proceso Simple
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Proceso de Atención
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Tu salud es nuestra prioridad. Así es como te atendemos
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {procesoAtencion.map((paso, index) => (
              <motion.div
                key={paso.paso}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                whileHover={{ y: -5 }}
                className="relative text-center group"
              >
                {/* Connector Line animada */}
                {index < procesoAtencion.length - 1 && (
                  <motion.div
                    className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-0.5 overflow-hidden"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + index * 0.2, duration: 0.5 }}
                    style={{ originX: 0 }}
                  >
                    <div className="w-full h-full bg-gradient-to-r from-[#0047CB] to-[#00A3E0]" />
                  </motion.div>
                )}

                <motion.div
                  className="relative z-10 w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#0047CB] to-[#00A3E0] text-white
                              flex items-center justify-center text-2xl font-bold mb-4 shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 5, boxShadow: '0 20px 40px rgba(0,71,203,0.3)' }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {paso.paso}
                </motion.div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-[#0047CB] transition-colors">
                  {paso.titulo}
                </h3>
                <p className="text-gray-600 text-sm">{paso.descripcion}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ¿Por qué elegirnos?
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {beneficiosSalud.map((beneficio, index) => {
              const Icon = iconMap[beneficio.icon] || FaCheckCircle;
              return (
                <motion.div
                  key={beneficio.titulo}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, type: 'spring', stiffness: 100 }}
                  whileHover={{
                    y: -10,
                    scale: 1.02,
                    boxShadow: '0 25px 50px rgba(0,71,203,0.15)',
                  }}
                  className="bg-white rounded-2xl p-6 text-center border-2 border-gray-100 hover:border-[#00A3E0]/30 transition-all cursor-pointer group"
                >
                  <motion.div
                    className="w-14 h-14 mx-auto rounded-xl bg-gradient-to-br from-[#0047CB]/10 to-[#00A3E0]/10 flex items-center justify-center mb-4"
                    whileHover={{ scale: 1.15, rotate: 10 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Icon className="w-7 h-7 text-[#0047CB] group-hover:text-[#00A3E0] transition-colors" />
                  </motion.div>
                  <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-[#0047CB] transition-colors">
                    {beneficio.titulo}
                  </h3>
                  <p className="text-sm text-gray-600">{beneficio.descripcion}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Certificaciones */}
      <CertificationsSection variant="light" showTitle={true} />

      {/* Location & Contact Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#0047CB]/10 text-[#0047CB]
                            rounded-full text-sm font-medium mb-4">
                <FaMapMarkerAlt className="w-4 h-4" />
                Ubicación
              </span>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Contáctanos</h2>
              <p className="text-gray-600 mb-8">
                Estamos listos para atenderte. Agenda tu cita hoy mismo.
              </p>

              <div className="space-y-6">
                {[
                  { icon: FaMapMarkerAlt, title: 'Dirección', value: contactoSalud.direccion },
                  { icon: FaClock, title: 'Horario', value: `${contactoSalud.horario.dias}: ${contactoSalud.horario.apertura} - ${contactoSalud.horario.cierre}` },
                  { icon: FaPhone, title: 'Teléfono', value: contactoSalud.telefono },
                  { icon: FaEnvelope, title: 'Email', value: contactoSalud.email },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0047CB]/10 to-[#00A3E0]/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-[#0047CB]" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <p className="text-gray-600">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 mt-8">
                <a
                  href={`https://wa.me/52${contactoSalud.whatsapp.replace(/\s/g, '')}?text=Hola,%20me%20interesa%20agendar%20una%20cita`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-xl
                           font-semibold hover:bg-[#128C7E] transition-all shadow-md hover:shadow-lg"
                >
                  <FaWhatsapp className="w-5 h-5" />
                  WhatsApp
                </a>
                <a
                  href={`tel:+52${contactoSalud.telefono.replace(/\s/g, '')}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#0047CB] text-white rounded-xl
                           font-semibold hover:bg-[#003F92] transition-all shadow-md hover:shadow-lg"
                >
                  <FaPhone className="w-4 h-4" />
                  Llamar ahora
                </a>
              </div>

              {/* MICRO-TEC badge */}
              <div className="mt-8">
                <MicrotecBrandBadge variant="light" size="md" />
              </div>
            </motion.div>

            {/* Map Placeholder */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl overflow-hidden shadow-lg border-2 border-gray-100"
            >
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <div className="text-center p-6">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#0047CB]/10 flex items-center justify-center">
                    <FaMapMarkerAlt className="w-10 h-10 text-[#0047CB]" />
                  </div>
                  <p className="font-semibold text-gray-900 mb-2">Ubicación</p>
                  <p className="text-sm text-gray-600 max-w-xs">{contactoSalud.direccion}</p>
                </div>
              </div>
              <div className="p-6 bg-gray-50">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contactoSalud.direccion)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#0047CB] font-semibold hover:gap-3 transition-all"
                >
                  <FaMapMarkerAlt className="w-4 h-4" />
                  Ver en Google Maps
                  <FaChevronRight className="w-3 h-3" />
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <FooterDimogen />
    </div>
  );
};

export default SaludIntegralPage;
