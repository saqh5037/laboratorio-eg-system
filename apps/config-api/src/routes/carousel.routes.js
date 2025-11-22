const express = require('express');
const router = express.Router();
const CarouselService = require('../services/CarouselService');
const { upload, FileUploadService } = require('../services/FileUploadService');
const { authenticateAdmin } = require('../middleware/adminAuth');
const logger = require('../utils/logger');

/**
 * GET /api/carousel
 * Obtener slides activos (público) o todos (admin)
 *
 * Query params:
 * - include_inactive: true (solo admin)
 */
router.get('/', async (req, res) => {
  try {
    const { include_inactive } = req.query;

    // Si solicita inactivos, verificar que sea admin
    if (include_inactive === 'true') {
      // Verificar token admin (opcional)
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({
          success: false,
          error: 'Se requiere autenticación para ver slides inactivos'
        });
      }

      // Aquí puedes agregar validación de token JWT
      const slides = await CarouselService.getAllSlides();

      return res.json({
        success: true,
        data: slides,
        total: slides.length
      });
    }

    // Obtener solo slides activos (público)
    const slides = await CarouselService.getActiveSlides();

    res.json({
      success: true,
      data: slides,
      total: slides.length
    });
  } catch (error) {
    logger.error('Error en GET /api/carousel:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener slides del carrusel'
    });
  }
});

/**
 * GET /api/carousel/stats
 * Obtener estadísticas de slides (admin)
 */
router.get('/stats', authenticateAdmin, async (req, res) => {
  try {
    const stats = await CarouselService.getStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error en GET /api/carousel/stats:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener estadísticas'
    });
  }
});

/**
 * GET /api/carousel/:id
 * Obtener un slide específico por ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const slide = await CarouselService.getSlideById(parseInt(id));

    if (!slide) {
      return res.status(404).json({
        success: false,
        error: `Slide con ID ${id} no encontrado`
      });
    }

    res.json({
      success: true,
      data: slide
    });
  } catch (error) {
    logger.error(`Error en GET /api/carousel/${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener slide'
    });
  }
});

/**
 * POST /api/carousel
 * Crear nuevo slide (requiere autenticación admin)
 *
 * Body:
 * {
 *   title: string (requerido),
 *   subtitle: string,
 *   description: string,
 *   image_url: string (requerido),
 *   image_alt: string,
 *   image_mobile_url: string,
 *   cta1_text: string,
 *   cta1_link: string,
 *   cta2_text: string,
 *   cta2_link: string,
 *   badge_text: string,
 *   badge_color: string,
 *   is_active: boolean,
 *   start_date: timestamp,
 *   end_date: timestamp
 * }
 */
router.post('/', authenticateAdmin, async (req, res) => {
  try {
    const slideData = {
      ...req.body,
      created_by: req.user?.username || 'admin'
    };

    const newSlide = await CarouselService.createSlide(slideData);

    logger.info(`Slide creado por ${slideData.created_by}:`, {
      id: newSlide.id,
      title: newSlide.title
    });

    res.status(201).json({
      success: true,
      message: 'Slide creado exitosamente',
      data: newSlide
    });
  } catch (error) {
    logger.error('Error en POST /api/carousel:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Error al crear slide'
    });
  }
});

/**
 * PUT /api/carousel/:id
 * Actualizar slide existente (requiere autenticación admin)
 */
router.put('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const slideData = {
      ...req.body,
      updated_by: req.user?.username || 'admin'
    };

    const updatedSlide = await CarouselService.updateSlide(parseInt(id), slideData);

    logger.info(`Slide ${id} actualizado por ${slideData.updated_by}`);

    res.json({
      success: true,
      message: 'Slide actualizado exitosamente',
      data: updatedSlide
    });
  } catch (error) {
    logger.error(`Error en PUT /api/carousel/${req.params.id}:`, error);
    res.status(400).json({
      success: false,
      error: error.message || 'Error al actualizar slide'
    });
  }
});

/**
 * DELETE /api/carousel/:id
 * Eliminar slide (requiere autenticación admin)
 */
router.delete('/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedSlide = await CarouselService.deleteSlide(parseInt(id));

    logger.info(`Slide ${id} eliminado por ${req.user?.username || 'admin'}`);

    res.json({
      success: true,
      message: 'Slide eliminado exitosamente',
      data: deletedSlide
    });
  } catch (error) {
    logger.error(`Error en DELETE /api/carousel/${req.params.id}:`, error);
    res.status(400).json({
      success: false,
      error: error.message || 'Error al eliminar slide'
    });
  }
});

/**
 * POST /api/carousel/:id/toggle
 * Activar/desactivar slide (requiere autenticación admin)
 *
 * Body:
 * {
 *   is_active: boolean
 * }
 */
router.post('/:id/toggle', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (typeof is_active !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'El campo is_active debe ser un booleano'
      });
    }

    const updatedSlide = await CarouselService.toggleActive(parseInt(id), is_active);

    logger.info(`Slide ${id} ${is_active ? 'activado' : 'desactivado'} por ${req.user?.username || 'admin'}`);

    res.json({
      success: true,
      message: `Slide ${is_active ? 'activado' : 'desactivado'} exitosamente`,
      data: updatedSlide
    });
  } catch (error) {
    logger.error(`Error en POST /api/carousel/${req.params.id}/toggle:`, error);
    res.status(400).json({
      success: false,
      error: error.message || 'Error al cambiar estado del slide'
    });
  }
});

/**
 * POST /api/carousel/:id/reorder
 * Cambiar orden del slide (requiere autenticación admin)
 *
 * Body:
 * {
 *   new_position: number
 * }
 */
router.post('/:id/reorder', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { new_position } = req.body;

    if (typeof new_position !== 'number' || new_position < 0) {
      return res.status(400).json({
        success: false,
        error: 'La nueva posición debe ser un número mayor o igual a 0'
      });
    }

    const updatedSlide = await CarouselService.reorderSlide(parseInt(id), new_position);

    logger.info(`Slide ${id} reordenado a posición ${new_position} por ${req.user?.username || 'admin'}`);

    res.json({
      success: true,
      message: 'Slide reordenado exitosamente',
      data: updatedSlide
    });
  } catch (error) {
    logger.error(`Error en POST /api/carousel/${req.params.id}/reorder:`, error);
    res.status(400).json({
      success: false,
      error: error.message || 'Error al reordenar slide'
    });
  }
});

/**
 * POST /api/carousel/upload
 * Subir y optimizar imagen para carrusel (requiere autenticación admin)
 *
 * FormData:
 * - file: File (imagen JPG, PNG o WebP, máx 5MB)
 *
 * Returns:
 * {
 *   desktop_url: string,
 *   mobile_url: string,
 *   desktop_filename: string,
 *   mobile_filename: string
 * }
 */
router.post('/upload', authenticateAdmin, upload, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No se proporcionó ningún archivo'
      });
    }

    const { path: filePath, filename } = req.file;

    logger.info('Archivo subido:', {
      filename,
      size: `${(req.file.size / 1024).toFixed(2)} KB`,
      mimetype: req.file.mimetype
    });

    // Validar imagen
    const validation = await FileUploadService.validateImage(filePath);
    if (!validation.valid) {
      // Eliminar archivo si la validación falla
      await FileUploadService.deleteFile(filename);

      return res.status(400).json({
        success: false,
        error: 'Imagen inválida',
        details: validation.errors
      });
    }

    // Optimizar imagen (genera versiones desktop y móvil)
    const optimized = await FileUploadService.optimizeImage(filePath, filename);

    const response = {
      success: true,
      message: 'Imagen subida y optimizada exitosamente',
      data: {
        desktop_url: FileUploadService.getPublicUrl(optimized.desktop),
        mobile_url: FileUploadService.getPublicUrl(optimized.mobile),
        desktop_filename: optimized.desktop,
        mobile_filename: optimized.mobile,
        desktop_size: `${(optimized.desktopSize / 1024).toFixed(2)} KB`,
        mobile_size: `${(optimized.mobileSize / 1024).toFixed(2)} KB`
      }
    };

    logger.info('Imagen optimizada exitosamente:', response.data);

    res.json(response);
  } catch (error) {
    logger.error('Error en POST /api/carousel/upload:', error);

    // Intentar limpiar archivo subido en caso de error
    if (req.file) {
      await FileUploadService.deleteFile(req.file.filename).catch(() => {});
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Error al subir imagen'
    });
  }
});

/**
 * GET /api/carousel/uploads/list
 * Listar archivos subidos (admin)
 */
router.get('/uploads/list', authenticateAdmin, async (req, res) => {
  try {
    const files = await FileUploadService.listFiles();

    res.json({
      success: true,
      data: files,
      total: files.length
    });
  } catch (error) {
    logger.error('Error en GET /api/carousel/uploads/list:', error);
    res.status(500).json({
      success: false,
      error: 'Error al listar archivos'
    });
  }
});

/**
 * GET /api/carousel/uploads/stats
 * Obtener estadísticas de almacenamiento (admin)
 */
router.get('/uploads/stats', authenticateAdmin, async (req, res) => {
  try {
    const stats = await FileUploadService.getStorageStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error en GET /api/carousel/uploads/stats:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener estadísticas de almacenamiento'
    });
  }
});

module.exports = router;
