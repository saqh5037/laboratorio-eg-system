import { motion } from 'framer-motion';
import { FaStar } from 'react-icons/fa';
import { scrollRevealVariants } from '../utils/animations';

/**
 * TestimonialCard - Testimonio de paciente (estilo Instagram story)
 *
 * Dise�o limpio y moderno inspirado en stories de Instagram:
 * - Avatar circular con gradiente Pantone
 * - Quote destacado
 * - Rating con estrellas (color Pantone)
 * - Informaci�n de fecha
 */
const TestimonialCard = ({
  nombre,
  testimonio,
  fecha,
  rating = 5,
  iniciales,
  avatarUrl,
  className = ''
}) => {
  // Generar iniciales si no se proporcionan
  const getIniciales = () => {
    if (iniciales) return iniciales;
    if (!nombre) return '??';
    const parts = nombre.split(' ');
    if (parts.length === 1) return nombre[0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <motion.div
      {...scrollRevealVariants.scaleIn}
      whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(123, 104, 166, 0.15)' }}
      className={`bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100
                max-w-md mx-auto hover:border-eg-purple/20 transition-all duration-300
                ${className}`}
    >
      {/* Header: Avatar + Info */}
      <div className="flex items-center gap-4 mb-6">
        {/* Avatar circular con gradiente Pantone */}
        {avatarUrl ? (
          <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-eg-purple/20">
            <img
              src={avatarUrl}
              alt={nombre}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-eg-purple to-eg-pink
                        flex items-center justify-center text-white text-xl font-normal
                        shadow-lg">
            {getIniciales()}
          </div>
        )}

        {/* Nombre y fecha */}
        <div className="flex-1">
          <div className="text-lg md:text-xl font-normal text-eg-dark">
            {nombre}
          </div>
          <div className="text-sm font-normal text-eg-gray mt-1">
            {fecha}
          </div>
        </div>
      </div>

      {/* Quote del testimonio */}
      <p className="text-base md:text-lg font-normal text-eg-dark leading-relaxed mb-6 italic">
        "{testimonio}"
      </p>

      {/* Rating con estrellas (Pantone pink) */}
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <FaStar
            key={i}
            className={`text-xl ${
              i < rating ? 'text-eg-pink' : 'text-gray-200'
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default TestimonialCard;
