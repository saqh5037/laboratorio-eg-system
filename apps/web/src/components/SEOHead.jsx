import { useEffect } from 'react';
import { useCompanyInfo } from '../hooks/useCompanyInfo';

/**
 * Componente para inyectar meta tags SEO dinámicos
 * Actualiza el <head> del documento con información de la empresa
 */
const SEOHead = ({
  pageTitle = '',
  pageDescription = '',
  pageKeywords = '',
  pageImage = '',
  pageUrl = ''
}) => {
  const { companyInfo } = useCompanyInfo();

  useEffect(() => {
    // Validación defensiva: no hacer nada si no hay datos
    if (!companyInfo || typeof companyInfo !== 'object') return;

    // Valores por defecto genéricos (NO hardcodeados)
    const defaultName = '';
    const defaultShortName = '';

    // Title
    const title = pageTitle
      ? `${pageTitle} | ${companyInfo.name || defaultName}`
      : companyInfo.seo_title || defaultName;
    document.title = title;

    // Meta description
    const description = pageDescription || companyInfo.seo_description || '';
    updateMetaTag('description', description);

    // Meta keywords
    const keywords = pageKeywords || companyInfo.seo_keywords || '';
    updateMetaTag('keywords', keywords);

    // Author
    updateMetaTag('author', companyInfo.seo_author || defaultName);

    // Theme color
    updateMetaTag('theme-color', companyInfo.theme_color || '#0047CB');

    // Open Graph
    updateMetaTag('og:title', title, 'property');
    updateMetaTag('og:description', description, 'property');
    updateMetaTag('og:image', pageImage || companyInfo.og_image_url || '', 'property');
    updateMetaTag('og:type', companyInfo.og_type || 'website', 'property');
    updateMetaTag('og:locale', companyInfo.og_locale || 'es_VE', 'property');
    updateMetaTag('og:site_name', companyInfo.name || defaultName, 'property');
    if (pageUrl) {
      updateMetaTag('og:url', pageUrl, 'property');
    }

    // Twitter Cards
    updateMetaTag('twitter:card', 'summary_large_image', 'name');
    updateMetaTag('twitter:title', title, 'name');
    updateMetaTag('twitter:description', description, 'name');
    updateMetaTag('twitter:image', pageImage || companyInfo.og_image_url || '', 'name');

    // Apple
    updateMetaTag('apple-mobile-web-app-title', companyInfo.pwa_short_name || companyInfo.short_name || defaultShortName);
    updateMetaTag('apple-mobile-web-app-capable', 'yes');
    updateMetaTag('apple-mobile-web-app-status-bar-style', 'default');

  }, [companyInfo, pageTitle, pageDescription, pageKeywords, pageImage, pageUrl]);

  return null; // Este componente no renderiza nada visible
};

/**
 * Utility para actualizar o crear meta tags
 */
const updateMetaTag = (name, content, attribute = 'name') => {
  if (!content) return;

  let element = document.querySelector(`meta[${attribute}="${name}"]`);

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
};

export default SEOHead;
