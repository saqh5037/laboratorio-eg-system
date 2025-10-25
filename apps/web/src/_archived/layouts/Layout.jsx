import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaHome,
  FaFlask,
  FaUsers,
  FaPhone,
  FaBars,
  FaTimes,
  FaFacebook,
  FaInstagram,
  FaWhatsapp,
} from 'react-icons/fa';

const Layout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Inicio', path: '/', icon: <FaHome /> },
    { name: 'Estudios', path: '/estudios', icon: <FaFlask /> },
    { name: 'Nosotros', path: '/nosotros', icon: <FaUsers /> },
    { name: 'Contacto', path: '/contacto', icon: <FaPhone /> },
  ];

  const socialLinks = [
    { icon: <FaFacebook />, href: '#', label: 'Facebook' },
    { icon: <FaInstagram />, href: '#', label: 'Instagram' },
    { icon: <FaWhatsapp />, href: '#', label: 'WhatsApp' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-md sticky top-0 z-50">
        <nav className="container-responsive">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-medical-navy to-medical-teal rounded-lg flex items-center justify-center">
                <FaFlask className="text-white text-xl" />
              </div>
              <span className="text-xl font-bold text-medical-navy">
                Laboratorio EG
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {navigation.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-medical-navy text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-700 p-2"
            >
              {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </nav>

        <motion.div
          initial={false}
          animate={{ height: isMenuOpen ? 'auto' : 0 }}
          className="md:hidden overflow-hidden bg-white border-t border-gray-200"
        >
          <div className="container-responsive py-4">
            {navigation.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-medical-navy text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </motion.div>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-medical-navy text-white">
        <div className="container-responsive section-padding">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                  <FaFlask className="text-white text-xl" />
                </div>
                <span className="text-xl font-bold">Laboratorio EG</span>
              </div>
              <p className="text-gray-300">
                Excelencia en análisis clínicos y diagnóstico médico desde 2003.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Enlaces rápidos</h3>
              <ul className="space-y-2">
                {navigation.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Horario</h3>
              <ul className="space-y-2 text-gray-300">
                <li>Lun - Vie: 7:00 AM - 7:00 PM</li>
                <li>Sábado: 7:00 AM - 2:00 PM</li>
                <li>Domingo: 8:00 AM - 12:00 PM</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Síguenos</h3>
              <div className="flex gap-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
              <p className="text-gray-300 mt-4">
                contacto@laboratorioeg.com
              </p>
            </div>
          </div>

          <div className="border-t border-white/10 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2024 Laboratorio EG. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;