import * as XLSX from 'xlsx';

/**
 * Procesa el archivo Excel del Laboratorio EG
 * @param {File|ArrayBuffer} file - Archivo Excel o buffer
 * @returns {Object} Datos procesados del Excel
 */
export const processExcelFile = async (file) => {
  try {
    let workbook;
    
    if (file instanceof File) {
      const buffer = await file.arrayBuffer();
      workbook = XLSX.read(buffer, { type: 'array' });
    } else {
      workbook = XLSX.read(file, { type: 'array' });
    }

    const data = {
      estudios: [],
      pruebas: [],
      gruposPrueba: [],
      metadata: {
        processedAt: new Date().toISOString(),
        version: '1.0.0'
      }
    };

    // Procesar hoja "Arbol" - Estudios jerárquicos
    if (workbook.Sheets['Arbol']) {
      const arbolData = XLSX.utils.sheet_to_json(workbook.Sheets['Arbol']);
      data.estudios = processArbolData(arbolData);
    }

    // Procesar hoja "Pruebas" - Pruebas individuales con precios
    if (workbook.Sheets['Pruebas']) {
      const pruebasData = XLSX.utils.sheet_to_json(workbook.Sheets['Pruebas']);
      data.pruebas = processPruebasData(pruebasData);
    }

    // Procesar hoja "Grupo Prueba" - Grupos de pruebas con precios
    if (workbook.Sheets['Grupo Prueba']) {
      const gruposData = XLSX.utils.sheet_to_json(workbook.Sheets['Grupo Prueba']);
      data.gruposPrueba = processGruposData(gruposData);
    }

    return data;
  } catch (error) {
    console.error('Error procesando archivo Excel:', error);
    throw new Error(`Error al procesar el archivo: ${error.message}`);
  }
};

/**
 * Procesa los datos de la hoja Arbol (estructura jerárquica)
 * Agrupa estudios por código con sus pruebas asociadas
 */
const processArbolData = (rawData) => {
  // Agrupar por código de estudio
  const estudiosMap = new Map();
  
  rawData.forEach((row) => {
    const codigo = row['código'] || row['Código'] || '';
    const nombreEstudio = row['Nombre del estudio'] || '';
    const nombrePrueba = row['Nombre de la prueba'] || row['Prueba'] || '';
    
    if (!codigo) return;
    
    if (!estudiosMap.has(codigo)) {
      // Es un nuevo estudio
      estudiosMap.set(codigo, {
        id: `EST-${codigo}`,
        codigo: codigo,
        nombre: nombreEstudio,
        tipoEstudio: row['Tipo de estudio'] || '',
        nivel1: row['Nivel 1'] || '',
        nivel2: row['Nivel 2'] || '',
        nivel3: row['Nivel 3'] || '',
        nivel4: row['Nivel 4'] || '',
        pruebas: [],
        jerarquia: buildHierarchy(row),
        searchText: ''
      });
    }
    
    // Si tiene nombre de prueba, agregarla al estudio
    if (nombrePrueba && nombrePrueba !== nombreEstudio) {
      const estudio = estudiosMap.get(codigo);
      estudio.pruebas.push({
        id: `PRU-${codigo}-${estudio.pruebas.length + 1}`,
        nombre: nombrePrueba,
        codigoEstudio: codigo,
        unidad: row['Unidad'] || '',
        rangoReferencia: row['Rango'] || row['Referencia'] || ''
      });
    }
  });
  
  // Convertir el mapa a array y actualizar searchText
  return Array.from(estudiosMap.values()).map(estudio => ({
    ...estudio,
    searchText: buildSearchTextWithPruebas(estudio)
  }));
};

/**
 * Procesa los datos de la hoja Pruebas
 */
const processPruebasData = (rawData) => {
  return rawData.map((row, index) => ({
    id: `PRU-${index + 1}`,
    codigo: row['Código'] || row['codigo'] || '',
    nombre: row['Nombre'] || row['Prueba'] || '',
    precio: parsePrice(row['Precio'] || row['Precio $']),
    categoria: row['Categoría'] || row['Tipo'] || '',
    tiempoEntrega: row['Tiempo'] || '',
    preparacion: row['Preparación'] || ''
  }));
};

/**
 * Procesa los datos de la hoja Grupo Prueba
 */
const processGruposData = (rawData) => {
  return rawData.map((row, index) => ({
    id: `GRP-${index + 1}`,
    codigo: row['Código'] || '',
    nombre: row['Nombre'] || row['Grupo'] || '',
    precio: parsePrice(row['Precio'] || row['Precio $']),
    pruebas: row['Pruebas'] || '',
    descripcion: row['Descripción'] || ''
  }));
};

/**
 * Construye la jerarquía completa del estudio
 */
const buildHierarchy = (row) => {
  const levels = [];
  if (row['Nivel 1']) levels.push(row['Nivel 1']);
  if (row['Nivel 2']) levels.push(row['Nivel 2']);
  if (row['Nivel 3']) levels.push(row['Nivel 3']);
  if (row['Nivel 4']) levels.push(row['Nivel 4']);
  return levels;
};

/**
 * Construye texto para búsqueda
 */
const buildSearchText = (row) => {
  const parts = [
    row['Tipo de estudio'],
    row['Nombre del estudio'],
    row['Nivel 1'],
    row['Nivel 2'],
    row['Nivel 3'],
    row['Nivel 4'],
    row['código']
  ].filter(Boolean);
  
  return parts.join(' ').toLowerCase();
};

/**
 * Construye texto para búsqueda incluyendo pruebas
 */
const buildSearchTextWithPruebas = (estudio) => {
  const parts = [
    estudio.tipoEstudio,
    estudio.nombre,
    estudio.codigo,
    ...estudio.jerarquia,
    ...estudio.pruebas.map(p => p.nombre)
  ].filter(Boolean);
  
  return parts.join(' ').toLowerCase();
};

/**
 * Parsea el precio a número
 */
const parsePrice = (price) => {
  if (!price) return 0;
  const cleaned = String(price).replace(/[$,]/g, '');
  return parseFloat(cleaned) || 0;
};

/**
 * Convierte la estructura plana en árbol navegable
 */
export const buildTreeStructure = (estudios) => {
  const tree = {
    id: 'root',
    name: 'Estudios de Laboratorio',
    type: 'root',
    children: [],
    expanded: true
  };
  
  // Crear mapa de categorías para agrupar
  const categoriesMap = new Map();
  
  estudios.forEach(estudio => {
    // Crear ruta de categorías basada en jerarquía
    let currentPath = [];
    let currentNode = tree;
    
    estudio.jerarquia.forEach((nivel, index) => {
      currentPath.push(nivel);
      const pathKey = currentPath.join('/');
      
      // Buscar si ya existe este nodo
      let node = currentNode.children.find(n => n.name === nivel);
      
      if (!node) {
        node = {
          id: `cat-${pathKey}`,
          name: nivel,
          type: 'category',
          level: index + 1,
          children: [],
          estudios: [],
          expanded: false,
          count: 0
        };
        currentNode.children.push(node);
      }
      
      currentNode = node;
    });
    
    // Agregar el estudio al último nodo
    if (currentNode) {
      const estudioNode = {
        id: estudio.id,
        codigo: estudio.codigo,
        name: estudio.nombre,
        type: 'estudio',
        pruebas: estudio.pruebas || [],
        precio: estudio.precio,
        tiempoEntrega: estudio.tiempoEntrega,
        preparacion: estudio.preparacion,
        children: estudio.pruebas ? estudio.pruebas.map(prueba => ({
          id: prueba.id,
          name: prueba.nombre,
          type: 'prueba',
          codigoEstudio: prueba.codigoEstudio,
          unidad: prueba.unidad,
          rangoReferencia: prueba.rangoReferencia
        })) : []
      };
      
      currentNode.estudios = currentNode.estudios || [];
      currentNode.estudios.push(estudioNode);
      currentNode.count = (currentNode.count || 0) + 1;
    }
  });
  
  // Función recursiva para actualizar contadores
  const updateCounts = (node) => {
    if (node.children && node.children.length > 0) {
      let totalCount = 0;
      node.children.forEach(child => {
        updateCounts(child);
        totalCount += child.count || 0;
      });
      // Si tiene estudios directos, sumarlos también
      if (node.estudios) {
        totalCount += node.estudios.length;
      }
      node.count = totalCount;
    } else if (node.estudios) {
      node.count = node.estudios.length;
    }
  };
  
  updateCounts(tree);
  
  return tree;
};

/**
 * Combina datos de precios con estudios
 */
export const mergeWithPrices = (estudios, pruebas, grupos) => {
  const pruebaMap = new Map();
  const grupoMap = new Map();
  
  // Crear mapas para búsqueda rápida
  pruebas.forEach(prueba => {
    pruebaMap.set(prueba.codigo.toLowerCase(), prueba);
    pruebaMap.set(prueba.nombre.toLowerCase(), prueba);
  });
  
  grupos.forEach(grupo => {
    grupoMap.set(grupo.codigo.toLowerCase(), grupo);
    grupoMap.set(grupo.nombre.toLowerCase(), grupo);
  });
  
  // Combinar con estudios
  return estudios.map(estudio => {
    const codigo = estudio.codigo.toLowerCase();
    const nombre = estudio.nombre.toLowerCase();
    
    let precioInfo = null;
    
    // Buscar en pruebas individuales
    if (pruebaMap.has(codigo) || pruebaMap.has(nombre)) {
      precioInfo = pruebaMap.get(codigo) || pruebaMap.get(nombre);
    }
    // Buscar en grupos
    else if (grupoMap.has(codigo) || grupoMap.has(nombre)) {
      precioInfo = grupoMap.get(codigo) || grupoMap.get(nombre);
    }
    
    return {
      ...estudio,
      precio: precioInfo?.precio || null,
      tiempoEntrega: precioInfo?.tiempoEntrega || estudio.tiempoEntrega,
      preparacion: precioInfo?.preparacion || estudio.preparacion
    };
  });
};

/**
 * Funciones de búsqueda y filtrado
 */
export const searchStudies = (estudios, searchTerm, filters = {}) => {
  let results = [...estudios];
  
  // Búsqueda por texto
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    results = results.filter(estudio => 
      estudio.searchText.includes(term) ||
      estudio.codigo.toLowerCase().includes(term)
    );
  }
  
  // Filtro por categoría/tipo
  if (filters.tipoEstudio) {
    results = results.filter(estudio => 
      estudio.tipoEstudio === filters.tipoEstudio
    );
  }
  
  // Filtro por nivel jerárquico
  if (filters.nivel1) {
    results = results.filter(estudio => 
      estudio.nivel1 === filters.nivel1
    );
  }
  
  // Filtro por rango de precio
  if (filters.precioMin !== undefined || filters.precioMax !== undefined) {
    results = results.filter(estudio => {
      if (!estudio.precio) return false;
      if (filters.precioMin && estudio.precio < filters.precioMin) return false;
      if (filters.precioMax && estudio.precio > filters.precioMax) return false;
      return true;
    });
  }
  
  return results;
};

/**
 * Obtiene todas las categorías únicas
 */
export const getUniqueCategories = (estudios) => {
  const categories = {
    tiposEstudio: new Set(),
    nivel1: new Set(),
    nivel2: new Set(),
    nivel3: new Set()
  };
  
  estudios.forEach(estudio => {
    if (estudio.tipoEstudio) categories.tiposEstudio.add(estudio.tipoEstudio);
    if (estudio.nivel1) categories.nivel1.add(estudio.nivel1);
    if (estudio.nivel2) categories.nivel2.add(estudio.nivel2);
    if (estudio.nivel3) categories.nivel3.add(estudio.nivel3);
  });
  
  return {
    tiposEstudio: Array.from(categories.tiposEstudio).sort(),
    nivel1: Array.from(categories.nivel1).sort(),
    nivel2: Array.from(categories.nivel2).sort(),
    nivel3: Array.from(categories.nivel3).sort()
  };
};

/**
 * Exporta los datos a JSON optimizado
 */
export const exportToJSON = (data) => {
  const optimized = {
    ...data,
    metadata: {
      ...data.metadata,
      exportedAt: new Date().toISOString(),
      totalEstudios: data.estudios.length,
      totalPruebas: data.pruebas.length,
      totalGrupos: data.gruposPrueba.length
    }
  };
  
  return JSON.stringify(optimized, null, 2);
};

/**
 * Cache en localStorage
 */
export const cacheManager = {
  CACHE_KEY: 'lab_eg_data_cache',
  CACHE_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7 días
  
  save: (data) => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
        version: '1.0.0'
      };
      localStorage.setItem(cacheManager.CACHE_KEY, JSON.stringify(cacheData));
      return true;
    } catch (error) {
      console.error('Error guardando cache:', error);
      return false;
    }
  },
  
  load: () => {
    try {
      const cached = localStorage.getItem(cacheManager.CACHE_KEY);
      if (!cached) return null;
      
      const cacheData = JSON.parse(cached);
      const age = Date.now() - cacheData.timestamp;
      
      if (age > cacheManager.CACHE_EXPIRY) {
        cacheManager.clear();
        return null;
      }
      
      return cacheData.data;
    } catch (error) {
      console.error('Error cargando cache:', error);
      return null;
    }
  },
  
  clear: () => {
    localStorage.removeItem(cacheManager.CACHE_KEY);
  }
};