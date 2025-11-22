import React, { useState, useEffect } from 'react';
/* eslint-disable-next-line no-unused-vars */
import { motion, AnimatePresence } from 'framer-motion';
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
          {/* Background with Overlay */}
          <div className="absolute inset-0">
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
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-eg-pink/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-eg-purple/10 rounded-full blur-3xl"></div>

          {/* Content */}
          <div className="relative h-full flex items-center">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="max-w-2xl"
              >
                {slides[currentSlide].badge_text && (
                  <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium mb-4 shadow-md ${
                    slides[currentSlide].badge_color === 'pink' ? 'bg-eg-pink text-eg-purple' :
                    slides[currentSlide].badge_color === 'purple' ? 'bg-eg-purple text-white' :
                    slides[currentSlide].badge_color === 'blue' ? 'bg-blue-500 text-white' :
                    slides[currentSlide].badge_color === 'green' ? 'bg-green-500 text-white' :
                    slides[currentSlide].badge_color === 'red' ? 'bg-red-500 text-white' :
                    slides[currentSlide].badge_color === 'yellow' ? 'bg-yellow-500 text-gray-900' :
                    'bg-eg-pink text-eg-purple'
                  }`}>
                    {slides[currentSlide].badge_text}
                  </span>
                )}

                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl
                               font-normal text-white mb-4
                               [text-shadow:_0_2px_8px_rgb(0_0_0_/_60%)]">
                  {slides[currentSlide].title}
                </h1>

                {slides[currentSlide].subtitle && (
                  <p className="text-lg sm:text-xl md:text-2xl
                                mb-2 text-white/95 font-light
                                [text-shadow:_0_1px_6px_rgb(0_0_0_/_50%)]">
                    {slides[currentSlide].subtitle}
                  </p>
                )}

                {slides[currentSlide].description && (
                  <p className="text-base sm:text-lg mb-6 sm:mb-8 text-white/90
                                [text-shadow:_0_1px_4px_rgb(0_0_0_/_40%)]">
                    {slides[currentSlide].description}
                  </p>
                )}

                <div className="flex flex-wrap gap-4">
                  {slides[currentSlide].cta1_text && slides[currentSlide].cta1_link && (() => {
                    const Icon1 = getIconComponent(slides[currentSlide].cta1_icon);
                    return (
                      <Link
                        to={slides[currentSlide].cta1_link}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white text-eg-purple rounded-lg
                                 font-medium hover:shadow-[0_8px_24px_rgba(255,255,255,0.3)]
                                 transition-all transform hover:scale-105"
                      >
                        <Icon1 />
                        {slides[currentSlide].cta1_text}
                      </Link>
                    );
                  })()}

                  {slides[currentSlide].cta2_text && slides[currentSlide].cta2_link && (() => {
                    const Icon2 = getIconComponent(slides[currentSlide].cta2_icon);
                    return (
                      <Link
                        to={slides[currentSlide].cta2_link}
                        className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white
                                 text-white rounded-lg font-medium hover:bg-white/10
                                 transition-all backdrop-blur-sm"
                      >
                        <Icon2 />
                        {slides[currentSlide].cta2_text}
                      </Link>
                    );
                  })()}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows - Directorio Style */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 backdrop-blur-sm 
                 rounded-lg text-white hover:bg-white/20 transition-all"
        aria-label="Previous slide"
      >
        <FaChevronLeft className="text-xl" />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 backdrop-blur-sm 
                 rounded-lg text-white hover:bg-white/20 transition-all"
        aria-label="Next slide"
      >
        <FaChevronRight className="text-xl" />
      </button>

      {/* Dots Navigation - Directorio Style */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all ${
              index === currentSlide 
                ? 'w-8 h-2 bg-white rounded-full' 
                : 'w-2 h-2 bg-white/50 hover:bg-white/70 rounded-full'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroCarouselEG;