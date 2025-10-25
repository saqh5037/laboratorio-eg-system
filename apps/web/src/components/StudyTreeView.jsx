import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaSitemap, 
  FaChevronRight, 
  FaChevronDown, 
  FaFolder,
  FaFlask,
  FaLayerGroup
} from 'react-icons/fa';

/**
 * StudyTreeView - Visualizador de árbol jerárquico para grupos de pruebas
 *
 * @component
 * @description Muestra la estructura jerárquica interna de un grupo de pruebas,
 * incluyendo todos los subgrupos y pruebas contenidas de forma recursiva.
 * Solo muestra pruebas reportables según la configuración de la base de datos.
 *
 * @param {Object} props - Propiedades del componente
 * @param {string} props.studyId - ID del estudio (formato: "grupo-123" o "prueba-123")
 * @param {string} props.studyName - Nombre del estudio
 * @param {string} props.studyCode - Código del estudio
 * @param {string} props.studyType - Tipo de estudio ("grupo" o "prueba")
 * @param {Array} props.pruebas - Array de pruebas contenidas en el grupo (opcional)
 * @param {number} props.cantidadPruebas - Cantidad de pruebas en el grupo
 *
 * @example
 * <StudyTreeView
 *   studyId="grupo-1"
 *   studyName="Hematología Completa"
 *   studyCode="HC001"
 *   studyType="grupo"
 *   pruebas={[...]}
 *   cantidadPruebas={4}
 * />
 */
const StudyTreeView = ({ studyId, studyName, studyCode, studyType, pruebas = [], cantidadPruebas = 0 }) => {
  const [treeData, setTreeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState(new Set(['root']));

  /**
   * Carga recursivamente el árbol completo de un grupo
   * @param {number} groupId - ID del grupo a cargar
   * @returns {Promise<Object|null>} Datos del grupo con sus hijos o null si hay error
   */
  const loadGroupTree = useCallback(async (groupId) => {
    try {
      const apiUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:3001' 
        : `http://${window.location.hostname}:3001`;
      const response = await fetch(`${apiUrl}/api/grupos/${groupId}`);
      const data = await response.json();
      
      if (!data.success) return null;
      
      const group = data.data;
      
      // Cargar recursivamente los grupos hijos si existen
      if (group.grupos_hijos?.length > 0) {
        const childrenPromises = group.grupos_hijos.map(hijo => 
          loadGroupTree(hijo.id)
        );
        group.grupos_hijos_completos = await Promise.all(childrenPromises);
      }
      
      return group;
    } catch (err) {
      console.error(`Error loading group ${groupId}:`, err);
      return null;
    }
  }, []);

  /**
   * Carga los datos del árbol cuando el componente se monta o cambian las props
   */
  const loadTreeData = useCallback(async () => {
    if (!studyId || studyType !== 'grupo') return;

    setLoading(true);
    setError(null);

    try {
      // Si tenemos pruebas directamente en las props, usar esas
      if (pruebas && pruebas.length > 0) {
        // Crear estructura de árbol simple con las pruebas del JSON
        const simpleTree = {
          id: studyId.replace('grupo-', ''),
          nombre: studyName,
          codigo_caja: studyCode,
          pruebas: pruebas.map(p => ({
            id: p.prueba_id,
            nombre: p.nombre,
            nomenclatura: p.codigo,
            reportable: p.reportable
          })),
          grupos_hijos_completos: []
        };

        setTreeData(simpleTree);
        setLoading(false);
        return;
      }

      // Fallback: intentar cargar desde el API si no hay pruebas en props
      const numericId = studyId.replace('grupo-', '');
      const fullTree = await loadGroupTree(numericId);

      if (fullTree) {
        setTreeData(fullTree);
      } else {
        setError('No se pudo cargar el árbol');
      }
    } catch (err) {
      console.error('Error loading tree:', err);
      setError('Error al cargar el árbol');
    } finally {
      setLoading(false);
    }
  }, [studyId, studyType, studyName, studyCode, pruebas, loadGroupTree]);

  // Efecto para cargar datos cuando cambian las dependencias
  useEffect(() => {
    loadTreeData();
  }, [loadTreeData]);

  /**
   * Alterna el estado expandido/colapsado de un nodo
   * @param {string} nodeId - ID del nodo a alternar
   */
  const toggleNode = useCallback((nodeId) => {
    setExpandedNodes(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(nodeId)) {
        newExpanded.delete(nodeId);
      } else {
        newExpanded.add(nodeId);
      }
      return newExpanded;
    });
  }, []);

  /**
   * Componente interno recursivo para renderizar cada nodo del árbol
   * IMPORTANTE: Debe estar antes de los returns condicionales para cumplir con Rules of Hooks
   */
  const TreeNode = useCallback(({ node, level = 0, nodeKey }) => {
    const isExpanded = expandedNodes.has(nodeKey);
    const hasChildren = (node.grupos_hijos_completos?.length > 0) ||
                       (node.pruebas?.length > 0);

    return (
      <div className={`${level > 0 ? 'ml-4' : ''}`}>
        {/* Nodo del grupo */}
        <div
          className={`flex items-center gap-2 py-1.5 px-2 hover:bg-gray-50 rounded cursor-pointer ${
            level === 0 ? 'bg-eg-purple/10 font-semibold' : ''
          }`}
          onClick={() => hasChildren && toggleNode(nodeKey)}
        >
          {hasChildren && (
            isExpanded ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />
          )}
          {!hasChildren && <span className="w-3" />}

          {level === 0 ? (
            <FaLayerGroup className="text-eg-purple" size={16} />
          ) : (
            <FaFolder className="text-yellow-500" size={14} />
          )}

          <span className={`${level === 0 ? 'text-eg-purple' : 'text-sm'}`}>
            {node.nombre}
          </span>

          {node.codigo_caja && (
            <span className="text-xs text-gray-500 ml-1">({node.codigo_caja})</span>
          )}

          {/* Badges con contadores */}
          <div className="ml-auto flex gap-2">
            {node.grupos_hijos_completos && node.grupos_hijos_completos.length > 0 && (
              <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">
                {node.grupos_hijos_completos.length} grupos
              </span>
            )}
            {node.pruebas && node.pruebas.length > 0 && (
              <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                {node.pruebas.length} pruebas
              </span>
            )}
          </div>
        </div>

        {/* Contenido expandido */}
        <AnimatePresence>
          {isExpanded && hasChildren && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Grupos hijos recursivos */}
              {node.grupos_hijos_completos && node.grupos_hijos_completos.map((hijo) => (
                hijo && <TreeNode
                  key={`grupo-${hijo.id}`}
                  node={hijo}
                  level={level + 1}
                  nodeKey={`${nodeKey}-grupo-${hijo.id}`}
                />
              ))}

              {/* Pruebas del grupo */}
              {node.pruebas && node.pruebas.map((prueba, idx) => (
                <motion.div
                  key={prueba.id}
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: idx * 0.02 }}
                  className={`flex items-center gap-2 py-1 px-2 hover:bg-blue-50 rounded ${
                    level > 0 ? 'ml-8' : 'ml-4'
                  }`}
                >
                  <span className="w-3" />
                  <FaFlask className="text-blue-500" size={12} />
                  <span className="text-sm text-gray-700">{prueba.nombre}</span>
                  {prueba.nomenclatura && (
                    <span className="text-xs text-gray-500">[{prueba.nomenclatura}]</span>
                  )}
                  {prueba.area_nombre && (
                    <span className="text-xs text-gray-400 ml-auto">{prueba.area_nombre}</span>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }, [expandedNodes, toggleNode]);

  if (studyType !== 'grupo') {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-blue-700">
          <FaFlask />
          <span className="font-medium">Prueba Individual</span>
        </div>
        <p className="text-sm text-blue-600 mt-2">
          Las pruebas individuales no tienen estructura de árbol jerárquico.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eg-purple"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (!treeData) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-eg-purple to-eg-purpleDark p-4">
        <div className="flex items-center gap-3 text-white">
          <FaSitemap size={20} />
          <div>
            <h3 className="font-semibold text-lg">Contenido del Estudio</h3>
            <p className="text-sm opacity-90">Árbol jerárquico completo</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Árbol recursivo */}
        {treeData && (
          <TreeNode 
            node={treeData} 
            level={0} 
            nodeKey="root"
          />
        )}
        
        {/* Estadísticas totales */}
        {treeData && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-600">
              <div className="font-medium mb-2">Resumen del contenido:</div>
              <div className="grid grid-cols-2 gap-2">
                {treeData.grupos_hijos && (
                  <div className="flex items-center gap-1">
                    <FaFolder className="text-yellow-500" size={12} />
                    <span>{treeData.grupos_hijos.length} grupos directos</span>
                  </div>
                )}
                {treeData.pruebas && (
                  <div className="flex items-center gap-1">
                    <FaFlask className="text-blue-500" size={12} />
                    <span>{treeData.pruebas.length} pruebas</span>
                  </div>
                )}
              </div>
              {treeData.es_hijo && (
                <div className="mt-2 text-gray-500">
                  Este grupo está contenido en otros {treeData.grupos_padres?.length || 0} grupos
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyTreeView;