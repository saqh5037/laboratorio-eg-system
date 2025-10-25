/**
 * Componente de ícono de tubo de ensayo pequeño para tipo de muestra
 * Similar a TubeIcon pero sin animación y más pequeño
 */
const SampleTubeIcon = ({ color = '#DC2626', size = 24, className = '' }) => {
  return (
    <div
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Tubo de muestra"
      >
        {/* Cuerpo del tubo */}
        <rect
          x="7"
          y="5"
          width="10"
          height="16"
          rx="1.5"
          fill="white"
          stroke="#9CA3AF"
          strokeWidth="1"
        />

        {/* Efecto de vidrio */}
        <rect
          x="8"
          y="6"
          width="2"
          height="14"
          rx="0.5"
          fill="white"
          opacity="0.3"
        />

        {/* Líquido dentro del tubo */}
        <rect
          x="8"
          y="12"
          width="8"
          height="8"
          rx="1"
          fill={color}
          opacity="0.2"
        />

        {/* Tapa del tubo */}
        <rect
          x="6"
          y="3"
          width="12"
          height="3"
          rx="1.5"
          fill={color}
        />

        {/* Brillo en la tapa */}
        <rect
          x="8"
          y="3.5"
          width="5"
          height="1"
          rx="0.5"
          fill="white"
          opacity="0.4"
        />
      </svg>
    </div>
  );
};

export default SampleTubeIcon;
