import { motion } from 'framer-motion';
import { FaArrowRight } from 'react-icons/fa';
import { MedicalIcon } from './icons/IconWrapper';
import { cardVariants } from '../utils/animations';

/**
 * ServiceCard - Card de servicio/categoría principal
 *
 * Diseño:
 * - Iconografía homogénea (sistema unificado)
 * - Colores Pantone exclusivamente
 * - Hover effects sutiles y profesionales
 * - Touch targets accesibles
 */
const ServiceCard = ({ nombre, area, count, icon, onClick, className = '' }) => {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      whileHover="hover"
      viewport={{ once: true, amount: 0.3 }}
      onClick={onClick}
      className={`group relative bg-white rounded-2xl p-6 md:p-8
                border-2 border-eg-purple/20 hover:border-eg-purple/40
                transition-all duration-300 cursor-pointer
                text-center min-h-[200px] flex flex-col items-center justify-center
                ${className}`}
    >
      {/* Icono grande con animación en hover */}
      <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
        <MedicalIcon
          area={area || nombre}
          size="3xl"
          color="primary"
        />
      </div>

      {/* Título del servicio */}
      <h3 className="text-xl md:text-2xl font-normal text-eg-purple mb-2 group-hover:text-eg-pink transition-colors">
        {nombre}
      </h3>

      {/* Contador de estudios */}
      {count && (
        <p className="text-sm md:text-base font-normal text-eg-gray">
          {count} {count === 1 ? 'estudio' : 'estudios'}
        </p>
      )}

      {/* Flecha en hover (indicador visual de interactividad) */}
      <div className="absolute bottom-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <FaArrowRight className="w-5 h-5 text-eg-pink" />
      </div>

      {/* Sombra decorativa en hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-eg-purple/5 to-eg-pink/5
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
    </motion.div>
  );
};

export default ServiceCard;
