import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getAllDimogenContent,
  getDimogenServices,
  getDimogenServiceByKey,
  getDimogenAbout,
  getDimogenFaqs
} from '../services/dimogenApi';
import { fallbackDimogenContent } from '../data/dimogen/fallbackContent';

// Timeout para las llamadas a la API (5 segundos)
const API_TIMEOUT_MS = 5000;

/**
 * Custom Hook para cargar el contenido de la landing page de DIMOGEN
 *
 * Características:
 * - Inicia con datos de fallback para carga instantánea
 * - Intenta actualizar desde la API con timeout
 * - Carga individual de secciones (opcional)
 * - Manejo de estados de carga y errores
 * - Refresh manual de datos
 * - Helpers para acceder a datos específicos
 *
 * Uso:
 * ```jsx
 * const { content, loading, error, refresh } = useDimogenContent();
 *
 * // No necesitas esperar loading - ya hay contenido de fallback
 * const { services, faqs, about, testimonials, contact, statistics, carousel, company } = content;
 * ```
 *
 * @returns {Object} - Estado y funciones para el contenido de DIMOGEN
 */
export function useDimogenContent() {
  // ============================================
  // ESTADO - Inicializado con datos de fallback
  // ============================================

  const [content, setContent] = useState({
    services: fallbackDimogenContent.services || [],
    faqs: fallbackDimogenContent.faqs || [],
    about: fallbackDimogenContent.about || { filosofia: [], valores: [], intro: [] },
    testimonials: fallbackDimogenContent.testimonials || [],
    contact: fallbackDimogenContent.contact || [],
    statistics: fallbackDimogenContent.statistics || [],
    carousel: fallbackDimogenContent.carousel || [],
    company: fallbackDimogenContent.company || null
  });

  // loading=false porque ya tenemos datos de fallback para mostrar
  const [loading, setLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false); // Para indicar actualización en background
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [usingFallback, setUsingFallback] = useState(true);

  // Ref para el AbortController
  const abortControllerRef = useRef(null);

  // ============================================
  // FETCH DE DATOS
  // ============================================

  /**
   * Cargar TODO el contenido de DIMOGEN en una sola llamada
   * - Usa timeout para evitar esperas largas
   * - Si falla, mantiene datos de fallback
   */
  const fetchAllContent = useCallback(async () => {
    // Cancelar petición anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Crear nuevo AbortController
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    try {
      setIsUpdating(true);
      setError(null);

      // Crear promise con timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Timeout: La API tardó demasiado en responder'));
        }, API_TIMEOUT_MS);
      });

      // Race entre la API y el timeout
      const response = await Promise.race([
        getAllDimogenContent(),
        timeoutPromise
      ]);

      // Verificar si fue cancelado
      if (signal.aborted) {
        return null;
      }

      if (response.success && response.data) {
        setContent({
          services: response.data.services || [],
          faqs: response.data.faqs || [],
          about: response.data.about || { filosofia: [], valores: [], intro: [] },
          testimonials: response.data.testimonials || [],
          contact: response.data.contact || [],
          statistics: response.data.statistics || [],
          carousel: response.data.carousel || [],
          company: response.data.company || null
        });

        setLastUpdate(new Date());
        setUsingFallback(false);
        return response.data;
      } else {
        // API respondió pero con error - mantener fallback
        console.warn('API respondió con error, usando datos de fallback:', response.error);
        return null;
      }
    } catch (err) {
      // Timeout o error de red - mantener fallback silenciosamente
      if (err.message.includes('Timeout')) {
        console.warn('API timeout, usando datos de fallback');
      } else if (!signal.aborted) {
        console.warn('Error cargando desde API, usando datos de fallback:', err.message);
      }
      // No mostrar error al usuario, ya tiene datos de fallback
      return null;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  /**
   * Cargar solo servicios
   */
  const fetchServices = useCallback(async () => {
    try {
      const response = await getDimogenServices();
      if (response.success && response.data) {
        setContent(prev => ({ ...prev, services: response.data }));
        return response.data;
      }
    } catch (err) {
      console.error('Error fetching services:', err);
      return [];
    }
  }, []);

  /**
   * Cargar un servicio específico por key
   * @param {string} serviceKey
   */
  const fetchServiceByKey = useCallback(async (serviceKey) => {
    try {
      const response = await getDimogenServiceByKey(serviceKey);
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch (err) {
      console.error('Error fetching service by key:', err);
      return null;
    }
  }, []);

  /**
   * Cargar solo About (filosofía y valores)
   */
  const fetchAbout = useCallback(async () => {
    try {
      const response = await getDimogenAbout();
      if (response.success && response.data) {
        setContent(prev => ({ ...prev, about: response.data }));
        return response.data;
      }
    } catch (err) {
      console.error('Error fetching about:', err);
      return null;
    }
  }, []);

  /**
   * Cargar solo FAQs
   * @param {string} category - Categoría opcional para filtrar
   */
  const fetchFaqs = useCallback(async (category = null) => {
    try {
      const response = await getDimogenFaqs(category);
      if (response.success && response.data) {
        setContent(prev => ({ ...prev, faqs: response.data }));
        return response.data;
      }
    } catch (err) {
      console.error('Error fetching FAQs:', err);
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
   * Obtener un servicio específico por key desde el estado cargado
   * @param {string} serviceKey
   * @returns {Object|null}
   */
  const getServiceByKey = useCallback((serviceKey) => {
    return content.services.find(s => s.service_key === serviceKey) || null;
  }, [content.services]);

  /**
   * Obtener FAQs por categoría
   * @param {string} category
   * @returns {Array}
   */
  const getFaqsByCategory = useCallback((category) => {
    return content.faqs.filter(faq => faq.category === category);
  }, [content.faqs]);

  /**
   * Obtener categorías únicas de FAQs
   * @returns {Array<string>}
   */
  const getFaqCategories = useCallback(() => {
    const categories = [...new Set(content.faqs.map(faq => faq.category))];
    return categories.sort();
  }, [content.faqs]);

  /**
   * Obtener items de About por tipo de sección
   * @param {string} sectionType - 'filosofia', 'valores', o 'intro'
   * @returns {Array}
   */
  const getAboutBySection = useCallback((sectionType) => {
    return content.about[sectionType] || [];
  }, [content.about]);

  /**
   * Obtener información de contacto por tipo
   * @param {string} type - 'address', 'phone', 'email', 'hours', 'social', 'whatsapp'
   * @returns {Array}
   */
  const getContactByType = useCallback((type) => {
    return content.contact.filter(c => c.type === type);
  }, [content.contact]);

  /**
   * Obtener teléfonos
   * @returns {Array}
   */
  const getPhones = useCallback(() => {
    return getContactByType('phone');
  }, [getContactByType]);

  /**
   * Obtener emails
   * @returns {Array}
   */
  const getEmails = useCallback(() => {
    return getContactByType('email');
  }, [getContactByType]);

  /**
   * Obtener dirección principal
   * @returns {Object|null}
   */
  const getAddress = useCallback(() => {
    const addresses = getContactByType('address');
    return addresses.length > 0 ? addresses[0] : null;
  }, [getContactByType]);

  /**
   * Obtener horarios
   * @returns {Array}
   */
  const getHours = useCallback(() => {
    return getContactByType('hours');
  }, [getContactByType]);

  /**
   * Obtener redes sociales
   * @returns {Array}
   */
  const getSocialMedia = useCallback(() => {
    return getContactByType('social');
  }, [getContactByType]);

  /**
   * Obtener WhatsApp
   * @returns {Object|null}
   */
  const getWhatsApp = useCallback(() => {
    const whatsapp = getContactByType('whatsapp');
    return whatsapp.length > 0 ? whatsapp[0] : null;
  }, [getContactByType]);

  /**
   * Verificar si hay datos cargados
   * @returns {boolean}
   */
  const hasContent = useCallback(() => {
    return (
      content.services.length > 0 ||
      content.faqs.length > 0 ||
      content.testimonials.length > 0 ||
      content.contact.length > 0 ||
      content.carousel.length > 0
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
    services: content.services,
    faqs: content.faqs,
    about: content.about,
    testimonials: content.testimonials,
    contact: content.contact,
    statistics: content.statistics,
    carousel: content.carousel,
    company: content.company,

    // Estados
    loading,
    isUpdating,      // True cuando está actualizando desde API
    usingFallback,   // True si está usando datos estáticos
    error,
    lastUpdate,

    // Funciones de fetch
    refresh,
    fetchAllContent,
    fetchServices,
    fetchServiceByKey,
    fetchAbout,
    fetchFaqs,

    // Helpers
    getServiceByKey,
    getFaqsByCategory,
    getFaqCategories,
    getAboutBySection,
    getContactByType,
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

export default useDimogenContent;
