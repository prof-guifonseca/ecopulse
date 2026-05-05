// EcoPulse — shared TypeScript types

export type Score = 'A' | 'B' | 'C' | 'D' | 'E';
export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'epic';
export type OutfitTier = 'common' | 'rare' | 'epic';
export type OutfitSlot =
  | 'hat'
  | 'glasses'
  | 'shirt'
  | 'accessory'
  | 'background'
  | 'weapon'
  | 'hairstyle';

// ----- SkinPack (full character look) -----
export type SkinTheme = 'anime' | 'samurai' | 'ninja' | 'fantasy' | 'cyber' | 'explorer';
export type SkinTier = 'starter' | 'rare' | 'epic' | 'legendary';

export type SkinUnlock =
  | { kind: 'level'; value: number }
  | { kind: 'badge'; id: string }
  | {
      kind: 'count';
      metric: 'scans' | 'visits' | 'challenges' | 'tutorials';
      value: number;
    }
  | { kind: 'paid' };

export interface SkinPack {
  id: string;
  name: string;
  theme: SkinTheme;
  tagline: string;
  tier: SkinTier;
  /** Earnability criterion. 'paid' means the only path is buying with tokens. */
  unlock: SkinUnlock;
  /** Tokens to buy as a shortcut. Always present so impatient students can pay. */
  priceTokens: number;
  /** Identifier of the SVG component in src/components/skins/. */
  artId: string;
}
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
  /** Fictional EAN-13 starting with 789 (BR prefix). Used by the scan simulator. */
  barcode: string;
  name: string;
  brand: string;
  category: string;
  emoji: string;
  /** Optional Unsplash photo key (see src/lib/unsplash.ts) for a richer card. */
  photoKey?: string;
  /** Packaging signals consumed by lib/scoring.ts when re-deriving a score. */
  packagingTags: string[];
  /** True when the manufacturer is Brazilian — tilts the origin proxy. */
  isLocal: boolean;
  /** 1–4 NOVA group when the product is a food; null otherwise. */
  novaGroup: 1 | 2 | 3 | 4 | null;
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
  /** Bairro ou referência do endereço (ex. "Centro · R. Pernambuco, 432"). */
  address: string;
  /** Operating hours, free-form (ex. "Seg-Sáb 9h-18h"). */
  hours: string;
  /** Real-world latitude — used by the Londrina projector. */
  lat: number;
  /** Real-world longitude. */
  lng: number;
  /** "Verificado há N dias" badge for trust signal. */
  lastVerifiedDays: number;
  /** Optional phone for the detail modal. */
  phone?: string;
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

export interface Badge {
  id: string;
  name: string;
  iconName: string;
  desc: string;
  tier: BadgeTier;
}

export interface ShopItem {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  price: number;
  type: ShopItemType;
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

export interface DailyMissionsProgress {
  scan: boolean;
  likes: number;
  map: boolean;
  bonusClaimed: boolean;
}
