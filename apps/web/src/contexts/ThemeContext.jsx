import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // ===== PREVENCIÓN DE FOUC (Flash of Unstyled Content) =====
  // Detectar tema inicial ANTES del primer render
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Prioridad 1: Tema guardado en localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }

    // Prioridad 2: Preferencia del sistema
    if (window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    // Default: modo claro
    return false;
  });

  // ===== APLICAR TEMA CON TRANSICIÓN SUAVE DE 300MS =====
  useEffect(() => {
    const root = document.documentElement;

    // Agregar clase de transición temporal
    root.style.setProperty('transition', 'background-color 300ms ease-in-out, color 300ms ease-in-out');

    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      // Actualizar meta theme-color para PWA
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#0F1729');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#FFFFFF');
    }

    // Limpiar transición después de aplicar
    const timeout = setTimeout(() => {
      root.style.removeProperty('transition');
    }, 300);

    return () => clearTimeout(timeout);
  }, [isDarkMode]);

  // ===== LISTENER DE PREFERENCIA DEL SISTEMA =====
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e) => {
      // Solo cambiar si no hay preferencia guardada del usuario
      const savedTheme = localStorage.getItem('theme');
      if (!savedTheme) {
        setIsDarkMode(e.matches);
      }
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
    // Fallback para navegadores antiguos
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};