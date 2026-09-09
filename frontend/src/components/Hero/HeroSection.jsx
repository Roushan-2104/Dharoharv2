import React, { useState, useEffect, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { Globe, Map as MapIcon, Sparkles, Layers, Compass, X } from 'lucide-react';
import Earth from './Earth';
import Map2D from './Map2D';
import BottomHUD from './BottomHUD';
import RightPanel from './RightPanel';
import CameraFramer from './CameraFramer';
import HeroSearchBar from './HeroSearchBar';
import ItineraryModal from './ItineraryModal';
import PersonalizeMapModal from './PersonalizeMapModal';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import { HERITAGE_CATEGORY_COLORS, isFeaturedEntity } from '../../config/categoryColors';
import { useLanguage } from '../../context/LanguageContext';
import { calibrateEntityCoordinates, calculateDistanceKm } from '../../utils/geo';

export default function HeroSection() {
  const { t, isItineraryOpen, setIsItineraryOpen } = useLanguage();
  const location = useLocation();
  const [entities, setEntities] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeEntity, setActiveEntity] = useState(null);
  const [densityMode, setDensityMode] = useState('featured'); // 'featured' | 'all'
  const [is3D, setIs3D] = useState(true); // Toggle State
  const [activeItineraryRoute, setActiveItineraryRoute] = useState([]);
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

  const filteredEntities = getDisplayEntities();

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

  return (
    <section className="relative w-full h-screen overflow-hidden pt-16 bg-[#08080C]">

      {/* Floating Hero Search & Personalization Command Bar */}
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

      {/* Top Right Controls: Map Viewport & Layer Density Dock */}
      <div 
        className={`absolute top-24 right-4 sm:right-8 md:right-10 z-30 flex items-center gap-2 sm:gap-2.5 pointer-events-auto transition-all duration-500 ${
          activeEntity ? 'opacity-0 sm:opacity-100 pointer-events-none sm:pointer-events-auto sm:right-[560px]' : ''
        }`}
      >
        {/* Featured vs All Density Toggle (Only when not personalized) */}
        {(!userPreference?.isActive || activeCategory !== 'All') && (
          <div className="dharohar-glass p-0.5 sm:p-1 flex items-center rounded-2xl shadow-[0_6px_25px_rgba(0,0,0,0.6)] border border-[#D4AF37]/35 bg-[#0C0C14]/85">
            <button
              onClick={() => setDensityMode('featured')}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl heritage-badge transition-all duration-300 cursor-pointer ${
                densityMode === 'featured'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-[#08080C] font-bold shadow-[0_0_15px_rgba(212,175,55,0.4)]' 
                  : 'text-zinc-400 hover:text-[#F5D77F]'
              }`}
              title="Show curated iconic heritage highlights (~35 landmarks)"
            >
              <Sparkles className="w-3 h-3 text-amber-900" />
              <span className="text-[10px] sm:text-xs">Highlights</span>
            </button>
            <button
              onClick={() => setDensityMode('all')}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl heritage-badge transition-all duration-300 cursor-pointer ${
                densityMode === 'all'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-[#08080C] font-bold shadow-[0_0_15px_rgba(212,175,55,0.4)]' 
                  : 'text-zinc-400 hover:text-[#F5D77F]'
              }`}
              title={`Show all ${entities.length} heritage sites`}
            >
              <Layers className="w-3 h-3" />
              <span className="text-[10px] sm:text-xs">All</span>
            </button>
          </div>
        )}

        {/* 2D / 3D Toggle Switch */}
        <div className="dharohar-glass p-0.5 sm:p-1 flex items-center rounded-2xl shadow-[0_6px_25px_rgba(0,0,0,0.6)] border border-[#D4AF37]/35 bg-[#0C0C14]/85">
          <button
            onClick={() => setIs3D(true)}
            className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl heritage-badge transition-all duration-300 cursor-pointer ${
              is3D 
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-[#08080C] font-bold shadow-[0_0_15px_rgba(212,175,55,0.4)]' 
                : 'text-zinc-400 hover:text-[#F5D77F]'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="text-[10px] sm:text-xs">{t('hero_3d')}</span>
          </button>
          <button
            onClick={() => setIs3D(false)}
            className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl heritage-badge transition-all duration-300 cursor-pointer ${
              !is3D 
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-[#08080C] font-bold shadow-[0_0_15px_rgba(212,175,55,0.4)]' 
                : 'text-zinc-400 hover:text-[#F5D77F]'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span className="text-[10px] sm:text-xs">{t('hero_2d')}</span>
          </button>
        </div>
      </div>

      {/* Map Area (Conditionally Rendered) */}
      {is3D ? (
        <div className="w-full h-full absolute inset-0 cursor-move z-0">
          <Canvas camera={{ position: [0.67, 2.63, -7.0], fov: 45 }}>
            <Suspense fallback={null}>
              <Stars radius={100} depth={60} count={6000} factor={4} saturation={0.5} fade speed={0.8} />
              
              <Earth 
                entities={filteredEntities} 
                categoryColors={HERITAGE_CATEGORY_COLORS}
                activeEntity={activeEntity}
                setActiveEntity={setActiveEntity}
                itineraryRoute={activeItineraryRoute}
              />
              
              <CameraFramer activeEntity={activeEntity} radius={2.5} />

              <OrbitControls 
                makeDefault
                enableZoom={true} 
                enablePan={false} 
                autoRotate={false} 
                minDistance={3}
                maxDistance={12}
                zoomSpeed={1.2}
                rotateSpeed={0.8}
              />
            </Suspense>
          </Canvas>
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

      {/* Floating Bottom Cultural Dimensions Filter */}
      <BottomHUD 
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        categories={['All', ...uniqueCategories]}
        categoryColors={HERITAGE_CATEGORY_COLORS}
        setActiveEntity={setActiveEntity}
      />

      {/* Right Sliding Panel for Darshak AI Cultural Chronicle */}
      <RightPanel 
        activeEntity={activeEntity} 
        setActiveEntity={setActiveEntity} 
      />

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
