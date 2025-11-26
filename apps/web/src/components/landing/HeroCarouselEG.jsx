import React, { useState, useEffect, useRef } from 'react';
/* eslint-disable-next-line no-unused-vars */
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FaChevronLeft,
  FaChevronRight,
  FaCalendarAlt,
  FaFlask,
  FaClock,
  FaUserMd,
  FaWhatsapp,
  FaPhone,
  FaLaptop,
  FaUser,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaHeart,
  FaStar,
  FaBell,
  FaFile,
  FaImage,
  FaVideo,
  FaPlay,
  FaPause,
  FaStop,
  FaSyncAlt,
  FaSearch,
  FaFilter,
  FaCog,
  FaQuestionCircle,
  FaInfoCircle,
  FaExclamationTriangle,
  FaTimesCircle,
  FaPlus,
  FaMinus,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaLock,
  FaUnlock,
  FaEye,
  FaEyeSlash,
  FaDownload,
  FaUpload,
  FaShare,
  FaCopy,
  FaPrint,
  FaHome,
  FaArrowLeft,
  FaArrowRight,
  FaArrowUp,
  FaArrowDown,
  FaBars,
} from 'react-icons/fa';
import { getActiveSlides } from '../../services/carouselApi';

// Mapeo de iconos dinámicos
const ICON_MAP = {
  calendar: FaCalendarAlt,
  flask: FaFlask,
  phone: FaPhone,
  whatsapp: FaWhatsapp,
  laptop: FaLaptop,
  user: FaUser,
  email: FaEnvelope,
  map: FaMapMarkerAlt,
  check: FaCheckCircle,
  heart: FaHeart,
  star: FaStar,
  bell: FaBell,
  file: FaFile,
  image: FaImage,
  video: FaVideo,
  play: FaPlay,
  pause: FaPause,
  stop: FaStop,
  refresh: FaSyncAlt,
  search: FaSearch,
  filter: FaFilter,
  settings: FaCog,
  help: FaQuestionCircle,
  info: FaInfoCircle,
  warning: FaExclamationTriangle,
  error: FaTimesCircle,
  plus: FaPlus,
  minus: FaMinus,
  edit: FaEdit,
  delete: FaTrash,
  save: FaSave,
  close: FaTimes,
  lock: FaLock,
  unlock: FaUnlock,
  eye: FaEye,
  'eye-off': FaEyeSlash,
  download: FaDownload,
  upload: FaUpload,
  share: FaShare,
  copy: FaCopy,
  print: FaPrint,
  home: FaHome,
  back: FaArrowLeft,
  forward: FaArrowRight,
  up: FaArrowUp,
  down: FaArrowDown,
  menu: FaBars,
};

// Función helper para obtener el componente de icono
const getIconComponent = (iconName) => {
  if (!iconName) return FaCalendarAlt; // Default
  const IconComponent = ICON_MAP[iconName.toLowerCase()];
  return IconComponent || FaCalendarAlt; // Fallback a calendar si no existe
};

const HeroCarouselEG = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [lastInteractionTime, setLastInteractionTime] = useState(null);

  // Parallax effects
  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 400], [0, 80]);  // Background
  const y2 = useTransform(scrollY, [0, 400], [0, 40]);  // Decorative elements
  const y3 = useTransform(scrollY, [0, 400], [0, 20]);  // Content
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 1.05]);

  // Cargar slides desde la API
  useEffect(() => {
    async function fetchSlides() {
      try {
        setLoading(true);
        const response = await getActiveSlides();

        if (response.data && response.data.length > 0) {
          setSlides(response.data);
        }
        // Si no hay slides, simplemente mostrar estado vacío (no usar fallback hardcodeado)
      } catch (err) {
        console.error('Error loading carousel slides:', err);
        setError(err.message);
        // No usar fallback - permitir que el componente maneje el estado vacío
      } finally {
        setLoading(false);
      }
    }

    fetchSlides();
  }, []);

  // Auto-avance del carrusel con pausa inteligente
  useEffect(() => {
    if (slides.length === 0 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [slides.length, isPaused]);

  // Auto-resume después de 10 segundos de inactividad
  useEffect(() => {
    if (!isPaused || !lastInteractionTime) return;

    const autoResumeTimer = setTimeout(() => {
      setIsPaused(false);
      setLastInteractionTime(null);
    }, 10000); // 10 segundos

    return () => clearTimeout(autoResumeTimer);
  }, [isPaused, lastInteractionTime]);

  // Helpers para pausa con interacción
  const pauseCarousel = () => {
    setIsPaused(true);
    setLastInteractionTime(Date.now());
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
    pauseCarousel(); // Pausar al cambiar de slide manualmente
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    pauseCarousel(); // Pausar al hacer clic en siguiente
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    pauseCarousel(); // Pausar al hacer clic en anterior
  };

  // Handlers para hover
  const handleMouseEnter = () => {
    pauseCarousel();
  };

  const handleMouseLeave = () => {
    // Resume después de 2 segundos de que el usuario salga
    setTimeout(() => {
      setIsPaused(false);
      setLastInteractionTime(null);
    }, 2000);
  };

  // Mostrar loading state
  if (loading) {
    return (
      <section className="relative h-[450px] md:h-[500px] mt-20 overflow-hidden bg-gradient-to-b from-white to-eg-light-gray flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-eg-purple border-t-transparent"></div>
          <p className="text-gray-600 mt-4">Cargando...</p>
        </div>
      </section>
    );
  }

  // Si no hay slides, no renderizar el carrusel
  if (slides.length === 0) {
    return null;
  }

  return (
    <section
      ref={heroRef}
      className="relative
                 h-[350px] sm:h-[420px] md:h-[500px] lg:h-[550px]
                 mt-16 sm:mt-20 overflow-hidden bg-gradient-to-b from-white to-eg-light-gray"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          {/* CAPA 1: Background with Parallax */}
          <motion.div className="absolute inset-0" style={{ y: y1, scale }}>
            <picture>
              {/* Imagen optimizada para móvil si está disponible */}
              {slides[currentSlide].image_mobile_url && (
                <source
                  media="(max-width: 768px)"
                  srcSet={slides[currentSlide].image_mobile_url}
                />
              )}
              {/* Imagen desktop (fallback) */}
              <img
                src={slides[currentSlide].image_url}
                alt={slides[currentSlide].image_alt || slides[currentSlide].title}
                className="w-full h-full object-cover"
              />
            </picture>
            {/* Directorio-style gradient overlay - Opacidad aumentada para mejor contraste */}
            <div className="absolute inset-0 bg-gradient-to-r from-eg-purple/95 via-eg-purple/80 to-eg-purple/40" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-eg-dark/40" />
          </motion.div>

          {/* CAPA 2: Decorative Elements con Parallax y animaciones */}
          <motion.div className="absolute inset-0 pointer-events-none" style={{ y: y2, opacity }}>
            <motion.div
              className="absolute top-10 left-10 w-20 h-20 bg-eg-pink/30 rounded-full blur-3xl"
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute bottom-10 right-10 w-32 h-32 bg-eg-purple/20 rounded-full blur-3xl"
              animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            />

            {/* Elementos flotantes adicionales */}
            <motion.div
              className="absolute top-1/4 right-[15%] w-4 h-4 bg-eg-pink/40 rounded-full hidden lg:block"
              animate={{ y: [0, -20, 0], x: [0, 10, 0], opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute top-1/3 left-[20%] w-3 h-3 bg-white/30 rounded-full hidden lg:block"
              animate={{ y: [0, 15, 0], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            />
            <motion.div
              className="absolute bottom-1/4 left-[10%] w-5 h-5 bg-eg-pink/30 rounded-full hidden lg:block"
              animate={{ y: [0, -15, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            />
            <motion.div
              className="absolute top-[40%] right-[8%] w-6 h-6 bg-white/20 rounded-full hidden xl:block"
              animate={{ y: [0, 12, 0], x: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
            />

            {/* Líneas decorativas sutiles */}
            <svg className="absolute inset-0 w-full h-full opacity-10" preserveAspectRatio="none">
              <motion.line
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: 0.5 }}
                x1="0" y1="100%" x2="60%" y2="0"
                stroke="white"
                strokeWidth="1"
              />
            </svg>
          </motion.div>

          {/* CAPA 3: Content con Parallax suave */}
          <motion.div className="relative h-full flex items-center z-10" style={{ y: y3 }}>
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="max-w-2xl"
              >
                {slides[currentSlide].badge_text && (
                  <motion.span
                    className={`inline-block px-4 py-2 rounded-full text-sm font-medium mb-4 shadow-md ${
                      slides[currentSlide].badge_color === 'pink' ? 'bg-eg-pink text-eg-purple' :
                      slides[currentSlide].badge_color === 'purple' ? 'bg-eg-purple text-white' :
                      slides[currentSlide].badge_color === 'blue' ? 'bg-blue-500 text-white' :
                      slides[currentSlide].badge_color === 'green' ? 'bg-green-500 text-white' :
                      slides[currentSlide].badge_color === 'red' ? 'bg-red-500 text-white' :
                      slides[currentSlide].badge_color === 'yellow' ? 'bg-yellow-500 text-gray-900' :
                      'bg-eg-pink text-eg-purple'
                    }`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <motion.span
                      className="inline-block w-2 h-2 rounded-full bg-current mr-2"
                      animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    {slides[currentSlide].badge_text}
                  </motion.span>
                )}

                <motion.h1
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl
                             font-normal text-white mb-4
                             [text-shadow:_0_2px_8px_rgb(0_0_0_/_60%)]"
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  {slides[currentSlide].title}
                </motion.h1>

                {slides[currentSlide].subtitle && (
                  <motion.p
                    className="text-lg sm:text-xl md:text-2xl
                               mb-2 text-white/95 font-light
                               [text-shadow:_0_1px_6px_rgb(0_0_0_/_50%)]"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                  >
                    {slides[currentSlide].subtitle}
                  </motion.p>
                )}

                {slides[currentSlide].description && (
                  <motion.p
                    className="text-base sm:text-lg mb-6 sm:mb-8 text-white/90
                               [text-shadow:_0_1px_4px_rgb(0_0_0_/_40%)]"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                  >
                    {slides[currentSlide].description}
                  </motion.p>
                )}

                <motion.div
                  className="flex flex-wrap gap-4"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                >
                  {slides[currentSlide].cta1_text && slides[currentSlide].cta1_link && (() => {
                    const Icon1 = getIconComponent(slides[currentSlide].cta1_icon);
                    return (
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                        <Link
                          to={slides[currentSlide].cta1_link}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-eg-purple rounded-lg
                                   font-medium shadow-lg hover:shadow-xl transition-shadow"
                        >
                          <Icon1 />
                          {slides[currentSlide].cta1_text}
                          <motion.span
                            animate={{ x: [0, 4, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <FaArrowRight className="w-3 h-3" />
                          </motion.span>
                        </Link>
                      </motion.div>
                    );
                  })()}

                  {slides[currentSlide].cta2_text && slides[currentSlide].cta2_link && (() => {
                    const Icon2 = getIconComponent(slides[currentSlide].cta2_icon);
                    return (
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                        <Link
                          to={slides[currentSlide].cta2_link}
                          className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white
                                   text-white rounded-lg font-medium hover:bg-white/10
                                   transition-all backdrop-blur-sm"
                        >
                          <Icon2 />
                          {slides[currentSlide].cta2_text}
                        </Link>
                      </motion.div>
                    );
                  })()}
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows con micro-interacciones */}
      <motion.button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 backdrop-blur-sm
                 rounded-xl text-white border border-white/20"
        aria-label="Previous slide"
        whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.2)', x: -3 }}
        whileTap={{ scale: 0.95 }}
      >
        <FaChevronLeft className="text-xl" />
      </motion.button>

      <motion.button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 backdrop-blur-sm
                 rounded-xl text-white border border-white/20"
        aria-label="Next slide"
        whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.2)', x: 3 }}
        whileTap={{ scale: 0.95 }}
      >
        <FaChevronRight className="text-xl" />
      </motion.button>

      {/* Dots Navigation mejorado */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
        {slides.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all rounded-full ${
              index === currentSlide
                ? 'w-10 h-2 bg-white'
                : 'w-2 h-2 bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
            whileHover={{ scale: 1.2, backgroundColor: 'rgba(255,255,255,0.8)' }}
            whileTap={{ scale: 0.9 }}
          />
        ))}
      </div>

      {/* Scroll indicator para desktop */}
      <motion.div
        className="absolute bottom-20 left-1/2 -translate-x-1/2 hidden lg:flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <span className="text-white/60 text-xs uppercase tracking-wider">Explorar</span>
        <motion.div
          className="w-5 h-8 border-2 border-white/30 rounded-full flex justify-center pt-1"
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.div
            className="w-1 h-2 bg-white/60 rounded-full"
            animate={{ y: [0, 8, 0], opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroCarouselEG;