import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FaFlask, 
  FaVial, 
  FaMicroscope, 
  FaDna, 
  FaHeartbeat, 
  FaBaby,
  FaStethoscope,
  FaUserMd
} from 'react-icons/fa';

const CategoryMenu = () => {
  const categories = [
    {
      id: 'hematologia',
      name: 'Hematología',
      icon: FaVial,
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-700',
      description: 'Estudios de sangre'
    },
    {
      id: 'quimica',
      name: 'Química Sanguínea',
      icon: FaFlask,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      description: 'Análisis químicos'
    },
    {
      id: 'microbiologia',
      name: 'Microbiología',
      icon: FaMicroscope,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700',
      description: 'Cultivos y bacterias'
    },
    {
      id: 'inmunologia',
      name: 'Inmunología',
      icon: FaDna,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-700',
      description: 'Sistema inmune'
    },
    {
      id: 'hormonas',
      name: 'Endocrinología',
      icon: FaHeartbeat,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200',
      textColor: 'text-pink-700',
      description: 'Perfil hormonal'
    },
    {
      id: 'perfiles',
      name: 'Perfiles Completos',
      icon: FaUserMd,
      color: 'from-eg-purple to-eg-pink',
      bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50',
      borderColor: 'border-eg-purple',
      textColor: 'text-eg-purple',
      description: 'Check-ups integrales'
    }
  ];

  return (
    <section className="py-12 bg-gradient-to-b from-white to-eg-light-gray">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-normal text-eg-purple mb-2">
            Explora Nuestros Servicios
          </h2>
          <p className="text-eg-gray">
            Selecciona una categoría para ver los estudios disponibles
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={`/estudios/${category.id}`}
                className="group block"
              >
                <div className={`relative ${category.bgColor} ${category.borderColor} border rounded-xl p-6 
                               text-center transition-all duration-300 
                               hover:shadow-[0_8px_24px_rgba(123,104,166,0.15)] 
                               hover:-translate-y-1 overflow-hidden`}>
                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 
                                 group-hover:opacity-10 transition-opacity duration-300`} />
                  
                  {/* Icon */}
                  <div className={`relative w-12 h-12 mx-auto mb-3 rounded-full 
                                 bg-gradient-to-br ${category.color} 
                                 flex items-center justify-center 
                                 shadow-[0_4px_12px_rgba(0,0,0,0.1)]
                                 group-hover:scale-110 transition-transform`}>
                    <category.icon className="text-white text-xl" />
                  </div>
                  
                  {/* Text */}
                  <h3 className={`font-medium text-sm ${category.textColor} mb-1`}>
                    {category.name}
                  </h3>
                  <p className="text-xs text-eg-gray">
                    {category.description}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex flex-wrap justify-center gap-6 text-center"
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl">✅</span>
            <span className="text-sm text-eg-gray">
              <span className="font-medium text-eg-purple">ISO 9001:2015</span> Certificado
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏥</span>
            <span className="text-sm text-eg-gray">
              <span className="font-medium text-eg-purple">+50,000</span> pacientes
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔬</span>
            <span className="text-sm text-eg-gray">
              <span className="font-medium text-eg-purple">+200</span> estudios
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">⏱️</span>
            <span className="text-sm text-eg-gray">
              Resultados <span className="font-medium text-eg-purple">mismo día</span>
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CategoryMenu;