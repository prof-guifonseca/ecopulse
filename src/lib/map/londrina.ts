/**
 * Coordinate utilities for the simulated Londrina map.
 *
 * The viewport is fixed (no pan/zoom) — a single bounding box of central
 * Londrina, ~3.6km × 3.6km, rendered as a stylized SVG backdrop. Pins
 * project lat/lng onto the viewport via a flat equirectangular projection
 * (good enough at city scale and trivially fast).
 *
 * Coordinates here are real Londrina addresses chosen for plausibility,
 * not endorsements — anyone trying to walk to one of these will, in fact,
 * arrive somewhere reasonable. But the businesses are simulated.
 */

export const LONDRINA_CENTER = { lat: -23.3103, lng: -51.1628 } as const;

/**
 * Bounding box that fills the viewport. North-East at top-right,
 * South-West at bottom-left. Order matters for the projection math.
 */
export const LONDRINA_BBOX = {
  // Roughly 3.6km tall × 3.6km wide centered on Praça Marechal Floriano.
  north: -23.293, // top
  south: -23.328, // bottom
  west: -51.182, // left
  east: -51.144, // right
} as const;

export interface LatLng {
  lat: number;
  lng: number;
}

/**
 * Project a lat/lng onto the bounding box. Returns percent-of-viewport
 * coordinates suitable for absolute-positioned overlay elements.
 *
 * Out-of-bbox points get clamped to [0, 100] — a stakeholder won't notice,
 * and it keeps pins visible during gentle data drift.
 */
export function latLngToPercent({ lat, lng }: LatLng): { x: number; y: number } {
  const { north, south, west, east } = LONDRINA_BBOX;
  const xRaw = ((lng - west) / (east - west)) * 100;
  const yRaw = ((north - lat) / (north - south)) * 100;
  return {
    x: Math.max(0, Math.min(100, xRaw)),
    y: Math.max(0, Math.min(100, yRaw)),
  };
}

/**
 * Average distance approximation between two coords in meters. Uses the
 * simple equirectangular formula because city-scale precision is overkill
 * for prototype "350m" labels.
 */
export function approximateDistanceM(a: LatLng, b: LatLng): number {
  const R = 6_371_000; // earth radius in meters
  const φ1 = (a.lat * Math.PI) / 180;
  const φ2 = (b.lat * Math.PI) / 180;
  const dφ = ((b.lat - a.lat) * Math.PI) / 180;
  const dλ = ((b.lng - a.lng) * Math.PI) / 180;
  const x = dλ * Math.cos((φ1 + φ2) / 2);
  return Math.round(Math.sqrt(x * x + dφ * dφ) * R);
}

/**
 * Distance in meters from Arthur's simulated home base (Centro). Used to
 * label pins with a believable "350 m" / "1.2 km" text.
 */
export function distanceFromCenter(point: LatLng): string {
  const meters = approximateDistanceM(LONDRINA_CENTER, point);
  if (meters < 1000) return `${meters} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}
