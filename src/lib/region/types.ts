import type { ComponentType } from 'react';
import type { EcoEvent, MapPoint } from '@/types';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface RegionBBox {
  north: number;
  south: number;
  west: number;
  east: number;
}

export interface Region {
  id: string;
  name: string;
  state: string;
  /** Short label like "Centro · Londrina, PR" used in headers. */
  blurb: string;
  center: LatLng;
  bbox: RegionBBox;
  /** Pure SVG component — same percent-coord space as bbox. */
  Backdrop: ComponentType;
  mapPoints: MapPoint[];
  events: EcoEvent[];
}
