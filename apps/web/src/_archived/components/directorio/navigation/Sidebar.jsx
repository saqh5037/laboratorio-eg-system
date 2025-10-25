import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../contexts/AppContext';

const categories = [
  {
    id: 'hematologia',
    name: 'HEMATOLOGÍA',
    icon: '🧬',
    color: 'from-red-500/10 to-pink-500/10',
    borderColor: 'border-red-400',
    count: 12,
    subcategories: ['Hematología Completa', 'Coagulación', 'Grupo Sanguíneo']
  },
  {
    id: 'quimica',
    name: 'QUÍMICA SANGUÍNEA',
    icon: '🔬',
    color: 'from-blue-500/10 to-cyan-500/10',
    borderColor: 'border-blue-400',
    count: 18,
    subcategories: ['Glucosa', 'Lípidos', 'Función Renal', 'Función Hepática']
  },
  {
    id: 'microbiologia',
    name: 'MICROBIOLOGÍA',
    icon: '🦠',
    color: 'from-green-500/10 to-emerald-500/10',
    borderColor: 'border-green-400',
    count: 8,
    subcategories: ['Cultivos', 'Antibiogramas', 'Parasitología']
  },
  {
    id: 'inmunologia',
    name: 'INMUNOLOGÍA',
    icon: '💉',
    color: 'from-purple-500/10 to-violet-500/10',
    borderColor: 'border-purple-400',
    count: 15,
    subcategories: ['Marcadores Tumorales', 'Autoinmunidad', 'Serología']
  },
  {
    id: 'uroanalisis',
    name: 'UROANÁLISIS',
    icon: '🧪',
    color: 'from-yellow-500/10 to-amber-500/10',
    borderColor: 'border-yellow-400',
    count: 5,
    subcategories: ['Examen de Orina', 'Urocultivo', 'Proteínas']
  },
  {
    id: 'perfiles',
    name: 'PERFILES ESPECIALES',
    icon: '🫀',
    color: 'from-eg-purple/10 to-eg-pink/10',
    borderColor: 'border-eg-purple',
    count: 10,
    subcategories: ['Perfil Básico', 'Perfil Completo', 'Perfil Tiroideo', 'Perfil Prenatal']
  }
];

const Sidebar = ({ isOpen, onClose, isMobile = false }) => {
  const { selectedCategory, setSelectedCategory, filters, setFilters } = useApp();
  const [expandedCategories, setExpandedCategories] = useState([]);

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setFilters({ ...filters, area: category.id });
    if (isMobile) onClose();
  };

  const sidebarVariants = {
    open: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    closed: {
      x: isMobile ? -300 : -100,
      opacity: isMobile ? 0 : 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        className={`
          ${isMobile ? 'fixed' : 'sticky'}
          top-20 left-0 h-[calc(100vh-5rem)] 
          ${isMobile ? 'w-80' : 'w-64'}
          bg-white border-r border-gray-200
          ${isMobile ? 'z-50' : 'z-30'}
          overflow-y-auto scrollbar-thin
        `}
      >
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-eg-dark">
              Categorías
            </h3>
            {isMobile && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Categories */}
          <div className="space-y-2">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div
                  className={`
                    rounded-xl overflow-hidden transition-all duration-300
                    ${selectedCategory?.id === category.id 
                      ? 'ring-2 ring-eg-purple shadow-lg' 
                      : 'hover:shadow-md'}
                  `}
                >
                  {/* Category Button */}
                  <div
                    onClick={() => handleCategorySelect(category)}
                    className={`
                      w-full p-4 text-left transition-all duration-300 cursor-pointer
                      bg-gradient-to-r ${category.color}
                      border-l-4 ${category.borderColor}
                      hover:translate-x-1
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{category.icon}</span>
                        <div>
                          <p className="font-medium text-sm text-gray-800">
                            {category.name}
                          </p>
                          <p className="text-xs text-gray-600 mt-0.5">
                            {category.count} estudios
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCategory(category.id);
                        }}
                        className="p-1 hover:bg-white/50 rounded transition-colors"
                      >
                        <svg 
                          className={`w-4 h-4 transition-transform ${
                            expandedCategories.includes(category.id) ? 'rotate-180' : ''
                          }`} 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Subcategories */}
                  <AnimatePresence>
                    {expandedCategories.includes(category.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white/80 border-t border-gray-200"
                      >
                        <div className="p-3 space-y-1">
                          {category.subcategories.map((sub, idx) => (
                            <button
                              key={idx}
                              className="w-full text-left px-3 py-2 text-sm text-gray-700 
                                       hover:bg-eg-purple/10 hover:text-eg-purple 
                                       rounded-lg transition-colors"
                            >
                              {sub}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="mt-6 p-4 bg-gradient-to-br from-eg-purple/5 to-eg-pink/5 rounded-xl">
            <h4 className="text-sm font-medium text-eg-purple mb-3">
              Estadísticas Rápidas
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Total estudios:</span>
                <span className="font-medium text-eg-purple">68</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Con ayuno:</span>
                <span className="font-medium text-orange-500">24</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Resultado rápido:</span>
                <span className="font-medium text-green-500">42</span>
              </div>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;