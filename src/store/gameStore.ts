'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DailyMissionsProgress, Score } from '@/types';
import { getMapPointCatalog } from '@/simulation';
import { environmentalImpactDeltaForPoint, getRegisteredEnvironmentalPoint } from '@/lib/esg';
import { createSafeJSONStorage, readLegacyState } from './storage';

export interface RealImpact {
  /** Trees planted via donation (s6) or chapter-end ritual. */
  treesPlanted: number;
  /** Estimated kg of batteries dropped off (0.5 kg per visit). */
  batteriesKgEstimated: number;
  /** Estimated liters of cooking oil delivered (1 L per visit). */
  oilLitersEstimated: number;
  /** Repairs registered (1 per reparo visit). */
  repairsCount: number;
  /** Exchanges/swaps registered (1 per troca visit). */
  exchangesCount: number;
}

const EMPTY_REAL_IMPACT: RealImpact = {
  treesPlanted: 0,
  batteriesKgEstimated: 0,
  oilLitersEstimated: 0,
  repairsCount: 0,
  exchangesCount: 0,
};

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
  lastMissionDay: string | null;
  /** Mission template ids picked for today's three slots (scan, map, social). */
  todaysMissionIds: string[];
  /** Score of the most recent scan — used to validate scan-quality missions. */
  lastScanScore: Score | null;
  /** Floresta EcoPulse — endgame meta counter (simulated). */
  realImpact: RealImpact;

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
  resetDailyMissions: (day: string) => void;
  setLastMissionDay: (day: string) => void;
  setTodaysMissionIds: (ids: string[]) => void;
  setLastScanScore: (score: Score | null) => void;
  bumpRealImpact: (delta: Partial<RealImpact>) => void;
}

const DEFAULT_GAME = {
  scannedProducts: [] as string[],
  visitedPoints: [] as string[],
  ownedShopItems: [] as string[],
  activeChallenges: [] as string[],
  completedChallenges: [] as string[],
  challengeProgress: {} as Record<string, number>,
  completedTutorials: [] as string[],
  badges: [] as string[],
  dailyMissions: { scan: false, likes: 0, map: false, bonusClaimed: false } as DailyMissionsProgress,
  lastMissionDay: null as string | null,
  todaysMissionIds: [] as string[],
  lastScanScore: null as Score | null,
  realImpact: { ...EMPTY_REAL_IMPACT } as RealImpact,
};

/** Maps a visited map-point id to the realImpact delta that visit produces. */
function realImpactDeltaForVisit(pointId: string): Partial<RealImpact> {
  const environmentalPoint = getRegisteredEnvironmentalPoint(pointId);
  if (environmentalPoint) return environmentalImpactDeltaForPoint(environmentalPoint);

  const point = getMapPointCatalog().find((p) => p.id === pointId);
  if (!point) return {};
  switch (point.type) {
    case 'baterias':
      return { batteriesKgEstimated: 0.5 };
    case 'oleo':
      return { oilLitersEstimated: 1 };
    case 'reparo':
      return { repairsCount: 1 };
    case 'trocas':
      return { exchangesCount: 1 };
    default:
      return {};
  }
}

function applyImpactDelta(prev: RealImpact, delta: Partial<RealImpact>): RealImpact {
  return {
    treesPlanted: prev.treesPlanted + (delta.treesPlanted ?? 0),
    batteriesKgEstimated: prev.batteriesKgEstimated + (delta.batteriesKgEstimated ?? 0),
    oilLitersEstimated: prev.oilLitersEstimated + (delta.oilLitersEstimated ?? 0),
    repairsCount: prev.repairsCount + (delta.repairsCount ?? 0),
    exchangesCount: prev.exchangesCount + (delta.exchangesCount ?? 0),
  };
}

export function migrateGameStateToV2(state: Partial<GameState>): GameState {
  const merged = { ...DEFAULT_GAME, ...state } as GameState;
  // Backfill realImpact from visitedPoints when older installs upgrade.
  const persistedImpact =
    state.realImpact && typeof state.realImpact === 'object' ? state.realImpact : null;
  if (!persistedImpact) {
    let impact: RealImpact = { ...EMPTY_REAL_IMPACT };
    for (const id of merged.visitedPoints ?? []) {
      impact = applyImpactDelta(impact, realImpactDeltaForVisit(id));
    }
    merged.realImpact = impact;
  } else {
    merged.realImpact = { ...EMPTY_REAL_IMPACT, ...persistedImpact };
  }
  if (!Array.isArray(merged.todaysMissionIds)) merged.todaysMissionIds = [];
  if (merged.lastScanScore === undefined) merged.lastScanScore = null;
  return merged;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_GAME,

      addScannedProduct: (id) =>
        set((s) =>
          s.scannedProducts.includes(id) ? s : { scannedProducts: [...s.scannedProducts, id] }
        ),

      addVisitedPoint: (id) =>
        set((s) => {
          if (s.visitedPoints.includes(id)) return s;
          const delta = realImpactDeltaForVisit(id);
          return {
            visitedPoints: [...s.visitedPoints, id],
            realImpact: applyImpactDelta(s.realImpact, delta),
          };
        }),

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

      resetDailyMissions: (day) =>
        set({
          dailyMissions: { scan: false, likes: 0, map: false, bonusClaimed: false },
          lastMissionDay: day,
        }),

      setLastMissionDay: (day) => set({ lastMissionDay: day }),

      setTodaysMissionIds: (ids) => set({ todaysMissionIds: ids }),

      setLastScanScore: (score) => set({ lastScanScore: score }),

      bumpRealImpact: (delta) =>
        set((s) => ({ realImpact: applyImpactDelta(s.realImpact, delta) })),
    }),
    {
      name: 'ecopulse:game',
      version: 2,
      storage: createSafeJSONStorage<GameState>(),
      migrate: (state) => {
        const legacy = readLegacyState();
        if (legacy) {
          return migrateGameStateToV2({
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
            lastMissionDay: legacy.lastMissionDay ?? null,
          } as Partial<GameState>);
        }
        return migrateGameStateToV2(state as Partial<GameState>);
      },
    }
  )
);

if (typeof window !== 'undefined') {
  useGameStore.persist.setOptions({
    storage: createSafeJSONStorage<GameState>(),
  });
}
