import type { ArenaProgress, ArenaRivalMastery, BattleOutcome, BattleResult } from '@/types';

export const ARENA_XP_REWARDS: Record<BattleOutcome, number> = {
  win: 20,
  loss: 6,
  draw: 10,
};

export const FIRST_RIVAL_WIN_BONUS = 15;

export function arenaXpToNextLevel(level: number): number {
  return 60 + Math.max(0, level - 1) * 40;
}

export function arenaLevelFromXp(xp: number): number {
  let level = 1;
  let remaining = Math.max(0, Math.floor(xp));
  while (remaining >= arenaXpToNextLevel(level)) {
    remaining -= arenaXpToNextLevel(level);
    level += 1;
  }
  return level;
}

export function arenaLevelProgress(xp: number) {
  const arenaLevel = arenaLevelFromXp(xp);
  let spent = 0;
  for (let level = 1; level < arenaLevel; level += 1) {
    spent += arenaXpToNextLevel(level);
  }
  const current = Math.max(0, Math.floor(xp) - spent);
  const next = arenaXpToNextLevel(arenaLevel);
  return {
    arenaLevel,
    current,
    next,
    pct: next > 0 ? (current / next) * 100 : 0,
  };
}

export interface BattleRewardOptions {
  /** Multiplier on win/loss/draw XP (NOT applied to first-win bonus). */
  loadoutMultiplier?: number;
}

export function battleArenaXpReward(
  result: BattleResult,
  existingMastery?: ArenaRivalMastery,
  options: BattleRewardOptions = {},
) {
  const multiplier = options.loadoutMultiplier ?? 1;
  const rawBase =
    result.outcome === 'win'
      ? (result.opponent.arenaXpReward ?? ARENA_XP_REWARDS.win)
      : ARENA_XP_REWARDS[result.outcome];
  const baseReward = Math.round(rawBase * multiplier);
  const firstWinBonus =
    result.outcome === 'win' && (existingMastery?.wins ?? 0) === 0 ? FIRST_RIVAL_WIN_BONUS : 0;
  return {
    baseReward,
    firstWinBonus,
    total: baseReward + firstWinBonus,
    multiplier,
  };
}

export function applyArenaBattleProgress(
  progress: ArenaProgress,
  result: BattleResult,
  options: BattleRewardOptions = {},
): ArenaProgress {
  const previousMastery = progress.rivalMastery[result.opponentId] ?? {
    wins: 0,
    losses: 0,
    draws: 0,
  };
  const reward = battleArenaXpReward(result, previousMastery, options);
  const won = result.outcome === 'win';
  const lost = result.outcome === 'loss';
  const drew = result.outcome === 'draw';
  const nextXp = progress.arenaXp + reward.total;
  const nextWinStreak = won ? progress.winStreak + 1 : 0;
  const mastery: ArenaRivalMastery = {
    wins: previousMastery.wins + (won ? 1 : 0),
    losses: previousMastery.losses + (lost ? 1 : 0),
    draws: previousMastery.draws + (drew ? 1 : 0),
    firstDefeatedAt: previousMastery.firstDefeatedAt ?? (won ? result.playedAt : undefined),
    lastOutcome: result.outcome,
  };

  return {
    ...progress,
    wins: progress.wins + (won ? 1 : 0),
    losses: progress.losses + (lost ? 1 : 0),
    defeatedOpponents:
      won && !progress.defeatedOpponents.includes(result.opponentId)
        ? [...progress.defeatedOpponents, result.opponentId]
        : progress.defeatedOpponents,
    lastBattle: result,
    history: [result, ...progress.history].slice(0, 8),
    arenaXp: nextXp,
    arenaLevel: arenaLevelFromXp(nextXp),
    winStreak: nextWinStreak,
    bestStreak: Math.max(progress.bestStreak, nextWinStreak),
    rivalMastery: {
      ...progress.rivalMastery,
      [result.opponentId]: mastery,
    },
  };
}
