'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ArenaProgress, BattleResult } from '@/types';
import { applyArenaBattleProgress, arenaLevelFromXp } from '@/lib/arena/progress';
import { createSafeJSONStorage } from './storage';

interface ArenaState extends ArenaProgress {
  recordBattle: (result: BattleResult, loadoutMultiplier?: number) => void;
  setDemoProgress: (progress: ArenaProgress) => void;
}

const DEFAULT_ARENA: ArenaProgress = {
  wins: 0,
  losses: 0,
  defeatedOpponents: [],
  lastBattle: null,
  history: [],
  arenaXp: 0,
  arenaLevel: 1,
  winStreak: 0,
  bestStreak: 0,
  rivalMastery: {},
};

export function migrateArenaStateToV2(state: Partial<ArenaProgress> | undefined): ArenaProgress {
  const prev = { ...DEFAULT_ARENA, ...(state ?? {}) };
  return {
    ...prev,
    defeatedOpponents: prev.defeatedOpponents ?? [],
    history: prev.history ?? [],
    arenaXp: prev.arenaXp ?? 0,
    arenaLevel: prev.arenaLevel ?? arenaLevelFromXp(prev.arenaXp ?? 0),
    winStreak: prev.winStreak ?? 0,
    bestStreak: prev.bestStreak ?? 0,
    rivalMastery: prev.rivalMastery ?? {},
  };
}

export const useArenaStore = create<ArenaState>()(
  persist(
    (set) => ({
      ...DEFAULT_ARENA,

      recordBattle: (result, loadoutMultiplier) =>
        set((state) =>
          applyArenaBattleProgress(state, result, { loadoutMultiplier: loadoutMultiplier ?? 1 })
        ),

      setDemoProgress: (progress) => set(progress),
    }),
    {
      name: 'ecopulse:arena',
      version: 2,
      storage: createSafeJSONStorage<ArenaProgress>(),
      migrate: (state) => migrateArenaStateToV2(state as Partial<ArenaProgress>),
    }
  )
);

if (typeof window !== 'undefined') {
  useArenaStore.persist.setOptions({
    storage: createSafeJSONStorage<ArenaProgress>(),
  });
}
