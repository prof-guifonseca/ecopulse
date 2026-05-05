import { BADGES, SKIN_PACKS } from '@/data';
import { useUserStore } from '@/store/userStore';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { hapticSuccess } from '@/lib/haptic';
import { pendingSkinUnlocks, type GameSnapshot } from '@/lib/game/rules';
import type { SkinPack } from '@/types';

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
    scannedProductsCount: game.scannedProducts.length,
    visitedPointsCount: game.visitedPoints.length,
    completedChallengesCount: game.completedChallenges.length,
    completedTutorialsCount: game.completedTutorials.length,
  };
}

/**
 * Walk the SkinPack catalog; auto-unlock anything whose progression criterion
 * is now met (per pure rules). Fires a toast + haptic per newly-unlocked skin.
 *
 * Called after every gameplay action that could move progress forward
 * (awardTokens, unlockBadge, addScannedProduct, etc.).
 */
export function checkSkinUnlocks(): string[] {
  const user = useUserStore.getState();
  const ui = useUIStore.getState();
  const candidates = pendingSkinUnlocks(SKIN_PACKS, snapshotForRules());
  const newlyUnlocked: string[] = [];

  for (const skin of candidates) {
    if (user.unlockSkinPack(skin.id)) {
      newlyUnlocked.push(skin.id);
      ui.showToast(`Skin desbloqueada: ${skin.name}`, 'reward');
    }
  }

  if (newlyUnlocked.length > 0) {
    hapticSuccess();
    ui.fireConfetti();
  }

  return newlyUnlocked;
}

/**
 * Buy + own a SkinPack. Returns true on success, false if already owned or
 * not enough tokens.
 */
export function buySkinPack(id: string): boolean {
  const user = useUserStore.getState();
  const skin = SKIN_PACKS.find((s) => s.id === id);
  if (!skin) return false;
  if (user.ownedSkinPacks.includes(id)) return false;
  if (!user.spendTokens(skin.priceTokens)) {
    useUIStore.getState().showToast('Eco-Tokens insuficientes', 'info');
    return false;
  }
  user.unlockSkinPack(id);
  useUIStore.getState().showToast(`Skin adquirida: ${skin.name}`, 'reward');
  useUIStore.getState().fireConfetti();
  hapticSuccess();
  return true;
}

/**
 * Human-readable progress hint for a locked skin.
 * Used by the shop and the SkinPackModal.
 */
export function unlockHint(skin: SkinPack): string {
  switch (skin.unlock.kind) {
    case 'paid':
      return `${skin.priceTokens} tokens`;
    case 'level':
      return `Nível ${skin.unlock.value}`;
    case 'badge': {
      const badgeId = skin.unlock.id;
      const found = BADGES.find((b) => b.id === badgeId);
      return `Conquista: ${found?.name ?? badgeId}`;
    }
    case 'count': {
      const labels: Record<typeof skin.unlock.metric, string> = {
        scans: 'scans',
        visits: 'visitas no mapa',
        challenges: 'desafios',
        tutorials: 'tutoriais',
      };
      return `${skin.unlock.value} ${labels[skin.unlock.metric]}`;
    }
  }
}
