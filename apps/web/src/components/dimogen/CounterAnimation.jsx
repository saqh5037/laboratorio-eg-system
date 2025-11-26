/**
 * CounterAnimation.jsx
 * Hook y componentes para contadores animados
 * Los números cuentan de 0 al valor final cuando entran en viewport
 */

import { useEffect, useState, useRef } from 'react';
import { motion, useInView, animate } from 'framer-motion';

/**
 * useCounter - Hook para animar un contador
 * @param {number} end - Valor final
 * @param {number} duration - Duración de la animación en segundos
 * @param {boolean} startOnView - Si debe empezar cuando está en viewport
 * @returns {number} - Valor actual del contador
 */
export const useCounter = (end, duration = 2, startOnView = true) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (startOnView && !isInView) return;
    if (hasAnimated.current) return;

    hasAnimated.current = true;

    const controls = animate(0, end, {
      duration,
      ease: 'easeOut',
      onUpdate: (latest) => setCount(Math.floor(latest)),
    });

    return () => controls.stop();
  }, [end, duration, isInView, startOnView]);

  return { count, ref };
};

/**
 * AnimatedCounter - Componente de contador animado
 */
export const AnimatedCounter = ({
  value,
  duration = 2,
  prefix = '',
  suffix = '',
  className = '',
  textClassName = '',
  labelClassName = '',
  label = '',
  formatNumber = true,
}) => {
  const { count, ref } = useCounter(value, duration);

  const displayValue = formatNumber
    ? count.toLocaleString('es-MX')
    : count;

  return (
    <div ref={ref} className={className}>
      <motion.span
        className={textClassName}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {prefix}{displayValue}{suffix}
      </motion.span>
      {label && (
        <span className={labelClassName}>{label}</span>
      )}
    </div>
  );
};

/**
 * StatCounter - Contador con diseño de estadística
 */
export const StatCounter = ({
  value,
  label,
  suffix = '',
  prefix = '',
  duration = 2,
  icon: Icon,
  color = '#0047CB',
  className = '',
}) => {
  const { count, ref } = useCounter(value, duration);

  return (
    <motion.div
      ref={ref}
      className={`text-center ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      {Icon && (
        <motion.div
          className="mb-2 flex justify-center"
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${color}15` }}
          >
            <Icon className="w-6 h-6" style={{ color }} />
          </div>
        </motion.div>
      )}

      <motion.div
        className="text-4xl md:text-5xl font-bold"
        style={{ color, fontFamily: "'Poppins', sans-serif" }}
        initial={{ scale: 0.8 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        {prefix}{count.toLocaleString('es-MX')}{suffix}
      </motion.div>

      <p
        className="text-gray-600 mt-1 text-sm md:text-base"
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        {label}
      </p>
    </motion.div>
  );
};

/**
 * CircleProgress - Círculo de progreso animado
 */
export const CircleProgress = ({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  color = '#0047CB',
  backgroundColor = '#E5E7EB',
  label,
  suffix = '%',
  duration = 2,
  className = '',
}) => {
  const { count, ref } = useCounter(value, duration);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = (count / max) * 100;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <motion.div
      ref={ref}
      className={`relative inline-flex items-center justify-center ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
        />

        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration, ease: 'easeOut' }}
        />
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-2xl md:text-3xl font-bold"
          style={{ color, fontFamily: "'Poppins', sans-serif" }}
        >
          {count}{suffix}
        </span>
        {label && (
          <span
            className="text-xs text-gray-500 mt-1 text-center px-2"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            {label}
          </span>
        )}
      </div>
    </motion.div>
  );
};

/**
 * TypewriterText - Texto que aparece como si se escribiera
 */
export const TypewriterText = ({
  text,
  speed = 50,
  delay = 0,
  className = '',
  onComplete,
}) => {
  const [displayText, setDisplayText] = useState('');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isInView || hasAnimated.current) return;
    hasAnimated.current = true;

    let i = 0;
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        if (i < text.length) {
          setDisplayText(text.slice(0, i + 1));
          i++;
        } else {
          clearInterval(interval);
          onComplete?.();
        }
      }, speed);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timer);
  }, [text, speed, delay, isInView, onComplete]);

  return (
    <span ref={ref} className={className}>
      {displayText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.5, repeat: Infinity }}
        className="inline-block w-0.5 h-[1em] bg-current ml-0.5 align-middle"
      />
    </span>
  );
};

/**
 * ScrollProgressBar - Barra de progreso de scroll de página
 */
export const ScrollProgressBar = ({
  color = '#0047CB',
  height = 4,
  zIndex = 50,
}) => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 right-0"
      style={{
        height,
        backgroundColor: `${color}20`,
        zIndex,
      }}
    >
      <motion.div
        className="h-full"
        style={{
          backgroundColor: color,
          width: `${scrollProgress}%`,
        }}
        transition={{ duration: 0.1 }}
      />
    </motion.div>
  );
};

export default {
  useCounter,
  AnimatedCounter,
  StatCounter,
  CircleProgress,
  TypewriterText,
  ScrollProgressBar,
};
