import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, X, Sparkles, Navigation, CornerDownLeft, SlidersHorizontal } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function HeroSearchBar({ 
  entities = [], 
  categoryColors = {}, 
  onSelectEntity, 
  activeEntity,
  onOpenPersonalize,
  userPreference,
  onResetPreference,
  filteredCount = 0
}) {
  const { t, translateEntityName, translateCategory, translateLocation, translateEntityDescription } = useLanguage();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchContainerRef = useRef(null);
  const inputRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update input text when activeEntity changes from map marker click
  useEffect(() => {
    if (activeEntity) {
      // Do not overwrite user query if currently typing
      if (!isOpen && !query) {
        // keep input clean or placeholder ready
      }
    }
  }, [activeEntity]);

  // Multilingual filtered results
  const results = query.trim() === ''
    ? []
    : entities.filter(entity => {
        const q = query.trim().toLowerCase();
        
        const rawName = (entity.name || '').toLowerCase();
        const transName = translateEntityName(entity.name, entity.location_context).toLowerCase();
        const rawCat = (entity.category_name || '').toLowerCase();
        const transCat = translateCategory(entity.category_name).toLowerCase();
        const rawLoc = (entity.location_context || '').toLowerCase();
        const transLoc = translateLocation(entity.location_context).toLowerCase();
        const rawDesc = (entity.description || '').toLowerCase();
        const transDesc = translateEntityDescription(
          entity.description,
          entity.name,
          entity.category_name,
          entity.location_context
        ).toLowerCase();

        return (
          rawName.includes(q) ||
          transName.includes(q) ||
          rawCat.includes(q) ||
          transCat.includes(q) ||
          rawLoc.includes(q) ||
          transLoc.includes(q) ||
          rawDesc.includes(q) ||
          transDesc.includes(q)
        );
      }).slice(0, 8); // Top 8 relevant results

  const handleSelect = (entity) => {
    if (!entity) return;
    const localizedTitle = translateEntityName(entity.name, entity.location_context);
    setQuery(localizedTitle);
    setIsOpen(false);
    setSelectedIndex(-1);
    if (onSelectEntity) {
      onSelectEntity(entity);
    }
  };

  const handleKeyDown = (e) => {
    if (!isOpen || results.length === 0) {
      if (e.key === 'ArrowDown' && results.length > 0) {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleSelect(results[selectedIndex]);
      } else if (results.length > 0) {
        handleSelect(results[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <div 
      ref={searchContainerRef}
      className="absolute top-24 left-4 sm:left-8 md:left-10 z-30 w-[calc(100vw-2rem)] sm:w-[420px] md:w-[460px] pointer-events-auto"
    >
      {/* Modern Integrated Search & Filter Command Bar */}
      <div 
        className={`relative dharohar-glass rounded-2xl border transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.7)] ${
          isOpen && results.length > 0 
            ? 'border-[#D4AF37] rounded-b-none bg-[#0D0D16]/95' 
            : 'border-[#D4AF37]/35 hover:border-[#D4AF37]/70 bg-[#0C0C14]/85'
        }`}
      >
        <div className="flex items-center px-3.5 py-2.5 gap-2.5">
          <Search className="w-4 h-4 text-[#D4AF37] shrink-0" />
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
              setSelectedIndex(-1);
            }}
            onFocus={() => {
              if (query.trim().length > 0) setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder={t('hero_search_placeholder')}
            className="w-full bg-transparent border-none outline-none text-xs sm:text-sm text-[#FFF8E7] placeholder:text-zinc-500 font-sans tracking-wide"
          />

          {/* Clear Button */}
          {query && (
            <button
              onClick={handleClear}
              className="p-1 rounded-full text-zinc-400 hover:text-[#FFF8E7] hover:bg-white/10 transition-colors"
              title="Clear"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Vertical Divider */}
          <div className="w-[1px] h-4 bg-white/15 shrink-0" />

          {/* Modern Personalize / Filter Button */}
          {onOpenPersonalize && (
            <button
              onClick={onOpenPersonalize}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 border ${
                userPreference?.isActive
                  ? 'bg-[#D4AF37]/25 border-[#F5D77F] text-[#F5D77F] shadow-[0_0_12px_rgba(212,175,55,0.3)]'
                  : 'bg-white/5 hover:bg-[#D4AF37]/20 border-white/10 hover:border-[#D4AF37]/50 text-zinc-300 hover:text-[#F5D77F]'
              }`}
              title="Personalize Map (Custom Location, Radius & Cultural Vibe)"
              aria-label="Personalize Map"
            >
              <SlidersHorizontal className={`w-3.5 h-3.5 ${userPreference?.isActive ? 'text-[#F5D77F]' : 'text-[#D4AF37]'}`} />
              <span className="text-[11px] sm:text-xs">Personalize</span>
              {userPreference?.isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              )}
            </button>
          )}

        </div>
      </div>

      {/* Active Personalization Chip (Attached directly beneath search bar) */}
      {userPreference?.isActive && (
        <div className="mt-2 animate-fade-in">
          <div className="dharohar-glass px-3.5 py-1.5 rounded-xl border border-[#D4AF37]/45 shadow-[0_6px_25px_rgba(0,0,0,0.7)] flex items-center justify-between gap-2 text-xs backdrop-blur-xl bg-[#0D0D18]/90">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping shrink-0" />
              <span className="text-[11px] text-zinc-300 truncate">
                Curated near <strong className="text-[#F5D77F]">{userPreference.locationLabel}</strong> ({filteredCount} sites)
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={onOpenPersonalize}
                className="px-2 py-0.5 rounded-lg bg-[#D4AF37]/20 hover:bg-[#D4AF37]/35 text-[#F5D77F] text-[10px] font-semibold border border-[#D4AF37]/30 transition-all cursor-pointer"
              >
                Change
              </button>
              {onResetPreference && (
                <button
                  onClick={onResetPreference}
                  className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                  title="Reset to all sites"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dropdown Results Menu */}
      {isOpen && query.trim().length > 0 && (
        <div className="dharohar-glass bg-[#0C0C14]/95 border-x border-b border-[#D4AF37] rounded-b-2xl shadow-[0_15px_40px_rgba(0,0,0,0.85)] max-h-80 overflow-y-auto no-scrollbar py-1.5 animate-fade-in-up divide-y divide-white/5">
          {results.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-xs text-zinc-400 mb-1">{t('hero_search_no_results')}</p>
              <span className="text-[10px] text-zinc-500 font-sans">{t('hero_search_hint')}</span>
            </div>
          ) : (
            results.map((entity, idx) => {
              const isSelected = idx === selectedIndex;
              const catColor = categoryColors[entity.category_name] || '#D4AF37';
              const localizedTitle = translateEntityName(entity.name, entity.location_context);
              const localizedCat = translateCategory(entity.category_name);
              const localizedLoc = translateLocation(entity.location_context);

              return (
                <div
                  key={entity.id}
                  onClick={() => handleSelect(entity)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`px-4 py-3 flex items-start justify-between gap-3 cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-[#D4AF37]/20 border-l-2 border-[#D4AF37]' 
                      : 'hover:bg-white/5 border-l-2 border-transparent'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    {/* Entity Title */}
                    <div className="flex items-center gap-2">
                      <span 
                        className="w-2 h-2 rounded-full shrink-0" 
                        style={{ backgroundColor: catColor, boxShadow: `0 0 6px ${catColor}` }}
                      />
                      <h4 className="text-xs sm:text-sm font-cinzel font-bold text-[#FFF8E7] truncate">
                        {localizedTitle}
                      </h4>
                    </div>

                    {/* Metadata Row: Category & Location */}
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-zinc-400">
                      <span 
                        className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border"
                        style={{
                          color: catColor,
                          borderColor: `${catColor}40`,
                          backgroundColor: `${catColor}15`
                        }}
                      >
                        {localizedCat}
                      </span>

                      {localizedLoc && (
                        <div className="flex items-center gap-1 text-zinc-400 truncate">
                          <MapPin className="w-3 h-3 text-[#D4AF37] shrink-0" />
                          <span className="truncate">{localizedLoc}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Fly-To Action Indicator */}
                  <div className="shrink-0 flex items-center gap-1 text-[10px] text-[#F5D77F] self-center">
                    <Navigation className="w-3.5 h-3.5 text-[#D4AF37]" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
