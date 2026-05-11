import type { EnvironmentalPoint } from './types';

const pointRegistry = new Map<string, EnvironmentalPoint>();

export function rememberEnvironmentalPoints(points: readonly EnvironmentalPoint[]): void {
  for (const point of points) pointRegistry.set(point.id, point);
}

export function getRegisteredEnvironmentalPoint(id: string): EnvironmentalPoint | null {
  return pointRegistry.get(id) ?? null;
}

export function clearEnvironmentalPointRegistry(): void {
  pointRegistry.clear();
}
