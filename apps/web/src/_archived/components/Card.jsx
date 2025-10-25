import { motion } from 'framer-motion';

const Card = ({
  children,
  className = '',
  hover = true,
  padding = true,
  onClick,
  ...props
}) => {
  const baseClasses = 'rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-300';
  const hoverClasses = hover ? 'hover:shadow-medical-lg' : '';
  const paddingClasses = padding ? 'p-6' : '';
  const clickableClasses = onClick ? 'cursor-pointer' : '';

  return (
    <motion.div
      whileHover={hover ? { y: -2 } : {}}
      onClick={onClick}
      className={`${baseClasses} ${hoverClasses} ${paddingClasses} ${clickableClasses} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;