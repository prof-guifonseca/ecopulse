import { describe, expect, it } from 'vitest';
import { migrateUserStateToV3 } from './userStore';

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
