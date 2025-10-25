import React, { useState, useEffect, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { scrollToSection } from '../utils/smoothScroll';

// Lazy load heavy components
const HeroCarouselEG = lazy(() => import('../components/landing/HeroCarouselEG'));
const CTASectionEG = lazy(() => import('../components/landing/CTASectionEG'));
const FooterEG = lazy(() => import('../components/landing/FooterEG'));

import { LOGO_SPECS } from '../constants/brandDesignSystem';
import {
  FaWhatsapp,
  FaStar,
  FaMapMarkerAlt,
  FaClock,
  FaPhone,
  FaEnvelope,
  FaTruck,
  FaPaperPlane,
  FaInstagram,
  FaTwitter,
  FaCertificate,
  FaBullseye,
  FaHandshake,
  FaHeart,
  FaHandsHelping,
  FaPrayingHands,
  FaUser,
  FaUserMd,
  FaUserTie,
  FaExternalLinkAlt
} from 'react-icons/fa';

// Animations CSS
const animationStyles = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
    20%, 40%, 60%, 80% { transform: translateX(10px); }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px) scale(0.95); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-15px); }
  }
  @keyframes blobFloat {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    33% { transform: translate(10px, -10px) rotate(2deg); }
    66% { transform: translate(-10px, 10px) rotate(-2deg); }
  }
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(40px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideInUp {
    from { opacity: 0; transform: translateY(40px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-shake {
    animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
  }
  .animate-fade-in {
    animation: fadeIn 0.5s ease-out forwards;
  }
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
  .animate-blob-float {
    animation: blobFloat 10s ease-in-out infinite;
  }
  .value-card {
    animation: fadeInUp 0.6s ease-out backwards;
  }
  .value-card:nth-child(1) { animation-delay: 0.1s; }
  .value-card:nth-child(2) { animation-delay: 0.2s; }
  .value-card:nth-child(3) { animation-delay: 0.3s; }
  .value-card:nth-child(4) { animation-delay: 0.4s; }
  .value-card:nth-child(5) { animation-delay: 0.5s; }
  .contact-card:nth-child(1) { animation: slideInUp 0.6s ease-out 0.1s backwards; }
  .contact-card:nth-child(2) { animation: slideInUp 0.6s ease-out 0.2s backwards; }
  .contact-card:nth-child(3) { animation: slideInUp 0.6s ease-out 0.3s backwards; }
  .contact-card:nth-child(4) { animation: slideInUp 0.6s ease-out 0.4s backwards; }
  .contact-card:nth-child(5) { animation: slideInUp 0.6s ease-out 0.5s backwards; }
  .contact-card:nth-child(6) { animation: slideInUp 0.6s ease-out 0.6s backwards; }
  .testimonial-card { animation: slideInUp 0.6s ease-out 0.2s backwards; }
  .cert-card:nth-child(1) { animation: slideInUp 0.6s ease-out 0.1s backwards; }
  .cert-card:nth-child(2) { animation: slideInUp 0.6s ease-out 0.2s backwards; }
  .cert-card:nth-child(3) { animation: slideInUp 0.6s ease-out 0.3s backwards; }
`;

// Constantes de estilos reutilizables
const CARD_STYLES = "bg-white rounded-2xl p-6 md:p-8 shadow-[0_10px_40px_rgba(123,104,166,0.15)] hover:shadow-[0_20px_60px_rgba(123,104,166,0.25)] hover:scale-[1.03] hover:-translate-y-3 border border-eg-purple/10 transition-all duration-500 ease-out";

const ICON_WRAPPER_STYLES = "bg-gradient-to-br from-eg-purple/20 to-eg-pink/20 rounded-full p-5 border-2 border-eg-purple/30 shadow-md hover:shadow-lg hover:scale-110 hover:rotate-6 transition-all duration-300";

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[400px] bg-eg-purple/5">
    <div className="flex flex-col items-center gap-4">
      <div className="w-16 h-16 border-4 border-eg-purple/30 border-t-eg-purple rounded-full animate-spin"></div>
      <p className="text-eg-purple text-lg font-normal">Cargando...</p>
    </div>
  </div>
);

// Componente DecorativeBlobs reutilizable
const DecorativeBlobs = () => (
  <>
    <div className="absolute top-0 left-0 w-[500px] h-[500px] opacity-30 pointer-events-none z-0 animate-blob-float">
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <path
          fill="#DDB5D5"
          d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.5,-0.9C87,14.6,81.4,29.2,73.1,42.8C64.8,56.4,53.8,69,39.8,76.8C25.8,84.6,8.9,87.6,-6.4,86.3C-21.7,85,-43.4,79.4,-58.9,68.9C-74.4,58.4,-83.7,43,-87.7,26.4C-91.7,9.8,-90.4,-7.9,-84.3,-23.9C-78.2,-39.9,-67.3,-54.2,-53.5,-61.6C-39.7,-69,-23,-69.5,-7.6,-72.9C7.8,-76.3,30.6,-83.6,44.7,-76.4Z"
          transform="translate(100 100)"
        />
      </svg>
    </div>
    <div className="absolute bottom-0 right-0 w-[600px] h-[600px] opacity-40 pointer-events-none z-0 animate-blob-float" style={{animationDelay: '2s'}}>
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <path
          fill="#7B68A6"
          d="M41.3,-72.8C53.4,-65.3,63,-54.7,69.8,-42.4C76.6,-30.1,80.6,-15.1,81.4,0.4C82.2,15.9,79.8,31.8,72.5,45.2C65.2,58.6,53,69.5,39.1,76.2C25.2,82.9,9.6,85.4,-5.5,84.5C-20.6,83.6,-35.2,79.3,-48.3,71.6C-61.4,63.9,-73,52.8,-79.7,39.4C-86.4,26,-88.2,10.3,-86.4,-4.7C-84.6,-19.7,-79.2,-34,-70.5,-46.2C-61.8,-58.4,-49.8,-68.5,-36.6,-75.5C-23.4,-82.5,-8.8,-86.4,3.5,-84.6C15.8,-82.8,29.2,-80.3,41.3,-72.8Z"
          transform="translate(100 100)"
        />
      </svg>
    </div>
  </>
);

const LandingPageUnified = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const location = useLocation();
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    mensaje: ''
  });
  const [submitStatus, setSubmitStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Valores de Nosotros - Con iconos profesionales
  const values = [
    {
      icon: <FaBullseye className="text-eg-purple w-12 h-12" />,
      title: 'Calidad',
      description: 'Diagnóstico oportuno y preciso con la más alta tecnología'
    },
    {
      icon: <FaHandshake className="text-eg-purple w-12 h-12" />,
      title: 'Confianza',
      description: 'Respaldo profesional en cada análisis que realizamos'
    },
    {
      icon: <FaHeart className="text-eg-purple w-12 h-12" />,
      title: 'Cercanía',
      description: 'Atención personalizada y cálida para toda la familia'
    },
    {
      icon: <FaHandsHelping className="text-eg-purple w-12 h-12" />,
      title: 'Compromiso',
      description: 'Con tu salud integral y bienestar continuo'
    },
    {
      icon: <FaPrayingHands className="text-eg-purple w-12 h-12" />,
      title: 'Fe y gratitud',
      description: 'Guiados por principios sólidos y valores cristianos'
    }
  ];

  // Testimonios - Con iconos profesionales
  const testimonials = [
    {
      id: 1,
      name: 'María González',
      role: 'Paciente frecuente',
      text: 'Me siento como en casa cada vez que vengo. El equipo no solo es profesional, sino que te trata con un cariño genuino. Llevo 5 años confiando en ellos para todos mis estudios y nunca me han fallado.',
      rating: 5,
      avatar: <FaUser className="text-eg-purple w-16 h-16" />
    },
    {
      id: 2,
      name: 'Dr. Carlos Rodríguez',
      role: 'Médico Internista',
      text: 'Como médico, necesito resultados en los que pueda confiar plenamente. En el Laboratorio EG encuentro esa precisión que mis pacientes merecen, junto con un trato humano que hace la diferencia.',
      rating: 5,
      avatar: <FaUserMd className="text-eg-purple w-16 h-16" />
    },
    {
      id: 3,
      name: 'Ana Martínez',
      role: 'Empresa Cliente',
      text: 'Cuando eliges un laboratorio para tu equipo, no solo buscas profesionalismo, sino un aliado que entienda tus necesidades. El Laboratorio EG nos ha dado eso y mucho más durante años.',
      rating: 5,
      avatar: <FaUserTie className="text-eg-purple w-16 h-16" />
    }
  ];

  // Handle scroll to section when arriving from another page with hash
  useEffect(() => {
    if (location.hash) {
      // Wait a bit for the page to fully render
      setTimeout(() => {
        const sectionId = location.hash.substring(1); // Remove the #
        scrollToSection(sectionId);
      }, 100);
    }
  }, [location]);

  // Auto-rotate testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Form validation function
  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'nombre':
        if (!value.trim()) {
          error = 'El nombre es requerido';
        } else if (value.trim().length < 2) {
          error = 'El nombre debe tener al menos 2 caracteres';
        }
        break;
      case 'email':
        if (!value.trim()) {
          error = 'El correo es requerido';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Por favor ingresa un correo válido';
        }
        break;
      case 'mensaje':
        if (!value.trim()) {
          error = 'El mensaje es requerido';
        } else if (value.trim().length < 10) {
          error = 'El mensaje debe tener al menos 10 caracteres';
        }
        break;
      default:
        break;
    }

    return error;
  };

  // Form handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validate in realtime if field has been touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach(field => {
      if (field !== 'telefono') { // telefono is optional
        const error = validateField(field, formData[field]);
        if (error) newErrors[field] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched({ nombre: true, email: true, mensaje: true });
      setSubmitStatus('error');
      return;
    }

    // Simulate API call with loading state
    setIsSubmitting(true);
    setSubmitStatus(null);

    // Simulated delay for form submission
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setSubmitStatus('success');

    setTimeout(() => {
      setFormData({ nombre: '', email: '', telefono: '', mensaje: '' });
      setErrors({});
      setTouched({});
      setSubmitStatus(null);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Inject animation styles */}
      <style>{animationStyles}</style>

      <main>
        {/* SECTION 1: HERO - Carousel */}
        <section id="inicio">
        <Suspense fallback={<LoadingFallback />}>
          <HeroCarouselEG />
        </Suspense>
      </section>

      {/* SECTION 2: NOSOTROS */}
      <section id="nosotros" className="w-full min-h-screen bg-eg-purple relative overflow-hidden">
        {/* Decorative Blobs */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] opacity-30 pointer-events-none z-0 animate-blob-float">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path
              fill="#DDB5D5"
              d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.5,-0.9C87,14.6,81.4,29.2,73.1,42.8C64.8,56.4,53.8,69,39.8,76.8C25.8,84.6,8.9,87.6,-6.4,86.3C-21.7,85,-43.4,79.4,-58.9,68.9C-74.4,58.4,-83.7,43,-87.7,26.4C-91.7,9.8,-90.4,-7.9,-84.3,-23.9C-78.2,-39.9,-67.3,-54.2,-53.5,-61.6C-39.7,-69,-23,-69.5,-7.6,-72.9C7.8,-76.3,30.6,-83.6,44.7,-76.4Z"
              transform="translate(100 100)"
            />
          </svg>
        </div>

        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] opacity-40 pointer-events-none z-0 animate-blob-float" style={{animationDelay: '2s'}}>
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path
              fill="#7B68A6"
              d="M41.3,-72.8C53.4,-65.3,63,-54.7,69.8,-42.4C76.6,-30.1,80.6,-15.1,81.4,0.4C82.2,15.9,79.8,31.8,72.5,45.2C65.2,58.6,53,69.5,39.1,76.2C25.2,82.9,9.6,85.4,-5.5,84.5C-20.6,83.6,-35.2,79.3,-48.3,71.6C-61.4,63.9,-73,52.8,-79.7,39.4C-86.4,26,-88.2,10.3,-86.4,-4.7C-84.6,-19.7,-79.2,-34,-70.5,-46.2C-61.8,-58.4,-49.8,-68.5,-36.6,-75.5C-23.4,-82.5,-8.8,-86.4,3.5,-84.6C15.8,-82.8,29.2,-80.3,41.3,-72.8Z"
              transform="translate(100 100)"
            />
          </svg>
        </div>

        {/* Hero Section - Reducido */}
        <header className="relative z-10 w-full pt-12 pb-8 text-center px-6 md:px-12 lg:px-24">
          <div className="max-w-[1600px] mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal text-white mb-4 tracking-tight leading-none" style={{textShadow: '2px 2px 8px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5)'}}>
              NUESTRA HISTORIA
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-white max-w-4xl mx-auto leading-relaxed mb-3" style={{textShadow: '1px 1px 4px rgba(0,0,0,0.7)'}}>
              43 años de compromiso con tu salud
            </p>
            <p className="text-base md:text-lg text-white" style={{textShadow: '1px 1px 4px rgba(0,0,0,0.7)'}}>
              RIF {LOGO_SPECS.rif} · Desde 1982
            </p>
          </div>
        </header>

        {/* Historia */}
        <div className="relative z-10 w-full py-8 md:py-12">
          <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 mb-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className={`${CARD_STYLES} rounded-3xl p-10 md:p-14`}
              >
                <h2 className="text-3xl md:text-4xl font-normal text-eg-purple mb-6 leading-tight">
                  Desde 1982
                </h2>
                <p className="text-eg-dark mb-6 text-lg md:text-xl font-normal leading-relaxed">
                  Laboratorio EG ha sido sinónimo de confianza y compromiso en Caracas. Lo que comenzó como un proyecto familiar se ha convertido en un referente de calidad y cercanía humana.
                </p>
                <p className="text-eg-dark mb-6 text-lg md:text-xl font-normal leading-relaxed">
                  43 años no son sencillos: han sido camino de altos y bajos que hemos aprendido a transitar unidos, en familia, y desde la convicción de que sí se puede.
                </p>
                <p className="text-eg-dark text-lg md:text-xl font-normal leading-relaxed">
                  Hoy seguimos adelante con la misma pasión del primer día, comprometidos con tu salud y bienestar.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <div className="w-full h-full min-h-[400px] rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(123,104,166,0.3)] border-4 border-eg-pink/20">
                  <img
                    src="https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=800&h=600&fit=crop"
                    alt="Equipo Laboratorio Elizabeth Gutiérrez"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-gradient-to-r from-eg-purple to-eg-pink text-white px-8 py-6 rounded-2xl shadow-2xl transform rotate-[-5deg] hover:rotate-0 transition-transform duration-300">
                  <span className="text-4xl font-normal block">43 años</span>
                  <span className="text-lg font-normal block mt-1">de excelencia</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Valores */}
        <div className="relative z-10 w-full py-8 md:py-12 bg-gradient-to-b from-white via-eg-pink/20 to-eg-purple/15 overflow-hidden">
          <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <h2 className="text-3xl md:text-4xl font-normal text-eg-purple mb-4 leading-tight">
                Nuestros Valores
              </h2>
              <p className="text-lg md:text-xl text-eg-dark max-w-3xl mx-auto leading-relaxed">
                Los principios que nos guían cada día
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8">
              {values.map((value, index) => (
                <div key={index} className={`value-card ${CARD_STYLES} text-center`}>
                  <div className={`${ICON_WRAPPER_STYLES} inline-flex mb-6 animate-float`} style={{animationDelay: `${index * 0.2}s`}}>
                    {value.icon}
                  </div>
                  <h3 className="text-2xl font-normal text-eg-purple mb-3 leading-tight">
                    {value.title}
                  </h3>
                  <p className="text-eg-dark text-base font-normal leading-relaxed">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Propósito */}
        <div className="relative z-10 w-full py-20 md:py-24 bg-gradient-to-br from-eg-purple/43 via-eg-pink/28 to-eg-purple/38 overflow-hidden">
          <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-24 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-5xl mx-auto"
            >
              <div className={`${CARD_STYLES} rounded-3xl p-10 md:p-14 text-center border-2 border-eg-purple/40`}>
                <h2 className="text-4xl md:text-5xl font-normal text-eg-purple mb-8 leading-tight">
                  Nuestro Propósito
                </h2>
                <p className="text-xl md:text-2xl text-eg-dark font-normal leading-relaxed mb-6">
                  Ser el laboratorio clínico que necesitas, combinando excelencia técnica con calidez humana.
                </p>
                <p className="text-2xl md:text-3xl text-eg-purple font-normal leading-relaxed">
                  Nos encanta atenderte con amor ❤️
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 3: CERTIFICACIONES - Con fondo morado */}
      <section className="w-full py-8 md:py-12 bg-eg-purple relative overflow-hidden">
        <DecorativeBlobs />

        <div className="relative z-10 max-w-[1600px] mx-auto px-6 md:px-12 lg:px-24">

          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-normal text-white mb-4 leading-tight" style={{textShadow: '2px 2px 8px rgba(0,0,0,0.8)'}}>
              43 años de excelencia
            </h2>
            <p className="text-lg md:text-xl text-white max-w-3xl mx-auto leading-relaxed" style={{textShadow: '1px 1px 4px rgba(0,0,0,0.7)'}}>
              Certificados y avalados por las principales instituciones de salud de Venezuela
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">

            <div className={`cert-card ${CARD_STYLES} text-center`}>
              <div className={`${ICON_WRAPPER_STYLES} inline-flex mb-6`}>
                <FaCertificate className="text-eg-purple w-14 h-14" />
              </div>
              <h3 className="text-2xl md:text-3xl font-normal text-eg-purple mb-4 leading-tight">
                Certificado MPPS
              </h3>
              <p className="text-base md:text-lg text-eg-dark leading-relaxed">
                Ministerio del Poder Popular para la Salud
              </p>
            </div>

            <div className={`cert-card ${CARD_STYLES} text-center`}>
              <div className={`${ICON_WRAPPER_STYLES} inline-flex mb-6`}>
                <FaCertificate className="text-eg-purple w-14 h-14" />
              </div>
              <h3 className="text-2xl md:text-3xl font-normal text-eg-purple mb-4 leading-tight">
                SV Bioanalistas
              </h3>
              <p className="text-base md:text-lg text-eg-dark leading-relaxed">
                Sociedad Venezolana de Bioanalistas Especialistas
              </p>
            </div>

            <div className={`cert-card ${CARD_STYLES} text-center`}>
              <div className={`${ICON_WRAPPER_STYLES} inline-flex mb-6`}>
                <FaCertificate className="text-eg-purple w-14 h-14" />
              </div>
              <h3 className="text-2xl md:text-3xl font-normal text-eg-purple mb-4 leading-tight">
                ISO 9001:2015
              </h3>
              <p className="text-base md:text-lg text-eg-dark leading-relaxed">
                Certificación Internacional de Calidad
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 4: TESTIMONIOS - Movido al final */}
      <section className="w-full py-20 md:py-24 bg-eg-purple relative overflow-hidden">
        <DecorativeBlobs />

        <div className="relative z-10 w-full">
          <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-24">

            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-normal text-white mb-6 leading-tight" style={{textShadow: '2px 2px 8px rgba(0,0,0,0.8)'}}>
                Lo que dicen nuestros pacientes
              </h2>
              <p className="text-xl md:text-2xl text-white max-w-3xl mx-auto leading-relaxed" style={{textShadow: '1px 1px 4px rgba(0,0,0,0.7)'}}>
                Miles de pacientes satisfechos avalan nuestra calidad
              </p>
            </div>

            <div className={`testimonial-card ${CARD_STYLES} max-w-4xl mx-auto`}>
              <div className="flex justify-center mb-6">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className="text-yellow-400 text-3xl" />
                ))}
              </div>

              <p className="text-xl md:text-2xl text-eg-dark text-center mb-8 italic leading-relaxed">
                "{testimonials[activeTestimonial].text}"
              </p>

              <div className="text-center">
                <div className={`${ICON_WRAPPER_STYLES} inline-flex mb-4`}>
                  {testimonials[activeTestimonial].avatar}
                </div>
                <h4 className="text-2xl font-normal text-eg-purple mb-2">
                  {testimonials[activeTestimonial].name}
                </h4>
                <p className="text-lg text-eg-dark">
                  {testimonials[activeTestimonial].role}
                </p>
              </div>

              <div className="flex justify-center mt-8 gap-3">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveTestimonial(index)}
                    aria-label={`Ver testimonio ${index + 1} de ${testimonials.length}`}
                    aria-current={index === activeTestimonial ? 'true' : 'false'}
                    className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-all ${
                      index === activeTestimonial
                        ? 'bg-eg-purple'
                        : 'bg-eg-purple/30 hover:bg-eg-purple/50'
                    }`}
                  >
                    <span className={`block rounded-full transition-all ${
                      index === activeTestimonial
                        ? 'w-8 h-2 bg-white'
                        : 'w-2 h-2 bg-eg-purple'
                    }`}></span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: CONTACTO */}
      <section id="contacto" className="w-full min-h-screen bg-eg-purple relative overflow-hidden">
        {/* Decorative Blobs */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] opacity-30 pointer-events-none z-0">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path
              fill="#DDB5D5"
              d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.5,-0.9C87,14.6,81.4,29.2,73.1,42.8C64.8,56.4,53.8,69,39.8,76.8C25.8,84.6,8.9,87.6,-6.4,86.3C-21.7,85,-43.4,79.4,-58.9,68.9C-74.4,58.4,-83.7,43,-87.7,26.4C-91.7,9.8,-90.4,-7.9,-84.3,-23.9C-78.2,-39.9,-67.3,-54.2,-53.5,-61.6C-39.7,-69,-23,-69.5,-7.6,-72.9C7.8,-76.3,30.6,-83.6,44.7,-76.4Z"
              transform="translate(100 100)"
            />
          </svg>
        </div>

        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] opacity-40 pointer-events-none z-0">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path
              fill="#7B68A6"
              d="M41.3,-72.8C53.4,-65.3,63,-54.7,69.8,-42.4C76.6,-30.1,80.6,-15.1,81.4,0.4C82.2,15.9,79.8,31.8,72.5,45.2C65.2,58.6,53,69.5,39.1,76.2C25.2,82.9,9.6,85.4,-5.5,84.5C-20.6,83.6,-35.2,79.3,-48.3,71.6C-61.4,63.9,-73,52.8,-79.7,39.4C-86.4,26,-88.2,10.3,-86.4,-4.7C-84.6,-19.7,-79.2,-34,-70.5,-46.2C-61.8,-58.4,-49.8,-68.5,-36.6,-75.5C-23.4,-82.5,-8.8,-86.4,3.5,-84.6C15.8,-82.8,29.2,-80.3,41.3,-72.8Z"
              transform="translate(100 100)"
            />
          </svg>
        </div>

        {/* Hero - Reducido para que todo quepa en viewport */}
        <header className="relative z-10 w-full pt-12 pb-8 text-center px-6 md:px-12 lg:px-24">
          <div className="max-w-[1600px] mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal text-white mb-4 tracking-tight leading-none" style={{textShadow: '2px 2px 8px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5)'}}>
              CONTÁCTANOS
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-white max-w-4xl mx-auto leading-relaxed mb-3" style={{textShadow: '1px 1px 4px rgba(0,0,0,0.7)'}}>
              Siempre listos para ti y tu salud
            </p>
            <p className="text-base md:text-lg text-white" style={{textShadow: '1px 1px 4px rgba(0,0,0,0.7)'}}>
              RIF {LOGO_SPECS.rif} · 43 años de experiencia
            </p>
          </div>
        </header>

        {/* Contact Cards + Form + Map */}
        <div className="relative z-10 w-full py-8 md:py-12">
          <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-24">
            {/* Contact Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
              <div className="contact-card bg-white rounded-2xl p-6 md:p-8 shadow-[0_10px_40px_rgba(123,104,166,0.15)] hover:shadow-[0_20px_60px_rgba(123,104,166,0.25)] hover:scale-[1.03] hover:-translate-y-3 border border-eg-purple/10 transition-all duration-500 ease-out">
                <div className="flex items-start gap-6">
                  <div className="bg-gradient-to-br from-eg-purple/20 to-eg-pink/20 rounded-full p-5 border-2 border-eg-purple/30 shadow-md hover:shadow-lg hover:scale-110 hover:rotate-6 transition-all duration-300">
                    <FaMapMarkerAlt className="text-eg-purple w-12 h-12 md:w-14 md:h-14" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl md:text-3xl font-normal text-eg-purple mb-3 leading-tight">Dirección</h3>
                    <p className="text-eg-dark text-base md:text-lg font-normal leading-relaxed">
                      Av. Libertador, Edf. Majestic, Piso 1, Consultorio 18, La Campiña, Caracas 1050
                    </p>
                  </div>
                </div>
              </div>

              <div className="contact-card bg-white rounded-2xl p-6 md:p-8 shadow-[0_10px_40px_rgba(123,104,166,0.15)] hover:shadow-[0_20px_60px_rgba(123,104,166,0.25)] hover:scale-[1.03] hover:-translate-y-3 border border-eg-purple/10 transition-all duration-500 ease-out">
                <div className="flex items-start gap-6">
                  <div className="bg-gradient-to-br from-eg-purple/20 to-eg-pink/20 rounded-full p-5 border-2 border-eg-purple/30 shadow-md hover:shadow-lg hover:scale-110 hover:rotate-6 transition-all duration-300">
                    <FaPhone className="text-eg-purple w-12 h-12 md:w-14 md:h-14" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl md:text-3xl font-normal text-eg-purple mb-3 leading-tight">Teléfonos</h3>
                    <div className="text-eg-dark text-base md:text-lg space-y-2">
                      <a href="tel:+582127620561" className="block hover:text-eg-purple transition-colors font-normal">
                        +58 212 762.0561
                      </a>
                      <a href="tel:+582127635909" className="block hover:text-eg-purple transition-colors font-normal">
                        +58 212 763.5909
                      </a>
                      <a href="tel:+582127636628" className="block hover:text-eg-purple transition-colors font-normal">
                        +58 212 763.6628
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="contact-card bg-white rounded-2xl p-6 md:p-8 shadow-[0_10px_40px_rgba(123,104,166,0.15)] hover:shadow-[0_20px_60px_rgba(123,104,166,0.25)] hover:scale-[1.03] hover:-translate-y-3 border border-eg-purple/10 transition-all duration-500 ease-out">
                <div className="flex items-start gap-6">
                  <div className="bg-gradient-to-br from-eg-purple/20 to-eg-pink/20 rounded-full p-5 border-2 border-eg-purple/30 shadow-md hover:shadow-lg hover:scale-110 hover:rotate-6 transition-all duration-300">
                    <FaEnvelope className="text-eg-purple w-12 h-12 md:w-14 md:h-14" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl md:text-3xl font-normal text-eg-purple mb-3 leading-tight">Email</h3>
                    <a
                      href="mailto:info@laboratorioeg.com"
                      className="text-eg-purple hover:text-eg-pink transition-colors text-base md:text-lg font-normal underline decoration-2 underline-offset-4"
                    >
                      info@laboratorioeg.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="contact-card bg-white rounded-2xl p-6 md:p-8 shadow-[0_10px_40px_rgba(123,104,166,0.15)] hover:shadow-[0_20px_60px_rgba(123,104,166,0.25)] hover:scale-[1.03] hover:-translate-y-3 border border-eg-purple/10 transition-all duration-500 ease-out">
                <div className="flex items-start gap-6">
                  <div className="bg-gradient-to-br from-eg-purple/20 to-eg-pink/20 rounded-full p-5 border-2 border-eg-purple/30 shadow-md hover:shadow-lg hover:scale-110 hover:rotate-6 transition-all duration-300">
                    <FaClock className="text-eg-purple w-12 h-12 md:w-14 md:h-14" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl md:text-3xl font-normal text-eg-purple mb-3 leading-tight">Horario</h3>
                    <p className="text-eg-dark text-base md:text-lg font-normal leading-relaxed">
                      <span className="text-lg md:text-xl font-normal">Lun-Vie</span> 7:00-16:00<br />
                      <span className="text-lg md:text-xl font-normal">Sáb</span> 8:00-12:00
                    </p>
                  </div>
                </div>
              </div>

              <div className="contact-card bg-white rounded-2xl p-6 md:p-8 shadow-[0_10px_40px_rgba(123,104,166,0.15)] hover:shadow-[0_20px_60px_rgba(123,104,166,0.25)] hover:scale-[1.03] hover:-translate-y-3 border border-eg-purple/10 transition-all duration-500 ease-out">
                <div className="flex items-start gap-6">
                  <div className="bg-gradient-to-br from-eg-purple/20 to-eg-pink/20 rounded-full p-5 border-2 border-eg-purple/30 shadow-md hover:shadow-lg hover:scale-110 hover:rotate-6 transition-all duration-300">
                    <FaTruck className="text-eg-purple w-12 h-12 md:w-14 md:h-14" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl md:text-3xl font-normal text-eg-purple mb-3 leading-tight">Domicilios</h3>
                    <p className="text-eg-dark text-base md:text-lg font-normal leading-relaxed">
                      Servicio de toma de muestras a domicilio disponible
                    </p>
                  </div>
                </div>
              </div>

              <div className="contact-card bg-white rounded-2xl p-6 md:p-8 shadow-[0_10px_40px_rgba(123,104,166,0.15)] hover:shadow-[0_20px_60px_rgba(123,104,166,0.25)] hover:scale-[1.03] hover:-translate-y-3 border border-eg-purple/10 transition-all duration-500 ease-out">
                <div className="flex items-start gap-6">
                  <div className="bg-gradient-to-br from-eg-purple/20 to-eg-pink/20 rounded-full p-5 border-2 border-eg-purple/30 shadow-md hover:shadow-lg hover:scale-110 hover:rotate-6 transition-all duration-300">
                    <FaInstagram className="text-eg-purple w-12 h-12 md:w-14 md:h-14" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl md:text-3xl font-normal text-eg-purple mb-3 leading-tight">Síguenos</h3>
                    <div className="flex flex-col gap-2 text-base md:text-lg">
                      <a
                        href="https://www.instagram.com/laboratorioeg"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Seguir a Laboratorio EG en Instagram como @laboratorioeg"
                        title="Síguenos en Instagram @laboratorioeg"
                        className="text-eg-purple hover:text-eg-pink transition-colors font-normal underline decoration-2 underline-offset-4 inline-flex items-center gap-1"
                      >
                        <span>@laboratorioeg</span>
                        <FaExternalLinkAlt className="w-3 h-3" />
                      </a>
                      <a
                        href="https://twitter.com/Laboratorio_EG"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Seguir a Laboratorio EG en Twitter"
                        title="Síguenos en Twitter"
                        className="text-eg-purple hover:text-eg-pink transition-colors font-normal underline decoration-2 underline-offset-4 inline-flex items-center gap-1"
                      >
                        <FaTwitter className="inline mr-1" />
                        <span>Twitter</span>
                        <FaExternalLinkAlt className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <div className="w-full mx-auto mb-20">
              <a
                href="https://wa.me/584241440798"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Contactar por WhatsApp al Laboratorio EG al número +58 424 1440798"
                className="group relative flex items-center justify-center gap-4 px-10 py-6 min-h-[48px]
                         bg-gradient-to-r from-eg-pink via-eg-purple to-eg-pink
                         text-white rounded-full text-xl md:text-2xl font-normal
                         shadow-[0_20px_50px_rgba(123,104,166,0.4)]
                         hover:shadow-[0_30px_70px_rgba(221,181,213,0.6)]
                         hover:scale-105 active:scale-95
                         transition-all duration-300
                         focus:outline-none focus:ring-4 focus:ring-eg-pink/50"
              >
                <FaWhatsapp className="w-14 h-14 group-hover:rotate-12 transition-transform duration-300" />
                <span>Escríbenos por WhatsApp</span>
              </a>
            </div>

            {/* Google Maps */}
            <div className="w-full mx-auto mb-20">
              <div className="bg-white rounded-3xl p-6 shadow-[0_10px_40px_rgba(123,104,166,0.15)] border border-eg-purple/10">
                <h3 className="text-3xl md:text-4xl font-normal text-eg-purple mb-6 text-center">
                  Nuestra Ubicación
                </h3>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Av.+Libertador,+Edf.+Majestic,+Piso+1,+Consultorio+18,+La+Campiña,+Caracas+1050,+Venezuela"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full h-96 rounded-xl overflow-hidden relative group cursor-pointer"
                >
                  <iframe
                    title="Ubicación Laboratorio EG - Av. Libertador, Edf. Majestic"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3922.6!2d-66.8658!3d10.4905!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8c2a58f7b3e9c8a9%3A0x1234567890abcdef!2sAv.%20Libertador%2C%20Caracas%2C%20Venezuela!5e0!3m2!1ses!2sve!4v1234567890"
                    width="100%"
                    height="100%"
                    style={{ border: 0, pointerEvents: 'none' }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                  <div className="absolute inset-0 bg-eg-purple/0 group-hover:bg-eg-purple/10 transition-all duration-300 flex items-center justify-center pointer-events-none">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/95 px-6 py-3 rounded-full shadow-lg">
                      <p className="text-eg-purple font-normal text-lg">
                        Click para abrir en Google Maps
                      </p>
                    </div>
                  </div>
                </a>
                <p className="text-center text-eg-dark mt-4 text-base md:text-lg">
                  Av. Libertador, Edf. Majestic, Piso 1, Consultorio 18<br/>
                  La Campiña, Caracas 1050, Venezuela
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="w-full lg:max-w-4xl mx-auto">
              <div className="bg-white rounded-3xl p-10 md:p-14 shadow-[0_20px_60px_rgba(123,104,166,0.2)] border border-eg-purple/10">
                <h3 className="text-3xl md:text-4xl font-normal text-eg-purple mb-4 leading-tight">
                  Escríbenos
                </h3>
                <p className="text-eg-dark mb-12 text-lg md:text-xl font-normal leading-relaxed">
                  Completa el formulario y te responderemos pronto
                </p>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div>
                    <label htmlFor="nombre" className="block text-eg-purple mb-3 text-xl md:text-2xl font-normal">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      className={`w-full px-6 py-4 min-h-[48px] rounded-lg border-2 bg-white text-eg-dark text-base font-normal
                               focus:outline-none focus:ring-4 focus:ring-eg-purple/50
                               hover:border-eg-purple/50
                               placeholder:text-eg-gray/60
                               transition-all duration-300
                               ${errors.nombre && touched.nombre ? 'border-red-500 focus:border-red-500' : 'border-eg-purple/30 focus:border-eg-purple'}`}
                      placeholder="Tu nombre completo"
                    />
                    {errors.nombre && touched.nombre && (
                      <p className="mt-2 text-red-500 text-sm">{errors.nombre}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-eg-purple mb-3 text-xl md:text-2xl font-normal">
                      Correo *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      className={`w-full px-6 py-4 min-h-[48px] rounded-lg border-2 bg-white text-eg-dark text-base font-normal
                               focus:outline-none focus:ring-4 focus:ring-eg-purple/50
                               hover:border-eg-purple/50
                               placeholder:text-eg-gray/60
                               transition-all duration-300
                               ${errors.email && touched.email ? 'border-red-500 focus:border-red-500' : 'border-eg-purple/30 focus:border-eg-purple'}`}
                      placeholder="tu@email.com"
                    />
                    {errors.email && touched.email && (
                      <p className="mt-2 text-red-500 text-sm">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="mensaje" className="block text-eg-purple mb-3 text-xl md:text-2xl font-normal">
                      Mensaje *
                    </label>
                    <textarea
                      id="mensaje"
                      name="mensaje"
                      value={formData.mensaje}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      rows="6"
                      className={`w-full px-6 py-4 rounded-lg border-2 bg-white text-eg-dark text-base font-normal
                               focus:outline-none focus:ring-4 focus:ring-eg-purple/50
                               hover:border-eg-purple/50
                               placeholder:text-eg-gray/60
                               transition-all duration-300 resize-none
                               ${errors.mensaje && touched.mensaje ? 'border-red-500 focus:border-red-500' : 'border-eg-purple/30 focus:border-eg-purple'}`}
                      placeholder="¿En qué podemos ayudarte?"
                    />
                    {errors.mensaje && touched.mensaje && (
                      <p className="mt-2 text-red-500 text-sm">{errors.mensaje}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={Object.keys(errors).some(key => errors[key]) || isSubmitting}
                    className={`w-full flex items-center justify-center gap-4 px-10 py-6 min-h-[48px]
                             bg-gradient-to-r from-eg-purple to-eg-pink text-white rounded-2xl text-xl md:text-2xl font-normal
                             shadow-[0_10px_40px_rgba(123,104,166,0.3)]
                             transition-all duration-300
                             focus:outline-none focus:ring-4 focus:ring-eg-purple/50
                             ${Object.keys(errors).some(key => errors[key]) || isSubmitting
                               ? 'opacity-50 cursor-not-allowed'
                               : 'hover:from-eg-pink hover:to-eg-purple hover:scale-[1.02] hover:shadow-[0_20px_60px_rgba(221,181,213,0.5)] hover:-translate-y-1 active:scale-95'
                             }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-7 h-7 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <>
                        <FaPaperPlane className="w-7 h-7" />
                        <span>Enviar Mensaje</span>
                      </>
                    )}
                  </button>

                  {submitStatus && (
                    <div
                      role="alert"
                      className={`p-6 rounded-xl text-lg font-normal ${
                        submitStatus === 'success'
                          ? 'bg-eg-purple/20 text-eg-purple border-2 border-eg-purple/30 animate-fade-in'
                          : 'bg-eg-pink/20 text-eg-purple border-2 border-eg-pink/30 animate-shake'
                      }`}
                    >
                      {submitStatus === 'success' ? (
                        <p>✓ Mensaje enviado exitosamente. Nos pondremos en contacto contigo pronto.</p>
                      ) : (
                        <p>⚠ Por favor completa todos los campos requeridos.</p>
                      )}
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
      </main>

      {/* CTA Section */}
      <Suspense fallback={<LoadingFallback />}>
        <CTASectionEG />
      </Suspense>

      {/* Footer */}
      <Suspense fallback={<LoadingFallback />}>
        <FooterEG />
      </Suspense>
    </div>
  );
};

export default LandingPageUnified;
