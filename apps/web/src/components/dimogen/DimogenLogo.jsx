import React from 'react';
import { DIMOGEN_COLORS } from '../../styles/dimogen-theme';

/**
 * DimogenLogo Component
 * Logo SVG oficial de DIMOGEN basado en el manual de identidad corporativa
 *
 * @param {Object} props
 * @param {'full' | 'icon' | 'wordmark'} props.variant - Variante del logo
 * @param {'primary' | 'white' | 'black'} props.color - Color del logo
 * @param {string} props.className - Clases adicionales
 * @param {number} props.size - Tamaño base (para icon) o altura (para full/wordmark)
 */
const DimogenLogo = ({
  variant = 'full',
  color = 'primary',
  className = '',
  size = 48,
  showRegistered = true
}) => {
  const getColor = () => {
    switch (color) {
      case 'white':
        return '#FFFFFF';
      case 'black':
        return '#000000';
      case 'primary':
      default:
        return DIMOGEN_COLORS.primary;
    }
  };

  const fillColor = getColor();

  // Isotipo DNA Helix - Recreado según manual de identidad
  const DNAIcon = ({ iconSize = size }) => (
    <svg
      viewBox="0 0 100 100"
      width={iconSize}
      height={iconSize}
      className={className}
      aria-label="DIMOGEN DNA Icon"
    >
      <g fill={fillColor} transform="rotate(-15 50 50)">
        {/* Hebra izquierda del DNA */}
        <path d="M25,15 C25,15 15,30 25,50 C35,70 25,85 25,85"
              fill="none"
              stroke={fillColor}
              strokeWidth="8"
              strokeLinecap="round"/>

        {/* Hebra derecha del DNA */}
        <path d="M75,15 C75,15 85,30 75,50 C65,70 75,85 75,85"
              fill="none"
              stroke={fillColor}
              strokeWidth="8"
              strokeLinecap="round"/>

        {/* Barras conectoras horizontales */}
        <rect x="30" y="22" width="18" height="6" rx="3" />
        <rect x="52" y="22" width="18" height="6" rx="3" />

        <rect x="22" y="46" width="22" height="6" rx="3" />
        <rect x="56" y="46" width="22" height="6" rx="3" />

        <rect x="30" y="70" width="18" height="6" rx="3" />
        <rect x="52" y="70" width="18" height="6" rx="3" />
      </g>
    </svg>
  );

  // Wordmark DIMOGEN - Tipografía personalizada
  const Wordmark = ({ height = size * 0.6 }) => (
    <svg
      viewBox="0 0 280 50"
      height={height}
      className={className}
      aria-label="DIMOGEN"
    >
      <g fill={fillColor}>
        {/* D - con abertura a la izquierda */}
        <path d="M0,5 L0,45 L20,45 C35,45 40,35 40,25 C40,15 35,5 20,5 L0,5 Z M8,12 L18,12 C28,12 32,18 32,25 C32,32 28,38 18,38 L8,38 L8,12 Z" />

        {/* I */}
        <rect x="48" y="5" width="8" height="40" rx="2" />

        {/* M */}
        <path d="M64,5 L64,45 L72,45 L72,20 L84,38 L96,20 L96,45 L104,45 L104,5 L94,5 L84,22 L74,5 Z" />

        {/* O */}
        <circle cx="128" cy="25" r="20" fill="none" stroke={fillColor} strokeWidth="8" />

        {/* G - con barra horizontal */}
        <path d="M176,25 C176,12 166,5 152,5 C138,5 128,15 128,25 C128,35 138,45 152,45 C164,45 172,40 176,32 L176,28 L156,28 L156,35 L166,35 C163,39 158,41 152,41 C142,41 136,34 136,25 C136,16 142,9 152,9 C161,9 167,14 168,21 L176,21 L176,25 Z"
              transform="translate(28, 0)" />

        {/* E - con tres barras */}
        <path d="M188,5 L188,45 L220,45 L220,38 L196,38 L196,28 L216,28 L216,21 L196,21 L196,12 L220,12 L220,5 Z" />

        {/* N */}
        <path d="M228,5 L228,45 L236,45 L236,18 L260,45 L268,45 L268,5 L260,5 L260,32 L236,5 Z" />
      </g>

      {/* Registered trademark symbol */}
      {showRegistered && (
        <circle cx="276" cy="10" r="6" fill="none" stroke={fillColor} strokeWidth="1.5" />
      )}
    </svg>
  );

  // Logo completo (Icon + Wordmark)
  if (variant === 'full') {
    return (
      <div className={`flex flex-col items-center gap-2 ${className}`}>
        <DNAIcon iconSize={size} />
        <Wordmark height={size * 0.4} />
      </div>
    );
  }

  // Solo icon
  if (variant === 'icon') {
    return <DNAIcon iconSize={size} />;
  }

  // Solo wordmark
  if (variant === 'wordmark') {
    return <Wordmark height={size} />;
  }

  return null;
};

/**
 * Logo horizontal (icon a la izquierda, wordmark a la derecha)
 */
export const DimogenLogoHorizontal = ({
  color = 'primary',
  className = '',
  iconSize = 48,
  gap = 'gap-3'
}) => {
  const getColor = () => {
    switch (color) {
      case 'white':
        return '#FFFFFF';
      case 'black':
        return '#000000';
      case 'primary':
      default:
        return DIMOGEN_COLORS.primary;
    }
  };

  const fillColor = getColor();

  return (
    <div className={`flex items-center ${gap} ${className}`}>
      {/* DNA Icon */}
      <svg
        viewBox="0 0 100 100"
        width={iconSize}
        height={iconSize}
        aria-label="DIMOGEN DNA Icon"
      >
        <g fill={fillColor} transform="rotate(-15 50 50)">
          <path d="M25,15 C25,15 15,30 25,50 C35,70 25,85 25,85"
                fill="none"
                stroke={fillColor}
                strokeWidth="8"
                strokeLinecap="round"/>
          <path d="M75,15 C75,15 85,30 75,50 C65,70 75,85 75,85"
                fill="none"
                stroke={fillColor}
                strokeWidth="8"
                strokeLinecap="round"/>
          <rect x="30" y="22" width="18" height="6" rx="3" />
          <rect x="52" y="22" width="18" height="6" rx="3" />
          <rect x="22" y="46" width="22" height="6" rx="3" />
          <rect x="56" y="46" width="22" height="6" rx="3" />
          <rect x="30" y="70" width="18" height="6" rx="3" />
          <rect x="52" y="70" width="18" height="6" rx="3" />
        </g>
      </svg>

      {/* DIMOGEN Text */}
      <span
        className="text-2xl font-semibold tracking-wider"
        style={{
          fontFamily: "'Poppins', sans-serif",
          color: fillColor
        }}
      >
        DIMOGEN
      </span>
    </div>
  );
};

/**
 * Logo GRUPO MICRO-TEC (SVG vectorizado)
 */
export const MicrotecLogo = ({
  className = '',
  height = 40,
  variant = 'color' // 'color' | 'white'
}) => {
  const logoSrc = variant === 'white'
    ? '/images/dimogen/logos/microtec/microtec-logo-white.svg'
    : '/images/dimogen/logos/microtec/microtec-logo.svg';

  return (
    <img
      src={logoSrc}
      alt="GRUPO MICRO-TEC"
      className={className}
      style={{ height, width: 'auto' }}
    />
  );
};

/**
 * Badge "Parte de GRUPO MICRO-TEC"
 */
export const MicrotecBadge = ({
  className = '',
  variant = 'light' // 'light' | 'dark'
}) => {
  const bgClass = variant === 'dark'
    ? 'bg-white/10 text-white'
    : 'bg-gray-100 text-gray-600';

  // Usar logo SVG vectorizado - blanco sobre fondo oscuro, colores sobre fondo claro
  const logoSrc = variant === 'dark'
    ? '/images/dimogen/logos/microtec/microtec-logo-white.svg'
    : '/images/dimogen/logos/microtec/microtec-logo.svg';

  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${bgClass} ${className}`}>
      <span className="text-xs font-medium">Parte de</span>
      <img
        src={logoSrc}
        alt="GRUPO MICRO-TEC"
        className="h-8 w-auto"
      />
    </div>
  );
};

export default DimogenLogo;
