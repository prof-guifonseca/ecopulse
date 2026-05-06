import { describe, expect, it } from 'vitest';
import { GEAR_ITEMS, GEAR_SETS, getGearItem } from './gear';
import { SLOT_ANCHORS, hasGearVisual, itemHidesFace, itemHidesHair, resolveGearVisual } from '@/components/avatar/gearVisuals';

describe('gear visual catalog', () => {
  it('maps every gear item to a registered SVG visual', () => {
    const missing = GEAR_ITEMS.filter((item) => !hasGearVisual(item.visualKey)).map((item) => item.id);
    expect(missing).toEqual([]);
  });

  it('resolves every gear item into a slot-matched visual definition', () => {
    for (const item of GEAR_ITEMS) {
      const visual = resolveGearVisual(item);
      expect(visual.slot).toBe(item.slot);
      expect(visual.render).toBeTypeOf('function');
    }
  });

  it('uses item-specific visual keys for set equipment', () => {
    const generic = GEAR_ITEMS.filter((item) => item.setId && /^[a-z-]+:[a-zA-Z]+$/.test(item.visualKey)).map(
      (item) => item.id
    );
    expect(generic).toEqual([]);
  });

  it('keeps a stable anchor for every wearable slot', () => {
    for (const item of GEAR_ITEMS) {
      expect(SLOT_ANCHORS[item.slot]).toBeTruthy();
    }
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

  it('applies coverage rules for hood and mask pieces', () => {
    expect(itemHidesHair(getGearItem('ninja-eco-head')!)).toBe(true);
    expect(itemHidesHair(getGearItem('mago-da-floresta-head')!)).toBe(true);
    expect(itemHidesFace(getGearItem('ninja-eco-face')!)).toBe(true);
  });
});
