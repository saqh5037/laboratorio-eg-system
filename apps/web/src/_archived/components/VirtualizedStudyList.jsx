import { memo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { FaClock, FaFileAlt, FaDollarSign, FaCode } from 'react-icons/fa';

// Componente para cada item de la lista
const StudyItem = memo(({ data, index, style }) => {
  const { items, onItemClick } = data;
  const estudio = items[index];

  // Función para renderizar texto con highlighting
  const renderHighlightedText = (text, matches) => {
    if (!matches || matches.length === 0) return text;
    
    // Buscar coincidencias para el campo nombre
    const matchForField = matches.find(m => m.key === 'nombre');
    if (!matchForField || !matchForField.indices || matchForField.indices.length === 0) {
      return text;
    }
    
    // Crear una copia del texto para procesar
    let result = [];
    let lastIndex = 0;
    
    // Ordenar los índices de menor a mayor
    const sortedIndices = [...matchForField.indices].sort((a, b) => a[0] - b[0]);
    
    sortedIndices.forEach(([start, end], i) => {
      // Agregar texto antes del match
      if (start > lastIndex) {
        result.push(
          <span key={`text-${i}`}>{text.substring(lastIndex, start)}</span>
        );
      }
      
      // Agregar texto destacado
      result.push(
        <mark key={`mark-${i}`} className="bg-yellow-200 text-gray-900 font-semibold">
          {text.substring(start, end + 1)}
        </mark>
      );
      
      lastIndex = end + 1;
    });
    
    // Agregar texto restante
    if (lastIndex < text.length) {
      result.push(
        <span key="text-end">{text.substring(lastIndex)}</span>
      );
    }
    
    return <>{result}</>;
  };

  return (
    <div style={style} className="px-4 py-2">
      <div 
        className="bg-white border border-eg-pink/30 rounded-lg p-4 hover:border-eg-purple hover:shadow-md transition-all cursor-pointer"
        onClick={() => onItemClick && onItemClick(estudio)}
      >
        <div className="flex justify-between items-start gap-4">
          {/* Información principal */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-eg-grayDark text-lg truncate">
              {estudio.matches 
                ? renderHighlightedText(estudio.nombre, estudio.matches)
                : estudio.nombre
              }
            </h3>
            
            {/* Código */}
            {estudio.codigo && (
              <div className="flex items-center gap-2 mt-1">
                <FaCode className="text-eg-purple text-xs" />
                <span className="text-sm text-eg-purple font-medium">
                  {estudio.codigo}
                </span>
              </div>
            )}
            
            {/* Jerarquía */}
            {estudio.jerarquia && estudio.jerarquia.length > 0 && (
              <p className="text-xs text-eg-gray mt-2 line-clamp-1">
                {estudio.jerarquia.join(' → ')}
              </p>
            )}
            
            {/* Información adicional */}
            <div className="flex flex-wrap gap-4 mt-3">
              {estudio.tiempoEntrega && (
                <div className="flex items-center gap-1 text-xs text-eg-gray">
                  <FaClock className="text-eg-purple" />
                  <span>{estudio.tiempoEntrega}</span>
                </div>
              )}
              
              {estudio.preparacion && (
                <div className="flex items-center gap-1 text-xs text-eg-gray">
                  <FaFileAlt className="text-eg-purple" />
                  <span>{estudio.preparacion}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Precio y relevancia */}
          <div className="flex flex-col items-end gap-2">
            {/* Score de relevancia */}
            {estudio.score !== undefined && (
              <div className="text-xs text-eg-gray">
                <span className="font-medium">
                  {((1 - estudio.score) * 100).toFixed(0)}% match
                </span>
              </div>
            )}
            
            {/* Precio */}
            {estudio.precio && estudio.precio > 0 && (
              <div className="flex items-center gap-1 text-lg font-bold text-eg-purple">
                <FaDollarSign className="text-sm" />
                <span>{estudio.precio.toFixed(2)}</span>
              </div>
            )}
            
            {/* Tipo de estudio */}
            {estudio.tipoEstudio && (
              <span className="px-2 py-1 bg-eg-pink/20 text-eg-purple text-xs rounded-full whitespace-nowrap">
                {estudio.tipoEstudio}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

StudyItem.displayName = 'StudyItem';

// Componente principal de lista virtualizada
const VirtualizedStudyList = ({ 
  items, 
  height = 600,
  itemHeight = 140,
  onItemClick,
  className = ''
}) => {
  // Crear datos para pasar a cada item
  const itemData = {
    items,
    onItemClick
  };

  // Componente interno para manejar AutoSizer
  const ListWrapper = () => (
    <List
      height={height}
      itemCount={items.length}
      itemSize={itemHeight}
      width="100%"
      itemData={itemData}
      overscanCount={5}
    >
      {StudyItem}
    </List>
  );

  return (
    <div className={`bg-gray-50 rounded-lg ${className}`}>
      {items.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-eg-gray">
          <div className="text-center">
            <p className="text-lg">No se encontraron resultados</p>
            <p className="text-sm mt-2">Intenta ajustar los filtros o términos de búsqueda</p>
          </div>
        </div>
      ) : (
        <ListWrapper />
      )}
    </div>
  );
};

// Componente con información de rendimiento
export const VirtualizedStudyListWithInfo = ({ 
  items, 
  searchResults,
  ...props 
}) => {
  return (
    <div>
      {/* Información de rendimiento */}
      <div className="mb-4 p-3 bg-eg-pinkLight/20 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <div className="text-eg-gray">
            <span className="font-medium text-eg-grayDark">Renderización optimizada:</span>
            {' '}Mostrando {Math.min(10, items.length)} de {items.length} elementos en memoria
          </div>
          
          {searchResults && (
            <div className="text-eg-purple font-medium">
              {searchResults.length > 1000 && '⚡'} Búsqueda instantánea en {searchResults.length} registros
            </div>
          )}
        </div>
      </div>
      
      {/* Lista virtualizada */}
      <VirtualizedStudyList items={items} {...props} />
    </div>
  );
};

export default VirtualizedStudyList;