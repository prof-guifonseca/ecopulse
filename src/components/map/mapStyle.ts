import type { StyleSpecification } from 'maplibre-gl';

export const DEFAULT_MAP_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    'osm-raster': {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'osm-raster',
      type: 'raster',
      source: 'osm-raster',
    },
  ],
};

export function getMapStyle(): string | StyleSpecification {
  return process.env.NEXT_PUBLIC_MAP_STYLE_URL || DEFAULT_MAP_STYLE;
}
