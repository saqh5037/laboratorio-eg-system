import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { scrollToSection } from '../utils/smoothScroll';
import {
  FaHome,
  FaFlask,
  FaChartBar,
  FaInfoCircle,
  FaEnvelope,
  FaHeart,
} from 'react-icons/fa';
import { Home, Info, Mail, FlaskConical, FileBarChart, Heart } from 'lucide-react';
import { useSystemConfig } from '../hooks/useSystemConfig';
import { useNavigation } from '../hooks/useNavigation';

// Mapa de iconos para convertir string a componente
const iconMap = {
  Home: <Home size={20} />,
  Info: <Info size={20} />,
  Mail: <Mail size={20} />,
  FlaskConical: <FlaskConical size={20} />,
  FileBarChart: <FileBarChart size={20} />,
  Heart: <Heart size={20} />,
  // Fallbacks FontAwesome
  FaHome: <FaHome size={20} />,
  FaInfoCircle: <FaInfoCircle size={20} />,
  FaEnvelope: <FaEnvelope size={20} />,
  FaFlask: <FaFlask size={20} />,
  FaChartBar: <FaChartBar size={20} />,
  FaHeart: <FaHeart size={20} />,
};

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const { isPageEnabled, getConfigValue } = useSystemConfig();
  const { getSidebarItems, loading: navLoading } = useNavigation();

  // Features flags
  const favoritesEnabled = getConfigValue('features.favorites.enabled') !== false;

  // Obtener items de navegación dinámicos
  const sidebarItems = getSidebarItems();

  // Filtrar items basado en configuración del sistema
  const filteredItems = sidebarItems.filter(item => {
    // Items que requieren verificación de página habilitada
    if (item.url === '/estudios') return isPageEnabled('estudios');
    if (item.url === '/resultados') return isPageEnabled('resultados');
    if (item.url === '/favoritos') return favoritesEnabled;
    // Verificar secciones anchor en landing page
    if (item.url === '/#nosotros' || item.url.includes('#nosotros')) return isPageEnabled('nosotros');
    if (item.url === '/#contacto' || item.url.includes('#contacto')) return isPageEnabled('contacto');
    return true;
  });

  const handleNavigation = (item) => {
    const isAnchorLink = item.url.includes('#');
    const anchorId = isAnchorLink ? item.url.split('#')[1] : null;

    if (isHomePage && anchorId) {
      // Si estamos en home y el item tiene anchor, hacer scroll
      scrollToSection(anchorId);
    }
    // Si es un link normal, el Link component manejará la navegación
    onClose(); // Cerrar sidebar después de navegar
  };

  const isActive = (item) => {
    // Para items con path simple (no anchors)
    if (!item.url.includes('#') && item.url !== '/') {
      return location.pathname === item.url;
    }
    // Para Inicio
    if (item.url === '/') {
      return location.pathname === '/';
    }
    return false;
  };

  const getIcon = (iconName) => {
    return iconMap[iconName] || <Home size={20} />;
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
              {navLoading ? (
                // Skeleton loading placeholders
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={`skeleton-${i}`} className="px-3 py-2.5 rounded-lg animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-gray-200 rounded"></div>
                      <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))
              ) : filteredItems.map(item => {
                // Determinar si es anchor link
                const isAnchorLink = item.url.includes('#');
                const anchorId = isAnchorLink ? item.url.split('#')[1] : null;
                const useAnchor = isHomePage && anchorId;
                const linkPath = useAnchor ? '#' : item.url;

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
                        <span className="text-xl">{getIcon(item.icon)}</span>
                        <span className="font-normal text-base">{item.label}</span>
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
                        <span className="text-xl">{getIcon(item.icon)}</span>
                        <span className="font-normal text-base">{item.label}</span>
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
