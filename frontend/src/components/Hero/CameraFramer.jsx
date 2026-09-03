import React, { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { latLongToVector3 } from '../../utils/geo';

export default function CameraFramer({ activeEntity, radius }) {
  const { camera, controls } = useThree();
  const targetCameraPos = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());
  const isAnimating = useRef(false);

  useEffect(() => {
    if (activeEntity) {
      // Find the entity's position on the globe
      const entityPos = latLongToVector3(activeEntity.coordinates[0], activeEntity.coordinates[1], radius);
      
      // We want to look exactly at the entity
      targetLookAt.current.copy(entityPos);
      
      // We want the camera to be pulled back along the normal of the entity
      // BUT we also want to shift the camera slightly to the RIGHT, 
      // so the entity ends up on the LEFT side of the screen (framing it next to the right panel)
      
      const normal = entityPos.clone().normalize();
      
      // Pull camera back by a fixed distance
      const distance = 6; 
      const newCameraPos = normal.clone().multiplyScalar(distance);
      
      // Cross product to find "right" direction relative to the entity's normal
      const up = new THREE.Vector3(0, 1, 0);
      let right = new THREE.Vector3().crossVectors(up, normal).normalize();
      
      // If the normal is perfectly up/down, cross product fails, but that's rare for India.
      // Shift the camera to the right by ~1.5 units so the entity moves to the left of the viewport
      newCameraPos.add(right.multiplyScalar(2));
      
      targetCameraPos.current.copy(newCameraPos);
      isAnimating.current = true;
    } else {
      // When closed or initially loaded, gently pull back to a wide shot centered on India in daylight
      const defaultIndiaPos = latLongToVector3(20.5, 84.5, 7.5);
      targetCameraPos.current.copy(defaultIndiaPos);
      targetLookAt.current.set(0, 0, 0);
      isAnimating.current = true;
    }
  }, [activeEntity, radius]);

  useFrame(() => {
    if (!isAnimating.current) return;

    // Smoothly interpolate the camera position
    camera.position.lerp(targetCameraPos.current, 0.05);
    
    // Smoothly interpolate the controls target (what the camera looks at)
    if (controls) {
      controls.target.lerp(targetLookAt.current, 0.05);
      controls.update();
    } else {
      camera.lookAt(targetLookAt.current);
    }

    // Stop animating when we get very close to the target
    if (camera.position.distanceTo(targetCameraPos.current) < 0.01) {
      isAnimating.current = false;
    }
  });

  return null;
}
