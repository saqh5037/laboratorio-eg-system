import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaFlask, FaClock, FaCheckCircle, FaArrowRight } from 'react-icons/fa';

const StudiesSectionEG = () => {
  const [activeCategory, setActiveCategory] = useState('populares');

  const categories = [
    { id: 'populares', name: 'Más Populares', icon: '⭐' },
    { id: 'perfiles', name: 'Perfiles Completos', icon: '📋' },
    { id: 'hematologia', name: 'Hematología', icon: '🩸' },
    { id: 'quimica', name: 'Química Sanguínea', icon: '🧪' },
    { id: 'inmunologia', name: 'Inmunología', icon: '🦠' },
    { id: 'endocrinologia', name: 'Endocrinología', icon: '💉' }
  ];

  const getAreaColor = (area) => {
    const colors = {
      'Hematología': 'bg-red-50 text-red-700 border-red-200',
      'Química': 'bg-blue-50 text-blue-700 border-blue-200',
      'Microbiología': 'bg-green-50 text-green-700 border-green-200',
      'Inmunología': 'bg-purple-50 text-purple-700 border-purple-200',
      'Hormonas': 'bg-pink-50 text-pink-700 border-pink-200',
      'Uroanálisis': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'Heces': 'bg-amber-50 text-amber-700 border-amber-200',
      'Especiales': 'bg-indigo-50 text-indigo-700 border-indigo-200'
    };
    return colors[area] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const studies = {
    populares: [
      {
        id: 1,
        name: 'Hemograma Completo',
        description: 'Análisis completo de células sanguíneas',
        price: 180,
        area: 'Hematología',
        turnaround: '24 horas',
        ayuno: true,
        nuevo: true,
        includes: ['Glóbulos rojos', 'Glóbulos blancos', 'Plaquetas', 'Hemoglobina']
      },
      {
        id: 2,
        name: 'Perfil Lipídico',
        description: 'Evaluación completa del colesterol y triglicéridos',
        price: 250,
        area: 'Química',
        turnaround: '24 horas',
        ayuno: true,
        includes: ['Colesterol total', 'HDL', 'LDL', 'Triglicéridos']
      },
      {
        id: 3,
        name: 'Glicemia',
        description: 'Medición de glucosa en sangre',
        price: 120,
        area: 'Química',
        turnaround: '2 horas',
        ayuno: true,
        includes: ['Glucosa en ayunas', 'Interpretación médica']
      },
      {
        id: 4,
        name: 'Perfil Tiroideo',
        description: 'Evaluación completa de la función tiroidea',
        price: 380,
        area: 'Hormonas',
        turnaround: '48 horas',
        ayuno: false,
        includes: ['TSH', 'T3', 'T4', 'T3 y T4 libres']
      }
    ],
    perfiles: [
      {
        id: 5,
        name: 'Check-up Ejecutivo',
        description: 'Evaluación integral de salud con más de 40 estudios',
        price: 999,
        area: 'Especiales',
        turnaround: '48 horas',
        ayuno: true,
        perfil: true,
        includes: ['40+ estudios', 'Electrocardiograma', 'Radiografía', 'Consulta médica']
      },
      {
        id: 6,
        name: 'Perfil Prenatal',
        description: 'Control completo para el embarazo',
        price: 750,
        area: 'Especiales',
        turnaround: '48 horas',
        ayuno: false,
        perfil: true,
        includes: ['Hemograma', 'Grupo sanguíneo', 'VDRL', 'HIV', 'Toxoplasma']
      }
    ]
  };

  const currentStudies = studies[activeCategory] || studies.populares;

  return (
    <section id="servicios" className="py-20 bg-gradient-to-b from-white to-eg-light-gray">
      <div className="container mx-auto px-4">
        {/* Header - Directorio Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-normal text-eg-purple mb-4">
            Nuestros Estudios
          </h2>
          <p className="text-lg text-eg-gray max-w-3xl mx-auto">
            Más de 200 estudios disponibles con la más alta tecnología y precisión
          </p>
        </motion.div>

        {/* Category Tabs - Directorio Style */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <motion.button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-3 rounded-lg font-normal transition-all ${
                activeCategory === category.id
                  ? 'bg-eg-purple text-white shadow-[0_4px_12px_rgba(123,104,166,0.3)]'
                  : 'bg-white text-eg-gray border border-gray-200 hover:border-eg-purple hover:shadow-[0_4px_12px_rgba(123,104,166,0.1)]'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </motion.button>
          ))}
        </div>

        {/* Studies Grid - Directorio Style Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentStudies.map((study, index) => (
            <motion.div
              key={study.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative bg-white rounded-xl border border-gray-100 
                        shadow-[0_4px_12px_rgba(123,104,166,0.1)] 
                        hover:shadow-[0_8px_24px_rgba(123,104,166,0.15)]
                        transition-all duration-300 hover:-translate-y-1
                        overflow-hidden cursor-pointer"
            >
              {/* Gradient Border on Hover */}
              <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-eg-purple to-eg-pink 
                            opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Ayuno Indicator */}
              {study.ayuno && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 to-orange-500" />
              )}

              <div className="p-6">
                {/* Badges */}
                <div className="flex gap-2 mb-3">
                  {study.nuevo && (
                    <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full shadow-lg animate-pulse">
                      NUEVO
                    </span>
                  )}
                  {study.perfil && (
                    <span className="px-2 py-1 bg-eg-pink text-eg-purple text-xs font-medium rounded-full shadow-md">
                      PERFIL
                    </span>
                  )}
                </div>

                {/* Study Name */}
                <h3 className="text-lg font-medium text-eg-dark mb-2 group-hover:text-eg-purple transition-colors">
                  {study.name}
                </h3>

                {/* Description */}
                <p className="text-sm text-eg-gray mb-3 line-clamp-2">
                  {study.description}
                </p>

                {/* Area Badge */}
                <div className="mb-3">
                  <span className={`inline-block px-3 py-1 text-xs rounded-full border ${getAreaColor(study.area)}`}>
                    {study.area}
                  </span>
                </div>

                {/* Includes */}
                {study.includes && (
                  <div className="mb-4">
                    <div className="space-y-1">
                      {study.includes.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-eg-gray">
                          <FaCheckCircle className="text-green-500 flex-shrink-0" size={10} />
                          <span>{item}</span>
                        </div>
                      ))}
                      {study.includes.length > 2 && (
                        <span className="text-xs text-eg-purple">
                          +{study.includes.length - 2} más
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Turnaround Time */}
                <div className="flex items-center gap-2 text-xs text-eg-gray mb-4">
                  <FaClock className="text-eg-purple" />
                  <span>Resultados en {study.turnaround}</span>
                </div>

                {/* Price and Action */}
                <div className="flex items-end justify-between pt-3 border-t border-gray-100">
                  <div>
                    <span className="text-xs text-eg-gray">Desde</span>
                    <div className="text-xl font-medium text-eg-purple">
                      Bs. {study.price}
                    </div>
                  </div>
                  <Link
                    to="/contacto"
                    className="flex items-center gap-1 px-3 py-2 bg-eg-purple text-white text-sm rounded-lg
                             hover:bg-eg-purple/90 transition-all group/btn"
                  >
                    Solicitar
                    <FaArrowRight className="text-xs group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All CTA - Directorio Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            to="/estudios"
            className="inline-flex items-center gap-3 px-8 py-3 bg-white border-2 border-eg-purple 
                     text-eg-purple rounded-lg font-normal hover:bg-eg-purple hover:text-white 
                     transition-all shadow-[0_4px_12px_rgba(123,104,166,0.1)] 
                     hover:shadow-[0_8px_24px_rgba(123,104,166,0.2)] group"
          >
            <FaFlask />
            Ver Todos los Estudios
            <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default StudiesSectionEG;