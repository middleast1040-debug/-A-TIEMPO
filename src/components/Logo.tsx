import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => {
  return (
    <div className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#1A73E8] via-[#1557B0] to-[#0D47A1] text-white shadow-md shadow-[#1A73E8]/30 border border-white/20 shrink-0 ${className}`}>
      {/* Brillo interno superior simulando cristal de alta gama */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 to-white/10 pointer-events-none" />
      
      <svg
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-5 h-5 sm:w-6 sm:h-6 relative z-10"
      >
        {/* Vía o nodo principal con trazo sólido de alta visibilidad */}
        <path
          d="M8 26V12C8 9.79086 9.79086 8 12 8C13.6 8 15.05 8.95 15.68 10.42L20.32 21.58C20.95 23.05 22.4 24 24 24C26.2091 24 28 22.2091 28 20V10"
          stroke="#FFFFFF"
          strokeWidth="3.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Nodo de origen brillante */}
        <circle cx="8" cy="26" r="3.2" fill="#38BDF8" stroke="#0D47A1" strokeWidth="1" />
        {/* Nodo de destino luminoso */}
        <circle cx="28" cy="10" r="3.2" fill="#FFFFFF" stroke="#1A73E8" strokeWidth="1" />
      </svg>
    </div>
  );
};
