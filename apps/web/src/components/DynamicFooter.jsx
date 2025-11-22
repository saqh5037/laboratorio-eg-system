import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCompanyInfo } from '../hooks/useCompanyInfo';
import { useNavigation } from '../hooks/useNavigation';
import { FooterLogo } from './brand/BrandLogo';
import {
  FaWhatsapp,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock
} from 'react-icons/fa';

const DynamicFooter = () => {
  const { companyInfo, loading: companyLoading, getFormattedCopyright, getPhones } = useCompanyInfo();
  const { getFooterQuickLinks, getFooterServices, loading: navLoading } = useNavigation();

  if (companyLoading || navLoading) {
    return (
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </footer>
    );
  }

  if (!companyInfo) return null;

  const quickLinks = getFooterQuickLinks();
  const services = getFooterServices();
  const phones = getPhones();

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
              {companyInfo.years_of_experience} años de experiencia brindando servicios de laboratorio clínico con
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
              {quickLinks.map((link) => (
                <li key={link.id}>
                  {link.is_external ? (
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-eg-gray hover:text-eg-purple transition-colors text-sm"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      to={link.url}
                      className="text-eg-gray hover:text-eg-purple transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  )}
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
              {services.map((service) => (
                <li key={service.id}>
                  <Link
                    to={service.url}
                    className="text-eg-gray hover:text-eg-purple transition-colors text-sm"
                  >
                    {service.label}
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
            <ul className="space-y-3">
              {/* Phone */}
              <li className="flex items-center gap-2 text-sm">
                <FaPhone className="text-eg-purple flex-shrink-0" />
                <a
                  href={`tel:${phones[0]?.replace(/\s/g, '')}`}
                  className="text-eg-gray hover:text-eg-purple transition-colors"
                >
                  {phones[0]}
                </a>
              </li>

              {/* WhatsApp */}
              <li className="flex items-center gap-2 text-sm">
                <FaWhatsapp className="text-green-500 flex-shrink-0" />
                <a
                  href={companyInfo.whatsapp_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-eg-gray hover:text-eg-purple transition-colors"
                >
                  {companyInfo.whatsapp}
                </a>
              </li>

              {/* Email */}
              <li className="flex items-center gap-2 text-sm">
                <FaEnvelope className="text-eg-purple flex-shrink-0" />
                <a
                  href={`mailto:${companyInfo.email}`}
                  className="text-eg-gray hover:text-eg-purple transition-colors"
                >
                  {companyInfo.email}
                </a>
              </li>

              {/* Address */}
              <li className="flex items-start gap-2 text-sm">
                <FaMapMarkerAlt className="text-eg-purple mt-1 flex-shrink-0" />
                <span className="text-eg-gray">
                  {companyInfo.address_street.split(',').slice(0, 2).join(',')}<br />
                  {companyInfo.address_city}, {companyInfo.address_country}
                </span>
              </li>

              {/* Hours */}
              <li className="flex items-start gap-2 text-sm">
                <FaClock className="text-eg-purple mt-1 flex-shrink-0" />
                <div className="text-eg-gray">
                  <p>{companyInfo.hours_weekday}</p>
                  <p>{companyInfo.hours_saturday}</p>
                </div>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>

      {/* Bottom Bar - Con certificaciones */}
      <div className="bg-eg-purple/5 border-t border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Certificaciones */}
            <div className="flex flex-wrap gap-4 text-xs text-eg-gray">
              <span className="flex items-center gap-1">
                <span className="text-green-600">✓</span> Personal Certificado
              </span>
              <span className="flex items-center gap-1">
                <span className="text-green-600">✓</span> ISO 9001:2015
              </span>
              <span className="flex items-center gap-1">
                <span className="text-green-600">✓</span> MPPS Autorizado
              </span>
              <span className="flex items-center gap-1">
                <span className="text-green-600">✓</span> {companyInfo.years_of_experience} Años de Experiencia
              </span>
            </div>

            {/* Copyright */}
            <p className="text-eg-gray text-xs text-center md:text-right">
              {getFormattedCopyright()}
            </p>
          </div>

          {/* Legal Links */}
          <div className="flex justify-center md:justify-end gap-4 mt-3 text-xs">
            {companyInfo.privacy_policy_url && (
              <Link
                to={companyInfo.privacy_policy_url}
                className="text-eg-gray hover:text-eg-purple transition-colors"
              >
                Política de Privacidad
              </Link>
            )}
            {companyInfo.terms_of_service_url && (
              <Link
                to={companyInfo.terms_of_service_url}
                className="text-eg-gray hover:text-eg-purple transition-colors"
              >
                Términos y Condiciones
              </Link>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default DynamicFooter;
