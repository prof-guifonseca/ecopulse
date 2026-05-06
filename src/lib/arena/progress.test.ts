import { describe, expect, it } from 'vitest';
import type { ArenaProgress, BattleResult } from '@/types';
import {
  FIRST_RIVAL_WIN_BONUS,
  applyArenaBattleProgress,
  arenaLevelFromXp,
  battleArenaXpReward,
} from './progress';

const baseProgress: ArenaProgress = {
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

describe('arena progress rules', () => {
  it('grants win XP plus first-rival bonus on the first victory', () => {
    const result = battleResult('win');
    const reward = battleArenaXpReward(result);
    const progress = applyArenaBattleProgress(baseProgress, result);

    expect(reward.total).toBe(20 + FIRST_RIVAL_WIN_BONUS);
    expect(progress.arenaXp).toBe(35);
    expect(progress.wins).toBe(1);
    expect(progress.defeatedOpponents).toEqual(['nami-solar']);
    expect(progress.rivalMastery['nami-solar'].wins).toBe(1);
    expect(progress.winStreak).toBe(1);
    expect(progress.bestStreak).toBe(1);
  });

  it('does not grant first-win bonus again for the same rival', () => {
    const first = applyArenaBattleProgress(baseProgress, battleResult('win'));
    const second = applyArenaBattleProgress(first, battleResult('win', 'second'));

    expect(second.arenaXp).toBe(55);
    expect(second.rivalMastery['nami-solar'].wins).toBe(2);
    expect(second.winStreak).toBe(2);
  });

  it('grants loss XP and resets win streak without adding defeated rival', () => {
    const prior = {
      ...baseProgress,
      wins: 2,
      arenaXp: 60,
      arenaLevel: arenaLevelFromXp(60),
      winStreak: 2,
      bestStreak: 2,
    };
    const progress = applyArenaBattleProgress(prior, battleResult('loss'));

    expect(progress.arenaXp).toBe(66);
    expect(progress.losses).toBe(1);
    expect(progress.winStreak).toBe(0);
    expect(progress.bestStreak).toBe(2);
    expect(progress.defeatedOpponents).toEqual([]);
  });

  it('grants draw XP and keeps the loss counter unchanged', () => {
    const progress = applyArenaBattleProgress(baseProgress, battleResult('draw'));

    expect(progress.arenaXp).toBe(10);
    expect(progress.wins).toBe(0);
    expect(progress.losses).toBe(0);
    expect(progress.rivalMastery['nami-solar'].draws).toBe(1);
  });

  it('derives Arena level from accumulated XP thresholds', () => {
    expect(arenaLevelFromXp(0)).toBe(1);
    expect(arenaLevelFromXp(60)).toBe(2);
    expect(arenaLevelFromXp(160)).toBe(3);
  });
});

function battleResult(outcome: BattleResult['outcome'], seed: string = outcome): BattleResult {
  const player = {
    id: 'player',
    name: 'Aluno',
    title: 'Guardião',
    level: 3,
    stats: { hp: 100, attack: 20, defense: 12, speed: 12, focus: 12 },
  };
  const opponent = {
    id: 'nami-solar',
    name: 'Nami Solar',
    title: 'Aprendiz',
    level: 3,
    stats: { hp: 90, attack: 18, defense: 10, speed: 12, focus: 10 },
    arenaXpReward: 20,
  };
  const winnerId = outcome === 'win' ? player.id : outcome === 'loss' ? opponent.id : null;

  return {
    id: `battle-${seed}`,
    opponentId: opponent.id,
    seed,
    playedAt: '2026-05-06T12:00:00.000Z',
    player,
    opponent,
    winnerId,
    outcome,
    rounds: 3,
    events: [],
    finalHp: { player: outcome === 'loss' ? 0 : 40, opponent: outcome === 'win' ? 0 : 38 },
    finalEnergy: { player: 20, opponent: 18 },
  };
}
