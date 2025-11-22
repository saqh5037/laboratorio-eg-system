import { useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import * as themesApi from '../../../services/themesApi';

/**
 * ColorPicker Component
 * Wrapper para react-colorful con input manual, validación y swatches predefinidos
 *
 * @param {Object} props
 * @param {string} props.label - Label descriptivo del color
 * @param {string} props.value - Color actual en formato HEX (#RRGGBB)
 * @param {Function} props.onChange - Callback cuando cambia el color
 * @param {boolean} props.disabled - Deshabilitar el picker
 */
export function ColorPicker({ label, value, onChange, disabled = false }) {
  const [showPicker, setShowPicker] = useState(false);
  const [manualInput, setManualInput] = useState(value);
  const [validationError, setValidationError] = useState(null);

  // Swatches predefinidos con colores de templates
  const swatches = [
    // Lab EG
    { name: 'Lab EG Primary', color: '#7B68A6' },
    { name: 'Lab EG Secondary', color: '#DDB5D5' },
    { name: 'Lab EG Accent', color: '#8B8C8E' },

    // Blue Corporate
    { name: 'Blue Primary', color: '#2563EB' },
    { name: 'Blue Secondary', color: '#60A5FA' },

    // Green Health
    { name: 'Green Primary', color: '#059669' },
    { name: 'Green Secondary', color: '#34D399' },

    // Orange Modern
    { name: 'Orange Primary', color: '#EA580C' },
    { name: 'Orange Secondary', color: '#FB923C' },

    // Common colors
    { name: 'Black', color: '#231F20' },
    { name: 'White', color: '#FFFFFF' },
    { name: 'Gray', color: '#8B8C8E' }
  ];

  const handleColorChange = (newColor) => {
    if (disabled) return;

    const upperColor = newColor.toUpperCase();
    setManualInput(upperColor);
    setValidationError(null);
    onChange(upperColor);
  };

  const handleManualInput = (e) => {
    const input = e.target.value;
    setManualInput(input);

    // Validar formato hex
    if (themesApi.isValidHexColor(input)) {
      setValidationError(null);
      onChange(input.toUpperCase());
    } else if (input.length === 7) {
      setValidationError('Color hexadecimal inválido (debe ser #RRGGBB)');
    }
  };

  const handleSwatchClick = (color) => {
    if (disabled) return;
    handleColorChange(color);
  };

  return (
    <div className="space-y-3">
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      {/* Color Preview + Input */}
      <div className="flex items-center gap-3">
        {/* Current Color Swatch */}
        <button
          type="button"
          onClick={() => !disabled && setShowPicker(!showPicker)}
          disabled={disabled}
          className={`
            w-12 h-12 rounded-lg border-2 border-gray-300
            shadow-sm transition-all duration-200
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400 cursor-pointer'}
            ${showPicker ? 'ring-2 ring-primary ring-offset-2' : ''}
          `}
          style={{ backgroundColor: value }}
          title="Click para abrir color picker"
        />

        {/* Manual HEX Input */}
        <div className="flex-1">
          <input
            type="text"
            value={manualInput}
            onChange={handleManualInput}
            disabled={disabled}
            placeholder="#7B68A6"
            maxLength={7}
            className={`
              w-full px-4 py-2 border rounded-lg font-mono text-sm
              ${validationError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary'}
              ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
              focus:outline-none focus:ring-2
            `}
          />
          {validationError && (
            <p className="text-xs text-red-600 mt-1">{validationError}</p>
          )}
        </div>
      </div>

      {/* Color Picker (expandible) */}
      {showPicker && !disabled && (
        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-lg">
          <HexColorPicker color={value} onChange={handleColorChange} />

          {/* Swatches Predefinidos */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs font-medium text-gray-700 mb-2">Colores predefinidos:</p>
            <div className="grid grid-cols-6 gap-2">
              {swatches.map((swatch) => (
                <button
                  key={swatch.color}
                  type="button"
                  onClick={() => handleSwatchClick(swatch.color)}
                  className={`
                    w-8 h-8 rounded border-2 transition-all duration-200
                    hover:scale-110 hover:shadow-md
                    ${value.toUpperCase() === swatch.color ? 'border-gray-800 ring-2 ring-primary' : 'border-gray-300'}
                  `}
                  style={{ backgroundColor: swatch.color }}
                  title={swatch.name}
                />
              ))}
            </div>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={() => setShowPicker(false)}
            className="mt-3 w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      )}
    </div>
  );
}
