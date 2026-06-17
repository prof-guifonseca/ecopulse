import { describe, expect, it } from 'vitest';
import type { AvatarLoadout, GearItem, GearSet } from '@/types';
import {
  deriveStatsFromLoadout,
  clearSlot,
  equipGearItem,
  equipGearSet,
  isGearSetComplete,
  ownedAfterGearItemPurchase,
  ownedAfterGearSetPurchase,
} from './rules';

const items = [
  gear('visor', 'face', { focus: 3 }),
  gear('jacket', 'torso', { hp: 5, defense: 2 }),
  gear('tool', 'mainHand', { attack: 4 }),
] satisfies GearItem[];

const setItem = {
  id: 'cyber-test',
  name: 'Cyber Test',
  theme: 'cyber',
  tagline: 'Teste',
  tier: 'rare',
  unlock: { kind: 'paid' },
  priceTokens: 100,
  itemIds: ['visor', 'jacket', 'tool'],
  defaultLoadout: { face: 'visor', torso: 'jacket', mainHand: 'tool' },
  requiredItemIds: ['visor', 'jacket', 'tool'],
  setBonusStats: { speed: 2, focus: 1 },
} satisfies GearSet;

const emptyLoadout: AvatarLoadout = {
  baseId: 'base1',
  equippedGear: {},
  activeSetId: null,
};

describe('gear rules', () => {
  it('adds an individual gear item id only once after purchase', () => {
    expect(ownedAfterGearItemPurchase(['visor'], 'visor')).toEqual(['visor']);
    expect(ownedAfterGearItemPurchase(['visor'], 'tool')).toEqual(['visor', 'tool']);
  });

  it('buying a set unlocks the set and all included pieces', () => {
    const result = ownedAfterGearSetPurchase(['visor'], [], setItem);
    expect(result.ownedGearSets).toEqual(['cyber-test']);
    expect(result.ownedGearItems).toEqual(['visor', 'jacket', 'tool']);
  });

  it('equips a set and then allows overriding one individual piece', () => {
    const equippedSet = equipGearSet(emptyLoadout, setItem);
    expect(equippedSet.equippedGear.face).toBe('visor');
    expect(equippedSet.activeSetId).toBe('cyber-test');

    const alternate = gear('mask', 'face', { speed: 3 });
    const overridden = equipGearItem(equippedSet, alternate);
    expect(overridden.equippedGear.face).toBe('mask');
    expect(overridden.equippedGear.torso).toBe('jacket');
    expect(overridden.activeSetId).toBeNull();
  });

  it('clearing a slot switches the loadout back to free mode', () => {
    const equippedSet = equipGearSet(emptyLoadout, setItem);
    const cleared = clearSlot(equippedSet, 'mainHand');

    expect(cleared.equippedGear.mainHand).toBeNull();
    expect(cleared.activeSetId).toBeNull();
  });

  it('applies set bonus only when required pieces are equipped', () => {
    const complete = equipGearSet(emptyLoadout, setItem);
    const itemsById = new Map(items.map((item) => [item.id, item]));
    expect(isGearSetComplete(setItem, complete, itemsById)).toBe(true);

    const incomplete = { ...complete, equippedGear: { ...complete.equippedGear, mainHand: null } };
    expect(isGearSetComplete(setItem, incomplete, itemsById)).toBe(false);

    const completeStats = deriveStatsFromLoadout({
      baseStats: { hp: 100, attack: 10, defense: 10, speed: 10, focus: 10 },
      loadout: complete,
      gearItems: items,
      gearSets: [setItem],
    });
    const incompleteStats = deriveStatsFromLoadout({
      baseStats: { hp: 100, attack: 10, defense: 10, speed: 10, focus: 10 },
      loadout: incomplete,
      gearItems: items,
      gearSets: [setItem],
    });

    expect(completeStats.speed).toBe(incompleteStats.speed + 2);
    expect(completeStats.focus).toBe(incompleteStats.focus + 1);
  });

  it('does not apply set bonus to a complete-looking free-mode mix', () => {
    const complete = equipGearSet(emptyLoadout, setItem);
    const freeModeComplete = { ...complete, activeSetId: null };

    const completeStats = deriveStatsFromLoadout({
      baseStats: { hp: 100, attack: 10, defense: 10, speed: 10, focus: 10 },
      loadout: complete,
      gearItems: items,
      gearSets: [setItem],
    });
    const freeStats = deriveStatsFromLoadout({
      baseStats: { hp: 100, attack: 10, defense: 10, speed: 10, focus: 10 },
      loadout: freeModeComplete,
      gearItems: items,
      gearSets: [setItem],
    });

    expect(completeStats.speed).toBe(freeStats.speed + 2);
    expect(completeStats.focus).toBe(freeStats.focus + 1);
  });
});

function gear(
  id: string,
  slot: GearItem['slot'],
  battleStats: Partial<GearItem['battleStats']>,
): GearItem {
  return {
    id,
    name: id,
    slot,
    tier: 'common',
    priceTokens: 10,
    unlock: { kind: 'paid' },
    battleStats,
    visualKey: `test:${slot}`,
    visualLayerId: `test:${slot}:${id}`,
    emoji: '*',
    tags: ['test'],
  };
}
