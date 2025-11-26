import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaDna,
  FaVirus,
  FaLungs,
  FaHeartbeat,
  FaBacterium,
  FaCheckCircle,
  FaClock,
  FaVial,
  FaChevronDown,
  FaChevronUp,
  FaArrowRight,
  FaFileInvoiceDollar,
  FaShieldAlt,
  FaMicroscope,
  FaNotesMedical,
  FaTint
} from 'react-icons/fa';
import { MdBiotech } from 'react-icons/md';

/**
 * ServiciosMolecularSection Component
 * Catálogo completo de servicios de Biología Molecular
 * Basado en el catálogo PDF de Dimogen
 */
const ServiciosMolecularSection = ({ section, content }) => {
  const [expandedStudy, setExpandedStudy] = useState(null);
  const [activeCategory, setActiveCategory] = useState('its');

  // Categorías de estudios
  const categorias = [
    { id: 'its', name: 'ITS', icon: FaVirus, color: '#E11D48' },
    { id: 'respiratorio', name: 'Respiratorio', icon: FaLungs, color: '#0EA5E9' },
    { id: 'virologia', name: 'Virología', icon: FaBacterium, color: '#8B5CF6' },
    { id: 'gastrointestinal', name: 'Gastrointestinal', icon: FaNotesMedical, color: '#F59E0B' },
    { id: 'tuberculosis', name: 'Tuberculosis', icon: FaLungs, color: '#10B981' },
    { id: 'oncologia', name: 'Oncología', icon: MdBiotech, color: '#EC4899' },
    { id: 'trombosis', name: 'Trombosis', icon: FaTint, color: '#EF4444' },
  ];

  // Estudios por categoría
  const estudios = {
    its: [
      {
        id: 'vph01',
        code: 'VPH01',
        name: 'Detección de VPH',
        description: 'Detecta 14 genotipos de alto riesgo por infección del virus del papiloma humano. Genotipificación parcial de los genotipos 16, 18 y 45.',
        price: 1061,
        deliveryTime: '1 Día hábil',
        sample: 'Exudado vaginal/uretral',
        method: 'PCR en tiempo real',
        color: '#E11D48',
        popular: true
      },
      {
        id: 'vph02',
        code: 'VPH02',
        name: 'Genotipificación de VPH',
        description: 'Detecta individualmente 28 genotipos responsables de VPH. 19 de alto riesgo y 9 de bajo riesgo.',
        price: 1818,
        deliveryTime: '5 Días hábiles',
        sample: 'Exudado vaginal/uretral',
        method: 'PCR en tiempo real',
        color: '#E11D48'
      },
      {
        id: 'its06',
        code: 'ITS06',
        name: 'Chlamydia trachomatis',
        description: 'Detecta el agente bacteriano más común de las infecciones de transmisión sexual.',
        price: 1455,
        deliveryTime: '1 Día hábil',
        sample: 'Exudado vaginal/uretral',
        method: 'PCR en tiempo real',
        color: '#E11D48'
      },
      {
        id: 'its07',
        code: 'ITS07',
        name: 'Neisseria gonorrhoeae',
        description: 'Detecta el agente bacteriano de las infecciones de transmisión sexual por gonorrea.',
        price: 1455,
        deliveryTime: '1 Día hábil',
        sample: 'Exudado vaginal/uretral',
        method: 'PCR en tiempo real',
        color: '#E11D48'
      },
      {
        id: 'its09',
        code: 'ITS09',
        name: 'Trichomonas vaginalis',
        description: 'Detecta el agente parasitario de las infecciones de transmisión sexual.',
        price: 1455,
        deliveryTime: '3 Días hábiles',
        sample: 'Exudado vaginal/uretral',
        method: 'PCR en tiempo real',
        color: '#E11D48'
      },
      {
        id: 'its05',
        code: 'ITS05',
        name: 'Panel de ITS 2',
        description: 'Detecta Chlamydia trachomatis y Neisseria gonorrhoeae en una sola prueba.',
        price: 1455,
        deliveryTime: '1 Día hábil',
        sample: 'Exudado vaginal/uretral',
        method: 'PCR en tiempo real',
        color: '#E11D48',
        isPanel: true,
        includes: ['Chlamydia trachomatis', 'Neisseria gonorrhoeae']
      },
      {
        id: 'its03',
        code: 'ITS03',
        name: 'Panel de ITS 4',
        description: 'Detecta y diferencia 4 agentes causales de ITS.',
        price: 1600,
        deliveryTime: '3 Días hábiles',
        sample: 'Exudado vaginal/uretral',
        method: 'PCR en tiempo real',
        color: '#E11D48',
        isPanel: true,
        includes: ['Chlamydia trachomatis', 'Neisseria gonorrhoeae', 'Trichomonas vaginalis', 'Mycoplasma genitalum']
      },
      {
        id: 'its04',
        code: 'ITS04',
        name: 'Panel de ITS 7',
        description: 'Panel completo que detecta y diferencia 7 agentes causales de ITS.',
        price: 1725,
        deliveryTime: '5 Días hábiles',
        sample: 'Exudado vaginal/uretral',
        method: 'PCR en tiempo real',
        color: '#E11D48',
        isPanel: true,
        popular: true,
        includes: ['Chlamydia trachomatis', 'Mycoplasma genitalium', 'Mycoplasma hominis', 'Neisseria gonorrhoeae', 'Trichomonas vaginalis', 'Ureaplasma parvum', 'Ureaplasma urealyticum']
      },
      {
        id: 'its08',
        code: 'ITS08',
        name: 'Panel de ITS Úlceras',
        description: 'Detecta 7 agentes causales de úlceras genitales incluyendo Herpes y Sífilis.',
        price: 1725,
        deliveryTime: '5 Días hábiles',
        sample: 'Exudado vaginal/uretral',
        method: 'PCR en tiempo real',
        color: '#E11D48',
        isPanel: true,
        includes: ['HSV-1', 'HSV-2', 'Haemophilus ducreyi', 'CMV', 'LGV', 'Treponema pallidum', 'VZV']
      }
    ],
    respiratorio: [
      {
        id: 'cov06',
        code: 'COV06',
        name: 'SARS-CoV-2',
        description: 'Detecta el ARN del virus SARS-CoV-2 causante de COVID-19. Diagnóstico confirmatorio.',
        price: 1212,
        deliveryTime: '1 Día hábil',
        sample: 'Exudado nasofaríngeo',
        method: 'PCR en tiempo real',
        color: '#0EA5E9',
        popular: true
      },
      {
        id: 'flu07',
        code: 'FLU07',
        name: 'Influenza A/B',
        description: 'Detecta el ARN de los virus de influenza tipo A y B. Diagnóstico confirmatorio.',
        price: 1212,
        deliveryTime: '1 Día hábil',
        sample: 'Exudado nasofaríngeo',
        method: 'PCR en tiempo real',
        color: '#0EA5E9'
      },
      {
        id: 'vsr08',
        code: 'VSR08',
        name: 'Virus Respiratorio Sincicial',
        description: 'Detecta el VRS, virus más común que causa infecciones respiratorias en bebés y niños pequeños.',
        price: 1212,
        deliveryTime: '1 Día hábil',
        sample: 'Exudado nasofaríngeo',
        method: 'PCR en tiempo real',
        color: '#0EA5E9'
      },
      {
        id: 'pnr43',
        code: 'PNR43',
        name: 'Panel Neumonía Plus',
        description: 'Detecta 33 patógenos respiratorios: 8 virus, 15 bacterias comunes, 3 atípicas y 7 genes de resistencia.',
        price: 9333,
        deliveryTime: '4 Horas',
        sample: 'Muestra respiratoria',
        method: 'PCR anidada',
        color: '#0EA5E9',
        isPanel: true,
        popular: true,
        includes: ['Coronavirus', 'Influenza A/B', 'Parainfluenza', 'RSV', 'Adenovirus', 'S. pneumoniae', 'K. pneumoniae', 'P. aeruginosa', 'S. aureus', '+ 24 más']
      }
    ],
    virologia: [
      {
        id: 'vih03',
        code: 'VIH03',
        name: 'Carga Viral de VIH',
        description: 'Cuantifica el número de copias del VIH por mililitro para monitorear pronóstico y respuesta al tratamiento.',
        price: 2182,
        deliveryTime: '3 Días hábiles',
        sample: 'Sangre total con EDTA',
        method: 'PCR en tiempo real',
        color: '#8B5CF6',
        popular: true
      },
      {
        id: 'hep31',
        code: 'HEP31',
        name: 'Carga Viral Hepatitis B',
        description: 'Cuantifica el ADN del virus de Hepatitis B para monitorear la enfermedad y tratamiento.',
        price: 2182,
        deliveryTime: '3 Días hábiles',
        sample: 'Suero/Plasma',
        method: 'PCR en tiempo real',
        color: '#8B5CF6'
      },
      {
        id: 'hep33',
        code: 'HEP33',
        name: 'Carga Viral Hepatitis C',
        description: 'Cuantifica el ARN del virus de Hepatitis C para diagnóstico y seguimiento del tratamiento.',
        price: 2424,
        deliveryTime: '3 Días hábiles',
        sample: 'Suero/Plasma',
        method: 'PCR en tiempo real',
        color: '#8B5CF6'
      },
      {
        id: 'cmv21',
        code: 'CMV21',
        name: 'Citomegalovirus (CMV)',
        description: 'Detecta ADN del CMV. Importante en pacientes trasplantados e inmunodeprimidos.',
        price: 3200,
        deliveryTime: '3 Días hábiles',
        sample: 'Sangre total con EDTA',
        method: 'PCR en tiempo real',
        color: '#8B5CF6'
      },
      {
        id: 'ebv22',
        code: 'EBV22',
        name: 'Epstein-Barr (EBV)',
        description: 'Detecta ADN del virus Epstein-Barr causante de mononucleosis infecciosa.',
        price: 3200,
        deliveryTime: '3 Días hábiles',
        sample: 'Sangre total con EDTA',
        method: 'PCR en tiempo real',
        color: '#8B5CF6'
      }
    ],
    gastrointestinal: [
      {
        id: 'hpl22',
        code: 'HPL22',
        name: 'H. pylori + Resistencia Claritromicina',
        description: 'Detecta Helicobacter pylori y mutaciones de resistencia a claritromicina.',
        price: 853,
        deliveryTime: '5 Días hábiles',
        sample: 'Heces',
        method: 'PCR en tiempo real',
        color: '#F59E0B',
        popular: true
      },
      {
        id: 'pgi15',
        code: 'PGI15',
        name: 'Panel Gastrointestinal',
        description: 'Detecta 22 patógenos: bacterias, virus y parásitos causantes de infección gastrointestinal.',
        price: 7091,
        deliveryTime: '4 Horas',
        sample: 'Heces',
        method: 'PCR anidada',
        color: '#F59E0B',
        isPanel: true,
        popular: true,
        includes: ['Salmonella', 'Shigella', 'E. coli', 'Campylobacter', 'Norovirus', 'Rotavirus', 'Giardia', 'Cryptosporidium', '+ 14 más']
      }
    ],
    tuberculosis: [
      {
        id: 'mtb09',
        code: 'MTB09',
        name: 'Mycobacterium tuberculosis',
        description: 'Detecta M. tuberculosis y su resistencia a isoniazida y rifampicina (primera línea).',
        price: 2121,
        deliveryTime: '3 Días hábiles',
        sample: 'Expectoración/Fluidos/Tejidos',
        method: 'PCR en tiempo real',
        color: '#10B981',
        popular: true
      },
      {
        id: 'rtb10',
        code: 'RTB10',
        name: 'M. tuberculosis + Genes Resistencia',
        description: 'Detecta tuberculosis con resistencia a fármacos de primera y segunda línea (fluoroquinolonas, inyectables).',
        price: 3031,
        deliveryTime: '5 Días hábiles',
        sample: 'Expectoración/Fluidos/Tejidos',
        method: 'PCR en tiempo real',
        color: '#10B981',
        isPanel: true
      }
    ],
    oncologia: [
      {
        id: 'bcr01',
        code: 'BCR01',
        name: 'BCR/ABL1 Cualitativo',
        description: 'Detecta el gen de fusión BCR/ABL1 asociado a leucemia mieloide crónica.',
        price: 3394,
        deliveryTime: '5 Días hábiles',
        sample: 'Sangre total con EDTA',
        method: 'PCR en tiempo real',
        color: '#EC4899'
      },
      {
        id: 'bcr02',
        code: 'BCR02',
        name: 'BCR/ABL1 Cuantitativo',
        description: 'Cuantifica el gen BCR/ABL1 para monitoreo de respuesta al tratamiento.',
        price: 6545,
        deliveryTime: '5 Días hábiles',
        sample: 'Sangre total con EDTA',
        method: 'PCR en tiempo real',
        color: '#EC4899',
        popular: true
      },
      {
        id: 'onc113',
        code: 'ONC113',
        name: 'Panel 113 Oncogenes',
        description: 'Panel completo de 113 genes relacionados con cáncer hereditario: mama, colon, ovario, gástrico.',
        price: 'Cotizar',
        deliveryTime: '15 Días hábiles',
        sample: 'Sangre total con EDTA',
        method: 'Secuenciación NGS',
        color: '#EC4899',
        isPanel: true,
        includes: ['BRCA1', 'BRCA2', 'TP53', 'APC', 'MLH1', 'MSH2', 'CDH1', 'PALB2', '+ 105 más']
      }
    ],
    trombosis: [
      {
        id: 'ptr24',
        code: 'PTR24',
        name: 'Panel de Trombosis',
        description: 'Detecta polimorfismos asociados a trombofilias: Factor V Leiden, Factor II y MTHFR.',
        price: 2508,
        deliveryTime: '5 Días hábiles',
        sample: 'Sangre total con EDTA',
        method: 'PCR en tiempo real',
        color: '#EF4444',
        popular: true,
        isPanel: true,
        includes: ['Factor V (R506Q, H1299R, Y1702C)', 'Factor II (G20210A)', 'MTHFR (C677T, A1298C)']
      }
    ]
  };

  const currentStudies = estudios[activeCategory] || [];
  const currentCategory = categorias.find(c => c.id === activeCategory);

  return (
    <section
      id="servicios-molecular"
      className="relative py-24 md:py-32 bg-gradient-to-b from-white to-blue-50 overflow-hidden scroll-mt-20"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #0047CB 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* DNA Decoration */}
      <div className="absolute top-20 right-0 w-64 h-64 opacity-5">
        <FaDna className="w-full h-full text-[#0047CB]" />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-6 md:px-12 lg:px-24">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-[#0047CB]/10 rounded-full mb-6">
            <FaDna className="w-5 h-5 text-[#0047CB]" />
            <span className="text-[#0047CB] font-semibold"
                  style={{ fontFamily: "'Poppins', sans-serif" }}>
              BIOLOGÍA MOLECULAR
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 mb-6"
              style={{ fontFamily: "'Poppins', sans-serif" }}>
            Catálogo de Estudios
          </h2>

          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-6"
             style={{ fontFamily: "'Poppins', sans-serif" }}>
            Diagnóstico molecular de alta precisión con tecnología PCR en tiempo real.
            <span className="block mt-2 font-medium text-[#0047CB]">
              Certificación ISO 9001:2015 avalada por Global Standards
            </span>
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100">
              <FaMicroscope className="w-5 h-5 text-[#0047CB]" />
              <span className="text-sm font-medium text-gray-700">PCR Tiempo Real</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100">
              <FaClock className="w-5 h-5 text-[#0047CB]" />
              <span className="text-sm font-medium text-gray-700">Resultados en 1-5 días</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100">
              <FaShieldAlt className="w-5 h-5 text-[#0047CB]" />
              <span className="text-sm font-medium text-gray-700">ISO 9001:2015</span>
            </div>
          </div>
        </motion.div>

        {/* Category Tabs */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex flex-wrap justify-center gap-2 bg-gray-100 rounded-2xl p-2">
            {categorias.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-300 ${
                    activeCategory === cat.id
                      ? 'bg-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    color: activeCategory === cat.id ? cat.color : undefined
                  }}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Studies Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {currentStudies.map((study, index) => (
              <motion.div
                key={study.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className={`group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-2 ${
                  study.popular ? 'border-[#0047CB]' : 'border-gray-100'
                }`}
              >
                {/* Popular Badge */}
                {study.popular && (
                  <div className="bg-[#0047CB] text-white text-xs font-semibold px-3 py-1 text-center"
                       style={{ fontFamily: "'Poppins', sans-serif" }}>
                    Popular
                  </div>
                )}

                {/* Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                           style={{ backgroundColor: `${study.color}15` }}>
                        {study.isPanel ? (
                          <FaVial className="w-6 h-6" style={{ color: study.color }} />
                        ) : (
                          <FaDna className="w-6 h-6" style={{ color: study.color }} />
                        )}
                      </div>
                      <div>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded"
                              style={{ fontFamily: "'Poppins', sans-serif" }}>
                          {study.code}
                        </span>
                        {study.isPanel && (
                          <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded"
                                style={{
                                  backgroundColor: `${study.color}20`,
                                  color: study.color,
                                  fontFamily: "'Poppins', sans-serif"
                                }}>
                            Panel
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-xl font-bold"
                          style={{ color: study.color, fontFamily: "'Poppins', sans-serif" }}>
                      {typeof study.price === 'number'
                        ? `$${study.price.toLocaleString()}`
                        : study.price}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2"
                      style={{ fontFamily: "'Poppins', sans-serif" }}>
                    {study.name}
                  </h3>

                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-2"
                     style={{ fontFamily: "'Poppins', sans-serif" }}>
                    {study.description}
                  </p>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <FaClock className="w-4 h-4" />
                      <span style={{ fontFamily: "'Poppins', sans-serif" }}>
                        {study.deliveryTime}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded"
                          style={{ fontFamily: "'Poppins', sans-serif" }}>
                      {study.method}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500"
                          style={{ fontFamily: "'Poppins', sans-serif" }}>
                      {study.sample}
                    </span>
                    {(study.isPanel || study.includes) && (
                      <button
                        onClick={() => setExpandedStudy(expandedStudy === study.id ? null : study.id)}
                        className="flex items-center gap-1 text-xs font-medium"
                        style={{ color: study.color, fontFamily: "'Poppins', sans-serif" }}
                      >
                        Ver incluye
                        {expandedStudy === study.id ? <FaChevronUp className="w-3 h-3" /> : <FaChevronDown className="w-3 h-3" />}
                      </button>
                    )}
                  </div>

                  <AnimatePresence>
                    {expandedStudy === study.id && study.includes && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-4 pt-4 border-t border-gray-200"
                      >
                        <p className="text-xs text-gray-500 mb-2 font-medium"
                           style={{ fontFamily: "'Poppins', sans-serif" }}>
                          Incluye:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {study.includes.map((item, idx) => (
                            <span key={idx}
                                  className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                                  style={{
                                    backgroundColor: `${study.color}10`,
                                    color: study.color,
                                    fontFamily: "'Poppins', sans-serif"
                                  }}>
                              <FaCheckCircle className="w-2.5 h-2.5" />
                              {item}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-16 bg-gradient-to-r from-[#0047CB] to-[#003d99] rounded-2xl p-8 md:p-12"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-semibold text-white mb-3"
                  style={{ fontFamily: "'Poppins', sans-serif" }}>
                Resultados Confiables y Oportunos
              </h3>
              <p className="text-white/80"
                 style={{ fontFamily: "'Poppins', sans-serif" }}>
                Tecnología de punta en biología molecular. Contáctanos para cotizaciones especiales.
              </p>
            </div>
            <a
              href="/dimogen#contacto"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = '/dimogen#contacto';
              }}
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-[#0047CB] rounded-xl
                       font-semibold text-base hover:bg-gray-100 transition-all duration-300 shadow-lg"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              <FaFileInvoiceDollar className="w-5 h-5" />
              Solicitar Cotización
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ServiciosMolecularSection;
