import type { RegionBBox, LatLng } from '@/lib/region/types';
import type { MapPointType } from '@/types';

export type EnvironmentalCategory =
  | 'recycling'
  | 'batteries'
  | 'electronics'
  | 'cooking_oil'
  | 'clothes'
  | 'repair'
  | 'reuse'
  | 'bulk'
  | 'compost';

export type EnvironmentalPointSource = 'official' | 'osm' | 'cache' | 'user' | 'demo';

export interface EnvironmentalPoint {
  id: string;
  source: EnvironmentalPointSource;
  sourceId: string;
  name: string;
  category: EnvironmentalCategory;
  categories: EnvironmentalCategory[];
  address: string;
  openingHours?: string;
  phone?: string;
  website?: string;
  lat: number;
  lng: number;
  lastVerifiedAt?: string;
  lastVerifiedDays?: number;
  confidence: number;
  tags: Record<string, string>;
  sourceUrl?: string;
  sourceName?: string;
  sourceUpdatedAt?: string;
  geocodeConfidence?: number;
  legacyMapPointType?: MapPointType;
}

export interface EsgPlaceSearchInput {
  regionId?: string;
  bbox?: RegionBBox;
  center?: LatLng;
  radiusMeters?: number;
  categories?: EnvironmentalCategory[];
  limit?: number;
  query?: string;
  signal?: AbortSignal;
}

export interface EsgPlaceSearchResult {
  points: EnvironmentalPoint[];
  source: EnvironmentalPointSource;
  generatedAt: string;
  reason?: string;
  center?: LatLng;
  bbox?: RegionBBox;
}

export interface EsgPlaceProvider {
  search(input: EsgPlaceSearchInput): Promise<EsgPlaceSearchResult>;
}
