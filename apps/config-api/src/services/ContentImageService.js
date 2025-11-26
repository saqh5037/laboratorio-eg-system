/**
 * ContentImageService
 * Servicio genérico para manejar upload y optimización de imágenes de contenido
 * (servicios, testimonials, about, etc.)
 */

const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const logger = require('../utils/logger');

// Configuración de almacenamiento
const UPLOAD_DIR = path.join(__dirname, '../../uploads/content');

// Asegurar que el directorio existe
async function ensureUploadDir() {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    logger.info('Directorio de content images verificado:', UPLOAD_DIR);
  } catch (error) {
    logger.error('Error creando directorio de content images:', error);
    throw error;
  }
}

// Ejecutar al cargar el módulo
ensureUploadDir();

// Configuración de multer para almacenamiento
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // category puede ser: services, about, testimonials, general
    const category = req.body.category || 'general';
    const timestamp = Date.now();
    const uniqueSuffix = Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = `${category}-${timestamp}-${uniqueSuffix}${ext}`;
    cb(null, filename);
  }
});

// Filtro de tipos de archivo permitidos
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes JPG, PNG o WebP'), false);
  }
};

// Configuración de multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB máximo
  }
});

/**
 * ContentImageService
 */
class ContentImageService {
  /**
   * Optimizar imagen después de subir
   * Genera versión optimizada en WebP con dimensiones adecuadas para contenido
   */
  async optimizeImage(filePath, filename, options = {}) {
    try {
      const {
        maxWidth = 1200,
        maxHeight = 800,
        quality = 85,
        generateThumbnail = true
      } = options;

      const baseName = path.parse(filename).name;
      const optimizedPath = path.join(UPLOAD_DIR, `${baseName}.webp`);

      // Obtener metadata de la imagen original
      const metadata = await sharp(filePath).metadata();
      logger.info('Imagen original:', {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format
      });

      // Generar versión optimizada
      await sharp(filePath)
        .resize(maxWidth, maxHeight, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({ quality })
        .toFile(optimizedPath);

      const optimizedStats = await fs.stat(optimizedPath);
      logger.info('Imagen optimizada generada:', {
        path: optimizedPath,
        size: `${(optimizedStats.size / 1024).toFixed(2)} KB`
      });

      let thumbnail = null;

      // Generar thumbnail si se requiere
      if (generateThumbnail) {
        const thumbnailPath = path.join(UPLOAD_DIR, `${baseName}-thumb.webp`);
        await sharp(filePath)
          .resize(300, 200, {
            fit: 'cover',
            position: 'center'
          })
          .webp({ quality: 80 })
          .toFile(thumbnailPath);

        const thumbStats = await fs.stat(thumbnailPath);
        thumbnail = {
          filename: `${baseName}-thumb.webp`,
          size: thumbStats.size
        };
        logger.info('Thumbnail generado:', thumbnailPath);
      }

      // Eliminar archivo original si es diferente
      const ext = path.extname(filename).toLowerCase();
      if (ext !== '.webp') {
        try {
          await fs.unlink(filePath);
          logger.info('Archivo original eliminado:', filePath);
        } catch (unlinkError) {
          logger.warn('No se pudo eliminar archivo original:', unlinkError.message);
        }
      }

      return {
        filename: `${baseName}.webp`,
        size: optimizedStats.size,
        width: maxWidth,
        height: maxHeight,
        thumbnail,
        originalFormat: metadata.format
      };
    } catch (error) {
      logger.error('Error optimizando imagen:', error);
      throw error;
    }
  }

  /**
   * Eliminar imagen y sus variantes
   */
  async deleteImage(filename) {
    try {
      const baseName = path.parse(filename).name.replace(/-thumb$/, '');

      const filesToDelete = [
        `${baseName}.webp`,
        `${baseName}-thumb.webp`,
        filename
      ];

      let deletedCount = 0;

      for (const file of filesToDelete) {
        try {
          const filePath = path.join(UPLOAD_DIR, file);
          await fs.unlink(filePath);
          deletedCount++;
          logger.info('Archivo eliminado:', file);
        } catch (error) {
          if (error.code !== 'ENOENT') {
            logger.warn(`No se pudo eliminar ${file}:`, error.message);
          }
        }
      }

      return deletedCount > 0;
    } catch (error) {
      logger.error('Error eliminando imagen:', error);
      throw error;
    }
  }

  /**
   * Obtener URL pública del archivo
   */
  getPublicUrl(filename) {
    return `/uploads/content/${filename}`;
  }

  /**
   * Listar imágenes por categoría
   */
  async listImages(category = null) {
    try {
      const files = await fs.readdir(UPLOAD_DIR);

      let filteredFiles = files;
      if (category) {
        filteredFiles = files.filter(f => f.startsWith(`${category}-`));
      }

      // Excluir thumbnails de la lista principal
      filteredFiles = filteredFiles.filter(f => !f.includes('-thumb'));

      const imageDetails = await Promise.all(
        filteredFiles.map(async (filename) => {
          const filePath = path.join(UPLOAD_DIR, filename);
          try {
            const stats = await fs.stat(filePath);

            return {
              filename,
              size: stats.size,
              sizeKB: `${(stats.size / 1024).toFixed(2)} KB`,
              created: stats.birthtime,
              modified: stats.mtime,
              url: this.getPublicUrl(filename),
              thumbnailUrl: this.getPublicUrl(filename.replace('.webp', '-thumb.webp'))
            };
          } catch (err) {
            return null;
          }
        })
      );

      return imageDetails.filter(Boolean);
    } catch (error) {
      logger.error('Error listando imágenes:', error);
      throw error;
    }
  }

  /**
   * Validar imagen antes de procesar
   */
  async validateImage(filePath) {
    try {
      const metadata = await sharp(filePath).metadata();
      const errors = [];
      const warnings = [];

      // Validar dimensiones mínimas
      if (metadata.width < 200 || metadata.height < 150) {
        errors.push(`Dimensiones muy pequeñas: ${metadata.width}x${metadata.height}. Mínimo: 200x150`);
      }

      // Validar dimensiones máximas (advertencia)
      if (metadata.width > 4000 || metadata.height > 4000) {
        warnings.push(`Imagen muy grande: ${metadata.width}x${metadata.height}. Se reducirá automáticamente.`);
      }

      // Validar formato
      const allowedFormats = ['jpeg', 'jpg', 'png', 'webp'];
      if (!allowedFormats.includes(metadata.format)) {
        errors.push(`Formato no soportado: ${metadata.format}`);
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings,
        metadata: {
          width: metadata.width,
          height: metadata.height,
          format: metadata.format
        }
      };
    } catch (error) {
      logger.error('Error validando imagen:', error);
      return {
        valid: false,
        errors: ['No se pudo leer la imagen'],
        warnings: [],
        metadata: null
      };
    }
  }

  /**
   * Obtener estadísticas de almacenamiento
   */
  async getStorageStats() {
    try {
      const files = await fs.readdir(UPLOAD_DIR);

      let totalSize = 0;
      const byCategory = {};

      for (const filename of files) {
        const filePath = path.join(UPLOAD_DIR, filename);
        try {
          const stats = await fs.stat(filePath);
          totalSize += stats.size;

          // Extraer categoría del nombre
          const category = filename.split('-')[0];
          if (!byCategory[category]) {
            byCategory[category] = { count: 0, size: 0 };
          }
          byCategory[category].count++;
          byCategory[category].size += stats.size;
        } catch (err) {
          // Skip if file can't be read
        }
      }

      return {
        totalFiles: files.length,
        totalSize,
        totalSizeMB: `${(totalSize / 1024 / 1024).toFixed(2)} MB`,
        byCategory,
        directory: UPLOAD_DIR
      };
    } catch (error) {
      logger.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }
}

module.exports = {
  upload: upload.single('file'),
  ContentImageService: new ContentImageService(),
  UPLOAD_DIR
};
