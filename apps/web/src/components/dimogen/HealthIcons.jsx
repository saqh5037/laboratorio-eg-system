/**
 * HealthIcons.jsx
 * Iconografía SVG custom animada para Salud Integral
 * Incluye: Corazón latiendo, Estetoscopio, Cruz médica, Pulso
 */

import { motion } from 'framer-motion';

/**
 * HeartbeatSVG - Corazón con pulso animado
 */
export const HeartbeatSVG = ({ size = 70, color = '#7DD3FC', animated = true, delay = 0 }) => {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      animate={animated ? { scale: [1, 1.05, 1] } : undefined}
      transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      {/* Corazón */}
      <motion.path
        d="M50 85 C20 60, 5 35, 25 20 C35 12, 50 20, 50 30 C50 20, 65 12, 75 20 C95 35, 80 60, 50 85Z"
        fill={color}
        opacity={0.3}
        animate={animated ? { scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] } : undefined}
        transition={{ duration: 1, repeat: Infinity, delay }}
      />
      <motion.path
        d="M50 80 C25 58, 12 38, 28 25 C36 18, 50 25, 50 33 C50 25, 64 18, 72 25 C88 38, 75 58, 50 80Z"
        fill={color}
        animate={animated ? { scale: [1, 1.05, 1] } : undefined}
        transition={{ duration: 1, repeat: Infinity, delay }}
      />

      {/* Línea de pulso sobre el corazón */}
      <motion.path
        d="M20 50 L35 50 L40 35 L45 65 L50 45 L55 55 L60 50 L80 50"
        fill="none"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={animated ? { pathLength: [0, 1, 1], opacity: [0, 1, 0] } : undefined}
        transition={{ duration: 2, repeat: Infinity, delay }}
      />
    </motion.svg>
  );
};

/**
 * StethoscopeSVG - Estetoscopio animado
 */
export const StethoscopeSVG = ({ size = 70, color = '#00A3E0', animated = true, delay = 0 }) => {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      animate={animated ? { y: [0, -4, 0] } : undefined}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      {/* Tubos */}
      <motion.path
        d="M30 10 Q30 45, 50 55 Q70 45, 70 10"
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        animate={animated ? { strokeWidth: [4, 5, 4] } : undefined}
        transition={{ duration: 2, repeat: Infinity, delay }}
      />

      {/* Auriculares */}
      <circle cx="30" cy="10" r="6" fill={color} />
      <circle cx="70" cy="10" r="6" fill={color} />
      <circle cx="30" cy="10" r="3" fill="white" opacity={0.5} />
      <circle cx="70" cy="10" r="3" fill="white" opacity={0.5} />

      {/* Membrana/campana */}
      <motion.circle
        cx="50"
        cy="75"
        r="18"
        fill={color}
        animate={animated ? { r: [18, 20, 18], opacity: [0.8, 1, 0.8] } : undefined}
        transition={{ duration: 1.5, repeat: Infinity, delay }}
      />
      <circle cx="50" cy="75" r="12" fill={color} opacity={0.6} />

      {/* Tubo inferior */}
      <line x1="50" y1="55" x2="50" y2="57" stroke={color} strokeWidth="6" />

      {/* Brillo */}
      <circle cx="45" cy="70" r="4" fill="white" opacity={0.4} />
    </motion.svg>
  );
};

/**
 * MedicalCrossSVG - Cruz médica animada con pulso
 */
export const MedicalCrossSVG = ({ size = 60, color = '#98CB59', animated = true, delay = 0 }) => {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      animate={animated ? { rotate: [0, 5, -5, 0] } : undefined}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      {/* Fondo circular */}
      <motion.circle
        cx="50"
        cy="50"
        r="45"
        fill={color}
        opacity={0.2}
        animate={animated ? { r: [45, 47, 45], opacity: [0.15, 0.25, 0.15] } : undefined}
        transition={{ duration: 2, repeat: Infinity, delay }}
      />
      <circle cx="50" cy="50" r="40" fill={color} opacity={0.3} />

      {/* Cruz */}
      <motion.g animate={animated ? { scale: [1, 1.05, 1] } : undefined} transition={{ duration: 1.5, repeat: Infinity, delay }}>
        {/* Barra vertical */}
        <rect x="40" y="20" width="20" height="60" rx="4" fill="white" />
        {/* Barra horizontal */}
        <rect x="20" y="40" width="60" height="20" rx="4" fill="white" />
      </motion.g>
    </motion.svg>
  );
};

/**
 * PulseSVG - Línea de pulso cardíaco animada
 */
export const PulseSVG = ({ size = 80, color = '#7DD3FC', animated = true, delay = 0 }) => {
  return (
    <motion.svg
      width={size}
      height={size * 0.5}
      viewBox="0 0 100 50"
      animate={animated ? { y: [0, -2, 0] } : undefined}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      {/* Línea de pulso */}
      <motion.path
        d="M0 25 L20 25 L25 25 L30 10 L35 40 L40 15 L45 35 L50 25 L55 25 L60 25 L65 20 L70 30 L75 25 L100 25"
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={animated ? { pathLength: [0, 1] } : undefined}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay }}
      />

      {/* Punto que recorre la línea */}
      <motion.circle
        cx="0"
        cy="25"
        r="4"
        fill={color}
        animate={
          animated
            ? {
                cx: [0, 30, 40, 50, 100],
                cy: [25, 10, 25, 25, 25],
              }
            : undefined
        }
        transition={{ duration: 2, repeat: Infinity, ease: 'linear', delay }}
      />
    </motion.svg>
  );
};

/**
 * DoctorSVG - Silueta de doctor animada
 */
export const DoctorSVG = ({ size = 70, color = '#0047CB', animated = true, delay = 0 }) => {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      animate={animated ? { y: [0, -3, 0] } : undefined}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      {/* Cabeza */}
      <motion.circle
        cx="50"
        cy="25"
        r="15"
        fill={color}
        animate={animated ? { scale: [1, 1.02, 1] } : undefined}
        transition={{ duration: 2, repeat: Infinity, delay }}
      />

      {/* Cuerpo/bata */}
      <motion.path
        d="M25 95 L25 55 Q25 40, 50 40 Q75 40, 75 55 L75 95"
        fill={color}
        opacity={0.9}
      />

      {/* Estetoscopio simplificado */}
      <motion.path
        d="M40 50 Q40 65, 50 70 Q60 65, 60 50"
        fill="none"
        stroke="#7DD3FC"
        strokeWidth="3"
        strokeLinecap="round"
        animate={animated ? { strokeWidth: [3, 4, 3] } : undefined}
        transition={{ duration: 1.5, repeat: Infinity, delay }}
      />
      <circle cx="50" cy="72" r="5" fill="#7DD3FC" />

      {/* Cruz en el bolsillo */}
      <rect x="55" y="60" width="10" height="3" rx="1" fill="white" />
      <rect x="58.5" y="56.5" width="3" height="10" rx="1" fill="white" />

      {/* Sonrisa */}
      <path d="M45 27 Q50 32 55 27" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </motion.svg>
  );
};

/**
 * ShieldHealthSVG - Escudo de salud animado
 */
export const ShieldHealthSVG = ({ size = 65, color = '#98CB59', animated = true, delay = 0 }) => {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      animate={animated ? { scale: [1, 1.03, 1], y: [0, -2, 0] } : undefined}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      {/* Escudo */}
      <motion.path
        d="M50 5 L90 20 L90 50 Q90 80, 50 95 Q10 80, 10 50 L10 20 Z"
        fill={color}
        opacity={0.3}
        animate={animated ? { opacity: [0.2, 0.4, 0.2] } : undefined}
        transition={{ duration: 2, repeat: Infinity, delay }}
      />
      <path
        d="M50 10 L85 23 L85 50 Q85 75, 50 88 Q15 75, 15 50 L15 23 Z"
        fill={color}
      />

      {/* Cruz dentro del escudo */}
      <rect x="43" y="30" width="14" height="35" rx="3" fill="white" />
      <rect x="30" y="42" width="40" height="12" rx="3" fill="white" />

      {/* Brillo */}
      <motion.ellipse
        cx="35"
        cy="35"
        rx="8"
        ry="12"
        fill="white"
        opacity={0.2}
        animate={animated ? { opacity: [0.1, 0.3, 0.1] } : undefined}
        transition={{ duration: 2, repeat: Infinity, delay }}
      />
    </motion.svg>
  );
};

/**
 * CalendarHeartSVG - Calendario con corazón animado
 */
export const CalendarHeartSVG = ({ size = 60, color = '#00A3E0', animated = true, delay = 0 }) => {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      animate={animated ? { y: [0, -3, 0] } : undefined}
      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      {/* Calendario base */}
      <rect x="10" y="20" width="80" height="70" rx="8" fill={color} opacity={0.2} />
      <rect x="15" y="25" width="70" height="60" rx="5" fill={color} opacity={0.4} />

      {/* Anillas */}
      <rect x="25" y="12" width="8" height="18" rx="3" fill={color} />
      <rect x="67" y="12" width="8" height="18" rx="3" fill={color} />

      {/* Header del calendario */}
      <rect x="15" y="25" width="70" height="15" rx="5" fill={color} />

      {/* Corazón en el centro */}
      <motion.path
        d="M50 75 C35 60, 28 50, 38 42 C43 38, 50 42, 50 47 C50 42, 57 38, 62 42 C72 50, 65 60, 50 75Z"
        fill="#EC3237"
        animate={animated ? { scale: [1, 1.15, 1] } : undefined}
        transition={{ duration: 1, repeat: Infinity, delay }}
      />
    </motion.svg>
  );
};

export default {
  HeartbeatSVG,
  StethoscopeSVG,
  MedicalCrossSVG,
  PulseSVG,
  DoctorSVG,
  ShieldHealthSVG,
  CalendarHeartSVG,
};
