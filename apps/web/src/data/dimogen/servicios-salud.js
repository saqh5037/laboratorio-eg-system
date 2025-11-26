/**
 * Servicios de Unidad de Salud Integral - DIMOGEN
 * Datos extraídos del sitio web oficial 2025
 */

export const serviciosSalud = [
  {
    id: 'consulta-general',
    nombre: 'Consulta General',
    descripcion: 'Buscando garantizar el estado de salud integral de los pacientes, diagnosticando y tratando distintas enfermedades.',
    caracteristicas: [
      'Valoración integral de salud',
      'Diagnóstico y tratamiento',
      'Certificados médicos',
      'Seguimiento de padecimientos',
      'Orientación preventiva',
    ],
    icon: 'stethoscope',
    color: '#0047CB',
    disponibilidad: 'Todos los días con cita previa',
  },
  {
    id: 'especialidades',
    nombre: 'Consulta de Especialidad',
    descripcion: 'Ofreciendo en la unidad de salud servicios médicos especializados para atender necesidades específicas de los pacientes.',
    especialidades: [
      {
        nombre: 'Ultrasonografía',
        descripcion: 'Estudios de imagen por ultrasonido',
        disponibilidad: 'Disponible todos los días',
        icon: 'ultrasound',
      },
      {
        nombre: 'Medicina Interna',
        descripcion: 'Atención de enfermedades del adulto',
        disponibilidad: 'Bajo disponibilidad',
        icon: 'internal',
      },
      {
        nombre: 'Ginecología',
        descripcion: 'Salud de la mujer',
        disponibilidad: 'Bajo disponibilidad',
        icon: 'gynecology',
      },
      {
        nombre: 'Traumatología',
        descripcion: 'Lesiones del sistema musculoesquelético',
        disponibilidad: 'Bajo disponibilidad',
        icon: 'bone',
      },
      {
        nombre: 'Neurología',
        descripcion: 'Enfermedades del sistema nervioso',
        disponibilidad: 'Bajo disponibilidad',
        icon: 'brain',
      },
    ],
    icon: 'specialist',
    color: '#00A3E0',
  },
  {
    id: 'toma-muestras',
    nombre: 'Toma de Muestras',
    descripcion: 'Contando con personal capacitado para realizar la directa toma de muestras para su procesamiento y entrega de resultados de análisis clínicos.',
    caracteristicas: [
      'Personal altamente capacitado',
      'Toma de muestras en instalaciones',
      'Servicio a domicilio disponible',
      'Procesamiento y entrega rápida',
      'Protocolos estrictos de manejo',
    ],
    icon: 'syringe',
    color: '#98CB59',
    serviciosDomicilio: true,
  },
];

export const beneficiosSalud = [
  {
    titulo: 'Atención Personalizada',
    descripcion: 'Cada paciente recibe atención adaptada a sus necesidades específicas de salud.',
    icon: 'user-heart',
  },
  {
    titulo: 'Resultados Confiables',
    descripcion: 'Procesamos muestras con equipos de última generación y metodologías certificadas.',
    icon: 'check-shield',
  },
  {
    titulo: 'Equipo Profesional',
    descripcion: 'Personal médico y técnico altamente capacitado y en constante actualización.',
    icon: 'users-medical',
  },
  {
    titulo: 'Instalaciones Modernas',
    descripcion: 'Espacios diseñados para brindar comodidad y seguridad durante tu visita.',
    icon: 'building-heart',
  },
];

export const filosofiaSalud = {
  mision: 'Auxiliar y preservar la salud de los pacientes a través de una visión integral, ofreciendo consulta médica ajustada a sus necesidades, una amplia gama de estudios clínicos de rutina y alta especialidad, así como acompañamiento personalizado para especialistas de la salud.',
  vision: 'Ser el laboratorio de referencia líder en diagnóstico molecular y salud integral en México, reconocido por nuestra calidad, innovación tecnológica y compromiso con el bienestar de nuestros pacientes.',
  valores: [
    'Calidad en el servicio',
    'Innovación tecnológica',
    'Compromiso con la salud',
    'Ética profesional',
    'Mejora continua',
  ],
};

export const contactoSalud = {
  direccion: 'Calle Quintana Roo 78, Roma Sur, Cuauhtémoc, 06760, CDMX',
  email: 'saludintegral@dimogen.com.mx',
  horario: {
    apertura: '07:30',
    cierre: '19:00',
    dias: 'Lunes a Sábado',
  },
  telefono: '56 1033 5124',
  whatsapp: '56 1045 4458',
  coordenadas: {
    lat: 19.4128,
    lng: -99.1615,
  },
};

export const procesoAtencion = [
  {
    paso: 1,
    titulo: 'Agenda tu cita',
    descripcion: 'Contáctanos por teléfono, WhatsApp o en línea para agendar tu consulta o toma de muestras.',
    icon: 'calendar',
  },
  {
    paso: 2,
    titulo: 'Confirma tu visita',
    descripcion: 'Te enviaremos un recordatorio y las indicaciones necesarias para tu estudio.',
    icon: 'bell',
  },
  {
    paso: 3,
    titulo: 'Acude a tu cita',
    descripcion: 'Preséntate en nuestras instalaciones o recibe al personal en tu domicilio.',
    icon: 'location',
  },
  {
    paso: 4,
    titulo: 'Recibe resultados',
    descripcion: 'Obtén tus resultados por correo electrónico o en nuestro portal de pacientes.',
    icon: 'document',
  },
];
