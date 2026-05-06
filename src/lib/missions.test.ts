import { describe, expect, it } from 'vitest';
import { resolveDailyAction, type DailyMissionCheckMap } from './missions';

describe('resolveDailyAction', () => {
  it('points to scanner when scan mission is incomplete', () => {
    const action = resolveDailyAction(checks({ dm1: false, dm2: false, dm3: false }), false);
    expect(action.kind).toBe('scan');
    expect(action.href).toBe('/scanner');
    expect(action.completedCount).toBe(0);
  });

  it('points to community after scan is complete and social is incomplete', () => {
    const action = resolveDailyAction(checks({ dm1: true, dm2: false, dm3: false }), false);
    expect(action.kind).toBe('social');
    expect(action.href).toBe('/community');
    expect(action.completedCount).toBe(1);
  });

  it('points to map after scan and social are complete', () => {
    const action = resolveDailyAction(checks({ dm1: true, dm2: true, dm3: false }), false);
    expect(action.kind).toBe('map');
    expect(action.href).toBe('/map');
    expect(action.completedCount).toBe(2);
  });

  it('offers the daily bonus when all missions are complete and unclaimed', () => {
    const action = resolveDailyAction(checks({ dm1: true, dm2: true, dm3: true }), false);
    expect(action.kind).toBe('bonus');
    expect(action.href).toBeUndefined();
    expect(action.reward).toBe(25);
  });

  it('settles into arena when all missions and the bonus are complete', () => {
    const action = resolveDailyAction(checks({ dm1: true, dm2: true, dm3: true }), true);
    expect(action.kind).toBe('complete');
    expect(action.href).toBe('/arena');
  });
});

function checks(overrides: Partial<DailyMissionCheckMap>): DailyMissionCheckMap {
  return {
    dm1: false,
    dm2: false,
    dm3: false,
    ...overrides,
  };
}
