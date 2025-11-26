import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FaChevronLeft,
  FaChevronRight,
  FaCalendarAlt,
  FaFlask,
  FaDna,
  FaLeaf,
  FaUserMd,
  FaWhatsapp,
  FaPhone,
  FaArrowRight
} from 'react-icons/fa';

/**
 * HeroDimogen Component
 * Hero section con diseño geométrico vanguardista para Dimogen
 * Características:
 * - Formas geométricas angulares (diamantes)
 * - Animación de ADN
 * - Transiciones suaves
 * - 100% responsive
 */
const HeroDimogen = ({ slides: propSlides }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const heroRef = useRef(null);
  const { scrollY } = useScroll();

  // Parallax effects
  const y1 = useTransform(scrollY, [0, 500], [0, 100]); // Background - más lento
  const y2 = useTransform(scrollY, [0, 500], [0, 50]);  // Elementos decorativos
  const y3 = useTransform(scrollY, [0, 500], [0, 25]);  // Contenido
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  const scale = useTransform(scrollY, [0, 400], [1, 1.1]);

  // Slides por defecto para Dimogen - Los 3 servicios principales
  const defaultSlides = [
    {
      id: 1,
      title: 'Biología Molecular',
      subtitle: 'Laboratorio de Alta Especialidad',
      description: 'Pruebas genéticas, secuenciación y diagnóstico molecular con tecnología de vanguardia',
      badge_text: 'BIOLOGÍA MOLECULAR',
      badge_color: 'blue',
      cta1_text: 'Solicitar cotización',
      cta1_link: 'contacto',
      cta1_icon: 'whatsapp',
      cta1_type: 'anchor',
      cta2_text: 'Ver catálogo',
      cta2_link: '/dimogen/servicios/biologia-molecular',
      cta2_icon: 'dna',
      cta2_type: 'route',
      image_url: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=1920&h=1080&fit=crop',
      line: 'molecular'
    },
    {
      id: 2,
      title: 'Unidad de Salud Integral',
      subtitle: 'Cuidado Personalizado',
      description: 'Consulta médica, análisis clínicos de rutina y alta especialidad con acompañamiento personalizado',
      badge_text: 'SALUD INTEGRAL',
      badge_color: 'cyan',
      cta1_text: 'Agendar cita',
      cta1_link: 'contacto',
      cta1_icon: 'calendar',
      cta1_type: 'anchor',
      cta2_text: 'Ver servicios',
      cta2_link: '/dimogen/servicios/salud-integral',
      cta2_icon: 'user',
      cta2_type: 'route',
      image_url: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1920&h=1080&fit=crop',
      line: 'salud'
    },
    {
      id: 3,
      title: 'Microbiología de Alimentos',
      subtitle: 'Certificación ISO 9001:2015',
      description: 'Análisis microbiológico de agua, hielo, superficies y alimentos para la industria alimentaria',
      badge_text: 'MICROBIOLOGÍA',
      badge_color: 'green',
      cta1_text: 'Solicitar cotización',
      cta1_link: 'contacto',
      cta1_icon: 'whatsapp',
      cta1_type: 'anchor',
      cta2_text: 'Ver catálogo',
      cta2_link: '/dimogen/servicios/microbiologia-alimentos',
      cta2_icon: 'leaf',
      cta2_type: 'route',
      image_url: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=1920&h=1080&fit=crop',
      line: 'alimentos'
    }
  ];

  const slides = propSlides?.length > 0 ? propSlides : defaultSlides;

  // Auto-advance
  useEffect(() => {
    if (slides.length === 0 || isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [slides.length, isPaused]);

  // Precargar siguiente imagen para transiciones suaves
  useEffect(() => {
    if (slides.length === 0) return;
    const nextIndex = (currentSlide + 1) % slides.length;
    const prevIndex = (currentSlide - 1 + slides.length) % slides.length;
    // Precargar siguiente y anterior
    const imgNext = new Image();
    imgNext.src = slides[nextIndex].image_url;
    const imgPrev = new Image();
    imgPrev.src = slides[prevIndex].image_url;
  }, [currentSlide, slides]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000);
  };

  const nextSlide = () => goToSlide((currentSlide + 1) % slides.length);
  const prevSlide = () => goToSlide((currentSlide - 1 + slides.length) % slides.length);

  // Scroll suave a sección
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Color schemes por línea de negocio
  const lineColors = {
    molecular: {
      primary: '#0047CB',
      secondary: '#0747A6',
      accent: '#00A3E0',
      gradient: 'from-[#0047CB] via-[#0747A6] to-[#003D99]'
    },
    salud: {
      primary: '#00A3E0',
      secondary: '#0077B6',
      accent: '#48CAE4',
      gradient: 'from-[#00A3E0] via-[#0077B6] to-[#023E8A]'
    },
    alimentos: {
      primary: '#98CB59',
      secondary: '#006644',
      accent: '#36B37E',
      gradient: 'from-[#98CB59] via-[#006644] to-[#004D40]'
    }
  };

  const currentColors = lineColors[slides[currentSlide]?.line] || lineColors.molecular;

  if (slides.length === 0) return null;

  return (
    <section
      ref={heroRef}
      className="relative h-screen min-h-[500px] sm:min-h-[600px] max-h-[900px] overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence mode="sync">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, zIndex: 1 }}
          animate={{ opacity: 1, zIndex: 2 }}
          exit={{ opacity: 0, zIndex: 1 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          {/* CAPA 1: Background Image with Parallax */}
          <motion.div className="absolute inset-0" style={{ y: y1, scale }}>
            <img
              src={slides[currentSlide]?.image_url}
              alt={slides[currentSlide]?.title || 'DIMOGEN'}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback: usar gradiente si la imagen falla
                e.target.style.display = 'none';
              }}
            />
            {/* Gradient Overlay - Estilo Dimogen */}
            <div className={`absolute inset-0 bg-gradient-to-r ${currentColors.gradient} opacity-90`} />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
          </motion.div>

          {/* CAPA 2: Geometric Decorative Elements con Parallax medio */}
          <motion.div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ y: y2, opacity }}>
            {/* Diamante superior derecho - Animado */}
            <motion.div
              initial={{ rotate: 45, scale: 0.8, opacity: 0 }}
              animate={{ rotate: [45, 50, 45], scale: [1, 1.05, 1], opacity: 0.15 }}
              transition={{ duration: 8, delay: 0.2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-32 -right-32 w-96 h-96 bg-white/10 backdrop-blur-sm"
              style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
            />

            {/* Diamante inferior izquierdo - Animado */}
            <motion.div
              initial={{ rotate: 45, scale: 0.8, opacity: 0 }}
              animate={{ rotate: [45, 40, 45], scale: [1, 1.1, 1], opacity: 0.1 }}
              transition={{ duration: 10, delay: 0.4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-48 -left-48 w-[500px] h-[500px] bg-white/5"
              style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
            />

            {/* Diamantes flotantes adicionales */}
            <motion.div
              animate={{ y: [0, -20, 0], x: [0, 10, 0], rotate: [45, 50, 45] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-1/4 left-[15%] w-16 h-16 bg-white/10 hidden lg:block"
              style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
            />
            <motion.div
              animate={{ y: [0, 15, 0], x: [0, -8, 0], rotate: [45, 40, 45] }}
              transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute bottom-1/3 right-[20%] w-12 h-12 bg-white/8 hidden lg:block"
              style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
            />

            {/* ADN Animation - Mejorado */}
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 0.12, x: 0 }}
              transition={{ duration: 1.5, delay: 0.6 }}
              className="absolute top-1/4 right-10 md:right-20"
            >
              <DNAHelix />
            </motion.div>

            {/* Partículas flotantes */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-white/30 hidden lg:block"
                style={{
                  left: `${15 + Math.random() * 70}%`,
                  top: `${15 + Math.random() * 70}%`,
                }}
                animate={{
                  y: [0, -30 - Math.random() * 20, 0],
                  x: [0, (Math.random() - 0.5) * 30, 0],
                  opacity: [0.2, 0.5, 0.2],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 4 + Math.random() * 3,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: 'easeInOut',
                }}
              />
            ))}

            {/* Líneas geométricas decorativas animadas */}
            <svg className="absolute inset-0 w-full h-full opacity-10" preserveAspectRatio="none">
              <motion.line
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: 0.5 }}
                x1="0" y1="100%" x2="100%" y2="0"
                stroke="white"
                strokeWidth="1"
              />
              <motion.line
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: 0.7 }}
                x1="20%" y1="100%" x2="100%" y2="20%"
                stroke="white"
                strokeWidth="0.5"
              />
              <motion.line
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2.5, delay: 0.9 }}
                x1="0" y1="60%" x2="40%" y2="0"
                stroke="white"
                strokeWidth="0.5"
              />
            </svg>
          </motion.div>

          {/* CAPA 3: Content con Parallax rápido */}
          <motion.div className="relative h-full flex items-center z-10" style={{ y: y3 }}>
            <div className="container mx-auto px-6 md:px-12 lg:px-24">
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="max-w-3xl"
              >
                {/* Badge con micro-interacción */}
                {slides[currentSlide].badge_text && (
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                    whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium mb-6 cursor-default
                              ${slides[currentSlide].badge_color === 'blue' ? 'bg-white text-[#0047CB]' :
                                slides[currentSlide].badge_color === 'cyan' ? 'bg-cyan-400/20 text-cyan-100 border border-cyan-400/30' :
                                slides[currentSlide].badge_color === 'green' ? 'bg-emerald-400/20 text-emerald-100 border border-emerald-400/30' :
                                'bg-white/20 text-white border border-white/30'
                              }
                              backdrop-blur-md shadow-lg`}
                  >
                    <motion.span
                      className="w-2 h-2 rounded-full bg-current"
                      animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    {slides[currentSlide].badge_text}
                  </motion.span>
                )}

                {/* Title con efecto de brillo */}
                <motion.h1
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-4 leading-tight"
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    textShadow: '0 4px 20px rgba(0,0,0,0.3)'
                  }}
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                >
                  {slides[currentSlide].title}
                </motion.h1>

                {/* Subtitle */}
                {slides[currentSlide].subtitle && (
                  <motion.p
                    className="text-lg sm:text-xl md:text-2xl text-white/90 mb-3 font-light"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                  >
                    {slides[currentSlide].subtitle}
                  </motion.p>
                )}

                {/* Description */}
                {slides[currentSlide].description && (
                  <motion.p
                    className="text-base sm:text-lg text-white/80 mb-8 max-w-2xl"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.6 }}
                  >
                    {slides[currentSlide].description}
                  </motion.p>
                )}

                {/* CTAs con micro-interacciones premium */}
                <motion.div
                  className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                >
                  {slides[currentSlide].cta1_text && (
                    slides[currentSlide].cta1_type === 'anchor' ? (
                      <motion.button
                        onClick={() => scrollToSection(slides[currentSlide].cta1_link)}
                        className="group inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-white text-[#0047CB] rounded-xl
                                 font-semibold text-sm sm:text-base shadow-xl"
                        style={{ fontFamily: "'Poppins', sans-serif" }}
                        whileHover={{ scale: 1.05, boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {getIcon(slides[currentSlide].cta1_icon)}
                        {slides[currentSlide].cta1_text}
                        <motion.span
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <FaArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                        </motion.span>
                      </motion.button>
                    ) : (
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                        <Link
                          to={slides[currentSlide].cta1_link}
                          className="group inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-white text-[#0047CB] rounded-xl
                                   font-semibold text-sm sm:text-base shadow-xl hover:shadow-2xl transition-shadow"
                          style={{ fontFamily: "'Poppins', sans-serif" }}
                        >
                          {getIcon(slides[currentSlide].cta1_icon)}
                          {slides[currentSlide].cta1_text}
                          <FaArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </motion.div>
                    )
                  )}

                  {slides[currentSlide].cta2_text && (
                    slides[currentSlide].cta2_type === 'anchor' ? (
                      <motion.button
                        onClick={() => scrollToSection(slides[currentSlide].cta2_link)}
                        className="inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 border-2 border-white/50 text-white rounded-xl
                                 font-medium text-sm sm:text-base backdrop-blur-sm"
                        style={{ fontFamily: "'Poppins', sans-serif" }}
                        whileHover={{ scale: 1.05, borderColor: 'rgba(255,255,255,0.8)', backgroundColor: 'rgba(255,255,255,0.1)' }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {getIcon(slides[currentSlide].cta2_icon)}
                        {slides[currentSlide].cta2_text}
                      </motion.button>
                    ) : (
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                        <Link
                          to={slides[currentSlide].cta2_link}
                          className="inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 border-2 border-white/50 text-white rounded-xl
                                   font-medium text-sm sm:text-base hover:bg-white/10 hover:border-white
                                   transition-all duration-300 backdrop-blur-sm"
                          style={{ fontFamily: "'Poppins', sans-serif" }}
                        >
                          {getIcon(slides[currentSlide].cta2_icon)}
                          {slides[currentSlide].cta2_text}
                        </Link>
                      </motion.div>
                    )
                  )}
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows - Estilo Dimogen con micro-interacciones */}
      <motion.button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          prevSlide();
        }}
        className="absolute left-2 sm:left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 md:p-4 bg-white/10 backdrop-blur-md
                 rounded-lg sm:rounded-xl text-white border border-white/20 cursor-pointer"
        aria-label="Slide anterior"
        whileHover={{ scale: 1.15, backgroundColor: 'rgba(255,255,255,0.2)', x: -3 }}
        whileTap={{ scale: 0.95 }}
      >
        <FaChevronLeft className="text-base sm:text-xl md:text-2xl pointer-events-none" />
      </motion.button>

      <motion.button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          nextSlide();
        }}
        className="absolute right-2 sm:right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-3 md:p-4 bg-white/10 backdrop-blur-md
                 rounded-lg sm:rounded-xl text-white border border-white/20 cursor-pointer"
        aria-label="Siguiente slide"
        whileHover={{ scale: 1.15, backgroundColor: 'rgba(255,255,255,0.2)', x: 3 }}
        whileTap={{ scale: 0.95 }}
      >
        <FaChevronRight className="text-base sm:text-xl md:text-2xl pointer-events-none" />
      </motion.button>

      {/* Dots Navigation - Estilo Dimogen con líneas de negocio */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3">
        {slides.map((slide, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`group flex flex-col items-center gap-2 transition-all duration-300 ${
              index === currentSlide ? 'scale-110' : 'opacity-60 hover:opacity-100'
            }`}
            aria-label={`Ir a ${slide.badge_text}`}
          >
            <span className={`transition-all duration-300 ${
              index === currentSlide
                ? 'w-12 h-1.5 rounded-full bg-white'
                : 'w-6 h-1.5 rounded-full bg-white/50 group-hover:w-8 group-hover:bg-white/70'
            }`} />
            <span className={`text-xs text-white/80 font-medium hidden md:block transition-opacity ${
              index === currentSlide ? 'opacity-100' : 'opacity-0 group-hover:opacity-70'
            }`}
            style={{ fontFamily: "'Poppins', sans-serif" }}>
              {slide.line === 'molecular' ? 'Molecular' :
               slide.line === 'salud' ? 'Salud' : 'Alimentos'}
            </span>
          </button>
        ))}
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-24 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2"
      >
        <span className="text-white/90 text-xs uppercase tracking-widest"
              style={{ fontFamily: "'Poppins', sans-serif" }}>
          Descubre más
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-white/50 flex justify-center pt-2"
        >
          <div className="w-1.5 h-3 rounded-full bg-white/90" />
        </motion.div>
      </motion.div>
    </section>
  );
};

// Helper function para iconos
const getIcon = (iconName) => {
  const icons = {
    dna: <FaDna className="w-5 h-5" />,
    calendar: <FaCalendarAlt className="w-5 h-5" />,
    flask: <FaFlask className="w-5 h-5" />,
    leaf: <FaLeaf className="w-5 h-5" />,
    user: <FaUserMd className="w-5 h-5" />,
    whatsapp: <FaWhatsapp className="w-5 h-5" />,
    phone: <FaPhone className="w-5 h-5" />
  };
  return icons[iconName] || null;
};

// Componente de ADN animado
const DNAHelix = () => (
  <svg width="120" height="400" viewBox="0 0 120 400" className="opacity-60">
    <defs>
      <linearGradient id="dnaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
        <stop offset="50%" stopColor="#00A3E0" stopOpacity="0.6" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.8" />
      </linearGradient>
    </defs>

    {/* Helix strands */}
    {[...Array(20)].map((_, i) => {
      const y = i * 20;
      const offset = Math.sin(i * 0.5) * 30;
      return (
        <g key={i}>
          <motion.circle
            cx={60 + offset}
            cy={y}
            r="4"
            fill="url(#dnaGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 2, delay: i * 0.1, repeat: Infinity }}
          />
          <motion.circle
            cx={60 - offset}
            cy={y}
            r="4"
            fill="url(#dnaGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 2, delay: i * 0.1 + 0.5, repeat: Infinity }}
          />
          {i % 2 === 0 && (
            <motion.line
              x1={60 + offset}
              y1={y}
              x2={60 - offset}
              y2={y}
              stroke="url(#dnaGradient)"
              strokeWidth="1.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 2, delay: i * 0.1, repeat: Infinity }}
            />
          )}
        </g>
      );
    })}
  </svg>
);

export default HeroDimogen;
