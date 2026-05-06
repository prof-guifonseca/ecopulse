import { LondrinaBackdrop } from '@/components/map/LondrinaBackdrop';
import type { Region } from '@/lib/region/types';
import { EVENTS } from '../events';
import { MAP_POINTS } from '../mapPoints';

/**
 * Londrina is the first instance of the pluggable Region abstraction. The
 * coordinates here are the canonical source of truth; the legacy module
 * src/lib/map/londrina.ts re-exports them as a shim for back-compat.
 */
export const LONDRINA: Region = {
  id: 'londrina',
  name: 'Londrina',
  state: 'PR',
  blurb: 'Centro · Londrina, PR',
  center: { lat: -23.3103, lng: -51.1628 },
  bbox: {
    // ~3.6km × 3.6km centered on Praça Marechal Floriano.
    north: -23.293,
    south: -23.328,
    west: -51.182,
    east: -51.144,
  },
  Backdrop: LondrinaBackdrop,
  mapPoints: MAP_POINTS,
  events: EVENTS,
};
