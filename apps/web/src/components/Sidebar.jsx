import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { scrollToSection } from '../utils/smoothScroll';
import {
  FaHome,
  FaFlask,
  FaChartBar,
  FaInfoCircle,
  FaEnvelope,
} from 'react-icons/fa';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  // Navegación principal - EXACTAMENTE igual que el Header de navegador
  const mainNavigation = [
    {
      id: 'inicio',
      name: 'Inicio',
      icon: <FaHome />,
      anchor: 'inicio',  // Anchor cuando estamos en home
      path: '/',         // Path cuando estamos en otras páginas
    },
    {
      id: 'nosotros',
      name: 'Nosotros',
      icon: <FaInfoCircle />,
      anchor: 'nosotros',
      hashPath: '/#nosotros',  // Path con hash para otras páginas
    },
    {
      id: 'contacto',
      name: 'Contacto',
      icon: <FaEnvelope />,
      anchor: 'contacto',
      hashPath: '/#contacto',
    },
    {
      id: 'estudios',
      name: 'Estudios',
      icon: <FaFlask />,
      path: '/estudios',
    },
    {
      id: 'resultados',
      name: 'Resultados',
      icon: <FaChartBar />,
      path: '/resultados',
    },
  ];

  const handleNavigation = (item) => {
    if (isHomePage && item.anchor) {
      // Si estamos en home y el item tiene anchor, hacer scroll
      scrollToSection(item.anchor);
    }
    // Si es un link normal, el Link component manejará la navegación
    onClose(); // Cerrar sidebar después de navegar
  };

  const isActive = (item) => {
    // Para items con path simple
    if (item.path && item.path !== '/') {
      return location.pathname === item.path;
    }
    // Para Inicio
    if (item.id === 'inicio') {
      return location.pathname === '/';
    }
    return false;
  };

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
            onClick={onClose}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Brand Manual Styling */}
      <motion.aside
        initial={false}
        animate={{
          x: isOpen ? 0 : '-100%',
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`fixed top-16 left-0 bottom-0 w-64 bg-gradient-to-b from-white to-eg-purple-50 border-r border-eg-gray/20 z-40 overflow-y-auto lg:translate-x-0 ${
          isOpen ? '' : 'lg:w-64'
        }`}
        style={{
          boxShadow: '0 10px 40px -10px rgba(123, 104, 166, 0.3)', // Purple-tinted shadow from brand manual
        }}
      >
        <div className="flex flex-col h-full">
          {/* Navigation */}
          <nav className="flex-1 px-4 py-6">
            <div className="space-y-1">
              {mainNavigation.map(item => {
                // Determinar si usamos anchor o path según la página
                const useAnchor = isHomePage && item.anchor;
                const linkPath = useAnchor ? '#' : (item.hashPath || item.path);

                return (
                  <div key={item.id}>
                    {useAnchor ? (
                      // En home page, usar button con scroll
                      <button
                        onClick={() => handleNavigation(item)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ease-out min-h-touch-target ${
                          isActive(item)
                            ? 'bg-eg-gradient text-white shadow-purple'
                            : 'text-eg-black hover:bg-gradient-to-r hover:from-eg-pink/30 hover:to-eg-purple/20 hover:text-eg-purple'
                        }`}
                        style={{
                          fontFamily: 'DIN Pro, -apple-system, sans-serif',
                        }}
                      >
                        <span className="text-xl">{item.icon}</span>
                        <span className="font-normal text-base">{item.name}</span>
                      </button>
                    ) : (
                      // En otras páginas, usar Link
                      <Link
                        to={linkPath}
                        onClick={() => handleNavigation(item)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ease-out min-h-touch-target ${
                          isActive(item)
                            ? 'bg-eg-gradient text-white shadow-purple'
                            : 'text-eg-black hover:bg-gradient-to-r hover:from-eg-pink/30 hover:to-eg-purple/20 hover:text-eg-purple'
                        }`}
                        style={{
                          fontFamily: 'DIN Pro, -apple-system, sans-serif',
                        }}
                      >
                        <span className="text-xl">{item.icon}</span>
                        <span className="font-normal text-base">{item.name}</span>
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </nav>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
