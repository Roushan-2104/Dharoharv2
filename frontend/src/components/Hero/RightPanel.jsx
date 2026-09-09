import React, { useState, useEffect } from 'react';
import { 
  X, ExternalLink, Image as ImageIcon, Sparkles, MapPin, 
  ShieldCheck, Compass, ArrowRight, Bot, Layers, Music, 
  Landmark, Utensils, Anchor, Crown, GitFork 
} from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import { useLanguage } from '../../context/LanguageContext';

export default function RightPanel({ activeEntity, setActiveEntity }) {
  const { 
    language, 
    t, 
    translateCategory, 
    translateEntityName, 
    translateLocation, 
    translateEntityDescription,
    openChatWithQuery
  } = useLanguage();

  const [wikiImage, setWikiImage] = useState(null);
  const [loadingImg, setLoadingImg] = useState(false);
  const [connections, setConnections] = useState([]);
  const [loadingConnections, setLoadingConnections] = useState(false);

  // Fetch Wikipedia photography and Semantic Cultural Connections
  useEffect(() => {
    if (!activeEntity) return;

    setWikiImage(null);
    setLoadingImg(true);
    setConnections([]);
    setLoadingConnections(true);
    
    // 1. Wikipedia Photographic Asset Resolution
    const searchQuery = encodeURIComponent(activeEntity.name);
    axios.get(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${searchQuery}&utf8=&format=json&origin=*`)
      .then(searchRes => {
        if (searchRes.data.query.search.length > 0) {
          const exactTitle = searchRes.data.query.search[0].title;
          return axios.get(`https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&titles=${encodeURIComponent(exactTitle)}&pithumbsize=1200&format=json&origin=*`);
        }
        throw new Error("No Wikipedia page found");
      })
      .then(imageRes => {
        const pages = imageRes.data.query.pages;
        const pageId = Object.keys(pages)[0];
        
        if (pages[pageId].thumbnail && pages[pageId].thumbnail.source) {
          setWikiImage(pages[pageId].thumbnail.source);
        }
      })
      .catch(() => {
        // Silently fallback to placeholder
      })
      .finally(() => {
        setLoadingImg(false);
      });

    // 2. Fetch Curated Semantic Cultural Relationships from Knowledge Graph
    axios.get(`${API_BASE_URL}/api/entities/${activeEntity.id}/connections`)
      .then(res => {
        setConnections(res.data || []);
      })
      .catch(err => {
        console.error("Error fetching cultural relationships:", err);
      })
      .finally(() => {
        setLoadingConnections(false);
      });

  }, [activeEntity, language]);

  if (!activeEntity) return null;

  const handleHopNode = (targetNode) => {
    if (!targetNode) return;
    setActiveEntity(targetNode);
  };

  const handleAskAI = () => {
    const localizedName = translateEntityName(activeEntity.name, activeEntity.location_context);
    const query = language === 'hi'
      ? `${localizedName} के इतिहास, वास्तुकला और पावन लोककथा के बारे में बताएं।`
      : language === 'or'
      ? `${localizedName}ର ଇତିହାସ, ସ୍ଥାପତ୍ୟ ଓ ପ୍ରାଚୀନ କିମ୍ବଦନ୍ତୀ ବିଷୟରେ କୁହନ୍ତୁ।`
      : `Tell me about the history, sacred architecture, and living lore of ${localizedName}.`;
    
    openChatWithQuery(query);
  };

  // Helper for Relationship Type styling & icons
  const getRelationshipTheme = (type) => {
    switch (type) {
      case 'associated_dance':
        return { 
          icon: <Music className="w-3.5 h-3.5" />, 
          color: 'text-pink-400 bg-pink-500/10 border-pink-500/30', 
          label: language === 'hi' ? 'शास्त्रीय नृत्य' : language === 'or' ? 'ଶାସ୍ତ୍ରୀୟ ନୃତ୍ୟ' : 'Living Dance & Art' 
        };
      case 'architectural_evolution':
        return { 
          icon: <Landmark className="w-3.5 h-3.5" />, 
          color: 'text-amber-400 bg-amber-500/10 border-amber-500/30', 
          label: language === 'hi' ? 'स्थापत्य शैली' : language === 'or' ? 'ସ୍ଥାପତ୍ୟ ଶୈଳୀ' : 'Architecture & Shikhara' 
        };
      case 'artisan_lineage':
      case 'ritual_craft':
      case 'weaver_lineage':
        return { 
          icon: <Layers className="w-3.5 h-3.5" />, 
          color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', 
          label: language === 'hi' ? 'शिल्प एवं हथकरघा' : language === 'or' ? 'ହସ୍ତଶିଳ୍ପ ଓ ବୟନ' : 'Hereditary Crafts' 
        };
      case 'culinary_tradition':
      case 'culinary_origin':
      case 'culinary_staple':
        return { 
          icon: <Utensils className="w-3.5 h-3.5" />, 
          color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30', 
          label: language === 'hi' ? 'पारंपरिक भोजन' : language === 'or' ? 'ପାରମ୍ପରିକ ଖାଦ୍ୟ' : 'Sacred Cuisine' 
        };
      case 'patron_dynasty':
      case 'ancient_dynasty':
      case 'royal_servitude':
      case 'historical_turning_point':
        return { 
          icon: <Crown className="w-3.5 h-3.5" />, 
          color: 'text-purple-400 bg-purple-500/10 border-purple-500/30', 
          label: language === 'hi' ? 'राजवंश एवं इतिहास' : language === 'or' ? 'ରାଜବଂଶ ଓ ଇତିହାସ' : 'Dynasty & History' 
        };
      case 'maritime_trade':
      case 'maritime_ritual':
        return { 
          icon: <Anchor className="w-3.5 h-3.5" />, 
          color: 'text-sky-400 bg-sky-500/10 border-sky-500/30', 
          label: language === 'hi' ? 'समुद्री व्यापार' : language === 'or' ? 'ନୌବାଣିଜ୍ୟ' : 'Maritime Heritage' 
        };
      case 'sacred_festival':
      case 'celebrated_festival':
      case 'agrarian_festival':
      case 'folk_ritual':
        return { 
          icon: <Sparkles className="w-3.5 h-3.5" />, 
          color: 'text-rose-400 bg-rose-500/10 border-rose-500/30', 
          label: language === 'hi' ? 'पवित्र उत्सव' : language === 'or' ? 'ପବିତ୍ର ପର୍ବ' : 'Sacred Festival' 
        };
      default:
        return { 
          icon: <Compass className="w-3.5 h-3.5" />, 
          color: 'text-[#F5D77F] bg-[#D4AF37]/15 border-[#D4AF37]/30', 
          label: language === 'hi' ? 'सांस्कृतिक परंपरा' : language === 'or' ? 'ସାଂସ୍କୃତିକ ସମ୍ପର୍କ' : 'Cultural Lineage' 
        };
    }
  };

  return (
    <div 
      className={`fixed top-20 right-0 h-[calc(100vh-80px)] w-full sm:w-[500px] md:w-[540px] bg-[#0C0C14]/95 backdrop-blur-2xl transform transition-custom duration-500 flex flex-col z-40 border-l border-[#D4AF37]/25 shadow-[-20px_0_50px_rgba(0,0,0,0.85)] ${
        activeEntity ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-[#D4AF37]/20 bg-[#10101A]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
            <h2 className="heritage-badge text-[9px] text-[#F5D77F] tracking-[0.25em]">
              {t('hud_subtitle')}
            </h2>
          </div>
          <h3 className="text-xl md:text-2xl font-cinzel font-bold text-[#FFF8E7] leading-tight">
            {translateEntityName(activeEntity?.name, activeEntity?.location_context)}
          </h3>
        </div>
        <button 
          onClick={() => setActiveEntity(null)}
          className="p-2 rounded-full border border-[#D4AF37]/30 hover:border-[#D4AF37] hover:bg-[#D4AF37]/15 transition-colors text-zinc-400 hover:text-[#FFF8E7] cursor-pointer"
          title={t('panel_close')}
          aria-label={t('panel_close')}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content Scroll Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        
        {/* Full-Color Hero Image Section */}
        <div className="relative w-full h-56 bg-[#08080C] flex items-center justify-center overflow-hidden border-b border-[#D4AF37]/20">
          {loadingImg ? (
            <div className="animate-pulse flex flex-col items-center">
              <Sparkles className="w-8 h-8 text-[#D4AF37] mb-2 animate-spin" />
              <span className="heritage-badge text-zinc-400">{t('panel_loading_img')}</span>
            </div>
          ) : wikiImage ? (
            <div className="relative w-full h-full group">
              <img 
                src={wikiImage} 
                alt={activeEntity?.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0C0C14] via-transparent to-black/40" />
            </div>
          ) : (
            <div className="flex flex-col items-center text-zinc-600">
              <ImageIcon className="w-10 h-10 mb-2 text-zinc-600" />
              <span className="heritage-badge text-zinc-500">{t('panel_record_progress')}</span>
            </div>
          )}
          
          {/* Overlaid Badges */}
          <div className="absolute bottom-3 left-4 right-4 flex justify-between items-center">
            <span className="bg-[#101018]/90 text-[#F5D77F] heritage-badge text-[11px] px-3 py-1 rounded-full border border-[#D4AF37]/40 shadow-lg backdrop-blur-md">
              {translateCategory(activeEntity?.category_name)}
            </span>
            <span className="bg-[#101018]/90 text-zinc-300 text-[11px] px-3 py-1 rounded-full border border-white/10 backdrop-blur-md flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
              <span>{t('panel_verified')}</span>
            </span>
          </div>
        </div>

        {/* Text Description & Location */}
        <div className="p-5 border-b border-[#D4AF37]/15 bg-[#0E0E16]">
          {activeEntity?.location_context && (
            <div className="flex items-center gap-2 text-zinc-300 text-xs mb-3">
              <MapPin className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
              <span className="font-medium">{translateLocation(activeEntity?.location_context)}</span>
            </div>
          )}
          
          <p className="text-zinc-300 leading-relaxed text-xs sm:text-sm font-sans mb-4">
            {translateEntityDescription(
              activeEntity?.description,
              activeEntity?.name,
              activeEntity?.category_name,
              activeEntity?.location_context
            )}
          </p>
          
          <a 
            href={`https://en.wikipedia.org/wiki/${encodeURIComponent(activeEntity?.name || '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-[#F5D77F] hover:text-[#FFF8E7] transition-colors font-semibold"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>{t('panel_wiki_view')}</span>
          </a>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* Living Cultural Threads (Semantic Cultural Relationships)     */}
        {/* ------------------------------------------------------------- */}
        <div className="p-5 border-b border-[#D4AF37]/15 bg-[#0A0A12]">
          
          {/* Section Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center">
                <GitFork className="w-4 h-4 text-[#F5D77F]" />
              </div>
              <div>
                <h4 className="font-cinzel text-sm font-bold text-[#FFF8E7] leading-none">
                  {t('panel_living_threads')}
                </h4>
                <p className="text-[10px] text-[#D4AF37]/80 font-sans mt-0.5">
                  {t('panel_living_threads_sub')}
                </p>
              </div>
            </div>

            <span className="heritage-badge text-[10px] text-[#F5D77F] px-2.5 py-0.5 rounded-full bg-[#141322] border border-[#D4AF37]/30 shadow-inner">
              {connections.length} {connections.length === 1 ? 'Bond' : 'Bonds'}
            </span>
          </div>

          {/* Relationship Cards */}
          {loadingConnections ? (
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="p-4 rounded-2xl bg-[#12111D] border border-white/5 animate-pulse">
                  <div className="h-3 w-24 bg-white/10 rounded mb-2" />
                  <div className="h-4 w-44 bg-white/15 rounded mb-2" />
                  <div className="h-3 w-full bg-white/5 rounded" />
                </div>
              ))}
            </div>
          ) : connections.length > 0 ? (
            <div className="space-y-3.5">
              {connections.map((conn) => {
                const theme = getRelationshipTheme(conn.relationship_type);
                const relLabel = language === 'or' 
                  ? (conn.label_or || conn.label_en) 
                  : language === 'hi' 
                  ? (conn.label_hi || conn.label_en) 
                  : conn.label_en;

                const relLore = language === 'or' 
                  ? (conn.lore_or || conn.lore_en || conn.description) 
                  : language === 'hi' 
                  ? (conn.lore_hi || conn.lore_en || conn.description) 
                  : (conn.lore_en || conn.description);

                return (
                  <div 
                    key={conn.id}
                    className="p-4 rounded-2xl bg-[#12111E] border border-[#D4AF37]/25 hover:border-[#D4AF37]/60 shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:shadow-[0_6px_25px_rgba(212,175,55,0.15)] transition-all group relative overflow-hidden"
                  >
                    {/* Top Meta Line: Semantic Category Tag */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${theme.color}`}>
                        {theme.icon}
                        <span>{theme.label}</span>
                      </span>

                      <span className="text-[10px] text-zinc-400 font-medium">
                        {translateCategory(conn.category_name)}
                      </span>
                    </div>

                    {/* Target Entity Title */}
                    <h5 className="font-cinzel text-base font-bold text-[#FFF8E7] group-hover:text-[#F5D77F] transition-colors mb-1">
                      {translateEntityName(conn.name, conn.location_context)}
                    </h5>

                    {/* Curated Semantic Relationship Label */}
                    <div className="text-xs font-semibold text-[#F5D77F] mb-1.5 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                      <span>{relLabel}</span>
                    </div>

                    {/* Cultural Lore Explanation */}
                    {relLore && (
                      <p className="text-[11px] text-zinc-300 leading-relaxed font-sans mb-3 line-clamp-3">
                        {relLore}
                      </p>
                    )}

                    {/* Action: Hop along arc to node */}
                    <button
                      onClick={() => handleHopNode(conn)}
                      className="w-full py-2 px-3 rounded-xl bg-[#181628] hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 hover:border-[#D4AF37] text-[#FFF8E7] hover:text-[#F5D77F] text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                      title={t('panel_hop_arc')}
                    >
                      <span>{t('panel_hop_arc')}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37] group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-zinc-500 text-xs italic">
              {t('panel_no_connections')}
            </div>
          )}

        </div>

        {/* ------------------------------------------------------------- */}
        {/* Unified Dharohar AI Heritage Guide Launcher                   */}
        {/* ------------------------------------------------------------- */}
        <div className="p-5 bg-gradient-to-b from-[#0E0E18] to-[#08080E]">
          <div className="p-4 rounded-2xl bg-[#131222] border border-[#D4AF37]/35 shadow-[0_8px_30px_rgba(0,0,0,0.5)] flex flex-col items-center text-center">
            
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#D4AF37] via-[#F59E0B] to-[#B45309] p-0.5 shadow-[0_0_20px_rgba(212,175,55,0.3)] mb-3 flex items-center justify-center">
              <div className="w-full h-full bg-[#0E0E17] rounded-[14px] flex items-center justify-center">
                <Bot className="w-5 h-5 text-[#F5D77F]" />
              </div>
            </div>

            <h4 className="font-cinzel text-sm font-bold text-[#FFF8E7] mb-1">
              {t('panel_ask_ai_title')}
            </h4>

            <p className="text-[11px] text-zinc-400 font-sans max-w-xs leading-relaxed mb-4">
              {t('panel_ask_ai_sub')}
            </p>

            <button
              onClick={handleAskAI}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-[#08080C] font-bold text-xs heritage-badge flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all cursor-pointer transform hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4 text-[#08080C]" />
              <span>{t('panel_ask_ai_btn')}</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
