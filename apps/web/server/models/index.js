// Modelos de datos según estructura de Labsis
// Mapeo de tablas PostgreSQL a objetos JavaScript

import db from '../config/database.js';

// Modelo Prueba (Estudios individuales)
export const Prueba = {
  tableName: 'prueba',
  
  // Obtener todas las pruebas con relaciones
  async findAll(options = {}) {
    const {
      includeArea = true,
      includeTipoMuestra = true,
      includePrecios = true,
      listaPreciosId = 27, // Lista por defecto: Ambulatorio_Abril_2025
      page = 1,
      limit = 100
    } = options;

    let query = `
      SELECT
        p.*
        ${includeArea ? ', a.area as area_nombre' : ''}
        ${includeTipoMuestra ? ', tm.tipo as tipo_muestra_nombre' : ''}
        , lpp.precio as precio_lista,
        -- Valores referenciales activos (subquery)
        (
          SELECT json_agg(
            json_build_object(
              'id', vr.id,
              'edad_desde', vr.edad_desde,
              'edad_hasta', vr.edad_hasta,
              'unidad_tiempo_id', vr.unidad_tiempo_id,
              'unidad_tiempo', ut.unidad,
              'sexo', vr.sexo,
              'valor_desde', vr.valor_desde,
              'valor_hasta', vr.valor_hasta,
              'comentario', vr.comentario,
              'panico', vr.panico,
              'embarazo', vr.embarazo
            ) ORDER BY vr.edad_desde, vr.sexo
          )
          FROM valor_referencial vr
          LEFT JOIN unidad_tiempo ut ON vr.unidad_tiempo_id = ut.id
          WHERE vr.prueba_id = p.id
            AND vr.activo = true
        ) as valores_referenciales
      FROM prueba p
      INNER JOIN lista_precios_has_prueba lpp ON p.id = lpp.prueba_id AND lpp.lista_precios_id = ${listaPreciosId}
      ${includeArea ? 'LEFT JOIN area a ON p.area_id = a.id' : ''}
      ${includeTipoMuestra ? 'LEFT JOIN tipo_muestra tm ON p.tipo_muestra_id = tm.id' : ''}
      WHERE p.activa = true
      ORDER BY p.nombre ASC
      LIMIT $1 OFFSET $2
    `;

    const offset = (page - 1) * limit;
    const result = await db.query(query, [limit, offset]);

    return result.rows;
  },

  // Buscar prueba por ID
  async findById(id) {
    const query = `
      SELECT
        p.*,
        a.area as area_nombre,
        tm.tipo as tipo_muestra_nombre,
        tc.tipo as tipo_contenedor_nombre,
        -- Valores referenciales activos (subquery)
        (
          SELECT json_agg(
            json_build_object(
              'id', vr.id,
              'edad_desde', vr.edad_desde,
              'edad_hasta', vr.edad_hasta,
              'unidad_tiempo_id', vr.unidad_tiempo_id,
              'unidad_tiempo', ut.unidad,
              'sexo', vr.sexo,
              'valor_desde', vr.valor_desde,
              'valor_hasta', vr.valor_hasta,
              'comentario', vr.comentario,
              'panico', vr.panico,
              'embarazo', vr.embarazo
            ) ORDER BY vr.edad_desde, vr.sexo
          )
          FROM valor_referencial vr
          LEFT JOIN unidad_tiempo ut ON vr.unidad_tiempo_id = ut.id
          WHERE vr.prueba_id = p.id
            AND vr.activo = true
        ) as valores_referenciales
      FROM prueba p
      LEFT JOIN area a ON p.area_id = a.id
      LEFT JOIN tipo_muestra tm ON p.tipo_muestra_id = tm.id
      LEFT JOIN tipo_contenedor tc ON p.tipo_contenedor_id = tc.id
      WHERE p.id = $1 AND p.activa = true
    `;

    const result = await db.query(query, [id]);
    return result.rows[0];
  },

  // Buscar pruebas por nomenclatura (código)
  async findByNomenclatura(nomenclatura) {
    const query = `
      SELECT * FROM prueba 
      WHERE nomenclatura = $1 AND activa = true
    `;
    
    const result = await db.query(query, [nomenclatura]);
    return result.rows[0];
  },

  // Buscar pruebas por código (alias para compatibilidad)
  async findByCode(codigo) {
    return this.findByNomenclatura(codigo);
  },

  // Buscar pruebas por área
  async findByArea(areaId) {
    const query = `
      SELECT p.*, a.area as area_nombre
      FROM prueba p
      JOIN area a ON p.area_id = a.id
      WHERE p.area_id = $1 AND p.activa = true
      ORDER BY p.nombre ASC
    `;
    
    const result = await db.query(query, [areaId]);
    return result.rows;
  },

  // Búsqueda de pruebas
  async search(searchTerm, limit = 50, listaPreciosId = 27) {
    const query = `
      SELECT
        p.*,
        a.area as area_nombre,
        tm.tipo as tipo_muestra_nombre,
        lpp.precio as precio_lista,
        -- Valores referenciales activos (subquery)
        (
          SELECT json_agg(
            json_build_object(
              'id', vr.id,
              'edad_desde', vr.edad_desde,
              'edad_hasta', vr.edad_hasta,
              'unidad_tiempo_id', vr.unidad_tiempo_id,
              'unidad_tiempo', ut.unidad,
              'sexo', vr.sexo,
              'valor_desde', vr.valor_desde,
              'valor_hasta', vr.valor_hasta,
              'comentario', vr.comentario,
              'panico', vr.panico,
              'embarazo', vr.embarazo
            ) ORDER BY vr.edad_desde, vr.sexo
          )
          FROM valor_referencial vr
          LEFT JOIN unidad_tiempo ut ON vr.unidad_tiempo_id = ut.id
          WHERE vr.prueba_id = p.id
            AND vr.activo = true
        ) as valores_referenciales
      FROM prueba p
      INNER JOIN lista_precios_has_prueba lpp ON p.id = lpp.prueba_id AND lpp.lista_precios_id = ${listaPreciosId}
      LEFT JOIN area a ON p.area_id = a.id
      LEFT JOIN tipo_muestra tm ON p.tipo_muestra_id = tm.id
      WHERE p.activa = true
        AND (
          p.nombre ILIKE $1 OR
          p.nomenclatura ILIKE $1 OR
          p.descripcion ILIKE $1
        )
      ORDER BY p.nombre ASC
      LIMIT $2
    `;

    const searchPattern = `%${searchTerm}%`;
    const result = await db.query(query, [searchPattern, limit]);

    return result.rows;
  },

  // Obtener precio de una prueba
  async getPrice(pruebaId, listaPreciosId = 1) {
    const query = `
      SELECT 
        lpp.precio,
        lp.nombre as lista_nombre
      FROM lista_precios_has_prueba lpp
      JOIN lista_precios lp ON lpp.lista_precios_id = lp.id
      WHERE lpp.prueba_id = $1 AND lpp.lista_precios_id = $2
    `;
    
    const result = await db.query(query, [pruebaId, listaPreciosId]);
    return result.rows[0];
  }
};

// Modelo GrupoPrueba (Perfiles/Paquetes)
export const GrupoPrueba = {
  tableName: 'grupo_prueba',
  
  // Obtener todos los grupos
  async findAll(options = {}) {
    const { includePrecios = true, listaPreciosId = 27, page = 1, limit = 50 } = options;
    
    let query = `
      SELECT DISTINCT
        gp.*,
        lpg.precio as precio_lista,
        COUNT(DISTINCT ghp.prueba_id) as cantidad_pruebas,
        a.area as area_nombre
      FROM grupo_prueba gp
      INNER JOIN lista_precios_has_gprueba lpg ON gp.id = lpg.gprueba_id AND lpg.lista_precios_id = ${listaPreciosId}
      LEFT JOIN gp_has_prueba ghp ON gp.id = ghp.grupo_p_id
      LEFT JOIN area a ON gp.area_id = a.id
      WHERE gp.activa = true
      GROUP BY gp.id, lpg.precio, a.area
      ORDER BY gp.nombre ASC
      LIMIT $1 OFFSET $2
    `;
    
    const offset = (page - 1) * limit;
    const result = await db.query(query, [limit, offset]);
    
    return result.rows;
  },

  /**
   * Busca un grupo por ID con todas sus relaciones jerárquicas
   * @param {number} id - ID del grupo a buscar
   * @returns {Promise<Object|null>} Grupo con pruebas y relaciones o null si no existe
   * @description Retorna el grupo con:
   * - pruebas: Todas las pruebas reportables (activas e inactivas)
   * - grupos_hijos: Grupos que contiene este grupo
   * - grupos_padres: Grupos que contienen a este grupo
   * - es_padre: Boolean indicando si tiene grupos hijos
   * - es_hijo: Boolean indicando si está contenido en otros grupos
   */
  async findByIdWithPruebas(id, listaPreciosId = 27) {
    // Query para obtener el grupo con el precio de la lista de precios especificada
    const groupQuery = `
      SELECT
        gp.*,
        COALESCE(lpg.precio, gp.precio) as precio_lista
      FROM grupo_prueba gp
      LEFT JOIN lista_precios_has_gprueba lpg
        ON gp.id = lpg.gprueba_id
        AND lpg.lista_precios_id = $2
      WHERE gp.id = $1 AND gp.activa = true
    `;
    
    // Para el árbol: mostrar pruebas activas e inactivas pero reportables
    const pruebasQuery = `
      SELECT 
        p.*,
        a.area as area_nombre,
        tm.tipo as tipo_muestra_nombre
      FROM prueba p
      JOIN gp_has_prueba ghp ON p.id = ghp.prueba_id
      LEFT JOIN area a ON p.area_id = a.id
      LEFT JOIN tipo_muestra tm ON p.tipo_muestra_id = tm.id
      WHERE ghp.grupo_p_id = $1 
        AND p.reportable = true
      ORDER BY p.nombre ASC
    `;
    
    // Query para obtener grupos hijos
    const gruposHijosQuery = `
      SELECT 
        gp.*,
        a.area as area_nombre
      FROM grupo_prueba gp
      JOIN gp_has_gp ghg ON gp.id = ghg.gp_hijo_id
      LEFT JOIN area a ON gp.area_id = a.id
      WHERE ghg.gp_padre_id = $1 AND gp.activa = true
      ORDER BY gp.nombre ASC
    `;
    
    // Query para obtener grupos padres (este grupo es hijo de...)
    const gruposPadresQuery = `
      SELECT 
        gp.*,
        a.area as area_nombre
      FROM grupo_prueba gp
      JOIN gp_has_gp ghg ON gp.id = ghg.gp_padre_id
      LEFT JOIN area a ON gp.area_id = a.id
      WHERE ghg.gp_hijo_id = $1 AND gp.activa = true
      ORDER BY gp.nombre ASC
    `;
    
    const [groupResult, pruebasResult, gruposHijosResult, gruposPadresResult] = await Promise.all([
      db.query(groupQuery, [id, listaPreciosId]),
      db.query(pruebasQuery, [id]),
      db.query(gruposHijosQuery, [id]),
      db.query(gruposPadresQuery, [id])
    ]);
    
    if (groupResult.rows.length === 0) {
      return null;
    }

    const grupo = groupResult.rows[0];

    return {
      ...grupo,
      precio: grupo.precio_lista, // Use precio from lista_precios_id=27
      pruebas: pruebasResult.rows,
      grupos_hijos: gruposHijosResult.rows,
      grupos_padres: gruposPadresResult.rows,
      es_padre: gruposHijosResult.rows.length > 0,
      es_hijo: gruposPadresResult.rows.length > 0
    };
  },
  
  // Obtener árbol jerárquico completo de un grupo
  async getTreeStructure(id, listaPreciosId = 27) {
    const query = `
      WITH RECURSIVE arbol AS (
        -- Nodo raíz
        SELECT 
          gp.id,
          gp.nombre,
          gp.codigo_caja,
          NULL::integer as padre_id,
          0 as nivel,
          ARRAY[gp.id] as path,
          'grupo' as tipo_nodo
        FROM grupo_prueba gp
        WHERE gp.id = $1
        
        UNION ALL
        
        -- Grupos hijos recursivos
        SELECT 
          gp.id,
          gp.nombre,
          gp.codigo_caja,
          ghg.gp_padre_id as padre_id,
          a.nivel + 1,
          a.path || gp.id,
          'grupo' as tipo_nodo
        FROM grupo_prueba gp
        JOIN gp_has_gp ghg ON gp.id = ghg.gp_hijo_id
        JOIN arbol a ON ghg.gp_padre_id = a.id
        WHERE NOT gp.id = ANY(a.path) -- Evitar ciclos
      )
      SELECT 
        a.*,
        ar.area as area_nombre,
        lpg.precio as precio_lista
      FROM arbol a
      JOIN grupo_prueba gp ON a.id = gp.id
      LEFT JOIN area ar ON gp.area_id = ar.id
      LEFT JOIN lista_precios_has_gprueba lpg 
        ON gp.id = lpg.gprueba_id AND lpg.lista_precios_id = $2
      ORDER BY a.path
    `;
    
    const result = await db.query(query, [id, listaPreciosId]);
    return result.rows;
  },

  // Buscar grupos por código
  async findByCode(codigo) {
    const query = `
      SELECT * FROM grupo_prueba 
      WHERE codigo_caja = $1 AND activa = true
    `;
    
    const result = await db.query(query, [codigo]);
    return result.rows[0];
  },

  // Búsqueda de grupos
  async search(searchTerm, limit = 50, listaPreciosId = 27) {
    const query = `
      SELECT DISTINCT
        gp.*,
        lpg.precio as precio_lista,
        COUNT(DISTINCT ghp.prueba_id) as cantidad_pruebas
      FROM grupo_prueba gp
      INNER JOIN lista_precios_has_gprueba lpg ON gp.id = lpg.gprueba_id AND lpg.lista_precios_id = ${listaPreciosId}
      LEFT JOIN gp_has_prueba ghp ON gp.id = ghp.grupo_p_id
      WHERE gp.activa = true
        AND (
          gp.nombre ILIKE $1 OR 
          gp.codigo_caja ILIKE $1 OR 
          gp.descripcion ILIKE $1
        )
      GROUP BY gp.id, lpg.precio
      ORDER BY gp.nombre ASC
      LIMIT $2
    `;
    
    const searchPattern = `%${searchTerm}%`;
    const result = await db.query(query, [searchPattern, limit]);
    
    return result.rows;
  },

  // Obtener precio de un grupo
  async getPrice(grupoId, listaPreciosId = 1) {
    const query = `
      SELECT 
        lpg.precio,
        lp.nombre as lista_nombre
      FROM lista_precios_has_gprueba lpg
      JOIN lista_precios lp ON lpg.lista_precios_id = lp.id
      WHERE lpg.gprueba_id = $1 AND lpg.lista_precios_id = $2
    `;
    
    const result = await db.query(query, [grupoId, listaPreciosId]);
    return result.rows[0];
  }
};

// Modelo ListaPrecios
export const ListaPrecios = {
  tableName: 'lista_precios',
  
  // Obtener todas las listas de precios
  async findAll() {
    const query = `
      SELECT * FROM lista_precios 
      WHERE activo = true
      ORDER BY nombre ASC
    `;
    
    const result = await db.query(query);
    return result.rows;
  },

  // Buscar lista por ID
  async findById(id) {
    const query = `
      SELECT * FROM lista_precios 
      WHERE id = $1 AND activa = true
    `;
    
    const result = await db.query(query, [id]);
    return result.rows[0];
  },

  // Obtener precios completos de una lista
  async getFullPriceList(listaPreciosId) {
    const pruebasQuery = `
      SELECT 
        p.id,
        p.nomenclatura as codigo,
        p.nombre,
        p.descripcion,
        lpp.precio,
        'prueba' as tipo
      FROM prueba p
      JOIN lista_precios_has_prueba lpp ON p.id = lpp.prueba_id
      WHERE lpp.lista_precios_id = $1 AND p.activa = true
    `;
    
    const gruposQuery = `
      SELECT 
        gp.id,
        gp.codigo_caja as codigo,
        gp.nombre,
        gp.descripcion,
        lpg.precio,
        'grupo' as tipo
      FROM grupo_prueba gp
      JOIN lista_precios_has_gprueba lpg ON gp.id = lpg.gprueba_id
      WHERE lpg.lista_precios_id = $1 AND gp.activa = true
    `;
    
    const [pruebasResult, gruposResult] = await Promise.all([
      db.query(pruebasQuery, [listaPreciosId]),
      db.query(gruposQuery, [listaPreciosId])
    ]);
    
    return [...pruebasResult.rows, ...gruposResult.rows];
  }
};

// Modelo Area
export const Area = {
  tableName: 'area',
  
  // Obtener todas las áreas
  async findAll() {
    const query = `
      SELECT 
        a.*,
        a.area as nombre,
        COUNT(DISTINCT p.id) as cantidad_pruebas
      FROM area a
      LEFT JOIN prueba p ON a.id = p.area_id AND p.activa = true
      WHERE a.activa = true
      GROUP BY a.id
      ORDER BY a.area ASC
    `;
    
    const result = await db.query(query);
    return result.rows;
  },

  // Buscar área por ID
  async findById(id) {
    const query = `
      SELECT * FROM area 
      WHERE id = $1 AND activa = true
    `;
    
    const result = await db.query(query, [id]);
    return result.rows[0];
  }
};

// Modelo TipoMuestra
export const TipoMuestra = {
  tableName: 'tipo_muestra',
  
  // Obtener todos los tipos de muestra
  async findAll() {
    const query = `
      SELECT *, tipo as nombre FROM tipo_muestra 
      ORDER BY tipo ASC
    `;
    
    const result = await db.query(query);
    return result.rows;
  },

  // Buscar tipo de muestra por ID
  async findById(id) {
    const query = `
      SELECT *, tipo as nombre FROM tipo_muestra 
      WHERE id = $1
    `;
    
    const result = await db.query(query, [id]);
    return result.rows[0];
  }
};

// Modelo TipoContenedor
export const TipoContenedor = {
  tableName: 'tipo_contenedor',
  
  // Obtener todos los tipos de contenedor
  async findAll() {
    const query = `
      SELECT *, tipo as nombre FROM tipo_contenedor 
      ORDER BY tipo ASC
    `;
    
    const result = await db.query(query);
    return result.rows;
  },

  // Buscar tipo de contenedor por ID
  async findById(id) {
    const query = `
      SELECT *, tipo as nombre FROM tipo_contenedor 
      WHERE id = $1
    `;
    
    const result = await db.query(query, [id]);
    return result.rows[0];
  }
};

// Helper para búsqueda unificada
export const UnifiedSearch = {
  // Búsqueda global en pruebas y grupos
  async search(searchTerm, options = {}) {
    const { 
      includeGroups = true, 
      includePruebas = true,
      listaPreciosId = 27, // Por defecto: Ambulatorio_Abril_2025
      limit = 100 
    } = options;

    const results = {
      pruebas: [],
      grupos: []
    };

    if (includePruebas) {
      const pruebasQuery = `
        SELECT
          p.*,
          a.area as area_nombre,
          tm.tipo as tipo_muestra_nombre,
          lpp.precio,
          'prueba' as tipo,
          -- Valores referenciales activos (subquery)
          (
            SELECT json_agg(
              json_build_object(
                'id', vr.id,
                'edad_desde', vr.edad_desde,
                'edad_hasta', vr.edad_hasta,
                'unidad_tiempo_id', vr.unidad_tiempo_id,
                'unidad_tiempo', ut.unidad,
                'sexo', vr.sexo,
                'valor_desde', vr.valor_desde,
                'valor_hasta', vr.valor_hasta,
                'comentario', vr.comentario,
                'panico', vr.panico,
                'embarazo', vr.embarazo
              ) ORDER BY vr.edad_desde, vr.sexo
            )
            FROM valor_referencial vr
            LEFT JOIN unidad_tiempo ut ON vr.unidad_tiempo_id = ut.id
            WHERE vr.prueba_id = p.id
              AND vr.activo = true
          ) as valores_referenciales
        FROM prueba p
        INNER JOIN lista_precios_has_prueba lpp ON p.id = lpp.prueba_id AND lpp.lista_precios_id = $2
        LEFT JOIN area a ON p.area_id = a.id
        LEFT JOIN tipo_muestra tm ON p.tipo_muestra_id = tm.id
        WHERE p.activa = true
          AND (
            p.nombre ILIKE $1 OR
            p.nomenclatura ILIKE $1 OR
            p.descripcion ILIKE $1
          )
        ORDER BY p.nombre ASC
        LIMIT $3
      `;

      const pruebasResult = await db.query(
        pruebasQuery,
        [`%${searchTerm}%`, listaPreciosId, Math.floor(limit / 2)]
      );

      results.pruebas = pruebasResult.rows;
    }

    if (includeGroups) {
      const gruposQuery = `
        SELECT DISTINCT
          gp.*,
          lpg.precio,
          COUNT(DISTINCT ghp.prueba_id) as cantidad_pruebas,
          'grupo' as tipo
        FROM grupo_prueba gp
        INNER JOIN lista_precios_has_gprueba lpg ON gp.id = lpg.gprueba_id AND lpg.lista_precios_id = $2
        LEFT JOIN gp_has_prueba ghp ON gp.id = ghp.grupo_p_id
        WHERE gp.activa = true
          AND (
            gp.nombre ILIKE $1 OR 
            gp.codigo_caja ILIKE $1 OR 
            gp.descripcion ILIKE $1
          )
        GROUP BY gp.id, lpg.precio
        ORDER BY gp.nombre ASC
        LIMIT $3
      `;
      
      const gruposResult = await db.query(
        gruposQuery, 
        [`%${searchTerm}%`, listaPreciosId, Math.floor(limit / 2)]
      );
      
      results.grupos = gruposResult.rows;
    }

    return results;
  },

  // Obtener estadísticas generales
  async getStatistics() {
    const query = `
      SELECT 
        (SELECT COUNT(*) FROM prueba WHERE activa = true) as total_pruebas,
        (SELECT COUNT(*) FROM grupo_prueba WHERE activa = true) as total_grupos,
        (SELECT COUNT(*) FROM area WHERE activa = true) as total_areas,
        (SELECT COUNT(*) FROM lista_precios WHERE activo = true) as total_listas_precios,
        (SELECT COUNT(*) FROM tipo_muestra) as total_tipos_muestra
    `;
    
    const result = await db.query(query);
    return result.rows[0];
  }
};

// Exportar todos los modelos
export default {
  Prueba,
  GrupoPrueba,
  ListaPrecios,
  Area,
  TipoMuestra,
  TipoContenedor,
  UnifiedSearch
};