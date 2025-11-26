import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaBars,
  FaTimes,
  FaPhone,
  FaWhatsapp,
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaChevronDown,
  FaDna,
  FaHeartbeat,
  FaFlask,
  FaBook
} from 'react-icons/fa';

// Config API URL para construir URLs de logos
const CONFIG_API_URL = import.meta.env.VITE_CONFIG_API_URL || 'http://localhost:3005';

// Helper para construir URL de logo
const getLogoUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('/uploads/')) {
    return CONFIG_API_URL + url;
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return url;
};

/**
 * NavbarDimogen Component
 * Barra de navegación profesional para DIMOGEN
 * Diseño: Transparente con blur, transición a sólido en scroll
 */
const NavbarDimogen = ({ company }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isCatalogosOpen, setIsCatalogosOpen] = useState(false);
  const servicesRef = useRef(null);
  const catalogosRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Detectar si estamos en la landing principal de DIMOGEN
  // Incluye '/' para cuando la landing está en la raíz
  const isOnLanding = ['/', '/dimogen', '/dimogen/'].includes(location.pathname);

  // Detectar scroll para cambiar estilo del navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsServicesOpen(false);
    setIsCatalogosOpen(false);
  }, [location]);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (servicesRef.current && !servicesRef.current.contains(event.target)) {
        setIsServicesOpen(false);
      }
      if (catalogosRef.current && !catalogosRef.current.contains(event.target)) {
        setIsCatalogosOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Servicios para el dropdown
  const serviciosLinks = [
    {
      name: 'Biología Molecular',
      href: '/dimogen/servicios/biologia-molecular',
      icon: FaDna,
      description: 'PCR, Genética y Diagnóstico Molecular',
      color: '#0047CB'
    },
    {
      name: 'Salud Integral',
      href: '/dimogen/servicios/salud-integral',
      icon: FaHeartbeat,
      description: 'Consultas y Toma de Muestras',
      color: '#00A3E0'
    },
    {
      name: 'Microbiología de Alimentos',
      href: '/dimogen/servicios/microbiologia-alimentos',
      icon: FaFlask,
      description: 'Análisis para Industria Alimentaria',
      color: '#98CB59'
    }
  ];

  // Catálogos de estudios (solo los que tienen catálogo)
  // Los enlaces incluyen #catalogo para scroll directo a la sección del catálogo
  const catalogosLinks = [
    {
      name: 'Biología Molecular',
      href: '/dimogen/servicios/biologia-molecular#catalogo',
      icon: FaDna,
      description: 'Catálogo completo de pruebas moleculares',
      color: '#0047CB'
    },
    {
      name: 'Microbiología de Alimentos',
      href: '/dimogen/servicios/microbiologia-alimentos#catalogo',
      icon: FaFlask,
      description: 'Análisis para industria alimentaria',
      color: '#98CB59'
    }
  ];

  // Links de navegación (para scroll en landing)
  const navLinks = [
    { name: 'Inicio', href: '#inicio', type: 'anchor' },
    { name: 'Servicios', href: '#lineas-negocio', type: 'dropdown' },
    { name: 'Catálogos', href: '#catalogos', type: 'dropdown-catalogos' },
    { name: 'Nosotros', href: '#sobre-dimogen', type: 'anchor' },
    { name: 'FAQ', href: '#faq', type: 'anchor' },
    { name: 'Contacto', href: '#contacto', type: 'anchor' }
  ];

  // Smooth scroll handler - navega a landing si no estamos ahí
  // Usa navegación SPA para evitar recargas completas de página
  const handleNavClick = (e, href) => {
    e.preventDefault();
    const targetId = href.replace('#', '');

    // Función para hacer scroll al elemento con offset del navbar
    const scrollToElement = () => {
      const element = document.getElementById(targetId);
      if (element) {
        const headerOffset = 115; // Altura del navbar (responsivo, usar max)
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
        return true;
      }
      return false;
    };

    if (isOnLanding) {
      // Si estamos en la landing, hacer scroll directo
      scrollToElement();
    } else {
      // Si estamos en una subpágina, navegar usando SPA (sin reload)
      navigate('/');
      // Intentar múltiples veces con delay incremental
      const attemptScroll = (attempts = 0) => {
        if (attempts >= 5) return;
        setTimeout(() => {
          if (!scrollToElement()) {
            attemptScroll(attempts + 1);
          }
        }, 100 + (attempts * 100));
      };
      attemptScroll();
    }

    setIsMobileMenuOpen(false);
    setIsServicesOpen(false);
    setIsCatalogosOpen(false);
  };

  return (
    <>
      {/* Main Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-lg shadow-lg'
          : 'bg-white/10 backdrop-blur-md'
      }`}>
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-24">
          <div className="flex items-center justify-between h-[88px] sm:h-24 lg:h-28">
            {/* Logo Completo Vectorizado - Isotipo + Wordmark con tipografía original */}
            {/* Tamaños responsivos: móvil h-12, tablet h-16, desktop h-20 */}
            <Link to="/" className="flex items-center group">
              <div className={`relative transition-all duration-300 ${
                isScrolled
                  ? ''
                  : 'filter drop-shadow-[0_3px_12px_rgba(0,0,0,0.35)]'
              }`}>
                <img
                  src={isScrolled
                    ? '/images/dimogen/logos/svg/dimogen-logo-completo.svg'
                    : '/images/dimogen/logos/svg/dimogen-logo-completo-white.svg'
                  }
                  alt={company?.logo_alt_text || company?.name || 'DIMOGEN'}
                  className="h-12 sm:h-16 lg:h-20 w-auto object-contain transition-all duration-300
                           hover:scale-105"
                />
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                link.type === 'dropdown' ? (
                  // Dropdown de Servicios
                  <div key={link.name} className="relative" ref={servicesRef}>
                    <button
                      onClick={() => {
                        setIsServicesOpen(!isServicesOpen);
                        setIsCatalogosOpen(false);
                      }}
                      className={`relative text-sm font-medium transition-colors flex items-center gap-1 ${
                        isScrolled
                          ? 'text-gray-700 hover:text-[#0047CB]'
                          : 'text-white/90 hover:text-white'
                      }`}
                      style={{ fontFamily: "'Poppins', sans-serif" }}
                    >
                      {link.name}
                      <FaChevronDown className={`w-3 h-3 transition-transform ${isServicesOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {isServicesOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                        >
                          <div className="p-2">
                            {serviciosLinks.map((servicio) => {
                              const Icon = servicio.icon;
                              return (
                                <Link
                                  key={servicio.name}
                                  to={servicio.href}
                                  className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors group"
                                >
                                  <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
                                    style={{ backgroundColor: `${servicio.color}15` }}
                                  >
                                    <Icon className="w-5 h-5" style={{ color: servicio.color }} />
                                  </div>
                                  <div>
                                    <div className="font-semibold text-gray-900 group-hover:text-[#0047CB] transition-colors">
                                      {servicio.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {servicio.description}
                                    </div>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                          <div className="border-t border-gray-100 p-4 bg-gray-50">
                            <a
                              href="#lineas-negocio"
                              onClick={(e) => {
                                handleNavClick(e, '#lineas-negocio');
                                setIsServicesOpen(false);
                              }}
                              className="text-sm text-[#0047CB] hover:underline"
                            >
                              Ver todos los servicios
                            </a>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : link.type === 'dropdown-catalogos' ? (
                  // Dropdown de Catálogos
                  <div key={link.name} className="relative" ref={catalogosRef}>
                    <button
                      onClick={() => {
                        setIsCatalogosOpen(!isCatalogosOpen);
                        setIsServicesOpen(false);
                      }}
                      className={`relative text-sm font-medium transition-colors flex items-center gap-1 ${
                        isScrolled
                          ? 'text-gray-700 hover:text-[#0047CB]'
                          : 'text-white/90 hover:text-white'
                      }`}
                      style={{ fontFamily: "'Poppins', sans-serif" }}
                    >
                      {link.name}
                      <FaChevronDown className={`w-3 h-3 transition-transform ${isCatalogosOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {isCatalogosOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                        >
                          <div className="p-2">
                            {catalogosLinks.map((catalogo) => {
                              const Icon = catalogo.icon;
                              return (
                                <Link
                                  key={catalogo.name}
                                  to={catalogo.href}
                                  className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors group"
                                >
                                  <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
                                    style={{ backgroundColor: `${catalogo.color}15` }}
                                  >
                                    <Icon className="w-5 h-5" style={{ color: catalogo.color }} />
                                  </div>
                                  <div>
                                    <div className="font-semibold text-gray-900 group-hover:text-[#0047CB] transition-colors">
                                      {catalogo.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {catalogo.description}
                                    </div>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  // Enlaces anchor normales
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className={`relative group text-sm font-medium transition-colors ${
                      isScrolled
                        ? 'text-gray-700 hover:text-[#0047CB]'
                        : 'text-white/90 hover:text-white'
                    }`}
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    {link.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#00A3E0] transition-all duration-300 group-hover:w-full" />
                  </a>
                )
              ))}
            </div>

            {/* CTA Button (Desktop) */}
            <div className="hidden lg:flex items-center gap-4">
              <a
                href="https://wa.me/525610454458?text=Hola,%20me%20interesa%20información%20sobre%20sus%20servicios"
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-sm
                          transition-all duration-300 ${
                  isScrolled
                    ? 'bg-[#0047CB] text-white hover:bg-[#0747A6] shadow-lg hover:shadow-xl'
                    : 'bg-white text-[#0047CB] hover:bg-[#00A3E0] hover:text-white shadow-lg'
                }`}
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                <FaWhatsapp className="w-4 h-4" />
                Agenda tu cita
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden p-2 rounded-lg transition-colors ${
                isScrolled
                  ? 'text-[#0047CB] hover:bg-gray-100'
                  : 'text-white hover:bg-white/10'
              }`}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <FaTimes className="w-6 h-6" />
              ) : (
                <FaBars className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-[88px] sm:top-24 z-30 lg:hidden"
          >
            <div className="bg-white shadow-2xl border-t border-gray-100">
              <div className="max-w-lg mx-auto px-6 py-6 space-y-2">
                {navLinks.map((link, index) => (
                  link.type === 'dropdown' ? (
                    // Dropdown de Servicios (Mobile)
                    <motion.div
                      key={link.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <button
                        onClick={() => {
                          setIsServicesOpen(!isServicesOpen);
                          setIsCatalogosOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl
                                 text-gray-700 hover:bg-[#0047CB]/5 hover:text-[#0047CB]
                                 transition-colors"
                        style={{ fontFamily: "'Poppins', sans-serif" }}
                      >
                        <span className="font-medium">{link.name}</span>
                        <FaChevronDown className={`w-4 h-4 transition-transform ${isServicesOpen ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {isServicesOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden pl-4"
                          >
                            {serviciosLinks.map((servicio) => {
                              const Icon = servicio.icon;
                              return (
                                <Link
                                  key={servicio.name}
                                  to={servicio.href}
                                  className="flex items-center gap-3 px-4 py-3 rounded-xl
                                           text-gray-600 hover:bg-gray-50 transition-colors"
                                  style={{ fontFamily: "'Poppins', sans-serif" }}
                                >
                                  <Icon className="w-4 h-4" style={{ color: servicio.color }} />
                                  <span className="text-sm font-medium">{servicio.name}</span>
                                </Link>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ) : link.type === 'dropdown-catalogos' ? (
                    // Dropdown de Catálogos (Mobile)
                    <motion.div
                      key={link.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <button
                        onClick={() => {
                          setIsCatalogosOpen(!isCatalogosOpen);
                          setIsServicesOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl
                                 text-gray-700 hover:bg-[#0047CB]/5 hover:text-[#0047CB]
                                 transition-colors"
                        style={{ fontFamily: "'Poppins', sans-serif" }}
                      >
                        <span className="font-medium">{link.name}</span>
                        <FaChevronDown className={`w-4 h-4 transition-transform ${isCatalogosOpen ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {isCatalogosOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden pl-4"
                          >
                            {catalogosLinks.map((catalogo) => {
                              const Icon = catalogo.icon;
                              return (
                                <Link
                                  key={catalogo.name}
                                  to={catalogo.href}
                                  className="flex items-center gap-3 px-4 py-3 rounded-xl
                                           text-gray-600 hover:bg-gray-50 transition-colors"
                                  style={{ fontFamily: "'Poppins', sans-serif" }}
                                >
                                  <Icon className="w-4 h-4" style={{ color: catalogo.color }} />
                                  <span className="text-sm font-medium">{catalogo.name}</span>
                                </Link>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ) : (
                    // Enlaces anchor normales (Mobile)
                    <motion.a
                      key={link.name}
                      href={link.href}
                      onClick={(e) => handleNavClick(e, link.href)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between px-4 py-3 rounded-xl
                               text-gray-700 hover:bg-[#0047CB]/5 hover:text-[#0047CB]
                               transition-colors"
                      style={{ fontFamily: "'Poppins', sans-serif" }}
                    >
                      <span className="font-medium">{link.name}</span>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </motion.a>
                  )
                ))}

                {/* Mobile CTA */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="pt-4 border-t border-gray-100"
                >
                  <a
                    href="https://wa.me/525610454458?text=Hola,%20me%20interesa%20información%20sobre%20sus%20servicios"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 w-full px-6 py-4
                             bg-gradient-to-r from-[#0047CB] to-[#00A3E0] text-white
                             rounded-xl font-semibold shadow-lg"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    <FaWhatsapp className="w-5 h-5" />
                    Agenda tu cita por WhatsApp
                  </a>
                </motion.div>

                {/* Mobile Contact Info */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="pt-4 flex justify-center gap-6"
                >
                  <a href="https://facebook.com/DimogenMX" target="_blank" rel="noopener noreferrer"
                     className="p-3 bg-gray-100 rounded-full text-[#0047CB] hover:bg-[#0047CB] hover:text-white transition-colors">
                    <FaFacebookF className="w-5 h-5" />
                  </a>
                  <a href="https://instagram.com/DimogenMX" target="_blank" rel="noopener noreferrer"
                     className="p-3 bg-gray-100 rounded-full text-[#0047CB] hover:bg-[#0047CB] hover:text-white transition-colors">
                    <FaInstagram className="w-5 h-5" />
                  </a>
                  <a href="https://tiktok.com/@DimogenMX" target="_blank" rel="noopener noreferrer"
                     className="p-3 bg-gray-100 rounded-full text-[#0047CB] hover:bg-[#0047CB] hover:text-white transition-colors">
                    <FaTiktok className="w-5 h-5" />
                  </a>
                </motion.div>
              </div>
            </div>

            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/20 -z-10"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NavbarDimogen;
