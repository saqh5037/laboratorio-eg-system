import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  FaSync,
  FaDownload,
  FaStar,
  FaSearch,
  FaThLarge,
  FaList,
} from 'react-icons/fa';
import { useLabData } from '../hooks/useLabDataDB';
import { useAdvancedSearch } from '../hooks/useAdvancedSearch';
import { useFavorites } from '../hooks/useFavorites';
import AdvancedSearchBox from '../components/AdvancedSearchBox';
import StudyDetailModal from '../components/StudyDetailModal';
import { exportToJSON } from '../utils/excelProcessor';
import { SkeletonStudyList } from '../components/SkeletonLoaders';

/**
 * REDISEÑO PÁGINA ESTUDIOS - OPTIMIZADA PARA ACCESIBILIDAD
 *
 * Cambios principales aplicados:
 * 1. Hero reducido: De ~400px a ~120px - prioriza búsqueda inmediata
 * 2. Mayor contraste: Textos oscuros sobre fondos claros (WCAG AAA)
 * 3. Tipografía escalada: Base 16px, títulos 20-24px (legible para adultos mayores)
 * 4. Botones grandes: min-height 48px (táctil-friendly)
 * 5. Focus visible: Outline grueso para navegación por teclado
 * 6. Eliminados: Blobs decorativos, animaciones innecesarias
 * 7. Simplificado: Menos texto, instrucciones directas
 */

// Estilos optimizados para accesibilidad
const ACCESSIBLE_CARD_STYLES = `
  bg-white
  rounded-xl
  p-5
  shadow-lg
  border-2 border-eg-purple/20
  hover:border-eg-purple
  hover:shadow-xl
  transition-all duration-200
  focus-within:ring-4 focus-within:ring-eg-purple/30 focus-within:border-eg-purple
`;

const BUTTON_BASE = `
  min-h-[48px]
  px-6
  rounded-lg
  font-medium
  text-base
  transition-all duration-200
  focus:outline-none focus:ring-4 focus:ring-offset-2
  disabled:opacity-50 disabled:cursor-not-allowed
`;

const BUTTON_PRIMARY = `
  ${BUTTON_BASE}
  bg-eg-purple
  text-white
  hover:bg-eg-purple/90
  focus:ring-eg-purple/50
  shadow-md hover:shadow-lg
`;

const BUTTON_SECONDARY = `
  ${BUTTON_BASE}
  bg-white
  text-eg-purple
  border-2 border-eg-purple
  hover:bg-eg-purple/5
  focus:ring-eg-purple/30
`;

const Estudios = () => {
  const labData = useLabData({ autoLoad: true, useCache: true });
  const { isFavorite, toggleFavorite } = useFavorites();
  const [selectedStudy, setSelectedStudy] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [showStudyCard, setShowStudyCard] = useState(false);

  const {
    searchQuery: searchTerm,
    setSearchQuery: setSearchTerm,
    searchResults,
    stats,
    updateFilter,
    removeFilter,
    clearSearch,
  } = useAdvancedSearch(labData.data?.estudios || []);

  const [selectedCategories, setSelectedCategories] = useState([]);

  // Derivar categories desde labData
  const categories = labData.categories || { tiposEstudio: [], nivel1: [], nivel2: [] };

  const handleStudyClick = (estudio) => {
    setSelectedStudy(estudio);
    setShowStudyCard(true);
  };

  const handleCloseStudyCard = () => {
    setShowStudyCard(false);
    setTimeout(() => setSelectedStudy(null), 300);
  };

  const handleToggleFavorite = (studyId) => {
    toggleFavorite(studyId);
  };

  const handleExport = () => {
    if (searchResults.length > 0) {
      // exportToJSON espera el objeto completo de datos del lab
      const dataToExport = {
        estudios: searchResults,
        pruebas: labData.data?.pruebas || [],
        gruposPrueba: labData.data?.gruposPrueba || [],
        metadata: {
          filtered: true,
          totalResults: searchResults.length,
          filters: {
            searchTerm: searchTerm || null,
            categories: selectedCategories || []
          }
        }
      };

      const jsonString = exportToJSON(dataToExport);

      // Descargar el archivo JSON
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `estudios-filtrados-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const renderHighlightedName = (estudio) => {
    if (!searchTerm) return estudio.nombre;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = estudio.nombre.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200 text-eg-purple font-semibold">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const hasResults = searchResults.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/*
        HERO COMPACTO - Reducido a mínimo necesario
        Solo logo + título breve, sin decoraciones
        Objetivo: Usuario llega rápido al buscador
      */}
      <section className="bg-eg-purple py-6 md:py-8 border-b-4 border-eg-pink">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center gap-4">
            {/* Icono simple, sin animación */}
            <div className="bg-white/20 rounded-lg p-3">
              <FaSearch className="text-white w-6 h-6 md:w-8 md:h-8" aria-hidden="true" />
            </div>
            <div>
              {/* Título conciso, contraste WCAG AAA */}
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Buscar Estudios
              </h1>
              <p className="text-white/90 text-base md:text-lg font-medium mt-1">
                {stats.total} estudios disponibles
              </p>
            </div>
          </div>
        </div>
      </section>

      {/*
        SECCIÓN DE BÚSQUEDA - Prioridad máxima
        Sticky para mantener acceso permanente
        Focus automático en el input
      */}
      <section className="sticky top-16 z-30 bg-white border-b-2 border-gray-200 shadow-md">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          {/* Buscador principal - tamaño grande, alto contraste */}
          <AdvancedSearchBox
            searchQuery={searchTerm}
            setSearchQuery={setSearchTerm}
            filters={{
              categories: selectedCategories,
              hasPrice: null,
              priceRange: { min: null, max: null }
            }}
            updateFilter={(filterKey, value) => {
              if (filterKey === 'categories') {
                // Toggle category
                if (selectedCategories.includes(value)) {
                  setSelectedCategories(selectedCategories.filter(c => c !== value));
                } else {
                  setSelectedCategories([...selectedCategories, value]);
                }
              }
              // Ignorar otros filtros por ahora (hasPrice, priceRange)
            }}
            removeFilter={(filterKey, value) => {
              if (filterKey === 'categories') {
                setSelectedCategories(selectedCategories.filter(c => c !== value));
              }
            }}
            clearSearch={() => {
              clearSearch();
              setSelectedCategories([]);
            }}
            suggestions={[]}
            searchHistory={[]}
            activeFilters={(selectedCategories || []).map(cat => ({ key: 'categories', value: cat }))}
            stats={stats}
            categories={categories}
            onSearch={() => {}}
          />

          {/* Controles secundarios - botones accesibles */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
            {/* Vista Grid/List */}
            <div className="flex gap-2" role="group" aria-label="Vista de resultados">
              <button
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? BUTTON_PRIMARY : BUTTON_SECONDARY}
                aria-pressed={viewMode === 'grid'}
                aria-label="Vista en cuadrícula"
              >
                <FaThLarge className="inline mr-2" aria-hidden="true" />
                <span className="hidden sm:inline">Cuadrícula</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? BUTTON_PRIMARY : BUTTON_SECONDARY}
                aria-pressed={viewMode === 'list'}
                aria-label="Vista en lista"
              >
                <FaList className="inline mr-2" aria-hidden="true" />
                <span className="hidden sm:inline">Lista</span>
              </button>
            </div>

            {/* Acciones */}
            <div className="flex gap-2">
              <button
                onClick={labData.reload}
                disabled={labData.loading}
                className={BUTTON_SECONDARY}
                aria-label="Recargar estudios"
              >
                <FaSync
                  className={`inline mr-2 ${labData.loading ? 'animate-spin' : ''}`}
                  aria-hidden="true"
                />
                <span className="hidden md:inline">Actualizar</span>
              </button>
              <button
                onClick={handleExport}
                disabled={!hasResults}
                className={BUTTON_SECONDARY}
                aria-label="Exportar resultados"
              >
                <FaDownload className="inline mr-2" aria-hidden="true" />
                <span className="hidden md:inline">Exportar</span>
              </button>
            </div>
          </div>

          {/* Contador de resultados - feedback claro */}
          {searchTerm && (
            <div className="mt-3 p-3 bg-eg-purple/5 border-l-4 border-eg-purple rounded">
              <p className="text-base font-semibold text-eg-purple">
                {hasResults
                  ? `${searchResults.length} resultado${searchResults.length !== 1 ? 's' : ''} encontrado${searchResults.length !== 1 ? 's' : ''}`
                  : 'No se encontraron resultados'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/*
        RESULTADOS - Layout responsivo
        Cards con contraste alto y textos legibles
      */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
          {/* Grid/Lista principal */}
          <div className="w-full">
            {labData.loading ? (
              <SkeletonStudyList count={6} />
            ) : !hasResults ? (
              // Estado vacío - mensaje claro y accesible
              <div className="text-center py-16">
                <div className="inline-block bg-gray-100 rounded-full p-8 mb-4">
                  <FaSearch className="text-gray-400 w-16 h-16" aria-hidden="true" />
                </div>
                <h2 className="text-2xl font-bold text-gray-700 mb-2">
                  No se encontraron estudios
                </h2>
                <p className="text-lg text-gray-600">
                  Intenta con otros términos de búsqueda
                </p>
              </div>
            ) : viewMode === 'list' ? (
              // Vista Lista - diseño horizontal compacto
              <div className="space-y-3" role="list" aria-label="Lista de estudios">
                {searchResults.slice(0, 100).map((estudio, index) => (
                  <motion.div
                    key={estudio.id}
                    role="listitem"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: Math.min(index * 0.02, 0.3) }}
                    className={`${ACCESSIBLE_CARD_STYLES} cursor-pointer flex items-center gap-4 p-4`}
                    onClick={() => handleStudyClick(estudio)}
                    tabIndex={0}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleStudyClick(estudio);
                      }
                    }}
                    aria-label={`Ver detalles de ${estudio.nombre}`}
                  >
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 leading-tight">
                        {renderHighlightedName(estudio)}
                      </h3>
                      {estudio.tipoEstudio && (
                        <span className="inline-block mt-2 px-3 py-1 bg-eg-purple/10 text-eg-purple text-sm font-semibold rounded-md border border-eg-purple/30">
                          {estudio.tipoEstudio}
                        </span>
                      )}
                    </div>
                    {estudio.precio > 0 && (
                      <div className="text-right">
                        <p className="text-2xl font-bold text-eg-purple">
                          ${estudio.precio.toFixed(2)}
                        </p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              // Vista Grid - cards con contraste alto
              <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                role="list"
                aria-label="Cuadrícula de estudios"
              >
                {searchResults.slice(0, 50).map((estudio, index) => (
                  <motion.div
                    key={estudio.id}
                    role="listitem"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.4) }}
                    className={`${ACCESSIBLE_CARD_STYLES} cursor-pointer ${
                      selectedStudy?.id === estudio.id
                        ? 'ring-4 ring-eg-purple border-eg-purple'
                        : ''
                    }`}
                    onClick={() => handleStudyClick(estudio)}
                    tabIndex={0}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleStudyClick(estudio);
                      }
                    }}
                    aria-label={`Ver detalles de ${estudio.nombre}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-bold text-gray-900 leading-tight flex-1">
                        {renderHighlightedName(estudio)}
                      </h3>
                      {estudio.tipoEstudio && (
                        <span className="px-3 py-1 bg-eg-purple/10 text-eg-purple text-xs font-semibold rounded-md border border-eg-purple/30 ml-2">
                          {estudio.tipoEstudio}
                        </span>
                      )}
                    </div>

                    {estudio.precio > 0 && (
                      <div className="mt-4 pt-4 border-t-2 border-gray-200">
                        <p className="text-2xl font-bold text-eg-purple">
                          ${estudio.precio.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600 font-medium mt-1">Precio</p>
                      </div>
                    )}

                    {/* Botón de favorito accesible */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(estudio.id);
                      }}
                      className="mt-3 p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-eg-purple transition-colors"
                      aria-label={
                        isFavorite(estudio.id)
                          ? 'Quitar de favoritos'
                          : 'Agregar a favoritos'
                      }
                      aria-pressed={isFavorite(estudio.id)}
                    >
                      <FaStar
                        className={`w-5 h-5 ${
                          isFavorite(estudio.id)
                            ? 'text-yellow-500 fill-current'
                            : 'text-gray-400'
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Modal centrado de detalles */}
          <StudyDetailModal
            study={selectedStudy}
            isOpen={showStudyCard && selectedStudy !== null}
            onClose={handleCloseStudyCard}
          />
      </section>
    </div>
  );
};

export default Estudios;
