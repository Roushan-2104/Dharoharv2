import React, { useEffect, useState } from 'react';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import axios from 'axios';
import { latLongToVector3, calibrateEntityCoordinates } from '../../utils/geo';
import API_BASE_URL from '../../config/api';

export default function Connections({ activeEntity, itineraryRoute, radius }) {
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

  const hasValidActiveCoords = activeEntity && Array.isArray(activeEntity.coordinates) && activeEntity.coordinates.length >= 2;
  const hasEntityConnections = hasValidActiveCoords && connections.length > 0;
  const hasItineraryRoute = Array.isArray(itineraryRoute) && itineraryRoute.length >= 2;

  if (!hasEntityConnections && !hasItineraryRoute) return null;

  return (
    <group>
      {/* 1. Entity Lineage Connections */}
      {hasEntityConnections && connections.map((conn) => {
        if (!conn || !Array.isArray(conn.coordinates) || conn.coordinates.length < 2) return null;

        const startPos = latLongToVector3(activeEntity.coordinates[0], activeEntity.coordinates[1], radius);
        const endPos = latLongToVector3(conn.coordinates[0], conn.coordinates[1], radius);
        
        // Calculate the control point for the arch (midpoint pushed outward)
        const midPoint = new THREE.Vector3().addVectors(startPos, endPos).multiplyScalar(0.5);
        const distance = startPos.distanceTo(endPos);
        midPoint.normalize().multiplyScalar(radius + (distance * 0.4) + 0.1);

        const curve = new THREE.QuadraticBezierCurve3(startPos, midPoint, endPos);
        const points = curve.getPoints(50);

        return (
          <group key={`conn-${conn.id}`}>
            <Line
              points={points}
              color="#F5D77F" // Temple Gold
              lineWidth={2.5}
              transparent
              opacity={0.85}
            />
            
            {/* Target Marker Jewel Dot */}
            <mesh position={[endPos.x, endPos.y, endPos.z]}>
              <sphereGeometry args={[0.035, 16, 16]} />
              <meshBasicMaterial color="#D4AF37" />
            </mesh>
          </group>
        );
      })}

      {/* 2. Active Itinerary Sequential Cultural Trail Arcs */}
      {hasItineraryRoute && itineraryRoute.map((stop, idx) => {
        if (idx === itineraryRoute.length - 1) return null;
        const nextStop = itineraryRoute[idx + 1];
        if (!stop || !nextStop) return null;

        const startCoords = Array.isArray(stop) ? stop : (stop.coordinates || [0, 0]);
        const endCoords = Array.isArray(nextStop) ? nextStop : (nextStop.coordinates || [0, 0]);

        if (!startCoords || !endCoords || startCoords.length < 2 || endCoords.length < 2) return null;

        const p1 = latLongToVector3(startCoords[0], startCoords[1], radius);
        const p2 = latLongToVector3(endCoords[0], endCoords[1], radius);
        const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
        const dist = p1.distanceTo(p2);
        mid.normalize().multiplyScalar(radius + (dist * 0.45) + 0.12);

        const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
        const points = curve.getPoints(60);

        return (
          <group key={`itin-arc-${idx}`}>
            {/* Saffron Glowing Trail Arc */}
            <Line
              points={points}
              color="#F59E0B"
              lineWidth={4.0}
              transparent
              opacity={0.95}
            />
            {/* Start Waypoint Glowing Jewel */}
            <mesh position={[p1.x, p1.y, p1.z]}>
              <sphereGeometry args={[0.045, 16, 16]} />
              <meshBasicMaterial color="#FBBF24" />
            </mesh>
            {/* Destination Waypoint Jewel for last stop */}
            {idx === itineraryRoute.length - 2 && (
              <mesh position={[p2.x, p2.y, p2.z]}>
                <sphereGeometry args={[0.045, 16, 16]} />
                <meshBasicMaterial color="#FBBF24" />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}
