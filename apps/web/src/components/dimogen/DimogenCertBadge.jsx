import React from 'react';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaCertificate, FaShieldAlt } from 'react-icons/fa';
import { DIMOGEN_COLORS, DIMOGEN_CERTS } from '../../styles/dimogen-theme';

/**
 * Badge individual de certificación
 */
export const CertBadge = ({
  type = 'iso', // 'iso' | 'cofepris'
  variant = 'full', // 'full' | 'compact' | 'icon'
  color = 'primary', // 'primary' | 'white' | 'green'
  className = ''
}) => {
  const cert = type === 'iso' ? DIMOGEN_CERTS.iso : DIMOGEN_CERTS.cofepris;

  const colorClasses = {
    primary: 'bg-[#0047CB]/10 text-[#0047CB] border-[#0047CB]/20',
    white: 'bg-white/10 text-white border-white/20',
    green: 'bg-[#98CB59]/10 text-[#98CB59] border-[#98CB59]/20',
  };

  if (variant === 'icon') {
    return (
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClasses[color]} ${className}`}
        title={cert.name}
      >
        <FaCertificate className="w-5 h-5" />
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${colorClasses[color]} ${className}`}>
        <FaCheckCircle className="w-4 h-4" />
        <span className="text-sm font-medium">{cert.name}</span>
      </div>
    );
  }

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${colorClasses[color]} ${className}`}>
      <div className="flex-shrink-0">
        <FaCertificate className="w-8 h-8" />
      </div>
      <div>
        <div className="font-semibold">{cert.name}</div>
        <div className="text-sm opacity-80">{cert.description}</div>
        {type === 'cofepris' && cert.number && (
          <div className="text-xs font-mono mt-1 opacity-60">No. {cert.number}</div>
        )}
      </div>
    </div>
  );
};

/**
 * Sección completa de certificaciones
 */
export const CertificationsSection = ({
  variant = 'light', // 'light' | 'dark' | 'gradient'
  showTitle = true,
  className = ''
}) => {
  const bgClasses = {
    light: 'bg-gray-50',
    dark: 'bg-[#0047CB]',
    gradient: 'bg-gradient-to-r from-[#0047CB] to-[#003F92]',
  };

  const textColor = variant === 'light' ? 'text-gray-900' : 'text-white';
  const subTextColor = variant === 'light' ? 'text-gray-600' : 'text-white/80';
  const badgeColor = variant === 'light' ? 'primary' : 'white';

  return (
    <section className={`py-12 ${bgClasses[variant]} ${className}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {showTitle && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h3 className={`text-2xl font-bold ${textColor} mb-2`}>
              Certificaciones y Acreditaciones
            </h3>
            <p className={`${subTextColor}`}>
              Respaldados por los más altos estándares de calidad
            </p>
          </motion.div>
        )}

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <CertBadge type="iso" variant="full" color={badgeColor} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <CertBadge type="cofepris" variant="full" color={badgeColor} />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

/**
 * Badge "Parte de GRUPO MICRO-TEC" para footer o secciones
 */
export const MicrotecBrandBadge = ({
  variant = 'light', // 'light' | 'dark'
  size = 'md', // 'sm' | 'md' | 'lg'
  className = ''
}) => {
  const bgClass = variant === 'dark' ? 'bg-white/10' : 'bg-gray-100';
  const textClass = variant === 'dark' ? 'text-white' : 'text-gray-600';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const logoSizes = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10',
  };

  // Usar logo SVG vectorizado - blanco sobre fondo oscuro, colores sobre fondo claro
  const logoSrc = variant === 'dark'
    ? '/images/dimogen/logos/microtec/microtec-logo-white.svg'
    : '/images/dimogen/logos/microtec/microtec-logo.svg';

  return (
    <div className={`inline-flex items-center gap-2 rounded-full ${bgClass} ${textClass} ${sizeClasses[size]} ${className}`}>
      <span className="font-medium">Parte de</span>
      <img
        src={logoSrc}
        alt="GRUPO MICRO-TEC"
        className={`${logoSizes[size]} w-auto object-contain`}
      />
    </div>
  );
};

/**
 * Footer con branding MICRO-TEC
 */
export const MicrotecFooterSection = ({
  className = ''
}) => {
  return (
    <div className={`border-t border-gray-200 pt-6 ${className}`}>
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <MicrotecBrandBadge variant="light" size="md" />
          <span className="text-sm text-gray-500">
            25 años de experiencia en diagnóstico clínico
          </span>
        </div>
        <div className="flex items-center gap-4">
          <CertBadge type="iso" variant="compact" color="primary" />
          <CertBadge type="cofepris" variant="compact" color="primary" />
        </div>
      </div>
    </div>
  );
};

export default CertBadge;
