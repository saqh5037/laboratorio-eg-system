/**
 * Sistema de Iconograf�a Unificada - LaboratorioEG
 *
 * Todos los iconos DEBEN usar este sistema para mantener:
 * - Tama�o uniforme
 * - Grosor de stroke consistente
 * - Colores Pantone oficiales
 * - Estilo profesional homog�neo
 */

import {
  FaMicroscope,
  FaVial,
  FaHeartbeat,
  FaSyringe,
  FaFlask,
  FaDna,
  FaLungs,
  FaStethoscope,
  FaUserMd,
  FaCertificate,
  FaHospital,
  FaFileMedical,
  FaPills,
  FaBrain,
  FaEye,
  FaBone,
  FaBacterium,
  FaVirus,
  FaHeart,
  FaClipboardList,
  FaCog,
  FaStar,
  FaMobileAlt,
  FaCreditCard,
  FaHandshake,
  FaTrophy
} from 'react-icons/fa';

// Tama�os estandarizados
export const ICON_SIZES = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
  '2xl': 'w-12 h-12',
  '3xl': 'w-16 h-16',
  '4xl': 'w-24 h-24',
};

// Colores institucionales Pantone
export const ICON_COLORS = {
  primary: 'text-eg-purple',
  secondary: 'text-eg-pink',
  dark: 'text-eg-dark',
  gray: 'text-eg-gray',
  white: 'text-white',
};

/**
 * Wrapper para iconos con estilo consistente
 */
export const IconWrapper = ({
  icon: Icon,
  size = 'md',
  color = 'primary',
  className = '',
  ...props
}) => {
  const sizeClass = ICON_SIZES[size] || size;
  const colorClass = ICON_COLORS[color] || color;

  return (
    <Icon
      className={`${sizeClass} ${colorClass} ${className}`}
      {...props}
    />
  );
};

/**
 * Mapeo de �reas m�dicas a iconos profesionales
 */
export const MEDICAL_ICONS = {
  // �reas principales
  hematologia: FaVial,
  quimica: FaFlask,
  microbiologia: FaMicroscope,
  inmunologia: FaDna,
  endocrinologia: FaSyringe,
  cardiologia: FaHeartbeat,
  neumologia: FaLungs,
  neurologia: FaBrain,
  oftalmologia: FaEye,
  traumatologia: FaBone,
  infectologia: FaVirus,
  parasitologia: FaBacterium,

  // Otros
  general: FaStethoscope,
  especialista: FaUserMd,
  certificacion: FaCertificate,
  hospital: FaHospital,
  historial: FaFileMedical,
  medicamentos: FaPills,
  corazon: FaHeart,
  examen: FaClipboardList,
};

/**
 * Componente para iconos de �reas m�dicas
 */
export const MedicalIcon = ({ area, size = '2xl', color = 'primary', className = '' }) => {
  const areaLower = area?.toLowerCase() || '';

  // Buscar el icono correspondiente
  const Icon = MEDICAL_ICONS[areaLower] || MEDICAL_ICONS.general;

  return <IconWrapper icon={Icon} size={size} color={color} className={className} />;
};

/**
 * Iconos predefinidos para uso r�pido
 */
export const Icons = {
  Hematologia: (props) => <IconWrapper icon={FaVial} {...props} />,
  Quimica: (props) => <IconWrapper icon={FaFlask} {...props} />,
  Microbiologia: (props) => <IconWrapper icon={FaMicroscope} {...props} />,
  Inmunologia: (props) => <IconWrapper icon={FaDna} {...props} />,
  Endocrinologia: (props) => <IconWrapper icon={FaSyringe} {...props} />,
  Cardiologia: (props) => <IconWrapper icon={FaHeartbeat} {...props} />,
  Neumologia: (props) => <IconWrapper icon={FaLungs} {...props} />,
  Neurologia: (props) => <IconWrapper icon={FaBrain} {...props} />,
  Oftalmologia: (props) => <IconWrapper icon={FaEye} {...props} />,
  Traumatologia: (props) => <IconWrapper icon={FaBone} {...props} />,
  Infectologia: (props) => <IconWrapper icon={FaVirus} {...props} />,
  Parasitologia: (props) => <IconWrapper icon={FaBacterium} {...props} />,

  General: (props) => <IconWrapper icon={FaStethoscope} {...props} />,
  Especialista: (props) => <IconWrapper icon={FaUserMd} {...props} />,
  Certificacion: (props) => <IconWrapper icon={FaCertificate} {...props} />,
  Hospital: (props) => <IconWrapper icon={FaHospital} {...props} />,
  Historial: (props) => <IconWrapper icon={FaFileMedical} {...props} />,

  // Beneficios institucionales
  Tecnologia: (props) => <IconWrapper icon={FaCog} {...props} />,
  Experiencia: (props) => <IconWrapper icon={FaTrophy} {...props} />,
  ResultadosEnLinea: (props) => <IconWrapper icon={FaMobileAlt} {...props} />,
  FormasPago: (props) => <IconWrapper icon={FaCreditCard} {...props} />,
  Convenios: (props) => <IconWrapper icon={FaHandshake} {...props} />,
  Calidad: (props) => <IconWrapper icon={FaStar} {...props} />,
  Medicamentos: (props) => <IconWrapper icon={FaPills} {...props} />,
  Corazon: (props) => <IconWrapper icon={FaHeart} {...props} />,
  Examen: (props) => <IconWrapper icon={FaClipboardList} {...props} />,
};

export default IconWrapper;
