'use client';

import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { awardTokens } from './gameActions';
import { hapticSuccess } from './haptic';

export function missionChecks() {
  const dm = useGameStore.getState().dailyMissions;
  return {
    dm1: dm.scan,
    dm2: dm.likes >= 2,
    dm3: dm.map,
  };
}

export function tryClaimDailyBonus() {
  const dm = useGameStore.getState().dailyMissions;
  const checks = missionChecks();
  const done = Object.values(checks).filter(Boolean).length;
  if (done === 3 && !dm.bonusClaimed) {
    useGameStore.getState().claimBonus();
    awardTokens(25);
    useUIStore.getState().showToast('Bônus diário! +25 Eco-Tokens 🎁', 'reward');
    useUIStore.getState().fireConfetti();
    hapticSuccess();
  }
}
