import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight, FaCalendarAlt, FaFlask, FaClock, FaUserMd, FaWhatsapp } from 'react-icons/fa';

const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      title: "Tu salud es nuestra prioridad",
      subtitle: "Tecnología de vanguardia y atención personalizada",
      description: "43 años de experiencia cuidando de ti y tu familia",
      image: "https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=1920",
      cta1: { text: "Agenda tu cita hoy", link: "/contacto", icon: FaCalendarAlt },
      cta2: { text: "Ver estudios", link: "/estudios", icon: FaFlask },
      overlay: "from-purple-900/80 via-purple-800/60 to-transparent"
    },
    {
      id: 2,
      title: "Check-up completo desde $599",
      subtitle: "Paquetes preventivos con descuentos especiales",
      description: "Incluye más de 25 estudios esenciales",
      image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1920",
      cta1: { text: "Ver paquetes", link: "/estudios", icon: FaFlask },
      badge: "30% descuento",
      overlay: "from-pink-900/80 via-pink-800/60 to-transparent"
    },
    {
      id: 3,
      title: "Resultados en 24 horas",
      subtitle: "Portal en línea y notificaciones por WhatsApp",
      description: "Accede a tus resultados desde cualquier dispositivo",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1920",
      cta1: { text: "Portal de resultados", link: "/resultados", icon: FaClock },
      cta2: { text: "WhatsApp disponible", link: "https://wa.me/584149019327", icon: FaWhatsapp, external: true },
      overlay: "from-blue-900/80 via-blue-800/60 to-transparent"
    },
    {
      id: 4,
      title: "43 años cuidando de ti",
      subtitle: "Personal altamente calificado y certificado",
      description: "Cumplimos con los más altos estándares de calidad",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=1920",
      cta1: { text: "Conoce nuestro equipo", link: "/nosotros", icon: FaUserMd },
      certifications: ["ISO 9001:2015", "MPPS", "SVB"],
      overlay: "from-green-900/80 via-green-800/60 to-transparent"
    }
  ];

  // Auto-advance slides
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
    <section className="relative h-[400px] md:h-[500px] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <img
              src={slides[currentSlide].image}
              alt={slides[currentSlide].title}
              className="w-full h-full object-cover"
            />
            <div className={`absolute inset-0 bg-gradient-to-r ${slides[currentSlide].overlay}`} />
            <div className="absolute inset-0 bg-black/30" />
          </div>

          {/* Content */}
          <div className="relative h-full flex items-center">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="max-w-3xl text-white"
              >
                {slides[currentSlide].badge && (
                  <span className="inline-block px-4 py-2 bg-yellow-400 text-gray-900 rounded-full text-sm font-bold mb-4">
                    {slides[currentSlide].badge}
                  </span>
                )}
                
                <h1 className="text-4xl md:text-6xl font-bold mb-4">
                  {slides[currentSlide].title}
                </h1>
                
                <p className="text-xl md:text-2xl mb-2 text-white/90">
                  {slides[currentSlide].subtitle}
                </p>
                
                <p className="text-lg mb-8 text-white/80">
                  {slides[currentSlide].description}
                </p>

                {slides[currentSlide].certifications && (
                  <div className="flex flex-wrap gap-3 mb-6">
                    {slides[currentSlide].certifications.map((cert, idx) => (
                      <span key={idx} className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                        ✓ {cert}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-4">
                  {slides[currentSlide].cta1 && (
                    slides[currentSlide].cta1.external ? (
                      <a
                        href={slides[currentSlide].cta1.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 rounded-full font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl"
                      >
                        {React.createElement(slides[currentSlide].cta1.icon, { className: "text-xl" })}
                        {slides[currentSlide].cta1.text}
                      </a>
                    ) : (
                      <Link
                        to={slides[currentSlide].cta1.link}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 rounded-full font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl"
                      >
                        {React.createElement(slides[currentSlide].cta1.icon, { className: "text-xl" })}
                        {slides[currentSlide].cta1.text}
                      </Link>
                    )
                  )}
                  
                  {slides[currentSlide].cta2 && (
                    slides[currentSlide].cta2.external ? (
                      <a
                        href={slides[currentSlide].cta2.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white text-white rounded-full font-semibold hover:bg-white/10 transition-all backdrop-blur-sm"
                      >
                        {React.createElement(slides[currentSlide].cta2.icon, { className: "text-xl" })}
                        {slides[currentSlide].cta2.text}
                      </a>
                    ) : (
                      <Link
                        to={slides[currentSlide].cta2.link}
                        className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white text-white rounded-full font-semibold hover:bg-white/10 transition-all backdrop-blur-sm"
                      >
                        {React.createElement(slides[currentSlide].cta2.icon, { className: "text-xl" })}
                        {slides[currentSlide].cta2.text}
                      </Link>
                    )
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all"
        aria-label="Previous slide"
      >
        <FaChevronLeft className="text-2xl" />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-all"
        aria-label="Next slide"
      >
        <FaChevronRight className="text-2xl" />
      </button>

      {/* Dots Navigation */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentSlide 
                ? 'w-8 bg-white' 
                : 'bg-white/50 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroCarousel;