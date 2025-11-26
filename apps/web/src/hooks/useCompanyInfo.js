import { useState, useEffect, useCallback } from 'react';
import { config } from '../config/env.js';
import { useLab } from '../contexts/LabContext';

const CONFIG_API_URL = config.VITE_CONFIG_API_URL;

/**
 * Hook para gestionar información de la empresa
 * Proporciona acceso a datos corporativos, contacto, SEO y PWA
 * AHORA ES LAB-AWARE: carga la info del laboratorio activo
 */
export function useCompanyInfo() {
  // Obtener el laboratorio activo del contexto
  const { activeLab } = useLab();

  const [companyInfo, setCompanyInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Cargar información completa de la empresa
   * Pasa el parámetro lab para obtener la info del laboratorio correcto
   */
  const fetchCompanyInfo = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Construir URL con parámetro lab si está disponible
      const url = activeLab
        ? `${CONFIG_API_URL}/api/company?lab=${activeLab}`
        : `${CONFIG_API_URL}/api/company`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Error al cargar información de la empresa');
      }

      const data = await response.json();
      if (data.success) {
        setCompanyInfo(data.data);
      } else {
        throw new Error(data.error || 'Error desconocido');
      }
    } catch (err) {
      console.error('Error fetching company info:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeLab]);

  /**
   * Actualizar información de la empresa (requiere token de admin)
   * @param {Object} updates - Campos a actualizar
   * @param {string} token - JWT token del admin
   */
  const updateCompanyInfo = useCallback(async (updates, token) => {
    try {
      setError(null);

      // Construir URL con parámetro lab si está disponible
      const url = activeLab
        ? `${CONFIG_API_URL}/api/company?lab=${activeLab}`
        : `${CONFIG_API_URL}/api/company`;

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar información');
      }

      const data = await response.json();
      if (data.success) {
        setCompanyInfo(data.data);
        return data.data;
      } else {
        throw new Error(data.error || 'Error desconocido');
      }
    } catch (err) {
      console.error('Error updating company info:', err);
      setError(err.message);
      throw err;
    }
  }, [activeLab]);

  /**
   * Actualizar identidad corporativa
   */
  const updateIdentity = useCallback(async (updates, token) => {
    try {
      const url = activeLab
        ? `${CONFIG_API_URL}/api/company/identity?lab=${activeLab}`
        : `${CONFIG_API_URL}/api/company/identity`;

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Error al actualizar identidad');
      }

      const data = await response.json();
      if (data.success) {
        setCompanyInfo(data.data);
        return data.data;
      }
      throw new Error(data.error);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [activeLab]);

  /**
   * Actualizar información de contacto
   */
  const updateContact = useCallback(async (updates, token) => {
    try {
      const url = activeLab
        ? `${CONFIG_API_URL}/api/company/contact?lab=${activeLab}`
        : `${CONFIG_API_URL}/api/company/contact`;

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Error al actualizar contacto');
      }

      const data = await response.json();
      if (data.success) {
        setCompanyInfo(data.data);
        return data.data;
      }
      throw new Error(data.error);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [activeLab]);

  /**
   * Actualizar redes sociales
   */
  const updateSocial = useCallback(async (updates, token) => {
    try {
      const url = activeLab
        ? `${CONFIG_API_URL}/api/company/social?lab=${activeLab}`
        : `${CONFIG_API_URL}/api/company/social`;

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Error al actualizar redes sociales');
      }

      const data = await response.json();
      if (data.success) {
        setCompanyInfo(data.data);
        return data.data;
      }
      throw new Error(data.error);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [activeLab]);

  /**
   * Actualizar información SEO
   */
  const updateSEO = useCallback(async (updates, token) => {
    try {
      const url = activeLab
        ? `${CONFIG_API_URL}/api/company/seo?lab=${activeLab}`
        : `${CONFIG_API_URL}/api/company/seo`;

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Error al actualizar SEO');
      }

      const data = await response.json();
      if (data.success) {
        setCompanyInfo(data.data);
        return data.data;
      }
      throw new Error(data.error);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [activeLab]);

  /**
   * Actualizar información PWA
   */
  const updatePWA = useCallback(async (updates, token) => {
    try {
      const url = activeLab
        ? `${CONFIG_API_URL}/api/company/pwa?lab=${activeLab}`
        : `${CONFIG_API_URL}/api/company/pwa`;

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Error al actualizar PWA');
      }

      const data = await response.json();
      if (data.success) {
        setCompanyInfo(data.data);
        return data.data;
      }
      throw new Error(data.error);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, [activeLab]);

  /**
   * Obtener años de experiencia
   */
  const getYearsOfExperience = useCallback(() => {
    if (!companyInfo) return 0;
    return companyInfo.years_of_experience || (new Date().getFullYear() - companyInfo.founded_year);
  }, [companyInfo]);

  /**
   * Obtener copyright formateado
   */
  const getFormattedCopyright = useCallback(() => {
    if (!companyInfo) return '';
    const template = companyInfo.copyright_template || '© {year} {company_name}. Todos los derechos reservados.';
    return template
      .replace('{year}', new Date().getFullYear())
      .replace('{company_name}', companyInfo.name);
  }, [companyInfo]);

  /**
   * Obtener dirección completa formateada
   */
  const getFullAddress = useCallback(() => {
    if (!companyInfo) return '';
    const parts = [
      companyInfo.address_street,
      companyInfo.address_area,
      companyInfo.address_city,
      companyInfo.address_state,
      companyInfo.address_zip,
      companyInfo.address_country
    ].filter(Boolean);
    return parts.join(', ');
  }, [companyInfo]);

  /**
   * Obtener todos los teléfonos como array
   */
  const getPhones = useCallback(() => {
    if (!companyInfo) return [];
    const phones = [];
    if (companyInfo.phone_main) phones.push(companyInfo.phone_main);
    if (companyInfo.phone_secondary) phones.push(companyInfo.phone_secondary);
    if (companyInfo.phone_tertiary) phones.push(companyInfo.phone_tertiary);
    return phones;
  }, [companyInfo]);

  /**
   * Obtener redes sociales activas
   */
  const getSocialLinks = useCallback(() => {
    if (!companyInfo) return [];
    const social = [];
    if (companyInfo.social_instagram) {
      social.push({
        name: 'Instagram',
        url: companyInfo.social_instagram,
        handle: companyInfo.social_instagram_handle,
        icon: 'FaInstagram'
      });
    }
    if (companyInfo.social_twitter) {
      social.push({
        name: 'Twitter',
        url: companyInfo.social_twitter,
        handle: companyInfo.social_twitter_handle,
        icon: 'FaTwitter'
      });
    }
    if (companyInfo.social_facebook) {
      social.push({
        name: 'Facebook',
        url: companyInfo.social_facebook,
        icon: 'FaFacebook'
      });
    }
    if (companyInfo.social_youtube) {
      social.push({
        name: 'YouTube',
        url: companyInfo.social_youtube,
        icon: 'FaYoutube'
      });
    }
    if (companyInfo.social_linkedin) {
      social.push({
        name: 'LinkedIn',
        url: companyInfo.social_linkedin,
        icon: 'FaLinkedin'
      });
    }
    return social;
  }, [companyInfo]);

  // Cargar al montar
  useEffect(() => {
    fetchCompanyInfo();
  }, [fetchCompanyInfo]);

  // Actualizar favicon dinámicamente cuando cambia companyInfo
  useEffect(() => {
    if (companyInfo?.favicon_url) {
      const favicon = document.querySelector("link[rel~='icon']");
      if (favicon) {
        // Cache busting: agregar timestamp para forzar recarga
        const faviconUrl = companyInfo.favicon_url.includes('?')
          ? `${companyInfo.favicon_url}&v=${Date.now()}`
          : `${companyInfo.favicon_url}?v=${Date.now()}`;
        favicon.href = faviconUrl;
      }
    }
  }, [companyInfo]);

  return {
    // Estado
    companyInfo,
    loading,
    error,

    // Métodos de actualización
    fetchCompanyInfo,
    updateCompanyInfo,
    updateIdentity,
    updateContact,
    updateSocial,
    updateSEO,
    updatePWA,

    // Utilidades
    getYearsOfExperience,
    getFormattedCopyright,
    getFullAddress,
    getPhones,
    getSocialLinks
  };
}

export default useCompanyInfo;
