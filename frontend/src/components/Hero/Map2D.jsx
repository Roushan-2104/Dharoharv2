import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import Connections2D from './Connections2D';
import { useLanguage } from '../../context/LanguageContext';

// Component to handle auto-panning when an entity is selected
function MapController({ activeEntity }) {
  const map = useMap();

  useEffect(() => {
    if (activeEntity && activeEntity.coordinates) {
      // Pan to the entity and zoom in slightly, offseting the center to the left so it sits next to the RightPanel
      const [lat, lng] = activeEntity.coordinates;
      
      // Calculate a slight longitude offset based on current zoom to frame it on the left
      const offsetLng = lng + (360 / Math.pow(2, map.getZoom())) * 0.15;
      
      map.flyTo([lat, offsetLng], 6, {
        duration: 1.5,
        easeLinearity: 0.25
      });
    }
  }, [activeEntity, map]);

  return null;
}

export default function Map2D({ entities, categoryColors, activeEntity, setActiveEntity }) {
  const { translateEntityName, translateCategory } = useLanguage();
  
  // Custom Leaflet DivIcon creator with glowing jewel tone styling
  const createCustomIcon = (color, isActive) => {
    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: `<div style="
        width: ${isActive ? '18px' : '10px'};
        height: ${isActive ? '18px' : '10px'};
        background-color: ${color};
        border-radius: 50%;
        box-shadow: 0 0 ${isActive ? '24px' : '10px'} ${color};
        border: 1.5px solid rgba(255,255,255,0.95);
        transition: all 0.3s ease;
        transform: translate(-50%, -50%);
        ${isActive ? 'animation: pulse-ring 2s infinite;' : ''}
      "></div>`,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });
  };

  return (
    <div className="w-full h-full absolute inset-0 z-0">
      <MapContainer 
        center={[20.5, 84.5]} // Center on Odisha / Eastern India
        zoom={6} 
        style={{ width: '100%', height: '100%', background: '#08080C' }}
        zoomControl={false} // Clean modern look
      >
        
        {/* High-Res Satellite Layer */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution='Tiles &copy; Esri &mdash; Dharohar National Heritage Knowledge System'
        />

        <MapController activeEntity={activeEntity} />

        {entities.map(entity => {
          if (!entity.coordinates || entity.coordinates.length < 2) return null;
          
          const color = categoryColors[entity.category_name] || '#D4AF37';
          const isActive = activeEntity?.id === entity.id;

          return (
            <Marker 
              key={entity.id}
              position={[entity.coordinates[0], entity.coordinates[1]]}
              icon={createCustomIcon(color, isActive)}
              eventHandlers={{
                click: () => setActiveEntity(entity),
              }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={0.95}>
                <div className="px-2 py-1 bg-[#0C0C14] text-[#FFF8E7] rounded border border-[#D4AF37]/50 shadow-lg text-center">
                  <div className="font-cinzel text-xs font-bold">{translateEntityName(entity.name, entity.location_context)}</div>
                  <div className="text-[9px] uppercase tracking-wider font-semibold" style={{ color: color }}>
                    {translateCategory(entity.category_name)}
                  </div>
                </div>
              </Tooltip>
            </Marker>
          );
        })}

        {/* 2D Cultural Connections */}
        {activeEntity && <Connections2D activeEntity={activeEntity} />}

      </MapContainer>

      {/* Global CSS for the custom markers and tooltips */}
      <style>{`
        .custom-leaflet-marker {
          background: transparent;
          border: none;
        }
        .leaflet-container {
          background: #08080C;
        }
        .leaflet-tooltip {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .leaflet-tooltip-top:before {
          border-top-color: #0C0C14 !important;
        }
      `}</style>
    </div>
  );
}
