import { useState } from 'react';
import { Check, Palette } from 'lucide-react';

/**
 * TemplateSelector Component
 * Selector visual de templates predefinidos con preview de colores
 *
 * @param {Object} props
 * @param {Array} props.templates - Lista de templates disponibles
 * @param {string} props.currentTheme - Nombre del tema actual
 * @param {Function} props.onApply - Callback cuando se aplica un template
 * @param {boolean} props.isLoading - Estado de carga
 */
export function TemplateSelector({ templates, currentTheme, onApply, isLoading = false }) {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleTemplateClick = (template) => {
    setSelectedTemplate(template);
    setShowConfirmModal(true);
  };

  const handleConfirmApply = () => {
    if (selectedTemplate) {
      onApply(selectedTemplate.id);
      setShowConfirmModal(false);
      setSelectedTemplate(null);
    }
  };

  const handleCancelApply = () => {
    setShowConfirmModal(false);
    setSelectedTemplate(null);
  };

  const isCurrentTemplate = (templateName) => {
    return currentTheme?.toLowerCase().includes(templateName.toLowerCase());
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-gray-900">Templates Predefinidos</h3>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Selecciona un tema prediseñado para aplicar rápidamente. Los logos actuales se conservarán.
        </p>

        {/* Grid de templates */}
        <div className="grid grid-cols-1 gap-4">
          {templates.map((template) => {
            const isCurrent = isCurrentTemplate(template.name);

            return (
              <button
                key={template.id}
                onClick={() => handleTemplateClick(template)}
                disabled={isLoading}
                className={`
                  relative p-4 text-left rounded-lg border-2 transition-all duration-200
                  ${isCurrent
                    ? 'border-primary bg-primary/5 ring-2 ring-primary ring-offset-2'
                    : 'border-gray-200 bg-white hover:border-primary/50 hover:shadow-md'
                  }
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {/* Badge "Actual" */}
                {isCurrent && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-primary text-white text-xs font-semibold rounded-full">
                    <Check className="w-3 h-3" />
                    Actual
                  </div>
                )}

                {/* Nombre y descripción */}
                <div className="mb-3">
                  <h4 className="font-semibold text-gray-900 mb-1">{template.name}</h4>
                  <p className="text-sm text-gray-600">{template.description}</p>
                </div>

                {/* Preview de colores */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-medium">Colores:</span>
                  <div className="flex gap-2">
                    <div
                      className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: template.preview.primary }}
                      title={`Primary: ${template.preview.primary}`}
                    />
                    <div
                      className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: template.preview.secondary }}
                      title={`Secondary: ${template.preview.secondary}`}
                    />
                    <div
                      className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: template.preview.accent }}
                      title={`Accent: ${template.preview.accent}`}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Estado vacío */}
        {templates.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Palette className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No hay templates disponibles</p>
          </div>
        )}
      </div>

      {/* Modal de Confirmación */}
      {showConfirmModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-scale-in">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aplicar Template: {selectedTemplate.name}
            </h3>

            <p className="text-sm text-gray-600 mb-4">
              Esto cambiará todos los colores, tipografía y estilos del sistema.
              Los logos actuales se conservarán.
            </p>

            {/* Preview del template */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-xs font-medium text-gray-700 mb-2">Vista previa de colores:</p>
              <div className="flex gap-3">
                <div className="flex-1 text-center">
                  <div
                    className="w-full h-16 rounded-lg shadow-sm mb-2"
                    style={{ backgroundColor: selectedTemplate.preview.primary }}
                  />
                  <p className="text-xs text-gray-600">Primary</p>
                  <p className="text-xs font-mono text-gray-500">{selectedTemplate.preview.primary}</p>
                </div>
                <div className="flex-1 text-center">
                  <div
                    className="w-full h-16 rounded-lg shadow-sm mb-2"
                    style={{ backgroundColor: selectedTemplate.preview.secondary }}
                  />
                  <p className="text-xs text-gray-600">Secondary</p>
                  <p className="text-xs font-mono text-gray-500">{selectedTemplate.preview.secondary}</p>
                </div>
                <div className="flex-1 text-center">
                  <div
                    className="w-full h-16 rounded-lg shadow-sm mb-2"
                    style={{ backgroundColor: selectedTemplate.preview.accent }}
                  />
                  <p className="text-xs text-gray-600">Accent</p>
                  <p className="text-xs font-mono text-gray-500">{selectedTemplate.preview.accent}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancelApply}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmApply}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Aplicando...' : 'Aplicar Template'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </>
  );
}
