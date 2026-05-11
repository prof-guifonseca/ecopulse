import type { NextRequest } from 'next/server';
import { LONDRINA } from '@/data/regions/londrina';
import { ENVIRONMENTAL_CATEGORIES, searchEnvironmentalPlaces } from '@/lib/esg';
import type { EnvironmentalCategory } from '@/lib/esg';
import type { RegionBBox } from '@/lib/region/types';

export const dynamic = 'force-dynamic';

const MAX_LIMIT = 120;
const MAX_RADIUS_METERS = 12_000;
const DEFAULT_RADIUS_METERS = 3500;

export async function GET(request: NextRequest) {
  const input = parseSearchParams(request.nextUrl.searchParams);
  const result = await searchEnvironmentalPlaces(input, {
    provider: process.env.ESG_DISCOVERY_PROVIDER,
    userAgent: process.env.ESG_USER_AGENT,
    referer: request.headers.get('referer') ?? undefined,
  });

  return Response.json(result, {
    headers: {
      'Cache-Control': 'private, max-age=300',
    },
  });
}

function parseSearchParams(searchParams: URLSearchParams) {
  const center = parseCenter(searchParams);
  const radiusMeters = clampNumber(
    Number(searchParams.get('radiusMeters') ?? DEFAULT_RADIUS_METERS),
    250,
    MAX_RADIUS_METERS
  );
  const bbox = parseBBox(searchParams.get('bbox'));
  const categories = parseCategories(searchParams.get('categories'));
  const limit = clampNumber(Number(searchParams.get('limit') ?? 80), 1, MAX_LIMIT);
  const query = searchParams.get('q')?.trim();

  return {
    regionId: searchParams.get('regionId') ?? LONDRINA.id,
    bbox: bbox ?? undefined,
    center: center ?? undefined,
    radiusMeters,
    categories,
    limit,
    query: query || undefined,
  };
}

function parseCenter(searchParams: URLSearchParams) {
  const lat = Number(searchParams.get('lat'));
  const lng = Number(searchParams.get('lng'));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
}

function parseBBox(value: string | null): RegionBBox | null {
  if (!value) return null;
  const [south, west, north, east] = value.split(',').map(Number);
  if ([south, west, north, east].some((item) => !Number.isFinite(item))) return null;
  if (south >= north || west >= east) return null;
  return {
    south: clampNumber(south, -90, 90),
    west: clampNumber(west, -180, 180),
    north: clampNumber(north, -90, 90),
    east: clampNumber(east, -180, 180),
  };
}

function parseCategories(value: string | null): EnvironmentalCategory[] | undefined {
  if (!value) return undefined;
  const allowed = new Set(ENVIRONMENTAL_CATEGORIES);
  const categories = value
    .split(',')
    .filter((category): category is EnvironmentalCategory =>
      allowed.has(category as EnvironmentalCategory)
    );
  return categories.length > 0 ? categories : undefined;
}

function clampNumber(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.max(min, Math.min(max, value));
}
