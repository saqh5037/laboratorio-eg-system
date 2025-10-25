import { Droplet, TestTube, Beaker, FlaskConical } from 'lucide-react';

/**
 * Obtiene el ícono y color apropiado según el tipo de muestra
 * @param {string} tipoMuestra - Tipo de muestra (ej: "Suero", "Sangre", "Plasma")
 * @returns {Object} { Icon, color, label, filled } - Componente de ícono, color hex, label y si está rellena
 */
export const getSampleIcon = (tipoMuestra = '') => {
  const tipo = tipoMuestra?.toLowerCase().trim() || '';

  // Sangre total - Gotita ROJA RELLENA (completamente roja)
  if (tipo.includes('sangre')) {
    return {
      Icon: Droplet,
      color: '#DC2626', // red-600
      label: 'Sangre total',
      bgColor: 'from-red-50 to-rose-50',
      borderColor: 'border-red-200',
      filled: true // RELLENA
    };
  }

  // Suero - Gotita OUTLINE AMARILLO (solo contorno)
  if (tipo.includes('suero')) {
    return {
      Icon: Droplet,
      color: '#FCD34D', // yellow-300 - Color real del suero
      label: 'Suero',
      bgColor: 'from-yellow-50 to-amber-50',
      borderColor: 'border-yellow-200',
      filled: false // OUTLINE
    };
  }

  // Plasma - Gotita OUTLINE ÁMBAR (solo contorno)
  if (tipo.includes('plasma')) {
    return {
      Icon: Droplet,
      color: '#F59E0B', // amber-500
      label: 'Plasma',
      bgColor: 'from-amber-50 to-yellow-50',
      borderColor: 'border-amber-200',
      filled: false // OUTLINE
    };
  }

  // Orina - Gotita amarilla clara
  if (tipo.includes('orina')) {
    return {
      Icon: Droplet,
      color: '#FCD34D', // yellow-300
      label: 'Orina',
      bgColor: 'from-yellow-50 to-amber-50',
      borderColor: 'border-yellow-200'
    };
  }

  // Heces - Beaker marrón
  if (tipo.includes('heces')) {
    return {
      Icon: Beaker,
      color: '#92400E', // amber-800
      label: 'Heces',
      bgColor: 'from-amber-50 to-orange-50',
      borderColor: 'border-amber-300'
    };
  }

  // Saliva - Gotita azul claro
  if (tipo.includes('saliva')) {
    return {
      Icon: Droplet,
      color: '#06B6D4', // cyan-500
      label: 'Saliva',
      bgColor: 'from-cyan-50 to-blue-50',
      borderColor: 'border-cyan-200'
    };
  }

  // Líquido Amniótico - Gotita verde agua
  if (tipo.includes('liq') && tipo.includes('anm')) {
    return {
      Icon: Droplet,
      color: '#10B981', // emerald-500
      label: 'Líquido Amniótico',
      bgColor: 'from-emerald-50 to-teal-50',
      borderColor: 'border-emerald-200'
    };
  }

  // Líquido Cefalorraquídeo - Gotita azul claro
  if (tipo.includes('lcr') || tipo.includes('cefalorraqu')) {
    return {
      Icon: Droplet,
      color: '#60A5FA', // blue-400
      label: 'Líquido Cefalorraquídeo',
      bgColor: 'from-blue-50 to-sky-50',
      borderColor: 'border-blue-200'
    };
  }

  // Esputo/Secreciones - Flask
  if (tipo.includes('esputo') || tipo.includes('secrecion')) {
    return {
      Icon: FlaskConical,
      color: '#8B5CF6', // violet-500
      label: 'Esputo/Secreción',
      bgColor: 'from-violet-50 to-purple-50',
      borderColor: 'border-violet-200'
    };
  }

  // Líquido pleural/peritoneal/sinovial - Gotita azul
  if (tipo.includes('liquido') || tipo.includes('líquido')) {
    return {
      Icon: Droplet,
      color: '#3B82F6', // blue-500
      label: 'Líquido corporal',
      bgColor: 'from-blue-50 to-indigo-50',
      borderColor: 'border-blue-200'
    };
  }

  // Default - TestTube genérico gris
  return {
    Icon: TestTube,
    color: '#6B7280', // gray-500
    label: tipoMuestra || 'Muestra no especificada',
    bgColor: 'from-gray-50 to-slate-50',
    borderColor: 'border-gray-200'
  };
};

export default getSampleIcon;
