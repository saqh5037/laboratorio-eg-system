import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Building2, Microscope, Dna } from 'lucide-react';
import { useLab } from '../../contexts/LabContext';

// Map de iconos por lab
const LAB_ICONS = {
  eg: Building2,
  dimogen: Microscope,
  microtec: Dna
};

export default function LabSelector() {
  const { currentLab, labs, switchLab } = useLab();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cerrar con Escape
  useEffect(() => {
    function handleEscape(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const handleSelect = (labCode) => {
    switchLab(labCode);
    setIsOpen(false);
  };

  const CurrentIcon = LAB_ICONS[currentLab.code] || Building2;

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all duration-200 hover:shadow-md"
        style={{
          borderColor: currentLab.color,
          backgroundColor: `${currentLab.color}10`
        }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: currentLab.color }}
        >
          <CurrentIcon className="w-4 h-4 text-white" />
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-xs text-gray-500 leading-none">Laboratorio</p>
          <p className="text-sm font-semibold" style={{ color: currentLab.color }}>
            {currentLab.shortName}
          </p>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Seleccionar Laboratorio
            </p>
          </div>

          <div className="py-1">
            {labs.map((lab) => {
              const Icon = LAB_ICONS[lab.code] || Building2;
              const isSelected = currentLab.code === lab.code;

              return (
                <button
                  key={lab.code}
                  onClick={() => handleSelect(lab.code)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors ${
                    isSelected
                      ? 'bg-gray-50'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: isSelected ? lab.color : lab.colorLight,
                    }}
                  >
                    <Icon
                      className="w-5 h-5"
                      style={{ color: isSelected ? 'white' : lab.color }}
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <p
                      className={`text-sm font-medium ${
                        isSelected ? 'text-gray-900' : 'text-gray-700'
                      }`}
                    >
                      {lab.name}
                    </p>
                    <p className="text-xs text-gray-500">{lab.shortName}</p>
                  </div>
                  {isSelected && (
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: lab.color }}
                    >
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="px-3 py-2 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center">
              El menú se ajustará al laboratorio seleccionado
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
