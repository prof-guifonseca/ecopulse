import type { EnvironmentalPoint } from '@/lib/esg';
import type { Score } from '@/types';

export type DataSource = 'user' | 'provider' | 'cache' | 'official' | 'simulation' | 'demo';

export interface EcoPulseUserProfile {
  id: string;
  name: string;
  tribe: string;
  regionId: string;
  onboardedAt?: string;
  source: DataSource;
}

export type EcoPulseEventType =
  | 'onboarded'
  | 'scan_completed'
  | 'product_lookup_completed'
  | 'map_visit_marked'
  | 'esg_point_verified'
  | 'post_liked'
  | 'promise_created'
  | 'community_reaction_recorded'
  | 'daily_bonus_claimed'
  | 'battle_completed'
  | 'impact_recorded';

export interface EcoPulseEventPayloads {
  onboarded: {
    name: string;
    tribe: string;
    regionId: string;
  };
  scan_completed: {
    productId: string;
    barcode?: string;
    score: Score;
    source: DataSource | 'barcode' | 'manual' | 'scan-action' | 'scanner' | 'first-run' | 'simulator';
  };
  product_lookup_completed: {
    barcode: string;
    provider: string;
    found: boolean;
    source: DataSource;
    score?: Score;
  };
  map_visit_marked: {
    pointId: string;
    source: EnvironmentalPoint['source'];
    category: EnvironmentalPoint['category'];
    lat: number;
    lng: number;
    confidence: number;
  };
  esg_point_verified: {
    pointId: string;
    status: 'visited' | 'closed' | 'incorrect' | 'suggested';
    note?: string;
  };
  post_liked: {
    postId: string;
  };
  promise_created: {
    postId: string;
  };
  community_reaction_recorded: {
    postId: string;
    reaction: 'like' | 'promise';
    active: boolean;
  };
  daily_bonus_claimed: {
    day: string;
  };
  battle_completed: {
    battleId: string;
    outcome: 'win' | 'loss' | 'draw';
  };
  impact_recorded: {
    metric: ImpactEntry['metric'];
    value: number;
    unit: ImpactEntry['unit'];
    confidence: ImpactEntry['confidence'];
  };
}

export type EcoPulseEventPayload =
  EcoPulseEventPayloads[keyof EcoPulseEventPayloads];

export interface EcoPulseEvent<TType extends EcoPulseEventType = EcoPulseEventType> {
  id: string;
  type: TType;
  userId: string;
  at: string;
  day: string;
  source: DataSource;
  payload: EcoPulseEventPayloads[TType];
}

export interface ProductLookupResult {
  id: string;
  barcode: string;
  found: boolean;
  source: DataSource;
  provider: 'openfoodfacts' | 'local-catalog' | 'manual';
  name: string;
  brand: string;
  category: string;
  emoji: string;
  score: Score;
  breakdown: Record<string, number>;
  tip: string;
  rationale: string[];
  confidence: number;
  evidence: {
    packagingTags: string[];
    countriesTags: string[];
    novaGroup: 1 | 2 | 3 | 4 | null;
    ecoscoreGrade: string | null;
    image: boolean;
    fields: string[];
  };
  sourceUrl?: string;
  lastFetchedAt: string;
  catalogProductId?: string;
  imageUrl?: string;
  checkedAt: string;
}

export interface ScanResult {
  id: string;
  barcode: string;
  productId: string;
  score: Score;
  source: DataSource | 'barcode' | 'manual';
  lookup: ProductLookupResult;
  scannedAt: string;
}

export interface CommunityFeedItem {
  id: string;
  actorName: string;
  actorAvatar: string;
  caption: string;
  imageKey: string;
  createdAt: string;
  likes: number;
  comments: number;
  commentCount: number;
  viewerLiked: boolean;
  viewerPromised: boolean;
  source: DataSource;
  sourceLabel: string;
  sourceUrl?: string;
}

export interface CommunityComment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  createdAt: string;
  source: DataSource;
}

export interface ImpactEntry {
  id: string;
  metric: 'co2_kg' | 'waste_kg' | 'water_l' | 'batteries_kg' | 'oil_l' | 'repairs' | 'exchanges' | 'trees';
  value: number;
  unit: 'kg' | 'l' | 'count';
  confidence: 'estimated' | 'verified';
  sourceEventId?: string;
  createdAt: string;
  methodology: string;
}
