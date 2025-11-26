import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaLeaf,
  FaFlask,
  FaBacterium,
  FaCheckCircle,
  FaClock,
  FaThermometerHalf,
  FaClipboardList,
  FaFileInvoiceDollar,
  FaArrowRight,
  FaChevronDown,
  FaChevronUp,
  FaCertificate,
  FaIndustry,
  FaHotel,
  FaHospital,
  FaSchool
} from 'react-icons/fa';

/**
 * ServiciosAlimentosSection Component
 * Catálogo completo de servicios de Microbiología de Alimentos
 * Basado en el catálogo PDF de Dimogen
 */
const ServiciosAlimentosSection = ({ section, content }) => {
  const [expandedService, setExpandedService] = useState(null);
  const [activeTab, setActiveTab] = useState('individual');

  // Servicios individuales
  const serviciosIndividuales = [
    {
      id: 'oma',
      code: 'OMA01',
      name: 'Organismos Mesofílicos Aerobios',
      norm: 'NOM-092-SSA1-1994',
      description: 'Evaluar la calidad microbiológica de alimentos, agua y otros productos. Ayuda a identificar posibles problemas de higiene, contaminación y deterioro.',
      price: 363.66,
      deliveryTime: '5 Días hábiles',
      samples: ['Agua', 'Alimento', 'Superficies vivas e inertes', 'Placas ambientales'],
      color: '#0047CB'
    },
    {
      id: 'hol',
      code: 'HOL02',
      name: 'Hongos y Levaduras',
      norm: 'NOM-111-SSA1-1994',
      description: 'Indicadores de prácticas sanitarias inadecuadas o materia prima de baja calidad. Productores de toxinas que causan enfermedades en humanos.',
      price: 363.66,
      deliveryTime: '8 Días hábiles',
      samples: ['Agua', 'Alimento', 'Superficies vivas e inertes', 'Placas ambientales'],
      color: '#00A3E0'
    },
    {
      id: 'col',
      code: 'COL03',
      name: 'Coliformes Totales (Vaciado en placa)',
      norm: 'NOM-113-SSA1-1994',
      description: 'Indicador de prácticas higiénicas inadecuadas, mala higiene en la manipulación o procesamiento, limpieza inadecuada o condiciones insalubres.',
      price: 363.66,
      deliveryTime: '3 Días hábiles',
      samples: ['Agua', 'Alimento', 'Superficies vivas e inertes'],
      color: '#98CB59'
    },
    {
      id: 'sal',
      code: 'SAL04',
      name: 'Detección de Salmonella Spp.',
      norm: 'NOM-210-SSA1-2014',
      description: 'La salmonelosis es una enfermedad transmitida por consumo de alimentos contaminados que causa diarrea, fiebre y dolor abdominal.',
      price: 818.23,
      deliveryTime: '10 Días hábiles',
      samples: ['Alimentos', 'Materia prima', 'Agua para consumo humano', 'Superficies vivas e inertes'],
      color: '#E11D48'
    },
    {
      id: 'sau',
      code: 'SAU05',
      name: 'Staphylococcus Aureus',
      norm: 'NOM-210-SSA1-2014',
      description: 'Bacteria que puede causar intoxicación alimentaria cuando se multiplica en alimentos mal almacenados o manipulados con malas prácticas de higiene.',
      price: 1054.61,
      deliveryTime: '10 Días hábiles',
      samples: ['Alimentos', 'Materia prima', 'Superficies vivas e inertes'],
      color: '#F59E0B'
    },
    {
      id: 'nmp',
      code: 'NMP06',
      name: 'Coliformes Totales, Fecales y E. coli (NMP)',
      norm: 'NOM-210-SSA1-2014',
      description: 'Indicadores de contaminación fecal. La presencia de E. coli puede causar enfermedades graves en humanos.',
      price: 606.00,
      deliveryTime: '10 Días hábiles',
      samples: ['Agua', 'Hielo', 'Alimentos'],
      color: '#8B5CF6'
    }
  ];

  // Paquetes
  const paquetes = [
    {
      id: 'paq1',
      code: 'PAQ01',
      name: 'Paquete I',
      price: 969.76,
      deliveryTime: '8 Días hábiles',
      savings: 121.22,
      includes: [
        'Organismos Mesofílicos Aerobios',
        'Hongos y Levaduras',
        'Coliformes Totales (Vaciado en placa)'
      ],
      recommended: false,
      color: '#0047CB'
    },
    {
      id: 'paq2',
      code: 'PAQ02',
      name: 'Paquete II',
      subtitle: 'Más completo',
      price: 2303.18,
      deliveryTime: '10 Días hábiles',
      savings: 660.64,
      includes: [
        'Organismos Mesofílicos Aerobios',
        'Hongos y Levaduras',
        'Coliformes Totales (Vaciado en placa)',
        'Salmonella spp',
        'Staphylococcus aureus'
      ],
      recommended: true,
      color: '#98CB59'
    }
  ];

  // Sectores que atendemos
  const sectores = [
    { icon: FaIndustry, name: 'Industria alimentaria' },
    { icon: FaHotel, name: 'Hoteles' },
    { icon: FaHospital, name: 'Hospitales' },
    { icon: FaSchool, name: 'Escuelas' }
  ];

  return (
    <section
      id="servicios-alimentos"
      className="relative py-24 md:py-32 bg-gradient-to-b from-gray-50 to-white overflow-hidden scroll-mt-20"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #98CB59 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-6 md:px-12 lg:px-24">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-[#98CB59]/10 rounded-full mb-6">
            <FaLeaf className="w-5 h-5 text-[#98CB59]" />
            <span className="text-[#98CB59] font-semibold"
                  style={{ fontFamily: "'Poppins', sans-serif" }}>
              MICROBIOLOGÍA DE ALIMENTOS
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-900 mb-6"
              style={{ fontFamily: "'Poppins', sans-serif" }}>
            Catálogo de Análisis
          </h2>

          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8"
             style={{ fontFamily: "'Poppins', sans-serif" }}>
            Detección de microorganismos en alimentos para garantizar la salud de los consumidores.
            <span className="block mt-2 font-medium text-[#98CB59]">
              Certificación ISO 9001:2015 avalada por Global Standards
            </span>
          </p>

          {/* Sectores */}
          <div className="flex flex-wrap justify-center gap-4">
            {sectores.map((sector, index) => {
              const Icon = sector.icon;
              return (
                <div key={index} className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100">
                  <Icon className="w-4 h-4 text-[#98CB59]" />
                  <span className="text-sm text-gray-700"
                        style={{ fontFamily: "'Poppins', sans-serif" }}>
                    {sector.name}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-gray-100 rounded-xl p-1.5">
            <button
              onClick={() => setActiveTab('individual')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeTab === 'individual'
                  ? 'bg-white text-[#98CB59] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              Análisis Individuales
            </button>
            <button
              onClick={() => setActiveTab('paquetes')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeTab === 'paquetes'
                  ? 'bg-white text-[#98CB59] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              Paquetes
            </button>
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'individual' ? (
            <motion.div
              key="individual"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {serviciosIndividuales.map((servicio, index) => (
                <motion.div
                  key={servicio.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  {/* Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                             style={{ backgroundColor: `${servicio.color}15` }}>
                          <FaFlask className="w-6 h-6" style={{ color: servicio.color }} />
                        </div>
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full"
                              style={{ fontFamily: "'Poppins', sans-serif" }}>
                          {servicio.code}
                        </span>
                      </div>
                      <span className="text-2xl font-bold"
                            style={{ color: servicio.color, fontFamily: "'Poppins', sans-serif" }}>
                        ${servicio.price.toLocaleString()}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2"
                        style={{ fontFamily: "'Poppins', sans-serif" }}>
                      {servicio.name}
                    </h3>

                    <p className="text-xs text-gray-500 mb-3"
                       style={{ fontFamily: "'Poppins', sans-serif" }}>
                      {servicio.norm}
                    </p>

                    <p className="text-sm text-gray-600 leading-relaxed"
                       style={{ fontFamily: "'Poppins', sans-serif" }}>
                      {servicio.description}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <FaClock className="w-4 h-4" />
                        <span style={{ fontFamily: "'Poppins', sans-serif" }}>
                          {servicio.deliveryTime}
                        </span>
                      </div>
                      <button
                        onClick={() => setExpandedService(expandedService === servicio.id ? null : servicio.id)}
                        className="flex items-center gap-1 text-sm font-medium"
                        style={{ color: servicio.color, fontFamily: "'Poppins', sans-serif" }}
                      >
                        Ver muestras
                        {expandedService === servicio.id ? <FaChevronUp className="w-3 h-3" /> : <FaChevronDown className="w-3 h-3" />}
                      </button>
                    </div>

                    <AnimatePresence>
                      {expandedService === servicio.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="mt-4 pt-4 border-t border-gray-200"
                        >
                          <p className="text-xs text-gray-500 mb-2 font-medium"
                             style={{ fontFamily: "'Poppins', sans-serif" }}>
                            Tipos de muestra:
                          </p>
                          <ul className="space-y-1">
                            {servicio.samples.map((sample, idx) => (
                              <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                                <FaCheckCircle className="w-3 h-3" style={{ color: servicio.color }} />
                                <span style={{ fontFamily: "'Poppins', sans-serif" }}>{sample}</span>
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="paquetes"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto"
            >
              {paquetes.map((paquete, index) => (
                <motion.div
                  key={paquete.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`relative bg-white rounded-3xl overflow-hidden shadow-xl border-2 transition-all duration-300 hover:scale-[1.02] ${
                    paquete.recommended ? 'border-[#98CB59]' : 'border-gray-100'
                  }`}
                >
                  {/* Recommended Badge */}
                  {paquete.recommended && (
                    <div className="absolute top-0 right-0 bg-[#98CB59] text-white px-4 py-1 text-sm font-medium rounded-bl-xl"
                         style={{ fontFamily: "'Poppins', sans-serif" }}>
                      Recomendado
                    </div>
                  )}

                  <div className="p-8">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <span className="text-sm text-gray-500"
                              style={{ fontFamily: "'Poppins', sans-serif" }}>
                          {paquete.code}
                        </span>
                        <h3 className="text-2xl font-bold text-gray-900"
                            style={{ fontFamily: "'Poppins', sans-serif" }}>
                          {paquete.name}
                        </h3>
                        {paquete.subtitle && (
                          <span className="text-sm font-medium" style={{ color: paquete.color }}>
                            {paquete.subtitle}
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-3xl font-bold"
                              style={{ color: paquete.color, fontFamily: "'Poppins', sans-serif" }}>
                          ${paquete.price.toLocaleString()}
                        </span>
                        <span className="block text-sm text-green-600 font-medium">
                          Ahorras ${paquete.savings.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Includes */}
                    <div className="mb-6">
                      <p className="text-sm text-gray-500 mb-3 font-medium"
                         style={{ fontFamily: "'Poppins', sans-serif" }}>
                        Incluye:
                      </p>
                      <ul className="space-y-2">
                        {paquete.includes.map((item, idx) => (
                          <li key={idx} className="flex items-center gap-3">
                            <FaCheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: paquete.color }} />
                            <span className="text-gray-700"
                                  style={{ fontFamily: "'Poppins', sans-serif" }}>
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Delivery Time */}
                    <div className="flex items-center gap-2 text-gray-600 mb-6">
                      <FaClock className="w-4 h-4" />
                      <span style={{ fontFamily: "'Poppins', sans-serif" }}>
                        Entrega: {paquete.deliveryTime}
                      </span>
                    </div>

                    {/* CTA */}
                    <button
                      className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                        paquete.recommended
                          ? 'bg-[#98CB59] text-white hover:bg-[#006644]'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      style={{ fontFamily: "'Poppins', sans-serif" }}
                    >
                      Solicitar cotización
                      <FaArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-16 bg-gradient-to-r from-[#98CB59] to-[#006644] rounded-2xl p-8 md:p-12"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-semibold text-white mb-3"
                  style={{ fontFamily: "'Poppins', sans-serif" }}>
                ¿Necesitas una cotización personalizada?
              </h3>
              <p className="text-white/80"
                 style={{ fontFamily: "'Poppins', sans-serif" }}>
                Contáctanos para análisis especiales o volúmenes mayores.
              </p>
            </div>
            <a
              href="/dimogen#contacto"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = '/dimogen#contacto';
              }}
              className="inline-flex items-center gap-3 px-8 py-4 bg-white text-[#98CB59] rounded-xl
                       font-semibold text-base hover:bg-gray-100 transition-all duration-300 shadow-lg"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              <FaFileInvoiceDollar className="w-5 h-5" />
              Cotiza con nosotros
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ServiciosAlimentosSection;
