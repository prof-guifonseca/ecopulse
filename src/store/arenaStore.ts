'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ArenaProgress, BattleResult } from '@/types';
import { createSafeJSONStorage } from './storage';

interface ArenaState extends ArenaProgress {
  recordBattle: (result: BattleResult) => void;
  setDemoProgress: (progress: ArenaProgress) => void;
}

const DEFAULT_ARENA: ArenaProgress = {
  wins: 0,
  losses: 0,
  defeatedOpponents: [],
  lastBattle: null,
  history: [],
};

export const useArenaStore = create<ArenaState>()(
  persist(
    (set) => ({
      ...DEFAULT_ARENA,

      recordBattle: (result) =>
        set((state) => {
          const won = result.outcome === 'win';
          const defeatedOpponents =
            won && !state.defeatedOpponents.includes(result.opponentId)
              ? [...state.defeatedOpponents, result.opponentId]
              : state.defeatedOpponents;

          return {
            wins: state.wins + (won ? 1 : 0),
            losses: state.losses + (result.outcome === 'loss' ? 1 : 0),
            defeatedOpponents,
            lastBattle: result,
            history: [result, ...state.history].slice(0, 8),
          };
        }),

      setDemoProgress: (progress) => set(progress),
    }),
    {
      name: 'ecopulse:arena',
      version: 1,
      storage: createSafeJSONStorage<ArenaState>(),
    }
  )
);

if (typeof window !== 'undefined') {
  useArenaStore.persist.setOptions({
    storage: createSafeJSONStorage<ArenaState>(),
  });
}
