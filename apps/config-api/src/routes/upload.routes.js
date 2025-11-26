/**
 * Upload Routes
 * Endpoints genéricos para upload de imágenes de contenido
 */

const express = require('express');
const router = express.Router();
const { upload, ContentImageService } = require('../services/ContentImageService');
const { authenticateAdmin } = require('../middleware/adminAuth');
const logger = require('../utils/logger');
const path = require('path');

// =====================================================
// ADMIN ROUTES (Authentication required)
// =====================================================

/**
 * POST /api/upload/image
 * Upload and optimize a content image
 */
router.post('/image', authenticateAdmin, upload, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No se proporcionó ningún archivo'
      });
    }

    const filePath = req.file.path;
    const filename = req.file.filename;
    const category = req.body.category || 'general';

    logger.info('Procesando upload de imagen:', { filename, category });

    // Validar imagen
    const validation = await ContentImageService.validateImage(filePath);
    if (!validation.valid) {
      // Eliminar archivo si no es válido
      const fs = require('fs').promises;
      try {
        await fs.unlink(filePath);
      } catch (e) {}

      return res.status(400).json({
        success: false,
        error: 'Imagen no válida',
        details: validation.errors
      });
    }

    // Opciones de optimización según categoría
    const optimizationOptions = {
      services: { maxWidth: 600, maxHeight: 400, quality: 85 },
      about: { maxWidth: 800, maxHeight: 600, quality: 85 },
      testimonials: { maxWidth: 400, maxHeight: 400, quality: 85 },
      general: { maxWidth: 1200, maxHeight: 800, quality: 85 }
    };

    const options = optimizationOptions[category] || optimizationOptions.general;

    // Optimizar imagen
    const result = await ContentImageService.optimizeImage(filePath, filename, options);

    // Construir URLs
    const baseUrl = process.env.PUBLIC_URL || `http://localhost:${process.env.PORT || 3105}`;
    const url = `${baseUrl}${ContentImageService.getPublicUrl(result.filename)}`;
    const thumbnailUrl = result.thumbnail
      ? `${baseUrl}${ContentImageService.getPublicUrl(result.thumbnail.filename)}`
      : null;

    res.json({
      success: true,
      data: {
        filename: result.filename,
        url,
        thumbnailUrl,
        size: result.size,
        sizeKB: `${(result.size / 1024).toFixed(2)} KB`,
        originalFormat: result.originalFormat,
        category
      },
      message: 'Imagen subida y optimizada exitosamente'
    });

  } catch (error) {
    logger.error('Error uploading image:', error);
    res.status(500).json({
      success: false,
      error: 'Error al procesar la imagen',
      details: error.message
    });
  }
});

/**
 * GET /api/upload/images
 * List all uploaded images, optionally filtered by category
 */
router.get('/images', authenticateAdmin, async (req, res) => {
  try {
    const { category } = req.query;
    const images = await ContentImageService.listImages(category);

    // Agregar base URL a las imágenes
    const baseUrl = process.env.PUBLIC_URL || `http://localhost:${process.env.PORT || 3105}`;
    const imagesWithUrls = images.map(img => ({
      ...img,
      url: `${baseUrl}${img.url}`,
      thumbnailUrl: `${baseUrl}${img.thumbnailUrl}`
    }));

    res.json({
      success: true,
      data: imagesWithUrls,
      count: imagesWithUrls.length
    });
  } catch (error) {
    logger.error('Error listing images:', error);
    res.status(500).json({
      success: false,
      error: 'Error al listar imágenes'
    });
  }
});

/**
 * DELETE /api/upload/image/:filename
 * Delete an uploaded image
 */
router.delete('/image/:filename', authenticateAdmin, async (req, res) => {
  try {
    const { filename } = req.params;

    const deleted = await ContentImageService.deleteImage(filename);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Imagen no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Imagen eliminada exitosamente'
    });
  } catch (error) {
    logger.error('Error deleting image:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar imagen'
    });
  }
});

/**
 * GET /api/upload/stats
 * Get upload storage statistics
 */
router.get('/stats', authenticateAdmin, async (req, res) => {
  try {
    const stats = await ContentImageService.getStorageStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error getting upload stats:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener estadísticas'
    });
  }
});

module.exports = router;
