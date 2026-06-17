import { assertNever } from '@/lib/assertNever';
import type { GearSet, SkinPack, SkinUnlock } from '@/types';

/**
 * Read-only snapshot of the gameplay state that auto-unlock rules need.
 * Stores hand this in via getState(); tests can pass plain objects.
 */
export interface GameSnapshot {
  level: number;
  tokens: number;
  badges: string[];
  ownedSkinPacks: string[];
  ownedGearSets: string[];
  scannedProductsCount: number;
  visitedPointsCount: number;
  completedChallengesCount: number;
  completedTutorialsCount: number;
}

/**
 * Pure check: does the current snapshot satisfy this skin's unlock criterion?
 * 'paid' is intentionally never satisfied here — it requires an explicit
 * purchase flow that lives in the action layer.
 */
export function meetsSkinUnlock(unlock: SkinUnlock, snap: GameSnapshot): boolean {
  switch (unlock.kind) {
    case 'paid':
      return false;
    case 'level':
      return snap.level >= unlock.value;
    case 'badge':
      return snap.badges.includes(unlock.id);
    case 'count':
      switch (unlock.metric) {
        case 'scans':
          return snap.scannedProductsCount >= unlock.value;
        case 'visits':
          return snap.visitedPointsCount >= unlock.value;
        case 'challenges':
          return snap.completedChallengesCount >= unlock.value;
        case 'tutorials':
          return snap.completedTutorialsCount >= unlock.value;
        default:
          return assertNever(unlock.metric);
      }
    default:
      return assertNever(unlock);
  }
}

/**
 * Pure check: which catalog skins are now unlockable but not yet owned?
 */
export function pendingSkinUnlocks(catalog: SkinPack[], snap: GameSnapshot): SkinPack[] {
  return catalog.filter(
    (skin) => !snap.ownedSkinPacks.includes(skin.id) && meetsSkinUnlock(skin.unlock, snap)
  );
}

export function pendingGearSetUnlocks(catalog: GearSet[], snap: GameSnapshot): GearSet[] {
  return catalog.filter(
    (set) => !snap.ownedGearSets.includes(set.id) && meetsSkinUnlock(set.unlock, snap)
  );
}

/**
 * Pure check: which auto-unlock badges should fire given the current snapshot?
 * Returns the badge ids that meet a threshold and aren't yet owned.
 */
export function pendingAutoBadges(snap: GameSnapshot): string[] {
  const out: string[] = [];
  if (snap.tokens >= 100 && !snap.badges.includes('token-100')) out.push('token-100');
  if (snap.level >= 8 && !snap.badges.includes('tree-grown')) out.push('tree-grown');
  return out;
}
