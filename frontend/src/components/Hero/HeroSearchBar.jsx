import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
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
      className="relative w-full"
    >
      {/* Search: an underline field set in the display face */}
      <div className="flex items-end gap-4">
        <div className="relative flex-1 min-w-0 flex items-center border-b border-muted focus-within:border-ink transition-colors duration-short ease-out">
          <Search className="w-5 h-5 text-muted shrink-0" aria-hidden="true" />
          <label htmlFor="hero-search" className="sr-only-grid">{t('hero_search_placeholder')}</label>
          <input
            id="hero-search"
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
            className="w-full min-w-0 bg-transparent border-0 outline-none px-3 py-2 font-display font-bold tracking-display text-2xl text-ink placeholder:text-muted placeholder:font-sans placeholder:font-normal placeholder:text-base placeholder:tracking-normal"
            role="combobox"
            aria-expanded={isOpen && query.trim().length > 0}
            aria-controls="hero-search-results"
            aria-autocomplete="list"
          />

          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="w-11 h-11 flex items-center justify-center text-muted hover:text-ink transition-colors duration-short ease-out cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {onOpenPersonalize && (
          <button
            type="button"
            onClick={onOpenPersonalize}
            className="min-h-[44px] shrink-0 font-medium underline underline-offset-[0.32em] decoration-1 hover:text-mark transition-colors duration-short ease-out cursor-pointer"
            aria-label="Personalize Map"
          >
            Personalize
          </button>
        )}
      </div>

      {/* The personalized view, stated in a line with its two actions */}
      {userPreference?.isActive && (
        <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-[15px]">
          <span className="text-ink-2">
            Curated near <strong className="font-medium text-ink">{userPreference.locationLabel}</strong>, {filteredCount} sites
          </span>
          <button
            type="button"
            onClick={onOpenPersonalize}
            className="font-medium underline underline-offset-[0.32em] decoration-1 hover:text-mark transition-colors duration-short ease-out cursor-pointer"
          >
            Change
          </button>
          {onResetPreference && (
            <button
              type="button"
              onClick={onResetPreference}
              className="font-medium underline underline-offset-[0.32em] decoration-1 hover:text-mark transition-colors duration-short ease-out cursor-pointer"
            >
              Reset to all sites
            </button>
          )}
        </div>
      )}

      {/* Results: a ruled list under the field */}
      {isOpen && query.trim().length > 0 && (
        <div
          id="hero-search-results"
          role="listbox"
          className="absolute left-0 right-0 top-full z-40 bg-paper max-h-96 overflow-y-auto border-b border-rule"
        >
          {results.length === 0 ? (
            <div className="py-4">
              <p className="text-ink-2">{t('hero_search_no_results')}</p>
              <p className="mt-1 text-[15px] text-muted">{t('hero_search_hint')}</p>
            </div>
          ) : (
            results.map((entity, idx) => {
              const isSelected = idx === selectedIndex;
              const localizedTitle = translateEntityName(entity.name, entity.location_context);
              const localizedCat = translateCategory(entity.category_name);
              const localizedLoc = translateLocation(entity.location_context);

              return (
                <div
                  key={entity.id}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(entity)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`py-3 border-t border-rule cursor-pointer transition-colors duration-short ease-out ${
                    isSelected ? 'text-mark' : 'text-ink'
                  }`}
                >
                  <div className="font-display font-bold tracking-display text-xl leading-tight">
                    {localizedTitle}
                  </div>
                  <div className="mt-1 text-[15px] text-muted">
                    {localizedCat}{localizedLoc ? `, ${localizedLoc}` : ''}
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
