import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className = '',
  placeholder = null,
  quality = 85,
  sizes = '100vw',
  priority = false,
  onLoad = null,
  onError = null,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef();
  const observerRef = useRef();

  // Intersection Observer para lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '50px 0px' // Cargar un poco antes de que sea visible
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [priority]);

  // Generar URLs optimizadas
  const generateSrcSet = (baseSrc) => {
    if (!baseSrc) return '';
    
    // Para imágenes locales, generar diferentes tamaños
    if (baseSrc.startsWith('/')) {
      const name = baseSrc.split('/').pop().split('.')[0];
      const ext = baseSrc.split('.').pop();
      const path = baseSrc.substring(0, baseSrc.lastIndexOf('/'));
      
      return [
        `${path}/${name}-400w.${ext} 400w`,
        `${path}/${name}-800w.${ext} 800w`,
        `${path}/${name}-1200w.${ext} 1200w`,
        `${path}/${name}-1600w.${ext} 1600w`
      ].join(', ');
    }
    
    return '';
  };

  // Detectar soporte para WebP
  const supportsWebP = () => {
    if (typeof window === 'undefined') return false;
    
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  };

  // Generar URL optimizada
  const getOptimizedSrc = (originalSrc) => {
    if (!originalSrc) return '';
    
    // Para imágenes locales, intentar WebP si está soportado
    if (originalSrc.startsWith('/') && supportsWebP()) {
      const webpSrc = originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
      return webpSrc;
    }
    
    return originalSrc;
  };

  const handleLoad = (e) => {
    setIsLoaded(true);
    onLoad?.(e);
  };

  const handleError = (e) => {
    setIsError(true);
    onError?.(e);
    
    // Fallback a imagen original si WebP falla
    if (e.target.src.includes('.webp')) {
      e.target.src = src;
    }
  };

  // Placeholder mientras carga
  const renderPlaceholder = () => {
    if (placeholder) {
      return placeholder;
    }
    
    return (
      <div 
        className={`bg-gray-200 animate-pulse flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <svg 
          className="w-8 h-8 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
          />
        </svg>
      </div>
    );
  };

  // Error placeholder
  const renderError = () => (
    <div 
      className={`bg-red-50 border border-red-200 flex items-center justify-center ${className}`}
      style={{ width, height }}
    >
      <div className="text-center text-red-500">
        <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xs">Error al cargar</p>
      </div>
    </div>
  );

  if (isError) {
    return renderError();
  }

  return (
    <div ref={imgRef} className="relative overflow-hidden">
      {/* Placeholder */}
      {!isLoaded && renderPlaceholder()}
      
      {/* Imagen principal */}
      {isInView && (
        <motion.picture
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className={isLoaded ? '' : 'absolute inset-0'}
        >
          {/* Source WebP si está soportado */}
          {supportsWebP() && (
            <source
              srcSet={generateSrcSet(getOptimizedSrc(src))}
              sizes={sizes}
              type="image/webp"
            />
          )}
          
          {/* Source original */}
          <source
            srcSet={generateSrcSet(src)}
            sizes={sizes}
          />
          
          {/* Imagen fallback */}
          <img
            src={getOptimizedSrc(src)}
            alt={alt}
            width={width}
            height={height}
            className={className}
            onLoad={handleLoad}
            onError={handleError}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            {...props}
          />
        </motion.picture>
      )}
    </div>
  );
};

// Hook para precargar imágenes críticas
export const useImagePreloader = (imageSources = []) => {
  const [loadedImages, setLoadedImages] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (imageSources.length === 0) return;

    setIsLoading(true);
    
    const preloadPromises = imageSources.map(src => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        
        img.onload = () => {
          setLoadedImages(prev => new Set([...prev, src]));
          resolve(src);
        };
        
        img.onerror = () => {
          console.warn(`Failed to preload image: ${src}`);
          reject(src);
        };
        
        img.src = src;
      });
    });

    Promise.allSettled(preloadPromises).then(() => {
      setIsLoading(false);
    });
  }, [imageSources]);

  return { loadedImages, isLoading };
};

// Componente para avatar con fallback
export const Avatar = ({ 
  src, 
  alt = 'Avatar', 
  size = 'md', 
  fallback = null,
  className = '' 
}) => {
  const [hasError, setHasError] = useState(false);
  
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20'
  };

  const handleError = () => {
    setHasError(true);
  };

  if (hasError || !src) {
    return (
      <div className={`${sizeClasses[size]} bg-gray-200 rounded-full flex items-center justify-center ${className}`}>
        {fallback || (
          <span className="text-gray-500 font-medium text-sm">
            {alt.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
    );
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
      onError={handleError}
      priority={size === 'xl' || size === '2xl'}
    />
  );
};

// Componente para imágenes de hero con múltiples fuentes
export const HeroImage = ({ 
  desktop, 
  tablet, 
  mobile, 
  alt, 
  className = '',
  priority = true 
}) => {
  return (
    <picture className={className}>
      <source media="(min-width: 1024px)" srcSet={desktop} />
      <source media="(min-width: 768px)" srcSet={tablet} />
      <source media="(max-width: 767px)" srcSet={mobile} />
      
      <OptimizedImage
        src={desktop}
        alt={alt}
        className="w-full h-full object-cover"
        priority={priority}
      />
    </picture>
  );
};

export default OptimizedImage;