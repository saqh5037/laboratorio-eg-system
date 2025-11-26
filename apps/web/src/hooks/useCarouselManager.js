import { useState, useEffect, useCallback } from 'react';
import { useLab } from '../contexts/LabContext';
import {
  getAllSlides,
  getCarouselStats,
  createSlide,
  updateSlide,
  deleteSlide,
  toggleSlideActive,
  reorderSlide,
  uploadCarouselImage,
  listUploadedFiles,
  getStorageStats,
  validateSlideData
} from '../services/carouselApi';

/**
 * Custom Hook para gestionar el carrusel desde el panel de administración
 *
 * Características:
 * - Carga y actualización de slides
 * - CRUD completo de slides
 * - Upload de imágenes con optimización automática
 * - Reordenamiento drag & drop
 * - Toggle de activación
 * - Estadísticas en tiempo real
 * - Manejo de estados de carga y errores
 * - Soporte multi-laboratorio (lab-aware)
 *
 * @returns {Object} - Estado y funciones para gestionar el carrusel
 */
export function useCarouselManager() {
  // Obtener laboratorio activo del contexto
  const { activeLab } = useLab();
  // ============================================
  // ESTADO
  // ============================================
  const [slides, setSlides] = useState([]);
  const [stats, setStats] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [storageStats, setStorageStats] = useState(null);

  // Estados de carga
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [savingSlide, setSavingSlide] = useState(false);

  // Estados de error
  const [error, setError] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  // ============================================
  // FETCH DE DATOS
  // ============================================

  /**
   * Cargar todos los slides (incluidos inactivos)
   */
  const fetchSlides = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllSlides(activeLab);
      setSlides(response.data);
      return response.data;
    } catch (err) {
      setError(`Error cargando slides: ${err.message}`);
      console.error('Error fetching slides:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [activeLab]);

  /**
   * Cargar estadísticas del carrusel
   */
  const fetchStats = useCallback(async () => {
    try {
      const response = await getCarouselStats(activeLab);
      setStats(response.data);
      return response.data;
    } catch (err) {
      console.error('Error fetching stats:', err);
      return null;
    }
  }, [activeLab]);

  /**
   * Cargar archivos subidos
   */
  const fetchUploadedFiles = useCallback(async () => {
    try {
      const response = await listUploadedFiles();
      setUploadedFiles(response.data);
      return response.data;
    } catch (err) {
      console.error('Error fetching uploaded files:', err);
      return [];
    }
  }, []);

  /**
   * Cargar estadísticas de almacenamiento
   */
  const fetchStorageStats = useCallback(async () => {
    try {
      const response = await getStorageStats();
      setStorageStats(response.data);
      return response.data;
    } catch (err) {
      console.error('Error fetching storage stats:', err);
      return null;
    }
  }, []);

  /**
   * Refrescar todos los datos
   */
  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchSlides(),
      fetchStats(),
      fetchUploadedFiles(),
      fetchStorageStats()
    ]);
  }, [fetchSlides, fetchStats, fetchUploadedFiles, fetchStorageStats]);

  // Cargar datos iniciales
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // ============================================
  // CRUD DE SLIDES
  // ============================================

  /**
   * Crear nuevo slide
   */
  const handleCreateSlide = useCallback(async (slideData) => {
    try {
      setSavingSlide(true);
      setError(null);

      // Validar datos
      const validation = validateSlideData(slideData);
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }

      const response = await createSlide(slideData, activeLab);

      // Actualizar lista de slides
      await fetchSlides();
      await fetchStats();

      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = `Error creando slide: ${err.message}`;
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setSavingSlide(false);
    }
  }, [activeLab, fetchSlides, fetchStats]);

  /**
   * Actualizar slide existente
   */
  const handleUpdateSlide = useCallback(async (id, slideData) => {
    try {
      setSavingSlide(true);
      setError(null);

      // Validar datos
      const validation = validateSlideData(slideData);
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }

      const response = await updateSlide(id, slideData, activeLab);

      // Actualizar lista de slides
      await fetchSlides();

      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = `Error actualizando slide: ${err.message}`;
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setSavingSlide(false);
    }
  }, [activeLab, fetchSlides]);

  /**
   * Eliminar slide
   */
  const handleDeleteSlide = useCallback(async (id) => {
    try {
      setError(null);

      const response = await deleteSlide(id, activeLab);

      // Actualizar lista de slides
      await fetchSlides();
      await fetchStats();

      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = `Error eliminando slide: ${err.message}`;
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, [activeLab, fetchSlides, fetchStats]);

  /**
   * Toggle estado activo/inactivo de un slide
   */
  const handleToggleActive = useCallback(async (id, isActive) => {
    try {
      setError(null);

      const response = await toggleSlideActive(id, isActive, activeLab);

      // Actualizar slide en el estado local (optimistic update)
      setSlides(prevSlides =>
        prevSlides.map(slide =>
          slide.id === id ? { ...slide, is_active: isActive } : slide
        )
      );

      // Actualizar stats
      await fetchStats();

      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = `Error cambiando estado: ${err.message}`;
      setError(errorMsg);
      // Revertir cambio optimista
      await fetchSlides();
      return { success: false, error: errorMsg };
    }
  }, [activeLab, fetchSlides, fetchStats]);

  /**
   * Reordenar slide a nueva posición
   */
  const handleReorderSlide = useCallback(async (id, newPosition) => {
    try {
      setError(null);

      const response = await reorderSlide(id, newPosition, activeLab);

      // Refrescar slides para mostrar nuevo orden
      await fetchSlides();

      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = `Error reordenando slide: ${err.message}`;
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
  }, [activeLab, fetchSlides]);

  // ============================================
  // UPLOAD DE IMÁGENES
  // ============================================

  /**
   * Subir imagen para carrusel
   * Genera automáticamente versiones desktop y móvil optimizadas
   */
  const handleUploadImage = useCallback(async (file) => {
    try {
      setUploading(true);
      setUploadError(null);

      // Validaciones del archivo
      if (!file) {
        throw new Error('No se seleccionó ningún archivo');
      }

      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Solo se permiten imágenes JPG, PNG o WebP');
      }

      // Validar tamaño (5MB máximo)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('El archivo no debe superar los 5MB');
      }

      const response = await uploadCarouselImage(file);

      // Actualizar lista de archivos y storage stats
      await fetchUploadedFiles();
      await fetchStorageStats();

      return {
        success: true,
        data: response.data
      };
    } catch (err) {
      const errorMsg = `Error subiendo imagen: ${err.message}`;
      setUploadError(errorMsg);
      return {
        success: false,
        error: errorMsg
      };
    } finally {
      setUploading(false);
    }
  }, [fetchUploadedFiles, fetchStorageStats]);

  // ============================================
  // HELPERS
  // ============================================

  /**
   * Obtener slide por ID
   */
  const getSlideById = useCallback((id) => {
    return slides.find(slide => slide.id === parseInt(id));
  }, [slides]);

  /**
   * Obtener slides activos
   */
  const getActiveSlides = useCallback(() => {
    return slides.filter(slide => slide.is_active);
  }, [slides]);

  /**
   * Obtener slides inactivos
   */
  const getInactiveSlides = useCallback(() => {
    return slides.filter(slide => !slide.is_active);
  }, [slides]);

  /**
   * Limpiar errores
   */
  const clearErrors = useCallback(() => {
    setError(null);
    setUploadError(null);
  }, []);

  // ============================================
  // RETURN
  // ============================================

  return {
    // Lab activo
    activeLab,

    // Datos
    slides,
    stats,
    uploadedFiles,
    storageStats,

    // Estados de carga
    loading,
    uploading,
    savingSlide,

    // Errores
    error,
    uploadError,
    clearErrors,

    // Funciones de fetch
    fetchSlides,
    fetchStats,
    fetchUploadedFiles,
    fetchStorageStats,
    refreshAll,

    // CRUD
    createSlide: handleCreateSlide,
    updateSlide: handleUpdateSlide,
    deleteSlide: handleDeleteSlide,
    toggleActive: handleToggleActive,
    reorderSlide: handleReorderSlide,

    // Upload
    uploadImage: handleUploadImage,

    // Helpers
    getSlideById,
    getActiveSlides,
    getInactiveSlides
  };
}

export default useCarouselManager;
