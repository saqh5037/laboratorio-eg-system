import { useState } from 'react';
import StudyGrid from './StudyGrid';
import StudyCard from './StudyCard';

// Datos de ejemplo para demostrar las cards
const sampleStudies = [
  {
    id: 'EST-1001',
    nombre: 'Hematología Completa',
    codigo: '1001',
    precio: 250,
    categoria: 'Hematología',
    tipoEstudio: 'Hematología',
    nivel1: 'Laboratorio Clínico',
    nivel2: 'Hematología',
    tiempoEntrega: '24 horas',
    preparacion: 'Sin preparación especial',
    pruebas: [
      { id: 'PRU-1001-1', nombre: 'Linfocitos Atípicos' },
      { id: 'PRU-1001-2', nombre: 'Metamielocitos' },
      { id: 'PRU-1001-3', nombre: 'Mielocitos' },
      { id: 'PRU-1001-4', nombre: 'Monocitos #' },
      { id: 'PRU-1001-5', nombre: 'Monocitos %' },
      { id: 'PRU-1001-6', nombre: 'Neutrófilos #' },
      { id: 'PRU-1001-7', nombre: 'Neutrófilos %' },
      { id: 'PRU-1001-8', nombre: 'Eosinófilos #' },
      { id: 'PRU-1001-9', nombre: 'Eosinófilos %' },
      { id: 'PRU-1001-10', nombre: 'Plaquetas' },
      { id: 'PRU-1001-11', nombre: 'Glóbulos Blancos' },
      { id: 'PRU-1001-12', nombre: 'Glóbulos Rojos' },
      { id: 'PRU-1001-13', nombre: 'Hemoglobina' },
      { id: 'PRU-1001-14', nombre: 'Hematocrito' }
    ]
  },
  {
    id: 'EST-2001',
    nombre: 'Química Sanguínea 6 Elementos',
    codigo: '2001',
    precio: 350,
    categoria: 'Química',
    tipoEstudio: 'Química',
    nivel1: 'Laboratorio Clínico',
    nivel2: 'Química Clínica',
    tiempoEntrega: '24 horas',
    preparacion: 'Ayuno de 12 horas',
    pruebas: [
      { id: 'PRU-2001-1', nombre: 'Glucosa' },
      { id: 'PRU-2001-2', nombre: 'Urea' },
      { id: 'PRU-2001-3', nombre: 'Creatinina' },
      { id: 'PRU-2001-4', nombre: 'Ácido Úrico' },
      { id: 'PRU-2001-5', nombre: 'Colesterol' },
      { id: 'PRU-2001-6', nombre: 'Triglicéridos' }
    ]
  },
  {
    id: 'EST-3001',
    nombre: 'Perfil Tiroideo Completo',
    codigo: '3001',
    precio: 650,
    categoria: 'Hormonas',
    tipoEstudio: 'Endocrinología',
    nivel1: 'Laboratorio Clínico',
    nivel2: 'Endocrinología',
    tiempoEntrega: '48 horas',
    preparacion: 'Sin preparación especial',
    pruebas: [
      { id: 'PRU-3001-1', nombre: 'TSH' },
      { id: 'PRU-3001-2', nombre: 'T3 Libre' },
      { id: 'PRU-3001-3', nombre: 'T4 Libre' },
      { id: 'PRU-3001-4', nombre: 'Anticuerpos Anti-TPO' }
    ]
  },
  {
    id: 'EST-4001',
    nombre: 'Cultivo de Orina',
    codigo: '4001',
    precio: 450,
    categoria: 'Microbiología',
    tipoEstudio: 'Microbiología',
    nivel1: 'Laboratorio Clínico',
    nivel2: 'Microbiología',
    tiempoEntrega: '72 horas',
    preparacion: 'Primera orina de la mañana',
    pruebas: [
      { id: 'PRU-4001-1', nombre: 'Identificación bacteriana' },
      { id: 'PRU-4001-2', nombre: 'Antibiograma' },
      { id: 'PRU-4001-3', nombre: 'Recuento de colonias' }
    ]
  },
  {
    id: 'EST-5001',
    nombre: 'Panel Genético Cardiovascular',
    codigo: '5001',
    precio: 1200,
    categoria: 'Genética',
    tipoEstudio: 'Genética Molecular',
    nivel1: 'Laboratorio Especializado',
    nivel2: 'Genética',
    tiempoEntrega: '7-10 días',
    preparacion: 'Muestra de sangre o saliva',
    pruebas: [
      { id: 'PRU-5001-1', nombre: 'Mutación APOE' },
      { id: 'PRU-5001-2', nombre: 'Factor V Leiden' },
      { id: 'PRU-5001-3', nombre: 'Protrombina G20210A' },
      { id: 'PRU-5001-4', nombre: 'MTHFR C677T' },
      { id: 'PRU-5001-5', nombre: 'MTHFR A1298C' }
    ]
  },
  {
    id: 'EST-6001',
    nombre: 'Examen General de Orina',
    codigo: '6001',
    precio: 180,
    categoria: 'Uroanálisis',
    tipoEstudio: 'Análisis Clínicos',
    nivel1: 'Laboratorio Clínico',
    nivel2: 'Uroanálisis',
    tiempoEntrega: '2-4 horas',
    preparacion: 'Primera orina de la mañana',
    pruebas: [
      { id: 'PRU-6001-1', nombre: 'Examen físico' },
      { id: 'PRU-6001-2', nombre: 'Examen químico' },
      { id: 'PRU-6001-3', nombre: 'Sedimento urinario' }
    ]
  }
];

// Componente de ejemplo para StudyCard
const StudyCardExample = () => {
  const [favorites, setFavorites] = useState(new Set());
  const [selectedStudies, setSelectedStudies] = useState(new Set());

  // Manejar favoritos
  const handleToggleFavorite = (studyId) => {
    setFavorites(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studyId)) {
        newSet.delete(studyId);
      } else {
        newSet.add(studyId);
      }
      return newSet;
    });
  };

  // Manejar más información
  const handleMoreInfo = (study) => {
    alert(`Más información sobre: ${study.nombre}\nCódigo: ${study.codigo}\nPrecio: $${study.precio}\nPruebas incluidas: ${study.pruebas?.length || 0}`);
  };

  // Manejar selección de estudio
  const handleSelectStudy = (study) => {
    setSelectedStudies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(study.id)) {
        newSet.delete(study.id);
      } else {
        newSet.add(study.id);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-eg-grayDark mb-4">
            Catálogo de Estudios de Laboratorio
          </h1>
          <p className="text-lg text-eg-gray">
            Explora nuestro catálogo completo de estudios médicos con información detallada, 
            precios transparentes y opciones de búsqueda avanzada.
          </p>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-eg-purple">{sampleStudies.length}</div>
            <div className="text-sm text-gray-600">Estudios disponibles</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-green-600">{favorites.size}</div>
            <div className="text-sm text-gray-600">Estudios favoritos</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">
              {sampleStudies.reduce((total, study) => total + (study.pruebas?.length || 0), 0)}
            </div>
            <div className="text-sm text-gray-600">Pruebas incluidas</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-2xl font-bold text-orange-600">
              ${Math.round(sampleStudies.reduce((total, study) => total + study.precio, 0) / sampleStudies.length)}
            </div>
            <div className="text-sm text-gray-600">Precio promedio</div>
          </div>
        </div>

        {/* Grid de estudios con filtros */}
        <StudyGrid
          studies={sampleStudies}
          favorites={favorites}
          selectedStudies={selectedStudies}
          onToggleFavorite={handleToggleFavorite}
          onMoreInfo={handleMoreInfo}
          onSelectStudy={handleSelectStudy}
          showFilters={true}
          defaultViewMode="grid-medium"
          emptyMessage="No se encontraron estudios"
          loadingMessage="Cargando catálogo de estudios..."
        />

        {/* Sección de estudios individuales (ejemplo) */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-eg-grayDark mb-6">
            Estudios Destacados
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleStudies.slice(0, 3).map(study => (
              <StudyCard
                key={study.id}
                study={study}
                isFavorite={favorites.has(study.id)}
                isSelected={selectedStudies.has(study.id)}
                onToggleFavorite={handleToggleFavorite}
                onMoreInfo={handleMoreInfo}
                onSelect={handleSelectStudy}
                className="study-card"
              />
            ))}
          </div>
        </div>

        {/* Footer de información */}
        <div className="mt-12 bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-eg-grayDark mb-4">
            Información sobre los Estudios
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Precios</h4>
              <p>
                Todos los precios están en dólares estadounidenses e incluyen la toma de muestra 
                y el análisis completo. Los precios pueden variar según promociones vigentes.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Tiempos de Entrega</h4>
              <p>
                Los tiempos de entrega son estimados y pueden variar según la complejidad del estudio 
                y la carga de trabajo del laboratorio. Estudios urgentes disponibles con costo adicional.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Preparación</h4>
              <p>
                Siga cuidadosamente las instrucciones de preparación para garantizar resultados precisos. 
                Consulte con nuestro personal si tiene dudas sobre la preparación requerida.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Resultados</h4>
              <p>
                Los resultados se entregan de forma digital y física. Puede acceder a sus resultados 
                en línea o retirarlos en nuestras instalaciones con identificación oficial.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyCardExample;