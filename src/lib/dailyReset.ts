'use client';

import { useGameStore } from '@/store/gameStore';
import { useUserStore } from '@/store/userStore';

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

  return { reset: true, streakChanged, newStreak };
}
