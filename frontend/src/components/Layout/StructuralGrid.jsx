import React from 'react';

export default function StructuralGrid({ children }) {
  return (
    <div className="relative min-h-screen w-full bg-[#08080C] text-[#F3F3EE]">
      
      {/* Warm Indic Ambient Atmosphere Glow */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#D4AF37]/5 rounded-full blur-[140px]" />
        <div className="absolute top-[60%] -left-[10%] w-[500px] h-[500px] bg-[#C2410C]/5 rounded-full blur-[160px]" />
        <div className="absolute top-[40%] -right-[10%] w-[500px] h-[500px] bg-[#0D9488]/5 rounded-full blur-[160px]" />
      </div>

      {/* Atmospheric Texture */}
      <div className="atmospheric-overlay"></div>

      {/* Main Content Area */}
      <div className="relative z-10">
        {children}
      </div>
      
    </div>
  );
}
