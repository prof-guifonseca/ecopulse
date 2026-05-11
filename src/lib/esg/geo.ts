import type { LatLng, RegionBBox } from '@/lib/region/types';

const METERS_PER_DEGREE_LAT = 111_320;

export function bboxFromCenter(center: LatLng, radiusMeters: number): RegionBBox {
  const latDelta = radiusMeters / METERS_PER_DEGREE_LAT;
  const lngDelta =
    radiusMeters / (METERS_PER_DEGREE_LAT * Math.max(0.2, Math.cos((center.lat * Math.PI) / 180)));

  return {
    north: center.lat + latDelta,
    south: center.lat - latDelta,
    west: center.lng - lngDelta,
    east: center.lng + lngDelta,
  };
}

export function bboxCenter(bbox: RegionBBox): LatLng {
  return {
    lat: (bbox.north + bbox.south) / 2,
    lng: (bbox.west + bbox.east) / 2,
  };
}

export function pointInBBox(point: LatLng, bbox: RegionBBox): boolean {
  return (
    point.lat <= bbox.north &&
    point.lat >= bbox.south &&
    point.lng >= bbox.west &&
    point.lng <= bbox.east
  );
}

export function formatDistanceMeters(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}
