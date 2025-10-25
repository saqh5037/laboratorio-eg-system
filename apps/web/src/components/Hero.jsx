import { useState } from 'react';
import { FaWhatsapp, FaPhone } from 'react-icons/fa';

const Hero = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    }
  };

  const stats = [
    { label: 'Años de experiencia', value: '43' },
    { label: 'Estudios disponibles', value: '100+' },
    { label: 'Resultados en 24h', value: '90%' },
  ];

  return (
    <section id="inicio" className="relative min-h-[650px] md:min-h-[750px] overflow-hidden">
      {/* Fondo con gradiente institucional vibrante */}
      <div className="absolute inset-0 bg-gradient-to-br from-eg-purple via-eg-purple/90 to-eg-pink">
        {/* Efectos de luz sutiles (NO blobs opacos) */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full light-effect" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-eg-pink/20 rounded-full light-effect" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full light-effect" />
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 container mx-auto px-6 py-16 md:py-24">
        <div className="text-center max-w-5xl mx-auto">
          {/* Logo institucional */}
          <div className="mb-8">
            <img
              src="/Logo.png"
              alt="LaboratorioEG"
              className="w-24 h-24 md:w-32 md:h-32 mx-auto drop-shadow-2xl"
            />
          </div>

          {/* Slogan principal */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-normal text-white mb-6 tracking-tight leading-none"
              style={{textShadow: '0 4px 20px rgba(0,0,0,0.3)'}}>
            Tu salud, nuestra prioridad
          </h1>

          {/* Claim corto y directo */}
          <p className="text-xl md:text-2xl lg:text-3xl font-normal text-white/95 mb-12 leading-relaxed max-w-4xl mx-auto"
             style={{textShadow: '0 2px 10px rgba(0,0,0,0.2)'}}>
            43 años de experiencia • 100+ estudios • Resultados en 24h
          </p>

          {/* CTAs principales grandes y prominentes */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-16">
            <a
              href="#contacto"
              className="px-10 py-5 md:px-12 md:py-6 bg-white text-eg-purple rounded-full
                       text-lg md:text-2xl font-normal min-h-[56px]
                       hover:scale-105 hover:shadow-2xl active:scale-95
                       transition-all duration-300 inline-flex items-center justify-center
                       focus:outline-none focus:ring-4 focus:ring-white/50"
            >
              Agendar Cita
            </a>

            <a
              href="#estudios"
              className="px-10 py-5 md:px-12 md:py-6 border-2 border-white text-white rounded-full
                       text-lg md:text-2xl font-normal min-h-[56px]
                       hover:bg-white/10 active:bg-white/20
                       transition-all duration-300 inline-flex items-center justify-center
                       focus:outline-none focus:ring-4 focus:ring-white/50"
            >
              Ver Estudios
            </a>
          </div>

          {/* Stats con glassmorphism - Solo 3 cards horizontales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="glass-card p-6 text-center transform hover:scale-105 transition-transform duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-4xl md:text-5xl font-normal text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base font-normal text-white/90">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Indicador de scroll */}
          <div className="mt-12 animate-bounce">
            <div className="w-8 h-12 border-2 border-white/50 rounded-full mx-auto flex items-start justify-center p-2">
              <div className="w-1.5 h-3 bg-white/80 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
