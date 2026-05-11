import type { FeedPost, MapPoint, Product, Score } from '@/types';
import { pickTodaysMissions } from '@/data/missionPool';
import type { TribeId } from '@/data/tribes';
import { PRODUCT_CATALOG } from './catalog';
import { hashString } from './rng';
import type { DailyPlanContext, MapRankingContext, ProductPickContext } from './types';

const SCORE_RANK: Record<Score, number> = { A: 5, B: 4, C: 3, D: 2, E: 1 };

export function pickNextProduct(
  context: ProductPickContext,
  products: readonly Product[] = PRODUCT_CATALOG
): Product {
  const recent = new Set(context.recentlyScannedIds);
  const unseen = products.filter((product) => !recent.has(product.id));
  const basePool = unseen.length > 0 ? unseen : products;
  const eligible = filterByScore(basePool, context.minScore);
  const firstRunPool =
    context.firstRun && !context.minScore
      ? eligible.filter((product) => product.score === 'B' || product.score === 'C')
      : eligible;
  const pool = firstRunPool.length > 0 ? firstRunPool : eligible.length > 0 ? eligible : basePool;

  return [...pool].sort(
    (a, b) =>
      hashString(`${context.seed}:${context.cursor}:${a.id}`) -
      hashString(`${context.seed}:${context.cursor}:${b.id}`)
  )[0];
}

export function buildDailyPlan(context: DailyPlanContext): string[] {
  return pickTodaysMissions({
    tribe: context.tribe as TribeId,
    chapterId: context.chapterId,
    seed: `${context.seed}|${context.day}|${context.tribe}`,
  });
}

export function rankMapPoints<T extends MapPoint>(
  points: readonly T[],
  context: MapRankingContext
): T[] {
  const visited = new Set(context.visitedPointIds);
  const preferred = new Set(context.preferredTypes ?? []);

  return [...points].sort((a, b) => {
    const aPreferred = preferred.has(a.type) ? 0 : 1;
    const bPreferred = preferred.has(b.type) ? 0 : 1;
    if (aPreferred !== bPreferred) return aPreferred - bPreferred;

    const aVisited = visited.has(a.id) ? 1 : 0;
    const bVisited = visited.has(b.id) ? 1 : 0;
    if (aVisited !== bVisited) return aVisited - bVisited;

    if (a.lastVerifiedDays !== b.lastVerifiedDays) return a.lastVerifiedDays - b.lastVerifiedDays;
    return a.name.localeCompare(b.name, 'pt-BR');
  });
}

export interface SimulatedFeedPost extends FeedPost {
  viewerLiked: boolean;
  effectiveLikes: number;
  viewerPromised: boolean;
}

export function buildCommunityFeed(opts: {
  posts: readonly FeedPost[];
  likedPostIds: string[];
  promisedPostIds: string[];
}): SimulatedFeedPost[] {
  const liked = new Set(opts.likedPostIds);
  const promised = new Set(opts.promisedPostIds);

  return opts.posts.map((post) => {
    const viewerLiked = liked.has(post.id) || post.liked;
    return {
      ...post,
      viewerLiked,
      effectiveLikes: post.likes + (liked.has(post.id) && !post.liked ? 1 : 0),
      viewerPromised: promised.has(post.id),
    };
  });
}

function filterByScore(products: readonly Product[], minScore: Score | null | undefined) {
  if (!minScore) return [...products];
  const minRank = SCORE_RANK[minScore];
  return products.filter((product) => SCORE_RANK[product.score] >= minRank);
}

