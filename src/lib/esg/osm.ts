import type { RegionBBox } from '@/lib/region/types';
import { ENVIRONMENTAL_CATEGORY_DETAIL_LABELS } from './categories';
import type { EnvironmentalCategory, EnvironmentalPoint, EsgPlaceSearchInput } from './types';

export interface OsmElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags?: Record<string, string>;
}

export interface OverpassResponse {
  elements?: OsmElement[];
}

type OsmSelector =
  | { key: string; value: string }
  | { key: string; exists: true }
  | { key: string; regex: string };

const CATEGORY_SELECTORS: Record<EnvironmentalCategory, OsmSelector[]> = {
  recycling: [{ key: 'amenity', value: 'recycling' }],
  batteries: [
    { key: 'recycling:batteries', exists: true },
    { key: 'recycling:car_batteries', exists: true },
  ],
  electronics: [
    { key: 'recycling:computers', exists: true },
    { key: 'recycling:electrical_appliances', exists: true },
    { key: 'recycling:small_electrical_appliances', exists: true },
    { key: 'recycling:mobile_phones', exists: true },
    { key: 'recycling:tv_monitor', exists: true },
    { key: 'shop', regex: '^(computer|electronics|mobile_phone)$' },
  ],
  cooking_oil: [
    { key: 'recycling:cooking_oil', exists: true },
    { key: 'recycling:engine_oil', exists: true },
  ],
  clothes: [
    { key: 'recycling:clothes', exists: true },
    { key: 'recycling:shoes', exists: true },
    { key: 'shop', regex: '^(charity|clothes)$' },
  ],
  repair: [
    { key: 'shop', regex: '^(repair|bicycle|computer|electronics|mobile_phone|shoes|tailor)$' },
    { key: 'craft', regex: '^(shoemaker|tailor|electronics_repair)$' },
    { key: 'service:bicycle:repair', value: 'yes' },
  ],
  reuse: [
    { key: 'shop', regex: '^(second_hand|charity|antiques)$' },
    { key: 'amenity', value: 'give_box' },
    { key: 'amenity', value: 'public_bookcase' },
  ],
  bulk: [
    { key: 'bulk_purchase', exists: true },
    { key: 'shop', regex: '^(health_food|greengrocer|spices)$' },
  ],
  compost: [
    { key: 'recycling:organic', exists: true },
    { key: 'recycling:green_waste', exists: true },
    { key: 'recycling:garden_waste', exists: true },
    { key: 'recycling:food_waste', exists: true },
  ],
};

const ALL_CATEGORIES = Object.keys(CATEGORY_SELECTORS) as EnvironmentalCategory[];

export function buildOverpassQuery(input: EsgPlaceSearchInput): string {
  const bbox = input.bbox ?? bboxFromSearchInput(input);
  const limit = clampInteger(input.limit ?? 80, 1, 120);
  const categories = input.categories?.length ? input.categories : ALL_CATEGORIES;
  const selectorKeys = new Set<string>();
  const clauses: string[] = [];

  for (const category of categories) {
    for (const selector of CATEGORY_SELECTORS[category] ?? []) {
      const selectorText = selectorToOverpass(selector);
      if (selectorKeys.has(selectorText)) continue;
      selectorKeys.add(selectorText);
      for (const objectType of ['node', 'way', 'relation']) {
        clauses.push(`  ${objectType}${selectorText}${bboxToOverpass(bbox)};`);
      }
    }
  }

  return `[out:json][timeout:10];\n(\n${clauses.join('\n')}\n);\nout center ${limit};`;
}

export function normalizeOsmElement(element: OsmElement): EnvironmentalPoint | null {
  const tags = normalizeTags(element.tags);
  const lat = element.lat ?? element.center?.lat;
  const lng = element.lon ?? element.center?.lon;
  if (lat === undefined || lng === undefined) return null;

  const categories = categoriesFromTags(tags);
  const category = categories[0];
  if (!category) return null;

  const sourceId = `${element.type}/${element.id}`;
  const address = buildAddress(tags);
  return {
    id: `osm:${element.type}:${element.id}`,
    source: 'osm',
    sourceId,
    name: tags.name ?? ENVIRONMENTAL_CATEGORY_DETAIL_LABELS[category],
    category,
    categories,
    address,
    openingHours: tags.opening_hours,
    phone: tags.phone ?? tags['contact:phone'],
    website: tags.website ?? tags['contact:website'],
    lat,
    lng,
    confidence: confidenceFor(tags, category),
    tags,
    sourceName: 'OpenStreetMap',
    sourceUrl: `https://www.openstreetmap.org/${element.type}/${element.id}`,
  };
}

export function normalizeOverpassResponse(data: OverpassResponse): EnvironmentalPoint[] {
  const points = (data.elements ?? [])
    .map(normalizeOsmElement)
    .filter((point): point is EnvironmentalPoint => point !== null);
  return dedupeEnvironmentalPoints(points);
}

export function dedupeEnvironmentalPoints(points: readonly EnvironmentalPoint[]): EnvironmentalPoint[] {
  const bySource = new Map<string, EnvironmentalPoint>();
  for (const point of points) {
    const existing = bySource.get(point.sourceId);
    if (!existing || point.confidence > existing.confidence) bySource.set(point.sourceId, point);
  }
  return [...bySource.values()].sort((a, b) => b.confidence - a.confidence || a.name.localeCompare(b.name, 'pt-BR'));
}

function categoriesFromTags(tags: Record<string, string>): EnvironmentalCategory[] {
  const categories: EnvironmentalCategory[] = [];
  if (truthy(tags['recycling:cooking_oil']) || truthy(tags['recycling:engine_oil'])) {
    categories.push('cooking_oil');
  }
  if (truthy(tags['recycling:batteries']) || truthy(tags['recycling:car_batteries'])) {
    categories.push('batteries');
  }
  if (
    truthy(tags['recycling:computers']) ||
    truthy(tags['recycling:electrical_appliances']) ||
    truthy(tags['recycling:small_electrical_appliances']) ||
    truthy(tags['recycling:mobile_phones']) ||
    truthy(tags['recycling:tv_monitor']) ||
    matches(tags.shop, /^(computer|electronics|mobile_phone)$/)
  ) {
    categories.push('electronics');
  }
  if (truthy(tags['recycling:clothes']) || truthy(tags['recycling:shoes']) || matches(tags.shop, /^(charity|clothes)$/)) {
    categories.push('clothes');
  }
  if (
    matches(tags.shop, /^(repair|bicycle|computer|electronics|mobile_phone|shoes|tailor)$/) ||
    matches(tags.craft, /^(shoemaker|tailor|electronics_repair)$/) ||
    tags['service:bicycle:repair'] === 'yes'
  ) {
    categories.push('repair');
  }
  if (matches(tags.shop, /^(second_hand|charity|antiques)$/) || tags.amenity === 'give_box' || tags.amenity === 'public_bookcase') {
    categories.push('reuse');
  }
  if (truthy(tags.bulk_purchase) || matches(tags.shop, /^(health_food|greengrocer|spices)$/)) {
    categories.push('bulk');
  }
  if (
    truthy(tags['recycling:organic']) ||
    truthy(tags['recycling:green_waste']) ||
    truthy(tags['recycling:garden_waste']) ||
    truthy(tags['recycling:food_waste'])
  ) {
    categories.push('compost');
  }
  if (tags.amenity === 'recycling') categories.push('recycling');
  return [...new Set(categories)];
}

function confidenceFor(tags: Record<string, string>, category: EnvironmentalCategory): number {
  let confidence = category === 'recycling' ? 58 : 68;
  if (tags.name) confidence += 10;
  if (tags.opening_hours) confidence += 8;
  if (tags.phone || tags['contact:phone']) confidence += 5;
  if (tags.website || tags['contact:website']) confidence += 5;
  if (buildAddress(tags) !== 'Endereço não informado') confidence += 4;
  return Math.min(confidence, 95);
}

function buildAddress(tags: Record<string, string>): string {
  const street = tags['addr:street'];
  const number = tags['addr:housenumber'];
  const suburb = tags['addr:suburb'] ?? tags['addr:neighbourhood'];
  const city = tags['addr:city'];
  const line = [street, number].filter(Boolean).join(', ');
  return [suburb, line || city].filter(Boolean).join(' · ') || tags.address || 'Endereço não informado';
}

function normalizeTags(tags: OsmElement['tags']): Record<string, string> {
  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(tags ?? {})) {
    if (typeof value === 'string') normalized[key] = value;
  }
  return normalized;
}

function selectorToOverpass(selector: OsmSelector): string {
  if ('regex' in selector) return `["${selector.key}"~"${selector.regex}"]`;
  if ('exists' in selector) return `["${selector.key}"]`;
  return `["${selector.key}"="${selector.value}"]`;
}

function bboxToOverpass(bbox: RegionBBox): string {
  return `(${bbox.south.toFixed(6)},${bbox.west.toFixed(6)},${bbox.north.toFixed(6)},${bbox.east.toFixed(6)})`;
}

function bboxFromSearchInput(input: EsgPlaceSearchInput): RegionBBox {
  if (!input.center) {
    throw new Error('Overpass search requires bbox or center.');
  }
  const radius = input.radiusMeters ?? 3500;
  const latDelta = radius / 111_320;
  const lngDelta = radius / (111_320 * Math.max(0.2, Math.cos((input.center.lat * Math.PI) / 180)));
  return {
    north: input.center.lat + latDelta,
    south: input.center.lat - latDelta,
    west: input.center.lng - lngDelta,
    east: input.center.lng + lngDelta,
  };
}

function clampInteger(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function truthy(value: string | undefined): boolean {
  return value === 'yes' || value === 'only' || value === 'true' || value === '1';
}

function matches(value: string | undefined, regex: RegExp): boolean {
  return value ? regex.test(value) : false;
}
