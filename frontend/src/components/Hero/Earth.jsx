import React, { useRef, useMemo, useState } from 'react';
import { useLoader } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import Connections from './Connections';
import { latLongToVector3 } from '../../utils/geo';
import { useLanguage } from '../../context/LanguageContext';

export default function Earth({ entities, categoryColors, activeEntity, setActiveEntity }) {
  const { translateEntityName, translateCategory } = useLanguage();
  const earthRef = useRef();
  const radius = 2.5;
  const [hoveredEntity, setHoveredEntity] = useState(null);
  
  const [colorMap, bumpMap, specularMap] = useLoader(THREE.TextureLoader, [
    '/textures/earth-blue-marble.jpg',
    '/textures/earth-topology.png',
    '/textures/earth-water.png',
  ]);

  const indiaLightPos = useMemo(() => {
    const pos = latLongToVector3(22, 82, 15);
    return [pos.x, pos.y, pos.z];
  }, []);

  return (
    <group>
      {/* Warm Golden Illumination on Indian Subcontinent */}
      <directionalLight position={indiaLightPos} intensity={4.0} color="#FFF4D6" />
      <ambientLight intensity={0.35} color="#E8D8B8" />

      {/* Earth Sphere */}
      <mesh ref={earthRef} position={[0, 0, 0]}>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshStandardMaterial
          map={colorMap}
          bumpMap={bumpMap}
          bumpScale={0.06}
          roughnessMap={specularMap}
          roughness={0.65}
          metalness={0.15}
        />
        
        {/* Render Glowing Golden Cultural Arcs */}
        <Connections activeEntity={activeEntity} radius={radius} />
        
        {/* Render Jewel Markers with Tooltips */}
        {entities.map(entity => {
          if (!entity.coordinates || entity.coordinates.length < 2) return null;
          const pos = latLongToVector3(entity.coordinates[0], entity.coordinates[1], radius + 0.02);
          const color = categoryColors[entity.category_name] || '#D4AF37';
          const isActive = activeEntity?.id === entity.id;
          const isHovered = hoveredEntity?.id === entity.id;

          return (
            <group key={entity.id} position={pos}>
              <Html center distanceFactor={10}>
                <div 
                  className="relative group cursor-pointer flex items-center justify-center"
                  onClick={(e) => { e.stopPropagation(); setActiveEntity(entity); }}
                  onMouseEnter={() => setHoveredEntity(entity)}
                  onMouseLeave={() => setHoveredEntity(null)}
                >
                  {/* Glowing Beacon Ripple for Active or Hovered Marker */}
                  {(isActive || isHovered) && (
                    <div 
                      className="absolute w-8 h-8 rounded-full animate-ping pointer-events-none"
                      style={{ backgroundColor: color, opacity: 0.4 }}
                    />
                  )}

                  {/* Core Jewel Dot */}
                  <div 
                    className="relative rounded-full transition-all duration-300"
                    style={{
                      width: isActive ? '14px' : isHovered ? '12px' : '8px',
                      height: isActive ? '14px' : isHovered ? '12px' : '8px',
                      backgroundColor: color,
                      boxShadow: `0 0 ${isActive ? '22px' : isHovered ? '16px' : '8px'} ${color}`,
                      border: '1.5px solid rgba(255,255,255,0.95)',
                      transform: 'scale(1)',
                    }}
                  />

                  {/* Tooltip Card on Hover / Active */}
                  {(isActive || isHovered) && (
                    <div 
                      className="absolute bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none z-50 animate-fade-in-up"
                    >
                      <div className="dharohar-glass px-3 py-1.5 rounded-lg border border-[#D4AF37]/50 shadow-[0_8px_25px_rgba(0,0,0,0.8)] flex flex-col items-center">
                        <span className="text-[12px] font-bold font-cinzel text-[#FFF8E7] tracking-wider">
                          {translateEntityName(entity.name, entity.location_context)}
                        </span>
                        <span 
                          className="text-[9px] uppercase font-semibold tracking-widest mt-0.5"
                          style={{ color: color }}
                        >
                          {translateCategory(entity.category_name)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </Html>
            </group>
          );
        })}
      </mesh>
      
      {/* Radiant Golden Atmospheric Corona Glow */}
      <mesh>
        <sphereGeometry args={[2.58, 64, 64]} />
        <meshBasicMaterial
          color="#D4AF37"
          transparent={true}
          opacity={0.12}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Outer Soft Amber Aura */}
      <mesh>
        <sphereGeometry args={[2.7, 64, 64]} />
        <meshBasicMaterial
          color="#F59E0B"
          transparent={true}
          opacity={0.05}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}
