import { describe, expect, it } from 'vitest';
import type { EsgPlaceSearchResult } from '@/lib/esg';
import { resolveMapLoadStatus } from './MapPage';

function result(source: EsgPlaceSearchResult['source']): EsgPlaceSearchResult {
  return { points: [], source, generatedAt: new Date().toISOString() };
}

describe('resolveMapLoadStatus', () => {
  it('returns fallback for an official-source result', () => {
    expect(resolveMapLoadStatus(result('official'))).toBe('fallback');
  });

  it('returns ready for a live osm-source result', () => {
    expect(resolveMapLoadStatus(result('osm'))).toBe('ready');
  });

  it('returns ready for a cached result', () => {
    expect(resolveMapLoadStatus(result('cache'))).toBe('ready');
  });

  it('returns error when an error is passed, regardless of result', () => {
    expect(resolveMapLoadStatus(null, new Error('network down'))).toBe('error');
    expect(resolveMapLoadStatus(result('osm'), new Error('network down'))).toBe('error');
  });

  it('returns fallback when there is neither a result nor an error', () => {
    expect(resolveMapLoadStatus(null)).toBe('fallback');
  });
});
