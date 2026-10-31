import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, useMap, useMapEvents } from 'react-leaflet';
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
      
      map.flyTo([lat, offsetLng], 6.5, {
        duration: 1.5,
        easeLinearity: 0.25
      });
    }
  }, [activeEntity, map]);

  return null;
}

// Fit the view to a highlighted route (personalized map or itinerary) when it changes
function RouteFramer({ route }) {
  const map = useMap();
  const routeKey = (route || []).map(c => c.join(',')).join('|');

  useEffect(() => {
    if (route && route.length > 1) {
      map.flyToBounds(route, { padding: [80, 80], maxZoom: 10, duration: 1.5 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeKey, map]);

  return null;
}

// Track zoom level for dynamic marker scaling
function ZoomTracker({ onZoomChange }) {
  const map = useMapEvents({
    zoomend: () => {
      onZoomChange(map.getZoom());
    },
  });
  return null;
}

export default function Map2D({ entities, categoryColors, activeEntity, setActiveEntity, itineraryRoute }) {
  const { translateEntityName, translateCategory } = useLanguage();
  const [currentZoom, setCurrentZoom] = useState(6);
  
  // Custom Leaflet DivIcon creator with refined micro-jewel styling
  const createCustomIcon = (color, isActive) => {
    // Dynamic scale based on map zoom
    const baseSize = currentZoom <= 6 ? 5 : currentZoom <= 8 ? 6 : 8;
    const activeSize = currentZoom <= 6 ? 9 : currentZoom <= 8 ? 10 : 12;
    const size = isActive ? activeSize : baseSize;

    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: `<div class="marker-dot ${isActive ? 'active-pulse' : ''}" style="
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        border-radius: 50%;
        box-shadow: ${isActive ? `0 0 10px ${color}, 0 0 18px rgba(255,255,255,0.5)` : `0 0 5px ${color}`};
        border: 1px solid rgba(255,255,255,0.95);
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        transform: translate(-50%, -50%);
        cursor: pointer;
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
        <RouteFramer route={itineraryRoute} />
        <ZoomTracker onZoomChange={setCurrentZoom} />

        {entities.map(entity => {
          const coords = entity.coordinates;
          if (!coords || coords.length < 2) return null;
          
          const color = categoryColors[entity.category_name] || '#D4AF37';
          const isActive = activeEntity?.id === entity.id;

          return (
            <Marker 
              key={entity.id}
              position={[coords[0], coords[1]]}
              icon={createCustomIcon(color, isActive)}
              eventHandlers={{
                click: () => setActiveEntity(entity),
              }}
            >
              <Tooltip direction="top" offset={[0, -6]} opacity={0.95}>
                <div className="px-2 py-1 bg-[#0C0C14] text-[#FFF8E7] rounded border border-[#D4AF37]/50 shadow-lg text-center pointer-events-none">
                  <div className="font-cinzel text-xs font-bold">{translateEntityName(entity.name, entity.location_context)}</div>
                  <div className="text-[9px] uppercase tracking-wider font-semibold" style={{ color: color }}>
                    {translateCategory(entity.category_name)}
                  </div>
                </div>
              </Tooltip>
            </Marker>
          );
        })}

        {/* 2D Cultural Connections & Itinerary Routes */}
        <Connections2D activeEntity={activeEntity} itineraryRoute={itineraryRoute} />

      </MapContainer>

      {/* Global CSS for the custom markers and tooltips */}
      <style>{`
        .custom-leaflet-marker {
          background: transparent;
          border: none;
        }
        .custom-leaflet-marker:hover .marker-dot {
          transform: translate(-50%, -50%) scale(1.4);
          z-index: 1000 !important;
        }
        .active-pulse {
          animation: pulse-ring 2.2s infinite ease-out;
          z-index: 999 !important;
        }
        @keyframes pulse-ring {
          0% {
            box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.7), 0 0 8px rgba(212, 175, 55, 0.9);
          }
          70% {
            box-shadow: 0 0 0 8px rgba(212, 175, 55, 0), 0 0 12px rgba(212, 175, 55, 0.9);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(212, 175, 55, 0), 0 0 8px rgba(212, 175, 55, 0.9);
          }
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
