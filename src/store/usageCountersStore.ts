'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createSafeJSONStorage } from './storage';
import { assertNever } from '@/lib/assertNever';
import type { EcoPulseEventType } from '@/domain';

/**
 * Anonymous usage telemetry (P7). A purely LOCAL projection over the EcoPulse
 * action vocabulary — counts per day, no network, no external SDK, no PII. For
 * a school project with minors this is the only acceptable analytics: we learn
 * "how many scans happened today", never who or what.
 *
 * PII is structurally impossible: `bump` takes a closed `UsageCounterKey` and
 * stores a number — never an event payload, an id, or any free-form string.
 * Two event types are deliberately uncounted: `onboarded` (its payload carries
 * a display name) and `impact_recorded`.
 */
export type UsageCounterKey =
  | 'scan_completed'
  | 'product_lookup_completed'
  | 'map_visit_marked'
  | 'esg_point_verified'
  | 'community_reaction_like'
  | 'community_reaction_promise'
  | 'community_comment'
  | 'daily_bonus_claimed'
  | 'battle_completed';

type DayCounts = Partial<Record<UsageCounterKey, number>>;

interface UsageCountersState {
  /** counts['YYYY-MM-DD'][key] = n. Local-only; never serialized to the network. */
  counts: Record<string, DayCounts>;
  /** Increment one anonymous signal for a day (defaults to today, UTC). */
  bump: (key: UsageCounterKey, day?: string) => void;
  /** Wipe all counters — surfaced via a debug/settings control later. */
  clearCounters: () => void;
}

function dayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export const useUsageCountersStore = create<UsageCountersState>()(
  persist(
    (set) => ({
      counts: {},

      bump: (key, day = dayKey()) =>
        set((s) => {
          const dayCounts = s.counts[day] ?? {};
          return {
            counts: {
              ...s.counts,
              [day]: { ...dayCounts, [key]: (dayCounts[key] ?? 0) + 1 },
            },
          };
        }),

      clearCounters: () => set({ counts: {} }),
    }),
    {
      name: 'ecopulse:usageCounters',
      version: 1,
      storage: createSafeJSONStorage<UsageCountersState>(),
    },
  ),
);

if (typeof window !== 'undefined') {
  useUsageCountersStore.persist.setOptions({
    storage: createSafeJSONStorage<UsageCountersState>(),
  });
}

/**
 * Maps a domain event type to its anonymous counter key, or `null` for types we
 * deliberately do not count: `onboarded` (display-name PII), `impact_recorded`
 * (no live emitter), and the reaction/like events (counted per-reaction at the
 * call site, where the like/promise split is known). Exhaustive via assertNever.
 */
export function usageKeyForEventType(type: EcoPulseEventType): UsageCounterKey | null {
  switch (type) {
    case 'scan_completed':
      return 'scan_completed';
    case 'product_lookup_completed':
      return 'product_lookup_completed';
    case 'map_visit_marked':
      return 'map_visit_marked';
    case 'esg_point_verified':
      return 'esg_point_verified';
    case 'daily_bonus_claimed':
      return 'daily_bonus_claimed';
    case 'battle_completed':
      return 'battle_completed';
    case 'onboarded':
    case 'impact_recorded':
    case 'post_liked':
    case 'promise_created':
    case 'community_reaction_recorded':
      return null;
    default:
      return assertNever(type);
  }
}

/** Records one anonymous usage signal. Local-only — no network, no PII. */
export function recordUsage(key: UsageCounterKey): void {
  useUsageCountersStore.getState().bump(key);
}

/** Records usage from a domain event type, skipping the uncounted ones. */
export function recordUsageForEventType(type: EcoPulseEventType): void {
  const key = usageKeyForEventType(type);
  if (key) recordUsage(key);
}
