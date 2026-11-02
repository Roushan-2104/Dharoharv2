import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useLoader, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import Connections from './Connections';
import SatelliteSurface from './SatelliteSurface';
import { THEME } from '../../config/theme';
import { latLongToVector3 } from '../../utils/geo';
import { useLanguage } from '../../context/LanguageContext';

export default function Earth({ entities, activeEntity, setActiveEntity, itineraryRoute, previewCategory = null, reduceMotion = false }) {
  const { translateEntityName, translateCategory } = useLanguage();
  const earthRef = useRef();
  const radius = 2.5;
  const [hoveredEntity, setHoveredEntity] = useState(null);
  
  const [colorMap, bumpMap, specularMap] = useLoader(THREE.TextureLoader, [
    '/textures/earth-blue-marble.jpg',
    '/textures/earth-topology.png',
    '/textures/earth-water.png',
  ]);

  // The satellite image is sRGB; sample all three maps sharply at grazing angles
  const { gl } = useThree();
  useEffect(() => {
    colorMap.colorSpace = THREE.SRGBColorSpace;
    const maxAniso = gl.capabilities.getMaxAnisotropy();
    [colorMap, bumpMap, specularMap].forEach(tex => {
      tex.anisotropy = maxAniso;
      tex.needsUpdate = true;
    });
  }, [colorMap, bumpMap, specularMap, gl]);

  const indiaLightPos = useMemo(() => {
    const pos = latLongToVector3(22, 82, 15);
    return [pos.x, pos.y, pos.z];
  }, []);

  // A thin edge of atmosphere: brightest at the limb, gone across the face
  const atmosphereMaterial = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      void main() {
        float intensity = pow(0.68 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 4.0);
        gl_FragColor = vec4(0.42, 0.66, 1.0, 1.0) * intensity * 0.9;
      }
    `,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false,
  }), []);

  return (
    <group>
      {/* Daylight over the Indian subcontinent; a low fill keeps the night side readable */}
      <directionalLight position={indiaLightPos} intensity={3.4} color="white" />
      <ambientLight intensity={0.32} color="white" />

      {/* Live satellite imagery, sharper tiles streaming in as the camera comes closer */}
      <SatelliteSurface radius={radius} />

      {/* The still Blue Marble globe sits just beneath the tiles (under the flattened poles too): it shows while they load and fills any gap */}
      <mesh ref={earthRef} position={[0, 0, 0]}>
        <sphereGeometry args={[radius * 0.995, 128, 128]} />
        <meshPhongMaterial
          map={colorMap}
          bumpMap={bumpMap}
          bumpScale={0.05}
          specularMap={specularMap}
          specular={THEME.oceanGlint}
          shininess={22}
        />

        {/* Cultural arcs and itinerary routes */}
        <Connections activeEntity={activeEntity} itineraryRoute={itineraryRoute} radius={radius} reduceMotion={reduceMotion} />
        
        {/* Markers: paper dots that pop in when a set appears; the chosen record is mark red and pulses.
            While a kind is previewed from the index, its places grow and the rest step back. */}
        {entities.map((entity, index) => {
          const coords = entity.coordinates;
          if (!coords || coords.length < 2) return null;

          const pos = latLongToVector3(coords[0], coords[1], radius + 0.012);
          const isActive = activeEntity?.id === entity.id;
          const isHovered = hoveredEntity?.id === entity.id;
          const label = translateEntityName(entity.name, entity.location_context);
          const previewing = previewCategory && previewCategory !== 'All';
          const inPreview = previewing && entity.category_name === previewCategory;
          const dimmed = previewing && !inPreview && !isActive;

          return (
            <group key={entity.id} position={pos}>
              {/* Fixed on-screen size, so markers stay small when the camera comes close */}
              <Html center>
                <button
                  type="button"
                  className="relative cursor-pointer flex items-center justify-center w-4 h-4 bg-transparent border-0 p-0"
                  onClick={(e) => { e.stopPropagation(); setActiveEntity(entity); }}
                  onMouseEnter={() => setHoveredEntity(entity)}
                  onMouseLeave={() => setHoveredEntity(null)}
                  onFocus={() => setHoveredEntity(entity)}
                  onBlur={() => setHoveredEntity(null)}
                  aria-label={label}
                >
                  <span
                    aria-hidden="true"
                    className={`relative block ${reduceMotion ? '' : 'marker-pop'} transition-opacity duration-short ease-out ${dimmed ? 'opacity-25' : 'opacity-100'}`}
                    style={reduceMotion ? undefined : { animationDelay: `${(index % 48) * 16}ms` }}
                  >
                    {isActive && !reduceMotion && (
                      <span className="marker-pulse absolute inset-0 rounded-full border border-mark" />
                    )}
                    <span
                      className={`block w-[7px] h-[7px] rounded-full border border-ink transition-transform duration-short ease-out ${
                        isActive ? 'bg-mark scale-[1.6]' : isHovered || inPreview ? 'bg-paper scale-[1.6]' : 'bg-paper'
                      }`}
                    />
                  </span>

                  {isHovered && (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none z-50 bg-paper text-ink px-2.5 py-1.5 text-left"
                    >
                      <span className="block font-display font-bold text-[13px] leading-tight">{label}</span>
                      <span className="block text-[11px] text-muted leading-tight mt-0.5">{translateCategory(entity.category_name)}</span>
                    </span>
                  )}
                </button>
              </Html>
            </group>
          );
        })}
      </mesh>

      {/* Atmosphere shell, just outside the surface */}
      <mesh scale={1.1} material={atmosphereMaterial}>
        <sphereGeometry args={[radius, 96, 96]} />
      </mesh>
    </group>
  );
}
