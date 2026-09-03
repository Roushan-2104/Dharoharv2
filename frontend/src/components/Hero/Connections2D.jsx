import React, { useEffect, useState } from 'react';
import { Polyline } from 'react-leaflet';
import axios from 'axios';

export default function Connections2D({ activeEntity }) {
  const [connections, setConnections] = useState([]);

  useEffect(() => {
    if (!activeEntity) {
      setConnections([]);
      return;
    }

    axios.get(`http://localhost:3000/api/entities/${activeEntity.id}/connections`)
      .then(res => {
        setConnections(res.data);
      })
      .catch(err => console.error("Error fetching connections:", err));
  }, [activeEntity]);

  if (!activeEntity || connections.length === 0) return null;

  const startPos = activeEntity.coordinates;

  return (
    <>
      {connections.map((conn) => {
        const endPos = conn.coordinates;
        
        // Draw a glowing golden dashed polyline from the active entity to the connected entity
        return (
          <Polyline 
            key={conn.id} 
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
    </>
  );
}
