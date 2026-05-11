import { approximateDistanceM } from '@/lib/region';
import type { LatLng } from '@/lib/region/types';
import type { EnvironmentalCategory, EnvironmentalPoint } from './types';

export interface EnvironmentalRankingContext {
  visitedPointIds: string[];
  preferredCategories?: EnvironmentalCategory[];
  center?: LatLng;
}

export function rankEnvironmentalPoints<T extends EnvironmentalPoint>(
  points: readonly T[],
  context: EnvironmentalRankingContext
): T[] {
  const visited = new Set(context.visitedPointIds);
  const preferred = new Set(context.preferredCategories ?? []);
  const center = context.center;

  return [...points].sort((a, b) => {
    const aPreferred = preferred.size > 0 && preferred.has(a.category) ? 0 : 1;
    const bPreferred = preferred.size > 0 && preferred.has(b.category) ? 0 : 1;
    if (aPreferred !== bPreferred) return aPreferred - bPreferred;

    const aVisited = visited.has(a.id) ? 1 : 0;
    const bVisited = visited.has(b.id) ? 1 : 0;
    if (aVisited !== bVisited) return aVisited - bVisited;

    const aSource = sourceRank(a);
    const bSource = sourceRank(b);
    if (aSource !== bSource) return aSource - bSource;

    if (center) {
      const aDistance = approximateDistanceM(center, { lat: a.lat, lng: a.lng });
      const bDistance = approximateDistanceM(center, { lat: b.lat, lng: b.lng });
      if (aDistance !== bDistance) return aDistance - bDistance;
    }

    if (a.confidence !== b.confidence) return b.confidence - a.confidence;
    return a.name.localeCompare(b.name, 'pt-BR');
  });
}

function sourceRank(point: EnvironmentalPoint): number {
  if (point.source === 'osm') return 0;
  if (point.source === 'cache') return 1;
  return 2;
}
