// Satellite imagery streamed onto the globe and the 2D map.
// Default: Sentinel-2 cloudless 2023 by EOX (free, no key; CC BY-NC-SA 4.0, so non-commercial use only).
// To use another XYZ source, set in frontend/.env (or the frontend environment in Docker):
//   VITE_SATELLITE_TILES_URL=https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}
//   VITE_SATELLITE_MAX_ZOOM=18
//   VITE_SATELLITE_ATTRIBUTION=Imagery © Esri, Maxar, Earthstar Geographics
const env = import.meta.env;

export const SATELLITE_TILES = {
  url: env.VITE_SATELLITE_TILES_URL || 'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2023_3857/default/g/{z}/{y}/{x}.jpg',
  maxZoom: parseInt(env.VITE_SATELLITE_MAX_ZOOM, 10) || 14,
  attribution: env.VITE_SATELLITE_ATTRIBUTION
    || 'Sentinel-2 cloudless by EOX IT Services GmbH (contains modified Copernicus Sentinel data 2023)',
  attributionUrl: env.VITE_SATELLITE_TILES_URL ? null : 'https://s2maps.eu',
  // Lower is sharper (more tiles); 2 keeps downloads modest
  errorTarget: 2,
};
