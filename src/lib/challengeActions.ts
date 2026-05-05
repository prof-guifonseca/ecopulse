'use client';

import type { Challenge } from '@/types';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { awardTokens, unlockBadge } from './gameActions';

/**
 * Drives the featured-challenge CTA: joins it on first tap, advances on
 * subsequent taps, and finalises (tokens + confetti + badge) when the
 * required duration is reached.
 */
export function runChallenge(challenge: Challenge) {
  const game = useGameStore.getState();
  const ui = useUIStore.getState();

  if (game.completedChallenges.includes(challenge.id)) return;

  if (!game.activeChallenges.includes(challenge.id)) {
    game.joinChallenge(challenge.id);
    ui.showToast(`Desafio aceito! ${challenge.title}`, 'info');
    return;
  }

  const finished = game.advanceChallenge(challenge.id, challenge.duration);
  awardTokens(5);
  ui.showToast('+5 Eco-Tokens', 'reward');

  if (finished) {
    game.completeChallenge(challenge.id);
    awardTokens(challenge.tokens);
    ui.showToast(`Desafio completo! +${challenge.tokens} tokens`, 'reward');
    ui.fireConfetti();
    const total = useGameStore.getState().completedChallenges.length;
    if (total === 1) unlockBadge('challenge-1');
  }
}
