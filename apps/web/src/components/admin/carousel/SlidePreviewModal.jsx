import { X } from 'lucide-react';
import { FaCalendarAlt, FaFlask } from 'react-icons/fa';

export default function SlidePreviewModal({ isOpen, onClose, slide }) {
  if (!isOpen || !slide) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
      >
        <X className="w-8 h-8" />
      </button>

      {/* Preview Container */}
      <div className="w-full max-w-6xl">
        {/* Header Info */}
        <div className="bg-white/10 backdrop-blur-sm rounded-t-lg px-6 py-3 text-white">
          <p className="text-sm">Vista Previa del Slide</p>
          <p className="text-xs text-gray-300 mt-1">
            Así se verá en el carrusel principal del sitio web
          </p>
        </div>

        {/* Slide Preview - Mismo estilo que HeroCarouselEG */}
        <div className="relative h-[450px] md:h-[500px] overflow-hidden bg-gradient-to-b from-white to-gray-100 rounded-b-lg">
          {/* Background with Overlay */}
          <div className="absolute inset-0">
            <img
              src={slide.image_url}
              alt={slide.image_alt || slide.title}
              className="w-full h-full object-cover"
            />
            {/* Directorio-style gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-900/90 via-purple-900/70 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30" />
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-pink-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>

          {/* Content */}
          <div className="relative h-full flex items-center">
            <div className="container mx-auto px-4">
              <div className="max-w-2xl">
                {/* Badge */}
                {slide.badge_text && (
                  <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium mb-4 shadow-md ${
                    slide.badge_color === 'pink' ? 'bg-pink-500 text-white' :
                    slide.badge_color === 'purple' ? 'bg-purple-600 text-white' :
                    slide.badge_color === 'blue' ? 'bg-blue-500 text-white' :
                    slide.badge_color === 'green' ? 'bg-green-500 text-white' :
                    slide.badge_color === 'red' ? 'bg-red-500 text-white' :
                    slide.badge_color === 'yellow' ? 'bg-yellow-500 text-gray-900' :
                    'bg-pink-500 text-white'
                  }`}>
                    {slide.badge_text}
                  </span>
                )}

                {/* Title */}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-normal text-white mb-4">
                  {slide.title}
                </h1>

                {/* Subtitle */}
                {slide.subtitle && (
                  <p className="text-xl md:text-2xl mb-2 text-white/90 font-light">
                    {slide.subtitle}
                  </p>
                )}

                {/* Description */}
                {slide.description && (
                  <p className="text-lg mb-8 text-white/80">
                    {slide.description}
                  </p>
                )}

                {/* CTAs */}
                <div className="flex flex-wrap gap-4">
                  {slide.cta1_text && slide.cta1_link && (
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-700 rounded-lg
                               font-medium shadow-lg hover:shadow-xl
                               transition-all transform hover:scale-105 cursor-not-allowed"
                    >
                      <FaCalendarAlt />
                      {slide.cta1_text}
                    </button>
                  )}

                  {slide.cta2_text && slide.cta2_link && (
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white
                               text-white rounded-lg font-medium hover:bg-white/10
                               transition-all backdrop-blur-sm cursor-not-allowed"
                    >
                      <FaFlask />
                      {slide.cta2_text}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="bg-white/10 backdrop-blur-sm rounded-b-lg px-6 py-4 text-white mt-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-300">Estado:</p>
              <p className="font-medium">
                {slide.is_active ? (
                  <span className="text-green-400">✓ Activo</span>
                ) : (
                  <span className="text-gray-400">○ Inactivo</span>
                )}
              </p>
            </div>
            {slide.start_date && (
              <div>
                <p className="text-gray-300">Fecha de inicio:</p>
                <p className="font-medium">
                  {new Date(slide.start_date).toLocaleString('es-MX')}
                </p>
              </div>
            )}
            {slide.end_date && (
              <div>
                <p className="text-gray-300">Fecha de fin:</p>
                <p className="font-medium">
                  {new Date(slide.end_date).toLocaleString('es-MX')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
