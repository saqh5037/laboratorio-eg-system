import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
// import Footer from '../components/FooterDirectorio'; // Removed: Each page now manages its own footer
import Breadcrumb from '../components/Breadcrumb';
import { motion, AnimatePresence } from 'framer-motion';

const MainLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isContactPage = location.pathname === '/contacto';
  const isNosotrosPage = location.pathname === '/nosotros';
  const isEstudiosPage = location.pathname.startsWith('/estudios');

  // Cerrar sidebar al cambiar de ruta en móvil
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Header Fixed - Visible en todas las páginas */}
      <Header onMenuToggle={toggleSidebar} isSidebarOpen={isSidebarOpen} />

      {/* Main Container con centrado correcto */}
      <div className="flex relative">
        {/* Sidebar */}
        <AnimatePresence mode="wait">
          {isSidebarOpen && (
            <>
              {/* Overlay para móvil */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeSidebar}
                className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              />
            </>
          )}
        </AnimatePresence>
        
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

        {/* Main Content Area - Centrado correcto */}
        <main className={`flex-1 min-h-screen ${!isContactPage && !isHomePage && !isNosotrosPage && !isEstudiosPage ? 'lg:ml-64' : ''}`}>
          {/* Espaciado del header */}
          <div className="h-16" />
          
          {/* Container con max-width y centrado */}
          <div className="w-full">
            {/* Breadcrumb */}
            {!isHomePage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 sticky top-16 z-30"
              >
                <div className={isContactPage || isNosotrosPage || isEstudiosPage ? "w-full px-6 md:px-12 lg:px-24" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"}>
                  <div className="py-3">
                    <Breadcrumb />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Page Content con animaciones mejoradas */}
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{
                  duration: 0.3,
                  ease: "easeInOut"
                }}
                className="w-full"
              >
                {/* Renderizado condicional: HomePage, Contacto, Nosotros y Estudios sin wrapper, otras páginas con wrapper */}
                {isHomePage || isContactPage || isNosotrosPage || isEstudiosPage ? (
                  // Página Principal, Contacto, Nosotros y Estudios: Sin wrapper, ancho completo
                  children
                ) : (
                  // Otras páginas: Con wrapper y grid
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Grid System de 12 columnas */}
                    <div className="grid grid-cols-12 gap-6">
                      <div className="col-span-12">
                        {children}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer removed - Each page now manages its own footer */}
        </main>
      </div>

      {/* Botón flotante de WhatsApp */}
      <motion.a
        href="https://wa.me/584149019327"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-full shadow-2xl hover:shadow-green-500/25 transition-all duration-300"
      >
        <svg 
          className="w-6 h-6" 
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.123-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      </motion.a>
    </div>
  );
};

export default MainLayout;