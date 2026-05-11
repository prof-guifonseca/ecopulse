import { useGameStore } from '@/store/gameStore';
import { useUserStore } from '@/store/userStore';
import { pickTodaysMissions } from '@/data';
import { useScanHistoryStore } from '@/store/scanHistoryStore';
import { useArenaStore } from '@/store/arenaStore';
import { useSimulationStore } from '@/store/simulationStore';
import { selectEcoQualityIndex } from './ecoMultiplier';
import { currentChapter } from './journey';
import { buildDailyPlan } from '@/simulation/queries';
import type { TribeId } from '@/data/tribes';

export type StreakChange = 'none' | 'continued' | 'broken' | 'started';

export interface DailyResetOutcome {
  reset: boolean;
  streakChanged: StreakChange;
  newStreak: number;
}

export function todayKey(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function diffInDays(from: string, to: string): number {
  const [fy, fm, fd] = from.split('-').map(Number);
  const [ty, tm, td] = to.split('-').map(Number);
  const fromUtc = Date.UTC(fy, fm - 1, fd);
  const toUtc = Date.UTC(ty, tm - 1, td);
  return Math.round((toUtc - fromUtc) / (1000 * 60 * 60 * 24));
}

function hadAnyMissionYesterday(dm: { scan: boolean; likes: number; map: boolean }): boolean {
  return dm.scan || dm.likes >= 2 || dm.map;
}

export function ensureDailyReset(): DailyResetOutcome {
  const game = useGameStore.getState();
  const user = useUserStore.getState();
  const today = todayKey();

  if (game.lastMissionDay === today) {
    return { reset: false, streakChanged: 'none', newStreak: user.streak };
  }

  // First-ever session after onboarding: no reset, just set the day.
  if (!game.lastMissionDay) {
    game.setLastMissionDay(today);
    return { reset: false, streakChanged: 'none', newStreak: user.streak };
  }

  const diff = diffInDays(game.lastMissionDay, today);
  const had = hadAnyMissionYesterday(game.dailyMissions);

  let streakChanged: StreakChange = 'none';
  let newStreak = user.streak;

  if (diff === 1 && had) {
    newStreak = user.streak + 1;
    streakChanged = user.streak === 0 ? 'started' : 'continued';
  } else if (user.streak > 0) {
    newStreak = 0;
    streakChanged = 'broken';
  }

  user.setStreak(newStreak);
  user.resetTokensToday();
  game.resetDailyMissions(today);
  game.setTodaysMissionIds(rollTodaysMissions(today));

  return { reset: true, streakChanged, newStreak };
}

/**
 * Picks today's three mission templates from the pool given the user's
 * current tribe and journey chapter. Stable per (day · tribe).
 */
export function rollTodaysMissions(day: string): string[] {
  const user = useUserStore.getState();
  const game = useGameStore.getState();
  const tribe = (user.tribe ?? 'guardioes') as TribeId;
  const arena = useArenaStore.getState();
  const ecoIndex = selectEcoQualityIndex(useScanHistoryStore.getState().history);

  const chapter = currentChapter({
    level: user.level,
    scans: game.scannedProducts.length,
    ecoIndex: ecoIndex.letter,
    visitedPointIds: game.visitedPoints,
    defeatedRivals: arena.defeatedOpponents?.length ?? 0,
  });

  const simulation = useSimulationStore.getState().config;
  if (simulation) {
    return buildDailyPlan({
      seed: simulation.seed,
      day,
      tribe,
      chapterId: chapter.id,
    });
  }

  return pickTodaysMissions({ tribe, chapterId: chapter.id, seed: `${day}|${tribe}` });
}

/** Ensure today's missions are populated even when the day-key didn't tick
 * (first hydrate after a v1→v2 migration, for instance). */
export function ensureTodaysMissionsPopulated() {
  const game = useGameStore.getState();
  if (game.todaysMissionIds.length > 0) return;
  game.setTodaysMissionIds(rollTodaysMissions(todayKey()));
}
