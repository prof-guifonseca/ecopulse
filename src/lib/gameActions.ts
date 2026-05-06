import { useUserStore } from '@/store/userStore';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { BADGES } from '@/data';
import { hapticSuccess, hapticTap } from '@/lib/haptic';
import { checkSkinUnlocks } from '@/lib/skinUnlocks';
import { pendingAutoBadges, type GameSnapshot } from '@/lib/game/rules';

function snapshotForBadges(): GameSnapshot {
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
 * Awards tokens + XP in one atomic action, handles level-up toasts,
 * confetti, threshold-based badge auto-unlock, and skin progression checks.
 */
export function awardTokens(amount: number) {
  const user = useUserStore.getState();
  user.addTokens(amount);
  const { leveled, newLevel } = user.addXp(amount);
  const ui = useUIStore.getState();
  hapticTap();

  if (leveled) {
    ui.showToast(`🎉 Nível ${newLevel} desbloqueado`, 'reward');
    ui.fireConfetti();
    hapticSuccess();
  }

  // Threshold-based badge auto-unlocks (token-100, tree-grown, …) come
  // from a pure rules module so they're trivially testable and reusable.
  for (const id of pendingAutoBadges(snapshotForBadges())) {
    unlockBadge(id);
  }

  // Re-evaluate SkinPack progression (level / count metrics may have moved).
  checkSkinUnlocks();
}

export function unlockBadge(id: string) {
  const game = useGameStore.getState();
  const ui = useUIStore.getState();
  if (game.unlockBadge(id)) {
    const b = BADGES.find((x) => x.id === id);
    if (b) ui.showToast(`Conquista: ${b.name}`, 'reward');
    ui.fireConfetti();
    hapticSuccess();
    // A new badge may satisfy a SkinPack unlock criterion.
    checkSkinUnlocks();
  }
}
