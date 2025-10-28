const fs = require('fs').promises;
const path = require('path');
const logger = require('../../utils/logger');

/**
 * PreciosService - Servicio para buscar precios de estudios
 *
 * Lee el archivo precios.json generado por sync-service y lo mantiene en caché
 * Implementa búsqueda fuzzy para encontrar estudios con nombres similares
 */
class PreciosService {
  constructor() {
    this.preciosData = null;
    this.lastLoadTime = null;
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
    this.aliases = null; // Aliases de nombres comunes

    // Rutas posibles para el archivo precios.json
    this.possiblePaths = [
      // PRIORIDAD 1: Data local (copiado automáticamente por sync-service)
      path.join(__dirname, '../../../data/precios.json'),
      // PRIORIDAD 2: Desarrollo local - laboratorio-eg/public/data/
      path.join(__dirname, '../../../../../laboratorio-eg/public/data/precios.json'),
      // PRIORIDAD 3: Producción - ruta absoluta
      '/var/www/laboratorio-eg/public/data/precios.json',
      // PRIORIDAD 4: Alternativa - sync-service output
      path.join(__dirname, '../../../../../sync-service/output/precios.json')
    ];

    // Ruta del archivo de aliases
    this.aliasesPath = path.join(__dirname, '../../data/study-aliases.json');

    // Cargar aliases de forma asíncrona (no bloqueante)
    this.loadAliases();

    logger.info('💰 PreciosService initialized');
  }

  /**
   * Cargar datos de precios desde JSON
   * @returns {Promise<Object>}
   */
  async loadPreciosData() {
    // Si hay datos en caché y no han expirado, usarlos
    if (this.preciosData && this.lastLoadTime) {
      const elapsed = Date.now() - this.lastLoadTime;
      if (elapsed < this.cacheTimeout) {
        logger.info(`📦 Usando precios en caché (${Math.round(elapsed / 1000)}s)`);
        return this.preciosData;
      }
    }

    // Intentar cargar desde cada ruta posible
    for (const filePath of this.possiblePaths) {
      try {
        const data = await fs.readFile(filePath, 'utf8');
        this.preciosData = JSON.parse(data);
        this.lastLoadTime = Date.now();

        logger.info(`✅ Precios cargados desde: ${filePath}`, {
          estudios: this.preciosData.estudios?.length || 0
        });

        return this.preciosData;

      } catch (error) {
        // Si el archivo no existe, intentar la siguiente ruta
        if (error.code === 'ENOENT') {
          continue;
        }
        // Si es otro error (permisos, JSON malformado), loguearlo
        logger.warn(`⚠️  Error leyendo ${filePath}:`, error.message);
      }
    }

    throw new Error('No se pudo cargar precios.json desde ninguna ruta disponible');
  }

  /**
   * Cargar aliases de nombres comunes desde JSON
   * @returns {Promise<void>}
   */
  async loadAliases() {
    try {
      const data = await fs.readFile(this.aliasesPath, 'utf8');
      const aliasData = JSON.parse(data);

      // Crear un mapa plano de alias -> estudios para búsqueda rápida
      this.aliases = new Map();

      // Recorrer todas las categorías y sus aliases
      for (const categoria of Object.values(aliasData.aliases || {})) {
        for (const [alias, estudios] of Object.entries(categoria)) {
          const normalizedAlias = this.normalizeString(alias);
          this.aliases.set(normalizedAlias, estudios);
        }
      }

      logger.info(`📚 ${this.aliases.size} aliases cargados`);

    } catch (error) {
      // No es crítico si no se pueden cargar los aliases
      if (error.code === 'ENOENT') {
        logger.warn('⚠️  Archivo de aliases no encontrado, usando solo búsqueda fuzzy');
      } else {
        logger.warn('⚠️  Error cargando aliases:', error.message);
      }
      this.aliases = new Map(); // Mapa vacío si hay error
    }
  }

  /**
   * Resolver alias a nombres de estudios reales
   * @param {string} searchTerm - Término de búsqueda (posible alias)
   * @returns {Array<string>} - Nombres de estudios reales o array vacío
   */
  resolveAlias(searchTerm) {
    if (!this.aliases || this.aliases.size === 0) {
      return [];
    }

    const normalized = this.normalizeString(searchTerm);
    return this.aliases.get(normalized) || [];
  }

  /**
   * Buscar estudios por nombre (búsqueda fuzzy)
   * @param {Array<string>} searchTerms - Términos de búsqueda
   * @returns {Promise<Array<Object>>} - Estudios encontrados con precios
   */
  async searchStudies(searchTerms) {
    try {
      const data = await this.loadPreciosData();

      if (!data || !data.estudios || data.estudios.length === 0) {
        logger.warn('⚠️  No hay estudios en precios.json');
        return [];
      }

      const results = [];
      const foundIds = new Set(); // Evitar duplicados
      const expandedTerms = []; // Términos expandidos desde aliases

      // PASO 1: Resolver aliases primero
      for (const term of searchTerms) {
        const resolved = this.resolveAlias(term);

        if (resolved.length > 0) {
          logger.info(`📚 Alias "${term}" → [${resolved.join(', ')}]`);
          expandedTerms.push(...resolved);
        } else {
          // No es un alias, usar el término original
          expandedTerms.push(term);
        }
      }

      // PASO 2: Buscar cada término (expandido o original)
      for (const term of expandedTerms) {
        const normalizedTerm = this.normalizeString(term);

        logger.info(`🔍 Buscando: "${term}" (normalizado: "${normalizedTerm}")`);

        // Buscar en todos los estudios
        for (const estudio of data.estudios) {
          // Si ya lo encontramos, skip
          if (foundIds.has(estudio.id)) continue;

          const normalizedNombre = this.normalizeString(estudio.nombre);
          const normalizedCodigo = this.normalizeString(estudio.codigo || '');

          // Búsqueda fuzzy con diferentes niveles de coincidencia
          const score = this.calculateMatchScore(
            normalizedTerm,
            normalizedNombre,
            normalizedCodigo
          );

          // Si tiene score > 0, es una coincidencia
          if (score > 0) {
            results.push({
              ...estudio,
              matchScore: score,
              matchedTerm: term
            });
            foundIds.add(estudio.id);
          }
        }
      }

      // Ordenar por score (mayor a menor)
      results.sort((a, b) => b.matchScore - a.matchScore);

      logger.info(`✅ Encontrados ${results.length} estudios`, {
        searchTerms,
        topMatches: results.slice(0, 3).map(r => ({
          nombre: r.nombre,
          score: r.matchScore,
          precio: r.precio
        }))
      });

      return results;

    } catch (error) {
      logger.error('Error buscando estudios:', error);
      return [];
    }
  }

  /**
   * Normalizar string para búsqueda fuzzy
   * @param {string} str
   * @returns {string}
   */
  normalizeString(str) {
    if (!str) return '';

    return str
      .toLowerCase()
      .normalize('NFD') // Descomponer caracteres con acentos
      .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
      .replace(/[^a-z0-9\s]/g, '') // Solo letras, números y espacios
      .replace(/\s+/g, ' ') // Normalizar espacios
      .trim();
  }

  /**
   * Calcular score de coincidencia entre término de búsqueda y nombre del estudio
   * @param {string} searchTerm - Término normalizado
   * @param {string} nombre - Nombre normalizado del estudio
   * @param {string} codigo - Código normalizado del estudio
   * @returns {number} - Score de 0-100
   */
  calculateMatchScore(searchTerm, nombre, codigo) {
    let score = 0;

    // 1. Coincidencia exacta = 100 puntos
    if (nombre === searchTerm || codigo === searchTerm) {
      return 100;
    }

    // 2. Contiene el término completo = 90 puntos
    if (nombre.includes(searchTerm)) {
      score = 90;
    } else if (codigo.includes(searchTerm)) {
      score = 85;
    }

    // 3. Coincidencia de palabras individuales (más flexible)
    const searchWords = searchTerm.split(' ').filter(w => w.length > 1); // Reducido de 2 a 1
    const nombreWords = nombre.split(' ');
    const codigoWords = codigo.split(' ');

    let matchedWords = 0;
    let partialMatches = 0;

    for (const searchWord of searchWords) {
      let wordMatched = false;

      // Buscar coincidencia exacta de palabra
      if (nombreWords.includes(searchWord)) {
        matchedWords++;
        wordMatched = true;
      }
      // Buscar palabra que contenga el término de búsqueda (más de 70% de coincidencia)
      else if (nombreWords.some(w => w.includes(searchWord) && searchWord.length >= 3)) {
        partialMatches++;
        wordMatched = true;
      }
      // Buscar término de búsqueda que contenga la palabra
      else if (nombreWords.some(w => w.length >= 3 && searchWord.includes(w))) {
        partialMatches++;
        wordMatched = true;
      }

      // Si no se encontró en nombre, buscar en código
      if (!wordMatched) {
        if (codigoWords.some(w => w.includes(searchWord) || searchWord.includes(w))) {
          partialMatches++;
        }
      }
    }

    if (searchWords.length > 0) {
      // Score basado en coincidencias exactas y parciales
      const exactMatchScore = (matchedWords / searchWords.length) * 70;
      const partialMatchScore = (partialMatches / searchWords.length) * 50;
      const combinedScore = exactMatchScore + partialMatchScore;
      score = Math.max(score, combinedScore);
    }

    // 4. Empieza con el término = bonus +15
    if (nombre.startsWith(searchTerm) || codigo.startsWith(searchTerm)) {
      score += 15;
    }

    // 5. Coincidencia parcial de caracteres (para typos) - threshold reducido
    if (score < 30) {
      const similarity = this.levenshteinSimilarity(searchTerm, nombre);
      if (similarity > 0.5) { // Reducido de 0.6 a 0.5
        score = Math.max(score, similarity * 50); // Aumentado de 40 a 50
      }
    }

    // 6. Bonus si todas las palabras de búsqueda aparecen en cualquier orden
    if (searchWords.length > 1) {
      const allWordsPresent = searchWords.every(sw =>
        nombreWords.some(nw => nw.includes(sw) || sw.includes(nw))
      );
      if (allWordsPresent && score > 0) {
        score += 10;
      }
    }

    return Math.min(100, score);
  }

  /**
   * Calcular similitud de Levenshtein (para detectar typos)
   * @param {string} a
   * @param {string} b
   * @returns {number} - Similitud de 0 a 1
   */
  levenshteinSimilarity(a, b) {
    const maxLen = Math.max(a.length, b.length);
    if (maxLen === 0) return 1;

    const distance = this.levenshteinDistance(a, b);
    return 1 - (distance / maxLen);
  }

  /**
   * Distancia de Levenshtein
   * @param {string} a
   * @param {string} b
   * @returns {number}
   */
  levenshteinDistance(a, b) {
    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitución
            matrix[i][j - 1] + 1, // inserción
            matrix[i - 1][j] + 1 // eliminación
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }

  /**
   * Obtener todos los estudios
   * @returns {Promise<Array<Object>>}
   */
  async getAllStudies() {
    const data = await this.loadPreciosData();
    return data?.estudios || [];
  }

  /**
   * Forzar recarga del caché
   * @returns {Promise<void>}
   */
  async reloadCache() {
    this.preciosData = null;
    this.lastLoadTime = null;
    await this.loadPreciosData();
    logger.info('🔄 Caché de precios recargado manualmente');
  }

  /**
   * Obtener estadísticas del caché
   * @returns {Object}
   */
  getCacheStats() {
    return {
      loaded: !!this.preciosData,
      estudios: this.preciosData?.estudios?.length || 0,
      lastLoadTime: this.lastLoadTime,
      cacheAge: this.lastLoadTime ? Date.now() - this.lastLoadTime : null,
      cacheTimeout: this.cacheTimeout
    };
  }
}

// Exportar singleton
module.exports = new PreciosService();
