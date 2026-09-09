import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Compass, Map, Feather, Sparkles, Languages, Check, Award } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function Navbar() {
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const { 
    language, 
    setLanguage, 
    t, 
    setIsItineraryOpen, 
    visitedSites, 
    setIsPassportOpen 
  } = useLanguage();
  const navigate = useNavigate();

  const languageOptions = [
    { code: 'en', label: 'English', short: 'EN' },
    { code: 'hi', label: 'हिन्दी', short: 'हि' },
    { code: 'or', label: 'ଓଡ଼ିଆ', short: 'ଓଡ଼ି' },
  ];

  const currentOption = languageOptions.find(l => l.code === language) || languageOptions[0];

  const handleOpenItinerary = () => {
    setIsItineraryOpen(true);
    if (window.location.pathname !== '/') {
      navigate('/');
    }
  };

  const isHi = language === 'hi';
  const isOr = language === 'or';
  const passportTitle = isHi ? 'पासपोर्ट' : isOr ? 'ପାସପୋର୍ଟ' : 'Passport';

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
          <span>{t('nav_map')}</span>
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
          <span>{t('nav_discover')}</span>
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
          <span>{t('nav_contribute')}</span>
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
            {t('nav_title')}
          </h1>
          <span className="text-[8px] uppercase tracking-[0.3em] text-[#D4AF37]/70 font-sans mt-0.5">
            {t('nav_subtitle')}
          </span>
        </NavLink>
      </div>

      {/* Right Controls / Cultural Status */}
      <div className="flex items-center justify-end flex-1 gap-2.5 sm:gap-3.5 md:gap-4">
        
        {/* Visited Sites Passport Action Button */}
        <button
          onClick={() => setIsPassportOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#D4AF37]/40 text-[#FFF8E7] hover:text-[#F5D77F] bg-[#141224]/90 hover:bg-[#D4AF37]/20 shadow-[0_0_12px_rgba(212,175,55,0.15)] transition-all transform hover:scale-105 cursor-pointer"
          title="Visited Heritage Sites Passport"
          aria-label="Visited Heritage Sites Passport"
        >
          <Award className="w-3.5 h-3.5 text-[#F5D77F]" />
          <span className="heritage-badge text-xs text-[#F5D77F] font-semibold tracking-wide hidden sm:inline">
            {passportTitle}
          </span>
          {visitedSites.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-[#D4AF37] text-[#08080C] text-[10px] font-black leading-tight">
              {visitedSites.length}
            </span>
          )}
        </button>

        {/* Itinerary Action Button */}
        <button
          onClick={handleOpenItinerary}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#D4AF37]/40 text-[#FFF8E7] hover:text-[#F5D77F] bg-[#12121E]/90 hover:bg-[#D4AF37]/20 shadow-[0_0_12px_rgba(212,175,55,0.2)] transition-all transform hover:scale-105 cursor-pointer"
          title={t('itinerary_btn')}
          aria-label={t('itinerary_btn')}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
          <span className="heritage-badge text-xs text-[#F5D77F] font-semibold tracking-wide hidden sm:inline">
            {t('itinerary_btn')}
          </span>
        </button>

        {/* Multi-Language Selector Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setLangMenuOpen(!langMenuOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#101017] border border-[#D4AF37]/35 text-[#F5D77F] hover:border-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.15)] transition-all text-xs font-semibold cursor-pointer"
            title={t('lang_switch_tooltip')}
            aria-label={t('lang_switch_tooltip')}
            aria-expanded={langMenuOpen}
          >
            <Languages className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{currentOption.label}</span>
          </button>

          {/* Language Options Dropdown Menu */}
          {langMenuOpen && (
            <div className="absolute right-0 mt-2 w-36 rounded-xl dharohar-glass border border-[#D4AF37]/40 shadow-[0_10px_30px_rgba(0,0,0,0.8)] py-1.5 z-50 animate-fade-in-up">
              {languageOptions.map(opt => (
                <button
                  key={opt.code}
                  onClick={() => {
                    setLanguage(opt.code);
                    setLangMenuOpen(false);
                  }}
                  aria-label={`Select ${opt.label}`}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-medium transition-colors cursor-pointer ${
                    language === opt.code
                      ? 'text-[#F5D77F] bg-[#D4AF37]/20 font-bold'
                      : 'text-zinc-300 hover:text-[#F5D77F] hover:bg-white/5'
                  }`}
                >
                  <span>{opt.label}</span>
                  {language === opt.code && <Check className="w-3.5 h-3.5 text-[#D4AF37]" />}
                </button>
              ))}
            </div>
          )}
        </div>

      </div>

    </nav>
  );
}
