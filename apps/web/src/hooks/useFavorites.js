import { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * Hook personalizado para gestionar favoritos de estudios de laboratorio
 * Incluye persistencia, organización en carpetas y notas personales
 */
export const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Claves de localStorage
  const FAVORITES_KEY = 'lab_eg_favorites';
  const FOLDERS_KEY = 'lab_eg_favorite_folders';

  // Estructura de un favorito
  const createFavoriteItem = (study, folderId = null) => ({
    id: study.id,
    studyId: study.id,
    studyData: {
      id: study.id,
      nombre: study.nombre || study.name,
      codigo: study.codigo,
      precio: study.precio,
      categoria: study.categoria || study.tipoEstudio,
      tipoEstudio: study.tipoEstudio,
      tiempoEntrega: study.tiempoEntrega,
      preparacion: study.preparacion,
      pruebas: study.pruebas || []
    },
    folderId,
    notes: '',
    dateAdded: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    tags: [],
    priority: 'normal' // normal, high, low
  });

  // Estructura de una carpeta
  const createFolder = (name, color = '#7B68A6') => ({
    id: `folder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    color,
    description: '',
    dateCreated: new Date().toISOString(),
    order: folders.length
  });

  // Cargar datos desde localStorage al inicializar
  useEffect(() => {
    const loadFavorites = () => {
      try {
        const savedFavorites = localStorage.getItem(FAVORITES_KEY);
        const savedFolders = localStorage.getItem(FOLDERS_KEY);

        if (savedFavorites) {
          setFavorites(JSON.parse(savedFavorites));
        }

        if (savedFolders) {
          setFolders(JSON.parse(savedFolders));
        } else {
          // Crear carpeta por defecto
          const defaultFolder = createFolder('General', '#7B68A6');
          setFolders([defaultFolder]);
          localStorage.setItem(FOLDERS_KEY, JSON.stringify([defaultFolder]));
        }
      } catch (error) {
        console.error('Error cargando favoritos:', error);
        // Crear datos por defecto en caso de error
        const defaultFolder = createFolder('General', '#7B68A6');
        setFolders([defaultFolder]);
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, []);

  // Guardar favoritos en localStorage
  const saveFavorites = useCallback((newFavorites) => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } catch (error) {
      console.error('Error guardando favoritos:', error);
    }
  }, []);

  // Guardar carpetas en localStorage
  const saveFolders = useCallback((newFolders) => {
    try {
      localStorage.setItem(FOLDERS_KEY, JSON.stringify(newFolders));
      setFolders(newFolders);
    } catch (error) {
      console.error('Error guardando carpetas:', error);
    }
  }, []);

  // Verificar si un estudio está en favoritos
  const isFavorite = useCallback((studyId) => {
    return favorites.some(fav => fav.studyId === studyId);
  }, [favorites]);

  // Agregar estudio a favoritos
  const addToFavorites = useCallback((study, folderId = null) => {
    if (isFavorite(study.id)) {
      return false; // Ya está en favoritos
    }

    // Si no se especifica carpeta, usar la primera disponible
    const targetFolderId = folderId || (folders.length > 0 ? folders[0].id : null);
    const newFavorite = createFavoriteItem(study, targetFolderId);
    const newFavorites = [...favorites, newFavorite];
    
    saveFavorites(newFavorites);
    return true;
  }, [favorites, folders, isFavorite, saveFavorites]);

  // Remover estudio de favoritos
  const removeFromFavorites = useCallback((studyId) => {
    const newFavorites = favorites.filter(fav => fav.studyId !== studyId);
    saveFavorites(newFavorites);
    return true;
  }, [favorites, saveFavorites]);

  // Toggle favorito
  const toggleFavorite = useCallback((study, folderId = null) => {
    if (isFavorite(study.id)) {
      return removeFromFavorites(study.id);
    } else {
      return addToFavorites(study, folderId);
    }
  }, [isFavorite, addToFavorites, removeFromFavorites]);

  // Mover favorito a otra carpeta
  const moveFavoriteToFolder = useCallback((favoriteId, targetFolderId) => {
    const newFavorites = favorites.map(fav => 
      fav.id === favoriteId 
        ? { ...fav, folderId: targetFolderId, lastModified: new Date().toISOString() }
        : fav
    );
    saveFavorites(newFavorites);
  }, [favorites, saveFavorites]);

  // Actualizar notas de un favorito
  const updateFavoriteNotes = useCallback((favoriteId, notes) => {
    const newFavorites = favorites.map(fav => 
      fav.id === favoriteId 
        ? { ...fav, notes, lastModified: new Date().toISOString() }
        : fav
    );
    saveFavorites(newFavorites);
  }, [favorites, saveFavorites]);

  // Actualizar prioridad de un favorito
  const updateFavoritePriority = useCallback((favoriteId, priority) => {
    const newFavorites = favorites.map(fav => 
      fav.id === favoriteId 
        ? { ...fav, priority, lastModified: new Date().toISOString() }
        : fav
    );
    saveFavorites(newFavorites);
  }, [favorites, saveFavorites]);

  // Agregar tags a un favorito
  const updateFavoriteTags = useCallback((favoriteId, tags) => {
    const newFavorites = favorites.map(fav => 
      fav.id === favoriteId 
        ? { ...fav, tags, lastModified: new Date().toISOString() }
        : fav
    );
    saveFavorites(newFavorites);
  }, [favorites, saveFavorites]);

  // Crear nueva carpeta
  const createNewFolder = useCallback((name, color = '#7B68A6', description = '') => {
    const newFolder = { ...createFolder(name, color), description };
    const newFolders = [...folders, newFolder];
    saveFolders(newFolders);
    return newFolder;
  }, [folders, saveFolders]);

  // Actualizar carpeta
  const updateFolder = useCallback((folderId, updates) => {
    const newFolders = folders.map(folder => 
      folder.id === folderId 
        ? { ...folder, ...updates }
        : folder
    );
    saveFolders(newFolders);
  }, [folders, saveFolders]);

  // Eliminar carpeta (mover favoritos a carpeta por defecto)
  const deleteFolder = useCallback((folderId) => {
    if (folders.length <= 1) {
      return false; // No eliminar la última carpeta
    }

    const defaultFolder = folders.find(f => f.id !== folderId);
    const newFolders = folders.filter(f => f.id !== folderId);
    
    // Mover favoritos de la carpeta eliminada a la carpeta por defecto
    const newFavorites = favorites.map(fav => 
      fav.folderId === folderId 
        ? { ...fav, folderId: defaultFolder.id }
        : fav
    );

    saveFolders(newFolders);
    saveFavorites(newFavorites);
    return true;
  }, [folders, favorites, saveFolders, saveFavorites]);

  // Reordenar carpetas
  const reorderFolders = useCallback((newFolders) => {
    const reorderedFolders = newFolders.map((folder, index) => ({
      ...folder,
      order: index
    }));
    saveFolders(reorderedFolders);
  }, [saveFolders]);

  // Reordenar favoritos
  const reorderFavorites = useCallback((newFavorites) => {
    saveFavorites(newFavorites);
  }, [saveFavorites]);

  // Obtener favoritos por carpeta
  const getFavoritesByFolder = useCallback((folderId) => {
    return favorites.filter(fav => fav.folderId === folderId);
  }, [favorites]);

  // Obtener favoritos sin carpeta
  const getUnorganizedFavorites = useCallback(() => {
    return favorites.filter(fav => !fav.folderId);
  }, [favorites]);

  // Buscar favoritos
  const searchFavorites = useCallback((searchTerm) => {
    if (!searchTerm) return favorites;
    
    const term = searchTerm.toLowerCase();
    return favorites.filter(fav => 
      fav.studyData.nombre?.toLowerCase().includes(term) ||
      fav.studyData.codigo?.toLowerCase().includes(term) ||
      fav.notes?.toLowerCase().includes(term) ||
      fav.tags?.some(tag => tag.toLowerCase().includes(term))
    );
  }, [favorites]);

  // Estadísticas
  const stats = useMemo(() => {
    const total = favorites.length;
    const byFolder = folders.reduce((acc, folder) => {
      acc[folder.id] = getFavoritesByFolder(folder.id).length;
      return acc;
    }, {});
    
    const byPriority = favorites.reduce((acc, fav) => {
      acc[fav.priority] = (acc[fav.priority] || 0) + 1;
      return acc;
    }, {});

    const totalValue = favorites.reduce((sum, fav) => {
      return sum + (fav.studyData.precio || 0);
    }, 0);

    return {
      total,
      byFolder,
      byPriority,
      totalValue,
      folders: folders.length,
      unorganized: getUnorganizedFavorites().length
    };
  }, [favorites, folders, getFavoritesByFolder, getUnorganizedFavorites]);

  // Exportar favoritos
  const exportFavorites = useCallback((format = 'json', folderId = null) => {
    const favoritesToExport = folderId 
      ? getFavoritesByFolder(folderId)
      : favorites;

    const exportData = {
      favorites: favoritesToExport,
      folders: folders,
      exportDate: new Date().toISOString(),
      stats: stats
    };

    switch (format) {
      case 'json':
        return JSON.stringify(exportData, null, 2);
      case 'csv':
        const csvHeaders = 'Nombre,Código,Categoría,Precio,Carpeta,Notas,Fecha Agregado';
        const csvRows = favoritesToExport.map(fav => {
          const folder = folders.find(f => f.id === fav.folderId);
          return [
            fav.studyData.nombre,
            fav.studyData.codigo,
            fav.studyData.categoria,
            fav.studyData.precio || 0,
            folder?.name || 'Sin carpeta',
            fav.notes?.replace(/"/g, '""') || '',
            new Date(fav.dateAdded).toLocaleDateString()
          ].map(field => `"${field}"`).join(',');
        });
        return [csvHeaders, ...csvRows].join('\n');
      default:
        return exportData;
    }
  }, [favorites, folders, getFavoritesByFolder, stats]);

  // Importar favoritos
  const importFavorites = useCallback((data, merge = true) => {
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      
      if (merge) {
        // Combinar con favoritos existentes
        const existingIds = new Set(favorites.map(f => f.studyId));
        const newFavorites = parsed.favorites.filter(f => !existingIds.has(f.studyId));
        saveFavorites([...favorites, ...newFavorites]);
        
        // Combinar carpetas
        const existingFolderNames = new Set(folders.map(f => f.name));
        const newFolders = parsed.folders.filter(f => !existingFolderNames.has(f.name));
        saveFolders([...folders, ...newFolders]);
      } else {
        // Reemplazar completamente
        saveFavorites(parsed.favorites || []);
        saveFolders(parsed.folders || []);
      }
      
      return true;
    } catch (error) {
      console.error('Error importando favoritos:', error);
      return false;
    }
  }, [favorites, folders, saveFavorites, saveFolders]);

  // Limpiar todos los favoritos
  const clearAllFavorites = useCallback(() => {
    saveFavorites([]);
  }, [saveFavorites]);

  return {
    // Estado
    favorites,
    folders,
    loading,
    stats,

    // Funciones básicas
    isFavorite,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,

    // Gestión de carpetas
    createNewFolder,
    updateFolder,
    deleteFolder,
    reorderFolders,
    moveFavoriteToFolder,

    // Gestión de favoritos
    updateFavoriteNotes,
    updateFavoritePriority,
    updateFavoriteTags,
    reorderFavorites,

    // Consultas
    getFavoritesByFolder,
    getUnorganizedFavorites,
    searchFavorites,

    // Importar/Exportar
    exportFavorites,
    importFavorites,
    clearAllFavorites
  };
};

export default useFavorites;