import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaGripVertical, 
  FaEdit, 
  FaTrash, 
  FaStickyNote, 
  FaFolder,
  FaHeart,
  FaStar,
  FaClock,
  FaArrowUp,
  FaArrowDown,
  FaExpand,
  FaCompress,
  FaTags
} from 'react-icons/fa';
import { useFavorites } from '../hooks/useFavorites';
import StudyCard from './StudyCard';

const FavoritesList = ({ 
  favorites = [], 
  viewMode = 'compact', // compact, expanded, cards
  allowDragDrop = true,
  showNotes = true,
  showPriority = true,
  onStudyClick = null,
  selectedFolder = null 
}) => {
  const {
    moveFavoriteToFolder,
    updateFavoriteNotes,
    updateFavoritePriority,
    updateFavoriteTags,
    removeFromFavorites,
    folders
  } = useFavorites();

  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [editingNotes, setEditingNotes] = useState(null);
  const [editingTags, setEditingTags] = useState(null);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [newNote, setNewNote] = useState('');
  const [newTags, setNewTags] = useState('');

  // Colores de prioridad
  const priorityColors = {
    high: 'bg-red-100 text-red-700 border-red-200',
    normal: 'bg-blue-100 text-blue-700 border-blue-200',
    low: 'bg-gray-100 text-gray-700 border-gray-200'
  };

  const priorityLabels = {
    high: 'Alta',
    normal: 'Normal',
    low: 'Baja'
  };

  // Manejar drag start
  const handleDragStart = (e, favorite, index) => {
    if (!allowDragDrop) return;
    
    setDraggedItem({ favorite, index });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
  };

  // Manejar drag over
  const handleDragOver = (e, index) => {
    if (!allowDragDrop) return;
    
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  // Manejar drop
  const handleDrop = (e, dropIndex) => {
    if (!allowDragDrop || !draggedItem) return;
    
    e.preventDefault();
    
    // Aquí puedes implementar la lógica de reordenamiento
    // Por ahora solo limpiaremos el estado
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  // Manejar drag end
  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  // Guardar notas
  const handleSaveNotes = (favoriteId) => {
    updateFavoriteNotes(favoriteId, newNote);
    setEditingNotes(null);
    setNewNote('');
  };

  // Guardar tags
  const handleSaveTags = (favoriteId) => {
    const tagsArray = newTags.split(',').map(tag => tag.trim()).filter(Boolean);
    updateFavoriteTags(favoriteId, tagsArray);
    setEditingTags(null);
    setNewTags('');
  };

  // Toggle expandir item
  const toggleExpanded = (favoriteId) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(favoriteId)) {
        newSet.delete(favoriteId);
      } else {
        newSet.add(favoriteId);
      }
      return newSet;
    });
  };

  // Iniciar edición de notas
  const startEditingNotes = (favorite) => {
    setEditingNotes(favorite.id);
    setNewNote(favorite.notes || '');
  };

  // Iniciar edición de tags
  const startEditingTags = (favorite) => {
    setEditingTags(favorite.id);
    setNewTags((favorite.tags || []).join(', '));
  };

  if (favorites.length === 0) {
    return (
      <div className="text-center py-12">
        <FaHeart className="text-6xl text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No hay favoritos en esta carpeta
        </h3>
        <p className="text-gray-500">
          Los estudios que agregues a favoritos aparecerán aquí
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {favorites.map((favorite, index) => {
          const isExpanded = expandedItems.has(favorite.id);
          const isDraggedOver = dragOverIndex === index;
          const isDragging = draggedItem?.index === index;

          return (
            <motion.div
              key={favorite.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: isDragging ? 0.5 : 1, 
                y: 0,
                scale: isDraggedOver ? 1.02 : 1
              }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className={`bg-white rounded-lg border shadow-sm transition-all duration-200 ${
                isDraggedOver ? 'border-red-300 shadow-md' : 'border-gray-200'
              }`}
              draggable={allowDragDrop}
              onDragStart={(e) => handleDragStart(e, favorite, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
            >
              {/* Vista compacta */}
              {viewMode === 'compact' && (
                <div className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Drag handle */}
                    {allowDragDrop && (
                      <div className="cursor-move text-gray-400 hover:text-gray-600">
                        <FaGripVertical />
                      </div>
                    )}

                    {/* Contenido principal */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 
                            className="font-semibold text-gray-900 truncate cursor-pointer hover:text-red-600"
                            onClick={() => onStudyClick?.(favorite.studyData)}
                          >
                            {favorite.studyData.nombre}
                          </h4>
                          <p className="text-sm text-gray-500">
                            Código: {favorite.studyData.codigo}
                          </p>
                          
                          {/* Tags */}
                          {favorite.tags && favorite.tags.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {favorite.tags.slice(0, 2).map((tag, i) => (
                                <span 
                                  key={i}
                                  className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                              {favorite.tags.length > 2 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                  +{favorite.tags.length - 2}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Metadatos y controles */}
                        <div className="flex items-center gap-2 ml-4">
                          {/* Prioridad */}
                          {showPriority && (
                            <select
                              value={favorite.priority}
                              onChange={(e) => updateFavoritePriority(favorite.id, e.target.value)}
                              className={`px-2 py-1 border rounded text-xs font-medium ${priorityColors[favorite.priority]}`}
                            >
                              <option value="low">Baja</option>
                              <option value="normal">Normal</option>
                              <option value="high">Alta</option>
                            </select>
                          )}

                          {/* Precio */}
                          {favorite.studyData.precio && (
                            <span className="font-semibold text-green-600">
                              ${favorite.studyData.precio.toFixed(2)}
                            </span>
                          )}

                          {/* Fecha agregado */}
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <FaClock />
                            {new Date(favorite.dateAdded).toLocaleDateString()}
                          </span>

                          {/* Botón expandir */}
                          <button
                            onClick={() => toggleExpanded(favorite.id)}
                            className="p-1 text-gray-400 hover:text-gray-600 rounded"
                          >
                            {isExpanded ? <FaCompress /> : <FaExpand />}
                          </button>

                          {/* Eliminar */}
                          <button
                            onClick={() => removeFromFavorites(favorite.studyId)}
                            className="p-1 text-gray-400 hover:text-red-500 rounded"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>

                      {/* Notas (si existen) */}
                      {favorite.notes && !isExpanded && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          📝 {favorite.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Panel expandido */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-4 pt-4 border-t border-gray-200"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Notas */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-sm font-medium text-gray-700">
                                Notas personales
                              </label>
                              <button
                                onClick={() => startEditingNotes(favorite)}
                                className="text-xs text-blue-600 hover:text-blue-800"
                              >
                                <FaEdit /> Editar
                              </button>
                            </div>
                            
                            {editingNotes === favorite.id ? (
                              <div className="space-y-2">
                                <textarea
                                  value={newNote}
                                  onChange={(e) => setNewNote(e.target.value)}
                                  className="w-full p-2 border border-gray-300 rounded text-sm"
                                  rows={3}
                                  placeholder="Agrega tus notas..."
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleSaveNotes(favorite.id)}
                                    className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                                  >
                                    Guardar
                                  </button>
                                  <button
                                    onClick={() => setEditingNotes(null)}
                                    className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-600 p-2 bg-gray-50 rounded min-h-[60px]">
                                {favorite.notes || 'Sin notas'}
                              </p>
                            )}
                          </div>

                          {/* Tags */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-sm font-medium text-gray-700">
                                Etiquetas
                              </label>
                              <button
                                onClick={() => startEditingTags(favorite)}
                                className="text-xs text-blue-600 hover:text-blue-800"
                              >
                                <FaTags /> Editar
                              </button>
                            </div>
                            
                            {editingTags === favorite.id ? (
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={newTags}
                                  onChange={(e) => setNewTags(e.target.value)}
                                  className="w-full p-2 border border-gray-300 rounded text-sm"
                                  placeholder="etiqueta1, etiqueta2, ..."
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleSaveTags(favorite.id)}
                                    className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                                  >
                                    Guardar
                                  </button>
                                  <button
                                    onClick={() => setEditingTags(null)}
                                    className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-1">
                                {favorite.tags && favorite.tags.length > 0 ? (
                                  favorite.tags.map((tag, i) => (
                                    <span 
                                      key={i}
                                      className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                                    >
                                      {tag}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-sm text-gray-500 italic">Sin etiquetas</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Información adicional del estudio */}
                        <div className="mt-4 p-3 bg-gray-50 rounded">
                          <h5 className="font-medium text-gray-900 mb-2">
                            Información del estudio
                          </h5>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Categoría:</span>
                              <span className="ml-2 font-medium">
                                {favorite.studyData.categoria || 'N/A'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Tiempo entrega:</span>
                              <span className="ml-2 font-medium">
                                {favorite.studyData.tiempoEntrega || 'N/A'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Preparación:</span>
                              <span className="ml-2 font-medium">
                                {favorite.studyData.preparacion || 'N/A'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Pruebas incluidas:</span>
                              <span className="ml-2 font-medium">
                                {favorite.studyData.pruebas?.length || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Vista de tarjetas */}
              {viewMode === 'cards' && (
                <div className="p-4">
                  <StudyCard
                    study={favorite.studyData}
                    isFavorite={true}
                    onToggleFavorite={() => {}} // Ya está en favoritos
                    onMoreInfo={() => onStudyClick?.(favorite.studyData)}
                    className="shadow-none border-none"
                    showPruebas={true}
                  />
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default FavoritesList;