import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import StudyService from '../services/api';
import { StudyAdapter } from '../adapters/studyAdapter';

// Crear el contexto
const UnifiedAppContext = createContext();

/**
 * Provider unificado que combina funcionalidades de ambos proyectos
 * - Estado del directorio (favoritos, carrito, filtros)
 * - Estado del laboratorio (estudios, grupos, conexión)
 * - Gestión unificada con persistencia y sincronización
 */
export const UnifiedAppProvider = ({ children }) => {
  // ============= ESTADO DEL DIRECTORIO =============
  
  // Favoritos con persistencia
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('lab_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Carrito de presupuesto con persistencia
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('lab_cart');
    return saved ? JSON.parse(saved) : [];
  });
  
  // Historial de búsqueda
  const [searchHistory, setSearchHistory] = useState(() => {
    const saved = localStorage.getItem('lab_search_history');
    return saved ? JSON.parse(saved) : [];
  });

  // ============= ESTADO DEL LABORATORIO =============
  
  // Datos principales
  const [studies, setStudies] = useState([]);
  const [groups, setGroups] = useState([]);
  const [areas, setAreas] = useState([]);
  const [statistics, setStatistics] = useState(null);
  
  // Estado de carga y conexión
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState(null);
  
  // ============= ESTADO COMPARTIDO =============
  
  // Búsqueda y filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [viewMode, setViewMode] = useState(() => 
    localStorage.getItem('lab_view_mode') || 'grid'
  );
  
  // Filtros avanzados
  const [filters, setFilters] = useState({
    area: '',
    priceRange: [0, 1000],
    requiresFasting: null,
    sampleType: '',
    deliveryTime: ''
  });

  // Modal states
  const [selectedStudy, setSelectedStudy] = useState(null);
  const [showBudgetCalculator, setShowBudgetCalculator] = useState(false);

  // ============= EFECTOS =============
  
  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

  // Persistir cambios en localStorage
  useEffect(() => {
    localStorage.setItem('lab_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('lab_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('lab_search_history', JSON.stringify(searchHistory.slice(0, 10)));
  }, [searchHistory]);

  useEffect(() => {
    localStorage.setItem('lab_view_mode', viewMode);
  }, [viewMode]);

  // Monitorear conexión
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Conexión restaurada');
      syncData(); // Sincronizar datos pendientes
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.error('Sin conexión - Modo offline activado');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Recargar estudios cuando cambian los filtros
  useEffect(() => {
    loadStudies();
  }, [filters, selectedCategory, searchQuery]);

  // ============= FUNCIONES DE CARGA DE DATOS =============
  
  /**
   * Carga inicial de datos
   */
  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Cargar en paralelo para mejor performance
      const [areasData, statsData] = await Promise.all([
        StudyService.getAreas(),
        StudyService.getStatistics()
      ]);
      
      setAreas(areasData);
      setStatistics(statsData);
      
      // Cargar estudios
      await loadStudies();
      
      setLastSync(new Date().toISOString());
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Error al cargar datos iniciales');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Carga estudios con filtros aplicados
   */
  const loadStudies = async () => {
    setLoading(true);
    try {
      const params = {
        area: filters.area || selectedCategory,
        minPrice: filters.priceRange[0],
        maxPrice: filters.priceRange[1],
        requiresFasting: filters.requiresFasting,
        search: searchQuery,
        page: 1,
        limit: 50
      };
      
      const response = await StudyService.getStudies(params);
      setStudies(response.data);
      
      // Si hay búsqueda, agregar al historial
      if (searchQuery && searchQuery.trim()) {
        addToSearchHistory(searchQuery);
      }
    } catch (error) {
      console.error('Error loading studies:', error);
      toast.error('Error al cargar estudios');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Carga grupos/perfiles
   */
  const loadGroups = async () => {
    try {
      const response = await StudyService.getGroups();
      setGroups(response.data);
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  };

  /**
   * Sincroniza datos cuando vuelve la conexión
   */
  const syncData = async () => {
    if (!isOnline) return;
    
    toast.loading('Sincronizando datos...');
    
    try {
      await loadInitialData();
      toast.success('Datos sincronizados');
    } catch (error) {
      console.error('Error syncing data:', error);
      toast.error('Error al sincronizar');
    }
  };

  // ============= FUNCIONES DEL CARRITO =============
  
  /**
   * Agrega un estudio al carrito
   */
  const addToCart = useCallback((study) => {
    const cartItem = StudyAdapter.toCart(study);
    const exists = cart.find(item => item.id === study.id);
    
    if (exists) {
      toast.info('Este estudio ya está en el presupuesto');
      return false;
    }
    
    const newCart = [...cart, cartItem];
    setCart(newCart);
    toast.success(`${study.nombre} agregado al presupuesto`);
    return true;
  }, [cart]);

  /**
   * Elimina un estudio del carrito
   */
  const removeFromCart = useCallback((studyId) => {
    const newCart = cart.filter(item => item.id !== studyId);
    setCart(newCart);
    toast.success('Estudio eliminado del presupuesto');
  }, [cart]);

  /**
   * Actualiza la cantidad de un estudio en el carrito
   */
  const updateCartQuantity = useCallback((studyId, quantity) => {
    if (quantity < 1) return;
    
    const newCart = cart.map(item =>
      item.id === studyId ? { ...item, cantidad: quantity } : item
    );
    setCart(newCart);
  }, [cart]);

  /**
   * Calcula el total del carrito con descuentos
   */
  const calculateCartTotal = useCallback(() => {
    const subtotal = cart.reduce((sum, item) => 
      sum + (item.precio * (item.cantidad || 1)), 0
    );
    
    // Aplicar descuentos por volumen
    let discount = 0;
    const itemCount = cart.reduce((sum, item) => sum + (item.cantidad || 1), 0);
    
    if (itemCount >= 11) {
      discount = 0.15; // 15% de descuento
    } else if (itemCount >= 6) {
      discount = 0.10; // 10% de descuento
    } else if (itemCount >= 3) {
      discount = 0.05; // 5% de descuento
    }
    
    const discountAmount = subtotal * discount;
    const total = subtotal - discountAmount;
    
    return {
      subtotal,
      discount: discountAmount,
      discountPercentage: discount * 100,
      total,
      itemCount,
      items: cart
    };
  }, [cart]);

  /**
   * Limpia el carrito
   */
  const clearCart = useCallback(() => {
    setCart([]);
    localStorage.removeItem('lab_cart');
    toast.success('Presupuesto limpiado');
  }, []);

  // ============= FUNCIONES DE FAVORITOS =============
  
  /**
   * Alterna el estado de favorito de un estudio
   */
  const toggleFavorite = useCallback((study) => {
    const exists = favorites.find(fav => fav.id === study.id);
    let newFavorites;
    
    if (exists) {
      newFavorites = favorites.filter(fav => fav.id !== study.id);
      toast.success('Eliminado de favoritos');
    } else {
      newFavorites = [...favorites, {
        ...study,
        dateAdded: new Date().toISOString()
      }];
      toast.success('Agregado a favoritos');
    }
    
    setFavorites(newFavorites);
    return !exists;
  }, [favorites]);

  /**
   * Verifica si un estudio es favorito
   */
  const isFavorite = useCallback((studyId) => {
    return favorites.some(fav => fav.id === studyId);
  }, [favorites]);

  /**
   * Agrega todos los favoritos al carrito
   */
  const addAllFavoritesToCart = useCallback(() => {
    let addedCount = 0;
    
    favorites.forEach(fav => {
      if (!cart.find(item => item.id === fav.id)) {
        const cartItem = StudyAdapter.toCart(fav);
        cart.push(cartItem);
        addedCount++;
      }
    });
    
    if (addedCount > 0) {
      setCart([...cart]);
      toast.success(`${addedCount} estudios agregados al presupuesto`);
    } else {
      toast.info('Todos los favoritos ya están en el presupuesto');
    }
  }, [favorites, cart]);

  // ============= FUNCIONES DE BÚSQUEDA =============
  
  /**
   * Realiza una búsqueda
   */
  const performSearch = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      toast.error('Ingrese al menos 2 caracteres para buscar');
      return;
    }
    
    setSearchQuery(query);
    setLoading(true);
    
    try {
      const results = await StudyService.search(query);
      setStudies(results.estudios);
      
      if (results.grupos.length > 0) {
        setGroups(results.grupos);
      }
      
      addToSearchHistory(query);
      
      if (results.total === 0) {
        toast.info('No se encontraron resultados');
      } else {
        toast.success(`${results.total} resultados encontrados`);
      }
    } catch (error) {
      console.error('Error searching:', error);
      toast.error('Error en la búsqueda');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Agrega una búsqueda al historial
   */
  const addToSearchHistory = (query) => {
    if (!query || query.trim().length < 2) return;
    
    setSearchHistory(prev => {
      const filtered = prev.filter(q => q !== query);
      return [query, ...filtered].slice(0, 10);
    });
  };

  /**
   * Limpia el historial de búsqueda
   */
  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('lab_search_history');
    toast.success('Historial de búsqueda eliminado');
  };

  // ============= FUNCIONES DE FILTROS =============
  
  /**
   * Aplica filtros
   */
  const applyFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  /**
   * Resetea todos los filtros
   */
  const resetFilters = useCallback(() => {
    setFilters({
      area: '',
      priceRange: [0, 1000],
      requiresFasting: null,
      sampleType: '',
      deliveryTime: ''
    });
    setSelectedCategory(null);
    setSearchQuery('');
    toast.success('Filtros eliminados');
  }, []);

  // ============= VALOR DEL CONTEXTO =============
  
  const value = {
    // Estado de datos
    studies,
    groups,
    areas,
    statistics,
    favorites,
    cart,
    searchHistory,
    
    // Estado de UI
    loading,
    isOnline,
    lastSync,
    searchQuery,
    selectedCategory,
    viewMode,
    filters,
    selectedStudy,
    showBudgetCalculator,
    
    // Setters de UI
    setSearchQuery,
    setSelectedCategory,
    setViewMode,
    setSelectedStudy,
    setShowBudgetCalculator,
    
    // Funciones de carga
    loadStudies,
    loadGroups,
    loadInitialData,
    syncData,
    
    // Funciones del carrito
    addToCart,
    removeFromCart,
    updateCartQuantity,
    calculateCartTotal,
    clearCart,
    
    // Funciones de favoritos
    toggleFavorite,
    isFavorite,
    addAllFavoritesToCart,
    
    // Funciones de búsqueda
    performSearch,
    clearSearchHistory,
    
    // Funciones de filtros
    applyFilters,
    resetFilters
  };

  return (
    <UnifiedAppContext.Provider value={value}>
      {children}
    </UnifiedAppContext.Provider>
  );
};

/**
 * Hook personalizado para usar el contexto unificado
 */
export const useUnifiedApp = () => {
  const context = useContext(UnifiedAppContext);
  if (!context) {
    throw new Error('useUnifiedApp must be used within UnifiedAppProvider');
  }
  return context;
};

// Exportar también el contexto por si se necesita
export default UnifiedAppContext;