import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { latLongToVector3 } from '../../utils/geo';

// Camera choreography for the globe:
// - an arrival sweep from deep space to India on first load,
// - an arcing flight (rise, travel, descend) whenever the chosen record changes,
// - a user drag cancels any flight in progress.
// The orbit target stays at the globe's centre so dragging always spins the globe itself.

const HOME_DISTANCE = 7.5;
const RECORD_DISTANCE = 4.0;
const PREVIEW_DISTANCE = 4.4;

const easeInOutCubic = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export default function CameraFramer({ activeEntity, radius, reduceMotion = false, focusRegion = false }) {
  const { camera, controls } = useThree();
  const flight = useRef(null);
  const hasArrived = useRef(false);

  // Start a flight from wherever the camera is now to a direction and distance
  const flyTo = (targetDir, targetDistance, duration, lift) => {
    const fromDir = camera.position.clone().normalize();
    const fromDistance = camera.position.length();
    if (reduceMotion) {
      camera.position.copy(targetDir.clone().multiplyScalar(targetDistance));
      camera.lookAt(0, 0, 0);
      controls?.update();
      flight.current = null;
      return;
    }
    flight.current = {
      fromDir,
      toDir: targetDir.clone().normalize(),
      fromDistance,
      toDistance: targetDistance,
      lift,
      duration,
      start: performance.now(),
    };
  };

  // Arrival: begin far out and turned away, then sweep in to India
  useEffect(() => {
    if (hasArrived.current) return;
    hasArrived.current = true;
    const india = latLongToVector3(20.5, 84.5, 1).normalize();
    if (reduceMotion) {
      camera.position.copy(india.clone().multiplyScalar(HOME_DISTANCE));
      return;
    }
    // Start turned well away from India, at the far edge the orbit controls allow
    const startDir = india.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), -2.6).add(new THREE.Vector3(0, 0.45, 0)).normalize();
    camera.position.copy(startDir.multiplyScalar(11.5));
    flyTo(india, HOME_DISTANCE, 3400, 0);
    if (flight.current) flight.current.arrival = true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A new record (or none): arc over to it, or pull back to the wide view of India.
  // Skipped on mount so it does not cut the arrival sweep short.
  const isFirstRecordEffect = useRef(true);
  useEffect(() => {
    if (isFirstRecordEffect.current) {
      isFirstRecordEffect.current = false;
      if (!activeEntity) return;
    }
    const hasCoords = activeEntity && Array.isArray(activeEntity.coordinates) && activeEntity.coordinates.length >= 2;
    const dir = hasCoords
      ? latLongToVector3(activeEntity.coordinates[0], activeEntity.coordinates[1], radius).normalize()
      : latLongToVector3(20.5, 84.5, 1).normalize();
    const angle = camera.position.clone().normalize().angleTo(dir);
    // The farther the hop, the higher the camera rises mid-flight
    const lift = Math.min(3.2, angle * 2.4);
    flyTo(dir, hasCoords ? RECORD_DISTANCE : HOME_DISTANCE, 1400 + angle * 500, lift);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeEntity, radius]);

  // Previewing a kind from the index: glide in on Odisha so its places spread apart;
  // ease back out a moment after the preview ends, so passing over the list does not jitter.
  const regionTimer = useRef(null);
  const isFocused = useRef(false);
  useEffect(() => {
    clearTimeout(regionTimer.current);
    if (activeEntity) { isFocused.current = false; return; }
    // Let the arrival sweep finish before reacting to the index
    if (!hasArrived.current || flight.current?.arrival) return;
    const odisha = latLongToVector3(20.5, 84.5, 1).normalize();
    if (focusRegion && !isFocused.current) {
      isFocused.current = true;
      flyTo(odisha, PREVIEW_DISTANCE, 1000, 0);
    } else if (!focusRegion && isFocused.current) {
      regionTimer.current = setTimeout(() => {
        isFocused.current = false;
        flyTo(odisha, HOME_DISTANCE, 1200, 0);
      }, 1100);
    }
    return () => clearTimeout(regionTimer.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusRegion, activeEntity]);

  // A drag by the visitor takes over from any flight
  useEffect(() => {
    if (!controls) return;
    const cancel = () => { flight.current = null; };
    controls.addEventListener('start', cancel);
    return () => controls.removeEventListener('start', cancel);
  }, [controls]);

  useFrame(() => {
    const f = flight.current;
    if (!f) return;
    const raw = Math.min(1, (performance.now() - f.start) / f.duration);
    const t = easeInOutCubic(raw);

    // Travel along the sphere's surface direction, rising in the middle of the flight
    const dir = new THREE.Vector3().copy(f.fromDir).lerp(f.toDir, t);
    if (dir.lengthSq() < 1e-6) dir.copy(f.toDir);
    dir.normalize();
    const distance = THREE.MathUtils.lerp(f.fromDistance, f.toDistance, t) + f.lift * Math.sin(Math.PI * t);

    camera.position.copy(dir.multiplyScalar(distance));
    if (controls) {
      controls.target.set(0, 0, 0);
      controls.update();
    } else {
      camera.lookAt(0, 0, 0);
    }

    if (raw >= 1) flight.current = null;
  });

  return null;
}
