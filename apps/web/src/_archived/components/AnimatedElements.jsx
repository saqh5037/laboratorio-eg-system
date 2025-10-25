import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { 
  staggerContainer, 
  staggerItem, 
  slideUpVariants, 
  slideLeftVariants, 
  slideRightVariants,
  viewportConfig 
} from '../utils/animations';

// Container genérico para animaciones en cascada
export const StaggerContainer = ({ 
  children, 
  className = "",
  delay = 0,
  staggerDelay = 0.1 
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, viewportConfig);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delay
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "show" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Item individual para cascada
export const StaggerItem = ({ 
  children, 
  className = "",
  direction = "up" 
}) => {
  const variants = {
    up: staggerItem,
    left: slideLeftVariants,
    right: slideRightVariants
  };

  return (
    <motion.div
      variants={variants[direction]}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Card animada para estudios médicos
export const AnimatedStudyCard = ({ 
  study, 
  onClick,
  className = "",
  index = 0 
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, viewportConfig);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={isInView ? { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        transition: { 
          delay: index * 0.1,
          duration: 0.6,
          ease: [0.25, 0.46, 0.45, 0.94]
        }
      } : {}}
      whileHover={{ 
        y: -8, 
        scale: 1.02,
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
        transition: { duration: 0.3 }
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`bg-white rounded-xl shadow-lg p-6 cursor-pointer overflow-hidden relative ${className}`}
    >
      {/* Efecto de brillo hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0"
        whileHover={{ 
          opacity: 0.1,
          x: [-100, 400],
          transition: { duration: 0.6 }
        }}
      />

      {/* Contenido de la card */}
      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-start justify-between mb-4"
        >
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {study.name}
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              {study.description}
            </p>
          </div>
          
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="ml-4 p-2 bg-blue-50 rounded-lg"
          >
            <div className="w-6 h-6 bg-blue-500 rounded" />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-between"
        >
          <span className="text-xl font-bold text-blue-600">
            ${study.price}
          </span>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium"
          >
            Ver detalles
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

// Lista animada de elementos
export const AnimatedList = ({ 
  items, 
  renderItem, 
  className = "",
  direction = "up",
  staggerDelay = 0.1 
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, viewportConfig);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "show" : "hidden"}
      variants={staggerContainer}
      className={className}
    >
      {items.map((item, index) => (
        <StaggerItem key={item.id || index} direction={direction}>
          {renderItem(item, index)}
        </StaggerItem>
      ))}
    </motion.div>
  );
};

// Contador animado
export const AnimatedCounter = ({ 
  from = 0, 
  to, 
  duration = 2,
  className = "",
  suffix = "",
  prefix = "" 
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
    >
      {isInView && (
        <motion.span
          initial={{ textContent: from }}
          animate={{ textContent: to }}
          transition={{ duration, ease: "easeOut" }}
          onUpdate={(latest) => {
            if (ref.current) {
              ref.current.textContent = `${prefix}${Math.round(latest.textContent)}${suffix}`;
            }
          }}
        />
      )}
    </motion.span>
  );
};

// Texto con efecto typewriter
export const TypewriterText = ({ 
  text, 
  delay = 0,
  speed = 50,
  className = "" 
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ delay }}
    >
      {isInView && text.split("").map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ 
            delay: delay + (index * speed / 1000),
            duration: 0.1 
          }}
        >
          {char}
        </motion.span>
      ))}
    </motion.div>
  );
};

// Imagen con efecto reveal
export const ImageReveal = ({ 
  src, 
  alt, 
  className = "",
  direction = "bottom" 
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, viewportConfig);

  const directions = {
    bottom: { y: 100, x: 0 },
    top: { y: -100, x: 0 },
    left: { y: 0, x: -100 },
    right: { y: 0, x: 100 }
  };

  return (
    <motion.div
      ref={ref}
      className={`overflow-hidden ${className}`}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
    >
      <motion.img
        src={src}
        alt={alt}
        initial={directions[direction]}
        animate={isInView ? { y: 0, x: 0 } : {}}
        transition={{ 
          duration: 0.8,
          ease: [0.25, 0.46, 0.45, 0.94]
        }}
        className="w-full h-full object-cover"
      />
    </motion.div>
  );
};

// Progress bar animado
export const AnimatedProgressBar = ({ 
  percentage, 
  label,
  color = "blue",
  className = "" 
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const colors = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    red: "bg-red-500",
    yellow: "bg-yellow-500"
  };

  return (
    <div ref={ref} className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-sm text-gray-500">{percentage}%</span>
        </div>
      )}
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <motion.div
          className={`h-2 rounded-full ${colors[color]}`}
          initial={{ width: 0 }}
          animate={isInView ? { width: `${percentage}%` } : {}}
          transition={{ 
            duration: 1.5,
            ease: "easeOut",
            delay: 0.2
          }}
        />
      </div>
    </div>
  );
};

// Card flip animada
export const FlipCard = ({ 
  front, 
  back, 
  className = "",
  flipOnHover = true 
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <motion.div
      className={`relative w-full h-64 cursor-pointer ${className}`}
      onHoverStart={() => flipOnHover && setIsFlipped(true)}
      onHoverEnd={() => flipOnHover && setIsFlipped(false)}
      onClick={() => !flipOnHover && setIsFlipped(!isFlipped)}
      style={{ perspective: 1000 }}
    >
      {/* Front */}
      <motion.div
        className="absolute inset-0 w-full h-full backface-hidden"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        style={{ backfaceVisibility: 'hidden' }}
      >
        {front}
      </motion.div>

      {/* Back */}
      <motion.div
        className="absolute inset-0 w-full h-full backface-hidden"
        initial={{ rotateY: 180 }}
        animate={{ rotateY: isFlipped ? 0 : 180 }}
        transition={{ duration: 0.6 }}
        style={{ backfaceVisibility: 'hidden' }}
      >
        {back}
      </motion.div>
    </motion.div>
  );
};

// Floating elements
export const FloatingElement = ({ 
  children,
  amplitude = 10,
  duration = 4,
  delay = 0,
  className = "" 
}) => {
  return (
    <motion.div
      className={className}
      animate={{
        y: [0, -amplitude, 0],
        transition: {
          duration,
          repeat: Infinity,
          ease: "easeInOut",
          delay
        }
      }}
    >
      {children}
    </motion.div>
  );
};

// Magnetic button effect
export const MagneticButton = ({ 
  children, 
  strength = 0.3,
  className = "",
  ...props 
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;
    
    setPosition({ x: deltaX, y: deltaY });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.button
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={position}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default {
  StaggerContainer,
  StaggerItem,
  AnimatedStudyCard,
  AnimatedList,
  AnimatedCounter,
  TypewriterText,
  ImageReveal,
  AnimatedProgressBar,
  FlipCard,
  FloatingElement,
  MagneticButton
};