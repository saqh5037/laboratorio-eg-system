/**
 * MolecularIcons.jsx
 * Iconografía SVG custom animada para Biología Molecular
 * Incluye: ADN, Virus, Células, Microscopio
 */

import { motion } from 'framer-motion';

/**
 * DNAHelixSVG - Doble hélice de ADN animada
 */
export const DNAHelixSVG = ({ size = 80, color = '#00A3E0', animated = true, delay = 0 }) => {
  const variants = animated
    ? {
        rotate: {
          rotate: [0, 360],
          transition: { duration: 20, repeat: Infinity, ease: 'linear', delay },
        },
        float: {
          y: [0, -6, 0],
          transition: { duration: 3, repeat: Infinity, ease: 'easeInOut', delay },
        },
      }
    : {};

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      initial="initial"
      animate={animated ? ['float'] : undefined}
      variants={variants}
    >
      <defs>
        <linearGradient id={`dnaGrad-${delay}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor="#0047CB" />
        </linearGradient>
      </defs>

      {/* Hélice de ADN */}
      <g>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <g key={i}>
            {/* Backbone izquierdo */}
            <motion.circle
              cx={30 + Math.sin((i * Math.PI) / 3) * 15}
              cy={15 + i * 14}
              r={4}
              fill={`url(#dnaGrad-${delay})`}
              animate={
                animated
                  ? {
                      cx: [30 + Math.sin((i * Math.PI) / 3) * 15, 30 + Math.sin(((i + 1) * Math.PI) / 3) * 15],
                      transition: { duration: 2, repeat: Infinity, repeatType: 'reverse', delay: delay + i * 0.1 },
                    }
                  : undefined
              }
            />
            {/* Backbone derecho */}
            <motion.circle
              cx={70 - Math.sin((i * Math.PI) / 3) * 15}
              cy={15 + i * 14}
              r={4}
              fill={color}
              opacity={0.7}
              animate={
                animated
                  ? {
                      cx: [70 - Math.sin((i * Math.PI) / 3) * 15, 70 - Math.sin(((i + 1) * Math.PI) / 3) * 15],
                      transition: { duration: 2, repeat: Infinity, repeatType: 'reverse', delay: delay + i * 0.1 },
                    }
                  : undefined
              }
            />
            {/* Puentes de hidrógeno */}
            <motion.line
              x1={30 + Math.sin((i * Math.PI) / 3) * 15 + 4}
              y1={15 + i * 14}
              x2={70 - Math.sin((i * Math.PI) / 3) * 15 - 4}
              y2={15 + i * 14}
              stroke={color}
              strokeWidth={2}
              opacity={0.4}
              strokeDasharray="4 2"
              animate={
                animated
                  ? {
                      opacity: [0.3, 0.6, 0.3],
                      transition: { duration: 1.5, repeat: Infinity, delay: delay + i * 0.2 },
                    }
                  : undefined
              }
            />
          </g>
        ))}
      </g>
    </motion.svg>
  );
};

/**
 * VirusSVG - Virus animado con spikes
 */
export const VirusSVG = ({ size = 70, color = '#00A3E0', animated = true, delay = 0 }) => {
  const spikeCount = 12;
  const spikes = Array.from({ length: spikeCount }, (_, i) => {
    const angle = (i * 360) / spikeCount;
    const rad = (angle * Math.PI) / 180;
    return { angle, rad };
  });

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      animate={
        animated
          ? {
              rotate: [0, 5, -5, 0],
              y: [0, -5, 0],
            }
          : undefined
      }
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      {/* Cuerpo del virus */}
      <motion.circle
        cx="50"
        cy="50"
        r="25"
        fill={color}
        opacity={0.3}
        animate={animated ? { scale: [1, 1.05, 1] } : undefined}
        transition={{ duration: 2, repeat: Infinity, delay }}
      />
      <circle cx="50" cy="50" r="20" fill={color} opacity={0.5} />
      <circle cx="50" cy="50" r="15" fill={color} />

      {/* Spikes */}
      {spikes.map((spike, i) => (
        <motion.g key={i}>
          <motion.line
            x1={50 + Math.cos(spike.rad) * 20}
            y1={50 + Math.sin(spike.rad) * 20}
            x2={50 + Math.cos(spike.rad) * 35}
            y2={50 + Math.sin(spike.rad) * 35}
            stroke={color}
            strokeWidth={3}
            strokeLinecap="round"
            animate={
              animated
                ? {
                    x2: [50 + Math.cos(spike.rad) * 35, 50 + Math.cos(spike.rad) * 38, 50 + Math.cos(spike.rad) * 35],
                    y2: [50 + Math.sin(spike.rad) * 35, 50 + Math.sin(spike.rad) * 38, 50 + Math.sin(spike.rad) * 35],
                  }
                : undefined
            }
            transition={{ duration: 1.5, repeat: Infinity, delay: delay + i * 0.1 }}
          />
          <motion.circle
            cx={50 + Math.cos(spike.rad) * 38}
            cy={50 + Math.sin(spike.rad) * 38}
            r={4}
            fill={color}
            animate={
              animated
                ? {
                    r: [4, 5, 4],
                    opacity: [0.8, 1, 0.8],
                  }
                : undefined
            }
            transition={{ duration: 1.5, repeat: Infinity, delay: delay + i * 0.1 }}
          />
        </motion.g>
      ))}

      {/* Interior details */}
      <circle cx="45" cy="45" r="3" fill="white" opacity={0.5} />
      <circle cx="55" cy="48" r="2" fill="white" opacity={0.4} />
    </motion.svg>
  );
};

/**
 * CellSVG - Célula animada con núcleo
 */
export const CellSVG = ({ size = 70, color = '#98CB59', animated = true, delay = 0 }) => {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      animate={animated ? { scale: [1, 1.03, 1], rotate: [0, 2, -2, 0] } : undefined}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      {/* Membrana celular */}
      <motion.ellipse
        cx="50"
        cy="50"
        rx="40"
        ry="35"
        fill={color}
        opacity={0.2}
        animate={animated ? { rx: [40, 42, 40], ry: [35, 33, 35] } : undefined}
        transition={{ duration: 3, repeat: Infinity, delay }}
      />
      <ellipse cx="50" cy="50" rx="35" ry="30" fill={color} opacity={0.4} />

      {/* Núcleo */}
      <motion.circle
        cx="50"
        cy="50"
        r="15"
        fill="#0047CB"
        opacity={0.6}
        animate={animated ? { r: [15, 16, 15] } : undefined}
        transition={{ duration: 2, repeat: Infinity, delay }}
      />
      <circle cx="50" cy="50" r="10" fill="#0047CB" opacity={0.8} />

      {/* Nucleolo */}
      <circle cx="52" cy="48" r="4" fill="white" opacity={0.5} />

      {/* Organelos (mitocondrias, ribosomas) */}
      {[
        { cx: 30, cy: 40, rx: 6, ry: 3 },
        { cx: 70, cy: 55, rx: 5, ry: 3 },
        { cx: 35, cy: 65, rx: 4, ry: 2 },
        { cx: 65, cy: 38, rx: 5, ry: 2 },
      ].map((org, i) => (
        <motion.ellipse
          key={i}
          cx={org.cx}
          cy={org.cy}
          rx={org.rx}
          ry={org.ry}
          fill={color}
          opacity={0.7}
          animate={animated ? { opacity: [0.5, 0.8, 0.5] } : undefined}
          transition={{ duration: 2, repeat: Infinity, delay: delay + i * 0.3 }}
        />
      ))}

      {/* Ribosomas pequeños */}
      {[
        { x: 25, y: 50 },
        { x: 75, y: 45 },
        { x: 40, y: 70 },
        { x: 60, y: 30 },
      ].map((rib, i) => (
        <circle key={i} cx={rib.x} cy={rib.y} r={2} fill={color} opacity={0.6} />
      ))}
    </motion.svg>
  );
};

/**
 * MicroscopeSVG - Microscopio animado
 */
export const MicroscopeSVG = ({ size = 80, color = '#0047CB', animated = true, delay = 0 }) => {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      animate={animated ? { y: [0, -3, 0] } : undefined}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      {/* Base */}
      <rect x="25" y="85" width="50" height="8" rx="2" fill={color} opacity={0.8} />
      <rect x="35" y="78" width="30" height="8" rx="1" fill={color} opacity={0.6} />

      {/* Columna */}
      <rect x="45" y="30" width="10" height="50" rx="2" fill={color} />

      {/* Brazo */}
      <rect x="35" y="25" width="30" height="8" rx="2" fill={color} opacity={0.9} />

      {/* Cabezal/Ocular */}
      <motion.g
        animate={animated ? { y: [0, -2, 0] } : undefined}
        transition={{ duration: 2, repeat: Infinity, delay }}
      >
        <rect x="42" y="8" width="16" height="20" rx="3" fill={color} />
        <ellipse cx="50" cy="8" rx="6" ry="3" fill={color} />
        {/* Lente brillante */}
        <motion.ellipse
          cx="50"
          cy="8"
          rx="4"
          ry="2"
          fill="#00A3E0"
          opacity={0.8}
          animate={animated ? { opacity: [0.6, 1, 0.6] } : undefined}
          transition={{ duration: 1.5, repeat: Infinity, delay }}
        />
      </motion.g>

      {/* Objetivo */}
      <rect x="46" y="68" width="8" height="12" rx="2" fill={color} opacity={0.9} />
      <motion.rect
        x="44"
        y="78"
        width="12"
        height="4"
        rx="1"
        fill="#00A3E0"
        animate={animated ? { opacity: [0.7, 1, 0.7] } : undefined}
        transition={{ duration: 2, repeat: Infinity, delay }}
      />

      {/* Platina */}
      <rect x="30" y="72" width="40" height="3" rx="1" fill={color} opacity={0.7} />

      {/* Luz/muestra */}
      <motion.circle
        cx="50"
        cy="73"
        r="8"
        fill="#98CB59"
        opacity={0.3}
        animate={animated ? { r: [8, 10, 8], opacity: [0.2, 0.4, 0.2] } : undefined}
        transition={{ duration: 2, repeat: Infinity, delay }}
      />
    </motion.svg>
  );
};

/**
 * TestTubeSVG - Tubo de ensayo animado con burbujas
 */
export const TestTubeSVG = ({ size = 60, color = '#00A3E0', animated = true, delay = 0 }) => {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      animate={animated ? { rotate: [-5, 5, -5], y: [0, -3, 0] } : undefined}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      {/* Tubo exterior */}
      <path
        d="M 35 15 L 35 70 Q 35 85 50 85 Q 65 85 65 70 L 65 15"
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Líquido */}
      <motion.path
        d="M 38 45 L 38 70 Q 38 82 50 82 Q 62 82 62 70 L 62 45 Z"
        fill={color}
        opacity={0.5}
        animate={
          animated
            ? {
                d: [
                  'M 38 45 L 38 70 Q 38 82 50 82 Q 62 82 62 70 L 62 45 Z',
                  'M 38 48 L 38 70 Q 38 82 50 82 Q 62 82 62 70 L 62 42 Z',
                  'M 38 45 L 38 70 Q 38 82 50 82 Q 62 82 62 70 L 62 45 Z',
                ],
              }
            : undefined
        }
        transition={{ duration: 2, repeat: Infinity, delay }}
      />

      {/* Burbujas */}
      {[
        { cx: 45, cy: 60, r: 3, delay: 0 },
        { cx: 55, cy: 65, r: 2, delay: 0.5 },
        { cx: 50, cy: 55, r: 2.5, delay: 1 },
      ].map((bubble, i) => (
        <motion.circle
          key={i}
          cx={bubble.cx}
          cy={bubble.cy}
          r={bubble.r}
          fill="white"
          opacity={0.6}
          animate={
            animated
              ? {
                  cy: [bubble.cy, bubble.cy - 15, bubble.cy],
                  opacity: [0.6, 0, 0.6],
                }
              : undefined
          }
          transition={{ duration: 2, repeat: Infinity, delay: delay + bubble.delay }}
        />
      ))}

      {/* Tapa */}
      <rect x="32" y="10" width="36" height="8" rx="3" fill={color} opacity={0.8} />
    </motion.svg>
  );
};

/**
 * GeneticCodeSVG - Código genético animado (ATCG)
 */
export const GeneticCodeSVG = ({ size = 70, color = '#0047CB', animated = true, delay = 0 }) => {
  const letters = ['A', 'T', 'C', 'G'];
  const colors = ['#00A3E0', '#98CB59', '#0047CB', '#EC3237'];

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      animate={animated ? { y: [0, -4, 0] } : undefined}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      {/* Grid de letras */}
      {letters.map((letter, i) => {
        const row = Math.floor(i / 2);
        const col = i % 2;
        const x = 25 + col * 30;
        const y = 35 + row * 30;

        return (
          <motion.g key={i}>
            <motion.rect
              x={x - 12}
              y={y - 18}
              width={24}
              height={24}
              rx={6}
              fill={colors[i]}
              opacity={0.2}
              animate={
                animated
                  ? {
                      opacity: [0.15, 0.3, 0.15],
                      scale: [1, 1.05, 1],
                    }
                  : undefined
              }
              transition={{ duration: 2, repeat: Infinity, delay: delay + i * 0.2 }}
            />
            <motion.text
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="18"
              fontWeight="bold"
              fontFamily="monospace"
              fill={colors[i]}
              animate={
                animated
                  ? {
                      opacity: [0.7, 1, 0.7],
                    }
                  : undefined
              }
              transition={{ duration: 1.5, repeat: Infinity, delay: delay + i * 0.2 }}
            >
              {letter}
            </motion.text>
          </motion.g>
        );
      })}

      {/* Líneas conectoras */}
      <motion.path
        d="M 25 47 L 25 53 M 55 47 L 55 53 M 37 35 L 43 35 M 37 65 L 43 65"
        stroke={color}
        strokeWidth={2}
        opacity={0.3}
        strokeDasharray="3 2"
        animate={animated ? { opacity: [0.2, 0.5, 0.2] } : undefined}
        transition={{ duration: 2, repeat: Infinity, delay }}
      />
    </motion.svg>
  );
};

export default {
  DNAHelixSVG,
  VirusSVG,
  CellSVG,
  MicroscopeSVG,
  TestTubeSVG,
  GeneticCodeSVG,
};
