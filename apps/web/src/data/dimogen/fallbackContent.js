/**
 * Datos de Fallback para DIMOGEN Landing Page
 * Usados cuando la API no está disponible o es lenta
 * Garantiza que el usuario siempre vea contenido
 */

export const fallbackDimogenContent = {
  // =====================
  // SERVICIOS (3 líneas de negocio)
  // =====================
  services: [
    {
      id: 1,
      service_key: 'biologia-molecular',
      title: 'Biología Molecular',
      subtitle: 'Diagnósticos de Alta Precisión',
      description: 'Laboratorio especializado en diagnósticos moleculares con tecnología de vanguardia. PCR en tiempo real, secuenciación y pruebas genéticas.',
      icon_name: 'FaDna',
      color_primary: '#0047CB',
      color_secondary: '#0747A6',
      color_light: '#E6F0FF',
      color_gradient: 'from-[#0047CB] to-[#0747A6]',
      features: [
        'PCR en Tiempo Real',
        'Detección de Patógenos',
        'Pruebas Genéticas',
        'Diagnóstico Molecular'
      ],
      stats_value: '500+',
      stats_label: 'Estudios',
      link_url: '/dimogen/servicios/biologia-molecular',
      image_url: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=600&h=400&fit=crop',
      is_active: true,
      display_order: 1
    },
    {
      id: 2,
      service_key: 'salud-integral',
      title: 'Unidad de Salud Integral',
      subtitle: 'Atención Médica Completa',
      description: 'Servicios médicos integrales con especialistas calificados. Consultas, diagnósticos y seguimiento personalizado para tu bienestar.',
      icon_name: 'FaUserMd',
      color_primary: '#00A3E0',
      color_secondary: '#0077B6',
      color_light: '#E6F7FF',
      color_gradient: 'from-[#00A3E0] to-[#0077B6]',
      features: [
        'Consulta General',
        'Especialidades Médicas',
        'Toma de Muestras',
        'Servicio a Domicilio'
      ],
      stats_value: '15+',
      stats_label: 'Especialidades',
      link_url: '/dimogen/servicios/salud-integral',
      image_url: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=600&h=400&fit=crop',
      is_active: true,
      display_order: 2
    },
    {
      id: 3,
      service_key: 'microbiologia-alimentos',
      title: 'Microbiología de Alimentos',
      subtitle: 'Control de Calidad e Inocuidad',
      description: 'Análisis microbiológicos y fisicoquímicos para garantizar la seguridad alimentaria. Certificaciones COFEPRIS y cumplimiento normativo.',
      icon_name: 'FaLeaf',
      color_primary: '#98CB59',
      color_secondary: '#7AB547',
      color_light: '#F0F9E8',
      color_gradient: 'from-[#98CB59] to-[#7AB547]',
      features: [
        'Análisis Microbiológicos',
        'Análisis Fisicoquímicos',
        'Control de Calidad',
        'Certificación COFEPRIS'
      ],
      stats_value: '200+',
      stats_label: 'Pruebas',
      link_url: '/dimogen/servicios/microbiologia-alimentos',
      image_url: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&h=400&fit=crop',
      is_active: true,
      display_order: 3
    }
  ],

  // =====================
  // PREGUNTAS FRECUENTES (FAQs)
  // =====================
  faqs: [
    {
      id: 1,
      question: '¿Cómo puedo agendar una cita?',
      answer: 'Puede agendar su cita llamando a nuestro número de atención al cliente, enviando un mensaje por WhatsApp, o visitando directamente nuestras instalaciones. Nuestro personal le atenderá para encontrar el horario más conveniente.',
      category: 'general',
      is_active: true,
      display_order: 1
    },
    {
      id: 2,
      question: '¿Cuáles son los horarios de atención?',
      answer: 'Nuestro horario de atención es de lunes a viernes de 7:00 AM a 7:00 PM, y sábados de 7:00 AM a 2:00 PM. Para servicios de urgencia, contamos con disponibilidad especial.',
      category: 'general',
      is_active: true,
      display_order: 2
    },
    {
      id: 3,
      question: '¿Cuánto tiempo tardan los resultados?',
      answer: 'El tiempo de entrega varía según el tipo de estudio. Los análisis clínicos generales están disponibles en 24-48 horas. Los estudios de biología molecular pueden tomar de 3 a 5 días hábiles dependiendo de la complejidad.',
      category: 'resultados',
      is_active: true,
      display_order: 3
    },
    {
      id: 4,
      question: '¿Ofrecen servicio a domicilio?',
      answer: 'Sí, contamos con servicio de toma de muestras a domicilio. Puede solicitar este servicio al momento de agendar su cita. Aplica cargo adicional según la zona.',
      category: 'servicios',
      is_active: true,
      display_order: 4
    },
    {
      id: 5,
      question: '¿Qué certificaciones tienen?',
      answer: 'Contamos con certificación ISO 9001:2015 en sistemas de gestión de calidad y estamos autorizados por COFEPRIS para realizar análisis clínicos y de alimentos.',
      category: 'certificaciones',
      is_active: true,
      display_order: 5
    },
    {
      id: 6,
      question: '¿Aceptan seguros médicos?',
      answer: 'Trabajamos con las principales aseguradoras del país. Le recomendamos verificar la cobertura de su póliza antes de su visita. Nuestro personal puede ayudarle con los trámites necesarios.',
      category: 'pagos',
      is_active: true,
      display_order: 6
    }
  ],

  // =====================
  // SOBRE DIMOGEN (About)
  // =====================
  about: {
    filosofia: [
      {
        id: 1,
        title: 'Nuestra Misión',
        content: 'Proporcionar servicios de diagnóstico de alta calidad con tecnología de vanguardia, contribuyendo al bienestar de nuestros pacientes y la seguridad alimentaria de la región.',
        icon: 'target',
        is_active: true,
        display_order: 1
      },
      {
        id: 2,
        title: 'Nuestra Visión',
        content: 'Ser el laboratorio de referencia en el sureste mexicano, reconocido por nuestra excelencia, innovación y compromiso con la salud.',
        icon: 'eye',
        is_active: true,
        display_order: 2
      }
    ],
    valores: [
      {
        id: 1,
        title: 'Calidad',
        content: 'Comprometidos con los más altos estándares en todos nuestros procesos.',
        icon: 'award',
        is_active: true,
        display_order: 1
      },
      {
        id: 2,
        title: 'Innovación',
        content: 'Adoptamos las últimas tecnologías para ofrecer diagnósticos precisos.',
        icon: 'lightbulb',
        is_active: true,
        display_order: 2
      },
      {
        id: 3,
        title: 'Confianza',
        content: 'Construimos relaciones basadas en la transparencia y la honestidad.',
        icon: 'shield',
        is_active: true,
        display_order: 3
      },
      {
        id: 4,
        title: 'Servicio',
        content: 'Ponemos a nuestros pacientes en el centro de todo lo que hacemos.',
        icon: 'heart',
        is_active: true,
        display_order: 4
      }
    ],
    intro: []
  },

  // =====================
  // TESTIMONIOS
  // =====================
  testimonials: [
    {
      id: 1,
      author_name: 'María García',
      author_title: 'Paciente',
      content: 'Excelente servicio y atención profesional. Los resultados fueron entregados en tiempo y forma. Muy recomendado.',
      rating: 5,
      is_active: true,
      display_order: 1
    },
    {
      id: 2,
      author_name: 'Carlos Martínez',
      author_title: 'Gerente de Restaurante',
      content: 'Confío en DIMOGEN para los análisis de calidad de nuestros alimentos. Su profesionalismo nos da tranquilidad.',
      rating: 5,
      is_active: true,
      display_order: 2
    },
    {
      id: 3,
      author_name: 'Ana López',
      author_title: 'Paciente',
      content: 'Las instalaciones son modernas y el personal muy amable. Me explicaron todo el proceso con paciencia.',
      rating: 5,
      is_active: true,
      display_order: 3
    }
  ],

  // =====================
  // ESTADÍSTICAS
  // =====================
  statistics: [
    {
      id: 1,
      label: 'Años de Experiencia',
      value: '15+',
      icon: 'calendar',
      is_active: true,
      display_order: 1
    },
    {
      id: 2,
      label: 'Estudios Realizados',
      value: '50,000+',
      icon: 'flask',
      is_active: true,
      display_order: 2
    },
    {
      id: 3,
      label: 'Pacientes Atendidos',
      value: '30,000+',
      icon: 'users',
      is_active: true,
      display_order: 3
    },
    {
      id: 4,
      label: 'Satisfacción',
      value: '98%',
      icon: 'thumbs-up',
      is_active: true,
      display_order: 4
    }
  ],

  // =====================
  // CONTACTO
  // =====================
  contact: [
    {
      id: 1,
      type: 'address',
      label: 'Dirección',
      value: 'Av. Principal #123, Cancún, Quintana Roo',
      icon: 'map-pin',
      is_active: true,
      display_order: 1
    },
    {
      id: 2,
      type: 'phone',
      label: 'Teléfono',
      value: '+52 998 123 4567',
      icon: 'phone',
      is_active: true,
      display_order: 2
    },
    {
      id: 3,
      type: 'email',
      label: 'Email',
      value: 'contacto@dimogen.com',
      icon: 'mail',
      is_active: true,
      display_order: 3
    },
    {
      id: 4,
      type: 'whatsapp',
      label: 'WhatsApp',
      value: '+52 998 765 4321',
      icon: 'message-circle',
      is_active: true,
      display_order: 4
    },
    {
      id: 5,
      type: 'hours',
      label: 'Lunes a Viernes',
      value: '7:00 AM - 7:00 PM',
      icon: 'clock',
      is_active: true,
      display_order: 5
    },
    {
      id: 6,
      type: 'hours',
      label: 'Sábados',
      value: '7:00 AM - 2:00 PM',
      icon: 'clock',
      is_active: true,
      display_order: 6
    }
  ],

  // =====================
  // CARRUSEL (Hero slides)
  // =====================
  carousel: [
    {
      id: 1,
      title: 'Biología Molecular de Vanguardia',
      subtitle: 'Diagnósticos precisos con tecnología PCR',
      image_url: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=1920&h=1080&fit=crop',
      cta_text: 'Conocer más',
      cta_link: '/dimogen/servicios/biologia-molecular',
      is_active: true,
      display_order: 1
    },
    {
      id: 2,
      title: 'Unidad de Salud Integral',
      subtitle: 'Atención médica completa para toda la familia',
      image_url: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1920&h=1080&fit=crop',
      cta_text: 'Ver servicios',
      cta_link: '/dimogen/servicios/salud-integral',
      is_active: true,
      display_order: 2
    },
    {
      id: 3,
      title: 'Control de Calidad Alimentaria',
      subtitle: 'Análisis certificados para la industria alimentaria',
      image_url: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=1920&h=1080&fit=crop',
      cta_text: 'Más información',
      cta_link: '/dimogen/servicios/microbiologia-alimentos',
      is_active: true,
      display_order: 3
    }
  ],

  // =====================
  // INFORMACIÓN DE EMPRESA
  // =====================
  company: {
    name: 'DIMOGEN',
    short_name: 'DIMOGEN',
    tagline: 'Laboratorio de Alta Especialidad',
    description: 'Laboratorio especializado en biología molecular, servicios de salud integral y microbiología de alimentos.',
    logo_url: null,
    logo_icon_url: null,
    primary_color: '#0047CB',
    secondary_color: '#00A3E0'
  }
};

export default fallbackDimogenContent;
