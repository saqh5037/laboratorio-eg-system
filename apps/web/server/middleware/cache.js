// Sistema de caché con NodeCache y fallback a datos locales
// Optimizado para reducir carga en la base de datos

import NodeCache from 'node-cache';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de caché en memoria
const cacheConfig = {
  development: {
    stdTTL: 300, // 5 minutos
    checkperiod: 60, // Verificar cada minuto
    useClones: false, // Para mejor performance
    maxKeys: 1000
  },
  production: {
    stdTTL: 3600, // 1 hora
    checkperiod: 600, // Verificar cada 10 minutos
    useClones: false,
    maxKeys: 5000
  }
};

// Crear instancia de caché
const cache = new NodeCache(cacheConfig[process.env.NODE_ENV || 'development']);

// Estadísticas de caché
let cacheStats = {
  hits: 0,
  misses: 0,
  sets: 0,
  deletes: 0,
  lastReset: new Date()
};

// Cache manager con fallback
class CacheManager {
  constructor() {
    this.fallbackDataPath = path.join(__dirname, '../data/fallback');
    this.initializeFallbackData();
  }

  // Inicializar datos de fallback
  async initializeFallbackData() {
    try {
      // Crear directorio si no existe
      await fs.mkdir(this.fallbackDataPath, { recursive: true });
      
      // Verificar archivos de fallback
      const files = ['pruebas.json', 'grupos.json', 'areas.json', 'listas_precios.json'];
      
      for (const file of files) {
        const filePath = path.join(this.fallbackDataPath, file);
        
        try {
          await fs.access(filePath);
        } catch {
          // Crear archivo vacío si no existe
          await fs.writeFile(filePath, JSON.stringify({
            data: [],
            lastUpdated: new Date().toISOString()
          }));
        }
      }
      
      console.log('✅ Fallback data initialized');
    } catch (error) {
      console.error('Error initializing fallback data:', error);
    }
  }

  // Obtener datos con caché y fallback
  async get(key, fetchFunction, options = {}) {
    const { 
      ttl = null, 
      forceFetch = false,
      useFallback = true 
    } = options;

    // Si se fuerza fetch, saltar caché
    if (forceFetch) {
      return await this.fetchAndCache(key, fetchFunction, ttl, useFallback);
    }

    // Intentar obtener de caché
    const cachedData = cache.get(key);
    
    if (cachedData !== undefined) {
      cacheStats.hits++;
      console.log(`Cache HIT: ${key}`);
      return cachedData;
    }

    cacheStats.misses++;
    console.log(`Cache MISS: ${key}`);

    // Intentar obtener datos frescos
    return await this.fetchAndCache(key, fetchFunction, ttl, useFallback);
  }

  // Fetch y guardar en caché
  async fetchAndCache(key, fetchFunction, ttl, useFallback) {
    try {
      // Intentar obtener datos de la base de datos
      const data = await fetchFunction();
      
      // Guardar en caché
      if (ttl) {
        cache.set(key, data, ttl);
      } else {
        cache.set(key, data);
      }
      
      cacheStats.sets++;

      // Actualizar fallback si es exitoso
      if (useFallback) {
        await this.updateFallbackData(key, data);
      }

      return data;
    } catch (error) {
      console.error(`Error fetching data for key ${key}:`, error);

      // Usar datos de fallback si están disponibles
      if (useFallback) {
        const fallbackData = await this.getFallbackData(key);
        
        if (fallbackData) {
          console.log(`Using FALLBACK data for: ${key}`);
          
          // Guardar fallback en caché temporalmente
          cache.set(key, fallbackData, 60); // Solo 1 minuto
          
          return fallbackData;
        }
      }

      throw error;
    }
  }

  // Obtener datos de fallback
  async getFallbackData(key) {
    try {
      const fileName = this.getFileNameFromKey(key);
      const filePath = path.join(this.fallbackDataPath, fileName);
      
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const fallbackData = JSON.parse(fileContent);
      
      // Agregar indicador de que son datos de fallback
      if (fallbackData.data) {
        return {
          ...fallbackData.data,
          _isFallback: true,
          _fallbackDate: fallbackData.lastUpdated
        };
      }
      
      return null;
    } catch (error) {
      console.error(`Error reading fallback data for ${key}:`, error);
      return null;
    }
  }

  // Actualizar datos de fallback
  async updateFallbackData(key, data) {
    try {
      const fileName = this.getFileNameFromKey(key);
      const filePath = path.join(this.fallbackDataPath, fileName);
      
      const fallbackData = {
        data,
        lastUpdated: new Date().toISOString()
      };
      
      await fs.writeFile(filePath, JSON.stringify(fallbackData, null, 2));
      console.log(`Fallback data updated for: ${key}`);
    } catch (error) {
      console.error(`Error updating fallback data for ${key}:`, error);
    }
  }

  // Obtener nombre de archivo desde key
  getFileNameFromKey(key) {
    const keyMap = {
      'pruebas': 'pruebas.json',
      'grupos': 'grupos.json',
      'areas': 'areas.json',
      'listas_precios': 'listas_precios.json'
    };

    // Extraer tipo base del key
    const baseKey = key.split(':')[0];
    return keyMap[baseKey] || `${baseKey}.json`;
  }

  // Invalidar caché
  invalidate(pattern) {
    const keys = cache.keys();
    let deleted = 0;

    for (const key of keys) {
      if (key.includes(pattern)) {
        cache.del(key);
        deleted++;
        cacheStats.deletes++;
      }
    }

    console.log(`Cache invalidated: ${deleted} keys matching "${pattern}"`);
    return deleted;
  }

  // Limpiar todo el caché
  flush() {
    cache.flushAll();
    cacheStats.deletes += cache.getStats().keys;
    console.log('Cache flushed completely');
  }

  // Obtener estadísticas de caché
  getStats() {
    const nodeStats = cache.getStats();
    
    return {
      ...cacheStats,
      hitRate: cacheStats.hits / (cacheStats.hits + cacheStats.misses) || 0,
      keys: nodeStats.keys,
      ksize: nodeStats.ksize,
      vsize: nodeStats.vsize
    };
  }

  // Pre-calentar caché con datos comunes
  async warmUp(models) {
    console.log('Warming up cache...');
    
    const warmUpKeys = [
      { key: 'areas:all', fetchFn: () => models.Area.findAll() },
      { key: 'tipos_muestra:all', fetchFn: () => models.TipoMuestra.findAll() },
      { key: 'listas_precios:all', fetchFn: () => models.ListaPrecios.findAll() },
      { key: 'statistics', fetchFn: () => models.UnifiedSearch.getStatistics() }
    ];

    for (const { key, fetchFn } of warmUpKeys) {
      try {
        await this.get(key, fetchFn, { ttl: 3600 }); // 1 hora
        console.log(`✅ Warmed up: ${key}`);
      } catch (error) {
        console.error(`Failed to warm up ${key}:`, error);
      }
    }

    console.log('Cache warm-up completed');
  }
}

// Crear instancia singleton
const cacheManager = new CacheManager();

// Middleware de caché para Express
export const cacheMiddleware = (keyGenerator, options = {}) => {
  return async (req, res, next) => {
    // Generar key de caché
    const cacheKey = typeof keyGenerator === 'function' 
      ? keyGenerator(req) 
      : keyGenerator;

    // Agregar método para invalidar caché en la respuesta
    res.invalidateCache = (pattern) => {
      cacheManager.invalidate(pattern || cacheKey);
    };

    // Si es POST, PUT, DELETE, saltar caché
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
      return next();
    }

    try {
      // Intentar obtener de caché
      const cachedData = cache.get(cacheKey);
      
      if (cachedData !== undefined && !req.query.noCache) {
        cacheStats.hits++;
        
        // Agregar headers de caché
        res.set({
          'X-Cache': 'HIT',
          'X-Cache-Key': cacheKey,
          'X-Cache-TTL': cache.getTtl(cacheKey)
        });
        
        return res.json(cachedData);
      }

      // No encontrado en caché, continuar
      cacheStats.misses++;
      
      // Interceptar res.json para guardar en caché
      const originalJson = res.json.bind(res);
      
      res.json = function(data) {
        // Guardar en caché si la respuesta es exitosa
        if (res.statusCode >= 200 && res.statusCode < 300) {
          const ttl = options.ttl || null;
          
          if (ttl) {
            cache.set(cacheKey, data, ttl);
          } else {
            cache.set(cacheKey, data);
          }
          
          cacheStats.sets++;
          
          // Agregar headers de caché
          res.set({
            'X-Cache': 'MISS',
            'X-Cache-Key': cacheKey,
            'X-Cache-Stored': 'true'
          });
        }
        
        return originalJson(data);
      };
      
      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

// Generar key de caché desde request
export const generateCacheKey = (prefix, req) => {
  const parts = [prefix];
  
  // Agregar parámetros de ruta
  if (req.params && Object.keys(req.params).length > 0) {
    parts.push(Object.values(req.params).join(':'));
  }
  
  // Agregar query strings relevantes
  const relevantQueries = ['page', 'limit', 'sort', 'filter', 'search'];
  
  for (const param of relevantQueries) {
    if (req.query[param]) {
      parts.push(`${param}=${req.query[param]}`);
    }
  }
  
  return parts.join(':');
};

// Cache decorador para funciones asíncronas
export const cacheDecorator = (keyPrefix, ttl = null) => {
  return (target, propertyKey, descriptor) => {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function(...args) {
      const cacheKey = `${keyPrefix}:${propertyKey}:${JSON.stringify(args)}`;
      
      return await cacheManager.get(
        cacheKey,
        () => originalMethod.apply(this, args),
        { ttl }
      );
    };
    
    return descriptor;
  };
};

// Exportar instancia y utilidades
export default cacheManager;
export { cache, CacheManager };