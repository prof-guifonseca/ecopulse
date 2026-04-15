'use client';

import { useUserStore } from '@/store/userStore';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { BADGES } from '@/data';
import { hapticSuccess, hapticTap } from '@/lib/haptic';

/**
 * Awards tokens + XP in one atomic action, handles level-up toasts,
 * confetti, and the token-100 badge auto-unlock.
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
}

export function unlockBadge(id: string) {
  const game = useGameStore.getState();
  const ui = useUIStore.getState();
  if (game.unlockBadge(id)) {
    const b = BADGES.find((x) => x.id === id);
    if (b) ui.showToast(`Conquista: ${b.name} ${b.emoji}`, 'reward');
    ui.fireConfetti();
    hapticSuccess();
  }
}
