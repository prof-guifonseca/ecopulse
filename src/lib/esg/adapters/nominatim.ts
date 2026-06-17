import type { LatLng, RegionBBox } from '@/lib/region/types';
import { fetchWithRetry } from '@/lib/net/fetchRetry';
import { ECOPULSE_CONTACT_URL, ECOPULSE_USER_AGENT } from '@/lib/userAgent';
import type { NominatimPlace } from './nominatim.raw';

/**
 * Nominatim geocoding adapter (P6 — anti-corruption layer). Translates the raw
 * provider response (`*.raw.ts`) into the domain `GeocodedPlace`. The raw shape
 * and its `as NominatimPlace[]` cast stay here, at the boundary.
 */

export interface GeocodedPlace {
  label: string;
  center: LatLng;
  bbox?: RegionBBox;
}

interface NominatimOptions {
  endpoint?: string;
  userAgent?: string;
  referer?: string;
  fetcher?: typeof fetch;
  timeoutMs?: number;
}

const DEFAULT_NOMINATIM_ENDPOINT = 'https://nominatim.openstreetmap.org/search';

export async function geocodePlace(
  query: string,
  options: NominatimOptions = {},
): Promise<GeocodedPlace | null> {
  const value = query.trim();
  if (value.length < 3) return null;

  const endpoint = options.endpoint ?? DEFAULT_NOMINATIM_ENDPOINT;
  const userAgent = options.userAgent ?? ECOPULSE_USER_AGENT;
  const referer = options.referer ?? ECOPULSE_CONTACT_URL;
  const fetcher = options.fetcher ?? fetch;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 3500);

  try {
    const url = new URL(endpoint);
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('limit', '1');
    url.searchParams.set('countrycodes', 'br');
    url.searchParams.set('q', value);

    const response = await fetchWithRetry(fetcher, url, {
      headers: {
        'User-Agent': userAgent,
        Referer: referer,
      },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Nominatim request failed with ${response.status}`);

    const data = (await response.json()) as NominatimPlace[];
    const place = data[0];
    if (!place?.lat || !place.lon) return null;

    return {
      label: place.display_name ?? value,
      center: { lat: Number(place.lat), lng: Number(place.lon) },
      bbox: parseBoundingBox(place.boundingbox),
    };
  } finally {
    clearTimeout(timeout);
  }
}

function parseBoundingBox(value: NominatimPlace['boundingbox']): RegionBBox | undefined {
  if (!value) return undefined;
  const [south, north, west, east] = value.map(Number);
  if ([south, north, west, east].some((item) => Number.isNaN(item))) return undefined;
  return { south, north, west, east };
}
