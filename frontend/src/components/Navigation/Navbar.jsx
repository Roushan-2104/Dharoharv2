import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Compass, Map, Feather, Sparkles, Volume2, VolumeX, Languages } from 'lucide-react';

export default function Navbar() {
  const [audioActive, setAudioActive] = useState(false);
  const [selectedLang, setSelectedLang] = useState('EN');

  const languages = ['EN', 'हि', 'ଓଡ଼ି'];

  const cycleLanguage = () => {
    const currentIndex = languages.indexOf(selectedLang);
    const nextIndex = (currentIndex + 1) % languages.length;
    setSelectedLang(languages[nextIndex]);
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 h-20 flex justify-between items-center px-6 md:px-10 border-b border-[#D4AF37]/20 bg-[#08080C]/80 backdrop-blur-xl">
      
      {/* Left Navigation Links */}
      <div className="flex items-center gap-6 md:gap-10 flex-1">
        <NavLink 
          to="/" 
          className={({ isActive }) => 
            `heritage-badge flex items-center gap-2.5 transition-all duration-300 py-1.5 px-3 rounded-full ${
              isActive 
                ? 'text-[#F5D77F] bg-[#D4AF37]/15 border border-[#D4AF37]/40 shadow-[0_0_15px_rgba(212,175,55,0.2)]' 
                : 'text-zinc-400 hover:text-[#F5D77F] hover:bg-white/5 border border-transparent'
            }`
          }
        >
          <Map className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Sanskriti Map</span>
        </NavLink>

        <NavLink 
          to="/discover" 
          className={({ isActive }) => 
            `heritage-badge flex items-center gap-2.5 transition-all duration-300 py-1.5 px-3 rounded-full ${
              isActive 
                ? 'text-[#F5D77F] bg-[#D4AF37]/15 border border-[#D4AF37]/40 shadow-[0_0_15px_rgba(212,175,55,0.2)]' 
                : 'text-zinc-400 hover:text-[#F5D77F] hover:bg-white/5 border border-transparent'
            }`
          }
        >
          <Compass className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Anusandhan</span>
        </NavLink>

        <NavLink 
          to="/contribute" 
          className={({ isActive }) => 
            `heritage-badge flex items-center gap-2.5 transition-all duration-300 py-1.5 px-3 rounded-full ${
              isActive 
                ? 'text-[#F5D77F] bg-[#D4AF37]/15 border border-[#D4AF37]/40 shadow-[0_0_15px_rgba(212,175,55,0.2)]' 
                : 'text-zinc-400 hover:text-[#F5D77F] hover:bg-white/5 border border-transparent'
            }`
          }
        >
          <Feather className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Jan Sahayog</span>
        </NavLink>
      </div>

      {/* Centered Logo: DHAROHAR */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3 cursor-pointer select-none">
        {/* Golden Indic Chakra Emblem SVG */}
        <div className="relative w-8 h-8 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-[#D4AF37]/40 animate-[spin_20s_linear_infinite]" />
          <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#D4AF37]" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="9" stroke="#D4AF37" strokeWidth="1.2" />
            <circle cx="12" cy="12" r="3" fill="#D4AF37" />
            <path d="M12 3v6M12 15v6M3 12h6M15 12h6M5.6 5.6l4.2 4.2M14.2 14.2l4.2 4.2M5.6 18.4l4.2-4.2M14.2 9.8l4.2-4.2" stroke="#D4AF37" strokeWidth="1" />
          </svg>
        </div>
        <NavLink to="/" className="flex flex-col items-center">
          <h1 className="text-2xl md:text-3xl font-black tracking-[0.2em] font-cinzel gold-gradient-text uppercase leading-none">
            Dharohar
          </h1>
          <span className="text-[8px] uppercase tracking-[0.3em] text-[#D4AF37]/70 font-sans mt-0.5">
            Digital Heritage Knowledge System
          </span>
        </NavLink>
      </div>

      {/* Right Controls / Cultural Status */}
      <div className="flex items-center justify-end flex-1 gap-4 md:gap-6">
        
        {/* Knowledge Graph Status */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-[#101017] border border-[#D4AF37]/20">
          <div className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full status-pulse"></div>
          <span className="heritage-badge text-zinc-400 text-[9px]">Knowledge Graph Live</span>
        </div>

        {/* Multi-Language Selector */}
        <button 
          onClick={cycleLanguage}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#101017] border border-[#D4AF37]/25 text-[#F5D77F] hover:border-[#D4AF37] transition-all text-xs font-semibold"
          title="Switch Language"
        >
          <Languages className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>{selectedLang}</span>
        </button>

        {/* Audio Immersion Toggle */}
        <button 
          onClick={() => setAudioActive(!audioActive)}
          className={`p-2 rounded-full border transition-all ${
            audioActive 
              ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-[#F5D77F] shadow-[0_0_15px_rgba(212,175,55,0.3)]' 
              : 'border-[#D4AF37]/20 bg-[#101017] text-zinc-400 hover:text-[#F5D77F] hover:border-[#D4AF37]/50'
          }`}
          title={audioActive ? "Mute Ambient Sitar" : "Play Ambient Temple Sitar"}
        >
          {audioActive ? <Volume2 className="w-4 h-4 text-[#D4AF37]" /> : <VolumeX className="w-4 h-4" />}
        </button>

      </div>

    </nav>
  );
}
