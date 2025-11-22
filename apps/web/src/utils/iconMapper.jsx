import React from 'react';
import {
  FaWhatsapp,
  FaStar,
  FaMapMarkerAlt,
  FaClock,
  FaPhone,
  FaEnvelope,
  FaTruck,
  FaPaperPlane,
  FaInstagram,
  FaTwitter,
  FaCertificate,
  FaBullseye,
  FaHandshake,
  FaHeart,
  FaHandsHelping,
  FaPrayingHands,
  FaUser,
  FaUserMd,
  FaUserTie,
  FaExternalLinkAlt
} from 'react-icons/fa';

/**
 * Mapeo de nombres de iconos a componentes de React Icons
 * Usado para renderizar iconos dinámicamente desde la base de datos
 */
const ICON_MAP = {
  // General
  FaWhatsapp,
  FaStar,
  FaExternalLinkAlt,

  // Contacto
  FaMapMarkerAlt,
  FaClock,
  FaPhone,
  FaEnvelope,
  FaTruck,
  FaPaperPlane,

  // Social Media
  FaInstagram,
  FaTwitter,

  // Certificaciones
  FaCertificate,

  // Valores
  FaBullseye,
  FaHandshake,
  FaHeart,
  FaHandsHelping,
  FaPrayingHands,

  // Testimonios/Usuarios
  FaUser,
  FaUserMd,
  FaUserTie
};

/**
 * Renderizar un icono dinámicamente por nombre
 *
 * @param {string} iconName - Nombre del icono (ej: 'FaBullseye')
 * @param {string} className - Clases CSS para el icono
 * @param {number} size - Tamaño del icono (default: 12 = w-12 h-12)
 * @returns {JSX.Element|null}
 *
 * @example
 * // Renderizar icono de valores corporativos
 * renderIcon('FaBullseye', 'text-eg-purple', 12)
 *
 * @example
 * // Renderizar icono de certificación
 * renderIcon('FaCertificate', 'text-eg-purple w-14 h-14')
 */
export function renderIcon(iconName, className = '', size = 12) {
  if (!iconName) return null;

  const IconComponent = ICON_MAP[iconName];

  if (!IconComponent) {
    console.warn(`Icon "${iconName}" not found in ICON_MAP`);
    return null;
  }

  // Si className ya incluye w- y h-, no agregar size
  const hasCustomSize = className.includes('w-') && className.includes('h-');
  const sizeClasses = hasCustomSize ? '' : `w-${size} h-${size}`;
  const finalClassName = `${className} ${sizeClasses}`.trim();

  return <IconComponent className={finalClassName} />;
}

/**
 * Obtener el componente de icono por nombre (sin renderizar)
 * Útil cuando necesitas el componente mismo para pasarlo como prop
 *
 * @param {string} iconName - Nombre del icono
 * @returns {React.Component|null}
 *
 * @example
 * const Icon = getIconComponent('FaBullseye');
 * return <Icon className="text-eg-purple w-12 h-12" />
 */
export function getIconComponent(iconName) {
  if (!iconName) return null;
  return ICON_MAP[iconName] || null;
}

/**
 * Verificar si un icono existe en el mapa
 *
 * @param {string} iconName - Nombre del icono
 * @returns {boolean}
 */
export function iconExists(iconName) {
  return !!ICON_MAP[iconName];
}

/**
 * Obtener lista de todos los iconos disponibles
 * Útil para selectores en interfaces de administración
 *
 * @returns {string[]}
 */
export function getAvailableIcons() {
  return Object.keys(ICON_MAP);
}

export default { renderIcon, getIconComponent, iconExists, getAvailableIcons };
