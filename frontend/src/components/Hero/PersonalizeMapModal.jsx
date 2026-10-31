import React, { useState } from 'react';
import { Check, LocateFixed } from 'lucide-react';
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
      title: isHi ? 'प्राचीन मंदिर व स्थापत्य' : isOr ? 'ପ୍ରାଚୀନ ମନ୍ଦିର ଓ ସ୍ଥାପତ୍ୟ' : 'Sacred Temples & Architecture',
      desc: isHi ? 'कलिंग वास्तुकला, प्राचीन शिखर व पावन धाम' : isOr ? 'କଳିଙ୍ଗ ସ୍ଥାପତ୍ୟ ଓ ପ୍ରାଚୀନ ମନ୍ଦିର' : 'Kalinga stone shikharas & sacred sanctums',
      categories: ['Monument', 'Hidden Heritage']
    },
    {
      id: 'crafts',
      title: isHi ? 'हस्तशिल्प व हथकरघा गाँव' : isOr ? 'ହସ୍ତଶିଳ୍ପ ଓ ବୟନ ଗ୍ରାମ' : 'Master Crafts & Artisan Weaves',
      desc: isHi ? 'पट्टचित्र, संबलपुरी इकत, तारकसी व पीपिली' : isOr ? 'ପଟ୍ଟଚିତ୍ର, ସମ୍ବଲପୁରୀ ଇକତ ଓ ତାରକସି' : 'Pattachitra, Sambalpuri Ikat & Silver Filigree',
      categories: ['Art & Craft']
    },
    {
      id: 'cuisine',
      title: isHi ? 'महाप्रसाद व पारंपरिक व्यंजन' : isOr ? 'ମହାପ୍ରସାଦ ଓ ପାରମ୍ପରିକ ଖାଦ୍ୟ' : 'Culinary Trail & Sacred Sweets',
      desc: isHi ? 'छेनापोड़ा, महाप्रसाद, रसगोला व पोड़ा पीठा' : isOr ? 'ଛେନାପୋଡ଼, ମହାପ୍ରସାଦ ଓ ରସଗୋଲା' : 'Baked Chhenapoda, Mahaprasad & Pitha',
      categories: ['Cuisine', 'Festival']
    },
    {
      id: 'culture_dance',
      title: isHi ? 'शास्त्रीय नृत्य व लोक उत्सव' : isOr ? 'ଶାସ୍ତ୍ରୀୟ ନୃତ୍ୟ ଓ ଲୋକ ଉତ୍ସବ' : 'Classical Dance & Living Festivals',
      desc: isHi ? 'ओडिसी, मयूरभंज छऊ, रथयात्रा व धनुयात्रा' : isOr ? 'ଓଡ଼ିଶୀ, ଛଉ, ରଥଯାତ୍ରା ଓ ଧନୁଯାତ୍ରା' : 'Odissi, Mayurbhanj Chhau & Rath Yatra',
      categories: ['Tradition', 'Festival']
    },
    {
      id: 'all_heritage',
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

  const optionBase = 'transition-colors duration-short ease-out cursor-pointer';
  const optionState = (isSelected) => (isSelected ? 'bg-ink text-paper' : 'bg-paper text-ink hover:bg-paper-2');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[color-mix(in_oklab,var(--color-ink)_55%,transparent)]">
      <div className="relative w-full max-w-[960px] max-h-[90vh] overflow-y-auto no-scrollbar bg-paper text-ink px-6 py-8 md:px-10 md:py-10">

        {/* Header */}
        <div className="flex items-start justify-between gap-6 mb-10">
          <div className="min-w-0">
            <h2 className="font-display font-bold tracking-display text-4xl md:text-5xl text-ink leading-[1.05]">
              {isHi ? 'अपनी पसंद का हेरिटेज मैप तैयार करें' : isOr ? 'ନିଜ ପସନ୍ଦର ଐତିହ୍ୟ ମ୍ୟାପ୍ ପ୍ରସ୍ତୁତ କରନ୍ତୁ' : 'Curate Your Personalized Heritage Map'}
            </h2>
            <p className="mt-3 text-base text-ink-2 max-w-[60ch]">
              {isHi
                ? 'स्थान और रुचि चुनें — मैप पर केवल आपके लिए चुनिंदा व उपयोगी स्थल ही दिखाई देंगे।'
                : isOr
                ? 'ନିଜ ସ୍ଥାନ ଓ ରୁଚି ଚୟନ କରନ୍ତୁ — ମ୍ୟାପ୍‌ରେ କେବଳ ଆପଣଙ୍କ ପାଇଁ ଖାସ୍ ସ୍ଥଳ ଦେଖାଯିବ।'
                : 'Choose your base location and interest. We will filter out the noise and pin only the most meaningful sites for you.'}
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 inline-flex items-center min-h-[44px] px-2 -mr-2 text-base font-medium text-ink underline underline-offset-[0.32em] decoration-1 hover:text-mark transition-colors duration-short ease-out cursor-pointer"
          >
            Close
          </button>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* STEP 1: Select Starting Location / Hub                        */}
        {/* ------------------------------------------------------------- */}
        <div className="mb-10">
          <div className="flex items-center justify-between gap-4 mb-2">
            <span className="text-[15px] font-medium text-muted">
              1. {isHi ? 'प्रारंभिक स्थल / शहर' : isOr ? 'ଆରମ୍ଭ ସ୍ଥାନ / ସହର' : 'Starting Location / Base City'}
            </span>

            {/* GPS Locate Button */}
            <button
              onClick={handleDetectGPS}
              disabled={detectingGps}
              className="inline-flex items-center gap-2 min-h-[44px] text-base font-medium text-ink underline underline-offset-[0.32em] decoration-1 hover:text-mark transition-colors duration-short ease-out cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LocateFixed className="w-4 h-4" aria-hidden="true" />
              <span>{detectingGps ? 'Detecting GPS...' : 'Use My GPS'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-rule border border-rule">
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
                  aria-pressed={isSelected}
                  className={`min-h-[48px] px-4 py-3 text-left text-base font-medium ${optionBase} ${optionState(isSelected)}`}
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
        <div className="mb-10">
          <span className="block text-[15px] font-medium text-muted mb-3">
            2. {isHi ? 'आप क्या देखना चाहते हैं? (रुचि)' : isOr ? 'ଆପଣ କଣ ଦେଖିବାକୁ ଚାହାଁନ୍ତି? (ରୁଚି)' : 'What is your Heritage Focus?'}
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-rule border border-rule">
            {vibes.map(vibe => {
              const isSelected = selectedVibe === vibe.id;
              return (
                <button
                  type="button"
                  key={vibe.id}
                  onClick={() => setSelectedVibe(vibe.id)}
                  aria-pressed={isSelected}
                  className={`min-h-[64px] px-4 py-3 text-left flex items-start justify-between gap-3 ${optionBase} ${optionState(isSelected)}`}
                >
                  <span className="min-w-0">
                    <span className="block text-base font-medium">
                      {vibe.title}
                    </span>
                    <span className={`block mt-0.5 text-[13px] ${isSelected ? 'text-paper' : 'text-muted'}`}>
                      {vibe.desc}
                    </span>
                  </span>
                  {isSelected && <Check className="w-4 h-4 shrink-0 mt-1" aria-hidden="true" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* STEP 3: Travel Radius                                         */}
        {/* ------------------------------------------------------------- */}
        <div className="mb-10">
          <span className="block text-[15px] font-medium text-muted mb-3">
            3. {isHi ? 'यात्रा दूरी / दायरा' : isOr ? 'ଯାତ୍ରା ଦୂରତା / ସୀମା' : 'Travel Radius'}
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-rule border border-rule">
            {radiuses.map(r => {
              const isSelected = selectedRadius === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedRadius(r.id)}
                  aria-pressed={isSelected}
                  className={`min-h-[48px] px-4 py-3 text-left text-base font-medium ${optionBase} ${optionState(isSelected)}`}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-rule">
          <button
            onClick={handleReset}
            className="inline-flex items-center min-h-[44px] text-base font-medium text-ink underline underline-offset-[0.32em] decoration-1 hover:text-mark transition-colors duration-short ease-out cursor-pointer"
          >
            {isHi ? 'रीसेट करें (सभी स्थल देखें)' : isOr ? 'ରିସେଟ୍ କରନ୍ତୁ (ସମସ୍ତ ଦେଖନ୍ତୁ)' : 'Reset (Show All Sites)'}
          </button>

          <button
            onClick={handleApply}
            className="inline-flex items-center justify-center min-h-[48px] px-6 bg-ink text-paper font-medium hover:bg-ink-2 transition-colors duration-short ease-out cursor-pointer w-full sm:w-auto"
          >
            {isHi ? 'मेरा मैप तैयार करें' : isOr ? 'ମୋ ମ୍ୟାପ୍ ପ୍ରସ୍ତୁତ କରନ୍ତୁ' : 'Curate My Map Now'}
          </button>
        </div>

      </div>
    </div>
  );
}
