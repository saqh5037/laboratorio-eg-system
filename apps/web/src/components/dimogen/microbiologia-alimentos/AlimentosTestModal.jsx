import React, { useState, useEffect, useRef, useCallback } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTimes, FaWhatsapp, FaPhone, FaClock, FaVial, FaFlask,
  FaThermometerHalf, FaCheckCircle, FaExclamationTriangle,
  FaInfoCircle, FaUserMd, FaClipboardList, FaNotesMedical,
  FaShieldAlt, FaChevronRight, FaLeaf, FaBoxOpen, FaBalanceScale
} from 'react-icons/fa';
import { MdScience, MdGavel, MdBiotech } from 'react-icons/md';
import { useAlimentosTestData, AVAILABLE_ALIMENTOS_CODES } from '../../../hooks/useAlimentosTestData';
import { DIMOGEN_CONTACT } from '../../../styles/dimogen-theme';

// Color primario para microbiologia de alimentos: Verde
const PRIMARY_COLOR = '#98CB59';
const PRIMARY_DARK = '#7AB539';

// Variantes de animacion
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', damping: 30, stiffness: 400 }
  },
  exit: { opacity: 0, scale: 0.98, transition: { duration: 0.15 } }
};

const slideUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 300 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
};

const staggerItem = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 }
};

// Tabs para desktop - adaptados para alimentos
const TABS = [
  { id: 'info', label: 'Informacion', icon: FaInfoCircle },
  { id: 'specs', label: 'Especificaciones', icon: MdScience },
  { id: 'normativa', label: 'Normativa', icon: MdGavel },
  { id: 'results', label: 'Resultados', icon: FaNotesMedical }
];

/**
 * AlimentosTestModal - Modal con carrusel horizontal para movil
 * Adaptado para Microbiologia de Alimentos
 */
const AlimentosTestModal = ({ testCode, onClose, isOpen, onNavigate, availableTests = AVAILABLE_ALIMENTOS_CODES }) => {
  const [activeTab, setActiveTab] = useState('info');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const modalRef = useRef(null);
  const carouselRef = useRef(null);

  // Para swipe gestures (horizontal y vertical)
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);

  const { data, loading, error } = useAlimentosTestData(testCode);

  // Indice actual en la lista de pruebas disponibles
  const currentTestIndex = availableTests.indexOf(testCode?.toUpperCase());
  const canGoPrev = currentTestIndex > 0;
  const canGoNext = currentTestIndex < availableTests.length - 1;

  // Detectar movil
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Guardar posicion de scroll antes de abrir el modal
  const scrollPositionRef = useRef(0);

  // Keyboard y body scroll - Bloqueo completo
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      // Guardar la posicion actual del scroll ANTES de bloquear
      scrollPositionRef.current = window.scrollY;

      document.addEventListener('keydown', handleKeyDown);
      // Bloqueo completo del scroll
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${scrollPositionRef.current}px`;
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);

      if (isOpen) {
        // Restaurar estilos
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.top = '';
        // Restaurar posicion de scroll
        window.scrollTo(0, scrollPositionRef.current);
      }
    };
  }, [isOpen, onClose]);

  // Reset state on test change
  useEffect(() => {
    setActiveTab('info');
    setImageLoaded(false);
    setCurrentSlide(0);
  }, [testCode]);

  // Verificar si es un paquete
  const isPaquete = data?.subcategoria === 'Paquetes' || data?.prueba?.analisisIncluidos?.length > 0;

  // Slides para el carrusel movil
  const getSlides = useCallback(() => {
    if (!data) return [];
    const slides = [
      { id: 'image', type: 'image' }
    ];

    if (data.informacionAdicional?.queEs || data.informacionAdicional?.importancia) {
      slides.push({ id: 'info', type: 'info', title: 'Informacion', icon: FaInfoCircle });
    }
    if (data.especificaciones?.metodologia || data.especificaciones?.tipoMuestra?.length > 0) {
      slides.push({ id: 'specs', type: 'specs', title: 'Especificaciones', icon: MdScience });
    }
    if (data.informacionAdicional?.normativaAplicable?.length > 0) {
      slides.push({ id: 'normativa', type: 'normativa', title: 'Normativa', icon: MdGavel });
    }
    if (data.informacionAdicional?.interpretacionResultados) {
      slides.push({ id: 'results', type: 'results', title: 'Resultados', icon: FaNotesMedical });
    }

    return slides;
  }, [data]);

  const slides = getSlides();
  const totalSlides = slides.length;

  // Flag para ignorar el proximo touch end (cuando se hace tap en un boton)
  const ignoreNextTouchEnd = useRef(false);

  // Touch handlers para swipe horizontal y vertical
  const handleTouchStart = (e) => {
    // No procesar si el touch fue en un boton o enlace
    if (e.target.closest('button') || e.target.closest('a')) {
      ignoreNextTouchEnd.current = true;
      return;
    }
    ignoreNextTouchEnd.current = false;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchEndX.current = e.touches[0].clientX;
    touchEndY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    if (ignoreNextTouchEnd.current) return;
    e.stopPropagation();
    touchEndX.current = e.touches[0].clientX;
    touchEndY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    // Ignorar si fue un tap en boton
    if (ignoreNextTouchEnd.current) {
      ignoreNextTouchEnd.current = false;
      return;
    }
    e.stopPropagation();

    const deltaX = touchStartX.current - touchEndX.current;
    const deltaY = touchStartY.current - touchEndY.current;
    const threshold = 50;

    // Solo procesar si hay movimiento significativo
    if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
      return; // Fue un tap, no un swipe
    }

    // Solo procesar swipe vertical en slide de imagen (slide 0)
    if (currentSlide === 0) {
      if (Math.abs(deltaY) > Math.abs(deltaX) * 1.5 && Math.abs(deltaY) > threshold) {
        if (deltaY > 0 && canGoNext) {
          onNavigate?.(availableTests[currentTestIndex + 1]);
        } else if (deltaY < 0 && canGoPrev) {
          onNavigate?.(availableTests[currentTestIndex - 1]);
        }
        return;
      }
    }

    // Swipe horizontal para navegar entre slides
    if (Math.abs(deltaX) > Math.abs(deltaY) * 1.5 && Math.abs(deltaX) > threshold) {
      if (deltaX > 0 && currentSlide < totalSlides - 1) {
        setCurrentSlide(prev => prev + 1);
      } else if (deltaX < 0 && currentSlide > 0) {
        setCurrentSlide(prev => prev - 1);
      }
    }
  };

  // Imagen principal
  const getMainImage = () => {
    if (!isOpen || !data?.imagenes?.recursos?.length) return null;
    return `/images/dimogen/microbiologia-alimentos/${data.imagenes.recursos[0].archivo}`;
  };

  const mainImage = isOpen ? getMainImage() : null;

  // Render del contenido de cada slide
  const renderSlideContent = (slide) => {
    if (!data) return null;
    const info = data.informacionAdicional || {};
    const specs = data.especificaciones || {};

    switch (slide.type) {
      case 'info':
        return (
          <div className="space-y-4">
            {/* Para paquetes, mostrar los analisis incluidos */}
            {isPaquete && data.prueba?.analisisIncluidos?.length > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-lime-50 rounded-xl p-4 border border-green-200">
                <h4 className="text-sm font-semibold text-green-800 mb-3 flex items-center gap-2">
                  <FaBoxOpen className="w-4 h-4" />
                  Analisis Incluidos ({data.prueba.analisisIncluidos.length})
                </h4>
                <div className="space-y-2">
                  {data.prueba.analisisIncluidos.map((analisis, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-green-900 bg-white/60 rounded-lg p-2">
                      <FaCheckCircle className="text-green-500 flex-shrink-0 w-4 h-4" />
                      <span className="font-medium">{analisis.codigo}</span>
                      <span className="text-green-700">- {analisis.nombre}</span>
                    </div>
                  ))}
                </div>
                {data.prueba?.ahorro && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-green-700 font-medium">
                    <FaLeaf className="w-4 h-4" />
                    {data.prueba.ahorro}
                  </div>
                )}
              </div>
            )}

            {info.queEs && (
              <div>
                <h4 className="text-sm font-semibold text-[#98CB59] mb-2 flex items-center gap-2">
                  <FaInfoCircle className="w-4 h-4" />
                  ¿Que es este analisis?
                </h4>
                <p className="text-gray-700 text-sm leading-relaxed">{info.queEs}</p>
              </div>
            )}
            {info.importancia && (
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-4 border-l-4 border-amber-400">
                <h4 className="text-sm font-semibold text-amber-800 mb-1 flex items-center gap-2">
                  <FaExclamationTriangle className="w-4 h-4" />
                  Importancia
                </h4>
                <p className="text-amber-900 text-sm">{info.importancia}</p>
              </div>
            )}
            {info.paraQuienEsRecomendada && (
              <div className="bg-gradient-to-r from-green-50 to-lime-50 rounded-xl p-4 border-l-4 border-[#98CB59]">
                <h4 className="text-sm font-semibold text-green-800 mb-1 flex items-center gap-2">
                  <FaUserMd className="w-4 h-4" />
                  Recomendado para
                </h4>
                <p className="text-green-900 text-sm">{info.paraQuienEsRecomendada}</p>
              </div>
            )}
            {info.ventajas?.length > 0 && (
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <h4 className="text-sm font-semibold text-blue-800 mb-3">Ventajas del paquete</h4>
                <div className="space-y-2">
                  {info.ventajas.map((ventaja, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-blue-900">
                      <FaCheckCircle className="text-blue-500 mt-0.5 flex-shrink-0 w-4 h-4" />
                      <span>{ventaja}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'specs':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {specs.metodologia && (
                <div className="bg-green-50 rounded-xl p-3 border border-green-100 col-span-2">
                  <div className="flex items-center gap-2 text-green-600 mb-1">
                    <FaFlask className="w-4 h-4" />
                    <span className="text-xs font-medium">Metodologia</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{specs.metodologia}</p>
                  {specs.metodologiaDescripcion && (
                    <p className="text-xs text-gray-600 mt-1">{specs.metodologiaDescripcion}</p>
                  )}
                </div>
              )}
              {specs.tipoMuestra?.length > 0 && (
                <div className="bg-cyan-50 rounded-xl p-3 border border-cyan-100 col-span-2">
                  <div className="flex items-center gap-2 text-cyan-600 mb-2">
                    <FaVial className="w-4 h-4" />
                    <span className="text-xs font-medium">Tipos de Muestra</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {specs.tipoMuestra.map((tipo, i) => (
                      <span key={i} className="px-2 py-1 bg-white rounded-full text-xs font-medium text-cyan-700 border border-cyan-200">
                        {tipo}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {specs.tiempoEntrega && (
                <div className="bg-lime-50 rounded-xl p-3 border border-lime-100">
                  <div className="flex items-center gap-2 text-lime-600 mb-1">
                    <FaClock className="w-4 h-4" />
                    <span className="text-xs font-medium">Entrega</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{specs.tiempoEntrega}</p>
                </div>
              )}
              {specs.temperaturaTransporte && (
                <div className="bg-orange-50 rounded-xl p-3 border border-orange-100">
                  <div className="flex items-center gap-2 text-orange-600 mb-1">
                    <FaThermometerHalf className="w-4 h-4" />
                    <span className="text-xs font-medium">Transporte</span>
                  </div>
                  <div className="space-y-0.5 text-xs text-gray-700">
                    {specs.temperaturaTransporte.alimentosPereceros && (
                      <p>Perecederos: {specs.temperaturaTransporte.alimentosPereceros}</p>
                    )}
                    {specs.temperaturaTransporte.alimentosCongelados && (
                      <p>Congelados: {specs.temperaturaTransporte.alimentosCongelados}</p>
                    )}
                    {specs.temperaturaTransporte.aguas && (
                      <p>Aguas: {specs.temperaturaTransporte.aguas}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-green-600 bg-green-50 rounded-xl p-3 border border-green-100">
              <FaShieldAlt className="w-4 h-4" />
              <span className="text-sm font-medium">Laboratorio Acreditado</span>
            </div>
          </div>
        );

      case 'normativa':
        return (
          <div className="space-y-4">
            {info.normativaAplicable?.length > 0 ? (
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200">
                <h4 className="text-sm font-semibold text-indigo-800 mb-3 flex items-center gap-2">
                  <MdGavel className="w-4 h-4" />
                  Normativa Mexicana Aplicable
                </h4>
                <div className="space-y-2">
                  {info.normativaAplicable.map((norma, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-indigo-900 bg-white/60 rounded-lg p-3">
                      <FaBalanceScale className="text-indigo-500 mt-0.5 flex-shrink-0 w-4 h-4" />
                      <span>{norma}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 text-center">
                <MdGavel className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Normativa no especificada</p>
              </div>
            )}
          </div>
        );

      case 'results': {
        const interp = info.interpretacionResultados || {};
        return (
          <div className="space-y-4">
            {interp.descripcion && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <FaClipboardList className="w-4 h-4" />
                  Interpretacion de Resultados
                </h4>
                <p className="text-gray-700 text-sm leading-relaxed">{interp.descripcion}</p>
              </div>
            )}
            {interp.limitesBajos && (
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="font-semibold text-green-800">Limites Bajos (Aceptable)</span>
                </div>
                <p className="text-green-700 text-sm leading-relaxed">{interp.limitesBajos}</p>
              </div>
            )}
            {interp.limitesAltos && (
              <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="font-semibold text-red-800">Limites Altos (Alerta)</span>
                </div>
                <p className="text-red-700 text-sm leading-relaxed">{interp.limitesAltos}</p>
              </div>
            )}
            {/* Fallback para positivo/negativo si existe */}
            {interp.positivo && (
              <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="font-semibold text-red-800">Resultado Positivo</span>
                </div>
                <p className="text-red-700 text-sm leading-relaxed">{interp.positivo}</p>
              </div>
            )}
            {interp.negativo && (
              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="font-semibold text-green-800">Resultado Negativo</span>
                </div>
                <p className="text-green-700 text-sm leading-relaxed">{interp.negativo}</p>
              </div>
            )}
          </div>
        );
      }

      default:
        return null;
    }
  };

  // ============ MOBILE VIEW (Carrusel horizontal estilo Instagram) ============
  const renderMobileView = () => (
    <motion.div
      className="fixed inset-0 z-50 bg-black"
      variants={overlayVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{ touchAction: 'none', overscrollBehavior: 'contain' }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-30 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
      >
        <FaTimes className="w-5 h-5" />
      </button>

      {/* Carrusel Container */}
      <div
        ref={carouselRef}
        className="h-full w-full overflow-hidden"
        style={{ touchAction: 'pan-x', overscrollBehavior: 'contain' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <motion.div
          className="h-full flex"
          animate={{ x: `-${currentSlide * 100}%` }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        >
          {/* Slide 0: Imagen principal - Diseño optimizado */}
          <div className="w-full h-full flex-shrink-0 relative flex flex-col">
            {/* Fondo con gradiente verde */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#1a3d1a] via-[#2d5a2d] to-black" />

            {/* Glow effect verde */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-80 h-80 bg-[#98CB59]/20 rounded-full blur-3xl" />
            </div>

            {/* Indicador de navegacion vertical (arriba) */}
            {canGoPrev && (
              <motion.div
                className="absolute top-14 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-0.5"
                animate={{ y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <FaChevronRight className="w-3 h-3 text-white/40 -rotate-90" />
                <span className="text-[10px] text-white/30">Anterior</span>
              </motion.div>
            )}

            {/* Area de imagen - ocupa el espacio disponible */}
            <div className="flex-1 flex items-center justify-center px-6 pt-16 pb-4 relative z-10">
              {mainImage ? (
                <motion.img
                  src={mainImage}
                  alt={data?.prueba?.titulo}
                  onLoad={() => setImageLoaded(true)}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: imageLoaded ? 1 : 0, scale: imageLoaded ? 1 : 0.9 }}
                  className="w-full h-full object-contain drop-shadow-2xl"
                  style={{
                    filter: 'drop-shadow(0 0 40px rgba(152, 203, 89, 0.4))',
                    maxHeight: '55vh'
                  }}
                />
              ) : (
                <div className="w-48 h-48 rounded-full bg-white/10 flex items-center justify-center">
                  <MdBiotech className="w-24 h-24 text-white/40" />
                </div>
              )}
            </div>

            {/* Info abajo - Altura fija para evitar solapamientos */}
            <div className="relative z-10 bg-gradient-to-t from-black via-black/95 to-transparent px-5 pt-4 pb-20">
              {/* Codigo + Titulo en una linea compacta */}
              <div className="flex items-start gap-2 mb-2">
                <span className={`flex-shrink-0 px-2 py-0.5 text-white text-xs font-bold rounded-full ${isPaquete ? 'bg-amber-500' : 'bg-[#98CB59]'}`}>
                  {data?.prueba?.codigo}
                </span>
                <h2 className="text-lg font-bold text-white leading-tight line-clamp-2">
                  {data?.prueba?.titulo}
                </h2>
              </div>

              {/* Precio */}
              <div className="flex items-baseline gap-1.5 mb-3">
                <span className="text-3xl font-bold text-white">
                  ${data?.prueba?.precio?.toLocaleString('es-MX')}
                </span>
                <span className="text-white/60 text-sm font-medium">MXN</span>
              </div>

              {/* CTAs - WhatsApp + Ver detalles */}
              <div className="flex items-center gap-2">
                {/* CTA WhatsApp */}
                <motion.a
                  href={`https://wa.me/${DIMOGEN_CONTACT.whatsapp}?text=Hola,%20me%20interesa%20el%20analisis%20${encodeURIComponent(data?.prueba?.titulo)}%20(${data?.prueba?.codigo})%20-%20$${data?.prueba?.precio?.toLocaleString('es-MX')}%20MXN`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#25D366] to-[#128C7E] rounded-full px-4 py-2.5 shadow-lg shadow-[#25D366]/30"
                  whileTap={{ scale: 0.98 }}
                >
                  <FaWhatsapp className="w-5 h-5 text-white" />
                  <span className="text-sm font-bold text-white">Cotizar</span>
                </motion.a>

                {/* Boton "+ Info" */}
                {totalSlides > 1 && (
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentSlide(1);
                    }}
                    className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm border border-white/40 rounded-full px-3 py-2.5"
                    animate={{
                      borderColor: ['rgba(255,255,255,0.4)', 'rgba(152,203,89,0.8)', 'rgba(255,255,255,0.4)'],
                      boxShadow: [
                        '0 0 0 0 rgba(152, 203, 89, 0)',
                        '0 0 15px 3px rgba(152, 203, 89, 0.3)',
                        '0 0 0 0 rgba(152, 203, 89, 0)'
                      ]
                    }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="text-sm font-semibold text-white">+ Info</span>
                    <FaChevronRight className="w-3 h-3 text-[#98CB59]" />
                  </motion.button>
                )}
              </div>
            </div>

            {/* Indicador siguiente estudio */}
            {canGoNext && (
              <div className="absolute bottom-5 right-4 z-20 flex items-center gap-1 text-white/30">
                <span className="text-[10px]">Siguiente</span>
                <FaChevronRight className="w-2.5 h-2.5 rotate-90" />
              </div>
            )}
          </div>

          {/* Slides de informacion */}
          {slides.slice(1).map((slide) => (
            <div key={slide.id} className="w-full h-full flex-shrink-0 bg-white flex flex-col pb-10">
              {/* Header del slide */}
              <div className="flex items-center gap-3 p-5 border-b border-gray-100 bg-gray-50">
                <div className="w-10 h-10 rounded-xl bg-[#98CB59]/10 flex items-center justify-center">
                  <slide.icon className="w-5 h-5 text-[#98CB59]" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{slide.title}</h3>
                  <p className="text-xs text-gray-500">{data?.prueba?.titulo}</p>
                </div>
              </div>

              {/* Contenido scrollable */}
              <div className="flex-1 overflow-y-auto p-5">
                {renderSlideContent(slide)}
              </div>

              {/* CTA fijo abajo - con espacio para los dots */}
              <div className="px-4 pt-3 pb-2 border-t border-gray-100 bg-white">
                <div className="flex gap-2">
                  <a
                    href={`https://wa.me/${DIMOGEN_CONTACT.whatsapp}?text=Hola,%20me%20interesa%20el%20analisis%20${encodeURIComponent(data?.prueba?.titulo)}%20(${data?.prueba?.codigo})`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white rounded-xl font-semibold text-sm shadow-lg"
                  >
                    <FaWhatsapp className="w-5 h-5" />
                    Cotizar por WhatsApp
                  </a>
                  <a
                    href={`tel:+52${DIMOGEN_CONTACT.phoneLink}`}
                    className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold flex items-center justify-center"
                  >
                    <FaPhone className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Dots de navegacion (estilo Instagram) - Adaptativo segun slide */}
      {totalSlides > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-black/20 backdrop-blur-sm rounded-full px-3 py-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'w-6 h-2 bg-white shadow-lg'
                  : 'w-2 h-2 bg-white/50 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-40">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
            <MdBiotech className="w-12 h-12 text-[#98CB59]" />
          </motion.div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-40 p-8">
          <FaExclamationTriangle className="w-16 h-16 text-amber-500 mb-4" />
          <p className="text-white text-center mb-6">{error.message}</p>
          <button onClick={onClose} className="px-6 py-2 bg-white text-gray-900 rounded-xl font-medium">
            Cerrar
          </button>
        </div>
      )}
    </motion.div>
  );

  // ============ DESKTOP VIEW (Split layout - MEJORADO) ============
  const renderDesktopView = () => (
    <motion.div
      variants={overlayVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/60 to-[#98CB59]/30 backdrop-blur-md" />

      <motion.div
        ref={modalRef}
        variants={modalVariants}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl h-[680px] bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-20">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
              <MdBiotech className="w-12 h-12 text-[#98CB59]" />
            </motion.div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-20 p-8">
            <FaExclamationTriangle className="w-16 h-16 text-amber-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Informacion no disponible</h3>
            <p className="text-gray-500 text-center mb-6">{error.message}</p>
            <button onClick={onClose} className="px-6 py-2 bg-[#98CB59] text-white rounded-xl font-medium">
              Cerrar
            </button>
          </div>
        )}

        {data && !loading && !error && (
          <div className="flex h-full">
            {/* Left: Image - MAS GRANDE (50%) */}
            <div className="w-1/2 relative">
              {/* Header con codigo y titulo */}
              <div className="absolute top-0 left-0 right-0 z-10 p-5 bg-gradient-to-b from-black/80 via-black/50 to-transparent">
                <motion.div variants={slideUp} initial="hidden" animate="visible" className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={`px-3 py-1 text-white text-xs font-bold rounded-full border border-white/30 ${isPaquete ? 'bg-amber-500/80' : 'bg-white/20'}`}>
                    {data.prueba?.codigo}
                  </span>
                  <span className="px-3 py-1 bg-[#98CB59]/80 text-white text-xs font-medium rounded-full">
                    {data.subcategoria || 'Microbiologia de Alimentos'}
                  </span>
                </motion.div>
                <motion.h2
                  variants={slideUp}
                  initial="hidden"
                  animate="visible"
                  className="text-xl font-bold text-white drop-shadow-lg line-clamp-2"
                >
                  {data.prueba?.titulo}
                </motion.h2>
              </div>

              {/* Fondo con gradiente verde */}
              <div className="h-full bg-gradient-to-br from-[#1a3d1a] via-[#2d5a2d] to-[#3d7a3d]">
                {/* Glow effect */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-80 h-80 bg-[#98CB59]/25 rounded-full blur-3xl" />
                </div>

                {/* Imagen centrada - OCUPA MAS ESPACIO */}
                {mainImage ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: imageLoaded ? 1 : 0, scale: imageLoaded ? 1 : 0.9 }}
                    className="relative h-full flex items-center justify-center p-6 pt-28"
                  >
                    <img
                      src={mainImage}
                      alt={data.prueba?.titulo}
                      onLoad={() => setImageLoaded(true)}
                      className="w-full h-full object-contain drop-shadow-2xl"
                      style={{
                        filter: 'drop-shadow(0 0 40px rgba(152, 203, 89, 0.4))',
                        maxHeight: '480px'
                      }}
                    />
                  </motion.div>
                ) : (
                  <div className="h-full flex items-center justify-center pt-20">
                    <div className="w-40 h-40 rounded-full bg-white/10 flex items-center justify-center">
                      <MdBiotech className="w-20 h-20 text-white/50" />
                    </div>
                  </div>
                )}

                {/* Badge de precio flotante */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="absolute bottom-6 left-6"
                >
                  <div className="bg-white rounded-2xl shadow-2xl p-4">
                    <div className="text-xs text-gray-500 font-medium mb-0.5">Precio</div>
                    <div className="text-2xl font-bold bg-gradient-to-r from-[#7AB539] to-[#98CB59] bg-clip-text text-transparent">
                      ${data.prueba?.precio?.toLocaleString('es-MX')}
                    </div>
                    <div className="text-xs text-gray-400 font-medium">MXN</div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Right: Content (50%) */}
            <div className="w-1/2 flex flex-col bg-gray-50">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-20 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200"
              >
                <FaTimes className="w-5 h-5" />
              </button>

              <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="p-4 bg-white border-b border-gray-100">
                <div className="flex flex-wrap gap-2">
                  {data.especificaciones?.metodologia && (
                    <motion.div variants={staggerItem}>
                      <QuickPill icon={FaFlask} text={data.especificaciones.metodologia} color="green" />
                    </motion.div>
                  )}
                  {data.especificaciones?.tiempoEntrega && (
                    <motion.div variants={staggerItem}>
                      <QuickPill icon={FaClock} text={data.especificaciones.tiempoEntrega} color="lime" />
                    </motion.div>
                  )}
                  {data.especificaciones?.tipoMuestra?.length > 0 && (
                    <motion.div variants={staggerItem}>
                      <QuickPill icon={FaVial} text={`${data.especificaciones.tipoMuestra.length} tipos de muestra`} color="cyan" />
                    </motion.div>
                  )}
                  <motion.div variants={staggerItem}>
                    <QuickPill icon={FaShieldAlt} text="Acreditado" color="purple" />
                  </motion.div>
                </div>
              </motion.div>

              <div className="px-4 pt-3 bg-white">
                <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
                  {TABS.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all whitespace-nowrap ${
                        activeTab === tab.id ? 'text-[#98CB59]' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                      {activeTab === tab.id && (
                        <motion.div layoutId="activeTabDesktop" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#98CB59]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto p-4 bg-white">
                <AnimatePresence mode="wait">
                  {renderSlideContent({ type: activeTab })}
                </AnimatePresence>
              </div>

              <div className="p-4 bg-white border-t border-gray-100">
                <div className="flex gap-3">
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href={`https://wa.me/${DIMOGEN_CONTACT.whatsapp}?text=Hola,%20me%20interesa%20el%20analisis%20${encodeURIComponent(data.prueba?.titulo)}%20(${data.prueba?.codigo})`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white rounded-xl font-semibold shadow-lg"
                  >
                    <FaWhatsapp className="w-5 h-5" />
                    Solicitar cotizacion
                  </motion.a>
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href={`tel:+52${DIMOGEN_CONTACT.phoneLink}`}
                    className="inline-flex items-center justify-center gap-3 px-6 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold"
                  >
                    <FaPhone className="w-4 h-4" />
                    Llamar
                  </motion.a>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );

  return (
    <AnimatePresence mode="wait">
      {isOpen && (isMobile ? renderMobileView() : renderDesktopView())}
    </AnimatePresence>
  );
};

// Componente auxiliar
// eslint-disable-next-line no-unused-vars
const QuickPill = ({ icon: IconComponent, text, color }) => {
  const colors = {
    green: 'bg-green-50 text-green-700 border-green-200',
    lime: 'bg-lime-50 text-lime-700 border-lime-200',
    cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200'
  };
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${colors[color]}`}>
      <IconComponent className="w-3.5 h-3.5" />
      <span>{text}</span>
    </div>
  );
};

export default AlimentosTestModal;
