// Runs once on first boot — reads legacy `ecopulse_v2` state and
// distributes it across the new namespaced stores.

const LEGACY_KEY = 'ecopulse_v2';
const SENTINEL = 'ecopulse:migrated';

export interface LegacyState {
  name?: string;
  avatar?: string;
  tribe?: string;
  level?: number;
  xp?: number;
  xpToNext?: number;
  tokens?: number;
  streak?: number;
  badges?: string[];
  scannedProducts?: string[];
  visitedPoints?: string[];
  ownedShopItems?: string[];
  activeChallenges?: string[];
  completedChallenges?: string[];
  completedTutorials?: string[];
  likedPosts?: string[];
  following?: string[];
  tokensToday?: number;
  dailyMissions?: { scan: boolean; likes: number; map: boolean; bonusClaimed: boolean };
  onboarded?: boolean;
  avatarBase?: string | null;
  avatarOutfits?: Record<string, string | null>;
  ownedOutfits?: string[];
  chatSentFirst?: boolean;
}

export function readLegacyState(): LegacyState | null {
  if (typeof window === 'undefined') return null;
  if (localStorage.getItem(SENTINEL)) return null;
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LegacyState;
  } catch {
    return null;
  }
}

export function markLegacyMigrated() {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SENTINEL, '1');
  localStorage.removeItem(LEGACY_KEY);
}
