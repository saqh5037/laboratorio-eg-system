import { motion } from 'framer-motion';

const Loader = ({ size = 'medium', color = 'medical-navy' }) => {
  const sizes = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
  };

  const sizeClass = sizes[size] || sizes.medium;

  return (
    <div className="flex items-center justify-center">
      <motion.div
        className={`${sizeClass} border-4 border-gray-200 border-t-${color} rounded-full`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
};

export default Loader;