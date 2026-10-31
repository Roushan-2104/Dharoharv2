import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import Connections2D from './Connections2D';
import { THEME } from '../../config/theme';
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
  const createCustomIcon = (isActive) => {
    const size = currentZoom <= 6 ? 7 : currentZoom <= 8 ? 8 : 10;
    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: `<span class="marker-dot${isActive ? ' is-active' : ''}" style="width:${size}px;height:${size}px"></span>`,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });
  };

  return (
    <div className="w-full h-full absolute inset-0 z-0">
      <MapContainer 
        center={[20.5, 84.5]} // Center on Odisha / Eastern India
        zoom={6} 
        style={{ width: '100%', height: '100%', background: THEME.field }}
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
          
          const isActive = activeEntity?.id === entity.id;

          return (
            <Marker 
              key={entity.id}
              position={[coords[0], coords[1]]}
              icon={createCustomIcon(isActive)}
              eventHandlers={{
                click: () => setActiveEntity(entity),
              }}
            >
              <Tooltip direction="top" offset={[0, -6]} opacity={0.95}>
                <div className="bg-paper text-ink px-2.5 py-1.5 text-left pointer-events-none">
                  <div className="font-display font-bold text-[13px] leading-tight">{translateEntityName(entity.name, entity.location_context)}</div>
                  <div className="text-[11px] text-muted leading-tight mt-0.5">{translateCategory(entity.category_name)}</div>
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
        .marker-dot {
          display: block;
          box-sizing: border-box;
          border-radius: 50%;
          background: var(--color-paper);
          border: 1px solid var(--color-ink);
          transform: translate(-50%, -50%);
          transition: transform var(--dur-short) var(--ease-out);
          cursor: pointer;
        }
        .custom-leaflet-marker:hover .marker-dot {
          transform: translate(-50%, -50%) scale(1.4);
        }
        .marker-dot.is-active {
          background: var(--color-mark);
          transform: translate(-50%, -50%) scale(1.6);
          z-index: 999;
        }
        .leaflet-container {
          background: var(--color-field);
          font-family: var(--font-body);
        }
        .leaflet-tooltip {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .leaflet-tooltip-top:before {
          border-top-color: var(--color-paper) !important;
        }
      `}</style>
    </div>
  );
}
