/**
 * Raw OpenStreetMap / Overpass response shapes (P6 — anti-corruption layer).
 * Adapter-private: the dependency-cruiser gate `raw-provider-shapes-stay-in-adapters`
 * forbids importing this module outside `adapters/`. The app sees only the domain
 * `EnvironmentalPoint` the adapter returns.
 */
export interface OsmElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags?: Record<string, string>;
}

export interface OverpassResponse {
  elements?: OsmElement[];
}
