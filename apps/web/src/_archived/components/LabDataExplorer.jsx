import { useState, useEffect } from 'react';
import { useLabData, useStudySearch } from '../hooks/useLabData';
import { exportToJSON } from '../utils/excelProcessor';
import { FaSearch, FaDownload, FaSync, FaFilter, FaChartBar } from 'react-icons/fa';

const LabDataExplorer = () => {
  const labData = useLabData({ autoLoad: true, useCache: true });
  const {
    searchTerm,
    setSearchTerm,
    filters,
    updateFilter,
    clearFilters,
    results
  } = useStudySearch(500);

  const [selectedView, setSelectedView] = useState('list'); // list, tree, stats

  // Manejar exportación
  const handleExport = () => {
    if (!labData.data) return;
    
    const jsonData = exportToJSON(labData.data);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lab_eg_data_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Renderizar vista de lista
  const renderListView = () => {
    const displayData = searchTerm || Object.keys(filters).length > 0 
      ? results 
      : labData.data?.estudios || [];

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-eg-grayDark">
            Estudios ({displayData.length})
          </h3>
        </div>

        <div className="grid gap-3">
          {displayData.slice(0, 100).map((estudio) => (
            <div 
              key={estudio.id} 
              className="bg-white p-4 rounded-lg border border-eg-pink/30 hover:border-eg-purple transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold text-eg-grayDark">{estudio.nombre}</h4>
                  <p className="text-sm text-eg-gray mt-1">
                    Código: {estudio.codigo || 'N/A'}
                  </p>
                  <p className="text-xs text-eg-gray mt-2">
                    {estudio.jerarquia.join(' > ')}
                  </p>
                </div>
                {estudio.precio && (
                  <span className="text-lg font-bold text-eg-purple">
                    ${estudio.precio.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {displayData.length > 100 && (
          <p className="text-center text-eg-gray text-sm">
            Mostrando primeros 100 resultados de {displayData.length}
          </p>
        )}
      </div>
    );
  };

  // Renderizar vista de árbol
  const renderTreeView = () => {
    if (!labData.treeStructure) return null;

    const renderNode = (node, level = 0) => {
      return Object.entries(node).map(([key, value]) => (
        <div key={key} style={{ marginLeft: `${level * 20}px` }} className="my-2">
          <div className="flex items-center gap-2">
            <span className="text-eg-purple">▶</span>
            <span className="font-medium text-eg-grayDark">{value.name}</span>
            {value.items.length > 0 && (
              <span className="text-xs bg-eg-pink/20 text-eg-purple px-2 py-1 rounded-full">
                {value.items.length}
              </span>
            )}
          </div>
          {Object.keys(value.children).length > 0 && renderNode(value.children, level + 1)}
        </div>
      ));
    };

    return (
      <div className="bg-white p-6 rounded-lg border border-eg-pink/30">
        <h3 className="text-lg font-semibold text-eg-grayDark mb-4">
          Estructura Jerárquica
        </h3>
        <div className="overflow-auto max-h-96">
          {renderNode(labData.treeStructure)}
        </div>
      </div>
    );
  };

  // Renderizar vista de estadísticas
  const renderStatsView = () => {
    const stats = labData.getStats();
    if (!stats) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg border border-eg-pink/30">
          <div className="flex items-center gap-3 mb-2">
            <FaChartBar className="text-eg-purple text-2xl" />
            <h3 className="font-semibold text-eg-grayDark">Total Estudios</h3>
          </div>
          <p className="text-3xl font-bold text-eg-purple">{stats.totalEstudios}</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-eg-pink/30">
          <h3 className="font-semibold text-eg-grayDark mb-2">Pruebas Individuales</h3>
          <p className="text-3xl font-bold text-eg-purple">{stats.totalPruebas}</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-eg-pink/30">
          <h3 className="font-semibold text-eg-grayDark mb-2">Grupos de Pruebas</h3>
          <p className="text-3xl font-bold text-eg-purple">{stats.totalGrupos}</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-eg-pink/30">
          <h3 className="font-semibold text-eg-grayDark mb-2">Con Precio</h3>
          <p className="text-3xl font-bold text-eg-purple">{stats.estudiosConPrecio}</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-eg-pink/30">
          <h3 className="font-semibold text-eg-grayDark mb-2">Precio Promedio</h3>
          <p className="text-3xl font-bold text-eg-purple">${stats.precioPromedio}</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-eg-pink/30">
          <h3 className="font-semibold text-eg-grayDark mb-2">Categorías</h3>
          <p className="text-3xl font-bold text-eg-purple">{stats.categorias}</p>
        </div>
      </div>
    );
  };

  if (labData.loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-eg-purple mx-auto"></div>
          <p className="mt-4 text-eg-gray">Cargando datos del laboratorio...</p>
        </div>
      </div>
    );
  }

  if (labData.error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p className="font-semibold">Error al cargar datos:</p>
        <p className="text-sm mt-1">{labData.error}</p>
        <button 
          onClick={labData.reload}
          className="mt-3 btn btn-outline text-red-700 border-red-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Barra de herramientas */}
      <div className="bg-white p-4 rounded-lg border border-eg-pink/30">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-eg-gray" />
            <input
              type="text"
              placeholder="Buscar estudios..."
              className="w-full pl-10 pr-4 py-2 border border-eg-pink rounded-lg focus:outline-none focus:ring-2 focus:ring-eg-purple"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filtros */}
          {labData.categories && (
            <select 
              className="px-4 py-2 border border-eg-pink rounded-lg focus:outline-none focus:ring-2 focus:ring-eg-purple"
              onChange={(e) => updateFilter('tipoEstudio', e.target.value)}
              value={filters.tipoEstudio || ''}
            >
              <option value="">Todos los tipos</option>
              {labData.categories.tiposEstudio.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
              ))}
            </select>
          )}

          {/* Acciones */}
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedView('list')}
              className={`btn ${selectedView === 'list' ? 'btn-primary' : 'btn-outline'}`}
            >
              Lista
            </button>
            <button
              onClick={() => setSelectedView('tree')}
              className={`btn ${selectedView === 'tree' ? 'btn-primary' : 'btn-outline'}`}
            >
              Árbol
            </button>
            <button
              onClick={() => setSelectedView('stats')}
              className={`btn ${selectedView === 'stats' ? 'btn-primary' : 'btn-outline'}`}
            >
              <FaChartBar />
            </button>
            <button
              onClick={handleExport}
              className="btn btn-outline"
              title="Exportar datos"
            >
              <FaDownload />
            </button>
            <button
              onClick={labData.reload}
              className="btn btn-outline"
              title="Recargar datos"
            >
              <FaSync />
            </button>
          </div>
        </div>

        {/* Filtros activos */}
        {Object.keys(filters).length > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm text-eg-gray">Filtros activos:</span>
            {Object.entries(filters).map(([key, value]) => (
              <span 
                key={key}
                className="px-2 py-1 bg-eg-pink/20 text-eg-purple text-sm rounded-full"
              >
                {value}
              </span>
            ))}
            <button
              onClick={clearFilters}
              className="text-sm text-eg-purple hover:underline"
            >
              Limpiar
            </button>
          </div>
        )}
      </div>

      {/* Vista seleccionada */}
      <div>
        {selectedView === 'list' && renderListView()}
        {selectedView === 'tree' && renderTreeView()}
        {selectedView === 'stats' && renderStatsView()}
      </div>
    </div>
  );
};

export default LabDataExplorer;