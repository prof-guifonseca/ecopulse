import { describe, expect, it } from 'vitest';
import type { BattleResult } from '@/types';
import { migrateArenaStateToV2 } from './arenaStore';

describe('arenaStore migration v2', () => {
  it('preserves v1 battle history and fills Arena XP defaults', () => {
    const lastBattle = battleResult();
    const migrated = migrateArenaStateToV2({
      wins: 1,
      losses: 2,
      defeatedOpponents: ['nami-solar'],
      lastBattle,
      history: [lastBattle],
    });

    expect(migrated.wins).toBe(1);
    expect(migrated.losses).toBe(2);
    expect(migrated.defeatedOpponents).toEqual(['nami-solar']);
    expect(migrated.lastBattle).toBe(lastBattle);
    expect(migrated.history).toEqual([lastBattle]);
    expect(migrated.arenaXp).toBe(0);
    expect(migrated.arenaLevel).toBe(1);
    expect(migrated.winStreak).toBe(0);
    expect(migrated.bestStreak).toBe(0);
    expect(migrated.rivalMastery).toEqual({});
  });
});

function battleResult(): BattleResult {
  const fighter = {
    id: 'player',
    name: 'Aluno',
    title: 'Guardião',
    level: 3,
    stats: { hp: 100, attack: 20, defense: 12, speed: 12, focus: 12 },
  };
  return {
    id: 'battle-v1',
    opponentId: 'nami-solar',
    seed: 'v1',
    playedAt: '2026-05-06T12:00:00.000Z',
    player: fighter,
    opponent: { ...fighter, id: 'nami-solar', name: 'Nami Solar' },
    winnerId: 'player',
    outcome: 'win',
    rounds: 4,
    events: [],
    finalHp: { player: 35, opponent: 0 },
    finalEnergy: { player: 20, opponent: 12 },
  };
}
