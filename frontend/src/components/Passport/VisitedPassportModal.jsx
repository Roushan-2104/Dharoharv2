import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, CheckCircle2, Award, MapPin, Trash2, ArrowRight, 
  Sparkles, Landmark, Compass, Calendar, Share2, Plus, BookmarkCheck 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { HERITAGE_CATEGORY_COLORS, getCategoryColor } from '../../config/categoryColors';

export default function VisitedPassportModal({ isOpen, onClose }) {
  const { 
    visitedSites, 
    toggleVisited, 
    isVisited,
    language, 
    t, 
    translateCategory, 
    translateEntityName, 
    translateLocation 
  } = useLanguage();
  const navigate = useNavigate();

  const isHi = language === 'hi';
  const isOr = language === 'or';

  if (!isOpen) return null;

  const totalPossible = 205;
  const count = visitedSites.length;
  const percent = Math.min(100, Math.round((count / totalPossible) * 100));

  // Determine Explorer Rank based on count
  const getExplorerRank = () => {
    if (count === 0) {
      return {
        title: isHi ? 'आरंभिक पथिक' : isOr ? 'ପ୍ରାରମ୍ଭିକ ଯାତ୍ରୀ' : 'Heritage Wanderer',
        badge: 'Lv. 0',
        color: 'text-zinc-400 bg-zinc-800/80 border-zinc-700',
        nextMilestone: 'Mark 1 site to reach Lv. 1'
      };
    } else if (count <= 3) {
      return {
        title: isHi ? 'कलिंग परिभ्रमणार्थी' : isOr ? 'କଳିଙ୍ଗ ଭ୍ରମଣକାରୀ' : 'Kalinga Explorer',
        badge: 'Lv. 1',
        color: 'text-amber-400 bg-amber-500/15 border-amber-500/40',
        nextMilestone: 'Visit 4 sites to reach Lv. 2'
      };
    } else if (count <= 10) {
      return {
        title: isHi ? 'धरोहर अन्वेषक' : isOr ? 'ଐତିହ୍ୟ ଅନ୍ୱେଷକ' : 'Circuit Pioneer',
        badge: 'Lv. 2',
        color: 'text-teal-400 bg-teal-500/15 border-teal-500/40',
        nextMilestone: 'Visit 11 sites to reach Lv. 3'
      };
    } else if (count <= 25) {
      return {
        title: isHi ? 'वरिष्ठ संस्कृति chronicler' : isOr ? 'ବରିଷ୍ଠ ସଂସ୍କୃତି ଯାତ୍ରୀ' : 'Sacred Lore Master',
        badge: 'Lv. 3',
        color: 'text-purple-400 bg-purple-500/15 border-purple-500/40',
        nextMilestone: 'Visit 26 sites to reach Master Rank'
      };
    } else {
      return {
        title: isHi ? 'महा इतिहासकार व धरोहर रत्न' : isOr ? 'ମହା ଐତିହାସିକ ଓ ଧରୋହର ରତ୍ନ' : 'Grand Heritage Scholar',
        badge: 'Grand Master',
        color: 'text-rose-400 bg-rose-500/15 border-rose-500/40',
        nextMilestone: 'Top cultural explorer of Odisha!'
      };
    }
  };

  const rank = getExplorerRank();

  // Popular starter recommendations if 0 visited
  const starterSites = [
    {
      id: "konark-sun-temple",
      name: "Konark Sun Temple",
      category_name: "Monument",
      location_context: "Konark, Puri",
      coordinates: [19.8876, 86.0945],
      description: "13th-century UNESCO World Heritage stone chariot temple."
    },
    {
      id: "jagannath-temple",
      name: "Jagannath Temple",
      category_name: "Monument",
      location_context: "Puri",
      coordinates: [19.8049, 85.8179],
      description: "Ancient sacred sanctum of Lord Jagannath, Balabhadra and Subhadra."
    },
    {
      id: "raghurajpur-craft-village",
      name: "Raghurajpur Heritage Crafts Village",
      category_name: "Art & Craft",
      location_context: "Puri District",
      coordinates: [19.8970, 85.8190],
      description: "Living artisan village famous for master Pattachitra cloth scroll paintings."
    },
    {
      id: "lingaraj-temple",
      name: "Lingaraj Temple",
      category_name: "Monument",
      location_context: "Old Town, Bhubaneswar",
      coordinates: [20.2382, 85.8336],
      description: "Majestic 11th-century Kalinga architecture temple dedicated to Harihara."
    }
  ];

  const handleLocateOnMap = (site) => {
    onClose();
    navigate('/', { 
      state: { 
        selectedEntityId: site.id, 
        selectedEntity: site 
      } 
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto no-scrollbar rounded-3xl bg-[#0F0E1A] border border-[#D4AF37]/35 shadow-[0_25px_80px_rgba(0,0,0,0.9)] p-6 md:p-8">
        
        {/* Decorative Golden Corner Accents */}
        <div className="absolute top-4 left-4 w-3 h-3 border-t-2 border-l-2 border-[#D4AF37]/60 rounded-tl-sm" />
        <div className="absolute top-4 right-4 w-3 h-3 border-t-2 border-r-2 border-[#D4AF37]/60 rounded-tr-sm" />
        <div className="absolute bottom-4 left-4 w-3 h-3 border-b-2 border-l-2 border-[#D4AF37]/60 rounded-bl-sm" />
        <div className="absolute bottom-4 right-4 w-3 h-3 border-b-2 border-r-2 border-[#D4AF37]/60 rounded-br-sm" />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-[#181628] border border-white/10 hover:border-[#D4AF37] text-zinc-400 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 mb-2.5">
              <Award className="w-3.5 h-3.5 text-[#F5D77F]" />
              <span className="heritage-badge text-[10px] text-[#F5D77F] tracking-[0.2em]">
                {isHi ? 'मेरा हेरिटेज पासपोर्ट' : isOr ? 'ମୋ ଐତିହ୍ୟ ପାସପୋର୍ଟ' : 'Living Heritage Passport'}
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-cinzel font-black text-[#FFF8E7] leading-tight">
              {isHi ? 'भ्रमण किए गए धरोहर स्थल' : isOr ? 'ଭ୍ରମଣ କରିଥିବା ଐତିହ୍ୟ ସ୍ଥଳ' : 'My Visited Heritage Sites'}
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5 font-sans">
              {isHi 
                ? 'आपके द्वारा देखी गई ऐतिहासिक धरोहरों, मंदिरों व कला गाँवों की व्यक्तिगत यात्रा डायरी।'
                : isOr 
                ? 'ଆପଣ ଦେଖିଥିବା ସମସ୍ତ ମନ୍ଦିର ଓ ଐତିହ୍ୟ ସ୍ଥଳର ବ୍ୟକ୍ତିଗତ ଯାତ୍ରା ଡାଏରୀ।'
                : 'Your personal digital travel log across 200+ verified sacred temples, artisan craft villages & traditions.'}
            </p>
          </div>

          {/* Explorer Rank Badge Card */}
          <div className={`p-3 rounded-2xl border flex items-center gap-3 shrink-0 ${rank.color}`}>
            <div className="w-10 h-10 rounded-xl bg-black/30 border border-white/10 flex items-center justify-center font-cinzel font-bold text-sm">
              {rank.badge}
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider opacity-80">Explorer Rank</div>
              <div className="font-cinzel text-xs font-bold text-white">{rank.title}</div>
            </div>
          </div>
        </div>

        {/* Progress Bar & Stats */}
        <div className="mb-6 p-4 rounded-2xl bg-[#141322] border border-[#D4AF37]/25">
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span className="text-[#F5D77F] heritage-badge">
              {count} of {totalPossible} Sites Explored ({percent}%)
            </span>
            <span className="text-zinc-400 text-[11px] font-sans">
              {rank.nextMilestone}
            </span>
          </div>

          {/* Golden Progress Bar Track */}
          <div className="w-full h-3 rounded-full bg-[#090910] overflow-hidden p-0.5 border border-white/10">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-[#D4AF37] via-[#F59E0B] to-[#10B981] transition-all duration-700 shadow-[0_0_12px_rgba(212,175,55,0.6)]"
              style={{ width: `${Math.max(3, percent)}%` }}
            />
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* Visited Sites Grid                                            */}
        {/* ------------------------------------------------------------- */}
        {count === 0 ? (
          <div className="py-8 px-4 text-center rounded-2xl bg-[#141322]/60 border border-dashed border-white/15">
            <Compass className="w-12 h-12 text-[#D4AF37]/50 mx-auto mb-3 animate-spin-slow" />
            <h3 className="font-cinzel text-lg font-bold text-[#FFF8E7] mb-1">
              {isHi ? 'आपका हेरिटेज पासपोर्ट अभी खाली है' : isOr ? 'ଆପଣଙ୍କ ପାସପୋର୍ଟ ଏବେ ଖାଲି ଅଛି' : 'Your Heritage Passport is Empty'}
            </h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto mb-6 font-sans">
              {isHi
                ? 'क्या आप इनमें से किसी प्रसिद्ध स्थल पर जा चुके हैं? अपने पासपोर्ट में पहला स्टाम्प जोड़ने के लिए टैप करें:'
                : isOr
                ? 'କଣ ଆପଣ ଏହି ପ୍ରସିଦ୍ଧ ସ୍ଥଳଗୁଡ଼ିକ ମଧ୍ୟରୁ କେଉଁଠାକୁ ଯାଇଛନ୍ତି? ପାସପୋର୍ଟରେ ଯୋଡ଼ିବାକୁ କ୍ଲିକ୍ କରନ୍ତୁ:'
                : 'Have you visited any of these iconic places? Tap below to record your first heritage stamp:'}
            </p>

            {/* Quick Starter Suggestions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto text-left">
              {starterSites.map((site) => (
                <div 
                  key={site.id}
                  className="p-3.5 rounded-xl bg-[#18162A] border border-[#D4AF37]/30 hover:border-[#D4AF37] flex items-center justify-between gap-3 transition-all"
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="font-cinzel text-xs font-bold text-[#FFF8E7] truncate">{site.name}</h4>
                    <p className="text-[10px] text-zinc-400 truncate">{site.location_context}</p>
                  </div>
                  <button
                    onClick={() => toggleVisited(site)}
                    className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-[#08080C] text-[10px] font-bold heritage-badge flex items-center gap-1 shrink-0 cursor-pointer shadow-sm hover:scale-105 transition-all"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Visited</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
              <span>{isHi ? 'रिकॉर्ड किए गए स्थल:' : isOr ? 'ଯୋଡ଼ାଯାଇଥିବା ସ୍ଥଳ:' : 'Recorded Heritage Landmarks:'}</span>
              <span className="text-[#D4AF37] font-semibold">{count} Recorded</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[48vh] overflow-y-auto no-scrollbar pr-1">
              {visitedSites.map((site) => {
                const color = getCategoryColor(site.category_name);
                const localizedTitle = translateEntityName(site.name, site.location_context);
                const localizedLoc = translateLocation(site.location_context);
                const localizedCat = translateCategory(site.category_name);
                const dateStr = site.visitedAt ? new Date(site.visitedAt).toLocaleDateString() : 'Recorded';

                return (
                  <div 
                    key={site.id}
                    className="p-4 rounded-2xl bg-[#141324] border border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all flex flex-col justify-between group shadow-sm"
                  >
                    <div>
                      {/* Top Row: Category Pill & Date */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span 
                          className="text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border"
                          style={{
                            borderColor: `${color}40`,
                            backgroundColor: `${color}15`,
                            color: color
                          }}
                        >
                          {localizedCat}
                        </span>
                        
                        <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                          <Calendar className="w-2.5 h-2.5" />
                          <span>{dateStr}</span>
                        </span>
                      </div>

                      {/* Title */}
                      <h4 className="font-cinzel text-sm font-bold text-[#FFF8E7] group-hover:text-[#F5D77F] transition-colors mb-1">
                        {localizedTitle}
                      </h4>

                      {/* Location */}
                      <div className="flex items-center gap-1 text-[11px] text-zinc-400 mb-3">
                        <MapPin className="w-3 h-3 text-[#D4AF37] shrink-0" />
                        <span className="truncate">{localizedLoc || 'Odisha Heritage'}</span>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="flex items-center justify-between pt-2.5 border-t border-white/5">
                      <button
                        onClick={() => handleLocateOnMap(site)}
                        className="px-2.5 py-1 rounded-lg bg-[#D4AF37]/15 hover:bg-[#D4AF37]/30 text-[#F5D77F] text-[11px] font-semibold flex items-center gap-1 border border-[#D4AF37]/35 cursor-pointer transition-all"
                        title="Locate on Map"
                      >
                        <span>View on Map</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => toggleVisited(site)}
                        className="p-1.5 rounded-lg hover:bg-rose-500/20 text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Remove from Passport"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
