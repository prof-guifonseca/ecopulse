'use client';

import { DEFAULT_REGION_ID, pickTodaysMissions } from '@/data';
import type { TribeId } from '@/data/tribes';
import { useArenaStore } from '@/store/arenaStore';
import { useGameStore } from '@/store/gameStore';
import { useScanHistoryStore } from '@/store/scanHistoryStore';
import { useSimulationStore } from '@/store/simulationStore';
import { useUserStore } from '@/store/userStore';
import { selectEcoQualityIndex } from '@/lib/ecoMultiplier';
import { currentChapter } from '@/lib/journey';
import { todayKey } from '@/lib/dailyReset';
import { deterministicId } from './rng';
import type { ScenarioId, SimulationConfig } from './types';

const PERSISTED_KEYS = [
  'ecopulse:seeded:v1',
  'ecopulse:user',
  'ecopulse:game',
  'ecopulse:arena',
  'ecopulse:scanHistory',
  'ecopulse:social',
  'ecopulse:simulation',
];

export function bootstrapSimulationIfNeeded(): void {
  if (typeof window === 'undefined') return;

  const user = useUserStore.getState();
  if (!user.onboarded) return;

  const today = todayKey();
  const simulation = useSimulationStore.getState();

  if (!simulation.config) {
    startSimulationConfig('legacy-import', {
      seed: createSimulationSeed('legacy-import', user.name, user.tribe, today),
      regionId: user.regionId || DEFAULT_REGION_ID,
      currentDay: today,
    });
  } else if (simulation.config.currentDay !== today) {
    simulation.setCurrentDay(today);
  }

  ensureDailyPlanForCurrentState(today);
}

export function startNewUserSimulation(input: {
  name: string;
  tribe: TribeId;
  regionId?: string;
}): void {
  if (typeof window === 'undefined') return;

  const today = todayKey();
  const regionId = input.regionId ?? DEFAULT_REGION_ID;
  const seed = createSimulationSeed('new-user', input.name, input.tribe, today);

  startSimulationConfig('new-user', { seed, regionId, currentDay: today });
  useSimulationStore.getState().recordEvent({
    type: 'onboarded',
    payload: {
      name: input.name,
      tribe: input.tribe,
      regionId,
    },
  });

  const game = useGameStore.getState();
  game.resetDailyMissions(today);
  game.setTodaysMissionIds(
    pickTodaysMissions({
      tribe: input.tribe,
      chapterId: 'semente',
      seed: `${today}|${input.tribe}|${regionId}`,
    }),
  );
}

export function resetSimulationState(): void {
  if (typeof window === 'undefined') return;
  for (const key of PERSISTED_KEYS) {
    localStorage.removeItem(key);
  }
  window.location.reload();
}

export function createSimulationSeed(
  scenario: ScenarioId,
  name: string,
  tribe: string,
  day: string,
): string {
  return `${scenario}-${deterministicId([name.trim().toLowerCase(), tribe, day])}`;
}

export function ensureDailyPlanForCurrentState(day: string = todayKey()): void {
  const game = useGameStore.getState();
  if (game.todaysMissionIds.length > 0 && game.lastMissionDay === day) return;
  if (!game.lastMissionDay) game.setLastMissionDay(day);
  if (game.todaysMissionIds.length > 0) return;

  const user = useUserStore.getState();
  const tribe = (user.tribe ?? 'guardioes') as TribeId;
  game.setTodaysMissionIds(
    pickTodaysMissions({
      tribe,
      chapterId: currentChapterId(),
      seed: `${day}|${tribe}|${user.regionId || DEFAULT_REGION_ID}`,
    }),
  );
}

function startSimulationConfig(
  scenario: ScenarioId,
  opts: Pick<SimulationConfig, 'seed' | 'regionId' | 'currentDay'>,
): void {
  useSimulationStore.getState().startSimulation({
    scenario,
    seed: opts.seed,
    regionId: opts.regionId,
    currentDay: opts.currentDay,
    startedAt: new Date().toISOString(),
  });
}

function currentChapterId(): string {
  const user = useUserStore.getState();
  const game = useGameStore.getState();
  const arena = useArenaStore.getState();
  const ecoIndex = selectEcoQualityIndex(useScanHistoryStore.getState().history);

  return currentChapter({
    level: user.level,
    scans: game.scannedProducts.length,
    ecoIndex: ecoIndex.letter,
    visitedPointIds: game.visitedPoints,
    defeatedRivals: arena.defeatedOpponents?.length ?? 0,
  }).id;
}
