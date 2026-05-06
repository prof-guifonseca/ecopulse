import { describe, expect, it } from 'vitest';
import type { AvatarLoadout, GearItem, GearSet } from '@/types';
import {
  baseStatsForLevel,
  createPlayerFighter,
  derivePlayerStats,
  resolveBattleRound,
  simulateBattle,
  startBattleSession,
} from './rules';

const baseFighter = {
  id: 'player',
  name: 'Aluno',
  title: 'Guardião',
  level: 4,
  skinPackId: null,
  avatarBase: null,
  avatarOutfits: {},
};

const emptyLoadout: AvatarLoadout = {
  baseId: 'base1',
  equippedGear: {},
  activeSetId: null,
};

const testGearItems = [
  {
    id: 'visor-a',
    name: 'Visor A',
    slot: 'face',
    tier: 'rare',
    priceTokens: 10,
    unlock: { kind: 'paid' },
    battleStats: { focus: 3 },
    visualLayerId: 'cyber:face:test',
    emoji: 'A',
    tags: ['test'],
  },
  {
    id: 'tool-a',
    name: 'Tool A',
    slot: 'mainHand',
    tier: 'common',
    priceTokens: 10,
    unlock: { kind: 'paid' },
    battleStats: { attack: 4 },
    visualLayerId: 'cyber:mainHand:test',
    emoji: 'B',
    tags: ['test'],
  },
] satisfies GearItem[];

const testGearSets = [
  {
    id: 'set-a',
    name: 'Set A',
    theme: 'cyber',
    tagline: 'Teste',
    tier: 'rare',
    unlock: { kind: 'paid' },
    priceTokens: 10,
    itemIds: ['visor-a', 'tool-a'],
    defaultLoadout: { face: 'visor-a', mainHand: 'tool-a' },
    requiredItemIds: ['visor-a', 'tool-a'],
    setBonusStats: { speed: 2 },
  },
] satisfies GearSet[];

describe('battle rules', () => {
  it('starts a deterministic tactical session with full HP and round 1', () => {
    const session = startBattleSession({
      seed: 'session-start',
      opponentId: 'rival',
      player: {
        ...baseFighter,
        stats: { hp: 120, attack: 28, defense: 18, speed: 40, focus: 18 },
      },
      opponent: {
        id: 'rival',
        name: 'Rival',
        title: 'Treino',
        level: 3,
        stats: { hp: 92, attack: 18, defense: 10, speed: 12, focus: 10 },
        archetype: 'balanced',
      },
    });

    expect(session.status).toBe('active');
    expect(session.round).toBe(1);
    expect(session.playerHp).toBe(120);
    expect(session.opponentHp).toBe(92);
    expect(session.events[0].type).toBe('start');
  });

  it('resolves attack, defend and focus commands as round state', () => {
    const session = startBattleSession({
      seed: 'round-actions',
      opponentId: 'rival',
      player: {
        ...baseFighter,
        stats: { hp: 140, attack: 26, defense: 20, speed: 70, focus: 20 },
      },
      opponent: {
        id: 'rival',
        name: 'Rival',
        title: 'Treino',
        level: 3,
        stats: { hp: 140, attack: 18, defense: 10, speed: 4, focus: 10 },
        archetype: 'balanced',
      },
    });

    const attacked = resolveBattleRound(session, 'attack', 'defend');
    expect(attacked.rounds[0].playerAction).toBe('attack');
    expect(attacked.rounds[0].opponentAction).toBe('defend');
    expect(attacked.playerEnergy).toBe(10);

    const defended = resolveBattleRound(attacked, 'defend', 'focus');
    expect(defended.rounds[1].playerAction).toBe('defend');
    expect(defended.playerEnergy).toBe(18);
    expect(defended.playerGuard).toBeGreaterThan(0);

    const focused = resolveBattleRound(defended, 'focus', 'defend');
    expect(focused.rounds[2].playerAction).toBe('focus');
    expect(focused.playerEnergy).toBe(32);
    expect(focused.playerFocus).toBe(1);
  });

  it('uses defense to reduce the next incoming damage', () => {
    const player = {
      ...baseFighter,
      stats: { hp: 140, attack: 10, defense: 28, speed: 80, focus: 12 },
    };
    const opponent = {
      id: 'heavy-rival',
      name: 'Rival Forte',
      title: 'Ataque',
      level: 5,
      stats: { hp: 140, attack: 34, defense: 8, speed: 2, focus: 8 },
      archetype: 'aggressive' as const,
    };

    const guarded = resolveBattleRound(
      startBattleSession({ seed: 'guard-check', opponentId: opponent.id, player, opponent }),
      'defend',
      'attack'
    );
    const open = resolveBattleRound(
      startBattleSession({ seed: 'guard-check', opponentId: opponent.id, player, opponent }),
      'focus',
      'attack'
    );

    expect(140 - guarded.playerHp).toBeLessThan(140 - open.playerHp);
    expect(guarded.rounds[0].events.some((event) => event.type === 'block')).toBe(true);
  });

  it('chooses AI actions deterministically for an archetype and seed', () => {
    const makeSession = () =>
      startBattleSession({
        seed: 'same-ai-seed',
        opponentId: 'trickster',
        player: {
          ...baseFighter,
          stats: { hp: 120, attack: 22, defense: 14, speed: 16, focus: 16 },
        },
        opponent: {
          id: 'trickster',
          name: 'Truque',
          title: 'IA',
          level: 5,
          stats: { hp: 112, attack: 22, defense: 14, speed: 18, focus: 18 },
          archetype: 'trickster',
        },
      });

    const first = resolveBattleRound(makeSession(), 'focus');
    const second = resolveBattleRound(makeSession(), 'focus');

    expect(first.rounds[0].opponentAction).toBe(second.rounds[0].opponentAction);
    expect(first.events.map((event) => event.message)).toEqual(second.events.map((event) => event.message));
  });

  it('finishes a tactical session at the configured round cap', () => {
    let session = startBattleSession({
      seed: 'session-cap',
      opponentId: 'wall',
      maxRounds: 2,
      player: {
        ...baseFighter,
        stats: { hp: 240, attack: 3, defense: 90, speed: 10, focus: 10 },
      },
      opponent: {
        id: 'wall',
        name: 'Parede',
        title: 'Defesa',
        level: 5,
        stats: { hp: 240, attack: 3, defense: 90, speed: 10, focus: 10 },
        archetype: 'defensive',
      },
    });

    session = resolveBattleRound(session, 'defend', 'defend');
    expect(session.status).toBe('active');
    session = resolveBattleRound(session, 'defend', 'defend');

    expect(session.status).toBe('finished');
    expect(session.rounds).toHaveLength(2);
    expect(session.events.at(-1)?.type).toBe('finish');
  });

  it('produces a predictable player victory with a fixed seed', () => {
    const result = simulateBattle({
      seed: 'player-win',
      opponentId: 'weak-opponent',
      player: {
        ...baseFighter,
        stats: { hp: 120, attack: 34, defense: 18, speed: 18, focus: 18 },
      },
      opponent: {
        id: 'weak-opponent',
        name: 'Rival',
        title: 'Treino',
        level: 1,
        stats: { hp: 72, attack: 13, defense: 8, speed: 8, focus: 7 },
      },
    });

    expect(result.outcome).toBe('win');
    expect(result.winnerId).toBe('player');
    expect(result.events.at(-1)?.type).toBe('finish');
  });

  it('produces a predictable player defeat with a fixed seed', () => {
    const result = simulateBattle({
      seed: 'player-loss',
      opponentId: 'strong-opponent',
      player: {
        ...baseFighter,
        stats: { hp: 78, attack: 14, defense: 8, speed: 8, focus: 8 },
      },
      opponent: {
        id: 'strong-opponent',
        name: 'Campeã',
        title: 'Boss',
        level: 5,
        stats: { hp: 132, attack: 32, defense: 18, speed: 16, focus: 18 },
      },
    });

    expect(result.outcome).toBe('loss');
    expect(result.winnerId).toBe('strong-opponent');
  });

  it('resolves a no-knockout battle by remaining HP', () => {
    const result = simulateBattle({
      seed: 'hp-tiebreak',
      opponentId: 'sturdy-opponent',
      player: {
        ...baseFighter,
        stats: { hp: 110, attack: 8, defense: 50, speed: 10, focus: 10 },
      },
      opponent: {
        id: 'sturdy-opponent',
        name: 'Parede',
        title: 'Defesa',
        level: 2,
        stats: { hp: 90, attack: 8, defense: 50, speed: 10, focus: 10 },
      },
    });

    expect(result.rounds).toBe(8);
    expect(result.finalHp.player).toBeGreaterThan(result.finalHp.opponent);
    expect(result.outcome).toBe('win');
  });

  it('never exceeds the maximum of 8 rounds', () => {
    const result = simulateBattle({
      seed: 'round-cap',
      opponentId: 'mirror',
      player: {
        ...baseFighter,
        stats: { hp: 300, attack: 3, defense: 90, speed: 10, focus: 10 },
      },
      opponent: {
        id: 'mirror',
        name: 'Espelho',
        title: 'Teste',
        level: 1,
        stats: { hp: 300, attack: 3, defense: 90, speed: 10, focus: 10 },
      },
    });

    expect(result.rounds).toBeLessThanOrEqual(8);
    expect(result.events.at(-1)?.type).toBe('finish');
  });

  it('derives stats from wearable loadout items and complete set bonus', () => {
    const stats = derivePlayerStats({
      level: 5,
      loadout: {
        baseId: 'base1',
        equippedGear: { face: 'visor-a', mainHand: 'tool-a' },
        activeSetId: 'set-a',
      },
      gearItems: testGearItems,
      gearSets: testGearSets,
    });
    const base = baseStatsForLevel(5);

    expect(stats.attack).toBe(base.attack + 4);
    expect(stats.focus).toBe(base.focus + 3);
    expect(stats.speed).toBe(base.speed + 2);
  });

  it('creates a player fighter with derived stats and visual snapshot', () => {
    const fighter = createPlayerFighter({
      id: 'player',
      name: 'Aluno',
      title: 'Guardião',
      level: 3,
      loadout: emptyLoadout,
      gearItems: [],
      gearSets: [],
    });

    expect(fighter.stats).toEqual(baseStatsForLevel(3));
    expect(fighter.loadout).toEqual(emptyLoadout);
    expect(fighter.avatarBase).toBe('base1');
  });
});
