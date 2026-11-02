import { useCallback, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { TilesRenderer, TilesPlugin } from '3d-tiles-renderer/r3f';
import { GeneratedSurfacePlugin, XYZTilesOverlay, TilesFadePlugin } from '3d-tiles-renderer/plugins';
import { SATELLITE_TILES } from '../../config/satellite';

// Streams satellite imagery onto the globe, sharper tiles loading in as the camera comes closer,
// the way map globes do. The tiles are laid on a sphere of the globe's own radius, then turned
// from the tile library's frame (Z towards the north pole) into ours (Y towards the north pole),
// so markers placed with latLongToVector3 sit on the right spot.
export default function SatelliteSurface({ radius }) {
  const overlay = useMemo(() => new XYZTilesOverlay({
    url: SATELLITE_TILES.url,
    levels: SATELLITE_TILES.maxZoom + 1,
  }), []);

  useEffect(() => () => overlay.dispose?.(), [overlay]);

  // Swap each tile's flat material for a lit one, so the daylight and night side still read
  const handleLoadModel = ({ scene }) => {
    scene.traverse(obj => {
      if (!obj.isMesh || obj.material?.isMeshPhongMaterial) return;
      const old = obj.material;
      obj.material = new THREE.MeshPhongMaterial({ map: old.map, shininess: 4, specular: 0x111111 });
      old.dispose();
    });
  };

  // The wrapper creates the renderer after mount, so set it up as soon as it hands it over,
  // before its first update builds any tiles
  const setupTiles = useCallback(tiles => {
    if (!tiles) return;
    // A perfect sphere of our radius instead of the real (slightly squashed) Earth in metres
    tiles.ellipsoid.radius.set(radius, radius, radius);
    tiles.addEventListener('load-model', handleLoadModel);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radius]);

  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      <TilesRenderer ref={setupTiles} errorTarget={SATELLITE_TILES.errorTarget}>
        <TilesPlugin plugin={GeneratedSurfacePlugin} args={{ overlay, applyOverlayTexture: true }} />
        <TilesPlugin plugin={TilesFadePlugin} />
      </TilesRenderer>
    </group>
  );
}
