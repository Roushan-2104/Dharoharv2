import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, useProgress } from '@react-three/drei';
import Earth from './Earth';
import Map2D from './Map2D';
import BottomHUD from './BottomHUD';
import RightPanel from './RightPanel';
import CameraFramer from './CameraFramer';
import { SATELLITE_TILES } from '../../config/satellite';
import { markReady } from '../../splash';
import HeroSearchBar from './HeroSearchBar';
import ItineraryModal from './ItineraryModal';
import PersonalizeMapModal from './PersonalizeMapModal';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import { HERITAGE_CATEGORY_COLORS, isFeaturedEntity } from '../../config/categoryColors';
import { useLanguage } from '../../context/LanguageContext';
import { calibrateEntityCoordinates, calculateDistanceKm } from '../../utils/geo';

// A quiet line in the field while the globe textures load, so the black field does not read as broken
function GlobeLoading() {
  const { active, progress } = useProgress();
  const loaded = !active && progress >= 100;
  useEffect(() => { if (loaded) markReady('globe'); }, [loaded]);
  if (loaded) return null;
  return (
    <p role="status" className="absolute inset-0 z-20 flex items-center justify-center text-paper opacity-80 text-sm pointer-events-none">
      Loading the globe{progress > 0 ? ` ${Math.round(progress)}%` : ''}
    </p>
  );
}

export default function HeroSection() {
  const { t, isItineraryOpen, setIsItineraryOpen } = useLanguage();
  const location = useLocation();
  const [entities, setEntities] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeEntity, setActiveEntity] = useState(null);
  const [densityMode, setDensityMode] = useState('featured'); // 'featured' | 'all'
  const [is3D, setIs3D] = useState(true); // Toggle State
  const [activeItineraryRoute, setActiveItineraryRoute] = useState([]);
  const [previewCategory, setPreviewCategory] = useState(null);
  const [rotationPaused, setRotationPaused] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const idleTimer = useRef(null);

  // Start counting towards the idle drift once the arrival sweep has finished
  useEffect(() => {
    idleTimer.current = setTimeout(() => setIsIdle(true), 11000);
    return () => clearTimeout(idleTimer.current);
  }, []);

  // Choosing or closing a record counts as activity
  useEffect(() => {
    setIsIdle(false);
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setIsIdle(true), 8000);
  }, [activeEntity]);
  const [isPersonalizeOpen, setIsPersonalizeOpen] = useState(false);
  const [userPreference, setUserPreference] = useState(() => {
    try {
      const saved = localStorage.getItem('dharohar_user_preference');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/entities`)
      .then(res => {
        const data = res.data.map(e => {
          const calibratedCoords = calibrateEntityCoordinates(e);
          return {
            ...e,
            coordinates: calibratedCoords
          };
        });
        setEntities(data);
        markReady('data');
      })
      .catch(err => console.error("Error fetching entities:", err));
  }, []);

  const handleSelectEntity = (entity) => {
    if (!entity) return;
    if (activeCategory !== 'All' && entity.category_name !== activeCategory) {
      setActiveCategory('All');
    }
    setActiveEntity(entity);
  };

  // Auto-select entity if navigated from Discover Page with state
  useEffect(() => {
    if (entities.length > 0 && location.state) {
      const targetId = location.state.selectedEntityId;
      const targetName = location.state.selectedEntity?.name;
      const found = entities.find(e => (targetId && e.id === targetId) || (targetName && e.name === targetName));
      if (found) {
        handleSelectEntity(found);
      }
    }
  }, [entities, location.state]);

  const handleApplyPreference = (pref) => {
    setUserPreference(pref);
    // Personalized filtering only runs on the "All" category, so clear any category filter
    setActiveCategory('All');
    try {
      localStorage.setItem('dharohar_user_preference', JSON.stringify(pref));
    } catch (e) {}
  };

  const handleResetPreference = () => {
    setUserPreference(null);
    try {
      localStorage.removeItem('dharohar_user_preference');
    } catch (e) {}
  };

  // Smart Personalized & Clutter-Free Filtering Logic
  const getDisplayEntities = () => {
    if (userPreference?.isActive && activeCategory === 'All') {
      const [userLat, userLon] = userPreference.coords || [19.8135, 85.8312];
      const matchingVibeCategories = userPreference.categories || [];
      const maxDistance = userPreference.maxKm || 100;

      let candidates = entities.filter(e => {
        if (!e.coordinates || e.coordinates.length < 2) return false;
        if (matchingVibeCategories.length > 0 && !matchingVibeCategories.includes(e.category_name)) {
          return false;
        }
        const dist = calculateDistanceKm(userLat, userLon, e.coordinates[0], e.coordinates[1]);
        return dist <= maxDistance;
      });

      if (candidates.length < 4) {
        candidates = entities.filter(e => {
          if (!e.coordinates || e.coordinates.length < 2) return false;
          if (matchingVibeCategories.length > 0 && !matchingVibeCategories.includes(e.category_name)) {
            return false;
          }
          return true;
        });
      }

      candidates.sort((a, b) => {
        const distA = calculateDistanceKm(userLat, userLon, a.coordinates[0], a.coordinates[1]);
        const distB = calculateDistanceKm(userLat, userLon, b.coordinates[0], b.coordinates[1]);
        return distA - distB;
      });

      const topCurated = candidates.slice(0, 10);
      if (activeEntity && !topCurated.some(e => e.id === activeEntity.id)) {
        topCurated.unshift(activeEntity);
      }
      return topCurated;
    }

    if (activeCategory !== 'All') {
      const catEntities = entities.filter(e => e.category_name === activeCategory);
      if (densityMode === 'featured') {
        const featuredInCat = catEntities.filter(e => isFeaturedEntity(e) || (activeEntity && e.id === activeEntity.id));
        return featuredInCat.length >= 3 ? featuredInCat : catEntities.slice(0, 12);
      }
      return catEntities;
    }

    if (densityMode === 'featured') {
      return entities.filter(e => isFeaturedEntity(e) || (activeEntity && e.id === activeEntity.id));
    }

    return entities;
  };

  // While a kind is previewed, all of its places join the globe so the preview shows the whole kind
  const filteredEntities = (() => {
    const shown = getDisplayEntities();
    if (!previewCategory || previewCategory === 'All') return shown;
    const ids = new Set(shown.map(e => e.id));
    return [...shown, ...entities.filter(e => e.category_name === previewCategory && !ids.has(e.id))];
  })();

  // Auto-connect personalized points with a glowing trail on map
  useEffect(() => {
    if (userPreference?.isActive && filteredEntities.length > 1 && activeCategory === 'All') {
      const coordsList = filteredEntities
        .map(e => e.coordinates)
        .filter(c => c && c.length >= 2);
      setActiveItineraryRoute(coordsList);
    } else if (!isItineraryOpen) {
      setActiveItineraryRoute([]);
    }
  }, [userPreference, filteredEntities.length, activeCategory, isItineraryOpen]);

  const handleHighlightRoute = (coords) => {
    setActiveItineraryRoute(coords || []);
  };

  const uniqueCategories = Array.from(new Set(entities.map(e => e.category_name).filter(Boolean)));

  // Paired toggle: the chosen option is a block of ink, the other sits on paper
  const toggleOption = (isOn) =>
    `min-h-[48px] px-5 font-medium transition-colors duration-short ease-out cursor-pointer ${
      isOn ? 'bg-ink text-paper' : 'bg-paper text-ink hover:bg-paper-2'
    }`;

  // The same toggle set on the dark space: the chosen option turns paper
  const spaceOption = (isOn) =>
    `min-h-[46px] px-5 font-medium transition-colors duration-short ease-out cursor-pointer ${
      isOn ? 'bg-paper text-ink' : 'bg-space text-paper hover:bg-ink-2'
    }`;

  const reduceMotion = typeof window !== 'undefined'
    && window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // The globe drifts on its own after a quiet spell; any touch stops it, and the visitor can pause it outright
  const globeDrifts = !reduceMotion && !rotationPaused && !activeEntity && isIdle;
  const noteInteraction = () => {
    setIsIdle(false);
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setIsIdle(true), 8000);
  };

  return (
    <section className="relative w-full pt-nav bg-paper text-ink flex flex-col lg:flex-row lg:h-screen">

      {/* The white column: the poster head, search and the index of kinds, or the chosen record.
          On phones it dissolves (display: contents) so the globe can sit between the head and the index. */}
      <aside className="contents lg:relative lg:flex lg:flex-col lg:shrink-0 lg:w-[clamp(440px,36vw,600px)] lg:h-full lg:overflow-y-auto lg:px-8 xl:px-16 lg:pt-12 lg:pb-12">
        {activeEntity ? (
          <div key={activeEntity.id} className="order-1 px-4 md:px-8 pt-6 pb-10 lg:p-0">
            <RightPanel
              activeEntity={activeEntity}
              setActiveEntity={setActiveEntity}
            />
          </div>
        ) : (
          <>
          <div className="order-1 px-4 md:px-8 pt-6 lg:p-0 rise-in">
            <h1 className="font-display font-bold tracking-poster leading-[0.92] text-[clamp(2.75rem,4.4vw,4.75rem)]">
              {t('nav_subtitle')}
            </h1>
            <p className="mt-5 text-lg lg:text-xl leading-snug text-ink-2 max-w-[34ch]">
              {t('hero_lede', { count: entities.length || 200 })}
            </p>

            <div className="mt-8 mb-8 lg:mb-0">
              <HeroSearchBar
                entities={entities}
                categoryColors={HERITAGE_CATEGORY_COLORS}
                onSelectEntity={handleSelectEntity}
                activeEntity={activeEntity}
                onOpenPersonalize={() => setIsPersonalizeOpen(true)}
                userPreference={userPreference}
                onResetPreference={handleResetPreference}
                filteredCount={filteredEntities.length}
              />
            </div>
          </div>

            <div className="order-3 px-4 md:px-8 py-10 lg:p-0 lg:mt-auto lg:pt-10 flex flex-col gap-5">
              {/* Highlights or every record (only when the map is not personalized) */}
              {(!userPreference?.isActive || activeCategory !== 'All') && (
                <div role="group" aria-label={t('hud_subtitle')} className="flex self-start">
                  <button
                    type="button"
                    onClick={() => setDensityMode('featured')}
                    aria-pressed={densityMode === 'featured'}
                    className={toggleOption(densityMode === 'featured')}
                    title="Show curated iconic heritage highlights (~35 landmarks)"
                  >
                    {t('view_highlights')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDensityMode('all')}
                    aria-pressed={densityMode === 'all'}
                    className={toggleOption(densityMode === 'all')}
                    title={`Show all ${entities.length} heritage sites`}
                  >
                    {t('view_all')} <span className="font-display font-bold">{entities.length}</span>
                  </button>
                </div>
              )}

              <BottomHUD
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                categories={['All', ...uniqueCategories]}
                categoryColors={HERITAGE_CATEGORY_COLORS}
                setActiveEntity={setActiveEntity}
                entities={entities}
                onPreview={setPreviewCategory}
              />
            </div>
          </>
        )}
      </aside>

      {/* The field: the globe in deep space (or the 2D map) */}
      <div className="on-field order-2 relative min-w-0 h-[62vh] lg:h-full lg:flex-1 bg-space text-field-ink overflow-hidden">

        <div role="group" aria-label="View" className="absolute top-4 right-4 md:top-8 md:right-8 xl:right-16 z-30 flex border border-paper">
          <button
            type="button"
            onClick={() => setIs3D(true)}
            aria-pressed={is3D}
            className={spaceOption(is3D)}
          >
            {t('hero_3d').replace(/^(3D|३D|୩D)\s*/, '')}
          </button>
          <button
            type="button"
            onClick={() => setIs3D(false)}
            aria-pressed={!is3D}
            className={spaceOption(!is3D)}
          >
            {t('hero_2d').replace(/^(2D|२D|୨D)\s*/, '')}
          </button>
        </div>

      {/* Map Area (Conditionally Rendered) */}
      {is3D ? (
        <div
          className="w-full h-full absolute inset-0 cursor-move z-0"
          onPointerDown={noteInteraction}
          onWheel={noteInteraction}
        >
          <Canvas camera={{ position: [0.67, 2.63, -7.0], fov: 45 }} dpr={[1, 2]}>
            <Suspense fallback={null}>
              {/* A quiet starfield far behind the globe; it holds still when motion is reduced */}
              <Stars radius={120} depth={60} count={4500} factor={3.2} saturation={0} fade speed={reduceMotion ? 0 : 0.35} />
              <Earth
                entities={filteredEntities}
                categoryColors={HERITAGE_CATEGORY_COLORS}
                activeEntity={activeEntity}
                setActiveEntity={setActiveEntity}
                itineraryRoute={activeItineraryRoute}
                previewCategory={previewCategory}
                reduceMotion={reduceMotion}
              />

              <CameraFramer activeEntity={activeEntity} radius={2.5} reduceMotion={reduceMotion} focusRegion={!!previewCategory && previewCategory !== 'All'} />

              <OrbitControls
                makeDefault
                enableZoom={true}
                enablePan={false}
                enableDamping
                dampingFactor={0.08}
                autoRotate={globeDrifts}
                autoRotateSpeed={0.35}
                minDistance={2.506}
                maxDistance={12}
                zoomSpeed={1.2}
                rotateSpeed={0.8}
              />
            </Suspense>
          </Canvas>

          <GlobeLoading />


          {/* Credit for the satellite imagery, as its licence requires */}

          <p className="absolute left-4 md:left-8 top-4 md:top-8 z-20 max-w-[42%] md:max-w-[60%] text-xs text-paper opacity-70 pointer-events-auto">

            {SATELLITE_TILES.attributionUrl

              ? <a href={SATELLITE_TILES.attributionUrl} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">{SATELLITE_TILES.attribution}</a>

              : SATELLITE_TILES.attribution}

          </p>


          {!reduceMotion && !activeEntity && (
            <button
              type="button"
              onClick={() => { setRotationPaused(p => !p); noteInteraction(); }}
              aria-pressed={!rotationPaused}
              className="absolute left-4 md:left-8 bottom-6 md:bottom-12 z-30 min-h-[44px] px-4 border border-paper bg-space text-paper font-medium hover:bg-ink-2 transition-colors duration-short ease-out cursor-pointer"
            >
              {rotationPaused ? 'Let it drift' : 'Pause drift'}
            </button>
          )}
        </div>
      ) : (
        <Map2D 
          entities={filteredEntities}
          categoryColors={HERITAGE_CATEGORY_COLORS}
          activeEntity={activeEntity}
          setActiveEntity={setActiveEntity}
          itineraryRoute={activeItineraryRoute}
        />
      )}
      </div>

      {/* AI Cultural Itinerary Generator Modal */}
      <ItineraryModal
        isOpen={isItineraryOpen}
        onClose={() => setIsItineraryOpen(false)}
        entities={entities}
        onSelectEntity={handleSelectEntity}
        onHighlightRoute={handleHighlightRoute}
        activeRoute={activeItineraryRoute}
      />

      {/* Interactive AI Map Personalizer Modal */}
      <PersonalizeMapModal
        isOpen={isPersonalizeOpen}
        onClose={() => setIsPersonalizeOpen(false)}
        userPreference={userPreference}
        onApplyPreference={handleApplyPreference}
        onResetPreference={handleResetPreference}
      />

    </section>
  );
}
