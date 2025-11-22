import React from 'react';
import { renderIcon } from '../../utils/iconMapper';

/**
 * GridSection Component
 * Componente genérico para renderizar secciones con layout de grid
 * Usado para certificaciones, servicios, features, etc.
 *
 * @param {Object} props
 * @param {Object} props.section - Configuración de la sección
 * @param {Object} props.content - Contenido de landing
 */
const GridSection = ({ section, content }) => {
  const {
    dataSource,
    gridColumns = 3,
    cardStyle = '',
    showIcon = true,
    iconSize = 12,
    backgroundColor = 'white',
    textColor = 'gray-900',
    decorativeBlobs = false
  } = section.layout_config;

  // Obtener datos desde content object
  const data = content[dataSource] || [];

  // Si no hay datos, no renderizar nada
  if (data.length === 0) {
    if (import.meta.env.DEV) {
      return (
        <section className="py-8 bg-yellow-50">
          <div className="container mx-auto px-4">
            <p className="text-yellow-800">
              ⚠️ No hay datos para mostrar en "{section.section_key}" (dataSource: {dataSource})
            </p>
          </div>
        </section>
      );
    }
    return null;
  }

  // Construir clases de grid responsivo
  const gridClasses = [
    'grid',
    'grid-cols-1',
    gridColumns >= 2 && 'md:grid-cols-2',
    gridColumns >= 3 && `lg:grid-cols-${gridColumns}`,
    'gap-6'
  ].filter(Boolean).join(' ');

  // Clase de fondo
  const bgClass = backgroundColor.includes('gradient')
    ? `bg-${backgroundColor}`
    : `bg-${backgroundColor}`;

  return (
    <section
      id={section.section_key}
      className={`relative py-12 md:py-20 ${bgClass} overflow-hidden scroll-mt-20`}
    >
      {/* Decorative Blobs */}
      {decorativeBlobs && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-eg-pink/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-eg-purple/20 rounded-full blur-3xl" />
        </div>
      )}

      <div className="relative z-10 max-w-[1600px] mx-auto px-6 md:px-12 lg:px-24">
        {/* Section Header */}
        {(section.title || section.subtitle) && (
          <div className="text-center mb-12">
            {section.title && (
              <h2 className={`text-3xl md:text-4xl font-normal text-${textColor} mb-4`}>
                {section.title}
              </h2>
            )}
            {section.subtitle && (
              <p className={`text-lg md:text-xl text-${textColor} max-w-3xl mx-auto`}>
                {section.subtitle}
              </p>
            )}
          </div>
        )}

        {/* Grid de items */}
        <div className={gridClasses}>
          {data.map((item, index) => (
            <div
              key={item.id}
              className={`${cardStyle} animate-fade-in-up`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Icon */}
              {showIcon && item.icon_name && (
                <div className="mb-6">
                  {renderIcon(item.icon_name, `text-eg-purple w-${iconSize} h-${iconSize}`)}
                </div>
              )}

              {/* Title */}
              {item.title && (
                <h3 className="text-2xl font-normal text-eg-purple mb-3">
                  {item.title}
                </h3>
              )}

              {/* Description */}
              {item.description && (
                <p className="text-eg-dark text-base leading-relaxed">
                  {item.description}
                </p>
              )}

              {/* Image (si existe) */}
              {item.image_url && (
                <img
                  src={item.image_url}
                  alt={item.title || 'Image'}
                  className="w-full h-auto rounded-lg mt-4"
                  loading="lazy"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Animación CSS */}
      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </section>
  );
};

export default GridSection;
