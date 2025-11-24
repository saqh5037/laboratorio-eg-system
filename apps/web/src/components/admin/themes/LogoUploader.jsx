import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader } from 'lucide-react';
import * as themesApi from '../../../services/themesApi';
import { config } from '../../../config/env.js';

/**
 * LogoUploader Component
 * Uploader de logos con drag & drop, preview y validación
 *
 * @param {Object} props
 * @param {string} props.label - Label del uploader
 * @param {string} props.type - Tipo de logo: 'main' | 'icon' | 'favicon'
 * @param {string} props.currentLogo - URL del logo actual
 * @param {Function} props.onUpload - Callback cuando se sube el logo
 * @param {boolean} props.isUploading - Estado de carga
 */
export function LogoUploader({ label, type = 'main', currentLogo, onUpload, isUploading = false }) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file) => {
    setValidationError(null);

    // Validar archivo
    const validation = themesApi.validateLogoFile(file);
    if (!validation.valid) {
      setValidationError(validation.error);
      return;
    }

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Simular progreso y subir
    handleUpload(file);
  };

  const handleUpload = async (file) => {
    try {
      // Simular progreso de subida
      setUploadProgress(0);
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      await onUpload(file, type);

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Limpiar preview después de subir
      setTimeout(() => {
        setPreview(null);
        setUploadProgress(0);
      }, 1500);
    } catch (error) {
      setValidationError(error.message || 'Error al subir logo');
      setPreview(null);
      setUploadProgress(0);
    }
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  const handleClearPreview = () => {
    setPreview(null);
    setValidationError(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getLogoUrl = () => {
    if (preview) return preview;
    if (currentLogo) {
      // Si es una ruta relativa, agregar el base URL del servidor de config
      if (currentLogo.startsWith('/uploads')) {
        return `${config.VITE_CONFIG_API_URL}${currentLogo}`;
      }
      return currentLogo;
    }
    return null;
  };

  const logoUrl = getLogoUrl();

  return (
    <div className="space-y-3">
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700">
        {label}
        <span className="text-xs text-gray-500 ml-2">(JPG, PNG, SVG - Máx 2MB)</span>
      </label>

      {/* Drop Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClickUpload}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-all duration-200
          ${isDragging
            ? 'border-primary bg-primary/5 scale-105'
            : 'border-gray-300 bg-gray-50 hover:border-primary/50 hover:bg-gray-100'
          }
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {/* Preview del logo actual o nuevo */}
        {logoUrl ? (
          <div className="relative">
            <img
              src={logoUrl}
              alt="Logo preview"
              className="max-h-32 mx-auto object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />

            {preview && !isUploading && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearPreview();
                }}
                className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                title="Cancelar"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="py-4">
            <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-sm text-gray-600 mb-1">
              {isDragging ? 'Suelta el archivo aquí' : 'Arrastra un archivo o haz clic para seleccionar'}
            </p>
            <p className="text-xs text-gray-500">JPG, PNG o SVG (máx 2MB)</p>
          </div>
        )}

        {/* Input oculto */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/svg+xml"
          onChange={handleFileInputChange}
          disabled={isUploading}
          className="hidden"
        />

        {/* Indicador de carga */}
        {isUploading && (
          <div className="absolute inset-0 bg-white/90 flex flex-col items-center justify-center rounded-lg">
            <Loader className="w-8 h-8 text-primary animate-spin mb-2" />
            <p className="text-sm text-gray-600 font-medium">Subiendo logo...</p>
            {uploadProgress > 0 && (
              <div className="w-48 h-2 bg-gray-200 rounded-full mt-3 overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error de validación */}
      {validationError && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{validationError}</p>
        </div>
      )}

      {/* Botón de acción alternativo */}
      {logoUrl && !isUploading && (
        <button
          type="button"
          onClick={handleClickUpload}
          className="w-full px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Cambiar logo
        </button>
      )}
    </div>
  );
}
