import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { Globe, Map as MapIcon, Sparkles } from 'lucide-react';
import Earth from './Earth';
import Map2D from './Map2D';
import BottomHUD from './BottomHUD';
import RightPanel from './RightPanel';
import CameraFramer from './CameraFramer';
import HeroSearchBar from './HeroSearchBar';
import ItineraryModal from './ItineraryModal';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import { useLanguage } from '../../context/LanguageContext';

export default function HeroSection() {
  const { t } = useLanguage();
  const [entities, setEntities] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeEntity, setActiveEntity] = useState(null);
  const [dynamicCategories, setDynamicCategories] = useState({});
  const [is3D, setIs3D] = useState(true); // Toggle State
  const [isItineraryOpen, setIsItineraryOpen] = useState(false);
  const [activeItineraryRoute, setActiveItineraryRoute] = useState([]);

  // Indian Jewel Tone Palette
  const jewelPalette = [
    '#F59E0B', // Saffron Gold / Marigold
    '#0D9488', // Peacock Teal
    '#E11D48', // Terracotta Crimson
    '#3B82F6', // Lapis Lazuli
    '#D97706', // Sandstone Amber
    '#EC4899', // Lotus Rose
    '#8B5CF6', // Royal Amethyst
    '#10B981', // Sacred Tulsi Emerald
  ];

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/entities`)
      .then(res => {
        const uniqueCategories = new Set();
        const data = res.data.map(e => {
          if (e.category_name) uniqueCategories.add(e.category_name);
          return e;
        });

        const catMap = {};
        let index = 0;
        uniqueCategories.forEach(cat => {
          catMap[cat] = jewelPalette[index % jewelPalette.length];
          index++;
        });

        setDynamicCategories(catMap);
        setEntities(data);
      })
      .catch(err => console.error("Error fetching entities:", err));
  }, []);

  const handleSelectEntity = (entity) => {
    if (!entity) return;
    // Auto-adjust category filter if current category hides this entity
    if (activeCategory !== 'All' && entity.category_name !== activeCategory) {
      setActiveCategory('All');
    }
    setActiveEntity(entity);
  };

  const handleHighlightRoute = (coords) => {
    setActiveItineraryRoute(coords || []);
  };

  const filteredEntities = activeCategory === 'All'
    ? entities
    : entities.filter(e => e.category_name === activeCategory);

  return (
    <section className="relative w-full h-screen overflow-hidden pt-16 bg-[#08080C]">

      {/* Floating Hero Search Bar */}
      <HeroSearchBar 
        entities={entities}
        categoryColors={dynamicCategories}
        onSelectEntity={handleSelectEntity}
        activeEntity={activeEntity}
      />

      {/* Top Right Controls: Plan Cultural Trail & 2D/3D Toggle */}
      <div className="absolute top-24 right-4 sm:right-8 z-20 flex items-center gap-2 sm:gap-3">
        
        {/* Plan Cultural Trail Action Button */}
        <button
          onClick={() => setIsItineraryOpen(true)}
          className="dharohar-glass px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full border border-[#D4AF37]/40 text-[#FFF8E7] hover:text-[#F5D77F] bg-[#12121E]/85 hover:bg-[#D4AF37]/20 shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex items-center gap-2 transition-all duration-300 transform hover:scale-105 group cursor-pointer"
          title="Plan AI Cultural Trail"
        >
          <Sparkles className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#F59E0B] group-hover:rotate-12 transition-transform" />
          <span className="font-cinzel text-xs font-bold tracking-wide">
            {t('itinerary_btn')}
          </span>
          {activeItineraryRoute.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-[#F59E0B] shadow-[0_0_8px_#F59E0B] animate-pulse"></span>
          )}
        </button>

        {/* 2D / 3D Toggle Switch */}
        <div className="dharohar-glass p-1 flex items-center rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-[#D4AF37]/30">
          <button
            onClick={() => setIs3D(true)}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-full heritage-badge transition-all duration-300 ${
              is3D 
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-[#08080C] font-bold shadow-[0_0_15px_rgba(212,175,55,0.4)]' 
                : 'text-zinc-400 hover:text-[#F5D77F]'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="text-xs">{t('hero_3d')}</span>
          </button>
          <button
            onClick={() => setIs3D(false)}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 rounded-full heritage-badge transition-all duration-300 ${
              !is3D 
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#F59E0B] text-[#08080C] font-bold shadow-[0_0_15px_rgba(212,175,55,0.4)]' 
                : 'text-zinc-400 hover:text-[#F5D77F]'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span className="text-xs">{t('hero_2d')}</span>
          </button>
        </div>
      </div>

      {/* Map Area (Conditionally Rendered) */}
      {is3D ? (
        <div className="w-full h-full absolute inset-0 cursor-move z-0">
          <Canvas camera={{ position: [0.67, 2.63, -7.0], fov: 45 }}>
            <Stars radius={100} depth={60} count={6000} factor={4} saturation={0.5} fade speed={0.8} />
            
            <Earth 
              entities={filteredEntities} 
              categoryColors={dynamicCategories}
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
          </Canvas>
        </div>
      ) : (
        <Map2D 
          entities={filteredEntities}
          categoryColors={dynamicCategories}
          activeEntity={activeEntity}
          setActiveEntity={setActiveEntity}
          itineraryRoute={activeItineraryRoute}
        />
      )}

      {/* Floating Bottom Cultural Dimensions Filter */}
      <BottomHUD 
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        categories={['All', ...Object.keys(dynamicCategories)]}
        categoryColors={dynamicCategories}
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

    </section>
  );
}
