import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, MapPin, ArrowRight, Sparkles, Landmark, Layers, X, ExternalLink, Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config/api';
import { useLanguage } from '../context/LanguageContext';

export default function DiscoverPage() {
  const { t, translateCategory, translateEntityName, translateLocation, translateEntityDescription } = useLanguage();
  const [entities, setEntities] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [activeModalEntity, setActiveModalEntity] = useState(null);
  const navigate = useNavigate();

  const jewelColors = {
    'Monuments & Temples': '#F59E0B',
    'Monument': '#F59E0B',
    'Classical Dance & Music': '#0D9488',
    'Art & Craft': '#0D9488',
    'Festivals & Rituals': '#E11D48',
    'Festival': '#E11D48',
    'Culinary Heritage': '#D97706',
    'Cuisine': '#D97706',
    'Folk Traditions & Lore': '#8B5CF6',
    'Tradition': '#8B5CF6',
    'Handicrafts & Handlooms': '#EC4899',
    'Historical Personality': '#3B82F6',
    'Legend & Story': '#8B5CF6',
    'Hidden Heritage': '#10B981'
  };

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

  return (
    <div className="pt-28 px-6 md:px-12 pb-32 min-h-screen">
      <div className="max-w-7xl mx-auto">
        
        {/* Editorial Header */}
        <div className="mb-14 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
            <span className="w-8 h-[1.5px] bg-[#D4AF37]" />
            <span className="heritage-badge text-[#F5D77F] tracking-[0.25em]">
              {t('discover_badge')}
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-cinzel font-black text-[#FFF8E7] leading-tight mb-4 tracking-tight">
            {t('discover_title')}
          </h1>

          <p className="text-zinc-400 max-w-2xl text-base md:text-lg leading-relaxed">
            {t('discover_subtitle')}
          </p>
          
          {/* Search & Filter Controls */}
          <div className="mt-8 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-xl">
              <Search className="w-5 h-5 text-[#D4AF37] absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder={t('discover_search_placeholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#101018] border border-[#D4AF37]/30 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-[#FFF8E7] placeholder:text-zinc-500 focus:outline-none focus:border-[#D4AF37] shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all"
              />
            </div>

            {/* Total Results Count */}
            <div className="text-right text-xs heritage-badge text-[#D4AF37]/80 self-center md:self-auto">
              {t('discover_showing')} {filtered.length} {t('discover_of')} {entities.length} {t('discover_entries')}
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="mt-6 flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {rawCategories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wider whitespace-nowrap transition-all border ${
                    isSelected 
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-[#08080C] font-bold border-[#F5D77F] shadow-[0_0_15px_rgba(212,175,55,0.3)]' 
                      : 'bg-[#12111A] text-zinc-400 border-white/5 hover:border-[#D4AF37]/30 hover:text-[#FFF8E7]'
                  }`}
                >
                  {translateCategory(cat)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center text-center">
            <Sparkles className="w-10 h-10 text-[#D4AF37] animate-spin mb-4" />
            <span className="heritage-badge text-[#F5D77F]">{t('discover_loading')}</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-28 text-center dharohar-card rounded-3xl p-12 border border-[#D4AF37]/20">
            <Landmark className="w-12 h-12 text-[#D4AF37]/40 mx-auto mb-4" />
            <h3 className="font-cinzel text-xl text-[#FFF8E7] mb-2">{t('discover_no_results')}</h3>
            <p className="text-zinc-400 text-sm max-w-md mx-auto mb-6">
              {search ? `"${search}"` : ''}
            </p>
            <button
              onClick={() => { setSearch(''); setSelectedCategory('All'); }}
              className="px-6 py-2.5 rounded-full bg-[#D4AF37] text-[#08080C] font-semibold text-xs heritage-badge hover:bg-[#F5D77F] transition-colors"
            >
              {t('discover_clear_search')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((entity) => {
              const catColor = jewelColors[entity.category_name] || '#D4AF37';
              const localizedName = translateEntityName(entity.name, entity.location_context);
              const localizedCat = translateCategory(entity.category_name) || t('cat_heritage');
              const localizedLoc = translateLocation(entity.location_context) || t('panel_verified');
              const localizedDesc = translateEntityDescription(entity.description, entity.name, entity.category_name, entity.location_context);

              return (
                <div 
                  key={entity.id}
                  onClick={() => setActiveModalEntity(entity)}
                  className="dharohar-card rounded-3xl p-6 flex flex-col justify-between group transition-all duration-300 hover:-translate-y-1.5 cursor-pointer"
                >
                  <div>
                    {/* Top Row: Category Pill & Location */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span 
                        className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border"
                        style={{ 
                          borderColor: `${catColor}40`,
                          backgroundColor: `${catColor}15`,
                          color: catColor
                        }}
                      >
                        {localizedCat}
                      </span>
                      
                      <div className="flex items-center gap-1.5 text-zinc-400 text-[11px]">
                        <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span className="truncate max-w-[140px]">{localizedLoc}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl md:text-2xl font-cinzel font-bold text-[#FFF8E7] group-hover:text-[#F5D77F] transition-colors mb-3 leading-snug">
                      {localizedName}
                    </h3>

                    {/* Localized Description */}
                    <p className="text-zinc-300 text-xs md:text-sm leading-relaxed line-clamp-3 mb-6 font-sans">
                      {localizedDesc}
                    </p>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="pt-4 border-t border-[#D4AF37]/15 flex items-center justify-between">
                    <span className="text-[11px] text-[#D4AF37]/80 flex items-center gap-1 font-medium">
                      <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                      <span>{t('panel_verified')}</span>
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/', { state: { selectedEntityId: entity.id, selectedEntity: entity } });
                      }}
                      className="flex items-center gap-2 text-xs font-semibold text-[#F5D77F] group-hover:text-[#D4AF37] transition-colors"
                      aria-label={`${t('discover_view_map')}: ${localizedName}`}
                    >
                      <span>{t('discover_view_map')}</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* Multilingual Entity Detail Inspection Modal */}
        {activeModalEntity && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <div className="bg-[#0D0D14] border border-[#D4AF37]/40 rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-[0_10px_50px_rgba(0,0,0,0.8)] relative max-h-[90vh] overflow-y-auto">
              
              {/* Close Button */}
              <button
                onClick={() => setActiveModalEntity(null)}
                className="absolute top-6 right-6 text-zinc-400 hover:text-[#FFF8E7] bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors"
                title={t('discover_close_modal')}
                aria-label={t('discover_close_modal')}
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Category & Location */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span 
                  className="text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#F5D77F]"
                >
                  {translateCategory(activeModalEntity.category_name)}
                </span>
                <div className="flex items-center gap-1.5 text-zinc-400 text-xs">
                  <MapPin className="w-4 h-4 text-[#D4AF37]" />
                  <span>{translateLocation(activeModalEntity.location_context) || t('panel_verified')}</span>
                </div>
              </div>

              {/* Modal Title */}
              <h2 className="text-2xl md:text-4xl font-cinzel font-black text-[#FFF8E7] mb-4">
                {translateEntityName(activeModalEntity.name, activeModalEntity.location_context)}
              </h2>

              {/* Modal Description */}
              <div className="my-6 p-5 rounded-2xl bg-[#141420] border border-white/5 text-zinc-200 text-sm md:text-base leading-relaxed">
                <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>{t('discover_card_lore')}</span>
                </div>
                <p>
                  {translateEntityDescription(
                    activeModalEntity.description,
                    activeModalEntity.name,
                    activeModalEntity.category_name,
                    activeModalEntity.location_context
                  )}
                </p>
              </div>

              {/* Verified Status Banner */}
              <div className="mb-6 flex items-center justify-between text-xs text-zinc-400 bg-black/40 px-4 py-2.5 rounded-xl border border-white/5">
                <span className="flex items-center gap-1.5 text-[#10B981]">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  {t('panel_verified')}
                </span>
                <span>{translateLocation(activeModalEntity.location_context)}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-white/10">
                <button
                  onClick={() => setActiveModalEntity(null)}
                  className="px-5 py-2.5 rounded-xl border border-white/10 text-zinc-400 hover:text-white text-xs font-semibold transition-colors"
                >
                  {t('discover_close_modal')}
                </button>
                <button
                  onClick={() => {
                    const targetEntity = activeModalEntity;
                    setActiveModalEntity(null);
                    navigate('/', { state: { selectedEntityId: targetEntity.id, selectedEntity: targetEntity } });
                  }}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-[#08080C] text-xs font-bold shadow-[0_0_20px_rgba(212,175,55,0.4)] flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                >
                  <Compass className="w-4 h-4" />
                  <span>{t('discover_modal_explore')}</span>
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
