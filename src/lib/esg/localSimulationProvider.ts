import { MAP_POINTS } from '@/data/mapPoints';
import type { MapPoint } from '@/types';
import { mapPointTypeToEnvironmentalCategory } from './categories';
import { pointInBBox } from './geo';
import type {
  EnvironmentalCategory,
  EnvironmentalPoint,
  EsgPlaceProvider,
  EsgPlaceSearchInput,
  EsgPlaceSearchResult,
} from './types';

export function mapPointToEnvironmentalPoint(point: MapPoint): EnvironmentalPoint {
  const category = mapPointTypeToEnvironmentalCategory(point.type);
  const verifiedAt =
    point.sourceUpdatedAt ??
    new Date(Date.now() - point.lastVerifiedDays * 24 * 60 * 60 * 1000).toISOString();

  return {
    id: point.id,
    source: 'official',
    sourceId: `official:${point.id}`,
    name: point.name,
    category,
    categories: [category],
    address: point.address,
    openingHours: point.hours,
    phone: point.phone,
    website: point.website,
    lat: point.lat,
    lng: point.lng,
    lastVerifiedAt: verifiedAt,
    lastVerifiedDays: point.lastVerifiedDays,
    confidence: point.confidence ?? 78,
    tags: {
      ...(point.tags ?? {}),
      curatedSnapshot: 'londrina-esg',
      mapPointType: point.type,
    },
    sourceName: point.sourceName,
    sourceUrl: point.sourceUrl,
    sourceUpdatedAt: point.sourceUpdatedAt,
    geocodeConfidence: point.geocodeConfidence,
    legacyMapPointType: point.type,
  };
}

export function getLocalEnvironmentalPoints(
  points: readonly MapPoint[] = MAP_POINTS,
  input: Pick<EsgPlaceSearchInput, 'bbox' | 'categories' | 'limit'> = {}
): EnvironmentalPoint[] {
  const categories = new Set(input.categories ?? []);
  return points
    .map(mapPointToEnvironmentalPoint)
    .filter((point) => categoryMatches(point, categories))
    .filter((point) => !input.bbox || pointInBBox(point, input.bbox))
    .slice(0, input.limit ?? 80);
}

export function getLocalEnvironmentalPointById(id: string): EnvironmentalPoint | null {
  const point = MAP_POINTS.find((item) => item.id === id);
  return point ? mapPointToEnvironmentalPoint(point) : null;
}

export function createLocalSimulationProvider(): EsgPlaceProvider {
  return {
    async search(input: EsgPlaceSearchInput): Promise<EsgPlaceSearchResult> {
      return {
        points: getLocalEnvironmentalPoints(MAP_POINTS, input),
        source: 'official',
        generatedAt: new Date().toISOString(),
        reason: 'fallback-official-snapshot',
        bbox: input.bbox,
        center: input.center,
      };
    },
  };
}

function categoryMatches(point: EnvironmentalPoint, categories: Set<EnvironmentalCategory>) {
  return categories.size === 0 || point.categories.some((category) => categories.has(category));
}
