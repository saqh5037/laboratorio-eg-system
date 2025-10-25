import { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaChevronRight,
  FaChevronDown,
  FaFolder,
  FaFolderOpen,
  FaFlask,
  FaVial,
  FaMicroscope,
  FaDna,
  FaHeartbeat,
  FaSyringe,
  FaSearch,
  FaStar,
  FaRegStar,
  FaTimes,
  FaHome,
  FaStethoscope,
  FaXRay,
  FaUserMd,
  FaVials,
  FaClipboardList,
  FaNotesMedical,
  FaFileMedical,
  FaFileAlt
} from 'react-icons/fa';

// Iconos médicos por tipo de estudio o categoría
const getNodeIcon = (node) => {
  // Iconos específicos por tipo de nodo
  if (node.type === 'prueba') return FaVial;
  if (node.type === 'estudio') return FaFlask;
  if (node.type === 'category') return FaFolder;
  
  // Iconos por nombre de categoría
  const categoryIcons = {
    'Química': FaFlask,
    'Hematología': FaVials,
    'Hematología Completa': FaVials,
    'Microbiología': FaMicroscope,
    'Genética': FaDna,
    'Cardiología': FaHeartbeat,
    'Inmunología': FaSyringe,
    'Radiología': FaXRay,
    'Medicina General': FaStethoscope,
    'Especialidades': FaUserMd,
    'Orina': FaVial,
    'Hormonas': FaClipboardList,
    'Perfiles': FaNotesMedical,
    'Cultivos': FaMicroscope,
    'Panel': FaFileMedical
  };
  
  // Buscar coincidencia parcial en el nombre
  for (const [key, icon] of Object.entries(categoryIcons)) {
    if (node.name?.toLowerCase().includes(key.toLowerCase())) {
      return icon;
    }
  }
  
  return FaFileAlt;
};

// Componente de nodo individual del árbol
const TreeNode = memo(({ 
  node, 
  level = 0, 
  onSelect, 
  selectedId, 
  expandedNodes, 
  onToggleExpand,
  favorites,
  onToggleFavorite,
  searchTerm,
  onDragStart,
  onDragEnd
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const isExpanded = expandedNodes.has(node.id);
  const isSelected = selectedId === node.id;
  const isFavorite = favorites.has(node.id);
  
  // Determinar si el nodo tiene hijos (categorías o pruebas)
  const hasChildren = (node.children && node.children.length > 0) || 
                      (node.estudios && node.estudios.length > 0);
  
  // Calcular contador total (estudios + pruebas)
  const nodeCount = useMemo(() => {
    let count = 0;
    
    // Contar estudios directos
    if (node.estudios) {
      count += node.estudios.length;
    }
    
    // Si es un estudio con pruebas
    if (node.pruebas) {
      count = node.pruebas.length;
    }
    
    // Si tiene count predefinido (categorías)
    if (node.count !== undefined) {
      return node.count;
    }
    
    return count;
  }, [node]);
  
  // Resaltar término de búsqueda
  const highlightText = (text) => {
    if (!searchTerm || !text) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) => 
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200 text-gray-900 rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };
  
  const handleClick = useCallback(() => {
    if (hasChildren) {
      onToggleExpand(node.id);
    }
    onSelect(node);
  }, [hasChildren, node, onToggleExpand, onSelect]);
  
  const Icon = getNodeIcon(node);
  
  // Determinar color del icono basado en el tipo
  const getIconColor = () => {
    if (isSelected) return 'text-white';
    if (node.type === 'prueba') return 'text-eg-pink';
    if (node.type === 'estudio') return 'text-eg-purple';
    if (node.type === 'category') return 'text-eg-purpleDark';
    return 'text-eg-gray';
  };
  
  // Obtener los hijos para renderizar
  const getChildren = () => {
    const children = [];
    
    // Agregar categorías hijas
    if (node.children) {
      children.push(...node.children);
    }
    
    // Agregar estudios directos
    if (node.estudios) {
      children.push(...node.estudios);
    }
    
    // Si es un estudio con pruebas, mostrarlas como hijos
    if (node.type === 'estudio' && node.pruebas && node.pruebas.length > 0) {
      return node.pruebas.map(prueba => ({
        ...prueba,
        type: 'prueba'
      }));
    }
    
    return children;
  };
  
  const childrenToRender = getChildren();
  
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
        className={`
          flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer transition-all
          ${isSelected ? 'bg-eg-purple text-white shadow-lg' : 'hover:bg-eg-pinkLight/50'}
          ${isHovered ? 'shadow-md' : ''}
          ${node.type === 'prueba' ? 'text-sm' : ''}
        `}
        style={{ paddingLeft: `${level * 24 + 12}px` }}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        draggable={node.type === 'estudio'}
        onDragStart={() => onDragStart && onDragStart(node)}
        onDragEnd={onDragEnd}
      >
        {/* Chevron para expandir/colapsar */}
        {childrenToRender.length > 0 && (
          <motion.div
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0"
          >
            <FaChevronRight className={isSelected ? 'text-white' : 'text-eg-gray'} size={12} />
          </motion.div>
        )}
        
        {/* Espaciador si no tiene hijos */}
        {childrenToRender.length === 0 && <div className="w-3" />}
        
        {/* Icono del tipo */}
        <Icon className={`flex-shrink-0 ${getIconColor()}`} size={node.type === 'prueba' ? 14 : 16} />
        
        {/* Código si existe */}
        {node.codigo && (
          <span className={`
            text-xs font-mono px-1.5 py-0.5 rounded
            ${isSelected ? 'bg-white/20 text-white' : 'bg-eg-purple/10 text-eg-purple'}
          `}>
            {node.codigo}
          </span>
        )}
        
        {/* Nombre del nodo */}
        <span className={`
          flex-1 font-medium
          ${isSelected ? 'text-white' : 'text-eg-grayDark'}
          ${node.type === 'prueba' ? 'text-sm' : ''}
        `}>
          {highlightText(node.name)}
        </span>
        
        {/* Unidad para pruebas */}
        {node.unidad && (
          <span className={`
            text-xs px-1.5 py-0.5 rounded
            ${isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}
          `}>
            {node.unidad}
          </span>
        )}
        
        {/* Contador de estudios/pruebas */}
        {nodeCount > 0 && node.type !== 'prueba' && (
          <span className={`
            px-2 py-0.5 rounded-full text-xs font-medium
            ${isSelected ? 'bg-white/20 text-white' : 'bg-eg-pink/30 text-eg-purple'}
          `}>
            {nodeCount}
          </span>
        )}
        
        {/* Precio si es un estudio individual */}
        {node.precio && (
          <span className={`
            px-2 py-0.5 rounded-full text-xs font-bold
            ${isSelected ? 'bg-white/20 text-white' : 'bg-green-500 text-white'}
          `}>
            ${node.precio}
          </span>
        )}
        
        {/* Botón de favorito (solo para estudios) */}
        {node.type === 'estudio' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(node.id);
            }}
            className="flex-shrink-0 ml-1"
          >
            {isFavorite ? (
              <FaStar className="text-yellow-500" size={14} />
            ) : (
              <FaRegStar className={isSelected ? 'text-white' : 'text-eg-gray'} size={14} />
            )}
          </button>
        )}
      </motion.div>
      
      {/* Hijos del nodo */}
      <AnimatePresence>
        {childrenToRender.length > 0 && isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
          >
            {childrenToRender.map(child => (
              <TreeNode
                key={child.id}
                node={child}
                level={level + 1}
                onSelect={onSelect}
                selectedId={selectedId}
                expandedNodes={expandedNodes}
                onToggleExpand={onToggleExpand}
                favorites={favorites}
                onToggleFavorite={onToggleFavorite}
                searchTerm={searchTerm}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

TreeNode.displayName = 'TreeNode';

// Componente de breadcrumb navigation
const Breadcrumb = ({ path, onNavigate }) => {
  return (
    <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-eg-pinkLight/20 to-eg-pink/10 rounded-lg mb-4">
      <button
        onClick={() => onNavigate([])}
        className="text-eg-purple hover:text-eg-purpleDark transition-colors"
      >
        <FaHome size={16} />
      </button>
      
      {path.map((item, index) => (
        <div key={item.id} className="flex items-center gap-2">
          <span className="text-eg-gray">/</span>
          <button
            onClick={() => onNavigate(path.slice(0, index + 1))}
            className={`
              hover:text-eg-purple transition-colors text-sm
              ${index === path.length - 1 ? 'text-eg-grayDark font-semibold' : 'text-eg-gray'}
            `}
          >
            {item.name}
          </button>
        </div>
      ))}
    </div>
  );
};

// Componente de área de favoritos
const FavoritesArea = ({ favorites, studies, onRemoveFavorite, onSelectStudy }) => {
  // Obtener los objetos de estudio completos desde los IDs
  const favoriteStudies = useMemo(() => {
    return Array.from(favorites).map(favId => {
      // Buscar el estudio en la estructura de datos
      const findStudy = (nodes) => {
        for (const node of nodes) {
          if (node.id === favId) return node;
          if (node.children) {
            const found = findStudy(node.children);
            if (found) return found;
          }
          if (node.estudios) {
            const found = node.estudios.find(e => e.id === favId);
            if (found) return found;
          }
        }
        return null;
      };
      return findStudy(studies);
    }).filter(Boolean);
  }, [favorites, studies]);
  
  return (
    <div className="border-2 border-dashed border-eg-pink/30 rounded-lg p-4 bg-white">
      <h3 className="font-semibold text-eg-grayDark mb-3 flex items-center gap-2">
        <FaStar className="text-yellow-500" />
        Estudios Favoritos ({favorites.size})
      </h3>
      
      {favorites.size === 0 ? (
        <p className="text-sm text-eg-gray text-center py-4">
          Haz clic en la estrella de un estudio para agregarlo a favoritos
        </p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {favoriteStudies.map(study => (
            <div
              key={study.id}
              className="flex items-center justify-between p-3 bg-gradient-to-r from-eg-pinkLight/30 to-eg-pink/20 rounded-lg border border-eg-pink/30 hover:shadow-md transition-all cursor-pointer"
              onClick={() => onSelectStudy(study)}
            >
              <div className="flex items-center gap-2 flex-1">
                <FaFlask className="text-eg-purple" size={14} />
                {study.codigo && (
                  <span className="text-xs font-mono bg-eg-purple/10 text-eg-purple px-1.5 py-0.5 rounded">
                    {study.codigo}
                  </span>
                )}
                <span className="text-sm text-eg-grayDark font-medium">
                  {study.name}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFavorite(study.id);
                }}
                className="text-eg-gray hover:text-red-500 transition-colors ml-2"
              >
                <FaTimes size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Panel de detalles del nodo seleccionado
const NodeDetails = ({ node }) => {
  if (!node) return null;
  
  return (
    <div className="p-4 bg-gradient-to-r from-eg-pinkLight/30 to-eg-pink/20 border-t border-eg-pink/30">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-semibold text-eg-grayDark text-lg flex items-center gap-2">
            {getNodeIcon(node)({ className: 'text-eg-purple' })}
            {node.name}
          </h3>
          {node.codigo && (
            <span className="text-sm text-eg-gray">Código: {node.codigo}</span>
          )}
        </div>
        {node.precio && (
          <span className="text-xl font-bold text-green-600">
            ${node.precio}
          </span>
        )}
      </div>
      
      {/* Detalles específicos por tipo */}
      {node.type === 'estudio' && node.pruebas && node.pruebas.length > 0 && (
        <div className="mt-3">
          <h4 className="text-sm font-semibold text-eg-grayDark mb-2">
            Pruebas incluidas ({node.pruebas.length}):
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {node.pruebas.slice(0, 6).map(prueba => (
              <div key={prueba.id} className="flex items-center gap-1 text-xs text-eg-gray">
                <FaVial className="text-eg-pink" size={10} />
                <span>{prueba.nombre}</span>
              </div>
            ))}
            {node.pruebas.length > 6 && (
              <div className="text-xs text-eg-purple font-medium">
                +{node.pruebas.length - 6} más...
              </div>
            )}
          </div>
        </div>
      )}
      
      {node.type === 'prueba' && (
        <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
          {node.unidad && (
            <div>
              <span className="text-eg-gray">Unidad:</span>
              <span className="ml-2 font-medium text-eg-grayDark">{node.unidad}</span>
            </div>
          )}
          {node.rangoReferencia && (
            <div>
              <span className="text-eg-gray">Rango:</span>
              <span className="ml-2 font-medium text-eg-grayDark">{node.rangoReferencia}</span>
            </div>
          )}
        </div>
      )}
      
      {node.tiempoEntrega && (
        <div className="mt-2 text-sm">
          <span className="text-eg-gray">Tiempo de entrega:</span>
          <span className="ml-2 font-medium text-eg-grayDark">{node.tiempoEntrega}</span>
        </div>
      )}
      
      {node.preparacion && (
        <div className="mt-2 text-sm">
          <span className="text-eg-gray">Preparación:</span>
          <span className="ml-2 font-medium text-eg-grayDark">{node.preparacion}</span>
        </div>
      )}
    </div>
  );
};

// Componente principal TreeView
const TreeView = ({ 
  data, 
  onSelectStudy,
  className = '',
  showFavorites = true,
  showBreadcrumb = true,
  showSearch = true,
  showDetails = true
}) => {
  const [expandedNodes, setExpandedNodes] = useState(new Set(['root']));
  const [selectedNode, setSelectedNode] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState(data);
  const [breadcrumbPath, setBreadcrumbPath] = useState([]);
  const [draggedNode, setDraggedNode] = useState(null);
  
  // Asegurar que data sea un array
  const treeData = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data.children) return data.children;
    return [data];
  }, [data]);
  
  // Filtrar datos por búsqueda
  useEffect(() => {
    if (!searchTerm) {
      setFilteredData(treeData);
      return;
    }
    
    const searchLower = searchTerm.toLowerCase();
    const filterNodes = (nodes) => {
      return nodes.reduce((acc, node) => {
        // Buscar en el nombre y código del nodo
        const nameMatch = node.name?.toLowerCase().includes(searchLower);
        const codeMatch = node.codigo?.toLowerCase().includes(searchLower);
        
        // Buscar en las pruebas si es un estudio
        const pruebaMatch = node.pruebas?.some(p => 
          p.nombre?.toLowerCase().includes(searchLower)
        );
        
        // Filtrar recursivamente los hijos
        let childrenFiltered = [];
        if (node.children) {
          childrenFiltered = filterNodes(node.children);
        }
        
        // Filtrar estudios si es una categoría
        let estudiosFiltered = [];
        if (node.estudios) {
          estudiosFiltered = node.estudios.filter(e => 
            e.name?.toLowerCase().includes(searchLower) ||
            e.codigo?.toLowerCase().includes(searchLower) ||
            e.pruebas?.some(p => p.nombre?.toLowerCase().includes(searchLower))
          );
        }
        
        // Incluir el nodo si hay alguna coincidencia
        if (nameMatch || codeMatch || pruebaMatch || childrenFiltered.length > 0 || estudiosFiltered.length > 0) {
          const filteredNode = {
            ...node,
            children: childrenFiltered,
            estudios: estudiosFiltered
          };
          
          acc.push(filteredNode);
          
          // Auto-expandir nodos con coincidencias
          if (childrenFiltered.length > 0 || estudiosFiltered.length > 0) {
            setExpandedNodes(prev => new Set([...prev, node.id]));
          }
        }
        
        return acc;
      }, []);
    };
    
    setFilteredData(filterNodes(treeData));
  }, [searchTerm, treeData]);
  
  // Manejar selección de nodo
  const handleSelectNode = useCallback((node) => {
    setSelectedNode(node);
    
    // Callback externo si es un estudio
    if (node.type === 'estudio' && onSelectStudy) {
      onSelectStudy(node);
    }
  }, [onSelectStudy]);
  
  // Toggle expandir/colapsar
  const handleToggleExpand = useCallback((nodeId) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, []);
  
  // Toggle favorito
  const handleToggleFavorite = useCallback((nodeId) => {
    setFavorites(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  }, []);
  
  // Expandir todo
  const expandAll = useCallback(() => {
    const getAllNodeIds = (nodes) => {
      return nodes.reduce((acc, node) => {
        acc.push(node.id);
        if (node.children) {
          acc.push(...getAllNodeIds(node.children));
        }
        if (node.estudios) {
          node.estudios.forEach(e => acc.push(e.id));
        }
        return acc;
      }, []);
    };
    
    setExpandedNodes(new Set(getAllNodeIds(treeData)));
  }, [treeData]);
  
  // Colapsar todo
  const collapseAll = useCallback(() => {
    setExpandedNodes(new Set());
  }, []);
  
  // Navegar con breadcrumb
  const handleBreadcrumbNavigate = useCallback((path) => {
    setBreadcrumbPath(path);
    if (path.length > 0) {
      setSelectedNode(path[path.length - 1]);
    } else {
      setSelectedNode(null);
    }
  }, []);
  
  return (
    <div className={`bg-white rounded-xl shadow-lg border border-eg-pink/30 ${className}`}>
      {/* Header con búsqueda y controles */}
      <div className="p-4 border-b border-eg-pink/30 bg-gradient-to-r from-eg-pinkLight/10 to-eg-pink/5">
        <h2 className="text-xl font-bold text-eg-grayDark mb-4 flex items-center gap-2">
          <FaClipboardList className="text-eg-purple" />
          Árbol de Estudios de Laboratorio
        </h2>
        
        {showSearch && (
          <div className="relative mb-3">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-eg-gray" />
            <input
              type="text"
              placeholder="Buscar estudios, códigos o pruebas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 border border-eg-pink/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-eg-purple/50 focus:border-eg-purple"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-eg-gray hover:text-eg-purple transition-colors"
              >
                <FaTimes />
              </button>
            )}
          </div>
        )}
        
        <div className="flex gap-2">
          <button
            onClick={expandAll}
            className="px-3 py-1.5 text-sm bg-eg-purple text-white rounded-lg hover:bg-eg-purpleDark transition-colors"
          >
            Expandir todo
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-1.5 text-sm bg-white text-eg-purple border border-eg-purple rounded-lg hover:bg-eg-pinkLight transition-colors"
          >
            Colapsar todo
          </button>
        </div>
      </div>
      
      {/* Breadcrumb */}
      {showBreadcrumb && breadcrumbPath.length > 0 && (
        <div className="px-4 pt-4">
          <Breadcrumb path={breadcrumbPath} onNavigate={handleBreadcrumbNavigate} />
        </div>
      )}
      
      {/* Contenido principal */}
      <div className="flex flex-col lg:flex-row gap-4 p-4">
        {/* Árbol */}
        <div className="flex-1 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {filteredData.length === 0 ? (
            <div className="text-center py-12">
              <FaSearch className="mx-auto text-4xl text-eg-gray/30 mb-3" />
              <p className="text-eg-gray">No se encontraron resultados</p>
              {searchTerm && (
                <p className="text-sm text-eg-gray mt-2">
                  Intenta con otros términos de búsqueda
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredData.map(node => (
                <TreeNode
                  key={node.id}
                  node={node}
                  onSelect={handleSelectNode}
                  selectedId={selectedNode?.id}
                  expandedNodes={expandedNodes}
                  onToggleExpand={handleToggleExpand}
                  favorites={favorites}
                  onToggleFavorite={handleToggleFavorite}
                  searchTerm={searchTerm}
                  onDragStart={setDraggedNode}
                  onDragEnd={() => setDraggedNode(null)}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Área de favoritos */}
        {showFavorites && (
          <div className="lg:w-80">
            <FavoritesArea
              favorites={favorites}
              studies={treeData}
              onRemoveFavorite={handleToggleFavorite}
              onSelectStudy={handleSelectNode}
            />
          </div>
        )}
      </div>
      
      {/* Detalles del nodo seleccionado */}
      {showDetails && selectedNode && (
        <NodeDetails node={selectedNode} />
      )}
    </div>
  );
};

export default TreeView;