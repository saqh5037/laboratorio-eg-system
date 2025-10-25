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
        // ===== COLORES PANTONE OFICIALES DEL MANUAL DE IMAGEN =====
        // NUNCA usar colores fuera de esta paleta

        // Pantone 2665U - Purple principal
        'eg-purple': {
          DEFAULT: '#7B68A6',
          50: '#F5F3F9',
          100: '#E8E4F1',
          200: '#D1C9E3',
          300: '#BAAED5',
          400: '#9B88C6',
          500: '#7B68A6',  // Pantone 2665U oficial
          600: '#685590',
          700: '#554279',
          800: '#3F3159',
          900: '#2A203C',
        },

        // Pantone 250U - Pink secundario
        'eg-pink': {
          DEFAULT: '#DDB5D5',
          50: '#FAF6F9',
          100: '#F4EBF1',
          200: '#E8D6E3',
          300: '#DDB5D5',  // Pantone 250U oficial
          400: '#D19BC7',
          500: '#C17FB3',
          600: '#A8629A',
          700: '#854D7A',
          800: '#5F375A',
          900: '#3D243B',
        },

        // CoolGray 9U - Gris frío oficial
        'eg-gray': {
          DEFAULT: '#8B8C8E',
          50: '#F8F8F9',
          100: '#EEEFF0',
          200: '#DCDDE0',
          300: '#CBCCCF',
          400: '#ADAEB2',
          500: '#8B8C8E',  // CoolGray 9U oficial
          600: '#6F7073',
          700: '#58595B',
          800: '#404143',
          900: '#2A2B2C',
        },

        // Negro Pantone 231F20
        'eg-black': '#231F20',

        // Blanco puro
        'eg-white': '#FFFFFF',

        // Color de fondo claro
        'eg-light-gray': '#F5F5F5',

        // Alias para compatibilidad (apuntan a eg-purple)
        'eg-dark': '#231F20',

        // ===== MODO OSCURO (TONOS FRÍOS) =====
        // Temperatura fría: azules oscuros en lugar de grises
        'eg-dark-bg': '#0F1729',        // Background azul oscuro frío
        'eg-dark-surface': '#1A2238',   // Surface azul oscuro
        'eg-dark-elevated': '#243447',  // Cards elevados
        'eg-dark-text': '#E8F0FF',      // Texto azul claro frío
        'eg-dark-muted': '#8B9FC7',     // Texto secundario azul
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
        // Sombras con tonos fríos (purple con baja opacidad)
        'sm': '0 1px 2px 0 rgba(123, 104, 166, 0.05)',
        'DEFAULT': '0 1px 3px 0 rgba(123, 104, 166, 0.1), 0 1px 2px 0 rgba(123, 104, 166, 0.06)',
        'md': '0 4px 6px -1px rgba(123, 104, 166, 0.1), 0 2px 4px -1px rgba(123, 104, 166, 0.06)',
        'lg': '0 10px 15px -3px rgba(123, 104, 166, 0.1), 0 4px 6px -2px rgba(123, 104, 166, 0.05)',
        'xl': '0 20px 25px -5px rgba(123, 104, 166, 0.1), 0 10px 10px -5px rgba(123, 104, 166, 0.04)',
        '2xl': '0 25px 50px -12px rgba(123, 104, 166, 0.25)',
        'inner': 'inset 0 2px 4px 0 rgba(123, 104, 166, 0.06)',
        'purple': '0 10px 40px -10px rgba(123, 104, 166, 0.3)',
        'pink': '0 10px 40px -10px rgba(221, 181, 213, 0.3)',
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
        // SOLO gradientes autorizados con Pantone
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',

        // Gradientes institucionales base
        'eg-purple-gradient': 'linear-gradient(135deg, #7B68A6 0%, #9B88C6 100%)',
        'eg-pink-gradient': 'linear-gradient(135deg, #DDB5D5 0%, #E8C4DD 100%)',
        'eg-gradient': 'linear-gradient(135deg, #7B68A6 0%, #DDB5D5 100%)',

        // Gradientes avanzados para branding vibrante
        'eg-hero-gradient': 'linear-gradient(135deg, #7B68A6 0%, #9B88C6 50%, #DDB5D5 100%)',
        'eg-cta-gradient': 'linear-gradient(90deg, #7B68A6 0%, #DDB5D5 100%)',
        'eg-overlay': 'linear-gradient(180deg, rgba(123,104,166,0.95) 0%, rgba(221,181,213,0.9) 100%)',
        'eg-overlay-light': 'linear-gradient(180deg, rgba(123,104,166,0.1) 0%, rgba(221,181,213,0.05) 100%)',

        // Gradientes para fondos sutiles
        'eg-subtle-purple': 'linear-gradient(to bottom right, rgba(123,104,166,0.05), rgba(255,255,255,0))',
        'eg-subtle-pink': 'linear-gradient(to bottom right, rgba(221,181,213,0.05), rgba(255,255,255,0))',

        // Mantener los antiguos para compatibilidad
        'purple-gradient': 'linear-gradient(135deg, #7B68A6 0%, #9B88C6 100%)',
        'pink-gradient': 'linear-gradient(135deg, #DDB5D5 0%, #E8C4DD 100%)',
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
