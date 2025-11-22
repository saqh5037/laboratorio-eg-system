import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaSearch } from 'react-icons/fa';
import { HeaderLogo, HeaderLogoMobile } from './brand/BrandLogo';
import { handleAnchorClick, isOnHomePage } from '../utils/smoothScroll';
import { useSystemConfig } from '../hooks/useSystemConfig';
import { useNavigation } from '../hooks/useNavigation';
import NavigationDropdown from './NavigationDropdown';

const Header = () => {
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

  // Handler unificado para navegación (usado por desktop menu y dropdown)
  const handleNavigation = (e, item) => {
    const isAnchorLink = item.url.includes('#');
    const anchorId = isAnchorLink ? item.url.split('#').pop() : null;

    if (isAnchorLink && anchorId) {
      if (onHomePage) {
        // En homepage: scroll directo
        handleAnchorClick(e, `#${anchorId}`);
      } else {
        // Fuera de homepage: navegar primero
        e.preventDefault();
        navigate('/');
        setTimeout(() => {
          const element = document.getElementById(anchorId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    } else {
      // Link normal
      e.preventDefault();
      navigate(item.url);
    }
  };

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
      className="fixed top-0 left-0 right-0 z-50
                 bg-white/95 dark:bg-eg-dark-bg/95
                 border-b border-gray-200/80 dark:border-gray-700/50
                 shadow-sm
                 transition-colors duration-300"
      style={{
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)'
      }}
    >
      <div className="h-16">
        <div className="max-w-full px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            {/* Left section: Logo only */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Logo con margen responsive - profesional con BrandLogo */}
              <Link to="/" className="ml-1 sm:ml-[37.8px]">
                {/* Desktop & Tablet: Logo completo horizontal con tamaño responsive */}
                <div className="hidden sm:block">
                  <HeaderLogo className="h-12 sm:h-14 md:h-16 lg:h-14" />
                  {/* Mobile sm: 48px, Tablet: 56px, iPad: 64px, Desktop: 56px */}
                </div>

                {/* Mobile: Solo isotipo compacto */}
                <div className="block sm:hidden">
                  <HeaderLogoMobile />
                </div>
              </Link>
            </div>

            {/* Center section: Navigation Menu - Responsive */}

            {/* Desktop (lg+): Menú horizontal completo */}
            <nav className="flex-1 hidden lg:block" aria-label="Navegación principal">
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

            {/* iPad (md-lg): Dropdown menu compacto */}
            <div className="flex-1 hidden md:flex lg:hidden items-center justify-center">
              {!navLoading && filteredItems.length > 0 && (
                <NavigationDropdown
                  items={filteredItems}
                  onNavigate={handleNavigation}
                />
              )}
            </div>

            {/* Mobile: usa Sidebar con hamburger (sin cambios) */}

            {/* Right section: Búsqueda con estilo profesional */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search button - Profesional y visible */}
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/buscar')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl
                          bg-gray-100 dark:bg-gray-800
                          text-eg-gray dark:text-eg-dark-muted
                          hover:bg-eg-purple/10 dark:hover:bg-eg-purple/20
                          hover:text-eg-purple dark:hover:text-eg-purple
                          border border-gray-200 dark:border-gray-700
                          hover:border-eg-purple/30
                          transition-all duration-300
                          min-h-touch-target
                          shadow-sm hover:shadow-md"
                style={{
                  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                aria-label="Buscar estudios"
              >
                <FaSearch size={18} className="flex-shrink-0" />
                <span className="hidden sm:inline font-medium text-sm">
                  Buscar
                </span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
