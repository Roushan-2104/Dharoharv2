import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

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

  const totalPossible = 200; // entities in the knowledge base (offline_data.json)
  const count = visitedSites.length;
  const percent = Math.min(100, Math.round((count / totalPossible) * 100));

  // Determine Explorer Rank based on count
  const getExplorerRank = () => {
    if (count === 0) {
      return {
        title: isHi ? 'आरंभिक पथिक' : isOr ? 'ପ୍ରାରମ୍ଭିକ ଯାତ୍ରୀ' : 'Heritage Wanderer',
        badge: 'Lv. 0',
        nextMilestone: 'Mark 1 site to reach Lv. 1'
      };
    } else if (count <= 3) {
      return {
        title: isHi ? 'कलिंग परिभ्रमणार्थी' : isOr ? 'କଳିଙ୍ଗ ଭ୍ରମଣକାରୀ' : 'Kalinga Explorer',
        badge: 'Lv. 1',
        nextMilestone: 'Visit 4 sites to reach Lv. 2'
      };
    } else if (count <= 10) {
      return {
        title: isHi ? 'धरोहर अन्वेषक' : isOr ? 'ଐତିହ୍ୟ ଅନ୍ୱେଷକ' : 'Circuit Pioneer',
        badge: 'Lv. 2',
        nextMilestone: 'Visit 11 sites to reach Lv. 3'
      };
    } else if (count <= 25) {
      return {
        title: isHi ? 'वरिष्ठ संस्कृति chronicler' : isOr ? 'ବରିଷ୍ଠ ସଂସ୍କୃତି ଯାତ୍ରୀ' : 'Sacred Lore Master',
        badge: 'Lv. 3',
        nextMilestone: 'Visit 26 sites to reach Master Rank'
      };
    } else {
      return {
        title: isHi ? 'महा इतिहासकार व धरोहर रत्न' : isOr ? 'ମହା ଐତିହାସିକ ଓ ଧରୋହର ରତ୍ନ' : 'Grand Heritage Scholar',
        badge: 'Grand Master',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[color-mix(in_oklab,var(--color-ink)_55%,transparent)]">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto no-scrollbar bg-paper text-ink p-6 md:p-8">

        {/* Header */}
        <div className="flex items-start justify-between gap-6 mb-8">
          <div>
            <h2 className="font-display font-bold tracking-display text-4xl md:text-5xl text-ink">
              {isHi ? 'भ्रमण किए गए धरोहर स्थल' : isOr ? 'ଭ୍ରମଣ କରିଥିବା ଐତିହ୍ୟ ସ୍ଥଳ' : 'My Visited Heritage Sites'}
            </h2>
            <p className="mt-2 text-base text-ink-2 max-w-xl">
              {isHi
                ? 'आपके द्वारा देखी गई ऐतिहासिक धरोहरों, मंदिरों व कला गाँवों की व्यक्तिगत यात्रा डायरी।'
                : isOr
                ? 'ଆପଣ ଦେଖିଥିବା ସମସ୍ତ ମନ୍ଦିର ଓ ଐତିହ୍ୟ ସ୍ଥଳର ବ୍ୟକ୍ତିଗତ ଯାତ୍ରା ଡାଏରୀ।'
                : 'Your personal digital travel log across 200+ sacred temples, artisan craft villages & traditions.'}
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="shrink-0 min-h-[44px] px-2 -mr-2 text-base font-medium text-ink underline underline-offset-[0.32em] decoration-1 hover:text-mark transition-colors duration-short ease-out cursor-pointer"
          >
            Close
          </button>
        </div>

        {/* Explorer Rank & Progress */}
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-6 sm:gap-10 items-end">
          <div>
            <div className="text-[15px] font-medium text-muted">Explorer Rank</div>
            <div className="mt-1 font-display font-bold tracking-display text-4xl text-ink">{rank.badge}</div>
            <div className="mt-1 text-base text-ink-2">{rank.title}</div>
          </div>

          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
              <span className="text-[15px] font-medium text-muted">
                <span className="font-display font-bold text-xl text-ink">{count}</span> of {totalPossible} Sites Explored ({percent}%)
              </span>
              <span className="text-[15px] text-muted">
                {rank.nextMilestone}
              </span>
            </div>

            <div className="w-full h-1 bg-paper-3 overflow-hidden">
              <div
                className="h-full bg-ink"
                style={{ width: `${Math.max(3, percent)}%` }}
              />
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* Visited Sites List                                            */}
        {/* ------------------------------------------------------------- */}
        {count === 0 ? (
          <div className="bg-paper-2 p-6">
            <h3 className="font-display font-bold tracking-display text-3xl text-ink mb-2">
              {isHi ? 'आपका हेरिटेज पासपोर्ट अभी खाली है' : isOr ? 'ଆପଣଙ୍କ ପାସପୋର୍ଟ ଏବେ ଖାଲି ଅଛି' : 'Your Heritage Passport is empty'}
            </h3>
            <p className="text-base text-ink-2 max-w-xl mb-6">
              {isHi
                ? 'क्या आप इनमें से किसी प्रसिद्ध स्थल पर जा चुके हैं? अपने पासपोर्ट में पहला स्टाम्प जोड़ने के लिए टैप करें:'
                : isOr
                ? 'କଣ ଆପଣ ଏହି ପ୍ରସିଦ୍ଧ ସ୍ଥଳଗୁଡ଼ିକ ମଧ୍ୟରୁ କେଉଁଠାକୁ ଯାଇଛନ୍ତି? ପାସପୋର୍ଟରେ ଯୋଡ଼ିବାକୁ କ୍ଲିକ୍ କରନ୍ତୁ:'
                : 'Have you visited any of these iconic places? Tap below to record your first heritage stamp:'}
            </p>

            {/* Quick Starter Suggestions */}
            <ul className="border-t border-rule divide-y divide-rule">
              {starterSites.map((site) => (
                <li
                  key={site.id}
                  className="py-3 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="font-display font-bold tracking-display text-xl text-ink truncate">{site.name}</h4>
                    <p className="text-[15px] text-muted truncate">{site.location_context}</p>
                  </div>
                  <button
                    onClick={() => toggleVisited(site)}
                    className="shrink-0 min-h-[44px] text-base font-medium text-ink underline underline-offset-[0.32em] decoration-1 hover:text-mark transition-colors duration-short ease-out cursor-pointer"
                  >
                    Visited
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div>
            <div className="flex items-baseline justify-between gap-4 mb-2">
              <span className="text-[15px] font-medium text-muted">{isHi ? 'रिकॉर्ड किए गए स्थल:' : isOr ? 'ଯୋଡ଼ାଯାଇଥିବା ସ୍ଥଳ:' : 'Recorded Heritage Landmarks:'}</span>
              <span className="text-[15px] font-medium text-muted">{count} Recorded</span>
            </div>

            <ul className="border-t border-rule divide-y divide-rule max-h-[48vh] overflow-y-auto no-scrollbar">
              {visitedSites.map((site) => {
                const localizedTitle = translateEntityName(site.name, site.location_context);
                const localizedLoc = translateLocation(site.location_context);
                const localizedCat = translateCategory(site.category_name);
                const dateStr = site.visitedAt ? new Date(site.visitedAt).toLocaleDateString() : 'Recorded';

                return (
                  <li
                    key={site.id}
                    className="py-4 flex items-start justify-between gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <h4 className="font-display font-bold tracking-display text-xl text-ink">
                        {localizedTitle}
                      </h4>
                      <p className="mt-1 text-[15px] text-muted">
                        {localizedCat}, {localizedLoc || 'Odisha Heritage'}
                      </p>
                      <p className="text-[15px] text-muted">
                        {dateStr}
                      </p>
                    </div>

                    {/* Row Actions */}
                    <div className="shrink-0 flex items-center gap-2">
                      <button
                        onClick={() => handleLocateOnMap(site)}
                        className="min-h-[44px] px-2 text-base font-medium text-ink underline underline-offset-[0.32em] decoration-1 hover:text-mark transition-colors duration-short ease-out cursor-pointer"
                        title="Locate on Map"
                      >
                        View on map
                      </button>

                      <button
                        onClick={() => toggleVisited(site)}
                        className="w-11 h-11 flex items-center justify-center text-muted hover:text-mark hover:bg-paper-2 transition-colors duration-short ease-out cursor-pointer"
                        title="Remove from Passport"
                        aria-label="Remove from Passport"
                      >
                        <Trash2 className="w-5 h-5" aria-hidden="true" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

      </div>
    </div>
  );
}
