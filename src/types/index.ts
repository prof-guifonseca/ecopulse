// EcoPulse — shared TypeScript types

export * from './ids';

/** Canonical eco-score scale, best (A) → worst (E). Single source of truth. */
export const SCORES = ['A', 'B', 'C', 'D', 'E'] as const;
export type Score = (typeof SCORES)[number];

/** Boundary guard: narrows untrusted input to a valid {@link Score}. */
export function isScore(value: unknown): value is Score {
  return typeof value === 'string' && (SCORES as readonly string[]).includes(value);
}
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
export type GearSlot =
  | 'hair'
  | 'head'
  | 'face'
  | 'torso'
  | 'legs'
  | 'feet'
  | 'back'
  | 'mainHand'
  | 'offHand'
  | 'aura';

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
  /** Optional Arena stat bonuses. */
  battleStats?: Partial<BattleStats>;
}

// ----- Gear (wearable avatar equipment) -----
export type GearTier = 'common' | 'rare' | 'epic' | 'legendary';
export type GearTheme = SkinTheme | 'utility' | 'nature';
export type AvatarPose = 'idle' | 'builder' | 'battleReady' | 'attack' | 'defend' | 'focus' | 'victory' | 'defeat';
export type GearHandPose = 'relaxed' | 'weapon' | 'staff' | 'shield' | 'object';
export type GearFxLevel = 0 | 1 | 2 | 3;

export interface GearItem {
  id: string;
  name: string;
  slot: GearSlot;
  tier: GearTier;
  priceTokens: number;
  unlock: SkinUnlock;
  battleStats: Partial<BattleStats>;
  visualKey: string;
  visualLayerId: string;
  paletteId?: string;
  variant?: string;
  hidesHair?: boolean;
  hidesFace?: boolean;
  handPose?: GearHandPose;
  fxLevel?: GearFxLevel;
  setId?: string;
  emoji: string;
  tags: string[];
}

export interface GearSet {
  id: string;
  name: string;
  theme: GearTheme;
  tagline: string;
  tier: GearTier;
  unlock: SkinUnlock;
  priceTokens: number;
  itemIds: string[];
  defaultLoadout: Partial<Record<GearSlot, string>>;
  requiredItemIds: string[];
  setBonusStats: Partial<BattleStats>;
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
  /** Real barcode from Open Food Facts or a controlled demo/test fixture. */
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
  sourceName?: string;
  sourceUrl?: string;
  sourceUpdatedAt?: string;
  confidence?: number;
  evidence?: {
    packagingTags: string[];
    countriesTags: string[];
    novaGroup: 1 | 2 | 3 | 4 | null;
    ecoscoreGrade: string | null;
    image: boolean;
    fields: string[];
  };
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
  website?: string;
  sourceName?: string;
  sourceUrl?: string;
  sourceUpdatedAt?: string;
  geocodeConfidence?: number;
  confidence?: number;
  tags?: Record<string, string>;
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
  /** Curated local community image key (see src/data/communityFeedImages.ts). */
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
  /** Optional Arena stat bonuses. */
  battleStats?: Partial<BattleStats>;
}

export type AvatarOutfits = Partial<Record<OutfitSlot, string | null>>;

export interface AvatarLoadout {
  baseId: string | null;
  equippedGear: Partial<Record<GearSlot, string | null>>;
  activeSetId?: string | null;
}

export interface DailyMissionsProgress {
  scan: boolean;
  likes: number;
  map: boolean;
  bonusClaimed: boolean;
}

// ----- Arena / simulated battles -----
export interface BattleStats {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  focus: number;
}

export type OpponentArchetype = 'balanced' | 'aggressive' | 'defensive' | 'focus' | 'trickster';
export type ArenaStageTheme = 'solar' | 'workshop' | 'circuit' | 'ginga' | 'forest';

export interface BattleFighter {
  id: string;
  name: string;
  title: string;
  level: number;
  stats: BattleStats;
  energy?: number;
  loadout?: AvatarLoadout;
  archetype?: OpponentArchetype;
  arenaXpReward?: number;
  skinPackId?: string | null;
  avatarBase?: string | null;
  avatarOutfits?: AvatarOutfits;
}

export type BattleAction = 'attack' | 'defend' | 'focus';
export type BattleSessionStatus = 'active' | 'finished';
export type BattleOutcome = 'win' | 'loss' | 'draw';

export interface BattleCommand {
  round: number;
  actorId: string;
  action: BattleAction;
  source: 'player' | 'opponent';
}

export interface BattleEffect {
  type: 'damage' | 'guard' | 'focus' | 'energy' | 'critical' | 'special' | 'finish';
  actorId: string | null;
  targetId?: string | null;
  amount?: number;
}

export type BattleEventType =
  | 'start'
  | 'initiative'
  | 'attack'
  | 'defend'
  | 'focus'
  | 'block'
  | 'critical'
  | 'special'
  | 'finish';

export interface BattleEvent {
  id: string;
  round: number;
  type: BattleEventType;
  actorId: string | null;
  targetId: string | null;
  message: string;
  action?: BattleAction;
  effects?: BattleEffect[];
  damage: number;
  playerHp: number;
  opponentHp: number;
  playerEnergy: number;
  opponentEnergy: number;
}

export interface BattleRoundState {
  round: number;
  playerAction: BattleAction;
  opponentAction: BattleAction;
  playerHp: number;
  opponentHp: number;
  playerEnergy: number;
  opponentEnergy: number;
  playerGuard: number;
  opponentGuard: number;
  playerFocus: number;
  opponentFocus: number;
  events: BattleEvent[];
  finished: boolean;
  winnerId: string | null;
}

export interface BattleSession {
  id: string;
  opponentId: string;
  seed: string;
  startedAt: string;
  playedAt?: string;
  status: BattleSessionStatus;
  player: BattleFighter;
  opponent: BattleFighter;
  round: number;
  maxRounds: number;
  rngCursor: number;
  playerHp: number;
  opponentHp: number;
  playerEnergy: number;
  opponentEnergy: number;
  playerGuard: number;
  opponentGuard: number;
  playerFocus: number;
  opponentFocus: number;
  winnerId: string | null;
  outcome: BattleOutcome | null;
  events: BattleEvent[];
  rounds: BattleRoundState[];
}

export interface BattleResult {
  id: string;
  opponentId: string;
  seed: string;
  playedAt: string;
  player: BattleFighter;
  opponent: BattleFighter;
  winnerId: string | null;
  outcome: BattleOutcome;
  rounds: number;
  events: BattleEvent[];
  finalHp: {
    player: number;
    opponent: number;
  };
  finalEnergy: {
    player: number;
    opponent: number;
  };
}

export interface ArenaOpponent {
  id: string;
  name: string;
  title: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  quote: string;
  introLine: string;
  victoryLine: string;
  defeatLine: string;
  archetype: OpponentArchetype;
  arenaXpReward: number;
  stageTheme: ArenaStageTheme;
  order: number;
  level: number;
  loadout: AvatarLoadout;
  skinPackId?: string;
  stats: BattleStats;
}

export interface ArenaRivalMastery {
  wins: number;
  losses: number;
  draws: number;
  firstDefeatedAt?: string;
  lastOutcome?: BattleOutcome;
}

export interface ArenaProgress {
  wins: number;
  losses: number;
  defeatedOpponents: string[];
  lastBattle: BattleResult | null;
  history: BattleResult[];
  arenaXp: number;
  arenaLevel: number;
  winStreak: number;
  bestStreak: number;
  rivalMastery: Record<string, ArenaRivalMastery>;
}
