/**
 * BacteriaIcons.jsx
 * Iconografía SVG custom animada para DIMOGEN - Microbiología de Alimentos
 *
 * Incluye 4 tipos de bacterias específicas:
 * - BacillusSVG: Bacteria en forma de bastón (Salmonella, E.coli)
 * - CoccusSVG: Bacteria esférica (Staphylococcus)
 * - SpirillumSVG: Bacteria espiral (Campylobacter)
 * - PetriDishSVG: Placa de cultivo con colonias
 */

import { motion } from 'framer-motion';

// Colores DIMOGEN
const COLORS = {
  primary: '#0047CB',
  green: '#98CB59',
  cyan: '#00A3E0',
  white: '#FFFFFF',
};

/**
 * BacillusSVG - Bacteria en forma de bastón
 * Representa: Salmonella, E.coli, Listeria
 */
export const BacillusSVG = ({
  size = 60,
  color = COLORS.green,
  animated = true,
  delay = 0,
  className = ''
}) => {
  const variants = {
    float: {
      y: [0, -8, 0],
      rotate: [0, 3, -3, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      },
    },
  };

  const Wrapper = animated ? motion.svg : 'svg';
  const wrapperProps = animated ? { variants, animate: 'float' } : {};

  return (
    <Wrapper
      width={size}
      height={size}
      viewBox="0 0 60 60"
      fill="none"
      className={className}
      {...wrapperProps}
    >
      <defs>
        <linearGradient id={`bacillus-grad-${delay}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.6" />
        </linearGradient>
      </defs>

      {/* Cuerpo del bacilo */}
      <motion.rect
        x="15"
        y="22"
        width="30"
        height="16"
        rx="8"
        fill={`url(#bacillus-grad-${delay})`}
        initial={{ opacity: 0.8 }}
        animate={animated ? {
          opacity: [0.8, 1, 0.8],
          scale: [1, 1.02, 1],
        } : {}}
        transition={{ duration: 2, repeat: Infinity, delay }}
      />

      {/* Flagelos (cilios) */}
      <motion.path
        d="M8 30 Q5 25 3 30 Q0 35 3 32"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={animated ? {
          pathLength: [0.5, 1, 0.5],
          opacity: [0.5, 0.8, 0.5],
        } : { pathLength: 1 }}
        transition={{ duration: 1.5, repeat: Infinity, delay }}
      />
      <motion.path
        d="M52 30 Q55 25 57 30 Q60 35 57 32"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={animated ? {
          pathLength: [0.5, 1, 0.5],
          opacity: [0.5, 0.8, 0.5],
        } : { pathLength: 1 }}
        transition={{ duration: 1.5, repeat: Infinity, delay: delay + 0.3 }}
      />

      {/* Puntos internos (nucleoide) */}
      <circle cx="25" cy="30" r="2" fill={COLORS.white} opacity="0.6" />
      <circle cx="35" cy="30" r="2" fill={COLORS.white} opacity="0.6" />
    </Wrapper>
  );
};

/**
 * CoccusSVG - Bacteria esférica
 * Representa: Staphylococcus, Streptococcus
 */
export const CoccusSVG = ({
  size = 60,
  color = COLORS.cyan,
  animated = true,
  delay = 0,
  className = ''
}) => {
  const variants = {
    float: {
      y: [0, -6, 0],
      scale: [1, 1.05, 1],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      },
    },
  };

  const Wrapper = animated ? motion.svg : 'svg';
  const wrapperProps = animated ? { variants, animate: 'float' } : {};

  return (
    <Wrapper
      width={size}
      height={size}
      viewBox="0 0 60 60"
      fill="none"
      className={className}
      {...wrapperProps}
    >
      <defs>
        <radialGradient id={`coccus-grad-${delay}`} cx="30%" cy="30%">
          <stop offset="0%" stopColor={COLORS.white} stopOpacity="0.4" />
          <stop offset="50%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.7" />
        </radialGradient>
      </defs>

      {/* Célula principal */}
      <motion.circle
        cx="30"
        cy="30"
        r="18"
        fill={`url(#coccus-grad-${delay})`}
        initial={{ opacity: 0.9 }}
        animate={animated ? {
          opacity: [0.9, 1, 0.9],
        } : {}}
        transition={{ duration: 2.5, repeat: Infinity, delay }}
      />

      {/* Pared celular */}
      <motion.circle
        cx="30"
        cy="30"
        r="18"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeDasharray="4 2"
        initial={{ rotate: 0 }}
        animate={animated ? { rotate: 360 } : {}}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear', delay }}
        style={{ transformOrigin: 'center' }}
      />

      {/* Núcleo */}
      <motion.circle
        cx="30"
        cy="30"
        r="6"
        fill={COLORS.white}
        opacity="0.3"
        animate={animated ? {
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        } : {}}
        transition={{ duration: 2, repeat: Infinity, delay }}
      />

      {/* Cilios pequeños */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
        <motion.line
          key={i}
          x1={30 + Math.cos((angle * Math.PI) / 180) * 18}
          y1={30 + Math.sin((angle * Math.PI) / 180) * 18}
          x2={30 + Math.cos((angle * Math.PI) / 180) * 24}
          y2={30 + Math.sin((angle * Math.PI) / 180) * 24}
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ opacity: 0.4 }}
          animate={animated ? {
            opacity: [0.4, 0.8, 0.4],
            scale: [1, 1.1, 1],
          } : {}}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: delay + i * 0.1,
          }}
        />
      ))}
    </Wrapper>
  );
};

/**
 * SpirillumSVG - Bacteria espiral
 * Representa: Campylobacter, Helicobacter
 */
export const SpirillumSVG = ({
  size = 60,
  color = COLORS.primary,
  animated = true,
  delay = 0,
  className = ''
}) => {
  const variants = {
    float: {
      y: [0, -10, 0],
      rotate: [-5, 5, -5],
      transition: {
        duration: 5,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      },
    },
  };

  const Wrapper = animated ? motion.svg : 'svg';
  const wrapperProps = animated ? { variants, animate: 'float' } : {};

  return (
    <Wrapper
      width={size}
      height={size}
      viewBox="0 0 60 60"
      fill="none"
      className={className}
      {...wrapperProps}
    >
      <defs>
        <linearGradient id={`spirillum-grad-${delay}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0.6" />
          <stop offset="50%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.6" />
        </linearGradient>
      </defs>

      {/* Cuerpo espiral */}
      <motion.path
        d="M8 30
           Q15 20 22 30
           Q29 40 36 30
           Q43 20 52 30"
        stroke={`url(#spirillum-grad-${delay})`}
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={animated ? {
          pathLength: [0.8, 1, 0.8],
        } : { pathLength: 1 }}
        transition={{ duration: 3, repeat: Infinity, delay }}
      />

      {/* Ondulación secundaria */}
      <motion.path
        d="M10 30
           Q17 22 24 30
           Q31 38 38 30
           Q45 22 50 30"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
        animate={animated ? {
          opacity: [0.2, 0.5, 0.2],
        } : {}}
        transition={{ duration: 2, repeat: Infinity, delay }}
      />

      {/* Flagelo anterior */}
      <motion.path
        d="M5 30 Q2 25 0 30"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        animate={animated ? {
          d: [
            'M5 30 Q2 25 0 30',
            'M5 30 Q2 35 0 30',
            'M5 30 Q2 25 0 30',
          ],
        } : {}}
        transition={{ duration: 0.8, repeat: Infinity, delay }}
      />

      {/* Flagelo posterior */}
      <motion.path
        d="M55 30 Q58 25 60 30"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        animate={animated ? {
          d: [
            'M55 30 Q58 25 60 30',
            'M55 30 Q58 35 60 30',
            'M55 30 Q58 25 60 30',
          ],
        } : {}}
        transition={{ duration: 0.8, repeat: Infinity, delay: delay + 0.2 }}
      />
    </Wrapper>
  );
};

/**
 * PetriDishSVG - Placa de cultivo con colonias
 * Icono representativo de laboratorio
 */
export const PetriDishSVG = ({
  size = 60,
  color = COLORS.green,
  animated = true,
  delay = 0,
  className = ''
}) => {
  const variants = {
    float: {
      y: [0, -5, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      },
    },
  };

  const Wrapper = animated ? motion.svg : 'svg';
  const wrapperProps = animated ? { variants, animate: 'float' } : {};

  // Posiciones de colonias
  const colonies = [
    { cx: 22, cy: 24, r: 4 },
    { cx: 38, cy: 22, r: 3 },
    { cx: 28, cy: 35, r: 5 },
    { cx: 40, cy: 38, r: 3.5 },
    { cx: 20, cy: 40, r: 2.5 },
    { cx: 35, cy: 30, r: 2 },
  ];

  return (
    <Wrapper
      width={size}
      height={size}
      viewBox="0 0 60 60"
      fill="none"
      className={className}
      {...wrapperProps}
    >
      <defs>
        <linearGradient id={`petri-grad-${delay}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={COLORS.white} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0.1" />
        </linearGradient>
        <filter id={`petri-glow-${delay}`}>
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Placa base (círculo exterior) */}
      <circle
        cx="30"
        cy="30"
        r="26"
        fill={`url(#petri-grad-${delay})`}
        stroke={color}
        strokeWidth="2"
        opacity="0.8"
      />

      {/* Borde de la placa */}
      <circle
        cx="30"
        cy="30"
        r="24"
        fill="none"
        stroke={color}
        strokeWidth="1"
        strokeDasharray="2 2"
        opacity="0.4"
      />

      {/* Medio de cultivo (agar) */}
      <circle
        cx="30"
        cy="30"
        r="22"
        fill={color}
        opacity="0.15"
      />

      {/* Colonias bacterianas */}
      {colonies.map((colony, i) => (
        <motion.circle
          key={i}
          cx={colony.cx}
          cy={colony.cy}
          r={colony.r}
          fill={color}
          filter={`url(#petri-glow-${delay})`}
          initial={{ scale: 0.8, opacity: 0.7 }}
          animate={animated ? {
            scale: [0.8, 1.1, 0.8],
            opacity: [0.7, 1, 0.7],
          } : {}}
          transition={{
            duration: 2 + i * 0.3,
            repeat: Infinity,
            delay: delay + i * 0.2,
          }}
        />
      ))}

      {/* Reflejo de luz */}
      <ellipse
        cx="20"
        cy="18"
        rx="6"
        ry="3"
        fill={COLORS.white}
        opacity="0.3"
      />
    </Wrapper>
  );
};

/**
 * FloatingBacteria - Componente para múltiples bacterias flotantes en el fondo
 */
export const FloatingBacteria = ({
  count = 6,
  opacity = 0.15,
  className = ''
}) => {
  const bacteria = [BacillusSVG, CoccusSVG, SpirillumSVG, PetriDishSVG];

  // Generar posiciones y configuraciones aleatorias pero consistentes
  const items = Array.from({ length: count }, (_, i) => ({
    Component: bacteria[i % bacteria.length],
    style: {
      position: 'absolute',
      top: `${10 + (i * 15) % 80}%`,
      left: `${5 + (i * 20) % 90}%`,
      opacity,
    },
    size: 40 + (i % 3) * 20,
    delay: i * 0.5,
  }));

  return (
    <div className={`pointer-events-none ${className}`}>
      {items.map(({ Component, style, size, delay }, i) => (
        <div key={i} style={style}>
          <Component
            size={size}
            delay={delay}
            color={i % 2 === 0 ? COLORS.green : COLORS.cyan}
          />
        </div>
      ))}
    </div>
  );
};

/**
 * WaterDropSVG - Gota de agua para análisis de agua
 */
export const WaterDropSVG = ({
  size = 60,
  color = COLORS.cyan,
  animated = true,
  delay = 0,
  className = ''
}) => {
  const variants = {
    float: {
      y: [0, -6, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      },
    },
  };

  const Wrapper = animated ? motion.svg : 'svg';
  const wrapperProps = animated ? { variants, animate: 'float' } : {};

  return (
    <Wrapper
      width={size}
      height={size}
      viewBox="0 0 60 60"
      fill="none"
      className={className}
      {...wrapperProps}
    >
      <defs>
        <linearGradient id={`water-grad-${delay}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={COLORS.white} stopOpacity="0.6" />
          <stop offset="50%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.8" />
        </linearGradient>
      </defs>

      {/* Gota de agua */}
      <motion.path
        d="M30 8
           Q30 8 30 8
           C15 25 12 35 12 40
           C12 50 20 55 30 55
           C40 55 48 50 48 40
           C48 35 45 25 30 8Z"
        fill={`url(#water-grad-${delay})`}
        initial={{ scale: 0.95 }}
        animate={animated ? {
          scale: [0.95, 1, 0.95],
        } : {}}
        transition={{ duration: 2, repeat: Infinity, delay }}
      />

      {/* Reflejo */}
      <ellipse
        cx="22"
        cy="32"
        rx="5"
        ry="8"
        fill={COLORS.white}
        opacity="0.4"
      />

      {/* Bacteria dentro de la gota */}
      <motion.circle
        cx="32"
        cy="42"
        r="3"
        fill={COLORS.green}
        opacity="0.6"
        animate={animated ? {
          y: [0, -2, 0],
          opacity: [0.4, 0.7, 0.4],
        } : {}}
        transition={{ duration: 2, repeat: Infinity, delay }}
      />
      <motion.circle
        cx="26"
        cy="38"
        r="2"
        fill={COLORS.green}
        opacity="0.5"
        animate={animated ? {
          y: [0, -1, 0],
          opacity: [0.3, 0.6, 0.3],
        } : {}}
        transition={{ duration: 1.5, repeat: Infinity, delay: delay + 0.3 }}
      />
    </Wrapper>
  );
};

/**
 * FoodSafetySVG - Icono de seguridad alimentaria
 */
export const FoodSafetySVG = ({
  size = 60,
  color = COLORS.green,
  animated = true,
  delay = 0,
  className = ''
}) => {
  const variants = {
    float: {
      y: [0, -4, 0],
      transition: {
        duration: 3.5,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      },
    },
  };

  const Wrapper = animated ? motion.svg : 'svg';
  const wrapperProps = animated ? { variants, animate: 'float' } : {};

  return (
    <Wrapper
      width={size}
      height={size}
      viewBox="0 0 60 60"
      fill="none"
      className={className}
      {...wrapperProps}
    >
      <defs>
        <linearGradient id={`food-grad-${delay}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.7" />
        </linearGradient>
      </defs>

      {/* Escudo base */}
      <motion.path
        d="M30 5
           L50 12
           L50 30
           Q50 48 30 55
           Q10 48 10 30
           L10 12
           Z"
        fill={`url(#food-grad-${delay})`}
        stroke={color}
        strokeWidth="2"
        initial={{ scale: 0.95 }}
        animate={animated ? {
          scale: [0.95, 1, 0.95],
        } : {}}
        transition={{ duration: 3, repeat: Infinity, delay }}
      />

      {/* Check mark */}
      <motion.path
        d="M20 30 L27 37 L42 22"
        stroke={COLORS.white}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={animated ? { pathLength: 1 } : { pathLength: 1 }}
        transition={{ duration: 1, delay: delay + 0.5 }}
      />

      {/* Hoja pequeña (representa alimentos) */}
      <motion.path
        d="M42 8 Q48 12 46 18 Q44 14 42 8"
        fill={COLORS.white}
        opacity="0.6"
        animate={animated ? {
          rotate: [0, 5, 0],
          opacity: [0.4, 0.7, 0.4],
        } : {}}
        transition={{ duration: 2, repeat: Infinity, delay }}
        style={{ transformOrigin: '44px 13px' }}
      />
    </Wrapper>
  );
};

export default {
  BacillusSVG,
  CoccusSVG,
  SpirillumSVG,
  PetriDishSVG,
  FloatingBacteria,
  WaterDropSVG,
  FoodSafetySVG,
};
