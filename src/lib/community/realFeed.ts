import { MAP_POINTS } from '@/data/mapPoints';
import { PRODUCTS } from '@/data/products';
import type { DataSource, ScanResult } from '@/domain';
import {
  ENVIRONMENTAL_CATEGORY_LABELS,
  mapPointTypeToEnvironmentalCategory,
} from '@/lib/esg/categories';
import type { FeedPost, Score } from '@/types';

export interface CommunityFeedPost extends FeedPost {
  viewerLiked: boolean;
  effectiveLikes: number;
  viewerPromised: boolean;
  source: DataSource;
  sourceLabel: string;
  sourceUrl?: string;
  commentCount: number;
}

export interface CommunityScanActivity {
  id: string;
  barcode: string;
  name: string;
  brand: string;
  category: string;
  score: Score;
  scannedAt: string;
  confidence?: number;
  sourceName?: string;
  sourceUrl?: string;
}

export interface CommunityFeedInput {
  scans: readonly CommunityScanActivity[];
  visitedPointIds: readonly string[];
  likedPostIds: readonly string[];
  promisedPostIds: readonly string[];
  commentCounts?: Readonly<Record<string, number>>;
  viewerName: string;
}

export function buildRealCommunityFeed(input: CommunityFeedInput): CommunityFeedPost[] {
  const userPosts = [
    ...input.scans.slice(0, 6).map((scan) => scanPost(scan, input.viewerName)),
    ...input.visitedPointIds
      .slice(0, 6)
      .map((pointId) => visitPost(pointId, input.viewerName))
      .filter(Boolean),
  ].filter((post): post is CommunityFeedPost => Boolean(post));

  const fallback = userPosts.length > 0 ? [] : realStarterPosts();
  return applyViewerState(
    [...userPosts, ...fallback],
    input.likedPostIds,
    input.promisedPostIds,
    input.commentCounts,
  );
}

export function buildRealServerCommunityFeed(input: {
  scans: readonly ScanResult[];
  visitedPointIds: readonly string[];
  likedPostIds: readonly string[];
  promisedPostIds: readonly string[];
  commentCounts?: Readonly<Record<string, number>>;
}): CommunityFeedPost[] {
  return buildRealCommunityFeed({
    scans: input.scans.map((scan) => ({
      id: scan.id,
      barcode: scan.barcode,
      name: scan.lookup.name,
      brand: scan.lookup.brand,
      category: scan.lookup.category,
      score: scan.score,
      scannedAt: scan.scannedAt,
      confidence: scan.lookup.confidence,
      sourceName:
        scan.lookup.provider === 'openfoodfacts'
          ? scan.lookup.source === 'cache'
            ? 'Open Food Facts snapshot/cache'
            : 'Open Food Facts'
          : undefined,
      sourceUrl: scan.lookup.sourceUrl,
    })),
    visitedPointIds: input.visitedPointIds,
    likedPostIds: input.likedPostIds,
    promisedPostIds: input.promisedPostIds,
    commentCounts: input.commentCounts,
    viewerName: 'Você',
  });
}

function scanPost(scan: CommunityScanActivity, viewerName: string): CommunityFeedPost {
  const confidence = typeof scan.confidence === 'number' ? ` Confiança ${scan.confidence}%.` : '';
  return basePost({
    id: `scan-${scan.id}`,
    actor: viewerName || 'Você',
    avatar: '🌱',
    time: relativeTime(scan.scannedAt),
    caption: `Avaliou ${scan.name} (${scan.brand}) pelo barcode ${scan.barcode}. Score ${scan.score}.${confidence}`,
    hashtags: ['#OpenFoodFacts', `#Score${scan.score}`, `#${compactHash(scan.category)}`],
    imageKey: imageForCategory(scan.category),
    source: scan.sourceName === 'Open Food Facts' ? 'provider' : 'cache',
    sourceLabel: scan.sourceName ?? 'Open Food Facts',
    sourceUrl: scan.sourceUrl,
  });
}

function visitPost(pointId: string, viewerName: string): CommunityFeedPost | null {
  const point = MAP_POINTS.find((item) => item.id === pointId);
  if (!point) return null;
  const category = mapPointTypeToEnvironmentalCategory(point.type);
  return basePost({
    id: `visit-${point.id}`,
    actor: viewerName || 'Você',
    avatar: '📍',
    time: 'agora',
    caption: `Marcado no mapa: ${point.name}. Categoria ${ENVIRONMENTAL_CATEGORY_LABELS[category]} em Londrina.`,
    hashtags: ['#Londrina', `#${compactHash(ENVIRONMENTAL_CATEGORY_LABELS[category])}`],
    imageKey: imageForMapType(point.type),
    source: 'official',
    sourceLabel: point.sourceName ?? 'Snapshot oficial de Londrina',
    sourceUrl: point.sourceUrl,
  });
}

function realStarterPosts(): CommunityFeedPost[] {
  const points = MAP_POINTS.slice(0, 4).map((point) => {
    const category = mapPointTypeToEnvironmentalCategory(point.type);
    return basePost({
      id: `official-point-${point.id}`,
      actor: 'EcoPulse Londrina',
      avatar: '🧭',
      time: 'snapshot',
      caption: `${point.name}: ponto real/curado para ${ENVIRONMENTAL_CATEGORY_LABELS[category].toLowerCase()} com fonte rastreável.`,
      hashtags: ['#Londrina', `#${compactHash(ENVIRONMENTAL_CATEGORY_LABELS[category])}`],
      imageKey: imageForMapType(point.type),
      source: 'official',
      sourceLabel: point.sourceName ?? 'Snapshot oficial de Londrina',
      sourceUrl: point.sourceUrl,
    });
  });

  const products = PRODUCTS.slice(0, 3).map((product) =>
    basePost({
      id: `official-product-${product.id}`,
      actor: 'Open Food Facts',
      avatar: '🔎',
      time: 'snapshot',
      caption: `${product.name} (${product.brand}) está no catálogo real com score ${product.score} e ${product.confidence ?? 0}% de confiança.`,
      hashtags: ['#OpenFoodFacts', `#Score${product.score}`, `#${compactHash(product.category)}`],
      imageKey: imageForCategory(product.category),
      source: 'cache',
      sourceLabel: product.sourceName ?? 'Open Food Facts snapshot',
      sourceUrl: product.sourceUrl,
    }),
  );

  return [...points, ...products];
}

function basePost(input: {
  id: string;
  actor: string;
  avatar: string;
  time: string;
  caption: string;
  hashtags: string[];
  imageKey: string;
  source: DataSource;
  sourceLabel: string;
  sourceUrl?: string;
}): CommunityFeedPost {
  return {
    id: input.id,
    user: { name: input.actor, avatar: input.avatar, level: 1 },
    time: input.time,
    caption: input.caption,
    hashtags: input.hashtags,
    likes: 0,
    comments: 0,
    liked: false,
    imageKey: input.imageKey,
    commentList: [],
    commentCount: 0,
    viewerLiked: false,
    effectiveLikes: 0,
    viewerPromised: false,
    source: input.source,
    sourceLabel: input.sourceLabel,
    sourceUrl: input.sourceUrl,
  };
}

function applyViewerState(
  posts: CommunityFeedPost[],
  likedPostIds: readonly string[],
  promisedPostIds: readonly string[],
  commentCounts: Readonly<Record<string, number>> = {},
): CommunityFeedPost[] {
  const liked = new Set(likedPostIds);
  const promised = new Set(promisedPostIds);
  return posts.map((post) => ({
    ...post,
    comments: commentCounts[post.id] ?? post.comments,
    commentCount: commentCounts[post.id] ?? post.commentCount,
    viewerLiked: liked.has(post.id),
    effectiveLikes: post.likes + (liked.has(post.id) ? 1 : 0),
    viewerPromised: promised.has(post.id),
  }));
}

function imageForMapType(type: string): string {
  if (type === 'baterias' || type === 'eletronicos') return 'recyclingBins';
  if (type === 'oleo' || type === 'granel') return 'bulkShopping';
  if (type === 'trocas') return 'vintageFashion';
  if (type === 'reparo') return 'repairCafe';
  return 'recyclingBins';
}

function imageForCategory(category: string): string {
  const key = category.toLowerCase();
  if (key.includes('bebida')) return 'reusableBags';
  if (key.includes('latic')) return 'freshProduce';
  if (key.includes('snack')) return 'bulkShopping';
  if (key.includes('óleo') || key.includes('gordura')) return 'bulkShopping';
  if (key.includes('padaria')) return 'freshProduce';
  return 'reusableBags';
}

function compactHash(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '')
    .slice(0, 24);
}

function relativeTime(value: string): string {
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return 'agora';
  const minutes = Math.max(0, Math.round((Date.now() - timestamp) / 60000));
  if (minutes < 2) return 'agora';
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  return `${days}d`;
}
