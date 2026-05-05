'use client';

import type { Product } from '@/types';
import { PRODUCTS } from '@/data';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { awardTokens, unlockBadge } from './gameActions';

/**
 * Picks a product (preferring unscanned), records it, awards tokens,
 * ticks the daily-scan mission, and unlocks scanner milestone badges.
 * Returns the chosen product so the caller can open its detail modal.
 */
export function performScan(): Product {
  const game = useGameStore.getState();
  const ui = useUIStore.getState();

  const pool = PRODUCTS.filter((p) => !game.scannedProducts.includes(p.id));
  const source = pool.length ? pool : PRODUCTS;
  const chosen = source[Math.floor(Math.random() * source.length)];

  game.addScannedProduct(chosen.id);
  awardTokens(10);

  if (!game.dailyMissions.scan) {
    game.markMission('scan', true);
    ui.showToast('Missão diária: scan', 'success');
  }

  const newCount = game.scannedProducts.length + 1;
  if (newCount === 1) unlockBadge('first-scan');
  if (newCount >= 5) unlockBadge('scanner-5');

  ui.showToast(`+10 tokens · ${chosen.name}`, 'reward');
  ui.fireConfetti();

  return chosen;
}
