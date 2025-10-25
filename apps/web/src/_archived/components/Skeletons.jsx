import { motion } from 'framer-motion';
import { skeletonVariants } from '../utils/animations';

// Skeleton base con animación shimmer
const SkeletonBase = ({ className = "", width = "100%", height = "1rem" }) => (
  <motion.div
    variants={skeletonVariants}
    animate="loading"
    className={`bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-md ${className}`}
    style={{ width, height }}
  />
);

// Skeleton para cards de estudios médicos
export const StudyCardSkeleton = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl shadow-md p-6 space-y-4"
  >
    {/* Header con icono y título */}
    <div className="flex items-start space-x-4">
      <SkeletonBase className="w-12 h-12 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <SkeletonBase height="1.25rem" width="75%" />
        <SkeletonBase height="0.875rem" width="50%" />
      </div>
    </div>
    
    {/* Descripción */}
    <div className="space-y-2">
      <SkeletonBase height="0.875rem" width="100%" />
      <SkeletonBase height="0.875rem" width="85%" />
      <SkeletonBase height="0.875rem" width="60%" />
    </div>
    
    {/* Precio y botones */}
    <div className="flex items-center justify-between pt-4">
      <SkeletonBase height="1.5rem" width="80px" />
      <div className="flex space-x-2">
        <SkeletonBase height="2rem" width="2rem" className="rounded-full" />
        <SkeletonBase height="2rem" width="2rem" className="rounded-full" />
      </div>
    </div>
  </motion.div>
);

// Skeleton para lista de estudios
export const StudyListSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <StudyCardSkeleton key={i} />
    ))}
  </div>
);

// Skeleton para search bar
export const SearchSkeleton = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="space-y-4"
  >
    <div className="flex space-x-4">
      <SkeletonBase height="3rem" className="flex-1" />
      <SkeletonBase height="3rem" width="120px" />
    </div>
    <div className="flex space-x-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <SkeletonBase key={i} height="2rem" width="80px" className="rounded-full" />
      ))}
    </div>
  </motion.div>
);

// Skeleton para detalles de estudio
export const StudyDetailSkeleton = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 space-y-6"
  >
    {/* Header */}
    <div className="flex items-start space-x-6">
      <SkeletonBase className="w-20 h-20 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-3">
        <SkeletonBase height="2rem" width="70%" />
        <SkeletonBase height="1.25rem" width="40%" />
        <SkeletonBase height="1rem" width="30%" />
      </div>
    </div>
    
    {/* Tabs */}
    <div className="flex space-x-4 border-b border-gray-200 pb-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonBase key={i} height="2.5rem" width="100px" />
      ))}
    </div>
    
    {/* Content sections */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        <SkeletonBase height="1.5rem" width="60%" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBase key={i} height="1rem" width={`${90 - i * 10}%`} />
          ))}
        </div>
      </div>
      
      <div className="space-y-4">
        <SkeletonBase height="1.5rem" width="50%" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <SkeletonBase height="1rem" width="40%" />
              <SkeletonBase height="1rem" width="30%" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </motion.div>
);

// Skeleton para navegación
export const NavigationSkeleton = () => (
  <div className="flex items-center justify-between p-4">
    <SkeletonBase height="2rem" width="150px" />
    <div className="flex space-x-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonBase key={i} height="1.5rem" width="80px" />
      ))}
    </div>
    <SkeletonBase height="2.5rem" width="2.5rem" className="rounded-full" />
  </div>
);

// Skeleton para favoritos
export const FavoritesSkeleton = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="space-y-4"
  >
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm">
        <SkeletonBase className="w-8 h-8 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <SkeletonBase height="1.25rem" width="60%" />
          <SkeletonBase height="0.875rem" width="40%" />
        </div>
        <SkeletonBase height="1.5rem" width="60px" />
        <SkeletonBase height="2rem" width="2rem" className="rounded-full" />
      </div>
    ))}
  </motion.div>
);

// Skeleton para tabla de precios
export const PriceTableSkeleton = () => (
  <div className="overflow-hidden bg-white rounded-lg shadow">
    {/* Header */}
    <div className="bg-blue-50 p-4 border-b border-gray-200">
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBase key={i} height="1.25rem" width="80%" />
        ))}
      </div>
    </div>
    
    {/* Rows */}
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="p-4 border-b border-gray-100">
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, j) => (
            <SkeletonBase key={j} height="1rem" width={j === 0 ? "90%" : "60%"} />
          ))}
        </div>
      </div>
    ))}
  </div>
);

// Skeleton para dashboard médico
export const DashboardSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    {Array.from({ length: 4 }).map((_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.1 }}
        className="bg-white rounded-xl p-6 shadow-md"
      >
        <div className="flex items-center justify-between mb-4">
          <SkeletonBase className="w-10 h-10 rounded-lg" />
          <SkeletonBase height="1rem" width="40px" />
        </div>
        <SkeletonBase height="2rem" width="60%" className="mb-2" />
        <SkeletonBase height="0.875rem" width="80%" />
      </motion.div>
    ))}
  </div>
);

// Skeleton genérico para contenido
export const ContentSkeleton = ({ lines = 3, className = "" }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className={`space-y-2 ${className}`}
  >
    {Array.from({ length: lines }).map((_, i) => (
      <SkeletonBase
        key={i}
        height="1rem"
        width={i === lines - 1 ? "60%" : "100%"}
      />
    ))}
  </motion.div>
);

// Skeleton para formularios
export const FormSkeleton = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-6"
  >
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="space-y-2">
        <SkeletonBase height="1rem" width="25%" />
        <SkeletonBase height="3rem" width="100%" />
      </div>
    ))}
    
    <div className="flex justify-end space-x-3 pt-4">
      <SkeletonBase height="2.5rem" width="100px" />
      <SkeletonBase height="2.5rem" width="120px" />
    </div>
  </motion.div>
);

export default {
  StudyCardSkeleton,
  StudyListSkeleton,
  SearchSkeleton,
  StudyDetailSkeleton,
  NavigationSkeleton,
  FavoritesSkeleton,
  PriceTableSkeleton,
  DashboardSkeleton,
  ContentSkeleton,
  FormSkeleton
};