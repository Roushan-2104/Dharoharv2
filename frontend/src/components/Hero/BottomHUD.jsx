import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

// The index of kinds: each category set as a word in the display face with its count;
// the chosen one turns mark red.
export default function BottomHUD({ activeCategory, setActiveCategory, categories, setActiveEntity, entities = [], onPreview }) {
  const { t, translateCategory } = useLanguage();

  const countFor = (cat) =>
    cat === 'All' ? entities.length : entities.filter(e => e.category_name === cat).length;

  return (
    <nav aria-label={t('hud_subtitle')}>
      <ul className="flex flex-wrap gap-x-5 gap-y-1 font-display font-bold tracking-display text-[clamp(1.5rem,2.1vw,2rem)] leading-[1.18]">
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <li key={cat}>
              <button
                type="button"
                onClick={() => {
                  setActiveCategory(cat);
                  setActiveEntity(null);
                  onPreview?.(null);
                }}
                // Hovering or focusing a kind lights its places on the globe before choosing it
                onMouseEnter={() => onPreview?.(cat)}
                onMouseLeave={() => onPreview?.(null)}
                onFocus={() => onPreview?.(cat)}
                onBlur={() => onPreview?.(null)}
                aria-pressed={isActive}
                className={`text-left min-h-[44px] transition-colors duration-short ease-out cursor-pointer hover:text-mark ${
                  isActive ? 'text-mark' : 'text-ink'
                }`}
              >
                {translateCategory(cat)}{' '}
                <span className="font-normal">{countFor(cat)}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
