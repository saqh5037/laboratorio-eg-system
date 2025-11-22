import React from 'react';
import {
  FaCalendarAlt,
  FaFlask,
  FaPhone,
  FaWhatsapp,
  FaLaptop,
  FaUser,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaHeart,
  FaStar,
  FaBell,
  FaFile,
  FaImage,
  FaVideo,
  FaPlay,
  FaSearch,
  FaCog,
  FaQuestionCircle,
  FaInfoCircle,
  FaDownload,
  FaShare,
  FaHome,
  FaEye,
} from 'react-icons/fa';

// Mapeo de iconos (mismo que en HeroCarouselEG)
const ICON_MAP = {
  calendar: FaCalendarAlt,
  flask: FaFlask,
  phone: FaPhone,
  whatsapp: FaWhatsapp,
  laptop: FaLaptop,
  user: FaUser,
  email: FaEnvelope,
  map: FaMapMarkerAlt,
  check: FaCheckCircle,
  heart: FaHeart,
  star: FaStar,
  bell: FaBell,
  file: FaFile,
  image: FaImage,
  video: FaVideo,
  play: FaPlay,
  search: FaSearch,
  settings: FaCog,
  help: FaQuestionCircle,
  info: FaInfoCircle,
  download: FaDownload,
  share: FaShare,
  home: FaHome,
};

// Helper para obtener componente de icono
const getIconComponent = (iconName) => {
  if (!iconName) return FaCalendarAlt;
  const IconComponent = ICON_MAP[iconName.toLowerCase()];
  return IconComponent || FaCalendarAlt;
};

/**
 * LivePreview Component
 * Preview en tiempo real de cómo se verá el slide en el carrusel
 *
 * @param {Object} slideData - Datos del slide para preview
 */
const LivePreview = ({ slideData }) => {
  const {
    title = '',
    subtitle = '',
    description = '',
    image_url = '',
    image_mobile_url = '',
    image_alt = '',
    cta1_text = '',
    cta1_link = '',
    cta1_icon = 'calendar',
    cta2_text = '',
    cta2_link = '',
    cta2_icon = 'flask',
    badge_text = '',
    badge_color = 'purple',
  } = slideData;

  // Imagen de placeholder si no hay URL
  const placeholderImage = 'https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?w=1920';
  const displayImage = image_url || placeholderImage;

  // Obtener componentes de iconos
  const Icon1 = getIconComponent(cta1_icon);
  const Icon2 = getIconComponent(cta2_icon);

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
      {/* Header del preview */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
        <FaEye className="text-eg-purple" />
        <span className="font-medium text-gray-700 text-sm">Vista Previa en Tiempo Real</span>
      </div>

      {/* Preview del slide - Versión Desktop */}
      <div className="p-4 bg-gray-100">
        <div className="relative h-[300px] rounded-lg overflow-hidden shadow-lg">
          {/* Background con overlay */}
          <div className="absolute inset-0">
            <img
              src={displayImage}
              alt={image_alt || 'Preview'}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = placeholderImage;
              }}
            />
            {/* Gradient overlay - mismo estilo que HeroCarouselEG */}
            <div className="absolute inset-0 bg-gradient-to-r from-eg-purple/90 via-eg-purple/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-eg-dark/30" />
          </div>

          {/* Elementos decorativos */}
          <div className="absolute top-6 left-6 w-12 h-12 bg-eg-pink/20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-6 right-6 w-16 h-16 bg-eg-purple/10 rounded-full blur-2xl"></div>

          {/* Contenido */}
          <div className="relative h-full flex items-center">
            <div className="px-8 max-w-xl">
              {/* Badge */}
              {badge_text && (
                <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-medium mb-3 shadow-md ${
                  badge_color === 'pink' ? 'bg-eg-pink text-eg-purple' :
                  badge_color === 'purple' ? 'bg-eg-purple text-white' :
                  badge_color === 'blue' ? 'bg-blue-500 text-white' :
                  badge_color === 'green' ? 'bg-green-500 text-white' :
                  badge_color === 'red' ? 'bg-red-500 text-white' :
                  badge_color === 'yellow' ? 'bg-yellow-500 text-gray-900' :
                  'bg-eg-pink text-eg-purple'
                }`}>
                  {badge_text}
                </span>
              )}

              {/* Título */}
              <h1 className="text-2xl font-normal text-white mb-2">
                {title || 'Título del slide'}
              </h1>

              {/* Subtítulo */}
              {subtitle && (
                <p className="text-lg mb-1 text-white/90 font-light">
                  {subtitle}
                </p>
              )}

              {/* Descripción */}
              {description && (
                <p className="text-sm mb-4 text-white/80">
                  {description}
                </p>
              )}

              {/* CTAs */}
              <div className="flex flex-wrap gap-2">
                {cta1_text && cta1_link && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white text-eg-purple
                               rounded-lg text-sm font-medium shadow-md">
                    <Icon1 className="text-sm" />
                    {cta1_text}
                  </div>
                )}

                {cta2_text && cta2_link && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 border-2 border-white
                               text-white rounded-lg text-sm font-medium backdrop-blur-sm">
                    <Icon2 className="text-sm" />
                    {cta2_text}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Móvil (opcional) */}
      {image_mobile_url && (
        <div className="px-4 pb-4 bg-gray-100">
          <div className="pt-2">
            <div className="text-xs text-gray-600 mb-2 flex items-center gap-2">
              <span className="font-medium">Vista Móvil:</span>
              <span className="text-gray-500">Se utilizará imagen móvil optimizada</span>
            </div>
            <div className="relative h-[150px] rounded-lg overflow-hidden shadow-md">
              <img
                src={image_mobile_url}
                alt={`${image_alt || 'Preview'} - Móvil`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = displayImage;
                }}
              />
              {/* Overlay reducido para móvil */}
              <div className="absolute inset-0 bg-gradient-to-r from-eg-purple/90 via-eg-purple/70 to-transparent" />
            </div>
          </div>
        </div>
      )}

      {/* Indicadores de estado */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="font-medium">Título:</span>{' '}
            <span className={title ? 'text-green-600' : 'text-gray-400'}>
              {title ? '✓ Definido' : '✗ Pendiente'}
            </span>
          </div>
          <div>
            <span className="font-medium">Imagen:</span>{' '}
            <span className={image_url ? 'text-green-600' : 'text-gray-400'}>
              {image_url ? '✓ Definida' : '✗ Usando placeholder'}
            </span>
          </div>
          <div>
            <span className="font-medium">CTA Principal:</span>{' '}
            <span className={cta1_text && cta1_link ? 'text-green-600' : 'text-gray-400'}>
              {cta1_text && cta1_link ? '✓ Configurado' : '✗ Opcional'}
            </span>
          </div>
          <div>
            <span className="font-medium">CTA Secundario:</span>{' '}
            <span className={cta2_text && cta2_link ? 'text-green-600' : 'text-gray-400'}>
              {cta2_text && cta2_link ? '✓ Configurado' : '✗ Opcional'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivePreview;
