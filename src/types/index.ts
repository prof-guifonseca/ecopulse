// EcoPulse — shared TypeScript types

export type Score = 'A' | 'B' | 'C' | 'D' | 'E';
export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'epic';
export type OutfitTier = 'common' | 'rare' | 'epic';
export type OutfitSlot = 'hat' | 'glasses' | 'shirt' | 'accessory' | 'background';
export type ChallengeType = 'individual' | 'cooperativo';
export type ShopItemType = 'garden' | 'frame' | 'boost' | 'donation';
export type MapPointType =
  | 'baterias'
  | 'eletronicos'
  | 'oleo'
  | 'trocas'
  | 'granel'
  | 'reparo';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  emoji: string;
  score: Score;
  breakdown: {
    carbono: number;
    embalagem: number;
    reciclabilidade: number;
    origem: number;
  };
  tip: string;
}

export interface MapPoint {
  id: string;
  name: string;
  type: MapPointType;
  address: string;
  hours: string;
  distance: string;
  x: number;
  y: number;
}

export interface Tutorial {
  id: string;
  title: string;
  difficulty: 1 | 2 | 3;
  time: string;
  materials: string[];
  steps: string[];
  tokens: number;
  emoji: string;
  gradient: string;
}

export interface Challenge {
  id: string;
  title: string;
  type: ChallengeType;
  duration: number;
  tokens: number;
  participants: number;
  iconName: string;
}

export interface FeedComment {
  user: string;
  avatar: string;
  text: string;
  time: string;
}

export interface FeedPost {
  id: string;
  user: { name: string; avatar: string; level: number };
  time: string;
  caption: string;
  hashtags: string[];
  likes: number;
  comments: number;
  liked: boolean;
  /** Curated Unsplash photo key (see src/lib/unsplash.ts) */
  imageKey: string;
  commentList: FeedComment[];
}

export interface StoryPoll {
  q: string;
  opts: string[];
  pcts: number[];
}

export interface Story {
  user: string;
  avatar: string;
  text: string;
  /** Curated Unsplash photo key for full-bleed background */
  imageKey: string;
  poll?: StoryPoll;
}

export interface Badge {
  id: string;
  name: string;
  iconName: string;
  desc: string;
  tier: BadgeTier;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  xp: number;
  tribe: string;
}

export interface Tribe {
  id: string;
  name: string;
  iconName: string;
  members: number;
  weeklyXP: number;
  rank: number;
}

export interface ShopItem {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  price: number;
  type: ShopItemType;
}

export interface TokenPack {
  id: string;
  lookupKey: string;
  name: string;
  description: string;
  tokens: number;
  priceInCents: number;
  currency: 'BRL';
  fundSharePercent: number;
  fundShareInCents: number;
  badge: string;
  featured?: boolean;
}

export interface ImpactFundSnapshot {
  totalRaisedInCents: number;
  totalCommittedInCents: number;
  supportedOrgs: number;
  coveredSdgs: number;
  lastTransferAt: string;
  verificationNote: string;
}

export interface EcoEvent {
  id: string;
  title: string;
  day: string;
  month: string;
  time: string;
  rsvp: number;
  emoji: string;
}

export interface DailyMission {
  id: string;
  title: string;
  reward: number;
  check: 'scan' | 'likes' | 'map';
  target?: number;
  iconName: string;
}

export interface AvatarBase {
  id: string;
  name: string;
  color: string;
  skin: string;
  hair: string;
}

export interface AvatarOutfit {
  id: string;
  name: string;
  slot: OutfitSlot;
  price: number;
  emoji: string;
  tier: OutfitTier;
}

export type AvatarOutfits = Partial<Record<OutfitSlot, string | null>>;

export interface ChatMessage {
  from: string;
  text: string;
  time: string;
  sent: boolean;
}

export interface ChatConversation {
  id: string;
  with: { name: string; avatar: string; level: number };
  lastMsg: string;
  lastTime: string;
  unread: number;
  messages: ChatMessage[];
}

export interface DailyMissionsProgress {
  scan: boolean;
  likes: number;
  map: boolean;
  bonusClaimed: boolean;
}
