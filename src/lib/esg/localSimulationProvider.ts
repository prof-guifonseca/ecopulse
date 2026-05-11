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
  const verifiedAt = new Date(Date.now() - point.lastVerifiedDays * 24 * 60 * 60 * 1000);

  return {
    id: point.id,
    source: 'simulation',
    sourceId: `simulation:${point.id}`,
    name: point.name,
    category,
    categories: [category],
    address: point.address,
    openingHours: point.hours,
    phone: point.phone,
    lat: point.lat,
    lng: point.lng,
    lastVerifiedAt: verifiedAt.toISOString(),
    lastVerifiedDays: point.lastVerifiedDays,
    confidence: 65,
    tags: {
      simulation: 'true',
      mapPointType: point.type,
    },
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
        source: 'simulation',
        generatedAt: new Date().toISOString(),
        reason: 'fallback-simulation',
        bbox: input.bbox,
        center: input.center,
      };
    },
  };
}

function categoryMatches(point: EnvironmentalPoint, categories: Set<EnvironmentalCategory>) {
  return categories.size === 0 || point.categories.some((category) => categories.has(category));
}
