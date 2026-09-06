import React, { useRef, useEffect, useState } from 'react';
import { Sparkles, Landmark, Music, Utensils, Calendar, Scroll, Layers, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function BottomHUD({ activeCategory, setActiveCategory, categories, categoryColors = {}, setActiveEntity }) {
  const { t, translateCategory } = useLanguage();
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  
  // Helper to assign a cultural icon to category name
  const getCategoryIcon = (category) => {
    const catLower = category.toLowerCase();
    if (catLower === 'all') return <Layers className="w-3.5 h-3.5" />;
    if (catLower.includes('monument') || catLower.includes('temple') || catLower.includes('architecture')) return <Landmark className="w-3.5 h-3.5" />;
    if (catLower.includes('dance') || catLower.includes('music') || catLower.includes('art') || catLower.includes('performing')) return <Music className="w-3.5 h-3.5" />;
    if (catLower.includes('food') || catLower.includes('culinary') || catLower.includes('cuisine')) return <Utensils className="w-3.5 h-3.5" />;
    if (catLower.includes('festival') || catLower.includes('fair') || catLower.includes('event')) return <Calendar className="w-3.5 h-3.5" />;
    if (catLower.includes('story') || catLower.includes('oral') || catLower.includes('myth') || catLower.includes('tradition')) return <Scroll className="w-3.5 h-3.5" />;
    return <Sparkles className="w-3.5 h-3.5" />;
  };

  // Check scroll positions for chevron visibility
  const checkScroll = () => {
    const el = scrollRef.current;
    if (el) {
      setCanScrollLeft(el.scrollLeft > 5);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5);
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    // Convert vertical mouse wheel into horizontal scroll & isolate from 3D canvas
    const handleWheel = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      el.scrollLeft += delta * 1.2;
      checkScroll();
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    checkScroll();
    window.addEventListener('resize', checkScroll);

    return () => {
      el.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', checkScroll);
    };
  }, [categories]);

  const scrollByAmount = (amount) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex flex-col items-center gap-2.5">
      
      {/* Heritage Categories Subtitle Label */}
      <div className="flex items-center gap-2 px-3.5 py-1 rounded-full dharohar-glass border border-[#D4AF37]/30 shadow-md">
        <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse"></span>
        <span className="heritage-badge text-[9px] text-[#F5D77F] tracking-[0.25em]">
          {t('hud_subtitle')}
        </span>
      </div>

      {/* Floating Filter Bar with Horizontal Mouse Wheel Scroll */}
      <div 
        className="pointer-events-auto dharohar-glass flex items-center p-1.5 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.7)] border border-[#D4AF37]/30 relative max-w-[92vw] sm:max-w-[75vw]"
        onWheel={(e) => {
          e.stopPropagation();
        }}
      >
        {/* Left Scroll Arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scrollByAmount(-180)}
            className="p-1 rounded-xl bg-[#12121E]/90 hover:bg-[#D4AF37]/20 text-[#F5D77F] border border-[#D4AF37]/30 transition-all mr-1 shrink-0 cursor-pointer shadow-md"
            title="Scroll Left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Scrollable Container */}
        <div 
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-1.5 px-1.5 pb-1 overflow-x-auto hud-scrollbar scroll-smooth"
        >
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            const dotColor = categoryColors[cat] || '#D4AF37';
            const translatedCat = translateCategory(cat);

            return (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setActiveEntity(null);
                }}
                className={`flex items-center gap-2 whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wider transition-all duration-300 border cursor-pointer ${
                  isActive 
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-[#08080C] font-bold border-[#F5D77F] shadow-[0_0_20px_rgba(212,175,55,0.4)] scale-105' 
                    : 'bg-[#101017]/70 text-zinc-300 border-white/5 hover:border-[#D4AF37]/40 hover:text-[#F5D77F]'
                }`}
              >
                {/* Category Icon */}
                <span className={isActive ? 'text-[#08080C]' : 'text-[#D4AF37]'}>
                  {getCategoryIcon(cat)}
                </span>

                <span>{translatedCat}</span>

                {/* Jewel Tone Dot */}
                {cat !== 'All' && (
                  <span 
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ 
                      backgroundColor: isActive ? '#08080C' : dotColor,
                      boxShadow: isActive ? 'none' : `0 0 8px ${dotColor}`
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Right Scroll Arrow */}
        {canScrollRight && (
          <button
            onClick={() => scrollByAmount(180)}
            className="p-1 rounded-xl bg-[#12121E]/90 hover:bg-[#D4AF37]/20 text-[#F5D77F] border border-[#D4AF37]/30 transition-all ml-1 shrink-0 cursor-pointer shadow-md"
            title="Scroll Right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
