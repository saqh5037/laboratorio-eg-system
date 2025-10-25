import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaHeart, 
  FaSearch, 
  FaFilter, 
  FaSort, 
  FaFolder, 
  FaPlus,
  FaDownload,
  FaShare,
  FaTrash,
  FaEdit,
  FaStar,
  FaTimes,
  FaChevronDown,
  FaChevronRight,
  FaFileExport,
  FaEnvelope,
  FaDragIndicator
} from 'react-icons/fa';
import { useFavorites } from '../hooks/useFavorites';
import FavoriteButton, { FavoriteIndicator } from '../components/FavoriteButton';
import StudyCard from '../components/StudyCard';
import FavoritesList from '../components/FavoritesList';

const FavoritesPage = () => {
  const {
    favorites,
    folders,
    loading,
    stats,
    createNewFolder,
    updateFolder,
    deleteFolder,
    moveFavoriteToFolder,
    updateFavoriteNotes,
    updateFavoritePriority,
    updateFavoriteTags,
    getFavoritesByFolder,
    searchFavorites,
    exportFavorites,
    clearAllFavorites
  } = useFavorites();

  // Estados locales
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('dateAdded'); // dateAdded, name, priority
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc
  const [viewMode, setViewMode] = useState('cards'); // cards, list
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showFolderEdit, setShowFolderEdit] = useState(null);
  const [selectedStudy, setSelectedStudy] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#7B68A6');

  // Favoritos filtrados y ordenados
  const filteredFavorites = useMemo(() => {
    let filtered = selectedFolder 
      ? getFavoritesByFolder(selectedFolder)
      : favorites;

    // Aplicar búsqueda
    if (searchQuery) {
      filtered = searchFavorites(searchQuery);
      if (selectedFolder) {
        filtered = filtered.filter(fav => fav.folderId === selectedFolder);
      }
    }

    // Aplicar ordenamiento
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.studyData.nombre?.toLowerCase() || '';
          bValue = b.studyData.nombre?.toLowerCase() || '';
          break;
        case 'priority':
          const priorityOrder = { high: 3, normal: 2, low: 1 };
          aValue = priorityOrder[a.priority] || 0;
          bValue = priorityOrder[b.priority] || 0;
          break;
        case 'dateAdded':
        default:
          aValue = new Date(a.dateAdded);
          bValue = new Date(b.dateAdded);
          break;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [favorites, selectedFolder, searchQuery, sortBy, sortOrder, getFavoritesByFolder, searchFavorites]);

  // Crear nueva carpeta
  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createNewFolder(newFolderName.trim(), newFolderColor);
      setNewFolderName('');
      setNewFolderColor('#7B68A6');
      setShowCreateFolder(false);
    }
  };

  // Toggle expansión de carpeta
  const toggleFolderExpansion = (folderId) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  // Exportar favoritos
  const handleExport = (format) => {
    const data = exportFavorites(format, selectedFolder);
    const blob = new Blob([data], { 
      type: format === 'json' ? 'application/json' : 'text/csv' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `favoritos_${selectedFolder || 'todos'}_${new Date().toISOString().split('T')[0]}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportModal(false);
  };

  // Colores predefinidos para carpetas
  const folderColors = [
    '#7B68A6', '#E63946', '#F77F00', '#FCBF49', 
    '#06D6A0', '#118AB2', '#073B4C', '#8B5CF6'
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-eg-purple mx-auto"></div>
          <p className="mt-4 text-eg-gray">Cargando favoritos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-red-500 to-pink-600 text-white py-16">
        <div className="container-responsive">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex justify-center mb-4">
              <FaHeart className="text-6xl" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Mis Estudios Favoritos
            </h1>
            <p className="text-xl opacity-90">
              Gestiona y organiza tus estudios médicos favoritos
            </p>
          </motion.div>
        </div>
      </section>

      {/* Estadísticas */}
      <section className="py-6 bg-white shadow-sm border-b">
        <div className="container-responsive">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-500">{stats.total}</p>
              <p className="text-sm text-gray-600">Total Favoritos</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-500">{stats.folders}</p>
              <p className="text-sm text-gray-600">Carpetas</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-500">
                ${stats.totalValue?.toFixed(2) || '0.00'}
              </p>
              <p className="text-sm text-gray-600">Valor Total</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-500">{stats.byPriority?.high || 0}</p>
              <p className="text-sm text-gray-600">Alta Prioridad</p>
            </div>
          </div>
        </div>
      </section>

      {/* Controles y filtros */}
      <section className="py-6 bg-white shadow-sm sticky top-16 z-10">
        <div className="container-responsive">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Búsqueda */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar en favoritos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>

            {/* Controles */}
            <div className="flex gap-2 flex-wrap">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="dateAdded">Fecha agregado</option>
                <option value="name">Nombre</option>
                <option value="priority">Prioridad</option>
              </select>

              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
              >
                <FaSort /> {sortOrder === 'asc' ? '↑' : '↓'}
              </button>

              <button
                onClick={() => setViewMode(viewMode === 'cards' ? 'list' : 'cards')}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
              >
                {viewMode === 'cards' ? 'Lista' : 'Tarjetas'}
              </button>

              <button
                onClick={() => setShowCreateFolder(true)}
                className="btn btn-outline flex items-center gap-2"
              >
                <FaPlus /> Nueva Carpeta
              </button>

              <button
                onClick={() => setShowExportModal(true)}
                className="btn btn-outline flex items-center gap-2"
              >
                <FaDownload /> Exportar
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Contenido principal */}
      <section className="section-padding">
        <div className="container-responsive">
          <div className="flex gap-6">
            {/* Sidebar - Carpetas */}
            <div className="w-80 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Carpetas</h3>
                
                {/* Todos los favoritos */}
                <button
                  onClick={() => setSelectedFolder(null)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                    selectedFolder === null ? 'bg-red-50 text-red-700' : 'hover:bg-gray-50'
                  }`}
                >
                  <FaHeart className="text-red-500" />
                  <span className="font-medium">Todos los favoritos</span>
                  <span className="ml-auto text-sm text-gray-500">{stats.total}</span>
                </button>

                {/* Lista de carpetas */}
                <div className="mt-4 space-y-2">
                  {folders.map((folder) => (
                    <div key={folder.id}>
                      <button
                        onClick={() => setSelectedFolder(folder.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                          selectedFolder === folder.id ? 'bg-red-50 text-red-700' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: folder.color }}
                        />
                        <span className="font-medium flex-1">{folder.name}</span>
                        <span className="text-sm text-gray-500">
                          {stats.byFolder?.[folder.id] || 0}
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Contenido principal */}
            <div className="flex-1">
              <FavoritesList
                favorites={filteredFavorites}
                viewMode={viewMode === 'cards' ? 'cards' : 'compact'}
                allowDragDrop={true}
                showNotes={true}
                showPriority={true}
                onStudyClick={(study) => setSelectedStudy(study)}
                selectedFolder={selectedFolder}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Modal crear carpeta */}
      <AnimatePresence>
        {showCreateFolder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowCreateFolder(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Nueva Carpeta</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="label">Nombre de la carpeta</label>
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="input w-full"
                    placeholder="Ej: Análisis rutinarios"
                  />
                </div>

                <div>
                  <label className="label">Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {folderColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setNewFolderColor(color)}
                        className={`w-8 h-8 rounded border-2 ${
                          newFolderColor === color ? 'border-gray-900' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setShowCreateFolder(false)}
                  className="btn btn-outline flex-1"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateFolder}
                  disabled={!newFolderName.trim()}
                  className="btn btn-primary flex-1"
                >
                  Crear Carpeta
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal exportar */}
      <AnimatePresence>
        {showExportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowExportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Exportar Favoritos</h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => handleExport('json')}
                  className="w-full btn btn-outline flex items-center gap-3"
                >
                  <FaFileExport className="text-blue-500" />
                  <div className="text-left">
                    <div className="font-medium">Exportar como JSON</div>
                    <div className="text-sm text-gray-500">Formato completo con metadatos</div>
                  </div>
                </button>

                <button
                  onClick={() => handleExport('csv')}
                  className="w-full btn btn-outline flex items-center gap-3"
                >
                  <FaFileExport className="text-green-500" />
                  <div className="text-left">
                    <div className="font-medium">Exportar como CSV</div>
                    <div className="text-sm text-gray-500">Para Excel y hojas de cálculo</div>
                  </div>
                </button>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="btn btn-outline flex-1"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FavoritesPage;