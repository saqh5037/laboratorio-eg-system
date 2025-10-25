// Sistema de animaciones profesionales para Laboratorio EG
// Configuraciones y variantes de Framer Motion optimizadas para UX médica

// Variantes de página para transiciones suaves
export const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 1.02,
    transition: {
      duration: 0.3,
      ease: [0.55, 0.06, 0.68, 0.19]
    }
  }
};

// Transiciones para navegación entre páginas
export const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.5
};

// Animaciones de entrada en cascada para listas
export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

export const staggerItem = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95
  },
  show: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

// Micro-interacciones para botones médicos
export const buttonVariants = {
  idle: { 
    scale: 1,
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
  },
  hover: { 
    scale: 1.02,
    boxShadow: "0 4px 16px rgba(59, 130, 246, 0.2)",
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  tap: { 
    scale: 0.98,
    boxShadow: "0 1px 4px rgba(0, 0, 0, 0.1)",
    transition: {
      duration: 0.1
    }
  },
  loading: {
    scale: 1,
    opacity: 0.7,
    transition: {
      duration: 0.2
    }
  }
};

// Animaciones para cards de estudios
export const cardVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.9,
    rotateX: -10
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotateX: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  hover: {
    y: -4,
    scale: 1.02,
    rotateX: 2,
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

// Animación de fade para overlays y modales
export const fadeVariants = {
  hidden: { 
    opacity: 0,
    backdropFilter: "blur(0px)"
  },
  visible: { 
    opacity: 1,
    backdropFilter: "blur(8px)",
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

// Modal animaciones médicas profesionales
export const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 50,
    rotateX: -15
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    rotateX: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
      staggerChildren: 0.1
    }
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 30,
    transition: {
      duration: 0.3,
      ease: [0.55, 0.06, 0.68, 0.19]
    }
  }
};

// Animaciones para elementos de carga
export const loadingVariants = {
  pulse: {
    scale: [1, 1.05, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },
  bounce: {
    y: [0, -10, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },
  rotate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

// Parallax suave para hero sections
export const parallaxVariants = {
  hidden: { 
    y: 50,
    opacity: 0,
    scale: 1.1
  },
  visible: { 
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 1.2,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

// Animaciones para toast notifications
export const toastVariants = {
  hidden: {
    opacity: 0,
    x: 100,
    scale: 0.8
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  exit: {
    opacity: 0,
    x: 100,
    scale: 0.9,
    transition: {
      duration: 0.3,
      ease: [0.55, 0.06, 0.68, 0.19]
    }
  }
};

// Progress indicators animados
export const progressVariants = {
  loading: {
    width: ["0%", "100%"],
    transition: {
      duration: 2,
      ease: "easeInOut"
    }
  },
  complete: {
    width: "100%",
    backgroundColor: "#10B981",
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

// Animaciones de entrada para elementos específicos
export const slideUpVariants = {
  hidden: {
    opacity: 0,
    y: 40
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

export const slideLeftVariants = {
  hidden: {
    opacity: 0,
    x: -40
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

export const slideRightVariants = {
  hidden: {
    opacity: 0,
    x: 40
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

// Configuraciones de spring para animaciones naturales
export const springConfig = {
  type: "spring",
  damping: 25,
  stiffness: 120,
  mass: 0.8
};

export const medicalSpringConfig = {
  type: "spring",
  damping: 30,
  stiffness: 100,
  mass: 1
};

// Animaciones para elementos favoritos
export const favoriteVariants = {
  idle: {
    scale: 1,
    rotate: 0
  },
  active: {
    scale: 1.2,
    rotate: [0, -10, 10, 0],
    transition: {
      duration: 0.4,
      ease: "easeInOut"
    }
  }
};

// Animaciones de typing para texto dinámico
export const typingVariants = {
  hidden: { width: 0 },
  visible: {
    width: "100%",
    transition: {
      duration: 2,
      ease: "easeInOut"
    }
  }
};

// Configuración de viewport para optimización
export const viewportConfig = {
  once: true,
  margin: "-100px",
  amount: 0.3
};

// Transiciones personalizadas para elementos médicos
export const medicalTransitions = {
  gentle: {
    duration: 0.8,
    ease: [0.25, 0.46, 0.45, 0.94]
  },
  quick: {
    duration: 0.3,
    ease: [0.55, 0.06, 0.68, 0.19]
  },
  bounce: {
    type: "spring",
    damping: 15,
    stiffness: 100
  }
};

// Utilidades para animaciones responsivas
export const responsiveVariants = {
  mobile: {
    scale: 0.95,
    transition: { duration: 0.3 }
  },
  desktop: {
    scale: 1,
    transition: { duration: 0.4 }
  }
};

// Animaciones específicas para loading skeletons
export const skeletonVariants = {
  loading: {
    opacity: [0.4, 1, 0.4],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },
  shimmer: {
    background: [
      "linear-gradient(90deg, #f0f0f0 0%, #f8f8f8 50%, #f0f0f0 100%)",
      "linear-gradient(90deg, #f8f8f8 0%, #f0f0f0 50%, #f8f8f8 100%)",
      "linear-gradient(90deg, #f0f0f0 0%, #f8f8f8 50%, #f0f0f0 100%)"
    ],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

// Animaciones de gesto avanzadas
export const gestureVariants = {
  drag: {
    drag: true,
    dragElastic: 0.2,
    whileDrag: { scale: 1.02, opacity: 0.8 }
  },
  swipe: {
    drag: "x",
    dragConstraints: { left: -100, right: 100 },
    dragElastic: 1
  },
  pinch: {
    scale: [1, 1.2, 1],
    transition: {
      duration: 0.5,
      ease: "easeInOut"
    }
  }
};

// Animaciones de scroll revelar
export const scrollRevealVariants = {
  fadeUp: {
    initial: { opacity: 0, y: 60 },
    whileInView: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    viewport: { once: true, amount: 0.3 }
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.8 },
    whileInView: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    viewport: { once: true, amount: 0.3 }
  }
};

// Animaciones de contador numérico
export const counterVariants = {
  initial: { opacity: 0, scale: 0.5 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

// Animaciones de morphing para SVG
export const morphVariants = {
  hidden: {
    pathLength: 0,
    opacity: 0
  },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 2, ease: "easeInOut" },
      opacity: { duration: 0.5 }
    }
  }
};

// Efectos de glitch para errores
export const glitchVariants = {
  glitch: {
    x: [0, -2, 2, -2, 0],
    filter: [
      "hue-rotate(0deg)",
      "hue-rotate(90deg)",
      "hue-rotate(-90deg)",
      "hue-rotate(45deg)",
      "hue-rotate(0deg)"
    ],
    transition: {
      duration: 0.3,
      repeat: 2
    }
  }
};

// Animaciones de flotación suave
export const floatVariants = {
  float: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },
  floatHorizontal: {
    x: [-5, 5, -5],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Configuración de Layout animations
export const layoutVariants = {
  layout: true,
  layoutScroll: true,
  transition: {
    layout: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  }
};

export default {
  pageVariants,
  pageTransition,
  staggerContainer,
  staggerItem,
  buttonVariants,
  cardVariants,
  fadeVariants,
  modalVariants,
  loadingVariants,
  parallaxVariants,
  toastVariants,
  progressVariants,
  slideUpVariants,
  slideLeftVariants,
  slideRightVariants,
  springConfig,
  medicalSpringConfig,
  favoriteVariants,
  typingVariants,
  viewportConfig,
  medicalTransitions,
  responsiveVariants,
  skeletonVariants,
  gestureVariants,
  scrollRevealVariants,
  counterVariants,
  morphVariants,
  glitchVariants,
  floatVariants,
  layoutVariants
};