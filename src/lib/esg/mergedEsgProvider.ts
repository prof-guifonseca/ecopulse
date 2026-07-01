import * as Sentry from '@sentry/nextjs';
import { LONDRINA } from '@/data/regions/londrina';
import { bboxFromCenter } from './geo';
import { geocodePlace } from './adapters/nominatim';
import { createOverpassProvider } from './overpassProvider';
import { createOfficialSnapshotProvider } from './officialSnapshotProvider';
import type { EsgPlaceSearchInput, EsgPlaceSearchResult } from './types';

const CACHE_TTL_MS = 20 * 60 * 1000;
const searchCache = new Map<string, { expiresAt: number; result: EsgPlaceSearchResult }>();

interface SearchOptions {
  provider?: string;
  userAgent?: string;
  referer?: string;
}

export async function searchEnvironmentalPlaces(
  input: EsgPlaceSearchInput,
  options: SearchOptions = {},
): Promise<EsgPlaceSearchResult> {
  const provider = options.provider ?? process.env.ESG_DISCOVERY_PROVIDER ?? 'openstreetmap';
  const normalizedInput = await resolveSearchInput(input, options);
  const key = cacheKey(normalizedInput);
  const cached = searchCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return {
      ...cached.result,
      source: 'cache',
      points: cached.result.points.map((point) => ({ ...point, source: 'cache' })),
      generatedAt: new Date().toISOString(),
      reason: 'memory-cache',
    };
  }

  const snapshotProvider = createOfficialSnapshotProvider();
  if (provider === 'official' || provider === 'demo') {
    return snapshotProvider.search(normalizedInput);
  }

  try {
    const overpass = createOverpassProvider({
      userAgent: options.userAgent ?? process.env.ESG_USER_AGENT,
      referer: options.referer,
    });
    const live = await overpass.search(normalizedInput);
    if (live.points.length > 0) {
      const result = { ...live, generatedAt: new Date().toISOString() };
      searchCache.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, result });
      return result;
    }
    return {
      ...(await snapshotProvider.search(normalizedInput)),
      reason: 'osm-empty-fallback',
    };
  } catch (error) {
    Sentry.addBreadcrumb({
      category: 'esg-discovery',
      level: 'warning',
      message: 'overpass search failed, falling back to snapshot',
      data: { message: error instanceof Error ? error.message : String(error) },
    });
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[ecopulse] overpass search failed, using snapshot fallback', error);
    }
    return {
      ...(await snapshotProvider.search(normalizedInput)),
      reason: error instanceof Error ? `osm-error:${error.message}` : 'osm-error',
    };
  }
}

export function clearEsgSearchCache(): void {
  searchCache.clear();
}

async function resolveSearchInput(
  input: EsgPlaceSearchInput,
  options: SearchOptions,
): Promise<EsgPlaceSearchInput> {
  if (input.query?.trim()) {
    try {
      const place = await geocodePlace(input.query, {
        userAgent: options.userAgent ?? process.env.ESG_USER_AGENT,
        referer: options.referer,
      });
      if (place) {
        const bbox = place.bbox ?? bboxFromCenter(place.center, input.radiusMeters ?? 4500);
        return {
          ...input,
          bbox: shrinkBBox(bbox),
          center: place.center,
          radiusMeters: input.radiusMeters ?? 4500,
        };
      }
    } catch (error) {
      Sentry.addBreadcrumb({
        category: 'esg-discovery',
        level: 'warning',
        message: 'geocoding failed, falling back to Londrina defaults',
        data: { message: error instanceof Error ? error.message : String(error) },
      });
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[ecopulse] geocoding failed, using Londrina defaults', error);
      }
      return { ...input, bbox: LONDRINA.bbox, center: LONDRINA.center };
    }
  }

  if (input.bbox || input.center) return input;
  return { ...input, bbox: LONDRINA.bbox, center: LONDRINA.center };
}

function shrinkBBox(bbox: NonNullable<EsgPlaceSearchInput['bbox']>) {
  const latSpan = Math.min(Math.abs(bbox.north - bbox.south), 0.12);
  const lngSpan = Math.min(Math.abs(bbox.east - bbox.west), 0.12);
  const center = {
    lat: (bbox.north + bbox.south) / 2,
    lng: (bbox.east + bbox.west) / 2,
  };
  return {
    north: center.lat + latSpan / 2,
    south: center.lat - latSpan / 2,
    west: center.lng - lngSpan / 2,
    east: center.lng + lngSpan / 2,
  };
}

function cacheKey(input: EsgPlaceSearchInput): string {
  return JSON.stringify({
    bbox: input.bbox ? roundedBBox(input.bbox) : null,
    center: input.center ? [round(input.center.lat), round(input.center.lng)] : null,
    radiusMeters: input.radiusMeters ? Math.round(input.radiusMeters / 100) * 100 : null,
    categories: [...(input.categories ?? [])].sort(),
    limit: input.limit ?? 80,
    query: input.query?.trim().toLowerCase() ?? '',
  });
}

function roundedBBox(bbox: NonNullable<EsgPlaceSearchInput['bbox']>) {
  return [round(bbox.south), round(bbox.west), round(bbox.north), round(bbox.east)];
}

function round(value: number): number {
  return Number(value.toFixed(4));
}
