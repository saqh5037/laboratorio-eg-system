import { useState } from 'react';
import { 
  TestTubeIcon, 
  ClockIcon, 
  FastingIcon, 
  HeartIcon, 
  InfoIcon,
  getAreaIcon 
} from './MedicalIcons';

const StudyCard = ({ study, estudio, onViewDetails, onDetailsClick, isNew = false, viewMode = 'grid' }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Support both study and estudio props for backwards compatibility
  const studyData = study || estudio;

  if (!studyData) {
    return null; // Return null if no study data
  }

  const AreaIcon = getAreaIcon(studyData.area || studyData.categoria || 'General');
  
  // Función para determinar el color del área - SOLO COLORES PANTONE
  const getAreaColor = (area) => {
    // Todas las áreas usan la paleta Pantone oficial: purple y pink
    const colors = {
      'Hematología': 'bg-eg-purple/10 text-eg-purple border-eg-purple/20',
      'Química': 'bg-eg-pink/20 text-eg-purple border-eg-pink/30',
      'Microbiología': 'bg-eg-purple/10 text-eg-purple border-eg-purple/20',
      'Inmunología': 'bg-eg-pink/20 text-eg-purple border-eg-pink/30',
      'Hormonas': 'bg-eg-purple/10 text-eg-purple border-eg-purple/20',
      'Uroanálisis': 'bg-eg-pink/20 text-eg-purple border-eg-pink/30',
      'Heces': 'bg-eg-purple/10 text-eg-purple border-eg-purple/20',
      'Especiales': 'bg-eg-pink/20 text-eg-purple border-eg-pink/30'
    };
    return colors[area] || 'bg-eg-purple/10 text-eg-purple border-eg-purple/20';
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const handleDetailsClick = () => {
    const callback = onViewDetails || onDetailsClick;
    if (callback) {
      callback(studyData);
    }
  };

  return (
    <div 
      className="group relative bg-white rounded-xl border border-gray-100 
                 shadow-[0_4px_12px_rgba(123,104,166,0.1)] 
                 hover:shadow-[0_8px_24px_rgba(123,104,166,0.15)]
                 transition-all duration-300 hover:-translate-y-1
                 overflow-hidden cursor-pointer"
      onClick={handleDetailsClick}
    >
      {/* Borde izquierdo decorativo al hover */}
      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-eg-purple to-eg-pink 
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Badges superiores */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        {isNew && (
          <span className="px-3 py-1 bg-eg-purple text-white text-xs font-normal rounded-full
                         shadow-lg">
            NUEVO
          </span>
        )}
        {studyData.tipo === 'perfil' && (
          <span className="px-3 py-1 bg-eg-pink text-eg-purple text-xs font-normal rounded-full
                         shadow-md">
            PERFIL
          </span>
        )}
      </div>

      {/* Contenido principal */}
      <div className="p-6">
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 pr-4">
              <h3 className="text-xl md:text-2xl font-normal text-eg-dark group-hover:text-eg-purple
                           transition-colors duration-200 line-clamp-2">
                {studyData.nombre}
              </h3>
              <p className="text-base font-normal text-eg-gray mt-2">
                Código: {studyData.codigo}
              </p>
            </div>

            {/* Botón de favoritos */}
            <button
              onClick={handleFavoriteClick}
              className="p-3 min-w-[48px] min-h-[48px] rounded-full hover:bg-eg-purple/5 transition-colors duration-200"
              aria-label="Agregar a favoritos"
            >
              <HeartIcon
                className={`w-5 h-5 ${isFavorite ? 'text-eg-purple' : 'text-eg-gray'}`}
                filled={isFavorite}
              />
            </button>
          </div>

          {/* Área/Departamento con ícono */}
          <div className="flex items-center gap-2 mt-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-normal border ${getAreaColor(studyData.area)}`}>
              <AreaIcon className="w-4 h-4" />
              {studyData.area}
            </span>
          </div>
        </div>

        {/* Información técnica */}
        <div className="space-y-3 mb-4 border-t border-gray-100 pt-4">
          {/* Tipo de muestra */}
          <div className="flex items-center gap-2 text-base">
            <TestTubeIcon className="w-5 h-5 text-eg-purple flex-shrink-0" />
            <span className="text-eg-gray font-normal">Muestra:</span>
            <span className="text-eg-dark font-normal truncate">{studyData.muestra}</span>
          </div>

          {/* Tiempo de entrega */}
          <div className="flex items-center gap-2 text-base">
            <ClockIcon className="w-5 h-5 text-eg-purple flex-shrink-0" />
            <span className="text-eg-gray font-normal">Entrega:</span>
            <span className="text-eg-dark font-normal">
              {studyData.tiempo || 'No especificado'}
              {studyData.tiempo && studyData.tiempo.includes('hora') && parseInt(studyData.tiempo) <= 4 && (
                <span className="ml-2 px-2 py-0.5 bg-eg-purple/10 text-eg-purple text-xs font-normal rounded-full">
                  Rápido
                </span>
              )}
            </span>
          </div>

          {/* Ayuno requerido */}
          <div className="flex items-center gap-2 text-base">
            <FastingIcon className="w-5 h-5 text-eg-purple flex-shrink-0" />
            <span className="text-eg-gray font-normal">Ayuno:</span>
            <span className={`font-normal ${studyData.ayuno ? 'text-eg-purple' : 'text-eg-purple'}`}>
              {studyData.ayuno ? 'Sí requiere' : 'No requiere'}
              {studyData.ayuno && (
                <span className="ml-2 text-xs text-eg-gray font-normal">(8-12 horas)</span>
              )}
            </span>
          </div>

          {/* Para perfiles: estudios incluidos */}
          {studyData.tipo === 'perfil' && studyData.contiene && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-base font-normal text-eg-dark mb-2">
                Incluye {studyData.contiene.length} estudios:
              </p>
              <div className="flex flex-wrap gap-1">
                {studyData.contiene.slice(0, 3).map((item, idx) => (
                  <span key={idx} className="px-2 py-1 bg-eg-purple/10 text-eg-purple text-xs font-normal rounded">
                    {item}
                  </span>
                ))}
                {studyData.contiene.length > 3 && (
                  <span className="px-2 py-1 bg-eg-pink/20 text-eg-purple text-xs font-normal rounded">
                    +{studyData.contiene.length - 3} más
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer con precio y acciones */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          {/* Badge de precio */}
          <div className="bg-eg-purple text-white px-5 py-3 rounded-lg shadow-md">
            <p className="text-sm font-normal opacity-90">Precio</p>
            <p className="text-2xl md:text-3xl font-normal">
              ${studyData.precio}
              <span className="text-sm ml-1 opacity-90">USD</span>
            </p>
          </div>

          {/* Botón más información */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDetailsClick();
            }}
            className="flex items-center gap-2 px-5 py-3 min-h-[48px] text-eg-purple hover:bg-eg-purple/5
                     rounded-lg transition-colors duration-200 group/btn
                     focus:outline-none focus:ring-2 focus:ring-eg-purple/50"
          >
            <span className="text-base font-normal">Más información</span>
            <InfoIcon className="w-5 h-5 group-hover/btn:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Indicador visual de ayuno en el borde superior */}
      {studyData.ayuno && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-eg-purple to-eg-pink" />
      )}
    </div>
  );
};

export default StudyCard;