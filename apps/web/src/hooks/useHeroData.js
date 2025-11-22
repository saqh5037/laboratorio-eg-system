import { useState, useEffect, useCallback } from 'react';
import { useCompanyInfo } from './useCompanyInfo';
import { useLandingContent } from './useLandingContent';

const CONFIG_API_URL = import.meta.env.VITE_CONFIG_API_URL || 'http://localhost:3005';

/**
 * Hook para obtener datos dinámicos del Hero section
 * Combina información de company_info y landing_statistics
 */
export function useHeroData() {
  const { companyInfo, loading: companyLoading } = useCompanyInfo();
  const { fetchStatistics } = useLandingContent();
  const [statistics, setStatistics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStatistics = useCallback(async () => {
    try {
      setLoading(true);
      const stats = await fetchStatistics();
      setStatistics(stats || []);
    } catch (err) {
      console.error('Error loading hero statistics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchStatistics]);

  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  /**
   * Obtener el título principal del hero basado en años de experiencia
   */
  const getHeroTitle = useCallback(() => {
    if (!companyInfo) return 'Tu laboratorio de confianza';
    const years = companyInfo.years_of_experience || 43;
    return `${years} años de compromiso con tu salud`;
  }, [companyInfo]);

  /**
   * Obtener subtítulo/slogan
   */
  const getHeroSubtitle = useCallback(() => {
    if (!companyInfo) return 'Análisis clínicos de confianza';
    return companyInfo.slogan || '#PorLaSaludDelPaciente';
  }, [companyInfo]);

  /**
   * Obtener estadísticas formateadas para el hero
   */
  const getHeroStats = useCallback(() => {
    if (statistics.length > 0) {
      return statistics.map(stat => ({
        label: stat.label,
        value: stat.value,
        description: stat.description,
        icon: stat.icon_name
      }));
    }

    // Fallback con datos de companyInfo
    if (!companyInfo) return [];

    return [
      {
        label: 'Experiencia',
        value: `${companyInfo.years_of_experience || 43}`,
        description: 'años de excelencia',
        icon: 'FaAward'
      },
      {
        label: 'Estudios',
        value: '200+',
        description: 'estudios disponibles',
        icon: 'FaFlask'
      },
      {
        label: 'Rapidez',
        value: '24h',
        description: 'resultados rápidos',
        icon: 'FaClock'
      }
    ];
  }, [statistics, companyInfo]);

  /**
   * Obtener CTAs del hero
   */
  const getHeroCTAs = useCallback(() => {
    return [
      {
        text: 'Ver Estudios',
        url: '/estudios',
        primary: true,
        icon: 'FaFlask'
      },
      {
        text: 'Consultar Resultados',
        url: '/resultados',
        primary: false,
        icon: 'FaChartBar'
      }
    ];
  }, []);

  /**
   * Obtener RIF formateado
   */
  const getRIFDisplay = useCallback(() => {
    if (!companyInfo) return '';
    return `RIF ${companyInfo.rif} · ${companyInfo.years_of_experience} años de experiencia`;
  }, [companyInfo]);

  return {
    // Estado
    loading: loading || companyLoading,
    error,

    // Datos
    companyInfo,
    statistics,

    // Métodos
    getHeroTitle,
    getHeroSubtitle,
    getHeroStats,
    getHeroCTAs,
    getRIFDisplay,
    loadStatistics
  };
}

export default useHeroData;
