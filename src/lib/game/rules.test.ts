import { describe, expect, it } from 'vitest';
import type { GearSet, SkinPack, SkinUnlock } from '@/types';
import {
  meetsSkinUnlock,
  pendingAutoBadges,
  pendingGearSetUnlocks,
  pendingSkinUnlocks,
  type GameSnapshot,
} from './rules';

const snap = (over: Partial<GameSnapshot> = {}): GameSnapshot => ({
  level: 1,
  tokens: 0,
  badges: [],
  ownedSkinPacks: [],
  ownedGearSets: [],
  scannedProductsCount: 0,
  visitedPointsCount: 0,
  completedChallengesCount: 0,
  completedTutorialsCount: 0,
  ...over,
});

const pack = (id: string, unlock: SkinUnlock): SkinPack => ({
  id,
  name: id,
  theme: 'anime',
  tagline: '',
  tier: 'starter',
  unlock,
  priceTokens: 100,
  artId: 'art',
});

const gearSet = (id: string, unlock: SkinUnlock): GearSet => ({
  id,
  name: id,
  theme: 'nature',
  tagline: '',
  tier: 'common',
  unlock,
  priceTokens: 100,
  itemIds: [],
  defaultLoadout: {},
  requiredItemIds: [],
  setBonusStats: {},
});

describe('meetsSkinUnlock', () => {
  it('never satisfies a paid unlock (purchase happens in the action layer)', () => {
    expect(meetsSkinUnlock({ kind: 'paid' }, snap({ level: 99, tokens: 9999 }))).toBe(false);
  });

  it('gates on level', () => {
    expect(meetsSkinUnlock({ kind: 'level', value: 5 }, snap({ level: 4 }))).toBe(false);
    expect(meetsSkinUnlock({ kind: 'level', value: 5 }, snap({ level: 5 }))).toBe(true);
  });

  it('gates on a held badge', () => {
    expect(meetsSkinUnlock({ kind: 'badge', id: 'token-100' }, snap())).toBe(false);
    expect(
      meetsSkinUnlock({ kind: 'badge', id: 'token-100' }, snap({ badges: ['token-100'] })),
    ).toBe(true);
  });

  it.each([
    ['scans', { scannedProductsCount: 10 }],
    ['visits', { visitedPointsCount: 10 }],
    ['challenges', { completedChallengesCount: 10 }],
    ['tutorials', { completedTutorialsCount: 10 }],
  ] as const)('gates on the %s count metric', (metric, reached) => {
    const unlock: SkinUnlock = { kind: 'count', metric, value: 10 };
    expect(meetsSkinUnlock(unlock, snap())).toBe(false);
    expect(meetsSkinUnlock(unlock, snap(reached))).toBe(true);
  });
});

describe('pendingSkinUnlocks / pendingGearSetUnlocks', () => {
  it('returns newly-unlockable, not-yet-owned catalog entries', () => {
    const catalog = [
      pack('a', { kind: 'level', value: 2 }),
      pack('b', { kind: 'level', value: 9 }),
    ];
    const result = pendingSkinUnlocks(catalog, snap({ level: 5 }));
    expect(result.map((p) => p.id)).toEqual(['a']);
  });

  it('skips already-owned packs', () => {
    const catalog = [pack('a', { kind: 'level', value: 2 })];
    expect(pendingSkinUnlocks(catalog, snap({ level: 5, ownedSkinPacks: ['a'] }))).toEqual([]);
  });

  it('works for gear sets too', () => {
    const catalog = [gearSet('s1', { kind: 'count', metric: 'scans', value: 3 })];
    expect(
      pendingGearSetUnlocks(catalog, snap({ scannedProductsCount: 3 })).map((s) => s.id),
    ).toEqual(['s1']);
    expect(
      pendingGearSetUnlocks(catalog, snap({ scannedProductsCount: 3, ownedGearSets: ['s1'] })),
    ).toEqual([]);
  });
});

describe('pendingAutoBadges', () => {
  it('fires token-100 at 100 tokens and tree-grown at level 8', () => {
    expect(pendingAutoBadges(snap())).toEqual([]);
    expect(pendingAutoBadges(snap({ tokens: 100 }))).toEqual(['token-100']);
    expect(pendingAutoBadges(snap({ level: 8 }))).toEqual(['tree-grown']);
    expect(pendingAutoBadges(snap({ tokens: 100, level: 8 }))).toEqual(['token-100', 'tree-grown']);
  });

  it('does not re-fire badges already held', () => {
    expect(pendingAutoBadges(snap({ tokens: 100, badges: ['token-100'] }))).toEqual([]);
  });
});
