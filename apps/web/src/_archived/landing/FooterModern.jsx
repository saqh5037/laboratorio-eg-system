import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaWhatsapp,
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaClock,
  FaFlask,
  FaUserMd,
  FaHeart,
  FaChevronRight
} from 'react-icons/fa';

const FooterModern = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Inicio', href: '/' },
    { name: 'Estudios', href: '/estudios' },
    { name: 'Nosotros', href: '/nosotros' },
    { name: 'Contacto', href: '/contacto' },
    { name: 'Resultados', href: '/resultados' }
  ];

  const services = [
    { name: 'Hematología', href: '/estudios' },
    { name: 'Química Sanguínea', href: '/estudios' },
    { name: 'Inmunología', href: '/estudios' },
    { name: 'Endocrinología', href: '/estudios' },
    { name: 'Microbiología', href: '/estudios' }
  ];

  const contactInfo = [
    { icon: FaPhone, text: '(0212) 762-0561', href: 'tel:+582127620561' },
    { icon: FaPhone, text: '(0212) 763-5909', href: 'tel:+582127635909' },
    { icon: FaWhatsapp, text: '+58 414-901-9327', href: 'https://wa.me/584149019327' },
    { icon: FaEnvelope, text: 'info@laboratorioeg.com', href: 'mailto:info@laboratorioeg.com' }
  ];

  const socialLinks = [
    { icon: FaFacebookF, href: '#', label: 'Facebook' },
    { icon: FaInstagram, href: '#', label: 'Instagram' },
    { icon: FaTwitter, href: '#', label: 'Twitter' }
  ];

  return (
    <footer className="bg-gradient-to-br from-eg-dark via-gray-900 to-eg-dark">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-eg-purple to-eg-pink rounded-full flex items-center justify-center">
                <FaFlask className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Laboratorio EG</h3>
                <p className="text-gray-400 text-sm">Elizabeth Gutiérrez</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              43 años de experiencia brindando servicios de laboratorio clínico con 
              la más alta calidad y tecnología de vanguardia.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-3 pt-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 bg-gradient-to-br from-eg-purple/20 to-eg-pink/20 rounded-full flex items-center justify-center text-white hover:from-eg-purple hover:to-eg-pink transition-all duration-300"
                >
                  <social.icon />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <FaChevronRight className="text-eg-purple text-sm" />
              Enlaces Rápidos
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-eg-purple transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-eg-purple rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="group-hover:translate-x-1 transition-transform">
                      {link.name}
                    </span>
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
            <h4 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <FaFlask className="text-eg-purple text-sm" />
              Nuestros Servicios
            </h4>
            <ul className="space-y-2">
              {services.map((service, index) => (
                <li key={index}>
                  <Link
                    to={service.href}
                    className="text-gray-400 hover:text-eg-purple transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-eg-purple rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="group-hover:translate-x-1 transition-transform">
                      {service.name}
                    </span>
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
            <h4 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
              <FaPhone className="text-eg-purple text-sm" />
              Contacto
            </h4>
            <ul className="space-y-3">
              {contactInfo.map((info, index) => (
                <li key={index}>
                  <a
                    href={info.href}
                    className="text-gray-400 hover:text-eg-purple transition-colors flex items-start gap-3 group"
                  >
                    <info.icon className="text-eg-purple mt-1 flex-shrink-0" />
                    <span className="group-hover:translate-x-1 transition-transform">
                      {info.text}
                    </span>
                  </a>
                </li>
              ))}
              <li className="pt-2">
                <div className="flex items-start gap-3 text-gray-400">
                  <FaMapMarkerAlt className="text-eg-purple mt-1 flex-shrink-0" />
                  <div>
                    <p>Av. Libertador, Edificio Majestic</p>
                    <p>Piso 1, Consultorio 18</p>
                    <p>Caracas, Venezuela</p>
                  </div>
                </div>
              </li>
              <li className="pt-2">
                <div className="flex items-start gap-3 text-gray-400">
                  <FaClock className="text-eg-purple mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-white mb-1">Horarios:</p>
                    <p>Lun-Vie: 7:00 AM - 4:00 PM</p>
                    <p>Sábados: 7:00 AM - 12:00 PM</p>
                  </div>
                </div>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Certifications Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-wrap items-center justify-center gap-6 text-gray-400 text-sm">
            <div className="flex items-center gap-2">
              <FaUserMd className="text-eg-purple" />
              <span>Personal Certificado</span>
            </div>
            <div className="w-1 h-1 bg-gray-600 rounded-full" />
            <div className="flex items-center gap-2">
              <FaFlask className="text-eg-purple" />
              <span>ISO 9001:2015</span>
            </div>
            <div className="w-1 h-1 bg-gray-600 rounded-full" />
            <div className="flex items-center gap-2">
              <FaHeart className="text-eg-purple" />
              <span>MPPS Autorizado</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-black/30 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm text-center md:text-left">
              © {currentYear} Laboratorio Elizabeth Gutiérrez. Todos los derechos reservados.
            </p>
            <div className="flex gap-6 text-sm">
              <Link to="#" className="text-gray-500 hover:text-eg-purple transition-colors">
                Política de Privacidad
              </Link>
              <Link to="#" className="text-gray-500 hover:text-eg-purple transition-colors">
                Términos y Condiciones
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterModern;