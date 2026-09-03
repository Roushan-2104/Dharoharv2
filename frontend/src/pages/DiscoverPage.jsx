import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, MapPin, ArrowRight, Sparkles, Filter, Landmark, Layers } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DiscoverPage() {
  const [entities, setEntities] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const jewelColors = {
    'Monuments & Temples': '#F59E0B',
    'Classical Dance & Music': '#0D9488',
    'Festivals & Rituals': '#E11D48',
    'Culinary Heritage': '#D97706',
    'Folk Traditions & Lore': '#8B5CF6',
    'Handicrafts & Handlooms': '#EC4899',
  };

  useEffect(() => {
    axios.get('http://localhost:3000/api/entities')
      .then(res => {
        setEntities(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const categories = ['All', ...Array.from(new Set(entities.map(e => e.category_name).filter(Boolean)))];

  // Filter based on search and category
  const filtered = entities.filter(e => {
    const matchesCategory = selectedCategory === 'All' || e.category_name === selectedCategory;
    const matchesSearch = 
      e.name.toLowerCase().includes(search.toLowerCase()) || 
      (e.category_name && e.category_name.toLowerCase().includes(search.toLowerCase())) ||
      (e.location_context && e.location_context.toLowerCase().includes(search.toLowerCase())) ||
      (e.description && e.description.toLowerCase().includes(search.toLowerCase()));
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
              Anusandhan • Cultural Repository
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-cinzel font-black text-[#FFF8E7] leading-tight mb-4 tracking-tight">
            Discover <span className="gold-gradient-text">India's Living</span> Heritage
          </h1>

          <p className="text-zinc-400 max-w-2xl text-base md:text-lg leading-relaxed">
            Traverse an interconnected knowledge graph uniting sacred temples, classical arts, oral traditions, festivals, and culinary lore into a cohesive living archive.
          </p>
          
          {/* Search & Filter Controls */}
          <div className="mt-8 flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-xl">
              <Search className="w-5 h-5 text-[#D4AF37] absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Search monuments, traditions, art forms, or regional stories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#101018] border border-[#D4AF37]/30 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-[#FFF8E7] placeholder:text-zinc-500 focus:outline-none focus:border-[#D4AF37] shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all"
              />
            </div>

            {/* Total Results Count */}
            <div className="text-right text-xs heritage-badge text-[#D4AF37]/80 self-center md:self-auto">
              Showing {filtered.length} Cultural Records
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="mt-6 flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {categories.map((cat) => {
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
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center text-center">
            <Sparkles className="w-10 h-10 text-[#D4AF37] animate-spin mb-4" />
            <span className="heritage-badge text-[#F5D77F]">Opening Cultural Archives...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-28 text-center dharohar-card rounded-3xl p-12 border border-[#D4AF37]/20">
            <Landmark className="w-12 h-12 text-[#D4AF37]/40 mx-auto mb-4" />
            <h3 className="font-cinzel text-xl text-[#FFF8E7] mb-2">No Heritage Records Found</h3>
            <p className="text-zinc-400 text-sm max-w-md mx-auto mb-6">
              We could not find records matching "{search}". Try searching for Konark, Odissi, Puri, or reset the filter.
            </p>
            <button
              onClick={() => { setSearch(''); setSelectedCategory('All'); }}
              className="px-6 py-2.5 rounded-full bg-[#D4AF37] text-[#08080C] font-semibold text-xs heritage-badge hover:bg-[#F5D77F] transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((entity) => {
              const catColor = jewelColors[entity.category_name] || '#D4AF37';

              return (
                <div 
                  key={entity.id}
                  className="dharohar-card rounded-3xl p-6 flex flex-col justify-between group transition-all duration-300 hover:-translate-y-1.5"
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
                        {entity.category_name || 'Heritage'}
                      </span>
                      
                      <div className="flex items-center gap-1.5 text-zinc-400 text-[11px]">
                        <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span className="truncate max-w-[140px]">{entity.location_context}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl md:text-2xl font-cinzel font-bold text-[#FFF8E7] group-hover:text-[#F5D77F] transition-colors mb-3 leading-snug">
                      {entity.name}
                    </h3>

                    {/* Description */}
                    <p className="text-zinc-300 text-xs md:text-sm leading-relaxed line-clamp-3 mb-6 font-sans">
                      {entity.description}
                    </p>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="pt-4 border-t border-[#D4AF37]/15 flex items-center justify-between">
                    <span className="text-[11px] text-zinc-500 font-mono">
                      Ref: #{entity.id.substring(0, 6)}
                    </span>

                    <button
                      onClick={() => navigate('/')}
                      className="flex items-center gap-2 text-xs font-semibold text-[#F5D77F] group-hover:text-[#D4AF37] transition-colors"
                    >
                      <span>Explore on Map</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
