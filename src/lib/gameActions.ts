'use client';

import { useUserStore } from '@/store/userStore';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { BADGES } from '@/data';
import { hapticSuccess, hapticTap } from '@/lib/haptic';
import { checkSkinUnlocks } from '@/lib/skinUnlocks';

/**
 * Awards tokens + XP in one atomic action, handles level-up toasts,
 * confetti, the token-100 badge auto-unlock, and skin progression checks.
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

  // Auto-unlock token-100 badge
  const { tokens } = useUserStore.getState();
  const game = useGameStore.getState();
  if (tokens >= 100 && !game.badges.includes('token-100')) {
    unlockBadge('token-100');
  }
  // Auto-unlock tree-grown at level >= 8
  const { level } = useUserStore.getState();
  if (level >= 8 && !useGameStore.getState().badges.includes('tree-grown')) {
    unlockBadge('tree-grown');
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
