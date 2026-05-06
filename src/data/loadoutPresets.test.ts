import { describe, expect, it } from 'vitest';
import {
  DEMO_GEAR_SET_IDS,
  arthurDemoLoadout,
  createAvatarLoadoutPresets,
  getGearItem,
  getGearSet,
  presetItemIds,
} from '@/data';

describe('avatar loadout presets', () => {
  it('keeps every demo set preset backed by a real gear set', () => {
    for (const setId of DEMO_GEAR_SET_IDS) {
      expect(getGearSet(setId)).toBeTruthy();
    }
  });

  it('only references real gear items', () => {
    for (const preset of createAvatarLoadoutPresets('base2')) {
      expect(presetItemIds(preset).length).toBeGreaterThan(0);
      for (const itemId of presetItemIds(preset)) {
        expect(getGearItem(itemId)).toBeTruthy();
      }
    }
  });

  it('starts Arthur in free mode with a mixed loadout', () => {
    const loadout = arthurDemoLoadout('base2');
    const setIds = new Set(
      Object.values(loadout.equippedGear)
        .map((itemId) => getGearItem(itemId)?.setId)
        .filter(Boolean)
    );

    expect(loadout.activeSetId).toBeNull();
    expect(setIds.size).toBeGreaterThan(2);
    expect(loadout.equippedGear.face).toBe('cyber-reciclador-face');
    expect(loadout.equippedGear.torso).toBe('guardiao-da-floresta-torso');
  });
});
