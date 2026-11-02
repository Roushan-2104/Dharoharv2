import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import ChakraMark from '../Brand/ChakraMark';

const linkBase = 'inline-flex items-center min-h-[44px] text-[16px] font-medium transition-colors duration-short ease-out hover:text-mark';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const {
    language,
    setLanguage,
    t,
    setIsItineraryOpen,
    visitedSites,
    setIsPassportOpen,
    setIsQuizOpen,
    setActiveQuizEntity
  } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  // Close the phone menu whenever the route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const languageOptions = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'or', label: 'ଓଡ଼ିଆ' },
  ];

  const isHi = language === 'hi';
  const isOr = language === 'or';
  const passportTitle = isHi ? 'पासपोर्ट' : isOr ? 'ପାସପୋର୍ଟ' : 'Passport';
  const countryName = isHi ? 'भारत' : isOr ? 'ଭାରତ' : 'India';
  const menuLabel = isHi ? 'मेनू' : isOr ? 'ମେନୁ' : 'Menu';
  const closeLabel = t('panel_close');

  const handleOpenItinerary = () => {
    setMenuOpen(false);
    setIsItineraryOpen(true);
    if (window.location.pathname !== '/') {
      navigate('/');
    }
  };

  const handleOpenQuiz = () => {
    setMenuOpen(false);
    setActiveQuizEntity(null);
    setIsQuizOpen(true);
  };

  const handleOpenPassport = () => {
    setMenuOpen(false);
    setIsPassportOpen(true);
  };

  const navLinkClass = ({ isActive }) =>
    `${linkBase} ${isActive ? 'underline underline-offset-[0.32em] decoration-1' : ''}`;

  const passportButton = (extra = '') => (
    <button
      type="button"
      onClick={handleOpenPassport}
      className={`${linkBase} gap-2 cursor-pointer ${extra}`}
      aria-label={`${passportTitle}${visitedSites.length > 0 ? `, ${visitedSites.length}` : ''}`}
    >
      <span>{passportTitle}</span>
      {visitedSites.length > 0 && (
        <span className="font-display font-bold">{visitedSites.length}</span>
      )}
    </button>
  );

  const languageSwitch = (extra = '') => (
    <div role="group" aria-label={t('lang_switch_tooltip')} className={`flex items-center gap-5 ${extra}`}>
      {languageOptions.map(opt => (
        <button
          key={opt.code}
          type="button"
          lang={opt.code}
          onClick={() => setLanguage(opt.code)}
          aria-pressed={language === opt.code}
          aria-label={`Select ${opt.label}`}
          className={`${linkBase} cursor-pointer ${language === opt.code ? 'underline underline-offset-[0.32em] decoration-1' : ''}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );

  return (
    <header className="fixed top-0 left-0 z-50 w-full h-nav bg-paper text-ink">
      <div className="mx-auto h-full max-w-[1920px] px-4 md:px-8 xl:px-16 flex items-center gap-6 xl:gap-12">

        {/* Wordmark: the name over the country, beside the Chakra */}
        <NavLink
          to="/"
          aria-label={`${t('nav_title')}, ${countryName}`}
          className="inline-grid grid-cols-[auto_auto] gap-x-2.5 items-center font-display text-[22px] leading-[0.92] tracking-[-0.02em] shrink-0"
        >
          <ChakraMark className="row-span-2 w-[41px] h-[41px] text-mark" />
          <span className="font-bold">{t('nav_title')}</span>
          <span className="font-normal">{countryName}</span>
        </NavLink>

        {/* Desktop links */}
        <nav aria-label="Main" className="hidden lg:flex items-center gap-7 flex-1 min-w-0">
          <NavLink to="/" end className={navLinkClass}>{t('nav_map')}</NavLink>
          <NavLink to="/discover" className={navLinkClass}>{t('nav_discover')}</NavLink>
          <button type="button" onClick={handleOpenItinerary} className={`${linkBase} cursor-pointer whitespace-nowrap`}>
            {t('itinerary_btn')}
          </button>
          <button type="button" onClick={handleOpenQuiz} className={`${linkBase} cursor-pointer`}>
            {t('nav_quiz')}
          </button>
          <NavLink to="/contribute" className={navLinkClass}>{t('nav_contribute')}</NavLink>
        </nav>

        <div className="hidden lg:flex items-center gap-8 shrink-0">
          {passportButton()}
          {languageSwitch()}
        </div>

        {/* Phone and tablet: one menu button */}
        <button
          type="button"
          onClick={() => setMenuOpen(open => !open)}
          aria-expanded={menuOpen}
          aria-controls="site-menu"
          className="lg:hidden ml-auto min-h-[44px] px-4 bg-ink text-paper font-medium transition-colors duration-short ease-out hover:bg-ink-2 cursor-pointer"
        >
          {menuOpen ? closeLabel : menuLabel}
        </button>
      </div>

      {menuOpen && (
        <div
          id="site-menu"
          className="lg:hidden fixed inset-x-0 top-nav bottom-0 z-50 overflow-y-auto bg-paper px-4 md:px-8 pt-6 pb-10 flex flex-col gap-8"
        >
          <nav aria-label="Main" className="flex flex-col font-display font-bold text-4xl tracking-display leading-[1.15]">
            <NavLink to="/" end className={({ isActive }) => `py-1 hover:text-mark ${isActive ? 'text-mark' : ''}`}>{t('nav_map')}</NavLink>
            <NavLink to="/discover" className={({ isActive }) => `py-1 hover:text-mark ${isActive ? 'text-mark' : ''}`}>{t('nav_discover')}</NavLink>
            <button type="button" onClick={handleOpenItinerary} className="py-1 text-left hover:text-mark cursor-pointer">{t('itinerary_btn')}</button>
            <button type="button" onClick={handleOpenQuiz} className="py-1 text-left hover:text-mark cursor-pointer">{t('nav_quiz')}</button>
            <NavLink to="/contribute" className={({ isActive }) => `py-1 hover:text-mark ${isActive ? 'text-mark' : ''}`}>{t('nav_contribute')}</NavLink>
          </nav>
          {passportButton('self-start text-lg')}
          {languageSwitch('flex-wrap')}
        </div>
      )}
    </header>
  );
}
