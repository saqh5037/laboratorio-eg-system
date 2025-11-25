const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const logger = require('../utils/logger');

// Configuración de almacenamiento
const UPLOAD_DIR = path.join(__dirname, '../../uploads/logos');

// Asegurar que el directorio existe
async function ensureUploadDir() {
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    logger.info('Directorio de logos verificado:', UPLOAD_DIR);
  } catch (error) {
    logger.error('Error creando directorio de logos:', error);
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
    const logoType = req.body.type || 'logo';
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const filename = `logo-${logoType}-${timestamp}${ext}`;
    cb(null, filename);
  }
});

// Filtro de tipos de archivo permitidos
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes JPG, PNG, WebP o SVG'), false);
  }
};

// Configuración de multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB máximo para logos
  }
});

/**
 * LogoUploadService
 * Servicio para manejar upload y optimización de logos
 */
class LogoUploadService {
  /**
   * Optimizar logo después de subir
   * Genera versión optimizada en WebP (512x512 max) y mantiene original si es SVG
   */
  async optimizeLogo(filePath, filename, logoType) {
    try {
      const ext = path.extname(filename).toLowerCase();

      // Si es SVG, no optimizar (mantener original)
      if (ext === '.svg') {
        logger.info('Logo SVG subido, sin optimización:', filename);
        return {
          filename,
          optimized: false,
          type: 'svg'
        };
      }

      const baseName = path.parse(filename).name;
      const optimizedPath = path.join(UPLOAD_DIR, `${baseName}-optimized.webp`);

      // Obtener metadata de la imagen original
      const metadata = await sharp(filePath).metadata();
      logger.info('Logo original:', {
        type: logoType,
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: `${(metadata.size / 1024).toFixed(2)} KB`
      });

      // Generar versión optimizada (512x512 max, mantener aspect ratio)
      await sharp(filePath)
        .resize(512, 512, {
          fit: 'inside', // Mantener aspect ratio
          withoutEnlargement: true // No agrandar si es más pequeño
        })
        .webp({ quality: 90 }) // Mayor calidad para logos
        .toFile(optimizedPath);

      const optimizedStats = await fs.stat(optimizedPath);
      logger.info('Logo optimizado generado:', {
        path: optimizedPath,
        size: `${(optimizedStats.size / 1024).toFixed(2)} KB`
      });

      // Eliminar archivo original (ya tenemos versión optimizada)
      try {
        await fs.unlink(filePath);
        logger.info('Archivo original eliminado:', filePath);
      } catch (unlinkError) {
        logger.warn('No se pudo eliminar archivo original:', unlinkError.message);
      }

      return {
        filename: `${baseName}-optimized.webp`,
        optimized: true,
        type: 'webp',
        size: optimizedStats.size
      };
    } catch (error) {
      logger.error('Error optimizando logo:', error);
      throw error;
    }
  }

  /**
   * Eliminar archivo de logo
   */
  async deleteLogo(filename) {
    try {
      const baseName = path.parse(filename).name;

      // Intentar eliminar todas las versiones posibles
      const filesToDelete = [
        filename,
        `${baseName}-optimized.webp`,
        filename.replace(/\.(jpg|jpeg|png)$/i, '.webp')
      ];

      let deletedCount = 0;

      for (const file of filesToDelete) {
        try {
          const filePath = path.join(UPLOAD_DIR, file);
          await fs.unlink(filePath);
          deletedCount++;
          logger.info('Logo eliminado:', file);
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
      logger.error('Error eliminando logo:', error);
      throw error;
    }
  }

  /**
   * Obtener URL pública del logo
   */
  getPublicUrl(filename) {
    // Retornar ruta relativa para que el frontend agregue el base URL
    return `/uploads/logos/${filename}`;
  }

  /**
   * Listar todos los logos
   */
  async listLogos() {
    try {
      const files = await fs.readdir(UPLOAD_DIR);

      const logoDetails = await Promise.all(
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

      return logoDetails;
    } catch (error) {
      logger.error('Error listando logos:', error);
      throw error;
    }
  }

  /**
   * Validar logo antes de procesar
   */
  async validateLogo(filePath, logoType) {
    try {
      const ext = path.extname(filePath).toLowerCase();

      // SVG no necesita validación de dimensiones
      if (ext === '.svg') {
        return {
          valid: true,
          errors: [],
          metadata: { format: 'svg' }
        };
      }

      const metadata = await sharp(filePath).metadata();
      const errors = [];

      // Validar dimensiones mínimas (más flexibles para logos)
      if (metadata.width < 64 || metadata.height < 64) {
        errors.push(`Dimensiones muy pequeñas: ${metadata.width}x${metadata.height}. Mínimo recomendado: 64x64`);
      }

      // Validar dimensiones máximas
      if (metadata.width > 2048 || metadata.height > 2048) {
        errors.push(`Dimensiones muy grandes: ${metadata.width}x${metadata.height}. Máximo recomendado: 2048x2048`);
      }

      // Validar formato
      const allowedFormats = ['jpeg', 'jpg', 'png', 'webp'];
      if (!allowedFormats.includes(metadata.format)) {
        errors.push(`Formato no soportado: ${metadata.format}`);
      }

      // Recomendaciones específicas por tipo de logo
      if (logoType === 'favicon' && (metadata.width !== metadata.height)) {
        errors.push('El favicon debe ser cuadrado (mismo ancho y alto)');
      }

      return {
        valid: errors.length === 0,
        errors,
        metadata
      };
    } catch (error) {
      logger.error('Error validando logo:', error);
      return {
        valid: false,
        errors: ['No se pudo leer la imagen'],
        metadata: null
      };
    }
  }

  /**
   * Obtener estadísticas del directorio de logos
   */
  async getStorageStats() {
    try {
      const logos = await this.listLogos();

      const totalSize = logos.reduce((sum, logo) => sum + logo.size, 0);
      const optimizedLogos = logos.filter(l => l.filename.includes('-optimized'));
      const originalLogos = logos.filter(l => !l.filename.includes('-optimized'));

      return {
        totalLogos: logos.length,
        optimizedLogos: optimizedLogos.length,
        originalLogos: originalLogos.length,
        totalSize,
        totalSizeMB: `${(totalSize / 1024 / 1024).toFixed(2)} MB`,
        directory: UPLOAD_DIR
      };
    } catch (error) {
      logger.error('Error obteniendo estadísticas de logos:', error);
      throw error;
    }
  }
}

module.exports = {
  upload: upload.single('file'),
  LogoUploadService: new LogoUploadService(),
  UPLOAD_DIR
};
