import { describe, expect, it } from 'vitest';
import { GEAR_ITEMS, TRIBES } from '@/data';
import type { AvatarLoadout, GearSlot } from '@/types';
import { computeLoadoutAffinity } from './affinity';

const emptyLoadout: AvatarLoadout = { baseId: null, equippedGear: {}, activeSetId: null };

describe('computeLoadoutAffinity', () => {
  it('returns a neutral multiplier for a null/empty loadout', () => {
    expect(computeLoadoutAffinity(null, 'guardioes')).toMatchObject({
      multiplier: 1,
      aligned: false,
      alignedPieces: 0,
    });
    expect(computeLoadoutAffinity(emptyLoadout, 'guardioes').aligned).toBe(false);
  });

  it('echoes a resolved tribe id even when the input tribe is unknown', () => {
    expect(computeLoadoutAffinity(emptyLoadout, 'does-not-exist').tribeId).toBeTruthy();
  });

  it('awards the +25% bonus once two pieces match the tribe gear sets', () => {
    // Derive a real aligned loadout from the data so the test tracks the catalog.
    const tribe = Object.values(TRIBES).find(
      (t) => GEAR_ITEMS.filter((g) => g.setId && t.gearSetIds.includes(g.setId)).length >= 2,
    );
    expect(tribe, 'expected a tribe with >=2 matching gear items').toBeTruthy();
    if (!tribe) return;

    const matching = GEAR_ITEMS.filter((g) => g.setId && tribe.gearSetIds.includes(g.setId)).slice(
      0,
      2,
    );
    const equippedGear = Object.fromEntries(
      matching.map((item) => [item.slot as GearSlot, item.id]),
    ) as AvatarLoadout['equippedGear'];

    const result = computeLoadoutAffinity(
      { baseId: null, equippedGear, activeSetId: null },
      tribe.id,
    );
    // Two distinct slots ⇒ aligned; if both items share a slot, at least non-negative.
    expect(result.alignedPieces).toBeGreaterThanOrEqual(1);
    if (Object.keys(equippedGear).length >= 2) {
      expect(result.aligned).toBe(true);
      expect(result.multiplier).toBeCloseTo(1.25);
    }
  });
});
