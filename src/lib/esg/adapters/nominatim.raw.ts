/**
 * Raw Nominatim (OpenStreetMap geocoder) response shape (P6 — anti-corruption
 * layer). Adapter-private: the dependency-cruiser gate
 * `raw-provider-shapes-stay-in-adapters` forbids importing this module outside
 * `adapters/`. Callers see only the domain `GeocodedPlace`.
 */
export interface NominatimPlace {
  display_name?: string;
  lat?: string;
  lon?: string;
  boundingbox?: [string, string, string, string];
}
