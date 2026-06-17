import * as Sentry from '@sentry/nextjs';
import { localEventStore } from '@/lib/persistence/local/localEventStore';
import { recordUsageForEventType } from '@/store/usageCountersStore';
import type { CommandContext } from './executeCommand';

/**
 * Composition root — the ONE place that wires the concrete adapter into the
 * command seam. Swapping LocalEventStore for a future SupabaseEventStore is a
 * single-line change here, with zero churn to command or feature code.
 */
export const commandContext: CommandContext = {
  eventStore: localEventStore,
  // Anonymous usage telemetry (P7), local-only — by event type, never payload.
  // Dormant until live flows route through executeCommand (PR-5); the same
  // counter is bumped today at the mvpSync client chokepoints.
  onCommandExecuted: (event) => recordUsageForEventType(event.type),
  onAppendFailure: (error, event) => {
    // Observe the durability gap (was silently swallowed before). Local-first:
    // the optimistic store state stays; this is a breadcrumb, not a rollback.
    Sentry.addBreadcrumb({
      category: 'eventstore',
      level: 'warning',
      message: `event append failed: ${event.type}`,
      data: { kind: error.kind },
    });
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[ecopulse] event append failed (${event.type})`, error);
    }
  },
};
