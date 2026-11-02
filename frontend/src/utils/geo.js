import * as THREE from 'three';

/**
 * Converts latitude and longitude into 3D Vector3 Cartesian coordinates on a sphere.
 * Calibrated 1:1 with standard equirectangular Three.js sphere UV texture mapping.
 * @param {number} lat Latitude in degrees
 * @param {number} lon Longitude in degrees
 * @param {number} radius Sphere radius
 * @returns {THREE.Vector3}
 */
export const latLongToVector3 = (lat, lon, radius) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = (radius * Math.sin(phi) * Math.sin(theta));
  const y = (radius * Math.cos(phi));
  return new THREE.Vector3(x, y, z);
};

/**
 * Curated ground-truth coordinates for key heritage landmarks and cultural centers
 * to prevent coordinate drift into ocean or misaligned regions.
 */
export const LANDMARK_COORDINATES = {
  "Jagannath Temple": [19.8049, 85.8179],
  "Puri Jagannath Temple": [19.8049, 85.8179],
  "Shree Jagannath Temple": [19.8049, 85.8179],
  "Konark Sun Temple": [19.8876, 86.0945],
  "Konark / Chandrabhaga": [19.8876, 86.0945],
  "Konark Dance Festival": [19.8876, 86.0945],
  "Lingaraj Temple": [20.2382, 85.8336],
  "Lingaraja Temple": [20.2382, 85.8336],
  "Mukteshvara Temple": [20.2427, 85.8388],
  "Rajarani Temple": [20.2520, 85.8458],
  "Dhauli Shanti Stupa": [20.1923, 85.8544],
  "Dhauli": [20.1923, 85.8544],
  "Udayagiri and Khandagiri Caves": [20.2605, 85.7865],
  "Khandagiri & Udayagiri": [20.2605, 85.7865],
  "Raghurajpur Heritage Crafts Village": [19.8970, 85.8190],
  "Raghurajpur": [19.8970, 85.8190],
  "Pipili Applique Work": [20.1170, 85.8330],
  "Pipili": [20.1170, 85.8330],
  "Tarakasi (Silver Filigree)": [20.4625, 85.8828],
  "Barabati Fort": [20.4850, 85.8650],
  "Cuttack Chandi Temple": [20.4730, 85.8710],
  "Chhau": [21.9322, 86.7360],
  "Mayurbhanj Chhau": [21.9322, 86.7360],
  "Similipal National Park": [21.8000, 86.3333],
  "Samaleswari Temple": [21.4674, 83.9830],
  "Sambalpuri Saree / Handloom": [21.4674, 83.9830],
  "Sambalpuri Folk Dance": [21.4674, 83.9830],
  "Dhanu Yatra (Bargarh)": [21.3333, 83.6167],
  "Biraja Temple (Jajpur)": [20.8510, 86.3330],
  "Biraja Temple": [20.8510, 86.3330],
  "Ratnagiri Buddhist Complex": [20.6410, 86.3350],
  "Udayagiri Buddhist Complex": [20.6480, 86.2690],
  "Lalitgiri Buddhist Complex": [20.5890, 86.2520],
  "Chilika Lake & Kalijai": [19.7167, 85.3167],
  "Chilika": [19.7167, 85.3167],
  "Tara Tarini Temple": [19.4890, 84.8980],
  "Gopalpur-on-Sea": [19.2600, 84.9070],
  "Khiching Kichakeshwari Temple": [21.9210, 85.8380],
  "Nuakhai Festival": [21.4674, 83.9830],
  "Rath Yatra": [19.8049, 85.8179],
  "Mahaprasad": [19.8049, 85.8179],
  "Chhena Poda (Nayagarh)": [20.1250, 85.1050],
  "Rasagulla / Pahala": [20.3550, 85.8900],
  "Dahi Bara Aloo Dum (Cuttack)": [20.4625, 85.8828],
  "Prachi Valley Heritage": [20.0833, 85.9667]
};

/**
 * Calibrate an entity's coordinates to ensure ground-truth accuracy.
 * @param {object} entity
 * @returns {[number, number]} [latitude, longitude]
 */
export const calibrateEntityCoordinates = (entity) => {
  if (!entity) return [20.5, 84.5];

  // The stored coordinates are verified per record (data/entity_locations.json), so they come first
  const c = entity.coordinates;
  if (Array.isArray(c) && c.length >= 2 && Number.isFinite(+c[0]) && Number.isFinite(+c[1])) {
    return [+c[0], +c[1]];
  }

  // Fallback for records without coordinates (e.g. new community contributions): exact name only,
  // since partial matches put things like "Konark Dance Festival" on the wrong record's spot
  const name = (entity.name || '').trim();
  if (LANDMARK_COORDINATES[name]) {
    return LANDMARK_COORDINATES[name];
  }

  return [20.5, 84.5];
};

/**
 * Calculates Great-Circle distance in kilometers between two lat/lng coordinates (Haversine formula).
 */
export const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return 9999;
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Pre-defined regional hubs across Odisha & Eastern India for quick one-click onboarding.
 */
export const BASE_HUBS = [
  { id: 'bhubaneswar', name: 'Bhubaneswar', label: 'Bhubaneswar (Temple Capital)', coords: [20.2961, 85.8245] },
  { id: 'puri', name: 'Puri', label: 'Puri (Coastal & Sacred Sanctum)', coords: [19.8135, 85.8312] },
  { id: 'cuttack', name: 'Cuttack', label: 'Cuttack (Silver City & Crafts)', coords: [20.4625, 85.8830] },
  { id: 'sambalpur', name: 'Sambalpur', label: 'Sambalpur (Western Odisha & Weaves)', coords: [21.4669, 83.9812] },
  { id: 'koraput', name: 'Koraput', label: 'Koraput (Eastern Ghats & Indigenous Lore)', coords: [18.8135, 82.7118] },
  { id: 'mayurbhanj', name: 'Mayurbhanj', label: 'Mayurbhanj (Chhau & Similipal)', coords: [21.9322, 86.7230] },
  { id: 'jajpur', name: 'Jajpur', label: 'Jajpur (Buddhist Diamond Triangle)', coords: [20.8510, 86.3330] },
  { id: 'ganjam', name: 'Ganjam', label: 'Berhampur / Ganjam (Southern Coast)', coords: [19.3150, 84.7941] },
];

