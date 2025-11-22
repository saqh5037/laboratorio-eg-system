const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const ThemeService = require('../services/ThemeService');
const { authenticateAdmin } = require('../middleware/adminAuth');
const logger = require('../utils/logger');

// ========================================
// MULTER CONFIGURATION FOR LOGO UPLOADS
// ========================================

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/logos');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `logo-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/svg+xml'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo JPG, PNG y SVG.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB máximo
  }
});

/**
 * GET /api/theme
 * Obtener configuración del tema actual (público)
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     color_primary: '#7B68A6',
 *     color_secondary: '#DDB5D5',
 *     font_family_primary: 'DIN Pro',
 *     logo_path: '/Logo.png',
 *     ...
 *   }
 * }
 */
router.get('/', async (req, res) => {
  try {
    const theme = await ThemeService.getTheme();

    res.json({
      success: true,
      data: theme
    });
  } catch (error) {
    logger.error('Error en GET /api/theme:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener configuración del tema'
    });
  }
});

/**
 * GET /api/theme/colors
 * Obtener solo la paleta de colores (público)
 * Útil para aplicaciones que solo necesitan los colores
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     primary: '#7B68A6',
 *     secondary: '#DDB5D5',
 *     text: { primary: '#231F20', secondary: '#8B8C8E' },
 *     ...
 *   }
 * }
 */
router.get('/colors', async (req, res) => {
  try {
    const colors = await ThemeService.getColorPalette();

    res.json({
      success: true,
      data: colors
    });
  } catch (error) {
    logger.error('Error en GET /api/theme/colors:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener paleta de colores'
    });
  }
});

/**
 * PUT /api/theme
 * Actualizar configuración del tema (requiere autenticación admin)
 *
 * Body:
 * {
 *   color_primary: '#7B68A6',
 *   color_secondary: '#DDB5D5',
 *   font_family_primary: 'DIN Pro',
 *   logo_path: '/Logo.png',
 *   ...
 * }
 *
 * Response:
 * {
 *   success: true,
 *   message: 'Tema actualizado exitosamente',
 *   data: { ... }
 * }
 */
router.put('/', authenticateAdmin, async (req, res) => {
  try {
    const themeData = req.body;

    if (!themeData || Object.keys(themeData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No se proporcionaron datos para actualizar'
      });
    }

    const updatedTheme = await ThemeService.updateTheme(themeData);

    logger.info(`Tema actualizado por ${req.user?.username || 'admin'}:`, {
      fields: Object.keys(themeData)
    });

    res.json({
      success: true,
      message: 'Tema actualizado exitosamente',
      data: updatedTheme
    });
  } catch (error) {
    logger.error('Error en PUT /api/theme:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Error al actualizar tema'
    });
  }
});

/**
 * POST /api/theme/reset
 * Resetear tema a valores por defecto de Lab EG (requiere autenticación admin)
 *
 * Response:
 * {
 *   success: true,
 *   message: 'Tema reseteado a valores por defecto',
 *   data: { ... }
 * }
 */
router.post('/reset', authenticateAdmin, async (req, res) => {
  try {
    const defaultTheme = await ThemeService.resetToDefault();

    logger.info(`Tema reseteado a valores por defecto por ${req.user?.username || 'admin'}`);

    res.json({
      success: true,
      message: 'Tema reseteado a valores por defecto de Lab EG',
      data: defaultTheme
    });
  } catch (error) {
    logger.error('Error en POST /api/theme/reset:', error);
    res.status(500).json({
      success: false,
      error: 'Error al resetear tema'
    });
  }
});

/**
 * PATCH /api/theme/colors
 * Actualizar solo colores (requiere autenticación admin)
 * Endpoint simplificado para cambios rápidos de colores
 *
 * Body:
 * {
 *   primary: '#7B68A6',
 *   secondary: '#DDB5D5',
 *   accent: '#8B8C8E'
 * }
 *
 * Response:
 * {
 *   success: true,
 *   message: 'Colores actualizados exitosamente',
 *   data: { ... }
 * }
 */
router.patch('/colors', authenticateAdmin, async (req, res) => {
  try {
    const { primary, secondary, accent } = req.body;

    const colorUpdates = {};
    if (primary) colorUpdates.color_primary = primary;
    if (secondary) colorUpdates.color_secondary = secondary;
    if (accent) colorUpdates.color_accent = accent;

    if (Object.keys(colorUpdates).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No se proporcionaron colores para actualizar'
      });
    }

    const updatedTheme = await ThemeService.updateTheme(colorUpdates);

    logger.info(`Colores actualizados por ${req.user?.username || 'admin'}:`, colorUpdates);

    res.json({
      success: true,
      message: 'Colores actualizados exitosamente',
      data: updatedTheme
    });
  } catch (error) {
    logger.error('Error en PATCH /api/theme/colors:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Error al actualizar colores'
    });
  }
});

/**
 * GET /api/theme/preview
 * Generar preview del tema con gradientes y sombras calculadas
 * Útil para mostrar cómo se verá el tema en el frontend
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     colors: { ... },
 *     gradients: {
 *       primaryGradient: 'linear-gradient(...)',
 *       ...
 *     },
 *     shadows: {
 *       sm: '0 1px 2px 0 rgba(...)',
 *       ...
 *     }
 *   }
 * }
 */
router.get('/preview', async (req, res) => {
  try {
    const theme = await ThemeService.getTheme();
    const colors = await ThemeService.getColorPalette();

    // Generar gradientes basados en colores primarios
    const gradients = {
      primaryGradient: `linear-gradient(135deg, ${theme.color_primary} 0%, ${theme.color_primary}CC 100%)`,
      secondaryGradient: `linear-gradient(135deg, ${theme.color_secondary} 0%, ${theme.color_secondary}CC 100%)`,
      heroGradient: `linear-gradient(135deg, ${theme.color_primary} 0%, ${theme.color_secondary} 100%)`
    };

    // Generar sombras basadas en color primario y shadow_intensity
    const primaryRgb = hexToRgb(theme.color_primary);
    const intensity = theme.shadow_intensity / 10;

    const shadows = {
      sm: `0 1px 2px 0 rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, ${0.05 * intensity})`,
      md: `0 4px 6px -1px rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, ${0.1 * intensity})`,
      lg: `0 10px 15px -3px rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, ${0.2 * intensity})`,
      xl: `0 20px 25px -5px rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, ${0.3 * intensity})`
    };

    res.json({
      success: true,
      data: {
        theme,
        colors,
        gradients,
        shadows,
        calculated: {
          primaryRgb,
          shadowIntensity: intensity
        }
      }
    });
  } catch (error) {
    logger.error('Error en GET /api/theme/preview:', error);
    res.status(500).json({
      success: false,
      error: 'Error al generar preview del tema'
    });
  }
});

/**
 * GET /api/theme/templates
 * Obtener templates predefinidos disponibles (público)
 *
 * Response:
 * {
 *   success: true,
 *   data: [
 *     {
 *       id: 'lab-eg',
 *       name: 'Lab EG Original',
 *       description: 'Tema oficial con colores Pantone corporativos',
 *       preview: { primary: '#7B68A6', secondary: '#DDB5D5', ... }
 *     },
 *     ...
 *   ]
 * }
 */
router.get('/templates', async (req, res) => {
  try {
    const templates = await ThemeService.getTemplates();

    // Solo enviar información de preview, no el tema completo
    const templatesPreview = templates.map(t => ({
      id: t.id,
      name: t.name,
      description: t.description,
      category: t.category,
      preview: t.preview
    }));

    res.json({
      success: true,
      data: templatesPreview
    });
  } catch (error) {
    logger.error('Error en GET /api/theme/templates:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener templates'
    });
  }
});

/**
 * POST /api/theme/apply-template/:templateId
 * Aplicar un template predefinido (requiere autenticación admin)
 *
 * Params:
 * - templateId: ID del template (lab-eg, blue-corporate, green-health, orange-modern)
 *
 * Response:
 * {
 *   success: true,
 *   message: 'Template aplicado exitosamente',
 *   data: { ... }
 * }
 */
router.post('/apply-template/:templateId', authenticateAdmin, async (req, res) => {
  try {
    const { templateId } = req.params;

    if (!templateId) {
      return res.status(400).json({
        success: false,
        error: 'Template ID es requerido'
      });
    }

    const updatedTheme = await ThemeService.applyTemplate(templateId);

    logger.info(`Template '${templateId}' aplicado por ${req.user?.username || 'admin'}`);

    res.json({
      success: true,
      message: `Template '${templateId}' aplicado exitosamente`,
      data: updatedTheme
    });
  } catch (error) {
    logger.error('Error en POST /api/theme/apply-template:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Error al aplicar template'
    });
  }
});

/**
 * POST /api/theme/upload-logo
 * Subir logo del laboratorio (requiere autenticación admin)
 *
 * Form Data:
 * - logo: archivo (JPG, PNG, SVG, máx 2MB)
 * - type: 'main' | 'icon' | 'favicon' (opcional, default: 'main')
 *
 * Response:
 * {
 *   success: true,
 *   message: 'Logo subido exitosamente',
 *   data: {
 *     logo_url: '/uploads/logos/logo-123456789.png',
 *     logo_filename: 'logo-123456789.png'
 *   }
 * }
 */
router.post('/upload-logo', authenticateAdmin, upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No se proporcionó archivo de logo'
      });
    }

    const logoType = req.body.type || 'main'; // main | icon | favicon
    const logoUrl = `/uploads/logos/${req.file.filename}`;

    // Actualizar el path del logo en la base de datos
    const updateData = {};
    if (logoType === 'main') {
      updateData.logo_path = logoUrl;
    } else if (logoType === 'icon') {
      updateData.logo_icon_path = logoUrl;
    } else if (logoType === 'favicon') {
      updateData.favicon_path = logoUrl;
    }

    await ThemeService.updateTheme(updateData);

    logger.info(`Logo ${logoType} subido por ${req.user?.username || 'admin'}:`, {
      filename: req.file.filename,
      size: req.file.size,
      type: logoType
    });

    res.json({
      success: true,
      message: 'Logo subido exitosamente',
      data: {
        logo_url: logoUrl,
        logo_filename: req.file.filename,
        logo_type: logoType
      }
    });
  } catch (error) {
    logger.error('Error en POST /api/theme/upload-logo:', error);

    // Limpiar archivo si hubo error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        logger.error('Error al eliminar archivo:', unlinkError);
      }
    }

    res.status(400).json({
      success: false,
      error: error.message || 'Error al subir logo'
    });
  }
});

/**
 * Helper: Convertir hex a RGB
 * @param {string} hex - Color en formato hexadecimal (#RRGGBB)
 * @returns {Object} { r, g, b }
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

module.exports = router;
