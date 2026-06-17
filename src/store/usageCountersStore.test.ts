import { afterEach, describe, expect, it } from 'vitest';
import {
  recordUsage,
  recordUsageForEventType,
  useUsageCountersStore,
  usageKeyForEventType,
  type UsageCounterKey,
} from './usageCountersStore';

const ALL_KEYS: UsageCounterKey[] = [
  'scan_completed',
  'product_lookup_completed',
  'map_visit_marked',
  'esg_point_verified',
  'community_reaction_like',
  'community_reaction_promise',
  'community_comment',
  'daily_bonus_claimed',
  'battle_completed',
];

afterEach(() => useUsageCountersStore.getState().clearCounters());

describe('usageCounters projection (P7)', () => {
  it('bumps a numeric count keyed by day and closed key only', () => {
    recordUsage('scan_completed');
    recordUsage('scan_completed');
    recordUsage('map_visit_marked');

    const { counts } = useUsageCountersStore.getState();
    const days = Object.keys(counts);
    expect(days).toHaveLength(1);
    const day = days[0]!;
    expect(day).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(counts[day]).toEqual({ scan_completed: 2, map_visit_marked: 1 });
  });

  it('maps countable event types and skips the uncounted ones', () => {
    expect(usageKeyForEventType('scan_completed')).toBe('scan_completed');
    expect(usageKeyForEventType('battle_completed')).toBe('battle_completed');
    // Deliberately uncounted: name PII / no live emitter / reaction split done at call site.
    expect(usageKeyForEventType('onboarded')).toBeNull();
    expect(usageKeyForEventType('impact_recorded')).toBeNull();
    expect(usageKeyForEventType('community_reaction_recorded')).toBeNull();
  });

  it('stores numbers only — PII cannot enter the projection by construction', () => {
    // Drive every key, plus route PII-bearing event types through the mapper.
    for (const key of ALL_KEYS) recordUsage(key);
    recordUsageForEventType('onboarded'); // payload carries a display name — must not be recorded
    recordUsageForEventType('esg_point_verified'); // payload may carry a free-text note

    const state = useUsageCountersStore.getState();
    const keysSeen = new Set<string>();
    for (const day of Object.values(state.counts)) {
      for (const [key, value] of Object.entries(day)) {
        keysSeen.add(key);
        // Every key is a member of the closed union (no free-form), every value
        // is a count (never a string/object) — PII has no slot in the shape.
        expect(ALL_KEYS).toContain(key as UsageCounterKey);
        expect(typeof value).toBe('number');
      }
    }
    // `onboarded` (display-name PII) routed through the mapper recorded NOTHING;
    // `esg_point_verified` (may carry a free-text note) recorded only its bare key.
    expect(keysSeen.has('onboarded')).toBe(false);
    expect(keysSeen.has('esg_point_verified')).toBe(true);
  });
});
