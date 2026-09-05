import React, { useEffect, useState } from 'react';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import axios from 'axios';
import { latLongToVector3 } from '../../utils/geo';
import API_BASE_URL from '../../config/api';

export default function Connections({ activeEntity, radius }) {
  const [connections, setConnections] = useState([]);

  useEffect(() => {
    if (!activeEntity) {
      setConnections([]);
      return;
    }

    axios.get(`${API_BASE_URL}/api/entities/${activeEntity.id}/connections`)
      .then(res => {
        setConnections(res.data);
      })
      .catch(err => console.error("Error fetching connections:", err));
  }, [activeEntity]);

  if (!activeEntity || connections.length === 0) return null;

  const startPos = latLongToVector3(activeEntity.coordinates[0], activeEntity.coordinates[1], radius);

  return (
    <group>
      {connections.map((conn) => {
        const endPos = latLongToVector3(conn.coordinates[0], conn.coordinates[1], radius);
        
        // Calculate the control point for the arch (midpoint pushed outward)
        const midPoint = new THREE.Vector3().addVectors(startPos, endPos).multiplyScalar(0.5);
        // Distance between points determines how high the arch goes
        const distance = startPos.distanceTo(endPos);
        // Push the control point outwards from the center of the sphere
        midPoint.normalize().multiplyScalar(radius + (distance * 0.4) + 0.1);

        const curve = new THREE.QuadraticBezierCurve3(startPos, midPoint, endPos);
        const points = curve.getPoints(50);

        return (
          <group key={conn.id}>
            {/* Glowing Golden Cultural Lineage Arc */}
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
    </group>
  );
}
