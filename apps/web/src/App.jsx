import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { UnifiedAppProvider } from './contexts/UnifiedAppContext';
import { AdminAuthProvider } from './contexts/AdminAuthContext';
import { LabProvider } from './contexts/LabContext';
import { Toaster } from 'react-hot-toast';
import MainLayout from './layouts/MainLayout';
import PWAWrapper from './components/PWAComponents';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
// import pwaManager from './utils/pwa'; // Temporarily disabled
import { useSystemConfig } from './hooks/useSystemConfig';
import { useThemeColors } from './hooks/useThemeColors';

// Admin components
import ProtectedAdminRoute from './components/admin/ProtectedAdminRoute';
import AdminLayout from './components/admin/layout/AdminLayout';

// Lazy loading de páginas para code splitting
const LandingPageUnified = lazy(() => import('./pages/LandingPageUnified'));
const LandingDimogen = lazy(() => import('./pages/LandingDimogen'));
const Estudios = lazy(() => import('./pages/Estudios'));
const Resultados = lazy(() => import('./pages/Resultados'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));

// Dimogen service pages
const BiologiaMolecularPage = lazy(() => import('./pages/dimogen/BiologiaMolecularPage'));
const SaludIntegralPage = lazy(() => import('./pages/dimogen/SaludIntegralPage'));
const MicrobiologiaAlimentosPage = lazy(() => import('./pages/dimogen/MicrobiologiaAlimentosPage'));

// Admin pages
const AdminLogin = lazy(() => import('./pages/admin/Login'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminCarousel = lazy(() => import('./pages/admin/CarouselManager'));
const AdminLandingContent = lazy(() => import('./pages/admin/LandingContentManager'));
const AdminConfigurations = lazy(() => import('./pages/admin/Configurations'));
const AdminAuditLog = lazy(() => import('./pages/admin/AuditLog'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));
const AdminThemeManager = lazy(() => import('./pages/admin/ThemeManager'));
const AdminCompanyInfo = lazy(() => import('./pages/admin/CompanyInfoManager'));
const AdminNavigationManager = lazy(() => import('./pages/admin/NavigationManager'));
const AdminBackupManager = lazy(() => import('./pages/admin/BackupManager'));
const AdminMaintenance = lazy(() => import('./pages/admin/Maintenance'));

// DIMOGEN Admin pages
const DimogenCompanyInfoManager = lazy(() => import('./pages/admin/dimogen/DimogenCompanyInfoManager'));
const DimogenFAQManager = lazy(() => import('./pages/admin/dimogen/DimogenFAQManager'));
const DimogenServicesManager = lazy(() => import('./pages/admin/dimogen/DimogenServicesManager'));
const DimogenAboutManager = lazy(() => import('./pages/admin/dimogen/DimogenAboutManager'));
const DimogenTestimonialsManager = lazy(() => import('./pages/admin/dimogen/DimogenTestimonialsManager'));
const DimogenCarouselManager = lazy(() => import('./pages/admin/dimogen/DimogenCarouselManager'));

// Lab instance identification from environment
// Support both build-time (import.meta.env) and runtime (window.__ENV__) configuration
const getLabCode = () => {
  // First check runtime config (Docker/production)
  if (typeof window !== 'undefined' && window.__ENV__?.VITE_LAB_CODE) {
    return window.__ENV__.VITE_LAB_CODE;
  }
  // Fallback to build-time config (local development)
  return import.meta.env.VITE_LAB_CODE || 'eg';
};

const LAB_CODE = getLabCode();
const IS_DIMOGEN = LAB_CODE === 'dimogen';

function AppRoutes() {
  const { isPageEnabled, isMaintenanceMode, getMaintenanceMessage, getConfigValue } = useSystemConfig();

  // Features flags
  const favoritesEnabled = getConfigValue('features.favorites.enabled') !== false;

  // Si está en modo mantenimiento, mostrar mensaje
  if (isMaintenanceMode()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center p-8 max-w-md">
          <div className="text-6xl mb-4">🔧</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Modo Mantenimiento</h1>
          <p className="text-gray-600">{getMaintenanceMessage()}</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Admin routes (sin MainLayout) */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin/*"
        element={
          <ProtectedAdminRoute>
            <AdminLayout>
              <Routes>
                <Route path="/" element={<AdminDashboard />} />
                <Route path="/carousel" element={<AdminCarousel />} />
                <Route path="/landing-content" element={<AdminLandingContent />} />
                <Route path="/configurations" element={<AdminConfigurations />} />
                <Route path="/audit" element={<AdminAuditLog />} />
                <Route path="/settings" element={<AdminSettings />} />
                <Route path="/themes" element={<AdminThemeManager />} />
                <Route path="/company" element={<AdminCompanyInfo />} />
                <Route path="/navigation" element={<AdminNavigationManager />} />
                <Route path="/backups" element={<AdminBackupManager />} />
                <Route path="/maintenance" element={<AdminMaintenance />} />

                {/* DIMOGEN Admin Routes */}
                <Route path="/dimogen/company" element={<DimogenCompanyInfoManager />} />
                <Route path="/dimogen/faqs" element={<DimogenFAQManager />} />
                <Route path="/dimogen/services" element={<DimogenServicesManager />} />
                <Route path="/dimogen/about" element={<DimogenAboutManager />} />
                <Route path="/dimogen/testimonials" element={<DimogenTestimonialsManager />} />
                <Route path="/dimogen/carousel" element={<DimogenCarouselManager />} />
              </Routes>
            </AdminLayout>
          </ProtectedAdminRoute>
        }
      />

      {/* Landing Page - Condicional según LAB_CODE */}
      <Route path="/" element={IS_DIMOGEN ? <LandingDimogen /> : <LandingPageUnified />} />

      {/* Ruta /dimogen disponible para testing (siempre) */}
      <Route path="/dimogen" element={<LandingDimogen />} />

      {/* Dimogen Service Pages */}
      <Route path="/dimogen/servicios/biologia-molecular" element={<BiologiaMolecularPage />} />
      <Route path="/dimogen/servicios/salud-integral" element={<SaludIntegralPage />} />
      <Route path="/dimogen/servicios/microbiologia-alimentos" element={<MicrobiologiaAlimentosPage />} />

      {/* Directorio de Estudios - Condicional */}
      {isPageEnabled('estudios') ? (
        <>
          <Route path="/estudios" element={<Estudios />} />
          <Route path="/estudios/:category" element={<Estudios />} />
        </>
      ) : (
        <Route path="/estudios/*" element={<Navigate to="/" replace />} />
      )}

      {/* Resultados - Condicional */}
      {isPageEnabled('resultados') ? (
        <Route path="/resultados" element={<Resultados />} />
      ) : (
        <Route path="/resultados" element={<Navigate to="/" replace />} />
      )}

      {/* Favoritos - Condicional basado en feature flag */}
      {favoritesEnabled ? (
        <Route path="/favoritos" element={<FavoritesPage />} />
      ) : (
        <Route path="/favoritos" element={<Navigate to="/" replace />} />
      )}

      {/* Fallback: redirigir a home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function ConditionalLayout({ children }) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isDimogenRoute = location.pathname.startsWith('/dimogen');

  // Si es instancia DIMOGEN y estamos en root, también excluir MainLayout
  const isDimogenInstance = IS_DIMOGEN && location.pathname === '/';

  // Si es ruta de admin, DIMOGEN específica, o instancia DIMOGEN en root, NO usar MainLayout
  // DIMOGEN tiene su propio NavbarDimogen y FooterDimogen
  if (isAdminRoute || isDimogenRoute || isDimogenInstance) {
    return children;
  }

  // Si es ruta pública de EG, usar MainLayout
  return <MainLayout>{children}</MainLayout>;
}

function App() {
  // Obtener colores dinámicos del tema
  const { primary, error } = useThemeColors();

  useEffect(() => {
    // Inicializar PWA al cargar la aplicación
    // TEMPORALMENTE DESHABILITADO PARA DEBUG
    // pwaManager.init();
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <UnifiedAppProvider>
          <AdminAuthProvider>
            <LabProvider>
            <Router>
            {/* Toast notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: primary,
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: error,
                    secondary: '#fff',
                  },
                },
              }}
            />

            <PWAWrapper>
              <ConditionalLayout>
                <Suspense fallback={<LoadingSpinner />}>
                  <AppRoutes />
                </Suspense>
              </ConditionalLayout>
            </PWAWrapper>
            </Router>
            </LabProvider>
          </AdminAuthProvider>
        </UnifiedAppProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App
