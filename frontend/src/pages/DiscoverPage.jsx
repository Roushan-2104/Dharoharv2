import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config/api';
import { useLanguage } from '../context/LanguageContext';
import { getRegionalFoodsForEntity } from '../utils/regionalFoods';

export default function DiscoverPage() {
  const {
    language,
    t,
    translateCategory,
    translateEntityName,
    translateLocation,
    translateEntityDescription,
    openChatWithQuery,
    visitedSites,
    toggleVisited,
    isVisited,
    setIsPassportOpen
  } = useLanguage();
  const [entities, setEntities] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [activeModalEntity, setActiveModalEntity] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/entities`)
      .then(res => {
        setEntities(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const rawCategories = ['All', ...Array.from(new Set(entities.map(e => e.category_name).filter(Boolean)))];

  // Filter based on multilingual search and category
  const filtered = entities.filter(e => {
    const matchesCategory = selectedCategory === 'All' || e.category_name === selectedCategory;

    const query = search.trim().toLowerCase();
    if (!query) return matchesCategory;

    // Multilingual search matching across English and Indic translations
    const rawName = (e.name || '').toLowerCase();
    const transName = translateEntityName(e.name, e.location_context).toLowerCase();
    const rawCat = (e.category_name || '').toLowerCase();
    const transCat = translateCategory(e.category_name).toLowerCase();
    const rawLoc = (e.location_context || '').toLowerCase();
    const transLoc = translateLocation(e.location_context).toLowerCase();
    const rawDesc = (e.description || '').toLowerCase();
    const transDesc = translateEntityDescription(e.description, e.name, e.category_name, e.location_context).toLowerCase();

    const matchesSearch =
      rawName.includes(query) ||
      transName.includes(query) ||
      rawCat.includes(query) ||
      transCat.includes(query) ||
      rawLoc.includes(query) ||
      transLoc.includes(query) ||
      rawDesc.includes(query) ||
      transDesc.includes(query);

    return matchesCategory && matchesSearch;
  });

  const textButton = 'min-h-[44px] text-base font-medium underline underline-offset-[0.32em] decoration-1 hover:text-mark transition-colors duration-short ease-out cursor-pointer';

  return (
    <div className="pt-[var(--nav-height)] pb-32 min-h-screen bg-paper text-ink">
      <div className="mx-auto max-w-[1440px] px-4 md:px-16">

        {/* Poster header */}
        <header className="pt-16 md:pt-24 mb-12">
          <h1 className="font-display font-bold tracking-poster leading-[0.9] text-6xl md:text-8xl text-ink max-w-[14ch]">
            {t('discover_title')}
          </h1>

          <p className="mt-8 max-w-2xl text-lg text-ink-2">
            {t('discover_subtitle')}
          </p>
        </header>

        {/* Index: search, count, categories */}
        <section className="mb-12">
          <input
            type="text"
            placeholder={t('discover_search_placeholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label={t('discover_search_placeholder')}
            className="w-full bg-transparent border-0 border-b border-muted px-0 py-3 font-display font-bold text-3xl text-ink placeholder:text-muted focus:outline-none focus-visible:border-ink transition-colors duration-short ease-out"
          />

          {/* Total Results Count */}
          <p className="mt-4 text-[15px] font-medium text-muted">
            {t('discover_showing')} {filtered.length} {t('discover_of')} {entities.length} {t('discover_entries')}
          </p>

          {/* Category filters, set as big type */}
          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-1">
            {rawCategories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  aria-pressed={isSelected}
                  className={`min-h-[44px] text-left font-display font-bold text-2xl md:text-3xl transition-colors duration-short ease-out ${
                    isSelected ? 'text-mark' : 'text-ink hover:text-mark'
                  }`}
                >
                  {translateCategory(cat)}
                </button>
              );
            })}
          </div>
        </section>

        {/* Results index */}
        {loading ? (
          <div className="py-24 border-t border-rule">
            <p className="text-lg text-muted" role="status">{t('discover_loading')}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 border-t border-rule">
            <h3 className="font-display font-bold text-3xl text-ink mb-3">{t('discover_no_results')}</h3>
            <p className="text-lg text-ink-2 mb-8">
              {search ? `"${search}"` : ''}
            </p>
            <button
              onClick={() => { setSearch(''); setSelectedCategory('All'); }}
              className="inline-flex items-center justify-center min-h-[48px] px-6 bg-ink text-paper font-medium hover:bg-ink-2 transition-colors duration-short ease-out"
            >
              {t('discover_clear_search')}
            </button>
          </div>
        ) : (
          <ul className="border-t border-rule">
            {filtered.map((entity) => {
              const localizedName = translateEntityName(entity.name, entity.location_context);
              const localizedCat = translateCategory(entity.category_name) || t('cat_heritage');
              const localizedLoc = translateLocation(entity.location_context) || t('panel_verified');
              const localizedDesc = translateEntityDescription(entity.description, entity.name, entity.category_name, entity.location_context);

              return (
                <li
                  key={entity.id}
                  onClick={() => setActiveModalEntity(entity)}
                  className="group border-b border-rule py-8 grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-4 cursor-pointer"
                >
                  <div className="md:col-span-8 min-w-0">
                    <h3 className="font-display font-bold text-2xl md:text-3xl text-ink group-hover:text-mark transition-colors duration-short ease-out">
                      {localizedName}
                    </h3>

                    <p className="mt-2 flex flex-wrap gap-x-6 text-[15px] font-medium text-muted">
                      <span>{localizedCat}</span>
                      <span>{localizedLoc}</span>
                      {isVisited(entity.id) && (
                        <span className="text-mark">Visited</span>
                      )}
                    </p>

                    <p className="mt-3 text-base text-ink-2 line-clamp-2 max-w-3xl">
                      {localizedDesc}
                    </p>
                  </div>

                  <div className="md:col-span-4 flex flex-wrap items-start md:justify-end gap-x-8 gap-y-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleVisited(entity);
                      }}
                      aria-pressed={isVisited(entity.id)}
                      className={`${textButton} ${isVisited(entity.id) ? 'text-mark' : 'text-ink'}`}
                      title={isVisited(entity.id) ? "In Visited Passport" : "Mark as Visited"}
                    >
                      {isVisited(entity.id) ? 'Visited' : 'Mark Visited'}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/', { state: { selectedEntityId: entity.id, selectedEntity: entity } });
                      }}
                      className={`${textButton} text-ink`}
                      aria-label={`${t('discover_view_map')}: ${localizedName}`}
                    >
                      {t('discover_view_map')}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {/* Multilingual Entity Detail Inspection Modal */}
        {activeModalEntity && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[color-mix(in_oklab,var(--color-ink)_55%,transparent)]">
            <div className="bg-paper text-ink max-w-[960px] w-full p-6 md:p-12 relative max-h-[90vh] overflow-y-auto">

              {/* Close Button */}
              <button
                onClick={() => setActiveModalEntity(null)}
                className={`${textButton} absolute top-4 right-4 md:top-8 md:right-8 px-2 text-ink`}
                title={t('discover_close_modal')}
                aria-label={t('discover_close_modal')}
              >
                {t('discover_close_modal')}
              </button>

              {/* Modal Title */}
              <h2 className="font-display font-bold text-4xl md:text-5xl text-ink pr-24">
                {translateEntityName(activeModalEntity.name, activeModalEntity.location_context)}
              </h2>

              {/* Modal Category & Location & Passport Status */}
              <p className="mt-4 flex flex-wrap gap-x-6 text-[15px] font-medium text-muted">
                <span>{translateCategory(activeModalEntity.category_name)}</span>
                <span>{translateLocation(activeModalEntity.location_context) || t('panel_verified')}</span>
                {isVisited(activeModalEntity.id) && (
                  <span className="text-mark">Stamped in Passport</span>
                )}
              </p>

              {/* Modal Description */}
              <div className="mt-10 pt-6 border-t border-rule">
                <h3 className="font-display font-bold text-3xl text-ink mb-4">
                  {t('discover_card_lore')}
                </h3>
                <p className="text-lg text-ink-2 max-w-3xl">
                  {translateEntityDescription(
                    activeModalEntity.description,
                    activeModalEntity.name,
                    activeModalEntity.category_name,
                    activeModalEntity.location_context
                  )}
                </p>
              </div>

              {/* Verified Status */}
              <p className="mt-6 flex flex-wrap gap-x-6 text-[15px] font-medium text-muted">
                <span>{t('panel_verified')}</span>
                <span>{translateLocation(activeModalEntity.location_context)}</span>
              </p>

              {/* Famous Regional Food Delicacies */}
              {(() => {
                const foodProfile = getRegionalFoodsForEntity(activeModalEntity);
                const isHi = language === 'hi';
                const isOr = language === 'or';
                if (!foodProfile) return null;

                return (
                  <div className="mt-10 pt-6 border-t border-rule">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 mb-2">
                      <h3 className="font-display font-bold text-3xl text-ink">
                        {isHi ? 'यहाँ का प्रसिद्ध खान-पान' : isOr ? 'ଏହି ସ୍ଥାନର ପ୍ରସିଦ୍ଧ ଖାଦ୍ୟ' : 'Famous Local Foods of this Region'}
                      </h3>
                      <span className="text-[15px] font-medium text-muted">
                        {isHi ? foodProfile.regionNameHi : isOr ? foodProfile.regionNameOr : foodProfile.regionName}
                      </span>
                    </div>

                    <ul>
                      {foodProfile.dishes.map((dish, i) => {
                        const dishTitle = isHi ? dish.nameHi : isOr ? dish.nameOr : dish.name;
                        const dishType = isHi ? dish.typeHi : isOr ? dish.typeOr : dish.type;
                        return (
                          <li key={i} className="py-4 border-b border-rule grid grid-cols-1 sm:grid-cols-12 gap-x-6 gap-y-1">
                            <div className="sm:col-span-9 min-w-0">
                              <div className="flex flex-wrap items-baseline gap-x-4">
                                <span className="font-display font-bold text-xl text-ink">{dishTitle}</span>
                                <span className="text-[15px] font-medium text-muted">{dishType}</span>
                              </div>
                              <p className="mt-1 text-base text-ink-2 line-clamp-2">
                                {isHi ? dish.descriptionHi : isOr ? dish.descriptionOr : dish.description}
                              </p>
                            </div>
                            <div className="sm:col-span-3 sm:text-right">
                              <button
                                onClick={() => {
                                  const q = isHi
                                    ? `${dishTitle} की रेसिपी और ${translateEntityName(activeModalEntity.name, activeModalEntity.location_context)} में इसे खाने की जगह बताएं।`
                                    : `Tell me about the recipe and where to eat authentic ${dishTitle} in ${translateEntityName(activeModalEntity.name, activeModalEntity.location_context)}.`;
                                  setActiveModalEntity(null);
                                  openChatWithQuery(q);
                                }}
                                className={`${textButton} text-ink`}
                              >
                                Ask AI Guide
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })()}

              {/* Action Buttons */}
              <div className="mt-10 flex flex-col sm:flex-row gap-3 sm:justify-end">
                <button
                  onClick={() => toggleVisited(activeModalEntity)}
                  aria-pressed={isVisited(activeModalEntity.id)}
                  className={`inline-flex items-center justify-center min-h-[48px] px-6 border border-ink bg-paper font-medium hover:bg-paper-2 transition-colors duration-short ease-out cursor-pointer ${
                    isVisited(activeModalEntity.id) ? 'text-mark' : 'text-ink'
                  }`}
                >
                  {isVisited(activeModalEntity.id) ? 'Visited (In Passport)' : 'Mark as Visited'}
                </button>

                <button
                  onClick={() => {
                    const targetEntity = activeModalEntity;
                    setActiveModalEntity(null);
                    navigate('/', { state: { selectedEntityId: targetEntity.id, selectedEntity: targetEntity } });
                  }}
                  className="inline-flex items-center justify-center min-h-[48px] px-6 bg-ink text-paper font-medium hover:bg-ink-2 transition-colors duration-short ease-out cursor-pointer"
                >
                  {t('discover_modal_explore')}
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
