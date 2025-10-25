import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaWhatsapp, FaPhone, FaCertificate, FaUserMd, FaMapMarkerAlt } from 'react-icons/fa';
import { useUnifiedApp } from '../contexts/UnifiedAppContext';
import Hero from '../components/Hero';
import StudyCard from '../components/StudyCard';
import ServiceCard from '../components/ServiceCard';
import TestimonialsCarousel from '../components/TestimonialsCarousel';
import { estudiosData } from '../data/estudiosData';
import { staggerContainer, staggerItem, slideUpVariants } from '../utils/animations';

const Home = ({ onStudySelect, onBudgetOpen, openBudget }) => {
  const { searchTerm, filters } = useUnifiedApp();
  const [featuredStudies, setFeaturedStudies] = useState([]);

  useEffect(() => {
    // Open budget calculator if requested
    if (openBudget) {
      onBudgetOpen();
    }
  }, [openBudget, onBudgetOpen]);

  useEffect(() => {
    // Get featured studies (perfiles)
    const featured = estudiosData.filter(e => e.tipo === 'perfil' || e.nombre?.includes('Perfil')).slice(0, 6);
    // If no profiles found, show first 6 studies
    setFeaturedStudies(featured.length > 0 ? featured : estudiosData.slice(0, 6));
  }, []);

  // Servicios principales (con iconografía unificada - NO emojis)
  const serviciosPrincipales = [
    { nombre: 'Hematología', area: 'hematologia', count: 45 },
    { nombre: 'Química Sanguínea', area: 'quimica', count: 38 },
    { nombre: 'Inmunología', area: 'inmunologia', count: 52 },
    { nombre: 'Endocrinología', area: 'endocrinologia', count: 29 },
    { nombre: 'Microbiología', area: 'microbiologia', count: 33 },
    { nombre: 'Parasitología', area: 'parasitologia', count: 18 }
  ];

  return (
    <div className="min-h-screen">
      {/* 1. HERO INSTITUCIONAL VIBRANTE */}
      <Hero onSearch={onStudySelect} />

      {/* 2. QUIÉNES SOMOS - Bloque emocional */}
      <section id="quienes-somos" className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 gap-12 md:gap-16 items-center"
          >
            {/* Izquierda: Placeholder foto institucional */}
            <motion.div variants={staggerItem} className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl hover:shadow-eg-purple transition-shadow duration-300">
                <div className="aspect-[4/3] bg-gradient-to-br from-eg-purple/10 via-eg-pink/5 to-eg-purple/10
                              flex items-center justify-center p-12">
                  <div className="text-center">
                    <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-eg-purple to-eg-pink rounded-full
                                  flex items-center justify-center shadow-xl">
                      <FaUserMd className="text-6xl text-white" />
                    </div>
                    <p className="text-2xl font-normal text-eg-purple mb-2">Equipo de bioanalistas</p>
                    <p className="text-lg font-normal text-eg-gray">Certificados y especializados</p>
                  </div>
                </div>
              </div>

              {/* Badge flotante */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="absolute -bottom-6 -right-6 bg-white rounded-2xl shadow-2xl p-6
                         border-2 border-eg-purple/20 z-10"
              >
                <div className="text-5xl font-normal text-eg-purple mb-1">43</div>
                <div className="text-base font-normal text-eg-gray">años de experiencia</div>
              </motion.div>
            </motion.div>

            {/* Derecha: Texto emocional */}
            <motion.div variants={staggerItem}>
              <h2 className="text-4xl md:text-5xl font-normal text-eg-purple mb-6 leading-tight">
                Experiencia que inspira confianza
              </h2>
              <p className="text-xl md:text-2xl font-normal text-eg-dark leading-relaxed mb-8">
                Desde 1982, LaboratorioEG ha sido el referente en análisis clínicos en Caracas.
                Más de 50 bioanalistas certificados trabajan día a día para ofrecerte
                resultados precisos y oportunos.
              </p>

              {/* Certificaciones */}
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-3 bg-eg-purple/5 px-4 py-3 rounded-xl">
                  <FaCertificate className="text-3xl text-eg-purple flex-shrink-0" />
                  <span className="text-base md:text-lg font-normal text-eg-dark">MPPS Certificado</span>
                </div>
                <div className="flex items-center gap-3 bg-eg-pink/10 px-4 py-3 rounded-xl">
                  <FaCertificate className="text-3xl text-eg-pink flex-shrink-0" />
                  <span className="text-base md:text-lg font-normal text-eg-dark">ISO 9001:2015</span>
                </div>
              </div>

              <a
                href="#contacto"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-eg-purple to-eg-pink
                         text-white rounded-full text-lg font-normal
                         hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                Conoce más sobre nosotros
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 3. QUÉ OFRECEMOS - Servicios principales con iconografía unificada */}
      <section id="servicios" className="py-16 md:py-20 bg-gradient-to-br from-eg-purple/5 to-eg-pink/5">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="text-center mb-12 md:mb-16"
          >
            <motion.h2
              variants={staggerItem}
              className="text-4xl md:text-5xl font-normal text-eg-purple mb-6"
            >
              Nuestros Servicios
            </motion.h2>
            <motion.p
              variants={staggerItem}
              className="text-xl md:text-2xl font-normal text-eg-dark max-w-3xl mx-auto leading-relaxed"
            >
              Más de 100 estudios clínicos con tecnología de punta y resultados garantizados
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8 mb-12"
          >
            {serviciosPrincipales.map((servicio, index) => (
              <motion.div key={servicio.nombre} variants={staggerItem}>
                <ServiceCard
                  {...servicio}
                  onClick={() => console.log(`Navegar a ${servicio.nombre}`)}
                />
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            {...slideUpVariants}
            className="text-center"
          >
            <button
              onClick={() => onStudySelect && onStudySelect()}
              className="px-10 py-5 bg-gradient-to-r from-eg-purple to-eg-pink
                       text-white rounded-full text-xl md:text-2xl font-normal
                       hover:shadow-2xl hover:scale-105 active:scale-95
                       transition-all duration-300 inline-flex items-center justify-center gap-3
                       focus:outline-none focus:ring-4 focus:ring-eg-purple/50"
            >
              Ver todos los estudios
            </button>
          </motion.div>
        </div>
      </section>

      {/* Featured Studies */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-normal text-eg-purple mb-6">
              Perfiles Recomendados
            </h2>
            <p className="text-xl md:text-2xl font-normal text-eg-dark max-w-3xl mx-auto leading-relaxed">
              Paquetes completos con descuentos especiales
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12">
            {featuredStudies.map((study, index) => (
              <motion.div
                key={study.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <StudyCard
                  study={study}
                  onViewDetails={() => onStudySelect && onStudySelect(study)}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-eg-purple to-eg-purple/80">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl md:text-5xl font-normal text-white mb-6">
              ¿Necesitas realizar múltiples estudios?
            </h2>
            <p className="text-xl md:text-2xl font-normal text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
              Usa nuestra calculadora de presupuesto y obtén descuentos automáticos por volumen.
              Genera tu presupuesto en PDF y compártelo fácilmente.
            </p>
            <button
              onClick={onBudgetOpen}
              className="px-10 py-6 min-h-[48px] bg-white text-eg-purple rounded-xl text-xl md:text-2xl font-normal
                         hover:bg-gray-50 hover:scale-105 active:scale-95
                         transition-all duration-300 inline-flex items-center justify-center gap-3
                         shadow-lg hover:shadow-2xl
                         focus:outline-none focus:ring-4 focus:ring-white/50"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Calcular Presupuesto
            </button>
          </motion.div>
        </div>
      </section>

      {/* Testimonios - Instagram Story Style */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-eg-purple/5 to-eg-pink/5">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={slideUpVariants}
            className="text-center mb-12 md:mb-16"
          >
            <h3 className="text-4xl md:text-5xl font-normal text-eg-purple mb-4">
              Lo que dicen nuestros pacientes
            </h3>
            <p className="text-xl md:text-2xl font-normal text-eg-dark max-w-3xl mx-auto leading-relaxed">
              Miles de personas han confiado en nosotros
            </p>
          </motion.div>
          <TestimonialsCarousel />
        </div>
      </section>

      {/* CERTIFICATIONS HERO SECTION - Destacada antes del cierre */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-normal text-eg-purple mb-6"
            >
              43 años de excelencia
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl md:text-2xl font-normal text-eg-dark max-w-3xl mx-auto leading-relaxed"
            >
              Certificados y avalados por las principales instituciones de salud de Venezuela
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">
            {/* MPPS Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-eg-purple/10 to-eg-pink/10 rounded-3xl p-8 border-2 border-eg-purple/20 hover:border-eg-purple/40 hover:scale-105 transition-all duration-300 text-center"
            >
              <FaCertificate className="text-eg-purple w-16 h-16 mx-auto mb-4" />
              <h3 className="text-2xl md:text-3xl font-normal text-eg-purple mb-3">Certificado MPPS</h3>
              <p className="text-base md:text-lg font-normal text-eg-dark leading-relaxed">
                Ministerio del Poder Popular para la Salud
              </p>
            </motion.div>

            {/* SV Bioanalistas Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-eg-pink/10 to-eg-purple/10 rounded-3xl p-8 border-2 border-eg-pink/30 hover:border-eg-pink/50 hover:scale-105 transition-all duration-300 text-center"
            >
              <FaCertificate className="text-eg-pink w-16 h-16 mx-auto mb-4" />
              <h3 className="text-2xl md:text-3xl font-normal text-eg-purple mb-3">SV Bioanalistas</h3>
              <p className="text-base md:text-lg font-normal text-eg-dark leading-relaxed">
                Sociedad Venezolana de Bioanalistas Especialistas
              </p>
            </motion.div>

            {/* ISO Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-eg-purple/10 to-eg-pink/10 rounded-3xl p-8 border-2 border-eg-purple/20 hover:border-eg-purple/40 hover:scale-105 transition-all duration-300 text-center"
            >
              <FaCertificate className="text-eg-purple w-16 h-16 mx-auto mb-4" />
              <h3 className="text-2xl md:text-3xl font-normal text-eg-purple mb-3">ISO 9001:2015</h3>
              <p className="text-base md:text-lg font-normal text-eg-dark leading-relaxed">
                Certificación Internacional de Calidad
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 6. AGENDAR CITA - CTA Final Vibrante */}
      <section id="contacto" className="py-16 md:py-20 bg-gradient-to-r from-eg-purple to-eg-pink relative overflow-hidden">
        {/* Efectos de luz decorativos */}
        <div className="absolute top-10 right-10 w-64 h-64 bg-white/10 rounded-full light-effect" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-eg-pink/20 rounded-full light-effect" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full light-effect" />

        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            <motion.h2
              variants={staggerItem}
              className="text-4xl md:text-5xl lg:text-6xl font-normal text-white mb-6 leading-tight"
              style={{textShadow: '0 4px 20px rgba(0,0,0,0.3)'}}
            >
              Agenda tu cita hoy
            </motion.h2>

            <motion.p
              variants={staggerItem}
              className="text-xl md:text-2xl font-normal text-white/95 mb-8 leading-relaxed max-w-4xl mx-auto"
              style={{textShadow: '0 2px 10px rgba(0,0,0,0.2)'}}
            >
              Lunes a Viernes: 7:00 AM - 4:00 PM • Sábados: 7:00 AM - 12:00 PM
            </motion.p>

            {/* CTAs grandes prominentes */}
            <motion.div
              variants={staggerItem}
              className="flex flex-wrap justify-center gap-4 md:gap-6 mb-12"
            >
              <motion.a
                href="https://wa.me/584149019327"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-5 md:px-10 md:py-6 bg-white text-eg-purple rounded-full
                         text-lg md:text-xl font-normal min-h-[56px]
                         hover:shadow-2xl active:scale-95
                         transition-all duration-300 inline-flex items-center justify-center gap-3
                         focus:outline-none focus:ring-4 focus:ring-white/50"
              >
                <FaWhatsapp className="text-2xl md:text-3xl" />
                <span className="hidden sm:inline">WhatsApp:</span>
                <span className="font-normal">+58 414-901-9327</span>
              </motion.a>

              <motion.a
                href="tel:+582127620561"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-5 md:px-10 md:py-6 border-2 border-white text-white rounded-full
                         text-lg md:text-xl font-normal min-h-[56px]
                         hover:bg-white/10 active:bg-white/20
                         transition-all duration-300 inline-flex items-center justify-center gap-3
                         focus:outline-none focus:ring-4 focus:ring-white/50"
              >
                <FaPhone className="text-xl md:text-2xl" />
                <span className="font-normal">(0212) 762-0561</span>
              </motion.a>
            </motion.div>

            {/* Ubicación */}
            <motion.div
              variants={staggerItem}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 text-white/95 text-base md:text-lg"
            >
              <FaMapMarkerAlt className="text-2xl flex-shrink-0" />
              <p className="font-normal text-center sm:text-left">
                Av. Libertador, Edificio Majestic, Piso 1, Consultorio 18 • Caracas, Venezuela
              </p>
            </motion.div>

            {/* Horarios adicionales */}
            <motion.div
              variants={staggerItem}
              className="mt-8 text-white/90 text-sm md:text-base font-normal"
            >
              <p>También disponibles:</p>
              <p className="mt-2">(0212) 763-5909</p>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;