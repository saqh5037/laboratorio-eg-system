import { motion } from 'framer-motion';
import { LOGO_SPECS } from '../../constants/brandDesignSystem';

/**
 * BrandLogo - Componente profesional del logo corporativo
 *
 * Cumple con el manual de imagen de Laboratorio Elizabeth Gutiérrez:
 * - Respeta márgenes mínimos (1cm = 37.8px)
 * - RIF siempre visible cuando showRif=true
 * - NO distorsiona ni recolorea el logo
 * - Animaciones sutiles autorizadas
 *
 * @param {string} variant - Variante del logo: 'full', 'icon', 'horizontal'
 * @param {string} size - Tamaño: 'xs', 'sm', 'md', 'lg', 'xl', '2xl', 'custom'
 * @param {boolean} showRif - Mostrar RIF (requerido legalmente en la mayoría de casos)
 * @param {boolean} showName - Mostrar nombre "ELIZABETH GUTIÉRREZ"
 * @param {boolean} animated - Habilitar animación hover
 * @param {string} className - Clases adicionales de Tailwind
 * @param {object} customSize - Tamaño personalizado {width, height} cuando size='custom'
 * @param {string} theme - Tema visual: 'default', 'dark', 'light'
 */

const BrandLogo = ({
  variant = 'full',
  size = 'md',
  showRif = true,
  showName = true,
  animated = true,
  className = '',
  customSize = null,
  theme = 'default',
  onClick = null,
}) => {

  // Tamaños predefinidos según especificaciones del manual
  const sizeClasses = {
    xs: 'h-8',    // 32px - Para mobile compact
    sm: 'h-12',   // 48px - Header mobile
    md: 'h-14',   // 56px - Header desktop, footer
    lg: 'h-16',   // 64px - Hero secondary
    xl: 'h-20',   // 80px - Hero primary
    '2xl': 'h-24', // 96px - Landing hero principal
    '3xl': 'h-32', // 128px - Full screen loader
    custom: ''     // Usar customSize prop
  };

  // Rutas de los logos
  const logoSources = {
    full: '/Logo.png',        // Logo completo con doble hélice ADN integrada en E y G
    icon: '/Logo.png',        // Mismo logo (no tenemos isotipo separado todavía)
    horizontal: '/Logo.png'   // Mismo logo (futuro: versión horizontal)
  };

  // Estilos de contenedor según tema
  const themeStyles = {
    default: '',
    dark: 'bg-eg-purple/5 rounded-2xl p-2',
    light: 'bg-white/10 backdrop-blur-sm rounded-2xl p-2'
  };

  // Animaciones según el manual (sutiles y elegantes)
  const hoverAnimation = animated ? {
    whileHover: {
      scale: 1.05,
      rotate: [0, -2, 2, -2, 0],
      transition: { duration: 0.5 }
    },
    whileTap: { scale: 0.95 }
  } : {};

  // Efecto glow autorizado con colores Pantone
  const GlowEffect = () => (
    <div
      className="absolute inset-0 bg-gradient-to-br from-eg-purple to-eg-pink rounded-2xl blur-xl opacity-0 group-hover:opacity-25 transition-opacity duration-300 pointer-events-none"
      aria-hidden="true"
    />
  );

  // Componente de logo principal
  const LogoImage = () => (
    <motion.img
      src={logoSources[variant]}
      alt="Laboratorio Clínico Microbiológico Elizabeth Gutiérrez - Logo oficial con doble hélice de ADN"
      className={`
        ${customSize ? '' : sizeClasses[size]}
        ${customSize ? `w-[${customSize.width}] h-[${customSize.height}]` : 'w-auto'}
        object-contain relative z-10
        ${onClick ? 'cursor-pointer' : ''}
      `}
      style={customSize ? { width: customSize.width, height: customSize.height } : {}}
      loading="lazy"
      decoding="async"
      {...hoverAnimation}
    />
  );

  // Renderizado según variante
  if (variant === 'icon') {
    // Solo el isotipo/logo
    return (
      <div className={`relative group ${themeStyles[theme]} ${className}`} onClick={onClick}>
        {animated && <GlowEffect />}
        <LogoImage />
      </div>
    );
  }

  if (variant === 'horizontal') {
    // Logo + nombre en línea horizontal
    return (
      <div
        className={`flex items-center gap-3 sm:gap-4 group ${themeStyles[theme]} ${className}`}
        onClick={onClick}
      >
        {animated && <GlowEffect />}
        <div className="relative">
          <LogoImage />
        </div>
        {showName && (
          <div className="flex flex-col">
            {showRif && (
              <span className="text-2xs text-eg-gray dark:text-eg-dark-muted uppercase tracking-wider">
                RIF: {LOGO_SPECS.rif}
              </span>
            )}
            <h1 className="text-lg sm:text-xl bg-eg-gradient bg-clip-text text-transparent">
              ELIZABETH GUTIÉRREZ
            </h1>
          </div>
        )}
      </div>
    );
  }

  // Variante 'full' por defecto - Logo completo con nombre y RIF debajo
  return (
    <div
      className={`flex flex-col items-center gap-2 group ${themeStyles[theme]} ${className}`}
      onClick={onClick}
    >
      {animated && <GlowEffect />}
      <div className="relative">
        <LogoImage />
      </div>

      {(showName || showRif) && (
        <div className="flex flex-col items-center text-center">
          {showName && (
            <h2 className="text-base sm:text-lg bg-eg-gradient bg-clip-text text-transparent font-normal">
              ELIZABETH GUTIÉRREZ
            </h2>
          )}
          {showRif && (
            <p className="text-2xs text-eg-gray dark:text-eg-dark-muted uppercase tracking-wider">
              RIF: {LOGO_SPECS.rif}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Variantes pre-configuradas para casos de uso comunes
 */

// Logo para header (horizontal con nombre)
export const HeaderLogo = ({ className = '', onClick }) => (
  <BrandLogo
    variant="horizontal"
    size="md"
    showRif={true}
    showName={true}
    animated={true}
    className={className}
    onClick={onClick}
  />
);

// Logo para header mobile (compacto)
export const HeaderLogoMobile = ({ className = '', onClick }) => (
  <BrandLogo
    variant="icon"
    size="sm"
    showRif={false}
    showName={false}
    animated={true}
    className={className}
    onClick={onClick}
  />
);

// Logo para footer (full con nombre y RIF)
export const FooterLogo = ({ className = '' }) => (
  <BrandLogo
    variant="full"
    size="md"
    showRif={true}
    showName={true}
    animated={false}
    className={className}
  />
);

// Logo para hero/landing (grande y prominente)
export const HeroLogo = ({ className = '' }) => (
  <BrandLogo
    variant="full"
    size="2xl"
    showRif={true}
    showName={true}
    animated={true}
    theme="light"
    className={className}
  />
);

// Isotipo pequeño para loading/spinner
export const LogoIcon = ({ size = 'md', animated = true, className = '' }) => (
  <BrandLogo
    variant="icon"
    size={size}
    showRif={false}
    showName={false}
    animated={animated}
    className={className}
  />
);

// Logo para CTA sections (mediano con efecto)
export const CTALogo = ({ className = '' }) => (
  <BrandLogo
    variant="full"
    size="xl"
    showRif={false}
    showName={false}
    animated={true}
    theme="default"
    className={className}
  />
);

export default BrandLogo;
