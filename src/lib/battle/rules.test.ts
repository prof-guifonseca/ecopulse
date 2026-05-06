import { describe, expect, it } from 'vitest';
import type { AvatarOutfit, SkinPack } from '@/types';
import {
  baseStatsForLevel,
  createPlayerFighter,
  derivePlayerStats,
  simulateBattle,
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

describe('battle rules', () => {
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

  it('derives stats from skin or equipped items according to loadout mode', () => {
    const skinPacks = [
      {
        id: 'skin-a',
        name: 'Skin A',
        theme: 'cyber',
        tagline: 'Teste',
        tier: 'rare',
        unlock: { kind: 'paid' },
        priceTokens: 10,
        artId: 'cyber-reciclador',
        battleStats: { attack: 7, focus: 3 },
      },
    ] satisfies SkinPack[];
    const outfits = [
      {
        id: 'hat-a',
        name: 'Hat A',
        slot: 'hat',
        price: 1,
        emoji: 'A',
        tier: 'common',
        battleStats: { defense: 2 },
      },
      {
        id: 'weapon-a',
        name: 'Weapon A',
        slot: 'weapon',
        price: 1,
        emoji: 'B',
        tier: 'rare',
        battleStats: { attack: 4 },
      },
    ] satisfies AvatarOutfit[];

    const skinStats = derivePlayerStats({
      level: 5,
      skinPackId: 'skin-a',
      avatarOutfits: { hat: 'hat-a', weapon: 'weapon-a' },
      skinPacks,
      outfits,
    });
    const compositeStats = derivePlayerStats({
      level: 5,
      skinPackId: null,
      avatarOutfits: { hat: 'hat-a', weapon: 'weapon-a' },
      skinPacks,
      outfits,
    });
    const base = baseStatsForLevel(5);

    expect(skinStats.attack).toBe(base.attack + 7);
    expect(skinStats.defense).toBe(base.defense);
    expect(compositeStats.attack).toBe(base.attack + 4);
    expect(compositeStats.defense).toBe(base.defense + 2);
  });

  it('creates a player fighter with derived stats and visual snapshot', () => {
    const fighter = createPlayerFighter({
      ...baseFighter,
      level: 3,
      skinPacks: [],
      outfits: [],
    });

    expect(fighter.stats).toEqual(baseStatsForLevel(3));
    expect(fighter.avatarOutfits).toEqual({});
  });
});
