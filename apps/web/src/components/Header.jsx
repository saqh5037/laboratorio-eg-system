import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaSearch,
  FaBars,
  FaTimes,
} from 'react-icons/fa';
import { HeaderLogo, HeaderLogoMobile } from './brand/BrandLogo';
import { handleAnchorClick, isOnHomePage } from '../utils/smoothScroll';
import { useSystemConfig } from '../hooks/useSystemConfig';
import { useNavigation } from '../hooks/useNavigation';

const Header = ({ onMenuToggle, isSidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const onHomePage = isOnHomePage(location.pathname);
  const { isPageEnabled, getConfigValue } = useSystemConfig();
  const { getHeaderItems, loading: navLoading } = useNavigation();

  // Features flags
  const favoritesEnabled = getConfigValue('features.favorites.enabled') !== false;

  // Obtener items de navegación dinámicos
  const headerItems = getHeaderItems();

  // Filtrar items basado en configuración del sistema
  const filteredItems = headerItems.filter(item => {
    // Items que requieren verificación de página habilitada
    if (item.url === '/estudios') return isPageEnabled('estudios');
    if (item.url === '/resultados') return isPageEnabled('resultados');
    if (item.url === '/favoritos') return favoritesEnabled;
    // Verificar secciones anchor en landing page
    if (item.url === '/#nosotros' || item.url.includes('#nosotros')) return isPageEnabled('nosotros');
    if (item.url === '/#contacto' || item.url.includes('#contacto')) return isPageEnabled('contacto');
    return true;
  });

  // Estilo común para items de navegación
  const navItemStyle = {
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
    fontSize: '15px',
    fontWeight: '500',
    letterSpacing: '-0.01em',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
  };

  const navItemClasses = "px-4 py-2 text-eg-black dark:text-eg-dark-text hover:text-eg-purple dark:hover:text-eg-purple transition-all duration-200 rounded-xl hover:bg-eg-purple/5 min-h-touch-target flex items-center hover:-translate-y-0.5";

  // Renderizar item de navegación
  const renderNavItem = (item) => {
    const isAnchorLink = item.url.includes('#');
    // Manejar formatos: /#section, #section, /page#section
    const anchorId = isAnchorLink ? item.url.split('#').pop() : null;

    // Si es anchor link
    if (isAnchorLink && anchorId) {
      // Si estamos en homepage, hacer scroll directo
      if (onHomePage) {
        return (
          <a
            href={`#${anchorId}`}
            onClick={(e) => handleAnchorClick(e, `#${anchorId}`)}
            className={`${navItemClasses} cursor-pointer`}
            style={navItemStyle}
            role="menuitem"
          >
            {item.label}
          </a>
        );
      }

      // Si NO estamos en homepage, navegar a home y luego hacer scroll
      return (
        <a
          href={`/#${anchorId}`}
          onClick={(e) => {
            e.preventDefault();
            navigate('/');
            // Esperar a que se complete la navegación antes de hacer scroll
            setTimeout(() => {
              const element = document.getElementById(anchorId);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }, 100);
          }}
          className={navItemClasses}
          style={navItemStyle}
          role="menuitem"
        >
          {item.label}
        </a>
      );
    }

    // Link normal (página específica sin anchor)
    return (
      <Link
        to={item.url}
        className={navItemClasses}
        style={navItemStyle}
        role="menuitem"
      >
        {item.label}
      </Link>
    );
  };

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

            {/* Center section: Navigation Menu - Dinámico */}
            <nav className="flex-1 hidden md:block" aria-label="Navegación principal">
              <ul className="flex items-center justify-center gap-1" role="menubar">
                {navLoading ? (
                  // Skeleton loading placeholders
                  Array.from({ length: 4 }).map((_, i) => (
                    <li key={`skeleton-${i}`} role="none">
                      <div className="px-4 py-2 rounded-xl animate-pulse">
                        <div className="h-4 w-16 bg-gray-200 rounded"></div>
                      </div>
                    </li>
                  ))
                ) : (
                  filteredItems.map((item) => (
                    <li key={item.id} role="none">
                      {renderNavItem(item)}
                    </li>
                  ))
                )}
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
