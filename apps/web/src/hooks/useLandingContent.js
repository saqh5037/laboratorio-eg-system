import { useState, useEffect, useCallback } from 'react';
import {
  getAllLandingContent,
  getActiveValues,
  getActiveCertifications,
  getActiveTestimonials,
  getActiveContactInfo,
  getActiveContentBlocks,
  getActiveStatistics
} from '../services/landingContentApi';

/**
 * Custom Hook para cargar el contenido de la landing page
 *
 * Características:
 * - Carga todo el contenido de la landing en una sola llamada (optimizado)
 * - Carga individual de secciones (opcional)
 * - Manejo de estados de carga y errores
 * - Refresh manual de datos
 * - Helpers para acceder a datos específicos
 *
 * Uso:
 * ```jsx
 * const { content, loading, error, refresh } = useLandingContent();
 *
 * if (loading) return <Spinner />;
 * if (error) return <ErrorMessage error={error} />;
 *
 * const { values, certifications, testimonials } = content;
 * ```
 *
 * @returns {Object} - Estado y funciones para el contenido de la landing
 */
export function useLandingContent() {
  // ============================================
  // ESTADO
  // ============================================

  // Contenido completo de la landing
  const [content, setContent] = useState({
    values: [],
    certifications: [],
    testimonials: [],
    contactInfo: [],
    contentBlocks: [],
    statistics: []
  });

  // Estados de carga
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Timestamp de última actualización
  const [lastUpdate, setLastUpdate] = useState(null);

  // ============================================
  // FETCH DE DATOS
  // ============================================

  /**
   * Cargar TODO el contenido de la landing en una sola llamada
   * Este es el método optimizado y recomendado
   */
  const fetchAllContent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getAllLandingContent();

      if (response.success && response.data) {
        setContent({
          values: response.data.values || [],
          certifications: response.data.certifications || [],
          testimonials: response.data.testimonials || [],
          contactInfo: response.data.contactInfo || [],
          contentBlocks: response.data.contentBlocks || [],
          statistics: response.data.statistics || []
        });

        setLastUpdate(new Date());
      } else {
        throw new Error('Respuesta inválida del servidor');
      }

      return response.data;
    } catch (err) {
      const errorMsg = `Error cargando contenido de landing: ${err.message}`;
      setError(errorMsg);
      console.error('Error fetching landing content:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cargar solo valores corporativos
   */
  const fetchValues = useCallback(async () => {
    try {
      const response = await getActiveValues();
      if (response.success && response.data) {
        setContent(prev => ({ ...prev, values: response.data }));
        return response.data;
      }
    } catch (err) {
      console.error('Error fetching values:', err);
      return [];
    }
  }, []);

  /**
   * Cargar solo certificaciones
   */
  const fetchCertifications = useCallback(async () => {
    try {
      const response = await getActiveCertifications();
      if (response.success && response.data) {
        setContent(prev => ({ ...prev, certifications: response.data }));
        return response.data;
      }
    } catch (err) {
      console.error('Error fetching certifications:', err);
      return [];
    }
  }, []);

  /**
   * Cargar solo testimonios
   */
  const fetchTestimonials = useCallback(async () => {
    try {
      const response = await getActiveTestimonials();
      if (response.success && response.data) {
        setContent(prev => ({ ...prev, testimonials: response.data }));
        return response.data;
      }
    } catch (err) {
      console.error('Error fetching testimonials:', err);
      return [];
    }
  }, []);

  /**
   * Cargar información de contacto
   * @param {string} type - Filtrar por tipo (opcional): address, phone, email, hours, social, whatsapp, service
   */
  const fetchContactInfo = useCallback(async (type = null) => {
    try {
      const response = await getActiveContactInfo(type);
      if (response.success && response.data) {
        setContent(prev => ({ ...prev, contactInfo: response.data }));
        return response.data;
      }
    } catch (err) {
      console.error('Error fetching contact info:', err);
      return [];
    }
  }, []);

  /**
   * Cargar bloques de contenido
   * @param {string} section - Filtrar por sección (opcional): nosotros-header, historia, valores-header, etc.
   */
  const fetchContentBlocks = useCallback(async (section = null) => {
    try {
      const response = await getActiveContentBlocks(section);
      if (response.success && response.data) {
        setContent(prev => ({ ...prev, contentBlocks: response.data }));
        return response.data;
      }
    } catch (err) {
      console.error('Error fetching content blocks:', err);
      return [];
    }
  }, []);

  /**
   * Cargar estadísticas
   */
  const fetchStatistics = useCallback(async () => {
    try {
      const response = await getActiveStatistics();
      if (response.success && response.data) {
        setContent(prev => ({ ...prev, statistics: response.data }));
        return response.data;
      }
    } catch (err) {
      console.error('Error fetching statistics:', err);
      return [];
    }
  }, []);

  /**
   * Refrescar todo el contenido
   */
  const refresh = useCallback(async () => {
    return await fetchAllContent();
  }, [fetchAllContent]);

  // Cargar datos iniciales al montar el componente
  useEffect(() => {
    fetchAllContent();
  }, [fetchAllContent]);

  // ============================================
  // HELPERS
  // ============================================

  /**
   * Obtener bloques de contenido por sección
   * @param {string} section - Nombre de la sección
   * @returns {Array}
   */
  const getContentBySection = useCallback((section) => {
    return content.contentBlocks.filter(block => block.section === section);
  }, [content.contentBlocks]);

  /**
   * Obtener un bloque de contenido específico por sección y tipo
   * @param {string} section - Nombre de la sección
   * @param {string} blockType - Tipo de bloque (title, subtitle, paragraph, etc.)
   * @returns {Object|null}
   */
  const getContentBlock = useCallback((section, blockType) => {
    return content.contentBlocks.find(
      block => block.section === section && block.block_type === blockType
    ) || null;
  }, [content.contentBlocks]);

  /**
   * Obtener información de contacto por tipo
   * @param {string} type - Tipo de contacto (address, phone, email, hours, social, whatsapp, service)
   * @returns {Array}
   */
  const getContactInfoByType = useCallback((type) => {
    return content.contactInfo.filter(info => info.type === type);
  }, [content.contactInfo]);

  /**
   * Obtener información de contacto por tipo y categoría
   * @param {string} type - Tipo de contacto
   * @param {string} category - Categoría específica
   * @returns {Object|null}
   */
  const getContactInfoByCategory = useCallback((type, category) => {
    return content.contactInfo.find(
      info => info.type === type && info.category === category
    ) || null;
  }, [content.contactInfo]);

  /**
   * Obtener teléfonos
   * @returns {Array}
   */
  const getPhones = useCallback(() => {
    return getContactInfoByType('phone');
  }, [getContactInfoByType]);

  /**
   * Obtener emails
   * @returns {Array}
   */
  const getEmails = useCallback(() => {
    return getContactInfoByType('email');
  }, [getContactInfoByType]);

  /**
   * Obtener dirección
   * @returns {Object|null}
   */
  const getAddress = useCallback(() => {
    const addresses = getContactInfoByType('address');
    return addresses.length > 0 ? addresses[0] : null;
  }, [getContactInfoByType]);

  /**
   * Obtener horarios
   * @returns {Array}
   */
  const getHours = useCallback(() => {
    return getContactInfoByType('hours');
  }, [getContactInfoByType]);

  /**
   * Obtener redes sociales
   * @returns {Array}
   */
  const getSocialMedia = useCallback(() => {
    return getContactInfoByType('social');
  }, [getContactInfoByType]);

  /**
   * Obtener WhatsApp
   * @returns {Object|null}
   */
  const getWhatsApp = useCallback(() => {
    const whatsapp = getContactInfoByType('whatsapp');
    return whatsapp.length > 0 ? whatsapp[0] : null;
  }, [getContactInfoByType]);

  /**
   * Verificar si hay datos cargados
   * @returns {boolean}
   */
  const hasContent = useCallback(() => {
    return (
      content.values.length > 0 ||
      content.certifications.length > 0 ||
      content.testimonials.length > 0 ||
      content.contactInfo.length > 0 ||
      content.contentBlocks.length > 0 ||
      content.statistics.length > 0
    );
  }, [content]);

  /**
   * Limpiar error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ============================================
  // RETURN
  // ============================================

  return {
    // Contenido completo
    content,

    // Acceso directo a secciones
    values: content.values,
    certifications: content.certifications,
    testimonials: content.testimonials,
    contactInfo: content.contactInfo,
    contentBlocks: content.contentBlocks,
    statistics: content.statistics,

    // Estados
    loading,
    error,
    lastUpdate,

    // Funciones de fetch
    refresh,
    fetchAllContent,
    fetchValues,
    fetchCertifications,
    fetchTestimonials,
    fetchContactInfo,
    fetchContentBlocks,
    fetchStatistics,

    // Helpers
    getContentBySection,
    getContentBlock,
    getContactInfoByType,
    getContactInfoByCategory,
    getPhones,
    getEmails,
    getAddress,
    getHours,
    getSocialMedia,
    getWhatsApp,
    hasContent,
    clearError
  };
}

export default useLandingContent;
