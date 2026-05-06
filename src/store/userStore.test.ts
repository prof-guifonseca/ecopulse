import { describe, expect, it } from 'vitest';
import { migrateUserStateToV3, migrateUserStateToV4 } from './userStore';

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
