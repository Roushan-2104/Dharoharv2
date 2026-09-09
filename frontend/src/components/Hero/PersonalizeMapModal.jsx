import React, { useState } from 'react';
import { 
  X, Sparkles, MapPin, Compass, Navigation, Landmark, 
  Utensils, Music, Layers, Eye, ArrowRight, RotateCcw, Check, LocateFixed 
} from 'lucide-react';
import { BASE_HUBS } from '../../utils/geo';
import { useLanguage } from '../../context/LanguageContext';

export default function PersonalizeMapModal({ 
  isOpen, 
  onClose, 
  userPreference, 
  onApplyPreference,
  onResetPreference
}) {
  const { language } = useLanguage();
  const isHi = language === 'hi';
  const isOr = language === 'or';

  const [selectedHub, setSelectedHub] = useState(userPreference?.hubId || 'puri');
  const [selectedVibe, setSelectedVibe] = useState(userPreference?.vibe || 'all_heritage');
  const [selectedRadius, setSelectedRadius] = useState(userPreference?.radius || 'regional');
  const [detectingGps, setDetectingGps] = useState(false);
  const [customCoords, setCustomCoords] = useState(userPreference?.customCoords || null);
  const [locationLabel, setLocationLabel] = useState(userPreference?.locationLabel || 'Puri');

  if (!isOpen) return null;

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCustomCoords([latitude, longitude]);
        setSelectedHub('gps');
        setLocationLabel('My Current GPS Location');
        setDetectingGps(false);
      },
      (err) => {
        console.warn("GPS detection failed, fallback to default hub:", err);
        setDetectingGps(false);
        setSelectedHub('bhubaneswar');
        setLocationLabel('Bhubaneswar');
      },
      { timeout: 8000 }
    );
  };

  const vibes = [
    {
      id: 'temples',
      icon: <Landmark className="w-4 h-4 text-amber-400" />,
      title: isHi ? 'प्राचीन मंदिर व स्थापत्य' : isOr ? 'ପ୍ରାଚୀନ ମନ୍ଦିର ଓ ସ୍ଥାପତ୍ୟ' : 'Sacred Temples & Architecture',
      desc: isHi ? 'कलिंग वास्तुकला, प्राचीन शिखर व पावन धाम' : isOr ? 'କଳିଙ୍ଗ ସ୍ଥାପତ୍ୟ ଓ ପ୍ରାଚୀନ ମନ୍ଦିର' : 'Kalinga stone shikharas & sacred sanctums',
      categories: ['Monument', 'Hidden Heritage']
    },
    {
      id: 'crafts',
      icon: <Layers className="w-4 h-4 text-teal-400" />,
      title: isHi ? 'हस्तशिल्प व हथकरघा गाँव' : isOr ? 'ହସ୍ତଶିଳ୍ପ ଓ ବୟନ ଗ୍ରାମ' : 'Master Crafts & Artisan Weaves',
      desc: isHi ? 'पट्टचित्र, संबलपुरी इकत, तारकसी व पीपिली' : isOr ? 'ପଟ୍ଟଚିତ୍ର, ସମ୍ବଲପୁରୀ ଇକତ ଓ ତାରକସି' : 'Pattachitra, Sambalpuri Ikat & Silver Filigree',
      categories: ['Art & Craft']
    },
    {
      id: 'cuisine',
      icon: <Utensils className="w-4 h-4 text-orange-400" />,
      title: isHi ? 'महाप्रसाद व पारंपरिक व्यंजन' : isOr ? 'ମହାପ୍ରସାଦ ଓ ପାରମ୍ପରିକ ଖାଦ୍ୟ' : 'Culinary Trail & Sacred Sweets',
      desc: isHi ? 'छेनापोड़ा, महाप्रसाद, रसगोला व पोड़ा पीठा' : isOr ? 'ଛେନାପୋଡ଼, ମହାପ୍ରସାଦ ଓ ରସଗୋଲା' : 'Baked Chhenapoda, Mahaprasad & Pitha',
      categories: ['Cuisine', 'Festival']
    },
    {
      id: 'culture_dance',
      icon: <Music className="w-4 h-4 text-purple-400" />,
      title: isHi ? 'शास्त्रीय नृत्य व लोक उत्सव' : isOr ? 'ଶାସ୍ତ୍ରୀୟ ନୃତ୍ୟ ଓ ଲୋକ ଉତ୍ସବ' : 'Classical Dance & Living Festivals',
      desc: isHi ? 'ओडिसी, मयूरभंज छऊ, रथयात्रा व धनुयात्रा' : isOr ? 'ଓଡ଼ିଶୀ, ଛଉ, ରଥଯାତ୍ରା ଓ ଧନୁଯାତ୍ରା' : 'Odissi, Mayurbhanj Chhau & Rath Yatra',
      categories: ['Tradition', 'Festival']
    },
    {
      id: 'all_heritage',
      icon: <Sparkles className="w-4 h-4 text-amber-300" />,
      title: isHi ? 'सर्वोत्तम सांस्कृतिक यात्रा' : isOr ? 'ସର୍ବୋତ୍ତମ ସାଂସ୍କୃତିକ ଯାତ୍ରା' : 'Curated Grand Heritage Trail',
      desc: isHi ? 'मंदिर, कला, खानपान और लोक कथाओं का संगम' : isOr ? 'ସମସ୍ତ ପ୍ରମୁଖ ଐତିହ୍ୟର ସମ୍ମିଳିତ ଯାତ୍ରା' : 'Balanced iconic mix of monuments, food & crafts',
      categories: []
    }
  ];

  const radiuses = [
    { id: 'local', label: isHi ? 'स्थानीय क्षेत्र (< 35 किमी)' : isOr ? 'ସ୍ଥାନୀୟ ଅଞ୍ଚଳ (< ୩୫ କିମି)' : 'Local Circuit (< 35 km)', maxKm: 35 },
    { id: 'regional', label: isHi ? 'दिन भर का भ्रमण (35 - 100 किमी)' : isOr ? 'ଦିନବେଳା ଭ୍ରମଣ (୩୫ - ୧୦୦ କିମି)' : 'Day Trip Circuit (35 - 100 km)', maxKm: 100 },
    { id: 'all_state', label: isHi ? 'संपूर्ण ओडिशा कॉरिडोर' : isOr ? 'ସମଗ୍ର ଓଡ଼ିଶା କୋରିଡର' : 'Full State Corridor (All)', maxKm: 9999 },
  ];

  const handleApply = () => {
    let coords = [19.8135, 85.8312]; // default Puri
    let label = locationLabel;

    if (selectedHub === 'gps' && customCoords) {
      coords = customCoords;
      label = 'Current Location';
    } else {
      const hub = BASE_HUBS.find(h => h.id === selectedHub);
      if (hub) {
        coords = hub.coords;
        label = hub.name;
      }
    }

    const currentVibeObj = vibes.find(v => v.id === selectedVibe) || vibes[4];
    const currentRadiusObj = radiuses.find(r => r.id === selectedRadius) || radiuses[1];

    onApplyPreference({
      isActive: true,
      hubId: selectedHub,
      locationLabel: label,
      coords: coords,
      vibe: selectedVibe,
      vibeTitle: currentVibeObj.title,
      categories: currentVibeObj.categories,
      radius: selectedRadius,
      maxKm: currentRadiusObj.maxKm
    });

    onClose();
  };

  const handleReset = () => {
    onResetPreference();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar rounded-3xl bg-[#0F0E1A] border border-[#D4AF37]/35 shadow-[0_25px_80px_rgba(0,0,0,0.9)] p-6 md:p-8">
        
        {/* Subtle Decorative Golden Corner Accents */}
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
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 mb-3">
            <Compass className="w-3.5 h-3.5 text-[#F5D77F]" />
            <span className="heritage-badge text-[10px] text-[#F5D77F] tracking-[0.2em]">
              {isHi ? 'व्यक्तिगत हेरिटेज मानचित्र' : isOr ? 'ବ୍ୟକ୍ତିଗତ ଐତିହ୍ୟ ମାନଚିତ୍ର' : 'AI Map Personalizer'}
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-cinzel font-black text-[#FFF8E7] leading-tight">
            {isHi ? 'अपनी पसंद का हेरिटेज मैप तैयार करें' : isOr ? 'ନିଜ ପସନ୍ଦର ଐତିହ୍ୟ ମ୍ୟାପ୍ ପ୍ରସ୍ତୁତ କରନ୍ତୁ' : 'Curate Your Personalized Heritage Map'}
          </h2>
          <p className="text-xs md:text-sm text-zinc-400 mt-1 max-w-lg mx-auto font-sans">
            {isHi 
              ? 'स्थान और रुचि चुनें — मैप पर केवल आपके लिए चुनिंदा व उपयोगी स्थल ही दिखाई देंगे।'
              : isOr 
              ? 'ନିଜ ସ୍ଥାନ ଓ ରୁଚି ଚୟନ କରନ୍ତୁ — ମ୍ୟାପ୍‌ରେ କେବଳ ଆପଣଙ୍କ ପାଇଁ ଖାସ୍ ସ୍ଥଳ ଦେଖାଯିବ।'
              : 'Choose your base location and interest. We will filter out the noise and pin only the most meaningful sites for you.'}
          </p>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* STEP 1: Select Starting Location / Hub                        */}
        {/* ------------------------------------------------------------- */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-[#F5D77F] heritage-badge uppercase tracking-wider mb-2.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>1. {isHi ? 'प्रारंभिक स्थल / शहर' : isOr ? 'ଆରମ୍ଭ ସ୍ଥାନ / ସହର' : 'Starting Location / Base City'}</span>
            </span>
            
            {/* GPS Locate Button */}
            <button
              onClick={handleDetectGPS}
              disabled={detectingGps}
              className="px-2.5 py-1 rounded-lg bg-[#D4AF37]/15 hover:bg-[#D4AF37]/30 text-[#F5D77F] text-[10px] font-semibold border border-[#D4AF37]/35 flex items-center gap-1 cursor-pointer transition-all"
            >
              <LocateFixed className={`w-3 h-3 ${detectingGps ? 'animate-spin' : ''}`} />
              <span>{detectingGps ? 'Detecting GPS...' : 'Use My GPS'}</span>
            </button>
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {BASE_HUBS.map(hub => {
              const isSelected = selectedHub === hub.id;
              return (
                <button
                  key={hub.id}
                  onClick={() => {
                    setSelectedHub(hub.id);
                    setLocationLabel(hub.name);
                    setCustomCoords(null);
                  }}
                  className={`p-2.5 rounded-xl text-left text-xs font-semibold transition-all border cursor-pointer ${
                    isSelected 
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-[#08080C] font-bold border-[#F5D77F] shadow-[0_0_15px_rgba(212,175,55,0.3)]' 
                      : 'bg-[#151422] text-zinc-300 border-white/5 hover:border-[#D4AF37]/40 hover:text-white'
                  }`}
                >
                  <div className="truncate">{hub.name}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* STEP 2: Cultural Vibe & Interests                             */}
        {/* ------------------------------------------------------------- */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-[#F5D77F] heritage-badge uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>2. {isHi ? 'आप क्या देखना चाहते हैं? (रुचि)' : isOr ? 'ଆପଣ କଣ ଦେଖିବାକୁ ଚାହାଁନ୍ତି? (ରୁଚି)' : 'What is your Heritage Focus?'}</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {vibes.map(vibe => {
              const isSelected = selectedVibe === vibe.id;
              return (
                <div
                  key={vibe.id}
                  onClick={() => setSelectedVibe(vibe.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                    isSelected 
                      ? 'bg-[#1A182E] border-[#F5D77F] shadow-[0_0_20px_rgba(212,175,55,0.2)]' 
                      : 'bg-[#131220] border-white/5 hover:border-[#D4AF37]/35'
                  }`}
                >
                  <div className={`p-2 rounded-xl shrink-0 ${isSelected ? 'bg-[#D4AF37]/25 border border-[#D4AF37]' : 'bg-[#1B192A]'}`}>
                    {vibe.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-xs font-bold font-cinzel ${isSelected ? 'text-[#F5D77F]' : 'text-[#FFF8E7]'}`}>
                        {vibe.title}
                      </h4>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#F5D77F] shrink-0" />}
                    </div>
                    <p className="text-[10.5px] text-zinc-400 mt-0.5 line-clamp-1 font-sans">
                      {vibe.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* STEP 3: Travel Radius                                         */}
        {/* ------------------------------------------------------------- */}
        <div className="mb-8">
          <label className="block text-xs font-bold text-[#F5D77F] heritage-badge uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>3. {isHi ? 'यात्रा दूरी / दायरा' : isOr ? 'ଯାତ୍ରା ଦୂରତା / ସୀମା' : 'Travel Radius'}</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {radiuses.map(r => {
              const isSelected = selectedRadius === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedRadius(r.id)}
                  className={`p-2.5 rounded-xl text-center text-xs font-semibold transition-all border cursor-pointer ${
                    isSelected 
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-[#08080C] font-bold border-[#F5D77F] shadow-[0_0_15px_rgba(212,175,55,0.3)]' 
                      : 'bg-[#151422] text-zinc-300 border-white/5 hover:border-[#D4AF37]/40 hover:text-white'
                  }`}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/10">
          <button
            onClick={handleReset}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-transparent hover:bg-white/5 text-zinc-400 hover:text-[#FFF8E7] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isHi ? 'रीसेट करें (सभी 205 स्थल देखें)' : isOr ? 'ରିସେଟ୍ କରନ୍ତୁ (ସମସ୍ତ ଦେଖନ୍ତୁ)' : 'Reset (Show All 205 Sites)'}</span>
          </button>

          <button
            onClick={handleApply}
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F59E0B] to-[#D4AF37] text-[#08080C] font-bold text-xs heritage-badge shadow-[0_0_25px_rgba(212,175,55,0.4)] hover:shadow-[0_0_35px_rgba(212,175,55,0.6)] transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:scale-[1.02]"
          >
            <Sparkles className="w-4 h-4 text-[#08080C]" />
            <span>{isHi ? 'मेरा मैप तैयार करें' : isOr ? 'ମୋ ମ୍ୟାପ୍ ପ୍ରସ୍ତୁତ କରନ୍ତୁ' : 'Curate My Map Now'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#08080C]" />
          </button>
        </div>

      </div>
    </div>
  );
}
