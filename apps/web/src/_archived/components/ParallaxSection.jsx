import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { parallaxVariants } from '../utils/animations';

// Sección con efecto parallax sutil para hero
const ParallaxSection = ({ 
  children, 
  className = "",
  speed = 0.5,
  direction = "up",
  offset = 50 
}) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [
    direction === "up" ? offset : -offset,
    direction === "up" ? -offset : offset
  ]);

  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <motion.div
      ref={ref}
      style={{ y: y.get() * speed, opacity }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Hero section médico con parallax
export const MedicalHeroSection = ({ 
  title, 
  subtitle, 
  backgroundImage,
  children,
  className = "" 
}) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <motion.section
      ref={ref}
      className={`relative min-h-screen flex items-center justify-center overflow-hidden ${className}`}
      initial="hidden"
      animate="visible"
      variants={parallaxVariants}
    >
      {/* Background con parallax */}
      {backgroundImage && (
        <motion.div
          style={{ y: backgroundY }}
          className="absolute inset-0 w-full h-[120%]"
        >
          <div 
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-blue-900/40 to-blue-900/60" />
        </motion.div>
      )}

      {/* Content con parallax independiente */}
      <motion.div
        style={{ y: textY, opacity }}
        className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white"
      >
        {title && (
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
          >
            {title}
          </motion.h1>
        )}
        
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl md:text-2xl mb-8 opacity-90"
          >
            {subtitle}
          </motion.p>
        )}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          {children}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-white rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-3 bg-white rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </motion.section>
  );
};

// Parallax layers para elementos flotantes
export const ParallaxLayers = ({ children, className = "" }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const layers = [
    { speed: 0.2, opacity: 0.3 },
    { speed: 0.4, opacity: 0.5 },
    { speed: 0.6, opacity: 0.7 },
    { speed: 0.8, opacity: 0.9 }
  ];

  return (
    <div ref={ref} className={`relative ${className}`}>
      {children}
      
      {/* Elementos flotantes con diferentes velocidades */}
      {layers.map((layer, index) => (
        <motion.div
          key={index}
          style={{
            y: useTransform(scrollYProgress, [0, 1], [0, -50 * layer.speed]),
            opacity: layer.opacity
          }}
          className="absolute inset-0 pointer-events-none"
        >
          <div className="absolute top-10 left-10 w-2 h-2 bg-blue-300 rounded-full" />
          <div className="absolute top-32 right-20 w-3 h-3 bg-blue-200 rounded-full" />
          <div className="absolute bottom-20 left-32 w-1 h-1 bg-blue-400 rounded-full" />
        </motion.div>
      ))}
    </div>
  );
};

// Card con efecto parallax hover
export const ParallaxCard = ({ 
  children, 
  className = "",
  intensity = 0.1 
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!isHovered) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * intensity;
    const y = (e.clientY - rect.top - rect.height / 2) * intensity;
    
    setMousePosition({ x, y });
  };

  return (
    <motion.div
      className={`relative transform-gpu ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setMousePosition({ x: 0, y: 0 });
      }}
      animate={{
        rotateX: mousePosition.y,
        rotateY: mousePosition.x,
        scale: isHovered ? 1.02 : 1
      }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={{ perspective: 1000 }}
    >
      {children}
    </motion.div>
  );
};

// Parallax text reveal
export const ParallaxTextReveal = ({ 
  text, 
  className = "",
  stagger = 0.1 
}) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.7", "start 0.3"]
  });

  const words = text.split(" ");

  return (
    <div ref={ref} className={className}>
      {words.map((word, index) => (
        <motion.span
          key={index}
          style={{
            opacity: useTransform(
              scrollYProgress,
              [index * 0.1, (index + 1) * 0.1],
              [0, 1]
            ),
            y: useTransform(
              scrollYProgress,
              [index * 0.1, (index + 1) * 0.1],
              [20, 0]
            )
          }}
          className="inline-block mr-2"
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
};

// Background parallax para secciones
export const ParallaxBackground = ({ 
  children, 
  pattern = "dots",
  intensity = 0.3,
  className = "" 
}) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", `${intensity * 100}%`]);

  const patterns = {
    dots: "radial-gradient(circle, rgba(59, 130, 246, 0.1) 1px, transparent 1px)",
    grid: "linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)",
    waves: "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 20\"><path d=\"M0 10c10-5 20-5 30 0s20 5 30 0 20-5 30 0 20 5 30 0\" stroke=\"rgba(59,130,246,0.1)\" fill=\"none\"/></svg>')"
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      <motion.div
        style={{ 
          y,
          backgroundImage: patterns[pattern],
          backgroundSize: pattern === "dots" ? "20px 20px" : 
                         pattern === "grid" ? "20px 20px" : "100px 20px"
        }}
        className="absolute inset-0 opacity-50"
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default ParallaxSection;