import { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = import.meta.env.VITE_CONFIG_API_URL || 'http://localhost:3005';

/**
 * Custom Hook para gestionar las secciones de la landing page
 * Consume el endpoint /api/landing/sections
 *
 * @returns {Object} Estado y funciones para gestionar secciones
 */
export function useLandingSections() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch sections desde la API
   */
  const fetchSections = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/landing/sections`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setSections(data.data || []);
      } else {
        throw new Error(data.error || 'Error al cargar secciones');
      }
    } catch (err) {
      const errorMsg = err.message || 'Error al cargar secciones';
      setError(errorMsg);
      console.error('Error fetching landing sections:', err);

      // En caso de error, usar secciones vacías
      setSections([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener una sección específica por su key
   * @param {string} sectionKey - Key de la sección
   * @returns {Object|null} Sección encontrada o null
   */
  const getSectionByKey = useCallback((sectionKey) => {
    return sections.find(section => section.section_key === sectionKey) || null;
  }, [sections]);

  /**
   * Filtrar secciones por tipo
   * @param {string} sectionType - Tipo de sección
   * @returns {Array} Secciones del tipo especificado
   */
  const getSectionsByType = useCallback((sectionType) => {
    return sections.filter(section => section.section_type === sectionType);
  }, [sections]);

  /**
   * Refrescar secciones manualmente
   */
  const refresh = useCallback(() => {
    fetchSections();
  }, [fetchSections]);

  // Cargar secciones al montar el componente
  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  return {
    sections,
    loading,
    error,
    getSectionByKey,
    getSectionsByType,
    refresh
  };
}
