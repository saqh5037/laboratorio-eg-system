import { useState, useRef } from 'react';
import { X, Upload, Image as ImageIcon, Copy, Check, AlertCircle } from 'lucide-react';

export default function ImageUploadModal({ isOpen, onClose, onUpload, uploading = false }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [copiedUrl, setCopiedUrl] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (file) => {
    const errors = [];

    // Validar tipo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      errors.push('Solo se permiten imágenes JPG, PNG o WebP');
    }

    // Validar tamaño (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      errors.push('El archivo no debe superar los 5MB');
    }

    return errors;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setError(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    setError(null);

    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    // Validar archivo
    const errors = validateFile(file);
    if (errors.length > 0) {
      setError(errors.join('. '));
      return;
    }

    setSelectedFile(file);

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      const result = await onUpload(selectedFile);
      if (result.success) {
        setUploadResult(result.data);
      } else {
        setError(result.error || 'Error al subir imagen');
      }
    } catch (err) {
      setError(err.message || 'Error al subir imagen');
    }
  };

  const handleCopyUrl = (url, type) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(type);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreview(null);
    setUploadResult(null);
    setError(null);
    setCopiedUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    if (!uploading) {
      handleReset();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Subir Imagen</h2>
            <p className="text-sm text-gray-600 mt-1">
              Se generarán versiones optimizadas para desktop y móvil
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={uploading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!uploadResult ? (
            <>
              {/* Error Message */}
              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Error</p>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              )}

              {/* Drag & Drop Area */}
              {!selectedFile ? (
                <div
                  className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive
                      ? 'border-eg-purple bg-purple-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleChange}
                    disabled={uploading}
                  />

                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />

                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Arrastra tu imagen aquí
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    o haz clic para seleccionar
                  </p>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="px-6 py-2 bg-eg-purple text-white rounded-lg hover:bg-eg-purple/90 transition-colors disabled:opacity-50"
                  >
                    Seleccionar Archivo
                  </button>

                  <p className="text-xs text-gray-500 mt-4">
                    JPG, PNG o WebP • Máximo 5MB • Recomendado: 1920x1080
                  </p>
                </div>
              ) : (
                <>
                  {/* Preview */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vista Previa
                    </label>
                    <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-64 object-contain"
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
                      <span>{selectedFile.name}</span>
                      <span>{(selectedFile.size / 1024).toFixed(2)} KB</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleReset}
                      disabled={uploading}
                      className="flex-1 px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      Cambiar Imagen
                    </button>
                    <button
                      onClick={handleUpload}
                      disabled={uploading}
                      className="flex-1 px-6 py-2 bg-eg-purple text-white rounded-lg hover:bg-eg-purple/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {uploading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Subiendo...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Subir Imagen
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            /* Upload Success */
            <div className="space-y-6">
              {/* Success Message */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-800">Imagen subida exitosamente</p>
                  <p className="text-sm text-green-700 mt-1">
                    Se generaron versiones optimizadas para desktop y móvil
                  </p>
                </div>
              </div>

              {/* URLs */}
              <div className="space-y-4">
                {/* Desktop URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL Desktop (1920x1080 WebP)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={uploadResult.desktop_url}
                      readOnly
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                    />
                    <button
                      onClick={() => handleCopyUrl(uploadResult.desktop_url, 'desktop')}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
                    >
                      {copiedUrl === 'desktop' ? (
                        <>
                          <Check className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-600">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span className="text-sm">Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {uploadResult.desktop_size}
                  </p>
                </div>

                {/* Mobile URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL Móvil (800x600 WebP)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={uploadResult.mobile_url}
                      readOnly
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                    />
                    <button
                      onClick={() => handleCopyUrl(uploadResult.mobile_url, 'mobile')}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2"
                    >
                      {copiedUrl === 'mobile' ? (
                        <>
                          <Check className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-600">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span className="text-sm">Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {uploadResult.mobile_size}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={handleReset}
                  className="flex-1 px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Subir Otra Imagen
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 px-6 py-2 bg-eg-purple text-white rounded-lg hover:bg-eg-purple/90 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
