import { describe, expect, it } from 'vitest';
import { GEAR_ITEMS, GEAR_SETS, getGearItem } from './gear';
import { hasGearVisual } from '@/components/avatar/gearVisuals';

describe('gear visual catalog', () => {
  it('maps every gear item to a registered SVG visual', () => {
    const missing = GEAR_ITEMS.filter((item) => !hasGearVisual(item.visualKey)).map((item) => item.id);
    expect(missing).toEqual([]);
  });

  it('keeps every gear set internally complete', () => {
    for (const set of GEAR_SETS) {
      expect(set.itemIds.every((id) => Boolean(getGearItem(id)))).toBe(true);
      expect(Object.values(set.defaultLoadout).every((id) => set.itemIds.includes(id))).toBe(true);
      expect(set.itemIds).toEqual(set.requiredItemIds);
    }
  });

  it('gives each premium set visible clothing coverage', () => {
    for (const set of GEAR_SETS) {
      const slots = new Set(GEAR_ITEMS.filter((item) => item.setId === set.id).map((item) => item.slot));
      expect(slots.has('torso')).toBe(true);
      expect(slots.has('legs')).toBe(true);
      expect(slots.has('feet')).toBe(true);
    }
  });
});
