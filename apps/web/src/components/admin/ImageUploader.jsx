import { useState, useRef, useCallback } from 'react';
import { Upload, Link as LinkIcon, X, Image, Loader2, Check, AlertCircle } from 'lucide-react';
import { configApi } from '../../services/configApi';

/**
 * ImageUploader - Componente reutilizable para subir/seleccionar imágenes
 *
 * Props:
 * - value: URL actual de la imagen
 * - onChange: callback cuando cambia la URL (recibe url string)
 * - category: categoría para organizar (services, about, testimonials, etc.)
 * - label: etiqueta del campo
 * - placeholder: placeholder para URL
 * - previewHeight: altura del preview (default: 200)
 * - acceptedFormats: formatos aceptados (default: imagen/*)
 * - maxSizeMB: tamaño máximo en MB (default: 10)
 */
export default function ImageUploader({
  value = '',
  onChange,
  category = 'general',
  label = 'Imagen',
  placeholder = 'https://...',
  previewHeight = 200,
  acceptedFormats = 'image/*',
  maxSizeMB = 10
}) {
  const [mode, setMode] = useState('url'); // 'url' | 'upload'
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [urlInput, setUrlInput] = useState(value);
  const fileInputRef = useRef(null);

  // Manejar cambio de URL
  const handleUrlChange = (e) => {
    const newUrl = e.target.value;
    setUrlInput(newUrl);
    setError(null);
  };

  // Confirmar URL
  const handleUrlConfirm = () => {
    if (urlInput && !isValidUrl(urlInput)) {
      setError('URL no válida');
      return;
    }
    onChange(urlInput);
    setError(null);
  };

  // Validar URL
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  // Manejar selección de archivo
  const handleFileSelect = async (file) => {
    if (!file) return;

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten archivos de imagen');
      return;
    }

    // Validar tamaño
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`El archivo es muy grande. Máximo: ${maxSizeMB}MB`);
      return;
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);

      const response = await configApi.uploadImage(formData, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });

      if (response.success) {
        onChange(response.data.url);
        setUrlInput(response.data.url);
        setUploadProgress(100);
      } else {
        setError(response.error || 'Error al subir imagen');
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      setError(err.message || 'Error al subir imagen');
    } finally {
      setIsUploading(false);
    }
  };

  // Manejar input file change
  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Drag and drop handlers
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, []);

  // Limpiar imagen
  const handleClear = () => {
    onChange('');
    setUrlInput('');
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      {/* Mode selector */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`px-3 py-2 text-sm font-medium transition-colors ${
            mode === 'url'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <LinkIcon className="w-4 h-4 inline-block mr-1" />
          URL
        </button>
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={`px-3 py-2 text-sm font-medium transition-colors ${
            mode === 'upload'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Upload className="w-4 h-4 inline-block mr-1" />
          Subir
        </button>
      </div>

      {/* URL Mode */}
      {mode === 'url' && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={handleUrlChange}
              onBlur={handleUrlConfirm}
              onKeyDown={(e) => e.key === 'Enter' && handleUrlConfirm()}
              placeholder={placeholder}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {urlInput && (
              <button
                type="button"
                onClick={handleClear}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                title="Limpiar"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Upload Mode */}
      {mode === 'upload' && (
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragOver
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedFormats}
            onChange={handleInputChange}
            className="hidden"
          />

          {isUploading ? (
            <div className="space-y-2">
              <Loader2 className="w-8 h-8 mx-auto text-blue-500 animate-spin" />
              <p className="text-sm text-gray-600">Subiendo... {uploadProgress}%</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <Image className="w-10 h-10 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                Arrastra una imagen aquí o{' '}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:underline font-medium"
                >
                  selecciona un archivo
                </button>
              </p>
              <p className="text-xs text-gray-400">
                JPG, PNG o WebP. Máximo {maxSizeMB}MB
              </p>
            </>
          )}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 text-red-500 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Preview */}
      {value && (
        <div className="relative group">
          <div
            className="rounded-lg overflow-hidden bg-gray-100 border border-gray-200"
            style={{ height: previewHeight }}
          >
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23f3f4f6" width="100%" height="100%"/><text x="50%" y="50%" fill="%239ca3af" text-anchor="middle" dy=".3em" font-family="sans-serif" font-size="12">Error</text></svg>';
              }}
            />
          </div>
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4 inline-block mr-1" />
              Eliminar
            </button>
          </div>
          <div className="absolute bottom-2 right-2">
            <div className="bg-green-500 text-white p-1 rounded-full">
              <Check className="w-4 h-4" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
