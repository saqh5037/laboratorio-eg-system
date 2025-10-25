import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTree, FaSearch, FaChartBar, FaStar, FaTimes } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import TreeView from '../components/TreeView';
import StudyCard from '../components/StudyCard';
import { useTreeData } from '../hooks/useTreeData';
import { useLabData } from '../hooks/useLabData';
import { useFavorites } from '../hooks/useFavorites';
import StudyDetailModal from '../components/StudyDetailModal';

const TreeViewDemo = () => {
  const { treeData, loading, error, getTreeStats } = useTreeData();
  const labData = useLabData({ autoLoad: true, useCache: true });
  const { isFavorite, toggleFavorite, stats: favStats } = useFavorites();
  const [selectedStudy, setSelectedStudy] = useState(null);
  const [showStudyCard, setShowStudyCard] = useState(false);
  const stats = getTreeStats;

  // Manejar favoritos
  const handleToggleFavorite = (study) => {
    toggleFavorite(study);
  };

  // Manejar más información (abrir modal)
  const handleMoreInfo = (study) => {
    setSelectedStudy(study);
    setShowStudyCard(false); // Cerrar panel lateral si está abierto
  };

  // Cerrar panel lateral de StudyCard
  const handleCloseStudyCard = () => {
    setShowStudyCard(false);
    setSelectedStudy(null);
  };

  const handleSelectStudy = (study) => {
    // Mostrar StudyCard en panel lateral si es un estudio individual
    if (study.type === 'estudio' || (!study.children && !study.estudios)) {
      setSelectedStudy(study);
      setShowStudyCard(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-eg-purple mx-auto"></div>
          <p className="mt-4 text-eg-gray">Cargando estructura de estudios...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          <p className="font-semibold">Error al cargar datos:</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-eg-purple to-eg-purpleDark text-white py-16">
        <div className="container-responsive">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex justify-center mb-4">
              <FaTree className="text-6xl" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Explorador de Estudios
            </h1>
            <p className="text-xl opacity-90">
              Navegue por nuestra estructura jerárquica de análisis clínicos
            </p>
          </motion.div>
        </div>
      </section>

      {/* Información de favoritos */}
      <section className="py-4 bg-white shadow-sm border-b">
        <div className="container-responsive">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <FaTree className="text-eg-purple" />
              <span className="font-semibold text-eg-grayDark">
                Explorador Jerárquico
              </span>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <Link 
                to="/favoritos"
                className="flex items-center gap-1 hover:text-red-600 transition-colors"
              >
                <FaStar className="text-yellow-500" />
                <span>{favStats.total} favoritos</span>
              </Link>
              {stats && (
                <div className="flex items-center gap-1">
                  <FaChartBar className="text-eg-purple" />
                  <span>{stats.totalEstudios} estudios</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Estadísticas */}
      {stats && (
        <section className="py-8 bg-white shadow-sm">
          <div className="container-responsive">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-eg-purple">{stats.rootNodes}</p>
                <p className="text-sm text-eg-gray">Categorías principales</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-eg-purple">{stats.totalCategorias}</p>
                <p className="text-sm text-eg-gray">Subcategorías</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-eg-purple">{stats.totalEstudios}</p>
                <p className="text-sm text-eg-gray">Estudios disponibles</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-eg-purple">{stats.totalPruebas}</p>
                <p className="text-sm text-eg-gray">Pruebas incluidas</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Content Section con panel lateral */}
      <section className="section-padding">
        <div className="container-responsive">
          <div className="flex gap-6">
            {/* Columna principal - TreeView */}
            <div className={`transition-all duration-300 ${showStudyCard ? 'flex-1' : 'w-full'}`}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <TreeView
                  data={treeData}
                  onSelectStudy={handleSelectStudy}
                  showFavorites={true}
                  showBreadcrumb={true}
                  showSearch={true}
                  className="shadow-xl"
                />
              </motion.div>

              {/* Instrucciones */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-8 bg-eg-pinkLight/20 rounded-lg p-6"
              >
                <h3 className="text-lg font-semibold text-eg-grayDark mb-3">
                  Cómo usar el explorador jerárquico
                </h3>
                <ul className="space-y-2 text-sm text-eg-gray">
                  <li>• Click en las flechas para expandir/colapsar categorías</li>
                  <li>• Use la barra de búsqueda para filtrar estudios</li>
                  <li>• Click en la estrella para agregar a favoritos</li>
                  <li>• Los números indican la cantidad de estudios en cada categoría</li>
                  <li>• <strong>Click en un estudio para ver su tarjeta detallada</strong></li>
                  <li>• Use el breadcrumb para navegar rápidamente</li>
                </ul>
              </motion.div>
            </div>

            {/* Panel lateral con StudyCard */}
            <AnimatePresence>
              {showStudyCard && selectedStudy && (
                <motion.div
                  initial={{ opacity: 0, x: 300 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 300 }}
                  transition={{ duration: 0.3 }}
                  className="w-96 flex-shrink-0"
                >
                  <div className="sticky top-24">
                    <div className="bg-white rounded-lg border border-gray-200 shadow-lg">
                      {/* Header del panel */}
                      <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <h3 className="font-semibold text-eg-grayDark">Detalles del Estudio</h3>
                        <button
                          onClick={handleCloseStudyCard}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <FaTimes />
                        </button>
                      </div>
                      
                      {/* StudyCard en el panel */}
                      <div className="p-4">
                        <StudyCard
                          study={selectedStudy}
                          isFavorite={isFavorite(selectedStudy.id)}
                          onToggleFavorite={handleToggleFavorite}
                          onMoreInfo={handleMoreInfo}
                          className="shadow-none border-none"
                          showPruebas={true}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Modal de detalles */}
      <StudyDetailModal
        study={selectedStudy}
        isOpen={!!selectedStudy}
        onClose={() => setSelectedStudy(null)}
      />
    </div>
  );
};

export default TreeViewDemo;