'use client';

import { SKIN_PACKS } from '@/data';
import { useUserStore } from '@/store/userStore';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { hapticSuccess } from '@/lib/haptic';
import type { SkinPack } from '@/types';

/**
 * Evaluate a SkinPack's unlock criterion against current store state.
 * 'paid' is never auto-met; it requires an explicit purchase flow.
 */
function meetsUnlock(skin: SkinPack): boolean {
  const user = useUserStore.getState();
  const game = useGameStore.getState();

  switch (skin.unlock.kind) {
    case 'paid':
      return false;
    case 'level':
      return user.level >= skin.unlock.value;
    case 'badge':
      return game.badges.includes(skin.unlock.id);
    case 'count': {
      const target = skin.unlock.value;
      switch (skin.unlock.metric) {
        case 'scans':
          return game.scannedProducts.length >= target;
        case 'visits':
          return game.visitedPoints.length >= target;
        case 'challenges':
          return game.completedChallenges.length >= target;
        case 'tutorials':
          return game.completedTutorials.length >= target;
      }
      return false;
    }
  }
}

/**
 * Walk the SkinPack catalog; auto-unlock anything whose progression criterion
 * is now met. Fires a celebratory toast + haptic per newly-unlocked skin.
 *
 * Called after every gameplay action that could move progress forward
 * (awardTokens, unlockBadge, addScannedProduct, etc.).
 */
export function checkSkinUnlocks(): string[] {
  const user = useUserStore.getState();
  const ui = useUIStore.getState();
  const newlyUnlocked: string[] = [];

  for (const skin of SKIN_PACKS) {
    if (user.ownedSkinPacks.includes(skin.id)) continue;
    if (skin.unlock.kind === 'paid') continue;
    if (!meetsUnlock(skin)) continue;

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
    case 'badge':
      return `Conquiste a badge`;
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
