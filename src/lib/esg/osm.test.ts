import { afterEach, describe, expect, it, vi } from 'vitest';
import { LONDRINA } from '@/data/regions/londrina';
import {
  buildOverpassQuery,
  clearEsgSearchCache,
  normalizeOsmElement,
  normalizeOverpassResponse,
  searchEnvironmentalPlaces,
} from '@/lib/esg';

describe('ESG OpenStreetMap integration', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    clearEsgSearchCache();
  });

  it('normalizes OSM recycling tags into environmental points', () => {
    const point = normalizeOsmElement({
      type: 'node',
      id: 123,
      lat: -23.31,
      lon: -51.16,
      tags: {
        name: 'Coleta de Pilhas',
        amenity: 'recycling',
        'recycling:batteries': 'yes',
        opening_hours: 'Mo-Fr 08:00-18:00',
        phone: '+55 43 99999-0000',
        'addr:street': 'Rua Sergipe',
        'addr:housenumber': '489',
        'addr:suburb': 'Centro',
      },
    });

    expect(point).toMatchObject({
      id: 'osm:node:123',
      source: 'osm',
      category: 'batteries',
      name: 'Coleta de Pilhas',
      address: 'Centro · Rua Sergipe, 489',
    });
    expect(point?.categories).toContain('recycling');
    expect(point?.confidence).toBeGreaterThanOrEqual(85);
  });

  it('maps electronics and cooking oil tags to specific ESG categories', () => {
    const points = normalizeOverpassResponse({
      elements: [
        {
          type: 'node',
          id: 1,
          lat: -23.31,
          lon: -51.16,
          tags: { name: 'E-lixo', 'recycling:computers': 'yes' },
        },
        {
          type: 'node',
          id: 2,
          lat: -23.31,
          lon: -51.16,
          tags: { name: 'Óleo usado', 'recycling:cooking_oil': 'yes' },
        },
      ],
    });

    expect(points.map((point) => point.category)).toEqual(['electronics', 'cooking_oil']);
  });

  it('builds bounded Overpass queries for selected ESG categories', () => {
    const query = buildOverpassQuery({
      bbox: LONDRINA.bbox,
      categories: ['batteries', 'electronics'],
      limit: 50,
    });

    expect(query).toContain('[out:json][timeout:10]');
    expect(query).toContain('["recycling:batteries"]');
    expect(query).toContain('["recycling:computers"]');
    expect(query).toContain('(-23.328000,-51.182000,-23.293000,-51.144000)');
    expect(query).toContain('out center 50;');
  });

  it('returns cached live results without calling Overpass again', async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            elements: [
              {
                type: 'node',
                id: 99,
                lat: -23.31,
                lon: -51.16,
                tags: { name: 'Recicla Centro', amenity: 'recycling' },
              },
            ],
          }),
          { status: 200 },
        ),
    );
    vi.stubGlobal('fetch', fetchMock);

    const first = await searchEnvironmentalPlaces({ bbox: LONDRINA.bbox, limit: 20 });
    const second = await searchEnvironmentalPlaces({ bbox: LONDRINA.bbox, limit: 20 });

    expect(first.source).toBe('osm');
    expect(second.source).toBe('cache');
    expect(second.points[0]?.source).toBe('cache');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('falls back to the curated Londrina snapshot when the external provider fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('unavailable', { status: 503 })),
    );

    const result = await searchEnvironmentalPlaces({ bbox: LONDRINA.bbox, limit: 20 });

    expect(result.source).toBe('official');
    expect(result.reason).toContain('osm-error');
    expect(result.points.length).toBeGreaterThan(0);
    expect(result.points.every((point) => point.source === 'official')).toBe(true);
    expect(result.points.every((point) => point.sourceUrl)).toBe(true);
  });
});
