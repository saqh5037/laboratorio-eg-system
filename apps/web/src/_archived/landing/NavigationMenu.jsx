import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHome, FaUsers, FaFlask, FaClock, FaMapMarkerAlt, FaBars, FaTimes, FaWhatsapp } from 'react-icons/fa';

const NavigationMenu = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { name: 'Inicio', href: '#inicio', icon: FaHome },
    { name: 'Conócenos', href: '#conocenos', icon: FaUsers },
    { name: 'Servicios', href: '#servicios', icon: FaFlask },
    { name: 'Acceso Rápido', href: '#acceso-rapido', icon: FaClock },
    { name: 'Ubicación', href: '#ubicacion', icon: FaMapMarkerAlt }
  ];

  const scrollToSection = (href) => {
    if (href === '#inicio') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.querySelector(href);
      if (element) {
        const offset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      }
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-[0_4px_12px_rgba(123,104,166,0.1)] py-3' : 'bg-white backdrop-blur-sm py-4 shadow-sm'
    }`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 bg-gradient-to-br from-eg-purple to-eg-pink rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(123,104,166,0.2)]">
                <span className="text-white font-bold text-xl">EG</span>
              </div>
              <div>
                <h1 className="text-xl font-medium text-eg-purple">Laboratorio EG</h1>
                <p className="text-xs text-eg-gray -mt-1">Elizabeth Gutiérrez</p>
              </div>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1">
            {menuItems.map((item) => (
              <button
                key={item.name}
                onClick={() => scrollToSection(item.href)}
                className="flex items-center gap-2 px-4 py-2 text-eg-gray hover:text-eg-purple transition-colors rounded-lg hover:bg-eg-purple/5 font-normal"
              >
                <item.icon className="text-sm" />
                <span className="font-medium">{item.name}</span>
              </button>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/contacto"
              className="px-5 py-2.5 border-2 border-eg-purple text-eg-purple rounded-lg hover:bg-eg-purple hover:text-white transition-all font-normal shadow-[0_4px_12px_rgba(123,104,166,0.1)] hover:shadow-[0_8px_24px_rgba(123,104,166,0.2)]"
            >
              Agendar Cita
            </Link>
            <a
              href="https://wa.me/584149019327"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-gradient-to-r from-eg-purple to-eg-purple/90 text-white rounded-lg hover:from-eg-purple/90 hover:to-eg-purple transition-all font-normal flex items-center gap-2 shadow-[0_4px_12px_rgba(123,104,166,0.2)] hover:shadow-[0_8px_24px_rgba(123,104,166,0.3)]"
            >
              <FaWhatsapp /> WhatsApp
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-eg-dark hover:text-eg-purple transition-colors"
          >
            {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <motion.div
          initial={false}
          animate={{ height: isMobileMenuOpen ? 'auto' : 0 }}
          className="md:hidden overflow-hidden"
        >
          <div className="py-4 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.name}
                onClick={() => scrollToSection(item.href)}
                className="flex items-center gap-3 w-full px-4 py-3 text-left text-eg-dark hover:text-eg-purple hover:bg-eg-purple/5 rounded-lg transition-colors"
              >
                <item.icon className="text-lg" />
                <span className="font-medium">{item.name}</span>
              </button>
            ))}
            <div className="pt-4 space-y-2">
              <Link
                to="/contacto"
                className="block text-center px-4 py-3 border border-eg-purple text-eg-purple rounded-full hover:bg-eg-purple hover:text-white transition-all font-medium"
              >
                Agendar Cita
              </Link>
              <a
                href="https://wa.me/584149019327"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-all font-medium"
              >
                <FaWhatsapp /> WhatsApp
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </nav>
  );
};

export default NavigationMenu;