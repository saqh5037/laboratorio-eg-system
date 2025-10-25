import { motion } from 'framer-motion';
import { pageVariants, pageTransition } from '../utils/animations';

const AnimatedPage = ({ children, className = "" }) => {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className={`min-h-screen ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedPage;