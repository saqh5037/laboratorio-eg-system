import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaFlask, FaVial, FaMicroscope, FaDna, FaHeartbeat, FaBaby, FaArrowRight, FaCheckCircle, FaClock } from 'react-icons/fa';

const StudiesSection = () => {
  const [activeCategory, setActiveCategory] = useState('populares');

  const categories = [
    { id: 'populares', name: 'Más Populares', icon: '⭐' },
    { id: 'perfiles', name: 'Perfiles Completos', icon: '📋' },
    { id: 'hematologia', name: 'Hematología', icon: '🩸' },
    { id: 'quimica', name: 'Química Sanguínea', icon: '🧪' },
    { id: 'inmunologia', name: 'Inmunología', icon: '🦠' },
    { id: 'endocrinologia', name: 'Endocrinología', icon: '💉' }
  ];

  const studies = {
    populares: [
      {
        id: 1,
        name: 'Hemograma Completo',
        description: 'Análisis completo de células sanguíneas',
        price: 180,
        oldPrice: 240,
        discount: '25%',
        turnaround: '24 horas',
        includes: ['Glóbulos rojos', 'Glóbulos blancos', 'Plaquetas', 'Hemoglobina'],
        color: 'from-purple-500 to-pink-500',
        icon: FaVial
      },
      {
        id: 2,
        name: 'Perfil Lipídico',
        description: 'Evaluación completa del colesterol',
        price: 250,
        oldPrice: 320,
        discount: '22%',
        turnaround: '24 horas',
        includes: ['Colesterol total', 'HDL', 'LDL', 'Triglicéridos'],
        color: 'from-blue-500 to-cyan-500',
        icon: FaFlask
      },
      {
        id: 3,
        name: 'Glicemia',
        description: 'Medición de glucosa en sangre',
        price: 120,
        oldPrice: 150,
        discount: '20%',
        turnaround: '2 horas',
        includes: ['Glucosa en ayunas', 'Interpretación médica'],
        color: 'from-green-500 to-emerald-500',
        icon: FaMicroscope
      },
      {
        id: 4,
        name: 'Perfil Tiroideo',
        description: 'Evaluación de función tiroidea',
        price: 380,
        oldPrice: 480,
        discount: '21%',
        turnaround: '48 horas',
        includes: ['TSH', 'T3', 'T4', 'T3 y T4 libres'],
        color: 'from-orange-500 to-red-500',
        icon: FaDna
      }
    ],
    perfiles: [
      {
        id: 5,
        name: 'Check-up Ejecutivo',
        description: 'Evaluación integral de salud',
        price: 999,
        oldPrice: 1500,
        discount: '33%',
        turnaround: '48 horas',
        includes: ['40+ estudios', 'Electrocardiograma', 'Radiografía', 'Consulta médica'],
        color: 'from-purple-600 to-pink-600',
        icon: FaHeartbeat,
        featured: true
      },
      {
        id: 6,
        name: 'Perfil Prenatal',
        description: 'Control completo del embarazo',
        price: 750,
        oldPrice: 1000,
        discount: '25%',
        turnaround: '48 horas',
        includes: ['Hemograma', 'Grupo sanguíneo', 'VDRL', 'HIV', 'Toxoplasma'],
        color: 'from-pink-500 to-rose-500',
        icon: FaBaby,
        featured: true
      }
    ],
    hematologia: [
      {
        id: 7,
        name: 'Tiempo de Coagulación',
        description: 'Evaluación de coagulación sanguínea',
        price: 150,
        oldPrice: 200,
        discount: '25%',
        turnaround: '24 horas',
        includes: ['PT', 'PTT', 'INR'],
        color: 'from-red-500 to-pink-500',
        icon: FaVial
      }
    ]
  };

  const currentStudies = studies[activeCategory] || studies.populares;

  return (
    <section id="servicios" className="py-20 bg-gradient-to-b from-white to-eg-light-gray">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-eg-purple/10 rounded-full mb-4">
            <FaFlask className="text-eg-purple" />
            <span className="text-eg-purple font-medium">Nuestros Estudios</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-eg-dark mb-4">
            Estudios de <span className="text-eg-purple">Laboratorio</span>
          </h2>
          <p className="text-lg text-eg-gray max-w-2xl mx-auto">
            Más de 200 estudios disponibles con la más alta tecnología y precisión.
            Resultados confiables respaldados por 43 años de experiencia.
          </p>
        </motion.div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <motion.button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                activeCategory === category.id
                  ? 'bg-gradient-to-r from-eg-purple to-eg-pink text-white shadow-lg'
                  : 'bg-white text-eg-dark hover:shadow-md border border-gray-200'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </motion.button>
          ))}
        </div>

        {/* Studies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {currentStudies.map((study, index) => (
            <motion.div
              key={study.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className={`bg-white rounded-2xl shadow-lg overflow-hidden ${
                study.featured ? 'md:col-span-2 lg:row-span-2' : ''
              }`}
            >
              {/* Card Header with Gradient */}
              <div className={`h-2 bg-gradient-to-r ${study.color}`} />
              
              <div className="p-6">
                {/* Icon and Discount Badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${study.color} flex items-center justify-center text-white`}>
                    <study.icon size={20} />
                  </div>
                  {study.discount && (
                    <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-bold">
                      -{study.discount}
                    </span>
                  )}
                </div>

                {/* Study Info */}
                <h3 className="text-xl font-bold text-eg-dark mb-2">
                  {study.name}
                </h3>
                <p className="text-eg-gray text-sm mb-4">
                  {study.description}
                </p>

                {/* Includes List */}
                <div className="space-y-2 mb-4">
                  {study.includes.slice(0, study.featured ? 4 : 2).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <FaCheckCircle className="text-green-500 flex-shrink-0" size={12} />
                      <span className="text-eg-dark">{item}</span>
                    </div>
                  ))}
                  {study.includes.length > (study.featured ? 4 : 2) && (
                    <span className="text-sm text-eg-purple font-medium">
                      +{study.includes.length - (study.featured ? 4 : 2)} más
                    </span>
                  )}
                </div>

                {/* Turnaround Time */}
                <div className="flex items-center gap-2 text-sm text-eg-gray mb-4">
                  <FaClock className="text-eg-purple" />
                  <span>Resultados en {study.turnaround}</span>
                </div>

                {/* Price and CTA */}
                <div className="border-t pt-4">
                  <div className="flex items-end justify-between mb-4">
                    <div>
                      <span className="text-2xl font-bold text-eg-purple">
                        Bs. {study.price}
                      </span>
                      {study.oldPrice && (
                        <span className="text-sm text-gray-400 line-through ml-2">
                          Bs. {study.oldPrice}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <Link
                    to="/contacto"
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-eg-purple to-eg-pink text-white rounded-xl font-medium hover:shadow-lg transition-all group"
                  >
                    Solicitar Estudio
                    <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Studies CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link
            to="/estudios"
            className="inline-flex items-center gap-3 px-8 py-4 bg-white border-2 border-eg-purple text-eg-purple rounded-full font-bold hover:bg-eg-purple hover:text-white transition-all group"
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

export default StudiesSection;