import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import axios from 'axios';
import { latLongToVector3, calibrateEntityCoordinates } from '../../utils/geo';
import API_BASE_URL from '../../config/api';
import { THEME } from '../../config/theme';

// One arc between two places on the globe. It draws itself from the start point outward,
// then a small light keeps travelling along it so the link reads as alive.
function Arc({ start, end, radius, height, lineWidth, opacity, delay = 0, drawMs = 900, reduceMotion }) {
  const lineRef = useRef();
  const lightRef = useRef();
  const born = useRef(performance.now());

  const { curve, points } = useMemo(() => {
    const p1 = latLongToVector3(start[0], start[1], radius);
    const p2 = latLongToVector3(end[0], end[1], radius);
    const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
    mid.normalize().multiplyScalar(radius + p1.distanceTo(p2) * height + 0.1);
    const c = new THREE.QuadraticBezierCurve3(p1, mid, p2);
    return { curve: c, points: c.getPoints(64) };
  }, [start, end, radius, height]);

  useEffect(() => {
    born.current = performance.now();
  }, [points]);

  useFrame(() => {
    const segments = points.length - 1;
    const elapsed = performance.now() - born.current - delay;
    const drawn = reduceMotion ? 1 : THREE.MathUtils.clamp(elapsed / drawMs, 0, 1);
    const eased = 1 - Math.pow(1 - drawn, 3);

    const geom = lineRef.current?.geometry;
    if (geom) geom.instanceCount = Math.max(0, Math.round(eased * segments));

    if (lightRef.current) {
      if (reduceMotion || drawn < 1) {
        lightRef.current.visible = false;
      } else {
        // A full trip along the arc every 2.4s, starting where the line began
        const t = ((elapsed - drawMs) / 2400) % 1;
        lightRef.current.position.copy(curve.getPoint(t));
        lightRef.current.visible = true;
      }
    }
  });

  return (
    <group>
      <Line ref={lineRef} points={points} color={THEME.paper} lineWidth={lineWidth} transparent opacity={opacity} />
      <mesh ref={lightRef} visible={false}>
        <sphereGeometry args={[0.012, 12, 12]} />
        <meshBasicMaterial color={THEME.paper} />
      </mesh>
    </group>
  );
}

export default function Connections({ activeEntity, itineraryRoute, radius, reduceMotion = false }) {
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

  const coordsOf = stop => (Array.isArray(stop) ? stop : (stop?.coordinates || null));

  return (
    <group>
      {/* 1. The chosen record's links, drawn one after another (after the camera has landed) */}
      {hasEntityConnections && connections.map((conn, idx) => {
        if (!conn || !Array.isArray(conn.coordinates) || conn.coordinates.length < 2) return null;
        const endPos = latLongToVector3(conn.coordinates[0], conn.coordinates[1], radius);
        return (
          <group key={`conn-${activeEntity.id}-${conn.id}`}>
            <Arc
              start={activeEntity.coordinates}
              end={conn.coordinates}
              radius={radius}
              height={0.4}
              lineWidth={1.5}
              opacity={0.9}
              delay={900 + idx * 140}
              reduceMotion={reduceMotion}
            />
            <mesh position={[endPos.x, endPos.y, endPos.z]}>
              <sphereGeometry args={[0.014, 16, 16]} />
              <meshBasicMaterial color={THEME.paper} />
            </mesh>
          </group>
        );
      })}

      {/* 2. An itinerary, drawn leg by leg in travel order */}
      {hasItineraryRoute && itineraryRoute.map((stop, idx) => {
        if (idx === itineraryRoute.length - 1) return null;
        const startCoords = coordsOf(stop);
        const endCoords = coordsOf(itineraryRoute[idx + 1]);
        if (!startCoords || !endCoords || startCoords.length < 2 || endCoords.length < 2) return null;
        const p1 = latLongToVector3(startCoords[0], startCoords[1], radius);
        const p2 = latLongToVector3(endCoords[0], endCoords[1], radius);

        return (
          <group key={`itin-arc-${idx}-${startCoords.join(',')}-${endCoords.join(',')}`}>
            <Arc
              start={startCoords}
              end={endCoords}
              radius={radius}
              height={0.45}
              lineWidth={3}
              opacity={1}
              delay={idx * 450}
              drawMs={700}
              reduceMotion={reduceMotion}
            />
            <mesh position={[p1.x, p1.y, p1.z]}>
              <sphereGeometry args={[0.02, 16, 16]} />
              <meshBasicMaterial color={THEME.paper} />
            </mesh>
            {idx === itineraryRoute.length - 2 && (
              <mesh position={[p2.x, p2.y, p2.z]}>
                <sphereGeometry args={[0.02, 16, 16]} />
                <meshBasicMaterial color={THEME.paper} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}
