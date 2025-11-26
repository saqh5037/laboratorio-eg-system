import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

// Dimogen Components
import NavbarDimogen from '../components/landing/dimogen/NavbarDimogen';
import HeroDimogen from '../components/landing/dimogen/HeroDimogen';
import LineasNegocioSection from '../components/landing/dimogen/LineasNegocioSection';
import SobreDimogenSection from '../components/landing/dimogen/SobreDimogenSection';
import TestimoniosSection from '../components/landing/dimogen/TestimoniosSection';
import FAQSection from '../components/landing/dimogen/FAQSection';
import ContactoDimogenSection from '../components/landing/dimogen/ContactoDimogenSection';
import FooterDimogen from '../components/landing/dimogen/FooterDimogen';

// Hook for dynamic content
import useDimogenContent from '../hooks/useDimogenContent';

/**
 * LandingDimogen Page
 * Página de aterrizaje para DIMOGEN - Laboratorio de Alta Especialidad
 *
 * Estructura simplificada:
 * 1. NavbarDimogen - Navegación fija con transición
 * 2. HeroDimogen - Hero con carrusel
 * 3. LineasNegocioSection - 3 ramas de DIMOGEN (links a páginas individuales)
 * 4. SobreDimogenSection - Quiénes somos + Nuestra filosofía
 * 5. TestimoniosSection - Testimonios de clientes
 * 6. FAQSection - Preguntas frecuentes
 * 7. ContactoDimogenSection - Contacto con ubicaciones
 * 8. FooterDimogen - Footer completo
 *
 * Nota: Los catálogos de estudios están en las páginas individuales de cada servicio
 */
const LandingDimogen = () => {
  // Load dynamic content from API
  const {
    services,
    faqs,
    about,
    testimonials,
    contact,
    statistics,
    carousel,
    company,
    loading,
    error
  } = useDimogenContent();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Update document title and meta
  useEffect(() => {
    document.title = 'DIMOGEN - Laboratorio de Alta Especialidad | Biología Molecular, Salud Integral y Microbiología';

    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = 'DIMOGEN - Laboratorio de alta especialidad en Cancún. Biología Molecular, Unidad de Salud Integral y Microbiología de Alimentos. Certificación ISO 9001:2015 y COFEPRIS.';

    // Update theme color for PWA
    let themeColor = document.querySelector('meta[name="theme-color"]');
    if (!themeColor) {
      themeColor = document.createElement('meta');
      themeColor.name = 'theme-color';
      document.head.appendChild(themeColor);
    }
    themeColor.content = '#0047CB';

    // Cleanup on unmount
    return () => {
      document.title = 'Laboratorio EG System';
    };
  }, []);

  // Animation variants for sections
  // NOTA: Usamos opacity: 1 en hidden para que las secciones sean
  // visibles inmediatamente en dispositivos móviles (iOS Safari).
  // La animación sutíl de transform da un efecto visual sin ocultar contenido.
  const sectionVariants = {
    hidden: {
      opacity: 1,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut'
      }
    }
  };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
      {/* Load Poppins font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* Navigation */}
      <NavbarDimogen company={company} />

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <motion.div
          id="inicio"
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
        >
          <HeroDimogen slides={carousel} statistics={statistics} loading={loading} />
        </motion.div>

        {/* Líneas de Negocio Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={sectionVariants}
        >
          <LineasNegocioSection services={services} loading={loading} />
        </motion.div>

        {/* Sobre Dimogen Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={sectionVariants}
        >
          <SobreDimogenSection about={about} statistics={statistics} loading={loading} />
        </motion.div>

        {/* Testimonios Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={sectionVariants}
        >
          <TestimoniosSection testimonials={testimonials} loading={loading} />
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={sectionVariants}
        >
          <FAQSection faqs={faqs} contact={contact} loading={loading} />
        </motion.div>

        {/* Contacto Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={sectionVariants}
        >
          <ContactoDimogenSection contact={contact} company={company} loading={loading} />
        </motion.div>
      </main>

      {/* Footer */}
      <FooterDimogen company={company} contact={contact} services={services} />

      {/* Scroll Progress Indicator */}
      <ScrollProgressIndicator />
    </div>
  );
};

/**
 * ScrollProgressIndicator Component
 * Barra de progreso de scroll en la parte superior
 */
const ScrollProgressIndicator = () => {
  const [scrollProgress, setScrollProgress] = React.useState(0);

  React.useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 h-1 bg-gradient-to-r from-[#0047CB] via-[#00A3E0] to-[#98CB59] z-[60] transition-all duration-150"
      style={{ width: `${scrollProgress}%` }}
    />
  );
};

export default LandingDimogen;
