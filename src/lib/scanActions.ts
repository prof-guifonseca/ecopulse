'use client';

import type { Product } from '@/types';
import { getMissionTemplate } from '@/data';
import { scanMeetsTemplate } from '@/data/missionPool';
import type { TribeId } from '@/data/tribes';
import { useGameStore } from '@/store/gameStore';
import { useSimulationStore } from '@/store/simulationStore';
import { useUIStore } from '@/store/uiStore';
import { useUserStore } from '@/store/userStore';
import { getProductCatalog, pickNextProduct } from '@/simulation';
import { tokensFromScan } from './ecoMultiplier';
import { awardTokens, unlockBadge } from './gameActions';

const BASE_TOKENS = 10;

/**
 * Picks a product (preferring unscanned), records it, awards eco-multiplied
 * tokens, ticks the daily-scan mission *only when the day's template is
 * satisfied*, and unlocks scanner milestone badges. Returns the chosen
 * product so the caller can open its detail modal.
 */
export function performScan(): Product {
  const game = useGameStore.getState();
  const ui = useUIStore.getState();
  const user = useUserStore.getState();
  const simulation = useSimulationStore.getState();
  const cursor = simulation.nextCursor();

  const todaysScanTemplateId = game.todaysMissionIds.find((id) => {
    const tpl = getMissionTemplate(id);
    return tpl?.slot === 'scan';
  });
  const scanTemplate = getMissionTemplate(todaysScanTemplateId);
  const chosen = pickNextProduct(
    {
      seed: simulation.config?.seed ?? 'ecopulse-local',
      cursor,
      recentlyScannedIds: game.scannedProducts,
      minScore: scanTemplate?.filter?.minScore ?? null,
    },
    getProductCatalog()
  );

  game.addScannedProduct(chosen.id);
  game.setLastScanScore(chosen.score);
  simulation.recordEvent({
    type: 'scan_completed',
    payload: {
      productId: chosen.id,
      score: chosen.score,
      source: 'scan-action',
    },
  });

  const tokens = tokensFromScan(BASE_TOKENS, chosen.score, {
    doctrines: user.adoptedDoctrines,
    streak: user.streak,
  });
  awardTokens(tokens);

  // Mark the daily scan mission only when the template's filter (if any) is
  // satisfied. The pool is the source of truth when populated; legacy installs
  // fall back to the unfiltered behavior.
  const eligible = scanTemplate ? scanMeetsTemplate(scanTemplate, chosen.score) : true;

  if (eligible && !game.dailyMissions.scan) {
    game.markMission('scan', true);
    ui.showToast('Missão diária: scan', 'success');
  }

  const newCount = game.scannedProducts.length + 1;
  if (newCount === 1) unlockBadge('first-scan');
  if (newCount >= 5) unlockBadge('scanner-5');

  // Score-aware reward toast.
  const star = chosen.score === 'A' ? '⭐ A · ' : '';
  const tail =
    chosen.score === 'D' || chosen.score === 'E' ? ` · alternativa A no mapa?` : '';
  ui.showToast(`+${tokens} tokens · ${star}${chosen.name}${tail}`, 'reward');
  ui.fireConfetti();

  return chosen;
}

/**
 * Convenience for components that already know the user's tribe — re-export
 * so callers don't pull tribes data twice.
 */
export type { TribeId };
