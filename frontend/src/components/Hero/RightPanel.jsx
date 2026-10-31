import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import { useLanguage } from '../../context/LanguageContext';
import { getRegionalFoodsForEntity } from '../../utils/regionalFoods';
import VerifiedCommunityOpinions from './VerifiedCommunityOpinions';

export default function RightPanel({ activeEntity, setActiveEntity }) {
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
    setIsPassportOpen,
    openQuizForEntity
  } = useLanguage();

  const [wikiImage, setWikiImage] = useState(null);
  const [loadingImg, setLoadingImg] = useState(false);
  const [connections, setConnections] = useState([]);
  const [loadingConnections, setLoadingConnections] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const isHi = language === 'hi';
  const isOr = language === 'or';
  const regionalFoodProfile = activeEntity ? getRegionalFoodsForEntity(activeEntity) : null;

  // Stop speech when entity or language changes or panel unmounts
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [activeEntity, language]);

  const toggleNarration = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const localizedTitle = translateEntityName(activeEntity?.name, activeEntity?.location_context);
    const localizedDesc = translateEntityDescription(
      activeEntity?.description,
      activeEntity?.name,
      activeEntity?.category_name,
      activeEntity?.location_context
    );
    const fullText = `${localizedTitle}. ${localizedDesc}`;

    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.lang = language === 'hi' ? 'hi-IN' : language === 'or' ? 'or-IN' : 'en-IN';
    utterance.rate = 0.95;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

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

  // Plain-language label for each kind of relationship in the record
  const getRelationshipLabel = (type) => {
    switch (type) {
      case 'associated_dance':
        return language === 'hi' ? 'शास्त्रीय नृत्य' : language === 'or' ? 'ଶାସ୍ତ୍ରୀୟ ନୃତ୍ୟ' : 'Living dance and art';
      case 'architectural_evolution':
        return language === 'hi' ? 'स्थापत्य शैली' : language === 'or' ? 'ସ୍ଥାପତ୍ୟ ଶୈଳୀ' : 'Architecture';
      case 'artisan_lineage':
      case 'ritual_craft':
      case 'weaver_lineage':
        return language === 'hi' ? 'शिल्प एवं हथकरघा' : language === 'or' ? 'ହସ୍ତଶିଳ୍ପ ଓ ବୟନ' : 'Hereditary crafts';
      case 'culinary_tradition':
      case 'culinary_origin':
      case 'culinary_staple':
        return language === 'hi' ? 'पारंपरिक भोजन' : language === 'or' ? 'ପାରମ୍ପରିକ ଖାଦ୍ୟ' : 'Sacred cuisine';
      case 'patron_dynasty':
      case 'ancient_dynasty':
      case 'royal_servitude':
      case 'historical_turning_point':
        return language === 'hi' ? 'राजवंश एवं इतिहास' : language === 'or' ? 'ରାଜବଂଶ ଓ ଇତିହାସ' : 'Dynasty and history';
      case 'maritime_trade':
      case 'maritime_ritual':
        return language === 'hi' ? 'समुद्री व्यापार' : language === 'or' ? 'ନୌବାଣିଜ୍ୟ' : 'Maritime heritage';
      case 'sacred_festival':
      case 'celebrated_festival':
      case 'agrarian_festival':
      case 'folk_ritual':
        return language === 'hi' ? 'पवित्र उत्सव' : language === 'or' ? 'ପବିତ୍ର ପର୍ବ' : 'Sacred festival';
      default:
        return language === 'hi' ? 'सांस्कृतिक परंपरा' : language === 'or' ? 'ସାଂସ୍କୃତିକ ସମ୍ପର୍କ' : 'Cultural lineage';
    }
  };

  const textLink = 'min-h-[44px] inline-flex items-center font-medium underline underline-offset-[0.32em] decoration-1 hover:text-mark transition-colors duration-short ease-out cursor-pointer';
  const visited = isVisited(activeEntity?.id);

  return (
    <article aria-label={translateEntityName(activeEntity?.name, activeEntity?.location_context)} className="flex flex-col rise-in">

      {/* Where this record sits, and the way back */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setActiveEntity(null)}
          className="min-h-[44px] text-left font-medium text-mark hover:underline underline-offset-[0.32em] cursor-pointer"
        >
          {translateCategory(activeEntity?.category_name)}
        </button>
        <button
          type="button"
          onClick={() => setActiveEntity(null)}
          className="min-h-[44px] px-4 bg-ink text-paper font-medium hover:bg-ink-2 transition-colors duration-short ease-out cursor-pointer"
          aria-label={t('panel_close')}
        >
          {t('panel_close')}
        </button>
      </div>

      <h2 className="mt-5 font-display font-bold tracking-poster leading-[0.92] text-[clamp(2.75rem,4.6vw,4.5rem)]">
        {translateEntityName(activeEntity?.name, activeEntity?.location_context)}
      </h2>
      {activeEntity?.location_context && (
        <p className="mt-3 text-lg text-ink-2">{translateLocation(activeEntity?.location_context)}</p>
      )}

      {/* The photograph, printed in one ink on the paper step */}
      <figure className="mt-6 bg-paper-2">
        {loadingImg ? (
          <div className="aspect-[4/3] flex items-center justify-center text-muted" role="status">{t('panel_loading_img')}</div>
        ) : wikiImage ? (
          <img
            src={wikiImage}
            alt={activeEntity?.name}
            className="block w-full aspect-[4/3] object-cover grayscale contrast-[1.12] mix-blend-multiply"
          />
        ) : (
          <div className="aspect-[4/3] flex items-center justify-center text-muted">{t('panel_record_progress')}</div>
        )}
        {wikiImage && (
          <figcaption className="bg-paper pt-2 text-[13px] text-muted">Photo: Wikipedia</figcaption>
        )}
      </figure>

      <p className="mt-6 text-[17px] leading-relaxed text-ink-2 max-w-[60ch]">
        {translateEntityDescription(
          activeEntity?.description,
          activeEntity?.name,
          activeEntity?.category_name,
          activeEntity?.location_context
        )}
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
        <button
          type="button"
          onClick={handleAskAI}
          className="min-h-[52px] px-6 bg-ink text-paper font-medium hover:bg-ink-2 transition-colors duration-short ease-out cursor-pointer"
        >
          {t('panel_ask_ai_btn')}
        </button>
        <button
          type="button"
          onClick={() => toggleVisited(activeEntity)}
          aria-pressed={visited}
          className={`${textLink} ${visited ? 'text-mark' : ''}`}
        >
          {visited ? 'Visited' : 'Mark visited'}
        </button>
        <button type="button" onClick={toggleNarration} aria-pressed={isSpeaking} className={textLink}>
          {isSpeaking ? 'Stop narration' : 'Listen'}
        </button>
        <button
          type="button"
          onClick={() => openQuizForEntity(activeEntity?.name || activeEntity?.id)}
          className={textLink}
          title="Play Lore Quiz on this Monument"
        >
          {isHi ? 'क्विज़ खेलें' : isOr ? 'କୁଇଜ୍ ଖେଳନ୍ତୁ' : 'Lore quiz'}
        </button>
        <a
          href={`https://en.wikipedia.org/wiki/${encodeURIComponent(activeEntity?.name || '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className={textLink}
        >
          {t('panel_wiki_view')}
        </a>
      </div>

      {/* The record's connections, as a ruled list */}
      <section className="mt-14">
        <h3 className="text-3xl">{t('panel_living_threads')}</h3>
        {loadingConnections ? (
          <p className="mt-4 text-muted" role="status">{t('panel_loading_img')}</p>
        ) : connections.length > 0 ? (
          <ul className="mt-5">
            {connections.map((conn) => {
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
                <li key={conn.id} className="py-5 border-t border-rule">
                  <p className="text-[15px] font-medium text-muted">
                    {getRelationshipLabel(conn.relationship_type)}, {translateCategory(conn.category_name)}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleHopNode(conn)}
                    className="mt-1 text-left font-display font-bold tracking-display text-2xl leading-tight hover:text-mark transition-colors duration-short ease-out cursor-pointer"
                    title={t('panel_hop_arc')}
                  >
                    {translateEntityName(conn.name, conn.location_context)}
                  </button>
                  {relLabel && <p className="mt-1 font-medium text-ink">{relLabel}</p>}
                  {relLore && (
                    <p className="mt-2 text-[16px] leading-relaxed text-ink-2 line-clamp-3">{relLore}</p>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-4 text-muted">{t('panel_no_connections')}</p>
        )}
      </section>

      {/* Foods of the region */}
      {regionalFoodProfile && (
        <section className="mt-14">
          <h3 className="text-3xl">
            {isHi ? 'यहाँ का प्रसिद्ध खान-पान व स्वाद' : isOr ? 'ଏହି ସ୍ଥାନର ପ୍ରସିଦ୍ଧ ପାରମ୍ପରିକ ଖାଦ୍ୟ' : 'Famous local foods of this region'}
          </h3>
          <p className="mt-2 text-muted">
            {isHi ? regionalFoodProfile.regionNameHi : isOr ? regionalFoodProfile.regionNameOr : regionalFoodProfile.regionName}
          </p>
          <ul className="mt-5">
            {regionalFoodProfile.dishes.map((dish, dIdx) => {
              const dishTitle = isHi ? dish.nameHi : isOr ? dish.nameOr : dish.name;
              const dishType = isHi ? dish.typeHi : isOr ? dish.typeOr : dish.type;
              const dishDesc = isHi ? dish.descriptionHi : isOr ? dish.descriptionOr : dish.description;

              return (
                <li key={dIdx} className="py-5 border-t border-rule">
                  <p className="text-[15px] font-medium text-muted">{dishType}</p>
                  <p className="mt-1 font-display font-bold tracking-display text-xl leading-tight">{dishTitle}</p>
                  <p className="mt-2 text-[16px] leading-relaxed text-ink-2">{dishDesc}</p>
                  <button
                    type="button"
                    onClick={() => {
                      const q = isHi
                        ? `${dishTitle} की सामग्री, बनाने की विधि और ${translateEntityName(activeEntity.name, activeEntity.location_context)} में इसे खाने की सबसे अच्छी जगह बताएं।`
                        : isOr
                        ? `${dishTitle}ର ପ୍ରସ୍ତୁତି ପ୍ରଣାଳୀ ଓ ${translateEntityName(activeEntity.name, activeEntity.location_context)}ରେ ଏହା କେଉଁଠି ମିଳେ କୁହନ୍ତୁ।`
                        : `Tell me about the recipe, origin lore, and best authentic places to eat ${dishTitle} near ${translateEntityName(activeEntity.name, activeEntity.location_context)}.`;
                      openChatWithQuery(q);
                    }}
                    className={`mt-1 ${textLink}`}
                  >
                    {isHi ? 'इस व्यंजन के बारे में AI से पूछें' : isOr ? 'ଏହି ଖାଦ୍ୟ ବିଷୟରେ AI କୁ ପଚାରନ୍ତୁ' : 'Ask the guide about this dish'}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* What visitors say */}
      <VerifiedCommunityOpinions activeEntity={activeEntity} />

    </article>
  );
}
