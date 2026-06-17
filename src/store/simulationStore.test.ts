import { describe, expect, it } from 'vitest';
import { migrateSimulationStateToV1 } from './simulationStore';

describe('simulationStore migration v1', () => {
  it('normalizes missing state into an empty local simulation ledger', () => {
    const migrated = migrateSimulationStateToV1(undefined);

    expect(migrated.config).toBeNull();
    expect(migrated.events).toEqual([]);
    expect(migrated.cursor).toBe(0);
  });

  it('preserves existing config, events, and cursor', () => {
    const migrated = migrateSimulationStateToV1({
      config: {
        scenario: 'new-user',
        seed: 'seed-1',
        regionId: 'londrina',
        startedAt: '2026-05-11T00:00:00.000Z',
        currentDay: '2026-05-11',
      },
      cursor: 7,
      events: [
        {
          id: 'e1',
          type: 'onboarded',
          at: '2026-05-11T00:00:00.000Z',
          day: '2026-05-11',
          payload: { name: 'Lia' },
        },
      ],
    });

    expect(migrated.config?.scenario).toBe('new-user');
    expect(migrated.events).toHaveLength(1);
    expect(migrated.cursor).toBe(7);
  });
});
