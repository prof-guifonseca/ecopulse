import { BADGES, GEAR_SETS } from '@/data';
import { useUserStore } from '@/store/userStore';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { hapticSuccess } from '@/lib/haptic';
import { pendingGearSetUnlocks, type GameSnapshot } from '@/lib/game/rules';
import type { GearSet, SkinUnlock } from '@/types';

type UnlockableCatalogItem = Pick<GearSet, 'id' | 'name' | 'unlock' | 'priceTokens'>;

/**
 * Build a fresh snapshot of the bits of state the rules care about.
 * Lives here because the stores are the runtime source of truth; the
 * rules module stays pure / framework-free.
 */
function snapshotForRules(): GameSnapshot {
  const user = useUserStore.getState();
  const game = useGameStore.getState();
  return {
    level: user.level,
    tokens: user.tokens,
    badges: game.badges,
    ownedSkinPacks: user.ownedSkinPacks,
    ownedGearSets: user.ownedGearSets,
    scannedProductsCount: game.scannedProducts.length,
    visitedPointsCount: game.visitedPoints.length,
    completedChallengesCount: game.completedChallenges.length,
    completedTutorialsCount: game.completedTutorials.length,
  };
}

/**
 * Walk the GearSet catalog; auto-unlock anything whose progression criterion
 * is now met (per pure rules). Fires a toast + haptic per newly-unlocked set.
 *
 * Kept under the old module name while the app migrates away from "skins".
 */
export function checkSkinUnlocks(): string[] {
  const user = useUserStore.getState();
  const ui = useUIStore.getState();
  const candidates = pendingGearSetUnlocks(GEAR_SETS, snapshotForRules());
  const newlyUnlocked: string[] = [];

  for (const setItem of candidates) {
    if (user.unlockGearSet(setItem.id)) {
      newlyUnlocked.push(setItem.id);
      ui.showToast(`Conjunto desbloqueado: ${setItem.name}`, 'reward');
    }
  }

  if (newlyUnlocked.length > 0) {
    hapticSuccess();
    ui.fireConfetti();
  }

  return newlyUnlocked;
}

export function buyGearSet(id: string): boolean {
  const user = useUserStore.getState();
  const setItem = GEAR_SETS.find((item) => item.id === id);
  if (!setItem) return false;
  if (user.ownedGearSets.includes(id)) return false;
  if (!user.spendTokens(setItem.priceTokens)) {
    useUIStore.getState().showToast('Tokens insuficientes', 'info');
    return false;
  }
  user.unlockGearSet(id);
  useUIStore.getState().showToast(`Conjunto adquirido: ${setItem.name}`, 'reward');
  useUIStore.getState().fireConfetti();
  hapticSuccess();
  return true;
}

/**
 * Legacy wrapper for call sites that still say SkinPack.
 */
export function buySkinPack(id: string): boolean {
  return buyGearSet(id);
}

/**
 * Human-readable progress hint for a locked set/equipment pack.
 */
export function unlockHint(
  item: UnlockableCatalogItem | { unlock: SkinUnlock; priceTokens: number },
): string {
  switch (item.unlock.kind) {
    case 'paid':
      return `${item.priceTokens} tokens`;
    case 'level':
      return `Nível ${item.unlock.value}`;
    case 'badge': {
      const badgeId = item.unlock.id;
      const found = BADGES.find((b) => b.id === badgeId);
      return `Conquista: ${found?.name ?? badgeId}`;
    }
    case 'count': {
      const labels: Record<typeof item.unlock.metric, string> = {
        scans: 'scans',
        visits: 'visitas no mapa',
        challenges: 'desafios',
        tutorials: 'tutoriais',
      };
      return `${item.unlock.value} ${labels[item.unlock.metric]}`;
    }
  }
}
