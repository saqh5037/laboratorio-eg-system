import { motion } from 'framer-motion';

/**
 * Componente de ícono de tubo de ensayo con color dinámico
 * Muestra un tubo SVG con la tapa del color especificado
 */
const TubeIcon = ({ color = '#2196F3', size = 40, className = '' }) => {
  return (
    <motion.div
      initial={{ scale: 0, y: -10 }}
      animate={{ scale: 1, y: 0 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20
      }}
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Tubo de ensayo"
      >
        {/* Cuerpo del tubo (cilindro DELGADO Y ALTO - como tubo de ensayo real) */}
        <g>
          {/* Borde exterior del tubo - MÁS DELGADO */}
          <rect
            x="14"
            y="6"
            width="12"
            height="30"
            rx="1.5"
            fill="white"
            stroke="#9CA3AF"
            strokeWidth="1.5"
          />

          {/* Efecto de vidrio - brillo izquierdo */}
          <rect
            x="15"
            y="8"
            width="2"
            height="26"
            rx="0.5"
            fill="white"
            opacity="0.5"
          />

          {/* Líquido dentro del tubo (opcional, sutil) */}
          <rect
            x="15"
            y="22"
            width="10"
            height="12"
            rx="1"
            fill={color}
            opacity="0.15"
          />
        </g>

        {/* Tapa del tubo (parte superior coloreada) - MÁS ESTRECHA */}
        <g>
          {/* Base de la tapa */}
          <rect
            x="13"
            y="2"
            width="14"
            height="5"
            rx="1.5"
            fill={color}
            stroke={color}
            strokeWidth="0.5"
          />

          {/* Brillo en la tapa */}
          <rect
            x="15"
            y="3"
            width="6"
            height="1.5"
            rx="0.75"
            fill="white"
            opacity="0.5"
          />

          {/* Sombra inferior de la tapa */}
          <rect
            x="14"
            y="6"
            width="12"
            height="1"
            fill="black"
            opacity="0.1"
          />
        </g>

        {/* Efecto de profundidad/sombra del tubo */}
        <ellipse
          cx="20"
          cy="36"
          rx="6"
          ry="1"
          fill="black"
          opacity="0.1"
        />
      </svg>
    </motion.div>
  );
};

export default TubeIcon;
