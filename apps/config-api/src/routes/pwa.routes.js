const express = require('express');
const router = express.Router();
const CompanyService = require('../services/CompanyService');
const ThemeService = require('../services/ThemeService');
const logger = require('../utils/logger');

/**
 * GET /api/pwa/manifest
 * Genera manifest.json dinámico para PWA
 */
router.get('/manifest', async (req, res) => {
  try {
    const companyInfo = await CompanyService.getCompanyInfo();
    const theme = await ThemeService.getTheme();

    const manifest = {
      name: companyInfo.pwa_name || companyInfo.name,
      short_name: companyInfo.pwa_short_name || companyInfo.short_name,
      description: companyInfo.pwa_description || companyInfo.slogan,
      start_url: '/',
      display: 'standalone',
      background_color: theme.color_background || '#FFFFFF',
      theme_color: theme.color_primary || '#7B68A6',
      orientation: 'portrait-primary',
      scope: '/',
      lang: 'es',
      dir: 'ltr',
      categories: ['medical', 'health', 'business'],

      icons: [
        {
          src: '/icons/dimogen/icon-72x72.png',
          sizes: '72x72',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/icons/dimogen/icon-96x96.png',
          sizes: '96x96',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/icons/dimogen/icon-128x128.png',
          sizes: '128x128',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/icons/dimogen/icon-144x144.png',
          sizes: '144x144',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/icons/dimogen/icon-152x152.png',
          sizes: '152x152',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/icons/dimogen/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any maskable'
        },
        {
          src: '/icons/dimogen/icon-384x384.png',
          sizes: '384x384',
          type: 'image/png',
          purpose: 'any'
        },
        {
          src: '/icons/dimogen/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable'
        }
      ],

      shortcuts: [
        {
          name: 'Estudios',
          short_name: 'Estudios',
          description: 'Ver directorio de estudios',
          url: '/estudios',
          icons: [{ src: '/icons/dimogen/icon-192x192.png', sizes: '192x192' }]
        },
        {
          name: 'Resultados',
          short_name: 'Resultados',
          description: 'Consultar resultados',
          url: '/resultados',
          icons: [{ src: '/icons/dimogen/icon-192x192.png', sizes: '192x192' }]
        }
      ],

      prefer_related_applications: false,

      // Metadata adicional
      serviceworker: {
        src: '/service-worker.js',
        scope: '/',
        update_via_cache: 'none'
      },

      // Protocol handlers
      protocol_handlers: [
        {
          protocol: 'web+labeg',
          url: '/%s'
        }
      ],

      // Share target
      share_target: {
        action: '/share',
        method: 'GET',
        params: {
          title: 'title',
          text: 'text',
          url: 'url'
        }
      }
    };

    // Set proper headers for manifest
    res.setHeader('Content-Type', 'application/manifest+json');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hora cache
    res.json(manifest);
  } catch (error) {
    logger.error('Error generando manifest:', error);
    res.status(500).json({
      error: 'Error al generar manifest'
    });
  }
});

/**
 * GET /api/pwa/browserconfig
 * Genera browserconfig.xml para Windows tiles
 */
router.get('/browserconfig', async (req, res) => {
  try {
    const theme = await ThemeService.getTheme();
    const tileColor = theme.color_primary || '#7B68A6';

    const browserconfig = `<?xml version="1.0" encoding="utf-8"?>
<browserconfig>
  <msapplication>
    <tile>
      <square150x150logo src="/LogoEG.png"/>
      <TileColor>${tileColor}</TileColor>
    </tile>
  </msapplication>
</browserconfig>`;

    res.setHeader('Content-Type', 'application/xml');
    res.send(browserconfig);
  } catch (error) {
    logger.error('Error generando browserconfig:', error);
    res.status(500).send('Error');
  }
});

/**
 * GET /api/pwa/meta-tags
 * Genera meta tags HTML para insertar dinámicamente
 */
router.get('/meta-tags', async (req, res) => {
  try {
    const companyInfo = await CompanyService.getCompanyInfo();
    const theme = await ThemeService.getTheme();

    const metaTags = {
      title: companyInfo.seo_title,
      description: companyInfo.seo_description,
      keywords: companyInfo.seo_keywords,
      author: companyInfo.seo_author,
      theme_color: theme.color_primary,
      og: {
        title: companyInfo.seo_title,
        description: companyInfo.seo_description,
        image: companyInfo.og_image_url,
        type: companyInfo.og_type,
        locale: companyInfo.og_locale,
        site_name: companyInfo.name
      },
      twitter: {
        card: 'summary_large_image',
        title: companyInfo.seo_title,
        description: companyInfo.seo_description,
        image: companyInfo.og_image_url
      },
      apple: {
        mobile_web_app_title: companyInfo.pwa_short_name,
        mobile_web_app_capable: 'yes',
        mobile_web_app_status_bar_style: 'default'
      }
    };

    res.json({
      success: true,
      data: metaTags
    });
  } catch (error) {
    logger.error('Error generando meta tags:', error);
    res.status(500).json({
      success: false,
      error: 'Error al generar meta tags'
    });
  }
});

module.exports = router;
