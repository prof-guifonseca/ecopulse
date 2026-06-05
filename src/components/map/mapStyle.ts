import type { StyleSpecification } from 'maplibre-gl';

/**
 * Free, key-less, production-grade vector basemap (no usage caps, self-hostable).
 * Replaces direct OpenStreetMap raster tiles for the default style: the OSM
 * tile-server usage policy forbids production/app traffic at scale. Override per
 * deploy with NEXT_PUBLIC_MAP_STYLE_URL.
 */
const OPENFREEMAP_LIBERTY_STYLE = 'https://tiles.openfreemap.org/styles/liberty';

/**
 * OpenStreetMap raster basemap — kept as a reference/offline fallback only, not
 * the default (see policy note above).
 */
export const OSM_RASTER_STYLE: StyleSpecification = {
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
  return process.env.NEXT_PUBLIC_MAP_STYLE_URL || OPENFREEMAP_LIBERTY_STYLE;
}
