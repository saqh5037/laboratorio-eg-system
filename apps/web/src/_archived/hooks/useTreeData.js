import { useMemo } from 'react';
import { useLabData } from './useLabData';
import { buildTreeStructure } from '../utils/excelProcessor';

/**
 * Hook para transformar los datos del laboratorio en estructura de árbol jerárquica
 * con soporte para estudios y sus pruebas asociadas
 */
export const useTreeData = () => {
  const labData = useLabData({ autoLoad: true, useCache: true });
  
  const treeData = useMemo(() => {
    if (!labData.data || !labData.data.estudios) return [];
    
    // Usar el procesador mejorado que maneja estudios con pruebas
    const tree = buildTreeStructure(labData.data.estudios);
    
    // Si el árbol tiene una estructura de objeto con children, extraer los children
    if (tree && tree.children && Array.isArray(tree.children)) {
      return tree.children;
    }
    
    // Si es un array directo, retornarlo
    if (Array.isArray(tree)) {
      return tree;
    }
    
    // Como fallback, crear estructura básica
    return createBasicTreeStructure(labData.data.estudios);
  }, [labData.data]);
  
  // Función de fallback para crear estructura básica
  const createBasicTreeStructure = (estudios) => {
    const nodeMap = new Map();
    const rootNodes = [];
    
    estudios.forEach(estudio => {
      if (!estudio.jerarquia || estudio.jerarquia.length === 0) return;
      
      let currentPath = '';
      let parentNode = null;
      
      // Construir la jerarquía nivel por nivel
      estudio.jerarquia.forEach((nivel, index) => {
        currentPath = currentPath ? `${currentPath}/${nivel}` : nivel;
        
        if (!nodeMap.has(currentPath)) {
          const node = {
            id: currentPath,
            name: nivel,
            path: currentPath,
            level: index,
            type: 'category',
            children: [],
            estudios: [],
            parent: parentNode,
            count: 0,
            expanded: false
          };
          
          nodeMap.set(currentPath, node);
          
          if (parentNode) {
            parentNode.children.push(node);
          } else {
            rootNodes.push(node);
          }
        }
        
        parentNode = nodeMap.get(currentPath);
      });
      
      // Agregar el estudio al último nodo con sus pruebas
      if (parentNode) {
        const estudioNode = {
          id: estudio.id,
          name: estudio.nombre,
          codigo: estudio.codigo,
          precio: estudio.precio,
          tiempoEntrega: estudio.tiempoEntrega,
          preparacion: estudio.preparacion,
          tipoEstudio: estudio.tipoEstudio,
          type: 'estudio',
          pruebas: estudio.pruebas || [],
          parent: parentNode,
          children: estudio.pruebas ? estudio.pruebas.map(prueba => ({
            ...prueba,
            type: 'prueba',
            parent: estudio
          })) : []
        };
        
        parentNode.estudios.push(estudioNode);
        parentNode.count = (parentNode.count || 0) + 1;
      }
    });
    
    // Función para procesar y limpiar nodos
    const processNode = (node) => {
      // Actualizar contador basado en estudios directos y categorías hijas
      let totalCount = node.estudios ? node.estudios.length : 0;
      
      // Procesar hijos recursivamente
      if (node.children) {
        node.children.forEach(processNode);
        // Sumar contadores de hijos
        totalCount += node.children.reduce((sum, child) => sum + (child.count || 0), 0);
      }
      
      node.count = totalCount;
      
      // Ordenar hijos y estudios
      if (node.children) {
        node.children.sort((a, b) => a.name.localeCompare(b.name, 'es'));
      }
      if (node.estudios) {
        node.estudios.sort((a, b) => a.name.localeCompare(b.name, 'es'));
      }
      
      return node;
    };
    
    // Procesar todos los nodos raíz
    rootNodes.forEach(processNode);
    
    // Ordenar nodos raíz
    rootNodes.sort((a, b) => a.name.localeCompare(b.name, 'es'));
    
    return rootNodes;
  };
  
  // Función para buscar un nodo por ID (categoría, estudio o prueba)
  const findNode = useMemo(() => {
    return (nodeId, nodes = treeData) => {
      for (const node of nodes) {
        if (node.id === nodeId) return node;
        
        // Buscar en categorías hijas
        if (node.children) {
          const found = findNode(nodeId, node.children);
          if (found) return found;
        }
        
        // Buscar en estudios directos
        if (node.estudios) {
          const estudio = node.estudios.find(e => e.id === nodeId);
          if (estudio) return estudio;
          
          // Buscar en pruebas de cada estudio
          for (const estudio of node.estudios) {
            if (estudio.pruebas) {
              const prueba = estudio.pruebas.find(p => p.id === nodeId);
              if (prueba) return prueba;
            }
          }
        }
      }
      return null;
    };
  }, [treeData]);
  
  // Función para buscar estudios por código
  const findEstudioByCodigo = useMemo(() => {
    return (codigo, nodes = treeData) => {
      for (const node of nodes) {
        // Buscar en estudios directos
        if (node.estudios) {
          const estudio = node.estudios.find(e => 
            e.codigo?.toLowerCase() === codigo.toLowerCase()
          );
          if (estudio) return estudio;
        }
        
        // Buscar recursivamente en hijos
        if (node.children) {
          const found = findEstudioByCodigo(codigo, node.children);
          if (found) return found;
        }
      }
      return null;
    };
  }, [treeData]);
  
  // Función para buscar estudios que contengan una prueba específica
  const findEstudiosByPrueba = useMemo(() => {
    return (nombrePrueba, nodes = treeData) => {
      const resultados = [];
      const searchTerm = nombrePrueba.toLowerCase();
      
      const searchInNodes = (nodes) => {
        for (const node of nodes) {
          // Buscar en estudios directos
          if (node.estudios) {
            for (const estudio of node.estudios) {
              if (estudio.pruebas) {
                const tienePrueba = estudio.pruebas.some(p => 
                  p.nombre?.toLowerCase().includes(searchTerm)
                );
                if (tienePrueba) {
                  resultados.push(estudio);
                }
              }
            }
          }
          
          // Buscar recursivamente en hijos
          if (node.children) {
            searchInNodes(node.children);
          }
        }
      };
      
      searchInNodes(nodes);
      return resultados;
    };
  }, [treeData]);
  
  // Función para obtener el path completo de un nodo
  const getNodePath = useMemo(() => {
    return (node) => {
      const path = [];
      let current = node;
      
      while (current && current.parent) {
        path.unshift(current);
        current = current.parent;
      }
      
      // Agregar el nodo actual si no tiene parent (nodo raíz)
      if (current) {
        path.unshift(current);
      }
      
      return path;
    };
  }, []);
  
  // Función para obtener estadísticas del árbol
  const getTreeStats = useMemo(() => {
    if (!treeData || treeData.length === 0) {
      return {
        totalCategorias: 0,
        totalEstudios: 0,
        totalPruebas: 0,
        maxDepth: 0,
        rootNodes: 0
      };
    }
    
    let totalCategorias = 0;
    let totalEstudios = 0;
    let totalPruebas = 0;
    let maxDepth = 0;
    
    const countNodes = (nodes, depth = 0) => {
      nodes.forEach(node => {
        totalCategorias++;
        maxDepth = Math.max(maxDepth, depth);
        
        // Contar estudios directos y sus pruebas
        if (node.estudios) {
          totalEstudios += node.estudios.length;
          node.estudios.forEach(estudio => {
            if (estudio.pruebas) {
              totalPruebas += estudio.pruebas.length;
            }
          });
        }
        
        // Procesar hijos recursivamente
        if (node.children) {
          countNodes(node.children, depth + 1);
        }
      });
    };
    
    countNodes(treeData);
    
    return {
      totalCategorias,
      totalEstudios,
      totalPruebas,
      maxDepth,
      rootNodes: treeData.length
    };
  }, [treeData]);
  
  return {
    treeData,
    loading: labData.loading,
    error: labData.error,
    findNode,
    findEstudioByCodigo,
    findEstudiosByPrueba,
    getNodePath,
    getTreeStats,
    reload: labData.reload
  };
};