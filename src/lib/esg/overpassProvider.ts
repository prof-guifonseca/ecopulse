import { bboxFromCenter } from './geo';
import { buildOverpassQuery, normalizeOverpassResponse, type OverpassResponse } from './osm';
import type { EsgPlaceProvider, EsgPlaceSearchInput, EsgPlaceSearchResult } from './types';
import { fetchWithRetry } from '@/lib/net/fetchRetry';
import { ECOPULSE_CONTACT_URL, ECOPULSE_USER_AGENT } from '@/lib/userAgent';

const DEFAULT_OVERPASS_ENDPOINT = 'https://overpass-api.de/api/interpreter';
const DEFAULT_TIMEOUT_MS = 4500;

interface OverpassProviderOptions {
  endpoint?: string;
  userAgent?: string;
  referer?: string;
  fetcher?: typeof fetch;
  timeoutMs?: number;
}

export function createOverpassProvider(options: OverpassProviderOptions = {}): EsgPlaceProvider {
  const endpoint = options.endpoint ?? DEFAULT_OVERPASS_ENDPOINT;
  const fetcher = options.fetcher ?? fetch;
  const userAgent = options.userAgent ?? ECOPULSE_USER_AGENT;
  const referer = options.referer ?? ECOPULSE_CONTACT_URL;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  return {
    async search(input: EsgPlaceSearchInput): Promise<EsgPlaceSearchResult> {
      const bbox = input.bbox ?? (input.center ? bboxFromCenter(input.center, input.radiusMeters ?? 3500) : undefined);
      if (!bbox) throw new Error('Overpass provider requires bbox or center.');

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      const upstreamSignal = input.signal;
      upstreamSignal?.addEventListener('abort', () => controller.abort(), { once: true });

      try {
        const query = buildOverpassQuery({ ...input, bbox });
        const response = await fetchWithRetry(fetcher, endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
            'User-Agent': userAgent,
            Referer: referer,
          },
          body: new URLSearchParams({ data: query }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Overpass request failed with ${response.status}`);
        }

        const data = (await response.json()) as OverpassResponse;
        const categoryFilter = new Set(input.categories ?? []);
        const points = normalizeOverpassResponse(data)
          .filter((point) => categoryFilter.size === 0 || point.categories.some((category) => categoryFilter.has(category)))
          .slice(0, input.limit ?? 80);

        return {
          points,
          source: 'osm',
          generatedAt: new Date().toISOString(),
          bbox,
          center: input.center,
        };
      } finally {
        clearTimeout(timeout);
      }
    },
  };
}
