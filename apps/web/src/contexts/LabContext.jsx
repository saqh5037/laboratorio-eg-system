import { createContext, useContext, useState, useEffect } from 'react';

// Definición de laboratorios disponibles
const LABS = [
  {
    code: 'eg',
    name: 'Elizabeth Gutiérrez',
    shortName: 'EG',
    color: '#7B68A6',
    colorLight: '#E8C4DD',
    icon: 'Building2' // Lucide icon name
  },
  {
    code: 'dimogen',
    name: 'DIMOGEN',
    shortName: 'DIM',
    color: '#0047CB',
    colorLight: '#E6F0FF',
    icon: 'Microscope'
  },
  {
    code: 'microtec',
    name: 'Microtec',
    shortName: 'MTC',
    color: '#10B981',
    colorLight: '#D1FAE5',
    icon: 'Dna'
  }
];

const STORAGE_KEY = 'admin_active_lab';

export const LabContext = createContext(null);

export function LabProvider({ children }) {
  // Inicializar desde localStorage o usar 'eg' como default
  const [activeLab, setActiveLab] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      // Validar que el lab almacenado existe
      if (stored && LABS.some(l => l.code === stored)) {
        return stored;
      }
    }
    return 'dimogen';
  });

  // Persistir cambios en localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, activeLab);
    }
  }, [activeLab]);

  // Obtener objeto del lab actual (default: dimogen)
  const currentLab = LABS.find(l => l.code === activeLab) || LABS.find(l => l.code === 'dimogen') || LABS[0];

  // Función para cambiar de laboratorio
  const switchLab = (labCode) => {
    if (LABS.some(l => l.code === labCode)) {
      setActiveLab(labCode);
    } else {
      console.warn(`Lab code "${labCode}" not found`);
    }
  };

  // Verificar si un lab específico está activo
  const isLabActive = (labCode) => activeLab === labCode;

  const value = {
    // Estado actual
    activeLab,
    currentLab,

    // Lista de todos los labs
    labs: LABS,

    // Acciones
    setActiveLab: switchLab,
    switchLab,

    // Helpers
    isLabActive,
    isEG: activeLab === 'eg',
    isDimogen: activeLab === 'dimogen',
    isMicrotec: activeLab === 'microtec'
  };

  return (
    <LabContext.Provider value={value}>
      {children}
    </LabContext.Provider>
  );
}

// Hook personalizado para usar el context
export function useLab() {
  const context = useContext(LabContext);
  if (!context) {
    throw new Error('useLab debe usarse dentro de un LabProvider');
  }
  return context;
}

// Export de las constantes para uso externo
export { LABS };
