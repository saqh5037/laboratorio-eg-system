import React from 'react';
import { motion } from 'framer-motion';
import { skeletonVariants } from '../utils/animations';

/**
 * Sistema de componentes Skeleton para estados de carga
 * Mejora la UX mostrando placeholders animados mientras se cargan los datos
 */

// Skeleton base con animación shimmer
const SkeletonBase = ({ className = "", variant = "shimmer" }) => (
  <motion.div
    className={`bg-gray-200 rounded ${className}`}
    animate={variant === "shimmer" ? skeletonVariants.shimmer : skeletonVariants.loading}
    style={{ background: variant === "shimmer" ? undefined : undefined }}
  />
);

// Skeleton para texto
export const SkeletonText = ({ lines = 3, className = "" }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <SkeletonBase
        key={i}
        className={`h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
      />
    ))}
  </div>
);

// Skeleton para título
export const SkeletonTitle = ({ className = "" }) => (
  <SkeletonBase className={`h-8 w-3/4 mb-4 ${className}`} />
);

// Skeleton para avatar/imagen circular
export const SkeletonAvatar = ({ size = "md", className = "" }) => {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24"
  };
  
  return (
    <SkeletonBase className={`rounded-full ${sizes[size]} ${className}`} />
  );
};

// Skeleton para imagen/thumbnail
export const SkeletonImage = ({ aspectRatio = "16/9", className = "" }) => (
  <SkeletonBase 
    className={`w-full rounded-lg ${className}`}
    style={{ aspectRatio }}
  />
);

// Skeleton para botón
export const SkeletonButton = ({ size = "md", className = "" }) => {
  const sizes = {
    sm: "h-8 w-20",
    md: "h-10 w-28",
    lg: "h-12 w-36"
  };
  
  return (
    <SkeletonBase className={`rounded-md ${sizes[size]} ${className}`} />
  );
};

// Skeleton para card de estudio
export const SkeletonStudyCard = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
    className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden"
  >
    {/* Header con gradiente */}
    <div className="h-16 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
    
    {/* Contenido */}
    <div className="p-4 space-y-3">
      {/* Título y código */}
      <div className="flex justify-between items-start gap-2">
        <SkeletonBase className="h-6 flex-1" />
        <SkeletonBase className="h-6 w-16 rounded-md" />
      </div>
      
      {/* Precio */}
      <SkeletonBase className="h-8 w-24" />
      
      {/* Clasificación */}
      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
        <SkeletonBase className="h-4 w-20" />
        <div className="space-y-1 pl-3">
          <SkeletonBase className="h-3 w-3/4" />
          <SkeletonBase className="h-3 w-2/3" />
          <SkeletonBase className="h-3 w-1/2" />
        </div>
      </div>
      
      {/* Información adicional */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <SkeletonBase className="h-3 w-3 rounded-full" />
          <SkeletonBase className="h-3 flex-1" />
        </div>
        <div className="flex items-center gap-2">
          <SkeletonBase className="h-3 w-3 rounded-full" />
          <SkeletonBase className="h-3 flex-1" />
        </div>
      </div>
      
      {/* Botones */}
      <div className="flex gap-2 pt-2">
        <SkeletonBase className="h-9 flex-1 rounded-lg" />
        <SkeletonBase className="h-9 w-10 rounded-lg" />
      </div>
    </div>
  </motion.div>
);

// Skeleton para lista de estudios
export const SkeletonStudyList = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonStudyCard key={i} />
    ))}
  </div>
);

// Skeleton para item de lista
export const SkeletonListItem = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200"
  >
    <SkeletonAvatar size="md" />
    <div className="flex-1 space-y-2">
      <SkeletonBase className="h-5 w-3/4" />
      <SkeletonBase className="h-4 w-1/2" />
    </div>
    <SkeletonButton size="sm" />
  </motion.div>
);

// Skeleton para estadísticas
export const SkeletonStats = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {Array.from({ length: 3 }).map((_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.1 }}
        className="bg-white rounded-lg p-4 text-center"
      >
        <SkeletonBase className="h-8 w-20 mx-auto mb-2" />
        <SkeletonBase className="h-4 w-32 mx-auto" />
      </motion.div>
    ))}
  </div>
);

// Skeleton para tabla
export const SkeletonTable = ({ rows = 5, columns = 4 }) => (
  <div className="bg-white rounded-lg overflow-hidden">
    {/* Header */}
    <div className="bg-gray-50 border-b border-gray-200 p-4">
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <SkeletonBase key={i} className="h-4" />
        ))}
      </div>
    </div>
    
    {/* Body */}
    <div className="divide-y divide-gray-200">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="p-4">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <SkeletonBase 
                key={colIndex} 
                className={`h-4 ${colIndex === 0 ? 'w-full' : 'w-3/4'}`}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Skeleton para formulario
export const SkeletonForm = ({ fields = 4 }) => (
  <div className="space-y-4">
    {Array.from({ length: fields }).map((_, i) => (
      <div key={i} className="space-y-2">
        <SkeletonBase className="h-4 w-24" />
        <SkeletonBase className="h-10 w-full rounded-md" />
      </div>
    ))}
    <div className="flex gap-3 pt-4">
      <SkeletonButton size="lg" />
      <SkeletonButton size="lg" />
    </div>
  </div>
);

// Skeleton para sidebar/navegación
export const SkeletonNavigation = ({ items = 5 }) => (
  <div className="space-y-2">
    {Array.from({ length: items }).map((_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: i * 0.05 }}
        className="flex items-center gap-3 p-3 rounded-lg"
      >
        <SkeletonBase className="h-5 w-5 rounded" />
        <SkeletonBase className="h-4 flex-1" />
      </motion.div>
    ))}
  </div>
);

// Skeleton para detalles de estudio completo
export const SkeletonStudyDetail = () => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
    {/* Header imagen */}
    <SkeletonImage aspectRatio="21/9" className="h-48" />
    
    {/* Contenido principal */}
    <div className="p-6 space-y-6">
      {/* Título y badges */}
      <div className="space-y-3">
        <SkeletonTitle />
        <div className="flex gap-2">
          <SkeletonBase className="h-6 w-20 rounded-full" />
          <SkeletonBase className="h-6 w-24 rounded-full" />
          <SkeletonBase className="h-6 w-16 rounded-full" />
        </div>
      </div>
      
      {/* Descripción */}
      <SkeletonText lines={4} />
      
      {/* Información en grid */}
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-1">
            <SkeletonBase className="h-3 w-20" />
            <SkeletonBase className="h-5 w-32" />
          </div>
        ))}
      </div>
      
      {/* Acciones */}
      <div className="flex gap-3">
        <SkeletonButton size="lg" className="flex-1" />
        <SkeletonButton size="lg" />
      </div>
    </div>
  </div>
);

// Skeleton para gráfico/chart
export const SkeletonChart = ({ height = "h-64" }) => (
  <div className={`bg-white rounded-lg p-4 ${height}`}>
    <SkeletonBase className="h-6 w-32 mb-4" />
    <div className="relative h-full">
      <div className="absolute inset-0 flex items-end justify-between gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <SkeletonBase
            key={i}
            className="flex-1"
            style={{ height: `${Math.random() * 80 + 20}%` }}
          />
        ))}
      </div>
    </div>
  </div>
);

// Skeleton para timeline
export const SkeletonTimeline = ({ items = 4 }) => (
  <div className="space-y-4">
    {Array.from({ length: items }).map((_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: i * 0.1 }}
        className="flex gap-4"
      >
        <div className="flex flex-col items-center">
          <SkeletonBase className="h-4 w-4 rounded-full" />
          {i < items - 1 && <SkeletonBase className="w-0.5 h-16 mt-2" />}
        </div>
        <div className="flex-1 pb-8">
          <SkeletonBase className="h-4 w-24 mb-2" />
          <SkeletonBase className="h-6 w-3/4 mb-2" />
          <SkeletonText lines={2} />
        </div>
      </motion.div>
    ))}
  </div>
);

// Hook para usar skeletons con delay automático
export const useSkeletonDelay = (loading, delay = 200) => {
  const [showSkeleton, setShowSkeleton] = React.useState(false);
  
  React.useEffect(() => {
    let timer;
    
    if (loading) {
      timer = setTimeout(() => setShowSkeleton(true), delay);
    } else {
      setShowSkeleton(false);
    }
    
    return () => clearTimeout(timer);
  }, [loading, delay]);
  
  return showSkeleton;
};

// Componente wrapper para mostrar skeleton o contenido
export const SkeletonWrapper = ({ 
  loading, 
  skeleton, 
  children, 
  delay = 200,
  fallback = null 
}) => {
  const showSkeleton = useSkeletonDelay(loading, delay);
  
  if (showSkeleton) return skeleton;
  if (!loading && !children) return fallback;
  return children;
};

export default {
  SkeletonBase,
  SkeletonText,
  SkeletonTitle,
  SkeletonAvatar,
  SkeletonImage,
  SkeletonButton,
  SkeletonStudyCard,
  SkeletonStudyList,
  SkeletonListItem,
  SkeletonStats,
  SkeletonTable,
  SkeletonForm,
  SkeletonNavigation,
  SkeletonStudyDetail,
  SkeletonChart,
  SkeletonTimeline,
  SkeletonWrapper,
  useSkeletonDelay
};