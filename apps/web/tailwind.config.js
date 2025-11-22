/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ===== COLORES DINÁMICOS CON CSS VARIABLES =====
        // Estos colores se actualizan dinámicamente desde theme_config

        // Colores principales - ahora usando CSS variables
        'primary': 'var(--color-primary)',
        'secondary': 'var(--color-secondary)',
        'accent': 'var(--color-accent)',

        // Colores de texto
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',

        // Colores de fondo
        'background': 'var(--color-background)',
        'surface': 'var(--color-surface)',

        // Modo oscuro
        'dark-bg': 'var(--color-dark-bg)',
        'dark-surface': 'var(--color-dark-surface)',
        'dark-text': 'var(--color-dark-text)',
        'dark-text-secondary': 'var(--color-dark-text-secondary)',

        // Colores semánticos
        'success': 'var(--color-success)',
        'warning': 'var(--color-warning)',
        'error': 'var(--color-error)',
        'info': 'var(--color-info)',

        // ===== COMPATIBILITY: MANTENER COLORES PANTONE EXISTENTES =====
        // Estos se mantienen para compatibilidad con código existente
        // Los colores eg-* ahora también usan CSS variables

        // Pantone 2665U - Purple principal (ESCALAS DINÁMICAS)
        'eg-purple': {
          DEFAULT: 'rgb(var(--color-eg-purple))',
          50: 'rgb(var(--color-eg-purple) / 0.05)',
          100: 'rgb(var(--color-eg-purple) / 0.10)',
          200: 'rgb(var(--color-eg-purple) / 0.20)',
          300: 'rgb(var(--color-eg-purple) / 0.30)',
          400: 'rgb(var(--color-eg-purple) / 0.50)',
          500: 'rgb(var(--color-eg-purple))',  // Dinámico desde CSS var
          600: 'rgb(var(--color-eg-purple) / 0.90)',
          700: 'rgb(var(--color-eg-purple) / 0.80)',
          800: 'rgb(var(--color-eg-purple) / 0.70)',
          900: 'rgb(var(--color-eg-purple) / 0.60)',
        },

        // Pantone 250U - Pink secundario (ESCALAS DINÁMICAS)
        'eg-pink': {
          DEFAULT: 'rgb(var(--color-eg-pink))',
          50: 'rgb(var(--color-eg-pink) / 0.05)',
          100: 'rgb(var(--color-eg-pink) / 0.10)',
          200: 'rgb(var(--color-eg-pink) / 0.20)',
          300: 'rgb(var(--color-eg-pink))',  // Dinámico desde CSS var
          400: 'rgb(var(--color-eg-pink) / 0.50)',
          500: 'rgb(var(--color-eg-pink) / 0.70)',
          600: 'rgb(var(--color-eg-pink) / 0.80)',
          700: 'rgb(var(--color-eg-pink) / 0.85)',
          800: 'rgb(var(--color-eg-pink) / 0.90)',
          900: 'rgb(var(--color-eg-pink) / 0.95)',
        },

        // CoolGray 9U - Gris frío oficial (ESCALAS DINÁMICAS)
        'eg-gray': {
          DEFAULT: 'rgb(var(--color-eg-gray))',
          50: 'rgb(var(--color-eg-gray) / 0.05)',
          100: 'rgb(var(--color-eg-gray) / 0.10)',
          200: 'rgb(var(--color-eg-gray) / 0.20)',
          300: 'rgb(var(--color-eg-gray) / 0.30)',
          400: 'rgb(var(--color-eg-gray) / 0.50)',
          500: 'rgb(var(--color-eg-gray))',  // Dinámico desde CSS var
          600: 'rgb(var(--color-eg-gray) / 0.90)',
          700: 'rgb(var(--color-eg-gray) / 0.80)',
          800: 'rgb(var(--color-eg-gray) / 0.70)',
          900: 'rgb(var(--color-eg-gray) / 0.60)',
        },

        // Negro Pantone 231F20
        'eg-black': 'rgb(var(--color-eg-black))',
        'eg-dark': 'rgb(var(--color-eg-dark))',

        // Blanco puro
        'eg-white': 'rgb(var(--color-eg-white))',

        // Color de fondo claro
        'eg-light-gray': '#F5F5F5',

        // ===== MODO OSCURO (TONOS FRÍOS) =====
        // Temperatura fría: azules oscuros en lugar de grises
        'eg-dark-bg': 'var(--color-dark-bg)',
        'eg-dark-surface': 'var(--color-dark-surface)',
        'eg-dark-elevated': '#243447',
        'eg-dark-text': 'var(--color-dark-text)',
        'eg-dark-muted': 'var(--color-dark-text-secondary)',
      },
      fontFamily: {
        // DIN Pro como ÚNICA fuente (manual de imagen)
        // NO usar bold - jerarquía solo por tamaño
        'din': [
          'DIN Pro',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif'
        ],
        // Alias para sans (default)
        'sans': [
          'DIN Pro',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif'
        ],
      },
      fontSize: {
        // Jerarquía por tamaño (NO por bold)
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],    // 10px
        'xs': ['0.75rem', { lineHeight: '1rem' }],          // 12px (h6, small)
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],      // 14px (body, h5)
        'base': ['1rem', { lineHeight: '1.5rem' }],         // 16px (h4)
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],      // 18px (h3)
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],       // 20px (h2)
        '2xl': ['1.5rem', { lineHeight: '2rem' }],          // 24px (h1)
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],     // 30px
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],       // 36px
        '5xl': ['3rem', { lineHeight: '1' }],               // 48px
      },
      spacing: {
        // Margen del logo: 1cm = 37.8px
        'logo-margin': '37.8px',
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      boxShadow: {
        // Sombras dinámicas usando CSS variables
        'sm': '0 1px 2px 0 rgb(var(--color-eg-purple) / 0.05)',
        'DEFAULT': '0 1px 3px 0 rgb(var(--color-eg-purple) / 0.1), 0 1px 2px 0 rgb(var(--color-eg-purple) / 0.06)',
        'md': '0 4px 6px -1px rgb(var(--color-eg-purple) / 0.1), 0 2px 4px -1px rgb(var(--color-eg-purple) / 0.06)',
        'lg': '0 10px 15px -3px rgb(var(--color-eg-purple) / 0.1), 0 4px 6px -2px rgb(var(--color-eg-purple) / 0.05)',
        'xl': '0 20px 25px -5px rgb(var(--color-eg-purple) / 0.1), 0 10px 10px -5px rgb(var(--color-eg-purple) / 0.04)',
        '2xl': '0 25px 50px -12px rgb(var(--color-eg-purple) / 0.25)',
        'inner': 'inset 0 2px 4px 0 rgb(var(--color-eg-purple) / 0.06)',
        'purple': '0 10px 40px -10px rgb(var(--color-eg-purple) / 0.3)',
        'pink': '0 10px 40px -10px rgb(var(--color-eg-pink) / 0.3)',
      },
      backdropBlur: {
        xs: '2px',
      },
      borderRadius: {
        'DEFAULT': '0.5rem',
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
      transitionDuration: {
        '300': '300ms',  // Transición suave para tema
        '400': '400ms',
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      backgroundImage: {
        // SOLO gradientes autorizados con Pantone (DINÁMICOS)
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',

        // Gradientes institucionales base (usando CSS variables)
        'eg-purple-gradient': 'linear-gradient(135deg, rgb(var(--color-eg-purple)) 0%, rgb(var(--color-eg-purple) / 0.7) 100%)',
        'eg-pink-gradient': 'linear-gradient(135deg, rgb(var(--color-eg-pink)) 0%, rgb(var(--color-eg-pink) / 0.8) 100%)',
        'eg-gradient': 'linear-gradient(135deg, rgb(var(--color-eg-purple)) 0%, rgb(var(--color-eg-pink)) 100%)',

        // Gradientes avanzados para branding vibrante
        'eg-hero-gradient': 'linear-gradient(135deg, rgb(var(--color-eg-purple)) 0%, rgb(var(--color-eg-purple) / 0.7) 50%, rgb(var(--color-eg-pink)) 100%)',
        'eg-cta-gradient': 'linear-gradient(90deg, rgb(var(--color-eg-purple)) 0%, rgb(var(--color-eg-pink)) 100%)',
        'eg-overlay': 'linear-gradient(180deg, rgb(var(--color-eg-purple) / 0.95) 0%, rgb(var(--color-eg-pink) / 0.9) 100%)',
        'eg-overlay-light': 'linear-gradient(180deg, rgb(var(--color-eg-purple) / 0.1) 0%, rgb(var(--color-eg-pink) / 0.05) 100%)',

        // Gradientes para fondos sutiles
        'eg-subtle-purple': 'linear-gradient(to bottom right, rgb(var(--color-eg-purple) / 0.05), rgba(255,255,255,0))',
        'eg-subtle-pink': 'linear-gradient(to bottom right, rgb(var(--color-eg-pink) / 0.05), rgba(255,255,255,0))',

        // Mantener los antiguos para compatibilidad (ahora dinámicos)
        'purple-gradient': 'linear-gradient(135deg, rgb(var(--color-eg-purple)) 0%, rgb(var(--color-eg-purple) / 0.7) 100%)',
        'pink-gradient': 'linear-gradient(135deg, rgb(var(--color-eg-pink)) 0%, rgb(var(--color-eg-pink) / 0.8) 100%)',
      },
      minHeight: {
        'touch-target': '44px',  // Mínimo para accesibilidad
      },
      minWidth: {
        'touch-target': '44px',
      },
    },
  },
  plugins: [],
}
