import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FaCalendarAlt, 
  FaWhatsapp, 
  FaStethoscope,
  FaHeartbeat,
  FaUserMd,
  FaShieldAlt,
  FaStar
} from 'react-icons/fa';

const CTASection = () => {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-eg-purple via-eg-pink/30 to-eg-purple"></div>
      
      {/* Decorative Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-eg-pink/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      </div>

      {/* Pattern Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="h-full w-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full mb-6"
          >
            <FaHeartbeat className="text-white" />
            <span className="text-white font-medium">Tu Salud, Nuestra Prioridad</span>
            <FaHeartbeat className="text-white" />
          </motion.div>

          {/* Main Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6"
          >
            ¿Listo para cuidar tu salud?
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/90 mb-8 leading-relaxed"
          >
            Agenda tu cita hoy y recibe atención personalizada de nuestro equipo 
            de profesionales con más de 43 años de experiencia.
          </motion.p>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <FaStethoscope className="text-3xl text-white mb-3 mx-auto" />
              <h3 className="text-white font-semibold mb-1">Atención Personalizada</h3>
              <p className="text-white/80 text-sm">Equipo médico altamente calificado</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <FaShieldAlt className="text-3xl text-white mb-3 mx-auto" />
              <h3 className="text-white font-semibold mb-1">Resultados Confiables</h3>
              <p className="text-white/80 text-sm">Certificación ISO 9001:2015</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <FaStar className="text-3xl text-white mb-3 mx-auto" />
              <h3 className="text-white font-semibold mb-1">43 Años de Experiencia</h3>
              <p className="text-white/80 text-sm">Miles de pacientes satisfechos</p>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/contacto"
              className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-eg-purple rounded-full font-bold text-lg hover:shadow-2xl transition-all transform hover:scale-105"
            >
              <FaCalendarAlt className="text-xl" />
              <span>Agendar Cita Ahora</span>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 opacity-0 group-hover:opacity-20 transition-opacity" />
            </Link>

            <a
              href="https://wa.me/584149019327"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-green-500 text-white rounded-full font-bold text-lg hover:bg-green-600 hover:shadow-2xl transition-all transform hover:scale-105"
            >
              <FaWhatsapp className="text-xl" />
              <span>Consulta por WhatsApp</span>
              <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
            </a>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-6"
          >
            <div className="flex items-center gap-2 text-white/80">
              <FaUserMd />
              <span className="text-sm">Personal Certificado</span>
            </div>
            <div className="w-1 h-1 bg-white/50 rounded-full" />
            <div className="flex items-center gap-2 text-white/80">
              <span className="text-sm">Resultados en 24 horas</span>
            </div>
            <div className="w-1 h-1 bg-white/50 rounded-full" />
            <div className="flex items-center gap-2 text-white/80">
              <span className="text-sm">Atención de Lun-Sáb</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;