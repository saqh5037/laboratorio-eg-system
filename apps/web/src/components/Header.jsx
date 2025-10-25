import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaSearch,
  FaBars,
  FaTimes,
} from 'react-icons/fa';
import { HeaderLogo, HeaderLogoMobile } from './brand/BrandLogo';
import { handleAnchorClick, isOnHomePage } from '../utils/smoothScroll';

const Header = ({ onMenuToggle, isSidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const onHomePage = isOnHomePage(location.pathname);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-white/85 dark:bg-eg-dark-bg/85 transition-colors duration-300"
      style={{
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '0.5px solid rgba(0, 0, 0, 0.08)',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}
    >
      <div className="h-16">
        <div className="max-w-full px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            {/* Left section: Menu toggle and Logo */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Menu Toggle Button - Estilo iOS - Más grande en móvil */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onMenuToggle}
                className="p-2.5 rounded-xl bg-eg-purple/10 text-eg-purple dark:text-eg-purple hover:bg-eg-purple/20 transition-all duration-200 lg:hidden min-w-touch-target min-h-touch-target hover:-translate-y-0.5"
                style={{
                  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                aria-label={isSidebarOpen ? "Cerrar menú" : "Abrir menú"}
                aria-expanded={isSidebarOpen}
              >
                {isSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
              </motion.button>

              {/* Logo con margen responsive - profesional con BrandLogo */}
              <Link to="/" className="ml-1 sm:ml-[37.8px]">
                {/* Desktop: Logo completo horizontal */}
                <div className="hidden sm:block">
                  <HeaderLogo />
                </div>

                {/* Mobile: Solo isotipo compacto */}
                <div className="block sm:hidden">
                  <HeaderLogoMobile />
                </div>
              </Link>
            </div>

            {/* Center section: Navigation Menu - Estilo iOS */}
            <nav className="flex-1 hidden md:block" aria-label="Navegación principal">
              <ul className="flex items-center justify-center gap-1" role="menubar">
                <li role="none">
                  {onHomePage ? (
                    <a
                      href="#inicio"
                      onClick={(e) => handleAnchorClick(e, '#inicio')}
                      className="px-4 py-2 text-eg-black dark:text-eg-dark-text hover:text-eg-purple dark:hover:text-eg-purple transition-all duration-200 rounded-xl hover:bg-eg-purple/5 min-h-touch-target flex items-center hover:-translate-y-0.5 cursor-pointer"
                      style={{
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
                        fontSize: '15px',
                        fontWeight: '500',
                        letterSpacing: '-0.01em',
                        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                      role="menuitem"
                    >
                      Inicio
                    </a>
                  ) : (
                    <Link
                      to="/"
                      className="px-4 py-2 text-eg-black dark:text-eg-dark-text hover:text-eg-purple dark:hover:text-eg-purple transition-all duration-200 rounded-xl hover:bg-eg-purple/5 min-h-touch-target flex items-center hover:-translate-y-0.5"
                      style={{
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
                        fontSize: '15px',
                        fontWeight: '500',
                        letterSpacing: '-0.01em',
                        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                      role="menuitem"
                    >
                      Inicio
                    </Link>
                  )}
                </li>
                <li role="none">
                  {onHomePage ? (
                    <a
                      href="#nosotros"
                      onClick={(e) => handleAnchorClick(e, '#nosotros')}
                      className="px-4 py-2 text-eg-black dark:text-eg-dark-text hover:text-eg-purple dark:hover:text-eg-purple transition-all duration-200 rounded-xl hover:bg-eg-purple/5 min-h-touch-target flex items-center hover:-translate-y-0.5 cursor-pointer"
                      style={{
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
                        fontSize: '15px',
                        fontWeight: '500',
                        letterSpacing: '-0.01em',
                        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                      role="menuitem"
                    >
                      Nosotros
                    </a>
                  ) : (
                    <Link
                      to="/#nosotros"
                      className="px-4 py-2 text-eg-black dark:text-eg-dark-text hover:text-eg-purple dark:hover:text-eg-purple transition-all duration-200 rounded-xl hover:bg-eg-purple/5 min-h-touch-target flex items-center hover:-translate-y-0.5"
                      style={{
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
                        fontSize: '15px',
                        fontWeight: '500',
                        letterSpacing: '-0.01em',
                        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                      role="menuitem"
                    >
                      Nosotros
                    </Link>
                  )}
                </li>
                <li role="none">
                  {onHomePage ? (
                    <a
                      href="#contacto"
                      onClick={(e) => handleAnchorClick(e, '#contacto')}
                      className="px-4 py-2 text-eg-black dark:text-eg-dark-text hover:text-eg-purple dark:hover:text-eg-purple transition-all duration-200 rounded-xl hover:bg-eg-purple/5 min-h-touch-target flex items-center hover:-translate-y-0.5 cursor-pointer"
                      style={{
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
                        fontSize: '15px',
                        fontWeight: '500',
                        letterSpacing: '-0.01em',
                        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                      role="menuitem"
                    >
                      Contacto
                    </a>
                  ) : (
                    <Link
                      to="/#contacto"
                      className="px-4 py-2 text-eg-black dark:text-eg-dark-text hover:text-eg-purple dark:hover:text-eg-purple transition-all duration-200 rounded-xl hover:bg-eg-purple/5 min-h-touch-target flex items-center hover:-translate-y-0.5"
                      style={{
                        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
                        fontSize: '15px',
                        fontWeight: '500',
                        letterSpacing: '-0.01em',
                        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                      role="menuitem"
                    >
                      Contacto
                    </Link>
                  )}
                </li>
                <li role="none">
                  <Link
                    to="/estudios"
                    className="px-4 py-2 text-eg-black dark:text-eg-dark-text hover:text-eg-purple dark:hover:text-eg-purple transition-all duration-200 rounded-xl hover:bg-eg-purple/5 min-h-touch-target flex items-center hover:-translate-y-0.5"
                    style={{
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
                      fontSize: '15px',
                      fontWeight: '500',
                      letterSpacing: '-0.01em',
                      transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    role="menuitem"
                  >
                    Estudios
                  </Link>
                </li>
                <li role="none">
                  <Link
                    to="/resultados"
                    className="px-4 py-2 text-eg-black dark:text-eg-dark-text hover:text-eg-purple dark:hover:text-eg-purple transition-all duration-200 rounded-xl hover:bg-eg-purple/5 min-h-touch-target flex items-center hover:-translate-y-0.5"
                    style={{
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
                      fontSize: '15px',
                      fontWeight: '500',
                      letterSpacing: '-0.01em',
                      transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    role="menuitem"
                  >
                    Resultados
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Right section: Solo búsqueda - Estilo iOS minimalista */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search button - Único icono permitido */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/buscar')}
                className="p-2.5 rounded-xl text-eg-gray dark:text-eg-dark-muted hover:bg-eg-purple/10 dark:hover:bg-eg-purple/20 hover:text-eg-purple transition-all duration-200 min-w-touch-target min-h-touch-target hover:-translate-y-0.5"
                style={{
                  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                aria-label="Buscar estudios"
              >
                <FaSearch size={18} />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;