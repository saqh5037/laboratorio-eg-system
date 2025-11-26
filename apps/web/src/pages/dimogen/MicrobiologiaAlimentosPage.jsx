import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion';
import {
  FaArrowLeft, FaWhatsapp, FaPhone, FaClock, FaCheckCircle,
  FaChevronDown, FaChevronUp, FaThermometerHalf, FaVial,
  FaIndustry, FaHotel, FaHospital, FaSchool, FaStore,
  FaBuilding, FaCertificate, FaShieldAlt, FaFileInvoiceDollar,
  FaSearch, FaMicroscope, FaFlask, FaHandHoldingHeart, FaQuoteLeft,
  FaLightbulb, FaAward, FaUserShield, FaHeartbeat, FaEnvelope,
  FaMousePointer, FaEye, FaImages
} from 'react-icons/fa';
import { MdScience, MdBiotech, MdRestaurant, MdVerified, MdSpeed, MdPrecisionManufacturing } from 'react-icons/md';
import NavbarDimogen from '../../components/landing/dimogen/NavbarDimogen';
import FooterDimogen from '../../components/landing/dimogen/FooterDimogen';
// Logo vectorizado en: /images/dimogen/logos/svg/dimogen-logo-completo-white.svg
import { CertBadge, MicrotecBrandBadge, CertificationsSection } from '../../components/dimogen/DimogenCertBadge';
import { DIMOGEN_COLORS, DIMOGEN_CONTACT } from '../../styles/dimogen-theme';
import {
  estudiosAlimentos,
  paquetesAlimentos,
  sectoresAtendidos,
  informacionMuestras
} from '../../data/dimogen/estudios-alimentos';
// Custom bacteria icons and animation components
import {
  BacillusSVG,
  CoccusSVG,
  SpirillumSVG,
  PetriDishSVG,
  WaterDropSVG,
  FoodSafetySVG
} from '../../components/dimogen/BacteriaIcons';
import {
  useCounter,
  CircleProgress,
  ScrollProgressBar
} from '../../components/dimogen/CounterAnimation';
import AlimentosTestModal from '../../components/dimogen/microbiologia-alimentos/AlimentosTestModal';
import { hasAlimentosEnrichedData, AVAILABLE_ALIMENTOS_CODES } from '../../hooks/useAlimentosTestData';

/**
 * MicrobiologiaAlimentosPage - Página dedicada de Microbiología de Alimentos
 * Diseño basado en el manual de identidad DIMOGEN - Grupo MICRO-TEC
 */
// Animated Counter Component for stats
const AnimatedStat = ({ value, label, suffix = '', color = '#98CB59' }) => {
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

const MicrobiologiaAlimentosPage = () => {
  const [estudioExpandido, setEstudioExpandido] = useState(null);
  const [tabActivo, setTabActivo] = useState('estudios');
  const [busqueda, setBusqueda] = useState('');

  // Estado para el modal de información enriquecida
  const [selectedTestCode, setSelectedTestCode] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handlers para el modal
  const handleOpenModal = (codigo) => {
    if (hasAlimentosEnrichedData(codigo)) {
      setSelectedTestCode(codigo);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTestCode(null);
  };

  const handleNavigateTest = (newCode) => {
    setSelectedTestCode(newCode);
  };

  // Parallax hooks
  const heroRef = useRef(null);
  const catalogoRef = useRef(null);
  const { scrollY } = useScroll();

  // Parallax transforms - 3 layers moving at different speeds
  const y1 = useTransform(scrollY, [0, 500], [0, 150]); // Background (slowest)
  const y2 = useTransform(scrollY, [0, 500], [0, 75]);  // Bacteria layer
  const y3 = useTransform(scrollY, [0, 500], [0, 25]);  // Content (fastest)
  const opacity = useTransform(scrollY, [0, 300], [1, 0]); // Fade out on scroll

  // Scroll al inicio o al hash si existe
  useEffect(() => {
    document.title = 'Microbiología de Alimentos | DIMOGEN - Laboratorio de Alta Especialidad';

    // Si hay hash #catalogo, hacer scroll a esa sección
    if (window.location.hash === '#catalogo' && catalogoRef.current) {
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

  const sectorIcons = {
    factory: FaIndustry,
    hotel: FaHotel,
    hospital: FaHospital,
    building: FaBuilding,
    shopping: FaStore,
    school: FaSchool,
  };

  // Filtrar estudios
  const estudiosFiltrados = busqueda
    ? estudiosAlimentos.filter(
        (e) =>
          e.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
          e.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
          e.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
      )
    : estudiosAlimentos;

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* Scroll Progress Bar */}
      <ScrollProgressBar color="#98CB59" height={4} zIndex={60} />

      <NavbarDimogen />

      {/* Hero Section - REVOLUCIONARIO con Parallax y Bacterias Flotantes */}
      <section ref={heroRef} className="relative pt-24 pb-20 overflow-hidden min-h-[90vh]">
        {/* Layer 1: Background con parallax (más lento) */}
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

          {/* Acento verde MICRO-TEC en esquina */}
          <motion.div
            className="absolute bottom-0 right-0 w-96 h-96 bg-[#98CB59]"
            style={{
              clipPath: 'polygon(100% 35%, 100% 100%, 35% 100%)',
              opacity: 0.2,
            }}
            animate={{ opacity: [0.15, 0.25, 0.15] }}
            transition={{ duration: 4, repeat: Infinity }}
          />

          {/* Línea verde decorativa animada */}
          <motion.div
            className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#98CB59] via-[#98CB59]/70 to-transparent"
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.5, delay: 0.5 }}
          />
        </motion.div>

        {/* Layer 2: Floating Bacteria (medium speed parallax) */}
        <motion.div className="absolute inset-0 pointer-events-none" style={{ y: y2, opacity }}>
          {/* Bacteria 1 - Bacillus top left */}
          <div className="absolute top-[15%] left-[8%] hidden lg:block">
            <BacillusSVG size={80} color="#98CB59" delay={0} />
          </div>

          {/* Bacteria 2 - Coccus top right */}
          <div className="absolute top-[20%] right-[15%] hidden lg:block">
            <CoccusSVG size={60} color="#00A3E0" delay={0.5} />
          </div>

          {/* Bacteria 3 - Spirillum middle left */}
          <div className="absolute top-[45%] left-[5%] hidden xl:block">
            <SpirillumSVG size={70} color="#ffffff" delay={1} />
          </div>

          {/* Bacteria 4 - PetriDish bottom right */}
          <div className="absolute bottom-[25%] right-[8%] hidden lg:block">
            <PetriDishSVG size={90} color="#98CB59" delay={1.5} />
          </div>

          {/* Bacteria 5 - Water drop middle right */}
          <div className="absolute top-[35%] right-[5%] hidden xl:block">
            <WaterDropSVG size={55} color="#00A3E0" delay={2} />
          </div>

          {/* Bacteria 6 - Bacillus bottom left */}
          <div className="absolute bottom-[15%] left-[12%] hidden lg:block">
            <BacillusSVG size={50} color="#ffffff" delay={2.5} />
          </div>

          {/* Decorative circles */}
          <motion.div
            className="absolute top-[10%] left-[20%] w-32 h-32 border-2 border-white/10 rounded-full hidden lg:block"
            animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-[30%] left-[3%] w-20 h-20 border border-[#98CB59]/20 rounded-full hidden lg:block"
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
              {/* Badges con animación */}
              <motion.div
                className="flex items-center gap-3 mb-6 flex-wrap"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full
                           border border-white/10"
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.15)' }}
                >
                  <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}>
                    <MdBiotech className="w-5 h-5 text-[#98CB59]" />
                  </motion.div>
                  <span className="text-white text-sm font-medium">Análisis Microbiológico</span>
                </motion.div>
                <MicrotecBrandBadge variant="dark" size="sm" className="hidden sm:flex" />
              </motion.div>

              <motion.h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Microbiología
                <motion.span
                  className="block text-[#98CB59]"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  de Alimentos
                </motion.span>
              </motion.h1>

              <motion.p
                className="text-xl text-white/90 mb-8 leading-relaxed max-w-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                Análisis de microorganismos en agua, hielo, superficies y alimentos.
                Resultados confiables para la industria alimentaria, garantizando
                la seguridad de los consumidores.
              </motion.p>

              {/* Stats con contadores animados - responsive */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-8">
                <AnimatedStat value={6} label="Estudios" suffix="+" color="#98CB59" />
                <AnimatedStat value={2} label="Paquetes" color="#ffffff" />
                <AnimatedStat value="ISO" label="9001:2015" color="#98CB59" />
              </div>

              {/* CTAs con micro-interacciones */}
              <motion.div
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <motion.a
                  href={`https://wa.me/${DIMOGEN_CONTACT.whatsapp}?text=Hola,%20me%20interesa%20información%20sobre%20análisis%20de%20microbiología%20de%20alimentos`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-6 py-3.5 bg-white text-[#0047CB]
                           rounded-xl font-semibold shadow-lg group"
                  whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FaFileInvoiceDollar className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  Cotizar servicios
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

            {/* Certification Card con hover 3D */}
            <motion.div
              initial={{ opacity: 0, x: 30, rotateY: -10 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="hidden lg:block perspective-1000"
            >
              <motion.div
                className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20
                         shadow-2xl"
                whileHover={{
                  rotateY: 5,
                  rotateX: -5,
                  scale: 1.02,
                  boxShadow: '0 30px 60px rgba(0,0,0,0.3)',
                }}
                transition={{ type: 'spring', stiffness: 200 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className="text-center mb-6">
                  <motion.div
                    className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-[#98CB59]/20 flex items-center justify-center"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <FoodSafetySVG size={50} color="#98CB59" animated={true} />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-white">Certificaciones</h3>
                  <p className="text-white/90">Respaldo de calidad total</p>
                </div>

                {/* Certifications con hover */}
                <div className="space-y-4 mb-6">
                  <motion.div
                    className="p-4 bg-white/10 rounded-xl cursor-pointer"
                    whileHover={{ x: 8, backgroundColor: 'rgba(255,255,255,0.15)' }}
                  >
                    <div className="flex items-center gap-3">
                      <FaCertificate className="w-8 h-8 text-[#98CB59]" />
                      <div>
                        <p className="text-white font-semibold">ISO 9001:2015</p>
                        <p className="text-white/90 text-sm">Sistema de Gestión de Calidad</p>
                      </div>
                    </div>
                  </motion.div>
                  <motion.div
                    className="p-4 bg-white/10 rounded-xl cursor-pointer"
                    whileHover={{ x: 8, backgroundColor: 'rgba(255,255,255,0.15)' }}
                  >
                    <div className="flex items-center gap-3">
                      <FaShieldAlt className="w-8 h-8 text-[#98CB59]" />
                      <div>
                        <p className="text-white font-semibold">COFEPRIS</p>
                        <p className="text-white/90 text-sm">No. 2409152002A00328</p>
                      </div>
                    </div>
                  </motion.div>
                </div>

                <ul className="space-y-3 text-white/90 text-sm">
                  {[
                    'Metodologías NOM oficiales',
                    'Resultados trazables y confiables',
                    'Personal altamente capacitado'
                  ].map((item, i) => (
                    <motion.li
                      key={i}
                      className="flex items-center gap-2"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + i * 0.1 }}
                    >
                      <FaCheckCircle className="w-4 h-4 text-[#98CB59]" />
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
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
                className="w-1.5 h-3 rounded-full bg-white/90"
                animate={{ y: [0, 8, 0], opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Alta Especialidad Section - Cards 3D con Bacterias Custom */}
      <section className="py-20 md:py-28 bg-white relative overflow-hidden">
        {/* Background decorativo animado */}
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-[#0047CB]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"
          animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 left-0 w-80 h-80 bg-[#98CB59]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"
          animate={{ scale: [1, 1.15, 1], opacity: [0.05, 0.08, 0.05] }}
          transition={{ duration: 6, repeat: Infinity, delay: 2 }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.span
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0047CB]/10 text-[#0047CB]
                        rounded-full text-sm font-medium mb-4"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}>
                <FaAward className="w-4 h-4" />
              </motion.div>
              Laboratorio de Referencia
            </motion.span>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Alta <span className="text-[#0047CB]">Especialidad</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Soluciones innovadoras para diagnósticos precisos y confiables.
              Nuestro laboratorio cuenta con la tecnología más avanzada y personal
              altamente capacitado en microbiología de alimentos.
            </p>
          </motion.div>

          {/* Cards con efecto 3D y stagger */}
          <motion.div
            className="grid md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.15 }
              }
            }}
          >
            {[
              {
                BacteriaIcon: BacillusSVG,
                title: 'Análisis Especializados',
                description: 'Detección de microorganismos patógenos con metodologías validadas según normas oficiales mexicanas.',
                color: '#0047CB',
                bacteriaColor: '#0047CB'
              },
              {
                BacteriaIcon: PetriDishSVG,
                title: 'Equipamiento de Vanguardia',
                description: 'Laboratorio equipado con tecnología de última generación para garantizar resultados precisos.',
                color: '#98CB59',
                bacteriaColor: '#98CB59'
              },
              {
                BacteriaIcon: CoccusSVG,
                title: 'Personal Certificado',
                description: 'Equipo de profesionales con experiencia y certificaciones en análisis microbiológico.',
                color: '#00A3E0',
                bacteriaColor: '#00A3E0'
              }
            ].map((item, index) => {
              const { BacteriaIcon } = item;
              return (
                <motion.div
                  key={index}
                  variants={{
                    hidden: { opacity: 0, y: 60, rotateX: -15 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      rotateX: 0,
                      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
                    }
                  }}
                  whileHover={{
                    y: -12,
                    rotateX: 5,
                    rotateY: -5,
                    scale: 1.02,
                    boxShadow: `0 25px 50px ${item.color}25`,
                  }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100
                           cursor-pointer group relative overflow-hidden"
                  style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
                >
                  {/* Hover gradient overlay */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `linear-gradient(135deg, ${item.color}08 0%, transparent 60%)`,
                    }}
                  />

                  {/* Icon container con bacteria animada */}
                  <motion.div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 relative z-10"
                    style={{ backgroundColor: `${item.color}10` }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <BacteriaIcon
                      size={50}
                      color={item.bacteriaColor}
                      animated={true}
                      delay={index * 0.3}
                    />
                  </motion.div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3 relative z-10">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed relative z-10">{item.description}</p>

                  {/* Bottom accent line que aparece en hover */}
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-1 origin-left"
                    style={{ backgroundColor: item.color }}
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Tecnología e Innovación Section - Timeline Interactivo */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
        {/* Decorative bacteria background */}
        <div className="absolute top-20 right-10 opacity-5 hidden xl:block">
          <SpirillumSVG size={200} color="#0047CB" animated={false} />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <motion.span
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#98CB59]/10 text-[#98CB59]
                          rounded-full text-sm font-medium mb-4"
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  animate={{ rotate: [0, 20, -20, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <FaLightbulb className="w-4 h-4" />
                </motion.div>
                Innovación Constante
              </motion.span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Tecnología e <span className="text-[#98CB59]">Innovación</span>
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Plataformas versátiles, resultados confiables. Utilizamos metodologías
                avaladas por las normas oficiales mexicanas (NOM) para garantizar
                la máxima precisión en cada análisis.
              </p>

              {/* Timeline interactivo con línea que se dibuja */}
              <div className="relative">
                {/* Línea vertical que se dibuja */}
                <motion.div
                  className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#0047CB] via-[#98CB59] to-[#00A3E0]"
                  initial={{ scaleY: 0, originY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                />

                <div className="space-y-6">
                  {[
                    { text: 'Metodologías NOM-092, NOM-111, NOM-113, NOM-210', icon: MdVerified, color: '#0047CB' },
                    { text: 'Resultados en 3 a 10 días hábiles', icon: MdSpeed, color: '#98CB59' },
                    { text: 'Sistema de gestión ISO 9001:2015', icon: FaCertificate, color: '#00A3E0' },
                    { text: 'Trazabilidad completa de muestras', icon: FaShieldAlt, color: '#0047CB' }
                  ].map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + index * 0.15 }}
                        className="relative pl-14"
                      >
                        {/* Timeline dot con pulso */}
                        <motion.div
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full
                                   flex items-center justify-center z-10"
                          style={{ backgroundColor: `${item.color}15` }}
                          whileHover={{ scale: 1.2 }}
                          whileInView={{
                            boxShadow: [
                              `0 0 0 0 ${item.color}40`,
                              `0 0 0 10px ${item.color}00`,
                              `0 0 0 0 ${item.color}40`
                            ]
                          }}
                          transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                        >
                          <Icon className="w-5 h-5" style={{ color: item.color }} />
                        </motion.div>

                        {/* Card con hover */}
                        <motion.div
                          className="p-4 bg-white rounded-xl shadow-sm border border-gray-100
                                   hover:shadow-lg hover:border-transparent transition-all duration-300"
                          whileHover={{ x: 8, backgroundColor: '#fafafa' }}
                        >
                          <span className="text-gray-700 font-medium">{item.text}</span>
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Card visual representando tecnología con hover 3D */}
              <motion.div
                className="bg-gradient-to-br from-[#0047CB] to-[#003F92] rounded-3xl p-10 text-white relative overflow-hidden"
                whileHover={{
                  rotateY: -5,
                  rotateX: 5,
                  scale: 1.02,
                  boxShadow: '0 30px 60px rgba(0,71,203,0.3)'
                }}
                transition={{ type: 'spring', stiffness: 200 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Decorative elements animados */}
                <motion.div
                  className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
                <motion.div
                  className="absolute bottom-0 left-0 w-32 h-32 bg-[#98CB59]/20 rounded-full blur-xl translate-y-1/2 -translate-x-1/2"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                />

                <div className="relative z-10">
                  <motion.div
                    className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center mb-8"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <WaterDropSVG size={50} color="#98CB59" animated={true} />
                  </motion.div>

                  <h3 className="text-2xl font-bold mb-4">Normas Oficiales Mexicanas</h3>
                  <p className="text-white/90 mb-8 leading-relaxed">
                    Todos nuestros análisis se realizan bajo estricto cumplimiento
                    de las NOM aplicables, garantizando resultados válidos ante
                    autoridades sanitarias.
                  </p>

                  {/* NOM badges con hover */}
                  <div className="grid grid-cols-2 gap-4">
                    {['NOM-092', 'NOM-111', 'NOM-113', 'NOM-210'].map((nom, i) => (
                      <motion.div
                        key={i}
                        className="px-4 py-3 bg-white/10 rounded-xl text-center cursor-pointer
                                 border border-transparent hover:border-white/20"
                        whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.2)' }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                      >
                        <span className="font-mono font-semibold">{nom}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Comprometidos Section - Progress Circles Animados */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 opacity-5 hidden lg:block">
          <CoccusSVG size={300} color="#0047CB" animated={false} />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.span
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0047CB]/10 text-[#0047CB]
                        rounded-full text-sm font-medium mb-4"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <FaHandHoldingHeart className="w-4 h-4" />
              </motion.div>
              Nuestro Compromiso
            </motion.span>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              <span className="text-[#0047CB]">Comprometidos</span> con el Servicio
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Para una mejor calidad de vida de la comunidad
            </p>
          </motion.div>

          {/* Progress Circles Grid */}
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.2 }
              }
            }}
          >
            {/* Progress Circle 1 - Tiempo de entrega */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 40, scale: 0.8 },
                visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6 } }
              }}
              whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,71,203,0.15)' }}
              className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 text-center border border-gray-100 shadow-lg
                       cursor-pointer transition-all duration-300"
            >
              <div className="scale-75 sm:scale-100 origin-center">
                <CircleProgress
                  value={10}
                  max={10}
                  size={120}
                  strokeWidth={8}
                  color="#0047CB"
                  label="Días máximo"
                  suffix=""
                  duration={2}
                  className="mx-auto mb-2 sm:mb-4"
                />
              </div>
              <h3 className="font-bold text-gray-900 text-base sm:text-lg">Tiempo de Entrega</h3>
              <p className="text-gray-500 text-xs sm:text-sm">3-10 días hábiles</p>
            </motion.div>

            {/* Progress Circle 2 - Confiabilidad */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 40, scale: 0.8 },
                visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6 } }
              }}
              whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(152,203,89,0.15)' }}
              className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 text-center border border-gray-100 shadow-lg
                       cursor-pointer transition-all duration-300"
            >
              <div className="scale-75 sm:scale-100 origin-center">
                <CircleProgress
                  value={100}
                  max={100}
                  size={120}
                  strokeWidth={8}
                  color="#98CB59"
                  label="En resultados"
                  suffix="%"
                  duration={2.5}
                  className="mx-auto mb-2 sm:mb-4"
                />
              </div>
              <h3 className="font-bold text-gray-900 text-base sm:text-lg">Confiabilidad</h3>
              <p className="text-gray-500 text-xs sm:text-sm">Resultados garantizados</p>
            </motion.div>

            {/* Progress Circle 3 - Experiencia */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 40, scale: 0.8 },
                visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6 } }
              }}
              whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,163,224,0.15)' }}
              className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 text-center border border-gray-100 shadow-lg
                       cursor-pointer transition-all duration-300"
            >
              <div className="scale-75 sm:scale-100 origin-center">
                <CircleProgress
                  value={25}
                  max={30}
                  size={120}
                  strokeWidth={8}
                  color="#00A3E0"
                  label="Años"
                  suffix="+"
                  duration={2}
                  className="mx-auto mb-2 sm:mb-4"
                />
              </div>
              <h3 className="font-bold text-gray-900 text-base sm:text-lg">Experiencia</h3>
              <p className="text-gray-500 text-xs sm:text-sm">Grupo Micro-Tec</p>
            </motion.div>

            {/* Card especial - ISO Certificación */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 40, scale: 0.8 },
                visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6 } }
              }}
              whileHover={{
                y: -8,
                boxShadow: '0 20px 40px rgba(0,71,203,0.2)',
                scale: 1.02
              }}
              className="bg-gradient-to-br from-[#0047CB] to-[#003F92] rounded-2xl sm:rounded-3xl p-4 sm:p-8 text-center
                       cursor-pointer transition-all duration-300 relative overflow-hidden"
            >
              {/* Animated background pattern */}
              <motion.div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                  backgroundSize: '20px 20px'
                }}
                animate={{ backgroundPosition: ['0 0', '20px 20px'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              />

              <motion.div
                className="relative z-10"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.5 }}
              >
                <motion.div
                  className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-2 sm:mb-4 rounded-full bg-white/10 flex items-center justify-center"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                >
                  <FoodSafetySVG size={40} color="#98CB59" animated={true} />
                </motion.div>
                <motion.div
                  className="text-2xl sm:text-4xl font-bold text-white mb-1"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8 }}
                >
                  ISO
                </motion.div>
                <div className="text-lg sm:text-2xl font-semibold text-[#98CB59]">9001:2015</div>
                <p className="text-white/90 text-xs sm:text-sm mt-1 sm:mt-2">Certificación de Calidad</p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* DIMOGEN - Acerca de Nosotros Section */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#0047CB]/10 text-[#0047CB]
                            rounded-full text-sm font-medium mb-4">
                <MdBiotech className="w-4 h-4" />
                Acerca de DIMOGEN
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Enfocados en la <span className="text-[#0047CB]">Salud Integral</span> del Paciente
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Ofrecemos servicios de consultoría médica general, consulta de especialidad
                y toma de muestras para análisis clínicos.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                De igual manera, nos dedicamos a la investigación, desarrollo y comercialización
                de análisis especializados en <strong>Biología Molecular</strong>,{' '}
                <strong>Secuenciación Genética</strong> y <strong>Microbiología de Alimentos</strong>.
              </p>

              {/* 3 Lines of Business */}
              <div className="space-y-4">
                {[
                  {
                    title: 'Biología Molecular',
                    desc: 'Extenso catálogo de pruebas genéticas, genómicas y bioquímicas de alta especialidad.',
                    color: '#0047CB'
                  },
                  {
                    title: 'Microbiología de Alimentos',
                    desc: 'Análisis de microorganismos en agua, hielo, superficies y alimentos.',
                    color: '#98CB59'
                  },
                  {
                    title: 'Unidad de Salud Integral',
                    desc: 'Consulta médica, estudios clínicos de rutina y acompañamiento personalizado.',
                    color: '#00A3E0'
                  }
                ].map((service, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl"
                  >
                    <div
                      className="w-3 h-3 rounded-full mt-2 flex-shrink-0"
                      style={{ backgroundColor: service.color }}
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">{service.title}</h4>
                      <p className="text-sm text-gray-600">{service.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Decorative card */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 border border-gray-100 shadow-xl">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-[#0047CB]/10 flex items-center justify-center">
                    <FaFlask className="w-10 h-10 text-[#0047CB]" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Microbiología de Alimentos</h3>
                  <p className="text-gray-600">Detección de microorganismos en los alimentos</p>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
                    <FaCheckCircle className="w-5 h-5 text-[#98CB59]" />
                    <span className="text-gray-700">Las industrias aseguran la salud de los consumidores</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
                    <FaCheckCircle className="w-5 h-5 text-[#98CB59]" />
                    <span className="text-gray-700">Certificación avalada por Global Standards</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
                    <FaCertificate className="w-5 h-5 text-[#0047CB]" />
                    <span className="text-gray-700 font-semibold">ISO 9001:2015</span>
                  </div>
                </div>

                {/* Contact for this service */}
                <div className="bg-[#0047CB] rounded-2xl p-6 text-white">
                  <p className="text-sm text-white/90 mb-2">Contacto Microbiología de Alimentos</p>
                  <div className="space-y-2">
                    <a href="tel:5610454458" className="flex items-center gap-2 text-white hover:text-[#98CB59] transition-colors">
                      <FaPhone className="w-4 h-4" />
                      <span className="font-semibold">56 1045 4458</span>
                    </a>
                    <a href="mailto:msanchez@dimogen.com.mx" className="flex items-center gap-2 text-white hover:text-[#98CB59] transition-colors">
                      <FaEnvelope className="w-4 h-4" />
                      <span>msanchez@dimogen.com.mx</span>
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Nuestra Filosofía Section */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0047CB] via-[#003F92] to-[#002960]" />

        {/* Pattern overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Decorative accent */}
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#98CB59] opacity-10"
             style={{ clipPath: 'polygon(100% 30%, 100% 100%, 30% 100%)' }} />

        <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <FaQuoteLeft className="w-16 h-16 mx-auto text-[#98CB59]/50 mb-8" />

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-8 leading-tight">
              Nuestra Filosofía
            </h2>

            <p className="text-xl md:text-2xl text-white/90 font-light leading-relaxed mb-6 max-w-4xl mx-auto">
              "La <span className="text-[#98CB59] font-semibold">prevención</span> y el{' '}
              <span className="text-[#98CB59] font-semibold">diagnóstico oportuno</span>{' '}
              sigue siendo el parte aguas de una sociedad saludable."
            </p>

            <p className="text-lg text-white/90 leading-relaxed mb-12 max-w-3xl mx-auto">
              La tecnología debe ser cada vez más accesible al público en general, ofertando
              diagnósticos confiables y de calidad. Los servicios en salud están cada día más
              encaminados a desarrollar una <strong className="text-white">Medicina Personalizada de Precisión</strong>.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="flex items-center gap-3 px-6 py-3 bg-white/10 rounded-full">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                  <MdBiotech className="w-6 h-6 text-[#98CB59]" />
                </div>
                <div className="text-left">
                  <div className="text-white font-semibold">DIMOGEN</div>
                  <div className="text-white/90 text-sm">Laboratorio de Alta Especialidad</div>
                </div>
              </div>

              <div className="hidden sm:block w-px h-12 bg-white/20" />

              <div className="flex items-center gap-3 px-6 py-3 bg-white/10 rounded-full">
                <div className="text-left">
                  <div className="text-white/90 text-sm">Perteneciente a</div>
                  <div className="text-[#98CB59] font-semibold">Grupo Micro-Tec</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sectors Section */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#0047CB]/10 text-[#0047CB]
                          rounded-full text-sm font-medium mb-4">
              <FaIndustry className="w-4 h-4" />
              Sectores que Atendemos
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Soluciones para Toda la <span className="text-[#0047CB]">Industria</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Ofrecemos análisis microbiológico especializado para diversos sectores
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {sectoresAtendidos.map((sector, index) => {
              const Icon = sectorIcons[sector.icon] || FaIndustry;
              return (
                <motion.div
                  key={sector.nombre}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl p-5 text-center hover:shadow-lg
                           border-2 border-gray-100 hover:border-[#98CB59]/30 transition-all group"
                >
                  <div className="w-14 h-14 mx-auto rounded-xl bg-[#0047CB]/10 flex items-center justify-center mb-3
                               group-hover:bg-[#98CB59] transition-colors">
                    <Icon className="w-7 h-7 text-[#0047CB] group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">{sector.nombre}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2">{sector.descripcion}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Catalog Section - Premium con Micro-interacciones */}
      <section id="catalogo" ref={catalogoRef} className="py-16 md:py-24 bg-white relative overflow-hidden scroll-mt-20">
        {/* Background decorativo animado */}
        <motion.div
          className="absolute top-20 right-0 w-72 h-72 bg-[#98CB59]/5 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 left-0 w-64 h-64 bg-[#0047CB]/5 rounded-full blur-3xl"
          animate={{ scale: [1, 1.15, 1], opacity: [0.03, 0.08, 0.03] }}
          transition={{ duration: 8, repeat: Infinity, delay: 2 }}
        />

        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <motion.span
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#98CB59]/10 text-[#98CB59]
                        rounded-full text-sm font-medium mb-4"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              >
                <MdBiotech className="w-4 h-4" />
              </motion.div>
              Catálogo Completo
            </motion.span>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Catálogo de <span className="text-[#0047CB]">Análisis</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
              Todos nuestros análisis cumplen con las normas oficiales mexicanas
            </p>

            {/* Contact for quotes badge con hover */}
            <motion.div
              className="inline-flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-[#0047CB]/10 to-[#98CB59]/10
                        rounded-full border border-[#0047CB]/10"
              whileHover={{ scale: 1.02, boxShadow: '0 8px 25px rgba(0,71,203,0.15)' }}
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <FaWhatsapp className="w-5 h-5 text-[#25D366]" />
              </motion.div>
              <span className="text-gray-700">
                ¿Necesitas cotización?{' '}
                <motion.a
                  href={`https://wa.me/${DIMOGEN_CONTACT.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0047CB] font-semibold relative"
                  whileHover={{ color: '#003F92' }}
                >
                  <span className="relative z-10">Contáctanos</span>
                  <motion.span
                    className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0047CB] origin-center"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.a>
              </span>
            </motion.div>
          </motion.div>

          {/* Tabs Animados con indicador de slide - responsive */}
          <div className="flex justify-center gap-2 mb-8 relative px-4 sm:px-0">
            <div className="relative bg-gray-100 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl inline-flex w-full sm:w-auto">
              {/* Indicador animado que se desliza */}
              <motion.div
                className="absolute top-1 sm:top-1.5 bottom-1 sm:bottom-1.5 bg-[#0047CB] rounded-lg sm:rounded-xl shadow-lg"
                initial={false}
                animate={{
                  left: tabActivo === 'estudios' ? '4px' : '50%',
                  width: 'calc(50% - 6px)',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />

              <motion.button
                onClick={() => setTabActivo('estudios')}
                className={`relative z-10 px-3 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-colors flex-1 sm:flex-none sm:min-w-[160px] text-sm sm:text-base ${
                  tabActivo === 'estudios' ? 'text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
                whileTap={{ scale: 0.98 }}
              >
                <span className="hidden sm:inline">Estudios Individuales</span>
                <span className="sm:hidden">Estudios</span>
              </motion.button>
              <motion.button
                onClick={() => setTabActivo('paquetes')}
                className={`relative z-10 px-3 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-medium transition-colors flex-1 sm:flex-none sm:min-w-[140px] text-sm sm:text-base ${
                  tabActivo === 'paquetes' ? 'text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
                whileTap={{ scale: 0.98 }}
              >
                Paquetes
              </motion.button>
            </div>
          </div>

          {/* Search Bar Premium con animaciones */}
          {tabActivo === 'estudios' && (
            <motion.div
              className="max-w-xl mx-auto mb-10"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="relative group"
                whileFocusWithin={{
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
              >
                {/* Glow effect on focus */}
                <motion.div
                  className="absolute -inset-1 bg-gradient-to-r from-[#0047CB]/20 to-[#98CB59]/20 rounded-3xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"
                />

                <div className="relative">
                  <motion.div
                    className="absolute left-4 top-1/2 -translate-y-1/2"
                    animate={{ rotate: busqueda ? 360 : 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <FaSearch className="w-5 h-5 text-gray-400 group-focus-within:text-[#0047CB] transition-colors" />
                  </motion.div>
                  <input
                    type="text"
                    placeholder="Buscar análisis por nombre o código..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="relative w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200
                             focus:border-[#0047CB] focus:ring-4 focus:ring-[#0047CB]/10
                             outline-none transition-all bg-white shadow-sm
                             hover:border-gray-300 hover:shadow-md"
                  />
                  {/* Clear button animado */}
                  <AnimatePresence>
                    {busqueda && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        onClick={() => setBusqueda('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full
                                 bg-gray-100 hover:bg-gray-200 flex items-center justify-center
                                 text-gray-500 hover:text-gray-700 transition-colors"
                        whileHover={{ rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        ×
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Studies List - Premium Cards */}
          {tabActivo === 'estudios' && (
            <motion.div
              className="space-y-4"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.05 }
                }
              }}
            >
              <AnimatePresence mode="popLayout">
                {estudiosFiltrados.map((estudio, index) => (
                  <motion.div
                    key={estudio.codigo}
                    layout
                    variants={{
                      hidden: { opacity: 0, y: 20, scale: 0.98 },
                      visible: { opacity: 1, y: 0, scale: 1 }
                    }}
                    exit={{ opacity: 0, scale: 0.95, x: -20 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden
                             relative group"
                    whileHover={{
                      borderColor: 'rgba(152,203,89,0.4)',
                      boxShadow: '0 10px 40px rgba(0,71,203,0.1)',
                      y: -2
                    }}
                  >
                    {/* Bottom border accent que aparece en hover */}
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#98CB59] via-[#0047CB] to-[#98CB59] origin-left"
                      initial={{ scaleX: 0 }}
                      whileHover={{ scaleX: 1 }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                    />

                    <button
                      onClick={() => {
                        if (hasAlimentosEnrichedData(estudio.codigo)) {
                          handleOpenModal(estudio.codigo);
                        } else {
                          setEstudioExpandido(estudioExpandido === estudio.codigo ? null : estudio.codigo);
                        }
                      }}
                      className="w-full p-6 text-left"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          {/* Código con micro-icono de bacteria */}
                          <motion.div
                            className="px-3 py-2 rounded-xl bg-[#98CB59]/10 text-[#0047CB] text-sm font-mono font-bold
                                      border-2 border-[#98CB59]/30 min-w-[80px] text-center relative overflow-hidden"
                            whileHover={{ scale: 1.05, borderColor: '#98CB59' }}
                          >
                            {estudio.codigo}
                            {/* Shimmer effect on hover */}
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"
                            />
                          </motion.div>

                          {/* Nombre */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 flex items-center gap-2 flex-wrap group-hover:text-[#0047CB] transition-colors">
                              {estudio.nombre}
                              {estudio.destacado && (
                                <motion.span
                                  className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-medium"
                                  animate={{ scale: [1, 1.05, 1] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                >
                                  ⭐ Recomendado
                                </motion.span>
                              )}
                              {hasAlimentosEnrichedData(estudio.codigo) && (
                                <span className="hidden sm:inline-flex px-2 py-0.5 bg-gradient-to-r from-[#98CB59]/10 to-[#7AB539]/10 text-[#7AB539] text-xs rounded-full font-medium items-center gap-1 border border-[#98CB59]/20">
                                  <FaImages className="w-3 h-3" />
                                  <span className="hidden md:inline">Info completa</span>
                                </span>
                              )}
                            </h4>
                            <p className="text-sm text-gray-500 truncate hidden sm:block mt-1 group-hover:text-gray-600 transition-colors">
                              {estudio.normativa}
                            </p>
                          </div>
                        </div>

                        {/* Precio y Toggle con efectos */}
                        <div className="flex items-center gap-4 ml-4">
                          <motion.div
                            className="text-right hidden sm:block"
                            whileHover={{ scale: 1.05 }}
                          >
                            <motion.div
                              className="text-2xl font-bold text-[#0047CB] relative"
                              whileHover={{
                                textShadow: '0 0 20px rgba(0,71,203,0.3)'
                              }}
                            >
                              ${estudio.precio.toLocaleString()}
                            </motion.div>
                            <div className="text-xs text-gray-500">MXN</div>
                          </motion.div>
                          <motion.div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                              hasAlimentosEnrichedData(estudio.codigo)
                                ? 'bg-gradient-to-r from-[#98CB59] to-[#7AB539] text-white'
                                : estudioExpandido === estudio.codigo
                                  ? 'bg-[#0047CB] text-white'
                                  : 'bg-gray-100 text-gray-500 group-hover:bg-[#98CB59]/20 group-hover:text-[#0047CB]'
                            }`}
                            animate={{ rotate: hasAlimentosEnrichedData(estudio.codigo) ? 0 : (estudioExpandido === estudio.codigo ? 180 : 0) }}
                            transition={{ type: 'spring', stiffness: 300 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            {hasAlimentosEnrichedData(estudio.codigo) ? (
                              <FaEye className="w-4 h-4" />
                            ) : (
                              <FaChevronDown className="w-4 h-4" />
                            )}
                          </motion.div>
                        </div>
                      </div>
                    </button>

                    {/* Expanded Details con Spring Physics */}
                    <AnimatePresence>
                      {estudioExpandido === estudio.codigo && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                          className="overflow-hidden"
                        >
                          <motion.div
                            className="px-6 pb-6 pt-4 border-t-2 border-gray-100 bg-gradient-to-b from-gray-50/80 to-white"
                            initial={{ y: -20 }}
                            animate={{ y: 0 }}
                            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                          >
                            <p className="text-gray-600 mb-6 leading-relaxed">{estudio.descripcion}</p>

                            <motion.div
                              className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
                              initial="hidden"
                              animate="visible"
                              variants={{
                                hidden: { opacity: 0 },
                                visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
                              }}
                            >
                              {/* Tipo de Muestra */}
                              <motion.div
                                className="bg-white rounded-xl p-4 border border-gray-100 hover:border-[#0047CB]/20 hover:shadow-md transition-all"
                                variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                                whileHover={{ scale: 1.02 }}
                              >
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                  <motion.div whileHover={{ rotate: 15 }}>
                                    <FaVial className="w-4 h-4 text-[#0047CB]" />
                                  </motion.div>
                                  Tipo de Muestra
                                </div>
                                <ul className="text-sm space-y-1">
                                  {estudio.tipoMuestra.map((tipo, i) => (
                                    <li key={i} className="text-gray-700">• {tipo}</li>
                                  ))}
                                </ul>
                              </motion.div>

                              {/* Tiempo de Entrega */}
                              <motion.div
                                className="bg-white rounded-xl p-4 border border-gray-100 hover:border-[#98CB59]/30 hover:shadow-md transition-all"
                                variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                                whileHover={{ scale: 1.02 }}
                              >
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                  <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                                    <FaClock className="w-4 h-4 text-[#98CB59]" />
                                  </motion.div>
                                  Tiempo de Entrega
                                </div>
                                <p className="text-gray-900 font-semibold">{estudio.tiempoEntrega}</p>
                              </motion.div>

                              {/* Temperatura */}
                              <motion.div
                                className="bg-white rounded-xl p-4 border border-gray-100 hover:border-[#00A3E0]/30 hover:shadow-md transition-all"
                                variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                                whileHover={{ scale: 1.02 }}
                              >
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                  <motion.div whileHover={{ y: -2 }}>
                                    <FaThermometerHalf className="w-4 h-4 text-[#00A3E0]" />
                                  </motion.div>
                                  Temperatura de Transporte
                                </div>
                                <ul className="text-sm space-y-1">
                                  <li className="text-gray-700">Perecederos: {estudio.temperaturaTransporte.perecederos}</li>
                                  <li className="text-gray-700">Aguas: {estudio.temperaturaTransporte.aguas}</li>
                                </ul>
                              </motion.div>
                            </motion.div>

                            {/* Normativa con badge animado */}
                            <motion.div
                              className="flex items-center gap-2 text-sm text-gray-500 mb-6 p-3 bg-[#98CB59]/5 rounded-xl inline-flex"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.3 }}
                            >
                              <FaCertificate className="w-4 h-4 text-[#98CB59]" />
                              <span>Metodología: <strong className="text-gray-900">{estudio.normativa}</strong></span>
                            </motion.div>

                            {/* Mobile Price con animación */}
                            <motion.div
                              className="sm:hidden bg-gradient-to-r from-[#0047CB]/10 to-[#98CB59]/10 rounded-xl p-4 mb-4"
                              initial={{ scale: 0.9 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 300 }}
                            >
                              <div className="text-center">
                                <motion.div
                                  className="text-2xl font-bold text-[#0047CB]"
                                  animate={{ scale: [1, 1.02, 1] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                >
                                  ${estudio.precio.toLocaleString()} MXN
                                </motion.div>
                              </div>
                            </motion.div>

                            <div className="flex flex-wrap gap-3">
                              <motion.a
                                href={`https://wa.me/${DIMOGEN_CONTACT.whatsapp}?text=Hola,%20me%20interesa%20el%20análisis%20${encodeURIComponent(estudio.nombre)}%20(${estudio.codigo})`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#25D366] text-white
                                         rounded-xl font-medium shadow-md"
                                whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(37,211,102,0.3)' }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <FaWhatsapp className="w-4 h-4" />
                                Cotizar este análisis
                              </motion.a>
                              <motion.a
                                href={`tel:+52${DIMOGEN_CONTACT.phoneLink}`}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700
                                         rounded-xl font-medium border-2 border-gray-200"
                                whileHover={{ scale: 1.05, borderColor: '#0047CB', color: '#0047CB' }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <FaPhone className="w-4 h-4" />
                                Llamar
                              </motion.a>
                            </div>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* No Results - Empty State con Bacteria Triste */}
              {estudiosFiltrados.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className="text-center py-16"
                >
                  {/* Bacteria triste animada */}
                  <motion.div
                    className="w-28 h-28 mx-auto mb-6 relative"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      {/* Bacteria body */}
                      <motion.ellipse
                        cx="50"
                        cy="50"
                        rx="35"
                        ry="25"
                        fill="#E5E7EB"
                        stroke="#9CA3AF"
                        strokeWidth="2"
                        animate={{ scaleY: [1, 0.95, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                      {/* Sad face */}
                      <circle cx="38" cy="45" r="4" fill="#9CA3AF" />
                      <circle cx="62" cy="45" r="4" fill="#9CA3AF" />
                      {/* Sad mouth - curved down */}
                      <motion.path
                        d="M 35 60 Q 50 55 65 60"
                        fill="none"
                        stroke="#9CA3AF"
                        strokeWidth="3"
                        strokeLinecap="round"
                        animate={{ d: ['M 35 60 Q 50 55 65 60', 'M 35 58 Q 50 53 65 58', 'M 35 60 Q 50 55 65 60'] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      {/* Tear drop */}
                      <motion.ellipse
                        cx="38"
                        cy="52"
                        rx="2"
                        ry="3"
                        fill="#93C5FD"
                        initial={{ opacity: 0, y: 0 }}
                        animate={{ opacity: [0, 1, 1, 0], y: [0, 0, 8, 12] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                      />
                      {/* Flagella wilting */}
                      <motion.path
                        d="M 15 50 Q 5 45 8 55"
                        fill="none"
                        stroke="#D1D5DB"
                        strokeWidth="3"
                        strokeLinecap="round"
                        animate={{ d: ['M 15 50 Q 5 45 8 55', 'M 15 50 Q 3 48 6 58'] }}
                        transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse' }}
                      />
                    </svg>
                  </motion.div>

                  <motion.h3
                    className="text-xl font-semibold text-gray-900 mb-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    No se encontraron análisis
                  </motion.h3>
                  <motion.p
                    className="text-gray-500 mb-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    Intenta con otro término de búsqueda
                  </motion.p>
                  <motion.button
                    onClick={() => setBusqueda('')}
                    className="px-6 py-3 bg-[#0047CB] text-white rounded-xl font-medium"
                    whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(0,71,203,0.3)' }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    Limpiar búsqueda
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Packages - Premium con Micro-interacciones */}
          {tabActivo === 'paquetes' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {/* Packages intro con badge animado */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-10"
              >
                <motion.div
                  className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-[#98CB59]/10 to-[#0047CB]/10
                            rounded-2xl border border-[#98CB59]/20 mb-4 relative overflow-hidden"
                  whileHover={{ scale: 1.02, boxShadow: '0 10px 40px rgba(152,203,89,0.2)' }}
                >
                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                  />

                  <motion.div
                    className="w-10 h-10 rounded-full bg-[#98CB59] flex items-center justify-center relative z-10"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <FaCheckCircle className="w-5 h-5 text-white" />
                  </motion.div>
                  <div className="text-left relative z-10">
                    <p className="text-sm text-gray-500">Ahorra hasta</p>
                    <motion.p
                      className="text-xl font-bold text-[#98CB59]"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      25% en paquetes
                    </motion.p>
                  </div>
                </motion.div>
                <p className="text-gray-600 max-w-xl mx-auto">
                  Nuestros paquetes combinan los análisis más solicitados a precios preferenciales,
                  ideales para un control sanitario integral.
                </p>
              </motion.div>

              <motion.div
                className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
                }}
              >
              {paquetesAlimentos.map((paquete, index) => (
                <motion.div
                  key={paquete.codigo}
                  variants={{
                    hidden: { opacity: 0, y: 30, scale: 0.95 },
                    visible: { opacity: 1, y: 0, scale: 1 }
                  }}
                  whileHover={{
                    y: -8,
                    boxShadow: paquete.destacado
                      ? '0 25px 60px rgba(0,71,203,0.25)'
                      : '0 20px 50px rgba(0,0,0,0.1)',
                    scale: 1.02
                  }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  className={`bg-white rounded-2xl overflow-hidden relative
                            ${paquete.destacado
                              ? 'border-2 border-[#0047CB] shadow-xl'
                              : 'border-2 border-gray-100'}`}
                >
                  {/* Destacado: Ribbon animado "Más Popular" */}
                  {paquete.destacado && (
                    <motion.div
                      className="absolute top-4 -right-8 bg-[#98CB59] text-white text-xs font-bold py-1 px-10 rotate-45 shadow-md z-20"
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <motion.span
                        animate={{ opacity: [1, 0.7, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        ★ POPULAR
                      </motion.span>
                    </motion.div>
                  )}

                  {/* Header con gradiente animado para destacado */}
                  <div className={`p-6 relative overflow-hidden ${paquete.destacado
                    ? 'bg-gradient-to-r from-[#0047CB] to-[#003F92]'
                    : 'bg-gray-50'}`}>
                    {paquete.destacado && (
                      <>
                        {/* Animated glow */}
                        <motion.div
                          className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"
                          animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.2, 0.1] }}
                          transition={{ duration: 3, repeat: Infinity }}
                        />
                        <motion.div
                          className="flex items-center gap-2 text-[#98CB59] text-sm mb-2 font-medium relative z-10"
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                          >
                            <FaCheckCircle className="w-4 h-4" />
                          </motion.div>
                          Más Popular
                        </motion.div>
                      </>
                    )}
                    <div className="flex items-center gap-2 flex-wrap relative z-10">
                      <h3 className={`text-2xl font-bold ${paquete.destacado ? 'text-white' : 'text-gray-900'}`}>
                        {paquete.nombre}
                      </h3>
                      {hasAlimentosEnrichedData(paquete.codigo) && (
                        <span className={`inline-flex px-2 py-0.5 text-xs rounded-full font-medium items-center gap-1 ${
                          paquete.destacado
                            ? 'bg-white/20 text-white border border-white/30'
                            : 'bg-gradient-to-r from-[#98CB59]/10 to-[#7AB539]/10 text-[#7AB539] border border-[#98CB59]/20'
                        }`}>
                          <FaEye className="w-3 h-3" />
                          <span className="hidden sm:inline">Ver ficha</span>
                        </span>
                      )}
                    </div>
                    <p className={`text-sm relative z-10 ${paquete.destacado ? 'text-white/90' : 'text-gray-500'}`}>
                      {paquete.descripcion}
                    </p>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Price con efecto brillo */}
                    <motion.div
                      className="text-center mb-6"
                      whileHover={{ scale: 1.05 }}
                    >
                      <motion.div
                        className="text-4xl font-bold text-[#0047CB] relative inline-block"
                        whileHover={{ textShadow: '0 0 30px rgba(0,71,203,0.4)' }}
                      >
                        ${paquete.precio.toLocaleString()}
                        {/* Sparkle effect */}
                        <motion.span
                          className="absolute -top-1 -right-2 text-[#98CB59] text-lg"
                          animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5], rotate: [0, 15, 0] }}
                          transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                        >
                          ✦
                        </motion.span>
                      </motion.div>
                      <div className="text-sm text-gray-500">MXN</div>
                      {paquete.ahorro && (
                        <motion.div
                          className="mt-2 inline-block px-3 py-1 bg-[#98CB59]/10 text-[#98CB59] rounded-full text-sm font-medium"
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          ⚡ Ahorra {paquete.ahorro}%
                        </motion.div>
                      )}
                    </motion.div>

                    {/* Includes con stagger */}
                    <div className="space-y-3 mb-6">
                      <div className="text-sm font-medium text-gray-700">Incluye:</div>
                      {paquete.incluye.map((item, i) => (
                        <motion.div
                          key={i}
                          className="flex items-center gap-2 text-sm text-gray-600"
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <motion.div
                            whileHover={{ scale: 1.2, rotate: 360 }}
                            transition={{ duration: 0.3 }}
                          >
                            <FaCheckCircle className="w-4 h-4 text-[#98CB59] flex-shrink-0" />
                          </motion.div>
                          {item}
                        </motion.div>
                      ))}
                    </div>

                    {/* Time con icono animado */}
                    <motion.div
                      className="flex items-center gap-2 text-sm text-gray-500 mb-6"
                      whileHover={{ color: '#0047CB' }}
                    >
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <FaClock className="w-4 h-4" />
                      </motion.div>
                      Entrega: {paquete.tiempoEntrega}
                    </motion.div>

                    {/* CTA Premium */}
                    <motion.a
                      href={`https://wa.me/${DIMOGEN_CONTACT.whatsapp}?text=Hola,%20me%20interesa%20el%20${encodeURIComponent(paquete.nombre)}%20de%20microbiología%20de%20alimentos`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl
                               font-semibold relative overflow-hidden ${
                                 paquete.destacado
                                   ? 'bg-[#0047CB] text-white shadow-lg'
                                   : 'bg-gray-100 text-gray-700'
                               }`}
                      whileHover={{
                        scale: 1.03,
                        boxShadow: paquete.destacado
                          ? '0 15px 40px rgba(0,71,203,0.4)'
                          : '0 10px 30px rgba(0,0,0,0.1)'
                      }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {/* Button shimmer */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                      />
                      <FaWhatsapp className="w-5 h-5 relative z-10" />
                      <span className="relative z-10">Cotizar paquete</span>
                    </motion.a>

                    {/* Botón Ver ficha completa - solo si tiene JSON */}
                    {hasAlimentosEnrichedData(paquete.codigo) && (
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenModal(paquete.codigo);
                        }}
                        className="w-full flex items-center justify-center gap-2 px-6 py-2.5 mt-2 rounded-xl
                                 font-medium bg-gradient-to-r from-[#98CB59] to-[#7AB539] text-white"
                        whileHover={{ scale: 1.02, boxShadow: '0 10px 30px rgba(152,203,89,0.3)' }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <FaMicroscope className="w-4 h-4" />
                        Ver ficha completa
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))}
              </motion.div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Sample Info Section */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#0047CB]/10 text-[#0047CB]
                          rounded-full text-sm font-medium mb-4">
              <FaVial className="w-4 h-4" />
              Información Importante
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Requisitos de Muestras
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Información importante para el envío correcto de muestras
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Cantidad Mínima */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-100"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-[#98CB59]/10 flex items-center justify-center">
                  <FaVial className="w-5 h-5 text-[#98CB59]" />
                </div>
                Cantidad Mínima Requerida
              </h3>
              <div className="space-y-4">
                {Object.entries(informacionMuestras.cantidadMinima).map(([tipo, cantidad]) => (
                  <div key={tipo} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <span className="text-gray-700 capitalize font-medium">{tipo}</span>
                    <span className="text-[#0047CB] font-semibold">{cantidad}</span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-4 italic bg-gray-50 p-3 rounded-xl">
                * {informacionMuestras.nota}
              </p>
            </motion.div>

            {/* Criterios de Rechazo */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-100"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                  <FaShieldAlt className="w-5 h-5 text-red-500" />
                </div>
                Criterios de Rechazo
              </h3>
              <ul className="space-y-4">
                {informacionMuestras.criteriosRechazo.map((criterio, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-600">
                    <span className="w-2 h-2 rounded-full bg-red-400 mt-2 flex-shrink-0" />
                    <span>{criterio}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Certificaciones Section */}
      <CertificationsSection variant="light" showTitle={true} />

      {/* CTA Section - Mejorado */}
      <section className="relative py-20 overflow-hidden">
        {/* Background con diseño diagonal */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0047CB] to-[#003F92]" />

        {/* Acento verde */}
        <div
          className="absolute top-0 right-0 w-96 h-96 bg-[#98CB59] opacity-20"
          style={{
            clipPath: 'polygon(50% 0, 100% 0, 100% 50%)',
          }}
        />

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
              ¿Necesitas análisis para tu empresa?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Ofrecemos convenios especiales para empresas con volumen
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <a
                href={`https://wa.me/${DIMOGEN_CONTACT.whatsapp}?text=Hola,%20me%20interesa%20información%20sobre%20convenios%20empresariales%20para%20análisis%20de%20alimentos`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 bg-white text-[#0047CB] rounded-xl
                         font-semibold hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl
                         hover:scale-105"
              >
                <FaWhatsapp className="w-5 h-5 text-[#25D366]" />
                Solicitar convenio
              </a>
              <a
                href={`mailto:${DIMOGEN_CONTACT.email}`}
                className="inline-flex items-center gap-3 px-8 py-4 bg-white/10 text-white rounded-xl
                         font-semibold hover:bg-white/20 transition-all border border-white/20"
              >
                {DIMOGEN_CONTACT.email}
              </a>
            </div>

            {/* MICRO-TEC badge */}
            <MicrotecBrandBadge variant="dark" size="md" />
          </motion.div>
        </div>
      </section>

      <FooterDimogen />

      {/* Modal de información enriquecida */}
      <AlimentosTestModal
        testCode={selectedTestCode}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onNavigate={handleNavigateTest}
        availableTests={AVAILABLE_ALIMENTOS_CODES}
      />
    </div>
  );
};

export default MicrobiologiaAlimentosPage;
