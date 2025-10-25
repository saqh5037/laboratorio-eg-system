import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { UnifiedAppProvider } from './contexts/UnifiedAppContext';
import { Toaster } from 'react-hot-toast';
import MainLayout from './layouts/MainLayout';
import PWAWrapper from './components/PWAComponents';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import pwaManager from './utils/pwa';

// Lazy loading de páginas para code splitting
const LandingPageUnified = lazy(() => import('./pages/LandingPageUnified'));
const Estudios = lazy(() => import('./pages/Estudios'));
const Resultados = lazy(() => import('./pages/Resultados'));

function App() {
  useEffect(() => {
    // Inicializar PWA al cargar la aplicación
    // TEMPORALMENTE DESHABILITADO PARA DEBUG
    // pwaManager.init();
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <UnifiedAppProvider>
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
                    primary: '#7B68A6',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
            
            <PWAWrapper>
              <MainLayout>
                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    {/* Landing Page con secciones: #inicio, #nosotros, #contacto */}
                    <Route path="/" element={<LandingPageUnified />} />

                    {/* Directorio de Estudios */}
                    <Route path="/estudios" element={<Estudios />} />
                    <Route path="/estudios/:category" element={<Estudios />} />

                    {/* Resultados */}
                    <Route path="/resultados" element={<Resultados />} />
                  </Routes>
                </Suspense>
              </MainLayout>
            </PWAWrapper>
          </Router>
        </UnifiedAppProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App
