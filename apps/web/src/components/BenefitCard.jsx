/**
 * BenefitCard Component - Tarjetas de beneficios institucionales
 *
 * Diseño homogéneo para la sección "¿Por qué elegirnos?"
 * Sigue lineamientos de branding institucional
 */

import { motion } from 'framer-motion';
import { cardVariants } from '../utils/animations';

const BenefitCard = ({ icon: IconComponent, titulo, descripcion, destacado = false }) => {
  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      className={`
        p-8 md:p-10 rounded-3xl
        flex flex-col items-center text-center
        transition-all duration-300
        ${destacado
          ? 'bg-gradient-to-br from-eg-purple to-eg-pink text-white border-0 shadow-2xl'
          : 'bg-white border-2 border-eg-purple/20 hover:border-eg-purple/40 shadow-lg hover:shadow-2xl'
        }
      `}
    >
      {/* Icono */}
      <div className={`mb-6 transform group-hover:scale-110 transition-transform duration-300`}>
        {IconComponent && (
          <IconComponent
            size="4xl"
            color={destacado ? 'white' : 'primary'}
            className="drop-shadow-lg"
          />
        )}
      </div>

      {/* Título */}
      <h3 className={`
        text-2xl md:text-3xl font-normal mb-3 leading-tight
        ${destacado ? 'text-white' : 'text-eg-purple'}
      `}>
        {titulo}
      </h3>

      {/* Descripción */}
      <p className={`
        text-lg md:text-xl font-normal leading-relaxed
        ${destacado ? 'text-white/95' : 'text-eg-dark'}
      `}>
        {descripcion}
      </p>
    </motion.div>
  );
};

export default BenefitCard;
