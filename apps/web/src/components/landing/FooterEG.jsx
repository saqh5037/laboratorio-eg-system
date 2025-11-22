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
import { useCompanyInfo } from '../../hooks/useCompanyInfo';

const FooterEG = () => {
  const currentYear = new Date().getFullYear();
  const { companyInfo } = useCompanyInfo();

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
              Servicios de laboratorio clínico con la más alta calidad y tecnología.
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
              {companyInfo?.phone_main && (
                <a
                  href={`tel:${companyInfo.phone_main.replace(/\s/g, '')}`}
                  className="flex items-center gap-2 text-eg-gray hover:text-eg-purple transition-colors text-sm"
                >
                  <FaPhone className="text-eg-purple" />
                  {companyInfo.phone_main}
                </a>
              )}
              {companyInfo?.whatsapp_link && companyInfo?.whatsapp && (
                <a
                  href={companyInfo.whatsapp_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-eg-gray hover:text-eg-purple transition-colors text-sm"
                >
                  <FaWhatsapp className="text-eg-purple" />
                  {companyInfo.whatsapp}
                </a>
              )}
              {companyInfo?.email && (
                <a
                  href={`mailto:${companyInfo.email}`}
                  className="flex items-center gap-2 text-eg-gray hover:text-eg-purple transition-colors text-sm"
                >
                  <FaEnvelope className="text-eg-purple" />
                  {companyInfo.email}
                </a>
              )}
              {(companyInfo?.address_street || companyInfo?.address_city) && (
                <div className="flex items-start gap-2 text-eg-gray text-sm">
                  <FaMapMarkerAlt className="text-eg-purple mt-1 flex-shrink-0" />
                  <div>
                    {companyInfo?.address_street && <p>{companyInfo.address_street}</p>}
                    {companyInfo?.address_city && companyInfo?.address_state && (
                      <p>{companyInfo.address_city}, {companyInfo.address_state}</p>
                    )}
                    {companyInfo?.address_zip && companyInfo?.address_country && (
                      <p>{companyInfo.address_zip}, {companyInfo.address_country}</p>
                    )}
                  </div>
                </div>
              )}
              {companyInfo?.business_hours && (
                <div className="flex items-start gap-2 text-eg-gray text-sm">
                  <FaClock className="text-eg-purple mt-1 flex-shrink-0" />
                  <div>
                    <p>{companyInfo.business_hours}</p>
                  </div>
                </div>
              )}
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
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-eg-light-gray py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-eg-gray text-xs text-center md:text-left">
              © {currentYear} {companyInfo?.name || 'Laboratorio'}. Todos los derechos reservados.
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