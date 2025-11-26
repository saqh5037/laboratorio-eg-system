import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaStar,
  FaQuoteLeft,
  FaUserMd,
  FaHospital,
  FaHotel,
  FaBuilding,
  FaChevronLeft,
  FaChevronRight,
  FaUsers,
  FaThumbsUp,
  FaClock
} from 'react-icons/fa';

// Icon mapping for testimonials
const iconMapTestimonials = {
  FaUserMd: FaUserMd,
  FaHospital: FaHospital,
  FaHotel: FaHotel,
  FaBuilding: FaBuilding,
  FaUser: FaUsers,
  FaUserTie: FaBuilding
};

/**
 * TestimoniosSection Component
 * Sección de testimonios con carrusel para la landing de Dimogen
 * Recibe testimonios dinámicos desde la API
 */
const TestimoniosSection = ({ testimonials: propsTestimonials = [], loading = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  // Colors for testimonials based on index
  const colors = ['#0047CB', '#98CB59', '#E11D48', '#F59E0B', '#00A3E0'];

  // Transform API testimonials to component format
  const testimonios = propsTestimonials.map((t, index) => ({
    id: t.id,
    name: t.name,
    role: t.role,
    company: '', // Already included in role from API
    avatar: t.avatar_url || null,
    rating: t.rating || 5,
    text: t.text,
    icon: iconMapTestimonials[t.avatar_type] || FaUserMd,
    color: colors[index % colors.length]
  }));

  // Estadísticas - could also be passed as props
  const stats = [
    { icon: FaUsers, value: '10,000+', label: 'Pacientes atendidos' },
    { icon: FaThumbsUp, value: '98%', label: 'Satisfacción' },
    { icon: FaClock, value: '25+', label: 'Años de experiencia' }
  ];

  // Auto-play del carrusel - MUST be before any conditional returns (React hooks rules)
  useEffect(() => {
    if (!autoPlay || testimonios.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonios.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoPlay, testimonios.length]);

  // Show loading skeleton
  if (loading || testimonios.length === 0) {
    return (
      <section id="testimonios" className="relative py-24 md:py-32 bg-gradient-to-b from-gray-50 to-white overflow-hidden scroll-mt-20">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 lg:px-24">
          <div className="text-center mb-16 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
            <div className="h-12 bg-gray-200 rounded w-1/3 mx-auto"></div>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-100 rounded-3xl h-[300px] animate-pulse"></div>
          </div>
        </div>
      </section>
    );
  }

  const handlePrev = () => {
    setAutoPlay(false);
    setCurrentIndex((prev) => (prev - 1 + testimonios.length) % testimonios.length);
  };

  const handleNext = () => {
    setAutoPlay(false);
    setCurrentIndex((prev) => (prev + 1) % testimonios.length);
  };

  const handleDotClick = (index) => {
    setAutoPlay(false);
    setCurrentIndex(index);
  };

  return (
    <section
      id="testimonios"
      className="relative py-24 md:py-32 bg-gradient-to-b from-gray-50 to-white overflow-hidden scroll-mt-20"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#0047CB]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#98CB59]/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 lg:px-24">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-[#0047CB]/10 rounded-full mb-6">
            <FaStar className="w-5 h-5 text-[#0047CB]" />
            <span className="text-[#0047CB] font-semibold"
                  style={{ fontFamily: "'Poppins', sans-serif" }}>
              TESTIMONIOS
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 mb-6"
              style={{ fontFamily: "'Poppins', sans-serif" }}>
            Lo que dicen nuestros clientes
          </h2>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto"
             style={{ fontFamily: "'Poppins', sans-serif" }}>
            La confianza de médicos, hospitales y empresas respalda nuestra calidad
          </p>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-wrap justify-center gap-8 mb-16"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="flex items-center gap-4 px-6 py-4 bg-white rounded-2xl shadow-lg border border-gray-100">
                <div className="w-14 h-14 rounded-xl bg-[#0047CB]/10 flex items-center justify-center">
                  <Icon className="w-7 h-7 text-[#0047CB]" />
                </div>
                <div>
                  <span className="block text-2xl font-bold text-gray-900"
                        style={{ fontFamily: "'Poppins', sans-serif" }}>
                    {stat.value}
                  </span>
                  <span className="text-sm text-gray-600"
                        style={{ fontFamily: "'Poppins', sans-serif" }}>
                    {stat.label}
                  </span>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Testimonials Carousel */}
        <div className="relative max-w-4xl mx-auto">
          {/* Navigation Buttons */}
          <button
            onClick={handlePrev}
            className="absolute left-2 md:left-0 top-1/2 -translate-y-1/2 md:-translate-x-4 lg:-translate-x-12
                     w-10 h-10 md:w-12 md:h-12 rounded-full bg-white shadow-lg border border-gray-100
                     flex items-center justify-center text-gray-600 hover:text-[#0047CB]
                     hover:border-[#0047CB] transition-all duration-300 z-10"
            aria-label="Anterior"
          >
            <FaChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-2 md:right-0 top-1/2 -translate-y-1/2 md:translate-x-4 lg:translate-x-12
                     w-10 h-10 md:w-12 md:h-12 rounded-full bg-white shadow-lg border border-gray-100
                     flex items-center justify-center text-gray-600 hover:text-[#0047CB]
                     hover:border-[#0047CB] transition-all duration-300 z-10"
            aria-label="Siguiente"
          >
            <FaChevronRight className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          {/* Testimonial Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-3xl shadow-xl px-12 py-8 md:p-12 border border-gray-100 mx-2 md:mx-0"
            >
              {/* Quote Icon */}
              <div className="absolute -top-4 left-8 w-10 h-10 rounded-full flex items-center justify-center"
                   style={{ backgroundColor: testimonios[currentIndex].color }}>
                <FaQuoteLeft className="w-5 h-5 text-white" />
              </div>

              {/* Rating */}
              <div className="flex justify-center gap-1 mb-6">
                {[...Array(testimonios[currentIndex].rating)].map((_, i) => (
                  <FaStar key={i} className="w-6 h-6 text-yellow-400" />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-xl md:text-2xl text-gray-700 text-center leading-relaxed mb-8"
                 style={{ fontFamily: "'Poppins', sans-serif" }}>
                "{testimonios[currentIndex].text}"
              </p>

              {/* Author */}
              <div className="flex flex-col items-center">
                {/* Avatar */}
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                     style={{ backgroundColor: `${testimonios[currentIndex].color}20` }}>
                  {testimonios[currentIndex].avatar ? (
                    <img
                      src={testimonios[currentIndex].avatar}
                      alt={testimonios[currentIndex].name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    React.createElement(testimonios[currentIndex].icon, {
                      className: 'w-8 h-8',
                      style: { color: testimonios[currentIndex].color }
                    })
                  )}
                </div>

                <h4 className="text-lg font-semibold text-gray-900"
                    style={{ fontFamily: "'Poppins', sans-serif" }}>
                  {testimonios[currentIndex].name}
                </h4>
                <p className="text-gray-600"
                   style={{ fontFamily: "'Poppins', sans-serif" }}>
                  {testimonios[currentIndex].role}
                </p>
                <p className="text-sm font-medium"
                   style={{ color: testimonios[currentIndex].color, fontFamily: "'Poppins', sans-serif" }}>
                  {testimonios[currentIndex].company}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dots Navigation */}
          <div className="flex justify-center gap-3 mt-8">
            {testimonios.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-[#0047CB] w-8'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Ir al testimonio ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Trust Note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-center text-sm text-gray-500 mt-12"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          * Testimonios de clientes verificados. Nombres e instituciones usados con permiso.
        </motion.p>
      </div>
    </section>
  );
};

export default TestimoniosSection;
