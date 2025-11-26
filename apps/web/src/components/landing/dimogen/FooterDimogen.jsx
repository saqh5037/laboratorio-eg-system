import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaWhatsapp,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaDna,
  FaUserMd,
  FaLeaf,
  FaArrowUp,
  FaCertificate
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
 * FooterDimogen Component
 * Footer profesional con diseño moderno para DIMOGEN
 * Incluye información de contacto, servicios y certificaciones
 */
const FooterDimogen = ({ company, contact, services: servicesData }) => {
  const currentYear = new Date().getFullYear();
  const location = useLocation();
  const navigate = useNavigate();

  // Detectar si estamos en la landing principal
  const isOnLanding = ['/', '/dimogen', '/dimogen/'].includes(location.pathname);

  // Scroll to top handler
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Smart navigation handler - usa SPA navigation con offset y reintentos
  const handleNavClick = (e, href) => {
    e.preventDefault();
    const targetId = href.replace('#', '');

    // Función para hacer scroll al elemento con offset del navbar
    const scrollToElement = () => {
      const element = document.getElementById(targetId);
      if (element) {
        const headerOffset = 115; // Altura del navbar (responsivo)
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
      // Si estamos en una subpágina, navegar usando SPA
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
  };

  // Servicios principales
  const servicios = [
    {
      icon: FaDna,
      title: 'Biología Molecular',
      items: ['Pruebas Genéticas', 'Secuenciación', 'PCR', 'Diagnóstico Molecular']
    },
    {
      icon: FaUserMd,
      title: 'Unidad de Salud',
      items: ['Consulta Médica', 'Análisis Clínicos', 'Ultrasonografía', 'Check-up']
    },
    {
      icon: FaLeaf,
      title: 'Microbiología Alimentos',
      items: ['Análisis de Agua', 'Control de Alimentos', 'Certificación ISO', 'Superficies']
    }
  ];

  // Links rápidos - con type para diferenciar anchor vs page
  const quickLinks = [
    { name: 'Inicio', href: '#inicio', type: 'anchor' },
    { name: 'Servicios', href: '#lineas-negocio', type: 'anchor' },
    { name: 'Nosotros', href: '#sobre-dimogen', type: 'anchor' },
    { name: 'Biología Molecular', href: '/dimogen/servicios/biologia-molecular', type: 'page' },
    { name: 'Microbiología Alimentos', href: '/dimogen/servicios/microbiologia-alimentos', type: 'page' },
    { name: 'Contacto', href: '#contacto', type: 'anchor' }
  ];

  // Información de contacto
  const contactInfo = [
    {
      icon: FaMapMarkerAlt,
      label: 'Dirección',
      value: 'Calle Quintana Roo 78, Roma Sur, Cuauhtémoc, 06760, CDMX',
      href: 'https://www.google.com/maps/search/?api=1&query=Calle+Quintana+Roo+78+Roma+Sur+CDMX'
    },
    {
      icon: FaPhone,
      label: 'Teléfonos',
      value: '56 1033 5124 / 56 1045 4458',
      href: 'tel:5610335124'
    },
    {
      icon: FaWhatsapp,
      label: 'WhatsApp',
      value: '56 1045 4458',
      href: 'https://wa.me/525610454458'
    },
    {
      icon: FaEnvelope,
      label: 'Email',
      value: 'hola@dimogen.com.mx',
      href: 'mailto:hola@dimogen.com.mx'
    },
    {
      icon: FaClock,
      label: 'Horario',
      value: 'Lun - Vie: 7:30 AM - 7:00 PM',
      href: null
    }
  ];

  // Redes sociales
  const socialLinks = [
    { icon: FaFacebookF, href: 'https://facebook.com/DimogenMX', label: 'Facebook' },
    { icon: FaInstagram, href: 'https://instagram.com/DimogenMX', label: 'Instagram' },
    { icon: FaTiktok, href: 'https://tiktok.com/@DimogenMX', label: 'TikTok' },
    { icon: FaWhatsapp, href: 'https://wa.me/525610454458', label: 'WhatsApp' }
  ];

  return (
    <footer className="relative bg-gradient-to-b from-gray-900 to-[#0a1628] text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="footer-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#footer-grid)" />
        </svg>
      </div>

      {/* Decorative Gradient Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#0047CB]/20 rounded-full blur-[120px] -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#00A3E0]/15 rounded-full blur-[100px] translate-y-1/2" />

      {/* Main Footer Content */}
      <div className="relative z-10">
        {/* CTA Section */}
        <div className="border-b border-white/10">
          <div className="max-w-[1600px] mx-auto px-6 lg:px-24 py-12">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div>
                <h3 className="text-2xl md:text-3xl font-semibold text-white mb-2"
                    style={{ fontFamily: "'Poppins', sans-serif" }}>
                  ¿Necesitas un diagnóstico preciso?
                </h3>
                <p className="text-white/80"
                   style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Agenda tu cita hoy y recibe atención personalizada.
                </p>
              </div>
              <a
                href="https://wa.me/525610454458?text=Hola,%20me%20interesa%20agendar%20una%20cita"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#0047CB] to-[#00A3E0]
                         text-white rounded-xl font-semibold text-sm sm:text-base shadow-xl hover:shadow-2xl
                         hover:scale-105 transition-all duration-300 w-full sm:w-auto"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                <FaWhatsapp className="w-5 h-5" />
                Agendar Cita
              </a>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="max-w-[1600px] mx-auto px-6 lg:px-24 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            {/* Column 1: Logo & About */}
            <div className="lg:col-span-1">
              {/* Logo Completo Vectorizado - versión blanca para fondo oscuro */}
              {/* Tamaños responsivos: móvil h-12, tablet h-16, desktop h-20 */}
              <div className="mb-8">
                <img
                  src="/images/dimogen/logos/svg/dimogen-logo-completo-white.svg"
                  alt={company?.logo_alt_text || company?.name || 'DIMOGEN'}
                  className="h-12 sm:h-16 lg:h-20 w-auto object-contain
                           filter drop-shadow-[0_2px_8px_rgba(255,255,255,0.15)]
                           hover:scale-105 transition-transform duration-300"
                />
              </div>

              <p className="text-white/80 text-sm leading-relaxed mb-6"
                 style={{ fontFamily: "'Poppins', sans-serif" }}>
                {company?.description || 'Laboratorio de alta especialidad enfocado en la salud integral del paciente. Ofrecemos servicios de consultoría médica, análisis clínicos y microbiología de alimentos.'}
              </p>

              {/* Certifications */}
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg">
                  <FaCertificate className="w-4 h-4 text-[#00A3E0]" />
                  <span className="text-xs text-white/80">COFEPRIS</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-white/10 rounded-lg">
                  <FaCertificate className="w-4 h-4 text-[#98CB59]" />
                  <span className="text-xs text-white/80">ISO 9001:2015</span>
                </div>
              </div>
            </div>

            {/* Column 2: Servicios */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-6"
                  style={{ fontFamily: "'Poppins', sans-serif" }}>
                Nuestros Servicios
              </h4>
              <ul className="space-y-4">
                {servicios.map((servicio, index) => {
                  const Icon = servicio.icon;
                  return (
                    <li key={index}>
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-4 h-4 text-[#00A3E0]" />
                        <span className="text-white font-medium text-sm"
                              style={{ fontFamily: "'Poppins', sans-serif" }}>
                          {servicio.title}
                        </span>
                      </div>
                      <ul className="pl-6 space-y-1">
                        {servicio.items.map((item, idx) => (
                          <li key={idx} className="text-white/70 text-sm hover:text-white transition-colors cursor-pointer">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Column 3: Links Rápidos */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-6"
                  style={{ fontFamily: "'Poppins', sans-serif" }}>
                Enlaces Rápidos
              </h4>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    {link.type === 'page' ? (
                      // Enlaces a páginas completas
                      <Link
                        to={link.href}
                        className="flex items-center gap-2 text-white/80 hover:text-[#00A3E0] transition-colors group cursor-pointer"
                        style={{ fontFamily: "'Poppins', sans-serif" }}
                      >
                        <span className="w-1.5 h-1.5 bg-[#0047CB] rounded-full group-hover:bg-[#00A3E0] transition-colors" />
                        {link.name}
                      </Link>
                    ) : (
                      // Enlaces anchor (scroll en landing)
                      <a
                        href={link.href}
                        onClick={(e) => handleNavClick(e, link.href)}
                        className="flex items-center gap-2 text-white/80 hover:text-[#00A3E0] transition-colors group cursor-pointer"
                        style={{ fontFamily: "'Poppins', sans-serif" }}
                      >
                        <span className="w-1.5 h-1.5 bg-[#0047CB] rounded-full group-hover:bg-[#00A3E0] transition-colors" />
                        {link.name}
                      </a>
                    )}
                  </li>
                ))}
              </ul>

              {/* Grupo Micro-Tec */}
              <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-xs text-white/70 mb-2">Perteneciente a</p>
                <p className="text-white font-semibold"
                   style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Grupo Micro-Tec
                </p>
                <p className="text-xs text-white/70 mt-1">
                  Más de 25 años de experiencia
                </p>
              </div>
            </div>

            {/* Column 4: Contacto */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-6"
                  style={{ fontFamily: "'Poppins', sans-serif" }}>
                Contacto
              </h4>
              <ul className="space-y-4">
                {contactInfo.map((item, index) => {
                  const Icon = item.icon;
                  const content = (
                    <div className="flex items-start gap-3 group">
                      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0
                                    group-hover:bg-[#0047CB]/30 transition-colors">
                        <Icon className="w-4 h-4 text-[#00A3E0]" />
                      </div>
                      <div>
                        <p className="text-xs text-white/70">{item.label}</p>
                        <p className="text-white/90 text-sm group-hover:text-white transition-colors"
                           style={{ fontFamily: "'Poppins', sans-serif" }}>
                          {item.value}
                        </p>
                      </div>
                    </div>
                  );

                  return (
                    <li key={index}>
                      {item.href ? (
                        <a href={item.href} target="_blank" rel="noopener noreferrer" className="block">
                          {content}
                        </a>
                      ) : (
                        content
                      )}
                    </li>
                  );
                })}
              </ul>

              {/* Social Links */}
              <div className="mt-8">
                <p className="text-sm text-white/70 mb-4">Síguenos en redes</p>
                <div className="flex gap-3">
                  {socialLinks.map((social, index) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={index}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.label}
                        className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center
                                 text-white/70 hover:bg-[#0047CB] hover:text-white transition-all
                                 hover:scale-110"
                      >
                        <Icon className="w-4 h-4" />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10">
          <div className="max-w-[1600px] mx-auto px-6 lg:px-24 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <p className="text-white/80 text-sm"
                   style={{ fontFamily: "'Poppins', sans-serif" }}>
                  © {currentYear} {company?.name || 'DIMOGEN'} - {company?.slogan || 'Grupo Micro-Tec'}. Todos los derechos reservados.
                </p>
                <p className="text-white/60 text-xs mt-1">
                  {company?.rif ? `RIF: ${company.rif}` : 'COFEPRIS: 2409152002A00328'}
                </p>
              </div>

              <div className="flex items-center gap-6 text-sm text-white/80">
                <a href="#" className="hover:text-white transition-colors">
                  Aviso de Privacidad
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  Términos y Condiciones
                </a>
              </div>

              {/* Scroll to Top */}
              <button
                onClick={scrollToTop}
                className="p-3 bg-[#0047CB] rounded-full text-white shadow-lg
                         hover:bg-[#00A3E0] hover:scale-110 transition-all"
                aria-label="Volver arriba"
              >
                <FaArrowUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterDimogen;
