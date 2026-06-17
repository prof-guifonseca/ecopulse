import { createJSONStorage, type PersistStorage } from 'zustand/middleware';
import { isRecord } from '@/lib/isRecord';

// Runs once on first boot — reads legacy `ecopulse_v2` state and
// distributes it across the new namespaced stores.

const LEGACY_KEY = 'ecopulse_v2';
const SENTINEL = 'ecopulse:migrated';

/**
 * Parse-don't-validate at the rehydration boundary (P3). Zustand persists each
 * store as a `{ state: {...}, version }` envelope; anything that doesn't match
 * (hand-edited, half-written, or a foreign key) is corrupt and discarded, so a
 * malformed shape never rehydrates into a store. Field-level drift is the job of
 * each store's versioned `migrate`, not this guard.
 */
function parsePersistedState(raw: string): string | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  return isRecord(parsed) && isRecord(parsed.state) ? raw : null;
}

function readSafeStorageItem(storage: Storage, name: string): string | null {
  const raw = storage.getItem(name);
  if (raw === null) return null;

  const valid = parsePersistedState(raw);
  if (valid === null) {
    storage.removeItem(name);

    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[ecopulse] Discarded corrupted persisted state for "${name}".`);
    }
  }

  return valid;
}

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
  lastMissionDay?: string | null;
  firstScanCompleted?: boolean;
  onboarded?: boolean;
  avatarBase?: string | null;
  avatarOutfits?: Record<string, string | null>;
  ownedOutfits?: string[];
}

export function createSafeJSONStorage<S>(
  getStorage: () => Storage = () => localStorage,
): PersistStorage<S, unknown> | undefined {
  return createJSONStorage<S>(() => {
    const storage = getStorage();

    return {
      getItem: (name) => readSafeStorageItem(storage, name),
      setItem: (name, value) => storage.setItem(name, value),
      removeItem: (name) => storage.removeItem(name),
    };
  });
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
