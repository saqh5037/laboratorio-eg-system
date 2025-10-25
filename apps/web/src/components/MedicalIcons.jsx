// Íconos médicos minimalistas para LaboratorioEG

export const TestTubeIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" 
          d="M9 2v11.5A3.5 3.5 0 0012.5 17h0a3.5 3.5 0 003.5-3.5V2M9 2h6M9 2H7m8 0h2m-5 5h0m0 3h0m0 3h0" />
  </svg>
);

export const ClockIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" 
          d="M12 6v6l4 2m-4-2a8 8 0 100 16 8 8 0 000-16z" />
  </svg>
);

export const FastingIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" 
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    <line x1="8" y1="8" x2="16" y2="8" strokeWidth="2" />
    <line x1="12" y1="8" x2="12" y2="13" strokeWidth="2" />
  </svg>
);

export const HeartIcon = ({ className = "w-5 h-5", filled = false }) => (
  <svg className={className} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" 
          d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
);

export const InfoIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" 
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const BeakerIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" 
          d="M7 2v9.5a3.5 3.5 0 007 0V2m-7 0h7m-3 7h0m-4 0h8m-6 3h4" />
  </svg>
);

export const MicroscopeIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" 
          d="M9 12l-2 2v3h10v-3l-2-2m-6 0V8m0 0V4a2 2 0 012-2h2a2 2 0 012 2v4m-6 0h6m-3 10v2m-5 0h10" />
  </svg>
);

export const DNAIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" 
          d="M12 2c-1.5 0-3 1-3 3s1.5 5 3 7c1.5-2 3-5 3-7s-1.5-3-3-3zm0 20c1.5 0 3-1 3-3s-1.5-5-3-7c-1.5 2-3 5-3 7s1.5 3 3 3z" />
    <path strokeLinecap="round" strokeLinejoin="round" 
          d="M9 5h6m-7 4h8m-9 4h10m-9 4h8m-7 4h6" />
  </svg>
);

export const ShieldIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" 
          d="M12 2l9 3.5v8c0 4-3 7-9 8.5-6-1.5-9-4.5-9-8.5v-8L12 2z" />
    <path strokeLinecap="round" strokeLinejoin="round" 
          d="M9 12l2 2 4-4" />
  </svg>
);

export const DropletIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" 
          d="M12 2.69l5.66 5.66a8 8 0 11-11.31 0L12 2.69z" />
  </svg>
);

// Función helper para obtener el ícono según el área
export const getAreaIcon = (area) => {
  const icons = {
    'Hematología': TestTubeIcon,
    'Química': BeakerIcon,
    'Microbiología': MicroscopeIcon,
    'Inmunología': ShieldIcon,
    'Hormonas': DNAIcon,
    'Uroanálisis': DropletIcon,
    'Heces': BeakerIcon,
    'Especiales': MicroscopeIcon
  };
  
  return icons[area] || TestTubeIcon;
};