import { Link } from 'react-router-dom';
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaFacebook,
  FaInstagram,
  FaWhatsapp,
  FaTwitter,
  FaYoutube,
  FaLinkedin,
  FaFlask,
  FaShieldAlt,
  FaCertificate,
  FaAward,
} from 'react-icons/fa';
import { FooterLogo } from './brand/BrandLogo';
import { useCompanyInfo } from '../hooks/useCompanyInfo';

// Mapeo de nombres de iconos a componentes
const iconMap = {
  FaFacebook: FaFacebook,
  FaInstagram: FaInstagram,
  FaTwitter: FaTwitter,
  FaWhatsapp: FaWhatsapp,
  FaYoutube: FaYoutube,
  FaLinkedin: FaLinkedin,
};

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { companyInfo, getSocialLinks, getFullAddress, getPhones } = useCompanyInfo();

  const quickLinks = [
    { name: 'Estudios', path: '/estudios' },
    { name: 'Resultados', path: '/resultados' },
    { name: 'Citas', path: '/citas' },
    { name: 'Nosotros', path: '/nosotros' },
  ];

  const services = [
    { name: 'Hematología', path: '/estudios/hematologia' },
    { name: 'Química Sanguínea', path: '/estudios/quimica' },
    { name: 'Microbiología', path: '/estudios/microbiologia' },
    { name: 'Inmunología', path: '/estudios/inmunologia' },
  ];

  const certifications = [
    { icon: <FaShieldAlt />, name: 'ISO 9001:2015' },
    { icon: <FaCertificate />, name: 'ISO 15189:2012' },
    { icon: <FaAward />, name: 'CAP Certified' },
  ];

  // Obtener redes sociales desde la API, con fallback vacío
  const socialLinksData = getSocialLinks();
  const socialLinks = socialLinksData.length > 0
    ? socialLinksData.map(social => {
        const IconComponent = iconMap[social.icon] || FaInstagram;
        return {
          icon: <IconComponent />,
          href: social.url,
          label: social.name
        };
      })
    : []; // Sin fallback hardcodeado - si no hay datos, no mostrar

  return (
    <footer className="bg-eg-black dark:bg-eg-dark-bg text-white dark:text-eg-dark-text transition-colors duration-300">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-12" style={{ marginLeft: 'var(--logo-margin, 37.8px)' }}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info - Logo profesional con BrandLogo */}
          <div>
            <div className="mb-4">
              <FooterLogo className="mb-2" />
              <p className="text-xs text-eg-gray dark:text-eg-dark-muted mt-2">
                {companyInfo?.short_name || companyInfo?.name || 'Laboratorio Clínico'}
              </p>
            </div>
            <p className="text-eg-gray dark:text-eg-dark-muted text-sm mb-4">
              {companyInfo?.description || 'Servicios de análisis clínicos con los más altos estándares de calidad y precisión.'}
            </p>
            {socialLinks.length > 0 && (
              <div className="flex gap-3">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    className="w-10 h-10 bg-eg-purple/20 rounded-lg flex items-center justify-center hover:bg-eg-purple transition-colors duration-300 min-w-touch-target min-h-touch-target"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links - NO font-semibold */}
          <div>
            <h3 className="text-lg mb-4 text-white dark:text-eg-dark-text">Enlaces Rápidos</h3>
            <ul className="space-y-2" role="list">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-eg-gray dark:text-eg-dark-muted hover:text-eg-purple transition-colors duration-300 text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services - NO font-semibold */}
          <div>
            <h3 className="text-lg mb-4 text-white dark:text-eg-dark-text">Servicios</h3>
            <ul className="space-y-2" role="list">
              {services.map((service) => (
                <li key={service.path}>
                  <Link
                    to={service.path}
                    className="text-eg-gray dark:text-eg-dark-muted hover:text-eg-purple transition-colors duration-300 text-sm"
                  >
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info - NO font-semibold */}
          <div>
            <h3 className="text-lg mb-4 text-white dark:text-eg-dark-text">Contacto</h3>
            <ul className="space-y-3" role="list">
              {/* Dirección - desde API */}
              {getFullAddress() && (
                <li className="flex items-start gap-3">
                  <FaMapMarkerAlt className="text-eg-purple mt-1 flex-shrink-0" aria-hidden="true" />
                  <span className="text-eg-gray dark:text-eg-dark-muted text-sm">
                    {getFullAddress()}
                  </span>
                </li>
              )}
              {/* Teléfonos - desde API */}
              {getPhones().length > 0 && (
                <li className="flex items-center gap-3">
                  <FaPhone className="text-eg-purple flex-shrink-0" aria-hidden="true" />
                  <a href={`tel:${getPhones()[0]}`} className="text-eg-gray dark:text-eg-dark-muted hover:text-eg-purple transition-colors duration-300 text-sm">
                    {getPhones()[0]}
                  </a>
                </li>
              )}
              {/* Email - desde API */}
              {companyInfo?.email && (
                <li className="flex items-center gap-3">
                  <FaEnvelope className="text-eg-purple flex-shrink-0" aria-hidden="true" />
                  <a href={`mailto:${companyInfo.email}`} className="text-eg-gray dark:text-eg-dark-muted hover:text-eg-purple transition-colors duration-300 text-sm">
                    {companyInfo.email}
                  </a>
                </li>
              )}
              {/* Horarios - desde API si disponible */}
              {companyInfo?.schedule_weekdays && (
                <li className="flex items-start gap-3">
                  <FaClock className="text-eg-purple mt-1 flex-shrink-0" aria-hidden="true" />
                  <div className="text-eg-gray dark:text-eg-dark-muted text-sm">
                    {companyInfo.schedule_weekdays && <p>{companyInfo.schedule_weekdays}</p>}
                    {companyInfo.schedule_saturday && <p>{companyInfo.schedule_saturday}</p>}
                    {companyInfo.schedule_sunday && <p>{companyInfo.schedule_sunday}</p>}
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Certifications - NO font-medium */}
        <div className="mt-12 pt-8 border-t border-eg-pink/20 dark:border-eg-dark-elevated">
          <div className="flex flex-wrap items-center justify-center gap-6">
            {certifications.map((cert, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-eg-gray dark:text-eg-dark-muted"
              >
                <span className="text-2xl text-eg-purple" aria-hidden="true">{cert.icon}</span>
                <span className="text-sm">{cert.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar - Pantone colors */}
      <div className="bg-eg-black dark:bg-eg-dark-surface py-4 border-t border-eg-pink/10 dark:border-eg-dark-elevated">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-eg-gray dark:text-eg-dark-muted text-sm text-center sm:text-left">
              © {currentYear} {companyInfo?.name || 'Laboratorio'}. Todos los derechos reservados.
            </p>
            <div className="flex gap-4">
              <Link
                to="/privacidad"
                className="text-eg-gray dark:text-eg-dark-muted hover:text-eg-purple text-sm transition-colors duration-300"
              >
                Privacidad
              </Link>
              <Link
                to="/terminos"
                className="text-eg-gray dark:text-eg-dark-muted hover:text-eg-purple text-sm transition-colors duration-300"
              >
                Términos
              </Link>
              <Link
                to="/cookies"
                className="text-eg-gray dark:text-eg-dark-muted hover:text-eg-purple text-sm transition-colors duration-300"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;