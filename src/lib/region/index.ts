'use client';

import { useUserStore } from '@/store/userStore';
import { DEFAULT_REGION_ID, getRegion } from '@/data/regions';
import type { LatLng, Region, RegionBBox } from './types';

export type { LatLng, Region, RegionBBox } from './types';

/**
 * Project a lat/lng onto the region bounding box. Returns percent-of-viewport
 * coordinates suitable for absolute-positioned overlay elements. Out-of-bbox
 * points are clamped to [0, 100].
 */
export function latLngToPercent(bbox: RegionBBox, { lat, lng }: LatLng): { x: number; y: number } {
  const xRaw = ((lng - bbox.west) / (bbox.east - bbox.west)) * 100;
  const yRaw = ((bbox.north - lat) / (bbox.north - bbox.south)) * 100;
  return {
    x: Math.max(0, Math.min(100, xRaw)),
    y: Math.max(0, Math.min(100, yRaw)),
  };
}

export function approximateDistanceM(a: LatLng, b: LatLng): number {
  const R = 6_371_000;
  const φ1 = (a.lat * Math.PI) / 180;
  const φ2 = (b.lat * Math.PI) / 180;
  const dφ = ((b.lat - a.lat) * Math.PI) / 180;
  const dλ = ((b.lng - a.lng) * Math.PI) / 180;
  const x = dλ * Math.cos((φ1 + φ2) / 2);
  return Math.round(Math.sqrt(x * x + dφ * dφ) * R);
}

export function distanceFromCenter(region: Region, point: LatLng): string {
  const meters = approximateDistanceM(region.center, point);
  if (meters < 1000) return `${meters} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * React hook that returns the user's current region. Falls back to the
 * default region (Londrina) when the persisted regionId is unknown — this
 * keeps the shipped prototype stable while the abstraction supports N regions.
 */
export function useCurrentRegion(): Region {
  const regionId = useUserStore((s) => s.regionId ?? DEFAULT_REGION_ID);
  return getRegion(regionId) ?? getRegion(DEFAULT_REGION_ID)!;
}
