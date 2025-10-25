import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight, FaCalendarAlt, FaFlask, FaClock, FaUserMd, FaWhatsapp } from 'react-icons/fa';

const HeroCarouselEG = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      title: "Tu salud es nuestra prioridad",
      subtitle: "Tecnología de vanguardia y atención personalizada",
      description: "43 años de experiencia cuidando de ti y tu familia",
      image: "https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=1920",
      cta1: { text: "Agenda tu cita", link: "/contacto" },
      cta2: { text: "Ver estudios", link: "/estudios" }
    },
    {
      id: 2,
      title: "Check-up desde $599",
      subtitle: "Paquetes preventivos con descuentos especiales",
      description: "Incluye más de 25 estudios esenciales",
      image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1920",
      cta1: { text: "Ver paquetes", link: "/estudios" },
      badge: "30% descuento"
    },
    {
      id: 3,
      title: "Resultados en 24 horas",
      subtitle: "Portal en línea y notificaciones por WhatsApp",
      description: "Accede a tus resultados desde cualquier dispositivo",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1920",
      cta1: { text: "Portal de resultados", link: "/resultados" }
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="relative h-[450px] md:h-[500px] mt-20 overflow-hidden bg-gradient-to-b from-white to-eg-light-gray">
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
            <img
              src={slides[currentSlide].image}
              alt={slides[currentSlide].title}
              className="w-full h-full object-cover"
            />
            {/* Directorio-style gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-eg-purple/90 via-eg-purple/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-eg-dark/30" />
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
                {slides[currentSlide].badge && (
                  <span className="inline-block px-4 py-2 bg-eg-pink text-eg-purple rounded-full text-sm font-medium mb-4 shadow-md">
                    {slides[currentSlide].badge}
                  </span>
                )}

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-normal text-white mb-4">
                  {slides[currentSlide].title}
                </h1>
                
                <p className="text-xl md:text-2xl mb-2 text-white/90 font-light">
                  {slides[currentSlide].subtitle}
                </p>
                
                <p className="text-lg mb-8 text-white/80">
                  {slides[currentSlide].description}
                </p>

                <div className="flex flex-wrap gap-4">
                  {slides[currentSlide].cta1 && (
                    <Link
                      to={slides[currentSlide].cta1.link}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white text-eg-purple rounded-lg 
                               font-medium hover:shadow-[0_8px_24px_rgba(255,255,255,0.3)] 
                               transition-all transform hover:scale-105"
                    >
                      <FaCalendarAlt />
                      {slides[currentSlide].cta1.text}
                    </Link>
                  )}
                  
                  {slides[currentSlide].cta2 && (
                    <Link
                      to={slides[currentSlide].cta2.link}
                      className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white 
                               text-white rounded-lg font-medium hover:bg-white/10 
                               transition-all backdrop-blur-sm"
                    >
                      <FaFlask />
                      {slides[currentSlide].cta2.text}
                    </Link>
                  )}
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