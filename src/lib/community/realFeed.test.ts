import { describe, expect, it } from 'vitest';
import { PRODUCTS } from '@/data/products';
import { buildRealCommunityFeed } from './realFeed';

describe('real community feed', () => {
  it('uses real starter data instead of demo posts when there is no activity yet', () => {
    const feed = buildRealCommunityFeed({
      scans: [],
      visitedPointIds: [],
      likedPostIds: [],
      promisedPostIds: [],
      viewerName: 'Ana',
    });

    expect(feed.length).toBeGreaterThan(0);
    expect(feed.every((post) => post.source !== 'demo' && post.source !== 'simulation')).toBe(true);
    expect(feed.some((post) => post.sourceLabel.includes('Open Food Facts'))).toBe(true);
    expect(feed.some((post) => post.source === 'official')).toBe(true);
  });

  it('prioritizes the viewer scan activity with provenance and reaction state', () => {
    const product = PRODUCTS[0];
    const feed = buildRealCommunityFeed({
      scans: [
        {
          id: 'scan-1',
          barcode: product.barcode,
          name: product.name,
          brand: product.brand,
          category: product.category,
          score: product.score,
          scannedAt: '2026-05-11T12:00:00.000Z',
          confidence: product.confidence,
          sourceName: product.sourceName,
          sourceUrl: product.sourceUrl,
        },
      ],
      visitedPointIds: [],
      likedPostIds: ['scan-scan-1'],
      promisedPostIds: ['scan-scan-1'],
      viewerName: 'Ana',
    });

    expect(feed[0]).toMatchObject({
      id: 'scan-scan-1',
      viewerLiked: true,
      viewerPromised: true,
      sourceUrl: product.sourceUrl,
    });
    expect(feed[0].caption).toContain(product.barcode);
  });
});
