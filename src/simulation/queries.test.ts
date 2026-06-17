import { describe, expect, it } from 'vitest';
import type { FeedPost, MapPoint, Product } from '@/types';
import { buildCommunityFeed, buildDailyPlan, pickNextProduct, rankMapPoints } from './queries';

const products: Product[] = [
  product('a', 'A'),
  product('b', 'B'),
  product('c', 'C'),
  product('d', 'D'),
];

describe('simulation queries', () => {
  it('picks the same product for the same seed and cursor', () => {
    const first = pickNextProduct({ seed: 'lia', cursor: 1, recentlyScannedIds: [] }, products);
    const second = pickNextProduct({ seed: 'lia', cursor: 1, recentlyScannedIds: [] }, products);

    expect(first.id).toBe(second.id);
  });

  it('avoids recently scanned products while alternatives exist', () => {
    const picked = pickNextProduct(
      { seed: 'lia', cursor: 1, recentlyScannedIds: ['a', 'b', 'c'] },
      products,
    );

    expect(picked.id).toBe('d');
  });

  it('respects a minimum score when a daily mission asks for quality', () => {
    const picked = pickNextProduct(
      { seed: 'lia', cursor: 2, recentlyScannedIds: [], minScore: 'B' },
      products,
    );

    expect(['A', 'B']).toContain(picked.score);
  });

  it('builds a stable one-per-slot daily plan', () => {
    const plan = buildDailyPlan({
      seed: 'new-user-seed',
      day: '2026-05-11',
      tribe: 'recicladores',
      chapterId: 'semente',
    });

    expect(plan).toHaveLength(3);
    expect(plan.some((id) => id.startsWith('scan-'))).toBe(true);
    expect(plan.some((id) => id.startsWith('map-'))).toBe(true);
    expect(plan.some((id) => id.startsWith('social-'))).toBe(true);
    expect(plan).not.toContain('scan-quality-b');
  });

  it('ranks preferred unvisited map points before generic or visited points', () => {
    const ranked = rankMapPoints(
      [
        mapPoint('visited-battery', 'baterias', 1),
        mapPoint('fresh-repair', 'reparo', 9),
        mapPoint('fresh-battery', 'baterias', 8),
      ],
      { visitedPointIds: ['visited-battery'], preferredTypes: ['baterias'] },
    );

    expect(ranked.map((point) => point.id)).toEqual([
      'fresh-battery',
      'visited-battery',
      'fresh-repair',
    ]);
  });

  it('derives community like and promise state from local progress', () => {
    const feed = buildCommunityFeed({
      posts: [post('f1', false), post('f2', true)],
      likedPostIds: ['f1'],
      promisedPostIds: ['f2'],
    });

    expect(feed[0]).toMatchObject({ viewerLiked: true, effectiveLikes: 11, viewerPromised: false });
    expect(feed[1]).toMatchObject({ viewerLiked: true, effectiveLikes: 10, viewerPromised: true });
  });
});

function product(id: string, score: Product['score']): Product {
  return {
    id,
    barcode: `789000000000${id}`,
    name: `Product ${id}`,
    brand: 'Eco',
    category: 'Alimentos',
    emoji: '🌱',
    packagingTags: ['paper'],
    isLocal: true,
    novaGroup: 1,
    score,
    breakdown: { carbono: 80, embalagem: 80, reciclabilidade: 80, origem: 80 },
    tip: 'Boa escolha.',
  };
}

function mapPoint(id: string, type: MapPoint['type'], lastVerifiedDays: number): MapPoint {
  return {
    id,
    type,
    lastVerifiedDays,
    name: id,
    address: 'Centro',
    hours: '9h-18h',
    lat: -23.31,
    lng: -51.16,
  };
}

function post(id: string, liked: boolean): FeedPost {
  return {
    id,
    liked,
    likes: 10,
    comments: 0,
    user: { name: 'Lia', avatar: '🌱', level: 1 },
    time: 'agora',
    caption: 'Teste',
    hashtags: [],
    imageKey: 'urbanGarden',
    commentList: [],
  };
}
