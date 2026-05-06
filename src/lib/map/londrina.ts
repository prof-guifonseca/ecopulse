/**
 * Back-compat shim. The canonical source of truth for Londrina coordinates
 * is now src/data/regions/londrina.ts (the first instance of the pluggable
 * Region abstraction). This module preserves legacy import surfaces so the
 * pin-rendering math elsewhere in the prototype keeps working.
 */
import { LONDRINA } from '@/data/regions/londrina';
import {
  approximateDistanceM as approximateDistanceMRegion,
  distanceFromCenter as distanceFromCenterRegion,
  latLngToPercent as latLngToPercentRegion,
} from '@/lib/region';
import type { LatLng } from '@/lib/region/types';

export type { LatLng } from '@/lib/region/types';

export const LONDRINA_CENTER = LONDRINA.center;
export const LONDRINA_BBOX = LONDRINA.bbox;

export function latLngToPercent(point: LatLng): { x: number; y: number } {
  return latLngToPercentRegion(LONDRINA.bbox, point);
}

export const approximateDistanceM = approximateDistanceMRegion;

export function distanceFromCenter(point: LatLng): string {
  return distanceFromCenterRegion(LONDRINA, point);
}
