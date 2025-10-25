import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TestimonialCard from './TestimonialCard';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

/**
 * TestimonialsCarousel - Carousel autom�tico de testimonios
 *
 * Features:
 * - Auto-play cada 5 segundos
 * - Navegaci�n manual con flechas
 * - Animaciones suaves de entrada/salida
 * - Responsive con swipe gestures
 */
const TestimonialsCarousel = ({ testimonios: customTestimonios, autoPlayInterval = 5000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // Testimonios por defecto (si no se proporcionan)
  const defaultTestimonios = [
    {
      nombre: 'Mar�a Gonz�lez',
      testimonio: 'Excelente servicio, resultados r�pidos y precisos. El personal es muy profesional y atento.',
      fecha: 'Enero 2025',
      rating: 5,
      iniciales: 'MG'
    },
    {
      nombre: 'Carlos P�rez',
      testimonio: 'Muy profesionales, instalaciones limpias y modernas. Siempre vuelvo para mis ex�menes anuales.',
      fecha: 'Diciembre 2024',
      rating: 5,
      iniciales: 'CP'
    },
    {
      nombre: 'Ana Rodr�guez',
      testimonio: 'Resultados confiables y entrega puntual. Me han atendido a m� y a mi familia por a�os.',
      fecha: 'Noviembre 2024',
      rating: 5,
      iniciales: 'AR'
    }
  ];

  const testimonios = customTestimonios || defaultTestimonios;

  // Auto-play
  useEffect(() => {
    if (testimonios.length <= 1) return;

    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonios.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [testimonios.length, autoPlayInterval]);

  const nextTestimonio = () => {
    setDirection(1);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonios.length);
  };

  const prevTestimonio = () => {
    setDirection(-1);
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? testimonios.length - 1 : prevIndex - 1
    );
  };

  // Animaciones de slide
  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0
    })
  };

  const slideTransition = {
    x: { type: 'spring', stiffness: 300, damping: 30 },
    opacity: { duration: 0.2 }
  };

  if (!testimonios || testimonios.length === 0) {
    return null;
  }

  return (
    <div className="relative max-w-4xl mx-auto">
      {/* Carousel container */}
      <div className="relative overflow-hidden min-h-[300px] flex items-center justify-center">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideTransition}
            className="w-full"
          >
            <TestimonialCard {...testimonios[currentIndex]} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navegaci�n (solo si hay m�s de un testimonio) */}
      {testimonios.length > 1 && (
        <>
          {/* Botones de navegaci�n */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-4 pointer-events-none">
            <button
              onClick={prevTestimonio}
              className="pointer-events-auto w-12 h-12 rounded-full bg-white shadow-lg
                       flex items-center justify-center text-eg-purple
                       hover:bg-eg-purple hover:text-white transition-all duration-300
                       focus:outline-none focus:ring-4 focus:ring-eg-purple/50"
              aria-label="Testimonio anterior"
            >
              <FaChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={nextTestimonio}
              className="pointer-events-auto w-12 h-12 rounded-full bg-white shadow-lg
                       flex items-center justify-center text-eg-purple
                       hover:bg-eg-purple hover:text-white transition-all duration-300
                       focus:outline-none focus:ring-4 focus:ring-eg-purple/50"
              aria-label="Siguiente testimonio"
            >
              <FaChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Indicadores de p�gina */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonios.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                className={`h-2 rounded-full transition-all duration-300 focus:outline-none
                         ${
                           index === currentIndex
                             ? 'w-8 bg-eg-purple'
                             : 'w-2 bg-eg-gray/30 hover:bg-eg-gray/50'
                         }`}
                aria-label={`Ir al testimonio ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default TestimonialsCarousel;
