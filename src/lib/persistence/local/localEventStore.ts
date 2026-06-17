import type { EventStore } from '@/lib/ports/eventStore';
import { persistenceError } from '@/lib/ports/appError';
import { err, ok } from '@/lib/ports/result';
import { getAccessToken } from '@/lib/client/supabaseBrowser';

/**
 * LocalEventStore — the current adapter for the EventStore Port (P2). It records
 * domain events through the BFF (/api/events) and, crucially, AWAITS the write
 * and returns a Result — replacing the old fire-and-forget mvpSync that swallowed
 * failures. The runtime seam surfaces an `err` as an observable durability gap
 * (breadcrumb) instead of silent data loss.
 *
 * `list()` is the deferred multi-device sync seam — a future SupabaseEventStore
 * adapter will implement real read-back without changing this interface.
 */
export const localEventStore: EventStore = {
  async append(event) {
    try {
      const token = getAccessToken();
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...(token ? { authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          type: event.type,
          payload: event.payload,
          source: event.source,
          userId: event.userId,
        }),
      });
      if (!response.ok) {
        return err(persistenceError(`event append failed`, String(response.status)));
      }
      return ok(event);
    } catch (cause) {
      return err(
        persistenceError(
          'event append network error',
          cause instanceof Error ? cause.message : undefined,
        ),
      );
    }
  },

  async list() {
    // Local-first today: events are appended through the BFF; reading them back
    // is the deferred sync seam (a SupabaseEventStore adapter satisfies it later).
    return [];
  },
};
