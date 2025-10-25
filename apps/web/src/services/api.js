import axios from 'axios';
import { StudyAdapter } from '../adapters/studyAdapter';

/**
 * Servicio unificado para comunicación con el backend
 * Maneja tanto datos dinámicos (PostgreSQL) como estáticos (fallback)
 */
class StudyService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    
    // Crear instancia de axios con configuración base
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Cache local para modo offline
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
    
    // Configurar interceptores
    this.setupInterceptors();
  }

  /**
   * Configura interceptores para manejo de errores y cache
   */
  setupInterceptors() {
    // Interceptor de respuesta
    this.client.interceptors.response.use(
      response => {
        // Guardar en cache las respuestas exitosas
        this.cacheResponse(response.config.url, response.data);
        return response;
      },
      async error => {
        // Si no hay conexión o timeout, intentar usar cache o datos estáticos
        if (this.isNetworkError(error)) {
          console.warn('Network error, falling back to cache/static data');
          return this.handleOfflineRequest(error.config);
        }
        throw error;
      }
    );

    // Interceptor de request para agregar tokens si es necesario
    this.client.interceptors.request.use(
      config => {
        // Aquí se pueden agregar tokens de autenticación si es necesario
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );
  }

  /**
   * Verifica si es un error de red
   */
  isNetworkError(error) {
    return (
      error.code === 'ECONNABORTED' ||
      error.code === 'ERR_NETWORK' ||
      error.message === 'Network Error' ||
      !navigator.onLine
    );
  }

  /**
   * Maneja solicitudes cuando no hay conexión
   */
  async handleOfflineRequest(config) {
    const url = config.url;
    
    // Intentar obtener de cache
    const cached = this.getCachedResponse(url);
    if (cached) {
      return { data: cached, fromCache: true };
    }
    
    // Si no hay cache, usar datos estáticos
    const staticData = await this.getStaticData(url);
    return { data: staticData, fromStatic: true };
  }

  /**
   * Guarda respuesta en cache
   */
  cacheResponse(url, data) {
    this.cache.set(url, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Obtiene respuesta de cache si es válida
   */
  getCachedResponse(url) {
    const cached = this.cache.get(url);
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  /**
   * Obtiene datos estáticos como fallback
   */
  async getStaticData(url) {
    try {
      if (url.includes('/pruebas') || url.includes('/estudios')) {
        const { estudiosData } = await import('../data/estudios.js');
        return {
          data: StudyAdapter.fromStaticList(estudiosData),
          total: estudiosData.length,
          page: 1,
          totalPages: 1
        };
      }
      
      if (url.includes('/grupos') || url.includes('/perfiles')) {
        const perfilesModule = await import('../data/perfiles.js');
        const perfilesData = perfilesModule.perfilesData || perfilesModule.default;
        return {
          data: perfilesData,
          total: perfilesData.length
        };
      }
    } catch (error) {
      console.warn('Error loading static data:', error);
    }
    
    return { data: [], total: 0 };
  }

  // ============= MÉTODOS DE API =============

  /**
   * Obtiene todos los estudios con paginación y filtros
   */
  async getStudies(params = {}) {
    try {
      const response = await this.client.get('/pruebas', { params });
      return {
        ...response.data,
        data: StudyAdapter.fromBackendList(response.data.data)
      };
    } catch (error) {
      console.error('Error fetching studies:', error);
      // Fallback a datos estáticos
      const staticData = await this.getStaticData('/pruebas');
      return this.filterStaticData(staticData, params);
    }
  }

  /**
   * Obtiene un estudio por ID
   */
  async getStudyById(id) {
    try {
      const response = await this.client.get(`/pruebas/${id}`);
      return StudyAdapter.fromBackend(response.data);
    } catch (error) {
      console.error(`Error fetching study ${id}:`, error);
      // Buscar en datos estáticos
      const { estudiosData } = await import('../data/estudios.js');
      const study = estudiosData.find(s => s.id === id || s.codigo === id);
      return study ? StudyAdapter.fromStatic(study) : null;
    }
  }

  /**
   * Obtiene todos los grupos/perfiles
   */
  async getGroups(params = {}) {
    try {
      const response = await this.client.get('/grupos', { params });
      return {
        ...response.data,
        data: response.data.data.map(g => StudyAdapter.fromBackendGroup(g))
      };
    } catch (error) {
      console.error('Error fetching groups:', error);
      const perfilesModule = await import('../data/perfiles.js');
      const perfilesData = perfilesModule.perfilesData || perfilesModule.default;
      return {
        data: perfilesData,
        total: perfilesData.length
      };
    }
  }

  /**
   * Obtiene un grupo por ID con sus pruebas
   */
  async getGroupById(id) {
    try {
      const response = await this.client.get(`/grupos/${id}`);
      return StudyAdapter.fromBackendGroup(response.data);
    } catch (error) {
      console.error(`Error fetching group ${id}:`, error);
      const perfilesModule = await import('../data/perfiles.js');
      const perfilesData = perfilesModule.perfilesData || perfilesModule.default;
      return perfilesData.find(g => g.id === id);
    }
  }

  /**
   * Búsqueda unificada de estudios y grupos
   */
  async search(query, params = {}) {
    try {
      const response = await this.client.get('/search', {
        params: { q: query, ...params }
      });
      
      return {
        estudios: StudyAdapter.fromBackendList(response.data.pruebas || []),
        grupos: (response.data.grupos || []).map(g => StudyAdapter.fromBackendGroup(g)),
        total: response.data.total || 0
      };
    } catch (error) {
      console.error('Error searching:', error);
      // Búsqueda en datos estáticos
      return this.searchStaticData(query, params);
    }
  }

  /**
   * Obtiene todas las áreas disponibles
   */
  async getAreas() {
    try {
      const response = await this.client.get('/areas');
      return response.data;
    } catch (error) {
      console.error('Error fetching areas:', error);
      // Áreas estáticas
      return [
        { id: 1, nombre: 'Hematología', codigo: 'HEM' },
        { id: 2, nombre: 'Química', codigo: 'QUI' },
        { id: 3, nombre: 'Microbiología', codigo: 'MIC' },
        { id: 4, nombre: 'Inmunología', codigo: 'INM' },
        { id: 5, nombre: 'Orina', codigo: 'URI' },
        { id: 6, nombre: 'Hormonas', codigo: 'HOR' },
        { id: 7, nombre: 'Alergias', codigo: 'ALE' },
        { id: 8, nombre: 'Parasitología', codigo: 'PAR' }
      ];
    }
  }

  /**
   * Obtiene las listas de precios disponibles
   */
  async getPriceLists() {
    try {
      const response = await this.client.get('/listas-precios');
      return response.data;
    } catch (error) {
      console.error('Error fetching price lists:', error);
      return [];
    }
  }

  /**
   * Obtiene estadísticas del sistema
   */
  async getStatistics() {
    try {
      const response = await this.client.get('/statistics');
      return response.data;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      // Estadísticas por defecto
      return {
        totalStudies: 450,
        totalGroups: 25,
        totalAreas: 8,
        lastUpdate: new Date().toISOString()
      };
    }
  }

  // ============= MÉTODOS AUXILIARES =============

  /**
   * Filtra datos estáticos según parámetros
   */
  filterStaticData(data, params) {
    let filtered = [...data.data];
    
    // Filtro por área
    if (params.area) {
      filtered = filtered.filter(s => 
        s.area?.toLowerCase() === params.area.toLowerCase()
      );
    }
    
    // Filtro por búsqueda
    if (params.search) {
      const searchLower = params.search.toLowerCase();
      filtered = filtered.filter(s => 
        s.nombre?.toLowerCase().includes(searchLower) ||
        s.codigo?.toLowerCase().includes(searchLower) ||
        s.descripcion?.toLowerCase().includes(searchLower) ||
        s.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    // Filtro por precio
    if (params.minPrice !== undefined) {
      filtered = filtered.filter(s => s.precio >= params.minPrice);
    }
    if (params.maxPrice !== undefined) {
      filtered = filtered.filter(s => s.precio <= params.maxPrice);
    }
    
    // Filtro por ayuno
    if (params.requiresFasting !== undefined) {
      filtered = filtered.filter(s => s.ayuno === params.requiresFasting);
    }
    
    // Paginación
    const page = params.page || 1;
    const limit = params.limit || 20;
    const start = (page - 1) * limit;
    const end = start + limit;
    
    const paginated = filtered.slice(start, end);
    
    return {
      data: paginated,
      total: filtered.length,
      page,
      totalPages: Math.ceil(filtered.length / limit)
    };
  }

  /**
   * Búsqueda en datos estáticos
   */
  async searchStaticData(query, params) {
    const { estudiosData } = await import('../data/estudios.js');
    const perfilesModule = await import('../data/perfiles.js');
    const perfilesData = perfilesModule.perfilesData || perfilesModule.default;
    
    const queryLower = query.toLowerCase();
    
    // Buscar en estudios
    const estudios = estudiosData.filter(s =>
      s.nombre?.toLowerCase().includes(queryLower) ||
      s.codigo?.toLowerCase().includes(queryLower) ||
      s.descripcion?.toLowerCase().includes(queryLower) ||
      s.tags?.some(tag => tag.toLowerCase().includes(queryLower))
    );
    
    // Buscar en perfiles
    const grupos = perfilesData.filter(g =>
      g.nombre?.toLowerCase().includes(queryLower) ||
      g.descripcion?.toLowerCase().includes(queryLower)
    );
    
    return {
      estudios: StudyAdapter.fromStaticList(estudios),
      grupos,
      total: estudios.length + grupos.length
    };
  }

  /**
   * Verifica el estado de la conexión
   */
  async checkConnection() {
    try {
      await this.client.get('/health');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Limpia la cache
   */
  clearCache() {
    this.cache.clear();
  }
}

// Exportar instancia única (singleton)
export default new StudyService();