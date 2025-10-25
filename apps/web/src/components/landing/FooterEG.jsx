import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaWhatsapp,
  FaClock
} from 'react-icons/fa';
import { FooterLogo } from '../brand/BrandLogo';

const FooterEG = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Inicio', href: '/' },
    { name: 'Estudios', href: '/estudios' },
    { name: 'Nosotros', href: '/nosotros' },
    { name: 'Contacto', href: '/contacto' }
  ];

  const services = [
    { name: 'Hematología', href: '/estudios' },
    { name: 'Química Sanguínea', href: '/estudios' },
    { name: 'Inmunología', href: '/estudios' },
    { name: 'Endocrinología', href: '/estudios' }
  ];

  return (
    <footer className="bg-white border-t border-gray-200">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info - Logo profesional */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <div className="mb-4">
              <FooterLogo />
              <p className="text-eg-gray text-xs mt-2">Laboratorio Clínico Microbiológico</p>
            </div>
            <p className="text-eg-gray text-sm leading-relaxed">
              43 años de experiencia brindando servicios de laboratorio clínico con
              la más alta calidad y tecnología.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="text-eg-dark font-medium text-lg mb-4">
              Enlaces Rápidos
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="text-eg-gray hover:text-eg-purple transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="text-eg-dark font-medium text-lg mb-4">
              Servicios
            </h4>
            <ul className="space-y-2">
              {services.map((service, index) => (
                <li key={index}>
                  <Link
                    to={service.href}
                    className="text-eg-gray hover:text-eg-purple transition-colors text-sm"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h4 className="text-eg-dark font-medium text-lg mb-4">
              Contacto
            </h4>
            <div className="space-y-3">
              <a
                href="tel:+582127620561"
                className="flex items-center gap-2 text-eg-gray hover:text-eg-purple transition-colors text-sm"
              >
                <FaPhone className="text-eg-purple" />
                (0212) 762-0561
              </a>
              <a
                href="https://wa.me/584149019327"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-eg-gray hover:text-eg-purple transition-colors text-sm"
              >
                <FaWhatsapp className="text-eg-purple" />
                +58 414-901-9327
              </a>
              <a
                href="mailto:info@laboratorioeg.com"
                className="flex items-center gap-2 text-eg-gray hover:text-eg-purple transition-colors text-sm"
              >
                <FaEnvelope className="text-eg-purple" />
                info@laboratorioeg.com
              </a>
              <div className="flex items-start gap-2 text-eg-gray text-sm">
                <FaMapMarkerAlt className="text-eg-purple mt-1 flex-shrink-0" />
                <div>
                  <p>Av. Libertador, Edificio Majestic</p>
                  <p>Piso 1, Consultorio 18</p>
                  <p>Caracas, Venezuela</p>
                </div>
              </div>
              <div className="flex items-start gap-2 text-eg-gray text-sm">
                <FaClock className="text-eg-purple mt-1 flex-shrink-0" />
                <div>
                  <p>Lun-Vie: 7:00 AM - 4:00 PM</p>
                  <p>Sábados: 7:00 AM - 12:00 PM</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Certifications */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-wrap items-center justify-center gap-6 text-eg-gray text-sm">
            <span className="flex items-center gap-2">
              ✓ Personal Certificado
            </span>
            <span className="w-1 h-1 bg-eg-gray/30 rounded-full" />
            <span className="flex items-center gap-2">
              ✓ ISO 9001:2015
            </span>
            <span className="w-1 h-1 bg-eg-gray/30 rounded-full" />
            <span className="flex items-center gap-2">
              ✓ MPPS Autorizado
            </span>
            <span className="w-1 h-1 bg-eg-gray/30 rounded-full" />
            <span className="flex items-center gap-2">
              ✓ 43 Años de Experiencia
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-eg-light-gray py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-eg-gray text-xs text-center md:text-left">
              © {currentYear} Laboratorio Elizabeth Gutiérrez. Todos los derechos reservados.
            </p>
            <div className="flex gap-6 text-xs">
              <Link to="#" className="text-eg-gray hover:text-eg-purple transition-colors">
                Política de Privacidad
              </Link>
              <Link to="#" className="text-eg-gray hover:text-eg-purple transition-colors">
                Términos y Condiciones
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterEG;