import { describe, expect, it, vi } from 'vitest';
import { LONDRINA } from '@/data/regions/londrina';
import { createOverpassProvider } from './overpassProvider';

function overpassResponse(elements: unknown[], status = 200) {
  return new Response(JSON.stringify({ elements }), { status });
}

describe('createOverpassProvider', () => {
  it('normalizes a successful Overpass response into points/source/bbox', async () => {
    const fetcher = vi.fn(async () =>
      overpassResponse([
        {
          type: 'node',
          id: 1,
          lat: -23.31,
          lon: -51.16,
          tags: { name: 'Recicla Centro', amenity: 'recycling' },
        },
      ]),
    );
    const provider = createOverpassProvider({ fetcher });

    const result = await provider.search({ bbox: LONDRINA.bbox, limit: 20 });

    expect(result.source).toBe('osm');
    expect(result.bbox).toEqual(LONDRINA.bbox);
    expect(result.points).toHaveLength(1);
    expect(result.points[0]).toMatchObject({ source: 'osm', name: 'Recicla Centro' });
  });

  it('aborts the request once timeoutMs elapses', async () => {
    const fetcher = vi.fn(
      (_input: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () =>
            reject(Object.assign(new Error('aborted'), { name: 'AbortError' })),
          );
        }),
    );
    const provider = createOverpassProvider({ fetcher, timeoutMs: 50 });

    await expect(provider.search({ bbox: LONDRINA.bbox, limit: 20 })).rejects.toMatchObject({
      name: 'AbortError',
    });
  }, 5000);

  it('filters by category and caps results at the requested limit', async () => {
    const fetcher = vi.fn(async () =>
      overpassResponse([
        {
          type: 'node',
          id: 1,
          lat: -23.31,
          lon: -51.16,
          tags: { name: 'Pilhas A', 'recycling:batteries': 'yes' },
        },
        {
          type: 'node',
          id: 2,
          lat: -23.31,
          lon: -51.16,
          tags: { name: 'Pilhas B', 'recycling:batteries': 'yes' },
        },
        {
          type: 'node',
          id: 3,
          lat: -23.31,
          lon: -51.16,
          tags: { name: 'E-lixo', 'recycling:computers': 'yes' },
        },
      ]),
    );
    const provider = createOverpassProvider({ fetcher });

    const result = await provider.search({
      bbox: LONDRINA.bbox,
      categories: ['batteries'],
      limit: 1,
    });

    expect(result.points).toHaveLength(1);
    expect(result.points[0]?.category).toBe('batteries');
  });

  it('propagates an upstream AbortSignal into the internal controller', async () => {
    const upstream = new AbortController();
    let capturedSignal: AbortSignal | undefined;
    const fetcher = vi.fn(
      (_input: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          capturedSignal = init?.signal ?? undefined;
          init?.signal?.addEventListener('abort', () =>
            reject(Object.assign(new Error('aborted'), { name: 'AbortError' })),
          );
        }),
    );
    const provider = createOverpassProvider({ fetcher, timeoutMs: 5000 });

    const pending = provider.search({ bbox: LONDRINA.bbox, limit: 20, signal: upstream.signal });
    upstream.abort();

    await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
    expect(capturedSignal?.aborted).toBe(true);
  });
});
