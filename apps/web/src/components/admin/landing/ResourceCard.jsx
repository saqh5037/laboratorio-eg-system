import React from 'react';
import { Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import { renderIcon } from '../../../utils/iconMapper';

/**
 * ResourceCard Component
 * Card reutilizable para mostrar cualquier recurso de landing
 * (valores, certificaciones, testimonios, etc.)
 *
 * @param {Object} resource - Objeto del recurso a mostrar
 * @param {string} type - Tipo de recurso: 'value', 'certification', 'testimonial', 'contact', 'content', 'statistic'
 * @param {function} onEdit - Callback para editar: (resource) => void
 * @param {function} onDelete - Callback para eliminar: (resource) => void
 * @param {function} onToggle - Callback para toggle activo/inactivo: (resource) => void
 * @param {string} className - Clases CSS adicionales
 */
const ResourceCard = ({
  resource,
  type,
  onEdit,
  onDelete,
  onToggle,
  className = ''
}) => {
  /**
   * Renderizar contenido específico según tipo de recurso
   */
  const renderContent = () => {
    switch (type) {
      case 'value':
        return (
          <>
            <div className="flex items-start gap-4">
              {/* Icono */}
              {resource.icon_name && (
                <div className="flex-shrink-0 w-12 h-12 bg-eg-purple/10 rounded-lg
                             flex items-center justify-center">
                  {renderIcon(resource.icon_name, 'text-eg-purple', 6)}
                </div>
              )}

              {/* Contenido */}
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  {resource.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {resource.description}
                </p>
              </div>
            </div>
          </>
        );

      case 'certification':
        return (
          <>
            <div className="flex items-start gap-4">
              {resource.icon_name && (
                <div className="flex-shrink-0 w-12 h-12 bg-eg-purple/10 rounded-lg
                             flex items-center justify-center">
                  {renderIcon(resource.icon_name, 'text-eg-purple', 6)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  {resource.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {resource.description}
                </p>
              </div>
            </div>
          </>
        );

      case 'testimonial':
        return (
          <>
            <div className="flex items-start gap-4">
              {resource.avatar_type && (
                <div className="flex-shrink-0 w-12 h-12 bg-eg-purple/10 rounded-full
                             flex items-center justify-center">
                  {renderIcon(resource.avatar_type, 'text-eg-purple', 6)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  {resource.name}
                </h3>
                <p className="text-xs text-gray-500 mb-2">{resource.role}</p>
                <p className="text-sm text-gray-600 line-clamp-2 italic">
                  "{resource.text}"
                </p>
                {resource.rating && (
                  <div className="flex items-center gap-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-sm ${
                          i < resource.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        );

      case 'contact':
        return (
          <>
            <div className="flex items-start gap-4">
              {resource.icon_name && (
                <div className="flex-shrink-0 w-12 h-12 bg-eg-purple/10 rounded-lg
                             flex items-center justify-center">
                  {renderIcon(resource.icon_name, 'text-eg-purple', 6)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                    {resource.type}
                  </span>
                  {resource.category && (
                    <span className="text-xs px-2 py-1 bg-eg-purple/10 text-eg-purple rounded">
                      {resource.category}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">
                  {resource.label}
                </h3>
                <p className="text-sm text-gray-600">
                  {resource.value}
                </p>
                {resource.link && (
                  <a
                    href={resource.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-eg-purple hover:text-eg-pink mt-1 inline-block"
                  >
                    Ver enlace →
                  </a>
                )}
              </div>
            </div>
          </>
        );

      case 'content':
        return (
          <>
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                    {resource.section}
                  </span>
                  <span className="text-xs px-2 py-1 bg-eg-purple/10 text-eg-purple rounded">
                    {resource.block_type}
                  </span>
                </div>
                <p className="text-sm text-gray-900 line-clamp-3">
                  {resource.content}
                </p>
                {resource.image_url && (
                  <div className="mt-2">
                    <img
                      src={resource.image_url}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded border border-gray-200"
                    />
                  </div>
                )}
              </div>
            </div>
          </>
        );

      case 'statistic':
        return (
          <>
            <div className="flex items-start gap-4">
              {resource.icon_name && (
                <div className="flex-shrink-0 w-12 h-12 bg-eg-purple/10 rounded-lg
                             flex items-center justify-center">
                  {renderIcon(resource.icon_name, 'text-eg-purple', 6)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded inline-block mb-2">
                  {resource.section}
                </div>
                <h3 className="text-2xl font-bold text-eg-purple mb-1">
                  {resource.value}
                </h3>
                <p className="text-sm font-medium text-gray-900 mb-1">
                  {resource.label}
                </p>
                {resource.description && (
                  <p className="text-xs text-gray-600">
                    {resource.description}
                  </p>
                )}
              </div>
            </div>
          </>
        );

      default:
        return (
          <div className="text-gray-500">
            Tipo de recurso desconocido: {type}
          </div>
        );
    }
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4
                   hover:shadow-md transition-all ${className}`}>
      <div className="flex items-start justify-between gap-4">
        {/* Contenido principal */}
        <div className="flex-1 min-w-0">
          {renderContent()}
        </div>

        {/* Acciones y badges */}
        <div className="flex flex-col items-end gap-2">
          {/* Badges */}
          <div className="flex items-center gap-2">
            {/* Sort order */}
            {resource.sort_order !== undefined && (
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded font-mono">
                #{resource.sort_order}
              </span>
            )}

            {/* Estado activo/inactivo */}
            <span
              className={`text-xs px-2 py-1 rounded font-medium ${
                resource.is_active
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {resource.is_active ? 'Activo' : 'Inactivo'}
            </span>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center gap-1">
            {/* Toggle activo/inactivo */}
            {onToggle && (
              <button
                onClick={() => onToggle(resource)}
                className={`p-2 rounded-lg transition-colors ${
                  resource.is_active
                    ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    : 'text-green-500 hover:text-green-700 hover:bg-green-50'
                }`}
                title={resource.is_active ? 'Desactivar' : 'Activar'}
              >
                {resource.is_active ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            )}

            {/* Editar */}
            {onEdit && (
              <button
                onClick={() => onEdit(resource)}
                className="p-2 text-eg-purple hover:text-eg-pink hover:bg-eg-purple/10
                         rounded-lg transition-colors"
                title="Editar"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}

            {/* Eliminar */}
            {onDelete && (
              <button
                onClick={() => onDelete(resource)}
                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50
                         rounded-lg transition-colors"
                title="Eliminar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;
