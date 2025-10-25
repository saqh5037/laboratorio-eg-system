import Logo from './Logo';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Estudios', href: '#estudios' },
    { name: 'Paquetes', href: '#paquetes' },
    { name: 'Ubicación', href: '#ubicacion' },
    { name: 'Contacto', href: '#contacto' },
  ];

  const socialLinks = [
    { 
      name: 'Instagram', 
      href: 'https://instagram.com/laboratorioeg',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
        </svg>
      )
    },
    { 
      name: 'WhatsApp', 
      href: 'https://wa.me/584149019327',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.149-.173.198-.297.297-.495.099-.198.05-.372-.025-.521-.074-.149-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.123-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      )
    },
    { 
      name: 'Facebook', 
      href: 'https://facebook.com/laboratorioeg',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )
    },
  ];

  return (
    <footer id="contacto" className="bg-gradient-to-b from-white to-eg-light-gray border-t border-eg-gray/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <Logo className="h-14 mb-4" showRif={true} />
            <p className="text-eg-gray text-sm mb-4">
              Laboratorio Clínico y Microbiológico con 43 años de experiencia 
              en el manejo y procesamiento de muestras biológicas, cumpliendo 
              con los mejores estándares de calidad y precios competitivos.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`transition-all duration-300 hover:scale-110 ${
                    link.name === 'Instagram' ? 'text-pink-600 hover:text-pink-700' :
                    link.name === 'WhatsApp' ? 'text-green-600 hover:text-green-700' :
                    link.name === 'Facebook' ? 'text-blue-600 hover:text-blue-700' :
                    'text-gray-600 hover:text-gray-700'
                  }`}
                  aria-label={link.name}
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-eg-purple font-medium mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-eg-gray hover:text-eg-purple transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-eg-purple font-medium mb-4">Contacto</h3>
            <ul className="space-y-2 text-sm text-eg-gray">
              <li className="flex items-start">
                <span className="mr-2">📍</span>
                <span>
                  Av. Libertador, Edif. Majestic,<br />
                  Piso 1, Consultorio 18,<br />
                  La Campiña, Caracas
                </span>
              </li>
              <li className="flex items-center">
                <span className="mr-2">📞</span>
                <span>(0212) 762-0561</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2">💬</span>
                <span>+58 414-901-9327</span>
              </li>
              <li className="flex items-center">
                <span className="mr-2">✉️</span>
                <span>info@laboratorioeg.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-eg-gray/20">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-eg-gray text-center md:text-left">
              © {currentYear} LaboratorioEG. Todos los derechos reservados.
            </p>
            <div className="flex space-x-6 text-sm text-eg-gray">
              <a href="#" className="hover:text-eg-purple transition-colors">
                Términos y Condiciones
              </a>
              <a href="#" className="hover:text-eg-purple transition-colors">
                Política de Privacidad
              </a>
            </div>
          </div>

          {/* Certifications */}
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs text-eg-gray">
            <span>✓ Certificado por el MPPS</span>
            <span>✓ Miembro de la Sociedad Venezolana de Bioanalistas</span>
            <span>✓ ISO 9001:2015</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;