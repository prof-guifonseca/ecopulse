import * as Sentry from '@sentry/nextjs';
import { localEventStore } from '@/lib/persistence/local/localEventStore';
import type { CommandContext } from './executeCommand';

/**
 * Composition root — the ONE place that wires the concrete adapter into the
 * command seam. Swapping LocalEventStore for a future SupabaseEventStore is a
 * single-line change here, with zero churn to command or feature code.
 */
export const commandContext: CommandContext = {
  eventStore: localEventStore,
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
