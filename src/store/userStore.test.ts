import { beforeEach, describe, expect, it } from 'vitest';
import {
  migrateUserStateToV3,
  migrateUserStateToV4,
  migrateUserStateToV5,
  useUserStore,
} from './userStore';

describe('userStore addTokensAndXp', () => {
  beforeEach(() => {
    useUserStore.setState({ tokens: 0, tokensToday: 0, xp: 0, xpToNext: 100, level: 1 });
  });

  it('commits tokens and xp together, never one without the other', () => {
    const { leveled, newLevel } = useUserStore.getState().addTokensAndXp(40);
    const state = useUserStore.getState();

    expect(leveled).toBe(false);
    expect(newLevel).toBe(1);
    expect(state.tokens).toBe(40);
    expect(state.tokensToday).toBe(40);
    expect(state.xp).toBe(40);
  });

  it('levels up (possibly multiple times) and reports it from the same commit', () => {
    const { leveled, newLevel } = useUserStore.getState().addTokensAndXp(250);
    const state = useUserStore.getState();

    expect(leveled).toBe(true);
    expect(newLevel).toBeGreaterThan(1);
    expect(state.level).toBe(newLevel);
    expect(state.tokens).toBe(250);
  });

  it('accumulates across repeated calls like the previous two-call sequence did', () => {
    useUserStore.getState().addTokensAndXp(10);
    useUserStore.getState().addTokensAndXp(15);
    const state = useUserStore.getState();

    expect(state.tokens).toBe(25);
    expect(state.tokensToday).toBe(25);
    expect(state.xp).toBe(25);
  });
});

describe('userStore migration v3', () => {
  it('migrates owned outfits and skin packs into wearable gear without losing progress', () => {
    const migrated = migrateUserStateToV3({
      name: 'Arthur',
      level: 7,
      tokens: 480,
      avatarBase: 'base2',
      avatarOutfits: {
        hat: 'hat2',
        glasses: 'glass2',
        shirt: 'shirt2',
      },
      ownedOutfits: ['hat2', 'glass2', 'shirt2'],
      ownedSkinPacks: ['cyber-reciclador'],
      equippedSkinPack: 'cyber-reciclador',
    } as Parameters<typeof migrateUserStateToV3>[0]);

    expect(migrated.name).toBe('Arthur');
    expect(migrated.tokens).toBe(480);
    expect(migrated.ownedGearSets).toContain('cyber-reciclador');
    expect(migrated.ownedGearItems).toContain('cyber-reciclador-face');
    expect(migrated.ownedGearItems).toContain('hat2');
    expect(migrated.avatarLoadout.activeSetId).toBe('cyber-reciclador');
    expect(migrated.avatarLoadout.equippedGear.face).toBe('cyber-reciclador-face');
    expect(migrated.equippedSkinPack).toBeNull();
  });
});

describe('userStore migration v4', () => {
  it('grants new set pieces to owned sets and fills only empty active-set slots', () => {
    const migrated = migrateUserStateToV4({
      name: 'Arthur',
      level: 7,
      tokens: 480,
      avatarBase: 'base2',
      ownedGearSets: ['cyber-reciclador'],
      ownedGearItems: [
        'cyber-reciclador-face',
        'cyber-reciclador-torso',
        'cyber-reciclador-back',
        'cyber-reciclador-mainHand',
        'cyber-reciclador-aura',
        'glass2',
      ],
      avatarLoadout: {
        baseId: 'base2',
        activeSetId: 'cyber-reciclador',
        equippedGear: {
          face: 'glass2',
          torso: 'cyber-reciclador-torso',
          back: 'cyber-reciclador-back',
          mainHand: 'cyber-reciclador-mainHand',
          aura: 'cyber-reciclador-aura',
        },
      },
    } as Parameters<typeof migrateUserStateToV4>[0]);

    expect(migrated.tokens).toBe(480);
    expect(migrated.ownedGearItems).toContain('cyber-reciclador-head');
    expect(migrated.ownedGearItems).toContain('cyber-reciclador-legs');
    expect(migrated.ownedGearItems).toContain('cyber-reciclador-feet');
    expect(migrated.avatarLoadout.equippedGear.face).toBe('glass2');
    expect(migrated.avatarLoadout.equippedGear.head).toBe('cyber-reciclador-head');
    expect(migrated.avatarLoadout.equippedGear.legs).toBe('cyber-reciclador-legs');
    expect(migrated.avatarLoadout.equippedGear.feet).toBe('cyber-reciclador-feet');
  });
});

describe('userStore migration v5', () => {
  it('assigns regionId default and empty doctrines, deduces tribe from active gear set', () => {
    const migrated = migrateUserStateToV5({
      name: 'Arthur',
      level: 7,
      tokens: 480,
      onboarded: true,
      avatarBase: 'base2',
      ownedGearSets: ['cyber-reciclador'],
      ownedGearItems: ['cyber-reciclador-face'],
      avatarLoadout: {
        baseId: 'base2',
        activeSetId: 'cyber-reciclador',
        equippedGear: { face: 'cyber-reciclador-face' },
      },
    } as Parameters<typeof migrateUserStateToV5>[0]);

    expect(migrated.regionId).toBe('londrina');
    expect(migrated.adoptedDoctrines).toEqual([]);
    // cyber-reciclador belongs to recicladores tribe
    expect(migrated.tribe).toBe('recicladores');
  });

  it('preserves an explicit non-default tribe', () => {
    const migrated = migrateUserStateToV5({
      name: 'X',
      tribe: 'cultivadores',
      onboarded: true,
    } as Parameters<typeof migrateUserStateToV5>[0]);
    expect(migrated.tribe).toBe('cultivadores');
  });

  it('preserves existing adoptedDoctrines and regionId', () => {
    const migrated = migrateUserStateToV5({
      regionId: 'curitiba',
      adoptedDoctrines: ['nami-solar:sol-firme'],
    } as Parameters<typeof migrateUserStateToV5>[0]);
    expect(migrated.regionId).toBe('curitiba');
    expect(migrated.adoptedDoctrines).toEqual(['nami-solar:sol-firme']);
  });
});
