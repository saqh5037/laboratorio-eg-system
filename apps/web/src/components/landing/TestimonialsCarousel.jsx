import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

/**
 * TestimonialsCarousel Component
 * Carousel específico para mostrar testimonios de pacientes
 *
 * @param {Object} props
 * @param {Object} props.section - Configuración de la sección
 * @param {Object} props.content - Contenido de landing
 */
const TestimonialsCarousel = ({ section, content }) => {
  const {
    dataSource,
    autoplay = true,
    interval = 5000,
    showRating = true,
    showAvatar = true,
    showDots = true,
    backgroundColor = 'white',
    textColor = 'gray-900',
    decorativeBlobs = false
  } = section.layout_config;

  // Obtener testimonios
  const testimonials = content[dataSource] || [];
  const [currentIndex, setCurrentIndex] = useState(0);

  // Si no hay testimonios, no renderizar
  if (testimonials.length === 0) {
    if (import.meta.env.DEV) {
      return (
        <section className="py-8 bg-yellow-50">
          <div className="container mx-auto px-4">
            <p className="text-yellow-800">
              ⚠️ No hay testimonios para mostrar
            </p>
          </div>
        </section>
      );
    }
    return null;
  }

  const currentTestimonial = testimonials[currentIndex];

  // Autoplay
  useEffect(() => {
    if (!autoplay || testimonials.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoplay, interval, testimonials.length]);

  // Navegación
  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToIndex = (index) => {
    setCurrentIndex(index);
  };

  // Render rating stars
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-5 h-5 ${
            i < rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'fill-gray-300 text-gray-300'
          }`}
        />
      );
    }
    return stars;
  };

  return (
    <section
      id={section.section_key}
      className={`relative py-12 md:py-20 bg-${backgroundColor} overflow-hidden`}
    >
      {/* Decorative Blobs */}
      {decorativeBlobs && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-eg-pink/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-eg-purple/20 rounded-full blur-3xl" />
        </div>
      )}

      <div className="relative z-10 max-w-[1600px] mx-auto px-6 md:px-12 lg:px-24">
        {/* Section Header */}
        {(section.title || section.subtitle) && (
          <div className="text-center mb-12">
            {section.title && (
              <h2 className={`text-3xl md:text-4xl font-normal text-${textColor} mb-4`}>
                {section.title}
              </h2>
            )}
            {section.subtitle && (
              <p className={`text-lg md:text-xl text-${textColor} max-w-3xl mx-auto`}>
                {section.subtitle}
              </p>
            )}
          </div>
        )}

        {/* Testimonial Card */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 relative">
            {/* Navigation Arrows */}
            {testimonials.length > 1 && (
              <>
                <button
                  onClick={goToPrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-eg-purple/10 hover:bg-eg-purple/20 transition-colors"
                  aria-label="Anterior testimonio"
                >
                  <ChevronLeft className="w-6 h-6 text-eg-purple" />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-eg-purple/10 hover:bg-eg-purple/20 transition-colors"
                  aria-label="Siguiente testimonio"
                >
                  <ChevronRight className="w-6 h-6 text-eg-purple" />
                </button>
              </>
            )}

            {/* Rating */}
            {showRating && currentTestimonial.rating && (
              <div className="flex justify-center gap-1 mb-6">
                {renderStars(currentTestimonial.rating)}
              </div>
            )}

            {/* Quote */}
            <blockquote className="text-center mb-8">
              <p className="text-lg md:text-xl text-gray-700 leading-relaxed italic">
                "{currentTestimonial.quote}"
              </p>
            </blockquote>

            {/* Author */}
            <div className="flex items-center justify-center gap-4">
              {showAvatar && currentTestimonial.avatar_url && (
                <img
                  src={currentTestimonial.avatar_url}
                  alt={currentTestimonial.patient_name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              )}
              <div className="text-center">
                <p className="font-semibold text-gray-900">
                  {currentTestimonial.patient_name}
                </p>
                {currentTestimonial.date && (
                  <p className="text-sm text-gray-500">
                    {new Date(currentTestimonial.date).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long'
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Dots Navigation */}
          {showDots && testimonials.length > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentIndex
                      ? 'bg-eg-purple w-8'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Ir a testimonio ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsCarousel;
