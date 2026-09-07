import React, { useEffect, useState } from 'react';
import { Polyline } from 'react-leaflet';
import axios from 'axios';
import { calibrateEntityCoordinates } from '../../utils/geo';
import API_BASE_URL from '../../config/api';

export default function Connections2D({ activeEntity, itineraryRoute }) {
  const [connections, setConnections] = useState([]);

  useEffect(() => {
    if (!activeEntity) {
      setConnections([]);
      return;
    }

    axios.get(`${API_BASE_URL}/api/entities/${activeEntity.id}/connections`)
      .then(res => {
        const calibrated = (res.data || []).map(conn => ({
          ...conn,
          coordinates: calibrateEntityCoordinates(conn)
        }));
        setConnections(calibrated);
      })
      .catch(err => console.error("Error fetching connections:", err));
  }, [activeEntity]);

  const hasEntityConnections = activeEntity && connections.length > 0;
  const hasItineraryRoute = itineraryRoute && itineraryRoute.length >= 2;

  if (!hasEntityConnections && !hasItineraryRoute) return null;

  const itineraryPositions = hasItineraryRoute
    ? itineraryRoute.map(stop => Array.isArray(stop) ? stop : (stop.coordinates || [0, 0]))
    : [];

  return (
    <>
      {/* Entity Connections */}
      {hasEntityConnections && connections.map((conn) => {
        const startPos = activeEntity.coordinates;
        const endPos = conn.coordinates;
        
        return (
          <Polyline 
            key={`conn-${conn.id}`} 
            positions={[startPos, endPos]} 
            pathOptions={{ 
              color: '#D4AF37', 
              weight: 2.5, 
              opacity: 0.8,
              dashArray: '6, 10',
              lineCap: 'round'
            }} 
          />
        );
      })}

      {/* Itinerary Route Multi-Stop Golden Trail */}
      {hasItineraryRoute && (
        <Polyline
          positions={itineraryPositions}
          pathOptions={{
            color: '#F59E0B',
            weight: 4,
            opacity: 0.9,
            dashArray: '8, 8',
            lineCap: 'round'
          }}
        />
      )}
    </>
  );
}
