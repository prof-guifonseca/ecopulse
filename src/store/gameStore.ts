'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { DailyMissionsProgress } from '@/types';
import { readLegacyState } from './storage';

interface GameState {
  scannedProducts: string[];
  visitedPoints: string[];
  ownedShopItems: string[];
  activeChallenges: string[];
  completedChallenges: string[];
  challengeProgress: Record<string, number>;
  completedTutorials: string[];
  badges: string[];
  dailyMissions: DailyMissionsProgress;

  addScannedProduct: (id: string) => void;
  addVisitedPoint: (id: string) => void;
  addOwnedShopItem: (id: string) => void;
  joinChallenge: (id: string) => void;
  advanceChallenge: (id: string, duration: number) => boolean;
  completeChallenge: (id: string) => void;
  completeTutorial: (id: string) => void;
  unlockBadge: (id: string) => boolean;
  markMission: (key: keyof DailyMissionsProgress, value: DailyMissionsProgress[keyof DailyMissionsProgress]) => void;
  incrementLikeMission: () => void;
  claimBonus: () => void;
}

const DEFAULT_GAME = {
  scannedProducts: ['p1', 'p3'],
  visitedPoints: [] as string[],
  ownedShopItems: [] as string[],
  activeChallenges: ['c1', 'c3'],
  completedChallenges: [] as string[],
  challengeProgress: { c1: 3, c3: 2 } as Record<string, number>,
  completedTutorials: [] as string[],
  badges: ['first-scan', 'upcycler-1', 'week-streak'],
  dailyMissions: { scan: false, likes: 0, map: false, bonusClaimed: false } as DailyMissionsProgress,
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_GAME,

      addScannedProduct: (id) =>
        set((s) =>
          s.scannedProducts.includes(id) ? s : { scannedProducts: [...s.scannedProducts, id] }
        ),

      addVisitedPoint: (id) =>
        set((s) =>
          s.visitedPoints.includes(id) ? s : { visitedPoints: [...s.visitedPoints, id] }
        ),

      addOwnedShopItem: (id) =>
        set((s) =>
          s.ownedShopItems.includes(id) ? s : { ownedShopItems: [...s.ownedShopItems, id] }
        ),

      joinChallenge: (id) =>
        set((s) =>
          s.activeChallenges.includes(id) ? s : { activeChallenges: [...s.activeChallenges, id] }
        ),

      advanceChallenge: (id, duration) => {
        const cur = get().challengeProgress[id] ?? 0;
        const next = Math.min(cur + 1, duration);
        set((s) => ({ challengeProgress: { ...s.challengeProgress, [id]: next } }));
        return next >= duration;
      },

      completeChallenge: (id) =>
        set((s) => ({
          completedChallenges: s.completedChallenges.includes(id)
            ? s.completedChallenges
            : [...s.completedChallenges, id],
          activeChallenges: s.activeChallenges.filter((x) => x !== id),
        })),

      completeTutorial: (id) =>
        set((s) =>
          s.completedTutorials.includes(id) ? s : { completedTutorials: [...s.completedTutorials, id] }
        ),

      unlockBadge: (id) => {
        if (get().badges.includes(id)) return false;
        set((s) => ({ badges: [...s.badges, id] }));
        return true;
      },

      markMission: (key, value) =>
        set((s) => ({ dailyMissions: { ...s.dailyMissions, [key]: value } })),

      incrementLikeMission: () =>
        set((s) => ({ dailyMissions: { ...s.dailyMissions, likes: s.dailyMissions.likes + 1 } })),

      claimBonus: () =>
        set((s) => ({ dailyMissions: { ...s.dailyMissions, bonusClaimed: true } })),
    }),
    {
      name: 'ecopulse:game',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      migrate: (state) => {
        const legacy = readLegacyState();
        if (legacy) {
          return {
            ...(state as GameState),
            scannedProducts: legacy.scannedProducts ?? DEFAULT_GAME.scannedProducts,
            visitedPoints: legacy.visitedPoints ?? [],
            ownedShopItems: legacy.ownedShopItems ?? [],
            activeChallenges: legacy.activeChallenges ?? DEFAULT_GAME.activeChallenges,
            completedChallenges: legacy.completedChallenges ?? [],
            challengeProgress: DEFAULT_GAME.challengeProgress,
            completedTutorials: legacy.completedTutorials ?? [],
            badges: legacy.badges ?? DEFAULT_GAME.badges,
            dailyMissions: legacy.dailyMissions ?? DEFAULT_GAME.dailyMissions,
          } as GameState;
        }
        return state as GameState;
      },
    }
  )
);
