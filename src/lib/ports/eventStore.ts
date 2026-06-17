import type { EcoPulseEvent, EcoPulseEventType } from '@/domain';
import type { AppError } from './appError';
import type { Result } from './result';

/**
 * EventStore — the persistence Port (P2). It is the sync-ready seam: today a
 * LocalEventStore adapter (Zustand stores + the BFF) satisfies it; later a
 * SupabaseEventStore adapter can replace it at one composition point with no
 * change to command or feature code. `list()` exists from day one so a future
 * read-back/sync is an adapter change, not an interface change.
 *
 * Commands depend on THIS interface (via the runtime seam), never on a concrete
 * adapter — enforced by dependency-cruiser.
 */
export interface EventStore {
  /** Durably record a domain event. Returns err on a persistence failure
   *  (surfaced by the seam) instead of silently swallowing it. */
  append(event: EcoPulseEvent): Promise<Result<EcoPulseEvent, AppError>>;
  /** Read events back (local today; the future sync seam). */
  list(filter?: { userId?: string; type?: EcoPulseEventType }): Promise<EcoPulseEvent[]>;
}
