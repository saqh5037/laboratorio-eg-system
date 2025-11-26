import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  FaDna, FaVirus, FaLungs, FaBacterium,
  FaChevronDown, FaChevronUp, FaArrowLeft, FaWhatsapp, FaPhone,
  FaClock, FaVial, FaFlask, FaTint, FaNotesMedical,
  FaSearch, FaCertificate, FaCheckCircle, FaImages, FaEye, FaTimes, FaKeyboard
} from 'react-icons/fa';
import { MdBiotech, MdScience } from 'react-icons/md';
import NavbarDimogen from '../../components/landing/dimogen/NavbarDimogen';
import FooterDimogen from '../../components/landing/dimogen/FooterDimogen';
// Logo vectorizado en: /images/dimogen/logos/svg/dimogen-logo-completo-white.svg
import { CertBadge, MicrotecBrandBadge, CertificationsSection } from '../../components/dimogen/DimogenCertBadge';
import { categoriasMolecular, estudiosMolecular, metodologiaInfo } from '../../data/dimogen/estudios-molecular';
import { DIMOGEN_COLORS, DIMOGEN_CONTACT } from '../../styles/dimogen-theme';
import MolecularTestModal from '../../components/dimogen/biologia-molecular/MolecularTestModal';
import { hasEnrichedData, AVAILABLE_TEST_CODES } from '../../hooks/useMolecularTestData';
// Iconos moleculares animados
import { DNAHelixSVG, VirusSVG, CellSVG, MicroscopeSVG, TestTubeSVG, GeneticCodeSVG } from '../../components/dimogen/MolecularIcons';
// Animaciones y contadores
import { useCounter, ScrollProgressBar } from '../../components/dimogen/CounterAnimation';

/**
 * BiologiaMolecularPage - Página dedicada de Biología Molecular
 * Diseño basado en el manual de identidad DIMOGEN - VERSIÓN REVOLUCIONARIA
 */

// Componente de estadística animada
const AnimatedStat = ({ value, label, suffix = '', color = '#00A3E0' }) => {
  const { count, ref } = useCounter(typeof value === 'number' ? value : 0, 2);
  const isNumber = typeof value === 'number';

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center p-2 sm:p-4 bg-white/5 rounded-lg sm:rounded-xl backdrop-blur-sm border border-white/10
                 hover:bg-white/10 transition-all duration-300 group"
    >
      <motion.div
        className="text-xl sm:text-3xl font-bold"
        style={{ color }}
        whileHover={{ scale: 1.1 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        {isNumber ? count : value}{suffix}
      </motion.div>
      <div className="text-xs sm:text-sm text-white/90 group-hover:text-white transition-colors">{label}</div>
    </motion.div>
  );
};

const BiologiaMolecularPage = () => {
  const [categoriaActiva, setCategoriaActiva] = useState('its');
  const [busqueda, setBusqueda] = useState('');
  const [estudioExpandido, setEstudioExpandido] = useState(null);
  // Estado para el modal de detalle enriquecido
  const [selectedTestCode, setSelectedTestCode] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estados para el buscador mejorado
  const [isBuscadorFocused, setIsBuscadorFocused] = useState(false);
  const buscadorRef = useRef(null);

  // Handler para abrir el modal
  const handleOpenModal = (codigo) => {
    if (hasEnrichedData(codigo)) {
      setSelectedTestCode(codigo);
      setIsModalOpen(true);
    }
  };

  // Handler para cerrar el modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTestCode(null);
  };

  // Handler para navegar entre pruebas (estilo Stories)
  const handleNavigateTest = (newTestCode) => {
    setSelectedTestCode(newTestCode);
  };

  // Refs
  const heroRef = useRef(null);
  const catalogoRef = useRef(null);

  // Función para normalizar texto (quitar acentos y convertir a minúsculas)
  const normalizeText = useCallback((text) => {
    if (!text) return '';
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }, []);

  // Búsqueda global en todas las categorías
  const resultadosGlobales = useMemo(() => {
    if (!busqueda || busqueda.length < 2) return [];

    const terminoNormalizado = normalizeText(busqueda);
    const resultados = [];

    // Buscar en todas las categorías
    Object.entries(estudiosMolecular).forEach(([categoriaId, estudios]) => {
      const categoriaInfo = categoriasMolecular.find(c => c.id === categoriaId);

      estudios.forEach(estudio => {
        const nombreNorm = normalizeText(estudio.nombre);
        const codigoNorm = normalizeText(estudio.codigo);
        const descripcionNorm = normalizeText(estudio.descripcion);

        // Score de relevancia: código exacto > nombre > descripción
        let score = 0;
        if (codigoNorm === terminoNormalizado) {
          score = 100;
        } else if (codigoNorm.includes(terminoNormalizado)) {
          score = 80;
        } else if (nombreNorm.includes(terminoNormalizado)) {
          score = 60;
        } else if (descripcionNorm.includes(terminoNormalizado)) {
          score = 40;
        }

        if (score > 0) {
          resultados.push({
            ...estudio,
            categoriaId,
            categoriaInfo,
            score
          });
        }
      });
    });

    // Ordenar por score y limitar a 8 resultados
    return resultados
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  }, [busqueda, normalizeText]);

  // Keyboard shortcut para enfocar el buscador (Ctrl+K o /)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+K o Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        buscadorRef.current?.focus();
      }
      // "/" cuando no está en un input
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        buscadorRef.current?.focus();
      }
      // Escape para limpiar
      if (e.key === 'Escape' && isBuscadorFocused) {
        setBusqueda('');
        buscadorRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isBuscadorFocused]);

  // Handler para seleccionar un resultado de la búsqueda global
  const handleSelectResultado = (resultado) => {
    // Cambiar a la categoría del resultado
    setCategoriaActiva(resultado.categoriaId);
    setBusqueda('');
    setIsBuscadorFocused(false);

    // Pequeño delay para que se actualice la categoría y luego abrir el modal
    setTimeout(() => {
      if (hasEnrichedData(resultado.codigo)) {
        handleOpenModal(resultado.codigo);
      } else {
        setEstudioExpandido(resultado.codigo);
      }
    }, 100);
  };

  // Parallax hooks
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 150]);
  const y2 = useTransform(scrollY, [0, 500], [0, 75]);
  const y3 = useTransform(scrollY, [0, 500], [0, 25]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  // Scroll al inicio o al hash si existe
  useEffect(() => {
    document.title = 'Biología Molecular | DIMOGEN - Laboratorio de Alta Especialidad';

    // Si hay hash #catalogo, hacer scroll a esa sección
    if (window.location.hash === '#catalogo') {
      // Múltiples intentos para asegurar que el elemento esté renderizado
      const attemptScroll = (attempts = 0) => {
        if (attempts >= 5) return;
        setTimeout(() => {
          if (catalogoRef.current) {
            const headerOffset = 80;
            const elementPosition = catalogoRef.current.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
          } else {
            attemptScroll(attempts + 1);
          }
        }, 100 + (attempts * 100));
      };
      attemptScroll();
    } else {
      // Si no hay hash, scroll al inicio
      window.scrollTo(0, 0);
    }
  }, []);

  // Iconos por categoría
  const iconosCategoria = {
    its: FaVirus,
    respiratorio: FaLungs,
    virologia: FaBacterium,
    gastrointestinal: FaNotesMedical,
    tuberculosis: FaLungs,
    oncologia: MdBiotech,
    paneles_especiales: FaTint,
  };

  // Filtrar estudios de la categoría activa (con normalización de acentos)
  const estudiosCategoria = useMemo(() => {
    return estudiosMolecular[categoriaActiva] || [];
  }, [categoriaActiva]);

  const estudiosFiltrados = useMemo(() => {
    if (!busqueda || busqueda.length < 2) return estudiosCategoria;

    const terminoNormalizado = normalizeText(busqueda);
    return estudiosCategoria.filter(
      (e) =>
        normalizeText(e.nombre).includes(terminoNormalizado) ||
        normalizeText(e.codigo).includes(terminoNormalizado) ||
        normalizeText(e.descripcion).includes(terminoNormalizado)
    );
  }, [estudiosCategoria, busqueda, normalizeText]);

  const categoriaInfo = categoriasMolecular.find((c) => c.id === categoriaActiva);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* Scroll Progress Bar */}
      <ScrollProgressBar color="#00A3E0" height={4} zIndex={60} />

      <NavbarDimogen />

      {/* Hero Section - REVOLUCIONARIO con Parallax e Iconos Moleculares */}
      <section ref={heroRef} className="relative pt-24 pb-20 overflow-hidden min-h-[90vh]">
        {/* Layer 1: Background con parallax */}
        <motion.div className="absolute inset-0" style={{ y: y1 }}>
          {/* Bloque azul principal */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0047CB] via-[#003F92] to-[#002960]" />

          {/* Diagonal decorativa */}
          <div
            className="absolute top-0 right-0 w-[65%] h-full bg-gradient-to-br from-[#003F92]/80 to-[#0047CB]/60"
            style={{
              clipPath: 'polygon(25% 0, 100% 0, 100% 100%, 0% 100%)',
            }}
          />

          {/* Hexagon grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          {/* Acento cyan en esquina */}
          <motion.div
            className="absolute bottom-0 right-0 w-96 h-96 bg-[#00A3E0]"
            style={{
              clipPath: 'polygon(100% 35%, 100% 100%, 35% 100%)',
              opacity: 0.15,
            }}
            animate={{ opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 4, repeat: Infinity }}
          />

          {/* Línea cyan decorativa animada */}
          <motion.div
            className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#00A3E0] via-[#00A3E0]/70 to-transparent"
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.5, delay: 0.5 }}
          />
        </motion.div>

        {/* Layer 2: Floating Molecular Icons (medium speed parallax) */}
        <motion.div className="absolute inset-0 pointer-events-none" style={{ y: y2, opacity }}>
          {/* DNA Helix top left */}
          <div className="absolute top-[15%] left-[8%] hidden lg:block">
            <DNAHelixSVG size={90} color="#00A3E0" delay={0} />
          </div>

          {/* Virus top right */}
          <div className="absolute top-[20%] right-[12%] hidden lg:block">
            <VirusSVG size={70} color="#98CB59" delay={0.5} />
          </div>

          {/* Cell middle left */}
          <div className="absolute top-[45%] left-[5%] hidden xl:block">
            <CellSVG size={80} color="#ffffff" delay={1} />
          </div>

          {/* Test Tube bottom right */}
          <div className="absolute bottom-[25%] right-[8%] hidden lg:block">
            <TestTubeSVG size={70} color="#00A3E0" delay={1.5} />
          </div>

          {/* Genetic Code middle right */}
          <div className="absolute top-[35%] right-[5%] hidden xl:block">
            <GeneticCodeSVG size={60} color="#ffffff" delay={2} />
          </div>

          {/* Microscope bottom left */}
          <div className="absolute bottom-[15%] left-[12%] hidden lg:block">
            <MicroscopeSVG size={70} color="#98CB59" delay={2.5} />
          </div>

          {/* Decorative circles */}
          <motion.div
            className="absolute top-[10%] left-[20%] w-32 h-32 border-2 border-white/10 rounded-full hidden lg:block"
            animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-[30%] left-[3%] w-20 h-20 border border-[#00A3E0]/20 rounded-full hidden lg:block"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 3, repeat: Infinity, delay: 1 }}
          />
        </motion.div>

        {/* Layer 3: Content (fastest - least parallax) */}
        <motion.div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12" style={{ y: y3 }}>
          {/* Breadcrumb con logo */}
          <div className="flex items-center justify-between mb-8">
            <Link
              to="/dimogen"
              className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors group"
            >
              <motion.span whileHover={{ x: -4 }} transition={{ type: 'spring', stiffness: 300 }}>
                <FaArrowLeft className="w-4 h-4" />
              </motion.span>
              <span>Volver al inicio</span>
            </Link>

            {/* Logo DIMOGEN en hero */}
            <motion.div
              className="hidden md:block"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <img
                src="/images/dimogen/logos/svg/dimogen-logo-completo-white.svg"
                alt="DIMOGEN"
                className="h-12 sm:h-14 lg:h-16 w-auto object-contain"
              />
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Badge MICRO-TEC con animación */}
              <motion.div
                className="flex items-center gap-3 mb-6 flex-wrap"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/10"
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.15)' }}
                >
                  <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}>
                    <FaDna className="w-5 h-5 text-[#00A3E0]" />
                  </motion.div>
                  <span className="text-white text-sm font-medium">Laboratorio de Alta Especialidad</span>
                </motion.div>
                <MicrotecBrandBadge variant="dark" size="sm" className="hidden sm:flex" />
              </motion.div>

              <motion.h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Biología
                <motion.span
                  className="block text-[#00A3E0]"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  Molecular
                </motion.span>
              </motion.h1>

              <motion.p
                className="text-xl text-white/90 mb-8 leading-relaxed max-w-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                Expertos en diagnóstico molecular con tecnología PCR en tiempo real.
                Ofrecemos un extenso catálogo de pruebas genéticas, genómicas y bioquímicas
                de alta especialidad.
              </motion.p>

              {/* Stats con contadores animados - responsive */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-8">
                <AnimatedStat value={50} label="Estudios" suffix="+" color="#00A3E0" />
                <AnimatedStat value={24} label="Hrs Resultados*" suffix="h" color="#98CB59" />
                <AnimatedStat value="ISO" label="9001:2015" color="#ffffff" />
              </div>

              {/* CTAs con micro-interacciones */}
              <motion.div
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <motion.a
                  href={`https://wa.me/${DIMOGEN_CONTACT.whatsapp}?text=Hola,%20me%20interesa%20información%20sobre%20estudios%20de%20biología%20molecular`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-6 py-3.5 bg-white text-[#0047CB]
                           rounded-xl font-semibold shadow-lg group"
                  whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FaWhatsapp className="w-5 h-5 text-[#25D366] group-hover:rotate-12 transition-transform" />
                  Cotizar estudio
                </motion.a>
                <motion.a
                  href={`tel:+52${DIMOGEN_CONTACT.phoneLink}`}
                  className="inline-flex items-center gap-3 px-6 py-3.5 bg-white/10 backdrop-blur-sm
                           text-white rounded-xl font-semibold border border-white/20"
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.2)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FaPhone className="w-4 h-4" />
                  {DIMOGEN_CONTACT.phone}
                </motion.a>
              </motion.div>
            </motion.div>

            {/* Metodología Cards - Con hover 3D */}
            <motion.div
              initial={{ opacity: 0, x: 30, rotateY: -10 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="hidden lg:block perspective-1000"
            >
              <div className="space-y-4">
                {Object.entries(metodologiaInfo).map(([key, info], index) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    whileHover={{
                      x: 8,
                      rotateY: 5,
                      boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                      backgroundColor: 'rgba(255,255,255,0.15)'
                    }}
                    className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 transition-all group cursor-pointer"
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <div className="flex items-start gap-4">
                      <motion.div
                        className="w-12 h-12 rounded-xl bg-[#00A3E0]/30 flex items-center justify-center flex-shrink-0"
                        whileHover={{ scale: 1.1, rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        <MdScience className="w-6 h-6 text-white" />
                      </motion.div>
                      <div>
                        <h3 className="font-semibold text-white mb-1 group-hover:text-[#00A3E0] transition-colors">{info.nombre}</h3>
                        <p className="text-sm text-white/90">{info.descripcion}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Certificaciones en hero con animación */}
                <motion.div
                  className="flex gap-3 mt-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <CertBadge type="iso" variant="compact" color="white" />
                  <CertBadge type="cofepris" variant="compact" color="white" />
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Scroll indicator animado */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            style={{ opacity }}
          >
            <span className="text-white/90 text-xs uppercase tracking-wider">Descubre más</span>
            <motion.div
              className="w-6 h-10 rounded-full border-2 border-white/50 flex justify-center pt-2"
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <motion.div
                className="w-1.5 h-3 rounded-full bg-white/60"
                animate={{ y: [0, 8, 0], opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Catálogo Section */}
      <section id="catalogo" ref={catalogoRef} className="py-12 sm:py-16 md:py-24 bg-gray-50 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          {/* Section Header - Responsive */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-10 md:mb-12"
          >
            <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#0047CB]/10 text-[#0047CB]
                          rounded-full text-xs sm:text-sm font-medium mb-3 sm:mb-4">
              <FaDna className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Catálogo Completo
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Estudios Moleculares
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-2">
              Explora nuestro catálogo completo organizado por categoría.
              Todos nuestros estudios utilizan metodología PCR en tiempo real.
            </p>
          </motion.div>

          {/* Search Bar - Responsive */}
          <div className="max-w-xl mx-auto mb-6 sm:mb-8 md:mb-10 relative z-20">
            <div className="relative">
              {/* Icono de búsqueda */}
              <FaSearch className={`absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 transition-colors ${
                isBuscadorFocused ? 'text-[#0047CB]' : 'text-gray-400'
              }`} />

              {/* Input de búsqueda */}
              <input
                ref={buscadorRef}
                type="text"
                placeholder="Buscar estudios... (VIH, COVID, ITS)"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                onFocus={() => setIsBuscadorFocused(true)}
                onBlur={() => {
                  setTimeout(() => setIsBuscadorFocused(false), 150);
                }}
                className={`w-full pl-10 sm:pl-12 pr-12 sm:pr-20 py-3 sm:py-3.5 md:py-4 rounded-xl sm:rounded-2xl
                         border sm:border-2 transition-all bg-white outline-none text-sm sm:text-base ${
                           isBuscadorFocused
                             ? 'border-[#0047CB] ring-2 sm:ring-4 ring-[#0047CB]/10 shadow-lg'
                             : 'border-gray-200 hover:border-gray-300 shadow-sm'
                         }`}
              />

              {/* Botón limpiar o shortcut hint */}
              <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {busqueda ? (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    onClick={() => {
                      setBusqueda('');
                      buscadorRef.current?.focus();
                    }}
                    className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FaTimes className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
                  </motion.button>
                ) : (
                  <div className="hidden md:flex items-center gap-1.5 text-xs text-gray-400">
                    <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-500 font-mono">⌘K</span>
                  </div>
                )}
              </div>
            </div>

            {/* Dropdown de sugerencias globales */}
            <AnimatePresence>
              {isBuscadorFocused && resultadosGlobales.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                  style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
                >
                  {/* Header */}
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">
                      {resultadosGlobales.length} resultado{resultadosGlobales.length !== 1 ? 's' : ''} encontrado{resultadosGlobales.length !== 1 ? 's' : ''}
                    </span>
                    <span className="text-xs text-gray-400">Busca en todas las categorías</span>
                  </div>

                  {/* Lista de resultados */}
                  <div className="max-h-[320px] overflow-y-auto">
                    {resultadosGlobales.map((resultado, idx) => (
                      <motion.button
                        key={resultado.codigo}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        onClick={() => handleSelectResultado(resultado)}
                        className="w-full p-4 text-left hover:bg-gray-50 border-b border-gray-50 last:border-0
                                 flex items-center gap-4 transition-colors group"
                      >
                        {/* Badge de código */}
                        <div
                          className="px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold min-w-[70px] text-center"
                          style={{
                            backgroundColor: `${resultado.categoriaInfo?.color || '#0047CB'}15`,
                            color: resultado.categoriaInfo?.color || '#0047CB',
                          }}
                        >
                          {resultado.codigo}
                        </div>

                        {/* Info del estudio */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-gray-900 group-hover:text-[#0047CB] transition-colors">
                              {resultado.nombre}
                            </span>
                            {hasEnrichedData(resultado.codigo) && (
                              <span className="px-1.5 py-0.5 bg-gradient-to-r from-[#0047CB]/10 to-[#00A3E0]/10 text-[#0047CB] text-[10px] rounded-full font-medium flex items-center gap-1">
                                <FaImages className="w-2.5 h-2.5" />
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span
                              className="text-xs px-2 py-0.5 rounded-full"
                              style={{
                                backgroundColor: `${resultado.categoriaInfo?.color || '#0047CB'}10`,
                                color: resultado.categoriaInfo?.color || '#0047CB',
                              }}
                            >
                              {resultado.categoriaInfo?.nombre || 'General'}
                            </span>
                            <span className="text-xs text-gray-400 truncate">
                              {resultado.descripcion.slice(0, 50)}...
                            </span>
                          </div>
                        </div>

                        {/* Precio */}
                        <div className="text-right flex-shrink-0">
                          <div className="text-lg font-bold text-[#0047CB]">
                            ${resultado.precio.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-gray-400">MXN</div>
                        </div>

                        {/* Arrow */}
                        <div className="text-gray-300 group-hover:text-[#0047CB] transition-colors">
                          <FaChevronDown className="w-4 h-4 -rotate-90" />
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  {/* Footer con tip */}
                  <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <FaKeyboard className="w-3 h-3" />
                      <span className="px-1.5 py-0.5 bg-gray-200 rounded text-[10px] font-mono">ESC</span> limpiar
                    </span>
                    <span className="flex items-center gap-1">
                      Click para ver detalles
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Hint cuando no hay resultados pero hay búsqueda */}
            <AnimatePresence>
              {isBuscadorFocused && busqueda.length >= 2 && resultadosGlobales.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-6 text-center"
                >
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                    <FaSearch className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium mb-1">No encontramos "{busqueda}"</p>
                  <p className="text-sm text-gray-400">Intenta con otro término como "VIH", "COVID" o "Hepatitis"</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Category Tabs - Responsive y alineados */}
          <div className="mb-8 sm:mb-12">
            {/* Mobile: Scroll horizontal */}
            <div className="sm:hidden overflow-x-auto pb-2 -mx-6 px-6 scrollbar-hide">
              <div className="flex gap-2 min-w-max">
                {categoriasMolecular.map((categoria) => {
                  const Icon = iconosCategoria[categoria.id] || FaDna;
                  const isActive = categoriaActiva === categoria.id;
                  return (
                    <button
                      key={categoria.id}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setCategoriaActiva(categoria.id);
                        setBusqueda('');
                        setEstudioExpandido(null);
                      }}
                      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                                whitespace-nowrap transition-all duration-200 ${
                                  isActive
                                    ? 'bg-[#0047CB] text-white shadow-md'
                                    : 'bg-white text-gray-600 border border-gray-200'
                                }`}
                    >
                      <Icon className="w-4 h-4" style={{ color: isActive ? 'white' : categoria.color }} />
                      {categoria.nombre.length > 15 ? categoria.nombre.split(' ')[0] : categoria.nombre}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Desktop/Tablet: Flex wrap centrado */}
            <div className="hidden sm:flex flex-wrap justify-center gap-2 md:gap-3">
              {categoriasMolecular.map((categoria) => {
                const Icon = iconosCategoria[categoria.id] || FaDna;
                const isActive = categoriaActiva === categoria.id;
                return (
                  <motion.button
                    key={categoria.id}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => {
                      e.preventDefault();
                      setCategoriaActiva(categoria.id);
                      setBusqueda('');
                      setEstudioExpandido(null);
                    }}
                    className={`inline-flex items-center gap-2 px-4 md:px-5 py-2.5 md:py-3 rounded-xl font-medium
                              transition-all duration-300 ${
                                isActive
                                  ? 'bg-[#0047CB] text-white shadow-lg shadow-[#0047CB]/30'
                                  : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200 hover:border-[#0047CB]/30'
                              }`}
                  >
                    <Icon className="w-4 h-4" style={{ color: isActive ? 'white' : categoria.color }} />
                    <span className="text-sm md:text-base">{categoria.nombre}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Category Info Card - Responsive */}
          {categoriaInfo && (
            <motion.div
              key={categoriaInfo.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 mb-6 sm:mb-8 shadow-sm border border-gray-100"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                {/* Icono y título */}
                <div className="flex items-center gap-3 sm:gap-4">
                  <div
                    className="w-12 h-12 sm:w-14 md:w-16 sm:h-14 md:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${categoriaInfo.color}15` }}
                  >
                    {React.createElement(iconosCategoria[categoriaInfo.id], {
                      className: 'w-6 h-6 sm:w-7 md:w-8 sm:h-7 md:h-8',
                      style: { color: categoriaInfo.color },
                    })}
                  </div>
                  <div className="flex-1 min-w-0 sm:hidden">
                    <h3 className="text-base font-bold text-gray-900">{categoriaInfo.nombre}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <FaCheckCircle className="w-3.5 h-3.5 text-[#98CB59]" />
                      <span className="text-xs font-medium text-[#98CB59]">
                        {estudiosCategoria.length} estudios
                      </span>
                    </div>
                  </div>
                </div>

                {/* Info desktop */}
                <div className="hidden sm:block flex-1 min-w-0">
                  <h3 className="text-lg md:text-xl font-bold text-gray-900">{categoriaInfo.nombre}</h3>
                  <p className="text-sm md:text-base text-gray-600 line-clamp-2">{categoriaInfo.descripcion}</p>
                </div>

                {/* Descripción móvil */}
                <p className="text-sm text-gray-600 sm:hidden line-clamp-2">{categoriaInfo.descripcion}</p>

                {/* Badge estudios - desktop */}
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#98CB59]/10 rounded-full flex-shrink-0">
                  <FaCheckCircle className="w-4 h-4 text-[#98CB59]" />
                  <span className="text-sm font-medium text-[#98CB59]">
                    {estudiosCategoria.length} estudios disponibles
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Studies Grid - Diseño mejorado y alineado */}
          <div className="grid grid-cols-1 gap-3 sm:gap-4">
            <AnimatePresence mode="popLayout">
              {estudiosFiltrados.map((estudio, index) => (
                <motion.div
                  key={estudio.codigo}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.02 }}
                  className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 sm:border-2 overflow-hidden
                           hover:border-[#0047CB]/30 hover:shadow-lg transition-all duration-300 group"
                >
                  <button
                    onClick={() => {
                      if (hasEnrichedData(estudio.codigo)) {
                        handleOpenModal(estudio.codigo);
                      } else {
                        setEstudioExpandido(estudioExpandido === estudio.codigo ? null : estudio.codigo);
                      }
                    }}
                    className="w-full p-4 sm:p-5 md:p-6 text-left"
                  >
                    {/* Layout móvil: Stack vertical */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                      {/* Fila superior móvil: Código + Precio + Botón */}
                      <div className="flex items-center justify-between sm:hidden">
                        <div
                          className="px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold"
                          style={{
                            backgroundColor: `${categoriaInfo?.color || '#0047CB'}15`,
                            color: categoriaInfo?.color || '#0047CB',
                          }}
                        >
                          {estudio.codigo}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-lg font-bold text-[#0047CB]">
                            ${estudio.precio.toLocaleString()}
                          </div>
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ${
                              hasEnrichedData(estudio.codigo)
                                ? 'bg-gradient-to-r from-[#0047CB] to-[#00A3E0] text-white'
                                : estudioExpandido === estudio.codigo
                                  ? 'bg-[#0047CB] text-white rotate-180'
                                  : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {hasEnrichedData(estudio.codigo) ? (
                              <FaEye className="w-3.5 h-3.5" />
                            ) : (
                              <FaChevronDown className="w-3.5 h-3.5" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Contenido principal */}
                      <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        {/* Código - Solo desktop */}
                        <div
                          className="hidden sm:flex px-3 py-2 rounded-xl text-sm font-mono font-bold min-w-[80px] text-center justify-center"
                          style={{
                            backgroundColor: `${categoriaInfo?.color || '#0047CB'}10`,
                            color: categoriaInfo?.color || '#0047CB',
                            border: `2px solid ${categoriaInfo?.color || '#0047CB'}25`,
                          }}
                        >
                          {estudio.codigo}
                        </div>

                        {/* Nombre y badges */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm sm:text-base leading-tight flex items-start sm:items-center gap-1.5 sm:gap-2 flex-wrap">
                            <span className="line-clamp-2 sm:line-clamp-1">{estudio.nombre}</span>
                            {estudio.destacado && (
                              <span className="inline-flex px-1.5 sm:px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] sm:text-xs rounded-full font-medium whitespace-nowrap">
                                Popular
                              </span>
                            )}
                            {estudio.urgencia && (
                              <span className="inline-flex px-1.5 sm:px-2 py-0.5 bg-red-100 text-red-700 text-[10px] sm:text-xs rounded-full font-medium whitespace-nowrap">
                                Urgencia
                              </span>
                            )}
                            {hasEnrichedData(estudio.codigo) && (
                              <span className="hidden sm:inline-flex px-2 py-0.5 bg-gradient-to-r from-[#0047CB]/10 to-[#00A3E0]/10 text-[#0047CB] text-xs rounded-full font-medium items-center gap-1 border border-[#0047CB]/20">
                                <FaImages className="w-3 h-3" />
                                <span className="hidden md:inline">Info completa</span>
                              </span>
                            )}
                          </h4>
                          <p className="text-xs sm:text-sm text-gray-500 line-clamp-1 sm:line-clamp-none sm:truncate mt-0.5 sm:mt-1">
                            {estudio.descripcion}
                          </p>
                        </div>
                      </div>

                      {/* Precio y Toggle - Solo desktop */}
                      <div className="hidden sm:flex items-center gap-3 md:gap-4 flex-shrink-0">
                        <div className="text-right">
                          <div className="text-xl md:text-2xl font-bold text-[#0047CB]">
                            ${estudio.precio.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">MXN</div>
                        </div>
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
                            hasEnrichedData(estudio.codigo)
                              ? 'bg-gradient-to-r from-[#0047CB] to-[#00A3E0] text-white group-hover:shadow-lg group-hover:shadow-[#0047CB]/30'
                              : estudioExpandido === estudio.codigo
                                ? 'bg-[#0047CB] text-white rotate-180'
                                : 'bg-gray-100 text-gray-500 group-hover:bg-[#0047CB]/10'
                          }`}
                        >
                          {hasEnrichedData(estudio.codigo) ? (
                            <FaEye className="w-4 h-4" />
                          ) : (
                            <FaChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* Expanded Details - Mejorado */}
                  <AnimatePresence>
                    {estudioExpandido === estudio.codigo && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 pt-2 border-t-2 border-gray-100 bg-gray-50/50">
                          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            {[
                              { icon: FaVial, label: 'Muestra', value: estudio.muestra, color: '#0047CB', bg: 'blue' },
                              { icon: FaClock, label: 'Entrega', value: estudio.tiempoEntrega, color: '#98CB59', bg: 'green' },
                              { icon: FaFlask, label: 'Metodología', value: estudio.metodologia, color: '#00A3E0', bg: 'cyan' },
                              { icon: () => <span className="font-bold text-lg">$</span>, label: 'Precio', value: `$${estudio.precio.toLocaleString()} MXN`, color: '#0047CB', bg: 'blue', showOnMobile: true },
                            ].map((item, i) => (
                              <div
                                key={i}
                                className={`flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 ${
                                  item.showOnMobile ? 'sm:hidden' : ''
                                }`}
                              >
                                <div
                                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                                  style={{ backgroundColor: `${item.color}15` }}
                                >
                                  {typeof item.icon === 'function' && item.icon.prototype?.render
                                    ? <item.icon className="w-5 h-5" style={{ color: item.color }} />
                                    : React.createElement(item.icon, { className: 'w-5 h-5', style: { color: item.color } })
                                  }
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500 font-medium">{item.label}</div>
                                  <div className="text-sm font-semibold text-gray-900">{item.value}</div>
                                </div>
                              </div>
                            ))}
                          </div>

                          <p className="text-gray-600 mb-6 leading-relaxed">{estudio.descripcion}</p>

                          <div className="flex flex-wrap gap-3">
                            {/* Botón para ver información completa (si está disponible) */}
                            {hasEnrichedData(estudio.codigo) && (
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenModal(estudio.codigo);
                                }}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#0047CB] to-[#00A3E0] text-white
                                         rounded-xl font-medium hover:shadow-lg hover:shadow-[#0047CB]/30 transition-all"
                              >
                                <FaEye className="w-4 h-4" />
                                Ver informacion completa
                              </motion.button>
                            )}
                            <a
                              href={`https://wa.me/${DIMOGEN_CONTACT.whatsapp}?text=Hola,%20me%20interesa%20el%20estudio%20${encodeURIComponent(estudio.nombre)}%20(${estudio.codigo})`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#25D366] text-white
                                       rounded-xl font-medium hover:bg-[#128C7E] transition-all
                                       shadow-md hover:shadow-lg"
                            >
                              <FaWhatsapp className="w-4 h-4" />
                              Cotizar este estudio
                            </a>
                            <a
                              href={`tel:+52${DIMOGEN_CONTACT.phoneLink}`}
                              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700
                                       rounded-xl font-medium hover:bg-gray-50 transition-all
                                       border-2 border-gray-200"
                            >
                              <FaPhone className="w-4 h-4" />
                              Llamar
                            </a>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* No Results */}
          {estudiosFiltrados.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                <FaSearch className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron estudios</h3>
              <p className="text-gray-500 mb-6">Intenta con otro término de búsqueda</p>
              <button
                onClick={() => setBusqueda('')}
                className="px-6 py-2 bg-[#0047CB] text-white rounded-xl font-medium hover:bg-[#003F92] transition-colors"
              >
                Limpiar búsqueda
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Certificaciones Section */}
      <CertificationsSection variant="light" showTitle={true} />

      {/* CTA Section - Mejorado */}
      <section className="relative py-20 overflow-hidden">
        {/* Background con diseño diagonal */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0047CB] to-[#00A3E0]" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              ¿Necesitas ayuda para elegir el estudio adecuado?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Nuestro equipo de expertos está listo para orientarte y resolver todas tus dudas
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <a
                href={`https://wa.me/${DIMOGEN_CONTACT.whatsapp}?text=Hola,%20necesito%20orientación%20para%20elegir%20un%20estudio%20molecular`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 bg-white text-[#0047CB] rounded-xl
                         font-semibold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl
                         hover:scale-105"
              >
                <FaWhatsapp className="w-5 h-5 text-[#25D366]" />
                Contactar experto
              </a>
              <a
                href={`tel:+52${DIMOGEN_CONTACT.phoneLink}`}
                className="inline-flex items-center gap-3 px-8 py-4 bg-white/10 text-white rounded-xl
                         font-semibold hover:bg-white/20 transition-all border border-white/20"
              >
                <FaPhone className="w-5 h-5" />
                {DIMOGEN_CONTACT.phone}
              </a>
            </div>

            {/* MICRO-TEC badge */}
            <MicrotecBrandBadge variant="dark" size="md" />
          </motion.div>
        </div>
      </section>

      <FooterDimogen />

      {/* Modal de información completa - Estilo Instagram Stories en móvil */}
      <MolecularTestModal
        testCode={selectedTestCode}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onNavigate={handleNavigateTest}
        availableTests={AVAILABLE_TEST_CODES}
      />
    </div>
  );
};

export default BiologiaMolecularPage;
