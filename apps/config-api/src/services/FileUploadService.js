const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const logger = require('../utils/logger');
const mime = require('mime-types');

// Configuración de almacenamiento
const UPLOAD_DIR = path.join(__dirname, '../../uploads/carousel');

// Asegurar que el directorio existe
async function ensureUploadDir() {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    logger.info('Directorio de uploads verificado:', UPLOAD_DIR);
  } catch (error) {
    logger.error('Error creando directorio de uploads:', error);
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
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = `carousel-${uniqueSuffix}${ext}`;
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
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  }
});

/**
 * FileUploadService
 * Servicio para manejar upload y optimización de imágenes
 */
class FileUploadService {
  /**
   * Optimizar imagen después de subir
   * Genera versión desktop (1920x1080) y móvil (800x600) en WebP
   */
  async optimizeImage(filePath, filename) {
    try {
      const baseName = path.parse(filename).name;

      // Rutas de salida
      const desktopPath = path.join(UPLOAD_DIR, `${baseName}-desktop.webp`);
      const mobilePath = path.join(UPLOAD_DIR, `${baseName}-mobile.webp`);

      // Obtener metadata de la imagen original
      const metadata = await sharp(filePath).metadata();
      logger.info('Imagen original:', {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: `${(metadata.size / 1024).toFixed(2)} KB`
      });

      // Generar versión desktop optimizada (1920x1080 WebP)
      await sharp(filePath)
        .resize(1920, 1080, {
          fit: 'cover',
          position: 'center'
        })
        .webp({ quality: 85 })
        .toFile(desktopPath);

      const desktopStats = await fs.stat(desktopPath);
      logger.info('Versión desktop generada:', {
        path: desktopPath,
        size: `${(desktopStats.size / 1024).toFixed(2)} KB`
      });

      // Generar versión móvil optimizada (800x600 WebP)
      await sharp(filePath)
        .resize(800, 600, {
          fit: 'cover',
          position: 'center'
        })
        .webp({ quality: 80 })
        .toFile(mobilePath);

      const mobileStats = await fs.stat(mobilePath);
      logger.info('Versión móvil generada:', {
        path: mobilePath,
        size: `${(mobileStats.size / 1024).toFixed(2)} KB`
      });

      // Eliminar archivo original (ya tenemos versiones optimizadas)
      try {
        await fs.unlink(filePath);
        logger.info('Archivo original eliminado:', filePath);
      } catch (unlinkError) {
        logger.warn('No se pudo eliminar archivo original:', unlinkError.message);
      }

      return {
        desktop: `${baseName}-desktop.webp`,
        mobile: `${baseName}-mobile.webp`,
        desktopSize: desktopStats.size,
        mobileSize: mobileStats.size
      };
    } catch (error) {
      logger.error('Error optimizando imagen:', error);
      throw error;
    }
  }

  /**
   * Eliminar archivos relacionados con un slide
   */
  async deleteFile(filename) {
    try {
      const baseName = path.parse(filename).name;

      // Intentar eliminar todas las versiones posibles
      const filesToDelete = [
        filename,
        `${baseName}-desktop.webp`,
        `${baseName}-mobile.webp`,
        filename.replace(/\.(jpg|jpeg|png)$/i, '.webp')
      ];

      let deletedCount = 0;

      for (const file of filesToDelete) {
        try {
          const filePath = path.join(UPLOAD_DIR, file);
          await fs.unlink(filePath);
          deletedCount++;
          logger.info('Archivo eliminado:', file);
        } catch (error) {
          // Ignorar si el archivo no existe
          if (error.code !== 'ENOENT') {
            logger.warn(`No se pudo eliminar ${file}:`, error.message);
          }
        }
      }

      logger.info(`Total de archivos eliminados: ${deletedCount}`);
      return deletedCount > 0;
    } catch (error) {
      logger.error('Error eliminando archivos:', error);
      throw error;
    }
  }

  /**
   * Obtener URL pública del archivo
   */
  getPublicUrl(filename) {
    const baseUrl = process.env.PUBLIC_URL || 'http://localhost:3005';
    return `${baseUrl}/uploads/carousel/${filename}`;
  }

  /**
   * Listar todos los archivos en el directorio de uploads
   */
  async listFiles() {
    try {
      const files = await fs.readdir(UPLOAD_DIR);

      const fileDetails = await Promise.all(
        files.map(async (filename) => {
          const filePath = path.join(UPLOAD_DIR, filename);
          const stats = await fs.stat(filePath);

          return {
            filename,
            size: stats.size,
            sizeKB: `${(stats.size / 1024).toFixed(2)} KB`,
            created: stats.birthtime,
            modified: stats.mtime,
            url: this.getPublicUrl(filename)
          };
        })
      );

      return fileDetails;
    } catch (error) {
      logger.error('Error listando archivos:', error);
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

      // Validar dimensiones mínimas
      if (metadata.width < 800 || metadata.height < 600) {
        errors.push(`Dimensiones muy pequeñas: ${metadata.width}x${metadata.height}. Mínimo recomendado: 800x600`);
      }

      // Validar formato
      const allowedFormats = ['jpeg', 'jpg', 'png', 'webp'];
      if (!allowedFormats.includes(metadata.format)) {
        errors.push(`Formato no soportado: ${metadata.format}`);
      }

      return {
        valid: errors.length === 0,
        errors,
        metadata
      };
    } catch (error) {
      logger.error('Error validando imagen:', error);
      return {
        valid: false,
        errors: ['No se pudo leer la imagen'],
        metadata: null
      };
    }
  }

  /**
   * Obtener estadísticas del directorio de uploads
   */
  async getStorageStats() {
    try {
      const files = await this.listFiles();

      const totalSize = files.reduce((sum, file) => sum + file.size, 0);
      const desktopFiles = files.filter(f => f.filename.includes('-desktop'));
      const mobileFiles = files.filter(f => f.filename.includes('-mobile'));
      const originalFiles = files.filter(f => !f.filename.includes('-desktop') && !f.filename.includes('-mobile'));

      return {
        totalFiles: files.length,
        desktopFiles: desktopFiles.length,
        mobileFiles: mobileFiles.length,
        originalFiles: originalFiles.length,
        totalSize,
        totalSizeMB: `${(totalSize / 1024 / 1024).toFixed(2)} MB`,
        directory: UPLOAD_DIR
      };
    } catch (error) {
      logger.error('Error obteniendo estadísticas de storage:', error);
      throw error;
    }
  }
}

module.exports = {
  upload: upload.single('file'),
  FileUploadService: new FileUploadService(),
  UPLOAD_DIR
};
